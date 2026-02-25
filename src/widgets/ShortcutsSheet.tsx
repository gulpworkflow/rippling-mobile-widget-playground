import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import styled from '@emotion/styled';
import Icon from '@rippling/pebble/Icon';
import { usePebbleTheme } from '@/utils/theme';
import { getQuickActions, type QuickAction, type SkuFlags } from '@/data-models/quick-actions';
import type { PersonaId, SheetDetent } from '@/data-models/types';
import WidgetCard from '@/widgets/framework/WidgetCard';
import {
  ShortcutsGrid,
  ShortcutItem,
  ShortcutIconCircle,
  ShortcutLabel,
  QUICK_ACTION_ICONS,
  PRODUCT_DISPLAY_NAMES,
} from '@/widgets/ShortcutsWidget';

const ShortcutsSheetGroup = styled.div`
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid ${({ theme }) => (theme as any).colorOutlineVariant || 'rgba(0,0,0,0.12)'};
  &:last-child {
    margin-bottom: 0;
    border-bottom: none;
  }
`;

const SheetFavoritesWidget = styled.div`
  margin-bottom: 12px;
`;

const SheetEditLink = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => (theme as any).colorPrimary || '#7a005d'};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const ShortcutsSheetGroupTitleButton = styled.button`
  display: flex;
  align-items: center;
  gap: 2px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font: inherit;
  color: inherit;
  margin-bottom: 4px;
`;

const ShortcutsSheetGroupTitleText = styled.span`
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0;
  color: ${({ theme }) => (theme as any).colorOnSurfaceVariant || 'rgba(0, 0, 0, 0.45)'};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.3;
`;

const SheetBackdrop = styled.div<{ isOpen: boolean }>`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 4000;
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  pointer-events: ${({ isOpen }) => (isOpen ? 'auto' : 'none')};
  transition: opacity 0.3s ease;
`;

const HEADER_HEIGHT = 72;
const SEARCH_BAR_HEIGHT = 76;

const DETENT_HEIGHTS: Record<Exclude<SheetDetent, 'large'>, string> = {
  small: '35%',
  medium: '60%',
};

const SheetPanel = styled.div<{ isOpen: boolean; $detent: SheetDetent; $largeHeight?: number | null; $expandImmediately?: boolean }>`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: ${({ $detent, $largeHeight }) =>
    $detent === 'large'
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

const SheetTopRow = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 0 8px;
  flex-shrink: 0;
  min-height: 44px;
`;

const SheetDragIndicator = styled.div`
  position: relative;
  top: -10px;
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: ${({ theme }) => (theme as any).colorOutlineVariant || 'rgba(0,0,0,0.2)'};
  flex-shrink: 0;
  cursor: grab;
  touch-action: none;
  &:active {
    cursor: grabbing;
  }
`;

const SHEET_BUTTON_SIZE = 44;

const SheetCornerButton = styled.button`
  position: absolute;
  top: 12px;
  width: ${SHEET_BUTTON_SIZE}px;
  height: ${SHEET_BUTTON_SIZE}px;
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

const SheetCloseButton = styled(SheetCornerButton)`
  left: 12px;
`;

const SheetHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px 16px;
  flex-shrink: 0;
`;

const SheetHeaderSide = styled.div<{ $align: 'left' | 'right' }>`
  flex: 0 0 100px;
  min-width: 100px;
  display: flex;
  align-items: center;
  justify-content: ${({ $align }) => ($align === 'left' ? 'flex-start' : 'flex-end')};
`;

const SheetTitle = styled.span`
  flex: 1;
  position: relative;
  top: -14px;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => (theme as any).colorOnSurface || '#000'};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  text-align: center;
`;

const SheetBody = styled.div`
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 0 16px 16px;
`;

const SheetSearchBar = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px 20px;
`;

const SheetSearchInput = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 44px;
  padding: 0 16px;
  border-radius: 22px;
  background: ${({ theme }) => (theme as any).colorSurfaceContainerLow || 'rgba(0,0,0,0.06)'};
`;

const SheetSearchInputField = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  font-size: 16px;
  color: ${({ theme }) => (theme as any).colorOnSurface || '#000'};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  &::placeholder {
    color: ${({ theme }) => (theme as any).colorOnSurfaceVariant || 'rgba(0,0,0,0.5)'};
  }
  &:focus {
    outline: none;
  }
