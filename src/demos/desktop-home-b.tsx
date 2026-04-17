import React, { useEffect, useRef, useState, useMemo } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { css } from '@emotion/css';
import { StyledTheme } from '@/utils/theme';
import { useTheme } from '@rippling/pebble/theme';
import Icon from '@rippling/pebble/Icon';
import Button from '@rippling/pebble/Button';
import Drawer from '@rippling/pebble/Drawer';
import Modal from '@rippling/pebble/Modal';
import Input from '@rippling/pebble/Inputs';
import Tip from '@rippling/pebble/Tip';
import Status from '@rippling/pebble/Status';
import SplitButton from '@rippling/pebble/Button/SplitButton/SplitButton';

import Atoms from '@rippling/pebble/Atoms';
import { AppShellLayout, NavSectionData } from '@/components/app-shell';
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

const REPORT_SAMPLE_PROMPTS = [
  'Create monthly marketing campaign performance report',
  'Track headcount and attrition trends across all departments',
  'Show payroll cost breakdown by department for Q1',
  'Compare time-off usage across teams this quarter',
];

const REPORT_RECIPES = [
  { title: 'Employee roster', desc: 'A quick and simple list of all the employees at your company with key details', icon: Icon.TYPES.PEO_OUTLINE, color: '#7B3E00' },
  { title: 'Payroll report', desc: 'Track your employees\u2019 payroll data', icon: Icon.TYPES.DOLLAR_CIRCLE_OUTLINE, color: '#7B3E00' },
  { title: 'Change history report', desc: 'Track all employee data changes that are made in Rippling', icon: Icon.TYPES.PEO_OUTLINE, color: '#7B3E00' },
  { title: 'Time off requests report', desc: 'Track leave requests by employee and leave type', icon: Icon.TYPES.DOLLAR_CIRCLE_OUTLINE, color: '#005A3A' },
  { title: 'Upcoming Time Off by Employee', desc: 'Track total number of hours to be taken off by employees', icon: Icon.TYPES.PEO_OUTLINE, color: '#7B3E00' },
  { title: 'Time off balances report', desc: 'Track the current leave balances by employee and leave type', icon: Icon.TYPES.DOLLAR_CIRCLE_OUTLINE, color: '#005A3A' },
  { title: 'Time off accruals report', desc: 'Track accrued leave hours by employee and leave type', icon: Icon.TYPES.DOLLAR_CIRCLE_OUTLINE, color: '#005A3A' },
  { title: 'Hours worked per department', desc: 'Track hourly employee timecards with their associated earnings', icon: Icon.TYPES.PEO_OUTLINE, color: '#7B3E00' },
  { title: 'Hours worked by employee', desc: 'Track hourly employee timecards with their associated earnings', icon: Icon.TYPES.TIME_OUTLINE, color: '#005A3A' },
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

const ReportPromptsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${({ theme }) => (theme as StyledTheme).space300};
`;

const ReportPromptCard = styled.button`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: ${({ theme }) => (theme as StyledTheme).space300};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerLg};
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  background: ${({ theme }) => (theme as StyledTheme).colorSurface};
  cursor: pointer;
  text-align: left;
  min-height: 88px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => (theme as StyledTheme).colorOutline};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
`;

const ReportPromptText = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodySmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
`;

const ReportPromptArrow = styled.span`
  align-self: flex-end;
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  margin-top: ${({ theme }) => (theme as StyledTheme).space200};
`;

const ReportRecipesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => (theme as StyledTheme).space300};
`;

const ReportRecipeCard = styled.button`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
  padding: ${({ theme }) => (theme as StyledTheme).space400};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerLg};
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  background: ${({ theme }) => (theme as StyledTheme).colorSurface};
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => (theme as StyledTheme).colorOutline};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
`;

const ReportRecipeHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const ReportRecipeIconWrap = styled.div<{ $bg: string }>`
  width: 28px;
  height: 28px;
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerMd};
  background: ${({ $bg }) => $bg};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ReportRecipeBadge = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelSmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerFull};
  padding: 2px 8px;
`;

const ReportRecipeTitle = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2TitleSmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
`;

const ReportRecipeDesc = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodySmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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

