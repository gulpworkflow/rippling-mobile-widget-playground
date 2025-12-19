/**
 * Type definitions for Composition Manager
 */

export interface Composition {
  id: string;
  name: string;
  systemName: string;
  usedIn: string[]; // Array of app names
  createdBy: string;
  createdDate: string; // ISO date string
  isMockData?: boolean; // Flag to identify mock vs user-created
}

/**
 * Mock compositions for demo purposes
 */
export const MOCK_COMPOSITIONS: Composition[] = [
  {
    id: 'comp-1',
    name: 'Employee Onboarding Flow',
    systemName: 'employee_onboarding_v2',
    usedIn: ['HR Portal', 'Manager Dashboard'],
    createdBy: 'Sarah Chen',
    createdDate: '2024-10-15T10:30:00Z',
    isMockData: true,
  },
  {
    id: 'comp-2',
    name: 'Time Off Request Widget',
    systemName: 'time_off_request_widget',
    usedIn: ['Employee Self-Service'],
    createdBy: 'David Miller',
    createdDate: '2024-09-22T14:15:00Z',
    isMockData: true,
  },
  {
    id: 'comp-3',
    name: 'Performance Review Template',
    systemName: 'perf_review_template_q4',
    usedIn: ['Performance App', 'Manager Dashboard'],
    createdBy: 'Emily Rodriguez',
    createdDate: '2024-11-01T09:00:00Z',
    isMockData: true,
  },
  {
    id: 'comp-4',
    name: 'Benefits Enrollment Wizard',
    systemName: 'benefits_enrollment_wizard',
    usedIn: ['Benefits Portal'],
    createdBy: 'Michael Thompson',
    createdDate: '2024-08-30T16:45:00Z',
    isMockData: true,
  },
  {
    id: 'comp-5',
    name: 'Payroll Summary Card',
    systemName: 'payroll_summary_card_v3',
    usedIn: ['Payroll App', 'Employee Self-Service', 'Admin Console'],
    createdBy: 'Jessica Lee',
    createdDate: '2024-10-10T11:20:00Z',
    isMockData: true,
  },
];

