import { LucideIcon } from 'lucide-react';

export interface Step {
  id: number;
  label: string;
  icon: LucideIcon;
  description?: string;
}

export interface WizardState {
  currentStep: number;
  completedSteps: number[];
}
