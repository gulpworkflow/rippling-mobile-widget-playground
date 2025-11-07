import { isKeyMatched, KEY_CODES } from '@rippling/ui-utils/DomEvents';
import { castArray, debounce, get } from 'lodash';
import {
  ACTION_TYPES,
  DEBOUNCE_INTERVAL,
  SELECT_ALL_CHIP,
  SELECT_ALL_VALUE,
} from '../Select.constants';
import {
  getMultiSelectUpdatedOptions,
  getValueFromSelectedOptions,
  shouldRemoveSelectedValueOnBackSpace,
} from '../Select.helpers';
import type { FlatListItem, SelectState } from '../Select.types';
import type { BaseSelectProps, SelectedOptions } from './BaseSelect.types';
import type { OnClickEvent } from '@rippling/pebble/MenuList';

function sendSelectedOptionValues(
  newlySelectedOptions: SelectedOptions | undefined,
  extraParams: Pick<BaseSelectProps, 'isMulti' | 'onChange'>,
) {
  const { isMulti, onChange } = extraParams;
  const selectedItemValues = getValueFromSelectedOptions(newlySelectedOptions, isMulti);
  onChange(selectedItemValues, { selectedOption: newlySelectedOptions });
}

function closeDropdown(prevState: SelectState, setFilteredList?: any) {
  if (setFilteredList) {
    setFilteredList('');
  }
  return {
    ...prevState,
    isMenuOpen: false,
  };
}

function openDropdown(prevState: SelectState) {
  return {
    ...prevState,
    isMenuOpen: true,
  };
}

function onAsyncOutsideClick(
  prevState: SelectState,
  payload: Pick<BaseSelectProps, 'isMulti' | 'setFilteredList' | 'onInputChange'> & {
    newSearchInputValue: string;
    searchInputValue: string;
  },
) {
  const { setFilteredList, newSearchInputValue, searchInputValue, isMulti, onInputChange } =
    payload;

  if (isMulti) {
    onInputChange(newSearchInputValue);
    return closeDropdown(prevState, setFilteredList);
  }

  // single select if search text is not same as selected option then reset to its label and fetch list again
  /* istanbul ignore else */
  if (newSearchInputValue !== searchInputValue) {
    onInputChange(newSearchInputValue);
    setFilteredList(newSearchInputValue);
  }

  return closeDropdown(prevState);
}

type OnOutsideClick = Pick<
  BaseSelectProps,
  | 'isAsyncList'
  | 'isMulti'
  | 'isSearchable'
  | 'onInputChange'
  | 'selectedOptions'
  | 'setFilteredList'
> & {
  searchInputValue: string;
};
/**
 * @desc state changes on outside click of select container
 */
function onOutsideClick(prevState: SelectState, payload: OnOutsideClick) {
  /* istanbul ignore else */
  if (prevState.isMenuOpen) {
    const {
      isAsyncList,
      isMulti,
      isSearchable,
      onInputChange,
      searchInputValue,
      selectedOptions,
      setFilteredList,
    } = payload;
    let newSearchInputValue = searchInputValue;

    /* istanbul ignore else */
    if (isSearchable) {
      newSearchInputValue = isMulti ? '' : get(selectedOptions, 'label');
    }

    if (isAsyncList) {
      return onAsyncOutsideClick(prevState, {
        ...payload,
        searchInputValue,
        newSearchInputValue,
      });
    }

    onInputChange(newSearchInputValue);
    return closeDropdown(prevState, setFilteredList);
  }

  return prevState;
}

/**
 * @desc state changes to remove all selected options except disabled ones
 */
function onRemovedAllSelectedOptions(
  prevState: SelectState,
  payload: Pick<BaseSelectProps, 'onChange' | 'selectedOptions'>,
) {
  const { onChange, selectedOptions } = payload;
  const updatedSelectedOptions = selectedOptions
    ? castArray(selectedOptions).filter((selectedOption: FlatListItem) => selectedOption.isDisabled)
    : undefined;
  sendSelectedOptionValues(
    updatedSelectedOptions && updatedSelectedOptions.length > 0
      ? updatedSelectedOptions
      : undefined,
    {
      isMulti: true,
      onChange,
    },
  );
  return prevState;
}

