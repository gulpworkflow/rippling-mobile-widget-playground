import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import Icon from '@rippling/pebble/Icon';
import { usePebbleTheme } from '@/utils/theme';
import type { SheetDetent } from '@/data-models/types';

const DRAG_THRESHOLD = 24;

const Backdrop = styled.div<{ isOpen: boolean }>`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 4000;
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  pointer-events: ${({ isOpen }) => (isOpen ? 'auto' : 'none')};
  transition: opacity 0.3s ease;
`;

const DETENT_HEIGHTS: Record<Exclude<SheetDetent, 'large'>, string> = {
  small: '35%',
  medium: '55%',
};

const Panel = styled.div<{
  isOpen: boolean;
  $detent: SheetDetent;
  $largeHeight?: number | null;
  $expandImmediately?: boolean;
  $fixedHeight?: string;
}>`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: ${({ $fixedHeight, $detent, $largeHeight }) =>
    $fixedHeight
      ? $fixedHeight
      : $detent === 'large'
        ? $largeHeight != null
          ? `${$largeHeight}px`
          : '90%'
        : DETENT_HEIGHTS[$detent]};
  background: ${({ theme }) => (theme as any).colorSurfaceBright || '#fff'};
  border-radius: 28px 28px 0 0;
  z-index: 4001;
  transform: translateY(${({ isOpen }) => (isOpen ? 0 : '100%')});
  transition:
    transform 0.35s cubic-bezier(0.32, 0.72, 0, 1),
    height ${({ $expandImmediately }) => ($expandImmediately ? '0s' : '0.35s cubic-bezier(0.32, 0.72, 0, 1)')};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.15);
`;

const TopRow = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 0 8px;
  flex-shrink: 0;
  min-height: 44px;
`;

const DragIndicator = styled.div`
  position: relative;
  top: -10px;
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: ${({ theme }) => (theme as any).colorOutlineVariant || 'rgba(0,0,0,0.2)'};
  flex-shrink: 0;
  cursor: grab;
  touch-action: none;
  &:active { cursor: grabbing; }
`;

const BUTTON_SIZE = 44;

const CornerButton = styled.button`
  position: absolute;
  top: 12px;
  width: ${BUTTON_SIZE}px;
  height: ${BUTTON_SIZE}px;
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

const CloseButton = styled(CornerButton)`left: 12px;`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px 12px;
  flex-shrink: 0;
`;

const HeaderSide = styled.div<{ $align: 'left' | 'right' }>`
  flex: 0 0 100px;
  min-width: 100px;
  display: flex;
  align-items: center;
  justify-content: ${({ $align }) => ($align === 'left' ? 'flex-start' : 'flex-end')};
`;

const Title = styled.span`
  flex: 1;
  position: relative;
  top: -14px;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => (theme as any).colorOnSurface || '#000'};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  text-align: center;