`;

const SheetAISparkleButton = styled.button`
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border: none;
  border-radius: 50%;
  background: ${({ theme }) => (theme as any).colorSurfaceBright || '#fff'};
  border: 1px solid ${({ theme }) => (theme as any).colorOutlineVariant || 'rgba(0,0,0,0.12)'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DRAG_THRESHOLD = 24;

const ShortcutsSheet: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  persona: PersonaId;
  skuFlags: SkuFlags;
  onboarding: boolean;
}> = ({ isOpen, onClose, persona, skuFlags, onboarding }) => {
  const { theme } = usePebbleTheme();
  const [detent, setDetent] = useState<SheetDetent>('medium');
  const [largeHeight, setLargeHeight] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const bodyRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number>(0);
  const dragStartDetent = useRef<SheetDetent>('medium');
  const isDragging = useRef(false);

  useEffect(() => {
    if (isOpen) {
      setDetent('medium');
      setLargeHeight(null);
      setSearchQuery('');
    }
  }, [isOpen]);

  const quickActionsResult = getQuickActions({ persona, skuFlags, onboarding, maxCount: 50 });
  const favorites = getQuickActions({ persona, skuFlags, onboarding, maxCount: 4 }).actions;
  const favoriteIds = useMemo(() => new Set(favorites.map(a => a.id)), [favorites]);
  const groups = useMemo(() => {
    const byProduct: Record<string, QuickAction[]> = {};
    const q = searchQuery.trim().toLowerCase();
    for (const a of quickActionsResult.all) {
      if (favoriteIds.has(a.id)) continue;
      if (q && !a.label.toLowerCase().includes(q)) continue;
      const key = a.product;
      if (!byProduct[key]) byProduct[key] = [];
      byProduct[key].push(a);
    }
    return Object.entries(byProduct).map(([product, actions]) => ({
      product: PRODUCT_DISPLAY_NAMES[product] ?? product,
      actions,
    }));
  }, [quickActionsResult.all, searchQuery, favoriteIds]);

  useEffect(() => {
    if (!isOpen || !bodyRef.current || !panelRef.current) return;
    const measure = () => {
      if (!bodyRef.current || !panelRef.current) return;
      const parent = panelRef.current.parentElement;
      const maxHeight = parent ? parent.clientHeight * 0.9 : window.innerHeight * 0.9;
      const contentHeight = HEADER_HEIGHT + bodyRef.current.scrollHeight + SEARCH_BAR_HEIGHT;
      setLargeHeight(Math.min(contentHeight, maxHeight));
    };
    measure();
    const t1 = setTimeout(measure, 50);
    const t2 = setTimeout(measure, 150);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isOpen, groups]);

  const handleGrabberPointerDown = useCallback((e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isDragging.current = true;
    dragStartY.current = e.clientY;
    dragStartDetent.current = detent;
  }, [detent]);

  const handleGrabberPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const delta = dragStartY.current - e.clientY;
    const current = dragStartDetent.current;
    if (delta > DRAG_THRESHOLD) {
      if (current === 'small') {
        setDetent('medium');
        dragStartY.current = e.clientY;
        dragStartDetent.current = 'medium';
      } else if (current === 'medium') {
        setDetent('large');
        dragStartY.current = e.clientY;
        dragStartDetent.current = 'large';
      }
    } else if (delta < -DRAG_THRESHOLD) {
      if (current === 'large') {
        setDetent('medium');
        dragStartY.current = e.clientY;
        dragStartDetent.current = 'medium';
      } else if (current === 'medium') {
        setDetent('small');
        dragStartY.current = e.clientY;
        dragStartDetent.current = 'small';
      }
    }
  }, []);

  const handleGrabberPointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleBodyScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    if (target.scrollTop > 20 && (detent === 'small' || detent === 'medium')) {
      setExpandImmediately(true);
      setDetent('large');
    }
  }, [detent]);

  const [expandImmediately, setExpandImmediately] = useState(false);
  useEffect(() => {
    if (expandImmediately) {
      const id = requestAnimationFrame(() => {
        setExpandImmediately(false);
      });
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
      <SheetBackdrop isOpen={isOpen} onClick={onClose} aria-hidden="true" />
      <SheetPanel ref={panelRef} isOpen={isOpen} $detent={detent} $largeHeight={largeHeight} $expandImmediately={expandImmediately}>
        <SheetTopRow>
          <SheetCloseButton onClick={onClose} aria-label="Close">
            <Icon type={Icon.TYPES.CLOSE} size={24} color={theme.colorOnSurfaceVariant} />
          </SheetCloseButton>
          <SheetDragIndicator
            onPointerDown={handleGrabberPointerDown}
            onPointerMove={handleGrabberPointerMove}
            onPointerUp={handleGrabberPointerUp}
            onPointerCancel={handleGrabberPointerUp}
          />
        </SheetTopRow>
        <SheetHeader>
          <SheetHeaderSide $align="left" />
          <SheetTitle>All shortcuts</SheetTitle>
          <SheetHeaderSide $align="right" />
        </SheetHeader>
        <SheetBody ref={bodyRef} onScroll={handleBodyScroll}>
          <SheetFavoritesWidget>
            <WidgetCard
              title="Favorites"
              meta={<SheetEditLink type="button" onClick={() => {}}>Edit</SheetEditLink>}
              surfaceVariant={theme.colorOnSurfaceVariant}
              outlineVariant={theme.colorOutlineVariant}
            >
              <ShortcutsGrid>
              {getQuickActions({ persona, skuFlags, onboarding, maxCount: 4 }).actions.map(a => (
                <ShortcutItem key={a.id}>
                  <ShortcutIconCircle>
                    <Icon type={QUICK_ACTION_ICONS[a.id]} size={20} color={theme.colorOnSurface} />
                  </ShortcutIconCircle>
                  <ShortcutLabel>{a.label}</ShortcutLabel>
                </ShortcutItem>
              ))}
              </ShortcutsGrid>
            </WidgetCard>
          </SheetFavoritesWidget>
          {groups.map(({ product, actions }) => (
            <ShortcutsSheetGroup key={product}>
              <ShortcutsSheetGroupTitleButton type="button" onClick={() => {}} aria-label={`Go to ${product}`}>
                <ShortcutsSheetGroupTitleText>{product}</ShortcutsSheetGroupTitleText>
                <Icon type={Icon.TYPES.CHEVRON_RIGHT} size={16} color={theme.colorOnSurfaceVariant} />
              </ShortcutsSheetGroupTitleButton>
              <ShortcutsGrid scrollable>
                {actions.map(a => (
                  <ShortcutItem key={a.id} $scrollable>
                    <ShortcutIconCircle>
                      <Icon type={QUICK_ACTION_ICONS[a.id]} size={20} color={theme.colorOnSurface} />
                    </ShortcutIconCircle>
                    <ShortcutLabel>{a.label}</ShortcutLabel>
                  </ShortcutItem>
                ))}
              </ShortcutsGrid>
            </ShortcutsSheetGroup>
          ))}
        </SheetBody>
        {detent === 'large' && (
          <SheetSearchBar>
            <SheetSearchInput>
              <Icon type={Icon.TYPES.SEARCH_OUTLINE} size={20} color={theme.colorOnSurfaceVariant} />
              <SheetSearchInputField
                type="search"
                placeholder="Search shortcuts"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search shortcuts"
              />
            </SheetSearchInput>
            <SheetAISparkleButton type="button" aria-label="Open AI assistant">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M1.0871 5.2088C2.69493 4.77473 3.96253 3.50712 4.3966 1.89929H5.60339C6.03746 3.50712 7.30506 4.77473 8.9129 5.2088V6.41559C7.30506 6.84966 6.03746 8.11725 5.60339 9.72509L4.3966 9.7251C3.96253 8.11727 2.69493 6.84966 1.0871 6.41559V5.2088ZM2.85513 5.81219C3.74179 6.32997 4.48222 7.07041 4.99999 7.95706C5.51777 7.0704 6.2582 6.32996 7.14486 5.81219C6.2582 5.29442 5.51777 4.55398 5 3.66732C4.48222 4.55398 3.74179 5.29442 2.85513 5.81219Z" fill={theme.colorOnSurfaceVariant}/>
                <path fillRule="evenodd" clipRule="evenodd" d="M6.92043 10.6255C9.54082 9.91804 11.6058 7.853 12.3133 5.23263H13.5201C14.2275 7.853 16.2925 9.91804 18.9129 10.6255V11.8323C16.2925 12.5397 14.2275 14.6047 13.5201 17.2251L12.3133 17.2251C11.6058 14.6047 9.54082 12.5397 6.92043 11.8323V10.6255ZM8.84684 11.2289C10.6124 12.0975 12.048 13.5332 12.9167 15.2987C13.7853 13.5332 15.221 12.0975 16.9865 11.2289C15.221 10.3602 13.7853 8.92455 12.9167 7.15903C12.048 8.92455 10.6124 10.3602 8.84684 11.2289Z" fill={theme.colorOnSurfaceVariant}/>
                <path fillRule="evenodd" clipRule="evenodd" d="M5.6466 13.566C5.37655 14.5663 4.5874 15.3554 3.5871 15.6255V16.8323C4.5874 17.1023 5.37655 17.8915 5.6466 18.8918L6.85339 18.8918C7.12345 17.8915 7.91259 17.1023 8.9129 16.8323V15.6255C7.91259 15.3554 7.12345 14.5663 6.85339 13.566H5.6466ZM6.24999 17.2721C5.96679 16.8657 5.61317 16.5121 5.20671 16.2289C5.61317 15.9457 5.96679 15.592 6.25 15.1856C6.5332 15.592 6.88682 15.9457 7.29328 16.2289C6.88682 16.5121 6.5332 16.8657 6.24999 17.2721Z" fill={theme.colorOnSurfaceVariant}/>
              </svg>
            </SheetAISparkleButton>
          </SheetSearchBar>
        )}
      </SheetPanel>
    </>
  );
};

export default ShortcutsSheet;
