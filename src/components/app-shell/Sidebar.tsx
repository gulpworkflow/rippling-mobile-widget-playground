import React from 'react';
import styled from '@emotion/styled';
import { getStateColor } from '@rippling/pebble/theme';
import { StyledTheme } from '@/utils/theme';
import Icon from '@rippling/pebble/Icon';
import { NavSection } from './NavSection';
import { NavSectionData } from './types';

interface SidebarProps {
  mainSections: NavSectionData[];
  platformSection?: NavSectionData;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  theme: StyledTheme;
}

const StyledSidebar = styled.aside<{ isCollapsed: boolean }>`
  position: fixed;
  left: 0;
  top: 56px;
  bottom: 0;
  width: ${({ isCollapsed }) => (isCollapsed ? '60px' : '266px')};
  background-color: ${({ theme }) => (theme as StyledTheme).colorSurfaceBright};
  border-right: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  z-index: 50;
  overflow-y: auto;
  overflow-x: hidden;
  transition: width 200ms ease;

  /* Hide scrollbar for Webkit browsers */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
    border-radius: 3px;
  }
`;

const NavDivider = styled.div`
  height: ${({ theme }) => (theme as StyledTheme).space600};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 ${({ theme }) => (theme as StyledTheme).space50};
  width: 100%;
  flex-shrink: 0;
`;

const NavDividerLine = styled.div`
  flex: 1;
  height: 1px;
  background-color: ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
`;

const PlatformFooter = styled.div`
  background-color: ${({ theme }) => (theme as StyledTheme).colorSurfaceBright};
  padding: 0 0 ${({ theme }) => (theme as StyledTheme).space200};
`;

const CollapseButton = styled.button<{ isCollapsed: boolean }>`
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space100};
  padding-right: ${({ theme }) => (theme as StyledTheme).space250};
  padding-left: 0;
  background: none;
  border: none;
  border-top: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerLg};
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyLarge};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  cursor: pointer;
  transition: all 0.1s ease-in-out 0s;
  margin-top: ${({ theme }) => (theme as StyledTheme).space200};

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

const NavSectionsWrapper = styled.div`
  padding: ${({ theme }) =>
    `${(theme as StyledTheme).space250} ${(theme as StyledTheme).space200} 0`};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => (theme as StyledTheme).space50};
`;

export const Sidebar: React.FC<SidebarProps> = ({
  mainSections,
  platformSection,
  isCollapsed,
  onToggleCollapse,
  theme,
}) => {
  return (
    <StyledSidebar theme={theme} isCollapsed={isCollapsed}>
      <div>
        {/* Main Navigation Sections */}
        {mainSections.map((section, index) => (
          <React.Fragment key={`main-section-${index}`}>
            <NavSection 
              section={section} 
              isCollapsed={isCollapsed} 
              theme={theme} 
            />
            {/* Add divider after first section if it has no label */}
            {index === 0 && !section.label && mainSections.length > 1 && (
              <NavSectionsWrapper theme={theme}>
                <NavDivider theme={theme}>
                  <NavDividerLine theme={theme} />
                </NavDivider>
              </NavSectionsWrapper>
            )}
          </React.Fragment>
        ))}

        {/* Platform Section */}
        {platformSection && (
          <NavSection 
            section={platformSection} 
            isCollapsed={isCollapsed} 
            theme={theme} 
          />
        )}
      </div>

      <PlatformFooter theme={theme}>
        <CollapseButton
          theme={theme}
          isCollapsed={isCollapsed}
          onClick={onToggleCollapse}
        >
          <NavItemIcon theme={theme}>
            <Icon type={Icon.TYPES.THUMBTACK_OUTLINE} size={20} color={theme.colorOnSurface} />
          </NavItemIcon>
          <NavItemText theme={theme} isCollapsed={isCollapsed}>
            Collapse panel
          </NavItemText>
        </CollapseButton>
      </PlatformFooter>
    </StyledSidebar>
  );
};

