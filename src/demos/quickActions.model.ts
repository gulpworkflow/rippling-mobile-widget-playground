// ─── Quick Actions Data Model (Mobile V1) ───────────────────────────────
//
// Pure, deterministic data model for resolving which Quick Actions to show
// on the mobile home screen. No UI, no side effects.
//
// Source: Mobile V1 Proposal — Quick Actions (Feb 2026)
//
// Persona-driven design:
// - Manager vs self-service is the primary distinction. Manager-only actions
//   (approvals, review timesheets, assign shifts) are hidden from hourly_operator,
//   employee_self_service, and contractor.
// - Self-service personas get PTO Balances (not PTO Approvals), their own expenses,
//   and personal finance/benefits actions.

// ─── Types ───────────────────────────────────────────────────────────────

export type PersonaId =
  | 'hourly_operator'
  | 'employee_self_service'
  | 'frontline_shift_manager'
  | 'people_manager'
  | 'functional_admin'
  | 'executive_owner'
  | 'contractor';

export type QuickActionId =
  | 'request_time_off'
  | 'view_my_schedule'
  | 'view_my_timecard'
  | 'pick_up_shift'
  | 'view_pto_balances'
  | 'view_team_schedule'
  | 'view_paystubs'
  | 'update_bank_account'
  | 'view_tax_documents'
  | 'view_my_benefits'
  | 'submit_expense'
  | 'scan_receipt'
  | 'log_mileage'
  | 'people_directory'
  | 'view_documents'
  | 'shift_swaps'
  | 'edit_availability'
  | 'team_schedule'
  | 'review_timesheets'
  | 'assign_shifts'
  | 'message_team'
  // Extended actions (bottom of ranking, from usage data)
  | 'view_shift_summary'
  | 'time_entry_change_request'
  | 'view_pto_approvals'
  | 'view_company_holidays'
  | 'view_team_ooo'
  | 'view_pay'
  | 'update_withholdings'
  | 'paycheck_split'
  | 'view_flex_benefits'
  | 'view_hsa'
  | 'view_expenses'
  | 'view_expense_approvals'
  | 'view_cards'
  | 'view_notifications'
  | 'view_profile'
  | 'book_travel';

export type SkuId =
  | 'time_off'
  | 'scheduling'
  | 'time_tracking'
  | 'my_pay'
  | 'my_benefits'
  | 'spend_management'
  | 'people_directory'
  | 'travel'
  | 'chat';

/** Map of SKU id → enabled/disabled. Missing keys are treated as false. */
export type SkuFlags = Partial<Record<SkuId, boolean>>;

export interface QuickAction {
  id: QuickActionId;
  label: string;
  route: string;
  product: string;
  /** SKUs that must ALL be enabled for this action to appear. Empty = always available. */
  requiredSkus: SkuId[];
  /** If true, this action is boosted to the top when onboarding is active. */
  onboardingPriority?: boolean;
  /** If true, only shown to manager personas (frontline_shift_manager, people_manager, functional_admin, executive_owner). */
  managerOnly?: boolean;
}

export interface QuickActionsResult {
  /** The actions to display (up to maxCount). */
  actions: QuickAction[];
  /** The full ordered list before truncation. */
  all: QuickAction[];
}

// ─── Action Registry ─────────────────────────────────────────────────────

