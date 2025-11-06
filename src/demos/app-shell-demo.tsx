import React, { useState } from 'react';
import styled from '@emotion/styled';
import { useThemeSettings, getStateColor } from '@rippling/pebble/theme';
import { usePebbleTheme, StyledTheme } from '../utils/theme';
import Icon from '@rippling/pebble/Icon';
import Button from '@rippling/pebble/Button';
import Tabs from '@rippling/pebble/Tabs';
import Page from '@rippling/pebble/Page';
import Dropdown from '@rippling/pebble/Dropdown';
import RipplingLogoBlack from '../assets/rippling-logo-black.svg';
import RipplingLogoWhite from '../assets/rippling-logo-white.svg';

/**
 * App Shell Demo
 *
 * Recreates Rippling's main application shell with:
 * - Top navigation bar
 * - Left sidebar navigation
 * - Main content area
 *
 * Based on the actual Rippling product UI structure.
 */

const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: ${({ theme }) => (theme as StyledTheme).colorSurface};
  overflow: hidden;
`;

const TopNav = styled.nav<{ adminMode: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background-color: ${({ theme, adminMode }) =>
    adminMode ? 'rgb(74, 0, 57)' : (theme as StyledTheme).colorSurfaceBright};
  border-bottom: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  display: flex;
  align-items: center;
  padding: 0;
  z-index: 100;
  gap: ${({ theme }) => (theme as StyledTheme).space500};
  transition: background-color 200ms ease;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  width: 266px;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space400};
  height: 56px;
  padding: 0 ${({ theme }) => (theme as StyledTheme).space400};
  flex: 1;
`;

const Logo = styled.img`
  width: 127px;
  height: auto;
  display: block;
  cursor: pointer;
  padding: ${({ theme }) => (theme as StyledTheme).space200};
  margin: -${({ theme }) => (theme as StyledTheme).space200};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerLg};
  transition: background-color 150ms ease;

  &:hover {
    background-color: ${({ theme }) =>
      getStateColor((theme as StyledTheme).colorSurfaceBright, 'hover')};
  }

  &:active {
    background-color: ${({ theme }) =>
      getStateColor((theme as StyledTheme).colorSurfaceBright, 'active')};
  }
`;

const VerticalDivider = styled.div<{ adminMode?: boolean }>`
  width: 1px;
  height: 24px;
  background-color: ${({ theme, adminMode }) =>
    adminMode ? 'white' : (theme as StyledTheme).colorOnSurface};
  opacity: ${({ adminMode }) => (adminMode ? 0.3 : 0.2)};
`;

const RightSection = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
`;

const SearchBar = styled.div<{ adminMode?: boolean }>`
  flex: 1;
  max-width: 600px;
  background-color: ${({ theme, adminMode }) =>
    adminMode ? 'rgba(255, 255, 255, 0.2)' : (theme as StyledTheme).colorSurfaceContainerHighest};
  opacity: 0.75;
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerLg};
  padding: ${({ theme }) =>
    `${(theme as StyledTheme).space200} ${(theme as StyledTheme).space300}`};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
  transition:
    opacity 0.15s ease,
    background-color 200ms ease;

  &:focus-within {
    opacity: 1;
  }

  input {
    flex: 1;
    background: transparent;
    border: none;
    ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
    color: ${({ adminMode }) =>
      adminMode ? 'white' : ({ theme }) => (theme as StyledTheme).colorOnSurface};
    padding: 0;

    &::placeholder {
      color: ${({ adminMode }) =>
        adminMode ? 'white' : ({ theme }) => (theme as StyledTheme).colorOnSurface};
    }

    &:focus {
      outline: none;
    }
  }
`;

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 0 ${({ theme }) => (theme as StyledTheme).space400};
`;

const TopNavActions = styled.div<{ adminMode?: boolean }>`
  display: flex;
  align-items: center;

  button {
    position: relative;
  }

  ${({ adminMode }) =>
    adminMode &&
    `
    button svg,
    button i,
    button [class*="Icon"] {
      color: white !important;
      fill: white !important;
    }
  `}
`;

