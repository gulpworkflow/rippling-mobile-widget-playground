import { convertNestedListToFlatList } from '@rippling/ui-utils/List';
import { castArray, isFunction } from 'lodash';
import type {
  AsyncSelectProps,
  EmptyListPlaceholder,
  ListAsyncFn,
  StaticList,
  Value,
} from '../Select.types';
import {
  constructSelectedOptionsFromValue,
  hasDifferentLatestAndPreviousValue,
  isInvalidValue,
} from '../Select.helpers';

/** types */
type RefetchListParams = {
  hasValueInProps: boolean;
  list: ListAsyncFn;
  previousList?: ListAsyncFn;
  previousValue: Value;
  value: Value;
};

type FetchListParams = Pick<AsyncSelectProps, 'value' | 'list' | 'isMulti'>;

type GetAsyncSelectedOptionsParams = Pick<AsyncSelectProps, 'value' | 'isMulti'> & {
  checkForInvalidValue: boolean;
  list: StaticList | StaticList[];
  name?: string;
};
/** End: types */

const fetchList = ({ isMulti, list, value }: FetchListParams) => {
  if (isInvalidValue(value)) {
    return list('');
  }

  if (isMulti) {
    const valueArray = castArray(value);
    const promiseArray: unknown[] = [];
    valueArray.forEach(perValue => {
      promiseArray.push(list(perValue));
    });
    return Promise.all(promiseArray);
  }

  return list(value);
};

const getAsyncSelectedOptions = ({
  checkForInvalidValue = true,
  isMulti,
  list,
  name,
  value,
}: GetAsyncSelectedOptionsParams) => {
  if (isMulti) {
    if (isInvalidValue(value)) return value;
    const multiSelectedOptions: any[] = [];
    const valueArray = castArray(value);
    (list as StaticList[]).forEach((listPerValue: StaticList, index: number) => {
      const { flatList } = convertNestedListToFlatList(listPerValue);
      const selectedOption = constructSelectedOptionsFromValue(valueArray[index], flatList, {
        checkForInvalidValue,
        name,
      });
      multiSelectedOptions.push(selectedOption);
    });
    return multiSelectedOptions;
  }

  return constructSelectedOptionsFromValue(value, convertNestedListToFlatList(list).flatList, {
    checkForInvalidValue,
    name,
  });
};

/**
 * @description: To load list with default value passed
 */
const shouldLoadListWithDefaultValue = (hasValueInProps: boolean, defaultValue: Value) =>
  !hasValueInProps && !isInvalidValue(defaultValue);

/**
 * @description: To refetch list when value or list changes
 */
const shouldRefetchList = ({
  list,
  previousList,
  hasValueInProps,
  value,
  previousValue,
}: RefetchListParams) => {
  const hasNewValidList = isFunction(previousList) && isFunction(list) && list !== previousList;
  const hasNewValidValue =
    hasValueInProps && hasDifferentLatestAndPreviousValue(value, previousValue);
  return hasNewValidList || hasNewValidValue;
};

/**
 * @description: empty list placeholders map to handle varied fetching list states of loading, empty list on search query, empty list on no search query
 */
const getListPlaceholderMap = (
  placeholders: {
    emptyListPlaceholder: string;
    loadingListPlaceholder: string;
    noSearchResultPlaceholder: string;
  },
  listPlaceholder?: EmptyListPlaceholder,
) => {
  const { emptyListPlaceholder, loadingListPlaceholder, noSearchResultPlaceholder } =
    placeholders || {};

  if (typeof listPlaceholder === 'object') {
    return {
      onNoSearchQuery: listPlaceholder.onNoSearchQuery || emptyListPlaceholder,
      onLoading: listPlaceholder.onLoading || loadingListPlaceholder,
      onNoSearchResults: listPlaceholder.onNoSearchResults || noSearchResultPlaceholder,
    };
  }
  return {
    onNoSearchQuery: listPlaceholder || emptyListPlaceholder,
    onLoading: loadingListPlaceholder,
    onNoSearchResults: listPlaceholder || noSearchResultPlaceholder,
  };
};

export {
  fetchList,
  getAsyncSelectedOptions,
  shouldLoadListWithDefaultValue,
  shouldRefetchList,
  getListPlaceholderMap,
};
