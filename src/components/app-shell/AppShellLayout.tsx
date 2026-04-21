import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { usePebbleTheme, StyledTheme } from '@/utils/theme';
import Page from '@rippling/pebble/Page';
import Tabs from '@rippling/pebble/Tabs';
import { TopNavBar } from './TopNavBar';
import { Sidebar } from './Sidebar';
import { ExpansionPanel, ExpansionPanelType } from './ExpansionPanel';
import { NavSectionData } from './types';
import { BELOW_MEDIUM, BELOW_SMALL, BREAKPOINT_MEDIUM } from './responsive';

// Pebble responsive design-system breakpoints:
// - Medium (768px) is where the persistent sidebar converts to a drawer and
//   content goes full-width.
// - Small (576px) is where the compact nav + tightest mobile rhythm kicks in.

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

const OVERLAY_THRESHOLD = 650;

/*
 * Layout model: the document is the scroll container.
 *
 * Rather than build a fixed-height app shell with an absolutely-positioned
 * scroll area inside it (which constantly fights iOS Safari's dynamic
 * toolbar and causes the bottom-row clipping we kept chasing), we use
 * the natural document flow:
 *
 *   - TopNavBar, Sidebar, and ExpansionPanel are each position: fixed
 *     and live in their own layer. They don't participate in the flow.
 *   - AppContainer is just a block. It reserves room for those fixed
 *     chrome elements via padding:
 *         padding-top:    56px           (TopNavBar height)
 *         padding-left:   sidebar width  (0 at Medium and below)
 *         padding-right:  panel width    (0 when panel is in overlay mode)
 *   - The page content lives inside in normal flow and scrolls with
 *     the document. iOS Safari handles its toolbar show/hide natively
 *     in this model, so there is no clipping to work around.
 */
const AppContainer = styled.div<{
  sidebarCollapsed: boolean;
  expansionPanelWidth: number;
  isResizing: boolean;
}>`
  min-height: 100dvh;
  background-color: ${({ theme }) => (theme as StyledTheme).colorSurface};
  padding-top: 56px;
  padding-left: ${({ sidebarCollapsed }) => (sidebarCollapsed ? '60px' : '266px')};
  padding-right: ${({ expansionPanelWidth }) =>
    expansionPanelWidth > OVERLAY_THRESHOLD ? 0 : expansionPanelWidth}px;
  transition: ${({ isResizing }) =>
    isResizing
      ? 'padding-left 200ms ease'
      : 'padding-left 200ms ease, padding-right 250ms ease-out'};

  ${BELOW_MEDIUM} {
    padding-left: 0;
  }
`;

const MainContent = styled.main`
  display: flex;
  flex-direction: column;
  min-height: calc(100dvh - 56px);
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

  ${BELOW_MEDIUM} {
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

  ${BELOW_MEDIUM} {
    padding-left: ${({ theme }) => (theme as StyledTheme).space800};
    padding-right: ${({ theme }) => (theme as StyledTheme).space800};
  }

  ${BELOW_SMALL} {
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

  ${BELOW_MEDIUM} {
    padding: 0 ${({ theme }) => (theme as StyledTheme).space800};
  }

  ${BELOW_SMALL} {
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
  display: flex;
  flex-direction: column;
  gap: ${({ $flush }) => $flush ? '0' : ({ theme }) => (theme as StyledTheme).space600};
  flex: 1;

  /* 56px horizontal gutter above Small (576px) to match Rippling's main
     app. Vertical padding still honors $flush: pages that manage their
     own top/bottom spacing (hidePageHeader) opt out with 0 vertical. */
  padding: ${({ $flush, theme }) =>
    $flush
      ? `0 ${(theme as StyledTheme).space1400}`
      : `${(theme as StyledTheme).space800} ${(theme as StyledTheme).space1400}`};

  /* Between Small (576px) and Medium (768px), step the horizontal gutter
     down from 56px to 32px so tablets and landscape phones get a more
     comfortable content width without feeling cramped. */
  ${BELOW_MEDIUM} {
    padding: ${({ $flush, theme }) =>
      $flush
        ? `0 ${(theme as StyledTheme).space800}`
        : `${(theme as StyledTheme).space600} ${(theme as StyledTheme).space800}`};
  }

  /* Mobile drops the gutter entirely — pages handle their own edge-to-edge
     layout below Small. */
  ${BELOW_SMALL} {
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

  // Close the mobile nav drawer whenever the viewport grows past the Medium
  // breakpoint so we don't leave an orphaned scrim visible on desktop.
  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${BREAKPOINT_MEDIUM})`);
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
    <AppContainer
      theme={theme}
      sidebarCollapsed={sidebarCollapsed}
      expansionPanelWidth={expansionPanelWidth}
      isResizing={isExpansionPanelResizing}
    >
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

      {/* Main Content Area — plain document-flow block; the document
          itself is the scroll container. */}
      <MainContent theme={theme}>
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