const NotificationBadge = styled.div`
  position: absolute;
  top: 6px;
  right: 6px;
  width: 16px;
  height: 16px;
  background-color: ${({ theme }) => (theme as StyledTheme).colorError};
  border-radius: 50%;
  border: 2px solid ${({ theme }) => (theme as StyledTheme).colorSurfaceBright};
  font-size: 10px;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`;

const ProfileDivider = styled.div`
  padding: ${({ theme }) =>
    `0 ${(theme as StyledTheme).space300} 0 ${(theme as StyledTheme).space400}`};
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space300};
  padding: ${({ theme }) => (theme as StyledTheme).space200};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerLg};
  cursor: pointer;
  transition: background-color 150ms ease;

  &:hover {
    background-color: ${({ theme }) =>
      getStateColor((theme as StyledTheme).colorSurfaceBright, 'hover')};
  }

  &:active {
    background-color: ${({ theme }) =>
      getStateColor((theme as StyledTheme).colorSurfaceBright, 'active')};
  }
`;

const CompanyName = styled.div<{ adminMode?: boolean }>`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyLargeEmphasized};
  color: ${({ theme, adminMode }) => (adminMode ? 'white' : (theme as StyledTheme).colorOnSurface)};
  white-space: nowrap;
  transition: color 200ms ease;
`;

