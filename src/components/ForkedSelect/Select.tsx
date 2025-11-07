import type { SetStateAction, Dispatch } from 'react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
  useImperativeHandle,
} from 'react';
import { useTranslation } from '@rippling/lib-i18n/useTranslation';
import type { FuseOptions } from '@rippling/ui-utils/Fuse';
import { useSetSearchResults } from '@rippling/pebble/Internals/hooks';
import {
  constructSelectedOptionsFromValue,
  hasDifferentLatestAndPreviousValue,
  isInvalidValue,
  shouldEnableSearch,
  shouldUseDefaultSearchQuery,
} from './Select.helpers';
import BaseSelect from './BaseSelect';
import type {
  FlatListItem,
  SelectProps,
  Value,
  StateSelectedOption,
  StaticList,
  SelectRef,
} from './Select.types';
import useSelectHelpers from './hooks/useSelectHelpers';
import useInputContext from '@rippling/pebble/Inputs/hooks/useInputContext';
import { EmptyListJSX } from './EmptyListJSX';
import { useSelectFuseOptions } from './hooks/useSelectFuseOptions';
import { INPUT_SIZES } from '@rippling/pebble/Inputs/Input.constants';

function setNewSelectedOptions(payload: {
  isMulti?: boolean;
  list: FlatListItem[];
  name?: string;
  setInputValue: Dispatch<SetStateAction<string>>;
  setSelectedValue: Dispatch<SetStateAction<StateSelectedOption>>;
  value: Value;
}) {
  const { isMulti, list, name, setInputValue, setSelectedValue, value } = payload;
  const newSelectedOptions = constructSelectedOptionsFromValue(value, list, {
    isMulti,
    name,
  });
  setSelectedValue(newSelectedOptions);
  if (!isMulti) {
    setInputValue(newSelectedOptions?.label);
  }
}

const Select = React.forwardRef<
  SelectRef,
  Omit<SelectProps, 'list'> & { list: StaticList; creatable?: boolean }
