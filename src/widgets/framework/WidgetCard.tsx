import React from 'react';
import styled from '@emotion/styled';
import Icon from '@rippling/pebble/Icon';
import Skeleton, { SkeletonVariant } from '@rippling/pebble/Skeleton';
import type { WidgetCardProps } from './types';
import { WidgetBodySkeleton } from './WidgetSkeleton';

const WidgetCardContainer = styled.div<{ outlineVariant?: string; $disabled?: boolean }>`
  background: ${({ theme }) => (theme as any).colorSurfaceBright || '#fff'};
  border-radius: 16px;
  border: 1px solid ${({ $disabled, outlineVariant, theme }) => $disabled ? (theme as any).colorDisabled : (outlineVariant || 'rgba(0, 0, 0, 0.12)')};
  overflow: hidden;
  width: 100%;
  ${({ $disabled }) => $disabled && 'pointer-events: none;'}

  ${({ $disabled, theme }) => $disabled && `
    & * {
      color: ${(theme as any).colorOnDisabledSurface} !important;
    }
  `}
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

const WidgetFooterButton = styled.button<{ variant?: 'primary' | 'secondary'; primaryColor?: string; $disabled?: boolean }>`
  flex: 1;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  cursor: ${({ $disabled }) => $disabled ? 'default' : 'pointer'};
  text-align: center;
  line-height: 1.3;
  border: ${({ $disabled, variant, theme }) => $disabled
    ? `1px solid ${(theme as any).colorDisabled}`
    : variant === 'secondary' ? `1px solid ${(theme as any).colorOutlineVariant || 'rgba(0, 0, 0, 0.12)'}` : '1px solid transparent'};
  background: ${({ $disabled, variant, primaryColor, theme }) => $disabled
    ? (theme as any).colorDisabled
    : variant === 'secondary' ? 'transparent' : (primaryColor || '#000')};
  color: ${({ $disabled, variant, theme }) => $disabled
    ? (theme as any).colorOnDisabledSurface
    : variant === 'secondary' ? ((theme as any).colorOnSurface || 'rgba(0, 0, 0, 0.85)') : ((theme as any).colorOnPrimaryContainer || '#fff')};
`;

const WidgetErrorBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 80px;
  padding: 12px 0;
  color: ${({ theme }) => (theme as any).colorError || '#c0392b'};
`;

const WidgetErrorMessage = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => (theme as any).colorError || '#c0392b'};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  text-align: center;
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

const WidgetCard: React.FC<WidgetCardProps> = ({ title, meta, children, actions, footer, surfaceVariant, outlineVariant, primaryColor, onTitleClick, disabled, loading, skeleton, skeletonRows, skeletonColumns, skeletonHeight, error }) => {
  const hasError = !!error;
  const isInteractive = !disabled && !loading && !hasError;
  const TitleWrapper = (onTitleClick && isInteractive) ? WidgetCardTitleButton : WidgetCardTitleGroup;
  const showSkeleton = loading && skeleton && !hasError;
  const contentRef = React.useRef<HTMLDivElement>(null);
  const measuredHeight = React.useRef<number | undefined>(undefined);
  const errorMessage = typeof error === 'string' ? error : 'Could not load';
  const buttonsDisabled = disabled || hasError;

  React.useEffect(() => {
    if (!showSkeleton && !hasError && contentRef.current) {
      measuredHeight.current = contentRef.current.scrollHeight;
    }
  });

  const bodyHeight = measuredHeight.current ?? skeletonHeight;

  const renderBody = () => {
    if (hasError) {
      return (
        <WidgetErrorBody>
          <Icon type={Icon.TYPES.WARNING_TRIANGLE_OUTLINE} size={24} color="currentColor" />
          <WidgetErrorMessage>{errorMessage}</WidgetErrorMessage>
        </WidgetErrorBody>
      );
    }
    if (showSkeleton) {
      return (
        <div style={bodyHeight ? { height: bodyHeight, overflow: 'hidden' } : undefined}>
          <WidgetBodySkeleton archetype={skeleton} rows={skeletonRows} columns={skeletonColumns} />
        </div>
      );
    }
    return <div ref={contentRef}>{children}</div>;
  };

  return (
    <WidgetCardContainer outlineVariant={outlineVariant} $disabled={disabled}>
      <WidgetCardHeader>
        <TitleWrapper onClick={isInteractive ? onTitleClick : undefined}>
          <WidgetCardTitle surfaceVariant={surfaceVariant}>{title}</WidgetCardTitle>
          {onTitleClick && isInteractive && <Icon type={Icon.TYPES.CHEVRON_RIGHT} size={16} color={surfaceVariant || 'rgba(0, 0, 0, 0.45)'} />}
        </TitleWrapper>
        {loading && !hasError ? (
          <WidgetCardMeta><Skeleton animation="wave" variant={SkeletonVariant.BOX} width={60} height={20} borderRadius={10} /></WidgetCardMeta>
        ) : (
          meta && <WidgetCardMeta>{meta}</WidgetCardMeta>
        )}
      </WidgetCardHeader>
      <WidgetCardBody>
        {renderBody()}
      </WidgetCardBody>
      {actions && actions.length > 0 && (
        <WidgetCardFooter>
          {loading && !hasError ? (
            <Skeleton animation="wave">
              <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                {actions.map(a => (
                  <div key={a.label} style={{ flex: 1 }}>
                    <Skeleton variant={SkeletonVariant.BOX} width="100%" height={36} borderRadius={10} />
                  </div>
                ))}
              </div>
            </Skeleton>
          ) : (
            actions.map(a => (
              <WidgetFooterButton key={a.label} variant={a.variant || 'primary'} primaryColor={primaryColor} $disabled={buttonsDisabled} onClick={buttonsDisabled ? undefined : a.onClick}>
                {a.label}
              </WidgetFooterButton>
            ))
          )}
        </WidgetCardFooter>
      )}
      {!actions && footer && <WidgetCardFooter>{footer}</WidgetCardFooter>}
    </WidgetCardContainer>
  );
};

export default WidgetCard;
