import React, { useState, useMemo } from 'react';
import styled from '@emotion/styled';
import { Global, css } from '@emotion/react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@rippling/pebble/theme';
import Tabs from '@rippling/pebble/Tabs';

import WidgetCard from '@/widgets/framework/WidgetCard';
import ShiftClockContent from '@/widgets/ShiftClockWidget';
import EarningsSummaryContent from '@/widgets/EarningsWidget';
import InboxPreviewContent from '@/widgets/InboxWidget';
import ShortcutsContent from '@/widgets/ShortcutsWidget';
import RecentlyVisitedContent from '@/widgets/RecentlyVisitedWidget';
import ScheduleContent from '@/widgets/ScheduleWidget';
import BenefitsContent from '@/widgets/BenefitsWidget';
import OnboardingContent from '@/widgets/OnboardingWidget';
import { getQuickActions } from '@/data-models/quick-actions';
import {
  enabledAppsToSkuFlags,
  widgetIdToTitle,
  getWidgetActions,
} from '@/widgets/framework/widget-helpers';
import type { PersonaId } from '@/data-models/types';
import type { WidgetAction } from '@/widgets/framework/types';

type T = { theme: any };

/**
 * WidgetCanvasPage
 *
 * A reference surface that renders every widget component from the framework
 * in a single canvas view. Widgets with persona variants are grouped under a
 * single specimen with a dropdown to switch variants.
 */

const CanvasPage = styled.div`
  position: relative;
  min-height: 100vh;
  width: 100%;
  background: ${({ theme }: T) => theme.colorSurfaceContainerLow};
`;

const SquareGrid = styled.div`
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background-image:
    linear-gradient(to right, rgba(0, 0, 0, 0.03) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.03) 1px, transparent 1px);
  background-size: 24px 24px;
  background-position: 0 0;
  mask-image: linear-gradient(to bottom, black 0%, black 92%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, black 0%, black 92%, transparent 100%);
`;

const Content = styled.div`
  position: relative;
  z-index: 1;
  padding: ${({ theme }: T) => theme.space1600} ${({ theme }: T) => theme.space1200} ${({ theme }: T) => theme.space1600};
  margin: 0 auto;
`;

const Header = styled.div`
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }: T) => theme.space800};
  padding: ${({ theme }: T) => theme.space400} 0 ${({ theme }: T) => theme.space800};
  margin-bottom: ${({ theme }: T) => theme.space1600};

  &::before {
    content: '';
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: ${({ theme }: T) => `calc(-1 * ${theme.space1600})`};
    width: 100vw;
    height: calc(100% + ${({ theme }: T) => theme.space1600} + ${({ theme }: T) => theme.space1200});
    background: linear-gradient(
      to bottom,
      ${({ theme }: T) => theme.colorSurfaceContainerLow} 0%,
      ${({ theme }: T) => theme.colorSurfaceContainerLow} 55%,
      transparent 100%
    );
    z-index: -1;
    pointer-events: none;
  }
`;

const HeaderText = styled.div`
  flex: 1;
  min-width: 0;
`;

const HeaderControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }: T) => theme.space600};
  flex-shrink: 0;
  margin-top: ${({ theme }: T) => theme.space200};
`;

const Eyebrow = styled.div`
  ${({ theme }: T) => theme.typestyleV2LabelMedium};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }: T) => theme.colorPrimary};
  margin-bottom: ${({ theme }: T) => theme.space300};
`;

const Title = styled.h1`
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 40px;
  font-weight: 700;
  color: ${({ theme }: T) => theme.colorOnSurface};
  margin: 0;
  line-height: 1.1;
  letter-spacing: -0.02em;
`;

const DocsLink = styled.button`
  ${({ theme }: T) => theme.typestyleV2BodyMedium};
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }: T) => theme.space100};
  padding: 0;
  background: transparent;
  border: none;
  color: ${({ theme }: T) => theme.colorOnSurface};
  font-family: inherit;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
  white-space: nowrap;

  &:hover {
    color: ${({ theme }: T) => theme.colorPrimary};
  }
`;

const SpecimenGrid = styled.div<{ $cardWidth: number }>`
  display: grid;
  grid-template-columns: ${({ $cardWidth }) => `repeat(auto-fill, ${$cardWidth}px)`};
  column-gap: ${({ theme }: T) => theme.space1200};
  row-gap: ${({ theme }: T) => theme.space1600};
  justify-content: center;
  max-width: ${({ $cardWidth }) => `calc(${$cardWidth * 4}px + ${48 * 3}px)`};
  margin: 0 auto;
