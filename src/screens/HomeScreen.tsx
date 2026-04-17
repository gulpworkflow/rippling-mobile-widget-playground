import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import Icon from '@rippling/pebble/Icon';
import RipplingLogoBlack from '@/assets/rippling-logo-black.svg';
import RipplingLogoWhite from '@/assets/rippling-logo-white.svg';
import { getQuickActions } from '@/data-models/quick-actions';
import type { QuickAction, QuickActionId } from '@/data-models/quick-actions';
import type { PersonaId, ZoneMapping } from '@/data-models/types';
import { widgetIdToTitle, getWidgetActions, enabledAppsToSkuFlags } from '@/widgets/framework/widget-helpers';
import WidgetCard, { ContentSlot } from '@/widgets/framework/WidgetCard';
import ShiftClockContent from '@/widgets/ShiftClockWidget';
import InboxPreviewContent from '@/widgets/InboxWidget';
import EarningsSummaryContent from '@/widgets/EarningsWidget';
import ShortcutsContent from '@/widgets/ShortcutsWidget';
import RecentlyVisitedContent from '@/widgets/RecentlyVisitedWidget';
import type { SkeletonArchetype } from '@/widgets/framework/types';
import DiscoveryAppList from '@/widgets/DiscoveryAppList';

const WIDGET_SKELETON: Record<string, { archetype: SkeletonArchetype; rows?: number; columns?: number; height?: number }> = {
  shift_clock: { archetype: 'detail', rows: 2, height: 137 },
  earnings_summary: { archetype: 'detail', rows: 1, height: 104 },
  inbox_preview: { archetype: 'list', rows: 2, height: 129 },
  quick_actions: { archetype: 'grid', columns: 4, height: 88 },
  recently_visited: { archetype: 'list', rows: 4, height: 235 },
};

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

const OfflineIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const OfflineIconCircle = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${({ theme }) => (theme as any).colorWarningContainer};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
`;

const OfflineLabel = styled.span`
  ${({ theme }) => (theme as any).typestyleV2LabelMedium};
  color: ${({ theme }) => (theme as any).colorOnSurfaceVariant};
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
  disabled?: boolean,
) => {
  if (widgetId === 'quick_actions' && quickActions) return <ShortcutsContent actions={quickActions} onSurface={onSurface} disabled={disabled} onActionTap={onQuickActionTap} />;
  if (widgetId === 'shift_clock') return <ShiftClockContent disabled={disabled} />;
  if (widgetId === 'inbox_preview') return <InboxPreviewContent persona={persona} disabled={disabled} />;
  if (widgetId === 'earnings_summary' && persona) return <EarningsSummaryContent persona={persona} disabled={disabled} />;
  if (widgetId === 'recently_visited') return <RecentlyVisitedContent disabled={disabled} />;
  return <ContentSlot>Content slot</ContentSlot>;
};

