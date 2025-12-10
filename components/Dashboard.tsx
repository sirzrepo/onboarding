import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Image as ImageIcon, 
  FileText, 
  Library as LibraryIcon, 
  Settings, 
  LogOut, 
  User,
  TrendingUp,
  Clock,
  PoundSterling,
  Sparkles,
  ArrowRight,
  ShoppingBag,
  Video,
  PenTool,
  File,
  Music
} from 'lucide-react';
import { Library } from './Library';
import { MediaAIAgent } from './MediaAIAgent';
import { ContentAIAgent } from './ContentAIAgent';

interface DashboardProps {
  logo: string | null;
  primaryColor: string;
  isShopifyConnected: boolean;
  onLogout: () => void;
}

// Initial Library Data
const INITIAL_LIBRARY_ITEMS = [
  {
    id: 1,
    type: 'IMAGE',
    title: 'Product showcase image',
    description: 'Modern minimalist product on white background',
    time: '5 minutes ago',
    thumbnail: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=60',
    agent: 'Media AI'
  },
  {
    id: 2,
    type: 'TEXT',
    title: 'Marketing copy for homepage',
    description: 'Write compelling homepage copy for a SaaS product',
    time: '1 hour ago',
    icon: FileText,
    agent: 'Content AI'
  },
  {
    id: 3,
    type: 'VIDEO',
    title: 'Product demo video',
    description: 'Create a 30 second product demo video',
    time: '3 hours ago',
    thumbnail: 'https://images.unsplash.com/photo-1576091160550-217358c740c0?w=800&auto=format&fit=crop&q=60',
    agent: 'Media AI'
  },
  {
    id: 4,
    type: 'VIDEO',
    title: 'Product demo video',
    description: 'Create a 30 second product demo video',
    time: '3 hours ago',
    thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=60',
    agent: 'Media AI'
  },
  {
    id: 5,
    type: 'AUDIO',
    title: 'Podcast intro music',
    description: 'Upbeat intro music for tech podcast',
    time: '1 day ago',
    icon: Music,
    agent: 'Media AI'
  },
  {
    id: 6,
    type: 'IMAGE',
    title: 'Social media graphic',
    description: 'Colorful abstract shapes for Instagram',
    time: '2 days ago',
    thumbnail: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop&q=60',
    agent: 'Media AI'
  },
  {
    id: 7,
    type: 'TEXT',
    title: 'Blog post about AI',
    description: 'Write a blog post about AI in marketing',
    time: '3 days ago',
    icon: FileText,
    agent: 'Content AI'
  },
  {
    id: 8,
    type: 'TEXT',
    title: 'Blog post about AI',
    description: 'Write a blog post about AI in marketing',
    time: '3 days ago',
    icon: FileText,
    agent: 'Content AI'
  }
];

// Subcomponents for cleaner code
const StatCard = ({ label, value, subtext, icon: Icon, iconBg, iconColor }: any) => (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
            <div className={`w-10 h-10 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center`}>
                <Icon size={20} />
            </div>
            <span className="text-xs text-slate-400 font-medium">{label}</span>
        </div>
        <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-slate-900">{value}</span>
            {subtext && <span className="text-sm text-slate-500 font-medium">{subtext}</span>}
        </div>
    </div>
);

