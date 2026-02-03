import React, { useState } from 'react';
import styled from '@emotion/styled';
import { StyledTheme, usePebbleTheme } from '@/utils/theme';
import Icon from '@rippling/pebble/Icon';
import Button from '@rippling/pebble/Button';
import Tabs from '@rippling/pebble/Tabs';
import Tip from '@rippling/pebble/Tip';
import Avatar from '@rippling/pebble/Avatar';
import { HStack, VStack } from '@rippling/pebble/Layout/Stack';
import { AppShellLayout, NavSectionData } from '@/components/app-shell';

// Sample employee data for the modal
interface Employee {
  id: string;
  name: string;
  jobTitle: string;
  department: string;
  avatarUrl?: string;
  manuallyAdded?: boolean;
}

const SAMPLE_EMPLOYEES: Employee[] = [
  { id: '1', name: 'Cassandra Lewis', jobTitle: 'Account Executive', department: 'Enterprise', avatarUrl: 'https://randomuser.me/api/portraits/women/1.jpg' },
  { id: '2', name: 'Lauren Villarreal', jobTitle: 'Implementation Manager', department: 'Customer Success', avatarUrl: 'https://randomuser.me/api/portraits/women/2.jpg', manuallyAdded: true },
  { id: '3', name: 'Matthew Park', jobTitle: 'Software Engineer', department: 'Engineering', avatarUrl: 'https://randomuser.me/api/portraits/men/3.jpg' },
  { id: '4', name: 'Joseph Peters', jobTitle: 'Sales Manager', department: 'Sales', avatarUrl: 'https://randomuser.me/api/portraits/men/4.jpg', manuallyAdded: true },
  { id: '5', name: 'Anna Dunn', jobTitle: 'Account Manager', department: 'Customer Success', avatarUrl: 'https://randomuser.me/api/portraits/women/5.jpg' },
  { id: '6', name: 'Michael Adams', jobTitle: 'Payroll Manager', department: 'Human Resources', avatarUrl: 'https://randomuser.me/api/portraits/men/6.jpg' },
  { id: '7', name: 'Tracy Anderson', jobTitle: 'Software Engineer', department: 'Engineering', avatarUrl: 'https://randomuser.me/api/portraits/women/7.jpg', manuallyAdded: true },
  { id: '8', name: 'Jasmine Townsend', jobTitle: 'CTO', department: 'Engineering', avatarUrl: 'https://randomuser.me/api/portraits/women/8.jpg' },
  { id: '9', name: 'Russell Abbott', jobTitle: 'Software Engineer', department: 'Backend', avatarUrl: 'https://randomuser.me/api/portraits/men/9.jpg' },
  { id: '10', name: 'Joseph Cunningham', jobTitle: 'Account Executive', department: 'Mid-market', avatarUrl: 'https://randomuser.me/api/portraits/men/10.jpg', manuallyAdded: true },
  { id: '11', name: 'Susan Austin', jobTitle: 'Software Engineer', department: 'Engineering', avatarUrl: 'https://randomuser.me/api/portraits/women/11.jpg' },
  { id: '12', name: 'Kevin Tran', jobTitle: 'Customer Support Associate', department: 'Customer Support', avatarUrl: 'https://randomuser.me/api/portraits/men/12.jpg', manuallyAdded: true },
  { id: '13', name: 'Matthew Parker', jobTitle: 'Account Manager', department: 'Customer Success', avatarUrl: 'https://randomuser.me/api/portraits/men/13.jpg' },
];

/**
 * Pay Schedules Demo
 *
 * Recreates the Pay Schedules & Auto Approvals settings page from Rippling Payroll.
 * Features:
 * - Secondary settings sidebar navigation
 * - Priority explanation card
 * - Tabbed view for Employees/Contractors
 * - Pay schedule cards with detailed configuration
 */

