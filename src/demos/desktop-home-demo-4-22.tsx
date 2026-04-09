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
import Tabs from '@rippling/pebble/Tabs';
import SplitButton from '@rippling/pebble/Button/SplitButton/SplitButton';

import Atoms from '@rippling/pebble/Atoms';
import { AppShellLayout, NavSectionData } from '@/components/app-shell';
import RipplingAiSpark from '@/assets/rippling-ai-spark.svg';
import ShiftClockContent from '@/widgets/ShiftClockWidget';
import EarningsSummaryContent from '@/widgets/EarningsWidget';
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

const ShortcutsSection = styled.div`
  width: 100%;
  max-width: 960px;
  margin: ${({ theme }) => (theme as StyledTheme).space1000} 0 0;
  padding: 0 0 ${({ theme }) => (theme as StyledTheme).space800} 0;
`;

const ShortcutsHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space100};
  position: relative;
`;

const ShortcutsLabel = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyLargeEmphasized};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  white-space: nowrap;
`;

const ShortcutsDropdownToggle = styled.button`
  display: flex;
  align-items: center;
  background: none;
  border: none;
  padding: ${({ theme }) => (theme as StyledTheme).space100};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerSm};
  cursor: pointer;
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  transition: background 0.1s, color 0.1s;

  &:hover {
    background: ${({ theme }) => (theme as StyledTheme).colorSurfaceContainerLow};
    color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  }
`;

const ShortcutsDropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + ${({ theme }) => (theme as StyledTheme).space100});
  left: 0;
  background: ${({ theme }) => (theme as StyledTheme).colorSurfaceBright};
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerLg};
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: ${({ theme }) => (theme as StyledTheme).space100} 0;
  min-width: 180px;
  z-index: 10;
`;

const ShortcutsDropdownItem = styled.button<{ $active?: boolean }>`
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

const ShortcutsStrip = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${({ theme }) => (theme as StyledTheme).space200};
  width: 100%;
  margin: 8px 0 0;
  position: relative;
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
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerFull};
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  transition: background 0.12s;
  opacity: 0;
  animation: ${chipFadeIn} 350ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: ${({ $index = 0 }) => 200 + $index * 50}ms;
  min-width: 0;

  &:hover {
    background: ${({ theme }) => (theme as StyledTheme).colorSurfaceContainerLow};
  }
`;

const QAIconBox = styled.div`
  width: 40px;
  height: 40px;
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
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
`;


const ShortcutsEditButton = styled.span`
  position: absolute;
  right: -40px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.5;
  transition: opacity 0.15s;

  &:hover {
    opacity: 1;
  }
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
  { avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face', name: 'Alex Kim — Profile', meta: '1h ago', color: 'oklch(55% 0.1 200)' },
  { icon: Icon.TYPES.CALENDAR_FILLED, name: 'Time Management', meta: '2h ago' },
  { icon: Icon.TYPES.DOLLAR_CIRCLE_FILLED, name: 'Run Payroll — March', meta: '3h ago' },
  { icon: Icon.TYPES.BAR_CHART_FILLED, name: 'Headcount Report Q1', meta: 'Yesterday' },
  { icon: Icon.TYPES.TIME_FILLED, name: 'Time & Attendance Summary', meta: '2 days ago' },
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
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => (theme as StyledTheme).space400};
  width: 100%;
  max-width: 960px;
  margin: ${({ theme }) => (theme as StyledTheme).space800} auto ${({ theme }) => (theme as StyledTheme).space400};
  padding: 0 ${({ theme }) => (theme as StyledTheme).space800};
  box-sizing: border-box;
`;

const EditWidgetsRow = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  max-width: 960px;
  margin: ${({ theme }) => (theme as StyledTheme).space800} auto ${({ theme }) => (theme as StyledTheme).space800};
  padding: 0 ${({ theme }) => (theme as StyledTheme).space800};
  box-sizing: border-box;
`;

const Card = styled.div`
  background: ${({ theme }) => (theme as StyledTheme).colorSurfaceBright};
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCorner2xl};
  padding: ${({ theme }) => (theme as StyledTheme).space500};
  min-width: 0;
  min-height: 270px;
  display: flex;
  flex-direction: column;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space350};
`;

const CardActionFooter = styled.div`
  display: flex;
  gap: ${({ theme }) => (theme as StyledTheme).space300};
  margin-top: auto;
  padding-top: ${({ theme }) => (theme as StyledTheme).space400};
`;

