/**
 * Component Inspector Utility
 * 
 * Highlights real Pebble components in the DOM with red outlines
 * and labels showing the component name.
 */

// Known Pebble component selectors and their names
// These are identified by data-testid patterns, class patterns, or element structures
const PEBBLE_COMPONENT_SELECTORS: Record<string, string> = {
  // Buttons
  '[data-testid="Button"]': 'Button',
  '[data-testid="IconButton"]': 'IconButton',
  '[data-testid="FloatingButton"]': 'FloatingButton',
  'button[class*="Button"]': 'Button',
  
  // Inputs
  '[data-testid="Input"]': 'Input',
  '[data-testid="TextArea"]': 'TextArea',
  '[data-testid="Select"]': 'Select',
  '[data-testid="Checkbox"]': 'Checkbox',
  '[data-testid="Radio"]': 'Radio',
  '[data-testid="Switch"]': 'Switch',
  '[data-testid="DatePicker"]': 'DatePicker',
  
  // Layout
  '[data-testid="Card"]': 'Card',
  '[data-testid="Modal"]': 'Modal',
  '[data-testid="Drawer"]': 'Drawer',
  '[data-testid="Dropdown"]': 'Dropdown',
  '[data-testid="ExpansionPanel"]': 'ExpansionPanel',
  '[data-testid="Tabs"]': 'Tabs',
  
  // Feedback
  '[data-testid="Tip"]': 'Tip',
  '[data-testid="Snackbar"]': 'Snackbar',
  '[data-testid="Notice"]': 'Notice',
  '[data-testid="Spinner"]': 'Spinner',
  '[data-testid="ProgressBar"]': 'ProgressBar',
  
  // Data Display
  '[data-testid="Avatar"]': 'Avatar',
  '[data-testid="Badge"]': 'Badge',
  '[data-testid="Chip"]': 'Chip',
  '[data-testid="Label"]': 'Label',
  '[data-testid="Status"]': 'Status',
  '[data-testid="Table"]': 'Table',
  '[data-testid="List"]': 'List',
  '[data-testid="ListItem"]': 'ListItem',
  
  // Navigation
  '[data-testid="Breadcrumbs"]': 'Breadcrumbs',
  '[data-testid="Pagination"]': 'Pagination',
  '[data-testid="ProgressSteps"]': 'ProgressSteps',
  
  // Pebble-specific class patterns (emotion-generated)
  '[class*="StyledButton"]': 'Button',
  '[class*="StyledInput"]': 'Input',
  '[class*="StyledDropdown"]': 'Dropdown',
  
  // Common Pebble wrapper patterns
  '[role="dialog"][class*="css-"]': 'Modal/Drawer',
  '[role="tooltip"][class*="css-"]': 'Tip',
  '[role="listbox"][class*="css-"]': 'Dropdown/Select',
  '[role="menu"][class*="css-"]': 'Menu',
  '[role="tablist"][class*="css-"]': 'Tabs',
};

// Additional heuristics to find Pebble components by structure
const findPebbleComponentsByHeuristics = (): Map<Element, string> => {
  const found = new Map<Element, string>();
  
  // Find Buttons by looking for button elements with specific styling
  document.querySelectorAll('button').forEach(btn => {
    const classes = btn.className;
    // Pebble buttons typically have emotion-generated classes
    if (classes.includes('css-') && !btn.closest('[data-inspector-ignore]')) {
      // Check if it looks like a Pebble button (has specific structure)
      if (btn.querySelector('svg') || btn.textContent?.trim()) {
        found.set(btn, 'Button');
      }
    }
  });
  
  // Find Dropdowns by Pebble's dropdown wrapper
  document.querySelectorAll('[class*="DropdownWrapper"], [class*="dropdown"]').forEach(el => {
    if (!el.closest('[data-inspector-ignore]')) {
      found.set(el, 'Dropdown');
    }
  });
  
  // Find Inputs
  document.querySelectorAll('input[class*="css-"], textarea[class*="css-"]').forEach(el => {
    if (!el.closest('[data-inspector-ignore]')) {
      const wrapper = el.closest('[class*="Input"], [class*="TextArea"]');
      if (wrapper) {
        found.set(wrapper, el.tagName === 'TEXTAREA' ? 'TextArea' : 'Input');
      }
    }
  });
  
  // Find Avatars (circular elements with initials or images)
  document.querySelectorAll('[class*="Avatar"], [class*="avatar"]').forEach(el => {
    if (!el.closest('[data-inspector-ignore]')) {
      found.set(el, 'Avatar');
    }
  });
  
  // Find Icons
  document.querySelectorAll('svg[class*="Icon"], [class*="IconWrapper"]').forEach(el => {
    if (!el.closest('[data-inspector-ignore]')) {
      found.set(el, 'Icon');
    }
  });
  
  // Find Chips
  document.querySelectorAll('[class*="Chip"], [class*="chip"]').forEach(el => {
    if (!el.closest('[data-inspector-ignore]')) {
      found.set(el, 'Chip');
    }
  });
  
  // Find Cards
  document.querySelectorAll('[class*="CardLayout"], [class*="Card"]').forEach(el => {
    if (!el.closest('[data-inspector-ignore]') && el.className.includes('css-')) {
      found.set(el, 'Card');
    }
  });
  
  // Find Spinners
  document.querySelectorAll('[class*="Spinner"], [class*="spinner"]').forEach(el => {
    if (!el.closest('[data-inspector-ignore]')) {
      found.set(el, 'Spinner');
    }
  });
  
  // Find Badges
  document.querySelectorAll('[class*="Badge"], [class*="badge"]').forEach(el => {
    if (!el.closest('[data-inspector-ignore]') && el.className.includes('css-')) {
      found.set(el, 'Badge');
    }
  });
  
  return found;
};