const HomeScreen: React.FC<{
  theme: any;
  zoneWidgets: ZoneMapping;
  enabledApps: Set<string>;
  persona: PersonaId;
  onboarding: boolean;
  darkMode?: boolean;
  isOffline?: boolean;
  isLoading?: boolean;
  loadingKey?: number;
  isError?: boolean;
  showOfflineBanner?: boolean;
  onOpenShortcutsSheet?: () => void;
  onQuickActionTap?: (actionId: QuickActionId) => void;
  onOpenReorderSheet?: () => void;
}> = ({ theme, zoneWidgets, enabledApps, persona, onboarding, darkMode, isOffline, isLoading: isLoadingProp, loadingKey, isError, showOfflineBanner, onOpenShortcutsSheet, onQuickActionTap, onOpenReorderSheet }) => {
  const [showSkeleton, setShowSkeleton] = useState(!!isLoadingProp);

  useEffect(() => {
    if (!isLoadingProp) { setShowSkeleton(false); return; }
    setShowSkeleton(true);
    const timer = setTimeout(() => setShowSkeleton(false), 4000);
    return () => clearTimeout(timer);
  }, [isLoadingProp, loadingKey]);

  const sv = theme.colorOnSurfaceVariant;
  const ov = theme.colorOutlineVariant;
  const skuFlags = enabledAppsToSkuFlags(enabledApps);
  const { actions: quickActions } = getQuickActions({ persona, skuFlags, onboarding, maxCount: 4 });
  return (
    <>
      <AppHeader style={showOfflineBanner ? { paddingTop: '20px' } : undefined}>
        <LogoImage src={darkMode ? RipplingLogoWhite : RipplingLogoBlack} alt="Rippling" />
        <HeaderRight>
          {isOffline ? (
            <OfflineIndicator>
              <OfflineIconCircle>
                <Icon type={Icon.TYPES.NO_WIFI} size={14} color={theme.colorOnWarningContainer} />
              </OfflineIconCircle>
            </OfflineIndicator>
          ) : (
            <ChatButtonWrap aria-label="Chat">
              <Icon type={Icon.TYPES.COMMENTS_OUTLINE} size={22} color={sv} />
              <ChatBadge>3</ChatBadge>
            </ChatButtonWrap>
          )}
        </HeaderRight>
      </AppHeader>
      <WidgetZones>
        {zoneWidgets.primary.map(w => {
          const sk = WIDGET_SKELETON[w];
          return (
            <WidgetCard key={w} title={widgetIdToTitle(w, persona)} disabled={isOffline} loading={showSkeleton} error={isError} skeleton={sk?.archetype} skeletonRows={sk?.rows} skeletonColumns={sk?.columns} skeletonHeight={sk?.height} surfaceVariant={isOffline ? theme.colorOnDisabledSurface : sv} outlineVariant={isOffline ? theme.colorDisabled : ov} actions={getWidgetActions(w, persona)} primaryColor={isOffline ? theme.colorDisabled : theme.colorPrimaryContainer} onTitleClick={isOffline ? undefined : (w === 'quick_actions' ? onOpenShortcutsSheet : () => {})}>
              {renderWidgetContent(w, sv, isOffline ? theme.colorOnDisabledSurface : theme.colorOnSurface, quickActions, persona, isOffline ? undefined : onQuickActionTap, isOffline)}
            </WidgetCard>
          );
        })}

        {zoneWidgets.core.map(w => {
          const sk = WIDGET_SKELETON[w];
          return (
            <WidgetCard key={w} title={widgetIdToTitle(w, persona)} disabled={isOffline} loading={showSkeleton} error={isError} skeleton={sk?.archetype} skeletonRows={sk?.rows} skeletonColumns={sk?.columns} skeletonHeight={sk?.height} surfaceVariant={isOffline ? theme.colorOnDisabledSurface : sv} outlineVariant={isOffline ? theme.colorDisabled : ov} actions={getWidgetActions(w, persona)} primaryColor={isOffline ? theme.colorDisabled : theme.colorPrimaryContainer} onTitleClick={isOffline ? undefined : (w === 'quick_actions' ? onOpenShortcutsSheet : () => {})}>
              {renderWidgetContent(w, sv, isOffline ? theme.colorOnDisabledSurface : theme.colorOnSurface, quickActions, persona, isOffline ? undefined : onQuickActionTap, isOffline)}
            </WidgetCard>
          );
        })}

        {zoneWidgets.contextual.map(w => {
          const sk = WIDGET_SKELETON[w];
          return (
            <WidgetCard key={w} title={widgetIdToTitle(w, persona)} disabled={isOffline} loading={showSkeleton} error={isError} skeleton={sk?.archetype} skeletonRows={sk?.rows} skeletonColumns={sk?.columns} skeletonHeight={sk?.height} surfaceVariant={isOffline ? theme.colorOnDisabledSurface : sv} outlineVariant={isOffline ? theme.colorDisabled : ov} actions={getWidgetActions(w, persona)} primaryColor={isOffline ? theme.colorDisabled : theme.colorPrimaryContainer} onTitleClick={isOffline ? undefined : (w === 'quick_actions' ? onOpenShortcutsSheet : () => {})}>
              {renderWidgetContent(w, sv, isOffline ? theme.colorOnDisabledSurface : theme.colorOnSurface, quickActions, persona, isOffline ? undefined : onQuickActionTap, isOffline)}
            </WidgetCard>
          );
        })}

        <DiscoveryAppList enabledApps={enabledApps} primary={isOffline ? theme.colorDisabled : theme.colorPrimaryContainer} disabled={isOffline} />
      </WidgetZones>
    </>
  );
};

export default HomeScreen;
