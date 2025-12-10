import React from 'react';
import { ArrowLeft, ArrowRight, Check, Image as ImageIcon, Palette, Layout, ShoppingBag } from 'lucide-react';
import { Button } from './Button';

interface ReviewStepProps {
  onBack: () => void;
  logo: string | null;
  primaryColor: string;
  accentColor: string;
  themeStyle: string;
  isShopifyConnected: boolean;
  onFinish?: () => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  onBack,
  logo,
  primaryColor,
  accentColor,
  themeStyle,
  isShopifyConnected,
  onFinish
}) => {
  
  // Helper to capitlize theme name
  const themeName = themeStyle.charAt(0).toUpperCase() + themeStyle.slice(1);

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-right-4 duration-500 w-full">
      
      {/* Content Area */}
      <div className="flex flex-col items-center pb-8 w-full">
        
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6 shadow-lg shadow-purple-200">
            <Check size={40} className="text-white" strokeWidth={3} />
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-2">Review Your Setup</h2>
        <p className="text-slate-500 mb-10 text-center max-w-md">Everything looks great! Review your customizations and launch your branded AI workspace.</p>

        {/* 2x2 Grid Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl mb-8">
            
            {/* Logo Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
                        <ImageIcon size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-slate-800">Logo</h3>
                        <p className="text-xs text-slate-400">{logo ? 'Uploaded' : 'Not Uploaded'}</p>
                    </div>
                </div>
                <div className="flex-1 bg-slate-50 rounded-2xl flex items-center justify-center p-4 min-h-[100px]">
                    {logo ? (
                        <img src={logo} alt="Logo" className="max-h-16 max-w-full object-contain" />
                    ) : (
                        <span className="text-slate-400 text-sm">No Logo</span>
                    )}
                </div>
            </div>

            {/* Colors Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
                        <Palette size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-slate-800">Brand Colors</h3>
                        <p className="text-xs text-slate-400">Customized</p>
                    </div>
                </div>
                <div className="flex-1 bg-slate-50 rounded-2xl flex items-center justify-center gap-4 min-h-[100px]">
                    <div 
                        className="w-12 h-12 rounded-xl shadow-sm border-2 border-white ring-1 ring-slate-200"
                        style={{ backgroundColor: primaryColor }}
                    />
                    <div 
                        className="w-12 h-12 rounded-xl shadow-sm border-2 border-white ring-1 ring-slate-200"
                        style={{ backgroundColor: accentColor }}
                    />
                </div>
            </div>

            {/* Theme Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-500">
                        <Layout size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-slate-800">Theme Style</h3>
                        <p className="text-xs text-slate-400">{themeName}</p>
                    </div>
                </div>
                <div className="flex-1 bg-slate-50 rounded-2xl flex items-center justify-center p-4 min-h-[100px]">
                    <div 
                        className="px-6 py-2 rounded-lg text-white font-medium text-sm shadow-md"
                        style={{ backgroundColor: primaryColor }}
                    >
                        {themeName}
                    </div>
                </div>
            </div>

            {/* Shopify Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center text-pink-500">
                        <ShoppingBag size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-slate-800">Shopify</h3>
                        <p className="text-xs text-slate-400">{isShopifyConnected ? 'Connected' : 'Skipped'}</p>
                    </div>
                </div>
                <div className="flex-1 bg-slate-50 rounded-2xl flex items-center justify-center p-4 min-h-[100px]">
                    {isShopifyConnected ? (
                        <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide">
                            Active
                        </span>
                    ) : (
                        <span className="bg-slate-200 text-slate-500 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide">
                            Not Connected
                        </span>
                    )}
                </div>
            </div>

        </div>

        {/* Dashboard Preview Section */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm w-full max-w-4xl">
            <h3 className="text-center text-slate-800 font-medium mb-6">Dashboard Preview</h3>
            
            <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                {/* Simulated Header */}
                <div 
                    className="h-16 w-full flex items-center px-6 justify-between"
                    style={{ backgroundColor: primaryColor }}
                >
                    <div className="flex items-center gap-3 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm">
                         <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center overflow-hidden">
                            {logo ? <img src={logo} className="w-full h-full object-contain" /> : <div className="w-4 h-4 bg-slate-200 rounded-full" />}
                         </div>
                    </div>
                    <div className="w-8 h-8 bg-white/20 rounded-full"></div>
                </div>

                {/* Simulated Body */}
                <div className="bg-slate-50 p-8 flex flex-col gap-6 items-center">
                    
                    {/* Simulated Cards Row */}
                    <div className="flex gap-4 w-full">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex-1 bg-red-50/50 border border-red-100/50 rounded-xl p-4 h-24 flex flex-col justify-center items-center">
                                <div className="w-12 h-3 bg-slate-200 rounded-full mb-3"></div>
                                <div className="w-3/4 h-2 bg-slate-100 rounded-full mb-2"></div>
                                <div className="w-1/2 h-2 bg-slate-100 rounded-full"></div>
                            </div>
                        ))}
                    </div>

                     {/* CTA Button */}
                    <button 
                        className="mt-2 px-8 py-3 rounded-lg text-white font-medium shadow-md transition-transform hover:scale-105"
                        style={{ backgroundColor: primaryColor }}
                    >
                        Generate Media
                    </button>
                </div>
            </div>
        </div>

      </div>

      {/* Footer Actions */}
      <div className="mt-4 pt-6 border-t border-slate-100/50 flex flex-col items-center relative">
         <div className="absolute left-0 top-6">
            <Button variant="outline" onClick={onBack} className="text-blue-600 border-blue-200 hover:bg-blue-50">
                <ArrowLeft size={18} className="mr-2"/> Back
            </Button>
         </div>
         
         <Button 
            className="px-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-500/30"
            onClick={onFinish}
         >
            Finish & Go to Dashboard <ArrowRight size={18} className="ml-2" />
         </Button>

         {/* Pagination Dots */}
         <div className="flex gap-2 mt-6">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
            <div className="w-8 h-1.5 rounded-full bg-purple-500"></div>
         </div>
      </div>

    </div>
  );
};
