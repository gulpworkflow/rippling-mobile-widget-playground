import styled from '@emotion/styled';
import { StyledTheme } from '@/utils/theme';

/**
 * Shared styled components for Composition Manager tabs
 */

export const ContentSlot = styled.div`
  background-color: rgba(205, 74, 53, 0.24);
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerM};
  padding: ${({ theme }) => (theme as StyledTheme).space800};
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 188px;
`;

export const SlotText = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #cd4a35;
  text-align: center;

  & > p:first-of-type {
    ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
    font-weight: 535;
    margin: 0;
  }

  & > p:last-of-type {
    ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
    font-weight: 430;
    margin: 0;
  }
`;

