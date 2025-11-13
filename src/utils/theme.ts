/**
 * Theme Utilities
 * 
 * Provides properly typed access to Pebble theme tokens without needing
 * to cast to `any` everywhere.
 * 
 * Usage:
 * ```typescript
 * import { usePebbleTheme } from '@/utils/theme';
 * 
 * const MyComponent = () => {
 *   const { theme } = usePebbleTheme();
 *   
 *   return <div style={{ color: theme.colorOnSurface }} />;
 * };
 * ```
 */

import { useTheme } from '@rippling/pebble/theme';

/**
 * Extended Pebble Theme interface with all design tokens
 * 
 * This interface includes the token properties that Pebble's official Theme type
 * doesn't expose but are available at runtime.
 */
export interface PebbleTheme {
  // Colors - Surfaces & Backgrounds
  colorSurface: string;
  colorSurfaceBright: string;
  colorSurfaceContainerLow: string;
  colorSurfaceContainerHigh: string;
  colorSurfaceContainerHighest: string;
  
  // Colors - Text & Foreground
  colorOnSurface: string;
  colorOnSurfaceVariant: string;
  colorPrimary: string;
  colorOnPrimary: string;
  colorOnPrimaryContainer: string;
  
  // Colors - Semantic
  colorError: string;
  colorErrorContainer: string;
  colorSuccess: string;
  colorSuccessContainer: string;
  colorWarning: string;
  colorWarningContainer: string;
  
  // Colors - Borders & Dividers
  colorOutline: string;
  colorOutlineVariant: string;
  
  // Colors - Interactive
  colorPrimaryContainer: string;
  colorSecondaryContainer: string;
  
  // Spacing
  space100: string;
  space200: string;
  space300: string;
  space400: string;
  space500: string;
  space600: string;
  space800: string;
  space1000: string;
  space1200: string;
  space1600: string;
  
  // Typography V2
  typestyleV2DisplayLarge: string;
  typestyleV2DisplayMedium: string;
  typestyleV2DisplaySmall: string;
  typestyleV2TitleLarge: string;
  typestyleV2TitleMedium: string;
  typestyleV2TitleSmall: string;
  typestyleV2BodyLarge: string;
  typestyleV2BodyMedium: string;
  typestyleV2BodySmall: string;
  typestyleV2LabelLarge: string;
  typestyleV2LabelMedium: string;
  typestyleV2LabelSmall: string;
  typestyleV2CodeLarge: string;
  typestyleV2CodeMedium: string;
  typestyleV2CodeSmall: string;
  
  // Shape (Border Radius)
  shapeCornerXs: string;    // 2px
  shapeCornerSm: string;    // 4px
  shapeCornerMd: string;    // 6px
  shapeCornerLg: string;    // 8px
  shapeCornerXl: string;    // 10px
  shapeCorner2xl: string;   // 12px
  shapeCorner3xl: string;   // 16px
  shapeCorner4xl: string;   // 24px
  shapeCornerFull: string;  // 9999px
  shapeCornerNone: string;  // 0px
  
  // Add other theme properties as needed
  [key: string]: any;
}

/**
 * Custom hook that returns a properly typed Pebble theme
 * 
 * This eliminates the need to cast `theme as any` throughout your components.
 * 
 * @returns Object containing the typed theme and theme metadata
 */
export function usePebbleTheme() {
  const themeData = useTheme();
  
  return {
    ...themeData,
    theme: themeData.theme as PebbleTheme,
  };
}

/**
 * Type guard to ensure theme has the extended properties
 * Useful for styled-components where you receive theme as a prop
 */
export type StyledTheme = PebbleTheme;

