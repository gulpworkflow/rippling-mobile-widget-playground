import React, { useState } from 'react';
import styled from '@emotion/styled';
import { usePebbleTheme, StyledTheme } from '@/utils/theme';
import Page from '@rippling/pebble/Page';
import Tabs from '@rippling/pebble/Tabs';
import { TopNavBar } from './TopNavBar';
import { Sidebar } from './Sidebar';
import { NavSectionData } from './types';

interface AppShellLayoutProps {
  children: React.ReactNode;

  // Page config
  pageTitle: string;
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
}

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: ${({ theme }) => (theme as StyledTheme).colorSurface};
  overflow: hidden;
`;

const MainContent = styled.main<{ sidebarCollapsed: boolean }>`
  position: fixed;
  left: ${({ sidebarCollapsed }) => (sidebarCollapsed ? '60px' : '266px')};
  top: 56px;
  right: 0;
  bottom: 0;
  transition: left 200ms ease;
  overflow-y: auto;
  overflow-x: hidden;
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

  /* Remove box shadow from tabs */
  & > div,
  & div[class*='StyledScroll'],
  & div[class*='StyledTabContainer'] {
    box-shadow: none !important;
  }
`;

const PageContent = styled.div`
  background-color: ${({ theme }) => (theme as StyledTheme).colorSurface};
  padding: ${({ theme }) =>
    `${(theme as StyledTheme).space800} ${(theme as StyledTheme).space1400}`};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => (theme as StyledTheme).space600};
  flex: 1;
`;

export const AppShellLayout: React.FC<AppShellLayoutProps> = ({
  children,
  pageTitle,
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
}) => {
  const { theme, mode: currentMode } = usePebbleTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultActiveTab);
  const [adminMode, setAdminMode] = useState(false);

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
        theme={theme}
      />

      {/* Left Sidebar */}
      <Sidebar
        mainSections={mainNavSections}
        platformSection={platformNavSection}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        theme={theme}
      />

      {/* Main Content Area */}
      <MainContent theme={theme} sidebarCollapsed={sidebarCollapsed}>
        <PageContentContainer theme={theme}>
          {/* Page Header with Actions and Tabs */}
          <PageHeaderContainer theme={theme}>
            <PageHeaderWrapper theme={theme}>
              <Page.Header
                title={pageTitle}
                shouldBeUnderlined={false}
                size={Page.Header.SIZES.FLUID}
                actions={
                  pageActions ? (
                    <PageHeaderActions theme={theme}>{pageActions}</PageHeaderActions>
                  ) : undefined
                }
              />
            </PageHeaderWrapper>

            {/* Tabs integrated in header */}
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

          {/* Page Content */}
          <PageContent theme={theme}>{children}</PageContent>
        </PageContentContainer>
      </MainContent>
    </AppContainer>
  );
};
