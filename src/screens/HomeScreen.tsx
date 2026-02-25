import React from 'react';
import styled from '@emotion/styled';
import Icon from '@rippling/pebble/Icon';
import RipplingLogoBlack from '@/assets/rippling-logo-black.svg';
import RipplingLogoWhite from '@/assets/rippling-logo-white.svg';
import { getQuickActions } from '@/data-models/quick-actions';
import type { QuickAction } from '@/data-models/quick-actions';
import type { PersonaId, ZoneMapping } from '@/data-models/types';
import { widgetIdToTitle, WIDGET_ACTIONS, enabledAppsToSkuFlags } from '@/widgets/framework/widget-helpers';
import WidgetCard, { ContentSlot } from '@/widgets/framework/WidgetCard';
import ShiftClockContent from '@/widgets/ShiftClockWidget';
import InboxPreviewContent from '@/widgets/InboxWidget';
import EarningsSummaryContent from '@/widgets/EarningsWidget';
import ShortcutsContent from '@/widgets/ShortcutsWidget';
import DiscoveryAppList from '@/widgets/DiscoveryAppList';

const AppHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 16px 16px;
  padding-right: 54px;
`;

const LogoImage = styled.img`
  width: 140px;
  height: auto;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
`;

const AppsButton = styled.button`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: #1a1a1a;
`;

const WidgetZones = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 16px 120px;
`;

const renderWidgetContent = (widgetId: string, _sv: string, onSurface?: string, quickActions?: QuickAction[], persona?: PersonaId) => {
  if (widgetId === 'quick_actions' && quickActions) return <ShortcutsContent actions={quickActions} onSurface={onSurface} />;
  if (widgetId === 'shift_clock') return <ShiftClockContent />;
  if (widgetId === 'inbox_preview') return <InboxPreviewContent />;
  if (widgetId === 'earnings_summary' && persona) return <EarningsSummaryContent persona={persona} />;
  return <ContentSlot>Content slot</ContentSlot>;
};

const HomeScreen: React.FC<{
  theme: any;
  zoneWidgets: ZoneMapping;
  enabledApps: Set<string>;
  persona: PersonaId;
  onboarding: boolean;
  darkMode?: boolean;
  onOpenShortcutsSheet?: () => void;
}> = ({ theme, zoneWidgets, enabledApps, persona, onboarding, darkMode, onOpenShortcutsSheet }) => {
  const sv = theme.colorOnSurfaceVariant;
  const ov = theme.colorOutlineVariant;
  const skuFlags = enabledAppsToSkuFlags(enabledApps);
  const { actions: quickActions } = getQuickActions({ persona, skuFlags, onboarding, maxCount: 4 });
  return (
    <>
      <AppHeader>
        <LogoImage src={darkMode ? RipplingLogoWhite : RipplingLogoBlack} alt="Rippling" />
        <HeaderRight>
          <AppsButton aria-label="Apps">
            <Icon type={Icon.TYPES.APPS_OUTLINE} size={22} color={sv} />
          </AppsButton>
        </HeaderRight>
      </AppHeader>
      <WidgetZones>
        {zoneWidgets.primary.map(w => (
          <WidgetCard key={w} title={widgetIdToTitle(w, persona)} surfaceVariant={sv} outlineVariant={ov} actions={WIDGET_ACTIONS[w]} primaryColor={theme.colorPrimaryContainer} onTitleClick={w === 'quick_actions' ? onOpenShortcutsSheet : () => {}}>
            {renderWidgetContent(w, sv, theme.colorOnSurface, quickActions, persona)}
          </WidgetCard>
        ))}

        {zoneWidgets.core.map(w => (
          <WidgetCard key={w} title={widgetIdToTitle(w, persona)} surfaceVariant={sv} outlineVariant={ov} actions={WIDGET_ACTIONS[w]} primaryColor={theme.colorPrimaryContainer} onTitleClick={w === 'quick_actions' ? onOpenShortcutsSheet : () => {}}>
            {renderWidgetContent(w, sv, theme.colorOnSurface, quickActions, persona)}
          </WidgetCard>
        ))}

        {zoneWidgets.contextual.map(w => (
          <WidgetCard key={w} title={widgetIdToTitle(w, persona)} surfaceVariant={sv} outlineVariant={ov} actions={WIDGET_ACTIONS[w]} primaryColor={theme.colorPrimaryContainer} onTitleClick={w === 'quick_actions' ? onOpenShortcutsSheet : () => {}}>
            {renderWidgetContent(w, sv, theme.colorOnSurface, quickActions, persona)}
          </WidgetCard>
        ))}

        <DiscoveryAppList enabledApps={enabledApps} primary={theme.colorPrimaryContainer} />
      </WidgetZones>
    </>
  );
};

export default HomeScreen;
