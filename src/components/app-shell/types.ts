/**
 * Shared types for App Shell components
 */

export interface NavItemData {
  id: string;
  label: string;
  icon: string;
  hasSubmenu?: boolean;
  onClick?: () => void;
}

export interface NavSectionData {
  label?: string;
  items: NavItemData[];
}

export interface AppShellConfig {
  companyName?: string;
  userInitial?: string;
  showAdminMode?: boolean;
  searchPlaceholder?: string;
  logoClickHandler?: () => void;
}

