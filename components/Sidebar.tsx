import React from 'react';
import { Step } from '../types';
import { STEPS } from '../constants';

interface SidebarProps {
  currentStep: number;
  onStepClick: (stepId: number) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentStep, onStepClick }) => {
  const progressPercentage = Math.round(((currentStep - 0.5) / STEPS.length) * 100);

  return (
    <div className="w-full md:w-[320px] lg:w-[380px] bg-white border-l border-gray-100 p-8 md:p-10 shrink-0 rounded-b-[2.5rem] md:rounded-r-[2.5rem] md:rounded-bl-none md:rounded-l-none relative">
      
      {/* Sticky Content Wrapper */}
      <div className="sticky top-12 flex flex-col gap-8">
          <div>
            <h2 className="text-gray-900 font-medium text-lg mb-1">Setup Progress</h2>
            <p className="text-gray-500 text-sm mb-4">Step {currentStep} of {STEPS.length}</p>
            
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-400 transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">{progressPercentage}% complete</p>
          </div>

          <div className="relative">
            {/* Vertical Line Connector */}
            <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-gray-100 -z-0" />

            <div className="space-y-2">
              {STEPS.map((step) => {
                const isActive = step.id === currentStep;
                const isCompleted = step.id < currentStep;
                const Icon = step.icon;

                return (
                  <div 
                    key={step.id}
                    className={`
                      relative z-10 flex items-center gap-4 p-3 rounded-xl transition-all duration-200 cursor-pointer
                      ${isActive ? 'bg-pink-50' : 'hover:bg-gray-50'}
                    `}
                    onClick={() => onStepClick(step.id)}
                  >
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors duration-200
                      ${isActive 
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500 border-transparent text-white shadow-md shadow-pink-200' 
                        : isCompleted
                          ? 'bg-green-100 border-green-200 text-green-600'
                          : 'bg-gray-100 border-transparent text-gray-400'
                      }
                    `}>
                      <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                    </div>
                    <span className={`
                      font-medium text-sm transition-colors duration-200
                      ${isActive ? 'text-gray-900' : 'text-gray-500'}
                    `}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center leading-relaxed">
              Your workspace will be ready in just a<br />few steps
            </p>
          </div>
      </div>
    </div>
  );
};