// Sample pay schedule data
interface PaySchedule {
  id: string;
  name: string;
  entity: string;
  country: string;
  countryFlag: string;
  employmentType: string;
  fundingBankAccount: string;
  autoApproval: boolean;
  payFrequency: string;
  firstPaymentDate: string;
  arrearDaysUnit: string;
  arrearDays: number;
  paymentDateInfo: string;
  appliesTo: string[];
  isDefault?: boolean;
  assignedEmployees?: number;
}

const EMPLOYEES_SCHEDULES: PaySchedule[] = [
  {
    id: '1',
    name: 'test3',
    entity: 'Xingco',
    country: 'United States',
    countryFlag: '🇺🇸',
    employmentType: 'Employee',
    fundingBankAccount: 'cheyenne xu *******5567',
    autoApproval: true,
    payFrequency: 'Monthly',
    firstPaymentDate: '07/31/2025',
    arrearDaysUnit: 'Calendar',
    arrearDays: 0,
    paymentDateInfo: 'Last day of the month',
    appliesTo: ['All - Everyone'],
    assignedEmployees: 1,
  },
];

const CONTRACTORS_SCHEDULES: PaySchedule[] = [
  {
    id: '5',
    name: 'Contractor Monthly',
    entity: 'Xingco',
    country: 'United States',
    countryFlag: '🇺🇸',
    employmentType: 'Contractor',
    fundingBankAccount: 'JP Morgan *******0496',
    autoApproval: true,
    payFrequency: 'Monthly',
    firstPaymentDate: '01/31/2025',
    arrearDaysUnit: 'Calendar',
    arrearDays: 0,
    paymentDateInfo: 'Last day of the month',
    appliesTo: ['All Contractors'],
  },
];

// Settings sidebar items
const PAYROLL_SETTINGS = [
  { id: 'funding-account', label: 'Payroll funding account' },
  { id: 'pay-schedules', label: 'Pay schedules', active: true },
  { id: 'payment-methods', label: 'Employee payment methods' },
  { id: 'pay-run-settings', label: 'Additional pay run settings' },
  { id: 'retro-settings', label: 'Retro pay settings' },
  { id: 'approval-policies', label: 'Payroll approval policies' },
];

const PREFERENCES = [
  { id: 'paystub-settings', label: 'Paystub settings' },
  { id: 'admin-calc', label: 'Admin calculations settings' },
  { id: 'supplemental-withholding', label: 'Supplemental Income Withholding Settings' },
];

const RESOURCES = [
  { id: 'supplemental-fees', label: 'Supplemental payroll fees' },
  { id: 'additional-settings', label: 'Additional settings', hasExpand: true },
];

// Styled Components
const PageContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => (theme as StyledTheme).space800};
`;

const SettingsSidebar = styled.aside`
  width: 240px;
  flex-shrink: 0;
`;

const SidebarSection = styled.div`
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space600};
`;

const SidebarSectionLabel = styled.div`
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelSmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: ${({ theme }) => (theme as StyledTheme).space200} ${({ theme }) => (theme as StyledTheme).space300};
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space100};
`;

const SidebarItem = styled.button<{ isActive?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: ${({ theme }) => (theme as StyledTheme).space200} ${({ theme }) => (theme as StyledTheme).space300};
  border: none;
  background: ${({ theme, isActive }) =>
    isActive ? (theme as StyledTheme).colorSurfaceContainerHigh : 'transparent'};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  text-align: left;
  cursor: pointer;
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerLg};
  transition: background-color 150ms ease;

  &:hover {
    background: ${({ theme }) => (theme as StyledTheme).colorSurfaceContainerLow};
  }

  ${({ isActive, theme }) =>
    isActive &&
    `
    border-left: 3px solid ${(theme as StyledTheme).colorPrimary};
    padding-left: calc(${(theme as StyledTheme).space300} - 3px);
  `}
`;

const MainContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const PageHeader = styled.div`
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space600};
`;

