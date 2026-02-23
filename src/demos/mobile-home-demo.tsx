import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from '@emotion/styled';
import { Global, css } from '@emotion/react';
import Icon from '@rippling/pebble/Icon';
import { useSearchParams } from 'react-router-dom';
import { usePebbleTheme } from '@/utils/theme';
import { ThemeProvider, THEME_CONFIGS } from '@rippling/pebble/theme';
import RipplingLogoBlack from '@/assets/rippling-logo-black.svg';
import RipplingLogoWhite from '@/assets/rippling-logo-white.svg';
import { getQuickActions, type QuickAction, type QuickActionId, type SkuFlags, type SkuId } from './quickActions.model';

/**
 * Mobile Home Demo
 *
 * Wireframe-style mobile home screen matching Figma frame.
 * Uses liquid glass bottom navigation.
 *
 * Layout:
 * - Header: Rippling logo + apps icon + avatar
 * - Widget Zones (each zone wraps widgets):
 *   - Primary work: "What needs attention right now?"
 *   - Core actions: "What do I commonly do?"
 *   - Contextual: "What's the state of my world?"
 *   - Discovery/expansion: "What else is available?"
 * - Bottom nav: Home, Activity, Find, Chat + floating sparkles button
 */

// ─── Canvas / Frame ─────────────────────────────────────────────────────

const Canvas = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  background: #f5f2ef;

  @media (min-width: 501px) {
    background: #292929;
  }
`;

const PhoneMockup = styled.div<{ isDark?: boolean }>`
  width: 100%;
  height: 100%;
  background: ${({ isDark }) => isDark ? '#1c1c1e' : '#f5f2ef'};
  position: relative;
  overflow: visible;

  @media (min-width: 501px) {
    width: 393px;
    height: 852px;
    background: ${({ isDark }) => isDark ? '#1c1c1e' : '#f5f2ef'};
    border-radius: 55px;
    padding: 8px;

    /* Frame overlay - renders ON TOP of the screen */
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: 55px;
      border: 8px solid #1c1c1e;
      box-shadow:
        0 0 0 2px #333,
        0 0 0 3px #1c1c1e,
        0 25px 50px rgba(0, 0, 0, 0.6),
        inset 0 0 0 1px rgba(255, 255, 255, 0.1);
      z-index: 9999;
      pointer-events: none;
    }

    /* Dynamic Island - on top of frame */
    &::before {
      content: '';
      position: absolute;
      top: 19px;
      left: 50%;
      transform: translateX(-50%);
      width: 126px;
      height: 36px;
      background: #000;
      border-radius: 18px;
      z-index: 10000;
    }
  }

  @media (max-width: 500px) {
    border-radius: 0;
    box-shadow: none;
    &::before, &::after {
      display: none;
    }
  }
`;

const PhoneScreen = styled.div<{ surfaceDim?: string; surface?: string }>`
  width: 100%;
  height: 100%;
  background: ${({ surface }) => surface || '#f5f2ef'};
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 185px;
    background: linear-gradient(
      to bottom,
      ${({ surfaceDim }) => surfaceDim || 'rgba(0, 0, 0, 0.06)'},
      ${({ surface }) => surface || '#f5f2ef'}
    );
    z-index: 0;
    pointer-events: none;
  }

  @media (min-width: 501px) {
    border-radius: 47px;
  }
  @media (max-width: 500px) {
    border-radius: 0;
  }
`;

// ─── Status Bar ─────────────────────────────────────────────────────────

const StatusBarBlur = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100px;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 1999;
  pointer-events: none;
  mask-image: linear-gradient(to bottom, black 0%, black 25%, transparent 60%);
  -webkit-mask-image: linear-gradient(to bottom, black 0%, black 25%, transparent 60%);
`;

const StatusBar = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 54px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 36px 0;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.2px;
  color: ${({ theme }) => (theme as any).colorOnSurface || '#000'};
  z-index: 2000;
  background: transparent;
`;

const StatusIcons = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

// ─── Floating Avatar ────────────────────────────────────────────────────

const FloatingAvatar = styled.div`
  position: absolute;
  top: 58px;
  right: 16px;
  z-index: 2000;
`;

// ─── App Header (scrolls with content) ──────────────────────────────────

const AppHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 16px 16px;
  padding-right: 54px; /* leave space for floating avatar */
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

const AvatarCircle = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
  flex-shrink: 0;
`;

// ─── Content Area ───────────────────────────────────────────────────────

const ContentArea = styled.div`
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 54px 0 0; /* top padding for status bar */
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const WidgetZones = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 16px 120px;
`;

// ─── Tab View Header ────────────────────────────────────────────────────

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

// ─── Activity View ──────────────────────────────────────────────────────

const ActivityView: React.FC = () => (
  <>
    <TabViewHeader>
      <TabViewTitle>Activity</TabViewTitle>
    </TabViewHeader>
  </>
);

// ─── Find View ──────────────────────────────────────────────────────────


const FindView: React.FC = () => (
  <>
    <TabViewHeader>
      <TabViewTitle>Find</TabViewTitle>
    </TabViewHeader>
  </>
);

// ─── Chat View ──────────────────────────────────────────────────────────

const ChatView: React.FC = () => (
  <>
    <TabViewHeader>
      <TabViewTitle>Chat</TabViewTitle>
    </TabViewHeader>
  </>
);

// ─── Persona Types & Mapping ─────────────────────────────────────────────

type PersonaId =
  | 'hourly_operator'
  | 'employee_self_service'
  | 'frontline_shift_manager'
  | 'people_manager'
  | 'functional_admin'
  | 'executive_owner'
  | 'contractor';

