import React from 'react';
import Skeleton, { SkeletonVariant } from '@rippling/pebble/Skeleton';

export type SkeletonArchetype = 'list' | 'grid' | 'detail';

const Col: React.FC<{ gap?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ gap = 10, children, style }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap, width: '100%', ...style }}>{children}</div>
);

type SkeletonAnim = 'wave' | 'none';

const ListSkeleton: React.FC<{ rows: number; anim: SkeletonAnim }> = ({ rows, anim }) => (
  <Skeleton animation={anim}>
    <Col gap={0}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} style={{
          padding: '12px 0',
          borderBottom: i < rows - 1 ? '1px solid rgba(0,0,0,0.08)' : 'none',
        }}>
          <Col gap={6}>
            <Skeleton width={`${55 - i * 5}%`} lineHeight={18} />
            <Skeleton width={`${40 + i * 15}%`} lineHeight={14} />
          </Col>
        </div>
      ))}
    </Col>
  </Skeleton>
);

const GridSkeleton: React.FC<{ columns: number; anim: SkeletonAnim }> = ({ columns, anim }) => (
  <Skeleton animation={anim}>
    <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', width: '100%', padding: '8px 0 4px' }}>
      {Array.from({ length: columns }, (_, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, paddingTop: 8 }}>
          <Skeleton variant={SkeletonVariant.BOX} width={32} height={32} borderRadius={8} />
          <Col gap={3} style={{ alignItems: 'center' }}>
            <Skeleton width="80%" lineHeight={14} />
            <Skeleton width="55%" lineHeight={14} />
          </Col>
        </div>
      ))}
    </div>
  </Skeleton>
);

const BAR_WIDTHS = ['80%', '65%', '70%', '55%'];

const DetailSkeleton: React.FC<{ rows: number; anim: SkeletonAnim }> = ({ rows, anim }) => (
  <Skeleton animation={anim}>
    <Col gap={16}>
      <Skeleton width="60%" lineHeight={28} />
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} style={{ display: 'flex', gap: 24, width: '100%' }}>
          <div style={{ flex: 1 }}>
            <Skeleton width={BAR_WIDTHS[i * 2 % BAR_WIDTHS.length]} lineHeight={16} />
          </div>
          <div style={{ flex: 1 }}>
            <Skeleton width={BAR_WIDTHS[(i * 2 + 1) % BAR_WIDTHS.length]} lineHeight={16} />
          </div>
        </div>
      ))}
    </Col>
  </Skeleton>
);

export const WidgetBodySkeleton: React.FC<{
  archetype: SkeletonArchetype;
  rows?: number;
  columns?: number;
  frozen?: boolean;
}> = ({ archetype, rows, columns, frozen }) => {
  const anim: SkeletonAnim = frozen ? 'none' : 'wave';
  switch (archetype) {
    case 'list':
      return <ListSkeleton rows={rows ?? 2} anim={anim} />;
    case 'grid':
      return <GridSkeleton columns={columns ?? 4} anim={anim} />;
    case 'detail':
      return <DetailSkeleton rows={rows ?? 2} anim={anim} />;
  }
};
