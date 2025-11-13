import { isEmpty } from 'lodash';
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
  useImperativeHandle,
} from 'react';
import { useTranslation } from '@rippling/lib-i18n/useTranslation';
import logger, { sanitizedError } from '@rippling/pebble/services/logger';
import { usePrevious } from '@rippling/pebble/hooks';
import BaseSelect from '../BaseSelect';
import useSelectHelpers from '../hooks/useSelectHelpers';
import { hasDifferentLatestAndPreviousValue, shouldUseDefaultSearchQuery } from '../Select.helpers';
import type {
  AsyncSelectProps,
  SelectRef,
  StateSelectedOption,
  StaticList,
  Value,
  ListAsyncFn,
} from '../Select.types';
import {
  fetchList,
  getAsyncSelectedOptions,
  getListPlaceholderMap,
  shouldLoadListWithDefaultValue,
  shouldRefetchList,
} from './AsyncSelect.helpers';
import { EmptyListJSX } from '../EmptyListJSX';

const AsyncSelect = React.forwardRef<SelectRef, AsyncSelectProps>((props, ref) => {
  const {
    defaultValue,
    emptyListPlaceholder,
    isMulti,
    list,
    name,
    onChange,
    onFocus,
    value,
    defaultSearchQuery: defaultSearchQueryProp = '',
    isMenuDefaultOpen,
    ...rest
  } = props;
  const hasValueInProps = value !== undefined;
  const { t } = useTranslation('one-ui', { keyPrefix: 'inputs.select' });

  const defaultEmptyListPlaceholder = t('emptyListPlaceholder');
  const loadingListPlaceholder = t('loadingListPlaceholder');
  const noSearchResultPlaceholder = t('noSearchResultPlaceholder');

  const defaultListPlaceholder = useMemo(
    () =>
      getListPlaceholderMap(
        {
          emptyListPlaceholder: defaultEmptyListPlaceholder,
          loadingListPlaceholder,
          noSearchResultPlaceholder,
        },
        emptyListPlaceholder,
      ),
    [
      defaultEmptyListPlaceholder,
      loadingListPlaceholder,
      noSearchResultPlaceholder,
      emptyListPlaceholder,
    ],
  );

  // ==============================
  // hooks
  // ==============================
  const [stateList, setStateList] = useState<StaticList>([]);
  const [selectedOptions, setSelectedOptions] = useState<StateSelectedOption>();
  const [isFetchingList, setIsFetchingList] = useState(false);

  // Only show default search query if its multi select or doesn't have a value to show
  const defaultSearchQuery = shouldUseDefaultSearchQuery({ isMulti, hasValueInProps, defaultValue })
    ? defaultSearchQueryProp || ''
    : '';

  const [inputValue, setInputValue] = useState<string>(defaultSearchQuery);

  const listPlaceholder = useMemo(() => {
    if (isFetchingList) {
      return defaultListPlaceholder.onLoading;
    }

    if (isEmpty(inputValue)) {
      return defaultListPlaceholder.onNoSearchQuery;
    }

    return defaultListPlaceholder.onNoSearchResults;
  }, [
    defaultListPlaceholder.onLoading,
    defaultListPlaceholder.onNoSearchQuery,
    defaultListPlaceholder.onNoSearchResults,
    inputValue,
    isFetchingList,
  ]);

  // ==============================
  // refs
  // ==============================
  const previousList = usePrevious(list);
  const renderWithDefaultSearchQueryRef = useRef(true); // ref to check search was initialised with defaultSearchQuery
  const isDefaultValueListLoadedRef = useRef(false);
  const latestSelectedValueRef = useRef<Value>();
  const latestSearchQuery = useRef(defaultSearchQuery); // useful to always set list results of last query

  // ==============================
  // useCallbacks
  // ==============================
  const updatedLatestSelectedValueRef = useCallback((newValue: Value) => {
    latestSelectedValueRef.current = newValue;
  }, []);

  const { areAllItemsSelected, flatList, onSelectOption, setLatestSelectedValueAndOptions } =
    useSelectHelpers({
      list: stateList,
      isMulti,
      selectedOptions,
      setSelectedOptions,
      setSelectedValues: updatedLatestSelectedValueRef,
      onChange,
    });

  // Method to fetch and update options for selected values
  const loadListForSelectedOptions = useCallback(
    async (newList: ListAsyncFn, newValue: Value) => {
      const listResponse = await fetchList({
        list: newList,
        isMulti,
        value: newValue,
      });
      const newSelectedOptions = getAsyncSelectedOptions({
        isMulti,
        // @ts-ignore
        list: listResponse,
        name,
        value: newValue,
      });

      if (!isMulti) {
        setInputValue(newSelectedOptions?.label);
      }
      setLatestSelectedValueAndOptions(newSelectedOptions);
    },
    [isMulti, name, setLatestSelectedValueAndOptions],
  );

  /**
   * general method to fetch the options list for particular searchQuery.
   * Function called on text input change and from updateOptionsList fn
   */
  const onLoadList = useCallback(
    async (searchQuery = '') => {
      latestSearchQuery.current = searchQuery;
      setIsFetchingList(true);
      setStateList([]);

      try {
        const loadedOptions = await fetchList({
          list,
          value: searchQuery,
        });

        if (latestSearchQuery.current !== searchQuery) {
          return;
        }

        setStateList(loadedOptions as StaticList);
      } catch (e) {
        logger.error(
          sanitizedError({
            error: e,
            componentName: 'AsyncSelect',
          }),
          {
            shouldAlertUser: true,
          },
        );
      } finally {
        setIsFetchingList(false);
      }
    },
    [list],
  );

  const updateOptionsList = useCallback(
    (search: string, overrideLatest?: boolean) => {
      // don't make new calls if last fetched data is for same search
      if (overrideLatest || (latestSearchQuery.current || '') !== (search || '')) {
        onLoadList(search);
      }
    },
    [latestSearchQuery, onLoadList],
  );

  const getEmptyListPlaceholderJSX = useMemo(() => {
    return (
      <EmptyListJSX
        placeholder={listPlaceholder}
        isLoading={isFetchingList}
        searchQuery={latestSearchQuery.current}
      />
    );
  }, [isFetchingList, listPlaceholder]);

  // ==============================
  // side effects
  // ==============================

  /**
   * if not set already and value is not passed, use default value to fetch list and set selected options
   */
  useEffect(() => {
    if (
      !isDefaultValueListLoadedRef.current &&
      shouldLoadListWithDefaultValue(hasValueInProps, defaultValue)
    ) {
      isDefaultValueListLoadedRef.current = true;
      (async function load() {
        await loadListForSelectedOptions(list, defaultValue);
      })();
    }
  }, [defaultValue, hasValueInProps, isMulti, list, loadListForSelectedOptions]);

  /**
   * If menu is default open, load list of options with defaultSeacrhQuery or '' if rerender
   */
  useEffect(() => {
    /* istanbul ignore else */
    if (isMenuDefaultOpen || renderWithDefaultSearchQueryRef.current) {
      renderWithDefaultSearchQueryRef.current = false;
      updateOptionsList(latestSearchQuery.current, true);
    }
  }, [isMenuDefaultOpen, updateOptionsList, renderWithDefaultSearchQueryRef]);

  /**
   * To load options and set selections options when new list or new value prop is passed
   */
  useEffect(() => {
    if (
      shouldRefetchList({
        hasValueInProps,
        list,
        previousList,
        previousValue: latestSelectedValueRef.current,
        value,
      })
    ) {
      (async function load() {
        await loadListForSelectedOptions(list, value);
      })();
    }
  }, [hasValueInProps, list, loadListForSelectedOptions, previousList, value]);

  /**
   * HACK: For single select reset selectedOptions/searchInput when value is different from local state selectedOptions.
   * This is to handle scenarios where fixed value prop is passed like null/undefined in case of NavSearchBar
   */
  useEffect(() => {
    if (isMulti) {
      return;
    }
    if (
      hasValueInProps &&
      hasDifferentLatestAndPreviousValue(value, latestSelectedValueRef.current)
    ) {
      const newSelectedOptions = getAsyncSelectedOptions({
        checkForInvalidValue: false,
        list: flatList,
        name,
        value,
      });
      setInputValue(newSelectedOptions?.label);
      setLatestSelectedValueAndOptions(newSelectedOptions);
    }
  }, [
    flatList,
    hasValueInProps,
    isMulti,
    name,
    selectedOptions,
    setLatestSelectedValueAndOptions,
    value,
  ]);

  // ==============================
  // event handlers
  // ==============================

  const onDropdownOpen: React.FocusEventHandler = useCallback(
    event => {
      onFocus?.(event);

      updateOptionsList(inputValue);
    },
    [onFocus, inputValue, updateOptionsList],
  );

  useImperativeHandle(
    ref,
    () => ({
      /**
       * This API can be used to refetch the list when the list is async.
       */
      refetchList: () => {
        updateOptionsList(inputValue, true);
      },
    }),
    [updateOptionsList, inputValue],
  );

  // ==============================
  // renders
  // ==============================
  return (
    <BaseSelect
      {...rest}
      isMenuDefaultOpen={isMenuDefaultOpen}
      areAllItemsSelected={areAllItemsSelected}
      emptyListPlaceholder={getEmptyListPlaceholderJSX}
      isMulti={isMulti}
      list={stateList}
      name={name}
      isLoading={isFetchingList}
      onChange={onSelectOption}
      onFocus={onDropdownOpen}
      selectedOptions={selectedOptions}
      onInputChange={setInputValue}
      selectedValue={latestSelectedValueRef.current}
      setFilteredList={updateOptionsList}
      shouldScrollToSelectedValue={!isMulti}
      inputValue={inputValue}
      isSearchable
      isAsyncList
    />
  );
});

export default AsyncSelect;
