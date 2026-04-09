import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { StyledTheme } from '@/utils/theme';
import Icon from '@rippling/pebble/Icon';
import Button from '@rippling/pebble/Button';
import Tip from '@rippling/pebble/Tip';
import Avatar from '@rippling/pebble/Avatar';
import Input from '@rippling/pebble/Inputs';
import NestedList from '@rippling/pebble/NestedList';
import Modal from '@rippling/pebble/Modal';
import Popper from '@rippling/pebble/Popper';
import { AIComposer } from '@/components/AIComposer';

export type ExpansionPanelType = 'ai' | 'help' | null;

interface ChatSource {
  title: string;
  url: string;
  snippet: string;
}

interface ChatAction {
  label: string;
  type: 'create_ticket' | 'navigate';
  url?: string;
}

interface MentionedContact {
  name: string;
  avatarUrl: string;
  role: string;
  email?: string;
  position?: string;
  department?: string;
  workLocation?: string;
  manager?: string;
  tenure?: string;
  startDate?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: ChatSource[];
  actions?: ChatAction[];
  timestamp: Date;
  thinkingSeconds?: number;
  showSupportCTA?: boolean;
  mentionedContact?: MentionedContact;
  widget?: React.ReactNode;
}

// Pre-populated conversation: performance review analysis
const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'user-1',
    role: 'user',
    content: 'In our H2 2025 performance review cycle, we ask direct reports to answer 5 questions about their managers on a scale from 1–5. Can you highlight the 5 managers who have the highest average scores? Please only include managers that have 3 or more direct reports. And from the written upward feedback from their direct reports, can you highlight any similar feedback/trends across these managers?',
    timestamp: new Date(2026, 2, 11, 16, 31),
  },
  {
    id: 'assistant-1',
    role: 'assistant',
    thinkingSeconds: 41,
    content: `For the H2 2025 performance review cycle, the 5 managers with the highest average upward-review scores (1–5), limited to managers with 3+ direct reports responding, are listed below.
{{TOP_5_WIDGET}}
**Common themes & behaviors to emulate** (from 29 written upward feedback responses across these managers):

**Exceptional Communication & Clarity**
Direct reports consistently describe these managers as strong communicators who provide clear guidelines, regular updates, and alignment on priorities.

**Trust & Empowerment**
A repeated pattern is autonomy and confidence-building: direct reports feel trusted to own decisions and execute without excessive approval loops.

**Hands-On Support & Accessibility**
Even at senior levels, these managers are described as responsive and willing to jump in to unblock work or help directly when needed.

**Regular, Constructive Feedback**
Direct reports value consistent 1:1 feedback and clarity on expectations—especially during ramp-up/onboarding.

**Advocacy & Obstacle Removal**
These managers are frequently described as advocates who remove blockers and represent their teams effectively cross-functionally.

**Transparency About Constraints**
A common positive signal is transparency on bandwidth, priorities, and tradeoffs—helping teams understand the "why" behind decisions.`,
    sources: [
      {
        title: 'Report: Top 5 Managers by Upward Review Score (H2 2025)',
        url: '#',
        snippet: 'Performance review analytics — upward feedback analysis',
      },
    ],
    actions: [],
    timestamp: new Date(2026, 2, 11, 16, 32),
  },
];

// ── Inline Widget: Top 5 Managers ────────────────────────────────────────────

const WidgetCard = styled.div`
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCorner2xl};
  background: ${({ theme }) => (theme as StyledTheme).colorSurfaceBright};
  overflow: hidden;
  margin: ${({ theme }) => (theme as StyledTheme).space400} 0;
  max-width: 450px;
`;

const WidgetHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => (theme as StyledTheme).space500};
  padding-bottom: ${({ theme }) => (theme as StyledTheme).space350};
`;

const WidgetTitleButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space100};
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyLarge};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};

  &:hover {
    color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  }
`;

const WidgetRow = styled.div<{ $rank: number }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space300};
  padding: ${({ theme }) => (theme as StyledTheme).space250} ${({ theme }) => (theme as StyledTheme).space500};
  border-bottom: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  cursor: pointer;
  transition: background 0.1s;

  &:last-of-type {
    border-bottom: none;
  }

  &:hover {
    background: ${({ theme }) => (theme as StyledTheme).colorSurfaceContainerLow};
  }
`;

const WidgetRank = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  width: 20px;
  text-align: center;
  flex-shrink: 0;
`;

const WidgetAvatar = styled.img`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
`;

const WidgetRowInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const WidgetRowName = styled.div`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyLargeEmphasized};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const WidgetRowMeta = styled.div`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodySmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
`;

const WidgetScore = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
  flex-shrink: 0;
`;

const WidgetScoreBar = styled.div<{ $pct: number }>`
  width: 48px;
  height: 6px;
  border-radius: 3px;
  background: ${({ theme }) => (theme as StyledTheme).colorSurfaceContainerHigh};
  overflow: hidden;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: ${({ $pct }) => $pct}%;
    background: ${({ theme }) => (theme as StyledTheme).colorSuccess};
    border-radius: 3px;
  }
`;

const WidgetScoreValue = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  min-width: 32px;
  text-align: right;
`;

const WidgetFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => (theme as StyledTheme).space300} ${({ theme }) => (theme as StyledTheme).space500};
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodySmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
`;

const WidgetActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space100};
  margin-top: -${({ theme }) => (theme as StyledTheme).space200};
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space600};
`;

const TOP_5_MANAGERS = [
  { name: 'Jolene Richards', dept: 'Engineering', reports: 5, score: 4.88, avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face' },
  { name: 'Alana Morrison', dept: 'Product', reports: 3, score: 4.87, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face' },
  { name: 'Marcus Johnson', dept: 'Design', reports: 4, score: 4.86, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face' },
  { name: 'Lisa Dominguez', dept: 'Data Science', reports: 7, score: 4.83, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face' },
  { name: 'Amit Patel', dept: 'Infrastructure', reports: 7, score: 4.80, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face' },
];

const Top5ManagersWidget: React.FC<{ theme: StyledTheme }> = ({ theme }) => (
  <WidgetCard theme={theme}>
    <WidgetHeader theme={theme}>
      <WidgetTitleButton theme={theme}>
        Top managers by upward review
      </WidgetTitleButton>
      <Button.Icon
        icon={Icon.TYPES.MORE_HORIZONTAL}
        aria-label="More options"
        appearance={Button.APPEARANCES.GHOST}
        size={Button.SIZES.XS}
      />
    </WidgetHeader>
    {TOP_5_MANAGERS.map((m, i) => (
      <WidgetRow key={m.name} theme={theme} $rank={i + 1}>
        <WidgetRank theme={theme}>#{i + 1}</WidgetRank>
        <WidgetAvatar src={m.avatar} alt={m.name} />
        <WidgetRowInfo>
          <WidgetRowName theme={theme}>{m.name}</WidgetRowName>
          <WidgetRowMeta theme={theme}>{m.dept} · {m.reports} direct reports</WidgetRowMeta>
        </WidgetRowInfo>
        <WidgetScore theme={theme}>
          <WidgetScoreBar theme={theme} $pct={(m.score / 5) * 100} />
          <WidgetScoreValue theme={theme}>{m.score.toFixed(2)}</WidgetScoreValue>
        </WidgetScore>
      </WidgetRow>
    ))}
    <WidgetFooter theme={theme}>
      <span>Avg upward score · min 3 reports</span>
      <Icon type={Icon.TYPES.ARROW_UP_RIGHT} size={14} color={theme.colorOnSurfaceVariant} />
    </WidgetFooter>
  </WidgetCard>
);

// Constants
const MIN_PANEL_WIDTH = 372;
const DEFAULT_PANEL_WIDTH = 1000;

interface ExpansionPanelProps {
  isOpen: boolean;
  panelType: ExpansionPanelType;
  onClose: () => void;
  onWidthChange?: (width: number) => void;
  onResizingChange?: (isResizing: boolean) => void;
  canGoBack?: boolean;
  previousPanelType?: ExpansionPanelType;
  onNavigateBack?: () => void;
  onSwitchToAI?: () => void;
  onCreateTicket?: (summary: string) => void;
  onNavigateToBenefits?: () => void;
  theme: StyledTheme;
  userName?: string;
  children?: React.ReactNode;
}

const slideIn = keyframes`
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
`;

const PanelContainer = styled.div<{ width: number; isResizing: boolean; hasAnimated: boolean }>`
  position: fixed;
  top: 56px; /* Below top nav */
  right: 0;
  bottom: 0;
  width: ${({ width }) => width}px;
  background-color: ${({ theme }) => (theme as StyledTheme).colorSurfaceBright};
  border-left: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  z-index: 90;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${({ hasAnimated }) => hasAnimated ? 'none' : slideIn} 250ms ease-out forwards;
  /* Disable text selection while resizing */
  user-select: ${({ isResizing }) => isResizing ? 'none' : 'auto'};
`;

const ResizeHandle = styled.div<{ isResizing: boolean }>`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 6px;
  cursor: col-resize;
  background-color: transparent;
  transition: background-color 150ms ease;
  z-index: 10;

  &:hover {
    background-color: ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  }

  ${({ isResizing, theme }) => isResizing && `
    background-color: ${(theme as StyledTheme).colorOutlineVariant};
  `}
`;

// Top nav row - global for all panel types
const TopNav = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px 0 16px;
  height: 56px;
  flex-shrink: 0;
`;

const TopNavLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
`;

const TopNavLabel = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyLargeEmphasized};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
`;

const TopNavRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space100};
`;

const PanelContent = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

// AI Assistant Content
const AIContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => (theme as StyledTheme).space400};
`;

const AIGreeting = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding-bottom: ${({ theme }) => (theme as StyledTheme).space600};
`;

const GreetingName = styled.h2`
  ${({ theme }) => (theme as StyledTheme).typestyleV2TitleLarge};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  margin: 0 0 ${({ theme }) => (theme as StyledTheme).space100} 0;
  font-weight: 600;
`;

const GreetingQuestion = styled.p`
  ${({ theme }) => (theme as StyledTheme).typestyleV2TitleMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  margin: 0 0 ${({ theme }) => (theme as StyledTheme).space600} 0;
  font-weight: 400;
`;

const GradientSparkleIcon: React.FC = () => (
  <svg width="32" height="18" viewBox="0 0 21 12" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: 8 }}>
    <path d="M12.3162 5.84154C10.7968 5.55032 9.14328 5.21627 8.08863 4.20557C7.03398 3.19486 6.69435 1.59315 6.39047 0.12848C6.35472 -0.0428266 6.09552 -0.0428266 6.05977 0.12848C5.75589 1.59315 5.41626 3.19486 4.36161 4.20557C3.30696 5.21627 1.65348 5.55032 0.134066 5.84154C-0.0446886 5.8758 -0.0446886 6.12419 0.134066 6.15846C1.65348 6.44968 3.31589 6.78372 4.36161 7.79443C5.41626 8.80514 5.75589 10.4069 6.05977 11.8715C6.09552 12.0428 6.35472 12.0428 6.39047 11.8715C6.69435 10.4069 7.03398 8.80514 8.08863 7.79443C9.14328 6.78372 10.7968 6.44968 12.3162 6.15846C12.4949 6.12419 12.4949 5.8758 12.3162 5.84154Z" fill="#EAB8F2"/>
    <path d="M16.3643 5.84154C14.8449 5.55032 13.1914 5.21627 12.1367 4.20557C11.0821 3.19486 10.7424 1.59315 10.4386 0.12848C10.4028 -0.0428266 10.1436 -0.0428266 10.1079 0.12848C9.80399 1.59315 9.46435 3.19486 8.4097 4.20557C7.35505 5.21627 5.70157 5.55032 4.18216 5.84154C4.00341 5.8758 4.00341 6.12419 4.18216 6.15846C5.70157 6.44968 7.36399 6.78372 8.4097 7.79443C9.46435 8.80514 9.80399 10.4069 10.1079 11.8715C10.1436 12.0428 10.4028 12.0428 10.4386 11.8715C10.7424 10.4069 11.0821 8.80514 12.1367 7.79443C13.1914 6.78372 14.8449 6.44968 16.3643 6.15846C16.543 6.12419 16.543 5.8758 16.3643 5.84154Z" fill="#CE71BB"/>
    <path d="M20.4229 5.84154C18.9035 5.55032 17.25 5.21627 16.1953 4.20557C15.1407 3.19486 14.801 1.59315 14.4972 0.12848C14.4614 -0.0428266 14.2022 -0.0428266 14.1665 0.12848C13.8626 1.59315 13.5229 3.19486 12.4683 4.20557C11.4136 5.21627 9.76017 5.55032 8.24076 5.84154C8.062 5.8758 8.062 6.12419 8.24076 6.15846C9.76017 6.44968 11.4226 6.78372 12.4683 7.79443C13.5229 8.80514 13.8626 10.4069 14.1665 11.8715C14.2022 12.0428 14.4614 12.0428 14.4972 11.8715C14.801 10.4069 15.1407 8.80514 16.1953 7.79443C17.25 6.78372 18.9035 6.44968 20.4229 6.15846C20.6016 6.12419 20.6016 5.8758 20.4229 5.84154Z" fill="#7A005D"/>
  </svg>
);

const SuggestionPromptList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const SuggestionPromptItem = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space300};
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  line-height: 32px;
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  text-align: left;
  
  &:hover {
    color: ${({ theme }) => (theme as StyledTheme).colorPrimary};
  }
`;

const PromptArrowIcon = styled.span`
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  font-size: 16px;
  flex-shrink: 0;
`;

const Disclaimer = styled.p`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodySmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  text-align: center;
  margin: ${({ theme }) => (theme as StyledTheme).space300} 0 0;
`;

// Help/Support Content Styles
const HelpContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const HelpScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
`;

// Help Panel Page Header - distinct from AI chat style
const HelpPageHeader = styled.div`
  position: relative;
  padding: ${({ theme }) => (theme as StyledTheme).space400};
  padding-top: 80px;
  padding-bottom: ${({ theme }) => (theme as StyledTheme).space400};
`;

const HelpCloseButton = styled.div`
  position: absolute;
  top: ${({ theme }) => (theme as StyledTheme).space300};
  right: ${({ theme }) => (theme as StyledTheme).space300};
`;

const HelpPageTitle = styled.h1`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space300};
  ${({ theme }) => (theme as StyledTheme).typestyleV2TitleLarge};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  margin: 0;
  padding-right: 40px; /* Space for close button */