`;

const Specimen = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }: T) => theme.space400};
`;

const SpecimenHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }: T) => theme.space300};
  min-height: 28px;
`;

const SpecimenLabel = styled.div`
  ${({ theme }: T) => theme.typestyleV2LabelMedium};
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: ${({ theme }: T) => theme.colorOnSurfaceVariant};
`;

const VariantSelect = styled.select`
  ${({ theme }: T) => theme.typestyleV2BodySmall};
  padding: 4px 8px;
  padding-right: 22px;
  border-radius: ${({ theme }: T) => theme.shapeCornerMd};
  border: 1px solid transparent;
  background-color: transparent;
  color: ${({ theme }: T) => theme.colorOnSurfaceVariant};
  font-family: inherit;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%23666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 4px center;
  background-size: 12px 12px;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
    color: ${({ theme }: T) => theme.colorOnSurface};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }: T) => theme.colorOutlineVariant};
    background-color: rgba(0, 0, 0, 0.04);
    color: ${({ theme }: T) => theme.colorOnSurface};
  }
`;

type PersonaOption = { value: PersonaId; label: string };

const EARNINGS_PERSONAS: PersonaOption[] = [
  { value: 'hourly_operator', label: 'Hourly' },
  { value: 'employee_self_service', label: 'Salaried' },
  { value: 'contractor', label: 'Contractor' },
];

const INBOX_PERSONAS: PersonaOption[] = [
  { value: 'employee_self_service', label: 'Employee' },
  { value: 'functional_admin', label: 'Admin' },
  { value: 'people_manager', label: 'Manager' },
];

const SHORTCUTS_PERSONAS: PersonaOption[] = [
  { value: 'hourly_operator', label: 'Hourly' },
  { value: 'employee_self_service', label: 'Salaried' },
  { value: 'people_manager', label: 'Manager' },
  { value: 'frontline_shift_manager', label: 'Shift manager' },
];

const SAMPLE_ENABLED_APPS_BY_PERSONA: Record<PersonaId, Set<string>> = {
  hourly_operator: new Set(['my_pay', 'time_standalone', 'time_off', 'people_directory', 'chat']),
  employee_self_service: new Set(['my_pay', 'time_off', 'my_benefits', 'spend_management', 'people_directory', 'travel', 'chat']),
  frontline_shift_manager: new Set(['my_pay', 'time_attendance', 'scheduling', 'time_off', 'people_directory', 'chat']),
  people_manager: new Set(['my_pay', 'time_off', 'my_benefits', 'spend_management', 'people_directory', 'chat']),
  functional_admin: new Set(['my_pay', 'time_off', 'my_benefits', 'people_directory', 'passwords', 'chat']),
  executive_owner: new Set(['my_pay', 'time_off', 'my_benefits', 'spend_management', 'people_directory', 'chat']),
  contractor: new Set(['my_pay']),
};

const EARNINGS_ACTION_LABEL: Partial<Record<PersonaId, string>> = {
  hourly_operator: 'View pay',
  employee_self_service: 'View pay',
  people_manager: 'View pay',
  frontline_shift_manager: 'View pay',
  functional_admin: 'View pay',
  executive_owner: 'View pay',
  contractor: 'View invoices',
};

type Platform = 'mobile' | 'web';
const PLATFORM_TABS: Platform[] = ['mobile', 'web'];
const CARD_WIDTH_BY_PLATFORM: Record<Platform, number> = {
  mobile: 360,
  web: 480,
};

const WidgetCanvasPage: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [platformIndex, setPlatformIndex] = useState(0);
  const platform = PLATFORM_TABS[platformIndex];
  const cardWidth = CARD_WIDTH_BY_PLATFORM[platform];

  const [earningsPersona, setEarningsPersona] = useState<PersonaId>('employee_self_service');
  const [inboxPersona, setInboxPersona] = useState<PersonaId>('functional_admin');
  const [shortcutsPersona, setShortcutsPersona] = useState<PersonaId>('hourly_operator');

  const shortcutsForPersona = useMemo(() => {
    const apps = SAMPLE_ENABLED_APPS_BY_PERSONA[shortcutsPersona];
    return getQuickActions({
      persona: shortcutsPersona,
      skuFlags: enabledAppsToSkuFlags(apps),
      maxCount: 4,
    }).actions;
  }, [shortcutsPersona]);

  const primaryColor = (theme as any).colorPrimaryContainer;

  type SpecimenConfig = {
    key: string;
    label: string;
    title: string;
    body: React.ReactNode;
    actions?: WidgetAction[];
    variantControl?: {
      options: PersonaOption[];
      value: PersonaId;
      onChange: (next: PersonaId) => void;
      ariaLabel: string;
    };
  };

  const earningsActionLabel = EARNINGS_ACTION_LABEL[earningsPersona] ?? 'View pay';

  const specimens: SpecimenConfig[] = [
    {
      key: 'shift_clock',
      label: 'Shift clock',
      title: widgetIdToTitle('shift_clock'),
      body: <ShiftClockContent />,
      actions: getWidgetActions('shift_clock'),
    },
    {
      key: 'shortcuts',
      label: 'Shortcuts',
      title: widgetIdToTitle('quick_actions'),
      body: <ShortcutsContent actions={shortcutsForPersona} onSurface={(theme as any).colorOnSurface} />,
      variantControl: {
        options: SHORTCUTS_PERSONAS,
        value: shortcutsPersona,
        onChange: setShortcutsPersona,
        ariaLabel: 'Shortcuts persona',
      },
    },
    {
      key: 'earnings',
      label: 'Earnings',
      title: widgetIdToTitle('earnings_summary', earningsPersona),
      body: <EarningsSummaryContent persona={earningsPersona} />,
      actions: [{ label: earningsActionLabel, variant: 'secondary' }],
      variantControl: {
        options: EARNINGS_PERSONAS,
        value: earningsPersona,
        onChange: setEarningsPersona,
        ariaLabel: 'Earnings persona',
      },
    },
    {
      key: 'inbox',
      label: 'Inbox',
      title: widgetIdToTitle('inbox_preview', inboxPersona),
      body: <InboxPreviewContent persona={inboxPersona} />,
      actions: getWidgetActions('inbox_preview', inboxPersona),
      variantControl: {
        options: INBOX_PERSONAS,
        value: inboxPersona,
        onChange: setInboxPersona,
        ariaLabel: 'Inbox persona',
      },
    },
    {
      key: 'schedule',
      label: 'Schedule',
      title: widgetIdToTitle('schedule'),
      body: <ScheduleContent />,
      actions: getWidgetActions('schedule'),
    },
    {
      key: 'benefits',
      label: 'Benefits',
      title: widgetIdToTitle('benefits'),
      body: <BenefitsContent />,
      actions: getWidgetActions('benefits'),
    },
    {
      key: 'onboarding_setup',
      label: 'Onboarding',
      title: widgetIdToTitle('onboarding_setup'),
      body: <OnboardingContent />,
    },
    {
      key: 'recently_visited',
      label: 'Recently visited',
      title: widgetIdToTitle('recently_visited'),
      body: <RecentlyVisitedContent />,
    },
  ];

  return (
    <>
      <Global styles={css`body { margin: 0; }`} />
      <CanvasPage>
        <SquareGrid />
        <Content>
          <Header>
            <HeaderText>
              <Eyebrow>Widget framework</Eyebrow>
              <Title>Widget canvas</Title>
            </HeaderText>
            <HeaderControls>
              <Tabs.SWITCH
                activeIndex={platformIndex}
                onChange={(idx: number) => setPlatformIndex(Number(idx))}
              >
                <Tabs.Tab title="Mobile" />
                <Tabs.Tab title="Web" />
              </Tabs.SWITCH>
              <DocsLink onClick={() => navigate('/widget-card-framework')}>
                View docs
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </DocsLink>
            </HeaderControls>
          </Header>

          <SpecimenGrid $cardWidth={cardWidth}>
            {specimens.map((s) => (
              <Specimen key={s.key}>
                <SpecimenHeader>
                  <SpecimenLabel>{s.label}</SpecimenLabel>
                  {s.variantControl && (
                    <VariantSelect
                      aria-label={s.variantControl.ariaLabel}
                      value={s.variantControl.value}
                      onChange={(e) => s.variantControl!.onChange(e.target.value as PersonaId)}
                    >
                      {s.variantControl.options.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </VariantSelect>
                  )}
                </SpecimenHeader>
                <WidgetCard
                  title={s.title}
                  actions={s.actions}
                  primaryColor={primaryColor}
                  onTitleClick={() => {}}
                >
                  {s.body}
                </WidgetCard>
              </Specimen>
            ))}
          </SpecimenGrid>
        </Content>
      </CanvasPage>
    </>
  );
};

export default WidgetCanvasPage;