const PERSONA_OPTIONS: { id: PersonaId; label: string; avatar: string }[] = [
  { id: 'hourly_operator', label: 'Hourly Operator', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
  { id: 'employee_self_service', label: 'Employee Self-Service', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face' },
  { id: 'frontline_shift_manager', label: 'Frontline Shift Manager', avatar: 'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=100&h=100&fit=crop&crop=face' },
  { id: 'people_manager', label: 'People Manager (Knowledge Work)', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face' },
  { id: 'functional_admin', label: 'Functional Admin', avatar: 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=100&h=100&fit=crop&crop=face' },
  { id: 'executive_owner', label: 'Executive / Owner', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop&crop=face' },
  { id: 'contractor', label: 'Contractor', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face' },
];

type ZoneMapping = {
  primary: string[];
  core: string[];
  contextual: string[];
  discovery: string[];
};

const PERSONA_ZONE_MAP: Record<PersonaId, ZoneMapping> = {
  hourly_operator: {
    primary: ['shift_clock'],
    core: ['quick_actions'],
    contextual: ['earnings_summary'],
    discovery: ['apps_list', 'inbox_preview'],
  },
  contractor: {
    primary: ['earnings_summary'],
    core: ['quick_actions'],
    contextual: ['inbox_preview'],
    discovery: ['apps_list'],
  },
  frontline_shift_manager: {
    primary: ['shift_clock'],
    core: ['quick_actions'],
    contextual: ['team_status', 'earnings_summary'],
    discovery: ['apps_list', 'inbox_preview'],
  },
  employee_self_service: {
    primary: ['inbox_preview'],
    core: ['quick_actions'],
    contextual: ['earnings_summary'],
    discovery: ['apps_list'],
  },
  people_manager: {
    primary: ['inbox_preview'],
    core: ['quick_actions'],
    contextual: ['team_status'],
    discovery: ['apps_list'],
  },
  functional_admin: {
    primary: ['inbox_preview'],
    core: ['quick_actions'],
    contextual: ['admin_insights'],
    discovery: ['apps_list'],
  },
  executive_owner: {
    primary: ['inbox_preview'],
    core: ['quick_actions'],
    contextual: ['admin_insights'],
    discovery: ['apps_list'],
  },
};

// Derivation logic per persona (read-only display, human-readable)
const PERSONA_DERIVATION: Record<PersonaId, { property: string; value: string }[]> = {
  hourly_operator: [
    { property: 'Employment type', value: 'Hourly' },
    { property: 'Manager', value: 'No' },
    { property: 'Admin status', value: 'None' },
  ],
  employee_self_service: [
    { property: 'Employment type', value: 'Salaried' },
    { property: 'Manager', value: 'No' },
    { property: 'Admin status', value: 'None' },
  ],
  frontline_shift_manager: [
    { property: 'Employment type', value: 'Hourly' },
    { property: 'Manager', value: 'Yes' },
    { property: 'Admin status', value: 'None' },
  ],
  people_manager: [
    { property: 'Employment type', value: 'Salaried' },
    { property: 'Manager', value: 'Yes' },
    { property: 'Admin status', value: 'None' },
  ],
  functional_admin: [
    { property: 'Employment type', value: 'Salaried' },
    { property: 'Manager', value: 'No' },
    { property: 'Admin status', value: 'Partial' },
  ],
  executive_owner: [
    { property: 'Employment type', value: 'Salaried' },
    { property: 'Manager', value: 'Yes' },
    { property: 'Admin status', value: 'Full' },
    { property: 'Company owner', value: 'Yes' },
  ],
  contractor: [
    { property: 'Employment type', value: 'Contractor' },
    { property: 'Manager', value: 'No' },
    { property: 'Admin status', value: 'None' },
  ],
};

function getZoneWidgets(persona: PersonaId, onboarding: boolean, enabledApps: Set<string>): ZoneMapping {
  const base = PERSONA_ZONE_MAP[persona] ?? PERSONA_ZONE_MAP.hourly_operator;
  const hasPaySku = enabledApps.has('my_pay');
  const filter = (ids: string[]) =>
    ids.filter(id => id !== 'earnings_summary' || hasPaySku);
  return {
    primary: onboarding ? filter(['onboarding_setup', ...base.primary]) : filter(base.primary),
    core: filter(base.core),
    contextual: filter(base.contextual),
    discovery: filter(base.discovery),
  };
}

// ─── WidgetCard (Figma-based) ────────────────────────────────────────────

const WidgetCardContainer = styled.div<{ outlineVariant?: string }>`
  background: ${({ theme }) => (theme as any).colorSurfaceBright || '#fff'};
  border-radius: 16px;
  border: 1px solid ${({ outlineVariant }) => outlineVariant || 'rgba(0, 0, 0, 0.12)'};
  overflow: hidden;
  width: 100%;
`;

const WidgetCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 12px 0 12px;
`;

const WidgetCardTitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
`;

const WidgetCardTitleButton = styled.button`
  display: flex;
  align-items: center;
  gap: 2px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font: inherit;
  color: inherit;
`;

const WidgetCardTitle = styled.span<{ surfaceVariant?: string }>`
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0;
  color: ${({ surfaceVariant }) => surfaceVariant || 'rgba(0, 0, 0, 0.45)'};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.3;
`;

const WidgetCardMeta = styled.div`
  display: flex;
  align-items: center;
`;

const WidgetCardBody = styled.div`
  padding: 10px 12px 12px;
`;

const WidgetCardFooter = styled.div`
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const WidgetFooterButton = styled.button<{ variant?: 'primary' | 'secondary'; primaryColor?: string }>`
  flex: 1;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  cursor: pointer;
  text-align: center;
  line-height: 1.3;
  border: ${({ variant, theme }) => variant === 'secondary' ? `1px solid ${(theme as any).colorOutlineVariant || 'rgba(0, 0, 0, 0.12)'}` : '1px solid transparent'};
  background: ${({ variant, primaryColor }) => variant === 'secondary' ? 'transparent' : (primaryColor || '#000')};
  color: ${({ variant, theme }) => variant === 'secondary' ? ((theme as any).colorOnSurface || 'rgba(0, 0, 0, 0.85)') : ((theme as any).colorOnPrimaryContainer || '#fff')};
`;

const ContentSlot = styled.div`
  width: 100%;
  height: 64px;
  background: ${({ theme }) => (theme as any).colorSurfaceContainerLow || 'rgba(0, 0, 0, 0.04)'};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: ${({ theme }) => (theme as any).colorOnSurfaceVariant || 'rgba(0, 0, 0, 0.2)'};
  font-family: 'SF Mono', 'Menlo', 'Consolas', monospace;
`;

// ─── Shift Clock Content ─────────────────────────────────────────────────

const ShiftTimeRow = styled.div`
  font-size: 22px;
  font-weight: 600;
  letter-spacing: 0;
  line-height: 28px;
  color: ${({ theme }) => (theme as any).colorOnSurface || '#000'};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const ShiftDetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 24px;
  width: 100%;
`;

const ShiftDetailLabel = styled.span`
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0;
  color: ${({ theme }) => (theme as any).colorOnSurfaceVariant || 'rgba(0,0,0,0.5)'};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.3;
`;

const ShiftDetailValue = styled.span`
  font-size: 14px;
  font-weight: 400;
  color: ${({ theme }) => (theme as any).colorOnSurface || '#000'};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.4;
`;

const ShiftDetailCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const AvatarStack = styled.div`
  display: flex;
  align-items: center;
`;

const AvatarBubble = styled.div<{ bg?: string; offset?: number }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${({ bg }) => bg || '#bbb'};
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid ${({ theme }) => (theme as any).colorSurfaceBright || '#fff'};
  margin-left: ${({ offset }) => offset != null ? `${offset}px` : '0px'};
  flex-shrink: 0;
`;

const AvatarOverflow = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${({ theme }) => (theme as any).colorSurfaceContainerHigh || '#e0e0e0'};
  color: ${({ theme }) => (theme as any).colorOnSurfaceVariant || '#666'};
  font-size: 10px;
  font-weight: 600;
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid ${({ theme }) => (theme as any).colorSurfaceBright || '#fff'};
  margin-left: -6px;
  flex-shrink: 0;
`;

const TEAMMATE_AVATARS = [
  { initials: 'AZ', bg: '#8B6E5A' },
  { initials: 'AZ', bg: '#7B8D6E' },
  { initials: 'AZ', bg: '#6E7B8D' },
  { initials: 'AZ', bg: '#8D6E7B' },
];

const ShiftClockContent: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
    <ShiftTimeRow>Today 9:00 AM – 5:00 PM</ShiftTimeRow>
    <ShiftDetailGrid>
      <ShiftDetailCell>
        <ShiftDetailLabel>Location</ShiftDetailLabel>
        <ShiftDetailValue>Embarcadero 114th</ShiftDetailValue>
      </ShiftDetailCell>
      <ShiftDetailCell>
        <ShiftDetailLabel>Teammates</ShiftDetailLabel>
        <AvatarStack>
          {TEAMMATE_AVATARS.map((t, i) => (
            <AvatarBubble key={i} bg={t.bg} offset={i === 0 ? 0 : -6}>{t.initials}</AvatarBubble>
          ))}
          <AvatarOverflow>+12</AvatarOverflow>
        </AvatarStack>
      </ShiftDetailCell>
      <ShiftDetailCell>
        <ShiftDetailLabel>Breaks</ShiftDetailLabel>
        <ShiftDetailValue>60mins (paid)</ShiftDetailValue>
      </ShiftDetailCell>
      <ShiftDetailCell>
        <ShiftDetailLabel>Position</ShiftDetailLabel>
        <ShiftDetailValue>Lead barista</ShiftDetailValue>
      </ShiftDetailCell>
    </ShiftDetailGrid>
  </div>
);

// ─── Inbox Queue (Task/Approvals) ──────────────────────────────────────────

const InboxTaskRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid ${({ theme }) => (theme as any).colorOutlineVariant || 'rgba(0,0,0,0.08)'};
  &:last-of-type {
    border-bottom: none;
  }
`;

const InboxTaskIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme }) => (theme as any).colorPrimaryContainer || '#7a005d'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const InboxTaskBody = styled.div`
  flex: 1;
  min-width: 0;
`;

const InboxTaskTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => (theme as any).colorOnSurface || '#000'};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.3;
`;

const InboxTaskSubtitle = styled.div`
  font-size: 12px;
  font-weight: 400;
  color: ${({ theme }) => (theme as any).colorOnSurfaceVariant || 'rgba(0,0,0,0.5)'};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.4;
  margin-top: 2px;
`;

const InboxTaskDue = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 400;
  color: ${({ theme }) => (theme as any).colorOnSurfaceVariant || 'rgba(0,0,0,0.5)'};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  flex-shrink: 0;
`;

const InboxManageButton = styled.button`
  width: 100%;
  padding: 10px 16px;
  margin-top: 8px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  background: transparent;
  border: 1px solid ${({ theme }) => (theme as any).colorOutlineVariant || 'rgba(0,0,0,0.12)'};
  color: ${({ theme }) => (theme as any).colorOnSurface || '#000'};
  cursor: pointer;
`;

const INBOX_TASKS = [
  { id: '1', title: 'Training and courses', subtitle: '2 items', due: '5d', icon: Icon.TYPES.STAR_OUTLINE },
  { id: '2', title: 'Complete survey', subtitle: 'Onsite event feedback', due: '12d', icon: Icon.TYPES.SURVEY_NEUTRAL_OUTLINE },
];

const InboxPreviewContent: React.FC = () => {
  const { theme } = usePebbleTheme();
  const variantColor = theme.colorOnSurfaceVariant;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {INBOX_TASKS.map(t => (
        <InboxTaskRow key={t.id}>
          <InboxTaskIcon>
            <Icon type={t.icon} size={20} color="#fff" />
          </InboxTaskIcon>
          <InboxTaskBody>
            <InboxTaskTitle>{t.title}</InboxTaskTitle>
            <InboxTaskSubtitle>{t.subtitle}</InboxTaskSubtitle>
          </InboxTaskBody>
          <InboxTaskDue>
            <Icon type={Icon.TYPES.CALENDAR_OUTLINE} size={14} color={variantColor} />
            {t.due}
          </InboxTaskDue>
        </InboxTaskRow>
      ))}
      <InboxManageButton>Manage tasks</InboxManageButton>
    </div>
  );
};

// ─── Earnings Summary (persona-adaptive) ───────────────────────────────────

const EarningsMainValue = styled.div`
  ${({ theme }) => {
    const t = (theme as any).typestyleV2TitleSmall;
    return t
      ? `font-size: ${t.fontSize}; font-weight: ${t.fontWeight}; font-family: ${t.fontFamily}; line-height: ${t.lineHeight};`
      : 'font-size: 18px; font-weight: 600; font-family: Basel Grotesk; line-height: 22px;';
  }}
  color: ${({ theme }) => (theme as any).colorOnSurface || '#000'};
  margin-bottom: 12px;
`;

const EarningsSegmentedBar = styled.div`
  display: flex;
  height: 4px;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 6px;
  background: ${({ theme }) => (theme as any).colorSurfaceDim || 'rgba(0,0,0,0.06)'};
`;

const EarningsSegment = styled.div<{ width: number; color: string }>`
  width: ${({ width }) => width}%;
  min-width: ${({ width }) => (width > 0 ? 4 : 0)}px;
  background: ${({ color }) => color};
  transition: width 0.2s ease;
`;

const EarningsBreakdownRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0 0;
`;

const EarningsBreakdownDot = styled.span<{ color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ color }) => color};
  flex-shrink: 0;
`;

const EarningsBreakdownLabel = styled.span`
  flex: 1;
  font-size: 14px;
  font-weight: 400;
  color: ${({ theme }) => (theme as any).colorOnSurface || '#000'};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const EarningsBreakdownValue = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => (theme as any).colorOnSurface || '#000'};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const EARNINGS_COLORS = {
  blue: '#1e3a5f',
  yellow: '#e6b84c',
  green: '#4db6ac',
  purple: '#b39ddb',
};

const EARNINGS_HOURLY = {
  mainValue: 'Next paycheck in 3 days: $1,480',
  segments: [
    { width: 80, color: EARNINGS_COLORS.blue },
    { width: 20, color: EARNINGS_COLORS.purple },
  ],
  rows: [
    { label: 'Regular', value: '$12,250', color: EARNINGS_COLORS.blue },
    { label: 'Overtime', value: '$3,120.50', color: EARNINGS_COLORS.purple },
  ],
};

const EARNINGS_SALARIED = {
  mainValue: '$4,164.84 deposited on 11/13',
  segments: [
    { width: 58, color: EARNINGS_COLORS.blue },
    { width: 28, color: EARNINGS_COLORS.yellow },
    { width: 10, color: EARNINGS_COLORS.green },
    { width: 4, color: EARNINGS_COLORS.purple },
  ],
  rows: [
    { label: 'Federal taxes', value: '$1,529.57', color: EARNINGS_COLORS.yellow },
    { label: 'State and local taxes', value: '$523.29', color: EARNINGS_COLORS.green },
    { label: 'Deductions', value: '$126.89', color: EARNINGS_COLORS.purple },
  ],
};

const EARNINGS_CONTRACTOR = {
  mainValue: '$2,400 pending · $1,800 paid this period',
  segments: [
    { width: 57, color: EARNINGS_COLORS.blue },
    { width: 43, color: EARNINGS_COLORS.purple },
  ],
  rows: [
    { label: 'Pending', value: '$2,400.00', color: EARNINGS_COLORS.blue },
    { label: 'Paid this period', value: '$1,800.00', color: EARNINGS_COLORS.purple },
  ],
};

const EarningsSummaryContent: React.FC<{ persona: PersonaId }> = ({ persona }) => {
  const data = persona === 'hourly_operator'
    ? EARNINGS_HOURLY
    : persona === 'contractor'
      ? EARNINGS_CONTRACTOR
      : EARNINGS_SALARIED;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', paddingBottom: 8 }}>
      <EarningsMainValue>{data.mainValue}</EarningsMainValue>
      <EarningsSegmentedBar>
        {data.segments.map((s, i) => (
          <EarningsSegment key={i} width={s.width} color={s.color} />
        ))}
      </EarningsSegmentedBar>
      {data.rows.map((r, i) => (
        <EarningsBreakdownRow key={i}>
          <EarningsBreakdownDot color={r.color} />
          <EarningsBreakdownLabel>{r.label}</EarningsBreakdownLabel>
          <EarningsBreakdownValue>{r.value}</EarningsBreakdownValue>
        </EarningsBreakdownRow>
      ))}
    </div>
  );
};

// ─── Shortcuts (Quick Actions) ───────────────────────────────────────────

const ShortcutsGrid = styled.div<{ scrollable?: boolean }>`
  display: flex;
  gap: 18px;
  align-items: flex-start;
  width: 100%;
  padding: ${({ scrollable }) => (scrollable ? '8px 0' : '0 0 4px')};
  ${({ scrollable }) => scrollable && `
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    &::-webkit-scrollbar { display: none; }
    scrollbar-width: none;
  `}
`;

const PRODUCT_DISPLAY_NAMES: Record<string, string> = {
  Spend: 'Spend',
  Time: 'Time off',
  Payroll: 'My Pay',
  Benefits: 'My Benefits',
  HR: 'HR',
  Travel: 'Travel',
};

const ShortcutsSheetGroup = styled.div`
  padding-left: 16px;
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid ${({ theme }) => (theme as any).colorOutlineVariant || 'rgba(0,0,0,0.12)'};
  &:last-child {
    margin-bottom: 0;
    border-bottom: none;
  }
`;

const ShortcutsSheetGroupTitleButton = styled.button`
  display: flex;
  align-items: center;
  gap: 2px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font: inherit;
  color: inherit;
  margin-bottom: 4px;
`;

const ShortcutsSheetGroupTitleText = styled.span`
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0;
  color: ${({ theme }) => (theme as any).colorOnSurfaceVariant || 'rgba(0, 0, 0, 0.45)'};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.3;
`;

const SheetBackdrop = styled.div<{ isOpen: boolean }>`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 4000;
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  pointer-events: ${({ isOpen }) => (isOpen ? 'auto' : 'none')};
  transition: opacity 0.3s ease;
`;

type SheetDetent = 'small' | 'medium' | 'large';

const HEADER_HEIGHT = 72; // drag indicator + header
const SEARCH_BAR_HEIGHT = 76; // when expanded, sticky search bar at bottom

const DETENT_HEIGHTS: Record<Exclude<SheetDetent, 'large'>, string> = {
  small: '35%',
  medium: '50%',
};

const SheetPanel = styled.div<{ isOpen: boolean; $detent: SheetDetent; $largeHeight?: number | null; $expandImmediately?: boolean }>`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: ${({ $detent, $largeHeight }) =>
    $detent === 'large'
      ? $largeHeight != null
        ? `${$largeHeight}px`
        : '90%'
      : DETENT_HEIGHTS[$detent]};
  background: ${({ theme }) => (theme as any).colorSurfaceBright || '#fff'};
  border-radius: 28px 28px 0 0;
  z-index: 4001;
  transform: translateY(${({ isOpen }) => (isOpen ? 0 : '100%')});
  transition:
    transform 0.35s cubic-bezier(0.32, 0.72, 0, 1),
    height ${({ $expandImmediately }) => ($expandImmediately ? '0s' : '0.35s cubic-bezier(0.32, 0.72, 0, 1)')};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.15);
`;

const SheetTopRow = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 0 8px;
  flex-shrink: 0;
  min-height: 44px;
`;

const SheetDragIndicator = styled.div`
  position: relative;
  top: -10px;
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: ${({ theme }) => (theme as any).colorOutlineVariant || 'rgba(0,0,0,0.2)'};
  flex-shrink: 0;
  cursor: grab;
  touch-action: none;
  &:active {
    cursor: grabbing;
  }
`;

const SHEET_BUTTON_SIZE = 44;

const SheetCornerButton = styled.button`
  position: absolute;
  top: 12px;
  width: ${SHEET_BUTTON_SIZE}px;
  height: ${SHEET_BUTTON_SIZE}px;
  border: none;
  border-radius: 50%;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => (theme as any).colorSurfaceContainerLow || 'rgba(0,0,0,0.06)'};
  color: ${({ theme }) => (theme as any).colorOnSurfaceVariant || 'rgba(0,0,0,0.5)'};
`;

const SheetCloseButton = styled(SheetCornerButton)`
  left: 12px;
`;

const SheetEditButton = styled(SheetCornerButton)`
  right: 12px;
  width: auto;
  min-width: ${SHEET_BUTTON_SIZE}px;
  padding: 0 12px;
  border-radius: ${SHEET_BUTTON_SIZE / 2}px;
  font-size: 14px;
  font-weight: 600;
  background: ${({ theme }) => (theme as any).colorPrimaryVariant || '#f0d0f5'};
  color: ${({ theme }) => (theme as any).colorOnSurface || '#000'};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const SheetHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px 16px;
  flex-shrink: 0;
`;

const SheetHeaderSide = styled.div<{ $align: 'left' | 'right' }>`
  flex: 0 0 100px;
  min-width: 100px;
  display: flex;
  align-items: center;
  justify-content: ${({ $align }) => ($align === 'left' ? 'flex-start' : 'flex-end')};
`;

const SheetTitle = styled.span`
  flex: 1;
  position: relative;
  top: -14px;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => (theme as any).colorOnSurface || '#000'};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  text-align: center;
`;

const SheetBody = styled.div`
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`;

const SheetSearchBar = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px 20px;
`;

const SheetSearchInput = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 44px;
  padding: 0 16px;
  border-radius: 22px;
  background: ${({ theme }) => (theme as any).colorSurfaceContainerLow || 'rgba(0,0,0,0.06)'};
`;

const SheetSearchInputField = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  font-size: 16px;
  color: ${({ theme }) => (theme as any).colorOnSurface || '#000'};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  &::placeholder {
    color: ${({ theme }) => (theme as any).colorOnSurfaceVariant || 'rgba(0,0,0,0.5)'};
  }
  &:focus {
    outline: none;
  }
`;

const SheetAISparkleButton = styled.button`
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border: none;
  border-radius: 50%;
  background: ${({ theme }) => (theme as any).colorSurfaceBright || '#fff'};
  border: 1px solid ${({ theme }) => (theme as any).colorOutlineVariant || 'rgba(0,0,0,0.12)'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DRAG_THRESHOLD = 24;

const ShortcutsSheet: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  persona: PersonaId;
  skuFlags: SkuFlags;
  onboarding: boolean;
}> = ({ isOpen, onClose, persona, skuFlags, onboarding }) => {
  const { theme } = usePebbleTheme();
  const [detent, setDetent] = React.useState<SheetDetent>('medium');
  const [largeHeight, setLargeHeight] = React.useState<number | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const bodyRef = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const dragStartY = React.useRef<number>(0);
  const dragStartDetent = React.useRef<SheetDetent>('medium');
  const isDragging = React.useRef(false);

  React.useEffect(() => {
    if (isOpen) {
      setDetent('medium');
      setLargeHeight(null);
      setSearchQuery('');
    }
  }, [isOpen]);

  const { all } = getQuickActions({ persona, skuFlags, onboarding, maxCount: 50 });
  const groups = React.useMemo(() => {
    const byProduct: Record<string, QuickAction[]> = {};
    const q = searchQuery.trim().toLowerCase();
    for (const a of all) {
      if (q && !a.label.toLowerCase().includes(q)) continue;
      const key = a.product;
      if (!byProduct[key]) byProduct[key] = [];
      byProduct[key].push(a);
    }
    return Object.entries(byProduct).map(([product, actions]) => ({
      product: PRODUCT_DISPLAY_NAMES[product] ?? product,
      actions,
    }));
  }, [all, searchQuery]);

  React.useEffect(() => {
    if (!isOpen || !bodyRef.current || !panelRef.current) return;
    const measure = () => {
      if (!bodyRef.current || !panelRef.current) return;
      const parent = panelRef.current.parentElement;
      const maxHeight = parent ? parent.clientHeight * 0.9 : window.innerHeight * 0.9;
      const contentHeight = HEADER_HEIGHT + bodyRef.current.scrollHeight + SEARCH_BAR_HEIGHT;
      setLargeHeight(Math.min(contentHeight, maxHeight));
    };
    measure();
    const t1 = setTimeout(measure, 50);
    const t2 = setTimeout(measure, 150);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isOpen, groups]);

  const handleGrabberPointerDown = useCallback((e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isDragging.current = true;
    dragStartY.current = e.clientY;
    dragStartDetent.current = detent;
  }, [detent]);

  const handleGrabberPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const delta = dragStartY.current - e.clientY;
    const current = dragStartDetent.current;
    if (delta > DRAG_THRESHOLD) {
      if (current === 'small') {
        setDetent('medium');
        dragStartY.current = e.clientY;
        dragStartDetent.current = 'medium';
      } else if (current === 'medium') {
        setDetent('large');
        dragStartY.current = e.clientY;
        dragStartDetent.current = 'large';
      }
    } else if (delta < -DRAG_THRESHOLD) {
      if (current === 'large') {
        setDetent('medium');
        dragStartY.current = e.clientY;
        dragStartDetent.current = 'medium';
      } else if (current === 'medium') {
        setDetent('small');
        dragStartY.current = e.clientY;
        dragStartDetent.current = 'small';
      }
    }
  }, []);

  const handleGrabberPointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleBodyScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    if (target.scrollTop > 20 && (detent === 'small' || detent === 'medium')) {
      setExpandImmediately(true);
      setDetent('large');
    }
  }, [detent]);

  const [expandImmediately, setExpandImmediately] = React.useState(false);
  React.useEffect(() => {
    if (expandImmediately) {
      const id = requestAnimationFrame(() => {
        setExpandImmediately(false);
      });
      return () => cancelAnimationFrame(id);
    }
  }, [expandImmediately]);

  React.useEffect(() => {
    if (detent !== 'large' || !panelRef.current || !bodyRef.current) return;
    const panel = panelRef.current;
    const body = bodyRef.current;
    const handleTransitionEnd = (e: TransitionEvent) => {
      if (e.propertyName === 'height') {
        body.scrollTop = 0;
        panel.removeEventListener('transitionend', handleTransitionEnd);
      }
    };
    panel.addEventListener('transitionend', handleTransitionEnd);
    return () => panel.removeEventListener('transitionend', handleTransitionEnd);
  }, [detent]);

  return (
    <>
      <SheetBackdrop isOpen={isOpen} onClick={onClose} aria-hidden="true" />
      <SheetPanel ref={panelRef} isOpen={isOpen} $detent={detent} $largeHeight={largeHeight} $expandImmediately={expandImmediately}>
        <SheetTopRow>
          <SheetCloseButton onClick={onClose} aria-label="Close">
            <Icon type={Icon.TYPES.CLOSE} size={24} color={theme.colorOnSurfaceVariant} />
          </SheetCloseButton>
          <SheetDragIndicator
            onPointerDown={handleGrabberPointerDown}
            onPointerMove={handleGrabberPointerMove}
            onPointerUp={handleGrabberPointerUp}
            onPointerCancel={handleGrabberPointerUp}
          />
          <SheetEditButton type="button" onClick={() => {}}>Edit favorites</SheetEditButton>
        </SheetTopRow>
        <SheetHeader>
          <SheetHeaderSide $align="left" />
          <SheetTitle>All shortcuts</SheetTitle>
          <SheetHeaderSide $align="right" />
        </SheetHeader>
        <SheetBody ref={bodyRef} onScroll={handleBodyScroll}>
          {groups.map(({ product, actions }) => (
            <ShortcutsSheetGroup key={product}>
              <ShortcutsSheetGroupTitleButton type="button" onClick={() => {}} aria-label={`Go to ${product}`}>
                <ShortcutsSheetGroupTitleText>{product}</ShortcutsSheetGroupTitleText>
                <Icon type={Icon.TYPES.CHEVRON_RIGHT} size={16} color={theme.colorOnSurfaceVariant} />
              </ShortcutsSheetGroupTitleButton>
              <ShortcutsGrid scrollable>
                {actions.map(a => (
                  <ShortcutItem key={a.id} $scrollable>
                    <ShortcutIconCircle>
                      <Icon type={QUICK_ACTION_ICONS[a.id]} size={20} color={theme.colorOnSurface} />
                    </ShortcutIconCircle>
                    <ShortcutLabel>{a.label}</ShortcutLabel>
                  </ShortcutItem>
                ))}
              </ShortcutsGrid>
            </ShortcutsSheetGroup>
          ))}
        </SheetBody>
        {detent === 'large' && (
          <SheetSearchBar>
            <SheetSearchInput>
              <Icon type={Icon.TYPES.SEARCH_OUTLINE} size={20} color={theme.colorOnSurfaceVariant} />
              <SheetSearchInputField
                type="search"
                placeholder="Search shortcuts"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search shortcuts"
              />
            </SheetSearchInput>
            <SheetAISparkleButton type="button" aria-label="Open AI assistant">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M1.0871 5.2088C2.69493 4.77473 3.96253 3.50712 4.3966 1.89929H5.60339C6.03746 3.50712 7.30506 4.77473 8.9129 5.2088V6.41559C7.30506 6.84966 6.03746 8.11725 5.60339 9.72509L4.3966 9.7251C3.96253 8.11727 2.69493 6.84966 1.0871 6.41559V5.2088ZM2.85513 5.81219C3.74179 6.32997 4.48222 7.07041 4.99999 7.95706C5.51777 7.0704 6.2582 6.32996 7.14486 5.81219C6.2582 5.29442 5.51777 4.55398 5 3.66732C4.48222 4.55398 3.74179 5.29442 2.85513 5.81219Z" fill={theme.colorOnSurfaceVariant}/>
                <path fillRule="evenodd" clipRule="evenodd" d="M6.92043 10.6255C9.54082 9.91804 11.6058 7.853 12.3133 5.23263H13.5201C14.2275 7.853 16.2925 9.91804 18.9129 10.6255V11.8323C16.2925 12.5397 14.2275 14.6047 13.5201 17.2251L12.3133 17.2251C11.6058 14.6047 9.54082 12.5397 6.92043 11.8323V10.6255ZM8.84684 11.2289C10.6124 12.0975 12.048 13.5332 12.9167 15.2987C13.7853 13.5332 15.221 12.0975 16.9865 11.2289C15.221 10.3602 13.7853 8.92455 12.9167 7.15903C12.048 8.92455 10.6124 10.3602 8.84684 11.2289Z" fill={theme.colorOnSurfaceVariant}/>
                <path fillRule="evenodd" clipRule="evenodd" d="M5.6466 13.566C5.37655 14.5663 4.5874 15.3554 3.5871 15.6255V16.8323C4.5874 17.1023 5.37655 17.8915 5.6466 18.8918L6.85339 18.8918C7.12345 17.8915 7.91259 17.1023 8.9129 16.8323V15.6255C7.91259 15.3554 7.12345 14.5663 6.85339 13.566H5.6466ZM6.24999 17.2721C5.96679 16.8657 5.61317 16.5121 5.20671 16.2289C5.61317 15.9457 5.96679 15.592 6.25 15.1856C6.5332 15.592 6.88682 15.9457 7.29328 16.2289C6.88682 16.5121 6.5332 16.8657 6.24999 17.2721Z" fill={theme.colorOnSurfaceVariant}/>
              </svg>
            </SheetAISparkleButton>
          </SheetSearchBar>
        )}
      </SheetPanel>
    </>
  );
};

