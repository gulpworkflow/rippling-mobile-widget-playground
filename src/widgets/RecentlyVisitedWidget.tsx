import React from 'react';
import styled from '@emotion/styled';
import Icon from '@rippling/pebble/Icon';
import { usePebbleTheme } from '@/utils/theme';

interface RecentItem {
  id: string;
  name: string;
  context?: string;
  icon: string;
}

const RECENT_ITEMS: RecentItem[] = [
  { id: '1', name: 'Bills', context: 'Finance', icon: Icon.TYPES.CREDIT_CARD_OUTLINE },
  { id: '2', name: 'COBRA', context: 'Benefits', icon: Icon.TYPES.HEART_OUTLINE },
  { id: '3', name: 'Payroll overview', icon: Icon.TYPES.DOLLAR_CIRCLE_OUTLINE },
  { id: '4', name: 'Headcount planning', context: 'Reports', icon: Icon.TYPES.BAR_CHART_OUTLINE },
  { id: '5', name: 'Time off balances', context: 'Time', icon: Icon.TYPES.CALENDAR_OUTLINE },
];

const Row = styled.a`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
`;

const RowLabel = styled.span`
  font-size: 14px;
  font-weight: 400;
  color: ${({ theme }) => (theme as any).colorOnSurface || '#000'};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  flex: 1;
`;

const RowContext = styled.span`
  color: ${({ theme }) => (theme as any).colorOnSurfaceVariant || 'rgba(0,0,0,0.5)'};
`;

const RecentlyVisitedContent: React.FC<{ disabled?: boolean }> = ({ disabled }) => {
  const { theme } = usePebbleTheme();
  const iconColor = theme.colorOnSurface;
  const dimStyle = disabled ? { opacity: 0.4 } as const : undefined;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', ...dimStyle }}>
      {RECENT_ITEMS.map(item => (
        <Row key={item.id} href="#" onClick={(e) => e.preventDefault()}>
          <Icon type={item.icon} size={16} color={iconColor} style={{ flexShrink: 0 }} />
          <RowLabel>
            {item.name}
            {item.context && <RowContext> in {item.context}</RowContext>}
          </RowLabel>
        </Row>
      ))}
    </div>
  );
};

export default RecentlyVisitedContent;
