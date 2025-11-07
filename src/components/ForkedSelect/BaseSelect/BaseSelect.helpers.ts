import type { RefObject } from 'react';
import type { TextRefObject } from '@rippling/pebble/Text';

/**
 * To focus and blur search input w.r.t to menu visibility
 */
export function controlSearchInputFocusOnMenuToggle(
  isMenuOpen: undefined | boolean,
  searchInputRef: RefObject<TextRefObject>,
) {
  // focus input when menu is open
  if (
    isMenuOpen &&
    searchInputRef.current &&
    document.activeElement !== searchInputRef.current.getDOM()
  ) {
    searchInputRef.current.focus();
    return;
  }

  // blur input when menu is not open
  if (
    !isMenuOpen &&
    searchInputRef.current &&
    searchInputRef.current.getDOM() === document.activeElement
  ) {
    searchInputRef.current.blur();
  }
}
