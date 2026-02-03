import React, { useState, useMemo } from 'react';
import styled from '@emotion/styled';
import { usePebbleTheme, StyledTheme } from '@/utils/theme';
import Icon from '@rippling/pebble/Icon';
import Breadcrumb from '@rippling/pebble/Breadcrumb';
import Page from '@rippling/pebble/Page';
import TableBasic from '@rippling/pebble/TableBasic';
import Input from '@rippling/pebble/Inputs';
import Avatar from '@rippling/pebble/Avatar';
import Button from '@rippling/pebble/Button';
import Card from '@rippling/pebble/Card';
import Drawer, { DrawerTitleKinds } from '@rippling/pebble/Drawer';
import ObjectUI from '@rippling/pebble/ObjectUI';
import Form from '@rippling/pebble/Form';
import Notice from '@rippling/pebble/Notice';
import Status from '@rippling/pebble/Status';
import Tip from '@rippling/pebble/Tip';
import Modal from '@rippling/pebble/Modal';
import Calendar from '@rippling/pebble/Inputs/Date/Calendar';
import Snackbar from '@rippling/pebble/SnackBar';
import { HStack, VStack } from '@rippling/pebble/Layout/Stack';
import { TopNavBar, Sidebar, NavSectionData } from '@/components/app-shell';

/**
 * Canada Bulk ROE Demo
 *
 * A demo for Canada Record of Employment (ROE) bulk management.
 * 
 * Simplified layout with just top nav and left sidebar.
 */

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
  background-color: ${({ theme }) => (theme as StyledTheme).colorSurface};
`;

const BreadcrumbWrapper = styled.div`
  padding: ${({ theme }) => (theme as StyledTheme).space600} ${({ theme }) => (theme as StyledTheme).space800};
  padding-bottom: 0;
`;

const PageHeaderWrapper = styled.div`
  padding: 0 ${({ theme }) => (theme as StyledTheme).space800};
`;

const TableContainer = styled.div`
  padding: ${({ theme }) => (theme as StyledTheme).space600} ${({ theme }) => (theme as StyledTheme).space800};
`;

const TableHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space400};
`;

const TableTitle = styled.div`
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelLarge};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
`;

const TableCount = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
`;

const TableActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
`;

const SearchFilterRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space300};
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space400};
  flex-wrap: wrap;
`;

const SearchWrapper = styled.div`
  width: 280px;
`;

const FilterWrapper = styled.div`
  width: 140px;
`;

const EmployeeCell = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space300};
`;

const EmployeeInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const EmployeeName = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  font-weight: 500;
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  display: block;
  max-width: 140px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const EmployeeRole = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  display: block;
  max-width: 140px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CellText = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
`;

const StatusCell = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
  width: 100%;
`;

const StatusDot = styled.span<{ statusType: 'draft' | 'approved' | 'submitted' | 'completed' | 'rejected' | 'discarded' }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  background-color: ${({ theme, statusType }) => {
    switch (statusType) {
      case 'draft':
        return (theme as StyledTheme).colorOutline;
      case 'approved':
        return '#2780CE';
      case 'submitted':
        return '#CE71BB';
      case 'completed':
        return '#2D8A70';
      case 'rejected':
        return '#E4633C';
      case 'discarded':
        return (theme as StyledTheme).colorWarning;
      default:
        return (theme as StyledTheme).colorOutline;
    }
  }};
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  
  /* Sticky column styles */
  table {
    border-collapse: separate;
    border-spacing: 0;
    min-width: 100%;
  }
  
  /* Checkbox column - sticky left */
  thead th:first-of-type {
    position: sticky !important;
    left: 0 !important;
    z-index: 4;
    background: ${({ theme }) => (theme as StyledTheme).colorSurface} !important;
  }
  
  tbody td:first-of-type {
    position: sticky !important;
    left: 0 !important;
    z-index: 3;
    background: ${({ theme }) => (theme as StyledTheme).colorSurfaceBright} !important;
  }
  
  /* People column - sticky left after checkbox */
  thead th:nth-of-type(2) {
    position: sticky !important;
    left: 64px !important;
    z-index: 4;
    background: ${({ theme }) => (theme as StyledTheme).colorSurface} !important;
    box-shadow: 2px 0 4px -2px rgba(0, 0, 0, 0.1);
  }
  
  tbody td:nth-of-type(2) {
    position: sticky !important;
    left: 64px !important;
    z-index: 3;
    background: ${({ theme }) => (theme as StyledTheme).colorSurfaceBright} !important;
    box-shadow: 2px 0 4px -2px rgba(0, 0, 0, 0.1);
  }
  
  /* Last column - sticky right */
  thead th:last-of-type {
    position: sticky !important;
    right: 0 !important;
    z-index: 4;
    background: ${({ theme }) => (theme as StyledTheme).colorSurface} !important;
    box-shadow: -2px 0px 4px -2px rgba(0, 0, 0, 0.1);
  }
  
  tbody td:last-of-type {
    position: sticky !important;
    right: 0 !important;
    z-index: 3;
    background: ${({ theme }) => (theme as StyledTheme).colorSurfaceBright} !important;
    box-shadow: -2px 0 4px -2px rgba(0, 0, 0, 0.1);
  }
`;

// Action Bar - Fixed bottom center with slide-in animation
const ActionBarContainer = styled.div<{ isVisible: boolean }>`
  position: fixed;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%) translateY(${({ isVisible }) => (isVisible ? '0' : '100px')});
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  pointer-events: ${({ isVisible }) => (isVisible ? 'auto' : 'none')};
  transition: transform 300ms ease-out, opacity 300ms ease-out;
  z-index: 1000;
`;

const ActionBarContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
  padding: ${({ theme }) => (theme as StyledTheme).space200};
  background-color: ${({ theme }) => (theme as StyledTheme).colorPrimary};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerXl};
  box-shadow: 0px 10px 14px 0px rgba(0, 0, 0, 0.15);

  /* Override button colors for dark background */
  button {
    color: white !important;
    
    span {
      color: white !important;
    }
  }

  /* Override icon font colors */
  [class*="Icon"],
  [data-testid*="icon"],
  i[class*="icon"] {
    color: white !important;
  }

  /* Force all text and icon elements to white */
  * {
    color: white !important;
    fill: white !important;
  }
`;

const ActionBarSeparator = styled.div`
  width: 1px;
  height: 24px;
  background-color: ${({ theme }) => (theme as StyledTheme).colorSurfaceBright};
  margin: 0 ${({ theme }) => (theme as StyledTheme).space100};
`;