const AUTOMATION_SAMPLE_PROMPTS = [
  'Alert managers when an employee\u2019s PTO balance is running low',
  'Auto-assign onboarding tasks when a new hire starts',
  'Notify payroll admins before each pay run deadline',
  'Escalate overdue compliance trainings to department heads',
];

const AUTOMATION_OUTCOMES = [
  { id: 'compliance', label: 'Compliance', icon: Icon.TYPES.SHIELD_OUTLINE },
  { id: 'retention', label: 'Retention', icon: Icon.TYPES.HEART_OUTLINE },
  { id: 'efficiency', label: 'Efficiency', icon: Icon.TYPES.THUNDERBOLT_OUTLINE },
  { id: 'cost', label: 'Cost savings', icon: Icon.TYPES.DOLLAR_CIRCLE_OUTLINE },
];

const AUTOMATION_RECIPES: Record<string, { title: string; desc: string; icon: string; color: string; permission?: string }[]> = {
  compliance: [
    { title: 'Alert admins when a pay run auto-approval fails', desc: 'Avoid payroll delays from a failed auto-approval', icon: Icon.TYPES.DOLLAR_CIRCLE_OUTLINE, color: '#7B3E00', permission: 'No permission' },
    { title: 'Alert when an employee is terminated involuntarily', desc: 'Avoid late payment penalties by alerting payroll admins of involuntary terminations', icon: Icon.TYPES.DOLLAR_CIRCLE_OUTLINE, color: '#7B3E00' },
    { title: 'Alert admins when an employee changes countries', desc: 'Ensure compliance when employees change countries by notifying the right admins', icon: Icon.TYPES.DOLLAR_CIRCLE_OUTLINE, color: '#7B3E00' },
    { title: 'Alert super admins if an employee requests leave while their manager is on leave', desc: 'Send a notification to admins to look into the leave request', icon: Icon.TYPES.PEO_OUTLINE, color: '#005A3A' },
    { title: 'Ensure timely review of long-term leave requests', desc: 'Alert managers when their reports request extended leave', icon: Icon.TYPES.PEO_OUTLINE, color: '#005A3A' },
    { title: 'Communicate manually approved pay runs', desc: 'Ensure coordination of different payroll admins by communicating approved pay runs', icon: Icon.TYPES.DOLLAR_CIRCLE_OUTLINE, color: '#7B3E00' },
  ],
  retention: [
    { title: 'Assign a task to managers when an employee hits a tenure milestone', desc: 'Reduce attrition with regular salary discussions to evaluate if employees are eligible for a raise', icon: Icon.TYPES.DOLLAR_CIRCLE_OUTLINE, color: '#7B3E00' },
    { title: 'Assign a task to managers to take their new hire to lunch on first day', desc: 'Ensure a proper welcome for new hires by organizing a welcome lunch', icon: Icon.TYPES.PEO_OUTLINE, color: '#005A3A' },
    { title: 'Alert HR when an employee\u2019s engagement score drops', desc: 'Proactively address disengagement before it leads to turnover', icon: Icon.TYPES.PEO_OUTLINE, color: '#005A3A' },
    { title: 'Notify managers when a direct report updates their resume', desc: 'Surface potential flight risk signals early so managers can have retention conversations', icon: Icon.TYPES.PEO_OUTLINE, color: '#005A3A' },
    { title: 'Send a check-in survey at 30/60/90 days for new hires', desc: 'Catch onboarding friction early and improve new hire retention', icon: Icon.TYPES.PEO_OUTLINE, color: '#005A3A' },
    { title: 'Alert HR when a high performer has not been promoted in 18 months', desc: 'Prevent losing top talent by surfacing overdue career progression', icon: Icon.TYPES.DOLLAR_CIRCLE_OUTLINE, color: '#7B3E00' },
  ],
  efficiency: [
    { title: 'Auto-assign onboarding tasks when a new hire\u2019s start date is confirmed', desc: 'Eliminate manual task creation and ensure nothing is missed during onboarding', icon: Icon.TYPES.PEO_OUTLINE, color: '#005A3A' },
    { title: 'Avoid understaffing during busy seasons', desc: 'Alert managers immediately after time off is requested during peak periods', icon: Icon.TYPES.PEO_OUTLINE, color: '#005A3A' },
    { title: 'Alert when an off-cycle pay run occurs', desc: 'Ensure coordination of different payroll admins by communicating off-cycle pay runs', icon: Icon.TYPES.DOLLAR_CIRCLE_OUTLINE, color: '#7B3E00', permission: 'No permission' },
    { title: 'Auto-route expense approvals based on amount', desc: 'Route expenses over $500 to finance and under $500 to direct managers', icon: Icon.TYPES.DOLLAR_CIRCLE_OUTLINE, color: '#7B3E00' },
    { title: 'Auto-provision app access based on department and role', desc: 'Eliminate manual IT tickets by automatically granting the right tools on day one', icon: Icon.TYPES.PEO_OUTLINE, color: '#005A3A' },
    { title: 'Alert when an employee\u2019s compensation changes', desc: 'Keep your payroll team informed of any employee compensation changes', icon: Icon.TYPES.DOLLAR_CIRCLE_OUTLINE, color: '#7B3E00' },
  ],
  cost: [
    { title: 'Alert when an employee forfeits their sign-on bonus by leaving', desc: 'Ensure departing employees return their signing bonuses before the bonus period ends', icon: Icon.TYPES.PEO_OUTLINE, color: '#005A3A', permission: 'No permission' },
    { title: 'Flag duplicate expense submissions across employees', desc: 'Catch accidental or fraudulent duplicate reimbursement requests before they\u2019re paid out', icon: Icon.TYPES.DOLLAR_CIRCLE_OUTLINE, color: '#7B3E00' },
    { title: 'Alert finance when a department exceeds its headcount budget', desc: 'Surface budget overruns early so finance can course-correct before quarter end', icon: Icon.TYPES.DOLLAR_CIRCLE_OUTLINE, color: '#7B3E00' },
    { title: 'Notify admins when unused software licenses exceed threshold', desc: 'Reclaim spend on underutilized SaaS tools by alerting IT to unused seats', icon: Icon.TYPES.PEO_OUTLINE, color: '#005A3A' },
    { title: 'Alert when overtime costs exceed department budget', desc: 'Surface overtime budget overruns so managers can adjust scheduling proactively', icon: Icon.TYPES.DOLLAR_CIRCLE_OUTLINE, color: '#7B3E00' },
    { title: 'Flag contractor invoices that exceed approved rates', desc: 'Catch rate discrepancies before payment to protect against billing errors', icon: Icon.TYPES.DOLLAR_CIRCLE_OUTLINE, color: '#7B3E00' },
  ],
};

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

