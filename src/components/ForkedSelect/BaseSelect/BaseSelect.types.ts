import type { CSSProperties, ReactNode } from 'react';
import type { PopperProps, ReferenceChildrenProps, Placement } from '@rippling/pebble/Popper';
import type { TextRefObject } from '@rippling/pebble/Text';
import type { FlatListItem, MenuListProps, NestedListItem, OnClickEvent } from '@rippling/pebble/MenuList';
import type { ALLOWED_ARIA_PROPS, THEMES } from './BaseSelect.constants';
import type { INPUT_SIZES } from '@rippling/pebble/Inputs/Input.constants';
import type { BaseInputProps } from '@rippling/pebble/Inputs/Input.types';

export type { FlatListItem, ReferenceChildrenProps, TextRefObject };

export type List = NestedListItem[] | FlatListItem[];
export type SelectedOptions = FlatListItem | FlatListItem[];

export type AriaProps = Pick<
  React.HTMLAttributes<HTMLElement>,
  (typeof ALLOWED_ARIA_PROPS)[number]
>;

export type ListFooterParams = {
  searchQuery: string | undefined;
};

export type ListFooterObject = {
  label: string | ((params: ListFooterParams) => string);
  onClick: () => void;
};

export type ListFooterFunction = (params: ListFooterParams) => React.ReactNode;

export type ListFooter = ListFooterObject | React.ReactNode | ListFooterFunction;

export type BaseSelectProps = Pick<BaseInputProps, 'id' | 'isRequired'> &
  AriaProps & {
    areAllItemsSelected?: boolean;
    /**
     * Adds cancel button to clear selected option(s)
     */
    canClear?: boolean;
    /**
     * Adds select all toggle button to multi select
     */
    canSelectAll?: boolean;
    /**
     * Sets dropdown height
     */
    dropdownHeight?: number;
    /**
     * Placeholder seen when dropdown list is empty
     */
    emptyListPlaceholder?: string | React.ReactNode;
    /**
     * Sets fixed footer to the bottom of scrollable menu list
     */
    footer?: ListFooter;
    inputValue: string;
    /**
     * Sets select functionality wrt AppGroup
     * @ignore
     */
    isAppGroup?: boolean;
    isAsyncList?: boolean;
    /**
     * Sets input as un-editable
     */
    isDisabled?: boolean;
    /**
     * Sets styling to indicate that the form input has error
     */
    isInvalid?: boolean;
    /**
     *  INTERNAL USED PROP: to select multiple options
     */
    isMulti?: boolean;
    /**
     * If true, dropdown menu will be open by default
     */
    isMenuDefaultOpen?: boolean;
    /**
     * Sets dropdown position as fixed i.e. relative to viewport
     */
    isPositionFixed?: PopperProps['isPositionFixed'];
    /**
     * When true, renders the select menu in a React Portal
     * @default false
     */
    shouldUsePortal?: PopperProps['shouldUsePortal'];
    /**
     *  Only displays the value but not the select input
     */
    isReadOnly?: boolean;
    /**
     * To enforce text input for searching options
     * @ignore
     */
    isSearchable?: boolean;
    /**
     * controls if the input is in loading state
     * @ignore
     */
    isLoading?: boolean;
    /**
     * List of options
     */
    list: List;
    /**
     * Sets max-height (multi-select only)
     */
    maxHeight?: CSSProperties['maxHeight'];
    /**
     *  Unique identifier for select form input
     */
    name?: string;
    /**
     * Handler to be called when select lose focus
     */
    onBlur?: React.FocusEventHandler;
    /**
     * Handler to be called when selected option(s) change
     */
    onChange: (
      value: null | unknown | unknown[],
      extraParams?: { selectedOption?: FlatListItem | FlatListItem[]; event?: OnClickEvent },
    ) => void;
    /**
     * Handler to be called when select is in focus
     */
    onFocus?: React.FocusEventHandler;
    /**
     * Search input value change handler
     */
    onInputChange(inputValue: string): void;
    /**
     * Handler to be called when menu is open or close
     */
    onMenuToggle?: (isOpen: boolean) => void;
    /**
     * Placeholder set within input
     */
    placeholder?: string;
    /**
     * Dropdown position
     */
    placement?: Placement;
    /**
     * Minimum number of rows to be shown
     */
    rows?: number;
    /**
     * List of selected options
     */
    selectedOptions?: FlatListItem | FlatListItem[];
    /**
     * INTERNAL USED PROP: To set custom jsx to selected option label
     */
    selectedOptionLabelRenderer?(option: FlatListItem): ReactNode;
    /**
     * select option value(s)
     */
    selectedValue?: unknown | unknown[];
    setFilteredList(query: string): void;
    /**
     *  Sets search icon prefix, works only if isSearchable is true
     */
    shouldShowSearchIcon?: boolean;
    /**
     * For single select scroll to selected value on dropdown focus
     */
    shouldScrollToSelectedValue?: MenuListProps['shouldScrollToSelectedValue'];
    /**
     * Sets customised styles to Select
     */
    theme?: THEMES;
    size?: INPUT_SIZES;
    /**
     * Class name to be applied to the selected options modal that appears when the user clicks the [+x] chip (multi-select only).
     */
    selectedOptionsModalClassName?: string;
  };
