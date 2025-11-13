import { castArray, debounce, isEmpty, size as _size } from 'lodash';
import React, {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
  useContext,
  useMemo,
} from 'react';
import { useTranslation } from '@rippling/lib-i18n/useTranslation';
import { KEY_CODES } from '@rippling/ui-utils/DomEvents';
import { useKeyDown, useOutsideClick } from '@rippling/pebble/hooks';
import { ScreenReaderOnly, getA11yComboBoxProps } from '@rippling/pebble/accessibility';
import { useTheme, sanitizeTheme } from '@rippling/pebble/Internals/hooks';
import { getTemplateComponent } from '@rippling/pebble/MenuList/MenuList.helpers';
import type { OnActiveIndexChange } from '@rippling/pebble/MenuList';
import { PLACEMENTS as POPPER_PLACEMENT } from '@rippling/pebble/Popper';
import useInputContext from '@rippling/pebble/Inputs/hooks/useInputContext';
import { StyledReadOnlyText } from '@rippling/pebble/Inputs/Input.styles';
import useSelectMenuWidth from '../hooks/useSelectMenuWidth';
import {
  ACTION_TYPES,
  APP_GROUP_DROPDOWN_WIDTH,
  APP_GROUP_DROPDOWN_OFFSET,
  DROPDOWN_MIN_WIDTH,
  DROPDOWN_MAX_WIDTH,
  DROPDOWN_HEIGHT,
  SEARCH_ICON_COLORS,
} from '../Select.constants';
import { controlSearchInputFocusOnMenuToggle } from './BaseSelect.helpers';
import SelectAllToggle from '../SelectAllToggle';
import SelectControl from '../SelectControl';
import type { SelectMenuProps } from '../SelectMenu';
import SelectMenu from '../SelectMenu';
import { THEMES } from './BaseSelect.constants';
import Styled from './BaseSelect.styles';
import { THEME_TO_STYLES_MAP } from './BaseSelect.themes';
import type {
  BaseSelectProps,
  ReferenceChildrenProps,
  FlatListItem,
  TextRefObject,
} from './BaseSelect.types';
import selectStateManager from './SelectStateManager';
import { FormChildrenContext } from '@rippling/pebble/contexts';
import { DO_NOT_USE_InputContext as InternalInputContext } from '@rippling/pebble/contexts/DO_NOT_USE_internal/inputContext';
import { DO_NOT_USE_SelectContext as InternalSelectContext } from '@rippling/pebble/contexts/DO_NOT_USE_internal/selectContext';
import Label from '@rippling/pebble/Label';

