import React from 'react';
import styled from '@emotion/styled';
import Icon from '@rippling/pebble/Icon';

type BenefitItem = {
  icon: string;
  label: string;
  detail: string;
};

const DEFAULT_BENEFITS: BenefitItem[] = [
  { icon: Icon.TYPES.HEART_FILLED, label: 'Medical', detail: 'Anthem Blue Cross PPO' },
  { icon: Icon.TYPES.SHIELD_TOOTH_FILLED, label: 'Dental', detail: 'Delta Dental PPO' },
  { icon: Icon.TYPES.EYE_FILLED, label: 'Vision', detail: 'VSP Choice Plan' },
  { icon: Icon.TYPES['401K_FILLED'], label: '401(k)', detail: '8% contribution · 4% match' },
];

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid ${({ theme }) => (theme as any).colorOutlineVariant || 'rgba(0,0,0,0.08)'};
  &:last-of-type { border-bottom: none; }
`;

const IconCircle = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${({ theme }) => (theme as any).colorPrimary || '#7a005d'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const Body = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const Title = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => (theme as any).colorOnSurface || '#000'};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.3;
`;

const Detail = styled.div`
  font-size: 12px;
  font-weight: 400;
  color: ${({ theme }) => (theme as any).colorOnSurfaceVariant || 'rgba(0,0,0,0.5)'};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.4;
`;

const BenefitsContent: React.FC<{ benefits?: BenefitItem[]; disabled?: boolean }> = ({ benefits = DEFAULT_BENEFITS }) => (
  <div>
    {benefits.map(b => (
      <Row key={b.label}>
        <IconCircle>
          <Icon type={b.icon as any} size={14} color="white" />
        </IconCircle>
        <Body>
          <Title>{b.label}</Title>
          <Detail>{b.detail}</Detail>
        </Body>
      </Row>
    ))}
  </div>
);

export default BenefitsContent;
