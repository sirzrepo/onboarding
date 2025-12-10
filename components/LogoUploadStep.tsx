import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, ArrowRight, ArrowLeft, X } from 'lucide-react';
import { Button } from './Button';

interface LogoUploadStepProps {
  onNext: () => void;
  onBack: () => void;
  logo: string | null;
  setLogo: (logo: string | null) => void;
}

export const LogoUploadStep: React.FC<LogoUploadStepProps> = ({ onNext, onBack, logo, setLogo }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearLogo = () => {
    setLogo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/png, image/jpeg, image/svg+xml"
      />

      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-2xl font-semibold text-slate-800 mb-2">Upload Your Logo</h2>
        <p className="text-slate-500">Add your company logo to personalize your workspace</p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Left Col: Upload Area */}
        <div 
          className={`
            bg-white rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-sm border-2 transition-all duration-200 min-h-[360px] relative
            ${isDragging ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100'}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {logo ? (
            <div className="animate-in zoom-in-50 duration-300 flex flex-col items-center w-full">
              <div className="relative mb-8 group">
                <img 
                  src={logo} 
                  alt="Uploaded Logo" 
                  className="max-h-32 max-w-[80%] object-contain"
                />
                <button 
                  onClick={clearLogo}
                  className="absolute -top-4 -right-4 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-md"
                >
                  <X size={16} />
                </button>
              </div>
              
              <p className="text-slate-600 font-medium mb-6">Logo uploaded successfully!</p>
              
              <Button 
                variant="outline" 
                onClick={triggerFileInput} 
                className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700"
              >
                Change Logo
              </Button>
            </div>
          ) : (
            <>
              <div className="w-24 h-24 bg-purple-100 rounded-3xl flex items-center justify-center mb-6 text-purple-600 shadow-inner">
                <Upload size={40} strokeWidth={2} />
              </div>
              
              <h3 className="text-slate-800 font-medium text-lg mb-2">Drag & drop your logo here</h3>
              <p className="text-slate-400 mb-6">or</p>
              
              <Button variant="primary" className="mb-6 w-48" onClick={triggerFileInput}>
                <ImageIcon size={18} className="mr-2" />
                Browse Files
              </Button>
              
              <p className="text-slate-400 text-sm">PNG, JPG, or SVG up to 10MB</p>
            </>
          )}
        </div>

        {/* Right Col: Live Preview */}
        <div className="flex flex-col space-y-6">
          <h3 className="text-slate-700 font-medium">Live Preview</h3>
          
          {/* Preview Stack */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            
            {/* Sidebar Preview */}
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2 block">Sidebar</span>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="bg-white p-3 rounded-lg shadow-sm flex items-center gap-3 border border-slate-100 w-full max-w-[240px]">
                  <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded bg-slate-100 overflow-hidden">
                    {logo ? (
                      <img src={logo} alt="Preview" className="w-full h-full object-contain" />
                    ) : (
                      <ImageIcon size={14} className="text-slate-400" />
                    )}
                  </div>
                  {logo ? (
                     <div className="h-4 w-24 bg-slate-100 rounded opacity-50 flex items-center text-[10px] text-slate-400 px-2 font-medium">Dashboard</div>
                  ) : (
                     <div className="h-2 w-20 bg-slate-200 rounded"></div>
                  )}
                </div>
              </div>
            </div>

            {/* Top Navigation Preview */}
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2 block">Top Navigation</span>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="bg-white p-3 rounded-lg shadow-sm flex items-center justify-between border border-slate-100">
                  <div className="h-8 flex items-center">
                    {logo ? (
                      <img src={logo} alt="Preview" className="h-6 object-contain" />
                    ) : (
                       <div className="w-10 h-6 bg-slate-200 rounded flex items-center justify-center text-slate-400">
                        <ImageIcon size={12} />
                      </div>
                    )}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                </div>
              </div>
            </div>

             {/* Favicon Preview */}
             <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2 block">Favicon / Mini</span>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="bg-white py-3 px-4 rounded-t-lg shadow-sm inline-flex items-center gap-3 border border-slate-100 min-w-[200px]">
                  <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded overflow-hidden">
                    {logo ? (
                      <img src={logo} alt="Preview" className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 rounded">
                        <ImageIcon size={10} />
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-slate-400 font-normal">Browser Tab</div>
                </div>
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
