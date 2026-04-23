import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { css } from '@emotion/css';
import { StyledTheme } from '@/utils/theme';
import { useTheme, getStateColor } from '@rippling/pebble/theme';
import Icon from '@rippling/pebble/Icon';
import Button from '@rippling/pebble/Button';
import Drawer from '@rippling/pebble/Drawer';
import Modal from '@rippling/pebble/Modal';
import Input from '@rippling/pebble/Inputs';
import Tip from '@rippling/pebble/Tip';
import Status from '@rippling/pebble/Status';
import SplitButton from '@rippling/pebble/Button/SplitButton/SplitButton';
import Tabs from '@rippling/pebble/Tabs';

import Atoms from '@rippling/pebble/Atoms';
import { AppShellLayout } from '@/components/app-shell';
import RipplingAiSpark from '@/assets/rippling-ai-spark.svg';
import { SAMPLE_USERS } from '@/data-models/sample-users';
import { PERSONA_OPTIONS } from '@/data-models/personas';
import { getQuickActions } from '@/data-models/quick-actions';
import { enabledAppsToSkuFlags } from '@/widgets/framework/widget-helpers';

// ── Custom Shortcuts ─────────────────────────────────────────────────────────

interface CustomShortcut {
  id: string;
  label: string;
  url: string;
}

const isValidRipplingUrl = (url: string) =>
  /^https:\/\/(app|www)\.rippling\.com/.test(url.trim());

// ── SSO Data ────────────────────────────────────────────────────────────────

interface SSOApp {
  name: string;
  desc: string;
  icon: string;
  pinned?: boolean;
}

const ALL_SSO_APPS: SSOApp[] = [
  { name: 'Gmail', desc: 'Company email', icon: 'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico', pinned: true },
  { name: 'Slack', desc: 'Team messaging and channels', icon: 'https://a.slack-edge.com/80588/marketing/img/meta/favicon-32.png', pinned: true },
  { name: 'Notion', desc: 'Docs, wikis, and projects', icon: 'https://www.notion.so/images/favicon.ico', pinned: true },
  { name: 'Figma', desc: 'Design and prototyping', icon: 'https://static.figma.com/app/icon/1/favicon.png', pinned: true },
  { name: 'GitHub', desc: 'Code repositories and pull requests', icon: 'https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png', pinned: true },
  { name: 'Zoom', desc: 'Video meetings', icon: 'https://st1.zoom.us/zoom.ico', pinned: true },
  { name: 'Jira', desc: 'Issue tracking and sprints', icon: 'https://cdn.worldvectorlogo.com/logos/jira-1.svg', pinned: true },
  { name: 'Accrue', desc: 'Company 401(k) retirement plan', icon: '/accrue-logo.png', pinned: true },
  { name: 'Google Drive', desc: 'Cloud file storage and sharing', icon: 'https://ssl.gstatic.com/images/branding/product/2x/drive_2020q4_48dp.png' },
  { name: 'Datadog', desc: 'Infrastructure monitoring and APM', icon: 'https://imgix.datadoghq.com/img/dd_logo_n_70x75.png' },
  { name: 'Amplitude', desc: 'Product analytics', icon: 'https://cdn.amplitude.com/images/favicon.ico' },
  { name: 'Lattice', desc: 'Performance reviews and goals', icon: 'https://lattice.com/favicon.ico' },
  { name: 'Confluence', desc: 'Team wiki and documentation', icon: 'https://wac-cdn-bfldr.atlassian.com/K3MHR9G8/at/4jwb4dp3hnsrqxg86tf/confluence-mark-gradient-blue.svg' },
  { name: 'Snowflake', desc: 'Cloud data warehouse', icon: 'https://www.snowflake.com/wp-content/themes/flavor/assets/img/favicons/favicon-32x32.png' },
  { name: 'Segment', desc: 'Customer data platform', icon: 'https://segment.com/favicon.ico' },
  { name: 'AWS Console', desc: 'Cloud infrastructure', icon: 'https://a0.awsstatic.com/libra-css/images/logos/aws_smile-header-desktop-en-white_59x35@2x.png' },
  { name: 'HubSpot', desc: 'CRM and marketing', icon: 'https://www.hubspot.com/hubfs/HubSpot_Logos/HubSpot-Inversed-Favicon.png' },
  { name: 'Zendesk', desc: 'Customer support tickets', icon: 'https://d26a57ydsghvgx.cloudfront.net/content/Zendesk+favicon.png' },
  { name: 'Sentry', desc: 'Error tracking and monitoring', icon: 'https://sentry.io/_assets/favicon-f4b3f35162e8bb14e00b2e2d0cf9f8c8.ico' },
  { name: 'Freshdesk', desc: 'Help desk and support', icon: 'https://www.freshworks.com/favicon.ico' },
  { name: 'Intercom', desc: 'Customer messaging platform', icon: 'https://static.intercomassets.com/assets/default-avatars/fin/128-6a5eabbb2726ce0fa4f22ee8b1db0aee87a356e1ae01c255a4efa22fd498e48c.png' },
  { name: '1Password', desc: 'Team password manager', icon: 'https://1password.com/img/favicon/favicon-32x32.png' },
  { name: 'ChatGPT', desc: 'AI assistant', icon: 'https://cdn.oaistatic.com/assets/favicon-miwirzcz.ico' },
  { name: 'Tableau', desc: 'Business intelligence dashboards', icon: 'https://www.tableau.com/favicon.ico' },
];

const PINNED_APPS = ALL_SSO_APPS.filter(a => a.pinned);
const OVERFLOW_COUNT = ALL_SSO_APPS.length - PINNED_APPS.length;

// ── SSO Strip ───────────────────────────────────────────────────────────────

const SSOStrip = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: ${({ theme }) => (theme as StyledTheme).space1200};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  padding: 0 ${({ theme }) => (theme as StyledTheme).space600};
  border-bottom: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  background: transparent;
  z-index: 1;
`;

const SSOLabel = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  font-weight: 600;
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  white-space: nowrap;
  padding-right: ${({ theme }) => (theme as StyledTheme).space200};
`;

const SSODivider = styled.div`
  width: 1px;
  height: 20px;
  background: ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  margin: 0 ${({ theme }) => (theme as StyledTheme).space300};
  flex-shrink: 0;
`;

const SSOItemWrap = styled.div`
  position: relative;

  &:hover > div:last-child {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
    pointer-events: auto;
  }
`;

const SSOItem = styled.a`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space175};
  padding: ${({ theme }) => (theme as StyledTheme).space150} ${({ theme }) => (theme as StyledTheme).space300};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerLg};
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  transition: background 0.1s, color 0.1s;

  &:hover {
    background: ${({ theme }) => (theme as StyledTheme).colorSurfaceContainerLow};
    color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  }
`;

const SSOHoverCard = styled.div`
  position: absolute;
  top: calc(100% + ${({ theme }) => (theme as StyledTheme).space200});
  left: 50%;
  transform: translateX(-50%) translateY(${({ theme }) => (theme as StyledTheme).space100});
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease, transform 0.15s ease;
  z-index: 10;
  width: 220px;

  background: ${({ theme }) => (theme as StyledTheme).colorSurfaceBright};
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCorner2xl};
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.03);
  padding: ${({ theme }) => (theme as StyledTheme).space400};
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => (theme as StyledTheme).space300};
`;

const SSOHoverIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerLg};
  background: ${({ theme }) => (theme as StyledTheme).colorSurfaceBright};
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  display: grid;
  place-items: center;
  flex-shrink: 0;
  overflow: hidden;

  img {
    width: 22px;
    height: 22px;
    object-fit: contain;
  }
`;

const SSOHoverBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  min-width: 0;
`;

const SSOHoverName = styled.div`
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelLarge};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
`;

const SSOHoverDesc = styled.div`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodySmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  line-height: 1.35;
`;

const SSOIcon = styled.span`
  width: 24px;
  height: 24px;
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerMd};
  background: ${({ theme }) => (theme as StyledTheme).colorSurfaceBright};
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  display: grid;
  place-items: center;
  overflow: hidden;

  img {
    width: 18px;
    height: 18px;
    object-fit: contain;
  }
`;

const SSOMoreWrap = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space150};
  padding: ${({ theme }) => (theme as StyledTheme).space150} ${({ theme }) => (theme as StyledTheme).space300};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerLg};
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  cursor: pointer;
  background: none;
  border: none;
  white-space: nowrap;
  transition: background 0.1s, color 0.1s;

  &:hover {
    background: ${({ theme }) => (theme as StyledTheme).colorSurfaceContainerLow};
    color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  }
`;

const compactDrawerClass = css`
  header {
    padding-left: 36px !important;
    padding-right: 36px !important;
  }
  [data-testid="drawer-body"] {
    padding-left: 36px !important;
    padding-right: 36px !important;
  }
`;

// ── Drawer Grid ─────────────────────────────────────────────────────────────

const DrawerToolbar = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
  padding: 0 0 ${({ theme }) => (theme as StyledTheme).space400};
`;

const DrawerSearchInput = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
  padding: ${({ theme }) => `${(theme as StyledTheme).space200} ${(theme as StyledTheme).space300}`};
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerLg};
  background: ${({ theme }) => (theme as StyledTheme).colorSurface};
  transition: border-color 0.15s;

  &:focus-within {
    border-color: ${({ theme }) => (theme as StyledTheme).colorPrimary};
  }

  input {
    flex: 1;
    border: none;
    background: none;
    outline: none;
    ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
    color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
    padding: 0;

    &::placeholder {
      color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
    }
  }
`;

const SortWrap = styled.div`
  position: relative;
`;

const SortMenu = styled.div`
  position: absolute;
  top: calc(100% + ${({ theme }) => (theme as StyledTheme).space100});
  right: 0;
  background: ${({ theme }) => (theme as StyledTheme).colorSurfaceBright};
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerLg};
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: ${({ theme }) => (theme as StyledTheme).space100} 0;
  min-width: 160px;
  z-index: 10;
`;

const SortMenuLabel = styled.div`
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: ${({ theme }) => (theme as StyledTheme).space200} ${({ theme }) => (theme as StyledTheme).space350} ${({ theme }) => (theme as StyledTheme).space100};
`;

const SortMenuItem = styled.button<{ $active?: boolean }>`
  display: block;
  width: 100%;
  padding: ${({ theme }) => (theme as StyledTheme).space200} ${({ theme }) => (theme as StyledTheme).space350};
  border: none;
  background: ${({ $active, theme }) => $active ? (theme as StyledTheme).colorSurfaceContainerLow : 'none'};
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  font-weight: ${({ $active }) => $active ? 600 : 400};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  cursor: pointer;
  text-align: left;

  &:hover {
    background: ${({ theme }) => (theme as StyledTheme).colorSurfaceContainerLow};
  }
`;

const DrawerList = styled.div`
  display: flex;
  flex-direction: column;
`;

const DrawerAppRow = styled.a`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space300};
  padding: ${({ theme }) => (theme as StyledTheme).space250} ${({ theme }) => (theme as StyledTheme).space300};
  margin: 0 -${({ theme }) => (theme as StyledTheme).space300};

  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerLg};
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  transition: background 0.1s;

  &:hover {
    background: ${({ theme }) => (theme as StyledTheme).colorSurfaceContainerLow};
  }
`;

const DrawerAppIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerLg};
  background: ${({ theme }) => (theme as StyledTheme).colorSurfaceBright};
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  display: grid;
  place-items: center;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 24px;
    height: 24px;
    object-fit: contain;
  }
`;

const DrawerAppBody = styled.div`
  flex: 1;
  min-width: 0;
`;

const DrawerAppName = styled.div`
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelLarge};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
`;

const DrawerAppDesc = styled.div`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodySmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
`;

const DrawerEmpty = styled.div`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  text-align: center;
  padding: ${({ theme }) => (theme as StyledTheme).space800} 0;
`;

// ── Quick Actions ───────────────────────────────────────────────────────────

const QUICK_ACTION_ICONS: Record<string, string> = {
  request_time_off: Icon.TYPES.TIME_OUTLINE,
  view_my_schedule: Icon.TYPES.CALENDAR_OUTLINE,
  view_my_timecard: Icon.TYPES.TIME_OUTLINE,
  view_pto_balances: Icon.TYPES.TIME_OUTLINE,
  view_paystubs: Icon.TYPES.DOLLAR_CIRCLE_OUTLINE,
  update_bank_account: Icon.TYPES.CREDIT_CARD_OUTLINE,
  view_tax_documents: Icon.TYPES.FILE_OUTLINE,
  view_my_benefits: Icon.TYPES.HEART_OUTLINE,
  submit_expense: Icon.TYPES.CREDIT_CARD_OUTLINE,
  scan_receipt: Icon.TYPES.CAMERA_OUTLINE,
  log_mileage: Icon.TYPES.LOCATION_OUTLINE,
  people_directory: Icon.TYPES.PEO_OUTLINE,
  view_documents: Icon.TYPES.FILE_OUTLINE,
  shift_swaps: Icon.TYPES.REASSIGN_COMPUTER_OUTLINE,
  edit_availability: Icon.TYPES.CALENDAR_OUTLINE,
  team_schedule: Icon.TYPES.PEO_OUTLINE,
  review_timesheets: Icon.TYPES.CHECKBOX_WITHCHECK_OUTLINE,
  assign_shifts: Icon.TYPES.CALENDAR_OUTLINE,
  message_team: Icon.TYPES.COMMENTS_OUTLINE,
  view_shift_summary: Icon.TYPES.BAR_CHART_OUTLINE,
  time_entry_change_request: Icon.TYPES.TIME_OUTLINE,
  view_pto_approvals: Icon.TYPES.CHECKBOX_WITHCHECK_OUTLINE,
  view_company_holidays: Icon.TYPES.CALENDAR_OUTLINE,
  view_team_ooo: Icon.TYPES.PEO_OUTLINE,
  view_pay: Icon.TYPES.DOLLAR_CIRCLE_OUTLINE,
  update_withholdings: Icon.TYPES.SETTINGS_OUTLINE,
  paycheck_split: Icon.TYPES.DOLLAR_CIRCLE_OUTLINE,
  view_flex_benefits: Icon.TYPES.HEART_OUTLINE,
  view_hsa: Icon.TYPES.HEART_OUTLINE,
  view_expenses: Icon.TYPES.CREDIT_CARD_OUTLINE,
  view_expense_approvals: Icon.TYPES.CHECKBOX_WITHCHECK_OUTLINE,
  view_cards: Icon.TYPES.CREDIT_CARD_OUTLINE,
  view_notifications: Icon.TYPES.NOTIFICATION_OUTLINE,
  view_profile: Icon.TYPES.MY_ACCOUNT_SETTINGS_OUTLINE,
  book_travel: Icon.TYPES.LOCATION_OUTLINE,
};