const CardTitleButton = styled.button`
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
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerLg};
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
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyLargeEmphasized};
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
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyLargeEmphasized};
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
  max-width: 960px;
  margin: 80px auto 0;
  padding: ${({ theme }) => (theme as StyledTheme).space600} ${({ theme }) => (theme as StyledTheme).space800} ${({ theme }) => (theme as StyledTheme).space800};
  border-top: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  box-sizing: border-box;
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
  padding: ${({ theme }) => (theme as StyledTheme).space400} ${({ theme }) => (theme as StyledTheme).space800} ${({ theme }) => (theme as StyledTheme).space600};
  max-width: 960px;
  margin: 0 auto;
  box-sizing: border-box;
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
  max-width: 960px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => (theme as StyledTheme).space800} ${({ theme }) => (theme as StyledTheme).space1200};
  box-sizing: border-box;
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
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyLargeEmphasized};
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
  min-height: 100%;
`;

const HomeContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  padding: 0 ${({ theme }) => (theme as StyledTheme).space800};
  position: relative;
  max-width: 960px;
  margin: 0 auto;
  box-sizing: border-box;
  min-height: 60vh;
`;

const AnalyticsSection = styled.div`
  max-width: 1300px;
  margin: 0 auto;
  padding: 6px;
  box-sizing: border-box;
  width: 100%;
  background: ${({ theme }) => (theme as StyledTheme).colorSurfaceBright};
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  border-bottom: none;
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCorner3xl} ${({ theme }) => (theme as StyledTheme).shapeCorner3xl} 0 0;
`;

const AnalyticsTitleAndTabs = styled.div`
  background: color-mix(in srgb, #e1d8d2 30%, transparent);
  padding: 32px;
  padding-bottom: 12px;
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerLg};
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;

  [data-active="true"] {
    background: #e1d8d2 !important;
    border-color: #e1d8d2 !important;
    color: ${({ theme }) => (theme as StyledTheme).colorOnSurface} !important;
  }
`;

const DashboardContentWrap = styled.div`
  padding: 32px;
`;

const AnalyticsSectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space400};
`;

const AnalyticsSectionTitle = styled.h2`
  ${({ theme }) => (theme as StyledTheme).typestyleV2TitleLarge};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  margin: 0;
`;

const AnalyticsSectionActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space300};
`;

const AnalyticsSwitcher = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
`;

const AnalyticsTabRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space400};
`;

const AnalyticsTabActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space100};
`;

const AnalyticsTab = styled.button<{ $active?: boolean }>`
  padding: ${({ theme }) => (theme as StyledTheme).space200} ${({ theme }) => (theme as StyledTheme).space400};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerFull};
  border: 1px solid ${({ $active, theme }) =>
    $active ? (theme as StyledTheme).colorOnSurface : (theme as StyledTheme).colorOutlineVariant};
  background: ${({ $active, theme }) =>
    $active ? (theme as StyledTheme).colorOnSurface : 'transparent'};
  color: ${({ $active, theme }) =>
    $active ? (theme as StyledTheme).colorSurface : (theme as StyledTheme).colorOnSurface};
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelMedium};
  cursor: pointer;
  transition: all 0.12s;

  &:hover {
    border-color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  }
`;

const AnalyticsAddTab = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  background: transparent;
  display: grid;
  place-items: center;
  cursor: pointer;
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  transition: all 0.12s;

  &:hover {
    border-color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
    color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  }
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
  padding: 0 0 ${({ theme }) => (theme as StyledTheme).space100};
`;

const DashboardHeaderTitle = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2TitleMedium};
  font-size: 18px;
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space300};
`;

const DashboardHeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
`;

const DashboardHeaderTimestamp = styled.span`
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

const DashboardAddFilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space100};
  padding: ${({ theme }) => (theme as StyledTheme).space100} ${({ theme }) => (theme as StyledTheme).space300};
  height: 32px;
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

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => (theme as StyledTheme).space400};
`;

const ChartCard = styled.div<{ $span?: number }>`
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCorner2xl};
  background: white;
  padding: ${({ theme }) => (theme as StyledTheme).space500};
  grid-column: ${({ $span }) => $span ? `span ${$span}` : 'auto'};
  display: flex;
  flex-direction: column;
`;

const ChartHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space400};
`;

const ChartTitle = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyLargeEmphasized};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
`;

const ChartDot = styled.span<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
`;

const ChartArea = styled.div`
  flex: 1;
  min-height: 180px;
  position: relative;
`;

