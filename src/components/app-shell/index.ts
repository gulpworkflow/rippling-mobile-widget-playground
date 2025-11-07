/**
 * App Shell Components
 * 
 * Reusable components for building Rippling-style app shell layouts.
 * 
 * @example
 * ```tsx
 * import { AppShellLayout } from '@/components/app-shell';
 * 
 * <AppShellLayout
 *   pageTitle="My App"
 *   pageTabs={['Tab 1', 'Tab 2']}
 *   mainNavSections={navSections}
 * >
 *   {children}
 * </AppShellLayout>
 * ```
 */

export { AppShellLayout } from './AppShellLayout';
export { TopNavBar } from './TopNavBar';
export { Sidebar } from './Sidebar';
export { SearchBar } from './SearchBar';
export { ProfileDropdown } from './ProfileDropdown';
export { NavSection } from './NavSection';
export { NavItem } from './NavItem';
export * from './types';

