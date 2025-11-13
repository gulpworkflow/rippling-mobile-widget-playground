import React, { useMemo, useState } from 'react';
import Icon from '@rippling/pebble/Icon';
import { usePebbleTheme } from '../../utils/theme';
import { INPUT_SIZES } from '@rippling/pebble/Inputs/Input.constants';
import type { Theme } from '@rippling/pebble/theme';

function getIconSizeFromInputSize(props: { inputSize?: INPUT_SIZES; theme: Theme }) {
  const { inputSize, theme } = props;

  switch (inputSize) {
    case INPUT_SIZES.XS:
    case INPUT_SIZES.S:
      return theme.sizeIcon2xs;
    default:
      return theme.sizeIconXs;
  }
}

function useHover() {
  const [isHovered, setIsHovered] = useState(false);
  return {
    isHovered,
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  };
}

export function useCollapseIcon(props: {
  isDisabled?: boolean;
  isExpand?: boolean;
  inputSize?: INPUT_SIZES;
}) {
  const { isDisabled, isExpand, inputSize } = props;
  const { isHovered, onMouseEnter, onMouseLeave } = useHover();
  const { theme } = usePebbleTheme();

  const listeners = useMemo(
    () => ({
      onMouseEnter: isDisabled ? undefined : onMouseEnter,
      onMouseLeave: isDisabled ? undefined : onMouseLeave,
    }),
    [isDisabled, onMouseEnter, onMouseLeave],
  );

  return {
    iconProps: {
      color: theme.colorOnSurface,
      isDisabled,
      isFocused: isHovered && !isExpand,
      showCursor: !isDisabled,
      size: getIconSizeFromInputSize({ inputSize, theme }),
      type: Icon.TYPES.CARET_DOWN, // ⚠️ Always use CARET_DOWN (no swapping)
      isRotated: isExpand, // ⚠️ New prop to track rotation state
    },
    listeners,
  };
}