`;

const HelpPageTitleIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerLg};
  background-color: ${({ theme }) => (theme as StyledTheme).colorPrimary};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const HelpSection = styled.div`
  padding: ${({ theme }) => (theme as StyledTheme).space200} ${({ theme }) => (theme as StyledTheme).space400};
`;

const HelpSectionSubtitle = styled.p`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  margin: 0;
`;

const TopicListWrapper = styled.div`
  padding: ${({ theme }) => (theme as StyledTheme).space200} ${({ theme }) => (theme as StyledTheme).space400};
`;

const MoreHelpSection = styled.div`
  padding: ${({ theme }) => (theme as StyledTheme).space400};
`;

const MoreHelpHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space200};
`;

const MoreHelpTitle = styled.h3`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyLargeEmphasized};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  margin: 0;
`;

const HelpListItem = styled.div<{ hasBorder?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
  padding: ${({ theme }) => (theme as StyledTheme).space300} 0;
  border-bottom: ${({ hasBorder, theme }) => hasBorder ? `1px solid ${(theme as StyledTheme).colorOutlineVariant}` : 'none'};
`;

const HelpListItemContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const HelpListItemTitle = styled.p`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  margin: 0;
`;

const HelpListItemSubtitle = styled.p`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodySmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  margin: 0;
`;

const HelpListItemActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space100};
`;

const HelpFooter = styled.div`
  flex-shrink: 0;
  padding: ${({ theme }) => (theme as StyledTheme).space400};
  border-top: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  background-color: ${({ theme }) => (theme as StyledTheme).colorSurfaceBright};
`;

const TopicItemText = styled.span`
  flex: 1;
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyLarge};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
`;

// =========================================================================
// CHAT MESSAGE STYLES
// =========================================================================

const ChatScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: 0 ${({ theme }) => (theme as StyledTheme).space800};
`;

const ChatMessagesWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => (theme as StyledTheme).space400} 0 0;
`;

const DateSeparator = styled.div`
  text-align: center;
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodySmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  padding: ${({ theme }) => (theme as StyledTheme).space600} 0 ${({ theme }) => (theme as StyledTheme).space400};
`;

const UserMessageRow = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space400};
`;

const UserBubble = styled.div`
  background-color: ${({ theme }) => (theme as StyledTheme).colorSurfaceContainerLow};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerLg};
  padding: ${({ theme }) => `${(theme as StyledTheme).space200} ${(theme as StyledTheme).space400}`};
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  max-width: 650px;
`;

const UserAvatarSmall = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: ${({ theme }) => (theme as StyledTheme).colorSurfaceContainerHigh};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  margin-top: 2px;
`;

const ThinkingRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space300};
`;

const ThinkingLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodySmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
`;

const ThinkingTime = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodySmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
`;

const AssistantContentArea = styled.div`
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space400};
`;

const AssistantText = styled.div`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  line-height: 1.6;
  white-space: pre-wrap;
  max-width: 650px;

  strong, b {
    font-weight: 600;
  }
`;

const SourceCard = styled.a`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space300};
  padding: ${({ theme }) => `${(theme as StyledTheme).space300} ${(theme as StyledTheme).space400}`};
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerLg};
  margin-top: ${({ theme }) => (theme as StyledTheme).space400};
  text-decoration: none;
  cursor: pointer;
  transition: background-color 150ms ease;

  &:hover {
    background-color: ${({ theme }) => (theme as StyledTheme).colorSurfaceContainerLow};
  }
`;

const SourceIconWrapper = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerMd};
  background-color: ${({ theme }) => (theme as StyledTheme).colorSurfaceContainerLow};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const SourceInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const SourceTitle = styled.div`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorInfo};
  font-weight: 500;
`;

const SourceSnippet = styled.div`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodySmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ActionButtonsRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => (theme as StyledTheme).space300};
  margin-top: ${({ theme }) => (theme as StyledTheme).space400};
`;

const NavigateButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
  padding: ${({ theme }) => `${(theme as StyledTheme).space300} ${(theme as StyledTheme).space400}`};
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerLg};
  background: transparent;
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  cursor: pointer;
  transition: background-color 150ms ease;
  text-align: left;

  &:hover {
    background-color: ${({ theme }) => (theme as StyledTheme).colorSurfaceContainerLow};
  }
`;

const FeedbackFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: ${({ theme }) => `${(theme as StyledTheme).space300} 0`};
  margin-top: ${({ theme }) => (theme as StyledTheme).space200};
`;

const FeedbackActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space100};
`;

const FeedbackModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => (theme as StyledTheme).space400};
`;

const FeedbackModalSubtitle = styled.p`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  margin: 0;
`;

const FeedbackModalDisclaimer = styled.p`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodySmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  margin: 0;
`;

const ChatInputWrapper = styled.div`
  flex-shrink: 0;
  padding: ${({ theme }) => (theme as StyledTheme).space400};
  padding-top: 0;
`;

// @mention link styled component
const MentionLink = styled.span`
  color: ${({ theme }) => (theme as StyledTheme).colorPrimary};
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

// Hover card for @mentioned contacts
const MentionHoverCardContainer = styled.div`
  width: 320px;
  background: ${({ theme }) => (theme as StyledTheme).colorSurfaceBright};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCorner2xl};
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  box-shadow: ${({ theme }) => (theme as StyledTheme).shadowMd};
  overflow: hidden;
  z-index: 10000;
`;

const MentionHoverCardHeader = styled.div`
  padding: ${({ theme }) => (theme as StyledTheme).space400};
  display: flex;
  gap: ${({ theme }) => (theme as StyledTheme).space300};
  align-items: flex-start;
`;

const MentionHoverCardAvatar = styled.img`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
`;

const MentionHoverCardInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const MentionHoverCardLabel = styled.div`
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelSmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
`;

