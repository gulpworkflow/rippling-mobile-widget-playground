import Icon from '@rippling/pebble/Icon';
import type { AppItem, PersonaId } from './types';

export const ALL_APPS: AppItem[] = [
  // HR
  { id: 'people_directory', label: 'People Directory', group: 'HR', icon: Icon.TYPES.USERS_FILLED },
  { id: 'chat', label: 'Chat', group: 'HR', icon: Icon.TYPES.COMMENTS_FILLED, hideFromAppList: true },
  { id: 'time_off', label: 'Time Off (PTO)', displayName: 'Time Off', group: 'HR', icon: Icon.TYPES.UNLIMITED_PTO_FILLED },
  { id: 'time_attendance', label: 'Time & Attendance', group: 'HR', icon: Icon.TYPES.TIME_FILLED },
  { id: 'scheduling', label: 'Scheduling', group: 'HR', icon: Icon.TYPES.CALENDAR_FILLED },
  { id: 'time_standalone', label: 'Time (Standalone)', displayName: 'Time', group: 'HR', icon: Icon.TYPES.TIME_FILLED },
  { id: 'learn', label: 'Learn', group: 'HR', icon: Icon.TYPES.COURSES_FILLED },
  { id: 'surveys', label: 'Surveys', group: 'HR', icon: Icon.TYPES.SURVEY_SATISFIED_FILLED },
  { id: 'my_benefits', label: 'My Benefits', group: 'HR', icon: Icon.TYPES.HEART_FILLED },
  { id: 'news_feed', label: 'News Feed', displayName: 'News', group: 'HR', icon: Icon.TYPES.NEWSPAPER_FILLED },
  // Finance
  { id: 'my_pay', label: 'My Pay', group: 'Finance', icon: Icon.TYPES.DOLLAR_CIRCLE_FILLED },
  { id: 'spend_management', label: 'Spend Management', displayName: 'Spend', group: 'Finance', icon: Icon.TYPES.CREDIT_CARD_FILLED },
  { id: 'travel', label: 'Travel', group: 'Finance', icon: Icon.TYPES.TRAVEL_FILLED },
  // IT
  { id: 'passwords', label: 'Passwords', group: 'IT', icon: Icon.TYPES.LOCK_FILLED },
];

export const APP_GROUPS = ['HR', 'Finance', 'IT'] as const;

export const PERSONA_DEFAULT_SKUS: Record<PersonaId, string[]> = {
  hourly_operator: [
    'time_off', 'time_standalone', 'my_pay', 'people_directory', 'chat',
  ],
  employee_self_service: [
    'time_off', 'my_pay', 'my_benefits', 'spend_management', 'people_directory', 'travel', 'chat',
  ],
  frontline_shift_manager: [
    'time_off', 'time_attendance', 'scheduling', 'my_pay', 'people_directory', 'chat',
  ],
  people_manager: [
    'time_off', 'my_pay', 'my_benefits', 'spend_management', 'people_directory', 'chat',
  ],
  functional_admin: [
    'time_off', 'my_pay', 'my_benefits', 'people_directory', 'passwords', 'chat',
  ],
  executive_owner: [
    'time_off', 'my_pay', 'my_benefits', 'spend_management', 'people_directory', 'chat',
  ],
  contractor: [
    'my_pay', 'spend_management', 'time_attendance', 'time_standalone', 'people_directory', 'chat',
  ],
};
