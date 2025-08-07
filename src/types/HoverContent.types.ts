import { ReactNode } from 'react';
export interface HoverContentProps {
  children: ReactNode;
  hoverContent: ReactNode;
  position?: string;
  maxHeight?: string;
  className?: string;
}