const EXEC_SHORTCUTS = [
  { id: 'exec_create_report', label: 'Create report', icon: Icon.TYPES.BAR_CHART_OUTLINE },
  { id: 'exec_new_automation', label: 'New automation', icon: Icon.TYPES.THUNDERBOLT_OUTLINE },
  { id: 'exec_generate_survey', label: 'Generate survey', icon: Icon.TYPES.CHECKLIST },
  { id: 'exec_update_policies', label: 'Update policies', icon: Icon.TYPES.CUSTOMIZE_POLICY_OUTLINE },
];

const ShortcutsStrip = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  row-gap: ${({ theme }) => (theme as StyledTheme).space200};
  width: 100%;
  max-width: 830px;
  margin: ${({ theme }) => (theme as StyledTheme).space500} 0 0;
  padding: 0 0 ${({ theme }) => (theme as StyledTheme).space800} 0;
`;

const RecentsTasksSection = styled.div`
  width: 100%;
  max-width: 744px;
  margin: ${({ theme }) => (theme as StyledTheme).space600} 0 ${({ theme }) => (theme as StyledTheme).space600} 0;
  padding: 0 0 ${({ theme }) => (theme as StyledTheme).space1200} 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => (theme as StyledTheme).space2400};
`;

const RecentsTasksColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

const RecentsTasksColumnHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-left: -16px;
`;

const RecentsTasksRow = styled.a`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: ${({ theme }) => (theme as StyledTheme).space150};
  margin: 0 -${({ theme }) => (theme as StyledTheme).space150};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerMd};
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  opacity: 1;
  transition: background 0.15s ease,
    opacity 120ms cubic-bezier(0.25, 1, 0.5, 1);

  &[data-dismissing='true'] {
    opacity: 0;
  }

  &:hover {
    background: ${({ theme }) => (theme as StyledTheme).colorSurfaceContainerLow};
  }
`;

const RecentsTasksRowLabel = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyLarge};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  flex: 1;
  min-width: 0;
`;

const RecentsTasksRowMeta = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodySmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  white-space: nowrap;
`;

const RecentsTasksRowDismiss = styled.span`
  opacity: 0;
  transition: opacity 0.15s ease;
  flex-shrink: 0;

  ${RecentsTasksRow}:hover & {
    opacity: 1;
  }
`;

const RecentsTasksRowContext = styled.span`
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
`;

const RecentsTasksEmptyLabel = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  padding: ${({ theme }) => (theme as StyledTheme).space200} 0;

  @keyframes emptyFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  animation: emptyFadeIn 200ms cubic-bezier(0.25, 1, 0.5, 1);
`;

const chipFadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const QATile = styled.a<{ $index?: number }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space250};
  padding: ${({ theme }) => (theme as StyledTheme).space150} ${({ theme }) => (theme as StyledTheme).space300} ${({ theme }) => (theme as StyledTheme).space150} ${({ theme }) => (theme as StyledTheme).space150};
  margin-left: ${({ theme }) => (theme as StyledTheme).space200};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerFull};
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  transition: background 0.12s;
  opacity: 0;
  animation: ${chipFadeIn} 350ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: ${({ $index = 0 }) => 200 + $index * 50}ms;

  &:hover {
    background: ${({ theme }) => (theme as StyledTheme).colorSurfaceContainerLow};
  }
`;

const QAIconBox = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ theme }) => (theme as StyledTheme).colorSurfaceDim};
  display: grid;
  place-items: center;
  flex-shrink: 0;
`;

const QALabel = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  white-space: nowrap;
`;


const QAMore = styled.a`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space100};
  padding: ${({ theme }) => (theme as StyledTheme).space200} ${({ theme }) => (theme as StyledTheme).space350};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerFull};
  cursor: pointer;
  text-decoration: none;
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  transition: background 0.12s;

  &:hover {
    background: ${({ theme }) => (theme as StyledTheme).colorSurfaceContainerLow};
    color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  }
`;

const PersonaHud = styled.div<{ $visible: boolean }>`
  position: fixed;
  top: ${({ theme }) => (theme as StyledTheme).space1600};
  right: ${({ theme }) => (theme as StyledTheme).space400};
  z-index: 200;
  background: ${({ theme }) => (theme as StyledTheme).colorSurfaceBright};
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCorner2xl};
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: ${({ theme }) => (theme as StyledTheme).space400};
  width: 280px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => (theme as StyledTheme).space300};
  opacity: ${({ $visible }) => $visible ? 1 : 0};
  transform: translateY(${({ $visible }) => $visible ? '0' : '-8px'});
  pointer-events: ${({ $visible }) => $visible ? 'auto' : 'none'};
  transition: opacity 0.15s ease, transform 0.15s ease;
`;

const PersonaHudBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 199;
`;

const PersonaHudHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PersonaHudDismiss = styled.button`
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 18px;
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerSm};
  display: grid;
  place-items: center;
  transition: background 0.1s;

  &:hover {
    background: ${({ theme }) => (theme as StyledTheme).colorSurfaceContainerLow};
  }
`;

const PersonaHudLabel = styled.div`
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const PersonaHudSelect = styled.select`
  width: 100%;
  padding: ${({ theme }) => (theme as StyledTheme).space200} ${({ theme }) => (theme as StyledTheme).space250};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerLg};
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  background: ${({ theme }) => (theme as StyledTheme).colorSurface};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  cursor: pointer;
  outline: none;
`;

// ── Card Grid ───────────────────────────────────────────────────────────────

const RECENT_ITEMS = [
  { icon: Icon.TYPES.CREDIT_CARD_OUTLINE, name: 'Bills', context: 'Finance', meta: '2h ago' },
  { icon: Icon.TYPES.HEART_OUTLINE, name: 'COBRA', context: 'Benefits', meta: '1d ago' },
  { icon: Icon.TYPES.DOLLAR_CIRCLE_OUTLINE, name: 'Payroll overview', context: '', meta: '1d ago' },
];

const TODO_ITEMS = [
  { icon: Icon.TYPES.WARNING_TRIANGLE_OUTLINE, label: 'Overdue', count: '2 items' },
  { icon: Icon.TYPES.CALENDAR_OUTLINE, label: 'Due within 7 days', count: '1 item' },
  { icon: Icon.TYPES.TASKS_OUTLINE, label: 'New', count: '12 unread' },
];

const MOST_VISITED_ITEMS = [
  { icon: Icon.TYPES.DOLLAR_CIRCLE_FILLED, name: 'Run Payroll — March' },
  { icon: Icon.TYPES.TIME_FILLED, name: 'Time & Attendance Summary' },
  { icon: Icon.TYPES.CALENDAR_FILLED, name: 'Time Management' },
  { icon: Icon.TYPES.BAR_CHART_FILLED, name: 'Headcount Report Q1' },
  { avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face', name: 'Alex Kim — Profile', color: 'oklch(55% 0.1 200)' },
];

const TASK_ITEMS = [
  { avatar: 'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=80&h=80&fit=crop&crop=face', name: 'Increase Robert Wilson\u2019s PTO balance to 20 days', meta: 'Lisa Thompson \u00b7 HR Management', action: 'Approve', color: 'oklch(55% 0.15 330)' },
  { avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face', name: '8h 30m time entry on Oct 25', meta: 'David Park \u00b7 Time and Attendance', action: 'Approve', color: 'oklch(55% 0.1 200)' },
  { avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face', name: 'Reimburse $30.00 (Alaska Airlines)', meta: 'Emily Rodriguez \u00b7 Reimbursements', action: 'Review', color: 'oklch(55% 0.1 200)' },
  { avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face', name: 'Sign non-disclosure agreement for new project', meta: 'Legal Department \u00b7 Documents', action: 'Sign', color: 'oklch(55% 0.1 200)' },
];

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => (theme as StyledTheme).space400};
  width: 100%;
  max-width: 1200px;
  margin: ${({ theme }) => (theme as StyledTheme).space800} auto ${({ theme }) => (theme as StyledTheme).space400};
`;

const Card = styled.div`
  background: color-mix(in srgb, ${({ theme }) => (theme as StyledTheme).colorSurfaceDim} 30%, transparent);
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCorner2xl};
  padding: ${({ theme }) => (theme as StyledTheme).space500};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.03);
  min-width: 0;
  display: flex;
  flex-direction: column;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space350};
`;

const CardTitleButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space100};
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  ${({ theme }) => (theme as StyledTheme).typestyleV2TitleSmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  letter-spacing: -0.2px;

  &:hover {
    color: ${({ theme }) => (theme as StyledTheme).colorPrimary};
  }
`;

const CardMenuWrap = styled.div`
  position: relative;
`;

const CardMenu = styled.div`
  position: absolute;
  top: calc(100% + ${({ theme }) => (theme as StyledTheme).space100});
  right: 0;
  background: ${({ theme }) => (theme as StyledTheme).colorSurfaceBright};
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerLg};
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: ${({ theme }) => (theme as StyledTheme).space100} 0;
  min-width: 180px;
  z-index: 10;
`;

const CardMenuDivider = styled.div`
  height: 1px;
  background: ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  margin: ${({ theme }) => (theme as StyledTheme).space100} 0;
`;

const CardMenuItem = styled.button`
  display: block;
  width: 100%;
  padding: ${({ theme }) => (theme as StyledTheme).space200} ${({ theme }) => (theme as StyledTheme).space350};
  border: none;
  background: none;
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  cursor: pointer;
  text-align: left;
  white-space: nowrap;

  &:hover {
    background: ${({ theme }) => (theme as StyledTheme).colorSurfaceContainerLow};
  }
`;

const RecentRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space250};
  padding: ${({ theme }) => (theme as StyledTheme).space225} 0;
  border-bottom: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  cursor: pointer;

  &:last-child { border-bottom: none; }
`;

const RecentIconCircle = styled.div<{ $bg: string }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${({ $bg }) => $bg};
  display: grid;
  place-items: center;
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 600;
  color: white;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const RecentName = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RecentTime = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodySmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  white-space: nowrap;
`;

const TaskRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space250};
  padding: ${({ theme }) => (theme as StyledTheme).space225} 0;
  border-bottom: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  cursor: pointer;

  &:last-child { border-bottom: none; }
`;

const TaskIconCircle = styled.div<{ $bg: string }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${({ $bg }) => $bg};
  display: grid;
  place-items: center;
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 600;
  color: white;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const TaskBody = styled.div`
  flex: 1;
  min-width: 0;
`;

const TaskTitle = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TaskMeta = styled.div`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodySmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  margin-top: ${({ theme }) => (theme as StyledTheme).space25};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const AiResolveLine = styled.div`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodySmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  margin-top: -${({ theme }) => (theme as StyledTheme).space200};
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space250};
  cursor: pointer;

  span {
    text-decoration: underline;
    text-decoration-style: dotted;
    text-decoration-color: ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
    text-underline-offset: ${({ theme }) => (theme as StyledTheme).space75};
  }

  &:hover span {
    text-decoration-style: solid;
    color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  }
`;

const AiModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => (theme as StyledTheme).space400};
`;

const AiModalIcon = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelLarge};
  color: ${({ theme }) => (theme as StyledTheme).colorPrimary};
`;

const AiModalText = styled.div`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  line-height: 1.6;
`;

// ── Create Shortcut Modal ────────────────────────────────────────────────────

const CreateModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => (theme as StyledTheme).space600};
  padding: ${({ theme }) => (theme as StyledTheme).space600};
`;

const CreateModalField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
`;

const CreateModalFieldLabel = styled.label`
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelLarge};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
`;

const CreateModalError = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodySmall};
  color: ${({ theme }) => (theme as StyledTheme).colorError};
`;

const CreateShortcutLink = styled.button`
  background: none;
  border: none;
  padding: 0;
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space300};
  cursor: pointer;
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  transition: color 0.1s;
  text-align: left;

  &:hover {
    color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  }
`;

// ── Company Resources Footer ─────────────────────────────────────────────────

const ResourcesFooter = styled.div`
  max-width: 1200px;
  margin: 80px auto 0;
  padding: ${({ theme }) => (theme as StyledTheme).space600} 0 ${({ theme }) => (theme as StyledTheme).space800};
  border-top: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
`;

const ResourcesLabel = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  font-weight: 600;
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  white-space: nowrap;
  padding-right: ${({ theme }) => (theme as StyledTheme).space200};
`;

const ResourcesDivider = styled.div`
  width: 1px;
  height: 20px;
  background: ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  margin: 0 ${({ theme }) => (theme as StyledTheme).space300};
  flex-shrink: 0;
`;

const ResourceLink = styled.a`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  text-decoration: none;
  cursor: pointer;
  transition: color 0.1s;
  white-space: nowrap;

  &:hover {
    color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  }
`;

// ── Inline Ad (AdWords-style) ───────────────────────────────────────────────

const InlineAd = styled.div`
  text-align: center;
  padding: ${({ theme }) => (theme as StyledTheme).space400} ${({ theme }) => (theme as StyledTheme).space400} ${({ theme }) => (theme as StyledTheme).space600};
  max-width: 1200px;
  margin: 0 auto;
`;

const InlineAdText = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
`;

const InlineAdLink = styled.a`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorPrimary};
  text-decoration: none;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;



// ── What's New ──────────────────────────────────────────────────────────────

const WhatsNewSection = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => (theme as StyledTheme).space400} ${({ theme }) => (theme as StyledTheme).space1200};
`;

const WhatsNewHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space400};
`;

const WhatsNewTitle = styled.div`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  font-weight: 600;
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
`;

const WhatsNewLink = styled.a`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodySmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  text-decoration: none;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  }
`;

const WhatsNewRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: ${({ theme }) => (theme as StyledTheme).space300};
  padding: ${({ theme }) => (theme as StyledTheme).space150} 0;
`;

const WhatsNewDot = styled.span`
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  flex-shrink: 0;
  position: relative;
  top: -1px;
`;

const WhatsNewText = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodySmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
`;

