import React, { useState } from 'react';
import { ArrowLeft, FileText, Sparkles, Copy, Download, RefreshCw, Save, Check } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface BlogGeneratorProps {
  onBack: () => void;
  primaryColor?: string;
  addToLibrary?: (item: any) => void;
}

export const BlogGenerator: React.FC<BlogGeneratorProps> = ({ onBack, primaryColor = '#ea580c', addToLibrary }) => {
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [keywords, setKeywords] = useState('');
  const [tone, setTone] = useState('Professional');
  const [contentLength, setContentLength] = useState(50);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleGenerate = async () => {
    if (!topic) return;

    setIsGenerating(true);
    setGeneratedContent(null);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const lengthText = contentLength > 75 ? "Long-form (1500+ words)" : contentLength < 25 ? "Short-form (600 words)" : "Medium length (1000 words)";

        const prompt = `
            You are an expert SEO content writer. Write a comprehensive blog post about "${topic}".
            
            **Parameters:**
            - **Target Audience:** ${audience}
            - **SEO Keywords:** ${keywords}
            - **Tone:** ${tone}
            - **Approximate Length:** ${lengthText}
            
            **Instructions:**
            1. Create a catchy, SEO-friendly Title.
            2. Write a compelling Meta Description (max 160 chars).
            3. Create a detailed Outline.
            4. Write the Full Article content using Markdown formatting (H1, H2, H3, bolding, lists). Ensure natural keyword integration.
            
            **Output Format:**
            Return ONLY a valid JSON object. Do not include markdown code blocks around the JSON.
            Structure:
            {
              "title": "Blog Post Title",
              "metaDescription": "Meta description...",
              "outline": ["1. Introduction", "2. Section 1..."],
              "fullContent": ["# Title", "Intro paragraph...", "## Subheading", "Content..."]
            }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json'
            }
        });

        const text = response.text || "{}";
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(jsonString);

        setGeneratedContent(data);

    } catch (error) {
        console.error("Error generating blog:", error);
        alert("Failed to generate blog post. Please try again.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleSaveToLibrary = () => {
      if (!generatedContent || !addToLibrary) return;
      setIsSaving(true);

      const fullText = generatedContent.fullContent.join('\n\n');

      const newItem = {
          id: Date.now(),
          type: 'TEXT',
          title: generatedContent.title,
          description: generatedContent.metaDescription,
          time: 'Just now',
          agent: 'Content AI',
          icon: FileText,
          content: fullText
      };

      addToLibrary(newItem);

      setTimeout(() => {
          setIsSaving(false);
          alert("Blog post saved to Library!");
      }, 600);
  };

  const handleDownload = () => {
      if (!generatedContent) return;
      const fullText = generatedContent.fullContent.join('\n\n');
      const blob = new Blob([fullText], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${generatedContent.title.replace(/\s+/g, '-').toLowerCase()}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
      if (!generatedContent) return;
      const fullText = generatedContent.fullContent.join('\n\n');
      navigator.clipboard.writeText(fullText);
      alert("Article copied to clipboard");
  };

  return (
    <div className="p-8 animate-in fade-in slide-in-from-right-8 duration-500 pb-20">
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={onBack}
          className="flex items-center text-orange-600 font-medium mb-6 hover:opacity-80 transition-opacity"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to templates
        </button>
        <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <FileText size={24} />
             </div>
             <div>
                <h1 className="text-2xl font-bold text-slate-900">SEO Blog Post Generator</h1>
                <p className="text-slate-500">Create optimized blog content for your website</p>
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Input Column */}
        <div className="space-y-6">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                
                {/* Topic */}
                <div>
                    <label className="block text-slate-700 font-medium mb-2 text-sm">Blog Topic <span className="text-red-500">*</span></label>
                    <input 
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="w-full px-5 py-3.5 rounded-full border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 placeholder:text-slate-300 text-sm transition-all"
                        placeholder="e.g., Content Marketing Strategies for 2024"
                    />
                </div>

                {/* Audience */}
                <div>
                    <label className="block text-slate-700 font-medium mb-2 text-sm">Target Audience</label>
                    <input 
                        type="text"
                        value={audience}
                        onChange={(e) => setAudience(e.target.value)}
                        className="w-full px-5 py-3.5 rounded-full border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 placeholder:text-slate-300 text-sm transition-all"
                        placeholder="e.g., Marketing professionals"
                    />
                </div>

                {/* Keywords */}
                <div>
                    <label className="block text-slate-700 font-medium mb-2 text-sm">SEO Keywords</label>
                    <div className="relative">
                        <input 
                            type="text"
                            value={keywords}
                            onChange={(e) => setKeywords(e.target.value)}
                            className="w-full px-5 py-3.5 rounded-full border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 placeholder:text-slate-300 text-sm transition-all"
                            placeholder="Add keywords separated by commas..."
                        />
                    </div>
                </div>

                {/* Tone */}
                <div>
                    <label className="block text-slate-700 font-medium mb-2 text-sm">Tone</label>
                    <input 
                        type="text"
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                        className="w-full px-5 py-3.5 rounded-full border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 placeholder:text-slate-300 text-sm transition-all"
                        placeholder="e.g. Professional, Casual, Witty"
                    />
                </div>

                {/* Length */}
                <div>
                    <label className="block text-slate-700 font-medium mb-4 text-sm">Content Length: {contentLength}%</label>
                    <input 
                        type="range"
                        min="0"
                        max="100"
                        value={contentLength}
                        onChange={(e) => setContentLength(Number(e.target.value))}
                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-600"
                        style={{ accentColor: primaryColor }}
                    />
                    <div className="flex justify-between mt-2 text-xs text-slate-400 font-medium">
                        <span>Short</span>
                        <span>Long-form</span>
                    </div>
                </div>

            </div>

            <button 
                onClick={handleGenerate}
                disabled={isGenerating || !topic}
                className={`w-full py-4 rounded-full text-white font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 ${
                    isGenerating || !topic ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'
                }`}
                style={{ backgroundColor: primaryColor }} 
            >
                {isGenerating ? (
                    <>
                         <RefreshCw className="animate-spin" size={20} /> Generating...
                    </>
                ) : (
                    <>
                        <Sparkles size={20} /> Generate Blog post
                    </>
                )}
            </button>
        </div>

        {/* Output Column */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 flex flex-col min-h-[800px]">
             
             {generatedContent ? (
                 <>
                    <div className="flex flex-wrap gap-3 mb-8">
                         <button 
                            onClick={handleCopy}
                            className="flex-1 py-2.5 rounded-full border border-orange-200 text-orange-600 text-sm font-medium hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
                         >
                            <Copy size={16} /> Copy
                         </button>
                         <button 
                            onClick={handleDownload}
                            className="flex-1 py-2.5 rounded-full border border-orange-200 text-orange-600 text-sm font-medium hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
                         >
                            <Download size={16} /> Download
                         </button>
                         <button 
                            onClick={handleSaveToLibrary}
                            disabled={isSaving}
                            className="flex-1 py-2.5 rounded-full border border-orange-200 text-orange-600 text-sm font-medium hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
                         >
                            {isSaving ? <Check size={16} /> : <Save size={16} />} 
                            {isSaving ? 'Saved' : 'Save'}
                         </button>
                    </div>

                    <div className="space-y-6 h-full overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {/* Title */}
                        <div className="bg-slate-50 rounded-2xl p-6 relative group">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2 block">Title</span>
                            <h3 className="text-lg font-bold text-slate-900">{generatedContent.title}</h3>
                        </div>

                        {/* Meta */}
                        <div className="bg-slate-50 rounded-2xl p-6 relative group">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2 block">Meta Description</span>
                            <p className="text-sm text-slate-600 leading-relaxed">{generatedContent.metaDescription}</p>
                        </div>

                        {/* Outline */}
                        <div className="bg-slate-50 rounded-2xl p-6">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3 block">Outline</span>
                            <ul className="space-y-2.5">
                                {generatedContent.outline.map((item: string, i: number) => (
                                    <li key={i} className="text-sm text-slate-700">{item}</li>
                                ))}
                            </ul>
                        </div>

                        {/* Full Article */}
                        <div className="bg-slate-50 rounded-2xl p-6">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3 block">Full Article</span>
                            <div className="space-y-4">
                                {generatedContent.fullContent.map((para: string, i: number) => (
                                    <p key={i} className={`text-sm ${para.startsWith('#') ? 'font-bold text-slate-900 mt-4' : 'text-slate-600 leading-relaxed'}`}>
                                        {para.replace(/^#+ /, '')}
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>
                 </>
             ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center bg-slate-50/50 rounded-3xl m-4 border-2 border-dashed border-slate-100">
                     {isGenerating ? (
                        <div className="flex flex-col items-center">
                            <RefreshCw className="animate-spin text-orange-500 mb-4" size={40} />
                            <h3 className="text-slate-600 font-medium mb-1">Writing your blog post...</h3>
                            <p className="text-slate-400 text-sm">Researching keywords and structuring content</p>
                        </div>
                     ) : (
                         <>
                            <div className="w-20 h-20 bg-slate-200 rounded-3xl flex items-center justify-center mb-6 text-white">
                                <FileText size={40} strokeWidth={2} className="text-white" />
                            </div>
                            <h3 className="text-slate-400 font-medium mb-2 text-lg">Your blog post will appear here</h3>
                            <p className="text-slate-400/70 text-sm">Fill in the details and click generate</p>
                         </>
                     )}
                </div>
             )}
        </div>
      </div>
    </div>
  );
};