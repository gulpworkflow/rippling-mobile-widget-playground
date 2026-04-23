import React, { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { keyframes, css } from '@emotion/react';
import { useTheme } from '@rippling/pebble/theme';
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

const WidgetCardTitle = styled.span`
  ${({ theme }) => {
    const t = (theme as any).typestyleV2LabelMedium;
    return t
      ? `font-size: ${t.fontSize}; font-weight: ${t.fontWeight}; font-family: ${t.fontFamily}; line-height: ${t.lineHeight}; letter-spacing: ${t.letterSpacing};`
      : 'font-size: 14px; font-weight: 600; font-family: Basel Grotesk; line-height: 20px; letter-spacing: 0;';
  }}
  color: ${({ theme }) => (theme as any).colorOnSurfaceVariant || 'rgba(0, 0, 0, 0.6)'};
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

const SKELETON_PHASE_MS = 1500;
const CROSSFADE_MS = 350;
const CROSSFADE_EASE = 'cubic-bezier(0.2, 0, 0, 1)';

const skeletonDim = keyframes`
  from { opacity: 1; }
  to { opacity: 0.2; }
`;

const errorReveal = keyframes`
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
`;

const contentReveal = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const ContentFadeIn = styled.div`
  animation: ${contentReveal} ${CROSSFADE_MS}ms ${CROSSFADE_EASE} both;
`;

const CrossfadeWrap = styled.div`
  position: relative;
`;

const SkeletonBackdrop = styled.div<{ $settled: boolean }>`
  ${({ $settled }) => $settled
    ? css`opacity: 0.2;`
    : css`animation: ${skeletonDim} ${CROSSFADE_MS}ms ${CROSSFADE_EASE} forwards;`
  }
`;

const ErrorOverlay = styled.div<{ $settled: boolean }>`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  ${({ $settled }) => $settled
    ? css`opacity: 1;`
    : css`animation: ${errorReveal} ${CROSSFADE_MS}ms ${CROSSFADE_EASE} forwards;`
  }
`;

const WidgetCard: React.FC<WidgetCardProps> = ({ title, meta, children, actions, footer, surfaceVariant, outlineVariant, primaryColor, onTitleClick, disabled, loading, skeleton, skeletonRows, skeletonColumns, skeletonHeight, error }) => {
  const { theme } = useTheme();
  const chevronColor = surfaceVariant || (theme as any).colorOnSurfaceVariant || 'rgba(0, 0, 0, 0.6)';
  const hasError = !!error;

  const [errorEntrance, setErrorEntrance] = useState<'skeleton' | 'crossfade' | 'settled' | null>(
    () => (hasError && skeleton) ? 'skeleton' : null
  );

  useEffect(() => {
    if (hasError && skeleton) {
      setErrorEntrance('skeleton');
      const t1 = setTimeout(() => setErrorEntrance('crossfade'), SKELETON_PHASE_MS);
      const t2 = setTimeout(() => setErrorEntrance('settled'), SKELETON_PHASE_MS + CROSSFADE_MS);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
    setErrorEntrance(null);
  }, [hasError, skeleton]);

  const inErrorSkeleton = errorEntrance === 'skeleton';
  const inCrossfade = errorEntrance === 'crossfade';
  const isSettled = errorEntrance === 'settled';
  const showLoadingChrome = (loading && !hasError) || inErrorSkeleton;

  const isInteractive = !disabled && !loading && !hasError;
  const TitleWrapper = (onTitleClick && isInteractive) ? WidgetCardTitleButton : WidgetCardTitleGroup;
  const showSkeleton = (loading && skeleton && !hasError) || (inErrorSkeleton && !!skeleton);
  const contentRef = useRef<HTMLDivElement>(null);
  const measuredHeight = useRef<number | undefined>(undefined);
  const errorMessage = typeof error === 'string' ? error : 'Could not load';
  const wasLoading = useRef(false);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    if (showLoadingChrome) {
      wasLoading.current = true;
    } else if (wasLoading.current && !hasError) {
      wasLoading.current = false;
      setFadeIn(true);
      const t = setTimeout(() => setFadeIn(false), CROSSFADE_MS);
      return () => clearTimeout(t);
    }
  }, [showLoadingChrome, hasError]);

  useEffect(() => {
    if (!showSkeleton && !hasError && contentRef.current) {
      measuredHeight.current = contentRef.current.scrollHeight;
    }
  });

  const bodyHeight = measuredHeight.current ?? skeletonHeight;

  const renderBody = () => {
    if ((inCrossfade || isSettled) && skeleton) {
      return (
        <CrossfadeWrap>
          <SkeletonBackdrop $settled={isSettled}>
            <div style={bodyHeight ? { height: bodyHeight, overflow: 'hidden' } : undefined}>
              <WidgetBodySkeleton archetype={skeleton} rows={skeletonRows} columns={skeletonColumns} frozen />
            </div>
          </SkeletonBackdrop>
          <ErrorOverlay $settled={isSettled}>
            <WidgetErrorBody>
              <Icon type={Icon.TYPES.WARNING_TRIANGLE_OUTLINE} size={24} color="currentColor" />
              <WidgetErrorMessage>{errorMessage}</WidgetErrorMessage>
            </WidgetErrorBody>
          </ErrorOverlay>
        </CrossfadeWrap>
      );
    }
    if (hasError && !inErrorSkeleton) {
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
    const content = <div ref={contentRef}>{children}</div>;
    return fadeIn ? <ContentFadeIn key="reveal">{content}</ContentFadeIn> : content;
  };

  return (
    <WidgetCardContainer outlineVariant={outlineVariant} $disabled={disabled}>
      <WidgetCardHeader>
        <TitleWrapper onClick={isInteractive ? onTitleClick : undefined}>
          <WidgetCardTitle>{title}</WidgetCardTitle>
          {onTitleClick && isInteractive && <Icon type={Icon.TYPES.CHEVRON_RIGHT} size={16} color={chevronColor} />}
        </TitleWrapper>
        {!showLoadingChrome && meta && (
          fadeIn ? <ContentFadeIn><WidgetCardMeta>{meta}</WidgetCardMeta></ContentFadeIn> : <WidgetCardMeta>{meta}</WidgetCardMeta>
        )}
      </WidgetCardHeader>
      <WidgetCardBody>
        {renderBody()}
      </WidgetCardBody>
      {actions && actions.length > 0 && (
        <WidgetCardFooter>
          {(inCrossfade || isSettled) ? (
            <SkeletonBackdrop $settled={isSettled} style={{ width: '100%' }}>
              <Skeleton animation="none">
                <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                  {actions.map(a => (
                    <div key={a.label} style={{ flex: 1 }}>
                      <Skeleton width="100%" lineHeight={36} borderRadius={10} />
                    </div>
                  ))}
                </div>
              </Skeleton>
            </SkeletonBackdrop>
          ) : showLoadingChrome ? (
            <Skeleton animation="wave">
              <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                {actions.map(a => (
                  <div key={a.label} style={{ flex: 1 }}>
                    <Skeleton width="100%" lineHeight={36} borderRadius={10} />
                  </div>
                ))}
              </div>
            </Skeleton>
          ) : fadeIn ? (
            <ContentFadeIn style={{ display: 'contents' }}>
              {actions.map(a => (
                <WidgetFooterButton key={a.label} variant={a.variant || 'primary'} primaryColor={primaryColor} $disabled={disabled} onClick={disabled ? undefined : a.onClick}>
                  {a.label}
                </WidgetFooterButton>
              ))}
            </ContentFadeIn>
          ) : (
            actions.map(a => (
              <WidgetFooterButton key={a.label} variant={a.variant || 'primary'} primaryColor={primaryColor} $disabled={disabled} onClick={disabled ? undefined : a.onClick}>
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