const ShortcutItem = styled.div<{ $scrollable?: boolean }>`
  flex: ${({ $scrollable }) => ($scrollable ? '0 0 auto' : '1')};
  max-width: ${({ $scrollable }) => ($scrollable ? '70px' : 'none')};
  cursor: ${({ $scrollable }) => ($scrollable ? 'pointer' : 'default')};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding-top: 8px;
`;

const ShortcutIconCircle = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: ${({ theme }) => (theme as any).colorSurfaceDim || 'rgba(0, 0, 0, 0.06)'};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ShortcutLabel = styled.span`
  font-size: 14px;
  font-weight: 400;
  color: ${({ theme }) => (theme as any).colorOnSurface || '#000'};
  text-align: center;
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 19px;
  letter-spacing: 0;
  min-width: 100%;
  word-wrap: break-word;
`;

const QUICK_ACTION_ICONS: Record<QuickActionId, string> = {
  request_time_off: Icon.TYPES.UNLIMITED_PTO_OUTLINE,
  view_my_schedule: Icon.TYPES.CALENDAR_OUTLINE,
  view_my_timecard: Icon.TYPES.TIME_OUTLINE,
  pick_up_shift: Icon.TYPES.SWAP,
  view_pto_balances: Icon.TYPES.UNLIMITED_PTO_OUTLINE,
  view_team_schedule: Icon.TYPES.CALENDAR_OUTLINE,
  view_paystubs: Icon.TYPES.DOCUMENT_OUTLINE,
  update_bank_account: Icon.TYPES.BANK_OUTLINE,
  view_tax_documents: Icon.TYPES.DOCUMENT_OUTLINE,
  view_my_benefits: Icon.TYPES.HEART_OUTLINE,
  submit_expense: Icon.TYPES.RECEIPT_OUTLINE,
  scan_receipt: Icon.TYPES.CAMERA_OUTLINE,
  log_mileage: Icon.TYPES.COMPASS_OUTLINE,
  people_directory: Icon.TYPES.USERS_OUTLINE,
  view_documents: Icon.TYPES.DOCUMENT_OUTLINE,
  shift_swaps: Icon.TYPES.SWAP,
  edit_availability: Icon.TYPES.CALENDAR_OUTLINE,
  team_schedule: Icon.TYPES.CALENDAR_OUTLINE,
  review_timesheets: Icon.TYPES.TIME_OUTLINE,
  assign_shifts: Icon.TYPES.TASKS_OUTLINE,
  message_team: Icon.TYPES.MESSAGE_OUTLINE,
  view_shift_summary: Icon.TYPES.TIME_OUTLINE,
  time_entry_change_request: Icon.TYPES.TIME_OUTLINE,
  view_pto_approvals: Icon.TYPES.UNLIMITED_PTO_OUTLINE,
  view_company_holidays: Icon.TYPES.CALENDAR_OUTLINE,
  view_team_ooo: Icon.TYPES.CALENDAR_OUTLINE,
  view_pay: Icon.TYPES.DOLLAR_CIRCLE_OUTLINE,
  update_withholdings: Icon.TYPES.DOCUMENT_OUTLINE,
  paycheck_split: Icon.TYPES.DOLLAR_CIRCLE_OUTLINE,
  view_flex_benefits: Icon.TYPES.HEART_OUTLINE,
  view_hsa: Icon.TYPES.HEART_OUTLINE,
  view_expenses: Icon.TYPES.RECEIPT_OUTLINE,
  view_expense_approvals: Icon.TYPES.RECEIPT_OUTLINE,
  view_cards: Icon.TYPES.CREDIT_CARD_OUTLINE,
  view_notifications: Icon.TYPES.NOTIFICATION_OUTLINE,
  view_profile: Icon.TYPES.USER_OUTLINE,
  book_travel: Icon.TYPES.TRAVEL_OUTLINE,
};