>((props, ref) => {
  const {
    defaultValue,
    fuseOptions: fuseOptionsProp,
    isMulti,
    isSearchable: isSearchableValueFromProps,
    list,
    name,
    onChange,
    sort,
    value,
    defaultSearchQuery: defaultSearchQueryProp = '',
    emptyListPlaceholder: emptyListPlaceholderProp,
    creatable,
    ...rest
  } = props;
  const hasValueInProps = value !== undefined;

  const { t } = useTranslation('one-ui', { keyPrefix: 'inputs.select' });
  const fuseOptions = useSelectFuseOptions({ fuseOptions: fuseOptionsProp as FuseOptions });

  // ==============================
  // state hooks
  // ==============================

  const [{ filteredList }, setFilteredList] = useSetSearchResults({
    list,
    sort,
    fuseOptions,
    creatable,
  });
  const [selectedOptions, setSelectedOptions] = useState<StateSelectedOption>();

  // Only show default search query if its multi select or doesn't have a value to show
  const defaultSearchQuery = shouldUseDefaultSearchQuery({
    isMulti,
    hasValueInProps,
    defaultValue,
  })
    ? defaultSearchQueryProp || ''
    : '';
  const [inputValue, setInputValue] = useState<string>(defaultSearchQuery);

  // ==============================
  // refs ==============================
  const renderWithDefaultSearchQueryRef = useRef(true); // ref to check search was initialised with defaultSearchQuery
  const isDefaultListLoadedRef = useRef(false); // ref to check if it was initialised with default value
  const latestSelectedValueRef = useRef<Value>(); // added to ref so that it doesn't get added to deps list of value change useEffect
  const latestListInstanceRef = useRef<FlatListItem[] | null>(null); // flag to recompute selected state if list has changed

  // ==============================
  // context
  // ==============================

  const { selectIsSearchable: isSearchableValueFromContext } = useInputContext();

  // ==============================
  // memo and callbacks
  // ==============================
  const updatedLatestSelectedValueRef = useCallback((newValue: Value) => {
    latestSelectedValueRef.current = newValue;
  }, []);

  const { areAllItemsSelected, flatList, onSelectOption, setLatestSelectedValueAndOptions } =
    useSelectHelpers({
      isMulti,
      list,
      onChange,
      selectedOptions,
      setSelectedOptions,
      setSelectedValues: updatedLatestSelectedValueRef,
    });

  const isSearchable = useMemo(
    () =>
      shouldEnableSearch(list, isSearchableValueFromContext, isSearchableValueFromProps, creatable),
    [list, isSearchableValueFromContext, isSearchableValueFromProps, creatable],
  );

  const emptyListPlaceholder = useMemo(() => {
    let emptyListPlaceholderString =
      typeof emptyListPlaceholderProp === 'string'
        ? emptyListPlaceholderProp
        : emptyListPlaceholderProp?.onNoSearchResults;

    if (inputValue) {
      emptyListPlaceholderString =
        typeof emptyListPlaceholderProp === 'object'
          ? emptyListPlaceholderProp?.onNoSearchResults
          : t('noSearchResultPlaceholder');
    }
    return (
      <EmptyListJSX
        placeholder={emptyListPlaceholderString || t('emptyListPlaceholder')}
        searchQuery={inputValue}
      />
    );
  }, [emptyListPlaceholderProp, t, inputValue]);

  // ==============================
  // side effects
  // ==============================

  /**
   * reset filteredList and selected options whenever list prop changes. use defaultSearchQuery or '' if rerender
   */
  useEffect(() => {
    setFilteredList(
      renderWithDefaultSearchQueryRef.current && isSearchable ? defaultSearchQuery : '',
    );
    renderWithDefaultSearchQueryRef.current = false;
  }, [list, setFilteredList, defaultSearchQuery, isSearchable]);

  // initial setting of selected options when there is default value
  useEffect(() => {
    if (isDefaultListLoadedRef.current || hasValueInProps || isInvalidValue(defaultValue)) {
      return;
    }

    isDefaultListLoadedRef.current = true;
    setNewSelectedOptions({
      isMulti,
      list: flatList,
      name,
      setInputValue,
      setSelectedValue: setLatestSelectedValueAndOptions,
      value: defaultValue,
    });
  }, [defaultValue, flatList, hasValueInProps, isMulti, name, setLatestSelectedValueAndOptions]);

  // settings new selectedOptions when value prop passed and local state selected options differ
  useEffect(() => {
    const hasListChanged =
      !!latestListInstanceRef.current && latestListInstanceRef.current !== flatList;
    latestListInstanceRef.current = flatList;
    if (
      hasValueInProps &&
      (hasListChanged || hasDifferentLatestAndPreviousValue(value, latestSelectedValueRef.current))
    ) {
      setNewSelectedOptions({
        isMulti,
        list: flatList,
        name,
        setInputValue,
        setSelectedValue: setLatestSelectedValueAndOptions,
        value,
      });
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
  const onInputChange = useCallback((newValue: string) => {
    setInputValue(newValue);
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      /**
       * The refetchList API only make sense for multi select and async list. I have added this to make it consistent with AsyncSelect.
       */
      refetchList: () => {},
    }),
    [],
  );

  // ==============================
  // render
  // ==============================
  return (
    <BaseSelect
      {...rest}
      emptyListPlaceholder={emptyListPlaceholder}
      areAllItemsSelected={areAllItemsSelected}
      isMulti={isMulti}
      isSearchable={isSearchable}
      list={filteredList}
      name={name}
      onChange={onSelectOption}
      selectedOptions={selectedOptions}
      selectedValue={latestSelectedValueRef.current}
      inputValue={inputValue}
      onInputChange={onInputChange}
      setFilteredList={setFilteredList}
      shouldScrollToSelectedValue={!isMulti}
    />
  );
});

Select.defaultProps = {
  size: INPUT_SIZES.M,
};

export default Object.assign(Select, { THEMES: BaseSelect.THEMES, SIZES: INPUT_SIZES });
