import { getCurrentTheme } from '@rippling/pebble/theme';

enum ACTION_TYPES {
  MULTI_SELECT_REMOVE_VALUE = 1,
  MULTI_SELECT_TOGGLE_ALL,
  SELECT_CLEAR_ALL,
  SELECT_CONTROL_TOGGLE_MENU,
  SELECT_MENU_WIDTH,
  SELECT_INPUT_BLUR,
  SELECT_INPUT_FOCUS,
  SELECT_INPUT_KEYDOWN,
  SELECT_INPUT_TEXT_CHANGE,
  SELECT_ON_CHANGE,
  SELECT_OUTSIDE_CLICK,
}

const DEBOUNCE_INTERVAL = 300;
const SELECT_CONTROL_THRESHOLD = 6;
// styles
const DROPDOWN_HEIGHT = 239;
const DROPDOWN_MIN_WIDTH = 112;
const DROPDOWN_MAX_WIDTH = 552;
const BORDER_WIDTH = 1;
const APP_GROUP_DROPDOWN_WIDTH = 552;
// Spacing on the parent element
const APP_GROUP_DROPDOWN_OFFSET = 16;
const SEARCH_ICON_COLORS = {
  default: getCurrentTheme().theme.colorOnSurfaceVariant,
};

const SELECT_ALL_CHIP = 'All';
const SELECT_ALL_VALUE = '__ALL__';
const SEARCH_TEST_ID = 'select-search-input';

export const VARIANTS = ['Multi', 'AppGroup'];

export const COMPONENT_NAME = 'Select';
export const IDENTIFIER_KEY = 'value';

export const DEFAULT_FUSE_OPTIONS = {
  keys: [
    'label',
    'title',
    'searchPhrase',
    'value',
    'description',
    'secondaryLabel',
    'tertiaryLabel',
    'quaternaryLabel',
  ],
};

export {
  ACTION_TYPES,
  APP_GROUP_DROPDOWN_OFFSET,
  APP_GROUP_DROPDOWN_WIDTH,
  BORDER_WIDTH,
  DEBOUNCE_INTERVAL,
  DROPDOWN_HEIGHT,
  DROPDOWN_MIN_WIDTH,
  DROPDOWN_MAX_WIDTH,
  SEARCH_ICON_COLORS,
  SEARCH_TEST_ID,
  SELECT_ALL_CHIP,
  SELECT_ALL_VALUE,
  SELECT_CONTROL_THRESHOLD,
};
