import React, { useState } from 'react';
import { ArrowLeft, FileText, Sparkles, Copy, RefreshCw, Share2, Download, Facebook, Twitter, Linkedin, Instagram, Video } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface TextGeneratorProps {
  onBack: () => void;
  primaryColor?: string;
}

export const TextGenerator: React.FC<TextGeneratorProps> = ({ onBack, primaryColor = '#ea580c' }) => {
  const [contentType, setContentType] = useState('Blog Post');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Professional');
  const [length, setLength] = useState('Medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const handleGenerate = async () => {
    if (!topic) return;
    
    setIsGenerating(true);
    setGeneratedContent(null);
    setShowShareMenu(false);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const prompt = `Generate a ${length.toLowerCase()} ${contentType} about "${topic}". 
        The tone of the content should be ${tone}. 
        Please format the output with Markdown, using headings, bullet points where appropriate, and clear paragraph structure.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        setGeneratedContent(response.text || "No text generated.");
    } catch (error) {
        console.error("Error generating text:", error);
        setGeneratedContent("An error occurred while generating content. Please try again.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedContent) return;
    const blob = new Blob([generatedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sirz-text-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (!generatedContent) return;

    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Generated Content',
                text: generatedContent,
            });
            return;
        } catch (err) {
            console.log('Native share failed, falling back to menu', err);
        }
    }
    setShowShareMenu(!showShareMenu);
  };

  return (
    <div className="p-8 animate-in fade-in slide-in-from-right-8 duration-500 pb-20">
      {/* Header */}
      <div className="mb-8">
          <button 
            onClick={onBack}
            className="flex items-center text-orange-600 font-medium mb-4 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Text Generator</h1>
          <p className="text-slate-500">Create compelling written content with AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column - Controls */}
        <div className="space-y-6">
            
            {/* Content Type */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <label className="block text-slate-700 font-medium mb-4">Content Type</label>
                <div className="grid grid-cols-2 gap-3">
                    {['Blog Post', 'Product Description', 'Social Media', 'Email Copy', 'Ad Copy'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setContentType(type)}
                            className={`py-3 px-4 rounded-xl text-sm font-medium transition-all border ${
                                contentType === type 
                                ? 'border-[#8ba856] bg-[#f7fee7] text-[#3f6212]' 
                                : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Prompt */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <label className="block text-slate-700 font-medium mb-4">What do you want to write about?</label>
                <textarea 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="E.g., Write a blog post about the benefits of AI in marketing..."
                    className="w-full h-32 p-4 rounded-xl border border-slate-200 bg-white text-black focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 resize-none placeholder:text-slate-400 text-sm"
                />
            </div>

            {/* Tone & Length */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                
                {/* Tone */}
                <div>
                    <label className="block text-slate-700 font-medium mb-3">Tone</label>
                    <div className="flex flex-wrap gap-2">
                        {['Professional', 'Casual', 'Friendly', 'Formal', 'Creative', 'Humorous'].map((t) => (
                            <button
                                key={t}
                                onClick={() => setTone(t)}
                                className={`py-2 px-5 rounded-full text-xs font-medium transition-all border ${
                                    tone === t 
                                    ? 'border-purple-500 bg-purple-50 text-purple-700' 
                                    : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Length */}
                <div>
                    <label className="block text-slate-700 font-medium mb-3">Length</label>
                    <div className="flex gap-3">
                         {['Short', 'Medium', 'Long'].map((l) => (
                            <button
                                key={l}
                                onClick={() => setLength(l)}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all border ${
                                    length === l
                                    ? 'border-slate-800 bg-slate-50 text-slate-800'
                                    : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                                {l}
                            </button>
                        ))}
                    </div>
                </div>

            </div>

            {/* Generate Button */}
            <button 
                onClick={handleGenerate}
                disabled={isGenerating || !topic}
                className={`w-full py-4 rounded-full text-white font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 ${
                    isGenerating || !topic ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'
                }`}
                style={{ backgroundColor: '#e09b86' }} 
            >
                {isGenerating ? (
                    <>
                         <RefreshCw className="animate-spin" size={20} /> Generating...
                    </>
                ) : (
                    <>
                        <Sparkles size={20} /> Generate Text
                    </>
                )}
            </button>

        </div>

        {/* Right Column - Preview */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col h-[740px]">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-slate-800 font-medium">
                    <FileText size={18} /> Preview
                </div>
                {generatedContent && (
                    <div className="flex gap-2 relative">
                         <button 
                            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-100"
                            onClick={handleDownload}
                            title="Download Text"
                         >
                             <Download size={18} />
                         </button>
                         <button 
                             className={`p-2 hover:bg-slate-100 rounded-lg transition-colors border border-slate-100 ${showShareMenu ? 'bg-slate-100 text-slate-800' : 'text-slate-500'}`}
                             onClick={handleShare}
                             title="Share"
                         >
                             <Share2 size={18} />
                         </button>
                         <button 
                            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-100"
                            onClick={() => navigator.clipboard.writeText(generatedContent)}
                            title="Copy to clipboard"
                         >
                             <Copy size={18} />
                         </button>

                        {/* Share Menu */}
                        {showShareMenu && (
                            <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                                <div className="text-xs font-semibold text-slate-400 px-3 py-2">Share to Socials</div>
                                
                                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg text-left">
                                    <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center text-white"><span className="text-[10px] font-bold">X</span></div> X (Twitter)
                                </button>
                                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg text-left">
                                    <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center text-white"><Video size={12} /></div> TikTok
                                </button>
                                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg text-left">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 flex items-center justify-center text-white"><Instagram size={12} /></div> Instagram
                                </button>
                                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg text-left">
                                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white"><Facebook size={12} /></div> Facebook
                                </button>
                                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg text-left">
                                    <div className="w-6 h-6 rounded-full bg-blue-700 flex items-center justify-center text-white"><Linkedin size={12} /></div> LinkedIn
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="flex-1 bg-slate-50/50 rounded-xl border border-slate-100/50 p-8 flex flex-col relative overflow-hidden">
                {generatedContent ? (
                    <div className="animate-in fade-in zoom-in-95 duration-500 h-full overflow-y-auto pr-2 custom-scrollbar">
                         <div className="prose prose-slate prose-sm max-w-none text-slate-600 whitespace-pre-line">
                            {generatedContent}
                         </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-6 text-slate-400">
                            <FileText size={32} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-slate-400 font-medium mb-1">Your generated text will appear here</h3>
                        <p className="text-slate-400/70 text-sm">Fill in the fields and click Generate</p>
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};
