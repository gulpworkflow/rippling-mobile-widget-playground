import React from 'react';
import styled from '@emotion/styled';
import { StyledTheme } from '@/utils/theme';
import { NavItem } from './NavItem';
import { NavSectionData } from './types';

interface NavSectionProps {
  section: NavSectionData;
  isCollapsed: boolean;
  theme: StyledTheme;
  showDividerBefore?: boolean;
  /**
   * When true, the 1px top border on the section label is suppressed.
   * Used by variants that render their own custom dividers (or no
   * dividers at all) in the sidebar.
   */
  hideLabelDivider?: boolean;
}

const StyledNavSection = styled.div`
  padding: ${({ theme }) =>
    `${(theme as StyledTheme).space250} ${(theme as StyledTheme).space200} 0`};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => (theme as StyledTheme).space50};
`;

const NavSectionLabel = styled.div<{ isCollapsed: boolean; hideDivider: boolean }>`
  ${({ theme }) => (theme as StyledTheme).typestyleLabelMedium700};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  padding: ${({ theme }) =>
    `0 ${(theme as StyledTheme).space200} ${(theme as StyledTheme).space100}`};
  text-transform: uppercase;
  letter-spacing: 1.5px;
  border-top: ${({ hideDivider, theme }) =>
    hideDivider ? 'none' : `1px solid ${(theme as StyledTheme).colorOutlineVariant}`};
  height: 31px;
  display: flex;
  align-items: flex-end;
  opacity: ${({ isCollapsed }) => (isCollapsed ? 0 : 1)};
  transition: opacity 200ms ease;
  white-space: nowrap;
  overflow: hidden;
`;

export const NavSection: React.FC<NavSectionProps> = ({ 
  section, 
  isCollapsed, 
  theme,
  showDividerBefore = false,
  hideLabelDivider = false,
}) => {
  return (
    <StyledNavSection theme={theme}>
      {section.label && (
        <NavSectionLabel theme={theme} isCollapsed={isCollapsed} hideDivider={hideLabelDivider}>
          {section.label}
        </NavSectionLabel>
      )}
      {section.items.map(item => (
        <NavItem key={item.id} item={item} isCollapsed={isCollapsed} theme={theme} />
      ))}
    </StyledNavSection>
  );
};

