import React, { useState, useEffect } from 'react';
import Icon from '@rippling/pebble/Icon';
import Button from '@rippling/pebble/Button';
import SnackBar from '@rippling/pebble/SnackBar';
import { AppShellLayout, NavSectionData } from '@/components/app-shell';
import { AppsTab } from './AppsTab';
import { CompositionsTab } from './CompositionsTab';
import { getFromLocalStorage, setInLocalStorage } from '@/utils/localStorage';
import { MOCK_COMPOSITIONS } from './types';

/**
 * Composition Manager Demo
 *
 * Prototype for the Composition Manager experience in App Studio.
 * Features:
 * - Top navigation bar
 * - Left sidebar navigation
 * - Main content area for composition management
 * - Tab-based content switching (Apps vs Compositions)
 *
 * Based on Rippling's application shell structure.
 *
 * Now uses the extracted AppShellLayout component for DRY code reuse.
 * Tab content is isolated in separate component files for easier management.
 */

const CompositionManagerDemo: React.FC = () => {
  // Track which tab is active (0 = Apps, 1 = Compositions)
  const [activeTab, setActiveTab] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  // Set up Shift+T keyboard listener for toggling mock data
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Shift+T
      if (event.shiftKey && event.key === 'T') {
        event.preventDefault();
        toggleMockData();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleMockData = () => {
    const showMock = getFromLocalStorage<boolean>('showMockCompositions', true);
    const newShowMock = !showMock;
    setInLocalStorage('showMockCompositions', newShowMock);

    if (newShowMock) {
      // Re-add mock compositions if they don't exist
      const compositions = getFromLocalStorage('compositions', []);
      const hasMockData = compositions.some((c: { isMockData?: boolean }) => c.isMockData);

      if (!hasMockData) {
        const updatedCompositions = [...compositions, ...MOCK_COMPOSITIONS];
        setInLocalStorage('compositions', updatedCompositions);
      }

      SnackBar.success('Mock data visible', {
        persist: false,
      });
    } else {
      SnackBar.success('Mock data hidden', {
        persist: false,
      });
    }

    // Trigger a refresh of the CompositionsTab
    setRefreshKey(prev => prev + 1);
  };

  // Main navigation items for Composition Manager
  const mainSection: NavSectionData = {
    items: [
      { id: 'apps', label: 'Apps', icon: Icon.TYPES.HIERARCHY_HORIZONTAL_OUTLINE },
      { id: 'compositions', label: 'Compositions', icon: Icon.TYPES.DOCUMENT_OUTLINE },
      { id: 'components', label: 'Custom widgets', icon: Icon.TYPES.CUSTOM_APPS_OUTLINE },
      { id: 'assets', label: 'Assets', icon: Icon.TYPES.IMAGE_OUTLINE },
    ],
  };

  // Platform navigation section
  const platformSection: NavSectionData = {
    label: 'Platform',
    items: [
      { id: 'settings', label: 'Settings', icon: Icon.TYPES.SETTINGS_OUTLINE },
      { id: 'help', label: 'Help', icon: Icon.TYPES.QUESTION_CIRCLE_OUTLINE },
    ],
  };

  const tabs = ['Apps', 'Compositions'];

  const pageActions = (
    <Button
      appearance={Button.APPEARANCES.OUTLINE}
      size={Button.SIZES.M}
      icon={{
        type: Icon.TYPES.HELP_OUTLINE,
        alignment: Button.ICON_ALIGNMENTS.RIGHT,
      }}
    >
      Help docs
    </Button>
  );

  // Render the appropriate tab content based on activeTab
  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <AppsTab />;
      case 1:
        return <CompositionsTab key={refreshKey} />;
      default:
        return <CompositionsTab key={refreshKey} />;
    }
  };

  return (
    <AppShellLayout
      pageTitle="App studio"
      pageTabs={tabs}
      defaultActiveTab={1}
      onTabChange={index => setActiveTab(index)}
      pageActions={pageActions}
      mainNavSections={[mainSection]}
      platformNavSection={platformSection}
      companyName="Rippling"
      userInitial="DV"
      searchPlaceholder="Search compositions..."
      showNotificationBadge
      notificationCount={2}
    >
      {renderTabContent()}
    </AppShellLayout>
  );
};

export default CompositionManagerDemo;