const ChartYAxis = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodySmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  padding-right: ${({ theme }) => (theme as StyledTheme).space200};
`;

const ChartXAxis = styled.div`
  position: absolute;
  left: 48px;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: space-between;
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodySmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
`;

const ChartBody = styled.div`
  position: absolute;
  left: 48px;
  top: 0;
  right: 0;
  bottom: 24px;
  border-left: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  border-bottom: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
`;

const ChartGridLine = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  opacity: 0.5;
`;

const LineChartSvg: React.FC<{ color: string; data: number[] }> = ({ color, data }) => {
  const w = 100;
  const h = 100;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) =>
    `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h * 0.85 - h * 0.05}`
  ).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

const BarChartSvg: React.FC<{ color: string; data: number[] }> = ({ color, data }) => {
  const w = 100;
  const h = 100;
  const max = Math.max(...data);
  const barW = w / data.length * 0.7;
  const gap = w / data.length * 0.3;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
      {data.map((v, i) => {
        const barH = (v / max) * h * 0.9;
        const x = i * (barW + gap) + gap / 2;
        return <rect key={i} x={x} y={h - barH} width={barW} height={barH} fill={color} opacity={0.7} />;
      })}
    </svg>
  );
};

const ScatterChartSvg: React.FC<{ color: string; data: [number, number][] }> = ({ color, data }) => {
  const w = 100;
  const h = 100;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
      {data.map(([x, y], i) => (
        <circle key={i} cx={x} cy={h - y} r="1.2" fill={color} opacity={0.6} />
      ))}
    </svg>
  );
};

const HEADCOUNT_DATA = [42, 45, 44, 48, 51, 50, 53, 56, 55, 58, 61, 60, 52, 48, 50, 54, 57, 62, 65, 63, 60, 58, 61, 64];
const REVENUE_DATA = [120, 135, 128, 142, 155, 148, 162, 170, 165, 178, 190, 185, 195, 210, 205, 220, 235, 225, 240, 250, 245, 260, 270, 265];
const ATTRITION_DATA: [number, number][] = Array.from({ length: 60 }, () => [Math.random() * 95 + 2, Math.random() * 80 + 10]);

interface DashboardFilterDef {
  id: string;
  label: string;
}

const DASHBOARD_TAB_FILTERS: Record<string, { lastEdited: string; filters: DashboardFilterDef[] }> = {
  0: {
    lastEdited: 'Just now',
    filters: [
      { id: 'dept', label: 'Department: Sales' },
      { id: 'region', label: 'Region equals West' },
      { id: 'start', label: 'Start date' },
      { id: 'owner', label: 'Owner' },
    ],
  },
  1: {
    lastEdited: '2h ago',
    filters: [
      { id: 'period', label: 'Period: Q1 2026' },
      { id: 'segment', label: 'Segment: Enterprise' },
    ],
  },
  2: {
    lastEdited: 'Yesterday',
    filters: [
      { id: 'dept', label: 'Department: Engineering' },
      { id: 'stage', label: 'Stage: All' },
      { id: 'source', label: 'Source' },
    ],
  },
};

const DASHBOARD_TAB_NAMES = ['Q1 Headcount by Department', 'Revenue Overview', 'Sales Pipeline'];

const DashboardTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const DashboardTh = styled.th`
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  text-align: left;
  padding: ${({ theme }) => (theme as StyledTheme).space300} ${({ theme }) => (theme as StyledTheme).space400};
  border-bottom: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  white-space: nowrap;
`;

const DashboardTd = styled.td`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  padding: ${({ theme }) => (theme as StyledTheme).space300} ${({ theme }) => (theme as StyledTheme).space400};
  border-bottom: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  white-space: nowrap;
`;

const DashboardTdMuted = styled(DashboardTd)`
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
`;

const TrendBadge = styled.span<{ $positive?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelMedium};
  color: ${({ $positive, theme }) =>
    $positive ? (theme as StyledTheme).colorSuccess : (theme as StyledTheme).colorError};
