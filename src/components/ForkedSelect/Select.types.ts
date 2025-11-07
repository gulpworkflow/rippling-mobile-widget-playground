import type { ReactNode } from 'react';
import type {
  FlatList,
  FlatListItem,
  NestedList,
  NestedListItem,
  OnClickEvent,
} from '@rippling/pebble/MenuList';
import type { StyleModifier as DropdownStyleModifier } from '@rippling/pebble/Popper';
import { THEMES as TEXT_THEMES } from '@rippling/pebble/Inputs/Text';
import type { BaseSelectProps, ListFooter } from './BaseSelect';
import type {
  StaticList,
  List,
  ListAsyncFn,
} from '@rippling/pebble/Internals/hooks/useSetSearchResults';
import type { INPUT_SIZES } from '@rippling/pebble/Inputs/Input.constants';

type Value = undefined | unknown | unknown[];

type SelectedOptionLabelRenderer = (option: FlatListItem) => ReactNode;

type EmptyListPlaceholder =
  | string
  | {
      /** list placeholder on empty search query * */
      onNoSearchQuery?: string;
      /** list placeholder seen while fetching list * */
      onLoading?: string;
      /** list placeholder on empty results with search query * */
      onNoSearchResults?: string;
    };

type BaseSelectPropsToExtend = Omit<
  BaseSelectProps,
  | 'areAllItemsSelected'
  | 'inputValue'
  | 'isAsyncList'
  | 'onInputChange'
  | 'selectedOptions'
  | 'selectedValue'
  | 'setFilteredList'
  | 'list'
  | 'isLoading'
  | 'onChange'
  | 'emptyListPlaceholder'
  | 'shouldScrollToSelectedValue'
>;

type SelectProps = BaseSelectPropsToExtend & {
  /**
   * Set size for Select component
   */
  size?: INPUT_SIZES;
  /**
   * Sets initial value of select
   */
  defaultValue?: unknown | Array<unknown> | undefined;
  /**
   * default search input value. Will not appear when single select has a value
   */
  defaultSearchQuery?: string;
  /**
   * Placeholder seen when dropdown list is empty.
   * In case of list as a function placeholder can be passed as object to handle varied list fetching states of pending, on no query and on empty results with search query
   */
  emptyListPlaceholder?: EmptyListPlaceholder;
  /**
   * Sets fuse search options
   */
  fuseOptions?: Record<string, unknown>;
  /**
   * Array of options/ Asynchronous function which gets called on every search query
   */
  list: FlatList | ListAsyncFn | NestedList;
  /**
   * To sort passed list
   */
  sort?: (list: FlatList, searchQuery?: string) => FlatList;
  /**
   * Handler to be called when selected option(s) change
   */
  onChange?: (
    value: unknown | unknown[] | null,
    selectedOption: StateSelectedOption,
    extraParams: { event?: OnClickEvent; created?: boolean },
  ) => void;
  /**
   * Sets value of select
   */
  value?: unknown | Array<unknown> | undefined;
  /**
   * Enables creation of new options that are not in the dropdown list.
   * When true, shows "Create [searchQuery]" option when no matches are found.
   * Created options will trigger onChange with created: true in the extra parameters.
   */
  creatable?: boolean;
};

type AsyncSelectProps = Omit<SelectProps, 'list'> & {
  list: ListAsyncFn;
};

/** State Types * */
type StateSelectedOption = undefined | FlatListItem | FlatListItem[];
type SelectState = {
  containerWidth: number;
  isMenuOpen: boolean;
  isSearchInputFocused: boolean;
};
/** End: State Types * */

export type SelectRef = {
  /**
   * This API can be used to refetch the list when the list is async.
   */
  refetchList: () => void;
};

export { TEXT_THEMES };
export type {
  EmptyListPlaceholder,
  StaticList,
  AsyncSelectProps,
  BaseSelectProps,
  DropdownStyleModifier,
  FlatListItem,
  List,
  ListAsyncFn,
  ListFooter,
  NestedListItem,
  SelectProps,
  SelectState,
  SelectedOptionLabelRenderer,
  StateSelectedOption,
  Value,
};