const MentionHoverCardName = styled.div`
  ${({ theme }) => (theme as StyledTheme).typestyleV2TitleMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
`;

const MentionHoverCardRole = styled.div`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodySmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
`;

const MentionHoverCardActions = styled.div`
  display: flex;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
  padding: 0 ${({ theme }) => (theme as StyledTheme).space400} ${({ theme }) => (theme as StyledTheme).space400};
  
  & > button {
    flex: 1;
  }
`;

const MentionHoverCardBody = styled.div`
  padding: 0 ${({ theme }) => (theme as StyledTheme).space400} ${({ theme }) => (theme as StyledTheme).space400};
`;

const MentionHoverCardSection = styled.div`
  padding: ${({ theme }) => (theme as StyledTheme).space300} 0;
  border-top: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
`;

const MentionHoverCardSectionLabel = styled.div`
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelSmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
`;

const MentionHoverCardSectionValue = styled.div`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
`;

const MentionHoverCardSectionSubvalue = styled.div`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodySmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
`;

const MentionHoverCardRow = styled.div`
  display: flex;
  gap: ${({ theme }) => (theme as StyledTheme).space600};
`;

const MentionHoverCardColumn = styled.div`
  flex: 1;
`;

const MentionHoverCardManagerLink = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorPrimary};
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

// =========================================================================
// ContactMention component with hover card
// =========================================================================
interface ContactMentionProps {
  contact: MentionedContact;
  theme: StyledTheme;
}

const ContactMention: React.FC<ContactMentionProps> = ({ contact, theme }) => {
  const [isHovering, setIsHovering] = useState(false);
  const mentionRef = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <Popper
      isVisible={isHovering}
      placement={Popper.PLACEMENTS.TOP_START}
      shouldUsePortal
      targetContainer="span"
      popContent={
        <MentionHoverCardContainer
          ref={cardRef}
          theme={theme}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <MentionHoverCardHeader theme={theme}>
            <MentionHoverCardAvatar src={contact.avatarUrl} alt={contact.name} />
            <MentionHoverCardInfo theme={theme}>
              <MentionHoverCardLabel theme={theme}>EMPLOYEE</MentionHoverCardLabel>
              <MentionHoverCardName theme={theme}>{contact.name}</MentionHoverCardName>
              {contact.email && (
                <MentionHoverCardRole theme={theme}>{contact.email}</MentionHoverCardRole>
              )}
            </MentionHoverCardInfo>
          </MentionHoverCardHeader>
          <MentionHoverCardActions theme={theme}>
            <Button appearance={Button.APPEARANCES.OUTLINE} size={Button.SIZES.XS} isFluid>Profile</Button>
            <Button appearance={Button.APPEARANCES.OUTLINE} size={Button.SIZES.XS} isFluid>Org Chart</Button>
            <Button appearance={Button.APPEARANCES.OUTLINE} size={Button.SIZES.XS} isFluid>1:1s</Button>
          </MentionHoverCardActions>
          <MentionHoverCardBody theme={theme}>
            {contact.position && contact.department && (
              <MentionHoverCardSection theme={theme}>
                <MentionHoverCardSectionLabel theme={theme}>POSITION</MentionHoverCardSectionLabel>
                <MentionHoverCardSectionValue theme={theme}>{contact.position}</MentionHoverCardSectionValue>
                <MentionHoverCardSectionSubvalue theme={theme}>{contact.department}</MentionHoverCardSectionSubvalue>
              </MentionHoverCardSection>
            )}
            {(contact.workLocation || contact.manager) && (
              <MentionHoverCardSection theme={theme}>
                <MentionHoverCardRow theme={theme}>
                  {contact.workLocation && (
                    <MentionHoverCardColumn theme={theme}>
                      <MentionHoverCardSectionLabel theme={theme}>WORK LOCATION</MentionHoverCardSectionLabel>
                      <MentionHoverCardSectionValue theme={theme}>{contact.workLocation}</MentionHoverCardSectionValue>
                    </MentionHoverCardColumn>
                  )}
                  {contact.manager && (
                    <MentionHoverCardColumn theme={theme}>
                      <MentionHoverCardSectionLabel theme={theme}>MANAGER</MentionHoverCardSectionLabel>
                      <MentionHoverCardManagerLink theme={theme}>{contact.manager}</MentionHoverCardManagerLink>
                    </MentionHoverCardColumn>
                  )}
                </MentionHoverCardRow>
              </MentionHoverCardSection>
            )}
            {contact.tenure && contact.startDate && (
              <MentionHoverCardSection theme={theme}>
                <MentionHoverCardSectionLabel theme={theme}>TENURE</MentionHoverCardSectionLabel>
                <MentionHoverCardSectionValue theme={theme}>{contact.tenure}</MentionHoverCardSectionValue>
                <MentionHoverCardSectionSubvalue theme={theme}>Start date: {contact.startDate}</MentionHoverCardSectionSubvalue>
              </MentionHoverCardSection>
            )}
          </MentionHoverCardBody>
        </MentionHoverCardContainer>
      }
    >
      <MentionLink
        ref={mentionRef}
        theme={theme}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        @{contact.name}
      </MentionLink>
    </Popper>
  );
};

// =========================================================================
// HELPER: render text with inline @mention (preserves inline flow)
// =========================================================================
const renderTextWithMention = (
  text: string, 
  contact: MentionedContact, 
  theme: StyledTheme
): React.ReactNode => {
  const parts = text.split('{{CONTACT_MENTION}}');
  return (
    <>
      {parts.map((part, index) => (
        <React.Fragment key={index}>
          <span dangerouslySetInnerHTML={{ __html: part.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
          {index < parts.length - 1 && (
            <ContactMention contact={contact} theme={theme} />
          )}
        </React.Fragment>
      ))}
    </>
  );
};

// =========================================================================
// HELPER: render markdown with inline @mention support
// =========================================================================
const renderMarkdownWithMention = (
  text: string, 
  contact: MentionedContact, 
  theme: StyledTheme
): React.ReactNode[] => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    const hasMention = line.includes('{{CONTACT_MENTION}}');
    
    if (line.match(/^\d+\.\s/)) {
      // Numbered list
      if (hasMention) {
        elements.push(
          <div key={i} style={{ paddingLeft: 8, marginBottom: 2 }}>
            {renderTextWithMention(line, contact, theme)}
          </div>
        );
      } else {
        const boldParsed = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        elements.push(
          <div key={i} style={{ paddingLeft: 8, marginBottom: 2 }} dangerouslySetInnerHTML={{ __html: boldParsed }} />
        );
      }
    } else if (line.startsWith('• ')) {
      // Bullet list
      if (hasMention) {
        elements.push(
          <div key={i} style={{ paddingLeft: 24, marginBottom: 2 }}>
            {renderTextWithMention(line, contact, theme)}
          </div>
        );
      } else {
        const boldParsed = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        elements.push(
          <div key={i} style={{ paddingLeft: 24, marginBottom: 2 }} dangerouslySetInnerHTML={{ __html: boldParsed }} />
        );
      }
    } else if (line.trim() === '') {
      elements.push(<br key={i} />);
    } else {
      // Regular text line - render inline with mention
      if (hasMention) {
        elements.push(
          <span key={i}>{renderTextWithMention(line, contact, theme)}</span>
        );
      } else {
        const boldParsed = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        elements.push(
          <span key={i} dangerouslySetInnerHTML={{ __html: boldParsed }} />
        );
      }
      if (i < lines.length - 1 && lines[i + 1]?.trim() !== '') {
        elements.push(<br key={`br-${i}`} />);
      }
    }
  });

  return elements;
};