const PageTitle = styled.h1`
  ${({ theme }) => (theme as StyledTheme).typestyleV2TitleLarge};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  margin: 0 0 ${({ theme }) => (theme as StyledTheme).space200} 0;
`;

const PageDescription = styled.p`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  margin: 0;
`;

const PriorityCard = styled.div`
  background: ${({ theme }) => (theme as StyledTheme).colorSurfaceBright};
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCorner2xl};
  padding: ${({ theme }) => (theme as StyledTheme).space600};
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space600};
`;

const PriorityHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => (theme as StyledTheme).space300};
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space400};
`;

const PriorityTitle = styled.h3`
  ${({ theme }) => (theme as StyledTheme).typestyleV2TitleSmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  margin: 0;
`;

const PriorityDescription = styled.p`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  margin: 0;
`;

const TabsContainer = styled.div`
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space600};
`;

const ScheduleCard = styled.div`
  background: ${({ theme }) => (theme as StyledTheme).colorSurfaceBright};
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCorner2xl};
  padding: ${({ theme }) => (theme as StyledTheme).space600};
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space400};
`;

const ScheduleCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space400};
`;

const ScheduleTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space300};
`;

const ScheduleCardBody = styled.div`
  display: flex;
  gap: ${({ theme }) => (theme as StyledTheme).space800};
`;

const ScheduleLeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => (theme as StyledTheme).space400};
  min-width: 280px;
`;

const ScheduleRightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
  flex: 1;
`;

const ScheduleName = styled.h4`
  ${({ theme }) => (theme as StyledTheme).typestyleV2TitleMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  margin: 0;
`;

const PreviewButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
  padding: ${({ theme }) => (theme as StyledTheme).space200} ${({ theme }) => (theme as StyledTheme).space400};
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerFull};
  background: transparent;
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelMedium};
  cursor: pointer;
  transition: background-color 150ms ease;

  &:hover {
    background: ${({ theme }) => (theme as StyledTheme).colorSurfaceContainerLow};
  }
`;

const PriorityBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space100};
  padding: ${({ theme }) => (theme as StyledTheme).space100} ${({ theme }) => (theme as StyledTheme).space300};
  background: #f5f0e8;
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerFull};
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  width: fit-content;
`;

const ScheduleDetailRow = styled.div`
  display: flex;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
`;

const ScheduleDetailLabel = styled.span`
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  font-weight: 600;
  min-width: 180px;
`;

const ScheduleDetailValue = styled.span`
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
`;

const AssignmentRules = styled.div`
  margin-top: ${({ theme }) => (theme as StyledTheme).space500};
`;

const AssignmentRulesLabel = styled.div`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space200};
`;

const AssignmentRulesTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
`;

const AssignmentRuleTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space100};
  padding: ${({ theme }) => (theme as StyledTheme).space100} ${({ theme }) => (theme as StyledTheme).space300};
  background: ${({ theme }) => (theme as StyledTheme).colorSurfaceContainerLow};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerFull};
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelSmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
`;

const NoMembersText = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
`;

const DefaultBadge = styled.span`
  display: inline-flex;
  padding: ${({ theme }) => (theme as StyledTheme).space100} ${({ theme }) => (theme as StyledTheme).space300};
  background: ${({ theme }) => (theme as StyledTheme).colorPrimary};
  color: ${({ theme }) => (theme as StyledTheme).colorOnPrimary};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerSm};
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelSmall};
  margin-top: ${({ theme }) => (theme as StyledTheme).space200};
`;

// Employee Modal Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: ${({ theme }) => (theme as StyledTheme).colorSurfaceBright};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCorner2xl};
  width: 480px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: ${({ theme }) => (theme as StyledTheme).space600};
  padding-bottom: ${({ theme }) => (theme as StyledTheme).space400};
`;

const ModalHeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => (theme as StyledTheme).space300};
`;