type OnRemoveMultiSelectValuePayload = Pick<
  BaseSelectProps,
  'isDisabled' | 'isMulti' | 'onChange' | 'selectedOptions'
> & {
  value?: unknown;
};
/**
 * @desc multi select state changes when one of the selected options is removed
 */
function onRemoveMultiSelectValue(
  prevState: SelectState,
  payload: OnRemoveMultiSelectValuePayload,
) {
  const { value, isDisabled, isMulti, onChange, selectedOptions } = payload;

  if (isDisabled) {
    return prevState;
  }

  // remove all selection when All chip is clicked
  if (value === SELECT_ALL_CHIP) {
    return onRemovedAllSelectedOptions(prevState, { selectedOptions, onChange });
  }

  const updatedSelectedOptions = (selectedOptions as FlatListItem[]).filter(
    (selectedOption: FlatListItem) => selectedOption.value !== value,
  );
  sendSelectedOptionValues(updatedSelectedOptions, {
    isMulti,
    onChange,
  });

  return prevState;
}

type OnSelectAllOptionsPayload = Pick<
  BaseSelectProps,
  'onChange' | 'onInputChange' | 'setFilteredList' | 'selectedOptions'
> & {
  isChecked: boolean;
};
/**
 * @desc state changes to select all dropdown options
 */
function onSelectAllOptions(prevState: SelectState, payload: OnSelectAllOptionsPayload) {
  const { isChecked, onChange, onInputChange, setFilteredList, selectedOptions } = payload;
  const newInputValue = '';

  onInputChange(newInputValue);
  setFilteredList(newInputValue);

  if (isChecked) {
    onChange(SELECT_ALL_VALUE, {});
    return prevState;
  }

  return onRemovedAllSelectedOptions(prevState, {
    onChange,
    selectedOptions,
  });
}

type OnSelectClearAllPayload = Pick<
  BaseSelectProps,
  'setFilteredList' | 'isMulti' | 'onChange' | 'onInputChange'
>;
/**
 * @desc state changes to clear selectedOptions on cancel btn/All chip in multi select click
 */
function onSelectClearAll(prevState: SelectState, payload: OnSelectClearAllPayload) {
  const { setFilteredList, isMulti, onChange, onInputChange } = payload;

  onInputChange('');
  sendSelectedOptionValues(isMulti ? [] : undefined, {
    isMulti,
    onChange,
  });
  setFilteredList('');
  return prevState;
}

type OnToggleMenuPayload = Pick<BaseSelectProps, 'isDisabled'> & {
  event: React.MouseEvent<HTMLElement>;
};
/**
 * @desc toggles dropdown when clicked inside search results container
 */
function onToggleMenu(prevState: SelectState, payload: OnToggleMenuPayload) {
  const { isDisabled } = payload;
  const shouldOpenDropdown = !prevState.isMenuOpen;

  // not to close dropdown when input is in focus
  if (isDisabled || (prevState.isSearchInputFocused && !shouldOpenDropdown)) {
    return prevState;
  }

  return shouldOpenDropdown ? openDropdown(prevState) : closeDropdown(prevState);
}

type SetMenuWidthPayload = { dropdownWidth: number };
/**
 * Set dropdown width
 */
function setMenuWidth(prevState: SelectState, payload: SetMenuWidthPayload) {
  return {
    ...prevState,
    containerWidth: payload.dropdownWidth,
  };
}

/**
 * @desc state change on search input blur
 */
function onSelectInputBlur(prevState: SelectState) {
  return {
    ...prevState,
    isSearchInputFocused: false,
  };
}

type OnSelectInputFocusPayload = Pick<BaseSelectProps, 'isDisabled'>;
/**
 * @desc state change on search input focus
 */
