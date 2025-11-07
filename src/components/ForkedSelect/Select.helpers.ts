import {
  castArray,
  defaultTo,
  find,
  findIndex,
  get,
  isEmpty,
  isNil,
  isUndefined,
  size,
  some,
} from 'lodash';
import shallowequal from 'shallowequal';
import logger, { sanitizedError } from '@rippling/pebble/services/logger';
import { SELECT_CONTROL_THRESHOLD, COMPONENT_NAME, IDENTIFIER_KEY } from './Select.constants';
import type { FlatListItem, List, SelectProps, StateSelectedOption, Value } from './Select.types';

export { controlSearchInputFocusOnMenuToggle } from './BaseSelect/BaseSelect.helpers';

/**
 * log error when non null value passed does not exist in list
 */
function logNoValueInListWarning(passedValue: Value, name?: string) {
  if (!isNil(passedValue)) {
    logger.warn(
      sanitizedError({
        // eslint-disable-next-line rippling-eslint/no-hard-coded-strings
        error: `[Select ${
          name ? `-${name}` : ''
        }] defaultValue/value passed: ${passedValue} does not exist in list array`,
        componentName: COMPONENT_NAME,
        errorName: 'InvalidValue',
      }),
    );
  }
}

/**
 * null/undefined/'' are considered invalid list item values
 * as Form current isRequired validation check fails for any of the following values
 */
function isInvalidValue(value: unknown) {
  return value === undefined || value === null || value === '';
}

/**
 * @desc to determine whether select has search functionality
 */
function shouldEnableSearch(
  list: List,
  searchableValueFromContext?: boolean,
  searchableValueFromProps?: boolean,
  creatable?: boolean,
) {
  // context over prop value because we pass through prop only for navigation searchBar
  const hasFixedSearchFunctionality = defaultTo(
    searchableValueFromContext,
    searchableValueFromProps,
  );
  if (typeof hasFixedSearchFunctionality === 'boolean') {
    return hasFixedSearchFunctionality;
  }
  // eslint-disable-next-line rippling-eslint/no-hard-coded-strings
  return (
    typeof list === 'function' ||
    some(list, 'list') ||
    size(list) > SELECT_CONTROL_THRESHOLD ||
    creatable
  );
}

function shouldUseDefaultSearchQuery({
  isMulti,
  defaultValue,
  hasValueInProps,
}: Pick<SelectProps, 'isMulti' | 'defaultValue'> & { hasValueInProps: boolean }) {
  return isMulti || (!hasValueInProps && isInvalidValue(defaultValue));
}

/**
 * @desc update multi select selected options
 */
function getMultiSelectUpdatedOptions(
  selectedOption: FlatListItem,
  currentSelectedOptions: undefined | FlatListItem[],
) {
  if (isEmpty(currentSelectedOptions)) {
    return [selectedOption];
  }

  const optionIndex = findIndex(currentSelectedOptions, [IDENTIFIER_KEY, selectedOption.value]);
  const isExistingOption = optionIndex > -1;

  // remove if already selected value in multi select
  if (isExistingOption) {
    // @ts-ignore
    const clonedSelectedOptions = [...currentSelectedOptions];
    clonedSelectedOptions!.splice(optionIndex, 1);
    return clonedSelectedOptions;
  }

  return currentSelectedOptions!.concat(selectedOption);
}

/**
 * @desc returns List Map against 'value' property
 */
function getListByValueMap(list?: FlatListItem[]) {
  const listMap = new Map<any, FlatListItem>();
  if (isEmpty(list)) {
    return listMap;
  }

  list!.forEach(option => {
    listMap.set(option.value, option);
  });
  return listMap;
}

/** *
 * @desc extracts value from state selected options (FlatListItem | FlatListItem[])
 */
