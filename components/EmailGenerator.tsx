import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Sparkles, Download, RefreshCw, Mail, Figma, FileText, Copy, Check, Upload, Image as ImageIcon, X, Loader2, Link as LinkIcon, Edit3, Eye, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface EmailGeneratorProps {
  onBack: () => void;
  primaryColor?: string;
  templateName?: string;
}

interface GeneratedEmailData {
  subject: string;
  preheader: string;
  headline: string;
  subheadline: string;
  body: string[];
  cta: string;
  cta_url: string;
  feature_headline: string;
  feature_body: string;
  feature_image_description: string;
  gallery_image_1_description: string;
  gallery_image_2_description: string;
  footer_text: string;
}

const DEFAULT_IMAGES = {
    main: 'https://images.unsplash.com/photo-1544436904-45371302d966?w=600&auto=format&fit=crop&q=80',
    gallery1: 'https://images.unsplash.com/photo-1596462502278-27bfdd403348?w=600&auto=format&fit=crop&q=80',
    gallery2: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=600&auto=format&fit=crop&q=80'
};

export const EmailGenerator: React.FC<EmailGeneratorProps> = ({ onBack, primaryColor = '#ea580c', templateName = 'Welcome Email' }) => {
  // Mode: 'create' (Inputs) or 'edit' (Refine Result)
  const [viewMode, setViewMode] = useState<'create' | 'edit'>('create');
  
  // Generator Inputs
  const [emailType, setEmailType] = useState('Newsletters');
  const [audience, setAudience] = useState('New customers');
  const [purpose, setPurpose] = useState('');
  const [cta, setCta] = useState('Get Started');
  const [tone, setTone] = useState('Friendly');
  
  // Loading States
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingImageKey, setGeneratingImageKey] = useState<string | null>(null);

  // Content State
  const [data, setData] = useState<GeneratedEmailData | null>(null);
  const [images, setImages] = useState(DEFAULT_IMAGES);

  // Refs for File Inputs
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const gallery1ImageInputRef = useRef<HTMLInputElement>(null);
  const gallery2ImageInputRef = useRef<HTMLInputElement>(null);

  // Editor UI State
  const [activeSection, setActiveSection] = useState<string>('general'); // 'general', 'hero', 'feature', 'images'

  // Send Mail State
  const [showSendModal, setShowSendModal] = useState(false);
  const [recipientList, setRecipientList] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const handleGenerate = async () => {
    if (!purpose) return;
    
    setIsGenerating(true);
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const prompt = `
            You are an expert email marketing copywriter. Create a high-converting email based on the following details:
            
            - **Email Type:** ${emailType}
            - **Target Audience:** ${audience}
            - **Purpose:** ${purpose}
            - **Desired Tone:** ${tone}
            - **Desired CTA:** ${cta}

            Output PURE JSON matching this schema exactly. Do not include markdown formatting.
            {
                "subject": "Catchy subject line",
                "preheader": "Short preview text",
                "headline": "Main hero headline (short & punchy)",
                "subheadline": "Supporting subheadline for the hero section",
                "body": ["Paragraph 1", "Paragraph 2"],
                "cta": "Button text",
                "cta_url": "https://yourwebsite.com/shop",
                "feature_headline": "Headline for a secondary featured section",
                "feature_body": "Short body copy for the featured section",
                "feature_image_description": "Visual description for the main feature image",
                "gallery_image_1_description": "Visual description for a secondary product/mood image",
                "gallery_image_2_description": "Visual description for another secondary product/mood image",
                "footer_text": "Company Address • Unsubscribe Link"
            }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json'
            }
        });

        const jsonString = response.text || "{}";
        const generatedData = JSON.parse(jsonString);
        
        // Merge with defaults if fields are missing to prevent crashes
        setData({
            cta_url: 'https://example.com',
            footer_text: '123 Business Rd, Tech City • Unsubscribe',
            gallery_image_1_description: 'A nice image',
            gallery_image_2_description: 'Another nice image',
            ...generatedData
        });
        
        // Reset images to default placeholders or keep previous if regenerating text?
        // Let's keep defaults for fresh generation to avoid mismatch context
        if (viewMode === 'create') {
             setImages(DEFAULT_IMAGES);
        }

        setViewMode('edit');

    } catch (error) {
        console.error("Error generating email:", error);
        alert("Failed to generate email. Please try again.");
    } finally {
        setIsGenerating(false);
    }
  };

  // Generic Field Updater
  const updateField = (field: keyof GeneratedEmailData, value: any) => {
      if (data) {
          setData({ ...data, [field]: value });
      }
  };

  const updateBodyParagraph = (index: number, value: string) => {
      if (data) {
          const newBody = [...data.body];
          newBody[index] = value;
          setData({ ...data, body: newBody });
      }
  };

  // Image Handling
  const handleImageUpload = (key: keyof typeof images, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => ({ ...prev, [key]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateAIImage = async (key: keyof typeof images, descriptionField: keyof GeneratedEmailData) => {
      if (!data) return;
      const description = data[descriptionField] as string;
      if (!description) return;
      
      setGeneratingImageKey(key);
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash-image',
              contents: { parts: [{ text: description }] },
              config: {
                imageConfig: { aspectRatio: key === 'main' ? "3:4" : "1:1" } 
              }
          });

          if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                    setImages(prev => ({ ...prev, [key]: imageUrl }));
                    break;
                }
            }
        }
      } catch (error) {
          console.error("Failed to generate image:", error);
          alert("Could not generate image. Please try again.");
      } finally {
          setGeneratingImageKey(null);
      }
  };

  const copyToClipboard = () => {
    if (!data) return;
    const text = `Subject: ${data.subject}\n\n${data.headline}\n\n${data.body.join('\n\n')}\n\nCTA: ${data.cta} (${data.cta_url})`;
    navigator.clipboard.writeText(text);
    alert("Email copy copied to clipboard!");
  };

  const handleSendEmail = () => {
      if (!recipientList) return;
      setIsSendingEmail(true);

      // Simulate sending logic
      setTimeout(() => {
          setIsSendingEmail(false);
          setShowSendModal(false);
          const count = recipientList.split(',').length;
          alert(`Success! Email sent to ${count} recipient${count > 1 ? 's' : ''}.`);
          setRecipientList('');
      }, 2000);
  };

  // Render Editor Input Group
  const EditorSection = ({ title, id, children }: { title: string, id: string, children: React.ReactNode }) => (
      <div className="border-b border-slate-100 last:border-0">
          <button 
            onClick={() => setActiveSection(activeSection === id ? '' : id)}
            className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors"
          >
              <span className="font-semibold text-slate-700 text-sm">{title}</span>
              {activeSection === id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
          </button>
          {activeSection === id && (
              <div className="p-4 space-y-4 bg-white animate-in slide-in-from-top-1 duration-200">
                  {children}
              </div>
          )}
      </div>
  );

  return (
    <div className="p-8 animate-in fade-in slide-in-from-right-8 duration-500 pb-20 relative">
      {/* Hidden Inputs for Images */}
      <input type="file" ref={mainImageInputRef} onChange={(e) => handleImageUpload('main', e)} className="hidden" accept="image/*" />
      <input type="file" ref={gallery1ImageInputRef} onChange={(e) => handleImageUpload('gallery1', e)} className="hidden" accept="image/*" />
      <input type="file" ref={gallery2ImageInputRef} onChange={(e) => handleImageUpload('gallery2', e)} className="hidden" accept="image/*" />

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
         <div>
            <button 
            onClick={onBack}
            className="flex items-center text-orange-600 font-medium mb-4 hover:opacity-80 transition-opacity"
            >
            <ArrowLeft size={18} className="mr-2" />
            Back to templates
            </button>
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#8ba856]/10 rounded-xl flex items-center justify-center text-[#8ba856]">
                    <Mail size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{templateName}</h1>
                    <p className="text-slate-500">
                        {viewMode === 'create' ? 'Create compelling email content with AI' : 'Edit and refine your template'}
                    </p>
                </div>
            </div>
         </div>
         
         {viewMode === 'edit' && (
             <button 
                onClick={() => setViewMode('create')}
                className="text-sm text-slate-500 hover:text-orange-600 font-medium underline-offset-4 hover:underline"
             >
                 Start Over
             </button>
         )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column - Controls (Toggle between Creator and Editor) */}
        <div className="space-y-6">
            
            {viewMode === 'create' ? (
                /* CREATE MODE FORM */
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                    {/* ... (Same inputs as before) ... */}
                    <div>
                        <label className="block text-slate-700 font-medium mb-2 text-sm">Email Type</label>
                        <input 
                            type="text"
                            value={emailType}
                            onChange={(e) => setEmailType(e.target.value)}
                            className="w-full px-5 py-3.5 rounded-full border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 placeholder:text-slate-300 text-sm transition-all"
                            placeholder="e.g. Newsletter"
                        />
                    </div>
                    <div>
                        <label className="block text-slate-700 font-medium mb-2 text-sm">Target Audience</label>
                        <input 
                            type="text"
                            value={audience}
                            onChange={(e) => setAudience(e.target.value)}
                            className="w-full px-5 py-3.5 rounded-full border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 placeholder:text-slate-300 text-sm transition-all"
                            placeholder="e.g. New customers"
                        />
                    </div>
                    <div>
                        <label className="block text-slate-700 font-medium mb-2 text-sm">Email Purpose <span className="text-red-500">*</span></label>
                        <textarea 
                            value={purpose}
                            onChange={(e) => setPurpose(e.target.value)}
                            className="w-full h-32 p-5 rounded-3xl border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 resize-none placeholder:text-slate-300 text-sm leading-relaxed transition-all"
                            placeholder="Describe what this email should accomplish..."
                        />
                    </div>
                    <div>
                        <label className="block text-slate-700 font-medium mb-2 text-sm">Call-to-Action Button</label>
                        <input 
                            type="text"
                            value={cta}
                            onChange={(e) => setCta(e.target.value)}
                            className="w-full px-5 py-3.5 rounded-full border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 placeholder:text-slate-300 text-sm transition-all"
                            placeholder="e.g. Get Started"
                        />
                    </div>
                    <div>
                        <label className="block text-slate-700 font-medium mb-2 text-sm">Tone</label>
                        <input 
                            type="text"
                            value={tone}
                            onChange={(e) => setTone(e.target.value)}
                            className="w-full px-5 py-3.5 rounded-full border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 placeholder:text-slate-300 text-sm transition-all"
                            placeholder="e.g. Friendly"
                        />
                    </div>
                </div>
            ) : (
                /* EDIT MODE FORM */
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full max-h-[800px]">
                     <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                         <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                             <Edit3 size={16} /> Content Editor
                         </h3>
                         <span className="text-xs text-slate-400">Edits update in real-time</span>
                     </div>
                     
                     <div className="overflow-y-auto custom-scrollbar flex-1">
                        {data && (
                            <>
                                <EditorSection title="Subject & Preheader" id="general">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Subject Line</label>
                                        <input 
                                            type="text" 
                                            value={data.subject} 
                                            onChange={(e) => updateField('subject', e.target.value)}
                                            className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:border-orange-300 outline-none" 
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Preheader Text</label>
                                        <input 
                                            type="text" 
                                            value={data.preheader} 
                                            onChange={(e) => updateField('preheader', e.target.value)}
                                            className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:border-orange-300 outline-none" 
                                        />
                                    </div>
                                </EditorSection>

                                <EditorSection title="Hero Section" id="hero">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Headline</label>
                                        <input 
                                            type="text" 
                                            value={data.headline} 
                                            onChange={(e) => updateField('headline', e.target.value)}
                                            className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:border-orange-300 outline-none" 
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Subheadline</label>
                                        <input 
                                            type="text" 
                                            value={data.subheadline} 
                                            onChange={(e) => updateField('subheadline', e.target.value)}
                                            className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:border-orange-300 outline-none" 
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Body Copy</label>
                                        {data.body.map((para, idx) => (
                                            <textarea 
                                                key={idx}
                                                value={para}
                                                onChange={(e) => updateBodyParagraph(idx, e.target.value)}
                                                className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:border-orange-300 outline-none mb-2 min-h-[80px]" 
                                            />
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Button Text</label>
                                            <input 
                                                type="text" 
                                                value={data.cta} 
                                                onChange={(e) => updateField('cta', e.target.value)}
                                                className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:border-orange-300 outline-none" 
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Button Link</label>
                                            <div className="relative">
                                                <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input 
                                                    type="text" 
                                                    value={data.cta_url} 
                                                    onChange={(e) => updateField('cta_url', e.target.value)}
                                                    className="w-full pl-8 p-2 border border-slate-200 rounded-lg text-sm focus:border-orange-300 outline-none text-blue-600" 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </EditorSection>

                                <EditorSection title="Feature & Footer" id="feature">
                                     <div>
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Feature Headline</label>
                                        <input 
                                            type="text" 
                                            value={data.feature_headline} 
                                            onChange={(e) => updateField('feature_headline', e.target.value)}
                                            className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:border-orange-300 outline-none" 
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Feature Body</label>
                                        <textarea 
                                            value={data.feature_body}
                                            onChange={(e) => updateField('feature_body', e.target.value)}
                                            className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:border-orange-300 outline-none min-h-[80px]" 
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Footer Text</label>
                                        <input 
                                            type="text" 
                                            value={data.footer_text} 
                                            onChange={(e) => updateField('footer_text', e.target.value)}
                                            className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:border-orange-300 outline-none" 
                                        />
                                    </div>
                                </EditorSection>
                            </>
                        )}
                     </div>
                </div>
            )}

            {/* Main Action Button */}
            {viewMode === 'create' ? (
                <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || !purpose}
                    className={`w-full py-4 rounded-full text-white font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 ${
                        isGenerating || !purpose ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'
                    }`}
                    style={{ backgroundColor: '#c2410c' }} 
                >
                    {isGenerating ? (
                        <>
                            <RefreshCw className="animate-spin" size={20} /> Generating...
                        </>
                    ) : (
                        <>
                            <Sparkles size={20} /> Generate Email Template
                        </>
                    )}
                </button>
            ) : (
                <button 
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full py-4 rounded-full bg-white border border-orange-200 text-orange-600 font-medium hover:bg-orange-50 transition-all flex items-center justify-center gap-2"
                >
                    {isGenerating ? <RefreshCw className="animate-spin" size={20} /> : <RefreshCw size={20} />} 
                    Regenerate All Content
                </button>
            )}
        </div>

        {/* Right Column - Preview */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 flex flex-col min-h-[800px]">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-slate-800 font-medium">
                    <Eye size={18} /> Live Preview
                </div>
                {data && (
                     <div className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                        <Check size={12} /> Editable
                     </div>
                )}
            </div>

            {/* Toolbar */}
            {data && (
                <div className="flex flex-wrap gap-3 mb-6">
                    <button 
                        onClick={() => setShowSendModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-orange-600 text-white shadow-sm text-xs font-medium hover:bg-orange-700 transition-colors"
                    >
                        <Send size={14} /> Send Mail
                    </button>
                    <button 
                        onClick={copyToClipboard}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-orange-200 text-orange-700 text-xs font-medium hover:bg-orange-50 transition-colors"
                    >
                        <Copy size={14} /> Copy Text
                    </button>
                </div>
            )}

            {/* Email Canvas */}
            <div className="flex-1 border border-slate-200 rounded-none overflow-hidden shadow-sm relative group bg-white mx-auto w-full max-w-md transition-all duration-500">
                <div className="h-full overflow-y-auto custom-scrollbar">
                    
                    {/* Metadata Header */}
                    {data && (
                        <div className="bg-slate-50 p-4 border-b border-slate-200 text-xs space-y-1">
                            <p><span className="font-bold text-slate-700">Subject:</span> <span className="text-slate-600">{data.subject}</span></p>
                            <p><span className="font-bold text-slate-700">Preheader:</span> <span className="text-slate-500">{data.preheader}</span></p>
                        </div>
                    )}

                    {/* Logo Header */}
                    <div className="p-10 text-center bg-white">
                        <div className="inline-flex items-center gap-3">
                            <div className="w-12 h-12 border border-[#ea580c] rounded-full p-1">
                                <div className="w-full h-full rounded-full bg-orange-50 flex items-center justify-center">
                                    <Mail size={16} className="text-[#ea580c]" />
                                </div>
                            </div>
                            <div className="text-left leading-none">
                                <span className="block text-[#ea580c] font-serif italic text-xl">Moss &</span>
                                <span className="block text-[#ea580c] font-serif text-xl tracking-wide">Glow Beauty</span>
                            </div>
                        </div>
                    </div>

                    {/* Content Logic */}
                    {isGenerating ? (
                        <div className="p-12 flex flex-col items-center justify-center space-y-4">
                            <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
                            <p className="text-slate-400 text-sm animate-pulse">Drafting your email...</p>
                        </div>
                    ) : data ? (
                        <>
                            {/* Hero Section */}
                            <div className="bg-[#f2f4ef] px-8 py-16 text-center flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500">
                                <h2 className="text-2xl font-bold text-slate-900 mb-4 font-serif tracking-wide leading-tight">
                                    {data.headline}
                                </h2>
                                {data.subheadline && (
                                     <h3 className="text-lg text-slate-700 mb-6 font-medium">
                                        {data.subheadline}
                                     </h3>
                                )}
                                <div className="text-slate-600 text-sm leading-relaxed mb-6 max-w-xs mx-auto space-y-4 text-left">
                                    {data.body.map((para, i) => (
                                        <p key={i}>{para}</p>
                                    ))}
                                </div>
                                <a 
                                    href={data.cta_url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="px-8 py-3 bg-[#c2410c] text-white text-xs uppercase tracking-widest hover:bg-[#9a3412] transition-colors rounded-sm shadow-sm inline-block"
                                >
                                    {data.cta}
                                </a>
                            </div>

                            {/* Feature Section */}
                            <div className="p-8 text-center bg-white animate-in slide-in-from-bottom-4 duration-700">
                                <h3 className="text-xs uppercase tracking-widest text-slate-900 font-medium mb-8">
                                    {data.feature_headline}
                                </h3>
                                
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    {/* Main Feature Image */}
                                    <div className="aspect-[3/4] rounded-tr-[3rem] overflow-hidden relative bg-slate-100 group">
                                        <img src={images.main} className="w-full h-full object-cover" />
                                        
                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                                            <button 
                                                onClick={() => mainImageInputRef.current?.click()}
                                                className="w-full py-2 bg-white text-slate-900 text-[10px] font-bold uppercase tracking-wider rounded hover:bg-slate-100 flex items-center justify-center gap-2"
                                            >
                                                <Upload size={12} /> Upload
                                            </button>
                                            <button 
                                                onClick={() => handleGenerateAIImage('main', 'feature_image_description')}
                                                disabled={generatingImageKey === 'main'}
                                                className="w-full py-2 bg-[#c2410c] text-white text-[10px] font-bold uppercase tracking-wider rounded hover:bg-[#9a3412] flex items-center justify-center gap-2"
                                            >
                                                {generatingImageKey === 'main' ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                                AI Generate
                                            </button>
                                        </div>
                                    </div>

                                    <div className="aspect-[3/4] rounded-tl-[3rem] overflow-hidden relative bg-[#c2410c] flex items-center justify-center p-4 text-center">
                                        <div className="border border-white/20 p-2 w-full h-full flex flex-col items-center justify-center rounded-tl-[2rem]">
                                            <div className="w-10 h-10 rounded-full border border-white mb-3 flex items-center justify-center">
                                                <Sparkles size={16} className="text-white" />
                                            </div>
                                            <div className="text-white font-serif uppercase text-[10px] tracking-widest">Moss & Glow</div>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-sm text-slate-500 max-w-xs mx-auto mb-8">
                                    {data.feature_body}
                                </p>
                                
                                <hr className="border-slate-100 mb-8" />
                                
                                {/* New Gallery Section */}
                                <h3 className="text-xs uppercase tracking-widest text-slate-900 font-medium mb-6">
                                    More to Explore
                                </h3>
                                
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                     {/* Gallery Image 1 */}
                                     <div className="aspect-square rounded-2xl overflow-hidden relative bg-slate-100 group">
                                        <img src={images.gallery1} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                                             <button onClick={() => gallery1ImageInputRef.current?.click()} className="p-2 bg-white rounded-full"><Upload size={14} /></button>
                                             <button onClick={() => handleGenerateAIImage('gallery1', 'gallery_image_1_description')} className="p-2 bg-[#c2410c] text-white rounded-full">
                                                {generatingImageKey === 'gallery1' ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                             </button>
                                        </div>
                                     </div>

                                     {/* Gallery Image 2 */}
                                     <div className="aspect-square rounded-2xl overflow-hidden relative bg-slate-100 group">
                                        <img src={images.gallery2} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                                             <button onClick={() => gallery2ImageInputRef.current?.click()} className="p-2 bg-white rounded-full"><Upload size={14} /></button>
                                             <button onClick={() => handleGenerateAIImage('gallery2', 'gallery_image_2_description')} className="p-2 bg-[#c2410c] text-white rounded-full">
                                                {generatingImageKey === 'gallery2' ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                             </button>
                                        </div>
                                     </div>
                                </div>

                            </div>
                            
                            {/* Footer */}
                            <div className="bg-slate-50 p-6 text-center text-xs text-slate-400">
                                <p>{data.footer_text}</p>
                            </div>
                        </>
                    ) : (
                        <div className="p-12 text-center text-slate-400">
                            <p>Enter your details and click generate to see your email template here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* Send Email Modal */}
      {showSendModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowSendModal(false)} />
              <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                          <Send size={20} className="text-orange-600" /> Send Test Email
                      </h3>
                      <button onClick={() => setShowSendModal(false)} className="text-slate-400 hover:text-slate-600">
                          <X size={20} />
                      </button>
                  </div>
                  
                  <div className="mb-6">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Recipients</label>
                      <textarea
                          value={recipientList}
                          onChange={(e) => setRecipientList(e.target.value)}
                          placeholder="Enter email addresses separated by commas (e.g., user1@example.com, user2@example.com)"
                          className="w-full h-32 p-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 resize-none"
                      />
                      <p className="text-xs text-slate-400 mt-2">
                          {recipientList ? `${recipientList.split(',').length} recipient(s)` : 'Enter at least one email address'}
                      </p>
                  </div>

                  <div className="flex gap-3 justify-end">
                      <button 
                          onClick={() => setShowSendModal(false)}
                          className="px-5 py-2.5 rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={handleSendEmail}
                          disabled={!recipientList || isSendingEmail}
                          className="px-6 py-2.5 rounded-lg bg-orange-600 text-white font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                          {isSendingEmail ? (
                              <>
                                  <Loader2 size={16} className="animate-spin" /> Sending...
                              </>
                          ) : (
                              <>Send Mail</>
                          )}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};