const UserAvatar = styled.div<{ adminMode?: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${({ theme, adminMode }) =>
    adminMode ? 'white' : (theme as StyledTheme).colorPrimary};
  color: ${({ adminMode }) =>
    adminMode ? 'rgb(74, 0, 57)' : ({ theme }) => (theme as StyledTheme).colorOnPrimary};
  border: 1px solid
    ${({ adminMode }) =>
      adminMode ? 'white' : ({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  display: flex;
  align-items: center;
  justify-content: center;
  ${({ theme }) => (theme as StyledTheme).typestyleLabelMedium600};
  flex-shrink: 0;
  transition:
    background-color 200ms ease,
    color 200ms ease,
    border-color 200ms ease;
`;

const Sidebar = styled.aside<{ isCollapsed: boolean }>`
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

const NavSection = styled.div`
  padding: ${({ theme }) =>
    `${(theme as StyledTheme).space250} ${(theme as StyledTheme).space200} 0`};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => (theme as StyledTheme).space50};
`;

const NavSectionLabel = styled.div<{ isCollapsed: boolean }>`
  ${({ theme }) => (theme as StyledTheme).typestyleLabelMedium700};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  padding: ${({ theme }) =>
    `0 ${(theme as StyledTheme).space200} ${(theme as StyledTheme).space100}`};
  text-transform: uppercase;
  letter-spacing: 1.5px;
  border-top: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  height: 31px;
  display: flex;
  align-items: flex-end;
  opacity: ${({ isCollapsed }) => (isCollapsed ? 0 : 1)};
  transition: opacity 200ms ease;
  white-space: nowrap;
  overflow: hidden;
`;

const NavItem = styled.button`
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

// Page Content Components
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

const ContentSlot = styled.div`
  background-color: rgba(205, 74, 53, 0.24);
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerM};
  padding: ${({ theme }) => (theme as StyledTheme).space800};
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 188px;
`;

const SlotText = styled.div`
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

interface NavItemData {
  id: string;
  label: string;
  icon: string;
  hasSubmenu?: boolean;
}

const AppShellDemo: React.FC = () => {
  const { theme, mode: currentMode, name: currentThemeName } = usePebbleTheme();
  const { changeTheme, changeMode } = useThemeSettings();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState(3); // Default to "Settings" tab
  const [adminMode, setAdminMode] = useState(false);

  const mainNavItems: NavItemData[] = [
    { id: 'org-chart', label: 'Org Chart', icon: Icon.TYPES.HIERARCHY_HORIZONTAL_OUTLINE },
    { id: 'favorites', label: 'Favorites', icon: Icon.TYPES.STAR_OUTLINE, hasSubmenu: true },
    { id: 'time', label: 'Time', icon: Icon.TYPES.TIME_OUTLINE, hasSubmenu: true },
    { id: 'benefits', label: 'Benefits', icon: Icon.TYPES.HEART_OUTLINE, hasSubmenu: true },
    { id: 'payroll', label: 'Payroll', icon: Icon.TYPES.DOLLAR_CIRCLE_OUTLINE, hasSubmenu: true },
    { id: 'finance', label: 'Finance', icon: Icon.TYPES.CREDIT_CARD_OUTLINE, hasSubmenu: true },
    { id: 'talent', label: 'Talent', icon: Icon.TYPES.TALENT_OUTLINE, hasSubmenu: true },
    { id: 'it', label: 'IT', icon: Icon.TYPES.LAPTOP_OUTLINE, hasSubmenu: true },
    { id: 'data', label: 'Data', icon: Icon.TYPES.BAR_CHART_OUTLINE, hasSubmenu: true },
    {
      id: 'custom-apps',
      label: 'Custom Apps',
      icon: Icon.TYPES.CUSTOM_APPS_OUTLINE,
      hasSubmenu: true,
    },
  ];

  const platformNavItems: NavItemData[] = [
    { id: 'tools', label: 'Tools', icon: Icon.TYPES.WRENCH_OUTLINE, hasSubmenu: true },
    {
      id: 'company-settings',
      label: 'Company settings',
      icon: Icon.TYPES.SETTINGS_OUTLINE,
      hasSubmenu: true,
    },
    { id: 'app-shop', label: 'App Shop', icon: Icon.TYPES.INTEGRATED_APPS_OUTLINE },
    { id: 'help', label: 'Help', icon: Icon.TYPES.QUESTION_CIRCLE_OUTLINE },
  ];

  return (
    <AppContainer theme={theme}>
      {/* Top Navigation */}
      <TopNav theme={theme} adminMode={adminMode}>
        <LeftSection theme={theme}>
          <LogoContainer theme={theme}>
            <Logo
              src={adminMode || currentMode === 'dark' ? RipplingLogoWhite : RipplingLogoBlack}
              alt="Rippling"
            />
          </LogoContainer>
          <VerticalDivider theme={theme} adminMode={adminMode} />
        </LeftSection>

        <RightSection theme={theme}>
          <SearchBar theme={theme} adminMode={adminMode}>
            <Icon
              type={Icon.TYPES.SEARCH_OUTLINE}
              size={20}
              color={adminMode ? 'white' : theme.colorOnSurface}
            />
            <input id="global-search" type="text" placeholder="Search or jump to..." />
          </SearchBar>

          <ActionsContainer theme={theme}>
            <TopNavActions theme={theme} adminMode={adminMode}>
              <Button.Icon
                icon={Icon.TYPES.HELP_OUTLINE}
                aria-label="Help"
                tip="Get help and support"
                appearance={Button.APPEARANCES.GHOST}
                size={Button.SIZES.M}
              />
              <Button.Icon
                icon={Icon.TYPES.ADD_CIRCLE_OUTLINE}
                aria-label="Create"
                tip="Create new item"
                appearance={Button.APPEARANCES.GHOST}
                size={Button.SIZES.M}
              />
              <Button.Icon
                icon={Icon.TYPES.APPS_OUTLINE}
                aria-label="Apps"
                tip="Open apps menu"
                appearance={Button.APPEARANCES.GHOST}
                size={Button.SIZES.M}
              />
              <div style={{ position: 'relative' }}>
                <Button.Icon
                  icon={Icon.TYPES.TASKS_OUTLINE}
                  aria-label="Tasks"
                  tip="View your tasks"
                  appearance={Button.APPEARANCES.GHOST}
                  size={Button.SIZES.M}
                />
                <NotificationBadge theme={theme}>2</NotificationBadge>
              </div>
              <Button.Icon
                icon={Icon.TYPES.NOTIFICATION_OUTLINE}
                aria-label="Notifications"
                tip="View notifications"
                appearance={Button.APPEARANCES.GHOST}
                size={Button.SIZES.M}
              />
              <Button.Icon
                icon={Icon.TYPES.MORE_VERTICAL}
                aria-label="More"
                tip="More options"
                appearance={Button.APPEARANCES.GHOST}
                size={Button.SIZES.M}
              />
            </TopNavActions>

            <ProfileDivider theme={theme}>
              <VerticalDivider theme={theme} adminMode={adminMode} />
            </ProfileDivider>

            <Dropdown
              list={[
                {
                  label: currentThemeName === 'berry' ? 'Berry Theme ✓' : 'Berry Theme',
                  value: 'berry',
                },
                {
                  label:
                    currentThemeName === 'plum' ? 'Plum Theme (Legacy) ✓' : 'Plum Theme (Legacy)',
                  value: 'plum',
                },
                {
                  isSeparator: true,
                },
                {
                  label: currentMode === 'light' ? 'Light Mode ✓' : 'Light Mode',
                  leftIconType: Icon.TYPES.SUN_OUTLINE,
                  value: 'light',
                },
                {
                  label: currentMode === 'dark' ? 'Dark Mode ✓' : 'Dark Mode',
                  leftIconType: Icon.TYPES.OVERNIGHT_OUTLINE,
                  value: 'dark',
                },
                {
                  isSeparator: true,
                },
                {
                  label: adminMode ? 'Turn off Admin Mode' : 'Turn on Admin Mode',
                  leftIconType: Icon.TYPES.LOCK_OUTLINE,
                  value: 'admin',
                },
              ]}
              maxHeight={400}
              onChange={value => {
                if (value === 'admin') {
                  setAdminMode(!adminMode);
                } else if (value === 'light' || value === 'dark') {
                  // Change mode (light/dark)
                  changeMode(value);
                } else if (value === 'berry' || value === 'plum') {
                  // Change theme family (mode is preserved automatically)
                  changeTheme(value);
                }
              }}
              placement="bottom-end"
              shouldAutoClose
            >
              <ProfileSection theme={theme} style={{ cursor: 'pointer' }}>
                <CompanyName theme={theme} adminMode={adminMode}>
                  Acme, Inc.
                </CompanyName>
                <UserAvatar theme={theme} adminMode={adminMode}>
                  A
                </UserAvatar>
                <Icon
                  type={Icon.TYPES.CHEVRON_DOWN}
                  size={16}
                  color={adminMode ? 'white' : theme.colorOnSurface}
                />
              </ProfileSection>
            </Dropdown>
          </ActionsContainer>
        </RightSection>
      </TopNav>

      {/* Left Sidebar */}
      <Sidebar theme={theme} isCollapsed={sidebarCollapsed}>
        <div>
          {/* Main Nav List - includes Org Chart, divider, and all apps */}
          <NavSection theme={theme}>
            {/* Org Chart */}
            <NavItem theme={theme}>
              <NavItemIcon theme={theme}>
                <Icon type={mainNavItems[0].icon} size={20} color={theme.colorOnSurface} />
              </NavItemIcon>
              <NavItemText theme={theme} isCollapsed={sidebarCollapsed}>
                {mainNavItems[0].label}
              </NavItemText>
            </NavItem>

            {/* Divider inside the nav section */}
            <NavDivider theme={theme}>
              <NavDividerLine theme={theme} />
            </NavDivider>

            {/* Rest of apps */}
            {mainNavItems.slice(1).map(item => (
              <NavItem key={item.id} theme={theme}>
                <NavItemIcon theme={theme}>
                  <Icon type={item.icon} size={20} color={theme.colorOnSurface} />
                </NavItemIcon>
                <NavItemText theme={theme} isCollapsed={sidebarCollapsed}>
                  {item.label}
                </NavItemText>
                {item.hasSubmenu && !sidebarCollapsed && (
                  <div style={{ marginLeft: 'auto' }}>
                    <Icon type={Icon.TYPES.CHEVRON_RIGHT} size={16} color={theme.colorOnSurface} />
                  </div>
                )}
              </NavItem>
            ))}
          </NavSection>

          {/* Platform Section */}
          <NavSection theme={theme}>
            <NavSectionLabel theme={theme} isCollapsed={sidebarCollapsed}>
              Platform
            </NavSectionLabel>
            {platformNavItems.map(item => (
              <NavItem key={item.id} theme={theme}>
                <NavItemIcon theme={theme}>
                  <Icon type={item.icon} size={20} color={theme.colorOnSurface} />
                </NavItemIcon>
                <NavItemText theme={theme} isCollapsed={sidebarCollapsed}>
                  {item.label}
                </NavItemText>
                {item.hasSubmenu && !sidebarCollapsed && (
                  <div style={{ marginLeft: 'auto' }}>
                    <Icon type={Icon.TYPES.CHEVRON_RIGHT} size={16} color={theme.colorOnSurface} />
                  </div>
                )}
              </NavItem>
            ))}
          </NavSection>
        </div>

        <PlatformFooter theme={theme}>
          <CollapseButton
            theme={theme}
            isCollapsed={sidebarCollapsed}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <NavItemIcon theme={theme}>
              <Icon type={Icon.TYPES.THUMBTACK_OUTLINE} size={20} color={theme.colorOnSurface} />
            </NavItemIcon>
            <NavItemText theme={theme} isCollapsed={sidebarCollapsed}>
              Collapse panel
            </NavItemText>
          </CollapseButton>
        </PlatformFooter>
      </Sidebar>

      {/* Main Content Area */}
      <MainContent theme={theme} sidebarCollapsed={sidebarCollapsed}>
        <PageContentContainer theme={theme}>
          {/* Page Header with Actions and Tabs */}
          <PageHeaderContainer theme={theme}>
            <PageHeaderWrapper theme={theme}>
              <Page.Header
                title="App Shell"
                shouldBeUnderlined={false}
                size={Page.Header.SIZES.FLUID}
                actions={
                  <PageHeaderActions theme={theme}>
                    <Button appearance={Button.APPEARANCES.PRIMARY} size={Button.SIZES.M}>
                      Button
                    </Button>
                  </PageHeaderActions>
                }
              />
            </PageHeaderWrapper>

            {/* Tabs integrated in header */}
            <TabsWrapper theme={theme}>
              <Tabs.LINK activeIndex={activeTab} onChange={index => setActiveTab(Number(index))}>
                <Tabs.Tab title="Pay" />
                <Tabs.Tab title="Bank Accounts" />
                <Tabs.Tab title="Taxes" />
                <Tabs.Tab title="Settings" />
                <Tabs.Tab title="Exemptions" />
                <Tabs.Tab title="Tasks" />
              </Tabs.LINK>
            </TabsWrapper>
          </PageHeaderContainer>

          {/* Page Content with Slots */}
          <PageContent theme={theme}>
            <ContentSlot theme={theme}>
              <SlotText theme={theme}>
                <p>Section</p>
                <p>Swap instance</p>
              </SlotText>
            </ContentSlot>

            <ContentSlot theme={theme}>
              <SlotText theme={theme}>
                <p>Section</p>
                <p>Swap instance</p>
              </SlotText>
            </ContentSlot>

            <ContentSlot theme={theme}>
              <SlotText theme={theme}>
                <p>Section</p>
                <p>Swap instance</p>
              </SlotText>
            </ContentSlot>
          </PageContent>
        </PageContentContainer>
      </MainContent>
    </AppContainer>
  );
};

export default AppShellDemo;