function onSelectInputFocus(prevState: SelectState, payload: OnSelectInputFocusPayload) {
  const { isDisabled } = payload;

  if (isDisabled) {
    return prevState;
  }
  const isMenuClosed = !prevState.isMenuOpen;
  const newState = {
    ...prevState,
    isSearchInputFocused: true,
  };

  // handled on input rather than on container to maintain cursor position to the end
  if (isMenuClosed) {
    return openDropdown(newState);
  }
  return newState;
}

type OnSelectInputKeydownPayload = Pick<
  BaseSelectProps,
  | 'isDisabled'
  | 'selectedOptions'
  | 'isMulti'
  | 'onChange'
  | 'isAsyncList'
  | 'onInputChange'
  | 'setFilteredList'
> & {
  event: React.KeyboardEvent<HTMLInputElement>;
  searchInputValue: string;
};
/**
 * @desc state changes on search input keyDown
 */
function onSelectInputKeydown(prevState: SelectState, payload: OnSelectInputKeydownPayload) {
  const { event, isMulti, onChange, searchInputValue, selectedOptions } = payload;
  if (
    isKeyMatched(event, KEY_CODES.BACKSPACE) &&
    shouldRemoveSelectedValueOnBackSpace({
      isMulti,
      searchInputValue,
      selectedOptions,
    })
  ) {
    const updatedSelectedOptions = (selectedOptions as FlatListItem).slice(0, -1);
    sendSelectedOptionValues(updatedSelectedOptions, {
      isMulti,
      onChange,
    });
    return prevState;
  }

  /* istanbul ignore else */
  if (isKeyMatched(event, KEY_CODES.ESCAPE)) {
    event.stopPropagation();
    return onOutsideClick(prevState, payload);
  }

  return prevState;
}

/**
 * @desc: debounce on list filter w.r.t search query
 */
const filterListOnSearchQuery = debounce((searchQuery: string, setFilteredList) => {
  setFilteredList(searchQuery);
}, DEBOUNCE_INTERVAL);

type OnSearchTextChangePayload = Pick<BaseSelectProps, 'setFilteredList' | 'onInputChange'> & {
  textValue: string;
};
/**
 * @desc state changes on search text input change
 */
function onSearchTextChange(prevState: SelectState, payload: OnSearchTextChangePayload) {
  const { setFilteredList, textValue } = payload;
  filterListOnSearchQuery(textValue, setFilteredList);
  return prevState;
}

/**
 * @desc handles state changes of multi select after option selection from dropdown
 */
function onMultiSelectOnChange(
  prevState: SelectState,
  payload: Pick<
    BaseSelectProps,
    'isAsyncList' | 'isMulti' | 'onChange' | 'onInputChange' | 'selectedOptions' | 'setFilteredList'
  > & {
    selectedOption: FlatListItem;
  },
) {
  const {
    isMulti,
    onChange,
    setFilteredList,
    selectedOption,
    onInputChange,
    isAsyncList,
    selectedOptions: prevSelectedOptions,
  } = payload;

  const updatedSelectedOptions = getMultiSelectUpdatedOptions(
    selectedOption,
    prevSelectedOptions as undefined | FlatListItem[],
  );

  onInputChange('');
  sendSelectedOptionValues(updatedSelectedOptions, {
    isMulti,
    onChange,
  });

  /* istanbul ignore else */
  if (!isAsyncList) {
    setFilteredList(''); // reset search filters
  }

  return {
    ...prevState,
    isMenuOpen: true,
  };
}

type OnSelectChangePayload = Pick<
  BaseSelectProps,
  | 'isAsyncList'
  | 'isDisabled'
  | 'isMulti'
  | 'onChange'
  | 'onInputChange'
  | 'setFilteredList'
  | 'selectedOptions'
> & {
  selectedOption: FlatListItem;
  event: OnClickEvent;
};
/**
 * @desc handles state changes after option selection from dropdown
 */