`;

const Body = styled.div`
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 0 16px 16px;
`;

export interface BaseSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  /** Render into the right side of the header row */
  headerRight?: React.ReactNode;
  /** Fixed height string (e.g. '50%'). If set, detent system is bypassed. */
  fixedHeight?: string;
  /** Initial detent when using detent system (default 'medium') */
  initialDetent?: SheetDetent;
  /** Enable detent expansion on scroll (default false) */
  expandOnScroll?: boolean;
  /** Content to render below the scrollable body (sticky footer) */
  footer?: React.ReactNode;
  children: React.ReactNode;
}

const BaseSheet: React.FC<BaseSheetProps> = ({
  isOpen, onClose, title, headerRight, fixedHeight, initialDetent = 'medium',
  expandOnScroll = false, footer, children,
}) => {
  const { theme } = usePebbleTheme();
  const useDetents = !fixedHeight;
  const [detent, setDetent] = useState<SheetDetent>(initialDetent);
  const [largeHeight, setLargeHeight] = useState<number | null>(null);
  const [expandImmediately, setExpandImmediately] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const dragStartDetent = useRef<SheetDetent>(initialDetent);
  const isDragging = useRef(false);

  useEffect(() => {
    if (isOpen) {
      setDetent(initialDetent);
      setLargeHeight(null);
    }
  }, [isOpen, initialDetent]);

  useEffect(() => {
    if (!useDetents || !isOpen || !bodyRef.current || !panelRef.current) return;
    const measure = () => {
      if (!bodyRef.current || !panelRef.current) return;
      const parent = panelRef.current.parentElement;
      const maxHeight = parent ? parent.clientHeight * 0.9 : window.innerHeight * 0.9;
      const contentHeight = 110 + bodyRef.current.scrollHeight;
      setLargeHeight(Math.min(contentHeight, maxHeight));
    };
    measure();
    const t1 = setTimeout(measure, 50);
    const t2 = setTimeout(measure, 150);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [isOpen, useDetents, children]);

  const handleGrabberPointerDown = useCallback((e: React.PointerEvent) => {
    if (!useDetents) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isDragging.current = true;
    dragStartY.current = e.clientY;
    dragStartDetent.current = detent;
  }, [detent, useDetents]);

  const handleGrabberPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const delta = dragStartY.current - e.clientY;
    const current = dragStartDetent.current;
    if (delta > DRAG_THRESHOLD) {
      if (current === 'small') { setDetent('medium'); dragStartY.current = e.clientY; dragStartDetent.current = 'medium'; }
      else if (current === 'medium') { setDetent('large'); dragStartY.current = e.clientY; dragStartDetent.current = 'large'; }
    } else if (delta < -DRAG_THRESHOLD) {
      if (current === 'large') { setDetent('medium'); dragStartY.current = e.clientY; dragStartDetent.current = 'medium'; }
      else if (current === 'medium') { setDetent('small'); dragStartY.current = e.clientY; dragStartDetent.current = 'small'; }
    }
  }, []);

  const handleGrabberPointerUp = useCallback(() => { isDragging.current = false; }, []);

  const handleBodyScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (!expandOnScroll || !useDetents) return;
    const target = e.target as HTMLDivElement;
    if (target.scrollTop > 20 && (detent === 'small' || detent === 'medium')) {
      setExpandImmediately(true);
      setDetent('large');
    }
  }, [detent, expandOnScroll, useDetents]);

  useEffect(() => {
    if (expandImmediately) {
      const id = requestAnimationFrame(() => setExpandImmediately(false));
      return () => cancelAnimationFrame(id);
    }
  }, [expandImmediately]);

  useEffect(() => {
    if (detent !== 'large' || !panelRef.current || !bodyRef.current) return;
    const panel = panelRef.current;
    const body = bodyRef.current;
    const handleTransitionEnd = (e: TransitionEvent) => {
      if (e.propertyName === 'height') {
        body.scrollTop = 0;
        panel.removeEventListener('transitionend', handleTransitionEnd);
      }
    };
    panel.addEventListener('transitionend', handleTransitionEnd);
    return () => panel.removeEventListener('transitionend', handleTransitionEnd);
  }, [detent]);

  return (
    <>
      <Backdrop isOpen={isOpen} onClick={onClose} aria-hidden="true" />
      <Panel
        ref={panelRef}
        isOpen={isOpen}
        $detent={detent}
        $largeHeight={largeHeight}
        $expandImmediately={expandImmediately}
        $fixedHeight={fixedHeight}
      >
        <TopRow>
          <CloseButton onClick={onClose} aria-label="Close">
            <Icon type={Icon.TYPES.CLOSE} size={24} color={theme.colorOnSurfaceVariant} />
          </CloseButton>
          <DragIndicator
            onPointerDown={handleGrabberPointerDown}
            onPointerMove={handleGrabberPointerMove}
            onPointerUp={handleGrabberPointerUp}
            onPointerCancel={handleGrabberPointerUp}
          />
        </TopRow>
        <Header>
          <HeaderSide $align="left" />
          <Title>{title}</Title>
          <HeaderSide $align="right">{headerRight}</HeaderSide>
        </Header>
        <Body ref={bodyRef} onScroll={handleBodyScroll}>
          {children}
        </Body>
        {footer}
      </Panel>
    </>
  );
};

export default BaseSheet;
export { Body as SheetBody, Backdrop, Panel, TopRow, DragIndicator, CloseButton, Header, HeaderSide, Title, CornerButton };
