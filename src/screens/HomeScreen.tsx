import React from 'react';
import styled from '@emotion/styled';
import Icon from '@rippling/pebble/Icon';
import RipplingLogoBlack from '@/assets/rippling-logo-black.svg';
import RipplingLogoWhite from '@/assets/rippling-logo-white.svg';
import { getQuickActions } from '@/data-models/quick-actions';
import type { QuickAction, QuickActionId } from '@/data-models/quick-actions';
import type { PersonaId, ZoneMapping } from '@/data-models/types';
import { widgetIdToTitle, WIDGET_ACTIONS, enabledAppsToSkuFlags } from '@/widgets/framework/widget-helpers';
import WidgetCard, { ContentSlot } from '@/widgets/framework/WidgetCard';
import ShiftClockContent from '@/widgets/ShiftClockWidget';
import InboxPreviewContent from '@/widgets/InboxWidget';
import EarningsSummaryContent from '@/widgets/EarningsWidget';
import ShortcutsContent from '@/widgets/ShortcutsWidget';
import RecentlyVisitedContent from '@/widgets/RecentlyVisitedWidget';
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

const ChatButtonWrap = styled.button`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  position: relative;
`;

const ChatBadge = styled.span`
  position: absolute;
  top: 2px;
  right: 1px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 100px;
  background: ${({ theme }) => (theme as any).colorError};
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  line-height: 16px;
  text-align: center;
  pointer-events: none;
`;

const WidgetZones = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 16px 120px;
`;

const renderWidgetContent = (
  widgetId: string,
  _sv: string,
  onSurface?: string,
  quickActions?: QuickAction[],
  persona?: PersonaId,
  onQuickActionTap?: (actionId: QuickActionId) => void,
) => {
  if (widgetId === 'quick_actions' && quickActions) return <ShortcutsContent actions={quickActions} onSurface={onSurface} onActionTap={onQuickActionTap} />;
  if (widgetId === 'shift_clock') return <ShiftClockContent />;
  if (widgetId === 'inbox_preview') return <InboxPreviewContent persona={persona} />;
  if (widgetId === 'earnings_summary' && persona) return <EarningsSummaryContent persona={persona} />;
  if (widgetId === 'recently_visited') return <RecentlyVisitedContent />;
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
  onQuickActionTap?: (actionId: QuickActionId) => void;
  onOpenReorderSheet?: () => void;
}> = ({ theme, zoneWidgets, enabledApps, persona, onboarding, darkMode, onOpenShortcutsSheet, onQuickActionTap, onOpenReorderSheet }) => {
  const sv = theme.colorOnSurfaceVariant;
  const ov = theme.colorOutlineVariant;
  const skuFlags = enabledAppsToSkuFlags(enabledApps);
  const { actions: quickActions } = getQuickActions({ persona, skuFlags, onboarding, maxCount: 4 });
  return (
    <>
      <AppHeader>
        <LogoImage src={darkMode ? RipplingLogoWhite : RipplingLogoBlack} alt="Rippling" />
        <HeaderRight>
          <ChatButtonWrap aria-label="Chat">
            <Icon type={Icon.TYPES.COMMENTS_OUTLINE} size={22} color={sv} />
            <ChatBadge>3</ChatBadge>
          </ChatButtonWrap>
        </HeaderRight>
      </AppHeader>
      <WidgetZones>
        {zoneWidgets.primary.map(w => (
          <WidgetCard key={w} title={widgetIdToTitle(w, persona)} surfaceVariant={sv} outlineVariant={ov} actions={WIDGET_ACTIONS[w]} primaryColor={theme.colorPrimaryContainer} onTitleClick={w === 'quick_actions' ? onOpenShortcutsSheet : () => {}}>
            {renderWidgetContent(w, sv, theme.colorOnSurface, quickActions, persona, onQuickActionTap)}
          </WidgetCard>
        ))}

        {zoneWidgets.core.map(w => (
          <WidgetCard key={w} title={widgetIdToTitle(w, persona)} surfaceVariant={sv} outlineVariant={ov} actions={WIDGET_ACTIONS[w]} primaryColor={theme.colorPrimaryContainer} onTitleClick={w === 'quick_actions' ? onOpenShortcutsSheet : () => {}}>
            {renderWidgetContent(w, sv, theme.colorOnSurface, quickActions, persona, onQuickActionTap)}
          </WidgetCard>
        ))}

        {zoneWidgets.contextual.map(w => (
          <WidgetCard key={w} title={widgetIdToTitle(w, persona)} surfaceVariant={sv} outlineVariant={ov} actions={WIDGET_ACTIONS[w]} primaryColor={theme.colorPrimaryContainer} onTitleClick={w === 'quick_actions' ? onOpenShortcutsSheet : () => {}}>
            {renderWidgetContent(w, sv, theme.colorOnSurface, quickActions, persona, onQuickActionTap)}
          </WidgetCard>
        ))}

        <DiscoveryAppList enabledApps={enabledApps} primary={theme.colorPrimaryContainer} />
      </WidgetZones>
    </>
  );
};

export default HomeScreen;
