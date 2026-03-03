import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import WidgetReorderSheet from '@/widgets/WidgetReorderSheet';
import TeamScheduleScreen from '@/screens/TeamScheduleScreen';

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
  onAvatarTap?: () => void;
}

const ThemedPhoneScreen: React.FC<ThemedPhoneScreenProps> = ({
  activeNav, setActiveNav, zoneWidgets, enabledApps, persona, onboarding, personaAvatar, darkMode, onAvatarTap,
}) => {
  const [shortcutsSheetOpen, setShortcutsSheetOpen] = useState(false);
  const [reorderSheetOpen, setReorderSheetOpen] = useState(false);
  const [customWidgetOrder, setCustomWidgetOrder] = useState<string[] | null>(null);
  const [screenStack, setScreenStack] = useState<string[]>([]);
  const hasPushedScreen = screenStack.length > 0;
  const { theme } = usePebbleTheme();
  const skuFlags = enabledAppsToSkuFlags(enabledApps);

  const defaultOrder = useMemo(() => [
    ...zoneWidgets.primary,
    ...zoneWidgets.core,
    ...zoneWidgets.contextual,
    ...zoneWidgets.discovery,
  ], [zoneWidgets]);

  const effectiveOrder = customWidgetOrder ?? defaultOrder;

  useEffect(() => {
    setCustomWidgetOrder(null);
  }, [persona, onboarding]);

  const reorderedZoneWidgets = useMemo((): ZoneMapping => {
    if (!customWidgetOrder) return zoneWidgets;
    const allWidgets = customWidgetOrder.filter(w => defaultOrder.includes(w));
    const remaining = defaultOrder.filter(w => !allWidgets.includes(w));
    const full = [...allWidgets, ...remaining];
    const pCount = zoneWidgets.primary.length;
    const coreCount = zoneWidgets.core.length;
    const ctxCount = zoneWidgets.contextual.length;
    return {
      primary: full.slice(0, pCount),
      core: full.slice(pCount, pCount + coreCount),
      contextual: full.slice(pCount + coreCount, pCount + coreCount + ctxCount),
      discovery: full.slice(pCount + coreCount + ctxCount),
    };
  }, [customWidgetOrder, zoneWidgets, defaultOrder]);

  const handleReorderSave = useCallback((newOrder: string[]) => {
    setCustomWidgetOrder(newOrder);
  }, []);
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

      {!hasPushedScreen && (
        <FloatingAvatar onClick={onAvatarTap} style={{ cursor: onAvatarTap ? 'pointer' : undefined }}>
          <AvatarCircle src={personaAvatar} alt="Profile" />
        </FloatingAvatar>
      )}

      <ContentArea key={activeNav} $scrollLocked={shortcutsSheetOpen || reorderSheetOpen}>
        {(activeItem?.id ?? 'home') === 'home' && (
          <HomeScreen
            theme={theme}
            zoneWidgets={reorderedZoneWidgets}
            enabledApps={enabledApps}
            persona={persona}
            onboarding={onboarding}
            darkMode={darkMode}
            onOpenShortcutsSheet={() => setShortcutsSheetOpen(true)}
            onOpenReorderSheet={() => setReorderSheetOpen(true)}
            onQuickActionTap={(actionId) => {
              if (actionId === 'team_schedule') setScreenStack(s => [...s, 'team_schedule']);
            }}
          />
        )}
        {activeItem?.id === 'activity' && <ActivityScreen />}
        {activeItem?.id === 'find' && <FindView />}
        {activeItem?.id === 'chat' && <ChatView />}
      </ContentArea>

      {!hasPushedScreen && (
        <BottomNavigation
          activeNav={activeNav}
          setActiveNav={setActiveNav}
          enabledApps={enabledApps}
          darkMode={darkMode}
          indicatorColor={indicatorColor}
        />
      )}

      <ShortcutsSheet
        isOpen={shortcutsSheetOpen}
        onClose={() => setShortcutsSheetOpen(false)}
        persona={persona}
        skuFlags={skuFlags}
        onboarding={onboarding}
      />

      <WidgetReorderSheet
        isOpen={reorderSheetOpen}
        onClose={() => setReorderSheetOpen(false)}
        widgetOrder={effectiveOrder}
        persona={persona}
        onSave={handleReorderSave}
      />

      <TeamScheduleScreen
        isOpen={screenStack.includes('team_schedule')}
        onBack={() => setScreenStack(s => s.filter(id => id !== 'team_schedule'))}
        onPush={(id) => setScreenStack(s => [...s, id])}
      />
    </PhoneScreen>
  );
};

export default ThemedPhoneScreen;