// =========================================================================
// HELPER: render basic markdown (bold, bullet, numbered list)
// =========================================================================
const renderSimpleMarkdown = (text: string): React.ReactNode[] => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    const boldParsed = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    if (line.match(/^\d+\.\s/)) {
      elements.push(
        <div key={i} style={{ paddingLeft: 8, marginBottom: 2 }} dangerouslySetInnerHTML={{ __html: boldParsed }} />,
      );
    } else if (line.startsWith('• ')) {
      elements.push(
        <div key={i} style={{ paddingLeft: 24, marginBottom: 2 }} dangerouslySetInnerHTML={{ __html: boldParsed }} />,
      );
    } else if (line.trim() === '') {
      elements.push(<br key={i} />);
    } else {
      elements.push(
        <span key={i} dangerouslySetInnerHTML={{ __html: boldParsed }} />,
      );
      if (i < lines.length - 1 && lines[i + 1]?.trim() !== '') {
        elements.push(<br key={`br-${i}`} />);
      }
    }
  });

  return elements;
};

// Help topics data with nested questions - defined outside component since it's static
const HELP_TOPICS = [
  {
    title: 'Getting started',
    isDefaultOpen: false,
    branches: [
      { title: 'Can I get my member ID number within Rippling?' },
      { title: 'Communicate personal information changes with your insurance carrier' },
      { title: 'How do I view my benefits deductions?' },
      { title: 'Manage your life insurance beneficiaries' },
      { title: 'Overview of long term disability coverage' },
      { title: 'Overview of short term disability coverage' },
    ],
  },
  {
    title: 'New hire enrollment',
    isDefaultOpen: false,
    branches: [
      { title: 'How do I enroll in benefits as a new hire?' },
      { title: 'What is the enrollment deadline for new employees?' },
      { title: 'Can I add dependents during new hire enrollment?' },
    ],
  },
  {
    title: 'Open enrollment for employees',
    isDefaultOpen: false,
    branches: [
      { title: 'When is open enrollment period?' },
      { title: 'How do I make changes during open enrollment?' },
      { title: 'What happens if I miss open enrollment?' },
    ],
  },
  {
    title: 'Qualifying life events',
    isDefaultOpen: false,
    branches: [
      { title: 'What qualifies as a life event?' },
      { title: 'How do I report a qualifying life event?' },
      { title: 'How long do I have to make changes after a life event?' },
    ],
  },
  {
    title: 'Flex benefits debit card',
    isDefaultOpen: false,
    branches: [
      { title: 'How do I activate my flex benefits card?' },
      { title: 'What expenses are eligible?' },
      { title: 'How do I check my card balance?' },
    ],
  },
  {
    title: 'FSA Benefit',
    isDefaultOpen: false,
    branches: [
      { title: 'What is a Flexible Spending Account?' },
      { title: 'How much can I contribute to my FSA?' },
      { title: 'What happens to unused FSA funds?' },
    ],
  },
  {
    title: 'HSA Benefit',
    isDefaultOpen: false,
    branches: [
      { title: 'What is a Health Savings Account?' },
      { title: 'Am I eligible for an HSA?' },
      { title: 'What are the HSA contribution limits?' },
    ],
  },
  {
    title: 'Commuter benefits',
    isDefaultOpen: false,
    branches: [
      { title: 'What are commuter benefits?' },
      { title: 'How do I set up commuter benefits?' },
      { title: 'What transportation expenses are covered?' },
    ],
  },
  {
    title: 'COBRA for enrollees',
    isDefaultOpen: false,
    branches: [
      { title: 'What is COBRA coverage?' },
      { title: 'How do I elect COBRA continuation?' },
      { title: 'How long does COBRA coverage last?' },
    ],
  },
];

