import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { usePebbleTheme, StyledTheme } from '@/utils/theme';
import Page from '@rippling/pebble/Page';
import Tabs from '@rippling/pebble/Tabs';
import breakpoints from '@rippling/pebble/Constants/Breakpoints';
import { TopNavBar } from './TopNavBar';
import { Sidebar } from './Sidebar';
import { ExpansionPanel, ExpansionPanelType } from './ExpansionPanel';
import { NavSectionData } from './types';

// Pebble responsive breakpoints
// Below tablet (1025px): persistent sidebar hidden, content goes full-width,
// sidebar becomes a drawer toggled via top-nav hamburger.
const BELOW_TABLET = `@media screen and (max-width: ${breakpoints.BREAKPOINT_TABLET})`;
const BELOW_SMALL_TABLET = `@media screen and (max-width: ${breakpoints.BREAKPOINT_SMALL_TABLET})`;

interface AppShellLayoutProps {
  children: React.ReactNode;

  // Page config
  pageTitle?: string;
  hidePageHeader?: boolean;
  pageTabs?: string[];
  defaultActiveTab?: number;
  onTabChange?: (index: number) => void;
  pageActions?: React.ReactNode;

  // Navigation config
  mainNavSections: NavSectionData[];
  platformNavSection?: NavSectionData;

  // Top nav config
  companyName?: string;
  userInitial?: string;
  searchPlaceholder?: string;
  onLogoClick?: () => void;
  showNotificationBadge?: boolean;
  notificationCount?: number;
  onPersonaSelect?: () => void;
  personaLabel?: string;
  aiPanelRef?: React.MutableRefObject<{ open: () => void } | null>;
  hideAI?: boolean;
}

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  /* On iOS Safari, 100vh is the "large" viewport (extends under the
     translucent bottom toolbar). Using 100dvh here would snap the shell to
     the visible area and cut off content when the toolbar expands/collapses
     — we want the opposite: page content should extend under the floating
     iOS controls so they overlay translucently. */
  background-color: ${({ theme }) => (theme as StyledTheme).colorSurface};
  overflow: hidden;
`;

const OVERLAY_THRESHOLD = 650;

const MainContent = styled.main<{
  sidebarCollapsed: boolean;
  expansionPanelWidth: number;
  isResizing: boolean;
}>`
  position: fixed;
  left: ${({ sidebarCollapsed }) => (sidebarCollapsed ? '60px' : '266px')};
  top: 56px;
  right: ${({ expansionPanelWidth }) =>
    expansionPanelWidth > OVERLAY_THRESHOLD ? 0 : expansionPanelWidth}px;
  /* Size with an explicit height off 100vh (the large iOS viewport) rather
     than anchoring with bottom: 0. iOS Safari resolves bottom: 0 against the
     *visual* viewport (above its translucent toolbar), which clips the last
     rows of content. Using a calc'd height lets the scroll area extend
     behind the toolbar so Safari's controls float over the page. */
  height: calc(100vh - 56px);
  transition: ${({ isResizing }) =>
    isResizing ? 'left 200ms ease' : 'left 200ms ease, right 250ms ease-out'};
  overflow-y: auto;
  overflow-x: hidden;
  /* Pad the scroll area by the home-indicator inset so the final row of
     content can always scroll above the iOS home bar when the user reaches
     the end of the page. */
  padding-bottom: env(safe-area-inset-bottom, 0);

  ${BELOW_TABLET} {
    left: 0;
  }
`;

const Scrim = styled.div<{ $visible: boolean }>`
  position: fixed;
  top: 56px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 89;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  pointer-events: ${({ $visible }) => ($visible ? 'auto' : 'none')};
  transition: opacity 200ms ease;
`;

// Scrim for the mobile nav drawer — slightly higher z-index so it sits above
// page content but below the drawer and top bar.
const MobileNavScrim = styled.div<{ $visible: boolean }>`
  display: none;

  ${BELOW_TABLET} {
    display: block;
    position: fixed;
    top: 56px;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.45);
    z-index: 90;
    opacity: ${({ $visible }) => ($visible ? 1 : 0)};
    pointer-events: ${({ $visible }) => ($visible ? 'auto' : 'none')};
    transition: opacity 200ms ease;
  }
