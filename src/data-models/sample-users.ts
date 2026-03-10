import type { PersonaId } from './types';
import { PERSONA_OPTIONS } from './personas';
import { PERSONA_DEFAULT_SKUS } from './apps';

export interface SampleUser {
  id: string;
  name: string;
  company: string;
  avatar: string;
  persona: PersonaId;
  enabledApps?: string[];
  onboarding?: boolean;
}

export const SAMPLE_USERS: SampleUser[] = [
  {
    id: 'maria-chen',
    name: 'Maria Chen',
    company: 'Acme Coffee',
    avatar: PERSONA_OPTIONS.find(p => p.id === 'hourly_operator')!.avatar,
    persona: 'hourly_operator',
    enabledApps: PERSONA_DEFAULT_SKUS.hourly_operator,
    onboarding: false,
  },
  {
    id: 'sarah-kim',
    name: 'Sarah Kim',
    company: 'Startup Inc',
    avatar: PERSONA_OPTIONS.find(p => p.id === 'employee_self_service')!.avatar,
    persona: 'employee_self_service',
    enabledApps: PERSONA_DEFAULT_SKUS.employee_self_service,
    onboarding: false,
  },
  {
    id: 'james-park',
    name: 'James Park',
    company: 'Acme Coffee',
    avatar: PERSONA_OPTIONS.find(p => p.id === 'frontline_shift_manager')!.avatar,
    persona: 'frontline_shift_manager',
    enabledApps: PERSONA_DEFAULT_SKUS.frontline_shift_manager,
    onboarding: false,
  },
  {
    id: 'david-nguyen',
    name: 'David Nguyen',
    company: 'Tech Corp',
    avatar: PERSONA_OPTIONS.find(p => p.id === 'people_manager')!.avatar,
    persona: 'people_manager',
    enabledApps: PERSONA_DEFAULT_SKUS.people_manager,
    onboarding: false,
  },
  {
    id: 'emma-wilson',
    name: 'Emma Wilson',
    company: 'Startup Inc',
    avatar: PERSONA_OPTIONS.find(p => p.id === 'functional_admin')!.avatar,
    persona: 'functional_admin',
    enabledApps: PERSONA_DEFAULT_SKUS.functional_admin,
    onboarding: false,
  },
  {
    id: 'michael-roberts',
    name: 'Michael Roberts',
    company: 'Tech Corp',
    avatar: PERSONA_OPTIONS.find(p => p.id === 'executive_owner')!.avatar,
    persona: 'executive_owner',
    enabledApps: PERSONA_DEFAULT_SKUS.executive_owner,
    onboarding: false,
  },
  {
    id: 'alex-jordan',
    name: 'Alex Jordan',
    company: 'Contractor Co',
    avatar: PERSONA_OPTIONS.find(p => p.id === 'contractor')!.avatar,
    persona: 'contractor',
    enabledApps: PERSONA_DEFAULT_SKUS.contractor,
    onboarding: false,
  },
];
