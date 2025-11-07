import { castArray, isEmpty, isFunction, pick, size as _size } from 'lodash';
import React, { forwardRef, useEffect, useRef } from 'react';
import { useTranslation } from '@rippling/lib-i18n/useTranslation';
import MenuList from '@rippling/pebble/MenuList';
import { ALLOWED_ARIA_PROPS } from '@rippling/pebble/MenuList/MenuList.constants';
import type { PopperProps, PopperRef } from '@rippling/pebble/Popper';
import Popper from '@rippling/pebble/Popper';
import { POPPER_MIDDLEWARE } from '@rippling/pebble/Inputs/Input.constants';
import type { ListFooter } from '../Select.types';
import SelectMenuListFooter from '../SelectMenuListFooter';
import type { SelectMenuProps } from './SelectMenu.types';
import { getIfMenuListCompact } from './SelectMenu.helpers';
import { useInputContext } from '@rippling/pebble/Inputs/hooks';

function renderFooter({
  footer,
  searchQuery,
}: {
  footer: ListFooter;
  searchQuery: SelectMenuProps['searchQuery'];
}) {
  return !footer ? null : <SelectMenuListFooter footer={footer} searchQuery={searchQuery} />;
}

const SelectMenu = forwardRef<HTMLDivElement, SelectMenuProps>(function SelectMenu(props, ref) {
  const { t } = useTranslation('one-ui', { keyPrefix: 'inputs.select' });

  const {
    children,
    emptyListPlaceholder = t('emptyListPlaceholder'),
    footer,
    header,
    height,
    isMenuOpen,
    isMulti,
    isPositionFixed,
    list,
    onClick,
    placement,
    shouldFlipIfNoSpace,
    shouldScrollToSelectedValue,
    onActiveIndexChange,
    value,
    width,
    maxWidth,
    minWidth,
    size,
    shouldUsePortal,
    searchQuery,
  } = props;

  const lengthOfSelectedValues = isEmpty(value) ? 0 : _size(castArray(value));
  const popperRef = useRef<PopperRef>(null);

  // State for managing exit animations
  const [isVisible, setIsVisible] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const closeTimeoutRef = useRef<number | null>(null);

  // Handle menu open/close with animation delay
  useEffect(() => {
    if (isMenuOpen) {
      setIsVisible(true);
      setIsClosing(false);
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
    } else if (isVisible) {
      // Start closing animation
      setIsClosing(true);
      // Delay hiding to allow exit animation to play (150ms = DURATION.fast)
      closeTimeoutRef.current = window.setTimeout(() => {
        setIsVisible(false);
        setIsClosing(false);
      }, 150);
    }

    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, [isMenuOpen, isVisible]);

  const { popperMiddleware: selectPopperMiddleware } = useInputContext();

  /**
   * We need to refresh dropdown positioning if being used by AppGroup
   */
  const shouldRefreshDropdownPositionOnListUpdate = Boolean(isFunction(children)) || isMulti;

  const ariaProps = pick(props, ALLOWED_ARIA_PROPS);

  const popperProps = {
    isVisible: isVisible,
    ref: popperRef,
    popContent: (
      <MenuList.DropBox ref={ref} className={isClosing ? 'select-menu-closing' : ''}>
        <MenuList
          enableSeparator
          onActiveIndexChange={onActiveIndexChange}
          emptyListPlaceholder={emptyListPlaceholder}
          footer={renderFooter({ footer, searchQuery })}
          header={header}
          list={list}
          maxHeight={height}
          onClick={onClick}
          selectedValues={value as any}
          shouldScrollToSelectedValue={shouldScrollToSelectedValue}
          isCompact={getIfMenuListCompact({ size })}
          {...{ width, maxWidth, minWidth }}
          {...ariaProps}
        />
      </MenuList.DropBox>
    ),
    middleware: selectPopperMiddleware ?? POPPER_MIDDLEWARE,
    placement,
    shouldFlipIfNoSpace,
    isPositionFixed,
    'aria-label': ariaProps['aria-label'],
    shouldUsePortal,
  } as PopperProps;

  useEffect(() => {
    if (shouldRefreshDropdownPositionOnListUpdate && popperRef.current) {
      popperRef.current.refresh();
    }
  }, [lengthOfSelectedValues, shouldRefreshDropdownPositionOnListUpdate]);

  return isFunction(children) ? (
    <Popper {...popperProps} targetRenderer={children} />
  ) : (
    <Popper {...popperProps}>{children}</Popper>
  );
});

SelectMenu.defaultProps = {
  shouldFlipIfNoSpace: true,
  isPositionFixed: true,
};

export default SelectMenu;
