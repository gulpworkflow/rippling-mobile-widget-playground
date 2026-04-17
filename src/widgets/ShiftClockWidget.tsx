import React from 'react';
import styled from '@emotion/styled';

const ShiftTimeRow = styled.div`
  font-size: 22px;
  font-weight: 600;
  letter-spacing: 0;
  line-height: 28px;
  color: ${({ theme }) => (theme as any).colorOnSurface || '#000'};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const ShiftDetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 24px;
  width: 100%;
`;

const ShiftDetailLabel = styled.span`
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0;
  color: ${({ theme }) => (theme as any).colorOnSurfaceVariant || 'rgba(0,0,0,0.5)'};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.3;
`;

const ShiftDetailValue = styled.span`
  font-size: 14px;
  font-weight: 400;
  color: ${({ theme }) => (theme as any).colorOnSurface || '#000'};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.4;
`;

const ShiftDetailCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const AvatarStack = styled.div`
  display: flex;
  align-items: center;
`;

const AvatarBubble = styled.div<{ bg?: string; offset?: number }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${({ bg }) => bg || '#bbb'};
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid ${({ theme }) => (theme as any).colorSurfaceBright || '#fff'};
  margin-left: ${({ offset }) => offset != null ? `${offset}px` : '0px'};
  flex-shrink: 0;
`;

const AvatarOverflow = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${({ theme }) => (theme as any).colorSurfaceContainerHigh || '#e0e0e0'};
  color: ${({ theme }) => (theme as any).colorOnSurfaceVariant || '#666'};
  font-size: 10px;
  font-weight: 600;
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid ${({ theme }) => (theme as any).colorSurfaceBright || '#fff'};
  margin-left: -6px;
  flex-shrink: 0;
`;

const TEAMMATE_AVATARS = [
  { initials: 'AZ', bg: '#8B6E5A' },
  { initials: 'AZ', bg: '#7B8D6E' },
  { initials: 'AZ', bg: '#6E7B8D' },
  { initials: 'AZ', bg: '#8D6E7B' },
];

const ShiftClockContent: React.FC<{ disabled?: boolean }> = ({ disabled }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
    <ShiftTimeRow>Today 9:00 AM – 5:00 PM</ShiftTimeRow>
    <ShiftDetailGrid>
      <ShiftDetailCell>
        <ShiftDetailLabel>Location</ShiftDetailLabel>
        <ShiftDetailValue>Embarcadero 114th</ShiftDetailValue>
      </ShiftDetailCell>
      <ShiftDetailCell>
        <ShiftDetailLabel>Teammates</ShiftDetailLabel>
        <AvatarStack style={disabled ? { opacity: 0.4 } : undefined}>
          {TEAMMATE_AVATARS.map((t, i) => (
            <AvatarBubble key={i} bg={t.bg} offset={i === 0 ? 0 : -6}>{t.initials}</AvatarBubble>
          ))}
          <AvatarOverflow>+12</AvatarOverflow>
        </AvatarStack>
      </ShiftDetailCell>
      <ShiftDetailCell>
        <ShiftDetailLabel>Breaks</ShiftDetailLabel>
        <ShiftDetailValue>60mins (paid)</ShiftDetailValue>
      </ShiftDetailCell>
      <ShiftDetailCell>
        <ShiftDetailLabel>Position</ShiftDetailLabel>
        <ShiftDetailValue>Lead barista</ShiftDetailValue>
      </ShiftDetailCell>
    </ShiftDetailGrid>
  </div>
);

export default ShiftClockContent;
