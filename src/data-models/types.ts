export type PersonaId =
  | 'hourly_operator'
  | 'employee_self_service'
  | 'frontline_shift_manager'
  | 'people_manager'
  | 'functional_admin'
  | 'executive_owner'
  | 'contractor';

export type ZoneMapping = {
  primary: string[];
  core: string[];
  contextual: string[];
  discovery: string[];
};

export type AppItem = {
  id: string;
  /** Name shown in the Purchased SKU HUD panel */
  label: string;
  /** Name shown in the discovery app list (defaults to label if omitted) */
  displayName?: string;
  group: string;
  /** Pebble Icon.TYPES constant for the app icon (white on colored bg) */
  icon: string;
  /** If true, hidden from the home discovery app list (still toggleable as a SKU) */
  hideFromAppList?: boolean;
};

export type SheetDetent = 'small' | 'medium' | 'large';

export type ActivityTab = 'all' | 'action_required' | 'requests';
