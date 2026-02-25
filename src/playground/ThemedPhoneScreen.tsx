import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { usePebbleTheme } from '@/utils/theme';
import type { PersonaId, ZoneMapping } from '@/data-models/types';
import { enabledAppsToSkuFlags } from '@/widgets/framework/widget-helpers';
import {
  PhoneScreen,
  StatusBarBlur,
  StatusBar,
  StatusIcons,
  FloatingAvatar,
  AvatarCircle,
  ContentArea,
  SignalBars,
  WifiIcon,
  BatteryIcon,
} from '@/playground/PhoneFrame';
import BottomNavigation, { navItems } from '@/navigation/BottomNavigation';
import HomeScreen from '@/screens/HomeScreen';
import ActivityScreen from '@/screens/ActivityScreen';
import ShortcutsSheet from '@/widgets/ShortcutsSheet';

const TabViewHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 20px 12px;
  padding-right: 60px;
`;

const TabViewTitle = styled.h1`
  ${({ theme }) => (theme as any).typestyleV2TitleMedium};
  color: ${({ theme }) => (theme as any).colorOnSurface || '#1a1a1a'};
  margin: 0;
`;

const FindView: React.FC = () => (
  <>
    <TabViewHeader>
      <TabViewTitle>Find</TabViewTitle>
    </TabViewHeader>
  </>
);

const ChatView: React.FC = () => (
  <>
    <TabViewHeader>
      <TabViewTitle>Chat</TabViewTitle>
    </TabViewHeader>
  </>
);

export interface ThemedPhoneScreenProps {
  activeNav: number;
  setActiveNav: (idx: number) => void;
  zoneWidgets: ZoneMapping;
  enabledApps: Set<string>;
  persona: PersonaId;
  onboarding: boolean;
  personaAvatar: string;
  darkMode: boolean;
}

const ThemedPhoneScreen: React.FC<ThemedPhoneScreenProps> = ({
  activeNav, setActiveNav, zoneWidgets, enabledApps, persona, onboarding, personaAvatar, darkMode,
}) => {
  const [shortcutsSheetOpen, setShortcutsSheetOpen] = useState(false);
  const { theme } = usePebbleTheme();
  const skuFlags = enabledAppsToSkuFlags(enabledApps);
  const iconColor = theme.colorOnSurface;
  const indicatorColor = theme.colorOnSurface;

  const filteredNavItems = navItems.filter(item => !item.sku || enabledApps.has(item.sku));
  const activeItem = filteredNavItems[activeNav];

  useEffect(() => {
    if (activeNav >= filteredNavItems.length) {
      setActiveNav(0);
    }
  }, [activeNav, filteredNavItems.length, setActiveNav]);

  return (
    <PhoneScreen surfaceDim={theme.colorSurfaceDim} surface={theme.colorSurface}>
      <StatusBarBlur />
      <StatusBar style={{ color: iconColor }}>
        <span>9:41</span>
        <StatusIcons>
          <SignalBars />
          <WifiIcon />
          <BatteryIcon />
        </StatusIcons>
      </StatusBar>

      <FloatingAvatar>
        <AvatarCircle src={personaAvatar} alt="Profile" />
      </FloatingAvatar>

      <ContentArea key={activeNav}>
        {(activeItem?.id ?? 'home') === 'home' && <HomeScreen theme={theme} zoneWidgets={zoneWidgets} enabledApps={enabledApps} persona={persona} onboarding={onboarding} darkMode={darkMode} onOpenShortcutsSheet={() => setShortcutsSheetOpen(true)} />}
        {activeItem?.id === 'activity' && <ActivityScreen />}
        {activeItem?.id === 'find' && <FindView />}
        {activeItem?.id === 'chat' && <ChatView />}
      </ContentArea>

      <BottomNavigation
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        enabledApps={enabledApps}
        darkMode={darkMode}
        indicatorColor={indicatorColor}
      />

      <ShortcutsSheet
        isOpen={shortcutsSheetOpen}
        onClose={() => setShortcutsSheetOpen(false)}
        persona={persona}
        skuFlags={skuFlags}
        onboarding={onboarding}
      />
    </PhoneScreen>
  );
};

export default ThemedPhoneScreen;
