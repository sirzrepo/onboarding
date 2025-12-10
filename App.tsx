import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { WelcomeContent } from './components/WelcomeContent';
import { LogoUploadStep } from './components/LogoUploadStep';
import { BrandColorsStep } from './components/BrandColorsStep';
import { ThemeStyleStep } from './components/ThemeStyleStep';
import { ShopifyConnectionStep } from './components/ShopifyConnectionStep';
import { ReviewStep } from './components/ReviewStep';
import { PlaceholderStep } from './components/PlaceholderStep';
import { Dashboard } from './components/Dashboard';
import { STEPS } from './constants';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [logo, setLogo] = useState<string | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  
  // Defaulting to the Orange palette from the screenshot preview
  const [primaryColor, setPrimaryColor] = useState('#ea580c'); 
  const [accentColor, setAccentColor] = useState('#fbbf24');

  // Default theme
  const [themeStyle, setThemeStyle] = useState('playful');

  // Shopify Connection State
  const [isShopifyConnected, setIsShopifyConnected] = useState(false);

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    // Jump to the end or skip logic
    setCurrentStep(STEPS.length);
  };

  const handleFinishSetup = () => {
    setShowDashboard(true);
  };

  const handleLogout = () => {
    setShowDashboard(false);
    setCurrentStep(1);
  };

  // If dashboard state is active, render the full dashboard view
  if (showDashboard) {
    return (
      <Dashboard 
        logo={logo}
        primaryColor={primaryColor}
        isShopifyConnected={isShopifyConnected}
        onLogout={handleLogout}
      />
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeContent onStart={handleNext} onSkip={handleSkip} />;
      case 2:
        return (
          <LogoUploadStep 
            onNext={handleNext} 
            onBack={handleBack}
            logo={logo}
            setLogo={setLogo}
          />
        );
      case 3:
        return (
          <BrandColorsStep 
            onNext={handleNext} 
            onBack={handleBack}
            primaryColor={primaryColor}
            setPrimaryColor={setPrimaryColor}
            accentColor={accentColor}
            setAccentColor={setAccentColor}
          />
        );
      case 4:
        return (
          <ThemeStyleStep 
            onNext={handleNext} 
            onBack={handleBack}
            themeStyle={themeStyle}
            setThemeStyle={setThemeStyle}
            primaryColor={primaryColor}
          />
        );
      case 5:
        return (
          <ShopifyConnectionStep 
            onNext={handleNext} 
            onBack={handleBack}
            isConnected={isShopifyConnected}
            setIsConnected={setIsShopifyConnected}
          />
        );
      case 6:
        return (
          <ReviewStep
            onBack={handleBack}
            logo={logo}
            primaryColor={primaryColor}
            accentColor={accentColor}
            themeStyle={themeStyle}
            isShopifyConnected={isShopifyConnected}
            onFinish={handleFinishSetup}
          />
        );
      default:
        return (
          <PlaceholderStep 
            title={STEPS.find(s => s.id === currentStep)?.label || 'Step'} 
            stepNumber={currentStep}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8 font-sans">
      {/* Main Card Container - Removed overflow-hidden and added specific rounded corners to children for sticky support */}
      <div className="bg-white w-full max-w-[1200px] min-h-[800px] rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] flex flex-col md:flex-row relative">
        
        {/* Left Content Panel */}
        <div className="flex-1 relative overflow-hidden flex flex-col rounded-t-[2.5rem] md:rounded-l-[2.5rem] md:rounded-tr-none">
            {/* Background Gradients & Mesh */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 z-0"></div>
            
            {/* Soft Orbs for Mesh Effect */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-pink-200/40 rounded-full blur-3xl opacity-60 animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-3xl opacity-60"></div>
            <div className="absolute top-[40%] left-[40%] w-[300px] h-[300px] bg-white rounded-full blur-3xl opacity-80 mix-blend-overlay"></div>

            {/* Content Area - Removed overflow-y-auto to allow window scrolling */}
            <div className="relative z-10 flex-1 flex flex-col p-8 md:p-12">
               <div className="flex-1 flex flex-col justify-center">
                  {renderStepContent()}
               </div>
            </div>
        </div>

        {/* Right Sidebar */}
        <Sidebar 
            currentStep={currentStep} 
            onStepClick={(id) => setCurrentStep(id)}
        />
      </div>
    </div>
  );
};

export default App;