export const ACTION_REGISTRY: Record<QuickActionId, QuickAction> = {
  request_time_off: {
    id: 'request_time_off',
    label: 'Request Time Off',
    route: 'pto/PtoRequest',
    product: 'Time',
    requiredSkus: ['time_off'],
  },
  view_my_schedule: {
    id: 'view_my_schedule',
    label: 'View Schedules',
    route: 'my-schedule',
    product: 'Time',
    requiredSkus: ['scheduling'],
  },
  view_my_timecard: {
    id: 'view_my_timecard',
    label: 'View Timesheet',
    route: 'time_tracking_alerts/MyTimecard',
    product: 'Time',
    requiredSkus: ['time_tracking'],
  },
  pick_up_shift: {
    id: 'pick_up_shift',
    label: 'Pick Up Shift',
    route: 'scheduling/availableShifts',
    product: 'Time',
    requiredSkus: ['scheduling'],
  },
  view_pto_balances: {
    id: 'view_pto_balances',
    label: 'View PTO Balances',
    route: 'pto/Balances',
    product: 'Time',
    requiredSkus: ['time_off'],
  },
  view_team_schedule: {
    id: 'view_team_schedule',
    label: 'View Team Schedule',
    route: 'team-schedule',
    product: 'Time',
    requiredSkus: ['scheduling'],
  },
  view_paystubs: {
    id: 'view_paystubs',
    label: 'View Paystubs',
    route: 'payroll/PaystubList',
    product: 'Payroll',
    requiredSkus: ['my_pay'],
  },
  update_bank_account: {
    id: 'update_bank_account',
    label: 'Bank Details',
    route: 'bankAccounts',
    product: 'Payroll',
    requiredSkus: ['my_pay'],
    onboardingPriority: true,
  },
  view_tax_documents: {
    id: 'view_tax_documents',
    label: 'View Tax Documents',
    route: 'payroll/tax-documents',
    product: 'Payroll',
    requiredSkus: ['my_pay'],
  },
  view_my_benefits: {
    id: 'view_my_benefits',
    label: 'View My Benefits',
    route: 'insurance/Benefits',
    product: 'Benefits',
    requiredSkus: ['my_benefits'],
    onboardingPriority: true,
  },
  submit_expense: {
    id: 'submit_expense',
    label: 'Submit Expense',
    route: 'spend_management/ManualExpense',
    product: 'Spend',
    requiredSkus: ['spend_management'],
  },
  scan_receipt: {
    id: 'scan_receipt',
    label: 'Scan Receipt',
    route: 'spend_management/ScanReceipt',
    product: 'Spend',
    requiredSkus: ['spend_management'],
  },
  log_mileage: {
    id: 'log_mileage',
    label: 'Log Mileage',
    route: 'spend_management/MileageExpense',
    product: 'Spend',
    requiredSkus: ['spend_management'],
  },
  people_directory: {
    id: 'people_directory',
    label: 'Find People',
    route: 'people_directory/Directory',
    product: 'HR',
    requiredSkus: ['people_directory'],
  },
  view_documents: {
    id: 'view_documents',
    label: 'View Documents',
    route: 'documents',
    product: 'HR',
    requiredSkus: [],
    onboardingPriority: true,
  },
  shift_swaps: {
    id: 'shift_swaps',
    label: 'Shift Swaps',
    route: 'scheduling/shiftSwaps',
    product: 'Time',
    requiredSkus: ['scheduling'],
  },
  edit_availability: {
    id: 'edit_availability',
    label: 'Edit Availability',
    route: 'scheduling/availability',
    product: 'Time',
    requiredSkus: ['scheduling'],
  },
  team_schedule: {
    id: 'team_schedule',
    label: 'Team Schedule',
    route: 'team-schedule',
    product: 'Time',
    requiredSkus: ['scheduling'],
  },
  review_timesheets: {
    id: 'review_timesheets',
    label: 'Review Timesheets',
    route: 'time_tracking_alerts/ReviewTimesheets',
    product: 'Time',
    requiredSkus: ['time_tracking'],
    managerOnly: true,
  },
  assign_shifts: {
    id: 'assign_shifts',
    label: 'Assign Shifts',
    route: 'scheduling/assignShifts',
    product: 'Time',
    requiredSkus: ['scheduling'],
    managerOnly: true,
  },
  message_team: {
    id: 'message_team',
    label: 'Message Team',
    route: 'messaging/team',
    product: 'HR',
    requiredSkus: ['chat'],
  },
  // Extended actions (bottom of ranking)
  view_shift_summary: {
    id: 'view_shift_summary',
    label: 'Shift Summary',
    route: 'time_tracking_alerts/ShiftSummary',
    product: 'Time',
    requiredSkus: ['time_tracking'],
  },
  time_entry_change_request: {
    id: 'time_entry_change_request',
    label: 'Time Change Request',
    route: 'time_tracking_alerts/TimeEntryChangeRequest',
    product: 'Time',
    requiredSkus: ['time_tracking'],
  },
  view_pto_approvals: {
    id: 'view_pto_approvals',
    label: 'PTO Approvals',
    route: 'pto/Approvals',
    product: 'Time',
    requiredSkus: ['time_off'],
    managerOnly: true,
  },
  view_company_holidays: {
    id: 'view_company_holidays',
    label: 'Company Holidays',
    route: 'pto/Holidays',
    product: 'Time',
    requiredSkus: ['time_off'],
  },
  view_team_ooo: {
    id: 'view_team_ooo',
    label: 'Team Out of Office',
    route: 'pto/TeamOOO',
    product: 'Time',
    requiredSkus: ['time_off'],
  },
  view_pay: {
    id: 'view_pay',
    label: 'Pay Overview',
    route: 'payroll/Pay',
    product: 'Payroll',
    requiredSkus: ['my_pay'],
  },
  update_withholdings: {
    id: 'update_withholdings',
    label: 'Withholdings',
    route: 'withholdings',
    product: 'Payroll',
    requiredSkus: ['my_pay'],
  },
  paycheck_split: {
    id: 'paycheck_split',
    label: 'Paycheck Split',
    route: 'payroll/PaycheckSplit',
    product: 'Payroll',
    requiredSkus: ['my_pay'],
  },
  view_flex_benefits: {
    id: 'view_flex_benefits',
    label: 'Flex Benefits',
    route: 'insurance/FlexBenefits',
    product: 'Benefits',
    requiredSkus: ['my_benefits'],
  },
  view_hsa: {
    id: 'view_hsa',
    label: 'HSA Overview',
    route: 'insurance/HSAOverview',
    product: 'Benefits',
    requiredSkus: ['my_benefits'],
  },
  view_expenses: {
    id: 'view_expenses',
    label: 'Expenses Overview',
    route: 'spend_management/OverviewTab',
    product: 'Spend',
    requiredSkus: ['spend_management'],
  },
  view_expense_approvals: {
    id: 'view_expense_approvals',
    label: 'Expense Approvals',
    route: 'spend_management/ApprovalsList',
    product: 'Spend',
    requiredSkus: ['spend_management'],
    managerOnly: true,
  },
  view_cards: {
    id: 'view_cards',
    label: 'Company Cards',
    route: 'spend_management/CardsTabV2',
    product: 'Spend',
    requiredSkus: ['spend_management'],
  },
  view_notifications: {
    id: 'view_notifications',
    label: 'Notifications',
    route: 'hub_platform/NotificationList',
    product: 'HR',
    requiredSkus: [],
  },
  view_profile: {
    id: 'view_profile',
    label: 'Edit your Profile',
    route: 'mobile_platform/Profile',
    product: 'HR',
    requiredSkus: [],
  },
  book_travel: {
    id: 'book_travel',
    label: 'Book Travel',
    route: 'travel/Book',
    product: 'Travel',
    requiredSkus: ['travel'],
  },
};

