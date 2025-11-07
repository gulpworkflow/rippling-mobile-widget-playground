import ColorUtils from '@rippling/ui-utils/Colors';
import { getCurrentTheme } from '@rippling/pebble/theme';
import { BASE_INPUT_THEME_STYLES_MAP, NO_BOX_SHADOW_STYLES } from '@rippling/pebble/Inputs/Input.styles';
import { THEMES } from './BaseSelect.constants';

/**
 * transparent border theme styles
 */

const transparentBorderStyles = () => `
  ${NO_BOX_SHADOW_STYLES};
  border-color: transparent;
  &:hover {
    border-color: transparent;
  }
`;

/**
 * Top nav theme styles
 */
const topNavStyles = () => `
  border-color: ${ColorUtils.hexToRgba(getCurrentTheme().theme.colorOutlineVariant, 0.08)};
  box-shadow: none;
  &:hover {
    border-color: ${ColorUtils.hexToRgba(getCurrentTheme().theme.colorOutlineVariant, 0.08)};
  }
`;

export const THEME_TO_STYLES_MAP = {
  ...BASE_INPUT_THEME_STYLES_MAP,
  [THEMES.TRANSPARENT_BORDER]: transparentBorderStyles,
  [THEMES.TOP_NAV]: topNavStyles,
  [THEMES.INLINE_TRANSPARENT_BORDER]: [
    ...BASE_INPUT_THEME_STYLES_MAP.NO_BOX,
    transparentBorderStyles,
  ],
  [THEMES.INLINE_TOP_NAV]: [...BASE_INPUT_THEME_STYLES_MAP.NO_BOX, topNavStyles],
  [THEMES.NO_PADDING_RIGHT_NO_BOX_TOP_NAV]: [
    ...BASE_INPUT_THEME_STYLES_MAP.NO_PADDING_RIGHT_NO_BOX,
    topNavStyles,
  ],
  [THEMES.NO_PADDING_RIGHT_NO_BOX_TRANSPARENT_BORDER]: [
    ...BASE_INPUT_THEME_STYLES_MAP.NO_PADDING_RIGHT_NO_BOX,
    transparentBorderStyles,
  ],
  [THEMES.NO_PADDING_LEFT_NO_BOX_TOP_NAV]: [
    ...BASE_INPUT_THEME_STYLES_MAP.NO_PADDING_LEFT_NO_BOX,
    topNavStyles,
  ],
  [THEMES.NO_PADDING_LEFT_NO_BOX_TRANSPARENT_BORDER]: [
    ...BASE_INPUT_THEME_STYLES_MAP.NO_PADDING_LEFT_NO_BOX,
    transparentBorderStyles,
  ],
};