const SKU_ID_MAP: Record<string, SkuId> = {
  time_off: 'time_off',
  scheduling: 'scheduling',
  time_attendance: 'time_tracking',
  time_standalone: 'time_tracking',
  my_pay: 'my_pay',
  my_benefits: 'my_benefits',
  spend_management: 'spend_management',
  people_directory: 'people_directory',
  travel: 'travel',
  chat: 'chat',
};

const SKU_MULTI_MAP: Record<string, SkuId[]> = {
  time_standalone: ['time_tracking', 'scheduling'],
};

function enabledAppsToSkuFlags(enabledApps: Set<string>): SkuFlags {
  const flags: SkuFlags = {};
  for (const appId of enabledApps) {
    const multi = SKU_MULTI_MAP[appId];
    if (multi) {
      for (const s of multi) flags[s] = true;
    } else {
      const skuId = SKU_ID_MAP[appId];
      if (skuId) flags[skuId] = true;
    }
  }
  return flags;
}

const ShortcutsContent: React.FC<{ actions: QuickAction[]; onSurface?: string }> = ({ actions, onSurface }) => (
  <ShortcutsGrid>
    {actions.map(a => (
      <ShortcutItem key={a.id}>
        <ShortcutIconCircle>
          <Icon type={QUICK_ACTION_ICONS[a.id]} size={20} color={onSurface || '#000'} />
        </ShortcutIconCircle>
        <ShortcutLabel>{a.label}</ShortcutLabel>
      </ShortcutItem>
    ))}
  </ShortcutsGrid>
);