export const ExpansionPanel: React.FC<ExpansionPanelProps> = ({
  isOpen,
  panelType,
  onClose,
  onWidthChange,
  onResizingChange,
  canGoBack: _canGoBack = false,
  previousPanelType: _previousPanelType,
  onNavigateBack: _onNavigateBack,
  onSwitchToAI,
  onCreateTicket,
  onNavigateToBenefits,
  theme,
  userName = 'Alex',
  children,
}) => {
  const [panelWidth, setPanelWidth] = useState(DEFAULT_PANEL_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isThinking, setIsThinking] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'up' | 'down'>>({ 'assistant-1': 'up' });
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackModalMessageId, setFeedbackModalMessageId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const prevIsOpenRef = useRef(isOpen);
  const onWidthChangeRef = useRef(onWidthChange);
  
  // Keep the ref updated
  onWidthChangeRef.current = onWidthChange;
  
  // Mark animation as complete after it runs
  useEffect(() => {
    if (isOpen && !hasAnimated) {
      const timer = setTimeout(() => setHasAnimated(true), 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen, hasAnimated]);

  // Handle mouse move during resize
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const newWidth = window.innerWidth - e.clientX;
    const clampedWidth = Math.max(MIN_PANEL_WIDTH, newWidth);
    setPanelWidth(clampedWidth);
    onWidthChangeRef.current?.(clampedWidth);
  }, []);

  // Handle mouse up to stop resizing
  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    onResizingChange?.(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [onResizingChange]);

  // Add/remove event listeners for resize
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Reset width and animation state when panel transitions
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setPanelWidth(DEFAULT_PANEL_WIDTH);
      onWidthChangeRef.current?.(DEFAULT_PANEL_WIDTH);
      setHasAnimated(false);
      setSearchQuery('');
      setMessages(INITIAL_MESSAGES);
      setIsThinking(false);
      setFeedbackGiven({});
    } else if (!isOpen && prevIsOpenRef.current) {
      setHasAnimated(false);
      setSearchQuery('');
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen]);

  // Auto-scroll to bottom when new messages arrive or thinking state changes
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  // Filter topics based on search query - must be before early return
  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return HELP_TOPICS;
    
    const query = searchQuery.toLowerCase();
    return HELP_TOPICS
      .map(topic => {
        // Check if topic title matches
        const titleMatches = topic.title.toLowerCase().includes(query);
        
        // Filter nested questions that match
        const matchingBranches = topic.branches?.filter(
          branch => branch.title.toLowerCase().includes(query)
        );
        
        // Include topic if title matches OR has matching children
        if (titleMatches || (matchingBranches && matchingBranches.length > 0)) {
          return {
            ...topic,
            branches: matchingBranches && matchingBranches.length > 0 ? matchingBranches : topic.branches,
            isDefaultOpen: !!(matchingBranches && matchingBranches.length > 0), // Auto-expand if children match
          };
        }
        return null;
      })
      .filter((topic): topic is NonNullable<typeof topic> => topic !== null);
  }, [searchQuery]);

  if (!isOpen) return null;

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    onResizingChange?.(true);
  };

  const handleAISubmit = (value: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: value,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsThinking(true);

    setTimeout(() => {
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: `I've looked into that for you. Based on the data available in Rippling, here's what I found:\n\nThe information you're asking about is available in your performance management dashboard. Would you like me to pull up a more detailed breakdown?`,
        timestamp: new Date(),
        thinkingSeconds: 8,
        sources: [],
        actions: [],
      };
      setMessages(prev => [...prev, assistantMsg]);
      setIsThinking(false);
    }, 1800);
  };

  const handleCreateTicket = () => {
    const summary = `User asked: "${messages.find(m => m.role === 'user')?.content || ''}" — AI answered about viewing and managing benefits.`;
    onCreateTicket?.(summary);
  };

  const handleThumbsDown = (messageId: string) => {
    setFeedbackModalMessageId(messageId);
    setFeedbackText('');
    setFeedbackModalOpen(true);
  };

  const handleFeedbackSubmit = () => {
    if (feedbackModalMessageId) {
      setFeedbackGiven(prev => ({ ...prev, [feedbackModalMessageId]: 'down' }));
    }
    // Here you would send feedbackText to your backend
    console.log('Feedback submitted:', { messageId: feedbackModalMessageId, text: feedbackText });
    setFeedbackModalOpen(false);
    setFeedbackModalMessageId(null);
    setFeedbackText('');
  };

  const handleFeedbackSkip = () => {
    if (feedbackModalMessageId) {
      setFeedbackGiven(prev => ({ ...prev, [feedbackModalMessageId]: 'down' }));
    }
    setFeedbackModalOpen(false);
    setFeedbackModalMessageId(null);
    setFeedbackText('');
  };

  const renderChatTitle = () => {
    if (messages.length === 0) return 'New chat';
    const firstAssistant = messages.find(m => m.role === 'assistant');
    if (firstAssistant?.sources?.[0]) return firstAssistant.sources[0].title;
    return 'H2 2025 performance review managers';
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleSuggestionClick = (text: string) => {
    handleAISubmit(text);
  };

  const renderAIContent = () => {
    // Empty state - show greeting + composer
    if (messages.length === 0) {
      return (
        <AIContentWrapper theme={theme}>
          <AIGreeting theme={theme}>
            <GradientSparkleIcon />
            <GreetingName theme={theme}>{getTimeGreeting()}, {userName}</GreetingName>
            <GreetingQuestion theme={theme}>What can I help you with?</GreetingQuestion>
            <SuggestionPromptList theme={theme}>
              <SuggestionPromptItem theme={theme} onClick={() => handleSuggestionClick('Review open enrollment elections')}>
                <PromptArrowIcon theme={theme}>&#8627;</PromptArrowIcon>
                Review open enrollment elections
              </SuggestionPromptItem>
              <SuggestionPromptItem theme={theme} onClick={() => handleSuggestionClick('Approve pending benefit changes')}>
                <PromptArrowIcon theme={theme}>&#8627;</PromptArrowIcon>
                Approve pending benefit changes
              </SuggestionPromptItem>
              <SuggestionPromptItem theme={theme} onClick={() => handleSuggestionClick('Run benefits utilization report')}>
                <PromptArrowIcon theme={theme}>&#8627;</PromptArrowIcon>
                Run benefits utilization report
              </SuggestionPromptItem>
            </SuggestionPromptList>
          </AIGreeting>
          
          <AIComposer
            mode="global"
            theme={theme}
            placeholder="Ask anything"
            showContextShelf={true}
            capabilities={['attachments', 'context']}
            onSubmit={handleAISubmit}
          />
          
          <Disclaimer theme={theme}>
            Rippling AI can make mistakes. Check important info.
          </Disclaimer>
        </AIContentWrapper>
      );
    }

    // Chat view - messages + composer at bottom
    return (
      <>
        <ChatScrollArea ref={chatScrollRef} theme={theme}>
          <ChatMessagesWrapper theme={theme}>
            <DateSeparator theme={theme}>Today</DateSeparator>

            {messages.map(msg => {
              if (msg.role === 'user') {
                return (
                  <UserMessageRow key={msg.id} theme={theme}>
                    <UserBubble theme={theme}>{msg.content}</UserBubble>
                    <UserAvatarSmall theme={theme}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: theme.colorOnSurfaceVariant }}>
                        {userName.charAt(0).toUpperCase()}
                      </span>
                    </UserAvatarSmall>
                  </UserMessageRow>
                );
              }

              // Assistant message
              return (
                <AssistantContentArea key={msg.id} theme={theme}>
                  {/* Thinking complete indicator */}
                  <ThinkingRow theme={theme}>
                    <ThinkingLeft theme={theme}>
                      <Icon type={Icon.TYPES.CHECK_CIRCLE_OUTLINE} size={14} color={theme.colorOnSurfaceVariant} />
                      Thinking complete
                    </ThinkingLeft>
                    {msg.thinkingSeconds && (
                      <ThinkingTime theme={theme}>{msg.thinkingSeconds}s</ThinkingTime>
                    )}
                  </ThinkingRow>

                  {/* Main text content — split on widget placeholders */}
                  {msg.content.includes('{{TOP_5_WIDGET}}') ? (
                    <>
                      {msg.content.split('{{TOP_5_WIDGET}}').map((segment, segIdx, arr) => (
                        <React.Fragment key={segIdx}>
                          {segment.trim() && (
                            <AssistantText theme={theme}>
                              {renderSimpleMarkdown(segment.trim())}
                            </AssistantText>
                          )}
                          {segIdx < arr.length - 1 && (
                            <>
                              <Top5ManagersWidget theme={theme} />
                              <WidgetActions theme={theme}>
                                <Tip content="Pin to Home" placement={Tip.PLACEMENTS.TOP}>
                                  <span>
                                    <Button.Icon
                                      icon={Icon.TYPES.BOOKMARK_OUTLINE}
                                      size={Button.SIZES.XS}
                                      appearance={Button.APPEARANCES.GHOST}
                                      aria-label="Pin to Home"
                                    />
                                  </span>
                                </Tip>
                                <Tip content="Share" placement={Tip.PLACEMENTS.TOP}>
                                  <span>
                                    <Button.Icon
                                      icon={Icon.TYPES.SHARE_OUTLINE}
                                      size={Button.SIZES.XS}
                                      appearance={Button.APPEARANCES.GHOST}
                                      aria-label="Share"
                                    />
                                  </span>
                                </Tip>
                              </WidgetActions>
                            </>
                          )}
                        </React.Fragment>
                      ))}
                    </>
                  ) : (
                    <AssistantText theme={theme}>
                      {msg.mentionedContact && msg.content.includes('{{CONTACT_MENTION}}') ? (
                        renderMarkdownWithMention(msg.content, msg.mentionedContact, theme)
                      ) : (
                        renderSimpleMarkdown(msg.content)
                      )}
                    </AssistantText>
                  )}

                  {/* Navigate action buttons (the generic ones from mock) */}
                  {msg.actions && msg.actions.length > 0 && (
                    <ActionButtonsRow theme={theme}>
                      {msg.actions.map((action, idx) => (
                        <NavigateButton
                          key={idx}
                          theme={theme}
                          onClick={() => {
                            if (action.url) window.open(action.url, '_blank');
                          }}
                        >
                          <Icon type={Icon.TYPES.ARROW_UP_RIGHT} size={14} />
                          {action.label}
                        </NavigateButton>
                      ))}
                    </ActionButtonsRow>
                  )}

                  {/* Prominent "Chat with an agent" CTA when AI can't help */}
                  {msg.showSupportCTA && (
                    <div style={{ marginTop: theme.space400 }}>
                      <Button
                        appearance={Button.APPEARANCES.ACCENT}
                        size={Button.SIZES.S}
                        icon={{ type: Icon.TYPES.MESSAGE_OUTLINE, alignment: Button.ICON_ALIGNMENTS.LEFT }}
                        onClick={() => handleCreateTicket()}
                      >
                        Chat with an agent
                      </Button>
                    </div>
                  )}

                  {/* Source citation */}
                  {msg.sources && msg.sources.length > 0 && (
                    <>
                      {msg.sources.map((source, idx) => (
                        <SourceCard
                          key={idx}
                          theme={theme}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => { e.preventDefault(); window.open(source.url, '_blank'); }}
                        >
                          <SourceIconWrapper theme={theme}>
                            <Icon type={Icon.TYPES.BOOKS_OUTLINE} size={16} color={theme.colorOnSurfaceVariant} />
                          </SourceIconWrapper>
                          <SourceInfo>
                            <SourceTitle theme={theme}>{source.title}</SourceTitle>
                            <SourceSnippet theme={theme}>Help Center Article</SourceSnippet>
                          </SourceInfo>
                          <Icon type={Icon.TYPES.ARROW_UP_RIGHT} size={14} color={theme.colorOnSurfaceVariant} />
                        </SourceCard>
                      ))}
                    </>
                  )}

                  {/* Feedback footer */}
                  <FeedbackFooter theme={theme}>
                    <FeedbackActions theme={theme}>
                      <Tip content="Good response" placement={Tip.PLACEMENTS.TOP}>
                        <span>
                          <Button.Icon
                            icon={feedbackGiven[msg.id] === 'up' ? Icon.TYPES.THUMB_UP_FILLED : Icon.TYPES.THUMB_UP_OUTLINE}
                            size={Button.SIZES.XS}
                            appearance={Button.APPEARANCES.GHOST}
                            aria-label="Thumbs up"
                            onClick={() => setFeedbackGiven(prev => ({ ...prev, [msg.id]: 'up' }))}
                          />
                        </span>
                      </Tip>
                      <Tip content="Bad response" placement={Tip.PLACEMENTS.TOP}>
                        <span>
                          <Button.Icon
                            icon={feedbackGiven[msg.id] === 'down' ? Icon.TYPES.THUMB_DOWN_FILLED : Icon.TYPES.THUMB_DOWN_OUTLINE}
                            size={Button.SIZES.XS}
                            appearance={Button.APPEARANCES.GHOST}
                            aria-label="Thumbs down"
                            onClick={() => handleThumbsDown(msg.id)}
                          />
                        </span>
                      </Tip>
                      <Tip content="Copy response" placement={Tip.PLACEMENTS.TOP}>
                        <span>
                          <Button.Icon
                            icon={Icon.TYPES.COPY_OUTLINE}
                            size={Button.SIZES.XS}
                            appearance={Button.APPEARANCES.GHOST}
                            aria-label="Copy response"
                            onClick={() => navigator.clipboard.writeText(msg.content)}
                          />
                        </span>
                      </Tip>
                    </FeedbackActions>
                  </FeedbackFooter>
                </AssistantContentArea>
              );
            })}

            {/* Thinking indicator */}
            {isThinking && (
              <ThinkingRow theme={theme}>
                <ThinkingLeft theme={theme}>
                  <Icon type={Icon.TYPES.FX_OUTLINE} size={14} color={theme.colorPrimary} />
                  Thinking...
                </ThinkingLeft>
              </ThinkingRow>
            )}
          </ChatMessagesWrapper>
        </ChatScrollArea>

        {/* Composer pinned at bottom */}
        <ChatInputWrapper theme={theme}>
          <AIComposer
            mode="global"
            theme={theme}
            placeholder="Ask anything"
            showContextShelf={false}
            capabilities={['attachments']}
            onSubmit={handleAISubmit}
          />
          <Disclaimer theme={theme}>
            Rippling AI can make mistakes. Check important info.
          </Disclaimer>
        </ChatInputWrapper>
      </>
    );
  };

  const handleOpenAIPanel = () => {
    onSwitchToAI?.();
  };

  const renderHelpContent = () => (
    <HelpContentWrapper theme={theme}>
      {/* Page-style header with close button */}
      <HelpPageHeader theme={theme}>
        <HelpCloseButton theme={theme}>
          <Button.Icon
            icon={Icon.TYPES.CLOSE}
            aria-label="Close panel"
            tip="Close"
            appearance={Button.APPEARANCES.GHOST}
            size={Button.SIZES.S}
            onClick={onClose}
          />
        </HelpCloseButton>
        <HelpPageTitle theme={theme}>
          <HelpPageTitleIcon theme={theme}>
            <Icon 
              type={Icon.TYPES.HEART_FILLED} 
              size={18} 
              color={theme.colorOnPrimary} 
            />
          </HelpPageTitleIcon>
          Benefits help topics
        </HelpPageTitle>
      </HelpPageHeader>

      {/* Scrollable content area */}
      <HelpScrollArea theme={theme}>

        {/* Search input */}
        <HelpSection theme={theme}>
          <Input.Text
            placeholder="Search topics..."
            value={searchQuery}
            onChange={setSearchQuery}
            size={Input.Text.SIZES.M}
          />
        </HelpSection>

        {/* Topics list */}
        <TopicListWrapper theme={theme}>
          {filteredTopics.length > 0 ? (
            <NestedList
              list={filteredTopics}
              indent={0}
              showMore={{ size: 100 }}
              theme={NestedList.THEMES.NO_CARD}
              renderer={({ item }) => (
                <TopicItemText theme={theme}>{item.title}</TopicItemText>
              )}
            />
          ) : (
            <HelpSectionSubtitle theme={theme} style={{ padding: theme.space400, textAlign: 'center' }}>
              No topics found for "{searchQuery}"
            </HelpSectionSubtitle>
          )}
        </TopicListWrapper>

        {/* More help options */}
        <MoreHelpSection theme={theme}>
          <MoreHelpHeader theme={theme}>
            <MoreHelpTitle theme={theme}>More help options</MoreHelpTitle>
            <Button.Icon
              icon={Icon.TYPES.MORE_HORIZONTAL}
              aria-label="More options"
              appearance={Button.APPEARANCES.GHOST}
              size={Button.SIZES.S}
            />
          </MoreHelpHeader>

          {/* Help Center link */}
          <HelpListItem theme={theme} hasBorder>
            <Avatar
              size={Avatar.SIZES.XS}
              icon={Icon.TYPES.BOOKS_OUTLINE}
            />
            <HelpListItemContent theme={theme}>
              <HelpListItemTitle theme={theme}>Help Center</HelpListItemTitle>
              <HelpListItemSubtitle theme={theme}>Browse help articles for all Rippling products</HelpListItemSubtitle>
            </HelpListItemContent>
            <HelpListItemActions theme={theme}>
              <Button.Icon
                icon={Icon.TYPES.ARROW_UP_RIGHT}
                aria-label="Open in new tab"
                appearance={Button.APPEARANCES.GHOST}
                size={Button.SIZES.S}
              />
            </HelpListItemActions>
          </HelpListItem>

          {/* Benefits admin contact */}
          <HelpListItem theme={theme}>
            <Avatar
              size={Avatar.SIZES.XS}
            />
            <HelpListItemContent theme={theme}>
              <HelpListItemTitle theme={theme}>Chris Caldwell</HelpListItemTitle>
              <HelpListItemSubtitle theme={theme}>Your company's benefits admin</HelpListItemSubtitle>
            </HelpListItemContent>
            <HelpListItemActions theme={theme}>
              <Button.Icon
                icon={Icon.TYPES.SLACK}
                aria-label="Message on Slack"
                appearance={Button.APPEARANCES.GHOST}
                size={Button.SIZES.S}
              />
              <Button.Icon
                icon={Icon.TYPES.EMAIL_OUTLINE}
                aria-label="Send email"
                appearance={Button.APPEARANCES.GHOST}
                size={Button.SIZES.S}
              />
            </HelpListItemActions>
          </HelpListItem>
        </MoreHelpSection>
      </HelpScrollArea>

      {/* Footer with AI button - always at bottom */}
      <HelpFooter theme={theme}>
        <Button
          appearance={Button.APPEARANCES.PRIMARY}
          size={Button.SIZES.M}
          icon={Icon.TYPES.FX_OUTLINE}
          onClick={handleOpenAIPanel}
          isFluid
        >
          Ask Rippling AI
        </Button>
      </HelpFooter>
    </HelpContentWrapper>
  );

  return (
    <>
      <PanelContainer theme={theme} width={panelWidth} isResizing={isResizing} hasAnimated={hasAnimated}>
        {/* Resize Handle */}
        <ResizeHandle 
          theme={theme} 
          isResizing={isResizing}
          onMouseDown={handleResizeStart}
        />

        {/* Top Nav - Only for AI panel (Help panel has its own page-style header) */}
        {panelType === 'ai' && (
          <TopNav theme={theme}>
            <TopNavLeft theme={theme}>
              <Icon 
                type={Icon.TYPES.SIDEBAR_OUTLINE} 
                size={20} 
                color={theme.colorOnSurface} 
              />
              <TopNavLabel theme={theme}>
                {renderChatTitle()}
              </TopNavLabel>
            </TopNavLeft>
            <TopNavRight theme={theme}>
              <Tip content="Expand" placement={Tip.PLACEMENTS.BOTTOM}>
                <span>
                  <Button.Icon
                    icon={Icon.TYPES.EXPAND}
                    aria-label="Expand"
                    appearance={Button.APPEARANCES.GHOST}
                    size={Button.SIZES.S}
                  />
                </span>
              </Tip>
              <Button.Icon
                icon={Icon.TYPES.CLOSE}
                aria-label="Close panel"
                tip="Close"
                appearance={Button.APPEARANCES.GHOST}
                size={Button.SIZES.S}
                onClick={onClose}
              />
            </TopNavRight>
          </TopNav>
        )}

        <PanelContent theme={theme}>
          {children || (panelType === 'ai' ? renderAIContent() : renderHelpContent())}
        </PanelContent>
      </PanelContainer>

      {/* Feedback Modal */}
      <Modal
        isVisible={feedbackModalOpen}
        onCancel={() => {
          setFeedbackModalOpen(false);
          setFeedbackModalMessageId(null);
          setFeedbackText('');
        }}
        title="How can we improve this response?"
        width={560}
        shouldCloseOnBackdropClick
      >
        <FeedbackModalContent theme={theme}>
          <FeedbackModalSubtitle theme={theme}>
            Help us improve! Please explain what went wrong and what you were expecting
          </FeedbackModalSubtitle>
          <Input.Textarea
            placeholder="Add details"
            value={feedbackText}
            onChange={(val: string) => setFeedbackText(val)}
            rows={4}
          />
          <FeedbackModalDisclaimer theme={theme}>
            Your feedback helps improve Rippling AI
          </FeedbackModalDisclaimer>
        </FeedbackModalContent>
        <Modal.Footer placement={Modal.Footer.PLACEMENTS.HORIZONTALLY_SPACE_BETWEEN}>
          <Button
            appearance={Button.APPEARANCES.ACCENT}
            size={Button.SIZES.M}
            icon={{ type: Icon.TYPES.MESSAGE_OUTLINE, alignment: Button.ICON_ALIGNMENTS.LEFT }}
            onClick={() => {
              setFeedbackModalOpen(false);
              setFeedbackModalMessageId(null);
              setFeedbackText('');
              onCreateTicket?.('User requested support from feedback modal');
            }}
          >
            Chat with an agent
          </Button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              appearance={Button.APPEARANCES.OUTLINE}
              size={Button.SIZES.M}
              onClick={handleFeedbackSkip}
            >
              Skip
            </Button>
            <Button
              appearance={Button.APPEARANCES.PRIMARY}
              size={Button.SIZES.M}
              onClick={handleFeedbackSubmit}
            >
              Add note
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

