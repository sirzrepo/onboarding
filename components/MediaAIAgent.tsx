import React, { useState } from 'react';
import { FileText, Image as ImageIcon, Music, Video, ArrowRight, Sparkles, Palette } from 'lucide-react';
import { TextGenerator } from './TextGenerator';
import { ImageGenerator } from './ImageGenerator';
import { AudioGenerator } from './AudioGenerator';
import { VideoGenerator } from './VideoGenerator';

interface MediaAIAgentProps {
    primaryColor?: string;
}

export const MediaAIAgent: React.FC<MediaAIAgentProps> = ({ primaryColor }) => {
  const [activeGenerator, setActiveGenerator] = useState<string | null>(null);

  if (activeGenerator === 'text') {
      return <TextGenerator onBack={() => setActiveGenerator(null)} primaryColor={primaryColor} />;
  }

  if (activeGenerator === 'image') {
      return <ImageGenerator onBack={() => setActiveGenerator(null)} primaryColor={primaryColor} />;
  }

  if (activeGenerator === 'audio') {
      return <AudioGenerator onBack={() => setActiveGenerator(null)} primaryColor={primaryColor} />;
  }

  if (activeGenerator === 'video') {
      return <VideoGenerator onBack={() => setActiveGenerator(null)} primaryColor={primaryColor} />;
  }

  return (
    <div className="p-8 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-16">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto space-y-4 pt-4">
            <div className="w-20 h-20 mx-auto text-[#8ba856] flex items-center justify-center">
                <Sparkles size={72} strokeWidth={1.5} fill="#eff6e8" className="text-[#8ba856]" />
            </div>
            <h1 className="text-3xl font-bold text-orange-600">AI Media Generator</h1>
            <p className="text-slate-500 leading-relaxed">
                Choose the type of content you want to create. Our AI will help you generate professional-quality media in seconds.
            </p>
        </div>

        {/* Generator Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
            <MediaCard
                icon={FileText}
                iconColor="text-white"
                iconBg="bg-pink-500"
                title="Text Generation"
                description="Create compelling copy, articles, and marketing content with AI"
                tags={['Blog posts', 'Product descriptions', 'Social media captions', 'Email copy', 'Copy & content writing']}
                onClick={() => setActiveGenerator('text')}
            />
             <MediaCard
                icon={ImageIcon}
                iconColor="text-white"
                iconBg="bg-orange-500"
                title="Image Generation"
                description="Generate stunning visuals, graphics, and product images"
                tags={['Product photos', 'Marketing visuals', 'Illustrations', 'Social media graphics']}
                onClick={() => setActiveGenerator('image')}
            />
             <MediaCard
                icon={Music}
                iconColor="text-white"
                iconBg="bg-cyan-500"
                title="Audio Generation"
                description="Produce professional voice-overs, music, and sound effects"
                tags={['Voice narration', 'Podcast intros', 'Sound effects', 'Background music']}
                onClick={() => setActiveGenerator('audio')}
            />
             <MediaCard
                icon={Video}
                iconColor="text-white"
                iconBg="bg-purple-500"
                title="Video Generation"
                description="Create engaging video content for marketing and social media"
                tags={['Product demos', 'Explainer videos', 'Marketing videos', 'Social media ads', 'Tutorials']}
                onClick={() => setActiveGenerator('video')}
            />
        </div>

        {/* Footer Info */}
        <div className="bg-[#fcfbf7] border border-[#e8dfd8] rounded-2xl p-8 text-center max-w-6xl mx-auto relative overflow-hidden">
             <div className="relative z-10">
                <div className="flex items-center justify-center gap-2 mb-3 text-slate-800 font-bold">
                    <span>🎨</span> Powered by Advanced AI
                </div>
                <p className="text-slate-500 text-sm max-w-2xl mx-auto leading-relaxed">
                    All media types are generated using state-of-the-art AI models trained on millions of examples. Get professional results in seconds, not hours.
                </p>
             </div>
             {/* Subtle decorative background gradient */}
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-orange-50/50 via-transparent to-orange-50/50 pointer-events-none"></div>
        </div>
    </div>
  );
};

interface MediaCardProps {
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    title: string;
    description: string;
    tags: string[];
    onClick?: () => void;
}

const MediaCard: React.FC<MediaCardProps> = ({ icon: Icon, iconBg, iconColor, title, description, tags, onClick }) => (
    <div 
        onClick={onClick}
        className={`bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200 transition-all duration-300 flex flex-col h-full group ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
        <div className={`w-14 h-14 rounded-2xl ${iconBg} ${iconColor} flex items-center justify-center mb-6 shadow-md shadow-${iconBg.replace('bg-', '')}/20`}>
            <Icon size={28} strokeWidth={2} />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">{description}</p>

        <div className="space-y-4 mb-8 flex-1">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">What you can create:</p>
            <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                    <span key={tag} className="px-3 py-1.5 rounded-full border border-pink-100 text-slate-600 text-xs font-medium bg-pink-50/30">
                        {tag}
                    </span>
                ))}
            </div>
        </div>

        <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Get Started</span>
            <ArrowRight size={18} className="text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
        </div>
    </div>
);
