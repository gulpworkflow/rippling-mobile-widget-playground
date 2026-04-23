import React from 'react';
import styled from '@emotion/styled';
import Icon from '@rippling/pebble/Icon';

type Shift = {
  day: string;
  date: string;
  time: string;
  hours: string;
  today?: boolean;
};

const DEFAULT_SHIFTS: Shift[] = [
  { day: 'Mon', date: 'Apr 7', time: '9:00 AM – 5:00 PM', hours: '8h', today: true },
  { day: 'Tue', date: 'Apr 8', time: 'Off', hours: '' },
  { day: 'Wed', date: 'Apr 9', time: '11:00 AM – 7:00 PM', hours: '8h' },
  { day: 'Thu', date: 'Apr 10', time: 'Off', hours: '' },
  { day: 'Fri', date: 'Apr 11', time: '9:00 AM – 3:00 PM', hours: '6h' },
];

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid ${({ theme }) => (theme as any).colorOutlineVariant || 'rgba(0,0,0,0.08)'};
  &:last-of-type { border-bottom: none; }
`;

const DayBadge = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${({ theme }) => (theme as any).colorSurfaceDim || 'rgba(0,0,0,0.06)'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const DayLabel = styled.span`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.3px;
  color: ${({ theme }) => (theme as any).colorOnSurfaceVariant || 'rgba(0,0,0,0.6)'};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const Body = styled.div<{ $muted?: boolean }>`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: ${({ $muted }) => $muted ? 400 : 600};
  opacity: ${({ $muted }) => $muted ? 0.55 : 1};
  color: ${({ theme }) => (theme as any).colorOnSurface || '#000'};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const Hours = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => (theme as any).colorOnSurfaceVariant || 'rgba(0,0,0,0.5)'};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  flex-shrink: 0;
`;

const TodayDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ theme }) => (theme as any).colorPrimary || '#7a005d'};
  flex-shrink: 0;
`;

const ScheduleContent: React.FC<{ shifts?: Shift[]; disabled?: boolean }> = ({ shifts = DEFAULT_SHIFTS }) => (
  <div>
    {shifts.map(shift => {
      const isOff = shift.time === 'Off';
      return (
        <Row key={shift.day}>
          <DayBadge>
            <DayLabel>{shift.day.toUpperCase()}</DayLabel>
          </DayBadge>
          <Body $muted={isOff}>
            {shift.today && <TodayDot aria-label="Today" />}
            <span>{shift.time}</span>
            {!isOff && (
              <Icon
                type={Icon.TYPES.SWAP}
                size={14}
                color="currentColor"
                style={{ flexShrink: 0, opacity: 0.6 }}
              />
            )}
          </Body>
          {shift.hours && <Hours>{shift.hours}</Hours>}
        </Row>
      );
    })}
  </div>
);

export default ScheduleContent;
