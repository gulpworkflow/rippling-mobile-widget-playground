import type { BaseSelectProps } from '../BaseSelect';
import type { TextRefObject } from '@rippling/pebble/Text';
import type { ACTION_TYPES } from '../Select.constants';
import type { INPUT_SIZES } from '@rippling/pebble/Inputs/Input.constants';

type ActionHandler = (action: { type: ACTION_TYPES; payload?: unknown }) => void;

export type SelectControlProps = Pick<
  BaseSelectProps,
  | 'areAllItemsSelected'
  | 'canClear'
  | 'inputValue'
  | 'isAppGroup'
  | 'isDisabled'
  | 'isMulti'
  | 'isSearchable'
  | 'maxHeight'
  | 'onBlur'
  | 'onFocus'
  | 'placeholder'
  | 'rows'
  | 'selectedOptionLabelRenderer'
  | 'selectedOptions'
  | 'shouldShowSearchIcon'
  | 'onInputChange'
  | 'selectedOptionsModalClassName'
> & {
  isMenuOpen: boolean;
  onAction: ActionHandler;
  popperRef?: React.Ref<any>;
  ariaProps?: React.HTMLAttributes<HTMLElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  innerRef: React.RefObject<TextRefObject>;
  prefixIconColor: string;
  size?: INPUT_SIZES;
  computedCss?: string;
};
