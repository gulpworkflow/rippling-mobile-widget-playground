import React from 'react';
import styled from '@emotion/styled';
import { StyledTheme } from '@/utils/theme';
import Icon from '@rippling/pebble/Icon';
import Button from '@rippling/pebble/Button';
import { AppShellLayout, NavSectionData } from '@/components/app-shell';

/**
 * App Shell Demo
 *
 * Recreates Rippling's main application shell with:
 * - Top navigation bar
 * - Left sidebar navigation
 * - Main content area
 *
 * Based on the actual Rippling product UI structure.
 * 
 * Now uses the extracted AppShellLayout component for DRY code reuse.
 */

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

const AppShellDemo: React.FC = () => {
  // Main navigation items (Org Chart + Apps)
  const orgChartSection: NavSectionData = {
    items: [
      { id: 'org-chart', label: 'Org Chart', icon: Icon.TYPES.HIERARCHY_HORIZONTAL_OUTLINE },
    ],
  };

  const appsSection: NavSectionData = {
    items: [
      { id: 'favorites', label: 'Favorites', icon: Icon.TYPES.STAR_OUTLINE, hasSubmenu: true },
      { id: 'time', label: 'Time', icon: Icon.TYPES.TIME_OUTLINE, hasSubmenu: true },
      { id: 'benefits', label: 'Benefits', icon: Icon.TYPES.HEART_OUTLINE, hasSubmenu: true },
      { id: 'payroll', label: 'Payroll', icon: Icon.TYPES.DOLLAR_CIRCLE_OUTLINE, hasSubmenu: true },
      { id: 'finance', label: 'Finance', icon: Icon.TYPES.CREDIT_CARD_OUTLINE, hasSubmenu: true },
      { id: 'talent', label: 'Talent', icon: Icon.TYPES.TALENT_OUTLINE, hasSubmenu: true },
      { id: 'it', label: 'IT', icon: Icon.TYPES.LAPTOP_OUTLINE, hasSubmenu: true },
      { id: 'data', label: 'Data', icon: Icon.TYPES.BAR_CHART_OUTLINE, hasSubmenu: true },
      { id: 'custom-apps', label: 'Custom Apps', icon: Icon.TYPES.CUSTOM_APPS_OUTLINE, hasSubmenu: true },
    ],
  };

  // Platform navigation section
  const platformSection: NavSectionData = {
    label: 'Platform',
    items: [
      { id: 'tools', label: 'Tools', icon: Icon.TYPES.WRENCH_OUTLINE, hasSubmenu: true },
      { id: 'company-settings', label: 'Company settings', icon: Icon.TYPES.SETTINGS_OUTLINE, hasSubmenu: true },
      { id: 'app-shop', label: 'App Shop', icon: Icon.TYPES.INTEGRATED_APPS_OUTLINE },
      { id: 'help', label: 'Help', icon: Icon.TYPES.QUESTION_CIRCLE_OUTLINE },
    ],
  };

  const tabs = ['Pay', 'Bank Accounts', 'Taxes', 'Settings', 'Exemptions', 'Tasks'];

  const pageActions = (
    <Button appearance={Button.APPEARANCES.PRIMARY} size={Button.SIZES.M}>
      Button
    </Button>
  );

  return (
    <AppShellLayout
      pageTitle="App Shell"
      pageTabs={tabs}
      defaultActiveTab={3}
      pageActions={pageActions}
      mainNavSections={[orgChartSection, appsSection]}
      platformNavSection={platformSection}
      companyName="Acme, Inc."
      userInitial="A"
      showNotificationBadge
      notificationCount={2}
    >
      <ContentSlot>
        <SlotText>
          <p>Section</p>
          <p>Swap instance</p>
        </SlotText>
      </ContentSlot>

      <ContentSlot>
        <SlotText>
          <p>Section</p>
          <p>Swap instance</p>
        </SlotText>
      </ContentSlot>

      <ContentSlot>
        <SlotText>
          <p>Section</p>
          <p>Swap instance</p>
        </SlotText>
      </ContentSlot>
    </AppShellLayout>
  );
};

export default AppShellDemo;