// ─── Global Fallback Ranking ─────────────────────────────────────────────
// Used when a persona ranking doesn't cover an action that's still available.

const GLOBAL_RANKING: QuickActionId[] = [
  // Featured (persona rankings take precedence)
  'request_time_off',
  'view_my_schedule',
  'submit_expense',
  'people_directory',
  'pick_up_shift',
  'shift_swaps',
  'edit_availability',
  'view_my_timecard',
  'team_schedule',
  'review_timesheets',
  'assign_shifts',
  'message_team',
  'view_paystubs',
  'scan_receipt',
  'log_mileage',
  'view_documents',
  'view_my_benefits',
  'view_team_schedule',
  'update_bank_account',
  'view_tax_documents',
  // Extended (bottom of stack, from usage data; 4–6 per product for sheet rows)
  'view_shift_summary',
  'time_entry_change_request',
  'view_pto_approvals',
  'view_company_holidays',
  'view_team_ooo',
  'view_pay',
  'update_withholdings',
  'paycheck_split',
  'view_flex_benefits',
  'view_hsa',
  'view_expenses',
  'view_expense_approvals',
  'view_cards',
  'view_profile',
  'view_pto_balances', // Low priority: only in "all shortcuts" sheet, not default quick actions
  'book_travel',
];

// ─── Persona Rankings ────────────────────────────────────────────────────
// Ordered list of preferred action IDs per persona. Actions not listed here
// fall through to GLOBAL_RANKING order.

export const DEFAULT_PERSONA_RANKINGS: Record<PersonaId, QuickActionId[]> = {
  hourly_operator: [
    'request_time_off',
    'edit_availability',
    'view_my_timecard',
    'shift_swaps',
  ],
  employee_self_service: [
    'request_time_off',
    'submit_expense',
    'view_my_benefits',
    'book_travel',
    'view_documents',
  ],
  frontline_shift_manager: [
    'team_schedule',
    'review_timesheets',
    'assign_shifts',
    'request_time_off',
  ],
  people_manager: [
    'people_directory',
    'request_time_off',
    'submit_expense',
    'view_my_benefits',
  ],
  functional_admin: [
    'people_directory',
    'request_time_off',
    'view_documents',
    'view_my_benefits',
  ],
  executive_owner: [
    'people_directory',
    'view_my_benefits',
    'view_documents',
    'request_time_off',
  ],
  contractor: [
    'submit_expense',
    'log_mileage',
    'view_my_timecard',
    'view_paystubs',
  ],
};