`;

const PageContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100%;
  width: 100%;
`;

const PageHeaderContainer = styled.div`
  background-color: ${({ theme }) => (theme as StyledTheme).colorSurfaceBright};
  border-bottom: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  padding: 0;
  display: flex;
  flex-direction: column;
`;

const PageHeaderWrapper = styled.div`
  padding-left: ${({ theme }) => (theme as StyledTheme).space1400};
  padding-right: ${({ theme }) => (theme as StyledTheme).space1400};

  ${BELOW_TABLET} {
    padding-left: ${({ theme }) => (theme as StyledTheme).space800};
    padding-right: ${({ theme }) => (theme as StyledTheme).space800};
  }

  ${BELOW_SMALL_TABLET} {
    padding-left: ${({ theme }) => (theme as StyledTheme).space400};
    padding-right: ${({ theme }) => (theme as StyledTheme).space400};
  }

  /* Adjust spacing on Page.Header content */
  & > div {
    margin-bottom: 0 !important;
  }

  /* Target the inner Content component */
  & div[class*='Content'] {
    margin-top: ${({ theme }) => (theme as StyledTheme).space1000} !important; /* 40px */
    margin-bottom: ${({ theme }) => (theme as StyledTheme).space200} !important; /* 8px */
  }
`;

const PageHeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space300};
`;

const TabsWrapper = styled.div`
  padding: 0 ${({ theme }) => (theme as StyledTheme).space1400};

  ${BELOW_TABLET} {
    padding: 0 ${({ theme }) => (theme as StyledTheme).space800};
  }

  ${BELOW_SMALL_TABLET} {
    padding: 0 ${({ theme }) => (theme as StyledTheme).space400};
  }

  /* Remove box shadow from tabs */
  & > div,
  & div[class*='StyledScroll'],
  & div[class*='StyledTabContainer'] {
    box-shadow: none !important;
  }
`;

const PageContent = styled.div<{ $flush?: boolean }>`
  background-color: ${({ $flush }) => $flush ? 'transparent' : ({ theme }) => (theme as StyledTheme).colorSurface};
  padding: ${({ $flush, theme }) =>
    $flush ? '0' : `${(theme as StyledTheme).space800} ${(theme as StyledTheme).space1400}`};
  display: flex;
  flex-direction: column;
  gap: ${({ $flush }) => $flush ? '0' : ({ theme }) => (theme as StyledTheme).space600};
  flex: 1;

  ${BELOW_TABLET} {
    padding: ${({ $flush, theme }) =>
      $flush ? '0' : `${(theme as StyledTheme).space600} ${(theme as StyledTheme).space800}`};
  }

  ${BELOW_SMALL_TABLET} {
    padding: ${({ $flush, theme }) =>
      $flush ? '0' : `${(theme as StyledTheme).space400}`};
  }
