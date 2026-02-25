import React from 'react';
import styled from '@emotion/styled';
import Icon from '@rippling/pebble/Icon';
import type { QuickAction, QuickActionId } from '@/data-models/quick-actions';

export const ShortcutsGrid = styled.div<{ scrollable?: boolean }>`
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

export const ShortcutItem = styled.div<{ $scrollable?: boolean }>`
  flex: ${({ $scrollable }) => ($scrollable ? '0 0 auto' : '1')};
  max-width: ${({ $scrollable }) => ($scrollable ? '70px' : 'none')};
  cursor: ${({ $scrollable }) => ($scrollable ? 'pointer' : 'default')};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding-top: 8px;
`;

export const ShortcutIconCircle = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: ${({ theme }) => (theme as any).colorSurfaceDim || 'rgba(0, 0, 0, 0.06)'};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ShortcutLabel = styled.span`
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

export const QUICK_ACTION_ICONS: Record<QuickActionId, string> = {
  request_time_off: Icon.TYPES.UNLIMITED_PTO_OUTLINE,
  view_my_schedule: Icon.TYPES.CALENDAR_OUTLINE,
  view_my_timecard: Icon.TYPES.TIME_OUTLINE,
  view_pto_balances: Icon.TYPES.UNLIMITED_PTO_OUTLINE,
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

export const PRODUCT_DISPLAY_NAMES: Record<string, string> = {
  Spend: 'Spend',
  Time: 'Time off',
  Payroll: 'My Pay',
  Benefits: 'My Benefits',
  HR: 'HR',
  Travel: 'Travel',
};

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

export default ShortcutsContent;