function onSelectChange(prevState: SelectState, payload: OnSelectChangePayload) {
  const {
    isAsyncList,
    isDisabled,
    isMulti,
    setFilteredList,
    onChange,
    selectedOption,
    onInputChange,
    event,
  } = payload;

  if (isDisabled) {
    return prevState;
  }

  if (isMulti) {
    return onMultiSelectOnChange(prevState, payload);
  }

  function triggerCallbackFns() {
    // IMP NOTE: Order is important here first text changes and then option from dropdown is selected
    onInputChange(selectedOption.label as string);
    sendSelectedOptionValues(selectedOption, {
      onChange,
    });
  }

  if (event instanceof KeyboardEvent) {
    /**
     * [FRONTEND-4250] To prevent useReducer triggering dispatch fn twice on enter/tab keyboard selection.
     * Could possibly because of conflict of render updates from parent and children
     */
    setTimeout(triggerCallbackFns, 0);
  } else {
    triggerCallbackFns();
  }

  return closeDropdown(prevState, !isAsyncList && setFilteredList);
}

type SelectStateManagerPayload =
  | {
      type: ACTION_TYPES.MULTI_SELECT_REMOVE_VALUE;
      payload: OnRemoveMultiSelectValuePayload;
    }
  | {
      type: ACTION_TYPES.MULTI_SELECT_TOGGLE_ALL;
      payload: OnSelectAllOptionsPayload;
    }
  | {
      type: ACTION_TYPES.SELECT_CLEAR_ALL;
      payload: OnSelectClearAllPayload;
    }
  | {
      type: ACTION_TYPES.SELECT_CONTROL_TOGGLE_MENU;
      payload: OnToggleMenuPayload;
    }
  | {
      type: ACTION_TYPES.SELECT_MENU_WIDTH;
      payload: SetMenuWidthPayload;
    }
  | {
      type: ACTION_TYPES.SELECT_INPUT_BLUR;
    }
  | {
      type: ACTION_TYPES.SELECT_INPUT_FOCUS;
      payload: OnSelectInputFocusPayload;
    }
  | {
      type: ACTION_TYPES.SELECT_INPUT_KEYDOWN;
      payload: OnSelectInputKeydownPayload;
    }
  | {
      type: ACTION_TYPES.SELECT_INPUT_TEXT_CHANGE;
      payload: OnSearchTextChangePayload;
    }
  | {
      type: ACTION_TYPES.SELECT_ON_CHANGE;
      payload: OnSelectChangePayload;
    }
  | {
      type: ACTION_TYPES.SELECT_OUTSIDE_CLICK;
      payload: OnOutsideClick;
    };

function selectStateManager(state: SelectState, payload: SelectStateManagerPayload) {
  switch (payload.type) {
    case ACTION_TYPES.MULTI_SELECT_REMOVE_VALUE: {
      return onRemoveMultiSelectValue(state, payload.payload);
    }
    case ACTION_TYPES.MULTI_SELECT_TOGGLE_ALL: {
      return onSelectAllOptions(state, payload.payload);
    }
    case ACTION_TYPES.SELECT_CLEAR_ALL: {
      return onSelectClearAll(state, payload.payload);
    }
    case ACTION_TYPES.SELECT_CONTROL_TOGGLE_MENU: {
      return onToggleMenu(state, payload.payload);
    }
    case ACTION_TYPES.SELECT_MENU_WIDTH: {
      return setMenuWidth(state, payload.payload);
    }
    case ACTION_TYPES.SELECT_INPUT_BLUR: {
      return onSelectInputBlur(state);
    }
    case ACTION_TYPES.SELECT_INPUT_FOCUS: {
      return onSelectInputFocus(state, payload.payload);
    }
    case ACTION_TYPES.SELECT_INPUT_KEYDOWN: {
      return onSelectInputKeydown(state, payload.payload);
    }
    case ACTION_TYPES.SELECT_INPUT_TEXT_CHANGE: {
      return onSearchTextChange(state, payload.payload);
    }
    case ACTION_TYPES.SELECT_ON_CHANGE: {
      return onSelectChange(state, payload.payload);
    }
    case ACTION_TYPES.SELECT_OUTSIDE_CLICK: {
      return onOutsideClick(state, payload.payload);
    }
    default: {
      return state;
    }
  }
}

export default selectStateManager;
