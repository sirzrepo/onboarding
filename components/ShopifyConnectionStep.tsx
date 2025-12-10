import React, { useState } from 'react';
import { ShoppingBag, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from './Button';

interface ShopifyConnectionStepProps {
  onNext: () => void;
  onBack: () => void;
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;
}

export const ShopifyConnectionStep: React.FC<ShopifyConnectionStepProps> = ({
  onNext,
  onBack,
  isConnected,
  setIsConnected,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shopifyLink, setShopifyLink] = useState('');

  const benefits = [
    "Sync product images and media",
    "Generate AI content for your products",
    "Manage assets across platforms",
    "Streamline your workflow"
  ];

  const handleConnectClick = () => {
    setIsModalOpen(true);
  };

  const handleModalSubmit = () => {
    if (shopifyLink.trim()) {
      setIsModalOpen(false);
      // Simulate API delay if desired, but for now just switch state
      setIsConnected(true);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setShopifyLink('');
  };

  return (
    <>
      <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
        
        <div className="flex-1 flex flex-col items-center">
            {/* Header */}
            <div className="text-center mb-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-slate-800 mb-2">Connect Your Shopify Store</h2>
            <p className="text-slate-500">Link your Shopify store to sync products and media assets seamlessly with your AI workspace</p>
            </div>

            {!isConnected ? (
                /* Initial Connection Card */
                <div className="bg-white rounded-[2rem] p-10 md:p-12 shadow-sm border border-slate-100/60 w-full max-w-[640px] flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
                
                {/* Icon */}
                <div className="w-28 h-28 bg-blue-50/80 rounded-3xl flex items-center justify-center mb-8 shadow-inner">
                    <ShoppingBag size={48} className="text-blue-600" strokeWidth={2.5} />
                </div>

                <h3 className="text-lg font-medium text-slate-800 mb-2">Connect to Shopify</h3>
                <p className="text-slate-500 mb-8 text-sm">Connecting your Shopify store allows you to:</p>

                {/* Benefits List */}
                <div className="w-full space-y-3 mb-10">
                    {benefits.map((benefit, index) => (
                    <div 
                        key={index}
                        className="bg-slate-50 rounded-xl py-3 px-4 flex items-center justify-start gap-4"
                    >
                        <div className="w-2 h-2 rounded-full bg-pink-500 shrink-0" />
                        <span className="text-slate-600 text-sm font-medium text-left">{benefit}</span>
                    </div>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col-reverse sm:flex-row items-center gap-4 w-full">
                    <Button 
                    variant="outline" 
                    onClick={onNext}
                    className="w-full sm:w-1/2 border-slate-300 text-slate-600 hover:bg-slate-50 rounded-xl"
                    >
                    Skip for now
                    </Button>
                    <Button 
                    onClick={handleConnectClick}
                    className="w-full sm:w-1/2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-blue-200"
                    >
                    <ShoppingBag size={18} className="mr-2" />
                    Connect Shopify
                    </Button>
                </div>
                </div>
            ) : (
                /* Successfully Connected Card */
                <div className="bg-white rounded-[2rem] p-10 md:p-12 shadow-sm border border-slate-100/60 w-full max-w-[640px] flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
                    
                    {/* Success Icon */}
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center mb-8 shadow-lg shadow-purple-200">
                        <Check size={48} className="text-white" strokeWidth={3} />
                    </div>

                    <h3 className="text-lg font-medium text-slate-800 mb-2">Successfully Connected!</h3>
                    <p className="text-slate-500 mb-8 text-sm">Your Shopify store is now integrated with your AI workspace</p>

                    {/* Store Card Info */}
                    <div className="w-full bg-slate-50 rounded-2xl p-4 flex items-center gap-4 mb-8 border border-slate-100">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-blue-100 shrink-0">
                            <ShoppingBag size={24} className="text-blue-600" />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="text-xs text-slate-500 font-medium">Store Name</p>
                            <p className="text-slate-900 font-semibold">Your Company</p>
                        </div>
                        <div className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                            Active
                        </div>
                    </div>

                    {/* Success Action Buttons */}
                    <div className="w-full space-y-4">
                        <Button 
                            onClick={onNext}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-blue-200 py-4"
                        >
                            Continue to Dashboard <ArrowRight size={18} className="ml-2" />
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={handleDisconnect}
                            className="w-full border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-red-500 hover:border-red-200 rounded-xl"
                        >
                            Disconnect
                        </Button>
                    </div>
                </div>
            )}
        </div>

        {/* Navigation Footer */}
        <div className="mt-auto pt-6 border-t border-slate-100/50 w-full">
            <Button variant="outline" onClick={onBack} className="text-blue-600 border-blue-200 hover:bg-blue-50">
                <ArrowLeft size={18} className="mr-2"/> Back
            </Button>
        </div>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-300" 
                onClick={() => setIsModalOpen(false)}
            />
            
            {/* Modal Content */}
            <div className="bg-white rounded-[2rem] p-8 w-full max-w-[480px] shadow-2xl relative z-10 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                <h3 className="text-2xl font-semibold text-slate-800 mb-6">Input shopify link</h3>
                
                <div className="space-y-2 mb-8">
                    <label className="text-sm font-medium text-slate-900">Link</label>
                    <input 
                        type="text"
                        value={shopifyLink}
                        onChange={(e) => setShopifyLink(e.target.value)}
                        placeholder="Type here"
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        autoFocus
                    />
                </div>

                <Button 
                    onClick={handleModalSubmit}
                    disabled={!shopifyLink.trim()}
                    className={`w-full rounded-xl py-4 shadow-lg shadow-blue-500/20 ${!shopifyLink.trim() ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                >
                    <ShoppingBag size={20} className="mr-2" />
                    Connect Shopify
                </Button>
            </div>
        </div>
      )}
    </>
  );
};
