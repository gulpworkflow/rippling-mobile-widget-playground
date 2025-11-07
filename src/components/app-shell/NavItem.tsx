import React from 'react';
import styled from '@emotion/styled';
import { getStateColor } from '@rippling/pebble/theme';
import { StyledTheme } from '@/utils/theme';
import Icon from '@rippling/pebble/Icon';
import { NavItemData } from './types';

interface NavItemProps {
  item: NavItemData;
  isCollapsed: boolean;
  theme: StyledTheme;
}

const StyledNavItem = styled.button`
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space100};
  padding-right: ${({ theme }) => (theme as StyledTheme).space200};
  background: none;
  border: none;
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerLg};
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyLarge};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  text-align: left;
  cursor: pointer;
  transition: all 0.1s ease-in-out 0s;
  overflow: hidden;

  &:hover {
    background-color: ${({ theme }) =>
      getStateColor((theme as StyledTheme).colorSurfaceBright, 'hover')};
  }

  &:active {
    background-color: ${({ theme }) =>
      getStateColor((theme as StyledTheme).colorSurfaceBright, 'active')};
  }
`;

const NavItemIcon = styled.div`
  padding: ${({ theme }) => (theme as StyledTheme).space200};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const NavItemText = styled.div<{ isCollapsed: boolean }>`
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: ${({ isCollapsed }) => (isCollapsed ? 0 : 1)};
  transition: opacity 200ms ease;
`;

export const NavItem: React.FC<NavItemProps> = ({ item, isCollapsed, theme }) => {
  return (
    <StyledNavItem theme={theme} onClick={item.onClick}>
      <NavItemIcon theme={theme}>
        <Icon type={item.icon} size={20} color={theme.colorOnSurface} />
      </NavItemIcon>
      <NavItemText theme={theme} isCollapsed={isCollapsed}>
        {item.label}
      </NavItemText>
      {item.hasSubmenu && !isCollapsed && (
        <div style={{ marginLeft: 'auto' }}>
          <Icon type={Icon.TYPES.CHEVRON_RIGHT} size={16} color={theme.colorOnSurface} />
        </div>
      )}
    </StyledNavItem>
  );
};