// ─── Core Logic ──────────────────────────────────────────────────────────

const MANAGER_PERSONAS: PersonaId[] = [
  'frontline_shift_manager',
  'people_manager',
  'functional_admin',
  'executive_owner',
];

function isManagerPersona(persona: PersonaId): boolean {
  return MANAGER_PERSONAS.includes(persona);
}

function isSkuSatisfied(action: QuickAction, skuFlags: SkuFlags): boolean {
  return action.requiredSkus.every(sku => skuFlags[sku] === true);
}

/**
 * Build a merged, deduplicated ranking: persona-specific first, then global fallback.
 * Only includes actions that pass the SKU gate and persona filter (e.g. managerOnly).
 */
function buildRankedList(
  persona: PersonaId,
  skuFlags: SkuFlags,
  onboarding: boolean,
): QuickAction[] {
  const personaRanking = DEFAULT_PERSONA_RANKINGS[persona] ?? [];
  const seen = new Set<QuickActionId>();
  const result: QuickAction[] = [];

  const tryAdd = (id: QuickActionId) => {
    if (seen.has(id)) return;
    seen.add(id);
    const action = ACTION_REGISTRY[id];
    if (!action) return;
    if (action.managerOnly && !isManagerPersona(persona)) return;
    if (isSkuSatisfied(action, skuFlags)) {
      result.push(action);
    }
  };

  // If onboarding, front-load actions with onboardingPriority
  if (onboarding) {
    for (const id of personaRanking) {
      if (ACTION_REGISTRY[id]?.onboardingPriority) tryAdd(id);
    }
    for (const id of GLOBAL_RANKING) {
      if (ACTION_REGISTRY[id]?.onboardingPriority) tryAdd(id);
    }
  }

  // Persona ranking (maintains order)
  for (const id of personaRanking) tryAdd(id);

  // Global fallback for anything not covered by persona
  for (const id of GLOBAL_RANKING) tryAdd(id);

  return result;
}

// ─── Public API ──────────────────────────────────────────────────────────

export interface GetQuickActionsParams {
  persona: PersonaId;
  skuFlags: SkuFlags;
  onboarding?: boolean;
  /** Max actions to return. Default 4. */
  maxCount?: number;
}

/**
 * Returns the ordered Quick Actions for a given persona + SKU configuration.
 *
 * Filtering: actions whose requiredSkus aren't all enabled are excluded.
 * Ordering: persona ranking first, then global fallback ranking.
 * Onboarding: actions with `onboardingPriority` are boosted to the top.
 *
 * @example
 * ```ts
 * const { actions } = getQuickActions({
 *   persona: 'hourly_operator',
 *   skuFlags: { time_off: true, scheduling: true },
 *   maxCount: 4,
 * });
 * // actions → [View My Schedule, Request Time Off, Pick Up Shift, View PTO Balances]
 * ```
 */
export function getQuickActions(params: GetQuickActionsParams): QuickActionsResult {
  const { persona, skuFlags, onboarding = false, maxCount = 4 } = params;
  const all = buildRankedList(persona, skuFlags, onboarding);
  return {
    actions: all.slice(0, maxCount),
    all,
  };
}

// ─── Example Usage (console sample) ─────────────────────────────────────
//
// import { getQuickActions } from './quickActions.model';
//
// const result = getQuickActions({
//   persona: 'hourly_operator',
//   skuFlags: {
//     time_off: true,
//     scheduling: true,
//     time_tracking: true,
//     my_pay: true,
//   },
//   onboarding: false,
//   maxCount: 4,
// });
//
// console.log('Quick Actions:', result.actions.map(a => a.label));
// → ["View My Schedule", "Request Time Off", "Pick Up Shift", "View PTO Balances"]
//
// console.log('Full list:', result.all.map(a => a.label));
// → ["View My Schedule", "Request Time Off", "Pick Up Shift", "View PTO Balances",
//    "View My Timecard", "View Paystubs"]
//
// // With onboarding:
// const onboarding = getQuickActions({
//   persona: 'employee_self_service',
//   skuFlags: { time_off: true, my_pay: true, my_benefits: true, spend_management: true, people_directory: true },
//   onboarding: true,
//   maxCount: 4,
// });
//
// console.log('Onboarding:', onboarding.actions.map(a => a.label));
// → ["View My Benefits", "View Documents", "Update Bank Account", "Request Time Off"]