const ModalTitle = styled.h2`
  ${({ theme }) => (theme as StyledTheme).typestyleV2TitleLarge};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  margin: 0;
`;

const ModalFilterTabs = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space100};
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
`;

const FilterTab = styled.button<{ isActive?: boolean }>`
  background: none;
  border: none;
  padding: ${({ theme }) => (theme as StyledTheme).space100} ${({ theme }) => (theme as StyledTheme).space200};
  cursor: pointer;
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme, isActive }) => 
    isActive ? (theme as StyledTheme).colorPrimary : (theme as StyledTheme).colorOnSurfaceVariant};
  font-weight: ${({ isActive }) => isActive ? 600 : 400};
  
  &:hover {
    color: ${({ theme }) => (theme as StyledTheme).colorPrimary};
  }
`;

const FilterDivider = styled.span`
  color: ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
`;

const ModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => (theme as StyledTheme).space200} 0;
`;

const EmployeeRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space400};
  padding: ${({ theme }) => (theme as StyledTheme).space400} ${({ theme }) => (theme as StyledTheme).space600};
  border-bottom: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  
  &:last-child {
    border-bottom: none;
  }
`;

const EmployeeInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => (theme as StyledTheme).space100};
  flex: 1;
  min-width: 0;
`;

const EmployeeName = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2TitleSmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
`;

const EmployeeRole = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
`;

const ManuallyAddedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: ${({ theme }) => (theme as StyledTheme).space100} ${({ theme }) => (theme as StyledTheme).space300};
  background: ${({ theme }) => (theme as StyledTheme).colorSurfaceContainerHigh};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerFull};
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelSmall};
  white-space: nowrap;