const WhatsNewHighlight = styled.a`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodySmall};
  color: ${({ theme }) => (theme as StyledTheme).colorPrimary};
  text-decoration: none;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

// ── Analytics Card ──────────────────────────────────────────────────────────

interface AnalyticsItem {
  icon: string;
  title: string;
  insight: string;
  points: number[];
  strokeColor: 'primary' | 'error' | 'success';
}

const ANALYTICS_ITEMS: AnalyticsItem[] = [
  {
    icon: Icon.TYPES.PEO_OUTLINE,
    title: 'Headcount',
    insight: 'Last edited 2 days ago',
    points: [8, 9, 10, 10, 11, 12, 13, 14, 15, 17],
    strokeColor: 'primary',
  },
  {
    icon: Icon.TYPES.DOLLAR_CIRCLE_OUTLINE,
    title: 'Payroll cost',
    insight: 'Last edited 5 days ago',
    points: [11, 12, 11, 12, 13, 12, 12, 11, 12, 12],
    strokeColor: 'primary',
  },
  {
    icon: Icon.TYPES.TIME_OUTLINE,
    title: 'Initiatives Tracker',
    insight: 'Last edited 1 week ago',
    points: [3, 4, 4, 5, 6, 8, 10, 13, 15, 18],
    strokeColor: 'error',
  },
  {
    icon: Icon.TYPES.BAR_CHART_OUTLINE,
    title: 'Attendance Data',
    insight: 'Last edited 2 weeks ago',
    points: [16, 15, 14, 14, 12, 11, 10, 9, 8, 7],
    strokeColor: 'success',
  },
];

// ── Dashboards Section ─────────────────────────────────────────────────────

interface DashboardFilter {
  id: string;
  label: string;
}

interface DashboardTab {
  id: string;
  name: string;
  lastEdited: string;
  filters: DashboardFilter[];
}

const DASHBOARD_TABS: DashboardTab[] = [
  {
    id: 'headcount',
    name: 'Q1 Headcount by Department',
    lastEdited: 'Just now',
    filters: [
      { id: 'dept', label: 'Department: Sales' },
      { id: 'region', label: 'Region equals West' },
      { id: 'start', label: 'Start date' },
      { id: 'owner', label: 'Owner' },
    ],
  },
  {
    id: 'revenue',
    name: 'Revenue Overview',
    lastEdited: '2h ago',
    filters: [
      { id: 'period', label: 'Period: Q1 2026' },
      { id: 'segment', label: 'Segment: Enterprise' },
    ],
  },
  {
    id: 'hiring',
    name: 'Hiring Funnel',
    lastEdited: 'Yesterday',
    filters: [
      { id: 'dept', label: 'Department: Engineering' },
      { id: 'stage', label: 'Stage: All' },
      { id: 'source', label: 'Source' },
    ],
  },
];

const DashboardsWrap = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto ${({ theme }) => (theme as StyledTheme).space800};
`;

const DashboardTabBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  border-bottom: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  padding: 0;
`;

const DashboardTabItem = styled.button<{ $active?: boolean }>`
  position: relative;
  padding: ${({ theme }) => (theme as StyledTheme).space200} ${({ theme }) => (theme as StyledTheme).space400};
  border: none;
  background: ${({ $active, theme }) =>
    $active ? (theme as StyledTheme).colorSurfaceContainerLow : 'none'};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerLg} ${({ theme }) => (theme as StyledTheme).shapeCornerLg} 0 0;
  cursor: pointer;
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  color: ${({ $active, theme }) =>
    $active
      ? (theme as StyledTheme).colorOnSurface
      : (theme as StyledTheme).colorOnSurfaceVariant};
  white-space: nowrap;
  transition: background 0.1s, color 0.1s;

  &:hover {
    background: ${({ theme }) => (theme as StyledTheme).colorSurfaceContainerLow};
    color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  }

  ${({ $active, theme }) =>
    $active
      ? `&::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background: ${(theme as StyledTheme).colorOnSurface};
        }`
      : ''}
`;

const DashboardTabAdd = styled.button`
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  cursor: pointer;
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerLg};
  transition: background 0.1s;

  &:hover {
    background: ${({ theme }) => (theme as StyledTheme).colorSurfaceContainerLow};
  }
`;

const DashboardTabSpacer = styled.div`
  flex: 1;
`;

const DashboardTabActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
`;

const DashboardAllButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space100};
  padding: ${({ theme }) => (theme as StyledTheme).space150} ${({ theme }) => (theme as StyledTheme).space350};
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerLg};
  background: ${({ theme }) => (theme as StyledTheme).colorSurfaceBright};
  cursor: pointer;
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  white-space: nowrap;
  transition: background 0.1s;

  &:hover {
    background: ${({ theme }) => (theme as StyledTheme).colorSurfaceContainerLow};
  }
`;

const DashboardHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => (theme as StyledTheme).space400} 0 ${({ theme }) => (theme as StyledTheme).space200};
`;

const DashboardTitleText = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2TitleMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
`;

const DashboardHeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
`;

const DashboardTimestamp = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodySmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  white-space: nowrap;
`;

const DashboardFiltersRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
  padding-bottom: ${({ theme }) => (theme as StyledTheme).space400};
`;

const DashboardAddFilter = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space100};
  padding: ${({ theme }) => (theme as StyledTheme).space100} ${({ theme }) => (theme as StyledTheme).space300};
  border: 1px dashed ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerFull};
  background: none;
  cursor: pointer;
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodySmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  transition: background 0.1s, color 0.1s;

  &:hover {
    background: ${({ theme }) => (theme as StyledTheme).colorSurfaceContainerLow};
    color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
    border-style: solid;
  }
`;

const DashboardPlaceholder = styled.div`
  width: 100%;
  height: 320px;
  background: ${({ theme }) => (theme as StyledTheme).colorSurfaceContainerLow};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCorner2xl};
  display: grid;
  place-items: center;
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
`;

function sparklinePaths(points: number[], width: number, height: number): { line: string; area: string } {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const pad = 2;
  const coords = points.map((v, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - pad - ((v - min) / range) * (height - pad * 2);
    return `${x},${y}`;
  });
  const line = coords.join(' ');
  const area = `0,${height} ${line} ${width},${height}`;
  return { line, area };
}

const AnalyticsRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space250};
  padding: ${({ theme }) => (theme as StyledTheme).space250} 0;
  border-bottom: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  cursor: pointer;

  &:last-child { border-bottom: none; }
`;

const AnalyticsIconCircle = styled.div<{ $bg: string }>`
  width: 28px;
  height: 28px;
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerLg};
  background: ${({ $bg }) => $bg};
  display: grid;
  place-items: center;
  flex-shrink: 0;
`;

const AnalyticsBody = styled.div`
  flex: 1;
  min-width: 0;
`;

const AnalyticsTitle = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  display: block;
`;

const AnalyticsInsight = styled.div`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodySmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

// ── Sidebar Tabs ────────────────────────────────────────────────────────────

/* Link-style tabs (Home / Chats / Inbox) pinned to the top of the left
   sidebar. `stretchH` on Tabs.LINK makes the internal StyledScroll span
   the full width of this wrapper, so Pebble's built-in 1px underline
   acts as the section divider beneath the tabs. Horizontal padding here
   insets both the labels and the underline from the sidebar's edges for
   some breathing room; the active-tab indicator still lives on the same
   line as the neutral underline, so there's only ever one rule. */
const SidebarTopBlock = styled.div`
  width: 100%;
  box-sizing: border-box;
  margin-top: ${({ theme }) => (theme as StyledTheme).space400};
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space300};
  padding: 0 ${({ theme }) => (theme as StyledTheme).space500};
`;

// ── Sidebar Body (Starred / Recents / Apps / Utilities) ─────────────────────

/* A flat, user-centric sidebar body that replaces the nested app tree.
   All rows share the 40px NavItem density the team likes. Sections are
   separated by vertical rhythm rather than horizontal rules — the only
   divider in the sidebar is the built-in Tabs.LINK underline above. */

const SidebarBody = styled.div`
  padding: ${({ theme }) => (theme as StyledTheme).space250}
    ${({ theme }) => (theme as StyledTheme).space300};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => (theme as StyledTheme).space600};
`;

const SidebarSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const SidebarSectionHeading = styled.div`
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  padding: 0 ${({ theme }) => (theme as StyledTheme).space200}
    ${({ theme }) => (theme as StyledTheme).space100};
`;

/* Tight button row: 32px tall, 14px BodyMedium, 20px icons. Matches the
   density of the Recents reference — comfortable but compact so the full
   Starred / Recents / Apps / Utilities stack fits above the fold. */
const SidebarRow = styled.button<{ $active?: boolean }>`
  width: 100%;
  height: 36px;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
  padding: 0 ${({ theme }) => (theme as StyledTheme).space200};
  background: ${({ $active, theme }) =>
    $active
      ? (theme as StyledTheme).colorSurfaceContainerHigh
      : 'none'};
  border: none;
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerLg};
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyLarge};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  font-weight: ${({ $active }) => ($active ? 600 : 'inherit')};
  text-align: left;
  cursor: pointer;
  transition: all 0.1s ease-in-out 0s;
  overflow: hidden;
  position: relative;

  &:hover {
    background-color: ${({ $active, theme }) =>
      $active
        ? (theme as StyledTheme).colorSurfaceContainerHigh
        : getStateColor((theme as StyledTheme).colorSurfaceBright, 'hover')};
  }

  &:active {
    background-color: ${({ theme }) =>
      getStateColor((theme as StyledTheme).colorSurfaceBright, 'active')};
  }
`;

const SidebarRowIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const SidebarRowText = styled.span`
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SidebarRowMuted = styled.span`
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
`;

const SidebarRowBadge = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelSmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  flex-shrink: 0;
`;

const SidebarInlineLink = styled.button`
  all: unset;
  align-self: flex-start;
  margin-top: ${({ theme }) => (theme as StyledTheme).space50};
  padding: ${({ theme }) => (theme as StyledTheme).space50}
    ${({ theme }) => (theme as StyledTheme).space150};
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelSmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  cursor: pointer;
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerSm};

  &:hover {
    color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
    background-color: ${({ theme }) =>
      getStateColor((theme as StyledTheme).colorSurfaceBright, 'hover')};
  }
`;

const SidebarFooterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-top: ${({ theme }) => (theme as StyledTheme).space200};
  padding-top: ${({ theme }) => (theme as StyledTheme).space200};
  border-top: 1px solid
    ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
`;

// ── Content ─────────────────────────────────────────────────────────────────

const PageGradient = styled.div`
  background: linear-gradient(
    to bottom,
    color-mix(in srgb, ${({ theme }) => (theme as StyledTheme).colorSurfaceDim} 35%, transparent) 0%,
    ${({ theme }) => (theme as StyledTheme).colorSurface} 50%
  );
  flex: 1;
`;

const HomeContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${({ theme }) => (theme as StyledTheme).space800};
  padding-top: 18vh;
  position: relative;
  max-width: 960px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
`;

const PromptHeading = styled.h1`
  ${({ theme }) => (theme as StyledTheme).typestyleV2TitleLarge};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  text-align: center;
  margin: 0 0 ${({ theme }) => (theme as StyledTheme).space600} 0;
`;

const PromptCard = styled.div`
  width: 100%;
  height: 120px;
  background-color: ${({ theme }) => (theme as StyledTheme).colorSurfaceBright};
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 1px 1px 0px;
  padding: 20px 12px 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: text;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.2s ease;

  &:focus-within {
    border-color: rgba(0, 0, 0, 0.2);
  }
`;

const PromptInputRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
  width: 100%;
`;

const PromptInput = styled.textarea`
  flex: 1;
  background: transparent;
  border: none;
  resize: none;
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  min-height: 20px;
  padding: 0;
  margin: 0;
  line-height: 1.5;

  &::placeholder {
    color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  }

  caret-color: ${({ theme }) => (theme as StyledTheme).colorPrimary};

  &:focus {
    outline: none;
  }
`;

const PromptActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const PromptActionsRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
`;

const PromptWrap = styled.div`
  position: relative;
  width: 100%;
  max-width: 768px;
  box-sizing: border-box;
`;

// ── Mention Data ────────────────────────────────────────────────────────────

const MENTION_RECENTLY_USED = [
  { name: 'Finance', meta: 'Departments' },
];

