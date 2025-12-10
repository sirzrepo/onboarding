import React, { useState } from 'react';
import { Mail, Calendar, FileText, LayoutTemplate, ArrowRight, Sparkles, Plus, Instagram, Linkedin, Facebook, Twitter, Video, CheckCircle2 } from 'lucide-react';
import { EmailGenerator } from './EmailGenerator';
import { CalendarGenerator } from './CalendarGenerator';
import { BlogLanding } from './BlogLanding';
import { BlogGenerator } from './BlogGenerator';
import { LandingPageGenerator } from './LandingPageGenerator';

interface ContentAIAgentProps {
  primaryColor?: string;
  addToLibrary?: (item: any) => void;
}

export const ContentAIAgent: React.FC<ContentAIAgentProps> = ({ primaryColor = '#ea580c', addToLibrary }) => {
  const [activeTab, setActiveTab] = useState('email');
  const [view, setView] = useState<'grid' | 'email-generator' | 'calendar-generator' | 'blog-generator' | 'landing-generator'>('grid');
  const [selectedTemplate, setSelectedTemplate] = useState('Welcome Email');

  const handleTemplateClick = (templateName: string) => {
      setSelectedTemplate(templateName);
      if (activeTab === 'email') {
          setView('email-generator');
      } else if (activeTab === 'calendar') {
          setView('calendar-generator');
      }
  };

  const handleStartBlog = () => {
    setView('blog-generator');
  };

  if (view === 'email-generator') {
      return (
          <EmailGenerator 
            onBack={() => setView('grid')} 
            primaryColor={primaryColor} 
            templateName={selectedTemplate}
          />
      );
  }

  if (view === 'calendar-generator') {
    return (
        <CalendarGenerator 
          onBack={() => setView('grid')} 
          primaryColor={primaryColor} 
          templateName={selectedTemplate}
          addToLibrary={addToLibrary}
        />
    );
  }

  if (view === 'blog-generator') {
    return (
        <BlogGenerator 
          onBack={() => setView('grid')} 
          primaryColor={primaryColor} 
          addToLibrary={addToLibrary}
        />
    );
  }

  if (view === 'landing-generator') {
    return (
        <LandingPageGenerator 
          onBack={() => setView('grid')} 
          primaryColor={primaryColor} 
          templateName={selectedTemplate}
          addToLibrary={addToLibrary}
        />
    );
  }

  const tabs = [
    { id: 'email', label: 'Email Templates', icon: Mail },
    { id: 'calendar', label: 'Content Calendar', icon: Calendar },
    { id: 'blog', label: 'SEO Blog Post', icon: FileText },
    { id: 'landing', label: 'Landing Pages', icon: LayoutTemplate },
  ];

  const emailTemplates = [
    {
      id: 1,
      title: 'Newsletter Template',
      description: 'Keep your audience engaged with regular updates',
      image: 'https://images.unsplash.com/photo-1626785774573-4b799314346d?w=800&auto=format&fit=crop&q=60',
      tags: ['Newsletter', 'Updates', 'Content'],
      overlayText: 'Introducing Our Custom Labels'
    },
    {
      id: 2,
      title: 'Welcome Email',
      description: 'Onboard new customers with a warm welcome',
      image: 'https://images.unsplash.com/photo-1522869635100-8f47562584a5?w=800&auto=format&fit=crop&q=60',
      tags: ['Welcome', 'Onboarding', 'First Impression'],
      overlayText: 'Manhattan TV\nBritish TV. All For Free.\nNo Monthly Bills.',
      darkOverlay: true
    },
    {
      id: 3,
      title: 'Product Launch',
      description: 'Announce new products to your audience',
      image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&auto=format&fit=crop&q=60',
      tags: ['Launch', 'Product', 'Announcement'],
      overlayText: 'Our Signature Favorites',
      lightOverlay: true
    },
    {
      id: 4,
      title: 'Newsletter Template',
      description: 'Keep your audience engaged with regular updates',
      image: 'https://images.unsplash.com/photo-1577803645773-f96470509666?w=800&auto=format&fit=crop&q=60',
      tags: ['Newsletter', 'Updates', 'Content'],
      overlayText: 'NEW: HANDCRAFTED ACETATE FRAMES IN SPRING HUES'
    },
    {
      id: 5,
      title: 'Welcome Email',
      description: 'Onboard new customers with a warm welcome',
      image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&auto=format&fit=crop&q=60',
      tags: ['Welcome', 'Onboarding', 'First Impression'],
      overlayText: 'UP AND UNDER',
      darkOverlay: true
    }
  ];

  const calendarTemplates = [
    {
      id: 1,
      title: 'Social Media Starter',
      description: '7-day content plan for growing your social presence',
      duration: '1 Week',
      posts: 7,
      frequency: 'Daily',
      platforms: [
          { name: 'Instagram', icon: Instagram }, 
          { name: 'TikTok', icon: Video }, 
          { name: 'Twitter', icon: Twitter }
      ],
      includes: ['Monday: Behind the scenes', 'Tuesday: Product showcase', 'Wednesday: Customer story'],
      icon: Instagram,
      iconColor: 'text-pink-600',
      iconBg: 'bg-pink-50'
    },
    {
      id: 2,
      title: 'B2B LinkedIn Strategy',
      description: 'Professional content calendar for LinkedIn growth',
      duration: '1 Week',
      posts: 10,
      frequency: '5x per week',
      platforms: [
          { name: 'LinkedIn', icon: Linkedin }
      ],
      includes: ['Industry insights', 'Thought leadership', 'Company updates'],
      icon: Linkedin,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50'
    },
    {
      id: 3,
      title: 'Product Launch Campaign',
      description: '30-day launch plan across multiple channels',
      duration: '1 month',
      posts: 10,
      frequency: '5x per week',
      platforms: [
          { name: 'Instagram', icon: Instagram }, 
          { name: 'Facebook', icon: Facebook }, 
          { name: 'LinkedIn', icon: Linkedin }
      ],
      includes: ['Teaser posts', 'Countdown series', 'Launch day'],
      icon: Calendar,
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-50'
    }
  ];

  const landingTemplates = [
    {
      id: 1,
      title: 'SaaS Product Launch',
      description: 'High-converting page for software products',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60',
      sections: ['Hero', 'Features', 'Pricing', '+2'],
      tags: ['SaaS', 'B2B', 'Tech'],
    },
    {
      id: 2,
      title: 'Beauty Product Landing Page',
      description: 'High-converting page for software products', 
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdd403348?w=800&auto=format&fit=crop&q=60',
      sections: ['Hero', 'Features', 'Pricing', '+2'],
      tags: ['SaaS', 'B2B', 'Tech'],
    },
    {
      id: 3,
      title: 'E-commerce Product Page',
      description: 'High-converting page for software products',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=60',
      sections: ['Hero', 'Features', 'Pricing', '+2'],
      tags: ['SaaS', 'B2B', 'Tech'],
    }
  ];

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4 pt-4">
            <div className="w-20 h-20 mx-auto flex items-center justify-center relative">
                <Sparkles size={64} strokeWidth={1.5} className="text-[#8ba856]" />
                <Plus size={24} strokeWidth={3} className="absolute top-1 right-0 text-[#8ba856]" />
            </div>
            <h1 className="text-3xl font-bold text-[#c2410c]">AI Content Generator</h1>
            <p className="text-slate-500 leading-relaxed">
                Create all your marketing content in one place.
            </p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-slate-200">
            <div className="flex justify-center gap-8 overflow-x-auto">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-1 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                                isActive 
                                ? 'border-[#8ba856] text-slate-900' 
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                        >
                            <Icon size={18} className={isActive ? 'text-[#8ba856]' : 'text-slate-400'} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>
        </div>

        {/* Email Tab Content */}
        {activeTab === 'email' && (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-semibold text-slate-800 mb-2">Email Templates</h2>
                    <p className="text-slate-500">Choose from professionally crafted email templates or create your own from scratch</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {emailTemplates.map((template) => (
                        <div key={template.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col">
                            {/* Image Preview */}
                            <div className="h-64 relative bg-slate-100 overflow-hidden">
                                <img 
                                    src={template.image} 
                                    alt={template.title} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                />
                                {/* Overlay Text Simulation */}
                                <div className={`absolute inset-0 flex flex-col items-center justify-center text-center p-6 ${template.darkOverlay ? 'bg-black/30' : 'bg-white/10'}`}>
                                    {template.overlayText && (
                                        <div className={`font-bold uppercase tracking-wider ${template.darkOverlay ? 'text-white text-2xl shadow-sm' : template.lightOverlay ? 'text-slate-800 text-xl' : 'text-slate-800 bg-white/90 p-3 shadow-sm text-sm'}`}>
                                            {template.overlayText}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 flex flex-col flex-1">
                                <h3 className="text-lg font-bold text-slate-900 mb-2">{template.title}</h3>
                                <p className="text-sm text-slate-500 mb-4 flex-1">{template.description}</p>
                                
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {template.tags.map(tag => (
                                        <span key={tag} className="text-[10px] font-medium px-2 py-1 rounded bg-slate-100 text-slate-500">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <button 
                                    onClick={() => handleTemplateClick(template.title)}
                                    className="w-full py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    Use Template <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Create from Scratch Card */}
                    <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 shadow-sm flex flex-col items-center justify-center p-8 text-center min-h-[500px] hover:border-slate-300 transition-colors">
                        <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mb-6 text-pink-500 animate-pulse">
                            <Sparkles size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Create from Scratch</h3>
                        <p className="text-sm text-slate-500 mb-8 max-w-[200px]">Build a custom email with AI assistance</p>
                        
                        <button 
                             onClick={() => handleTemplateClick('Custom Email')}
                             className="px-8 py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                             style={{ backgroundColor: primaryColor }}
                        >
                            Start Creating <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Content Calendar Tab Content */}
        {activeTab === 'calendar' && (
             <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-semibold text-slate-800 mb-2">Content Calendar Templates</h2>
                    <p className="text-slate-500">Pre-planned content strategies ready to customize and deploy</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {calendarTemplates.map((template) => {
                        const Icon = template.icon;
                        return (
                            <div key={template.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 p-6 flex flex-col">
                                
                                {/* Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`w-12 h-12 rounded-xl ${template.iconBg} ${template.iconColor} flex items-center justify-center`}>
                                        <Icon size={24} />
                                    </div>
                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">
                                        {template.duration}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-slate-900 mb-2">{template.title}</h3>
                                <p className="text-sm text-slate-500 mb-6">{template.description}</p>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <div className="bg-slate-50 rounded-lg p-3">
                                        <span className="block text-xl font-bold text-[#c2410c]">{template.posts}</span>
                                        <span className="text-xs text-slate-500 font-medium">Posts</span>
                                    </div>
                                    <div className="bg-slate-50 rounded-lg p-3">
                                        <span className="block text-sm font-bold text-slate-900 mt-1">{template.frequency}</span>
                                        <span className="text-xs text-slate-500 font-medium">Frequency</span>
                                    </div>
                                </div>

                                {/* Platforms */}
                                <div className="mb-6">
                                    <span className="text-xs text-slate-400 font-medium mb-2 block">Platforms:</span>
                                    <div className="flex flex-wrap gap-2">
                                        {template.platforms.map((platform, idx) => {
                                            const PlatformIcon = platform.icon;
                                            return (
                                                <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-orange-50 text-orange-700 text-xs font-medium">
                                                    <PlatformIcon size={10} />
                                                    {platform.name}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Includes */}
                                <div className="mb-8 bg-slate-50/50 rounded-xl p-4 flex-1">
                                    <span className="text-xs text-slate-400 font-medium mb-3 block">Includes:</span>
                                    <ul className="space-y-2">
                                        {template.includes.map((item, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                                                <div className="w-1 h-1 rounded-full bg-[#c2410c] mt-1.5 shrink-0" />
                                                {item}
                                                {idx === 2 && <span className="text-slate-400 italic text-[10px] ml-1">+ 2 more</span>}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <button 
                                    onClick={() => handleTemplateClick(template.title)}
                                    className="w-full py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    Use Template <ArrowRight size={16} />
                                </button>
                            </div>
                        );
                    })}

                    {/* Create New Calendar Card */}
                    <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 shadow-sm flex flex-col items-center justify-center p-8 text-center min-h-[600px] hover:border-slate-300 transition-colors">
                        <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-6 text-purple-500 animate-pulse">
                            <Calendar size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Create New Calendar</h3>
                        <p className="text-sm text-slate-500 mb-8 max-w-[200px]">Design a custom content strategy from scratch</p>
                        
                        <button 
                             onClick={() => handleTemplateClick('Custom Calendar')}
                             className="px-8 py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                             style={{ backgroundColor: primaryColor }}
                        >
                            Start Planning <ArrowRight size={16} />
                        </button>
                    </div>

                </div>
             </div>
        )}
        
        {/* SEO Blog Post Content */}
        {activeTab === 'blog' && (
            <BlogLanding onCreate={handleStartBlog} primaryColor={primaryColor} />
        )}

        {/* Landing Pages Tab Content */}
        {activeTab === 'landing' && (
             <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-semibold text-slate-800 mb-2">Landing Page Templates</h2>
                    <p className="text-slate-500">Choose from professionally crafted landing page templates or create your own from scratch</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {landingTemplates.map((template) => (
                        <div key={template.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col">
                            {/* Image Preview */}
                            <div className="h-56 relative bg-slate-100 overflow-hidden">
                                <img 
                                    src={template.image} 
                                    alt={template.title} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                />
                            </div>

                            {/* Content */}
                            <div className="p-6 flex flex-col flex-1">
                                <h3 className="text-lg font-bold text-slate-900 mb-1">{template.title}</h3>
                                <p className="text-sm text-slate-500 mb-6">{template.description}</p>
                                
                                <div className="mb-4">
                                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2 block">Sections Included:</span>
                                    <div className="flex flex-wrap gap-2">
                                        {template.sections.map((section, i) => (
                                            <span key={i} className="px-2.5 py-1 rounded bg-slate-100 text-slate-600 text-xs font-medium">
                                                {section}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                                    {template.tags.map((tag, i) => (
                                        <span key={i} className="px-2.5 py-1 rounded bg-[#f2f4ef] text-[#4d6b2c] text-xs font-medium">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <button 
                                    onClick={() => {
                                        setSelectedTemplate(template.title);
                                        setView('landing-generator');
                                    }}
                                    className="w-full py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    Use Template <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    ))}

                     {/* Create New Landing Page Card */}
                     <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 shadow-sm flex flex-col items-center justify-center p-8 text-center min-h-[500px] hover:border-slate-300 transition-colors">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 text-red-400 animate-pulse">
                            <Sparkles size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Create from Scratch</h3>
                        <p className="text-sm text-slate-500 mb-8 max-w-[200px]">Build a custom landing page with AI assistance</p>
                        
                        <button 
                             onClick={() => {
                                 setSelectedTemplate('Custom Landing Page');
                                 setView('landing-generator');
                             }}
                             className="px-8 py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                             style={{ backgroundColor: primaryColor }}
                        >
                            Start Creating <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
             </div>
        )}

        {/* Footer Info */}
        <div className="bg-[#fcfbf7] border border-[#e8dfd8] rounded-2xl p-8 text-center max-w-6xl mx-auto relative overflow-hidden mt-12">
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