import type { PersonaId } from '@/data-models/types';
import type { SkuFlags, SkuId } from '@/data-models/quick-actions';
import type { WidgetAction } from './types';

export const WIDGET_LABEL_OVERRIDES: Record<string, string> = {
  shift_clock: 'Upcoming shift',
  inbox_preview: 'Inbox queue (task/approvals)',
  quick_actions: 'Shortcuts',
  recently_visited: 'Recently visited',
};

export const WIDGET_ACTIONS: Record<string, WidgetAction[]> = {
  shift_clock: [
    { label: 'My schedule', variant: 'secondary' },
    { label: 'Clock in', variant: 'primary' },
  ],
};

export const EARNINGS_TITLE_BY_PERSONA: Partial<Record<PersonaId, string>> = {
  hourly_operator: 'My Pay',
  contractor: 'Invoices',
  employee_self_service: 'My Pay',
  people_manager: 'My Pay',
  frontline_shift_manager: 'My Pay',
  functional_admin: 'My Pay',
  executive_owner: 'My Pay',
};

const ADMIN_PERSONAS: PersonaId[] = ['functional_admin', 'executive_owner'];

export function widgetIdToTitle(id: string, persona?: PersonaId): string {
  if (id === 'inbox_preview' && persona === 'employee_self_service') return 'Priority tasks';
  if (id === 'inbox_preview' && persona && ADMIN_PERSONAS.includes(persona)) return 'Needs my review';
  if (id === 'earnings_summary' && persona && EARNINGS_TITLE_BY_PERSONA[persona]) return EARNINGS_TITLE_BY_PERSONA[persona]!;
  if (WIDGET_LABEL_OVERRIDES[id]) return WIDGET_LABEL_OVERRIDES[id];
  return id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export const SKU_ID_MAP: Record<string, SkuId> = {
  time_off: 'time_off',
  scheduling: 'scheduling',
  time_attendance: 'time_tracking',
  time_standalone: 'time_tracking',
  my_pay: 'my_pay',
  my_benefits: 'my_benefits',
  spend_management: 'spend_management',
  people_directory: 'people_directory',
  travel: 'travel',
  chat: 'chat',
};

export const SKU_MULTI_MAP: Record<string, SkuId[]> = {
  time_standalone: ['time_tracking', 'scheduling'],
};

export function enabledAppsToSkuFlags(enabledApps: Set<string>): SkuFlags {
  const flags: SkuFlags = {};
  for (const appId of enabledApps) {
    const multi = SKU_MULTI_MAP[appId];
    if (multi) {
      for (const s of multi) flags[s] = true;
    } else {
      const skuId = SKU_ID_MAP[appId];
      if (skuId) flags[skuId] = true;
    }
  }
  return flags;
}