const ActivityItem = ({ icon: Icon, iconBg, iconColor, title, time, isLast }: any) => (
    <div className={`p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer ${!isLast ? 'border-b border-slate-50' : ''}`}>
        <div className={`w-10 h-10 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}>
            <Icon size={20} />
        </div>
        <div className="flex-1">
            <h4 className="text-sm font-medium text-slate-900">{title}</h4>
            <p className="text-xs text-slate-500">{time}</p>
        </div>
        <ArrowRight size={16} className="text-slate-300" />
    </div>
);

const DashboardOverview = ({ logo, primaryColor, isShopifyConnected }: any) => {
    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Welcome Banner */}
            <div className="w-full rounded-2xl p-8 md:p-10 relative overflow-hidden shadow-sm flex flex-col justify-center min-h-[200px]"
                 style={{ background: 'linear-gradient(135deg, #8ba856 0%, #769046 100%)' }}
            >
                {/* Decorative Circles */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full translate-x-1/3 -translate-y-1/3 blur-xl"></div>
                <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-yellow-300 opacity-10 rounded-full blur-2xl"></div>

                <div className="relative z-10 max-w-2xl">
                    <h2 className="text-3xl font-bold text-white mb-2">
                        Hi there! 👋 Ready to create something new today?
                    </h2>
                    <p className="text-white/90 text-lg mb-6">
                        Your branded AI workspace is ready. Choose a media type to get started.
                    </p>
                    {isShopifyConnected && (
                         <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 text-white text-sm font-medium">
                            <ShoppingBag size={16} />
                            Shopify Connected
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    label="Assets Generated" 
                    value="62" 
                    icon={TrendingUp} 
                    iconBg="bg-purple-50" 
                    iconColor="text-purple-600" 
                />
                <StatCard 
                    label="Avg. Turn Around Time" 
                    value="18" 
                    subtext="min" // Optional if you want to add units
                    icon={Clock} 
                    iconBg="bg-pink-50" 
                    iconColor="text-pink-600" 
                />
                <StatCard 
                    label="Estimate Saved" 
                    value="£ 600" 
                    icon={PoundSterling} 
                    iconBg="bg-slate-50" 
                    iconColor="text-slate-600" 
                />
                <StatCard 
                    label="Active Projects" 
                    value="5" 
                    icon={Sparkles} 
                    iconBg="bg-slate-50" 
                    iconColor="text-slate-600" 
                />
            </div>

            <div className="text-slate-800 font-medium text-lg">AI Agents</div>

            {/* AI Agents Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Media AI Agent */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center text-pink-500">
                            <ImageIcon size={24} />
                        </div>
                        <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full group-hover:bg-orange-100 transition-colors cursor-pointer">
                            24 generated assets
                        </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Media AI Agent</h3>
                    <p className="text-slate-500 text-sm mb-6 min-h-[40px]">
                        Generate text, images, audio, and video content with AI
                    </p>
                    <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-medium">Text • Image • Audio • Video</span>
                        <button className="text-slate-300 hover:text-slate-600 transition-colors">
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Content AI Agent */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
                            <PenTool size={24} />
                        </div>
                         <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full group-hover:bg-orange-100 transition-colors cursor-pointer">
                            24 generated assets
                        </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Content AI Agent</h3>
                    <p className="text-slate-500 text-sm mb-6 min-h-[40px]">
                        Generate SEO blog posts, email templates, landing pages, and content calendars
                    </p>
                    <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                         <span className="text-xs text-slate-400 font-medium">Create • Plan • Publish</span>
                        <button className="text-slate-300 hover:text-slate-600 transition-colors">
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="flex items-center justify-between">
                 <div className="text-slate-800 font-medium text-lg">Recent Activity</div>
                 <button className="text-sm font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 border border-slate-200 rounded-full px-4 py-1 hover:bg-slate-50 transition-colors">
                    View All <ArrowRight size={14} />
                 </button>
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <ActivityItem 
                    icon={ImageIcon} 
                    iconBg="bg-slate-100"
                    iconColor="text-slate-500"
                    title="Product showcase image" 
                    time="5 minutes ago" 
                />
                <ActivityItem 
                    icon={File} 
                    iconBg="bg-slate-100"
                    iconColor="text-slate-500"
                    title="Marketing copy for homepage" 
                    time="1 hour ago" 
                />
                <ActivityItem 
                    icon={Video} 
                    iconBg="bg-slate-100"
                    iconColor="text-slate-500"
                    title="Product demo video" 
                    time="3 hours ago" 
                    isLast
                />
            </div>

            {/* Create New CTA */}
            <div className="bg-slate-50 rounded-3xl border-2 border-orange-100 p-10 flex flex-col items-center text-center space-y-6">
                <div className="w-16 h-16 text-[#8ba856]">
                     <Sparkles size={64} strokeWidth={1.5} />
                </div>
                <div>
                     <p className="text-slate-800 font-medium mb-1">Ready to create something amazing?</p>
                     <p className="text-slate-500 text-sm">Your AI-powered media generator is ready to bring your ideas to life</p>
                </div>
                <button 
                    className="px-8 py-3 rounded-full text-white font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 active:translate-y-0 flex items-center gap-2"
                    style={{ backgroundColor: primaryColor }}
                >
                    Start Creating <Sparkles size={18} />
                </button>
            </div>

            <div className="h-8"></div> {/* Bottom Spacer */}
        </div>
    );
};

export const Dashboard: React.FC<DashboardProps> = ({ 
  logo, 
  primaryColor, 
  isShopifyConnected,
  onLogout 
}) => {
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'library' | 'media' | 'content' | 'settings'
  const [libraryItems, setLibraryItems] = useState<any[]>(INITIAL_LIBRARY_ITEMS);

  const addToLibrary = (newItem: any) => {
      setLibraryItems(prev => [newItem, ...prev]);
  };

  const NavItem = ({ view, icon: Icon, label }: { view: string, icon: any, label: string }) => {
      const isActive = currentView === view;
      return (
        <button 
            onClick={() => setCurrentView(view)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                isActive 
                ? 'text-white shadow-md' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
            style={isActive ? { backgroundColor: primaryColor } : {}}
        >
            <Icon size={20} />
            <span className="font-medium">{label}</span>
        </button>
      );
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col fixed inset-y-0 z-50 transition-all">
        <div className="p-6 h-20 flex items-center">
            {logo ? (
                <img src={logo} alt="Brand Logo" className="h-8 object-contain" />
            ) : (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center">
                        <ImageIcon size={16} className="text-slate-500" />
                    </div>
                    <span className="font-bold text-slate-800">Brand Name</span>
                </div>
            )}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
            <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem view="media" icon={ImageIcon} label="Media AI Agent" />
            <NavItem view="content" icon={FileText} label="Content AI Agent" />
            <NavItem view="library" icon={LibraryIcon} label="Library" />
            <NavItem view="settings" icon={Settings} label="Settings" />
        </nav>

        <div className="p-4 border-t border-slate-100">
            <button 
                onClick={onLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 w-full transition-colors"
            >
                <LogOut size={20} />
                <span className="font-medium">Logout</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-40">
            <h1 className="text-xl font-medium text-slate-800 capitalize">
                {currentView === 'media' ? 'Media AI Agent' : currentView === 'content' ? 'Content AI Agent' : currentView.replace('-', ' ')}
            </h1>
            <div className="flex items-center gap-4">
                <button className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 hover:bg-orange-200 transition-colors">
                    <User size={20} />
                </button>
            </div>
        </header>

        {/* Dynamic Content Area */}
        <div className="flex-1">
            {currentView === 'dashboard' && (
                <DashboardOverview 
                    logo={logo} 
                    primaryColor={primaryColor} 
                    isShopifyConnected={isShopifyConnected} 
                />
            )}
            {currentView === 'library' && (
                <Library primaryColor={primaryColor} items={libraryItems} />
            )}
             {currentView === 'media' && (
                <MediaAIAgent primaryColor={primaryColor} />
            )}
             {currentView === 'content' && (
                <ContentAIAgent primaryColor={primaryColor} addToLibrary={addToLibrary} />
            )}
            {/* Placeholder for other views */}
            {(currentView !== 'dashboard' && currentView !== 'library' && currentView !== 'media' && currentView !== 'content') && (
                 <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] text-slate-400">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                        <Settings size={32} />
                    </div>
                    <p className="font-medium">View not implemented yet</p>
                 </div>
            )}
        </div>
      </main>
    </div>
  );
};