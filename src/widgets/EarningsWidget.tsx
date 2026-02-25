import React from 'react';
import styled from '@emotion/styled';
import type { PersonaId } from '@/data-models/types';

const EarningsMainValue = styled.div`
  ${({ theme }) => {
    const t = (theme as any).typestyleV2TitleSmall;
    return t
      ? `font-size: ${t.fontSize}; font-weight: ${t.fontWeight}; font-family: ${t.fontFamily}; line-height: ${t.lineHeight};`
      : 'font-size: 18px; font-weight: 600; font-family: Basel Grotesk; line-height: 22px;';
  }}
  color: ${({ theme }) => (theme as any).colorOnSurface || '#000'};
  margin-bottom: 12px;
`;

const EarningsSegmentedBar = styled.div`
  display: flex;
  height: 4px;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 6px;
  background: ${({ theme }) => (theme as any).colorSurfaceDim || 'rgba(0,0,0,0.06)'};
`;

const EarningsSegment = styled.div<{ width: number; color: string }>`
  width: ${({ width }) => width}%;
  min-width: ${({ width }) => (width > 0 ? 4 : 0)}px;
  background: ${({ color }) => color};
  transition: width 0.2s ease;
`;

const EarningsBreakdownRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0 0;
`;

const EarningsBreakdownDot = styled.span<{ color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ color }) => color};
  flex-shrink: 0;
`;

const EarningsBreakdownLabel = styled.span`
  flex: 1;
  font-size: 14px;
  font-weight: 400;
  color: ${({ theme }) => (theme as any).colorOnSurface || '#000'};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const EarningsBreakdownValue = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => (theme as any).colorOnSurface || '#000'};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const EARNINGS_COLORS = {
  blue: '#1e3a5f',
  yellow: '#e6b84c',
  green: '#4db6ac',
  purple: '#b39ddb',
};

const EARNINGS_HOURLY = {
  mainValue: 'Next paycheck in 3 days: $1,480',
  segments: [
    { width: 80, color: EARNINGS_COLORS.blue },
    { width: 20, color: EARNINGS_COLORS.purple },
  ],
  rows: [
    { label: 'Regular', value: '$12,250', color: EARNINGS_COLORS.blue },
    { label: 'Overtime', value: '$3,120.50', color: EARNINGS_COLORS.purple },
  ],
};

const EARNINGS_SALARIED = {
  mainValue: '$4,164.84 deposited on 11/13',
  segments: [
    { width: 58, color: EARNINGS_COLORS.blue },
    { width: 28, color: EARNINGS_COLORS.yellow },
    { width: 10, color: EARNINGS_COLORS.green },
    { width: 4, color: EARNINGS_COLORS.purple },
  ],
  rows: [
    { label: 'Federal taxes', value: '$1,529.57', color: EARNINGS_COLORS.yellow },
    { label: 'State and local taxes', value: '$523.29', color: EARNINGS_COLORS.green },
    { label: 'Deductions', value: '$126.89', color: EARNINGS_COLORS.purple },
  ],
};

const EARNINGS_CONTRACTOR = {
  mainValue: '$2,400 pending · $1,800 paid this period',
  segments: [
    { width: 57, color: EARNINGS_COLORS.blue },
    { width: 43, color: EARNINGS_COLORS.purple },
  ],
  rows: [
    { label: 'Pending', value: '$2,400.00', color: EARNINGS_COLORS.blue },
    { label: 'Paid this period', value: '$1,800.00', color: EARNINGS_COLORS.purple },
  ],
};

const EarningsSummaryContent: React.FC<{ persona: PersonaId }> = ({ persona }) => {
  const data = persona === 'hourly_operator'
    ? EARNINGS_HOURLY
    : persona === 'contractor'
      ? EARNINGS_CONTRACTOR
      : EARNINGS_SALARIED;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', paddingBottom: 8 }}>
      <EarningsMainValue>{data.mainValue}</EarningsMainValue>
      <EarningsSegmentedBar>
        {data.segments.map((s, i) => (
          <EarningsSegment key={i} width={s.width} color={s.color} />
        ))}
      </EarningsSegmentedBar>
      {data.rows.map((r, i) => (
        <EarningsBreakdownRow key={i}>
          <EarningsBreakdownDot color={r.color} />
          <EarningsBreakdownLabel>{r.label}</EarningsBreakdownLabel>
          <EarningsBreakdownValue>{r.value}</EarningsBreakdownValue>
        </EarningsBreakdownRow>
      ))}
    </div>
  );
};

export default EarningsSummaryContent;