`;

const DEPT_TABLE_DATA = [
  { dept: 'Engineering', headcount: 142, newHires: 8, attrition: 3, openRoles: 12, trend: +5.2 },
  { dept: 'Sales', headcount: 98, newHires: 6, attrition: 4, openRoles: 9, trend: +2.1 },
  { dept: 'Product', headcount: 45, newHires: 3, attrition: 1, openRoles: 5, trend: +4.5 },
  { dept: 'Design', headcount: 32, newHires: 2, attrition: 0, openRoles: 3, trend: +6.7 },
  { dept: 'Customer Success', headcount: 67, newHires: 4, attrition: 2, openRoles: 6, trend: -1.5 },
  { dept: 'Finance', headcount: 28, newHires: 1, attrition: 1, openRoles: 2, trend: 0 },
  { dept: 'People Ops', headcount: 18, newHires: 2, attrition: 0, openRoles: 1, trend: +12.5 },
  { dept: 'Legal', headcount: 12, newHires: 0, attrition: 0, openRoles: 1, trend: 0 },
];

const PromptHeading = styled.h1`
  ${({ theme }) => (theme as StyledTheme).typestyleV2TitleLarge};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  text-align: left;
  margin: ${({ theme }) => (theme as StyledTheme).space2400} 0 20px 0;
`;

const PromptCard = styled.div<{ $dropdownOpen?: boolean }>`
  width: 100%;
  background: ${({ theme }) => (theme as StyledTheme).colorSurfaceBright};
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  border-radius: ${({ $dropdownOpen, theme }) =>
    $dropdownOpen
      ? `${(theme as StyledTheme).shapeCorner2xl} ${(theme as StyledTheme).shapeCorner2xl} 0 0`
      : (theme as StyledTheme).shapeCorner2xl};
  box-shadow: ${({ $dropdownOpen }) =>
    $dropdownOpen
      ? '0 12px 32px rgba(0, 0, 0, 0.1)'
      : '0px 1px 2px rgba(0, 0, 0, 0.1)'};
  clip-path: ${({ $dropdownOpen }) =>
    $dropdownOpen ? 'inset(-40px -40px 0 -40px)' : 'none'};
  ${({ $dropdownOpen }) => $dropdownOpen && 'border-bottom-color: transparent;'}
  padding: ${({ theme }) => (theme as StyledTheme).space400};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
  cursor: text;
  box-sizing: border-box;
  transition: border-radius 0.15s ease, box-shadow 0.15s ease;
`;

const PromptInput = styled.textarea`
  flex: 1;
  background: transparent;
  border: none;
  resize: none;
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyLarge};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  min-height: 1lh;
  padding: 0;
  margin: 0;

  &::placeholder {
    color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  }

  caret-color: ${({ theme }) => (theme as StyledTheme).colorPrimary};

  &:focus {
    outline: none;
  }
`;

// ── Prompt Dropdown ─────────────────────────────────────────────────────────

const SUGGESTIONS_BY_PERSONA: Record<string, string[]> = {
  'hourly-employee': [
    'How much overtime did I work this month?',
    'When is my next scheduled shift?',
    'How much PTO do I have left?',
    'Can I swap my shift this Friday?',
    'What holidays are coming up?',
    'Show me my recent timecards',
    'How do I update my availability?',
  ],
  'salaried-employee': [
    'What does my benefits plan cover?',
    'How do I add my newborn to my insurance?',
    'What is my member ID?',
    'When is open enrollment?',
    'How much PTO do I have left?',
    'Show me my recent paystubs',
    'How do I update my tax withholdings?',
  ],
  'manager': [
    'Which teams have the highest attrition this quarter?',
    'Are there any pay equity gaps across departments?',
    'Who on my team is out today?',
    'Show me pending time-off requests',
    'How do I run a performance review cycle?',
    'What open headcount do I have?',
    'Summarize my team\u2019s overtime this month',
  ],
  'admin': [
    'What compliance tasks are overdue?',
    'Show me headcount trends by department',
    'When is the next payroll deadline?',
    'Are there any open onboarding tasks?',
    'Which employees are missing tax documents?',
    'Show me benefits enrollment status',
    'Generate a turnover report for Q1',
  ],
};

const DEFAULT_SUGGESTIONS: string[] = [
  'What does my benefits plan cover?',
  'How do I add a dependent to my insurance?',
  'When is open enrollment?',
  'How much PTO do I have left?',
  'Show me my recent paystubs',
  'How do I update my tax withholdings?',
  'What holidays are coming up?',
];

const PromptWrap = styled.div`
  position: relative;
  width: 100%;
  max-width: 960px;
  box-sizing: border-box;
`;

const CreditNotice = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 960px;
  box-sizing: border-box;
  padding: ${({ theme }) => (theme as StyledTheme).space200} ${({ theme }) => (theme as StyledTheme).space400};
  border-radius: 0 0 ${({ theme }) => (theme as StyledTheme).shapeCornerLg} ${({ theme }) => (theme as StyledTheme).shapeCornerLg};
  background: color-mix(in srgb, ${({ theme }) => (theme as StyledTheme).colorSurfaceDim} 30%, transparent);
  position: relative;
  z-index: 1;
`;

