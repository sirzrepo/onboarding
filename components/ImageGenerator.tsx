import React, { useState, useRef } from 'react';
import { ArrowLeft, Image as ImageIcon, Sparkles, Download, RefreshCw, Wand2, Lightbulb, Upload, X, Share2, Facebook, Linkedin, Instagram, Copy } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface ImageGeneratorProps {
  onBack: () => void;
  primaryColor?: string;
}

export const ImageGenerator: React.FC<ImageGeneratorProps> = ({ onBack, primaryColor = '#ea580c' }) => {
  const [mode, setMode] = useState<'generate' | 'edit'>('generate');
  const [prompt, setPrompt] = useState('Graphics for my beauty brand');
  const [style, setStyle] = useState('Realistic');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  
  // Edit Mode State
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Output State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const suggestions = [
      "A modern minimalist product on a clean white background",
      "Colorful abstract geometric shapes with gradient colors",
      "Professional business person in a contemporary office",
      "Beautiful sunset landscape with mountains and water"
  ];

  const styles = ['Realistic', 'Artistic', 'Abstract', 'Digital Art', 'Illustration', '3D Render'];
  const ratios = [
      { label: 'Square', value: '1:1' },
      { label: 'Landscape', value: '16:9' },
      { label: 'Portrait', value: '9:16' },
      { label: 'Standard', value: '4:3' }
  ];

  // Handle File Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setGeneratedImage(null); // Reset output when new input is added
      };
      reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearUploadedImage = () => {
      setUploadedImage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerate = async () => {
      if (!prompt) return;
      if (mode === 'edit' && !uploadedImage) return;

      setIsGenerating(true);
      setGeneratedImage(null);
      setShowShareMenu(false);

      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        let parts: any[] = [];

        // Construct Request based on Mode
        if (mode === 'edit' && uploadedImage) {
            // Edit Mode: Send Image + Text
            const [metadata, base64Data] = uploadedImage.split(',');
            const mimeType = metadata.match(/:(.*?);/)?.[1] || 'image/png';
            
            parts.push({
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType
                }
            });
            parts.push({ text: prompt });
        } else {
            // Generate Mode: Send Text only (styled)
            const finalPrompt = style === 'Realistic' ? prompt : `${prompt}, ${style} style`;
            parts.push({ text: finalPrompt });
        }

        const config: any = {};
        // Aspect ratio is typically for generation from scratch
        if (mode === 'generate') {
            config.imageConfig = { aspectRatio: aspectRatio as any };
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts },
            config
        });

        // Extract image from response
        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                    setGeneratedImage(imageUrl);
                    break;
                }
            }
        }
      } catch (error) {
          console.error("Error generating image:", error);
      } finally {
          setIsGenerating(false);
      }
  };

  const handleDownload = () => {
      if (generatedImage) {
          const link = document.createElement('a');
          link.href = generatedImage;
          link.download = `sirz-generated-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      }
  };

  const handleSocialShare = (platform: string) => {
    // 1. Download the image so the user has the asset to upload
    handleDownload();
    
    // 2. Open the platform in a new tab
    let url = '';
    const text = encodeURIComponent('Check out this image I created with SIRz AI!');
    
    switch (platform) {
        case 'twitter':
            url = `https://twitter.com/intent/tweet?text=${text}`;
            break;
        case 'facebook':
            url = `https://www.facebook.com/sharer/sharer.php`; 
            break;
        case 'linkedin':
            url = `https://www.linkedin.com/feed/?shareActive=true&text=${text}`;
            break;
        case 'instagram':
            url = `https://www.instagram.com/`;
            break;
    }
    
    if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
    }
    
    setShowShareMenu(false);
  };

  const handleShare = async () => {
      if (!generatedImage) return;

      // Use Web Share API if supported (Mobile/Modern Browsers)
      if (navigator.share) {
          try {
              const response = await fetch(generatedImage);
              const blob = await response.blob();
              const file = new File([blob], 'generated-image.png', { type: 'image/png' });
              
              await navigator.share({
                  title: 'Created with SIRz AI',
                  text: 'Check out this image I generated!',
                  files: [file]
              });
              return;
          } catch (err) {
              console.log('Native share failed, falling back to menu', err);
          }
      }
      
      // Fallback for desktop
      setShowShareMenu(!showShareMenu);
  };

  return (
    <div className="p-8 animate-in fade-in slide-in-from-right-8 duration-500 pb-20">
       <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
        className="hidden" 
        accept="image/*"
      />

       {/* Header */}
      <div className="mb-8">
          <button 
            onClick={onBack}
            className="flex items-center text-orange-600 font-medium mb-4 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Image Generator</h1>
          <p className="text-slate-500">Create or edit stunning visuals with AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Controls */}
          <div className="space-y-6">
              
              {/* Mode Switcher */}
              <div className="bg-slate-100/50 p-1.5 rounded-xl flex gap-1 border border-slate-200">
                  <button
                    onClick={() => { setMode('generate'); setPrompt('Graphics for my beauty brand'); }}
                    className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                        mode === 'generate' 
                        ? 'bg-white text-slate-900 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                    }`}
                  >
                      <Sparkles size={16} /> Text to Image
                  </button>
                  <button
                    onClick={() => { setMode('edit'); setPrompt('Add a neon glow effect'); }}
                    className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                        mode === 'edit' 
                        ? 'bg-white text-slate-900 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                    }`}
                  >
                      <RefreshCw size={16} /> Edit Image
                  </button>
              </div>

              {/* Upload Area (Edit Mode Only) */}
              {mode === 'edit' && (
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                      <label className="block text-slate-700 font-medium mb-4">Reference Image</label>
                      
                      {uploadedImage ? (
                          <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                              <img src={uploadedImage} alt="Reference" className="w-full h-48 object-contain" />
                              <button 
                                onClick={clearUploadedImage}
                                className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow-sm text-slate-500 hover:text-red-500 transition-colors"
                              >
                                  <X size={16} />
                              </button>
                          </div>
                      ) : (
                          <div 
                            onClick={triggerFileInput}
                            className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer group"
                          >
                              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors mb-3">
                                  <Upload size={24} />
                              </div>
                              <p className="text-sm font-medium text-slate-700">Click to upload image</p>
                              <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</p>
                          </div>
                      )}
                  </div>
              )}

              {/* Prompt Input */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <label className="block text-slate-700 font-medium mb-4">
                      {mode === 'generate' ? 'Describe what you want to create' : 'How should we edit this image?'}
                  </label>
                  <textarea 
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="w-full h-32 p-4 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 resize-none placeholder:text-slate-400 text-sm mb-4"
                      placeholder={mode === 'generate' ? "Enter your prompt here..." : "E.g., Add a sunglasses to the cat, Change background to beach..."}
                  />
                  
                  {mode === 'generate' && (
                      <div className="space-y-2">
                          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Suggestions</p>
                          {suggestions.slice(0, 2).map((s, i) => (
                              <button 
                                key={i}
                                onClick={() => setPrompt(s)}
                                className="w-full text-left p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-xs text-slate-600 flex items-start gap-2 group"
                              >
                                  <Wand2 size={14} className="mt-0.5 text-orange-400 shrink-0" />
                                  <span className="line-clamp-1">{s}</span>
                              </button>
                          ))}
                      </div>
                  )}
              </div>

              {/* Style & Ratio (Generate Mode Only) */}
              {mode === 'generate' && (
                <>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <label className="block text-slate-700 font-medium mb-4">Style</label>
                        <div className="flex flex-wrap gap-2">
                            {styles.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStyle(s)}
                                    className={`py-2 px-4 rounded-full text-xs font-medium transition-all border ${
                                        style === s
                                        ? 'border-[#a8a29e] bg-[#f5f5f4] text-slate-900'
                                        : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <label className="block text-slate-700 font-medium mb-4">Aspect Ratio</label>
                        <div className="grid grid-cols-4 gap-2">
                            {ratios.map((r) => (
                                <button
                                    key={r.value}
                                    onClick={() => setAspectRatio(r.value)}
                                    className={`py-3 rounded-lg text-xs font-medium transition-all border flex flex-col items-center gap-1 ${
                                        aspectRatio === r.value
                                        ? 'border-[#a8a29e] bg-[#f5f5f4] text-slate-900'
                                        : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                                >
                                    {r.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
              )}
              
              {/* Action Button */}
              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !prompt || (mode === 'edit' && !uploadedImage)}
                className={`w-full py-4 rounded-full text-white font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 ${
                    isGenerating || !prompt || (mode === 'edit' && !uploadedImage) ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'
                }`}
                style={{ backgroundColor: '#c2410c' }}
            >
                {isGenerating ? (
                    <>
                         <RefreshCw className="animate-spin" size={20} /> {mode === 'edit' ? 'Editing...' : 'Generating...'}
                    </>
                ) : (
                    <>
                        <Sparkles size={20} /> {mode === 'edit' ? 'Edit Image' : 'Generate Image'}
                    </>
                )}
            </button>

            {mode === 'edit' && (
                <div className="bg-blue-50/50 p-4 rounded-xl flex gap-3">
                    <Lightbulb size={20} className="text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-600 leading-relaxed">
                        <span className="font-semibold text-slate-800">Tip:</span> Be descriptive with your edit instructions. For example, "Change the background to a park" or "Make the product glow".
                    </p>
                </div>
            )}

          </div>

          {/* Right Column: Preview */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col h-full min-h-[740px]">
               <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 text-slate-800 font-medium">
                        <ImageIcon size={18} /> Preview
                    </div>
                    
                    {generatedImage && (
                        <div className="flex gap-2 relative">
                            {/* Download Button */}
                            <button 
                                onClick={handleDownload}
                                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-100"
                                title="Download Image"
                            >
                                <Download size={18} />
                            </button>

                            {/* Share Button */}
                            <button 
                                onClick={handleShare}
                                className={`p-2 hover:bg-slate-100 rounded-lg transition-colors border border-slate-100 ${showShareMenu ? 'bg-slate-100 text-slate-800' : 'text-slate-500'}`}
                                title="Share Image"
                            >
                                <Share2 size={18} />
                            </button>

                            {/* Desktop Share Menu Fallback */}
                            {showShareMenu && (
                                <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 p-4 z-10 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Share to Socials</div>
                                    
                                    <div className="grid grid-cols-4 gap-2 mb-4">
                                        {/* Facebook */}
                                        <button onClick={() => handleSocialShare('facebook')} className="flex flex-col items-center gap-2 group">
                                             <div className="w-12 h-12 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                <Facebook size={22} fill="currentColor" className="stroke-none" />
                                             </div>
                                             <span className="text-[10px] text-slate-600 font-medium group-hover:text-blue-600">Facebook</span>
                                        </button>

                                        {/* Instagram */}
                                        <button onClick={() => handleSocialShare('instagram')} className="flex flex-col items-center gap-2 group">
                                             <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FFD600] via-[#FF0100] to-[#D800B9] text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                <Instagram size={22} />
                                             </div>
                                             <span className="text-[10px] text-slate-600 font-medium group-hover:text-pink-600">Instagram</span>
                                        </button>

                                        {/* X (Twitter) */}
                                        <button onClick={() => handleSocialShare('twitter')} className="flex flex-col items-center gap-2 group">
                                             <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                                </svg>
                                             </div>
                                             <span className="text-[10px] text-slate-600 font-medium group-hover:text-black">X</span>
                                        </button>

                                        {/* LinkedIn */}
                                        <button onClick={() => handleSocialShare('linkedin')} className="flex flex-col items-center gap-2 group">
                                             <div className="w-12 h-12 rounded-full bg-[#0A66C2] text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                <Linkedin size={22} fill="currentColor" className="stroke-none" />
                                             </div>
                                             <span className="text-[10px] text-slate-600 font-medium group-hover:text-blue-700">LinkedIn</span>
                                        </button>
                                    </div>
                                    
                                    <div className="h-px bg-slate-100 my-3"></div>
                                    
                                    <button 
                                        onClick={() => {
                                            navigator.clipboard.writeText('Check out this image I made with SIRz!');
                                            setShowShareMenu(false);
                                        }}
                                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                                    >
                                        <Copy size={16} /> <span className="font-medium">Copy Caption</span>
                                    </button>
                                </div>
                            )}

                            {/* Reset/New Button */}
                            <button 
                                onClick={() => { setGeneratedImage(null); }}
                                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-100"
                                title="Start Over"
                            >
                                <RefreshCw size={18} />
                            </button>
                        </div>
                    )}
               </div>

               {generatedImage ? (
                   <div className="space-y-6 animate-in fade-in duration-500 flex-1 flex flex-col">
                       <div className="relative w-full flex-1 bg-slate-100 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center min-h-[400px]">
                           {/* Checkerboard background for transparency */}
                           <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
                           <img 
                            src={generatedImage} 
                            alt="Generated content" 
                            className="w-full h-full object-contain relative z-10" 
                           />
                       </div>
                       
                       <div className="bg-slate-50 rounded-2xl p-6 grid grid-cols-2 gap-y-4 gap-x-8">
                           <div>
                               <label className="text-xs text-slate-400 font-medium block mb-1">Mode</label>
                               <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${mode === 'generate' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                   {mode === 'generate' ? 'Text to Image' : 'Image Edit'}
                               </span>
                           </div>
                           {mode === 'generate' && (
                            <div>
                                <label className="text-xs text-slate-400 font-medium block mb-1">Style</label>
                                <p className="text-slate-800 font-medium text-sm">{style}</p>
                            </div>
                           )}
                           <div className="col-span-2">
                               <label className="text-xs text-slate-400 font-medium block mb-1">Prompt</label>
                               <p className="text-slate-800 text-sm leading-relaxed">{prompt}</p>
                           </div>
                       </div>
                   </div>
               ) : (
                   <div className="flex-1 flex flex-col items-center justify-center text-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 m-2">
                        {isGenerating ? (
                            <div className="flex flex-col items-center animate-pulse">
                                <div className="w-16 h-16 bg-slate-200 rounded-2xl mb-4"></div>
                                <div className="h-4 bg-slate-200 rounded w-32 mb-2"></div>
                                <div className="h-3 bg-slate-200 rounded w-24"></div>
                                <p className="mt-4 text-sm text-slate-400">Creating masterpiece...</p>
                            </div>
                        ) : (
                            <>
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 text-slate-300 shadow-sm">
                                    <ImageIcon size={32} strokeWidth={1.5} />
                                </div>
                                <h3 className="text-slate-400 font-medium mb-1">Your result will appear here</h3>
                                <p className="text-slate-400/70 text-sm">
                                    {mode === 'generate' ? 'Fill in the details and click Generate' : 'Upload an image and tell us how to edit it'}
                                </p>
                            </>
                        )}
                    </div>
               )}
          </div>
      </div>
    </div>
  );
};