let inspectorStyleElement: HTMLStyleElement | null = null;
let inspectorOverlays: HTMLElement[] = [];
let isInspectorActive = false;

const INSPECTOR_STYLES = `
  [data-pebble-component] {
    outline: 2px solid #ff0000 !important;
    outline-offset: 2px !important;
    position: relative !important;
  }
  
  .pebble-inspector-label {
    position: absolute;
    top: -20px;
    left: 0;
    background: #ff0000;
    color: white;
    font-size: 10px;
    font-family: 'SF Mono', Monaco, 'Courier New', monospace;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 3px;
    z-index: 99999;
    pointer-events: none;
    white-space: nowrap;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  }
  
  .pebble-inspector-overlay {
    position: fixed;
    pointer-events: none;
    z-index: 99998;
    border: 2px solid #ff0000;
    border-radius: 4px;
    background: rgba(255, 0, 0, 0.05);
  }
  
  .pebble-inspector-overlay-label {
    position: absolute;
    top: -22px;
    left: -2px;
    background: #ff0000;
    color: white;
    font-size: 11px;
    font-family: 'SF Mono', Monaco, 'Courier New', monospace;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 3px;
    white-space: nowrap;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
`;

const createOverlay = (element: Element, componentName: string): HTMLElement => {
  const rect = element.getBoundingClientRect();
  
  const overlay = document.createElement('div');
  overlay.className = 'pebble-inspector-overlay';
  overlay.style.top = `${rect.top + window.scrollY}px`;
  overlay.style.left = `${rect.left + window.scrollX}px`;
  overlay.style.width = `${rect.width}px`;
  overlay.style.height = `${rect.height}px`;
  
  const label = document.createElement('div');
  label.className = 'pebble-inspector-overlay-label';
  label.textContent = componentName;
  overlay.appendChild(label);
  
  return overlay;
};

const updateOverlays = () => {
  if (!isInspectorActive) return;
  
  // Clear existing overlays
  inspectorOverlays.forEach(overlay => overlay.remove());
  inspectorOverlays = [];
  
  const foundComponents = new Map<Element, string>();
  
  // Find by selectors
  for (const [selector, name] of Object.entries(PEBBLE_COMPONENT_SELECTORS)) {
    try {
      document.querySelectorAll(selector).forEach(el => {
        if (!el.closest('[data-inspector-ignore]') && !foundComponents.has(el)) {
          foundComponents.set(el, name);
        }
      });
    } catch {
      // Invalid selector, skip
    }
  }
  
  // Find by heuristics
  const heuristicResults = findPebbleComponentsByHeuristics();
  heuristicResults.forEach((name, el) => {
    if (!foundComponents.has(el)) {
      foundComponents.set(el, name);
    }
  });
  
  // Create overlays
  const overlayContainer = document.getElementById('pebble-inspector-container') || (() => {
    const container = document.createElement('div');
    container.id = 'pebble-inspector-container';
    container.setAttribute('data-inspector-ignore', 'true');
    document.body.appendChild(container);
    return container;
  })();
  
  foundComponents.forEach((name, element) => {
    const overlay = createOverlay(element, name);
    overlayContainer.appendChild(overlay);
    inspectorOverlays.push(overlay);
  });
};

export const enableInspector = () => {
  if (isInspectorActive) return;
  isInspectorActive = true;
  
  // Add styles
  if (!inspectorStyleElement) {
    inspectorStyleElement = document.createElement('style');
    inspectorStyleElement.id = 'pebble-inspector-styles';
    inspectorStyleElement.textContent = INSPECTOR_STYLES;
    document.head.appendChild(inspectorStyleElement);
  }
  
  // Initial scan
  updateOverlays();
  
  // Update on scroll and resize
  window.addEventListener('scroll', updateOverlays, true);
  window.addEventListener('resize', updateOverlays);
  
  // Update periodically to catch dynamic content
  const intervalId = setInterval(updateOverlays, 1000);
  (window as any).__pebbleInspectorInterval = intervalId;
  
  console.log('🔍 Pebble Component Inspector enabled');
};

export const disableInspector = () => {
  if (!isInspectorActive) return;
  isInspectorActive = false;
  
  // Remove styles
  inspectorStyleElement?.remove();
  inspectorStyleElement = null;
  
  // Remove overlays
  inspectorOverlays.forEach(overlay => overlay.remove());
  inspectorOverlays = [];
  
  // Remove container
  document.getElementById('pebble-inspector-container')?.remove();
  
  // Remove event listeners
  window.removeEventListener('scroll', updateOverlays, true);
  window.removeEventListener('resize', updateOverlays);
  
  // Clear interval
  if ((window as any).__pebbleInspectorInterval) {
    clearInterval((window as any).__pebbleInspectorInterval);
    delete (window as any).__pebbleInspectorInterval;
  }
  
  console.log('🔍 Pebble Component Inspector disabled');
};

export const toggleInspector = (): boolean => {
  if (isInspectorActive) {
    disableInspector();
    return false;
  } else {
    enableInspector();
    return true;
  }
};

export const isInspectorEnabled = (): boolean => isInspectorActive;