const CreditNoticeText = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
`;

const CreditNoticeUnderline = styled.span`
  text-decoration: underline;
  text-decoration-style: dotted;
  text-decoration-color: ${({ theme }) => (theme as StyledTheme).colorOutline};
  text-underline-offset: ${({ theme }) => (theme as StyledTheme).space75};
  cursor: help;
`;

const CreditNoticeLink = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space50};
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  white-space: nowrap;

  &:hover {
    text-decoration: underline;
  }
`;

const PromptDropdown = styled.div<{ $visible: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 20;
  background: ${({ theme }) => (theme as StyledTheme).colorSurfaceBright};
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  border-top: none;
  border-radius: 0 0 ${({ theme }) => (theme as StyledTheme).shapeCorner2xl} ${({ theme }) => (theme as StyledTheme).shapeCorner2xl};
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
  clip-path: inset(0 -40px -40px -40px);
  padding: ${({ theme }) => (theme as StyledTheme).space200} 0;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  pointer-events: ${({ $visible }) => ($visible ? 'auto' : 'none')};
  transition: opacity 0.15s ease;
`;

const PromptDivider = styled.div`
  height: 1px;
  background: ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  margin: 0 ${({ theme }) => (theme as StyledTheme).space400};
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space200};
`;

const DropdownRow = styled.button`
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

const DropdownRowIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
`;

const DropdownRowText = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
`;

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