const BaseSelect = (originalProps: BaseSelectProps) => {
  const { size: internalContextSize } = useContext(InternalInputContext);
  const { shouldUsePortal: internalContextShouldUsePortal } = useContext(InternalSelectContext);
  const props = { ...originalProps, size: internalContextSize ?? originalProps.size };

  const {
    areAllItemsSelected,
    canClear,
    canSelectAll,
    dropdownHeight,
    emptyListPlaceholder,
    footer,
    inputValue,
    isAppGroup,
    isAsyncList,
    isDisabled,
    isInvalid,
    isMenuDefaultOpen,
    isMulti,
    isPositionFixed,
    isReadOnly,
    isSearchable,
    list,
    maxHeight,
    name,
    onBlur: onBlurProp,
    onChange,
    onFocus: onFocusProp,
    onMenuToggle,
    isLoading,
    onInputChange,
    placeholder,
    placement,
    rows,
    selectedOptionLabelRenderer,
    selectedOptions,
    selectedValue,
    setFilteredList,
    shouldShowSearchIcon,
    shouldScrollToSelectedValue,
    theme,
    id,
    isRequired,
    size,
    shouldUsePortal: shouldUsePortalProp,
    selectedOptionsModalClassName,
  } = props;

  const shouldUsePortal = internalContextShouldUsePortal ?? shouldUsePortalProp;
  const { t } = useTranslation('one-ui', { keyPrefix: 'inputs.select' });
  const SELECT_PLACEHOLDER = t('placeholder');
  const SEARCH_INPUT_PLACEHOLDER = t('searchInputPlaceholder');
  const { isThemeV2 } = useContext(FormChildrenContext);

  // ==============================
  // context
  // ==============================
  const {
    inputTheme,
    selectPopperWidth: contextPopperWidth = 0,
    selectPopperPlacement: contextMenuPlacement,
    uniqueInputId,
  } = useInputContext();
  const menuPlacement = placement || contextMenuPlacement || POPPER_PLACEMENT.BOTTOM_START;

  // ==============================
  // refs
  // ==============================
  const searchInputRef = useRef<TextRefObject>(null);
  const selectContainerRef = useRef<HTMLDivElement>(null);
  const selectMenuRef = useRef<HTMLDivElement>(null);
  const selectControlRef = useRef<HTMLDivElement>(null);

  // ==============================
  // state hooks
  // ==============================
  const [state, dispatch] = useReducer(selectStateManager, {
    containerWidth: isAppGroup ? APP_GROUP_DROPDOWN_WIDTH : contextPopperWidth,
    isMenuOpen: !!isMenuDefaultOpen && !isDisabled,
    isSearchInputFocused: false,
  });

  const themeToPass = sanitizeTheme(inputTheme, theme);
  const { computedCss } = useTheme(themeToPass, THEME_TO_STYLES_MAP, {
    isMenuOpen: state.isMenuOpen,
  });

  const gainFocus = () => {
    selectControlRef.current?.querySelector<HTMLElement>('[role="combobox"]')?.focus();
  };

  const onOutsideClick = useMemo(
    () =>
      debounce(() => {
        dispatch({
          type: ACTION_TYPES.SELECT_OUTSIDE_CLICK,
          payload: {
            isAsyncList,
            isMulti,
            isSearchable,
            onInputChange,
            searchInputValue: inputValue,
            selectedOptions,
            setFilteredList,
          },
        });
      }),
    [
      inputValue,
      isAsyncList,
      isMulti,
      isSearchable,
      onInputChange,
      selectedOptions,
      setFilteredList,
    ],
  );

  const refsToWatch = useMemo(() => {
    if (!shouldUsePortal) {
      return selectContainerRef;
    }
    return [selectContainerRef, selectMenuRef];
  }, [shouldUsePortal]);

  // hook to detect outside target element click
  useOutsideClick(refsToWatch, onOutsideClick);
  useKeyDown(KEY_CODES.TAB, onOutsideClick, { enclosingScopeRef: selectContainerRef });

  // ==============================
  // layout effects
  // ==============================
  const setMenuWidth = useCallback(
    (width: number) => {
      // If used in App Group, limit the max width to {APP_GROUP_DROPDOWN_WIDTH} which constrains the width to container size on smaller devices(mobile view)
      const dropdownWidth = isAppGroup
        ? Math.min(width - APP_GROUP_DROPDOWN_OFFSET, APP_GROUP_DROPDOWN_WIDTH)
        : width;

      dispatch({
        type: ACTION_TYPES.SELECT_MENU_WIDTH,
        payload: { dropdownWidth },
      });
    },
    [isAppGroup],
  );

  useSelectMenuWidth(state.isMenuOpen, setMenuWidth, {
    containerRef: selectContainerRef,
    menuWidth: contextPopperWidth,
  });

  // ==============================
  // side effects
  // =============================

  /**
   *  - To keep search input focused when menu is open
   *  - Blur search input when menu closes
   *  - In Multi Select to retain input focus after selection we pass selectedValue as dependency
   */
  useEffect(() => {
    if (!isSearchable) {
      return;
    }

    controlSearchInputFocusOnMenuToggle(state.isMenuOpen, searchInputRef);
  }, [state.isMenuOpen, isSearchable, selectedValue]);

  useEffect(() => {
    if (state.isMenuOpen) {
      gainFocus();
    }
  }, [state.isMenuOpen]);

  useEffect(() => {
    onMenuToggle?.(state.isMenuOpen);
  }, [state.isMenuOpen, onMenuToggle]);

  // ==============================
  // event handlers
  // ==============================
  const handleSelectControlActions = useCallback(
    ({ type, payload }: { type: ACTION_TYPES; payload?: any }) => {
      dispatch({
        type,
        payload: {
          ...payload,
          isAsyncList,
          isDisabled,
          isMulti,
          isSearchable,
          onChange,
          setFilteredList,
          onInputChange,
          selectedOptions,
          searchInputValue: inputValue,
        },
      });
    },
    [
      inputValue,
      isAsyncList,
      isDisabled,
      isMulti,
      isSearchable,
      onChange,
      onInputChange,
      selectedOptions,
      setFilteredList,
    ],
  );

  const handleToggleSelectAll = useCallback(
    (isChecked: boolean) => {
      dispatch({
        type: ACTION_TYPES.MULTI_SELECT_TOGGLE_ALL,
        payload: {
          isChecked,
          setFilteredList,
          onChange,
          onInputChange,
          selectedOptions,
        },
      });
    },
    [setFilteredList, onChange, onInputChange, selectedOptions],
  );

  // even handler triggered on selecting option from dropdown
  const onSelectOption: SelectMenuProps['onClick'] = useCallback(
    (option, event) => {
      const onChangeWithEvent: BaseSelectProps['onChange'] = (value, extraParams) => {
        onChange(value, { ...extraParams, event });
      };

      dispatch({
        type: ACTION_TYPES.SELECT_ON_CHANGE,
        payload: {
          event,
          isAsyncList,
          isDisabled,
          isMulti,
          onChange: onChangeWithEvent,
          selectedOption: option,
          setFilteredList,
          onInputChange,
          selectedOptions,
        },
      });
    },
    [isAsyncList, isDisabled, isMulti, onChange, onInputChange, selectedOptions, setFilteredList],
  );

  // ==============================
  // Render Methods
  // ==============================
  const selectedOptionsLength = isEmpty(selectedOptions) ? 0 : _size(castArray(selectedOptions));

  function renderSelectControl(params?: ReferenceChildrenProps) {
    return (
      <SelectControl
        areAllItemsSelected={canSelectAll && areAllItemsSelected}
        canClear={!isDisabled && canClear}
        containerRef={selectControlRef}
        innerRef={searchInputRef}
        inputValue={inputValue}
        isAppGroup={isAppGroup}
        isMenuOpen={state.isMenuOpen}
        isDisabled={isDisabled}
        isMulti={Boolean(isMulti)}
        isSearchable={isSearchable}
        maxHeight={maxHeight}
        onInputChange={onInputChange}
        onAction={handleSelectControlActions}
        placeholder={placeholder}
        popperRef={params?.ref}
        ariaProps={comboBoxA11yProps}
        prefixIconColor={SEARCH_ICON_COLORS.default}
        rows={rows}
        selectedOptions={selectedOptions}
        selectedOptionLabelRenderer={selectedOptionLabelRenderer}
        shouldShowSearchIcon={shouldShowSearchIcon}
        onFocus={onFocusProp}
        onBlur={onBlurProp}
        size={size}
        computedCss={computedCss}
        selectedOptionsModalClassName={selectedOptionsModalClassName}
      />
    );
  }

  function renderMenuHeader() {
    return (
      isMulti &&
      canSelectAll && (
        <Styled.SelectAllToggleContainer>
          <SelectAllToggle
            onChange={handleToggleSelectAll}
            value={areAllItemsSelected}
            selectedCount={selectedOptionsLength}
          />
        </Styled.SelectAllToggleContainer>
      )
    );
  }

  const [activeOptionId, setActiveOptionId] = useState<string | undefined>();

  /**
   * Fallback label is required when the input is not inside form and there no label attached.
   */
  const fallbackLabel =
    placeholder || (isSearchable ? SEARCH_INPUT_PLACEHOLDER : SELECT_PLACEHOLDER);
  const { comboBoxA11yProps, listBoxA11yProps } = getA11yComboBoxProps({
    id: id || uniqueInputId,
    describedBy: props['aria-describedby'],
    label: props['aria-label'] || fallbackLabel,
    labelledBy: props['aria-labelledby'],
    multiSelectable: !!isMulti,
    activeDescendant: activeOptionId || '',
    required: !!isRequired,
    expanded: state.isMenuOpen,
    invalid: !!isInvalid,
    disabled: !!isDisabled,
  });

  const onActiveIndexChange = useCallback<OnActiveIndexChange>((index, item) => {
    setActiveOptionId(item?.id);
  }, []);

  if (isReadOnly) {
    if (isEmpty(selectedOptions)) {
      return <StyledReadOnlyText data-testid={name} />;
    }

    if (!isMulti) {
      const listOption = selectedOptions as FlatListItem;
      const ItemComponent = getTemplateComponent(listOption);
      return (
        <Styled.ReadOnlyList size={size} data-testid={name}>
          <ItemComponent {...listOption} isReadOnly={isReadOnly} />
        </Styled.ReadOnlyList>
      );
    }

    return (
      <Label.Group testId={name}>
        {selectedOptions!.map((listOption: FlatListItem) => {
          const chipLabel = listOption?.label || '';
          return chipLabel && <Label key={listOption.value}>{chipLabel}</Label>;
        })}
      </Label.Group>
    );
  }

  const getAriaSelectionContext = () => {
    if (!selectedOptions) {
      return null;
    }

    return (
      <span data-context="selection" role="status" aria-live="polite">
        {selectedOptions.length
          ? t('selectionAriaInstruction', { count: selectedOptions.length })
          : null}
      </span>
    );
  };

  const getAriaListContext = () => {
    if (isLoading || !list?.length) {
      return null;
    }

    return (
      <span data-context="list" role="status" aria-live="polite">
        {t('listAriaInstruction', { count: list.length })}
      </span>
    );
  };

  const getMenuWidthConstraints = () => {
    const menuControlWidth = state.containerWidth;
    if (isAppGroup || menuControlWidth >= DROPDOWN_MAX_WIDTH) {
      return { width: menuControlWidth };
    }

    return {
      width: 'auto' as const,
      minWidth: Math.max(menuControlWidth, DROPDOWN_MIN_WIDTH),
      maxWidth: DROPDOWN_MAX_WIDTH,
    };
  };

  return (
    <Styled.SelectContainer
      data-testid={name}
      data-disabled={isDisabled}
      isDisabled={isDisabled}
      isFocused={state.isMenuOpen}
      isInvalid={isInvalid}
      ref={selectContainerRef}
      computedCss={computedCss}
      isThemeV2={isThemeV2}
      size={size}
    >
      <SelectMenu
        {...listBoxA11yProps}
        emptyListPlaceholder={emptyListPlaceholder}
        header={renderMenuHeader()}
        height={dropdownHeight || DROPDOWN_HEIGHT}
        isMenuOpen={state.isMenuOpen}
        isMulti={Boolean(isMulti)}
        onActiveIndexChange={onActiveIndexChange}
        footer={footer}
        list={list}
        isPositionFixed={isPositionFixed}
        onClick={onSelectOption}
        placement={menuPlacement}
        value={selectedValue}
        searchQuery={inputValue}
        shouldFlipIfNoSpace={!isAppGroup}
        shouldScrollToSelectedValue={shouldScrollToSelectedValue}
        size={size}
        {...getMenuWidthConstraints()}
        shouldUsePortal={shouldUsePortal}
        ref={selectMenuRef}
      >
        {isAppGroup ? renderSelectControl : renderSelectControl()}
      </SelectMenu>
      {state.isMenuOpen ? (
        /**
         * Aria-live block to pass on coms context to the screen reader.
         */
        <ScreenReaderOnly>
          {getAriaSelectionContext()}
          {getAriaListContext()}
        </ScreenReaderOnly>
      ) : null}
    </Styled.SelectContainer>
  );
};

BaseSelect.THEMES = THEMES;

export default BaseSelect;
