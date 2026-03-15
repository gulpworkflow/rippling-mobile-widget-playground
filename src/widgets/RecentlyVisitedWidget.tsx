import React from 'react';
import styled from '@emotion/styled';
import Icon from '@rippling/pebble/Icon';
import { usePebbleTheme } from '@/utils/theme';

const VisitedRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 0;
  border-bottom: 1px solid ${({ theme }) => (theme as any).colorOutlineVariant || 'rgba(0,0,0,0.08)'};
  &:last-of-type {
    border-bottom: none;
  }
`;

const VisitedIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: ${({ theme }) => (theme as any).colorSurfaceBright || '#fff'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const VisitedBody = styled.div`
  flex: 1;
  min-width: 0;
`;

const VisitedTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => (theme as any).colorOnSurface || '#000'};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const VisitedSubtitle = styled.div`
  font-size: 12px;
  font-weight: 400;
  color: ${({ theme }) => (theme as any).colorOnSurfaceVariant || 'rgba(0,0,0,0.5)'};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.3;
  margin-top: 1px;
`;

const ChevronWrap = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
`;

interface RecentItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
}

const RECENT_ITEMS: RecentItem[] = [
  {
    id: '1',
    title: 'Headcount planning',
    subtitle: 'Report · Updated 2d ago',
    icon: Icon.TYPES.TABLE_OUTLINE,
  },
  {
    id: '2',
    title: 'Payroll summary — Oct',
    subtitle: 'Dashboard · Updated 3d ago',
    icon: Icon.TYPES.HOME_OUTLINE,
  },
  {
    id: '3',
    title: 'Benefits enrollment status',
    subtitle: 'Report · Updated 5d ago',
    icon: Icon.TYPES.CHECKBOX_WITHCHECK_OUTLINE,
  },
  {
    id: '4',
    title: 'Time off balances — all employees',
    subtitle: 'Report · Updated 1w ago',
    icon: Icon.TYPES.CALENDAR_OUTLINE,
  },
];

const RecentlyVisitedContent: React.FC = () => {
  const { theme } = usePebbleTheme();
  const variantColor = theme.colorOnSurfaceVariant;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {RECENT_ITEMS.map(item => (
        <VisitedRow key={item.id}>
          <VisitedIcon>
            <Icon type={item.icon} size={18} color={variantColor} />
          </VisitedIcon>
          <VisitedBody>
            <VisitedTitle>{item.title}</VisitedTitle>
            <VisitedSubtitle>{item.subtitle}</VisitedSubtitle>
          </VisitedBody>
          <ChevronWrap>
            <Icon type={Icon.TYPES.CHEVRON_RIGHT} size={16} color={variantColor} />
          </ChevronWrap>
        </VisitedRow>
      ))}
    </div>
  );
};

export default RecentlyVisitedContent;
