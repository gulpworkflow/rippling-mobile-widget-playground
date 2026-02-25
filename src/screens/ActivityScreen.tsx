import React, { useState } from 'react';
import styled from '@emotion/styled';
import Checkbox from '@rippling/pebble/Inputs/Checkbox';
import Tabs from '@rippling/pebble/Tabs';
import { ListItemDetailList, type ListItemDetailProps } from '@/components/ListItemDetail';
import type { ActivityTab } from '@/data-models/types';

const TabViewHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 20px 12px;
  padding-right: 60px;
`;

const TabViewTitle = styled.h1`
  ${({ theme }) => (theme as any).typestyleV2TitleMedium};
  color: ${({ theme }) => (theme as any).colorOnSurface || '#1a1a1a'};
  margin: 0;
`;

const ACTIVITY_ITEMS: ListItemDetailProps[] = [
  {
    name: 'Rippling',
    subtext: 'Take new hire Sarah Kim out to lunch',
    label: { text: 'Due: Jul 16, 2025', appearance: 'error' },
    category: 'Miscellaneous tasks',
    timestamp: new Date(2025, 7, 2),
    prefix: { type: 'checkbox' },
  },
  {
    name: 'Lisa Thompson',
    subtext: "Increase Robert Wilson's PTO balance to 20 days",
    label: { text: 'Due: Jul 16, 2025', appearance: 'error' },
    category: 'Time off approvals',
    timestamp: new Date(2025, 7, 2),
    prefix: { type: 'checkbox' },
  },
  {
    name: 'David Park',
    subtext: '8h 30m time entry on Oct 26',
    category: 'Time and Attendance approvals',
    timestamp: new Date(2025, 7, 2),
    prefix: { type: 'checkbox' },
  },
  {
    name: 'Emily Rodriguez',
    subtext: 'Reimburse $30.00 (Alaska Airlines)',
    category: 'Reimbursement approvals',
    timestamp: new Date(2025, 7, 2),
    prefix: { type: 'checkbox' },
  },
  {
    name: 'Sarah Johnson',
    subtext: '13h 57m time entry on Oct 28',
    label: { text: 'Exceeds 12 hours', appearance: 'warning' },
    category: 'Time and Attendance approvals',
    timestamp: new Date(2025, 7, 2),
    prefix: { type: 'checkbox' },
  },
  {
    name: 'Michael Chen',
    subtext: 'Complete HIPAA compliance training',
    category: 'Training',
    timestamp: new Date(2025, 6, 15),
    prefix: { type: 'checkbox' },
  },
];

const ActivityListWrap = styled.div`
  padding: 0 16px;
`;

const ActivityCountBar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  margin: 0 16px 4px;
  border-radius: 10px;
  background: ${({ theme }) => (theme as any).colorSurfaceContainerLow || 'rgba(0,0,0,0.04)'};
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => (theme as any).colorOnSurface || '#1a1a1a'};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const ACTIVITY_TABS: { key: ActivityTab; title: string }[] = [
  { key: 'all', title: 'All' },
  { key: 'action_required', title: 'Action required' },
  { key: 'requests', title: 'My requests' },
];

const ActivityTabsWrap = styled.div`
  padding: 0 16px 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  &::-webkit-scrollbar { display: none; }
  scrollbar-width: none;

  li[data-active="true"] {
    background-image: linear-gradient(
      ${({ theme }) => (theme as any).colorPrimaryContainer || '#6750A4'},
      ${({ theme }) => (theme as any).colorPrimaryContainer || '#6750A4'}
    ) !important;
  }
`;

const ACTIVITY_ITEMS_BY_TAB: Record<ActivityTab, ListItemDetailProps[]> = {
  all: ACTIVITY_ITEMS,
  action_required: [
    ACTIVITY_ITEMS[0],
    ACTIVITY_ITEMS[1],
    ACTIVITY_ITEMS[2],
    ACTIVITY_ITEMS[3],
    ACTIVITY_ITEMS[4],
    ACTIVITY_ITEMS[5],
  ],
  requests: [],
};

const ActivityEmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  font-size: 14px;
  color: ${({ theme }) => (theme as any).colorOnSurfaceVariant || 'rgba(0,0,0,0.45)'};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const ActivityScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const tabKey = ACTIVITY_TABS[activeTab].key;
  const tabItems = ACTIVITY_ITEMS_BY_TAB[tabKey];

  const toggle = (i: number) => setSelected(prev => {
    const next = new Set(prev);
    if (next.has(i)) next.delete(i); else next.add(i);
    return next;
  });
  const allSelected = selected.size > 0 && selected.size === tabItems.length;
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(tabItems.map((_, i) => i)));

  const handleTabChange = (index: number | string) => {
    setActiveTab(Number(index));
    setSelected(new Set());
  };

  const items = tabItems.map((item, i) => ({
    ...item,
    prefix: {
      ...item.prefix!,
      checked: selected.has(i),
      onCheckChange: () => toggle(i),
    },
  }));

  return (
    <>
      <TabViewHeader>
        <TabViewTitle>Activity</TabViewTitle>
      </TabViewHeader>
      <ActivityTabsWrap>
        <Tabs.LINK activeIndex={activeTab} onChange={handleTabChange}>
          {ACTIVITY_TABS.map(t => (
            <Tabs.Tab key={t.key} title={t.title} />
          ))}
        </Tabs.LINK>
      </ActivityTabsWrap>
      {selected.size > 0 && (
        <ActivityCountBar>
          <Checkbox value={allSelected} onChange={toggleAll} />
          {selected.size} of {tabItems.length} selected
        </ActivityCountBar>
      )}
      <ActivityListWrap>
        {tabItems.length > 0 ? (
          <ListItemDetailList items={items} maxItems={16} />
        ) : (
          <ActivityEmptyState>No items</ActivityEmptyState>
        )}
      </ActivityListWrap>
    </>
  );
};

export default ActivityScreen;
