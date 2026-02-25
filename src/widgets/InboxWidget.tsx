import React from 'react';
import styled from '@emotion/styled';
import Icon from '@rippling/pebble/Icon';
import { usePebbleTheme } from '@/utils/theme';

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

export default InboxPreviewContent;