const ActionBarText = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnPrimary};
  padding: 0 ${({ theme }) => (theme as StyledTheme).space100};
  white-space: nowrap;
`;

// Floating Action Buttons - Bottom Right
const FloatingButtonsContainer = styled.div`
  position: fixed;
  bottom: ${({ theme }) => (theme as StyledTheme).space600};
  right: ${({ theme }) => (theme as StyledTheme).space600};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => (theme as StyledTheme).space300};
  z-index: 10000;
`;

// Item Navigator for Drawer
const ItemNavigator = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space100};
`;

const ItemNavigatorText = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  white-space: nowrap;
  
  strong {
    font-weight: 600;
  }
`;

// Reset Form's internal Container margins so VStack gap controls all spacing
const FormNoMargin = styled.div`
  & > form > div:first-of-type {
    margin: 0 !important;
  }
`;

const FloatingButton = styled.button<{ isActive?: boolean }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: ${({ theme, isActive }) => 
    isActive ? (theme as StyledTheme).colorPrimary : (theme as StyledTheme).colorSurfaceBright};
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 150ms ease, box-shadow 150ms ease, background-color 150ms ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0px 6px 16px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: scale(0.98);
  }
`;

// Floating Comments
interface Comment {
  id: string;
  author: string;
  avatarUrl?: string;
  content: string;
  top: number;
  left: number;
  drawerOnly?: boolean;
  showWhenHasErrors?: boolean; // Only show when viewing an ROE with errors
  showWhenRejected?: boolean; // Only show when viewing a rejected ROE
  showWhenDraft?: boolean; // Only show when viewing a Draft ROE
}

const FloatingCommentContainer = styled.div<{ isVisible: boolean }>`
  position: fixed;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
  max-width: 280px;
  padding: ${({ theme }) => (theme as StyledTheme).space300};
  background-color: ${({ theme }) => (theme as StyledTheme).colorSurfaceBright};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCorner2xl};
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.15);
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  transform: ${({ isVisible }) => (isVisible ? 'scale(1)' : 'scale(0.9)')};
  pointer-events: ${({ isVisible }) => (isVisible ? 'auto' : 'none')};
  transition: opacity 200ms ease, transform 200ms ease;
`;

const CommentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
`;

const CommentAuthor = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  font-weight: 600;
`;

const CommentContent = styled.p`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodySmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  margin: 0;
  line-height: 1.4;
`;

const CommentIndicator = styled.div<{ isVisible: boolean }>`
  position: fixed;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${({ theme }) => (theme as StyledTheme).colorPrimary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1000;
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  transform: ${({ isVisible }) => (isVisible ? 'scale(1)' : 'scale(0)')};
  pointer-events: ${({ isVisible }) => (isVisible ? 'auto' : 'none')};
  transition: opacity 200ms ease, transform 200ms ease;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.2);

  &:hover {
    transform: ${({ isVisible }) => (isVisible ? 'scale(1.1)' : 'scale(0)')};
  }
`;

// Sample comments for the prototype
const SAMPLE_COMMENTS: Comment[] = [
  {
    id: 'comment-header',
    author: 'Zac',
    content: 'added page header',
    top: 176,
    left: 400,
  },
  {
    id: 'comment-filters',
    author: 'Zac',
    content: 'Added quick filters',
    top: 352,
    left: 550,
  },
  {
    id: 'comment-segmented',
    author: 'Zac',
    content: 'Switch between state quickly to focus on not completed ROEs',
    top: 303,
    left: 300,
  },
  {
    id: 'comment-checkbox',
    author: 'Zac',
    content: 'Select only ROEs in draft without errors to bulk approve',
    top: 400,
    left: 180,
  },
  {
    id: 'comment-warning',
    author: 'Zac',
    content: 'Drafts with errors have tooltip and more info in ROE',
    top: 526,
    left: 845,
  },
  {
    id: 'comment-people-frozen',
    author: 'Zac',
    content: 'Column frozen to always have in view',
    top: 400,
    left: 290,
  },
  {
    id: 'comment-actions-frozen',
    author: 'Zac',
    content: 'Column frozen to always have in view',
    top: 400,
    left: 1560,
  },
  {
    id: 'comment-reason',
    author: 'Zac',
    content: 'Removed "ROE" because its self explanatory',
    top: 400,
    left: 965,
  },
  {
    id: 'comment-status',
    author: 'Zac',
    content: 'Updated some of the status colors',
    top: 400,
    left: 800,
  },
  {
    id: 'comment-created-by',
    author: 'Zac',
    content: 'Added created by',
    top: 400,
    left: 1070,
  },
  {
    id: 'comment-last-updated',
    author: 'Zac',
    content: 'Removed "on"',
    top: 400,
    left: 1420,
  },
  {
    id: 'comment-sentence-case',
    author: 'Zac',
    content: 'Update ALL to sentence case, do not use title case unless its a noun',
    top: 278,
    left: 600,
  },
  {
    id: 'comment-checkbox-tooltip',
    author: 'Zac',
    content: 'On hover there is a tooltip explaining why a row can\'t be selected',
    top: 506,
    left: 180,
  },
  {
    id: 'comment-drawer-breadcrumb',
    author: 'Zac',
    content: 'Breadcrumb to show hierarchy, click goes back to page',
    top: 32,
    left: 970,
    drawerOnly: true,
  },
  {
    id: 'comment-drawer-pagination',
    author: 'Zac',
    content: 'Pagination to move through ROEs one by one',
    top: 28,
    left: 1530,
    drawerOnly: true,
  },
  {
    id: 'comment-drawer-stats',
    author: 'Zac',
    content: 'Added more here from the table, need a full picture so you don\'t have to reference table',
    top: 170,
    left: 1200,
    drawerOnly: true,
  },
  {
    id: 'comment-drawer-error-notice',
    author: 'Zac',
    content: 'Error clarity',
    top: 96,
    left: 1100,
    drawerOnly: true,
    showWhenHasErrors: true,
  },
  {
    id: 'comment-drawer-approve-disabled',
    author: 'Zac',
    content: 'Approve is disabled when errors are present',
    top: 214,
    left: 1560,
    drawerOnly: true,
    showWhenHasErrors: true,
  },
  {
    id: 'comment-drawer-edit-button',
    author: 'Zac',
    content: 'Moved edit into the settings form so its contextually tied to this and you don\'t think you are editing the top card\'s content',
    top: 323,
    left: 1560,
    drawerOnly: true,
    showWhenDraft: true,
  },
  {
    id: 'comment-drawer-rejected-notice',
    author: 'Zac',
    content: 'Added rejection reason',
    top: 96,
    left: 1100,
    drawerOnly: true,
    showWhenRejected: true,
  },
];

