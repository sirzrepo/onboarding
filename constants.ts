import { Sparkles, PenTool, Palette, Layout, ShoppingBag, CheckCircle } from 'lucide-react';
import { Step } from './types';

export const STEPS: Step[] = [
  { id: 1, label: 'Welcome', icon: Sparkles },
  { id: 2, label: 'Logo Upload', icon: PenTool },
  { id: 3, label: 'Brand Colors', icon: Palette },
  { id: 4, label: 'Theme Style', icon: Layout },
  { id: 5, label: 'Shopify Connection', icon: ShoppingBag },
  { id: 6, label: 'Review', icon: CheckCircle },
];
