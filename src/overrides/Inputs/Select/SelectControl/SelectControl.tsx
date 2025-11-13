import { useTranslation } from '@rippling/lib-i18n/useTranslation';
import { has, isEmpty, size as _size } from 'lodash';
import React, { useCallback, useMemo } from 'react';
import type { IconProps } from '@rippling/pebble/Icon';
import Icon from '@rippling/pebble/Icon';
import ChipsRenderer from '@rippling/pebble/Internals/TextFieldWithChip/ChipsRenderer';
import type { ChipsRendererProps } from '@rippling/pebble/Internals/TextFieldWithChip/ChipsRenderer';
import type { SearchInputProps } from '@rippling/pebble/Inputs/Select/SearchInput';
import SearchInput from '@rippling/pebble/Inputs/Select/SearchInput';
import { ACTION_TYPES, SELECT_ALL_CHIP } from '@rippling/pebble/Inputs/Select/Select.constants';
import type { FlatListItem, StateSelectedOption } from '@rippling/pebble/Inputs/Select/Select.types';
import Styled from '@rippling/pebble/Inputs/Select/SelectControl/SelectControl.styles';
import type { SelectControlProps } from '@rippling/pebble/Inputs/Select/SelectControl/SelectControl.types';
import { useCollapseIcon } from '@rippling/pebble/Internals/hooks/useCollapseIcon';
import Country from '@rippling/pebble/Atoms/Country';
import Avatar from '@rippling/pebble/Avatar';
import Button from '@rippling/pebble/Button';
import { useTheme } from '@rippling/pebble/theme';
import Text from '@rippling/pebble/Text';
import ToggleableArrow from '@rippling/pebble/Atoms/ToggleableArrow';
import {
  getChipSizeFromInputSize,
  getFlagDimensionsFromInputSize,
  getSearchIconSizeFromInputSize,
  getButtonAffixTopPaddingFromInputSize,
  getLeftIconSizeFromInputSize,
} from '@rippling/pebble/Inputs/Select/SelectControl/SelectControl.helpers';
import {
  getButtonSizeFromInputSize,
  getPlaceholderTypestyleFromInputSize,
  getTypestyleFromInputSize,
} from '@rippling/pebble/Inputs/Input.helpers';
import Box from '@rippling/pebble/Layout/Box';
import {
  DEFAULT_BUTTON_CONTEXT_VALUE,
  DO_NOT_USE_ButtonContextProvider,
} from '@rippling/pebble/contexts/DO_NOT_USE_internal/buttonContext';

function getSearchInputPlaceholder(hasValidSelection: boolean, placeholder: string) {
  return hasValidSelection ? '' : placeholder;
}

/**
 * Returns true when selectedOptions is non empty and it has at least some option with label property set
 */
function checkHasValidSelection(selectedOptions: StateSelectedOption, isMulti?: boolean) {
  if (isEmpty(selectedOptions)) {
    return false;
  }

  return isMulti
    ? selectedOptions?.some((option: FlatListItem) => has(option, 'label'))
    : has(selectedOptions, 'label');
}