`;

export const AppShellLayout: React.FC<AppShellLayoutProps> = ({
  children,
  pageTitle,
  hidePageHeader = false,
  pageTabs,
  defaultActiveTab = 0,
  onTabChange,
  pageActions,
  mainNavSections,
  platformNavSection,
  companyName = 'Acme, Inc.',
  userInitial = 'A',
  searchPlaceholder = 'Search or jump to...',
  onLogoClick,
  showNotificationBadge = false,
  notificationCount = 0,
  onPersonaSelect,
  personaLabel,
  aiPanelRef,
  hideAI = false,
}) => {
  const { theme, mode: currentMode } = usePebbleTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [activeTab, setActiveTab] = useState(defaultActiveTab);
  const [adminMode, setAdminMode] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [expansionPanelType, setExpansionPanelType] = useState<ExpansionPanelType>(null);
  const [expansionPanelWidth, setExpansionPanelWidth] = useState(0);
  const [isExpansionPanelResizing, setIsExpansionPanelResizing] = useState(false);

  // Close the mobile nav drawer whenever the viewport grows past the tablet
  // breakpoint so we don't leave an orphaned scrim visible on desktop.
  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${breakpoints.BREAKPOINT_TABLET})`);
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) setMobileNavOpen(false);
    };
    handleChange(mql);
    mql.addEventListener?.('change', handleChange as (e: MediaQueryListEvent) => void);
    return () => {
      mql.removeEventListener?.('change', handleChange as (e: MediaQueryListEvent) => void);
    };
  }, []);

  const handleToggleExpansionPanel = (type: ExpansionPanelType) => {
    if (expansionPanelType === type) {
      setExpansionPanelType(null);
      setExpansionPanelWidth(0);
    } else {
      setExpansionPanelType(type);
    }
  };

  const handleCloseExpansionPanel = () => {
    setExpansionPanelType(null);
    setExpansionPanelWidth(0);
  };

  useEffect(() => {
    if (aiPanelRef) {
      aiPanelRef.current = {
        open: () => handleToggleExpansionPanel('ai'),
      };
    }
  });

  const handleTabChange = (index: number) => {
    setActiveTab(index);
    onTabChange?.(index);
  };

  return (
    <AppContainer theme={theme}>
      {/* Top Navigation */}
      <TopNavBar
        companyName={companyName}
        userInitial={userInitial}
        adminMode={adminMode}
        currentMode={currentMode as 'light' | 'dark'}
        searchPlaceholder={searchPlaceholder}
        onAdminModeToggle={() => setAdminMode(!adminMode)}
        onLogoClick={onLogoClick}
        showNotificationBadge={showNotificationBadge}
        notificationCount={notificationCount}
        onPersonaSelect={onPersonaSelect}
        personaLabel={personaLabel}
        onAiToggle={hideAI ? undefined : () => handleToggleExpansionPanel('ai')}
        aiPanelOpen={expansionPanelType === 'ai'}
        onMenuToggle={() => setMobileNavOpen(open => !open)}
        theme={theme}
      />

      {/* Left Sidebar (persistent on desktop, drawer on mobile) */}
      <Sidebar
        mainSections={mainNavSections}
        platformSection={platformNavSection}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileNavOpen}
        onMobileNavigate={() => setMobileNavOpen(false)}
        theme={theme}
      />

      <MobileNavScrim
        $visible={mobileNavOpen}
        onClick={() => setMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <MainContent
        theme={theme}
        sidebarCollapsed={sidebarCollapsed}
        expansionPanelWidth={expansionPanelWidth}
        isResizing={isExpansionPanelResizing}
      >
        <PageContentContainer theme={theme}>
          {/* Page Header with Actions and Tabs */}
          {!hidePageHeader && (
            <PageHeaderContainer theme={theme}>
              <PageHeaderWrapper theme={theme}>
                <Page.Header
                  title={pageTitle ?? ''}
                  shouldBeUnderlined={false}
                  size={Page.Header.SIZES.FLUID}
                  actions={
                    pageActions ? (
                      <PageHeaderActions theme={theme}>{pageActions}</PageHeaderActions>
                    ) : undefined
                  }
                />
              </PageHeaderWrapper>

              {pageTabs && pageTabs.length > 0 && (
                <TabsWrapper theme={theme}>
                  <Tabs.LINK
                    activeIndex={activeTab}
                    onChange={index => handleTabChange(Number(index))}
                  >
                    {pageTabs.map((tab, index) => (
                      <Tabs.Tab key={`tab-${index}`} title={tab} />
                    ))}
                  </Tabs.LINK>
                </TabsWrapper>
              )}
            </PageHeaderContainer>
          )}

          {/* Page Content */}
          <PageContent theme={theme} $flush={hidePageHeader}>{children}</PageContent>
        </PageContentContainer>
      </MainContent>

      <Scrim
        $visible={expansionPanelWidth > OVERLAY_THRESHOLD}
        onClick={handleCloseExpansionPanel}
      />

      <ExpansionPanel
        isOpen={expansionPanelType !== null}
        panelType={expansionPanelType}
        onClose={handleCloseExpansionPanel}
        onWidthChange={setExpansionPanelWidth}
        onResizingChange={setIsExpansionPanelResizing}
        onSwitchToAI={() => handleToggleExpansionPanel('ai')}
        theme={theme}
      />
    </AppContainer>
  );
};