function getValueFromSelectedOptions(
  stateSelectedOptions: undefined | FlatListItem | FlatListItem[],
  isMulti?: boolean,
) {
  if (!isMulti) {
    return get(stateSelectedOptions, 'value') ?? null;
  }

  if (isEmpty(stateSelectedOptions)) {
    return null;
  }

  return (stateSelectedOptions as FlatListItem[]).map(selectedOption =>
    get(selectedOption, 'value'),
  );
}

/**
 * @desc constructs selectedOptions(FlatListItem | FlatListItem[]) from new value prop received
 */
function constructSelectedOptionsFromValue(
  newValue: any | any[],
  list: undefined | FlatListItem[],
  options: {
    checkForInvalidValue?: boolean;
    isMulti?: boolean;
    name?: string;
  },
) {
  const { checkForInvalidValue = true, isMulti, name } = options;

  if (isInvalidValue(newValue)) {
    return undefined;
  }

  if (isMulti) {
    const newValueArray = castArray(newValue);
    if (newValueArray.length === 0) {
      return undefined;
    }

    const listByValueMap = getListByValueMap(list);
    return newValueArray.reduce((accum, value) => {
      const option = listByValueMap.get(value);
      // to prevent pushing undefined to new selectedOptions array
      if (isUndefined(option)) {
        accum.push({
          value,
          isOrphanValue: true,
        });
        /* istanbul ignore else */
        if (checkForInvalidValue) {
          logNoValueInListWarning(value, name);
        }
        return accum;
      }
      accum.push(option);
      return accum;
    }, []);
  }

  const newSelectedOption = find(list, { value: newValue });

  if (isUndefined(newSelectedOption)) {
    if (checkForInvalidValue) {
      logNoValueInListWarning(newValue, name);
    }
    return {
      value: newValue,
      isOrphanValue: true,
    };
  }
  return newSelectedOption;
}

/**
 * @desc returns true when all list items are selected
 */
function hasAllItemsSelected(selectedOptions: StateSelectedOption, list?: FlatListItem[]) {
  return size(selectedOptions) === size(list);
}

/**
 * @desc returns true when backspace is entered on blank text input in MultiSelect
 */
function shouldRemoveSelectedValueOnBackSpace(params: {
  isMulti?: boolean;
  searchInputValue: undefined | string;
  selectedOptions: StateSelectedOption;
}) {
  // Only applicable for multi select
  const { isMulti, searchInputValue, selectedOptions } = params;
  const hasAnySelectedOption =
    isMulti && Array.isArray(selectedOptions) && selectedOptions.length > 0;
  const isSearchInputEmpty = !searchInputValue;
  const lastSelectedOption = Array.isArray(selectedOptions)
    ? selectedOptions[selectedOptions.length - 1]
    : undefined;

  return (
    hasAnySelectedOption &&
    isSearchInputEmpty &&
    lastSelectedOption &&
    !lastSelectedOption.isDisabled
  );
}

/**
 * @description: Shallow compares previous and latest value and returns true if they are unequal
 */
function hasDifferentLatestAndPreviousValue(latestValue: Value, previousValue: Value) {
  const latestValueArray = castArray(latestValue);
  const previousValueArray = castArray(previousValue);

  // size is one and if both latest and previous value are invalid then return false, this filters any invalid values passed
  if (
    latestValueArray.length === 1 &&
    previousValueArray.length === 1 &&
    isInvalidValue(latestValueArray[0]) &&
    isInvalidValue(previousValueArray[0])
  ) {
    return false;
  }

  return !shallowequal(latestValueArray, previousValueArray);
}

export {
  constructSelectedOptionsFromValue,
  getListByValueMap,
  getMultiSelectUpdatedOptions,
  getValueFromSelectedOptions,
  hasAllItemsSelected,
  hasDifferentLatestAndPreviousValue,
  isInvalidValue,
  shouldEnableSearch,
  shouldUseDefaultSearchQuery,
  shouldRemoveSelectedValueOnBackSpace,
};
