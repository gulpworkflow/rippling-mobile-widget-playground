import React, { useState, useCallback, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import Icon from '@rippling/pebble/Icon';
import { usePebbleTheme } from '@/utils/theme';
import type { PersonaId } from '@/data-models/types';
import { widgetIdToTitle } from '@/widgets/framework/widget-helpers';
import BaseSheet from '@/widgets/framework/BaseSheet';

const SaveButton = styled.button<{ $enabled: boolean }>`
  background: ${({ theme, $enabled }) =>
    $enabled
      ? (theme as any).colorPrimary || '#7a005d'
      : (theme as any).colorSurfaceContainerLow || 'rgba(0,0,0,0.06)'};
  color: ${({ theme, $enabled }) =>
    $enabled
      ? (theme as any).colorOnPrimary || '#fff'
      : (theme as any).colorOnSurfaceVariant || 'rgba(0,0,0,0.3)'};
  border: none;
  border-radius: 20px;
  padding: 6px 16px;
  cursor: ${({ $enabled }) => ($enabled ? 'pointer' : 'default')};
  font-size: 13px;
  font-weight: 600;
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  transition: background 0.2s, color 0.2s;
`;

const ReorderRow = styled.div<{ $isDragging?: boolean; $isDragOver?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  margin-bottom: 8px;
  background: ${({ theme, $isDragging }) =>
    $isDragging
      ? (theme as any).colorSurfaceContainerHigh || 'rgba(0,0,0,0.08)'
      : (theme as any).colorSurfaceContainerLow || 'rgba(0,0,0,0.03)'};
  border-radius: 12px;
  cursor: grab;
  user-select: none;
  transition: background 0.15s, opacity 0.15s;
  opacity: ${({ $isDragging }) => ($isDragging ? 0.6 : 1)};
  ${({ $isDragOver, theme }) =>
    $isDragOver
      ? `box-shadow: 0 -2px 0 0 ${(theme as any).colorPrimary || '#7a005d'};`
      : ''}
  &:active { cursor: grabbing; }
`;

const DragHandle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const RowLabel = styled.span`
  flex: 1;
  ${({ theme }) => (theme as any).typestyleV2BodyLarge};
  color: ${({ theme }) => (theme as any).colorOnSurface || '#000'};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  letter-spacing: 0;
`;

interface WidgetReorderSheetProps {
  isOpen: boolean;
  onClose: () => void;
  widgetOrder: string[];
  persona: PersonaId;
  onSave: (newOrder: string[]) => void;
}

const WidgetReorderSheet: React.FC<WidgetReorderSheetProps> = ({
  isOpen, onClose, widgetOrder, persona, onSave,
}) => {
  const { theme } = usePebbleTheme();
  const [localOrder, setLocalOrder] = useState<string[]>(widgetOrder);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const touchStartRef = useRef<{ idx: number; y: number } | null>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    setLocalOrder(widgetOrder);
  }, [widgetOrder, isOpen]);

  const isDirty = localOrder.join(',') !== widgetOrder.join(',');

  const handleDragStart = useCallback((e: React.DragEvent, idx: number) => {
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(idx));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setOverIdx(idx);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dropIdx: number) => {
    e.preventDefault();
    if (dragIdx == null || dragIdx === dropIdx) { setDragIdx(null); setOverIdx(null); return; }
    setLocalOrder(prev => {
      const next = [...prev];
      const [item] = next.splice(dragIdx, 1);
      next.splice(dropIdx, 0, item);
      return next;
    });
    setDragIdx(null);
    setOverIdx(null);
  }, [dragIdx]);

  const handleDragEnd = useCallback(() => { setDragIdx(null); setOverIdx(null); }, []);

  const handleTouchStart = useCallback((idx: number, e: React.TouchEvent) => {
    touchStartRef.current = { idx, y: e.touches[0].clientY };
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const currentY = e.touches[0].clientY;
    for (let i = 0; i < rowRefs.current.length; i++) {
      const el = rowRefs.current[i];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (currentY >= rect.top && currentY <= rect.bottom) { setOverIdx(i); break; }
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (touchStartRef.current != null && overIdx != null && overIdx !== touchStartRef.current.idx) {
      const fromIdx = touchStartRef.current.idx;
      setLocalOrder(prev => {
        const next = [...prev];
        const [item] = next.splice(fromIdx, 1);
        next.splice(overIdx, 0, item);
        return next;
      });
    }
    touchStartRef.current = null;
    setDragIdx(null);
    setOverIdx(null);
  }, [overIdx]);

  const handleSave = useCallback(() => {
    if (isDirty) { onSave(localOrder); onClose(); }
  }, [isDirty, localOrder, onSave, onClose]);

  const handleCancel = useCallback(() => {
    setLocalOrder(widgetOrder);
    onClose();
  }, [widgetOrder, onClose]);

  return (
    <BaseSheet
      isOpen={isOpen}
      onClose={handleCancel}
      title="Reorder widgets"
      fixedHeight="55%"
      headerRight={
        <SaveButton $enabled={isDirty} onClick={handleSave}>Save</SaveButton>
      }
    >
      {localOrder.map((widgetId, idx) => (
        <ReorderRow
          key={widgetId}
          ref={el => { rowRefs.current[idx] = el; }}
          draggable
          $isDragging={dragIdx === idx}
          $isDragOver={overIdx === idx && dragIdx !== idx}
          onDragStart={e => handleDragStart(e, idx)}
          onDragOver={e => handleDragOver(e, idx)}
          onDrop={e => handleDrop(e, idx)}
          onDragEnd={handleDragEnd}
          onTouchStart={e => handleTouchStart(idx, e)}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <RowLabel>{widgetIdToTitle(widgetId, persona)}</RowLabel>
          <DragHandle>
            <Icon type={Icon.TYPES.HAMBURGER} size={22} color={theme.colorOnSurfaceVariant} />
          </DragHandle>
        </ReorderRow>
      ))}
    </BaseSheet>
  );
};

export default WidgetReorderSheet;
