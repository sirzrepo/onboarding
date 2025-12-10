import React from 'react';
import { Button } from './Button';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface PlaceholderStepProps {
  title: string;
  stepNumber: number;
  onNext: () => void;
  onBack: () => void;
}

export const PlaceholderStep: React.FC<PlaceholderStepProps> = ({ title, stepNumber, onNext, onBack }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center max-w-lg mx-auto animate-in fade-in zoom-in-95 duration-300">
      <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-6 text-2xl font-bold text-blue-600">
        {stepNumber}
      </div>
      <h2 className="text-3xl font-semibold text-slate-800 mb-4">{title}</h2>
      <p className="text-slate-500 mb-10">
        This is a functional placeholder for the <strong>{title}</strong> step. 
        In a real application, this would contain specific forms and inputs.
      </p>
      
      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack}>
            <ArrowLeft size={18} className="mr-2"/> Back
        </Button>
        <Button onClick={onNext}>
            Continue <ArrowRight size={18} />
        </Button>
      </div>
    </div>
  );
};
