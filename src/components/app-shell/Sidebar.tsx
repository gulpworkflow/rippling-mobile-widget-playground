import React from 'react';
import styled from '@emotion/styled';
import { getStateColor } from '@rippling/pebble/theme';
import { StyledTheme } from '@/utils/theme';
import Icon from '@rippling/pebble/Icon';
import { BELOW_MEDIUM } from './responsive';
import { NavSection } from './NavSection';
import { NavSectionData } from './types';

interface SidebarProps {
  mainSections: NavSectionData[];
  platformSection?: NavSectionData;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  /** Whether the sidebar is shown as an overlay at mobile widths */
  mobileOpen?: boolean;
  /** Called when the user clicks a nav item at mobile widths (to close the drawer) */
  onMobileNavigate?: () => void;
  /**
   * Optional slot rendered above the main nav sections. Only displayed
   * when the sidebar is in its expanded state (including mobile drawer);
   * hidden in the collapsed rail to avoid cramped layout.
   */
  topSlot?: React.ReactNode;
  /**
   * When true, suppresses all horizontal rules that appear below the top
   * slot: the inter-section divider line, the border-top on section
   * labels, and the border-top on the collapse button in the footer.
   * Useful for variants whose top slot already supplies a section-
   * scoping divider (e.g. Tabs.LINK's underline).
   */
  hideDividers?: boolean;
  /**
   * Width (in pixels) of the sidebar in its expanded state. Defaults to
   * 266. Applied to the desktop rail width and the mobile drawer width.
   */
  expandedWidth?: number;
  theme: StyledTheme;
}

const StyledSidebar = styled.aside<{
  isCollapsed: boolean;
  mobileOpen: boolean;
  expandedWidth: number;
}>`
  position: fixed;
  left: 0;
  top: 56px;
  bottom: 0;
  width: ${({ isCollapsed, expandedWidth }) =>
    isCollapsed ? '60px' : `${expandedWidth}px`};
  background-color: ${({ theme }) => (theme as StyledTheme).colorSurfaceBright};
  border-right: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  z-index: 95;
  overflow-y: auto;
  overflow-x: hidden;
  transition: width 200ms ease, transform 220ms ease;

  ${BELOW_MEDIUM} {
    width: ${({ expandedWidth }) => `${expandedWidth}px`};
    transform: translateX(${({ mobileOpen }) => (mobileOpen ? '0' : '-100%')});
    box-shadow: ${({ mobileOpen }) =>
      mobileOpen ? '0 8px 24px rgba(0, 0, 0, 0.18)' : 'none'};
  }

  /* Notion-style scrollbar: invisible at rest, reveals on hover or while
     actively scrolling. Space for the thumb is reserved only where Webkit
     naturally lays it over content, so no layout jumps between states. */
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
  transition: scrollbar-color 200ms ease;

  &:hover,
  &:focus-within {
    scrollbar-color: ${({ theme }) => (theme as StyledTheme).colorOutlineVariant}
      transparent;
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 3px;
    transition: background-color 200ms ease;
  }

  &:hover::-webkit-scrollbar-thumb,
  &:focus-within::-webkit-scrollbar-thumb {
    background: ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => (theme as StyledTheme).colorOutline};
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

const CollapseButton = styled.button<{ isCollapsed: boolean; hideDivider: boolean }>`
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space100};
  padding-right: ${({ theme }) => (theme as StyledTheme).space250};
  padding-left: 0;
  background: none;
  border: none;
  border-top: ${({ hideDivider, theme }) =>
    hideDivider ? 'none' : `1px solid ${(theme as StyledTheme).colorOutlineVariant}`};
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

  ${BELOW_MEDIUM} {
    display: none;
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
    `0 ${(theme as StyledTheme).space200} 0`};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => (theme as StyledTheme).space50};
`;

const TopSlotWrapper = styled.div`
  width: 100%;
  flex-shrink: 0;
`;

export const Sidebar: React.FC<SidebarProps> = ({
  mainSections,
  platformSection,
  isCollapsed,
  onToggleCollapse,
  mobileOpen = false,
  onMobileNavigate,
  topSlot,
  hideDividers = false,
  expandedWidth = 266,
  theme,
}) => {
  // At mobile widths the sidebar is a drawer: always show the expanded
  // layout (labels visible) while open, and close on item tap.
  const effectiveCollapsed = mobileOpen ? false : isCollapsed;

  const handleNavClick: React.MouseEventHandler<HTMLDivElement> = () => {
    onMobileNavigate?.();
  };

  return (
    <StyledSidebar
      theme={theme}
      isCollapsed={isCollapsed}
      mobileOpen={mobileOpen}
      expandedWidth={expandedWidth}
      onClick={handleNavClick}
    >
      <div>
        {topSlot && !effectiveCollapsed && (
          <TopSlotWrapper>{topSlot}</TopSlotWrapper>
        )}
        {/* Main Navigation Sections */}
        {mainSections.map((section, index) => (
          <React.Fragment key={`main-section-${index}`}>
            <NavSection
              section={section}
              isCollapsed={effectiveCollapsed}
              theme={theme}
              hideLabelDivider={hideDividers}
            />
            {/* Add divider after first section if it has no label */}
            {!hideDividers && index === 0 && !section.label && mainSections.length > 1 && (
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
            isCollapsed={effectiveCollapsed}
            theme={theme}
            hideLabelDivider={hideDividers}
          />
        )}
      </div>

      <PlatformFooter theme={theme}>
        <CollapseButton
          theme={theme}
          isCollapsed={isCollapsed}
          hideDivider={hideDividers}
          onClick={(e) => {
            e.stopPropagation();
            onToggleCollapse();
          }}
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

