import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from './Button';

interface WelcomeContentProps {
  onStart: () => void;
  onSkip: () => void;
}

export const WelcomeContent: React.FC<WelcomeContentProps> = ({ onStart, onSkip }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Logo Area */}
      <div className="mb-12 relative">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-700 rounded-lg flex items-center justify-center text-white relative shadow-xl shadow-blue-900/20 transform -rotate-6">
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="3" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-7 h-7"
            >
              <path d="M7 20l10-16" />
              <path d="M6 10l-2 2 2 2" />
              <path d="M18 14l2-2-2-2" />
            </svg>
          </div>
          <span className="text-4xl font-bold text-slate-800 tracking-tight">SIRz</span>
        </div>
      </div>

      <h1 className="text-2xl text-slate-800 font-medium mb-4">
        Welcome! Let's set up your SIRZ AI Agents
      </h1>

      <p className="text-slate-500 leading-relaxed mb-10 max-w-md">
        Customize your colors, upload your logo, and connect your store. 
        In just a few steps, you'll have a beautiful AI-powered workspace that feels uniquely yours.
      </p>

      <div className="flex items-center gap-4 w-full justify-center">
        <Button variant="outline" onClick={onSkip} className="min-w-[140px]">
          Skip for now
        </Button>
        <Button onClick={onStart} className="min-w-[160px]">
          Start Setup
          <ArrowRight size={18} />
        </Button>
      </div>
    </div>
  );
};
