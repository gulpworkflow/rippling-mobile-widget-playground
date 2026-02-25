export interface WidgetAction {
  label: string;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

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
}
