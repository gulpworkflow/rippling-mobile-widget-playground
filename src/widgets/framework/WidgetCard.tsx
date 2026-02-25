import React from 'react';
import styled from '@emotion/styled';
import Icon from '@rippling/pebble/Icon';
import type { WidgetCardProps } from './types';

const WidgetCardContainer = styled.div<{ outlineVariant?: string }>`
  background: ${({ theme }) => (theme as any).colorSurfaceBright || '#fff'};
  border-radius: 16px;
  border: 1px solid ${({ outlineVariant }) => outlineVariant || 'rgba(0, 0, 0, 0.12)'};
  overflow: hidden;
  width: 100%;
`;

const WidgetCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 12px 0 12px;
`;

const WidgetCardTitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
`;

const WidgetCardTitleButton = styled.button`
  display: flex;
  align-items: center;
  gap: 2px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font: inherit;
  color: inherit;
`;

const WidgetCardTitle = styled.span<{ surfaceVariant?: string }>`
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0;
  color: ${({ surfaceVariant }) => surfaceVariant || 'rgba(0, 0, 0, 0.45)'};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.3;
`;

const WidgetCardMeta = styled.div`
  display: flex;
  align-items: center;
`;

const WidgetCardBody = styled.div`
  padding: 10px 12px 12px;
`;

const WidgetCardFooter = styled.div`
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const WidgetFooterButton = styled.button<{ variant?: 'primary' | 'secondary'; primaryColor?: string }>`
  flex: 1;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  cursor: pointer;
  text-align: center;
  line-height: 1.3;
  border: ${({ variant, theme }) => variant === 'secondary' ? `1px solid ${(theme as any).colorOutlineVariant || 'rgba(0, 0, 0, 0.12)'}` : '1px solid transparent'};
  background: ${({ variant, primaryColor }) => variant === 'secondary' ? 'transparent' : (primaryColor || '#000')};
  color: ${({ variant, theme }) => variant === 'secondary' ? ((theme as any).colorOnSurface || 'rgba(0, 0, 0, 0.85)') : ((theme as any).colorOnPrimaryContainer || '#fff')};
`;

export const ContentSlot = styled.div`
  width: 100%;
  height: 64px;
  background: ${({ theme }) => (theme as any).colorSurfaceContainerLow || 'rgba(0, 0, 0, 0.04)'};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: ${({ theme }) => (theme as any).colorOnSurfaceVariant || 'rgba(0, 0, 0, 0.2)'};
  font-family: 'SF Mono', 'Menlo', 'Consolas', monospace;
`;

const WidgetCard: React.FC<WidgetCardProps> = ({ title, meta, children, actions, footer, surfaceVariant, outlineVariant, primaryColor, onTitleClick }) => {
  const TitleWrapper = onTitleClick ? WidgetCardTitleButton : WidgetCardTitleGroup;
  return (
    <WidgetCardContainer outlineVariant={outlineVariant}>
      <WidgetCardHeader>
        <TitleWrapper onClick={onTitleClick}>
          <WidgetCardTitle surfaceVariant={surfaceVariant}>{title}</WidgetCardTitle>
          {onTitleClick && <Icon type={Icon.TYPES.CHEVRON_RIGHT} size={16} color={surfaceVariant || 'rgba(0, 0, 0, 0.45)'} />}
        </TitleWrapper>
        {meta && <WidgetCardMeta>{meta}</WidgetCardMeta>}
      </WidgetCardHeader>
      <WidgetCardBody>{children}</WidgetCardBody>
      {actions && actions.length > 0 && (
        <WidgetCardFooter>
          {actions.map(a => (
            <WidgetFooterButton key={a.label} variant={a.variant || 'primary'} primaryColor={primaryColor} onClick={a.onClick}>
              {a.label}
            </WidgetFooterButton>
          ))}
        </WidgetCardFooter>
      )}
      {!actions && footer && <WidgetCardFooter>{footer}</WidgetCardFooter>}
    </WidgetCardContainer>
  );
};

export default WidgetCard;