const HomePrompt = React.memo(({ onSubmit, reportMode, onClearReport, automationMode, onClearAutomation }: { onSubmit?: () => void; reportMode?: boolean; onClearReport?: () => void; automationMode?: boolean; onClearAutomation?: () => void }) => {
  const { theme } = useTheme();
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const promptWrapRef = useRef<HTMLDivElement>(null);
  const [promptValue, setPromptValue] = useState('');
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');

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
  const [userIdx, setUserIdx] = useState(3);
  const [personaHudOpen, setPersonaHudOpen] = useState(false);

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

  const orgChartSection: NavSectionData = {
    items: [
      { id: 'org-chart', label: 'Org Chart', icon: Icon.TYPES.HIERARCHY_HORIZONTAL_OUTLINE },
    ],
  };

  const appsSection: NavSectionData = {
    items: [
      { id: 'favorites', label: 'Favorites', icon: Icon.TYPES.STAR_OUTLINE, hasSubmenu: true },
      { id: 'time', label: 'Time', icon: Icon.TYPES.TIME_OUTLINE, hasSubmenu: true },
      { id: 'benefits', label: 'Benefits', icon: Icon.TYPES.HEART_OUTLINE, hasSubmenu: true },
      { id: 'payroll', label: 'Payroll', icon: Icon.TYPES.DOLLAR_CIRCLE_OUTLINE, hasSubmenu: true },
      { id: 'finance', label: 'Finance', icon: Icon.TYPES.CREDIT_CARD_OUTLINE, hasSubmenu: true },
      { id: 'talent', label: 'Talent', icon: Icon.TYPES.TALENT_OUTLINE, hasSubmenu: true },
      { id: 'it', label: 'IT', icon: Icon.TYPES.LAPTOP_OUTLINE, hasSubmenu: true },
      { id: 'data', label: 'Data', icon: Icon.TYPES.BAR_CHART_OUTLINE, hasSubmenu: true },
      { id: 'custom-apps', label: 'Custom Apps', icon: Icon.TYPES.CUSTOM_APPS_OUTLINE, hasSubmenu: true },
    ],
  };

  const platformSection: NavSectionData = {
    label: 'Platform',
    items: [
      { id: 'tools', label: 'Tools', icon: Icon.TYPES.WRENCH_OUTLINE, hasSubmenu: true },
      { id: 'company-settings', label: 'Company settings', icon: Icon.TYPES.SETTINGS_OUTLINE, hasSubmenu: true },
      { id: 'app-shop', label: 'App Shop', icon: Icon.TYPES.INTEGRATED_APPS_OUTLINE },
      { id: 'help', label: 'Help', icon: Icon.TYPES.QUESTION_CIRCLE_OUTLINE },
    ],
  };

  return (
    <AppShellLayout
      hidePageHeader
      mainNavSections={[orgChartSection, appsSection]}
      platformNavSection={platformSection}
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
        />

        {reportMode ? (
          <>
            <ReportSection>
              <ReportSectionTitle>Sample prompts</ReportSectionTitle>
              <ReportPromptsGrid>
                {REPORT_SAMPLE_PROMPTS.map(text => (
                  <ReportPromptCard key={text}>
                    <ReportPromptText>{text}</ReportPromptText>
                    <ReportPromptArrow>
                      <Icon type={Icon.TYPES.EXPAND_LESS} size={14} color="currentColor" style={{ transform: 'rotate(45deg)' }} />
                    </ReportPromptArrow>
                  </ReportPromptCard>
                ))}
              </ReportPromptsGrid>
            </ReportSection>

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

            <ReportSection>
              <ReportSectionTitle>Report recipes</ReportSectionTitle>
              <ReportRecipesGrid>
                {REPORT_RECIPES.map(recipe => (
                  <ReportRecipeCard key={recipe.title}>
                    <ReportRecipeHeader>
                      <ReportRecipeIconWrap $bg={recipe.color}>
                        <Icon type={recipe.icon} size={14} color="white" />
                      </ReportRecipeIconWrap>
                      <ReportRecipeBadge>Recipe</ReportRecipeBadge>
                    </ReportRecipeHeader>
                    <ReportRecipeTitle>{recipe.title}</ReportRecipeTitle>
                    <ReportRecipeDesc>{recipe.desc}</ReportRecipeDesc>
                  </ReportRecipeCard>
                ))}
              </ReportRecipesGrid>
            </ReportSection>
          </>
        ) : automationMode ? (
          <>
            <ReportSection>
              <ReportSectionTitle>Sample prompts</ReportSectionTitle>
              <ReportPromptsGrid>
                {AUTOMATION_SAMPLE_PROMPTS.map(text => (
                  <ReportPromptCard key={text}>
                    <ReportPromptText>{text}</ReportPromptText>
                    <ReportPromptArrow>
                      <Icon type={Icon.TYPES.EXPAND_LESS} size={14} color="currentColor" style={{ transform: 'rotate(45deg)' }} />
                    </ReportPromptArrow>
                  </ReportPromptCard>
                ))}
              </ReportPromptsGrid>
            </ReportSection>

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
              <ReportSectionTitle>Workflow recipes</ReportSectionTitle>
              <ReportRecipesGrid>
                {(AUTOMATION_RECIPES[automationOutcome] ?? []).map(recipe => (
                  <ReportRecipeCard key={recipe.title}>
                    <ReportRecipeHeader>
                      <ReportRecipeIconWrap $bg={recipe.color}>
                        <Icon type={recipe.icon} size={14} color="white" />
                      </ReportRecipeIconWrap>
                      <ReportRecipeBadge>Recipe</ReportRecipeBadge>
                    </ReportRecipeHeader>
                    <ReportRecipeTitle>{recipe.title}</ReportRecipeTitle>
                    <ReportRecipeDesc>{recipe.desc}</ReportRecipeDesc>
                  </ReportRecipeCard>
                ))}
              </ReportRecipesGrid>
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