interface WidgetAction {
  label: string;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

interface WidgetCardProps {
  title: string;
  meta?: React.ReactNode;
  onTitleClick?: () => void;
  children: React.ReactNode;
  actions?: WidgetAction[];
  footer?: React.ReactNode;
  surfaceVariant?: string;
  outlineVariant?: string;
  primaryColor?: string;
}

const WidgetCard: React.FC<WidgetCardProps> = ({ title, meta, children, actions, footer, surfaceVariant, outlineVariant, primaryColor, onTitleClick }) => {
  const TitleWrapper = onTitleClick ? WidgetCardTitleButton : WidgetCardTitleGroup;
  return (
  <WidgetCardContainer outlineVariant={outlineVariant}>
    <WidgetCardHeader>
      <TitleWrapper onClick={onTitleClick}>
        <WidgetCardTitle surfaceVariant={surfaceVariant}>{title}</WidgetCardTitle>
        <Icon type={Icon.TYPES.CHEVRON_RIGHT} size={16} color={surfaceVariant || 'rgba(0, 0, 0, 0.45)'} />
      </TitleWrapper>
      {meta && <WidgetCardMeta>{meta}</WidgetCardMeta>}
    </WidgetCardHeader>
    <WidgetCardBody>{children}</WidgetCardBody>
    {actions && actions.length > 0 && (
      <WidgetCardFooter>
        {actions.map(a => (
          <WidgetFooterButton key={a.label} variant={a.variant || 'primary'} primaryColor={primaryColor} onClick={a.onClick}>
            {a.label}
          </WidgetFooterButton>
        ))}
      </WidgetCardFooter>
    )}
    {!actions && footer && <WidgetCardFooter>{footer}</WidgetCardFooter>}
  </WidgetCardContainer>
  );
};

// ─── Discovery App List Data ─────────────────────────────────────────────

type AppItem = {
  id: string;
  /** Name shown in the Purchased SKU HUD panel */
  label: string;
  /** Name shown in the discovery app list (defaults to label if omitted) */
  displayName?: string;
  group: string;
  /** Pebble Icon.TYPES constant for the app icon (white on colored bg) */
  icon: string;
};

const ALL_APPS: AppItem[] = [
  // HR
  { id: 'people_directory', label: 'People Directory', group: 'HR', icon: Icon.TYPES.USERS_FILLED },
  { id: 'chat', label: 'Chat', group: 'HR', icon: Icon.TYPES.COMMENTS_FILLED },
  { id: 'time_off', label: 'Time Off (PTO)', displayName: 'Time Off', group: 'HR', icon: Icon.TYPES.UNLIMITED_PTO_FILLED },
  { id: 'time_attendance', label: 'Time & Attendance', group: 'HR', icon: Icon.TYPES.TIME_FILLED },
  { id: 'scheduling', label: 'Scheduling', group: 'HR', icon: Icon.TYPES.CALENDAR_FILLED },
  { id: 'time_standalone', label: 'Time (Standalone)', displayName: 'Time', group: 'HR', icon: Icon.TYPES.TIME_FILLED },
  { id: 'learn', label: 'Learn', group: 'HR', icon: Icon.TYPES.COURSES_FILLED },
  { id: 'surveys', label: 'Surveys', group: 'HR', icon: Icon.TYPES.SURVEY_SATISFIED_FILLED },
  { id: 'my_benefits', label: 'My Benefits', group: 'HR', icon: Icon.TYPES.HEART_FILLED },
  { id: 'news_feed', label: 'News Feed', displayName: 'News', group: 'HR', icon: Icon.TYPES.NEWSPAPER_FILLED },
  // Finance
  { id: 'my_pay', label: 'My Pay', group: 'Finance', icon: Icon.TYPES.DOLLAR_CIRCLE_FILLED },
  { id: 'spend_management', label: 'Spend Management', displayName: 'Spend', group: 'Finance', icon: Icon.TYPES.CREDIT_CARD_FILLED },
  { id: 'travel', label: 'Travel', group: 'Finance', icon: Icon.TYPES.TRAVEL_FILLED },
  // IT
  { id: 'passwords', label: 'Passwords', group: 'IT', icon: Icon.TYPES.LOCK_FILLED },
];

const APP_GROUPS = ['HR', 'Finance', 'IT'] as const;

const PERSONA_DEFAULT_SKUS: Record<PersonaId, string[]> = {
  hourly_operator: [
    'time_off', 'time_standalone', 'my_pay', 'people_directory', 'chat',
  ],
  employee_self_service: [
    'time_off', 'my_pay', 'my_benefits', 'spend_management', 'people_directory', 'travel', 'chat',
  ],
  frontline_shift_manager: [
    'time_off', 'time_attendance', 'scheduling', 'my_pay', 'people_directory', 'chat',
  ],
  people_manager: [
    'time_off', 'my_pay', 'my_benefits', 'spend_management', 'people_directory', 'chat',
  ],
  functional_admin: [
    'time_off', 'my_pay', 'my_benefits', 'people_directory', 'passwords', 'chat',
  ],
  executive_owner: [
    'time_off', 'my_pay', 'my_benefits', 'spend_management', 'people_directory', 'chat',
  ],
  contractor: [
    'my_pay', 'spend_management', 'time_attendance', 'time_standalone', 'people_directory', 'chat',
  ],
};

// ─── Discovery List Styles ───────────────────────────────────────────────

const AppListContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 16px;
`;

const AppGroupHeader = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => (theme as any).colorOnSurfaceVariant || 'rgba(0, 0, 0, 0.4)'};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 12px 4px 6px;
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  &:first-of-type {
    padding-top: 4px;
  }
`;

const AppRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 4px;
  border-bottom: 1px solid ${({ theme }) => (theme as any).colorOutlineVariant || 'rgba(0,0,0,0.05)'};
  &:last-child {
    border-bottom: none;
  }
`;

const AppIconBox = styled.div<{ primary?: string }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${({ primary }) => primary || '#6750A4'};
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AppLabel = styled.span`
  ${({ theme }) => (theme as any).typestyleV2BodyLargeEmphasized};
  color: ${({ theme }) => (theme as any).colorOnSurface || '#1a1a1a'};
`;

const AppChevron = styled.span`
  margin-left: auto;
  font-size: 16px;
  color: ${({ theme }) => (theme as any).colorOutlineVariant || 'rgba(0, 0, 0, 0.2)'};
`;

// ─── HUD App Checkbox Styles ─────────────────────────────────────────────

const HudCheckboxRow = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  cursor: pointer;
  &:last-child {
    border-bottom: none;
  }
`;

const HudCheckbox = styled.input<{ primaryColor?: string }>`
  width: 16px;
  height: 16px;
  accent-color: ${({ primaryColor }) => primaryColor || '#6750A4'};
  cursor: pointer;
  flex-shrink: 0;
`;

const HudCheckboxLabel = styled.span`
  font-size: 13px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.55);
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const ModalGroupRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px 4px;
`;

const ModalGroupName = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ModalActionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px 6px;
`;

const ModalActionLink = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #7ec8e3;
  &:hover { opacity: 0.8; }
`;

const ModalActionSep = styled.span`
  color: rgba(255, 255, 255, 0.15);
  font-size: 13px;
`;

const ModalGroupActions = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const HudPillWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 10px 14px;
  align-items: center;
`;

const HudPill = styled.button<{ removable?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.75);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.4;
  white-space: nowrap;
  cursor: ${({ removable }) => removable ? 'pointer' : 'default'};
  transition: background 0.15s, border-color 0.15s;

  & > .pill-x {
    font-size: 10px;
    line-height: 1;
    color: rgba(255, 255, 255, 0.35);
    margin-left: 2px;
    transition: color 0.15s;
  }

  ${({ removable }) => removable && `
    &:hover {
      background: rgba(255, 80, 80, 0.2);
      border-color: rgba(255, 80, 80, 0.35);
    }
    &:hover > .pill-x {
      color: rgba(255, 120, 120, 0.9);
    }
  `}
`;

const HudPillMore = styled.button`
  display: inline-block;
  padding: 3px 0;
  font-size: 11px;
  font-weight: 500;
  color: #7ec8e3;
  background: none;
  border: none;
  cursor: pointer;
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  white-space: nowrap;
  &:hover {
    text-decoration: underline;
  }
`;

const HudEditButton = styled.button`
  padding: 5px 12px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  font-weight: 500;
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  cursor: pointer;
  flex-shrink: 0;
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

// ─── Apps Modal ──────────────────────────────────────────────────────────

const AppsModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 30000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AppsModalPanel = styled.div`
  width: 600px;
  max-height: 80vh;
  background: #1a1a1a;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const AppsModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`;

const AppsModalTitle = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const AppsModalClose = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  cursor: pointer;
  padding: 4px 8px;
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  &:hover { color: #fff; }
`;

const AppsModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 4px 0 12px;
`;

// ─── Helpers ─────────────────────────────────────────────────────────────

const WIDGET_LABEL_OVERRIDES: Record<string, string> = {
  shift_clock: 'Upcoming shift',
  inbox_preview: 'Inbox queue (task/approvals)',
  quick_actions: 'Shortcuts',
};

const WIDGET_ACTIONS: Record<string, WidgetAction[]> = {
  shift_clock: [
    { label: 'My schedule', variant: 'secondary' },
    { label: 'Clock in', variant: 'primary' },
  ],
};

const EARNINGS_TITLE_BY_PERSONA: Partial<Record<PersonaId, string>> = {
  hourly_operator: 'My Pay',
  contractor: 'Invoices',
  employee_self_service: 'My Pay',
  people_manager: 'My Pay',
  frontline_shift_manager: 'My Pay',
  functional_admin: 'My Pay',
  executive_owner: 'My Pay',
};

function widgetIdToTitle(id: string, persona?: PersonaId): string {
  if (id === 'inbox_preview' && persona === 'employee_self_service') return 'Priority tasks';
  if (id === 'earnings_summary' && persona && EARNINGS_TITLE_BY_PERSONA[persona]) return EARNINGS_TITLE_BY_PERSONA[persona];
  if (WIDGET_LABEL_OVERRIDES[id]) return WIDGET_LABEL_OVERRIDES[id];
  return id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ─── Discovery App List Component ────────────────────────────────────────

const DiscoveryAppList: React.FC<{ enabledApps: Set<string>; primary?: string }> = ({ enabledApps, primary }) => {
  const visibleApps = ALL_APPS.filter(a => enabledApps.has(a.id));
  const groups = APP_GROUPS.filter(g => visibleApps.some(a => a.group === g));
  if (groups.length === 0) return null;
  return (
    <AppListContainer>
      {groups.map(group => (
        <React.Fragment key={group}>
          <AppGroupHeader>{group}</AppGroupHeader>
          {visibleApps.filter(a => a.group === group).map(app => (
            <AppRow key={app.id}>
              <AppIconBox primary={primary}>
                <Icon type={app.icon} size={20} color="#fff" />
              </AppIconBox>
              <AppLabel>{app.displayName ?? app.label}</AppLabel>
              <AppChevron>›</AppChevron>
            </AppRow>
          ))}
        </React.Fragment>
      ))}
    </AppListContainer>
  );
};

// ─── Home View ──────────────────────────────────────────────────────────

const renderWidgetContent = (widgetId: string, _sv: string, onSurface?: string, quickActions?: QuickAction[], persona?: PersonaId) => {
  if (widgetId === 'quick_actions' && quickActions) return <ShortcutsContent actions={quickActions} onSurface={onSurface} />;
  if (widgetId === 'shift_clock') return <ShiftClockContent />;
  if (widgetId === 'inbox_preview') return <InboxPreviewContent />;
  if (widgetId === 'earnings_summary' && persona) return <EarningsSummaryContent persona={persona} />;
  return <ContentSlot>Content slot</ContentSlot>;
};

const HomeView: React.FC<{ theme: any; zoneWidgets: ZoneMapping; enabledApps: Set<string>; persona: PersonaId; onboarding: boolean; darkMode?: boolean; onOpenShortcutsSheet?: () => void }> = ({ theme, zoneWidgets, enabledApps, persona, onboarding, darkMode, onOpenShortcutsSheet }) => {
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
        {/* Primary zone */}
        {zoneWidgets.primary.map(w => (
          <WidgetCard key={w} title={widgetIdToTitle(w, persona)} surfaceVariant={sv} outlineVariant={ov} actions={WIDGET_ACTIONS[w]} primaryColor={theme.colorPrimaryContainer} onTitleClick={w === 'quick_actions' ? onOpenShortcutsSheet : undefined}>
            {renderWidgetContent(w, sv, theme.colorOnSurface, quickActions, persona)}
          </WidgetCard>
        ))}

        {/* Core zone */}
        {zoneWidgets.core.map(w => (
          <WidgetCard key={w} title={widgetIdToTitle(w, persona)} surfaceVariant={sv} outlineVariant={ov} actions={WIDGET_ACTIONS[w]} primaryColor={theme.colorPrimaryContainer} onTitleClick={w === 'quick_actions' ? onOpenShortcutsSheet : undefined}>
            {renderWidgetContent(w, sv, theme.colorOnSurface, quickActions, persona)}
          </WidgetCard>
        ))}

        {/* Contextual zone */}
        {zoneWidgets.contextual.map(w => (
          <WidgetCard key={w} title={widgetIdToTitle(w, persona)} surfaceVariant={sv} outlineVariant={ov} actions={WIDGET_ACTIONS[w]} primaryColor={theme.colorPrimaryContainer} onTitleClick={w === 'quick_actions' ? onOpenShortcutsSheet : undefined}>
            {renderWidgetContent(w, sv, theme.colorOnSurface, quickActions, persona)}
          </WidgetCard>
        ))}

        {/* Discovery zone — flat app list, not cards */}
        <DiscoveryAppList enabledApps={enabledApps} primary={theme.colorPrimaryContainer} />
      </WidgetZones>

    </>
  );
};

// ─── Bottom Navigation (Liquid Glass) ───────────────────────────────────

const BottomNavBlur = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 2999;
  pointer-events: none;
  mask-image: linear-gradient(to bottom, transparent 0%, black 50%);
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 50%);
`;

const BottomNav = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  padding: 0 12px 4px;
  z-index: 3000;

  @media (min-width: 501px) {
    border-radius: 0 0 39px 39px;
  }
  @media (max-width: 500px) {
    position: fixed;
    border-radius: 0;
  }
`;

const BottomNavRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const TabBar = styled.div<{ isDark?: boolean }>`
  display: flex;
  align-items: stretch;
  justify-content: center;
  flex: 0 0 auto;
  height: 60px;
  padding: 2px;
  background: ${({ isDark }) => isDark
    ? 'linear-gradient(-45deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.14) 100%)'
    : 'linear-gradient(-45deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.45) 100%)'};
  backdrop-filter: blur(16px) saturate(120%);
  -webkit-backdrop-filter: blur(16px) saturate(120%);
  border: 0.5px solid ${({ isDark }) => isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.5)'};
  border-radius: 100px;
  box-shadow: ${({ isDark }) => isDark
    ? '0 1px 8px rgba(0,0,0,0.3), inset 0 0.5px 0 rgba(255,255,255,0.1)'
    : '0 1px 8px rgba(0,0,0,0.07), inset 0 0.5px 0 rgba(255,255,255,0.7)'};
`;

const NavItem = styled.div<{ active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  cursor: pointer;
  flex: 0 0 auto;
  width: 69px;
  height: 52px;
  padding: 0 4px;
  border-radius: 100px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: ${({ active, theme }) =>
    active
      ? (theme as any).colorSurfaceContainer
      : 'transparent'};
`;

const NavLabel = styled.span<{ active?: boolean }>`
  font-size: 10px;
  font-weight: ${({ active }) => (active ? 600 : 500)};
  color: ${({ theme }) => (theme as any).colorOnSurface || '#1a1a1a'};
  line-height: 1;
  letter-spacing: 0;
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const FloatingSettingsButton = styled.button<{ isDark?: boolean }>`
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ isDark }) => isDark
    ? 'linear-gradient(-45deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.14) 100%)'
    : 'linear-gradient(-45deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.45) 100%)'};
  backdrop-filter: blur(16px) saturate(120%);
  -webkit-backdrop-filter: blur(16px) saturate(120%);
  border: 0.5px solid ${({ isDark }) => isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.5)'};
  border-radius: 50%;
  box-shadow: ${({ isDark }) => isDark
    ? '0 1px 8px rgba(0,0,0,0.3), inset 0 0.5px 0 rgba(255,255,255,0.1)'
    : '0 1px 8px rgba(0,0,0,0.03), inset 0 0.5px 0 rgba(255,255,255,0.7)'};
  cursor: pointer;
  padding: 0;
  align-self: center;
`;

const HomeIndicatorBar = styled.div`
  width: 134px;
  height: 3px;
  background: #1a1a1a;
  border-radius: 100px;
  margin: 5px auto 3px;
  animation: fadeIndicator 1s ease-out 3s forwards;
  @keyframes fadeIndicator {
    to { opacity: 0; }
  }
`;

// ─── SVG Icons (matching Figma) ─────────────────────────────────────────

// ─── Status bar icons ───────────────────────────────────────────────────

const SignalBars = () => (
  <svg width="17" height="12" viewBox="0 0 17 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="9" width="3" height="3" rx="0.5" fill="currentColor"/>
    <rect x="4.5" y="6" width="3" height="6" rx="0.5" fill="currentColor"/>
    <rect x="9" y="3" width="3" height="9" rx="0.5" fill="currentColor"/>
    <rect x="13.5" y="0" width="3" height="12" rx="0.5" fill="currentColor"/>
  </svg>
);

const WifiIcon = () => (
  <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 11.5C8.83 11.5 9.5 10.83 9.5 10C9.5 9.17 8.83 8.5 8 8.5C7.17 8.5 6.5 9.17 6.5 10C6.5 10.83 7.17 11.5 8 11.5Z" fill="currentColor"/>
    <path d="M4.46 7.46C5.4 6.52 6.64 6 8 6C9.36 6 10.6 6.52 11.54 7.46" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M1.86 4.86C3.5 3.22 5.64 2.3 8 2.3C10.36 2.3 12.5 3.22 14.14 4.86" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const BatteryIcon = () => (
  <svg width="27" height="13" viewBox="0 0 27 13" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0.5" y="0.5" width="22" height="12" rx="2.5" stroke="currentColor" strokeOpacity="0.35"/>
    <rect x="2" y="2" width="19" height="9" rx="1.5" fill="currentColor"/>
    <path d="M24 4.5V8.5C25.1 8.17 25.1 4.83 24 4.5Z" fill="currentColor" fillOpacity="0.4"/>
  </svg>
);

// ─── HUD Panels ─────────────────────────────────────────────────────────

const HudToggle = styled.button<{ position: 'left' | 'right' }>`
  position: fixed;
  top: 16px;
  ${({ position }) => position}: 16px;
  height: 36px;
  padding: 0 20px;
  gap: 8px;
  border-radius: 100px;
  border: none;
  background: #1a1a1a;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 20000;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  letter-spacing: 0;
  transition: opacity 0.2s ease;
  &:hover {
    opacity: 0.8;
  }
`;

const HudToggleAvatar = styled.img`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
`;

const HudPanel = styled.div<{ position: 'left' | 'right'; open: boolean }>`
  position: fixed;
  top: 0;
  ${({ position }) => position}: 0;
  width: 350px;
  height: 100vh;
  background: #1a1a1a;
  color: #fff;
  z-index: 19999;
  display: flex;
  flex-direction: column;
  padding: 64px 24px 24px;
  transform: translateX(${({ position, open }) =>
    open ? '0' : position === 'left' ? '-100%' : '100%'});
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

const HudTitle = styled.h2`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: rgba(255, 255, 255, 0.35);
  margin: 0 0 16px;
`;

const HudSections = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  overflow-y: auto;
`;

const HudCard = styled.div`
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  overflow: hidden;
`;

const HudCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const HudRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  &:last-child {
    border-bottom: none;
  }
`;

const HudRowLabel = styled.span`
  font-size: 13px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.55);
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const HudRowPlaceholder = styled.div<{ variant?: 'toggle' | 'dropdown' }>`
  width: ${({ variant }) => (variant === 'dropdown' ? '80px' : '34px')};
  height: 20px;
  border-radius: ${({ variant }) => (variant === 'dropdown' ? '4px' : '10px')};
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.06);
`;


const HudToggleSwitch = styled.button<{ on: boolean }>`
  width: 42px;
  height: 24px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  position: relative;
  background: ${({ on }) => (on ? '#4ade80' : 'rgba(255, 255, 255, 0.15)')};
  transition: background 0.2s ease;
  padding: 0;
  flex-shrink: 0;
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${({ on }) => (on ? '20px' : '2px')};
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #fff;
    transition: left 0.2s ease;
  }
`;

const PersonaCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
`;

const PersonaAvatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 1.5px solid rgba(255, 255, 255, 0.15);
`;

const PersonaSelectInline = styled.select`
  flex: 1;
  padding: 6px 8px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  cursor: pointer;
  outline: none;
  appearance: auto;
  &:focus {
    border-color: rgba(255, 255, 255, 0.25);
  }
  option {
    background: #1a1a1a;
    color: #fff;
  }
`;

const HudRowValue = styled.span`
  font-size: 12px;
  font-family: 'SF Mono', 'Menlo', 'Consolas', monospace;
  color: rgba(255, 255, 255, 0.45);
  text-align: right;
`;

const HudFooter = styled.div`
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 11px;
  font-family: 'SF Mono', 'Menlo', 'Consolas', monospace;
  color: rgba(255, 255, 255, 0.3);
  line-height: 1.5;
`;

const navItems: Array<{ id: string; label: string; iconOutline: string; iconFilled: string; sku?: string }> = [
  { id: 'home', label: 'Home', iconOutline: Icon.TYPES.HOME_OUTLINE, iconFilled: Icon.TYPES.HOME_FILLED },
  { id: 'activity', label: 'Activity', iconOutline: Icon.TYPES.NOTIFICATION_OUTLINE, iconFilled: Icon.TYPES.NOTIFICATION_FILLED },
  { id: 'find', label: 'Find', iconOutline: Icon.TYPES.SEARCH_OUTLINE, iconFilled: Icon.TYPES.SEARCH_FILLED },
  { id: 'chat', label: 'Chat', iconOutline: Icon.TYPES.COMMENTS_OUTLINE, iconFilled: Icon.TYPES.COMMENTS_FILLED, sku: 'chat' },
];

// ─── Themed Phone Screen (reads from scoped ThemeProvider) ──────────────

interface ThemedPhoneScreenProps {
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

