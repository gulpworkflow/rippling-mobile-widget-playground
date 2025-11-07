import { INPUT_SIZES } from '@rippling/pebble/Inputs/Input.constants';
import type { SelectMenuProps } from './SelectMenu.types';

export function getIfMenuListCompact(props: Pick<SelectMenuProps, 'size'>) {
  const { size } = props;
  switch (size) {
    case INPUT_SIZES.XS:
    case INPUT_SIZES.S:
      return true;
    default:
      return false;
  }
}
