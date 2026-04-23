import React from 'react';
import styled from '@emotion/styled';

export type OnboardingTask = {
  id: string;
  label: string;
  dueLabel: string;
  done?: boolean;
  urgent?: boolean;
};

const DEFAULT_TASKS: OnboardingTask[] = [
  { id: 'i9', label: 'Sign I-9', dueLabel: 'Apr 12', done: true },
  { id: 'w4', label: 'W-4 tax withholding', dueLabel: 'Apr 12', done: true },
  { id: 'direct_deposit', label: 'Direct deposit', dueLabel: 'Apr 13', done: true },
  { id: 'benefits', label: 'Enroll in benefits', dueLabel: '2d left', urgent: true },
  { id: 'handbook', label: 'Handbook acknowledgment', dueLabel: 'Apr 20' },
];

const Summary = styled.div`
  display: flex;
  align-items: baseline;
  gap: 6px;
  padding: 2px 0 10px;
`;

const SummaryPrimary = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => (theme as any).colorOnSurface || '#000'};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.2;
  letter-spacing: -0.01em;
`;

const SummarySecondary = styled.span`
  font-size: 14px;
  font-weight: 400;
  color: ${({ theme }) => (theme as any).colorOnSurfaceVariant || 'rgba(0, 0, 0, 0.55)'};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.3;
`;

const ProgressTrack = styled.div`
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background: ${({ theme }) => (theme as any).colorSurfaceContainerHigh || 'rgba(0, 0, 0, 0.08)'};
  overflow: hidden;
  margin-bottom: 6px;
`;

const ProgressFill = styled.div<{ $pct: number }>`
  width: ${({ $pct }) => `${$pct}%`};
  height: 100%;
  background: ${({ theme }) => (theme as any).colorPrimary || '#7a005d'};
  border-radius: 999px;
  transition: width 200ms ease;
`;

const TaskList = styled.div`
  display: flex;
  flex-direction: column;
`;

const TaskRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid ${({ theme }) => (theme as any).colorOutlineVariant || 'rgba(0, 0, 0, 0.08)'};

  &:last-of-type {
    border-bottom: none;
  }
`;

const CheckBox = styled.div<{ $checked?: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 5px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $checked, theme }) => $checked
    ? ((theme as any).colorPrimary || '#7a005d')
    : 'transparent'};
  border: ${({ $checked, theme }) => $checked
    ? '1px solid transparent'
    : `1.5px solid ${(theme as any).colorOutlineVariant || 'rgba(0, 0, 0, 0.25)'}`};
`;

const CheckMark: React.FC = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
    <path
      d="M2.5 6.25L5 8.5L9.5 3.5"
      stroke="white"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TaskLabel = styled.span<{ $done?: boolean }>`
  flex: 1;
  min-width: 0;
  font-size: 14px;
  font-weight: ${({ $done }) => ($done ? 400 : 500)};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.3;
  color: ${({ $done, theme }) => $done
    ? ((theme as any).colorOnSurfaceVariant || 'rgba(0, 0, 0, 0.45)')
    : ((theme as any).colorOnSurface || '#000')};
  text-decoration: ${({ $done }) => ($done ? 'line-through' : 'none')};
`;

const DueLabel = styled.span<{ $urgent?: boolean; $done?: boolean }>`
  font-size: 12px;
  font-weight: ${({ $urgent }) => ($urgent ? 600 : 400)};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  flex-shrink: 0;
  color: ${({ $urgent, $done, theme }) => {
    if ($urgent) return (theme as any).colorError || '#b3261e';
    if ($done) return (theme as any).colorOnSurfaceVariant || 'rgba(0, 0, 0, 0.45)';
    return (theme as any).colorOnSurfaceVariant || 'rgba(0, 0, 0, 0.55)';
  }};
`;

interface Props {
  tasks?: OnboardingTask[];
  maxVisible?: number;
  disabled?: boolean;
}

const OnboardingContent: React.FC<Props> = ({ tasks = DEFAULT_TASKS, maxVisible = 5 }) => {
  const total = tasks.length;
  const completed = tasks.filter(t => t.done).length;
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  const dueTask = tasks.find(t => !t.done);
  const dueLabel = dueTask?.dueLabel ?? '—';
  const visible = tasks.slice(0, maxVisible);

  return (
    <div>
      <Summary>
        <SummaryPrimary>{completed} of {total} done</SummaryPrimary>
        <SummarySecondary>· Due {dueLabel}</SummarySecondary>
      </Summary>
      <ProgressTrack>
        <ProgressFill $pct={pct} />
      </ProgressTrack>
      <TaskList>
        {visible.map(task => (
          <TaskRow key={task.id}>
            <CheckBox $checked={!!task.done} aria-hidden>
              {task.done && <CheckMark />}
            </CheckBox>
            <TaskLabel $done={task.done}>{task.label}</TaskLabel>
            <DueLabel $urgent={task.urgent} $done={task.done}>{task.dueLabel}</DueLabel>
          </TaskRow>
        ))}
      </TaskList>
    </div>
  );
};

export default OnboardingContent;
