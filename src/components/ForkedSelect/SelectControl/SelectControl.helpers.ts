import type { SelectControlProps } from './SelectControl.types';
import { INPUT_SIZES } from '@rippling/pebble/Inputs/Input.constants';
import Country from '@rippling/pebble/Atoms/Country';
import Chip from '@rippling/pebble/Chip';
import type { Theme } from '@rippling/pebble/theme';

/* istanbul ignore next */
export const getAvatarSizeFromInputSize = (
  props: Pick<SelectControlProps, 'size'> & { theme: Theme },
) => {
  const { size, theme } = props;

  switch (size) {
    case INPUT_SIZES.XS:
    case INPUT_SIZES.S:
      // @ts-expect-error  TODO: migrate core token to alias - don't add further usage of this token
      return theme.size500;
    default:
      // @ts-expect-error  TODO: migrate core token to alias - don't add further usage of this token
      return theme.size600;
  }
};

/* istanbul ignore next */
export const getChipSizeFromInputSize = (props: Pick<SelectControlProps, 'size'>) => {
  const { size } = props;

  switch (size) {
    case INPUT_SIZES.XS:
      return Chip.SIZES.S;
    case INPUT_SIZES.S:
      return Chip.SIZES.M;
    default:
      return Chip.SIZES.L;
  }
};

/* istanbul ignore next */
export const getFlagDimensionsFromInputSize = (props: Pick<SelectControlProps, 'size'>) => {
  const { size } = props;

  switch (size) {
    case INPUT_SIZES.XS:
    case INPUT_SIZES.S:
      return Country.SIZES.S;
    default:
      return Country.SIZES.M;
  }
};

/* istanbul ignore next */
export const getSearchIconSizeFromInputSize = (
  props: Pick<SelectControlProps, 'size'> & { theme: Theme },
) => {
  const { size, theme } = props;

  switch (size) {
    case INPUT_SIZES.XS:
      return theme.sizeIcon3xs;
    case INPUT_SIZES.S:
      return theme.sizeIcon2xs;
    default:
      return theme.sizeIconXs;
  }
};

/* istanbul ignore next */
export const getTagsContainerVerticalPaddingFromInputize = (
  props: Pick<SelectControlProps, 'size'> & { theme: Theme },
) => {
  const { size, theme } = props;
  switch (size) {
    case INPUT_SIZES.L:
      return theme.space300;
    case INPUT_SIZES.M:
      return theme.space200;
    case INPUT_SIZES.S:
      return theme.space150;
    case INPUT_SIZES.XS:
      return theme.space100;
    default:
      return theme.space200;
  }
};

/* istanbul ignore next */
export const getButtonAffixTopPaddingFromInputSize = (
  props: Pick<SelectControlProps, 'size' | 'isMulti'> & {
    theme: Theme;
  },
) => {
  const { size, theme, isMulti } = props;

  if (!isMulti) {
    // center aligned when single select so no need of padding
    return theme.space0;
  }

  let paddingTop: string;

  switch (size) {
    case INPUT_SIZES.L:
    case INPUT_SIZES.M:
      paddingTop = theme.space200;
      break;
    case INPUT_SIZES.S:
      paddingTop = theme.space100;
      break;
    case INPUT_SIZES.XS:
      paddingTop = theme.space0;
      break;
    default:
      paddingTop = theme.space200;
  }

  // eslint-disable-next-line rippling-eslint/no-hard-coded-strings
  return `calc(${paddingTop} - ${theme.shapeBorderWidthXs})`; // Remove this 'calc' expression when move from border to outline
};

/* istanbul ignore next */
export const getIconAffixTopPaddingFromInputSize = (
  props: Pick<SelectControlProps, 'size' | 'isMulti'> & {
    theme: Theme;
  },
) => {
  const { size, theme, isMulti } = props;

  if (!isMulti) {
    // center aligned when single select so no need of padding
    return theme.space0;
  }

  let paddingTop: string;

  switch (size) {
    case INPUT_SIZES.L:
      paddingTop = theme.space350;
      break;
    case INPUT_SIZES.M:
      paddingTop = theme.space250;
      break;
    case INPUT_SIZES.S:
      paddingTop = theme.space200;
      break;
    case INPUT_SIZES.XS:
      paddingTop = theme.space150;
      break;
    default:
      paddingTop = theme.space250;
  }

  // eslint-disable-next-line rippling-eslint/no-hard-coded-strings
  return `calc(${paddingTop} - ${theme.shapeBorderWidthXs})`; // Remove this 'calc' expression when move from border to outline
};

/* istanbul ignore next */
export const getLeftIconSizeFromInputSize = (
  props: Pick<SelectControlProps, 'size'> & { theme: Theme },
) => {
  const { size, theme } = props;

  switch (size) {
    case INPUT_SIZES.XS:
      return theme.sizeIcon2xs;
    case INPUT_SIZES.S:
      return theme.sizeIcon2xs;
    default:
      return theme.sizeIconXs;
  }
};

/* istanbul ignore next */
export const getHorizontalPaddingFromInputSize = (
  props: Pick<SelectControlProps, 'size'> & { theme: Theme },
) => {
  const { size, theme } = props;

  switch (size) {
    case INPUT_SIZES.L:
    case INPUT_SIZES.M:
      return theme.space400;
    case INPUT_SIZES.S:
      return theme.space300;
    case INPUT_SIZES.XS:
      return theme.space200;
    default:
      return theme.space400;
  }
};

/* istanbul ignore next */
export const getMaxHeightFromSize = (
  props: Pick<SelectControlProps, 'size'> & { theme: Theme },
) => {
  const { size, theme } = props;

  switch (size) {
    case INPUT_SIZES.S:
      // @ts-expect-error  TODO: migrate core token to alias - don't add further usage of this token
      return theme.size1600;
    case INPUT_SIZES.XS:
      // @ts-expect-error  TODO: migrate core token to alias - don't add further usage of this token
      return theme.size1400;
    default:
      // @ts-expect-error  TODO: migrate core token to alias - don't add further usage of this token
      return theme.size2000;
  }
};