const MENTION_EMPLOYEES = [
  { name: 'Paul Best', dept: 'Product Design', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face' },
  { name: 'Saha Hammari', dept: 'Product Design', avatar: 'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=80&h=80&fit=crop&crop=face' },
  { name: 'Abhishek Bhardwaj', dept: 'Product Design', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face' },
  { name: 'Rahul Gajjar', dept: 'Product Design', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face' },
  { name: 'James Donovan', dept: 'Product Design', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face' },
];

const MENTION_DEPARTMENTS = ['Engineering', 'Sales', 'Product Design', 'Marketing', 'Finance'];

const MentionDropdown = styled.div<{ $visible: boolean }>`
  position: absolute;
  top: calc(100% + ${({ theme }) => (theme as StyledTheme).space200});
  left: 0;
  width: 440px;
  z-index: 30;
  background: ${({ theme }) => (theme as StyledTheme).colorSurfaceBright};
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCorner2xl};
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  padding: ${({ theme }) => (theme as StyledTheme).space200} 0;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  pointer-events: ${({ $visible }) => ($visible ? 'auto' : 'none')};
  transform: translateY(${({ $visible }) => ($visible ? '0' : '-8px')});
  transition: opacity 0.15s ease, transform 0.15s ease;
  max-height: 400px;
  overflow-y: auto;
`;

const MentionSectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
  padding: ${({ theme }) => (theme as StyledTheme).space200} ${({ theme }) => (theme as StyledTheme).space400};
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
`;

const MentionSectionChevron = styled.span`
  display: flex;
  align-items: center;
`;

const MentionRow = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space300};
  width: 100%;
  padding: ${({ theme }) => (theme as StyledTheme).space200} ${({ theme }) => (theme as StyledTheme).space400};
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.1s;

  &:hover {
    background: ${({ theme }) => (theme as StyledTheme).colorSurfaceContainerLow};
  }
`;

const MentionAvatar = styled.img`
  width: 28px;
  height: 28px;
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerFull};
  object-fit: cover;
  flex-shrink: 0;
`;

const MentionName = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMediumEmphasized};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  flex: 1;
  min-width: 0;
`;

const MentionMeta = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  flex-shrink: 0;
`;

const MentionMoreLink = styled.div`
  padding: ${({ theme }) => (theme as StyledTheme).space200} ${({ theme }) => (theme as StyledTheme).space400};
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodySmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
`;

const MentionDivider = styled.div`
  height: 1px;
  background: ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  margin: ${({ theme }) => (theme as StyledTheme).space100} 0;
`;

const MentionAtSymbol = styled.div`
  padding: ${({ theme }) => (theme as StyledTheme).space200} ${({ theme }) => (theme as StyledTheme).space400};
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorPrimary};
`;

// ── Report Mode ─────────────────────────────────────────────────────────────

const ReportChip = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorPrimary};
  background: ${({ theme }) => (theme as StyledTheme).colorSurface};
  color: ${({ theme }) => (theme as StyledTheme).colorPrimary};
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelMedium};
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s ease;

  &:hover {
    background: ${({ theme }) => (theme as StyledTheme).colorSurfaceContainerLow};
  }
`;

/* Unified Starter model. The previous design split entry points into two
   species — "sample prompts" (one-liners) and "recipes" (curated templates
   with metadata). From a customer standpoint both do the same thing: scope
   a draft input, hit go. We merge them into one shelf with one card shape:
   short scannable title (from the recipe pattern) + full editable prompt
   sentence (from the sample-prompt pattern). Each starter is tagged with
   the output formats it's a natural fit for; the grid reorders matches to
   the top when the user picks a format above. */
type Starter = {
  id: string;
  title: string;
  prompt: string;
  icon: string;
  color: string;
  formats?: string[];
  outcomes?: string[];
  permission?: string;
};

const REPORT_STARTERS: Starter[] = [
  {
    id: 'payroll-by-dept',
    title: 'Payroll by department',
    prompt: 'Create a report of payroll cost broken down by department for the current quarter.',
    icon: Icon.TYPES.DOLLAR_CIRCLE_OUTLINE,
    color: '#7B3E00',
    formats: ['bar', 'pivot', 'stacked'],
  },
  {
    id: 'headcount-attrition',
    title: 'Headcount & attrition',
    prompt: 'Track headcount and attrition trends across all departments over the last four quarters.',
    icon: Icon.TYPES.PEO_OUTLINE,
    color: '#005A3A',
    formats: ['bar', 'stacked'],
  },
  {
    id: 'marketing-campaigns',
    title: 'Marketing campaigns',
    prompt: 'Create a monthly marketing campaign performance report with spend, leads, and conversion.',
    icon: Icon.TYPES.BAR_CHART_OUTLINE,
    color: '#1E5A8E',
    formats: ['grid', 'bar'],
  },
  {
    id: 'time-off-by-team',
    title: 'Time-off by team',
    prompt: 'Compare time-off usage across teams this quarter.',
    icon: Icon.TYPES.CALENDAR_OUTLINE,
    color: '#005A3A',
    formats: ['bar', 'pivot'],
  },
  {
    id: 'employee-roster',
    title: 'Employee roster',
    prompt: 'Show a full employee roster with name, role, department, manager, and start date.',
    icon: Icon.TYPES.PEO_OUTLINE,
    color: '#7B3E00',
    formats: ['grid'],
  },
  {
    id: 'hours-by-dept',
    title: 'Hours by department',
    prompt: 'Show hours worked per department for the current pay period.',
    icon: Icon.TYPES.TIME_OUTLINE,
    color: '#005A3A',
    formats: ['bar', 'pivot'],
  },
  {
    id: 'hours-by-employee',
    title: 'Hours by employee',
    prompt: 'Show hourly timecards and associated earnings for each employee.',
    icon: Icon.TYPES.TIME_OUTLINE,
    color: '#005A3A',
    formats: ['grid', 'pivot'],
  },
  {
    id: 'time-off-balances',
    title: 'Time-off balances',
    prompt: 'Show current leave balances by employee and leave type.',
    icon: Icon.TYPES.CALENDAR_OUTLINE,
    color: '#005A3A',
    formats: ['grid'],
  },
  {
    id: 'change-history',
    title: 'Employee change log',
    prompt: 'Track all employee data changes made in Rippling over the last 30 days.',
    icon: Icon.TYPES.PEO_OUTLINE,
    color: '#7B3E00',
    formats: ['grid'],
  },
];

const REPORT_OUTPUT_FORMATS = [
  { id: 'grid', label: 'Grid', icon: Icon.TYPES.TABLE },
  { id: 'pivot', label: 'Pivot Table', icon: Icon.TYPES.TABLE_COLUMN_OUTLINE },
  { id: 'bar', label: 'Bar Chart', icon: Icon.TYPES.BAR_CHART_OUTLINE },
  { id: 'stacked', label: 'Stacked Chart', icon: Icon.TYPES.BAR_CHART_OUTLINE },
];

const ReportSection = styled.div`
  width: 100%;
  max-width: 768px;
  margin: ${({ theme }) => (theme as StyledTheme).space600} 0 0;
  animation: fadeInReport 0.2s ease;

  @keyframes fadeInReport {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const ReportSectionTitle = styled.h3`
  ${({ theme }) => (theme as StyledTheme).typestyleV2TitleSmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  margin: 0 0 ${({ theme }) => (theme as StyledTheme).space300} 0;
`;

const StarterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => (theme as StyledTheme).space300};
`;

const StarterCard = styled.button`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
  padding: ${({ theme }) => (theme as StyledTheme).space400};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerLg};
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  background: ${({ theme }) => (theme as StyledTheme).colorSurface};
  cursor: pointer;
  text-align: left;
  position: relative;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => (theme as StyledTheme).colorOutline};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  &:hover .starter-arrow {
    opacity: 1;
    transform: translate(0, 0);
  }
`;

/* Header row now carries the title alongside the icon. Title becomes an
   eyebrow — small, muted, scannable — while the prompt sentence below it
   becomes the focal content the user actually reads and edits. */
const StarterHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
  width: 100%;
`;

const StarterIconWrap = styled.div<{ $bg: string }>`
  width: 24px;
  height: 24px;
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerSm};
  background: ${({ $bg }) => $bg};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const StarterPermChip = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelSmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerFull};
  padding: 2px 8px;
  white-space: nowrap;
  margin-left: auto;
`;

const StarterTitle = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  text-transform: uppercase;
  letter-spacing: 0.4px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StarterPrompt = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const StarterArrow = styled.span`
  position: absolute;
  top: ${({ theme }) => (theme as StyledTheme).space300};
  right: ${({ theme }) => (theme as StyledTheme).space300};
  opacity: 0;
  transform: translate(-4px, 4px);
  transition: opacity 0.15s ease, transform 0.15s ease;
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  pointer-events: none;
  background: ${({ theme }) => (theme as StyledTheme).colorSurface};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ReportFormatStrip = styled.div`
  display: flex;
  gap: ${({ theme }) => (theme as StyledTheme).space300};
`;

const ReportFormatCard = styled.button<{ $selected?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
  padding: ${({ theme }) => (theme as StyledTheme).space300} ${({ theme }) => (theme as StyledTheme).space600};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerLg};
  border: 1px solid ${({ $selected, theme }) =>
    $selected ? (theme as StyledTheme).colorPrimary : (theme as StyledTheme).colorOutlineVariant};
  background: ${({ theme }) => (theme as StyledTheme).colorSurface};
  cursor: pointer;
  transition: border-color 0.15s ease;
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelMedium};
  color: ${({ $selected, theme }) =>
    $selected ? (theme as StyledTheme).colorPrimary : (theme as StyledTheme).colorOnSurface};

  &:hover {
    border-color: ${({ theme }) => (theme as StyledTheme).colorOutline};
  }
`;

// ── Automation Mode ──────────────────────────────────────────────────────────

const AUTOMATION_OUTCOMES = [
  { id: 'compliance', label: 'Compliance', icon: Icon.TYPES.SHIELD_OUTLINE },
  { id: 'retention', label: 'Retention', icon: Icon.TYPES.HEART_OUTLINE },
  { id: 'efficiency', label: 'Efficiency', icon: Icon.TYPES.THUNDERBOLT_OUTLINE },
  { id: 'cost', label: 'Cost savings', icon: Icon.TYPES.DOLLAR_CIRCLE_OUTLINE },
];

const AUTOMATION_STARTERS: Starter[] = [
  {
    id: 'auto-pay-run-failure',
    title: 'Pay run failure alerts',
    prompt: 'Alert admins when a pay run auto-approval fails so payroll delays are caught immediately.',
    icon: Icon.TYPES.DOLLAR_CIRCLE_OUTLINE,
    color: '#7B3E00',
    outcomes: ['compliance'],
    permission: 'Needs admin',
  },
  {
    id: 'auto-country-change',
    title: 'Country change review',
    prompt: 'Alert admins when an employee changes countries so compliance reviews start right away.',
    icon: Icon.TYPES.DOLLAR_CIRCLE_OUTLINE,
    color: '#7B3E00',
    outcomes: ['compliance'],
  },
  {
    id: 'auto-long-leave',
    title: 'Long-leave review',
    prompt: 'Alert managers when a direct report requests extended leave so reviews happen on time.',
    icon: Icon.TYPES.PEO_OUTLINE,
    color: '#005A3A',
    outcomes: ['compliance'],
  },
  {
    id: 'auto-tenure-milestone',
    title: 'Tenure milestones',
    prompt: 'Assign a task to managers when an employee hits a tenure milestone to trigger a salary review.',
    icon: Icon.TYPES.DOLLAR_CIRCLE_OUTLINE,
    color: '#7B3E00',
    outcomes: ['retention'],
  },
  {
    id: 'auto-new-hire-lunch',
    title: 'New-hire lunch',
    prompt: 'Assign a task to managers to take their new hire to lunch on their first day.',
    icon: Icon.TYPES.PEO_OUTLINE,
    color: '#005A3A',
    outcomes: ['retention'],
  },
  {
    id: 'auto-30-60-90',
    title: '30 / 60 / 90 check-ins',
    prompt: 'Send a check-in survey to new hires at 30, 60, and 90 days to catch onboarding friction early.',
    icon: Icon.TYPES.PEO_OUTLINE,
    color: '#005A3A',
    outcomes: ['retention'],
  },
  {
    id: 'auto-onboarding',
    title: 'Onboarding autopilot',
    prompt: 'Auto-assign onboarding tasks when a new hire\u2019s start date is confirmed.',
    icon: Icon.TYPES.PEO_OUTLINE,
    color: '#005A3A',
    outcomes: ['efficiency'],
  },
  {
    id: 'auto-expense-routing',
    title: 'Expense routing',
    prompt: 'Route expenses over $500 to finance and under $500 to direct managers for fast approvals.',
    icon: Icon.TYPES.DOLLAR_CIRCLE_OUTLINE,
    color: '#7B3E00',
    outcomes: ['efficiency'],
  },
  {
    id: 'auto-app-provisioning',
    title: 'Day-one app access',
    prompt: 'Auto-provision app access based on department and role so new hires have the right tools on day one.',
    icon: Icon.TYPES.PEO_OUTLINE,
    color: '#005A3A',
    outcomes: ['efficiency'],
  },
  {
    id: 'auto-sign-on-bonus',
    title: 'Sign-on bonus recovery',
    prompt: 'Alert when an employee forfeits their sign-on bonus by leaving before the bonus period ends.',
    icon: Icon.TYPES.PEO_OUTLINE,
    color: '#005A3A',
    outcomes: ['cost'],
    permission: 'Needs admin',
  },
  {
    id: 'auto-duplicate-expenses',
    title: 'Duplicate expense flags',
    prompt: 'Flag duplicate expense submissions across employees before reimbursements are paid out.',
    icon: Icon.TYPES.DOLLAR_CIRCLE_OUTLINE,
    color: '#7B3E00',
    outcomes: ['cost'],
  },
  {
    id: 'auto-saas-licenses',
    title: 'Unused SaaS licenses',
    prompt: 'Notify admins when unused software licenses exceed a threshold so IT can reclaim spend.',
    icon: Icon.TYPES.PEO_OUTLINE,
    color: '#005A3A',
    outcomes: ['cost'],
  },
];

// ── Company Feed ─────────────────────────────────────────────────────────────

const CompanyPulseWrap = styled.div`
  position: fixed;
  bottom: ${({ theme }) => (theme as StyledTheme).space600};
  right: ${({ theme }) => (theme as StyledTheme).space600};
  z-index: 50;
`;

const PulseSection = styled.div`
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space600};

  &:last-child {
    margin-bottom: 0;
  }
`;

const PulseSectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space300};
`;

const PulseSectionTitle = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const PulseSectionCount = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
`;

const PulseRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space300};
  padding: ${({ theme }) => (theme as StyledTheme).space200} 0;
`;

const PulseAvatar = styled.div<{ $bg?: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ $bg, theme }) => $bg || (theme as StyledTheme).colorSurfaceDim};
  display: grid;
  place-items: center;
  flex-shrink: 0;
  overflow: hidden;
  font-size: 13px;
  font-weight: 600;
  color: white;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const PulseRowBody = styled.div`
  flex: 1;
  min-width: 0;
`;

const PulseRowName = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
`;

const PulseRowMeta = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodySmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
`;

const PulseViewAll = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodySmall};
  color: ${({ theme }) => (theme as StyledTheme).colorPrimary};

  &:hover {
    text-decoration: underline;
  }
`;

const PulseCarousel = styled.div`
  display: flex;
  gap: ${({ theme }) => (theme as StyledTheme).space300};
  overflow-x: auto;
  padding-bottom: ${({ theme }) => (theme as StyledTheme).space100};
  margin: 0 -${({ theme }) => (theme as StyledTheme).space900} ${({ theme }) => (theme as StyledTheme).space600};
  padding-left: ${({ theme }) => (theme as StyledTheme).space900};
  padding-right: ${({ theme }) => (theme as StyledTheme).space900};
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const PulseCategoryCard = styled.div`
  flex-shrink: 0;
  width: 280px;
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCorner2xl};
  padding: ${({ theme }) => (theme as StyledTheme).space400};
  display: flex;
  flex-direction: column;
`;

const PulseCategoryHeader = styled.div`
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space400};
`;

const PulseCategoryRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space300};
  padding: ${({ theme }) => (theme as StyledTheme).space150} 0;
`;

const PulseCategoryRowBody = styled.div`
  flex: 1;
  min-width: 0;
`;

const PulseCategoryRowName = styled.div`
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelLarge};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PulseCategoryRowMeta = styled.div`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodySmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
`;

const PulseCategoryViewAll = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => (theme as StyledTheme).space100};
  background: none;
  border: none;
  padding: ${({ theme }) => (theme as StyledTheme).space200} 0 0;
  margin-top: auto;
  cursor: pointer;
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodySmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};

  &:hover {
    color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  }
`;

