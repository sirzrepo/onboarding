import React from 'react';
import { PenTool, Target, Zap, Sparkles, FileText } from 'lucide-react';

interface BlogLandingProps {
  onCreate: () => void;
  primaryColor?: string;
}

export const BlogLanding: React.FC<BlogLandingProps> = ({ onCreate, primaryColor = '#ea580c' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Hero Icon */}
      <div className="w-24 h-24 bg-[#f2f4ef] rounded-full flex items-center justify-center mb-8">
        <PenTool size={40} className="text-[#8ba856] ml-1" />
      </div>

      {/* Headings */}
      <h2 className="text-3xl font-bold text-slate-900 mb-4">Create SEO-Optimized Blog Posts</h2>
      <p className="text-slate-500 text-center max-w-xl mb-12 leading-relaxed">
        Generate high-quality, SEO-optimized blog articles with AI assistance. 
        Research keywords, create compelling content, and boost your organic traffic.
      </p>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mb-12">
        
        {/* Card 1: SEO */}
        <div className="bg-slate-50 rounded-2xl p-8 flex flex-col items-center text-center hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-slate-100">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-4">
            <Target size={24} />
          </div>
          <h3 className="font-bold text-slate-900 mb-2">SEO Optimized</h3>
          <p className="text-sm text-slate-500">Keyword research & optimization</p>
        </div>

        {/* Card 2: Long Form */}
        <div className="bg-slate-50 rounded-2xl p-8 flex flex-col items-center text-center hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-slate-100">
          <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-600 mb-4">
             <PenTool size={24} />
          </div>
          <h3 className="font-bold text-slate-900 mb-2">Long-form Content</h3>
          <p className="text-sm text-slate-500">600-2000+ word articles</p>
        </div>

        {/* Card 3: Fast */}
        <div className="bg-slate-50 rounded-2xl p-8 flex flex-col items-center text-center hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-slate-100">
          <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-500 mb-4">
            <Zap size={24} fill="currentColor" />
          </div>
          <h3 className="font-bold text-slate-900 mb-2">Fast Generation</h3>
          <p className="text-sm text-slate-500">Create in minutes, not hours</p>
        </div>
      
      </div>

      {/* CTA Button */}
      <button 
        onClick={onCreate}
        className="px-8 py-4 rounded-lg text-white font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 mb-8"
        style={{ backgroundColor: primaryColor }}
      >
        <Sparkles size={20} />
        Start Writing a Blog Post
      </button>

      <p className="text-slate-400 text-sm">
        Join thousands of content creators using AI to scale their content marketing
      </p>

    </div>
  );
};