const DesktopHomeDemo422: React.FC = () => {
  const { theme } = useTheme();
  const promptRef = useRef<HTMLTextAreaElement>(null);
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
  const [userIdx, setUserIdx] = useState(2);
  const [personaHudOpen, setPersonaHudOpen] = useState(false);

  const [customShortcuts, setCustomShortcuts] = useState<CustomShortcut[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createUrl, setCreateUrl] = useState('');
  const [createName, setCreateName] = useState('');
  const [createUrlError, setCreateUrlError] = useState('');
  const [createUrlTouched, setCreateUrlTouched] = useState(false);
  const [pulseDrawerOpen, setPulseDrawerOpen] = useState(false);
  const [shortcutsDropdownOpen, setShortcutsDropdownOpen] = useState(false);
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState(0);
  const [analyticsFilters, setAnalyticsFilters] = useState<Record<number, DashboardFilterDef[]>>(
    () => Object.fromEntries(Object.entries(DASHBOARD_TAB_FILTERS).map(([k, v]) => [Number(k), [...v.filters]])),
  );

  const user = SAMPLE_USERS[userIdx];
  const enabledApps = useMemo(() => new Set(user.enabledApps ?? []), [user.enabledApps]);
  const skuFlags = enabledAppsToSkuFlags(enabledApps);
  const { actions: quickActions, all: allQuickActionsRaw } = getQuickActions({
    persona: user.persona,
    skuFlags,
    onboarding: user.onboarding ?? false,
    maxCount: 4,
  });

  const [promptValue, setPromptValue] = useState('');
  const [promptFocused, setPromptFocused] = useState(false);
  const promptWrapRef = useRef<HTMLDivElement>(null);

  const [qaFavorites, setQaFavorites] = useState<Set<string>>(() => new Set(quickActions.map(a => a.id)));
  useEffect(() => {
    setQaFavorites(new Set(quickActions.map(a => a.id)));
  }, [user.persona]);

  const suggestions = SUGGESTIONS_BY_PERSONA[user.persona] ?? DEFAULT_SUGGESTIONS;

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

  const handleDropdownItemClick = (text: string) => {
    setPromptValue(text);
    setPromptFocused(false);
    promptRef.current?.blur();
  };


  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (promptWrapRef.current && !promptWrapRef.current.contains(e.target as Node)) {
        setPromptFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        <PromptWrap ref={promptWrapRef}>
          <PromptCard $dropdownOpen={promptFocused && !promptValue} onClick={() => promptRef.current?.focus()}>
            <svg width="20" height="20" viewBox="0 0 26 26" fill="none" style={{ flexShrink: 0 }}>
              <path d="M6.46408 13.0041C10.4723 12.3102 13.7947 9.62068 15.3717 5.99496C14.2054 4.2129 13.3799 2.18447 13.0021 0C11.8563 6.62731 6.62835 11.8544 0 13.0041C6.62835 14.1539 11.8563 19.381 13.0062 26.0083C13.384 23.8238 14.2095 21.7954 15.3758 20.0133C13.7947 16.3876 10.4764 13.6981 6.46819 13.0041H6.46408ZM18.4682 5.46527C17.8029 9.30862 14.7721 12.3389 10.9282 13.0041C14.7721 13.6693 17.7988 16.6997 18.4682 20.543C19.1335 16.6997 22.1643 13.6693 26.0083 13.0041C22.1643 12.3389 19.1376 9.30862 18.4682 5.46527Z" fill={(theme as any).colorPrimary} />
            </svg>
            <PromptInput
              ref={promptRef}
              id="home-prompt"
              placeholder="Describe what you want to get done..."
              rows={1}
              value={promptValue}
              onChange={e => setPromptValue(e.target.value)}
              onFocus={() => setPromptFocused(true)}
            />
            <Button.Icon
              icon={Icon.TYPES.ARROW_UP}
              aria-label="Submit"
              appearance={Button.APPEARANCES.PRIMARY}
              size={Button.SIZES.S}
              onClick={(e: React.MouseEvent) => { e.stopPropagation(); }}
            />
          </PromptCard>
          <PromptDropdown $visible={promptFocused && !promptValue}>
            <PromptDivider />
            {suggestions.map(text => (
              <DropdownRow key={text} onClick={() => handleDropdownItemClick(text)}>
                <DropdownRowIcon>
                  ↪
                </DropdownRowIcon>
                <DropdownRowText>{text}</DropdownRowText>
              </DropdownRow>
            ))}
          </PromptDropdown>
        </PromptWrap>
        <ShortcutsSection>
          <ShortcutsHeader>
            <ShortcutsLabel>Recently visited</ShortcutsLabel>
            <ShortcutsDropdownToggle onClick={() => setShortcutsDropdownOpen(prev => !prev)}>
              <Icon type={Icon.TYPES.DOUBLE_CHEVRON} size={16} color="currentColor" />
            </ShortcutsDropdownToggle>
            {shortcutsDropdownOpen && (
              <ShortcutsDropdownMenu>
                <ShortcutsDropdownItem $active onClick={() => setShortcutsDropdownOpen(false)}>
                  Recently visited
                </ShortcutsDropdownItem>
                <ShortcutsDropdownItem onClick={() => setShortcutsDropdownOpen(false)}>
                  Most visited
                </ShortcutsDropdownItem>
                <ShortcutsDropdownItem onClick={() => setShortcutsDropdownOpen(false)}>
                  Pinned shortcuts
                </ShortcutsDropdownItem>
              </ShortcutsDropdownMenu>
            )}
          </ShortcutsHeader>
          <ShortcutsStrip>
          {[
            ...allQuickActionsRaw.filter(a => qaFavorites.has(a.id)).map(a => ({ id: a.id, label: a.label, icon: QUICK_ACTION_ICONS[a.id] || Icon.TYPES.LINK_OUTLET, url: undefined as string | undefined })),
            ...customShortcuts.filter(s => qaFavorites.has(s.id)).map(s => ({ id: s.id, label: s.label, icon: Icon.TYPES.LINK_OUTLET, url: s.url })),
          ].map((item, i) => (
            <QATile key={item.id} $index={i} href={item.url} target={item.url ? '_blank' : undefined} rel={item.url ? 'noopener noreferrer' : undefined}>
              <QAIconBox>
                  <Icon
                    type={item.icon}
                    size={16}
                    color={(theme as any).colorOnSurface}
                  />
                </QAIconBox>
                <QALabel>{item.label}</QALabel>
                <Icon type={Icon.TYPES.CHEVRON_RIGHT} size={16} color={(theme as any).colorOnSurface} />
              </QATile>
            ))}
            <ShortcutsEditButton>
              <Button.Icon
                icon={Icon.TYPES.LIST_OUTLINE}
                aria-label="View all recently visited"
                tip="View all recently visited"
                appearance={Button.APPEARANCES.GHOST}
                size={Button.SIZES.S}
                onClick={() => setQaDrawerOpen(true)}
              />
            </ShortcutsEditButton>
          </ShortcutsStrip>
        </ShortcutsSection>
      </HomeContent>

      <AnalyticsSection>
        <AnalyticsTitleAndTabs>
          <AnalyticsSectionHeader>
            <AnalyticsSectionTitle>Analytics</AnalyticsSectionTitle>
            <AnalyticsSectionActions>
              <Button.Icon
                icon={Icon.TYPES.SETTINGS_OUTLINE}
                aria-label="Dashboard settings"
                appearance={Button.APPEARANCES.GHOST}
                size={Button.SIZES.S}
              />
              <Button
                appearance={Button.APPEARANCES.OUTLINE}
                size={Button.SIZES.S}
              >
                All dashboards
              </Button>
            </AnalyticsSectionActions>
          </AnalyticsSectionHeader>
          <AnalyticsTabRow>
          <Tabs activeIndex={activeAnalyticsTab} onChange={(idx: number) => setActiveAnalyticsTab(idx)}>
            <Tabs.Tab title="Q1 Headcount by Department" />
            <Tabs.Tab title="Revenue Overview" />
            <Tabs.Tab title="Sales Pipeline" />
            <Tabs.Tab title="+" />
          </Tabs>
        </AnalyticsTabRow>
        </AnalyticsTitleAndTabs>

        <DashboardContentWrap>
        <DashboardHeaderRow>
          <DashboardHeaderTitle>{DASHBOARD_TAB_NAMES[activeAnalyticsTab]}</DashboardHeaderTitle>
          <DashboardHeaderRight>
            <DashboardHeaderTimestamp>{DASHBOARD_TAB_FILTERS[activeAnalyticsTab]?.lastEdited ?? ''}</DashboardHeaderTimestamp>
            <Button.Icon
              icon={Icon.TYPES.REFRESH_OUTLINE}
              aria-label="Refresh"
              appearance={Button.APPEARANCES.GHOST}
              size={Button.SIZES.S}
            />
            <Button.Icon
              icon={Icon.TYPES.FILTER}
              aria-label="Filters"
              appearance={Button.APPEARANCES.GHOST}
              size={Button.SIZES.S}
            />
            <Button.Icon
              icon={Icon.TYPES.MORE_HORIZONTAL}
              aria-label="More options"
              appearance={Button.APPEARANCES.GHOST}
              size={Button.SIZES.S}
            />
          </DashboardHeaderRight>
        </DashboardHeaderRow>

        <DashboardFiltersRow>
          {(analyticsFilters[activeAnalyticsTab] ?? []).map(f => (
            <SplitButton
              key={f.id}
              appearance={SplitButton.APPEARANCES.OUTLINE}
              size={SplitButton.SIZES.XS}
              dropdownIcon={Icon.TYPES.CLOSE}
              dropdownList={[{ label: 'Remove filter', value: f.id }]}
              onDropdownChange={() => {
                setAnalyticsFilters(prev => ({
                  ...prev,
                  [activeAnalyticsTab]: prev[activeAnalyticsTab].filter(x => x.id !== f.id),
                }));
              }}
              trailingAriaLabel={`Remove ${f.label} filter`}
            >
              {f.label}
            </SplitButton>
          ))}
          <DashboardAddFilterButton>+ Filter</DashboardAddFilterButton>
        </DashboardFiltersRow>

        <DashboardGrid>
          <ChartCard>
            <ChartHeader>
              <ChartTitle><ChartDot $color="#7A005D" /> Headcount trend</ChartTitle>
              <Button.Icon icon={Icon.TYPES.MORE_VERTICAL} aria-label="More" appearance={Button.APPEARANCES.GHOST} size={Button.SIZES.XS} />
            </ChartHeader>
            <ChartArea>
              <ChartYAxis theme={theme}>
                <span>80</span><span>60</span><span>40</span><span>20</span>
              </ChartYAxis>
              <ChartBody theme={theme}>
                <ChartGridLine theme={theme} style={{ top: '25%' }} />
                <ChartGridLine theme={theme} style={{ top: '50%' }} />
                <ChartGridLine theme={theme} style={{ top: '75%' }} />
                <LineChartSvg color="#7A005D" data={HEADCOUNT_DATA} />
              </ChartBody>
              <ChartXAxis theme={theme}>
                <span>Jul</span><span>Sep</span><span>Nov</span><span>Jan</span><span>Mar</span>
              </ChartXAxis>
            </ChartArea>
          </ChartCard>

          <ChartCard>
            <ChartHeader>
              <ChartTitle><ChartDot $color="#7A005D" /> Revenue by quarter</ChartTitle>
              <Button.Icon icon={Icon.TYPES.MORE_VERTICAL} aria-label="More" appearance={Button.APPEARANCES.GHOST} size={Button.SIZES.XS} />
            </ChartHeader>
            <ChartArea>
              <ChartYAxis theme={theme}>
                <span>$300K</span><span>$200K</span><span>$100K</span><span>$0</span>
              </ChartYAxis>
              <ChartBody theme={theme}>
                <ChartGridLine theme={theme} style={{ top: '25%' }} />
                <ChartGridLine theme={theme} style={{ top: '50%' }} />
                <ChartGridLine theme={theme} style={{ top: '75%' }} />
                <BarChartSvg color="#7A005D" data={REVENUE_DATA} />
              </ChartBody>
              <ChartXAxis theme={theme}>
                <span>Jul</span><span>Sep</span><span>Nov</span><span>Jan</span><span>Mar</span>
              </ChartXAxis>
            </ChartArea>
          </ChartCard>

          <ChartCard $span={2}>
            <ChartHeader>
              <ChartTitle><ChartDot $color="#7A005D" /> Attrition risk vs tenure</ChartTitle>
              <Button.Icon icon={Icon.TYPES.MORE_VERTICAL} aria-label="More" appearance={Button.APPEARANCES.GHOST} size={Button.SIZES.XS} />
            </ChartHeader>
            <ChartArea>
              <ChartYAxis theme={theme}>
                <span>5</span><span>4</span><span>3</span><span>2</span><span>1</span>
              </ChartYAxis>
              <ChartBody theme={theme}>
                <ChartGridLine theme={theme} style={{ top: '20%' }} />
                <ChartGridLine theme={theme} style={{ top: '40%' }} />
                <ChartGridLine theme={theme} style={{ top: '60%' }} />
                <ChartGridLine theme={theme} style={{ top: '80%' }} />
                <ScatterChartSvg color="#7A005D" data={ATTRITION_DATA} />
              </ChartBody>
              <ChartXAxis theme={theme}>
                <span>0–6 mo</span><span>6–12 mo</span><span>1–2 yr</span><span>2–3 yr</span><span>3–5 yr</span><span>5+ yr</span>
              </ChartXAxis>
            </ChartArea>
          </ChartCard>

          <ChartCard $span={2} style={{ padding: 0, paddingTop: (theme as any).space500 }}>
            <ChartHeader style={{ padding: `0 ${(theme as any).space500}`, marginBottom: (theme as any).space200 }}>
              <ChartTitle>Headcount by department</ChartTitle>
              <Button.Icon icon={Icon.TYPES.MORE_VERTICAL} aria-label="More" appearance={Button.APPEARANCES.GHOST} size={Button.SIZES.XS} />
            </ChartHeader>
            <DashboardTable>
              <thead>
                <tr>
                  <DashboardTh>Department</DashboardTh>
                  <DashboardTh>Headcount</DashboardTh>
                  <DashboardTh>New hires</DashboardTh>
                  <DashboardTh>Attrition</DashboardTh>
                  <DashboardTh>Open roles</DashboardTh>
                  <DashboardTh>QoQ change</DashboardTh>
                </tr>
              </thead>
              <tbody>
                {DEPT_TABLE_DATA.map(row => (
                  <tr key={row.dept}>
                    <DashboardTd style={{ fontWeight: 600 }}>{row.dept}</DashboardTd>
                    <DashboardTd>{row.headcount}</DashboardTd>
                    <DashboardTd>{row.newHires}</DashboardTd>
                    <DashboardTdMuted>{row.attrition}</DashboardTdMuted>
                    <DashboardTd>{row.openRoles}</DashboardTd>
                    <DashboardTd>
                      {row.trend !== 0 ? (
                        <TrendBadge $positive={row.trend > 0}>
                          <Icon type={row.trend > 0 ? Icon.TYPES.ARROW_UP : Icon.TYPES.ARROW_DOWN} size={12} color="currentColor" />
                          {Math.abs(row.trend)}%
                        </TrendBadge>
                      ) : (
                        <span style={{ color: (theme as any).colorOnSurfaceVariant }}>—</span>
                      )}
                    </DashboardTd>
                  </tr>
                ))}
              </tbody>
            </DashboardTable>
          </ChartCard>
        </DashboardGrid>
        </DashboardContentWrap>
      </AnalyticsSection>

      <ResourcesFooter>
        <ResourcesLabel>Company resources</ResourcesLabel>
        <ResourcesDivider />
        <ResourceLink onClick={() => setPulseDrawerOpen(true)} style={{ cursor: 'pointer' }}>Company Feed</ResourceLink>
        <ResourcesDivider />
        <ResourceLink href="#">Employee Handbook</ResourceLink>
        <ResourcesDivider />
        <ResourceLink href="#">Help Desk</ResourceLink>
      </ResourcesFooter>

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

export default DesktopHomeDemo422;
