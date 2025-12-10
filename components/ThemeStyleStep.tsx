import React from 'react';
import { ArrowRight, ArrowLeft, Smile, Zap, Feather, Maximize2, Check } from 'lucide-react';
import { Button } from './Button';

interface ThemeStyleStepProps {
  onNext: () => void;
  onBack: () => void;
  themeStyle: string;
  setThemeStyle: (style: string) => void;
  primaryColor: string;
}

const THEMES = [
  {
    id: 'minimal',
    label: 'Minimal',
    description: 'Clean edges, subtle shadows, and refined simplicity',
    icon: Maximize2,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-50',
  },
  {
    id: 'playful',
    label: 'Playful',
    description: 'Rounded corners, bubbly shapes, and light gradients',
    icon: Smile,
    iconColor: 'text-orange-500',
    iconBg: 'bg-orange-50',
  },
  {
    id: 'bold',
    label: 'Bold',
    description: 'Strong contrast, heavier typography, and dramatic presence',
    icon: Zap,
    iconColor: 'text-red-500',
    iconBg: 'bg-red-50',
  },
  {
    id: 'soft',
    label: 'Soft',
    description: 'Pastel UI, gentle shadows, and soothing aesthetics',
    icon: Feather,
    iconColor: 'text-rose-500',
    iconBg: 'bg-rose-50',
  },
];

export const ThemeStyleStep: React.FC<ThemeStyleStepProps> = ({
  onNext,
  onBack,
  themeStyle,
  setThemeStyle,
  primaryColor,
}) => {
  
  // Helper to get styles based on current theme
  const getThemeStyles = (themeId: string) => {
    switch (themeId) {
      case 'minimal':
        return {
          card: 'rounded-md shadow-sm border border-slate-200',
          button: 'rounded-md shadow-sm uppercase text-xs tracking-wider',
          input: 'rounded-md',
          navItem: 'rounded-md',
        };
      case 'playful':
        return {
          card: 'rounded-[2rem] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] border border-slate-100',
          button: 'rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform',
          input: 'rounded-2xl',
          navItem: 'rounded-full',
        };
      case 'bold':
        return {
          card: 'rounded-none border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]',
          button: 'rounded-none border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] uppercase font-bold',
          input: 'rounded-none border-2 border-slate-900',
          navItem: 'rounded-none',
        };
      case 'soft':
        return {
          card: 'rounded-2xl shadow-lg shadow-slate-200/50 border-0',
          button: 'rounded-xl shadow-md font-medium',
          input: 'rounded-xl',
          navItem: 'rounded-xl',
        };
      default:
        return {
          card: 'rounded-2xl',
          button: 'rounded-lg',
          input: 'rounded-lg',
          navItem: 'rounded-lg',
        };
    }
  };

  const activeStyles = getThemeStyles(themeStyle);
  const selectedTheme = THEMES.find(t => t.id === themeStyle);

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-slate-800 mb-2">Choose Your Theme Style</h2>
        <p className="text-slate-500">Select a visual direction that matches your brand's personality. This will influence buttons, cards, and overall aesthetics.</p>
      </div>

      {/* Theme Selection Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {THEMES.map((theme) => {
          const isSelected = themeStyle === theme.id;
          const styles = getThemeStyles(theme.id);
          const Icon = theme.icon;

          return (
            <div
              key={theme.id}
              onClick={() => setThemeStyle(theme.id)}
              className={`
                relative p-5 cursor-pointer bg-white transition-all duration-300 flex flex-col h-full
                ${isSelected 
                  ? 'ring-2 ring-purple-500 shadow-xl shadow-purple-500/10 scale-105 z-10' 
                  : 'border border-slate-100 hover:border-slate-300 hover:shadow-md hover:-translate-y-1'
                }
                ${theme.id === 'playful' ? 'rounded-[1.5rem]' : theme.id === 'bold' ? 'rounded-md' : 'rounded-2xl'}
              `}
            >
              {isSelected && (
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-md z-20">
                  <Check size={16} strokeWidth={3} />
                </div>
              )}

              <div className={`w-12 h-12 ${theme.iconBg} ${theme.iconColor} rounded-2xl flex items-center justify-center mb-4`}>
                <Icon size={24} strokeWidth={2.5} />
              </div>

              <h3 className="font-semibold text-slate-800 mb-2">{theme.label}</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-6 flex-grow">{theme.description}</p>

              {/* Mini Preview within Card */}
              <div className="mt-auto pointer-events-none select-none opacity-80">
                 <div className={`w-full py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-center text-xs mb-3 ${styles.button}`}>
                    Button
                 </div>
                 <div className={`w-full p-2 bg-slate-50 border border-slate-100 ${styles.card}`}>
                    <div className="w-1/2 h-2 bg-slate-200 rounded-full mb-2"></div>
                    <div className="w-3/4 h-2 bg-slate-100 rounded-full"></div>
                 </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Preview Section */}
      <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
        <h3 className="text-center text-slate-700 font-medium mb-8">
          Your Selection: <span className="text-slate-900 font-semibold">{selectedTheme?.label}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Preview: Dashboard Cards */}
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-3 block">Dashboard Cards</label>
            <div className={`bg-pink-50/50 border border-pink-100 p-6 h-32 flex flex-col justify-center ${activeStyles.card}`}>
               <div className="w-12 h-3 bg-slate-400/50 rounded-sm mb-4"></div>
               <div className="w-full h-2 bg-slate-200 rounded-sm mb-2"></div>
               <div className="w-3/4 h-2 bg-slate-200 rounded-sm mb-2"></div>
               <div className="w-1/2 h-2 bg-slate-200 rounded-sm"></div>
            </div>
          </div>

          {/* Preview: Buttons */}
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-3 block">Buttons & CTAs</label>
            <div className="space-y-3">
               <button 
                  className={`w-full py-3 text-white font-medium text-sm transition-all ${activeStyles.button}`}
                  style={{ backgroundColor: primaryColor }}
               >
                 Generate Media
               </button>
               <button 
                  className={`w-full py-3 font-medium text-sm border-2 bg-white transition-all ${activeStyles.button}`}
                  style={{ borderColor: primaryColor, color: primaryColor }}
               >
                 View History
               </button>
            </div>
          </div>

          {/* Preview: Navigation */}
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-3 block">Navigation</label>
            <div 
              className={`p-4 h-32 flex flex-col gap-2 justify-center transition-all ${activeStyles.card}`}
              style={{ backgroundColor: primaryColor }}
            >
              <div className="bg-white/20 px-3 py-2 flex items-center rounded-lg">
                <span className="text-white text-xs font-medium">Dashboard</span>
              </div>
              <div className="bg-black/10 px-3 py-2 flex items-center rounded-lg">
                <span className="text-white/90 text-xs font-medium">Media</span>
              </div>
              <div className="bg-black/10 px-3 py-2 flex items-center rounded-lg">
                <span className="text-white/90 text-xs font-medium">Settings</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Navigation Footer */}
      <div className="mt-auto flex justify-between items-center pt-6 border-t border-slate-100/50">
        <Button variant="outline" onClick={onBack} className="text-blue-600 border-blue-200 hover:bg-blue-50">
            <ArrowLeft size={18} className="mr-2"/> Back
        </Button>
        <Button onClick={onNext} className="px-10 bg-blue-600 hover:bg-blue-700 text-white">
            Next <ArrowRight size={18} className="ml-2" />
        </Button>
      </div>
    </div>
  );
};