// Sample employee data for ROE
interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  avatarUrl?: string;
  serialNumber: string;
  type: string;
  status: string;
  reason: string;
  submissionDate: string;
  createdBy: string;
  lastUpdatedOn: string;
  isDisabled?: boolean;
  hasErrors?: boolean;
}

const SAMPLE_EMPLOYEES: Employee[] = [
  { id: '1', name: 'Emp Hourly A', role: 'SDE', department: 'Finance', serialNumber: 'W12345678', type: 'Original', status: 'Submitted', reason: 'K03', submissionDate: '01-15-2026', createdBy: 'Rippling', lastUpdatedOn: '01-20-2026', avatarUrl: 'https://i.pravatar.cc/150?img=1' },
  { id: '2', name: 'Catherine Batz', role: 'CEO', department: 'Finance', serialNumber: 'W23456789', type: 'Original', status: 'Draft', reason: 'E05', submissionDate: '—', createdBy: 'Brad Smith', lastUpdatedOn: '01-18-2026', avatarUrl: 'https://i.pravatar.cc/150?img=5', hasErrors: true },
  { id: '3', name: 'Effa Borer', role: 'Account Executive', department: 'Sales', serialNumber: 'W34567890', type: 'Amended', status: 'Draft', reason: 'A01', submissionDate: '—', createdBy: 'Angela Gibbons', lastUpdatedOn: '01-22-2026', avatarUrl: 'https://i.pravatar.cc/150?img=9' },
  { id: '4', name: 'Harman Brakus', role: 'Controller', department: 'Finance', serialNumber: 'W45678901', type: 'Original', status: 'Rejected', reason: 'K07', submissionDate: '01-05-2026', createdBy: 'Rippling', lastUpdatedOn: '01-12-2026', isDisabled: true, avatarUrl: 'https://i.pravatar.cc/150?img=12' },
  { id: '5', name: 'Resd Dfgsfhdg', role: 'Engineer', department: 'Engineering', serialNumber: 'W56789012', type: 'Original', status: 'Approved', reason: 'E11', submissionDate: '01-18-2026', createdBy: 'Brad Smith', lastUpdatedOn: '01-25-2026', avatarUrl: 'https://i.pravatar.cc/150?img=15' },
  { id: '6', name: 'Taniyah Douglas', role: 'Sales Development Rep', department: 'Sales', serialNumber: 'W67890123', type: 'Amended', status: 'Discarded', reason: 'A00', submissionDate: '—', createdBy: 'Angela Gibbons', lastUpdatedOn: '01-08-2026', isDisabled: true, avatarUrl: 'https://i.pravatar.cc/150?img=20' },
  { id: '7', name: 'Lorrie Effertz', role: 'Director of Engineering Ops', department: 'Engineering', serialNumber: 'W78901234', type: 'Original', status: 'Completed', reason: 'K14', submissionDate: '01-12-2026', createdBy: 'Rippling', lastUpdatedOn: '01-19-2026', avatarUrl: 'https://i.pravatar.cc/150?img=25' },
  { id: '8', name: 'Marcus Chen', role: 'Product Manager', department: 'Product', serialNumber: 'W89012345', type: 'Original', status: 'Draft', reason: 'E09', submissionDate: '—', createdBy: 'Brad Smith', lastUpdatedOn: '01-28-2026', avatarUrl: 'https://i.pravatar.cc/150?img=33' },
  { id: '9', name: 'Priya Sharma', role: 'Data Analyst', department: 'Analytics', serialNumber: 'W90123456', type: 'Original', status: 'Approved', reason: 'K02', submissionDate: '01-08-2026', createdBy: 'Angela Gibbons', lastUpdatedOn: '01-14-2026', avatarUrl: 'https://i.pravatar.cc/150?img=41' },
  { id: '10', name: 'James Wilson', role: 'HR Manager', department: 'Human Resources', serialNumber: 'W01234567', type: 'Amended', status: 'Draft', reason: 'A03', submissionDate: '—', createdBy: 'Rippling', lastUpdatedOn: '01-30-2026', avatarUrl: 'https://i.pravatar.cc/150?img=52', hasErrors: true },
  { id: '11', name: 'Sofia Rodriguez', role: 'Marketing Lead', department: 'Marketing', serialNumber: 'W11223344', type: 'Original', status: 'Submitted', reason: 'E02', submissionDate: '01-20-2026', createdBy: 'Brad Smith', lastUpdatedOn: '01-26-2026', avatarUrl: 'https://i.pravatar.cc/150?img=44' },
  { id: '12', name: 'David Kim', role: 'Security Engineer', department: 'Engineering', serialNumber: 'W22334455', type: 'Original', status: 'Rejected', reason: 'K11', submissionDate: '01-03-2026', createdBy: 'Angela Gibbons', lastUpdatedOn: '01-09-2026', isDisabled: true, avatarUrl: 'https://i.pravatar.cc/150?img=57' },
  { id: '13', name: 'Emily Thompson', role: 'Legal Counsel', department: 'Legal', serialNumber: 'W33445566', type: 'Amended', status: 'Completed', reason: 'A05', submissionDate: '01-17-2026', createdBy: 'Rippling', lastUpdatedOn: '01-23-2026', avatarUrl: 'https://i.pravatar.cc/150?img=47' },
  { id: '14', name: 'Michael O\'Brien', role: 'Support Specialist', department: 'Customer Success', serialNumber: 'W44556677', type: 'Original', status: 'Draft', reason: 'E08', submissionDate: '—', createdBy: 'Brad Smith', lastUpdatedOn: '01-29-2026', avatarUrl: 'https://i.pravatar.cc/150?img=60' },
  { id: '15', name: 'Aisha Patel', role: 'UX Designer', department: 'Design', serialNumber: 'W55667788', type: 'Original', status: 'Approved', reason: 'K09', submissionDate: '01-11-2026', createdBy: 'Angela Gibbons', lastUpdatedOn: '01-17-2026', avatarUrl: 'https://i.pravatar.cc/150?img=45' },
  { id: '16', name: 'Robert Garcia', role: 'DevOps Engineer', department: 'Engineering', serialNumber: 'W66778899', type: 'Amended', status: 'Discarded', reason: 'A02', submissionDate: '—', createdBy: 'Rippling', lastUpdatedOn: '01-11-2026', isDisabled: true, avatarUrl: 'https://i.pravatar.cc/150?img=61' },
  { id: '17', name: 'Lisa Chang', role: 'Finance Analyst', department: 'Finance', serialNumber: 'W77889900', type: 'Original', status: 'Draft', reason: 'E04', submissionDate: '—', createdBy: 'Brad Smith', lastUpdatedOn: '01-27-2026', avatarUrl: 'https://i.pravatar.cc/150?img=48' },
  { id: '18', name: 'Tom Anderson', role: 'Solutions Architect', department: 'Engineering', serialNumber: 'W88990011', type: 'Amended', status: 'Completed', reason: 'K06', submissionDate: '01-14-2026', createdBy: 'Angela Gibbons', lastUpdatedOn: '01-21-2026', avatarUrl: 'https://i.pravatar.cc/150?img=53' },
];

