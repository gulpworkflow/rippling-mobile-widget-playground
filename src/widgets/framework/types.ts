export interface WidgetAction {
  label: string;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

export type SkeletonArchetype = 'list' | 'grid' | 'detail';

export interface WidgetCardProps {
  title: string;
  meta?: React.ReactNode;
  onTitleClick?: () => void;
  children: React.ReactNode;
  actions?: WidgetAction[];
  footer?: React.ReactNode;
  surfaceVariant?: string;
  outlineVariant?: string;
  primaryColor?: string;
  disabled?: boolean;
  loading?: boolean;
  skeleton?: SkeletonArchetype;
  skeletonRows?: number;
  skeletonColumns?: number;
  skeletonHeight?: number;
  error?: boolean | string;
}
