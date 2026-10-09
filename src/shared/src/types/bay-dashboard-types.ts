import type { ReactNode } from 'react';

export interface WidgetProps {
  children?: ReactNode;
  size?: WidgetSize;
  title?: string;
}

export enum WidgetSize {
  SMALL,
  MEDIUM,
  LARGE
}
