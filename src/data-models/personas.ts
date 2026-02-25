import type { PersonaId, ZoneMapping } from './types';

export const PERSONA_OPTIONS: { id: PersonaId; label: string; avatar: string }[] = [
  { id: 'hourly_operator', label: 'Hourly Operator', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
  { id: 'employee_self_service', label: 'Employee Self-Service', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face' },
  { id: 'frontline_shift_manager', label: 'Frontline Shift Manager', avatar: 'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=100&h=100&fit=crop&crop=face' },
  { id: 'people_manager', label: 'People Manager (Knowledge Work)', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face' },
  { id: 'functional_admin', label: 'Functional Admin', avatar: 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=100&h=100&fit=crop&crop=face' },
  { id: 'executive_owner', label: 'Executive / Owner', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop&crop=face' },
  { id: 'contractor', label: 'Contractor', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face' },
];

const PERSONA_ZONE_MAP: Record<PersonaId, ZoneMapping> = {
  hourly_operator: {
    primary: ['shift_clock'],
    core: ['quick_actions'],
    contextual: ['earnings_summary'],
    discovery: ['apps_list', 'inbox_preview'],
  },
  contractor: {
    primary: ['earnings_summary'],
    core: ['quick_actions'],
    contextual: ['inbox_preview'],
    discovery: ['apps_list'],
  },
  frontline_shift_manager: {
    primary: ['shift_clock'],
    core: ['quick_actions'],
    contextual: ['team_status', 'earnings_summary'],
    discovery: ['apps_list', 'inbox_preview'],
  },
  employee_self_service: {
    primary: ['inbox_preview'],
    core: ['quick_actions'],
    contextual: ['earnings_summary'],
    discovery: ['apps_list'],
  },
  people_manager: {
    primary: ['inbox_preview'],
    core: ['quick_actions'],
    contextual: ['team_status', 'earnings_summary'],
    discovery: ['apps_list'],
  },
  functional_admin: {
    primary: ['admin_insights'],
    core: ['quick_actions'],
    contextual: ['inbox_preview'],
    discovery: ['apps_list'],
  },
  executive_owner: {
    primary: ['admin_insights'],
    core: ['quick_actions'],
    contextual: ['inbox_preview'],
    discovery: ['apps_list'],
  },
};

export const HOURLY_PERSONAS: PersonaId[] = ['hourly_operator', 'frontline_shift_manager'];

export const PERSONA_DERIVATION: Record<PersonaId, { property: string; value: string }[]> = {
  hourly_operator: [
    { property: 'Employment type', value: 'Hourly' },
    { property: 'Manager', value: 'No' },
    { property: 'Admin status', value: 'None' },
  ],
  employee_self_service: [
    { property: 'Employment type', value: 'Salaried' },
    { property: 'Manager', value: 'No' },
    { property: 'Admin status', value: 'None' },
  ],
  frontline_shift_manager: [
    { property: 'Employment type', value: 'Hourly' },
    { property: 'Manager', value: 'Yes' },
    { property: 'Admin status', value: 'None' },
  ],
  people_manager: [
    { property: 'Employment type', value: 'Salaried' },
    { property: 'Manager', value: 'Yes' },
    { property: 'Admin status', value: 'None' },
  ],
  functional_admin: [
    { property: 'Employment type', value: 'Salaried' },
    { property: 'Manager', value: 'No' },
    { property: 'Admin status', value: 'Partial' },
  ],
  executive_owner: [
    { property: 'Employment type', value: 'Salaried' },
    { property: 'Manager', value: 'Yes' },
    { property: 'Admin status', value: 'Full' },
    { property: 'Company owner', value: 'Yes' },
  ],
  contractor: [
    { property: 'Employment type', value: 'Contractor' },
    { property: 'Manager', value: 'No' },
    { property: 'Admin status', value: 'None' },
  ],
};

export function getIntentSummary(persona: PersonaId): { employment: string; manager: string; admin: string; owner?: string } {
  const d = PERSONA_DERIVATION[persona];
  const owner = d.find(x => x.property === 'Company owner')?.value;
  return {
    employment: d.find(x => x.property === 'Employment type')?.value ?? '',
    manager: d.find(x => x.property === 'Manager')?.value ?? '—',
    admin: d.find(x => x.property === 'Admin status')?.value ?? '—',
    ...(owner && { owner }),
  };
}

export function getZoneWidgets(persona: PersonaId, onboarding: boolean, enabledApps: Set<string>): ZoneMapping {
  const base = PERSONA_ZONE_MAP[persona] ?? PERSONA_ZONE_MAP.hourly_operator;
  const hasPaySku = enabledApps.has('my_pay');
  const showEarningsSummary = hasPaySku || persona === 'people_manager' || persona === 'frontline_shift_manager';
  const filter = (ids: string[]) =>
    ids.filter(id => id !== 'earnings_summary' || showEarningsSummary);
  return {
    primary: onboarding ? filter(['onboarding_setup', ...base.primary]) : filter(base.primary),
    core: filter(base.core),
    contextual: filter(base.contextual),
    discovery: filter(base.discovery),
  };
}
