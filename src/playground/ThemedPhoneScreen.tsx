import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styled from '@emotion/styled';
import { usePebbleTheme } from '@/utils/theme';
import Button from '@rippling/pebble/Button';
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

const OfflineBanner = styled.div`
  position: absolute;
  top: 54px;
  left: 0;
  right: 0;
  z-index: 0;
  padding: 16px 20px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const OfflineBannerTitle = styled.h2`
  ${({ theme }) => (theme as any).typestyleV2BodyLargeEmphasized};
  color: ${({ theme }) => (theme as any).colorOnWarning};
  margin: 0;
`;

const OfflineBannerDesc = styled.p`
  ${({ theme }) => (theme as any).typestyleV2BodySmall};
  color: ${({ theme }) => (theme as any).colorOnWarning};
  margin: 0;
  line-height: 1.4;
`;

const OfflineBannerActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
`;

const RetryButton = styled.button`
  ${({ theme }) => (theme as any).typestyleV2LabelMedium};
  background: ${({ theme }) => (theme as any).colorWarningContainer};
  color: ${({ theme }) => (theme as any).colorOnWarningContainer};
  border: none;
  border-radius: ${({ theme }) => (theme as any).shapeCornerLg};
  padding: 6px 14px;
  cursor: pointer;
`;

const ContentSlideWrapper = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
  transition: transform 0.35s ease;
`;

const ContentHandle = styled.div`
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: ${({ theme }) => (theme as any).colorOutlineVariant};
  margin: 8px auto 0;
  flex-shrink: 0;
`;

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
  isOffline?: boolean;
  isLoading?: boolean;
  loadingKey?: number;
  isError?: boolean;
  onAvatarTap?: () => void;
}

const ThemedPhoneScreen: React.FC<ThemedPhoneScreenProps> = ({
  activeNav, setActiveNav, zoneWidgets, enabledApps, persona, onboarding, personaAvatar, darkMode, isOffline, isLoading, loadingKey, isError, onAvatarTap,
}) => {
  const [shortcutsSheetOpen, setShortcutsSheetOpen] = useState(false);
  const [offlineBannerDismissed, setOfflineBannerDismissed] = useState(false);
  const showOfflineBanner = isOffline && !offlineBannerDismissed;
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

  useEffect(() => {
    if (!isOffline) setOfflineBannerDismissed(false);
  }, [isOffline]);

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
    <PhoneScreen
      surfaceDim={showOfflineBanner ? theme.colorWarning : (isOffline ? theme.colorSurface : theme.colorSurfaceDim)}
      surface={showOfflineBanner ? theme.colorWarning : theme.colorSurface}
    >
      <StatusBarBlur />
      <StatusBar style={{ color: showOfflineBanner ? theme.colorOnWarning : iconColor }}>
        <span>9:41</span>
        <StatusIcons>
          <SignalBars />
          <WifiIcon />
          <BatteryIcon />
        </StatusIcons>
      </StatusBar>

      {showOfflineBanner && (
        <OfflineBanner>
          <OfflineBannerTitle>No internet connection</OfflineBannerTitle>
          <OfflineBannerDesc>
            Last updated 14 min ago. Try connecting to the internet to access all of your Rippling apps.
          </OfflineBannerDesc>
          <OfflineBannerActions>
            <RetryButton>Retry</RetryButton>
            <Button appearance={Button.APPEARANCES.GHOST} size={Button.SIZES.S} onClick={() => setOfflineBannerDismissed(true)}>Dismiss</Button>
          </OfflineBannerActions>
        </OfflineBanner>
      )}

      {!hasPushedScreen && (
        <FloatingAvatar onClick={isOffline ? undefined : onAvatarTap} style={{ cursor: (onAvatarTap && !isOffline) ? 'pointer' : undefined, top: showOfflineBanner ? '211px' : undefined, pointerEvents: isOffline ? 'none' as const : undefined }}>
          <AvatarCircle src={personaAvatar} alt="Profile" style={isOffline ? { opacity: 0.4 } : undefined} />
        </FloatingAvatar>
      )}

      <ContentSlideWrapper style={showOfflineBanner ? { transform: 'translateY(184px)' } : { transform: 'translateY(0)' }}>
        {showOfflineBanner && <ContentHandle />}
        <ContentArea key={activeNav} $scrollLocked={shortcutsSheetOpen || reorderSheetOpen} style={showOfflineBanner ? { paddingTop: 0, borderRadius: '16px 16px 0 0', background: theme.colorSurface } : undefined}>
        {(activeItem?.id ?? 'home') === 'home' && (
          <HomeScreen
            theme={theme}
            zoneWidgets={reorderedZoneWidgets}
            enabledApps={enabledApps}
            persona={persona}
            onboarding={onboarding}
            darkMode={darkMode}
            isOffline={isOffline}
            isLoading={isLoading}
            loadingKey={loadingKey}
            isError={isError}
            showOfflineBanner={showOfflineBanner}
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
      </ContentSlideWrapper>

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
