import { castArray, isEmpty, isFunction, pick, size as _size } from 'lodash';
import React, { forwardRef, useEffect, useRef } from 'react';
import { useTranslation } from '@rippling/lib-i18n/useTranslation';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import MenuList from '@rippling/pebble/MenuList';
import { ALLOWED_ARIA_PROPS } from '@rippling/pebble/MenuList/MenuList.constants';
import type { PopperProps, PopperRef } from '@rippling/pebble/Popper';
import Popper from '@rippling/pebble/Popper';
import { POPPER_MIDDLEWARE } from '@rippling/pebble/Inputs/Input.constants';
import type { ListFooter } from '@rippling/pebble/Inputs/Select/Select.types';
import SelectMenuListFooter from '@rippling/pebble/Inputs/Select/SelectMenuListFooter';
import type { SelectMenuProps } from '@rippling/pebble/Inputs/Select/SelectMenu/SelectMenu.types';
import { getIfMenuListCompact } from '@rippling/pebble/Inputs/Select/SelectMenu/SelectMenu.helpers';
import { useInputContext } from '@rippling/pebble/Inputs/hooks';

// Animation constants
const DURATION = {
  fast: '150ms',
} as const;

const EASING = {
  easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
} as const;

const SCALE = {
  initial: 0.95,
  full: 1,
} as const;

// Dropdown entrance animation
const fadeScaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(${SCALE.initial});
  }
  to {
    opacity: 1;
    transform: scale(${SCALE.full});
  }
`;

// Animated wrapper for dropdown
const AnimatedDropBox = styled(MenuList.DropBox)`
  animation: ${fadeScaleIn} ${DURATION.fast} ${EASING.easeOut};
  transform-origin: top center;
`;

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

  const { popperMiddleware: selectPopperMiddleware } = useInputContext();

  /**
   * We need to refresh dropdown positioning if being used by AppGroup
   */
  const shouldRefreshDropdownPositionOnListUpdate = Boolean(isFunction(children)) || isMulti;

  const ariaProps = pick(props, ALLOWED_ARIA_PROPS);

  const popperProps = {
    isVisible: isMenuOpen,
    ref: popperRef,
    popContent: (
      <AnimatedDropBox ref={ref}>
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
      </AnimatedDropBox>
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