const SelectControl = (props: SelectControlProps) => {
  const {
    areAllItemsSelected,
    canClear,
    containerRef,
    innerRef,
    inputValue,
    isAppGroup,
    isDisabled,
    isMenuOpen,
    isMulti,
    isSearchable,
    maxHeight,
    onAction,
    placeholder,
    popperRef,
    ariaProps,
    prefixIconColor,
    rows,
    selectedOptions,
    selectedOptionLabelRenderer,
    shouldShowSearchIcon,
    onFocus: onFocusProp,
    onBlur: onBlurProp,
    size,
    computedCss,
    onInputChange,
    selectedOptionsModalClassName,
  } = props;
  const { iconProps } = useCollapseIcon({
    isDisabled,
    isExpand: isMenuOpen,
    inputSize: size,
  });

  const { theme: pebbleTheme } = useTheme();
  // ==============================
  // memo
  // ==============================
  const hasValidSelection = useMemo(
    () => checkHasValidSelection(selectedOptions, isMulti),
    [selectedOptions, isMulti],
  );

  const { t } = useTranslation('one-ui', { keyPrefix: 'inputs.select' });
  const SELECT_PLACEHOLDER = t('placeholder');
  const SEARCH_INPUT_PLACEHOLDER = t('searchInputPlaceholder');

  const iconTipProps = useMemo(
    () => ({
      content: t('selectControl.clearTip'),
      placement: Icon.TOOLTIP_PLACEMENTS.RIGHT,
    }),
    [t],
  );

  // ==============================
  // event handlers
  // ==============================
  const onRemoveChip = useCallback(
    (chipValue: unknown) => {
      onAction({
        type: ACTION_TYPES.MULTI_SELECT_REMOVE_VALUE,
        payload: {
          value: chipValue,
        },
      });
    },
    [onAction],
  );

  const onClickCancel = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onAction({
        type: ACTION_TYPES.SELECT_CLEAR_ALL,
      });
    },
    [onAction],
  );

  const handleContainerClick = useCallback(() => {
    onAction({
      type: ACTION_TYPES.SELECT_CONTROL_TOGGLE_MENU,
    });
  }, [onAction]);

  function handleUnSelectAll() {
    onAction({
      type: ACTION_TYPES.MULTI_SELECT_REMOVE_VALUE,
      payload: {
        value: SELECT_ALL_CHIP,
      },
    });
  }

  const onChange = useCallback(
    (textValue: string) => {
      onInputChange(textValue);
      onAction({
        type: ACTION_TYPES.SELECT_INPUT_TEXT_CHANGE,
        payload: {
          textValue,
        },
      });
    },
    [onAction, onInputChange],
  );

  const onFocus = useCallback(() => {
    onAction({
      type: ACTION_TYPES.SELECT_INPUT_FOCUS,
    });
  }, [onAction]);

  const onBlur = useCallback(() => {
    onAction({
      type: ACTION_TYPES.SELECT_INPUT_BLUR,
    });
  }, [onAction]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      // React synthetic event used is inside an asynchronous dispatch function
      event.persist();
      onAction({
        type: ACTION_TYPES.SELECT_INPUT_KEYDOWN,
        payload: {
          event,
        },
      });
    },
    [onAction],
  );

  // ==============================
  // renders
  // ==============================
  function renderSearchInput(searchInputProps: Partial<SearchInputProps>) {
    return (
      <Styled.DefaultWrapper>
        {!isMenuOpen && renderLeftDisplayIcon(selectedOptions)}
        <SearchInput
          {...searchInputProps}
          {...(ariaProps as Omit<React.HTMLAttributes<HTMLElement>, 'value' | 'defaultValue'>)}
          innerRef={innerRef}
          isDisabled={isDisabled}
          value={inputValue}
          {...{ onChange, onFocus, onBlur, onKeyDown, size }}
        />
      </Styled.DefaultWrapper>
    );
  }

  function getNonInputControlProps() {
    return {
      ...ariaProps,
      tabIndex: isDisabled ? -1 : 0,
      onFocus,
      onBlur,
    };
  }

  // provides left display asset (flag/Avatar/Icon)
  function renderLeftDisplayIcon(option?: FlatListItem) {
    if (option?.flag) {
      return (
        <Styled.LeftAssetContainer>
          <Country
            countryCode={option?.flag}
            size={getFlagDimensionsFromInputSize({ size })}
            onlyFlag
          />
        </Styled.LeftAssetContainer>
      );
    }
    if (option?.avatarProps || option?.avatarImage) {
      const { title, ...rest } = option.avatarProps || {};
      return (
        <Styled.LeftAssetContainer>
          <Styled.AvatarContainer size={size}>
            <Avatar
              image={option.avatarImage}
              imageBackground={option.avatarImageBackground}
              {...rest}
              size={Avatar.SIZES._2XS}
            />
          </Styled.AvatarContainer>
        </Styled.LeftAssetContainer>
      );
    }
    if (option?.leftIconType) {
      return (
        <Styled.LeftAssetContainer>
          <Icon
            type={option.leftIconType}
            size={getLeftIconSizeFromInputSize({ size, theme: pebbleTheme })}
            color={pebbleTheme.colorOnSurface}
          />
        </Styled.LeftAssetContainer>
      );
    }
    return <></>;
  }

  function renderSingleSelectLabel(option?: FlatListItem) {
    if (isEmpty(option) || option?.isOrphanValue) {
      return null;
    }

    if (typeof selectedOptionLabelRenderer === 'function') {
      return selectedOptionLabelRenderer(option as FlatListItem);
    }

    if (option?.flag || option?.avatarProps || option?.avatarImage || option?.leftIconType) {
      return (
        <Styled.DefaultWrapper>
          {renderLeftDisplayIcon(selectedOptions)}
          <Text typestyle={getTypestyleFromInputSize({ size, theme: pebbleTheme })}>
            {option?.label}
          </Text>
        </Styled.DefaultWrapper>
      );
    }

    return option?.label;
  }

  function renderTags() {
    return (
      <Styled.TagsContainer
        ref={popperRef}
        maxHeight={maxHeight}
        data-testid="multi-select-tags-container"
        size={size}
        isMulti={isMulti}
        {...(!isSearchable && getNonInputControlProps())}
      >
        <ChipsRenderer
          areAllSelected={areAllItemsSelected}
          isDisabled={isDisabled}
          renderer={selectedOptionLabelRenderer as ChipsRendererProps['renderer']}
          onRemove={onRemoveChip}
          onAllRemove={handleUnSelectAll}
          chips={selectedOptions as ChipsRendererProps['chips']}
          size={getChipSizeFromInputSize({ size })}
          overflowModalClassName={selectedOptionsModalClassName}
          batchSize={20}
        />
        {isSearchable &&
          renderSearchInput({
            placeholder: getSearchInputPlaceholder(
              hasValidSelection,
              placeholder || SEARCH_INPUT_PLACEHOLDER,
            ),
          })}
      </Styled.TagsContainer>
    );
  }

  function renderIcon(iconPropsLocal: IconProps) {
    return (
      iconProps.type && (
        <Icon
          size={getSearchIconSizeFromInputSize({ theme: pebbleTheme, size })}
          color={pebbleTheme.colorOnSurface}
          {...iconPropsLocal}
        />
      )
    );
  }

  function renderPrefix() {
    return (
      <Styled.SearchIconContainer isMulti={isMulti} size={size}>
        {renderIcon({
          type: Icon.TYPES.SEARCH_OUTLINE,
          color: prefixIconColor,
          isDisabled,
        })}
      </Styled.SearchIconContainer>
    );
  }

  function renderMultiSelectControl() {
    if (isSearchable) {
      return renderTags();
    }

    if (isEmpty(selectedOptions)) {
      return (
        <Styled.NonSearchActionElement {...getNonInputControlProps()}>
          <Text
            typestyle={getPlaceholderTypestyleFromInputSize({ size, theme: pebbleTheme })}
            color={pebbleTheme.colorOnSurfaceVariant}
          >
            {placeholder || SELECT_PLACEHOLDER}
          </Text>
        </Styled.NonSearchActionElement>
      );
    }

    return renderTags();
  }

  function renderSingleSelectControl() {
    if (isSearchable) {
      return renderSearchInput({
        placeholder: placeholder || SEARCH_INPUT_PLACEHOLDER,
      });
    }

    /**
     * select control with no search functionality
     */
    return (
      <Styled.NonSearchActionElement {...getNonInputControlProps()}>
        {isEmpty(selectedOptions) ? (
          <Text
            typestyle={getPlaceholderTypestyleFromInputSize({ size, theme: pebbleTheme })}
            color={pebbleTheme.colorOnSurfaceVariant}
          >
            {placeholder || SELECT_PLACEHOLDER}
          </Text>
        ) : (
          renderSingleSelectLabel(selectedOptions)
        )}
      </Styled.NonSearchActionElement>
    );
  }

  /**
   * to show clear when canClear prop is passed and either one option is selected or search text exists
   */
  function canShowClearIcon() {
    return !isDisabled && canClear && (_size(inputValue) > 0 || hasValidSelection);
  }

  function renderCancelButton() {
    return (
      canShowClearIcon() && (
        <Box
          isInline
          padding={{
            top: getButtonAffixTopPaddingFromInputSize({
              theme: pebbleTheme,
              isMulti,
              size,
            }),
          }}
        >
          {/* eslint-disable-next-line react/jsx-pascal-case */}
          <DO_NOT_USE_ButtonContextProvider value={DEFAULT_BUTTON_CONTEXT_VALUE}>
            <Button.Icon
              aria-label={t('clearLabel')}
              icon={Icon.TYPES.CLEAR}
              onClick={onClickCancel}
              tip={iconTipProps}
              size={getButtonSizeFromInputSize({ size })}
              appearance={Button.Icon.APPEARANCES.GHOST}
            />
          </DO_NOT_USE_ButtonContextProvider>
        </Box>
      )
    );
  }

  /**
   * Not to show collapse icon where there appGroup select
   */
  function canShowCollapseIcon() {
    return !isAppGroup && !shouldShowSearchIcon;
  }
  function renderCollapseIcon() {
    const { isDisabled: collapsedIconDisabled, size: iconSize } = iconProps;
    return (
      canShowCollapseIcon() && (
        <Styled.CollapseIconContainer size={size} isMulti={isMulti}>
          <ToggleableArrow
            isArrowDown={!isMenuOpen}
            isDisabled={collapsedIconDisabled}
            size={iconSize}
            showCursor={false}
            arrowDownColor={pebbleTheme.colorOnSurfaceVariant}
            arrowUpColor={pebbleTheme.colorPrimary}
          />
        </Styled.CollapseIconContainer>
      )
    );
  }

  function renderSelectControl() {
    if (isMulti) {
      return renderMultiSelectControl();
    }

    return renderSingleSelectControl();
  }
  // Left section is used to render search icon
  const shouldRenderLeftSection = shouldShowSearchIcon && isSearchable;

  return (
    <Styled.Container
      ref={containerRef}
      maxHeight={maxHeight}
      data-testid="select-controller"
      hasSearchIcon={shouldShowSearchIcon}
      isAppGroup={isAppGroup}
      isMulti={isMulti}
      isSearchable={isSearchable}
      onClick={handleContainerClick}
      rows={rows}
      onFocus={onFocusProp}
      onBlur={onBlurProp}
      size={size}
      computedCss={computedCss}
    >
      {shouldRenderLeftSection && (
        <Styled.LeftSection size={size} isMulti={isMulti}>
          {renderPrefix()}
        </Styled.LeftSection>
      )}
      <Styled.MiddleSection isMulti={isMulti} maxHeight={maxHeight} size={size}>
        {renderSelectControl()}
      </Styled.MiddleSection>
      {renderCancelButton()}
      {renderCollapseIcon()}
    </Styled.Container>
  );
};

export default SelectControl;
