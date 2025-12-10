import React from 'react';
import { Palette, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { Button } from './Button';

interface BrandColorsStepProps {
  onNext: () => void;
  onBack: () => void;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
}

const PALETTES = [
  { name: 'Purple Dream', primary: '#6366f1', accent: '#ec4899' },
  { name: 'Ocean Blue', primary: '#3b82f6', accent: '#06b6d4' },
  { name: 'Forest Green', primary: '#10b981', accent: '#84cc16' },
  { name: 'Sunset Orange', primary: '#ea580c', accent: '#fbbf24' },
  { name: 'Royal Purple', primary: '#8b5cf6', accent: '#d946ef' },
  { name: 'Cherry Red', primary: '#ef4444', accent: '#f43f5e' },
];

export const BrandColorsStep: React.FC<BrandColorsStepProps> = ({
  onNext,
  onBack,
  primaryColor,
  setPrimaryColor,
  accentColor,
  setAccentColor,
}) => {
  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-slate-800 mb-2">Choose Your Brand Colors</h2>
        <p className="text-slate-500">Pick colors that represent your brand, or choose from our suggested palettes</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        
        {/* Left Column: Controls */}
        <div className="space-y-8">
          
          {/* Manual Color Pickers */}
          <div className="space-y-6">
            
            {/* Primary Color Input */}
            <div>
              <label className="flex items-center gap-2 text-slate-800 font-semibold mb-3">
                <Palette size={18} className="text-blue-600" /> Primary Brand Color
              </label>
              <div className="flex items-center gap-4">
                <div className="relative group shrink-0">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div 
                    className="w-16 h-14 rounded-xl border-2 border-slate-200 shadow-sm transition-transform group-hover:scale-105"
                    style={{ backgroundColor: primaryColor }}
                  />
                </div>
                <div className="flex-1">
                  <span className="text-xs text-slate-500 font-medium block mb-1.5 uppercase tracking-wide">Hex Code</span>
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-full border-2 border-slate-300 rounded-xl px-4 py-3 text-slate-900 font-mono text-base font-medium bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all shadow-sm placeholder:text-slate-300"
                    placeholder="#000000"
                  />
                </div>
              </div>
            </div>

            {/* Accent Color Input */}
            <div>
              <label className="flex items-center gap-2 text-slate-800 font-semibold mb-3">
                <span className="text-xl leading-none">✨</span> Accent Color
              </label>
              <div className="flex items-center gap-4">
                <div className="relative group shrink-0">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div 
                    className="w-16 h-14 rounded-xl border-2 border-slate-200 shadow-sm transition-transform group-hover:scale-105"
                    style={{ backgroundColor: accentColor }}
                  />
                </div>
                <div className="flex-1">
                  <span className="text-xs text-slate-500 font-medium block mb-1.5 uppercase tracking-wide">Hex Code</span>
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-full border-2 border-slate-300 rounded-xl px-4 py-3 text-slate-900 font-mono text-base font-medium bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all shadow-sm placeholder:text-slate-300"
                    placeholder="#000000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Suggested Palettes */}
          <div>
            <h3 className="text-slate-800 font-semibold mb-4">Suggested Palettes</h3>
            <div className="grid grid-cols-2 gap-3">
              {PALETTES.map((palette) => {
                const isActive = palette.primary === primaryColor && palette.accent === accentColor;
                return (
                  <button
                    key={palette.name}
                    onClick={() => {
                      setPrimaryColor(palette.primary);
                      setAccentColor(palette.accent);
                    }}
                    className={`
                      p-3 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-3 group hover:border-blue-300 hover:bg-blue-50/50
                      ${isActive ? 'border-blue-600 bg-blue-50 shadow-md ring-2 ring-blue-100' : 'border-slate-200 bg-white hover:shadow-sm'}
                    `}
                  >
                    <div className="flex -space-x-2 shrink-0">
                      <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-100" style={{ backgroundColor: palette.primary }} />
                      <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-100" style={{ backgroundColor: palette.accent }} />
                    </div>
                    <span className={`text-sm font-semibold ${isActive ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-800'}`}>
                      {palette.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Live Preview */}
        <div className="flex flex-col h-full">
            <h3 className="text-slate-700 font-medium mb-4">Live Preview</h3>
            
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex-1 flex flex-col gap-6">
                
                {/* Preview: Sidebar */}
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2 block">Sidebar</span>
                  <div 
                    className="rounded-xl p-4 transition-colors duration-300 shadow-inner"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <div className="flex flex-col gap-2">
                        <div className="bg-white/20 backdrop-blur-sm h-8 w-10 rounded-md mb-2"></div>
                        <div className="bg-white/10 h-8 w-full rounded-md flex items-center px-3 border border-white/5">
                            <span className="text-white/90 text-xs font-medium">Dashboard</span>
                        </div>
                        <div className="h-8 w-full rounded-md flex items-center px-3 hover:bg-white/10 transition-colors cursor-default">
                            <span className="text-white/60 text-xs font-medium">Media</span>
                        </div>
                        <div className="h-8 w-full rounded-md flex items-center px-3 hover:bg-white/10 transition-colors cursor-default">
                            <span className="text-white/60 text-xs font-medium">History</span>
                        </div>
                    </div>
                  </div>
                </div>

                {/* Preview: Header */}
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2 block">Header</span>
                  <div 
                    className="rounded-xl p-3 flex items-center justify-between transition-colors duration-300 shadow-sm"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <span className="text-white text-sm font-medium ml-2">Dashboard</span>
                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md"></div>
                  </div>
                </div>

                {/* Preview: Buttons */}
                <div>
                   <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2 block">Buttons</span>
                   <div className="flex flex-col gap-3">
                       <button 
                        className="w-full py-3 rounded-lg text-white font-bold text-sm shadow-md transition-all duration-300 hover:brightness-110 hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
                        style={{ backgroundColor: primaryColor }}
                       >
                           Primary Button
                       </button>
                       <button 
                        className="w-full py-3 rounded-lg font-bold text-sm border-2 transition-all duration-300 bg-white hover:bg-slate-50"
                        style={{ borderColor: primaryColor, color: primaryColor }}
                       >
                           Secondary Button
                       </button>
                   </div>
                </div>

                {/* Preview: Cards */}
                <div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2 block">Cards</span>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 shadow-sm">
                        <div className="h-4 w-1/4 bg-slate-200 rounded mb-3"></div>
                        <div className="h-2 w-3/4 bg-slate-200 rounded mb-2"></div>
                        <div className="h-2 w-1/2 bg-slate-200 rounded"></div>
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
