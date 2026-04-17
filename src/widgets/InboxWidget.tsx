import React from 'react';
import styled from '@emotion/styled';
import Icon from '@rippling/pebble/Icon';
import { usePebbleTheme } from '@/utils/theme';
import type { PersonaId } from '@/data-models/types';

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

const AvatarCircle = styled.div<{ $bg: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ $bg }) => $bg};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
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

const InboxTaskMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  flex-wrap: wrap;
`;

const MetaBadge = styled.span<{ $variant?: 'warning' | 'error' | 'neutral' }>`
  font-size: 11px;
  font-weight: 600;
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  padding: 2px 6px;
  border-radius: 4px;
  background: ${({ $variant }) =>
    $variant === 'error' ? '#fde8e8' :
    $variant === 'warning' ? '#fef3cd' :
    '#f0f0f0'};
  color: ${({ $variant }) =>
    $variant === 'error' ? '#c0392b' :
    $variant === 'warning' ? '#856404' :
    '#555'};
`;

const MetaCategory = styled.span`
  font-size: 11px;
  font-weight: 400;
  color: ${({ theme }) => (theme as any).colorOnSurfaceVariant || 'rgba(0,0,0,0.5)'};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
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


const EMPLOYEE_TASKS = [
  { id: '1', title: 'Training and courses', subtitle: '2 items', due: '5d', icon: Icon.TYPES.STAR_OUTLINE },
  { id: '2', title: 'Complete survey', subtitle: 'Onsite event feedback', due: '12d', icon: Icon.TYPES.SURVEY_NEUTRAL_OUTLINE },
];

const AVATAR_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

interface AdminTask {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  description: string;
  badges: { label: string; variant: 'warning' | 'error' | 'neutral' }[];
  category: string;
}

const ADMIN_TASKS: AdminTask[] = [
  {
    id: '1',
    name: 'Lisa Thompson',
    initials: 'LT',
    avatarColor: AVATAR_COLORS[0],
    description: "Increase Robert Wilson's PTO balance to 20 days",
    badges: [{ label: 'Due: Jul 16, 2025', variant: 'warning' }],
    category: 'Time off approvals',
  },
  {
    id: '2',
    name: 'David Park',
    initials: 'DP',
    avatarColor: AVATAR_COLORS[1],
    description: '8h 30m time entry on Oct 26',
    badges: [],
    category: 'Time and Attendance approvals',
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    initials: 'ER',
    avatarColor: AVATAR_COLORS[2],
    description: 'Reimburse $30.00 (Alaska Airlines)',
    badges: [],
    category: 'Reimbursement approvals',
  },
  {
    id: '4',
    name: 'Sarah Johnson',
    initials: 'SJ',
    avatarColor: AVATAR_COLORS[3],
    description: '13h 57m time entry on Oct 28',
    badges: [{ label: 'Exceeds 12 hours', variant: 'error' }],
    category: 'Time and Attendance approvals',
  },
];

const ADMIN_PERSONAS: PersonaId[] = ['functional_admin', 'executive_owner'];

const InboxPreviewContent: React.FC<{ persona?: PersonaId; disabled?: boolean }> = ({ persona, disabled }) => {
  const { theme } = usePebbleTheme();
  const variantColor = theme.colorOnSurfaceVariant;
  const isAdmin = persona && ADMIN_PERSONAS.includes(persona);
  const dimStyle = disabled ? { opacity: 0.4 } as const : undefined;

  if (isAdmin) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        {ADMIN_TASKS.slice(0, 2).map(t => (
          <InboxTaskRow key={t.id}>
            <AvatarCircle $bg={t.avatarColor} style={dimStyle}>{t.initials}</AvatarCircle>
            <InboxTaskBody>
              <InboxTaskTitle>{t.name}</InboxTaskTitle>
              <InboxTaskSubtitle>{t.description}</InboxTaskSubtitle>
              <InboxTaskMeta>
                {t.badges.map((b, i) => (
                  <MetaBadge key={i} $variant={b.variant} style={dimStyle}>{b.label}</MetaBadge>
                ))}
                <MetaCategory>{t.category}</MetaCategory>
              </InboxTaskMeta>
            </InboxTaskBody>
          </InboxTaskRow>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {EMPLOYEE_TASKS.map(t => (
        <InboxTaskRow key={t.id}>
          <InboxTaskIcon style={dimStyle}>
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
    </div>
  );
};

export default InboxPreviewContent;