  React.useEffect(() => {
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
        {(activeItem?.id ?? 'home') === 'home' && <HomeView theme={theme} zoneWidgets={zoneWidgets} enabledApps={enabledApps} persona={persona} onboarding={onboarding} darkMode={darkMode} onOpenShortcutsSheet={() => setShortcutsSheetOpen(true)} />}
        {activeItem?.id === 'activity' && <ActivityView />}
        {activeItem?.id === 'find' && <FindView />}
        {activeItem?.id === 'chat' && <ChatView />}
      </ContentArea>

      <BottomNavBlur />
      <BottomNav>
        <BottomNavRow>
          <TabBar isDark={darkMode}>
            {filteredNavItems.map((item, idx) => (
              <NavItem
                key={item.id}
                active={idx === activeNav}
                onClick={() => setActiveNav(idx)}
              >
                <Icon
                  type={idx === activeNav ? item.iconFilled : item.iconOutline}
                  size={22}
                  color={indicatorColor}
                />
                <NavLabel active={idx === activeNav}>{item.label}</NavLabel>
              </NavItem>
            ))}
          </TabBar>
          <FloatingSettingsButton isDark={darkMode} aria-label="Customize">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M1.0871 5.2088C2.69493 4.77473 3.96253 3.50712 4.3966 1.89929H5.60339C6.03746 3.50712 7.30506 4.77473 8.9129 5.2088V6.41559C7.30506 6.84966 6.03746 8.11725 5.60339 9.72509L4.3966 9.7251C3.96253 8.11727 2.69493 6.84966 1.0871 6.41559V5.2088ZM2.85513 5.81219C3.74179 6.32997 4.48222 7.07041 4.99999 7.95706C5.51777 7.0704 6.2582 6.32996 7.14486 5.81219C6.2582 5.29442 5.51777 4.55398 5 3.66732C4.48222 4.55398 3.74179 5.29442 2.85513 5.81219Z" fill={indicatorColor}/>
              <path fillRule="evenodd" clipRule="evenodd" d="M6.92043 10.6255C9.54082 9.91804 11.6058 7.853 12.3133 5.23263H13.5201C14.2275 7.853 16.2925 9.91804 18.9129 10.6255V11.8323C16.2925 12.5397 14.2275 14.6047 13.5201 17.2251L12.3133 17.2251C11.6058 14.6047 9.54082 12.5397 6.92043 11.8323V10.6255ZM8.84684 11.2289C10.6124 12.0975 12.048 13.5332 12.9167 15.2987C13.7853 13.5332 15.221 12.0975 16.9865 11.2289C15.221 10.3602 13.7853 8.92455 12.9167 7.15903C12.048 8.92455 10.6124 10.3602 8.84684 11.2289Z" fill={indicatorColor}/>
              <path fillRule="evenodd" clipRule="evenodd" d="M5.6466 13.566C5.37655 14.5663 4.5874 15.3554 3.5871 15.6255V16.8323C4.5874 17.1023 5.37655 17.8915 5.6466 18.8918L6.85339 18.8918C7.12345 17.8915 7.91259 17.1023 8.9129 16.8323V15.6255C7.91259 15.3554 7.12345 14.5663 6.85339 13.566H5.6466ZM6.24999 17.2721C5.96679 16.8657 5.61317 16.5121 5.20671 16.2289C5.61317 15.9457 5.96679 15.592 6.25 15.1856C6.5332 15.592 6.88682 15.9457 7.29328 16.2289C6.88682 16.5121 6.5332 16.8657 6.24999 17.2721Z" fill={indicatorColor}/>
            </svg>
          </FloatingSettingsButton>
        </BottomNavRow>
        <HomeIndicatorBar style={{ background: indicatorColor }} />
      </BottomNav>

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

// ─── Component ──────────────────────────────────────────────────────────

const MobileHomeDemo: React.FC = () => {
  const { theme } = usePebbleTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeNav, setActiveNav] = useState(0);
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [appsModalOpen, setAppsModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const leftToggleRef = useRef<HTMLButtonElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const rightToggleRef = useRef<HTMLButtonElement>(null);

  // Persona + onboarding + apps state from query params
  const initialPersona = (PERSONA_OPTIONS.find(p => p.id === searchParams.get('persona'))?.id) ?? 'hourly_operator';
  const initialOnboarding = searchParams.get('onboarding') === '1';
  const initialApps = (() => {
    const appsParam = searchParams.get('apps');
    if (appsParam) return new Set(appsParam.split(',').filter(Boolean));
    return new Set(PERSONA_DEFAULT_SKUS[initialPersona] ?? []);
  })();
  const [persona, setPersona] = useState<PersonaId>(initialPersona);
  const [onboarding, setOnboarding] = useState(initialOnboarding);
  const [enabledApps, setEnabledApps] = useState<Set<string>>(initialApps);

  const updateParams = useCallback((p: PersonaId, o: boolean, apps: Set<string>) => {
    const allEnabled = apps.size === ALL_APPS.length;
    const params: Record<string, string> = { persona: p, onboarding: o ? '1' : '0' };
    if (!allEnabled) params.apps = Array.from(apps).join(',');
    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  const handlePersonaChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as PersonaId;
    const defaultSkus = new Set(PERSONA_DEFAULT_SKUS[val] ?? []);
    setPersona(val);
    setEnabledApps(defaultSkus);
    updateParams(val, onboarding, defaultSkus);
  }, [onboarding, updateParams]);

  const handleOnboardingToggle = useCallback(() => {
    setOnboarding(prev => {
      const next = !prev;
      updateParams(persona, next, enabledApps);
      return next;
    });
  }, [persona, enabledApps, updateParams]);

  const handleAppToggle = useCallback((appId: string) => {
    setEnabledApps(prev => {
      const next = new Set(prev);
      if (next.has(appId)) next.delete(appId); else next.add(appId);
      updateParams(persona, onboarding, next);
      return next;
    });
  }, [persona, onboarding, updateParams]);

  const zoneWidgets = getZoneWidgets(persona, onboarding, enabledApps);
  const personaAvatar = PERSONA_OPTIONS.find(p => p.id === persona)?.avatar ?? PERSONA_OPTIONS[0].avatar;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        leftPanelOpen &&
        leftPanelRef.current &&
        !leftPanelRef.current.contains(e.target as Node) &&
        leftToggleRef.current &&
        !leftToggleRef.current.contains(e.target as Node)
      ) {
        setLeftPanelOpen(false);
      }
      if (
        rightPanelOpen &&
        rightPanelRef.current &&
        !rightPanelRef.current.contains(e.target as Node) &&
        rightToggleRef.current &&
        !rightToggleRef.current.contains(e.target as Node)
      ) {
        setRightPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [leftPanelOpen, rightPanelOpen]);


  return (
    <>
      <Global
        styles={css`
          * { box-sizing: border-box; }
          body { margin: 0; padding: 0; overflow-x: hidden; }
        `}
      />

      {/* HUD Toggle Buttons */}
      <HudToggle ref={leftToggleRef} position="left" onClick={() => setLeftPanelOpen(prev => !prev)} aria-label="Toggle System Display panel">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="14" rx="2" stroke="#fff" strokeWidth="2"/><path d="M8 21h8M12 17v4" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
        System Display
      </HudToggle>
      <HudToggle ref={rightToggleRef} position="right" onClick={() => setRightPanelOpen(prev => !prev)} aria-label="Toggle Persona panel">
        <HudToggleAvatar src={personaAvatar} alt="Persona" />
        {PERSONA_OPTIONS.find(p => p.id === persona)?.label ?? 'Persona'}
      </HudToggle>

      {/* HUD Panels */}
      <HudPanel ref={leftPanelRef} position="left" open={leftPanelOpen}>
        <HudTitle>System</HudTitle>
        <HudSections>
          <HudCard>
            <HudCardHeader>Navigation</HudCardHeader>
            <HudRow><HudRowLabel>Tab bar style</HudRowLabel><HudRowPlaceholder variant="dropdown" /></HudRow>
            <HudRow><HudRowLabel>Show labels</HudRowLabel><HudRowPlaceholder variant="toggle" /></HudRow>
            <HudRow><HudRowLabel>Tab order</HudRowLabel><HudRowPlaceholder variant="dropdown" /></HudRow>
          </HudCard>

          <HudCard>
            <HudCardHeader>Appearance</HudCardHeader>
            <HudRow>
              <HudRowLabel>Dark mode</HudRowLabel>
              <HudToggleSwitch on={darkMode} onClick={() => setDarkMode(prev => !prev)} />
            </HudRow>
          </HudCard>

          <HudCard>
            <HudCardHeader>Home Framework</HudCardHeader>
            <HudRow><HudRowLabel>Layout mode</HudRowLabel><HudRowPlaceholder variant="toggle" /></HudRow>
            <HudRow><HudRowLabel>Widget density</HudRowLabel><HudRowPlaceholder variant="toggle" /></HudRow>
          </HudCard>

          <HudCard>
            <HudCardHeader>Experiments</HudCardHeader>
            <HudRow><HudRowLabel>Liquid glass</HudRowLabel><HudRowPlaceholder variant="toggle" /></HudRow>
            <HudRow><HudRowLabel>Haptic feedback</HudRowLabel><HudRowPlaceholder variant="toggle" /></HudRow>
          </HudCard>
        </HudSections>
      </HudPanel>

      <HudPanel ref={rightPanelRef} position="right" open={rightPanelOpen}>
        <HudTitle>User Intent</HudTitle>
        <HudSections>
          <HudCard>
            <PersonaCardHeader>
              <PersonaAvatar src={personaAvatar} alt="Persona" />
              <PersonaSelectInline value={persona} onChange={handlePersonaChange}>
                {PERSONA_OPTIONS.map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </PersonaSelectInline>
            </PersonaCardHeader>
            {PERSONA_DERIVATION[persona].map(d => (
              <HudRow key={d.property}>
                <HudRowLabel>{d.property}</HudRowLabel>
                <HudRowValue>{d.value}</HudRowValue>
              </HudRow>
            ))}
          </HudCard>

          <HudCard>
            <HudCardHeader>
              Purchased SKU(s)
              <HudEditButton onClick={() => setAppsModalOpen(true)}>Edit</HudEditButton>
            </HudCardHeader>
            <HudPillWrap>
              {(() => {
                const enabled = ALL_APPS.filter(a => enabledApps.has(a.id));
                const shown = enabled.slice(0, 6);
                const remaining = enabled.length - shown.length;
                return (
                  <>
                    {shown.map(app => (
                      <HudPill key={app.id} removable onClick={() => {
                        setEnabledApps(prev => {
                          const next = new Set(prev);
                          next.delete(app.id);
                          return next;
                        });
                      }}>
                        {app.label}<span className="pill-x">✕</span>
                      </HudPill>
                    ))}
                    {remaining > 0 && (
                      <HudPillMore onClick={() => setAppsModalOpen(true)}>+{remaining} more</HudPillMore>
                    )}
                    {enabled.length === 0 && (
                      <HudPill>No apps selected</HudPill>
                    )}
                  </>
                );
              })()}
            </HudPillWrap>
          </HudCard>

          <HudCard>
            <HudCardHeader>Scenario</HudCardHeader>
            <HudRow>
              <HudRowLabel>Is Onboarding?</HudRowLabel>
              <HudToggleSwitch on={onboarding} onClick={handleOnboardingToggle} />
            </HudRow>
            <HudRow><HudRowLabel>Time of day</HudRowLabel><HudRowPlaceholder variant="dropdown" /></HudRow>
            <HudRow><HudRowLabel>Notifications</HudRowLabel><HudRowPlaceholder variant="toggle" /></HudRow>
          </HudCard>

          <HudCard>
            <HudCardHeader>Data Profile</HudCardHeader>
            <HudRow><HudRowLabel>Company size</HudRowLabel><HudRowPlaceholder variant="dropdown" /></HudRow>
            <HudRow><HudRowLabel>Active modules</HudRowLabel><HudRowPlaceholder variant="toggle" /></HudRow>
          </HudCard>
        </HudSections>
        <HudFooter>
          State: persona={persona}, onboarding={String(onboarding)}, apps={enabledApps.size}/{ALL_APPS.length}
        </HudFooter>
      </HudPanel>

      {/* Apps Modal */}
      {appsModalOpen && (
        <AppsModalOverlay onClick={() => setAppsModalOpen(false)}>
          <AppsModalPanel onClick={e => e.stopPropagation()}>
            <AppsModalHeader>
              <AppsModalTitle>Purchased SKU(s)</AppsModalTitle>
              <AppsModalClose onClick={() => setAppsModalOpen(false)}>Done</AppsModalClose>
            </AppsModalHeader>
            <AppsModalBody>
              <ModalActionRow>
                <ModalActionLink

                  onClick={() => {
                    const next = new Set(ALL_APPS.map(a => a.id));
                    setEnabledApps(next);
                    updateParams(persona, onboarding, next);
                  }}
                >Select all</ModalActionLink>
                <ModalActionSep>|</ModalActionSep>
                <ModalActionLink

                  onClick={() => {
                    const next = new Set<string>();
                    setEnabledApps(next);
                    updateParams(persona, onboarding, next);
                  }}
                >Unselect all</ModalActionLink>
              </ModalActionRow>
              {APP_GROUPS.map(group => {
                const groupApps = ALL_APPS.filter(a => a.group === group);
                const groupIds = groupApps.map(a => a.id);
                return (
                  <React.Fragment key={group}>
                    <ModalGroupRow>
                      <ModalGroupName>{group}</ModalGroupName>
                      <ModalGroupActions>
                        <ModalActionLink
        
                          onClick={() => {
                            const next = new Set(enabledApps);
                            groupIds.forEach(id => next.add(id));
                            setEnabledApps(next);
                            updateParams(persona, onboarding, next);
                          }}
                        >Select all</ModalActionLink>
                        <ModalActionSep>|</ModalActionSep>
                        <ModalActionLink
        
                          onClick={() => {
                            const next = new Set(enabledApps);
                            groupIds.forEach(id => next.delete(id));
                            setEnabledApps(next);
                            updateParams(persona, onboarding, next);
                          }}
                        >Unselect all</ModalActionLink>
                      </ModalGroupActions>
                    </ModalGroupRow>
                    {groupApps.map(app => (
                      <HudCheckboxRow key={app.id}>
                        <HudCheckbox
                          type="checkbox"
                          checked={enabledApps.has(app.id)}
                          onChange={() => handleAppToggle(app.id)}
                          primaryColor={theme.colorPrimaryContainer}
                        />
                        <HudCheckboxLabel>{app.label}</HudCheckboxLabel>
                      </HudCheckboxRow>
                    ))}
                  </React.Fragment>
                );
              })}
            </AppsModalBody>
          </AppsModalPanel>
        </AppsModalOverlay>
      )}

      <Canvas>
        <PhoneMockup isDark={darkMode}>
          <ThemeProvider themeConfigs={THEME_CONFIGS} defaultTheme="berry" colorMode={darkMode ? 'dark' : 'light'}>
            <ThemedPhoneScreen
              activeNav={activeNav}
              setActiveNav={setActiveNav}
              zoneWidgets={zoneWidgets}
              enabledApps={enabledApps}
              persona={persona}
              onboarding={onboarding}
              personaAvatar={personaAvatar}
              darkMode={darkMode}
            />
          </ThemeProvider>
        </PhoneMockup>
      </Canvas>
    </>
  );
};

export default MobileHomeDemo;