`;

const PaySchedulesDemo: React.FC = () => {
  const { theme } = usePebbleTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [showEmployeesModal, setShowEmployeesModal] = useState(false);

  // Navigation sections for the app shell
  const payrollSection: NavSectionData = {
    items: [
      { id: 'my-pay', label: 'My Pay', icon: Icon.TYPES.DOLLAR_CIRCLE_OUTLINE },
      { id: 'accounting', label: 'Accounting Integrations', icon: Icon.TYPES.CREDIT_CARD_OUTLINE },
      { id: 'payroll', label: 'Payroll', icon: Icon.TYPES.DOLLAR_CIRCLE_OUTLINE },
    ],
  };

  const platformSection: NavSectionData = {
    label: 'Platform',
    items: [
      { id: 'tools', label: 'Tools', icon: Icon.TYPES.WRENCH_OUTLINE, hasSubmenu: true },
      { id: 'company-settings', label: 'Company settings', icon: Icon.TYPES.SETTINGS_OUTLINE, hasSubmenu: true },
      { id: 'app-shop', label: 'App Shop', icon: Icon.TYPES.INTEGRATED_APPS_OUTLINE },
      { id: 'help', label: 'Help', icon: Icon.TYPES.QUESTION_CIRCLE_OUTLINE },
    ],
  };

  const tabs = ['Overview', 'People', 'Settings', 'Entities', 'Accounting', 'Balances', 'Reports', 'Earnings', 'Deductions', 'Garnishments', 'Filings'];
  const currentSchedules = activeTab === 0 ? EMPLOYEES_SCHEDULES : CONTRACTORS_SCHEDULES;

  const pageActions = (
    <Button appearance={Button.APPEARANCES.STROKE} size={Button.SIZES.M}>
      <HStack gap="0.5rem" alignItems="center">
        <Icon type={Icon.TYPES.ADD_OUTLINE} size={16} />
        Add a pay schedule
      </HStack>
    </Button>
  );

  return (
    <AppShellLayout
      pageTitle="Payroll"
      pageTabs={tabs}
      defaultActiveTab={2}
      pageActions={pageActions}
      mainNavSections={[payrollSection]}
      platformNavSection={platformSection}
      companyName="Xingco"
      userInitial="X"
    >
      <PageContainer theme={theme}>
        {/* Settings Sidebar */}
        <SettingsSidebar>
          {/* Payroll section */}
          <SidebarSection theme={theme}>
            <SidebarSectionLabel theme={theme}>Payroll</SidebarSectionLabel>
            {PAYROLL_SETTINGS.map(item => (
              <SidebarItem key={item.id} theme={theme} isActive={item.active}>
                {item.label}
              </SidebarItem>
            ))}
          </SidebarSection>

          {/* Preferences section */}
          <SidebarSection theme={theme}>
            <SidebarSectionLabel theme={theme}>Preferences</SidebarSectionLabel>
            {PREFERENCES.map(item => (
              <SidebarItem key={item.id} theme={theme}>
                {item.label}
              </SidebarItem>
            ))}
          </SidebarSection>

          {/* Resources section */}
          <SidebarSection theme={theme}>
            <SidebarSectionLabel theme={theme}>Resources</SidebarSectionLabel>
            {RESOURCES.map(item => (
              <SidebarItem key={item.id} theme={theme}>
                {item.label}
                {item.hasExpand && <Icon type={Icon.TYPES.CHEVRON_DOWN_OUTLINE} size={16} />}
              </SidebarItem>
            ))}
          </SidebarSection>
        </SettingsSidebar>

        {/* Main Content */}
        <MainContent>
          {/* Page Header */}
          <PageHeader theme={theme}>
            <PageTitle theme={theme}>Pay schedules & auto approvals</PageTitle>
            <PageDescription theme={theme}>
              Rippling created default pay schedules as a fall back to make sure all workers will
              be assigned to a pay schedule. Create custom pay schedules to override them.
            </PageDescription>
          </PageHeader>

          {/* Priority Card */}
          <PriorityCard theme={theme}>
            <PriorityHeader theme={theme}>
              <Icon type={Icon.TYPES.INFO_OUTLINE} size={20} color={theme.colorOnSurfaceVariant} />
              <VStack gap="0.25rem">
                <PriorityTitle theme={theme}>Pay schedule priority</PriorityTitle>
                <PriorityDescription theme={theme}>
                  Pay schedules apply to employees in order from top to bottom, with 1 as the highest priority. If an employee is included in multiple
                  schedules, the first applicable one will be used.
                </PriorityDescription>
              </VStack>
            </PriorityHeader>
          </PriorityCard>

          {/* Tabs */}
          <TabsContainer theme={theme}>
            <Tabs.SWITCH activeIndex={activeTab} onChange={(index) => setActiveTab(Number(index))}>
              <Tabs.Tab
                title="Employees"
                badge={{ text: String(EMPLOYEES_SCHEDULES.length) }}
              />
              <Tabs.Tab
                title="Contractors"
                badge={{ text: String(CONTRACTORS_SCHEDULES.length) }}
              />
            </Tabs.SWITCH>
          </TabsContainer>

          {/* Schedule Cards */}
          {currentSchedules.map((schedule, index) => (
            <ScheduleCard key={schedule.id} theme={theme}>
              <ScheduleCardHeader theme={theme}>
                <ScheduleTitleRow theme={theme}>
                  <ScheduleName theme={theme}>{schedule.name}</ScheduleName>
                  <PriorityBadge theme={theme}>
                    <Icon type={Icon.TYPES.DOUBLE_CHEVRON} size={16} />
                    {schedule.assignedEmployees || (index + 1)}
                  </PriorityBadge>
                </ScheduleTitleRow>
                <Button.Icon
                  icon={Icon.TYPES.MORE_VERTICAL}
                  aria-label="More options"
                  appearance={Button.APPEARANCES.GHOST}
                  size={Button.SIZES.S}
                />
              </ScheduleCardHeader>

              <ScheduleCardBody theme={theme}>
                <ScheduleLeftColumn theme={theme}>
                  <PreviewButton theme={theme}>
                    <Icon type={Icon.TYPES.CALENDAR_OUTLINE} size={16} />
                    Preview upcoming pay periods
                  </PreviewButton>

                  <PreviewButton theme={theme} onClick={() => setShowEmployeesModal(true)}>
                    <Icon type={Icon.TYPES.VISIBILITY_OUTLINE} size={16} />
                    View employees on this schedule
                  </PreviewButton>
                </ScheduleLeftColumn>

                <ScheduleRightColumn theme={theme}>
                  <ScheduleDetailRow theme={theme}>
                    <ScheduleDetailLabel theme={theme}>Entity:</ScheduleDetailLabel>
                    <ScheduleDetailValue theme={theme}>{schedule.entity}</ScheduleDetailValue>
                  </ScheduleDetailRow>
                  <ScheduleDetailRow theme={theme}>
                    <ScheduleDetailLabel theme={theme}>Country:</ScheduleDetailLabel>
                    <ScheduleDetailValue theme={theme}>
                      <span>{schedule.countryFlag}</span> {schedule.country}
                    </ScheduleDetailValue>
                  </ScheduleDetailRow>
                  <ScheduleDetailRow theme={theme}>
                    <ScheduleDetailLabel theme={theme}>Employment type:</ScheduleDetailLabel>
                    <ScheduleDetailValue theme={theme}>{schedule.employmentType}</ScheduleDetailValue>
                  </ScheduleDetailRow>
                  {schedule.fundingBankAccount && (
                    <ScheduleDetailRow theme={theme}>
                      <ScheduleDetailLabel theme={theme}>Funding Bank Account:</ScheduleDetailLabel>
                      <ScheduleDetailValue theme={theme}>{schedule.fundingBankAccount}</ScheduleDetailValue>
                    </ScheduleDetailRow>
                  )}
                  <ScheduleDetailRow theme={theme}>
                    <ScheduleDetailLabel theme={theme}>Auto approval:</ScheduleDetailLabel>
                    <ScheduleDetailValue theme={theme}>{schedule.autoApproval ? 'Yes' : 'No'}</ScheduleDetailValue>
                  </ScheduleDetailRow>
                  <ScheduleDetailRow theme={theme}>
                    <ScheduleDetailLabel theme={theme}>Pay Frequency:</ScheduleDetailLabel>
                    <ScheduleDetailValue theme={theme}>{schedule.payFrequency}</ScheduleDetailValue>
                  </ScheduleDetailRow>
                  <ScheduleDetailRow theme={theme}>
                    <ScheduleDetailLabel theme={theme}>First Payment Date:</ScheduleDetailLabel>
                    <ScheduleDetailValue theme={theme}>{schedule.firstPaymentDate}</ScheduleDetailValue>
                  </ScheduleDetailRow>
                  <ScheduleDetailRow theme={theme}>
                    <ScheduleDetailLabel theme={theme}>Arrear Days Unit:</ScheduleDetailLabel>
                    <ScheduleDetailValue theme={theme}>{schedule.arrearDaysUnit}</ScheduleDetailValue>
                  </ScheduleDetailRow>
                  <ScheduleDetailRow theme={theme}>
                    <ScheduleDetailLabel theme={theme}>Arrear Days:</ScheduleDetailLabel>
                    <ScheduleDetailValue theme={theme}>{schedule.arrearDays}</ScheduleDetailValue>
                  </ScheduleDetailRow>
                  <ScheduleDetailRow theme={theme}>
                    <ScheduleDetailLabel theme={theme}>Payment date of the {schedule.payFrequency === 'Weekly' || schedule.payFrequency === 'Bi-Weekly' ? 'Week' : 'month'}:</ScheduleDetailLabel>
                    <ScheduleDetailValue theme={theme}>{schedule.paymentDateInfo.split('\n')[0]}</ScheduleDetailValue>
                  </ScheduleDetailRow>
                  <ScheduleDetailRow theme={theme}>
                    <Tip content="Employees matching these rules are auto-assigned" placement={Tip.PLACEMENTS.TOP}>
                      <HStack gap="0.25rem" alignItems="center" style={{ minWidth: '180px', cursor: 'help' }}>
                        <ScheduleDetailLabel theme={theme} style={{ minWidth: 'unset', width: '180px' }}>Assignment rules:</ScheduleDetailLabel>
                        <Icon type={Icon.TYPES.INFO_OUTLINE} size={14} color={theme.colorOnSurfaceVariant} />
                      </HStack>
                    </Tip>
                    <ScheduleDetailValue theme={theme}>
                      Included
                      <AssignmentRuleTag theme={theme}>
                        <Icon type={Icon.TYPES.TEAM_OUTLINE} size={12} />
                        All - Everyone
                      </AssignmentRuleTag>
                    </ScheduleDetailValue>
                  </ScheduleDetailRow>
                  <ScheduleDetailRow theme={theme}>
                    <ScheduleDetailLabel theme={theme} style={{ visibility: 'hidden' }}>Assignment rules:</ScheduleDetailLabel>
                    <ScheduleDetailValue theme={theme}>
                      Excluded
                      <AssignmentRuleTag theme={theme}>
                        <Icon type={Icon.TYPES.TEAM_OUTLINE} size={12} />
                        Full Admins
                      </AssignmentRuleTag>
                    </ScheduleDetailValue>
                  </ScheduleDetailRow>
                  {schedule.isDefault && (
                    <DefaultBadge theme={theme}>Default</DefaultBadge>
                  )}
                </ScheduleRightColumn>
              </ScheduleCardBody>
            </ScheduleCard>
          ))}
        </MainContent>
      </PageContainer>

      {/* Employees Modal */}
      {showEmployeesModal && (
        <ModalOverlay onClick={() => setShowEmployeesModal(false)}>
          <ModalContainer theme={theme} onClick={(e) => e.stopPropagation()}>
            <ModalHeader theme={theme}>
              <ModalHeaderContent theme={theme}>
                <ModalTitle theme={theme}>Employees on this schedule</ModalTitle>
                <ModalFilterTabs theme={theme}>
                  <FilterTab theme={theme} isActive>All (13)</FilterTab>
                  <FilterDivider theme={theme}>|</FilterDivider>
                  <FilterTab theme={theme}>Matches rules (8)</FilterTab>
                  <FilterDivider theme={theme}>|</FilterDivider>
                  <FilterTab theme={theme}>Manual overrides (5)</FilterTab>
                </ModalFilterTabs>
              </ModalHeaderContent>
              <Button.Icon
                icon={Icon.TYPES.CLOSE}
                aria-label="Close"
                appearance={Button.APPEARANCES.GHOST}
                size={Button.SIZES.S}
                onClick={() => setShowEmployeesModal(false)}
              />
            </ModalHeader>
            <ModalBody theme={theme}>
              {SAMPLE_EMPLOYEES.map((employee) => (
                <EmployeeRow key={employee.id} theme={theme}>
                  <Avatar
                    size={Avatar.SIZES.M}
                    name={employee.name}
                    imgSrc={employee.avatarUrl}
                  />
                  <EmployeeInfo theme={theme}>
                    <EmployeeName theme={theme}>{employee.name}</EmployeeName>
                    <EmployeeRole theme={theme}>
                      {employee.jobTitle}, {employee.department}
                    </EmployeeRole>
                  </EmployeeInfo>
                  {employee.manuallyAdded && (
                    <ManuallyAddedBadge theme={theme}>Manually added</ManuallyAddedBadge>
                  )}
                </EmployeeRow>
              ))}
            </ModalBody>
          </ModalContainer>
        </ModalOverlay>
      )}
    </AppShellLayout>
  );
};

export default PaySchedulesDemo;

