import React, { useState } from 'react';
import styled from '@emotion/styled';
import Icon from '@rippling/pebble/Icon';
import { usePebbleTheme } from '@/utils/theme';

const PushedScreen = styled.div<{ isOpen: boolean }>`
  position: absolute;
  inset: 0;
  z-index: 3000;
  background: ${({ theme }) => (theme as any).colorSurface || '#fff'};
  transform: translateX(${({ isOpen }) => (isOpen ? '0' : '100%')});
  transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ScreenNavBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 52px 12px 8px;
  flex-shrink: 0;
`;

const NavCircleButton = styled.button`
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 50%;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => (theme as any).colorSurfaceContainerLow || 'rgba(0,0,0,0.06)'};
  color: ${({ theme }) => (theme as any).colorOnSurfaceVariant || 'rgba(0,0,0,0.5)'};
`;

const HeaderArea = styled.div`
  padding: 4px 16px 12px;
  flex-shrink: 0;
`;

const HeaderEyebrow = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => (theme as any).colorOnSurfaceVariant || 'rgba(0,0,0,0.5)'};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  margin-bottom: 2px;
`;

const HeaderTitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderTitle = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: 22px;
  font-weight: 600;
  color: ${({ theme }) => (theme as any).colorOnSurface || '#000'};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.3;
`;

const WeekDayPicker = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px 12px;
  flex-shrink: 0;
`;

const DayCell = styled.button<{ $active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  min-width: 40px;
  background: ${({ $active, theme }) =>
    $active ? (theme as any).colorPrimaryContainer || '#6750A4' : 'transparent'};
  color: ${({ $active, theme }) =>
    $active ? (theme as any).colorOnPrimaryContainer || '#fff' : (theme as any).colorOnSurface || '#000'};
  transition: background 0.15s ease;
`;

const DayNumber = styled.span`
  font-size: 18px;
  font-weight: 600;
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.2;
`;

const DayLabel = styled.span`
  font-size: 11px;
  font-weight: 500;
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1;
  opacity: 0.7;
`;

const ShiftTabsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 16px 12px;
  flex-shrink: 0;
`;

const ShiftTab = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 100px;
  border: 1px solid ${({ $active, theme }) =>
    $active ? 'transparent' : (theme as any).colorOutlineVariant || 'rgba(0,0,0,0.12)'};
  background: ${({ $active, theme }) =>
    $active ? (theme as any).colorPrimaryContainer || '#6750A4' : 'transparent'};
  color: ${({ $active, theme }) =>
    $active ? (theme as any).colorOnPrimaryContainer || '#fff' : (theme as any).colorOnSurface || '#000'};
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  white-space: nowrap;
`;

const TabBadge = styled.span<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  background: ${({ $active, theme }) =>
    $active ? (theme as any).colorOnPrimaryContainer || '#fff' : (theme as any).colorPrimary || '#6750A4'};
  color: ${({ $active, theme }) =>
    $active ? (theme as any).colorPrimaryContainer || '#6750A4' : (theme as any).colorOnPrimary || '#fff'};
`;

const DateSectionHeader = styled.div`
  padding: 10px 16px;
  background: ${({ theme }) => (theme as any).colorSurfaceContainerHigh || 'rgba(0,0,0,0.08)'};
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${({ theme }) => (theme as any).colorOnSurfaceVariant || 'rgba(0,0,0,0.5)'};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const ShiftListArea = styled.div`
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`;

const ShiftRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid ${({ theme }) => (theme as any).colorOutlineVariant || 'rgba(0,0,0,0.08)'};
`;

const ShiftAccent = styled.div<{ color: string }>`
  width: 3px;
  height: 40px;
  border-radius: 2px;
  background: ${({ color }) => color};
  flex-shrink: 0;
`;

const ShiftIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme }) => (theme as any).colorSurfaceContainerLow || 'rgba(0,0,0,0.06)'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ShiftAvatarImg = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
`;

const ShiftBody = styled.div`
  flex: 1;
  min-width: 0;
`;

const ShiftName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => (theme as any).colorOnSurface || '#000'};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.3;
`;

const ShiftTime = styled.div`
  font-size: 14px;
  font-weight: 400;
  color: ${({ theme }) => (theme as any).colorOnSurface || '#000'};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.4;
