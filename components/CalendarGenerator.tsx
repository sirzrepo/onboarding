import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Calendar, Check, FileText, RefreshCw, Instagram, Video, Linkedin, Facebook, Youtube, Twitter, Copy, Download, ChevronRight, ChevronDown, Loader2, Eye, Save } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface CalendarGeneratorProps {
  onBack: () => void;
  primaryColor?: string;
  templateName?: string;
  addToLibrary?: (item: any) => void;
}

interface CalendarEvent {
  date: string;
  day: string;
  platform: string;
  contentType: string;
  idea: string;
  visual: string;
  caption: string;
  visualGenerated?: boolean;
}

export const CalendarGenerator: React.FC<CalendarGeneratorProps> = ({ 
  onBack, 
  primaryColor = '#ea580c', 
  templateName = 'Social Media Starter',
  addToLibrary
}) => {
  // Inputs
  const [industry, setIndustry] = useState('Beauty & Skincare');
  const [platforms, setPlatforms] = useState<string[]>(['Instagram', 'TikTok']);
  const [frequency, setFrequency] = useState('Daily');
  const [goal, setGoal] = useState('Brand Awareness');
  const [targetMonth, setTargetMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
  const [brandVoice, setBrandVoice] = useState('Friendly, informative, and empowering');
  
  // State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedEvents, setGeneratedEvents] = useState<CalendarEvent[]>([]);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Individual Item Generation State
  const [creatingVisualId, setCreatingVisualId] = useState<string | null>(null);

  const availablePlatforms = ['Instagram', 'TikTok', 'LinkedIn', 'YouTube', 'Twitter/X', 'Facebook'];

  const togglePlatform = (platform: string) => {
    if (platforms.includes(platform)) {
      setPlatforms(platforms.filter(p => p !== platform));
    } else {
      setPlatforms([...platforms, platform]);
    }
  };

  const handleGenerate = async () => {
    if (!industry || platforms.length === 0) return;

    setIsGenerating(true);
    setGeneratedEvents([]);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Calculate year for context
        const year = new Date().getFullYear();

        const prompt = `
            You are an expert social media strategist. Create a detailed content calendar for a brand in the "${industry}" industry.
            
            **Campaign Details:**
            - **Target Month:** ${targetMonth} ${year}
            - **Platforms:** ${platforms.join(', ')}
            - **Posting Frequency:** ${frequency}
            - **Primary Goal:** ${goal}
            - **Brand Voice:** ${brandVoice}
            
            **Instructions:**
            1. Curate content for the specified frequency (e.g., if Daily, provide content for every day of the month. If 3x/week, provide ~12 posts).
            2. Ensure the content mix aligns with the "${goal}" goal.
            3. Vary the content types (Reels, Carousels, Stories, Text Posts, etc.) appropriate for the selected platforms.
            
            **Output Format:**
            Return ONLY a valid JSON array. Do not include markdown code blocks or explanations.
            The JSON objects must follow this structure:
            [
              {
                "date": "YYYY-MM-DD",
                "day": "DayName",
                "platform": "PlatformName",
                "contentType": "Format (e.g. Reel)",
                "idea": "Brief title/hook of the post",
                "visual": "Description of the image/video",
                "caption": "Draft caption with hashtags"
              }
            ]
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json'
            }
        });

        const text = response.text || "[]";
        // Clean up any potential markdown formatting just in case
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const events = JSON.parse(jsonString);
        
        setGeneratedEvents(events);

    } catch (error) {
        console.error("Error generating calendar:", error);
        alert("Failed to generate calendar. Please try again.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleSaveCalendar = () => {
    if (!addToLibrary || generatedEvents.length === 0) return;
    setIsSaving(true);

    const newItem = {
        id: Date.now(),
        type: 'CALENDAR',
        title: `${targetMonth} Content Calendar`,
        description: `${frequency} plan for ${platforms.join(', ')} targeting ${goal}`,
        time: 'Just now',
        agent: 'Content AI',
        data: generatedEvents // Store the raw data for potential future editing
    };

    addToLibrary(newItem);

    setTimeout(() => {
        setIsSaving(false);
        alert("Calendar saved to your library successfully!");
    }, 600);
  };

  const handleExportCSV = () => {
    if (generatedEvents.length === 0) return;

    // Define CSV Headers
    const headers = ['Date', 'Day', 'Platform', 'Content Type', 'Idea/Hook', 'Visual Direction', 'Caption'];

    // Map data to CSV rows
    const rows = generatedEvents.map(event => [
        event.date,
        event.day,
        event.platform,
        event.contentType,
        event.idea,
        event.visual,
        event.caption
    ]);

    // Helper to escape CSV special characters (quotes, commas, newlines)
    const escapeCsv = (str: string) => {
        if (!str) return '""';
        const escaped = str.replace(/"/g, '""'); // Double escape quotes
        return `"${escaped}"`; // Wrap in quotes
    };

    // Construct the CSV string
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => escapeCsv(String(cell))).join(','))
    ].join('\n');

    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SIRz_Content_Calendar_${targetMonth}_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCreateVisual = async (event: CalendarEvent, index: number) => {
      if (!event.visual) return;
      
      setCreatingVisualId(event.date);

      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          
          // Determine if we need an image or video (using image generation for both initially for speed/reliability in demo)
          // For a real video agent, we would call Veo, but here we generate the thumbnail/visual asset.
          const isVideo = event.contentType.toLowerCase().includes('reel') || event.contentType.toLowerCase().includes('video') || event.contentType.toLowerCase().includes('tiktok');
          
          // Use Image Model to create the visual representation
          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash-image',
              contents: { parts: [{ text: `Create a professional, high-quality social media visual for: ${event.visual}. Style: Photorealistic, high definition.` }] },
              config: {
                  imageConfig: { aspectRatio: isVideo ? "9:16" : "1:1" } 
              }
          });

          let imageUrl = null;
          if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                    break;
                }
            }
          }

          if (imageUrl && addToLibrary) {
              // Create a Library Item
              const newItem = {
                  id: Date.now(),
                  type: isVideo ? 'VIDEO' : 'IMAGE', // Even if it's an image asset, categorize by intent
                  title: event.idea,
                  description: event.visual,
                  time: 'Just now',
                  thumbnail: imageUrl, // Use the generated image as thumbnail
                  agent: 'Content Calendar'
              };

              addToLibrary(newItem);
              
              // Mark as generated locally to update UI
              const updatedEvents = [...generatedEvents];
              updatedEvents[index] = { ...event, visualGenerated: true };
              setGeneratedEvents(updatedEvents);
          }

      } catch (error) {
          console.error("Error creating visual:", error);
          alert("Failed to create visual. Please try again.");
      } finally {
          setCreatingVisualId(null);
      }
  };

  const getPlatformIcon = (platformName: string) => {
      const p = platformName.toLowerCase();
      if (p.includes('instagram')) return <Instagram size={14} />;
      if (p.includes('tiktok')) return <Video size={14} />;
      if (p.includes('linkedin')) return <Linkedin size={14} />;
      if (p.includes('facebook')) return <Facebook size={14} />;
      if (p.includes('youtube')) return <Youtube size={14} />;
      if (p.includes('twitter') || p.includes('x')) return <Twitter size={14} />;
      return <Sparkles size={14} />;
  };

  const getPlatformColor = (platformName: string) => {
      const p = platformName.toLowerCase();
      if (p.includes('instagram')) return 'text-pink-600 bg-pink-50 border-pink-100';
      if (p.includes('tiktok')) return 'text-slate-900 bg-slate-100 border-slate-200';
      if (p.includes('linkedin')) return 'text-blue-700 bg-blue-50 border-blue-100';
      if (p.includes('facebook')) return 'text-blue-600 bg-blue-50 border-blue-100';
      if (p.includes('youtube')) return 'text-red-600 bg-red-50 border-red-100';
      return 'text-slate-600 bg-slate-50 border-slate-100';
  };

  const toggleDayExpansion = (date: string) => {
      if (expandedDay === date) {
          setExpandedDay(null);
      } else {
          setExpandedDay(date);
      }
  };

  const handleCopy = (text: string) => {
      navigator.clipboard.writeText(text);
      // Could add a toast here
  };

  return (
    <div className="p-8 animate-in fade-in slide-in-from-right-8 duration-500 pb-20">
      <div className="mb-8">
        <button 
          onClick={onBack}
          className="flex items-center text-orange-600 font-medium mb-6 hover:opacity-80 transition-opacity"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to templates
        </button>
        <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                <Calendar size={24} />
             </div>
             <div>
                <h1 className="text-2xl font-bold text-slate-900">{templateName}</h1>
                <p className="text-slate-500">Plan your social media strategy for the entire month</p>
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Configuration */}
        <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                
                <div>
                    <label className="block text-slate-700 font-medium mb-2 text-sm">Industry/Niche <span className="text-red-500">*</span></label>
                    <input 
                        type="text"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full px-5 py-3.5 rounded-full border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 placeholder:text-slate-300 text-sm transition-all"
                        placeholder="e.g. Beauty & Skincare"
                    />
                </div>

                <div>
                    <label className="block text-slate-700 font-medium mb-2 text-sm">Target Month</label>
                    <select 
                        value={targetMonth}
                        onChange={(e) => setTargetMonth(e.target.value)}
                        className="w-full px-5 py-3.5 rounded-full border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 text-sm transition-all appearance-none cursor-pointer"
                    >
                        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-slate-700 font-medium mb-2 text-sm">Platforms <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-2 gap-3">
                        {availablePlatforms.map(platform => {
                            const isSelected = platforms.includes(platform);
                            return (
                                <button
                                    key={platform}
                                    onClick={() => togglePlatform(platform)}
                                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-full text-sm font-medium border transition-all ${
                                        isSelected 
                                        ? 'border-[#8ba856] bg-[#f7fee7] text-[#3f6212]' 
                                        : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                                >
                                    {isSelected ? <Check size={14} /> : <div className="w-3.5" />}
                                    {platform}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <label className="block text-slate-700 font-medium mb-2 text-sm">Posting Frequency</label>
                    <select 
                        value={frequency}
                        onChange={(e) => setFrequency(e.target.value)}
                        className="w-full px-5 py-3.5 rounded-full border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 text-sm transition-all appearance-none cursor-pointer"
                    >
                        <option value="Daily">Daily (Every day)</option>
                        <option value="Weekdays">Weekdays Only (Mon-Fri)</option>
                        <option value="3 times a week">3 times a week</option>
                        <option value="Weekly">Once a week</option>
                    </select>
                </div>

                <div>
                    <label className="block text-slate-700 font-medium mb-2 text-sm">Primary Goal</label>
                    <input 
                        type="text"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                         className="w-full px-5 py-3.5 rounded-full border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 placeholder:text-slate-300 text-sm transition-all"
                         placeholder="e.g. Brand Awareness, Sales, Engagement"
                    />
                </div>

                <div>
                    <label className="block text-slate-700 font-medium mb-2 text-sm">Brand Voice</label>
                    <textarea 
                        value={brandVoice}
                        onChange={(e) => setBrandVoice(e.target.value)}
                        className="w-full h-24 p-5 rounded-3xl border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 resize-none placeholder:text-slate-300 text-sm leading-relaxed transition-all"
                        placeholder="Describe your brand's tone..."
                    />
                </div>

            </div>

            <button 
                onClick={handleGenerate}
                disabled={isGenerating || platforms.length === 0 || !industry}
                className={`w-full py-4 rounded-full text-white font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 ${
                    isGenerating || platforms.length === 0 || !industry ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'
                }`}
                style={{ backgroundColor: '#c2410c' }} 
            >
                {isGenerating ? (
                    <>
                         <RefreshCw className="animate-spin" size={20} /> Generating Schedule...
                    </>
                ) : (
                    <>
                        <Sparkles size={20} /> Generate Content Calendar
                    </>
                )}
            </button>
        </div>

        {/* Right Column: Output / Preview */}
        <div className="lg:col-span-7 bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 flex flex-col min-h-[800px] max-h-[1200px]">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-slate-800 font-medium">
                    <Calendar size={18} /> Calendar Preview
                </div>
                {generatedEvents.length > 0 && (
                    <div className="flex gap-2">
                        <button 
                            onClick={handleSaveCalendar}
                            className={`p-2 rounded-lg transition-colors border border-slate-100 flex items-center gap-2 ${isSaving ? 'text-orange-600 bg-orange-50' : 'text-slate-400 hover:text-orange-600 hover:bg-orange-50'}`} 
                            title="Save to Library"
                        >
                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        </button>
                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-slate-100" title="Copy All">
                            <Copy size={16} />
                        </button>
                         <button 
                            onClick={handleExportCSV}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-slate-100" 
                            title="Export CSV"
                         >
                            <Download size={16} />
                        </button>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                {generatedEvents.length > 0 ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Month Header */}
                        <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 py-2 border-b border-slate-100 mb-4">
                            <h2 className="text-xl font-bold text-slate-900">{targetMonth} Content Plan</h2>
                            <p className="text-xs text-slate-500">{generatedEvents.length} posts scheduled</p>
                        </div>

                        {generatedEvents.map((event, index) => {
                            const isExpanded = expandedDay === event.date;
                            const platformStyle = getPlatformColor(event.platform);
                            const isGeneratingThis = creatingVisualId === event.date;
                            
                            return (
                                <div key={index} className={`rounded-2xl border transition-all duration-200 overflow-hidden ${isExpanded ? 'border-orange-200 bg-orange-50/10 shadow-md' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                                    {/* Event Summary Row */}
                                    <div 
                                        className="p-4 flex items-center gap-4 cursor-pointer"
                                        onClick={() => toggleDayExpansion(event.date)}
                                    >
                                        {/* Date Box */}
                                        <div className="flex flex-col items-center justify-center w-14 h-14 bg-slate-50 rounded-xl border border-slate-100 shrink-0">
                                            <span className="text-[10px] uppercase font-bold text-slate-400">{event.day.slice(0, 3)}</span>
                                            <span className="text-lg font-bold text-slate-900">{event.date.split('-')[2]}</span>
                                        </div>

                                        {/* Content Preview */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${platformStyle}`}>
                                                    {getPlatformIcon(event.platform)}
                                                    {event.platform}
                                                </span>
                                                <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                                                    {event.contentType}
                                                </span>
                                                {event.visualGenerated && (
                                                    <span className="text-[10px] font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                                                        <Check size={10} /> In Library
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="font-semibold text-slate-800 text-sm truncate">{event.idea}</h3>
                                        </div>

                                        {/* Expand Icon */}
                                        <div className={`text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                                            <ChevronDown size={20} />
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {isExpanded && (
                                        <div className="px-4 pb-6 pt-2 border-t border-slate-100/50 space-y-4 animate-in slide-in-from-top-2 duration-200">
                                            
                                            {/* Visual Direction */}
                                            <div className="bg-white rounded-xl p-4 border border-slate-100">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block flex items-center gap-1">
                                                    <Sparkles size={10} /> Visual Direction
                                                </span>
                                                <p className="text-sm text-slate-600 leading-relaxed">{event.visual}</p>
                                            </div>

                                            {/* Caption Draft */}
                                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 relative group">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block flex items-center gap-1">
                                                    <FileText size={10} /> Draft Caption
                                                </span>
                                                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-medium">{event.caption}</p>
                                                
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleCopy(event.caption); }}
                                                    className="absolute top-2 right-2 p-1.5 bg-white rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-orange-600 hover:shadow-sm"
                                                    title="Copy Caption"
                                                >
                                                    <Copy size={14} />
                                                </button>
                                            </div>
                                            
                                            {/* Actions */}
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => handleCreateVisual(event, index)}
                                                    disabled={isGeneratingThis || event.visualGenerated}
                                                    className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                                                        event.visualGenerated 
                                                        ? 'bg-green-100 text-green-700 cursor-default' 
                                                        : 'bg-slate-800 text-white hover:bg-slate-900'
                                                    }`}
                                                >
                                                    {isGeneratingThis ? (
                                                        <>
                                                            <Loader2 size={12} className="animate-spin" /> Creating...
                                                        </>
                                                    ) : event.visualGenerated ? (
                                                        <>
                                                            <Check size={12} /> Asset Created
                                                        </>
                                                    ) : (
                                                        'Create Visual'
                                                    )}
                                                </button>
                                                <button className="flex-1 py-2 text-xs font-medium border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
                                                    Refine Caption
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        
                        <div className="pt-8 text-center">
                            <button 
                                onClick={handleGenerate}
                                className="px-6 py-2 rounded-full border border-slate-200 text-slate-500 text-sm font-medium hover:bg-slate-50 hover:text-slate-800 transition-colors inline-flex items-center gap-2"
                            >
                                <RefreshCw size={14} /> Regenerate Plan
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center bg-slate-50/50 rounded-3xl m-4 border-2 border-dashed border-slate-100 h-full min-h-[400px]">
                         {isGenerating ? (
                             <div className="flex flex-col items-center animate-pulse">
                                 <div className="w-16 h-16 bg-slate-200 rounded-2xl mb-4"></div>
                                 <div className="h-4 bg-slate-200 rounded w-48 mb-2"></div>
                                 <div className="h-3 bg-slate-200 rounded w-32"></div>
                             </div>
                         ) : (
                             <>
                                <div className="w-24 h-24 bg-slate-200 rounded-3xl flex items-center justify-center mb-6 text-white shadow-sm">
                                    <Calendar size={48} strokeWidth={2} className="text-white" />
                                </div>
                                <h3 className="text-slate-400 font-medium mb-2 text-lg">Your content calendar will appear here</h3>
                                <p className="text-slate-400/70 text-sm max-w-xs mx-auto">
                                    Select your industry, goal, and platforms, then click Generate to create a tailored monthly plan.
                                </p>
                             </>
                         )}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};