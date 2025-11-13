import styled from '@emotion/styled';
import { StyledBaseInputContainer, ReadOnlyStyles } from '@rippling/pebble/Inputs/Input.styles';
import ChipStyles from '@rippling/pebble/Chip/Chip.style';
import { BaseItemContainer } from '@rippling/pebble/MenuList/atoms/Styles/BaseItem.styles';
import type { INPUT_SIZES } from '@rippling/pebble/Inputs/Input.constants';

type StyleSelectProps = {
  computedCss?: string;
  isDisabled?: boolean;
  isMenuOpen?: boolean;
};

export const SelectContainer = styled(StyledBaseInputContainer)<StyleSelectProps>`
  cursor: ${props => (props.isDisabled ? 'not-allowed' : 'pointer')};
  display: block;
  height: auto;
  padding: 0;
  position: relative;
  ${props => props.computedCss};
`;

export const ReadOnlyList = styled.div<{ size?: INPUT_SIZES }>`
  ${ReadOnlyStyles};

  ${BaseItemContainer} {
    margin: 0;
    padding-top: 0;
    padding-bottom: 0;
    min-height: unset;

    ${ChipStyles.Container} {
      display: none;
    }
  }
`;
const SelectAllToggleContainer = styled.div`
  border-bottom: ${({ theme }) => `${theme.shapeBorderWidthXs} solid ${theme.colorOutlineVariant}`};
  margin-bottom: ${({ theme }) => theme.space100};
`;

export default {
  SelectContainer,
  ReadOnlyList,
  SelectAllToggleContainer,
};