const PulseDivider = styled.div`
  height: 1px;
  background: ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  margin: ${({ theme }) => (theme as StyledTheme).space400} 0;
`;

const PulsePostBox = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space300};
  padding: ${({ theme }) => (theme as StyledTheme).space300};
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerLg};
  cursor: text;
`;

const PulsePostPlaceholder = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  flex: 1;
`;

const PulsePost = styled.div`
  padding: ${({ theme }) => (theme as StyledTheme).space400} 0;
  border-bottom: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};

  &:last-child {
    border-bottom: none;
  }
`;

const PulsePostHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space300};
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space200};
`;

const PulsePostAuthor = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelLarge};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
`;

const PulsePostTime = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodySmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
`;

const PulsePostBody = styled.div`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  line-height: 1.5;
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space200};
`;

const PulsePostActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space400};
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodySmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
`;

const PulsePostAction = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space100};
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodySmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};

  &:hover {
    color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  }
`;

// ── Helpers ─────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'this morning';
  if (h < 17) return 'this afternoon';
  return 'this evening';
}

// ── Component ───────────────────────────────────────────────────────────────

// ── Isolated Prompt (own state = no full-page re-render on keystroke) ────────

const HomePrompt = React.memo(({ onSubmit, reportMode, onClearReport, automationMode, onClearAutomation, promptSeed }: { onSubmit?: () => void; reportMode?: boolean; onClearReport?: () => void; automationMode?: boolean; onClearAutomation?: () => void; promptSeed?: { value: string; nonce: number } }) => {
  const { theme } = useTheme();
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const promptWrapRef = useRef<HTMLDivElement>(null);
  const [promptValue, setPromptValue] = useState('');
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');

  /* Watch the seed nonce so every starter tap re-seeds the textarea, even
     when the user taps the same card twice after clearing. */
  useEffect(() => {
    if (!promptSeed || promptSeed.nonce === 0) return;
    setPromptValue(promptSeed.value);
    requestAnimationFrame(() => {
      const el = promptRef.current;
      if (!el) return;
      el.focus();
      const end = el.value.length;
      el.setSelectionRange(end, end);
    });
  }, [promptSeed?.nonce]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredMentionEmployees = useMemo(() => {
    if (!mentionQuery) return MENTION_EMPLOYEES;
    return MENTION_EMPLOYEES.filter(e => e.name.toLowerCase().includes(mentionQuery));
  }, [mentionQuery]);

  const filteredMentionDepts = useMemo(() => {
    if (!mentionQuery) return MENTION_DEPARTMENTS;
    return MENTION_DEPARTMENTS.filter(d => d.toLowerCase().includes(mentionQuery));
  }, [mentionQuery]);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setPromptValue(val);
    const cursorPos = e.target.selectionStart ?? val.length;
    const textBeforeCursor = val.slice(0, cursorPos);
    const atMatch = textBeforeCursor.match(/@([^\s]*)$/);
    if (atMatch) {
      setMentionOpen(true);
      setMentionQuery(atMatch[1].toLowerCase());
    } else {
      setMentionOpen(false);
      setMentionQuery('');
    }
  };

  const handleMentionSelect = (name: string) => {
    const cursorPos = promptRef.current?.selectionStart ?? promptValue.length;
    const textBeforeCursor = promptValue.slice(0, cursorPos);
    const atIdx = textBeforeCursor.lastIndexOf('@');
    const before = promptValue.slice(0, atIdx);
    const after = promptValue.slice(cursorPos);
    setPromptValue(`${before}@${name} ${after}`);
    setMentionOpen(false);
    setMentionQuery('');
    promptRef.current?.focus();
  };

  return (
    <PromptWrap ref={promptWrapRef}>
      <PromptCard onClick={() => promptRef.current?.focus()}>
        <PromptInputRow>
          <PromptInput
            ref={promptRef}
            id="home-prompt"
            placeholder="Ask, make, or search anything..."
            rows={1}
            value={promptValue}
            onChange={handlePromptChange}
          />
        </PromptInputRow>
        <PromptActions>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Button
              appearance={Button.APPEARANCES.OUTLINE}
              size={Button.SIZES.S}
              onClick={(e: React.MouseEvent) => { e.stopPropagation(); }}
            >
              Pro
              <Icon type={Icon.TYPES.CHEVRON_DOWN} size={14} color="currentColor" />
            </Button>
            {reportMode && (
              <ReportChip onClick={(e: React.MouseEvent) => { e.stopPropagation(); onClearReport?.(); }}>
                <Icon type={Icon.TYPES.BAR_CHART_OUTLINE} size={14} color={(theme as any).colorPrimary} />
                Report
                <Icon type={Icon.TYPES.CLOSE} size={12} color={(theme as any).colorOnSurfaceVariant} />
              </ReportChip>
            )}
            {automationMode && (
              <ReportChip onClick={(e: React.MouseEvent) => { e.stopPropagation(); onClearAutomation?.(); }}>
                <Icon type={Icon.TYPES.THUNDERBOLT_OUTLINE} size={14} color={(theme as any).colorPrimary} />
                Automation
                <Icon type={Icon.TYPES.CLOSE} size={12} color={(theme as any).colorOnSurfaceVariant} />
              </ReportChip>
            )}
          </div>
          <PromptActionsRight>
            <Button.Icon
              icon={Icon.TYPES.ARROW_UP}
              aria-label="Submit"
              appearance={Button.APPEARANCES.PRIMARY}
              size={Button.SIZES.S}
              isDisabled={!promptValue.trim()}
              onClick={(e: React.MouseEvent) => { e.stopPropagation(); onSubmit?.(); }}
            />
          </PromptActionsRight>
        </PromptActions>
      </PromptCard>
      <MentionDropdown $visible={mentionOpen}>
        {!mentionQuery && (
          <>
            <MentionSectionHeader>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon type={Icon.TYPES.TIME_OUTLINE} size={14} color="currentColor" /> Recently used
              </span>
            </MentionSectionHeader>
            {MENTION_RECENTLY_USED.map(item => (
              <MentionRow key={item.name} onClick={() => handleMentionSelect(item.name)}>
                <MentionName>{item.name}</MentionName>
                <MentionMeta>{item.meta}</MentionMeta>
              </MentionRow>
            ))}
            <MentionDivider />
          </>
        )}
        {filteredMentionEmployees.length > 0 && (
          <>
            <MentionSectionHeader>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon type={Icon.TYPES.MY_ACCOUNT_SETTINGS_OUTLINE} size={14} color="currentColor" /> Employees
              </span>
              <MentionSectionChevron>
                <Icon type={Icon.TYPES.CHEVRON_RIGHT} size={14} color="currentColor" />
              </MentionSectionChevron>
            </MentionSectionHeader>
            {filteredMentionEmployees.map(emp => (
              <MentionRow key={emp.name} onClick={() => handleMentionSelect(emp.name)}>
                <MentionAvatar src={emp.avatar} alt={emp.name} />
                <MentionName>{emp.name}</MentionName>
                <MentionMeta>{emp.dept}</MentionMeta>
              </MentionRow>
            ))}
            <MentionMoreLink>5 more</MentionMoreLink>
            <MentionDivider />
          </>
        )}
        {filteredMentionDepts.length > 0 && (
          <>
            <MentionSectionHeader>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon type={Icon.TYPES.HIERARCHY_HORIZONTAL_OUTLINE} size={14} color="currentColor" /> Departments
              </span>
              <MentionSectionChevron>
                <Icon type={Icon.TYPES.CHEVRON_RIGHT} size={14} color="currentColor" />
              </MentionSectionChevron>
            </MentionSectionHeader>
            {filteredMentionDepts.map(dept => (
              <MentionRow key={dept} onClick={() => handleMentionSelect(dept)}>
                <MentionName>{dept}</MentionName>
              </MentionRow>
            ))}
          </>
        )}
        <MentionDivider />
        <MentionAtSymbol>@</MentionAtSymbol>
      </MentionDropdown>
    </PromptWrap>
  );
});

const DesktopHomeB: React.FC = () => {
  const { theme } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'used' | 'alpha'>('recent');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [cardMenu, setCardMenu] = useState<string | null>(null);
  const [recentCardSort, setRecentCardSort] = useState<'recent' | 'visited'>('recent');
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [qaDrawerOpen, setQaDrawerOpen] = useState(false);
  const [qaSearch, setQaSearch] = useState('');
  const [qaSortBy, setQaSortBy] = useState<'recent' | 'used' | 'alpha'>('recent');
  const [qaSortMenuOpen, setQaSortMenuOpen] = useState(false);
  const [userIdx, setUserIdx] = useState(
    SAMPLE_USERS.findIndex(u => u.persona === 'executive_owner'),
  );
  const [personaHudOpen, setPersonaHudOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState(0);
  const [starredExpanded, setStarredExpanded] = useState(false);
  const [appsExpanded, setAppsExpanded] = useState(false);
  /* Navigation always resolves to an active destination. 'new-chat' is the
     default landing spot inside the Home tab so the sidebar is never in an
     "orphaned" state with nothing selected. */
  const [activeRowId, setActiveRowId] = useState<string>('new-chat');

  const [customShortcuts, setCustomShortcuts] = useState<CustomShortcut[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createUrl, setCreateUrl] = useState('');
  const [createName, setCreateName] = useState('');
  const [createUrlError, setCreateUrlError] = useState('');
  const [createUrlTouched, setCreateUrlTouched] = useState(false);
  const [pulseDrawerOpen, setPulseDrawerOpen] = useState(false);
  const [dismissedRecents, setDismissedRecents] = useState<Set<string>>(new Set());
  const [reportMode, setReportMode] = useState(false);
  const [reportFormat, setReportFormat] = useState('grid');
  const [automationMode, setAutomationMode] = useState(false);
  const [automationOutcome, setAutomationOutcome] = useState('compliance');
  /* Prompt seeding. A nonce bumps on every tap so the same starter can reseed
     the input if the user clears and retries. HomePrompt watches the nonce
     via useEffect and syncs its internal textarea value. */
  const [promptSeed, setPromptSeed] = useState<{ value: string; nonce: number }>({ value: '', nonce: 0 });
  const seedPrompt = useCallback((value: string) => {
    setPromptSeed(prev => ({ value, nonce: prev.nonce + 1 }));
  }, []);

  const user = SAMPLE_USERS[userIdx];
  const enabledApps = useMemo(() => new Set(user.enabledApps ?? []), [user.enabledApps]);
  const skuFlags = enabledAppsToSkuFlags(enabledApps);
  const { actions: quickActions, all: allQuickActionsRaw } = getQuickActions({
    persona: user.persona,
    skuFlags,
    onboarding: user.onboarding ?? false,
    maxCount: 4,
  });

  const [qaFavorites, setQaFavorites] = useState<Set<string>>(() => new Set(quickActions.map(a => a.id)));
  useEffect(() => {
    setQaFavorites(new Set(quickActions.map(a => a.id)));
  }, [user.persona]);

  const handleOpenCreateModal = () => {
    setCreateUrl('');
    setCreateName('');
    setCreateUrlError('');
    setCreateUrlTouched(false);
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleCreateUrlBlur = () => {
    setCreateUrlTouched(true);
    if (createUrl.trim() && !isValidRipplingUrl(createUrl)) {
      setCreateUrlError('Only Rippling URLs are supported');
    } else {
      setCreateUrlError('');
    }
  };

  const handleCreateUrlChange = (val: string) => {
    setCreateUrl(val);
    if (createUrlTouched) {
      if (val.trim() && !isValidRipplingUrl(val)) {
        setCreateUrlError('Only Rippling URLs are supported');
      } else {
        setCreateUrlError('');
      }
    }
  };

  const isCreateFormValid = createName.trim().length > 0 && createUrl.trim().length > 0 && isValidRipplingUrl(createUrl);

  const handleSaveShortcut = () => {
    if (!isCreateFormValid) return;
    const id = `custom_${Date.now()}`;
    const newShortcut: CustomShortcut = { id, label: createName.trim(), url: createUrl.trim() };
    setCustomShortcuts(prev => [...prev, newShortcut]);
    setQaFavorites(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setShowCreateModal(false);
  };

  const filteredApps = useMemo(() => {
    let apps = [...ALL_SSO_APPS];
    if (search.trim()) {
      const q = search.toLowerCase();
      apps = apps.filter(
        a => a.name.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q),
      );
    }
    if (sortBy === 'alpha') {
      apps.sort((a, b) => a.name.localeCompare(b.name));
    }
    return apps;
  }, [search, sortBy]);

  const filteredQA = useMemo(() => {
    let actions = [...allQuickActionsRaw];
    if (qaSearch.trim()) {
      const q = qaSearch.toLowerCase();
      actions = actions.filter(a => a.label.toLowerCase().includes(q));
    }
    if (qaSortBy === 'alpha') {
      actions.sort((a, b) => a.label.localeCompare(b.label));
    }
    return actions;
  }, [allQuickActionsRaw, qaSearch, qaSortBy]);

  const filteredCustomQA = useMemo(() => {
    let shortcuts = [...customShortcuts];
    if (qaSearch.trim()) {
      const q = qaSearch.toLowerCase();
      shortcuts = shortcuts.filter(s => s.label.toLowerCase().includes(q));
    }
    if (qaSortBy === 'alpha') {
      shortcuts.sort((a, b) => a.label.localeCompare(b.label));
    }
    return shortcuts;
  }, [customShortcuts, qaSearch, qaSortBy]);

  /* Starred — flattened from qaFavorites (quick actions + custom shortcuts
     the user has pinned). Shown at the very top so it acts like Notion's
     Favorites. Capped with inline expansion. */
  const starredItems = useMemo(() => {
    const fromActions = allQuickActionsRaw
      .filter(a => qaFavorites.has(a.id))
      .map(a => ({
        id: a.id,
        label: a.label,
        icon: QUICK_ACTION_ICONS[a.id] || Icon.TYPES.LINK_OUTLET,
      }));
    const fromCustom = customShortcuts
      .filter(s => qaFavorites.has(s.id))
      .map(s => ({
        id: s.id,
        label: s.label,
        icon: Icon.TYPES.LINK_OUTLET,
      }));
    return [...fromActions, ...fromCustom];
  }, [allQuickActionsRaw, customShortcuts, qaFavorites]);

  const STARRED_CAP = 5;
  const visibleStarred = starredExpanded
    ? starredItems
    : starredItems.slice(0, STARRED_CAP);
  const starredOverflow = Math.max(0, starredItems.length - STARRED_CAP);

  /* Recents — pulled into the sidebar from the existing data source used
     by the hub, filtered by dismissals. Capped at 3–5 rows; link opens a
     fuller activity view. */
  const visibleRecents = RECENT_ITEMS.filter(
    item => !dismissedRecents.has(item.name),
  ).slice(0, 5);

  /* Apps — flat list of core app areas. Top 5 are surfaced directly; the
     rest are accessed via "More". For the prototype we use a role-
     default ordering; the long-term model is hybrid (user-pinned >
     attention-promoted > role-default). Org Chart is treated like a
     core app here so it stops floating above the main list. */
  type AppRow = { id: string; label: string; icon: string; badge?: number };
  const allApps: AppRow[] = useMemo(
    () => [
      { id: 'payroll', label: 'Payroll', icon: Icon.TYPES.DOLLAR_CIRCLE_OUTLINE, badge: 3 },
      { id: 'finance', label: 'Finance', icon: Icon.TYPES.CREDIT_CARD_OUTLINE },
      { id: 'benefits', label: 'Benefits', icon: Icon.TYPES.HEART_OUTLINE },
      { id: 'time', label: 'Time', icon: Icon.TYPES.TIME_OUTLINE },
      { id: 'org-chart', label: 'Org Chart', icon: Icon.TYPES.HIERARCHY_HORIZONTAL_OUTLINE },
      { id: 'talent', label: 'Talent', icon: Icon.TYPES.TALENT_OUTLINE },
      { id: 'it', label: 'IT', icon: Icon.TYPES.LAPTOP_OUTLINE },
      { id: 'data', label: 'Data', icon: Icon.TYPES.BAR_CHART_OUTLINE },
      { id: 'custom-apps', label: 'Custom Apps', icon: Icon.TYPES.CUSTOM_APPS_OUTLINE },
    ],
    [],
  );

  const APPS_CAP = 5;
  const visibleApps = appsExpanded ? allApps : allApps.slice(0, APPS_CAP);
  const hiddenAppsCount = Math.max(0, allApps.length - APPS_CAP);

  return (
    <AppShellLayout
      hidePageHeader
      fullBleedContent
      defaultSidebarExpanded
      sidebarExpandedWidth={340}
      hideSidebarDividers
      sidebarTopSlot={
        <>
          <SidebarTopBlock>
            <Tabs.LINK
              stretchH
              activeIndex={sidebarTab}
              onChange={(idx: number | string) => setSidebarTab(Number(idx))}
            >
            <Tabs.Tab title="Home" icon={Icon.TYPES.HOME_OUTLINE} />
            <Tabs.Tab title="Chats" icon={Icon.TYPES.FX_OUTLINE} />
            <Tabs.Tab title="Inbox" icon={Icon.TYPES.INBOX_OUTLINE} />
            </Tabs.LINK>
          </SidebarTopBlock>
          <SidebarBody>
            {/* Default destination — always selected on first load so the
                sidebar never renders with no active item. */}
            <SidebarSection>
              <SidebarRow
                type="button"
                $active={activeRowId === 'new-chat'}
                onClick={() => setActiveRowId('new-chat')}
              >
                <SidebarRowIcon>
                  <Icon type={Icon.TYPES.EDIT_OUTLINE} size={20} color={theme.colorOnSurface} />
                </SidebarRowIcon>
                <SidebarRowText>New chat</SidebarRowText>
              </SidebarRow>
            </SidebarSection>

            {starredItems.length > 0 && (
              <SidebarSection>
                <SidebarSectionHeading>Starred</SidebarSectionHeading>
                {visibleStarred.map(item => {
                  const rowId = `starred:${item.id}`;
                  return (
                    <SidebarRow
                      key={item.id}
                      type="button"
                      $active={activeRowId === rowId}
                      onClick={() => setActiveRowId(rowId)}
                    >
                      <SidebarRowIcon>
                        <Icon type={item.icon} size={20} color={theme.colorOnSurface} />
                      </SidebarRowIcon>
                      <SidebarRowText>{item.label}</SidebarRowText>
                    </SidebarRow>
                  );
                })}
                {starredOverflow > 0 && (
                  <SidebarInlineLink
                    type="button"
                    onClick={() => setStarredExpanded(prev => !prev)}
                  >
                    {starredExpanded
                      ? 'Show less'
                      : `Show ${starredOverflow} more`}
                  </SidebarInlineLink>
                )}
              </SidebarSection>
            )}

            {visibleRecents.length > 0 && (
              <SidebarSection>
                <SidebarSectionHeading>Recents</SidebarSectionHeading>
                {visibleRecents.map(item => {
                  const rowId = `recent:${item.name}`;
                  return (
                    <SidebarRow
                      key={item.name}
                      type="button"
                      $active={activeRowId === rowId}
                      onClick={() => setActiveRowId(rowId)}
                    >
                      <SidebarRowText>
                        {item.name}
                        {item.context && (
                          <SidebarRowMuted> in {item.context}</SidebarRowMuted>
                        )}
                      </SidebarRowText>
                    </SidebarRow>
                  );
                })}
              </SidebarSection>
            )}

            <SidebarSection>
              <SidebarSectionHeading>Apps</SidebarSectionHeading>
              {visibleApps.map(app => {
                const rowId = `app:${app.id}`;
                return (
                  <SidebarRow
                    key={app.id}
                    type="button"
                    $active={activeRowId === rowId}
                    onClick={() => setActiveRowId(rowId)}
                  >
                    <SidebarRowIcon>
                      <Icon type={app.icon} size={20} color={theme.colorOnSurface} />
                    </SidebarRowIcon>
                    <SidebarRowText>{app.label}</SidebarRowText>
                    {app.badge && (
                      <SidebarRowBadge>{app.badge}</SidebarRowBadge>
                    )}
                  </SidebarRow>
                );
              })}
              {hiddenAppsCount > 0 && (
                <SidebarRow
                  type="button"
                  onClick={() => setAppsExpanded(prev => !prev)}
                >
                  <SidebarRowIcon>
                    <Icon
                      type={
                        appsExpanded
                          ? Icon.TYPES.CHEVRON_UP
                          : Icon.TYPES.MORE_HORIZONTAL
                      }
                      size={20}
                      color={theme.colorOnSurfaceVariant}
                    />
                  </SidebarRowIcon>
                  <SidebarRowText>
                    <SidebarRowMuted>
                      {appsExpanded ? 'Show less' : `More (${hiddenAppsCount})`}
                    </SidebarRowMuted>
                  </SidebarRowText>
                </SidebarRow>
              )}
            </SidebarSection>

            <SidebarFooterGroup>
              <SidebarRow
                type="button"
                $active={activeRowId === 'settings'}
                onClick={() => setActiveRowId('settings')}
              >
                <SidebarRowIcon>
                  <Icon type={Icon.TYPES.SETTINGS_OUTLINE} size={20} color={theme.colorOnSurface} />
                </SidebarRowIcon>
                <SidebarRowText>Settings</SidebarRowText>
              </SidebarRow>
              <SidebarRow
                type="button"
                $active={activeRowId === 'app-shop'}
                onClick={() => setActiveRowId('app-shop')}
              >
                <SidebarRowIcon>
                  <Icon type={Icon.TYPES.INTEGRATED_APPS_OUTLINE} size={20} color={theme.colorOnSurface} />
                </SidebarRowIcon>
                <SidebarRowText>App Shop</SidebarRowText>
              </SidebarRow>
              <SidebarRow
                type="button"
                $active={activeRowId === 'help'}
                onClick={() => setActiveRowId('help')}
              >
                <SidebarRowIcon>
                  <Icon type={Icon.TYPES.QUESTION_CIRCLE_OUTLINE} size={20} color={theme.colorOnSurface} />
                </SidebarRowIcon>
                <SidebarRowText>Help</SidebarRowText>
              </SidebarRow>
            </SidebarFooterGroup>
          </SidebarBody>
        </>
      }
      mainNavSections={[]}
      companyName={user.company}
      userInitial={user.name.charAt(0)}
      showNotificationBadge
      notificationCount={2}
      onPersonaSelect={() => setPersonaHudOpen(prev => !prev)}
      personaLabel={PERSONA_OPTIONS.find(p => p.id === user.persona)?.label}
    >
      <PageGradient>
      <SSOStrip>
        <SSOLabel>Quick sign-in</SSOLabel>
        <SSODivider />
        {PINNED_APPS.map(app => (
          <SSOItemWrap key={app.name}>
            <SSOItem>
              <SSOIcon><img src={app.icon} alt={app.name} /></SSOIcon>
              {app.name}
            </SSOItem>
            <SSOHoverCard>
              <SSOHoverIcon><img src={app.icon} alt={app.name} /></SSOHoverIcon>
              <SSOHoverBody>
                <SSOHoverName>{app.name}</SSOHoverName>
                <SSOHoverDesc>{app.desc}</SSOHoverDesc>
              </SSOHoverBody>
            </SSOHoverCard>
          </SSOItemWrap>
        ))}
        <SSOMoreWrap onClick={() => setDrawerOpen(true)}>
          <SSOIcon>
            <Icon type={Icon.TYPES.LIST_OUTLINE} size={16} color="currentColor" />
          </SSOIcon>
          +{OVERFLOW_COUNT} more
        </SSOMoreWrap>
      </SSOStrip>

      <Drawer
        isVisible={drawerOpen}
        onCancel={() => { setDrawerOpen(false); setSearch(''); setSortMenuOpen(false); }}
        title="Quick sign-in"
        width={520}
        overlayClassName={compactDrawerClass}
      >
        <DrawerToolbar>
          <DrawerSearchInput>
            <Icon type={Icon.TYPES.SEARCH_OUTLINE} size={16} color={(theme as any).colorOnSurfaceVariant} />
            <input
              placeholder="Search for apps..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </DrawerSearchInput>
          <SortWrap>
            <Button.Icon
              icon={Icon.TYPES.FILTER}
              aria-label="Sort"
              appearance={Button.APPEARANCES.GHOST}
              size={Button.SIZES.S}
              onClick={() => setSortMenuOpen(prev => !prev)}
            />
            {sortMenuOpen && (
              <SortMenu>
                <SortMenuLabel>Sort by</SortMenuLabel>
                {([['recent', 'Most recent'], ['used', 'Most used'], ['alpha', 'Alphabetical']] as const).map(([key, label]) => (
                  <SortMenuItem
                    key={key}
                    $active={sortBy === key}
                    onClick={() => { setSortBy(key); setSortMenuOpen(false); }}
                  >
                    {label}
                  </SortMenuItem>
                ))}
              </SortMenu>
            )}
          </SortWrap>
        </DrawerToolbar>

        {filteredApps.length > 0 ? (
          <DrawerList>
            {filteredApps.map(app => (
              <DrawerAppRow key={app.name}>
                <DrawerAppIcon><img src={app.icon} alt={app.name} /></DrawerAppIcon>
                <DrawerAppBody>
                  <DrawerAppName>{app.name}</DrawerAppName>
                  <DrawerAppDesc>{app.desc}</DrawerAppDesc>
                </DrawerAppBody>
              </DrawerAppRow>
            ))}
          </DrawerList>
        ) : (
          <DrawerEmpty>No apps match "{search}"</DrawerEmpty>
        )}
      </Drawer>

      <Drawer
        isVisible={qaDrawerOpen}
        onCancel={() => { setQaDrawerOpen(false); setQaSearch(''); setQaSortMenuOpen(false); }}
        title="Edit shortcuts"
        width={520}
        overlayClassName={compactDrawerClass}
      >
        <DrawerToolbar>
          <DrawerSearchInput>
            <Icon type={Icon.TYPES.SEARCH_OUTLINE} size={16} color={(theme as any).colorOnSurfaceVariant} />
            <input
              placeholder="Search actions..."
              value={qaSearch}
              onChange={e => setQaSearch(e.target.value)}
            />
          </DrawerSearchInput>
          <SortWrap>
            <Button.Icon
              icon={Icon.TYPES.FILTER}
              aria-label="Sort"
              appearance={Button.APPEARANCES.GHOST}
              size={Button.SIZES.S}
              onClick={() => setQaSortMenuOpen(prev => !prev)}
            />
            {qaSortMenuOpen && (
              <SortMenu>
                <SortMenuLabel>Sort by</SortMenuLabel>
                {([['recent', 'Most used'], ['used', 'Suggested'], ['alpha', 'Alphabetical']] as const).map(([key, label]) => (
                  <SortMenuItem
                    key={key}
                    $active={qaSortBy === key}
                    onClick={() => { setQaSortBy(key); setQaSortMenuOpen(false); }}
                  >
                    {label}
                  </SortMenuItem>
                ))}
              </SortMenu>
            )}
          </SortWrap>
        </DrawerToolbar>
        <CreateShortcutLink onClick={handleOpenCreateModal}>+ Custom shortcut</CreateShortcutLink>

        {(filteredQA.length > 0 || filteredCustomQA.length > 0) ? (
          <DrawerList>
            {filteredCustomQA.map(shortcut => {
              const isFav = qaFavorites.has(shortcut.id);
              return (
                <DrawerAppRow key={shortcut.id}>
                  <DrawerAppIcon style={{ background: (theme as any).colorSurfaceDim }}>
                    <Icon type={Icon.TYPES.LINK_OUTLET} size={16} color={(theme as any).colorOnSurface} />
                  </DrawerAppIcon>
                  <DrawerAppBody>
                    <DrawerAppName>{shortcut.label}</DrawerAppName>
                    <DrawerAppDesc>Custom</DrawerAppDesc>
                  </DrawerAppBody>
                  <Button.Icon
                    icon={Icon.TYPES.TRASH_OUTLINE}
                    aria-label="Delete shortcut"
                    tip="Delete shortcut"
                    appearance={Button.APPEARANCES.GHOST}
                    size={Button.SIZES.XS}
                    onClick={() => {
                      setCustomShortcuts(prev => prev.filter(s => s.id !== shortcut.id));
                      setQaFavorites(prev => {
                        const next = new Set(prev);
                        next.delete(shortcut.id);
                        return next;
                      });
                    }}
                  />
                  <Button.Icon
                    icon={isFav ? Icon.TYPES.STAR_FILLED : Icon.TYPES.STAR_OUTLINE}
                    aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    tip={isFav ? 'Remove from home' : 'Pin to home'}
                    appearance={Button.APPEARANCES.GHOST}
                    size={Button.SIZES.XS}
                    onClick={() => {
                      setQaFavorites(prev => {
                        const next = new Set(prev);
                        if (next.has(shortcut.id)) next.delete(shortcut.id); else next.add(shortcut.id);
                        return next;
                      });
                    }}
                  />
                </DrawerAppRow>
              );
            })}
            {filteredQA.map(action => {
              const isFav = qaFavorites.has(action.id);
              return (
                <DrawerAppRow key={action.id}>
                  <DrawerAppIcon style={{ background: (theme as any).colorSurfaceDim }}>
                    <Icon type={QUICK_ACTION_ICONS[action.id] || Icon.TYPES.LINK_OUTLET} size={16} color={(theme as any).colorOnSurface} />
                  </DrawerAppIcon>
                  <DrawerAppBody>
                    <DrawerAppName>{action.label}</DrawerAppName>
                    <DrawerAppDesc>{action.product}</DrawerAppDesc>
                  </DrawerAppBody>
                  <Button.Icon
                    icon={isFav ? Icon.TYPES.STAR_FILLED : Icon.TYPES.STAR_OUTLINE}
                    aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    tip={isFav ? 'Remove from home' : 'Pin to home'}
                    appearance={Button.APPEARANCES.GHOST}
                    size={Button.SIZES.XS}
                    onClick={() => {
                      setQaFavorites(prev => {
                        const next = new Set(prev);
                        if (next.has(action.id)) next.delete(action.id); else next.add(action.id);
                        return next;
                      });
                    }}
                  />
                </DrawerAppRow>
              );
            })}
          </DrawerList>
        ) : (
          <DrawerEmpty>No actions match &ldquo;{qaSearch}&rdquo;</DrawerEmpty>
        )}
      </Drawer>

      <Modal
        isVisible={showCreateModal}
        onCancel={handleCloseCreateModal}
        title="Create a custom shortcut"
        width={480}
        shouldCloseOnBackdropClick
        theme={Modal.THEMES.NO_PADDING}
      >
        <CreateModalBody>
          <CreateModalField>
            <CreateModalFieldLabel>Rippling URL</CreateModalFieldLabel>
            <Input.Text
              value={createUrl}
              onChange={(e: any) => handleCreateUrlChange(e?.target?.value ?? e)}
              onBlur={handleCreateUrlBlur}
              placeholder="https://app.rippling.com/..."
              size={Input.Text.SIZES.M}
              autoFocus
            />
            {createUrlError && <CreateModalError>{createUrlError}</CreateModalError>}
          </CreateModalField>
          <CreateModalField>
            <CreateModalFieldLabel>Shortcut name</CreateModalFieldLabel>
            <Input.Text
              value={createName}
              onChange={(e: any) => setCreateName(e?.target?.value ?? e)}
              placeholder="e.g. Run Payroll"
              size={Input.Text.SIZES.M}
            />
          </CreateModalField>
        </CreateModalBody>
        <Modal.Footer>
          <Button
            appearance={Button.APPEARANCES.OUTLINE}
            onClick={handleCloseCreateModal}
            size={Button.SIZES.M}
          >
            Cancel
          </Button>
          <Button
            appearance={Button.APPEARANCES.PRIMARY}
            onClick={handleSaveShortcut}
            size={Button.SIZES.M}
            isDisabled={!isCreateFormValid}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      <Drawer
        isVisible={aiModalOpen}
        onCancel={() => setAiModalOpen(false)}
        title="Resolve with AI"
        width={480}
      >
        <AiModalBody>
          <AiModalIcon>
            <img src={RipplingAiSpark} alt="" width={20} height={20} />
            This would open the AI side panel
          </AiModalIcon>
          <AiModalText>
            I asked our Rippling AI how it could help with its current capabilities and here's what it said:
          </AiModalText>
          <AiModalText>
            "Rippling AI can help users batch and resolve work from a task list by grouping items, prioritizing what needs attention, summarizing each request, and taking action when the underlying flow supports it. For actionable items like approvals and supported write flows, it can often help users complete the action directly, while for other tasks it can open the right workflow, explain the next step, and guide the user through completion. 'Resolve with AI' could turn a mixed inbox into a prioritized queue with the right mix of batch actions, decision support, and navigation, all within the user's existing permissions."
          </AiModalText>
        </AiModalBody>
      </Drawer>

      {personaHudOpen && (
        <>
          <PersonaHudBackdrop onClick={() => setPersonaHudOpen(false)} />
          <PersonaHud $visible>
            <PersonaHudHeader>
              <PersonaHudLabel>Viewing as</PersonaHudLabel>
              <PersonaHudDismiss onClick={() => setPersonaHudOpen(false)}>×</PersonaHudDismiss>
            </PersonaHudHeader>
            <PersonaHudSelect
              value={userIdx}
              onChange={e => { setUserIdx(Number(e.target.value)); setPersonaHudOpen(false); }}
            >
              {SAMPLE_USERS.map((u, i) => {
                const pl = PERSONA_OPTIONS.find(p => p.id === u.persona)?.label ?? '';
                return <option key={u.id} value={i}>{u.name} — {pl}</option>;
              })}
            </PersonaHudSelect>
          </PersonaHud>
        </>
      )}

      <HomeContent>
        <PromptHeading>What are you working on {getGreeting()}?</PromptHeading>
        <HomePrompt
          reportMode={reportMode}
          onClearReport={() => setReportMode(false)}
          automationMode={automationMode}
          onClearAutomation={() => setAutomationMode(false)}
          promptSeed={promptSeed}
        />

        {reportMode ? (
          <>
            {/* Scope picker first. The format constrains what a good starter
                looks like, so we pick that before offering suggestions. */}
            <ReportSection>
              <ReportSectionTitle>Choose output format</ReportSectionTitle>
              <ReportFormatStrip>
                {REPORT_OUTPUT_FORMATS.map(fmt => (
                  <ReportFormatCard
                    key={fmt.id}
                    $selected={reportFormat === fmt.id}
                    onClick={() => setReportFormat(fmt.id)}
                  >
                    <Icon type={fmt.icon} size={20} color="currentColor" />
                    {fmt.label}
                  </ReportFormatCard>
                ))}
              </ReportFormatStrip>
            </ReportSection>

            {/* Unified Starters shelf. Starters that fit the selected format
                float to the top; the rest stay as discovery. */}
            <ReportSection>
              <ReportSectionTitle>
                Starters for {REPORT_OUTPUT_FORMATS.find(f => f.id === reportFormat)?.label ?? 'this report'}
              </ReportSectionTitle>
              <StarterGrid>
                {[...REPORT_STARTERS]
                  .sort((a, b) => {
                    const aMatch = a.formats?.includes(reportFormat) ? 0 : 1;
                    const bMatch = b.formats?.includes(reportFormat) ? 0 : 1;
                    return aMatch - bMatch;
                  })
                  .map(s => (
                    <StarterCard key={s.id} onClick={() => seedPrompt(s.prompt)}>
                      <StarterHeader>
                        <StarterIconWrap $bg={s.color}>
                          <Icon type={s.icon} size={12} color="white" />
                        </StarterIconWrap>
                        <StarterTitle>{s.title}</StarterTitle>
                        {s.permission && <StarterPermChip>{s.permission}</StarterPermChip>}
                      </StarterHeader>
                      <StarterPrompt>{s.prompt}</StarterPrompt>
                      <StarterArrow className="starter-arrow">
                        <Icon type={Icon.TYPES.EXPAND_LESS} size={14} color="currentColor" style={{ transform: 'rotate(45deg)' }} />
                      </StarterArrow>
                    </StarterCard>
                  ))}
              </StarterGrid>
            </ReportSection>
          </>
        ) : automationMode ? (
          <>
            {/* Scope picker first. The outcome shapes what "good" looks like,
                so we anchor on intent before showing candidate workflows. */}
            <ReportSection>
              <ReportSectionTitle>What outcome are you optimizing for?</ReportSectionTitle>
              <ReportFormatStrip>
                {AUTOMATION_OUTCOMES.map(o => (
                  <ReportFormatCard
                    key={o.id}
                    $selected={automationOutcome === o.id}
                    onClick={() => setAutomationOutcome(o.id)}
                  >
                    <Icon type={o.icon} size={20} color="currentColor" />
                    {o.label}
                  </ReportFormatCard>
                ))}
              </ReportFormatStrip>
            </ReportSection>

            <ReportSection>
              <ReportSectionTitle>
                Starters for {AUTOMATION_OUTCOMES.find(o => o.id === automationOutcome)?.label ?? 'this automation'}
              </ReportSectionTitle>
              <StarterGrid>
                {AUTOMATION_STARTERS
                  .filter(s => s.outcomes?.includes(automationOutcome))
                  .map(s => (
                    <StarterCard key={s.id} onClick={() => seedPrompt(s.prompt)}>
                      <StarterHeader>
                        <StarterIconWrap $bg={s.color}>
                          <Icon type={s.icon} size={12} color="white" />
                        </StarterIconWrap>
                        <StarterTitle>{s.title}</StarterTitle>
                        {s.permission && <StarterPermChip>{s.permission}</StarterPermChip>}
                      </StarterHeader>
                      <StarterPrompt>{s.prompt}</StarterPrompt>
                      <StarterArrow className="starter-arrow">
                        <Icon type={Icon.TYPES.EXPAND_LESS} size={14} color="currentColor" style={{ transform: 'rotate(45deg)' }} />
                      </StarterArrow>
                    </StarterCard>
                  ))}
              </StarterGrid>
            </ReportSection>
          </>
        ) : (
          <>
            <ShortcutsStrip>
            {(user.persona === 'executive_owner'
              ? EXEC_SHORTCUTS.map(s => ({ ...s, url: undefined as string | undefined }))
              : [
                  ...allQuickActionsRaw.filter(a => qaFavorites.has(a.id)).map(a => ({ id: a.id, label: a.label, icon: QUICK_ACTION_ICONS[a.id] || Icon.TYPES.LINK_OUTLET, url: undefined as string | undefined })),
                  ...customShortcuts.filter(s => qaFavorites.has(s.id)).map(s => ({ id: s.id, label: s.label, icon: Icon.TYPES.LINK_OUTLET, url: s.url })),
                ]
            ).map((item, i) => (
              <QATile
                key={item.id}
                $index={i}
                href={item.url}
                target={item.url ? '_blank' : undefined}
                rel={item.url ? 'noopener noreferrer' : undefined}
                onClick={
                  item.id === 'exec_create_report' ? (e: React.MouseEvent) => { e.preventDefault(); setReportMode(true); setAutomationMode(false); }
                  : item.id === 'exec_new_automation' ? (e: React.MouseEvent) => { e.preventDefault(); setAutomationMode(true); setReportMode(false); }
                  : undefined
                }
              >
                <QAIconBox>
                    <Icon
                      type={item.icon}
                      size={16}
                      color={(theme as any).colorOnSurface}
                    />
                  </QAIconBox>
                  <QALabel>{item.label}</QALabel>
                </QATile>
              ))}
              <span style={{ marginLeft: 8, opacity: 0.5 }}>
                <Button.Icon
                  icon={Icon.TYPES.EDIT_OUTLINE}
                  aria-label="Edit shortcuts"
                  tip="Edit shortcuts"
                  appearance={Button.APPEARANCES.GHOST}
                  size={Button.SIZES.S}
                  onClick={() => setQaDrawerOpen(true)}
                />
              </span>
            </ShortcutsStrip>

            <RecentsTasksSection>
              <RecentsTasksColumn>
                <RecentsTasksColumnHeader>
                  <Button
                    appearance={Button.APPEARANCES.GHOST}
                    size={Button.SIZES.M}
                    onClick={() => {}}
                  >
                    Recents
                  </Button>
                </RecentsTasksColumnHeader>
                {RECENT_ITEMS.every(item => dismissedRecents.has(item.name)) ? (
                  <RecentsTasksEmptyLabel>No recent activity</RecentsTasksEmptyLabel>
                ) : RECENT_ITEMS.filter(item => !dismissedRecents.has(item.name)).map(item => (
                  <RecentsTasksRow key={item.name} href="#" onClick={(e: React.MouseEvent) => e.preventDefault()} data-dismissing="false">
                    <Icon type={item.icon} size={16} color={(theme as any).colorOnSurface} />
                    <RecentsTasksRowLabel>
                      {item.name}{item.context ? <RecentsTasksRowContext> in {item.context}</RecentsTasksRowContext> : ''}
                    </RecentsTasksRowLabel>
                    <RecentsTasksRowDismiss>
                      <Button.Icon
                        icon={Icon.TYPES.CLOSE}
                        aria-label={`Remove ${item.name}`}
                        appearance={Button.APPEARANCES.GHOST}
                        size={Button.SIZES.XS}
                        onClick={(e: React.MouseEvent) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const row = (e.currentTarget as HTMLElement).closest('[data-dismissing]') as HTMLElement;
                          if (!row) return;
                          const siblings: HTMLElement[] = [];
                          const rects = new Map<HTMLElement, number>();
                          let el = row.nextElementSibling as HTMLElement | null;
                          while (el) {
                            siblings.push(el);
                            rects.set(el, el.getBoundingClientRect().top);
                            el = el.nextElementSibling as HTMLElement | null;
                          }
                          requestAnimationFrame(() => {
                            row.setAttribute('data-dismissing', 'true');
                            setTimeout(() => {
                              setDismissedRecents(prev => new Set(prev).add(item.name));
                              requestAnimationFrame(() => {
                                siblings.forEach(sib => {
                                  if (!sib.isConnected) return;
                                  const oldTop = rects.get(sib)!;
                                  const newTop = sib.getBoundingClientRect().top;
                                  const delta = oldTop - newTop;
                                  if (delta === 0) return;
                                  sib.style.transform = `translateY(${delta}px)`;
                                  sib.style.transition = 'none';
                                  requestAnimationFrame(() => {
                                    sib.style.transition = 'transform 150ms cubic-bezier(0.25, 1, 0.5, 1)';
                                    sib.style.transform = '';
                                  });
                                });
                              });
                            }, 120);
                          });
                        }}
                      />
                    </RecentsTasksRowDismiss>
                  </RecentsTasksRow>
                ))}
              </RecentsTasksColumn>

              <RecentsTasksColumn>
                <RecentsTasksColumnHeader>
                  <Button
                    appearance={Button.APPEARANCES.GHOST}
                    size={Button.SIZES.M}
                    icon={{ alignment: Button.ICON_ALIGNMENTS.RIGHT, type: Icon.TYPES.CHEVRON_RIGHT }}
                    onClick={() => {}}
                  >
                    Your tasks
                  </Button>
                  <Status
                    appearance={Status.APPEARANCES.PRIMARY}
                    text="14 pending"
                    size={Status.SIZES.M}
                    outlined
                  />
                </RecentsTasksColumnHeader>
                {TODO_ITEMS.map(item => (
                  <RecentsTasksRow key={item.label} href="#" onClick={(e: React.MouseEvent) => e.preventDefault()}>
                    <Icon type={item.icon} size={16} color={(theme as any).colorOnSurface} />
                    <RecentsTasksRowLabel>{item.label}</RecentsTasksRowLabel>
                    <RecentsTasksRowMeta>{item.count}</RecentsTasksRowMeta>
                  </RecentsTasksRow>
                ))}
              </RecentsTasksColumn>
            </RecentsTasksSection>
          </>
        )}
      </HomeContent>

      {/* InlineAd hidden for now
      <InlineAd>
        <InlineAdText>Employee classification change? HR Services automates compliance. </InlineAdText>
        <InlineAdLink href="#">Learn more →</InlineAdLink>
      </InlineAd>
      */}



      <Drawer
        isVisible={pulseDrawerOpen}
        onCancel={() => setPulseDrawerOpen(false)}
        title="Company feed"
        width={620}
        overlayClassName={compactDrawerClass}
      >
        <PulseCarousel>
          <PulseCategoryCard>
            <PulseCategoryHeader>Out of Office (4)</PulseCategoryHeader>
            <PulseCategoryRow>
              <PulseAvatar $bg="oklch(55% 0.1 200)" style={{ width: 36, height: 36 }}><img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face" alt="" /></PulseAvatar>
              <PulseCategoryRowBody>
                <PulseCategoryRowName>Alex Kim</PulseCategoryRowName>
                <PulseCategoryRowMeta>Mon–Wed</PulseCategoryRowMeta>
              </PulseCategoryRowBody>
            </PulseCategoryRow>
            <PulseCategoryRow>
              <PulseAvatar $bg="oklch(55% 0.15 330)" style={{ width: 36, height: 36 }}><img src="https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=80&h=80&fit=crop&crop=face" alt="" /></PulseAvatar>
              <PulseCategoryRowBody>
                <PulseCategoryRowName>Jordan Lee</PulseCategoryRowName>
                <PulseCategoryRowMeta>All week</PulseCategoryRowMeta>
              </PulseCategoryRowBody>
            </PulseCategoryRow>
            <PulseCategoryRow>
              <PulseAvatar $bg="oklch(55% 0.1 150)" style={{ width: 36, height: 36 }}><img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face" alt="" /></PulseAvatar>
              <PulseCategoryRowBody>
                <PulseCategoryRowName>Aman Kumar</PulseCategoryRowName>
                <PulseCategoryRowMeta>Thu–Fri</PulseCategoryRowMeta>
              </PulseCategoryRowBody>
            </PulseCategoryRow>
            <PulseCategoryViewAll>View all</PulseCategoryViewAll>
          </PulseCategoryCard>

          <PulseCategoryCard>
            <PulseCategoryHeader>New Hires (3)</PulseCategoryHeader>
            <PulseCategoryRow>
              <PulseAvatar $bg="oklch(60% 0.12 280)" style={{ width: 36, height: 36 }}><img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face" alt="" /></PulseAvatar>
              <PulseCategoryRowBody>
                <PulseCategoryRowName>Sarah Chen</PulseCategoryRowName>
                <PulseCategoryRowMeta>Engineering · Starts today</PulseCategoryRowMeta>
              </PulseCategoryRowBody>
            </PulseCategoryRow>
            <PulseCategoryRow>
              <PulseAvatar $bg="oklch(55% 0.1 50)" style={{ width: 36, height: 36 }}><img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face" alt="" /></PulseAvatar>
              <PulseCategoryRowBody>
                <PulseCategoryRowName>Tom Park</PulseCategoryRowName>
                <PulseCategoryRowMeta>Sales · Starts today</PulseCategoryRowMeta>
              </PulseCategoryRowBody>
            </PulseCategoryRow>
            <PulseCategoryRow>
              <PulseAvatar $bg="oklch(55% 0.12 200)" style={{ width: 36, height: 36 }}><img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face" alt="" /></PulseAvatar>
              <PulseCategoryRowBody>
                <PulseCategoryRowName>Kausik Ghatak</PulseCategoryRowName>
                <PulseCategoryRowMeta>HR Products · Starts today</PulseCategoryRowMeta>
              </PulseCategoryRowBody>
            </PulseCategoryRow>
            <PulseCategoryViewAll>View all</PulseCategoryViewAll>
          </PulseCategoryCard>

          <PulseCategoryCard>
            <PulseCategoryHeader>Work Anniversaries (4)</PulseCategoryHeader>
            <PulseCategoryRow>
              <PulseAvatar $bg="oklch(55% 0.1 200)" style={{ width: 36, height: 36 }}><img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face" alt="" /></PulseAvatar>
              <PulseCategoryRowBody>
                <PulseCategoryRowName>Kyle Boston</PulseCategoryRowName>
                <PulseCategoryRowMeta>6 years today</PulseCategoryRowMeta>
              </PulseCategoryRowBody>
            </PulseCategoryRow>
            <PulseCategoryRow>
              <PulseAvatar $bg="oklch(55% 0.15 330)" style={{ width: 36, height: 36 }}><img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face" alt="" /></PulseAvatar>
              <PulseCategoryRowBody>
                <PulseCategoryRowName>Emer McCormack</PulseCategoryRowName>
                <PulseCategoryRowMeta>1 year on 03/31</PulseCategoryRowMeta>
              </PulseCategoryRowBody>
            </PulseCategoryRow>
            <PulseCategoryRow>
              <PulseAvatar $bg="oklch(55% 0.1 150)" style={{ width: 36, height: 36 }}><img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=face" alt="" /></PulseAvatar>
              <PulseCategoryRowBody>
                <PulseCategoryRowName>Karan Miglani</PulseCategoryRowName>
                <PulseCategoryRowMeta>1 year on 03/31</PulseCategoryRowMeta>
              </PulseCategoryRowBody>
            </PulseCategoryRow>
            <PulseCategoryViewAll>View all</PulseCategoryViewAll>
          </PulseCategoryCard>

          <PulseCategoryCard>
            <PulseCategoryHeader>Birthdays (3)</PulseCategoryHeader>
            <PulseCategoryRow>
              <PulseAvatar $bg="oklch(55% 0.1 50)" style={{ width: 36, height: 36 }}><img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face" alt="" /></PulseAvatar>
              <PulseCategoryRowBody>
                <PulseCategoryRowName>Minesh Patel</PulseCategoryRowName>
                <PulseCategoryRowMeta>Today</PulseCategoryRowMeta>
              </PulseCategoryRowBody>
            </PulseCategoryRow>
            <PulseCategoryRow>
              <PulseAvatar $bg="oklch(55% 0.12 280)" style={{ width: 36, height: 36 }}><img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=face" alt="" /></PulseAvatar>
              <PulseCategoryRowBody>
                <PulseCategoryRowName>Prashant Saraswat</PulseCategoryRowName>
                <PulseCategoryRowMeta>Today</PulseCategoryRowMeta>
              </PulseCategoryRowBody>
            </PulseCategoryRow>
            <PulseCategoryRow>
              <PulseAvatar $bg="oklch(55% 0.1 200)" style={{ width: 36, height: 36 }}><img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face" alt="" /></PulseAvatar>
              <PulseCategoryRowBody>
                <PulseCategoryRowName>Lisa Thompson</PulseCategoryRowName>
                <PulseCategoryRowMeta>Tomorrow</PulseCategoryRowMeta>
              </PulseCategoryRowBody>
            </PulseCategoryRow>
            <PulseCategoryViewAll>View all</PulseCategoryViewAll>
          </PulseCategoryCard>
        </PulseCarousel>

        <PulseDivider />

        <PulseSection>
          <PulsePostBox>
            <PulseAvatar $bg="oklch(55% 0.1 200)" style={{ width: 28, height: 28 }}>
              <span style={{ fontSize: 11 }}>{user.name.charAt(0)}</span>
            </PulseAvatar>
            <PulsePostPlaceholder>Share a post...</PulsePostPlaceholder>
          </PulsePostBox>

          <PulsePost>
            <PulsePostHeader>
              <PulseAvatar $bg="oklch(55% 0.1 150)" style={{ width: 28, height: 28 }}><img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face" alt="" /></PulseAvatar>
              <div>
                <PulsePostAuthor>Nick Sloggett</PulsePostAuthor>
                <br /><PulsePostTime>5 days ago</PulsePostTime>
              </div>
            </PulsePostHeader>
            <PulsePostBody>Just wrapped our Q1 team offsite — huge shoutout to everyone who helped organize. Energy was unreal.</PulsePostBody>
            <PulsePostActions>
              <PulsePostAction><Icon type={Icon.TYPES.HEART_OUTLINE} size={14} color="currentColor" /> 1 like</PulsePostAction>
              <PulsePostAction><Icon type={Icon.TYPES.COMMENTS_OUTLINE} size={14} color="currentColor" /> Comment</PulsePostAction>
            </PulsePostActions>
          </PulsePost>

          <PulsePost>
            <PulsePostHeader>
              <PulseAvatar $bg="oklch(55% 0.12 50)" style={{ width: 28, height: 28 }}><img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face" alt="" /></PulseAvatar>
              <div>
                <PulsePostAuthor>Ramon Garcia</PulsePostAuthor>
                <br /><PulsePostTime>2 weeks ago</PulsePostTime>
              </div>
            </PulsePostHeader>
            <PulsePostBody>Noticed an uptick in Rippling Athletic Club requests in Strava. A few of us are here. Join up!</PulsePostBody>
            <PulsePostActions>
              <PulsePostAction><Icon type={Icon.TYPES.HEART_OUTLINE} size={14} color="currentColor" /> 5 likes</PulsePostAction>
              <PulsePostAction><Icon type={Icon.TYPES.COMMENTS_OUTLINE} size={14} color="currentColor" /> 2 comments</PulsePostAction>
            </PulsePostActions>
          </PulsePost>

          <PulsePost>
            <PulsePostHeader>
              <PulseAvatar $bg="oklch(60% 0.12 280)" style={{ width: 28, height: 28 }}><img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face" alt="" /></PulseAvatar>
              <div>
                <PulsePostAuthor>Sarah Chen</PulsePostAuthor>
                <br /><PulsePostTime>2 weeks ago</PulsePostTime>
              </div>
            </PulsePostHeader>
            <PulsePostBody>First day at Rippling! So excited to join the engineering team. Already blown away by the onboarding experience. If you see me looking lost in the SF office, say hi 👋</PulsePostBody>
            <PulsePostActions>
              <PulsePostAction><Icon type={Icon.TYPES.HEART_OUTLINE} size={14} color="currentColor" /> 12 likes</PulsePostAction>
              <PulsePostAction><Icon type={Icon.TYPES.COMMENTS_OUTLINE} size={14} color="currentColor" /> 8 comments</PulsePostAction>
            </PulsePostActions>
          </PulsePost>

          <PulsePost>
            <PulsePostHeader>
              <PulseAvatar $bg="oklch(55% 0.1 200)" style={{ width: 28, height: 28 }}><img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face" alt="" /></PulseAvatar>
              <div>
                <PulsePostAuthor>Kyle Boston</PulsePostAuthor>
                <br /><PulsePostTime>3 weeks ago</PulsePostTime>
              </div>
            </PulsePostHeader>
            <PulsePostBody>Anyone else going to the product management meetup downtown next Thursday? Would be great to see some Rippling faces there.</PulsePostBody>
            <PulsePostActions>
              <PulsePostAction><Icon type={Icon.TYPES.HEART_OUTLINE} size={14} color="currentColor" /> 3 likes</PulsePostAction>
              <PulsePostAction><Icon type={Icon.TYPES.COMMENTS_OUTLINE} size={14} color="currentColor" /> 4 comments</PulsePostAction>
            </PulsePostActions>
          </PulsePost>

          <PulsePost>
            <PulsePostHeader>
              <PulseAvatar $bg="oklch(55% 0.15 330)" style={{ width: 28, height: 28 }}><img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face" alt="" /></PulseAvatar>
              <div>
                <PulsePostAuthor>Emer McCormack</PulsePostAuthor>
                <br /><PulsePostTime>1 month ago</PulsePostTime>
              </div>
            </PulsePostHeader>
            <PulsePostBody>Huge thanks to the IT team for the seamless laptop refresh. New M4 MacBook Pro is a beast. Setup took literally 10 minutes with Rippling MDM.</PulsePostBody>
            <PulsePostActions>
              <PulsePostAction><Icon type={Icon.TYPES.HEART_OUTLINE} size={14} color="currentColor" /> 18 likes</PulsePostAction>
              <PulsePostAction><Icon type={Icon.TYPES.COMMENTS_OUTLINE} size={14} color="currentColor" /> 6 comments</PulsePostAction>
            </PulsePostActions>
          </PulsePost>

          <PulsePost>
            <PulsePostHeader>
              <PulseAvatar $bg="oklch(55% 0.1 50)" style={{ width: 28, height: 28 }}><img src="https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=80&h=80&fit=crop&crop=face" alt="" /></PulseAvatar>
              <div>
                <PulsePostAuthor>Jordan Lee</PulsePostAuthor>
                <br /><PulsePostTime>1 month ago</PulsePostTime>
              </div>
            </PulsePostHeader>
            <PulsePostBody>PSA: The new cold brew tap on the 3rd floor is incredible. You're welcome.</PulsePostBody>
            <PulsePostActions>
              <PulsePostAction><Icon type={Icon.TYPES.HEART_OUTLINE} size={14} color="currentColor" /> 24 likes</PulsePostAction>
              <PulsePostAction><Icon type={Icon.TYPES.COMMENTS_OUTLINE} size={14} color="currentColor" /> 11 comments</PulsePostAction>
            </PulsePostActions>
          </PulsePost>
        </PulseSection>
      </Drawer>

      </PageGradient>
    </AppShellLayout>
  );
};

export default DesktopHomeB;
