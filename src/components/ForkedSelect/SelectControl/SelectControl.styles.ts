import styled from '@emotion/styled';
import { getShowScrollbarAlwaysStyle } from '@rippling/pebble/emotionUtilities';
import { ellipsisStyle } from '@rippling/pebble/Typography';
import { getHeightFromSize } from '@rippling/pebble/Inputs/Input.helpers';
import { INPUT_SIZES } from '@rippling/pebble/Inputs/Input.constants';
import AvatarStyles from '@rippling/pebble/Avatar/Avatar.styles';
import {
  getAvatarSizeFromInputSize,
  getMaxHeightFromSize,
  getHorizontalPaddingFromInputSize,
  getTagsContainerVerticalPaddingFromInputize,
  getIconAffixTopPaddingFromInputSize,
} from './SelectControl.helpers';
import type { Theme } from '@rippling/pebble/theme';
import type { SelectControlProps } from './SelectControl.types';

export interface StyleProps {
  hasSearchIcon?: boolean;
  isAppGroup?: boolean;
  isDisabled?: boolean;
  isMenuOpen?: boolean;
  isMulti?: boolean;
  isSearchable?: boolean;
  computedCss?: string;
  rows?: number;
  isThemeV2?: boolean;
  size?: INPUT_SIZES;
  maxHeight?: React.CSSProperties['maxHeight'] | number;
}

const SearchIconContainer = styled.span<Pick<SelectControlProps, 'size' | 'isMulti'>>`
  padding-top: ${getIconAffixTopPaddingFromInputSize};
  align-self: start;
  display: inline-flex;
  justify-content: center;
`;

type TagsContainerProps = {
  maxHeight?: React.CSSProperties['maxHeight'];
  isMulti?: boolean;
  size?: INPUT_SIZES;
  theme: Theme;
};

const getSanitizedMaxHeight = (maxHeight: TagsContainerProps['maxHeight']) => {
  return typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight;
};

const getMaxHeightStyle = ({ maxHeight, theme, size, isMulti }: TagsContainerProps) => {
  if (!isMulti) {
    return '';
  }
  const sanitizedMaxHeight = getSanitizedMaxHeight(maxHeight);
  const maxHeightFinal = sanitizedMaxHeight || getMaxHeightFromSize({ size, theme });
  return `
  overflow: auto;
  max-height: ${maxHeightFinal};
  `;
};

const TagsContainer = styled.div<Omit<TagsContainerProps, 'theme'>>`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  flex: 1 1 0;
  outline: none;
  padding: ${props =>
    `calc(${getTagsContainerVerticalPaddingFromInputize(props)} - ${
      props.theme?.shapeBorderWidthXs
    }*2) ${props.theme.space0}`};
  max-width: 100%;
  gap: ${({ theme }) => theme.space100};
`;

const selectLeftSectionStyles = `
  ${ellipsisStyle};
`;

const searchSelectLeftSectionStyles = `
  align-items: flex-start;
  display: flex;
  flex: 1;
`;

const MiddleSection = styled.div<Pick<StyleProps, 'maxHeight' | 'size' | 'isMulti'>>`
  overflow: hidden;
  max-width: 100%;
  ${getMaxHeightStyle}
  ${getShowScrollbarAlwaysStyle()}
  align-self: center;
  align-items: center;
  flex: 1;
`;

const LeftSection = styled.div<Pick<SelectControlProps, 'isMulti' | 'size'>>`
  display: flex;
  align-self: ${({ isMulti }) => (isMulti ? 'flex-start' : 'center')};
`;

const NonSearchActionElement = styled.div`
  outline: none;
  display: flex;
  align-items: center;
`;

const Container = styled.div<StyleProps>`
  display: flex;
  align-self: flex-start;

  align-items: ${({ isMulti }) => (isMulti ? 'flex-start' : 'center')};

  min-height: calc(${getHeightFromSize} - ${({ theme }) => theme.shapeBorderWidthXs} * 2);
  max-height: ${({ maxHeight, size, theme }) =>
    maxHeight ? getSanitizedMaxHeight(maxHeight) : getMaxHeightFromSize({ size, theme })};
  overflow-y: hidden;

  padding: ${props => `${props.theme.space0} ${getHorizontalPaddingFromInputSize(props)}`};

  ${({ theme, isMulti }) =>
    !isMulti
      ? `
      /* No vertical padding required when not multi since content is center aligned */
      padding-top: ${theme.space0};
      padding-bottom: ${theme.space0};
    `
      : ''}

  gap: ${({ theme }) => theme.space100};

  ${MiddleSection} {
    ${props => (props.isSearchable ? searchSelectLeftSectionStyles : selectLeftSectionStyles)};
  }

  ${({ computedCss }) => computedCss}
`;

const LeftAssetContainer = styled.div`
  display: inline-flex;
  margin-right: ${({ theme }) => theme.space100};
`;

const DefaultWrapper = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
`;

const AvatarContainer = styled.div<{ size?: INPUT_SIZES }>`
  height: ${getAvatarSizeFromInputSize};
  width: ${getAvatarSizeFromInputSize};

  ${AvatarStyles.Container} {
    height: 100%;
    width: 100%;
  }

  ${AvatarStyles.Avatar} {
    height: 100%;
    width: 100%;
  }
`;

const CollapseIconContainer = styled.div<
  Pick<SelectControlProps, 'size' | 'isMulti'> & { isRotated?: boolean }
>`
  display: inline-flex;
  ${({ size, isMulti, theme }) =>
    isMulti && size === INPUT_SIZES.XS ? `margin-top: -${theme.space50};` : ''}
  padding-top: ${getIconAffixTopPaddingFromInputSize};

  /* Add rotation transition and transform */
  transition: transform 150ms ease-out;
  transform: ${({ isRotated }) => (isRotated ? 'rotate(180deg)' : 'rotate(0deg)')};
  transform-origin: center;
`;

export default {
  AvatarContainer,
  CollapseIconContainer,
  Container,
  SearchIconContainer,
  NonSearchActionElement,
  LeftSection,
  MiddleSection,
  TagsContainer,
  LeftAssetContainer,
  DefaultWrapper,
};