`;

const ShiftSubtext = styled.div`
  font-size: 12px;
  font-weight: 400;
  color: ${({ theme }) => (theme as any).colorOnSurfaceVariant || 'rgba(0,0,0,0.5)'};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.4;
  margin-top: 1px;
`;

const DraftBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => (theme as any).colorWarning || '#e6a817'};
  border: 1px solid ${({ theme }) => (theme as any).colorWarning || '#e6a817'};
  border-radius: 100px;
  padding: 2px 8px;
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  margin-left: 8px;
`;

const DraftDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ theme }) => (theme as any).colorWarning || '#e6a817'};
`;

const ShiftChevron = styled.div`
  flex-shrink: 0;
  color: ${({ theme }) => (theme as any).colorOutlineVariant || 'rgba(0,0,0,0.2)'};
`;

const BottomToolbar = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px 28px;
  background: ${({ theme }) => {
    const surface = (theme as any).colorSurface || '#fff';
    return `linear-gradient(to bottom, ${surface}e0, ${surface})`;
  }};
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-top: 0.5px solid ${({ theme }) => (theme as any).colorOutlineVariant || 'rgba(0,0,0,0.08)'};
`;

const ToolbarEditButton = styled.button`
  height: 44px;
  padding: 0 20px;
  border-radius: 100px;
  border: 1px solid ${({ theme }) => (theme as any).colorOutlineVariant || 'rgba(0,0,0,0.12)'};
  background: ${({ theme }) => (theme as any).colorSurfaceBright || '#fff'};
  color: ${({ theme }) => (theme as any).colorOnSurface || '#000'};
  font-size: 14px;
  font-weight: 600;
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ToolbarAddButton = styled.button`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: ${({ theme }) => (theme as any).colorPrimaryContainer || '#6750A4'};
  color: ${({ theme }) => (theme as any).colorOnPrimaryContainer || '#fff'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
`;

function getWeekDays(): { number: number; label: string; isToday: boolean }[] {
  const now = new Date();
  const day = now.getDay();
  const start = new Date(now);
  start.setDate(now.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return {
      number: d.getDate(),
      label: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
      isToday: d.toDateString() === now.toDateString(),
    };
  });
}

function getTodayHeader(): string {
  const now = new Date();
  const day = now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const month = now.toLocaleDateString('en-US', { month: 'long' }).toUpperCase();
  return `${day}, ${month} ${now.getDate()}`;
}

interface ShiftItem {
  id: string;
  type: 'open' | 'person' | 'empty';
  name: string;
  time: string;
  subtext: string;
  avatar?: string;
  accentColor: string;
  draft?: boolean;
}

const ALL_SHIFTS: ShiftItem[] = [
  {
    id: '1',
    type: 'open',
    name: 'Open shift',
    time: '12:00 pm - 08:00 pm',
    subtext: 'No jobs scheduled',
    accentColor: '#4db6ac',
  },
  {
    id: '2',
    type: 'person',
    name: 'Chip Chipper',
    time: '12:00 pm - 08:00 pm',
    subtext: 'No jobs scheduled',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face',
    accentColor: '#4db6ac',
  },
  {
    id: '3',
    type: 'empty',
    name: 'Empty shift',
    time: '12:00 pm - 08:00 pm',
    subtext: 'No jobs scheduled',
    accentColor: '#9e9e9e',
    draft: true,
  },
  {
    id: '4',
    type: 'open',
    name: 'Open shift',
    time: '04:00 pm - 12:00 am',
    subtext: 'No jobs scheduled',
    accentColor: '#4db6ac',
  },
];

const MY_SHIFTS: ShiftItem[] = [
  {
    id: 'my-1',
    type: 'person',
    name: 'You',
    time: '09:00 am - 05:00 pm',
    subtext: 'Front counter',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
    accentColor: '#4db6ac',
  },
];

const OPEN_SHIFTS: ShiftItem[] = ALL_SHIFTS.filter(s => s.type === 'open');

const SHIFTS_BY_TAB: ShiftItem[][] = [ALL_SHIFTS, MY_SHIFTS, OPEN_SHIFTS];

const SHIFT_TABS = [
  { label: 'All shifts', count: 9 },
  { label: 'My shifts', count: 1 },
  { label: 'Open', count: 2 },
];

const TeamScheduleScreen: React.FC<{
  isOpen: boolean;
  onBack: () => void;
  onPush?: (screenId: string) => void;
}> = ({ isOpen, onBack }) => {
  const { theme } = usePebbleTheme();
  const [activeTab, setActiveTab] = useState(0);
  const weekDays = getWeekDays();

  return (
    <PushedScreen isOpen={isOpen}>
      <ScreenNavBar>
        <NavCircleButton onClick={onBack} aria-label="Back">
          <Icon type={Icon.TYPES.CHEVRON_LEFT} size={24} color={theme.colorOnSurfaceVariant} />
        </NavCircleButton>
        <NavCircleButton aria-label="Filter">
          <Icon type={Icon.TYPES.FILTER} size={22} color={theme.colorOnSurfaceVariant} />
        </NavCircleButton>
      </ScreenNavBar>

      <HeaderArea>
        <HeaderEyebrow>Schedules</HeaderEyebrow>
        <HeaderTitleRow>
          <HeaderTitle type="button">
            All Schedules
            <Icon type={Icon.TYPES.CHEVRON_DOWN} size={20} color={theme.colorOnSurface} />
          </HeaderTitle>
        </HeaderTitleRow>
      </HeaderArea>

      <WeekDayPicker>
        {weekDays.map(d => (
          <DayCell key={d.label} $active={d.isToday}>
            <DayNumber>{d.number}</DayNumber>
            <DayLabel>{d.label}</DayLabel>
          </DayCell>
        ))}
      </WeekDayPicker>

      <ShiftTabsRow>
        {SHIFT_TABS.map((tab, i) => (
          <ShiftTab key={tab.label} $active={i === activeTab} onClick={() => setActiveTab(i)}>
            {tab.label}
            <TabBadge $active={i === activeTab}>{tab.count}</TabBadge>
          </ShiftTab>
        ))}
      </ShiftTabsRow>

      <ShiftListArea>
        <DateSectionHeader>{getTodayHeader()}</DateSectionHeader>
        {(SHIFTS_BY_TAB[activeTab] ?? ALL_SHIFTS).map(shift => (
          <ShiftRow key={shift.id}>
            <ShiftAccent color={shift.accentColor} />
            {shift.type === 'person' && shift.avatar ? (
              <ShiftAvatarImg src={shift.avatar} alt={shift.name} />
            ) : (
              <ShiftIcon>
                <Icon
                  type={shift.type === 'open' ? Icon.TYPES.USER_OUTLINE : Icon.TYPES.CANCEL_OUTLINE}
                  size={20}
                  color={theme.colorOnSurfaceVariant}
                />
              </ShiftIcon>
            )}
            <ShiftBody>
              <ShiftName>{shift.name}</ShiftName>
              <ShiftTime>{shift.time}</ShiftTime>
              <ShiftSubtext>{shift.subtext}</ShiftSubtext>
            </ShiftBody>
            {shift.draft && (
              <DraftBadge><DraftDot />DRAFT</DraftBadge>
            )}
            <ShiftChevron>
              <Icon type={Icon.TYPES.CHEVRON_RIGHT} size={20} color={theme.colorOutlineVariant} />
            </ShiftChevron>
          </ShiftRow>
        ))}
      </ShiftListArea>

      <BottomToolbar>
        {activeTab === 1 ? (
          <ToolbarEditButton type="button">
            <Icon type={Icon.TYPES.SWAP} size={18} color={theme.colorOnSurface} />
            Edit Availability
          </ToolbarEditButton>
        ) : (
          <>
            <ToolbarEditButton type="button">
              <Icon type={Icon.TYPES.DOCUMENT_OUTLINE} size={18} color={theme.colorOnSurface} />
              View timesheets
            </ToolbarEditButton>
            <ToolbarAddButton type="button" aria-label="Add shift">
              <Icon type={Icon.TYPES.ADD} size={24} color={theme.colorOnPrimaryContainer} />
            </ToolbarAddButton>
          </>
        )}
      </BottomToolbar>
    </PushedScreen>
  );
};

export default TeamScheduleScreen;