// Filter options
const TYPE_OPTIONS = [
  { label: 'Original', value: 'Original' },
  { label: 'Amended', value: 'Amended' },
];

const STATUS_OPTIONS = [
  { label: 'Draft', value: 'Draft' },
  { label: 'Approved', value: 'Approved' },
  { label: 'Submitted', value: 'Submitted' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Rejected', value: 'Rejected' },
  { label: 'Discarded', value: 'Discarded' },
];

// Get unique reasons from data
const REASON_OPTIONS = Array.from(new Set(SAMPLE_EMPLOYEES.map(emp => emp.reason)))
  .sort()
  .map(reason => ({ label: reason, value: reason }));

const CanadaBulkRoeDemo: React.FC = () => {
  const { theme, mode: currentMode } = usePebbleTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [adminMode, setAdminMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [typeFilter, setTypeFilter] = useState('');
  const [reasonFilter, setReasonFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<'all' | 'not_completed' | 'completed'>('all');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [expandedCommentId, setExpandedCommentId] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>(SAMPLE_EMPLOYEES);
  
  // Approval modal state
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvalTargetId, setApprovalTargetId] = useState<string | null>(null);
  const [approvalSubmissionDate, setApprovalSubmissionDate] = useState<Date | null>(null);

  // Filter employees based on search and filters
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      // Segment filter
      if (segmentFilter === 'not_completed') {
        const notCompletedStatuses = ['Draft', 'Approved', 'Submitted', 'Rejected'];
        if (!notCompletedStatuses.includes(emp.status)) return false;
      } else if (segmentFilter === 'completed') {
        const completedStatuses = ['Completed', 'Discarded'];
        if (!completedStatuses.includes(emp.status)) return false;
      }
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = emp.name.toLowerCase().includes(query) || 
               emp.role.toLowerCase().includes(query) ||
               emp.department.toLowerCase().includes(query) ||
               emp.serialNumber.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      
      // Type filter
      if (typeFilter && emp.type !== typeFilter) return false;
      
      // Reason filter
      if (reasonFilter && emp.reason !== reasonFilter) return false;
      
      // Status filter
      if (statusFilter && emp.status !== statusFilter) return false;
      
      return true;
    });
  }, [employees, segmentFilter, searchQuery, typeFilter, reasonFilter, statusFilter]);

  // Get selectable employees (only Draft status without errors)
  const selectableEmployees = useMemo(() => 
    filteredEmployees.filter(emp => emp.status === 'Draft' && !emp.hasErrors),
    [filteredEmployees]
  );

  const allSelectableSelected = selectableEmployees.length > 0 && 
    selectableEmployees.every(emp => selectedRows.has(emp.id));

  const someSelected = selectableEmployees.some(emp => selectedRows.has(emp.id));

  const handleSelectAll = () => {
    if (allSelectableSelected) {
      // All are selected, so deselect all
      const newSelected = new Set(selectedRows);
      selectableEmployees.forEach(emp => newSelected.delete(emp.id));
      setSelectedRows(newSelected);
    } else {
      // Not all selected, so select all
      const newSelected = new Set(selectedRows);
      selectableEmployees.forEach(emp => newSelected.add(emp.id));
      setSelectedRows(newSelected);
    }
  };

  const handleRowSelect = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedRows(newSelected);
  };

  const handleOpenRowDrawer = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedEmployee(null);
  };

  // Get current employee index in filtered list
  const currentEmployeeIndex = selectedEmployee 
    ? filteredEmployees.findIndex(emp => emp.id === selectedEmployee.id)
    : -1;

  const handlePrevEmployee = () => {
    if (currentEmployeeIndex > 0) {
      setSelectedEmployee(filteredEmployees[currentEmployeeIndex - 1]);
    }
  };

  const handleNextEmployee = () => {
    if (currentEmployeeIndex < filteredEmployees.length - 1) {
      setSelectedEmployee(filteredEmployees[currentEmployeeIndex + 1]);
    }
  };

  const handleClearSelection = () => {
    setSelectedRows(new Set());
  };

  const handleResetPrototype = () => {
    // Reset all state to initial values
    setEmployees(SAMPLE_EMPLOYEES);
    setSelectedRows(new Set());
    setSearchQuery('');
    setTypeFilter('');
    setReasonFilter('');
    setStatusFilter('');
    setSegmentFilter('all');
    setIsDrawerOpen(false);
    setSelectedEmployee(null);
    setShowComments(false);
    setExpandedCommentId(null);
    setIsApprovalModalOpen(false);
    setApprovalTargetId(null);
    setApprovalSubmissionDate(null);
  };

  // === ROE State Transition Handlers ===

  // Single ROE: Open approval modal
  const handleApprove = (employeeId: string) => {
    setApprovalTargetId(employeeId);
    setApprovalSubmissionDate(null);
    setIsApprovalModalOpen(true);
  };

  // Confirm approval with selected date (handles both single and bulk)
  const handleConfirmApproval = () => {
    if (!approvalSubmissionDate) return;
    
    const formattedDate = approvalSubmissionDate.toLocaleDateString('en-US', { 
      month: '2-digit', day: '2-digit', year: 'numeric' 
    }).replace(/\//g, '-');
    const today = new Date().toLocaleDateString('en-US', { 
      month: '2-digit', day: '2-digit', year: 'numeric' 
    }).replace(/\//g, '-');
    
    const isBulkApproval = approvalTargetId === null;
    
    if (isBulkApproval) {
      // Bulk approval: approve all selected draft ROEs
      const approvedCount = [...selectedRows].filter(id => 
        employees.find(emp => emp.id === id && emp.status === 'Draft')
      ).length;
      
      setEmployees(prev => prev.map(emp =>
        selectedRows.has(emp.id) && emp.status === 'Draft'
          ? { ...emp, status: 'Approved', submissionDate: formattedDate, lastUpdatedOn: today }
          : emp
      ));
      setSelectedRows(new Set());
      
      // Show success snackbar for bulk
      const readableDate = approvalSubmissionDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      Snackbar.success(`${approvedCount} ROE${approvedCount > 1 ? 's' : ''} approved, will submit on ${readableDate}`);
    } else {
      // Single approval
      setEmployees(prev => prev.map(emp =>
        emp.id === approvalTargetId 
          ? { ...emp, status: 'Approved', submissionDate: formattedDate, lastUpdatedOn: today } 
          : emp
      ));
      
      // Update drawer state if viewing this employee
      if (selectedEmployee?.id === approvalTargetId) {
        setSelectedEmployee(prev => prev 
          ? { ...prev, status: 'Approved', submissionDate: formattedDate, lastUpdatedOn: today } 
          : null
        );
      }
      
      // Show success snackbar
      const readableDate = approvalSubmissionDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      Snackbar.success(`ROE approved, will submit on ${readableDate}`);
    }

    // Close modal and reset
    setIsApprovalModalOpen(false);
    setApprovalTargetId(null);
    setApprovalSubmissionDate(null);
  };

  // Cancel approval modal
  const handleCancelApproval = () => {
    setIsApprovalModalOpen(false);
    setApprovalTargetId(null);
    setApprovalSubmissionDate(null);
  };

  // Single ROE: Unapprove (Approved → Draft)
  const handleUnapprove = (employeeId: string) => {
    setEmployees(prev => prev.map(emp =>
      emp.id === employeeId ? { ...emp, status: 'Draft' } : emp
    ));
    if (selectedEmployee?.id === employeeId) {
      setSelectedEmployee(prev => prev ? { ...prev, status: 'Draft' } : null);
    }
  };

  // Single ROE: Refresh/Recalculate (stays in current state, updates lastUpdatedOn)
  const handleRefresh = (employeeId: string) => {
    const today = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    setEmployees(prev => prev.map(emp =>
      emp.id === employeeId ? { ...emp, lastUpdatedOn: today } : emp
    ));
    if (selectedEmployee?.id === employeeId) {
      setSelectedEmployee(prev => prev ? { ...prev, lastUpdatedOn: today } : null);
    }
  };

  // Bulk: Open approval modal for selected drafts
  const handleBulkApprove = () => {
    setApprovalTargetId(null); // null indicates bulk approval
    setApprovalSubmissionDate(null);
    setIsApprovalModalOpen(true);
  };

  // Bulk: Discard (Draft → Discarded)
  const handleBulkDiscard = () => {
    const today = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    setEmployees(prev => prev.map(emp =>
      selectedRows.has(emp.id) && emp.status === 'Draft'
        ? { ...emp, status: 'Discarded', lastUpdatedOn: today }
        : emp
    ));
    setSelectedRows(new Set());
  };

  const getStatusAppearance = (status: string) => {
    switch (status) {
      case 'Approved':
        return Status.APPEARANCES.PRIMARY;
      case 'Draft':
        return Status.APPEARANCES.DISABLED;
      case 'Discarded':
        return Status.APPEARANCES.WARNING;
      default:
        return Status.APPEARANCES.DISABLED;
    }
  };


  // Main navigation items
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
      { id: 'payroll', label: 'Payroll', icon: Icon.TYPES.DOLLAR_CIRCLE_OUTLINE, hasSubmenu: true, isActive: true },
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

  return (
    <AppContainer theme={theme}>
      {/* Top Navigation */}
      <TopNavBar
        companyName="Acme, Inc."
        userInitial="A"
        adminMode={adminMode}
        currentMode={currentMode as 'light' | 'dark'}
        searchPlaceholder="Search or jump to..."
        onAdminModeToggle={() => setAdminMode(!adminMode)}
        showNotificationBadge
        notificationCount={2}
        theme={theme}
      />

      {/* Left Sidebar */}
      <Sidebar
        mainSections={[orgChartSection, appsSection]}
        platformSection={platformSection}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        theme={theme}
      />

      {/* Main Content Area */}
      <MainContent theme={theme} sidebarCollapsed={sidebarCollapsed}>
        <BreadcrumbWrapper theme={theme}>
          <Breadcrumb
            items={[
              { title: 'Action required', value: 'action-required' },
              { title: 'Record of Employment (ROE)', value: 'roe' },
            ]}
            active="roe"
          />
        </BreadcrumbWrapper>
        <PageHeaderWrapper theme={theme}>
          <Page.Header
            title="Record of Employment (ROE)"
            size={Page.Header.SIZES.FLUID}
            shouldBeUnderlined
          />
        </PageHeaderWrapper>

        <TableContainer theme={theme}>
          <Card.Layout padding={Card.Layout.PADDINGS.PX_24}>
            <TableHeader theme={theme}>
              <Input.SegmentedControl
                size={Input.SegmentedControl.SIZES.S}
                value={segmentFilter}
                onChange={(value: 'all' | 'not_completed' | 'completed') => setSegmentFilter(value)}
                list={[
                  { label: `All · ${employees.length}`, value: 'all' },
                  { label: `Not completed · ${employees.filter(e => ['Draft', 'Approved', 'Submitted', 'Rejected'].includes(e.status)).length}`, value: 'not_completed' },
                  { label: `Completed · ${employees.filter(e => ['Completed', 'Discarded'].includes(e.status)).length}`, value: 'completed' },
                ]}
              />
              <TableActions theme={theme}>
                <Button.Icon
                  icon={Icon.TYPES.EXPAND}
                  appearance={Button.APPEARANCES.OUTLINE}
                  size={Button.SIZES.S}
                  aria-label="Full screen"
                />
              </TableActions>
            </TableHeader>

            <SearchFilterRow theme={theme}>
              <SearchWrapper>
                <Input.Text
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search people and serial numbers"
                  size={Input.Text.SIZES.S}
                  icon={Icon.TYPES.SEARCH_OUTLINE}
                />
              </SearchWrapper>
              <FilterWrapper>
                <Input.Select
                  list={TYPE_OPTIONS}
                  value={typeFilter || undefined}
                  onChange={(val: string) => setTypeFilter(val || '')}
                  size={Input.Select.SIZES.S}
                  placeholder="Type"
                  canClear
                />
              </FilterWrapper>
              <FilterWrapper>
                <Input.Select
                  list={REASON_OPTIONS}
                  value={reasonFilter || undefined}
                  onChange={(val: string) => setReasonFilter(val || '')}
                  size={Input.Select.SIZES.S}
                  placeholder="Reason"
                  canClear
                />
              </FilterWrapper>
              <FilterWrapper>
                <Input.Select
                  list={STATUS_OPTIONS}
                  value={statusFilter || undefined}
                  onChange={(val: string) => setStatusFilter(val || '')}
                  size={Input.Select.SIZES.S}
                  placeholder="Status"
                  canClear
                />
              </FilterWrapper>
            </SearchFilterRow>

            <TableWrapper theme={theme}>
              <TableBasic>
              <TableBasic.THead>
                <TableBasic.Tr>
                  <TableBasic.Th style={{ width: 64, minWidth: 64 }}>
                    {selectableEmployees.length === 0 ? (
                      <Tip
                        content="Only ROEs that are drafts and have no errors can be approved"
                        placement={Tip.PLACEMENTS.TOP}
                      >
                        <span style={{ display: 'inline-flex' }}>
                          <Input.Checkbox
                            value={allSelectableSelected}
                            isIndeterminate={someSelected && !allSelectableSelected}
                            onChange={handleSelectAll}
                            isDisabled
                            aria-label="Select all ready rows"
                          />
                        </span>
                      </Tip>
                    ) : (
                      <Input.Checkbox
                        value={allSelectableSelected}
                        isIndeterminate={someSelected && !allSelectableSelected}
                        onChange={handleSelectAll}
                        aria-label="Select all ready rows"
                      />
                    )}
                  </TableBasic.Th>
                  <TableBasic.Th style={{ width: 200, minWidth: 200 }}>People</TableBasic.Th>
                  <TableBasic.Th>Serial number</TableBasic.Th>
                  <TableBasic.Th>Type</TableBasic.Th>
                  <TableBasic.Th>Status</TableBasic.Th>
                  <TableBasic.Th>Reason</TableBasic.Th>
                  <TableBasic.Th>Created by</TableBasic.Th>
                  <TableBasic.Th>Submission date</TableBasic.Th>
                  <TableBasic.Th>Last updated</TableBasic.Th>
                  <TableBasic.Th style={{ width: 60, minWidth: 60 }}></TableBasic.Th>
                </TableBasic.Tr>
              </TableBasic.THead>
              <TableBasic.TBody>
                {filteredEmployees.map((employee) => (
                  <TableBasic.Tr key={employee.id}>
                    <TableBasic.Td>
                      {employee.status !== 'Draft' || employee.hasErrors ? (
                        <Tip
                          content="Only ROEs that are drafts and have no errors can be approved"
                          placement={Tip.PLACEMENTS.TOP}
                        >
                          <span style={{ display: 'inline-flex' }}>
                            <Input.Checkbox
                              value={selectedRows.has(employee.id)}
                              onChange={() => handleRowSelect(employee.id, !selectedRows.has(employee.id))}
                              isDisabled
                              aria-label={`Select ${employee.name}`}
                            />
                          </span>
                        </Tip>
                      ) : (
                        <Input.Checkbox
                          value={selectedRows.has(employee.id)}
                          onChange={() => handleRowSelect(employee.id, !selectedRows.has(employee.id))}
                          aria-label={`Select ${employee.name}`}
                        />
                      )}
                    </TableBasic.Td>
                    <TableBasic.Td>
                      <EmployeeCell theme={theme}>
                        <Avatar
                          name={employee.name}
                          image={employee.avatarUrl}
                          size={Avatar.SIZES.XS}
                        />
                        <EmployeeInfo>
                          <EmployeeName theme={theme}>{employee.name}</EmployeeName>
                          <EmployeeRole theme={theme}>{employee.role}, {employee.department}</EmployeeRole>
                        </EmployeeInfo>
                      </EmployeeCell>
                    </TableBasic.Td>
                    <TableBasic.Td><CellText theme={theme}>{employee.serialNumber}</CellText></TableBasic.Td>
                    <TableBasic.Td><CellText theme={theme}>{employee.type}</CellText></TableBasic.Td>
                    <TableBasic.Td>
                      <StatusCell theme={theme}>
                        <StatusDot 
                          theme={theme} 
                          statusType={employee.status.toLowerCase() as 'draft' | 'approved' | 'submitted' | 'completed' | 'rejected' | 'discarded'} 
                        />
                        <CellText theme={theme}>{employee.status}</CellText>
                        {employee.hasErrors && (
                          <Tip content="Has errors, open to view" placement={Tip.PLACEMENTS.TOP}>
                            <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center' }}>
                              <Icon 
                                type={Icon.TYPES.WARNING_TRIANGLE_FILLED} 
                                size={16} 
                                color={theme.colorError} 
                              />
                            </span>
                          </Tip>
                        )}
                      </StatusCell>
                    </TableBasic.Td>
                    <TableBasic.Td><CellText theme={theme}>{employee.reason}</CellText></TableBasic.Td>
                    <TableBasic.Td><CellText theme={theme}>{employee.createdBy}</CellText></TableBasic.Td>
                    <TableBasic.Td><CellText theme={theme}>{employee.submissionDate}</CellText></TableBasic.Td>
                    <TableBasic.Td><CellText theme={theme}>{employee.lastUpdatedOn}</CellText></TableBasic.Td>
                    <TableBasic.Td>
                      <Button.Icon
                        icon={Icon.TYPES.CHEVRON_RIGHT}
                        appearance={Button.APPEARANCES.GHOST}
                        size={Button.SIZES.S}
                        aria-label={`View details for ${employee.name}`}
                        onClick={() => handleOpenRowDrawer(employee)}
                      />
                    </TableBasic.Td>
                  </TableBasic.Tr>
                ))}
              </TableBasic.TBody>
            </TableBasic>
            </TableWrapper>
          </Card.Layout>
        </TableContainer>
      </MainContent>

      <Drawer
        isVisible={isDrawerOpen}
        onCancel={handleCloseDrawer}
        title={
          selectedEmployee
            ? {
                kind: DrawerTitleKinds.BREADCRUMB,
                props: {
                  items: [
                    { title: 'Record of Employment (ROE)', value: 'roe' },
                    { title: selectedEmployee.name, value: selectedEmployee.id },
                  ],
                  active: selectedEmployee.id,
                  onClick: (item) => {
                    if (item.value === 'roe') handleCloseDrawer();
                  },
                },
              }
            : undefined
        }
        actionsJsx={
          selectedEmployee && (
            <ItemNavigator theme={theme}>
              <Button.Icon
                icon={Icon.TYPES.CHEVRON_LEFT}
                appearance={Button.APPEARANCES.GHOST}
                size={Button.SIZES.S}
                onClick={handlePrevEmployee}
                isDisabled={currentEmployeeIndex <= 0}
                aria-label="Previous employee"
              />
              <ItemNavigatorText theme={theme}>
                <strong>{currentEmployeeIndex + 1}</strong> of <strong>{filteredEmployees.length}</strong> employees
              </ItemNavigatorText>
              <Button.Icon
                icon={Icon.TYPES.CHEVRON_RIGHT}
                appearance={Button.APPEARANCES.GHOST}
                size={Button.SIZES.S}
                onClick={handleNextEmployee}
                isDisabled={currentEmployeeIndex >= filteredEmployees.length - 1}
                aria-label="Next employee"
              />
            </ItemNavigator>
          )
        }
        width={900}
      >
        {selectedEmployee && (
          <VStack gap="24px">
          {selectedEmployee.status === 'Rejected' && (
              <Notice.Error
                title="Rejected reason"
                description="This was rejected because of xyz. To fix this do xyz to xyz."
                isFluid
              />
          )}
          {selectedEmployee.status === 'Draft' && selectedEmployee.hasErrors && (
              <Notice.Error
                title="Fix errors before approving"
                description="Here are what the errors are for on this ROE. Go here or do this to fix xyz."
                isFluid
              />
          )}
          <ObjectUI.Template>
              <ObjectUI.Header
                title={
                  <HStack gap={theme.space200} alignItems="center">
                    <span>{selectedEmployee.name}</span>
                    <StatusCell theme={theme} style={{ width: 'auto' }}>
                      <StatusDot
                        theme={theme}
                        statusType={selectedEmployee.status.toLowerCase() as 'draft' | 'approved' | 'submitted' | 'completed' | 'rejected' | 'discarded'}
                      />
                      <CellText theme={theme}>{selectedEmployee.status}</CellText>
                    </StatusCell>
                  </HStack>
                }
                avatarProps={{
                  image: selectedEmployee.avatarUrl,
                  isRound: true,
                }}
                primaryAction={
                  selectedEmployee.status === 'Draft' && !selectedEmployee.hasErrors
                    ? {
                        label: 'Approve',
                        size: Button.SIZES.S,
                        icon: Icon.TYPES.APPROVAL_OUTLINE,
                        onClick: () => handleApprove(selectedEmployee.id),
                      }
                    : undefined
                }
                actions={{
                  limit: 4,
                  list: selectedEmployee.status === 'Draft' && selectedEmployee.hasErrors
                    ? [
                        {
                          type: ObjectUI.Header.ACTION_TYPES.BUTTON,
                          props: {
                            label: 'Approve',
                            icon: Icon.TYPES.APPROVAL_OUTLINE,
                            appearance: Button.APPEARANCES.PRIMARY,
                            size: Button.SIZES.S,
                            onClick: () => {},
                            isDisabled: true,
                          },
                        },
                        {
                          type: ObjectUI.Header.ACTION_TYPES.BUTTON,
                          props: {
                            label: 'Refresh',
                            icon: Icon.TYPES.REFRESH_OUTLINE,
                            appearance: Button.APPEARANCES.OUTLINE,
                            size: Button.SIZES.S,
                            onClick: () => handleRefresh(selectedEmployee.id),
                          },
                        },
                        {
                          type: ObjectUI.Header.ACTION_TYPES.ICON,
                          props: {
                            iconType: Icon.TYPES.MORE_VERTICAL,
                            onClick: () => {},
                            'aria-label': 'More options',
                          },
                        },
                      ]
                    : selectedEmployee.status === 'Draft'
                    ? [
                        {
                          type: ObjectUI.Header.ACTION_TYPES.BUTTON,
                          props: {
                            label: 'Refresh',
                            icon: Icon.TYPES.REFRESH_OUTLINE,
                            appearance: Button.APPEARANCES.OUTLINE,
                            size: Button.SIZES.S,
                            onClick: () => handleRefresh(selectedEmployee.id),
                          },
                        },
                        {
                          type: ObjectUI.Header.ACTION_TYPES.ICON,
                          props: {
                            iconType: Icon.TYPES.MORE_VERTICAL,
                            onClick: () => {},
                            'aria-label': 'More options',
                          },
                        },
                      ]
                    : selectedEmployee.status === 'Approved'
                    ? [
                        {
                          type: ObjectUI.Header.ACTION_TYPES.BUTTON,
                          props: {
                            label: 'Unapprove',
                            icon: Icon.TYPES.APPROVAL_OUTLINE,
                            appearance: Button.APPEARANCES.OUTLINE,
                            size: Button.SIZES.S,
                            onClick: () => handleUnapprove(selectedEmployee.id),
                          },
                        },
                        {
                          type: ObjectUI.Header.ACTION_TYPES.ICON,
                          props: {
                            iconType: Icon.TYPES.MORE_VERTICAL,
                            onClick: () => {},
                            'aria-label': 'More options',
                          },
                        },
                      ]
                    : [
                        {
                          type: ObjectUI.Header.ACTION_TYPES.ICON,
                          props: {
                            iconType: Icon.TYPES.MORE_VERTICAL,
                            onClick: () => {},
                            'aria-label': 'More options',
                          },
                        },
                      ],
                }}
              />
              <ObjectUI.Stats
                list={[
                  {
                    label: 'Serial number',
                    renderer: ObjectUI.Stats.Renderer.TextRenderer,
                    props: { value: selectedEmployee.serialNumber },
                  },
                  {
                    label: 'Type',
                    renderer: ObjectUI.Stats.Renderer.TextRenderer,
                    props: { value: selectedEmployee.type },
                  },
                  {
                    label: 'Reason',
                    renderer: ObjectUI.Stats.Renderer.TextRenderer,
                    props: { value: selectedEmployee.reason },
                  },
                  {
                    label: 'Created by',
                    renderer: ObjectUI.Stats.Renderer.TextRenderer,
                    props: { value: selectedEmployee.createdBy },
                  },
                  {
                    label: 'Submission date',
                    renderer: ObjectUI.Stats.Renderer.TextRenderer,
                    props: { value: selectedEmployee.submissionDate },
                  },
                  {
                    label: 'Last updated',
                    renderer: ObjectUI.Stats.Renderer.TextRenderer,
                    props: { value: selectedEmployee.lastUpdatedOn },
                  },
                ]}
              />
            </ObjectUI.Template>

            <FormNoMargin>
              <Form
                isSettings={{
                  editButton: selectedEmployee.status === 'Draft',
                }}
                title="ROE details"
              >
                <Form.Group title="Employee information">
                  <Form.Input.Text 
                    defaultValue={selectedEmployee.name} 
                    name="employee_name" 
                    title="Employee name" 
                  />
                  <Form.Input.Text 
                    defaultValue={selectedEmployee.role} 
                    name="job_title" 
                    title="Job title" 
                  />
                  <Form.Input.Text 
                    defaultValue={selectedEmployee.department} 
                    name="department" 
                    title="Department" 
                  />
                </Form.Group>
                <Form.Group title="ROE information">
                  <Form.Input.Text 
                    defaultValue={selectedEmployee.serialNumber} 
                    name="serial_number" 
                    title="Serial number" 
                  />
                  <Form.Input.Text 
                    defaultValue={selectedEmployee.type} 
                    name="roe_type" 
                    title="Type" 
                  />
                  <Form.Input.Text 
                    defaultValue={selectedEmployee.reason} 
                    name="reason" 
                    title="Reason for issuing" 
                  />
                </Form.Group>
              </Form>
            </FormNoMargin>
          </VStack>
        )}
      </Drawer>

      {/* Approval Modal */}
      <Modal
        isVisible={isApprovalModalOpen}
        onCancel={handleCancelApproval}
        title="Select submission date"
        width={340}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '-8px' }}>
          <Calendar
            value={approvalSubmissionDate ? [approvalSubmissionDate.toISOString().split('T')[0]] : []}
            onClick={(date: Date) => setApprovalSubmissionDate(date)}
            shouldShowFooter={false}
          />
        </div>
        <Modal.Footer>
          <Modal.CloseButton>Cancel</Modal.CloseButton>
          <Button
            appearance={Button.APPEARANCES.PRIMARY}
            onClick={handleConfirmApproval}
            isDisabled={!approvalSubmissionDate}
          >
            Submit
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Bulk Action Bar */}
      <ActionBarContainer isVisible={selectedRows.size > 0}>
        <ActionBarContent theme={theme}>
          {/* Close button */}
          <Button.Icon
            icon={Icon.TYPES.CLOSE}
            appearance={Button.APPEARANCES.GHOST}
            size={Button.SIZES.S}
            onClick={handleClearSelection}
            aria-label="Clear selection"
          />

          {/* Selection count */}
          <ActionBarText theme={theme}>
            {selectedRows.size}/{filteredEmployees.length} selected
          </ActionBarText>

          <ActionBarSeparator theme={theme} />

          {/* Approve button */}
          <Button
            icon={Icon.TYPES.APPROVAL_OUTLINE}
            appearance={Button.APPEARANCES.GHOST}
            size={Button.SIZES.S}
            onClick={handleBulkApprove}
          >
            Approve
          </Button>

          {/* Discard button */}
          <Button
            icon={Icon.TYPES.TRASH_OUTLINE}
            appearance={Button.APPEARANCES.GHOST}
            size={Button.SIZES.S}
            onClick={handleBulkDiscard}
          >
            Discard
          </Button>

          {/* More actions button */}
          <Button.Icon
            icon={Icon.TYPES.MORE_HORIZONTAL}
            appearance={Button.APPEARANCES.GHOST}
            size={Button.SIZES.S}
            onClick={() => {}}
            aria-label="More actions"
          />
        </ActionBarContent>
      </ActionBarContainer>

      {/* Floating Comments */}
      {SAMPLE_COMMENTS.map((comment) => {
        // Show drawer comments only when drawer is open, show non-drawer comments only when drawer is closed
        // Also check if comment requires specific conditions (errors, rejected status, draft status)
        const meetsErrorCondition = !comment.showWhenHasErrors || (selectedEmployee?.hasErrors ?? false);
        const meetsRejectedCondition = !comment.showWhenRejected || (selectedEmployee?.status === 'Rejected');
        const meetsDraftCondition = !comment.showWhenDraft || (selectedEmployee?.status === 'Draft');
        const isCommentVisible = showComments && (comment.drawerOnly ? isDrawerOpen : !isDrawerOpen) && meetsErrorCondition && meetsRejectedCondition && meetsDraftCondition;
        return (
        <React.Fragment key={comment.id}>
          <CommentIndicator
            theme={theme}
            isVisible={isCommentVisible}
            style={{ top: comment.top, left: comment.left }}
            onClick={() => setExpandedCommentId(expandedCommentId === comment.id ? null : comment.id)}
          >
            <Icon type={Icon.TYPES.COMMENTS_FILLED} size={14} color={theme.colorOnPrimary} />
          </CommentIndicator>
          <FloatingCommentContainer
            theme={theme}
            isVisible={isCommentVisible && expandedCommentId === comment.id}
            style={{ 
              top: comment.top + 30, 
              left: comment.left > 1200 ? comment.left - 280 : comment.left 
            }}
          >
            <CommentHeader theme={theme}>
              <CommentAuthor theme={theme}>{comment.author}</CommentAuthor>
            </CommentHeader>
            <CommentContent theme={theme}>{comment.content}</CommentContent>
          </FloatingCommentContainer>
        </React.Fragment>
        );
      })}

      {/* Floating Action Buttons */}
      <FloatingButtonsContainer theme={theme}>
        <Tip content="Toggle comments" placement={Tip.PLACEMENTS.LEFT}>
          <FloatingButton
            theme={theme}
            isActive={showComments}
            onClick={() => setShowComments(!showComments)}
            aria-label="Toggle comments"
          >
            <Icon
              type={Icon.TYPES.COMMENTS_OUTLINE}
              size={24}
              color={showComments ? theme.colorOnPrimary : theme.colorOnSurface}
            />
          </FloatingButton>
        </Tip>
        <Tip content="Reset prototype" placement={Tip.PLACEMENTS.LEFT}>
          <FloatingButton
            theme={theme}
            onClick={handleResetPrototype}
            aria-label="Reset prototype"
          >
            <Icon
              type={Icon.TYPES.REFRESH_OUTLINE}
              size={24}
              color={theme.colorOnSurface}
            />
          </FloatingButton>
        </Tip>
      </FloatingButtonsContainer>
    </AppContainer>
  );
};

export default CanadaBulkRoeDemo;
