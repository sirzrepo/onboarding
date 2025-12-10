import React, { useState } from 'react';
import { ArrowLeft, LayoutTemplate, Sparkles, Download, RefreshCw, Save, Check, Search, User, ShoppingBag, Edit3, ChevronDown, ChevronUp, ExternalLink, Menu, X, Globe, Link as LinkIcon, Home, Info, Mail, Send, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface LandingPageGeneratorProps {
  onBack: () => void;
  primaryColor?: string;
  templateName?: string;
  addToLibrary?: (item: any) => void;
}

// Data Structures
interface GlobalSettings {
    siteName: string;
    navLinks: { label: string; pageId: string }[]; // pageId: 'home', 'about', 'contact'
    footerText: string;
    footerLinks: { label: string; url: string }[];
}

interface HomePageContent {
    hero_headline: string;
    hero_subheadline: string;
    hero_cta: string;
    features_title: string;
    features: { title: string; description: string; price: string }[];
}

interface AboutPageContent {
    hero_headline: string;
    hero_subheadline: string;
    story_title: string;
    story_content: string; // Long text
    team_title: string;
    team_members: { name: string; role: string }[];
}

interface ContactPageContent {
    hero_headline: string;
    hero_subheadline: string;
    email: string; // Display email
    form_email: string; // Submission target email
    phone: string;
    address: string;
    form_title: string;
}

interface GeneratedWebsite {
    global: GlobalSettings;
    pages: {
        home: HomePageContent;
        about: AboutPageContent;
        contact: ContactPageContent;
    };
}

export const LandingPageGenerator: React.FC<LandingPageGeneratorProps> = ({ 
  onBack, 
  primaryColor = '#ea580c', 
  templateName = 'SaaS Product Launch',
  addToLibrary
}) => {
  // Mode State
  const [viewMode, setViewMode] = useState<'create' | 'edit'>('create');
  const [activePage, setActivePage] = useState<'home' | 'about' | 'contact'>('home');
  const [activeEditorSection, setActiveEditorSection] = useState<string>('hero');

  // Input State
  const [productName, setProductName] = useState('Beauty website');
  const [audience, setAudience] = useState('Skincare enthusiasts');
  const [valueProp, setValueProp] = useState('All-natural, organic ingredients');
  const [goal, setGoal] = useState('Increase sales');
  const [tone, setTone] = useState('Luxurious & Trustworthy');
  
  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [websiteData, setWebsiteData] = useState<GeneratedWebsite | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Preview Form State
  const [previewFormState, setPreviewFormState] = useState<'idle' | 'submitting' | 'success'>('idle');

  // Mock Images
  const [images] = useState({
      hero: 'https://images.unsplash.com/photo-1556228720-1918d30e371f?w=1200&auto=format&fit=crop&q=80',
      about: 'https://images.unsplash.com/photo-1573461160327-b450ce3d8e7f?w=800&auto=format&fit=crop&q=80',
      featureBase: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=500&auto=format&fit=crop&q=60',
      contact: 'https://images.unsplash.com/photo-1423666639041-f142fcb93370?w=1200&auto=format&fit=crop&q=80'
  });

  const handleGenerate = async () => {
    if (!productName || !valueProp) return;

    setIsGenerating(true);
    if (viewMode === 'create') setWebsiteData(null);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const prompt = `
            You are a web designer. Create content for a complete 3-page website (Home, About, Contact) for "${productName}".
            
            **Context:**
            - **Audience:** ${audience}
            - **Value Proposition:** ${valueProp}
            - **Tone:** ${tone}
            
            **Output Format:**
            Return ONLY a valid JSON object with this exact structure:
            {
              "global": {
                "siteName": "${productName}",
                "navLinks": [
                    {"label": "Home", "pageId": "home"},
                    {"label": "About Us", "pageId": "about"},
                    {"label": "Contact", "pageId": "contact"}
                ],
                "footerText": "© 2024 ${productName}. All rights reserved.",
                "footerLinks": [{"label": "Privacy", "url": "#"}, {"label": "Terms", "url": "#"}]
              },
              "pages": {
                "home": {
                    "hero_headline": "Main catchy headline",
                    "hero_subheadline": "Subheadline",
                    "hero_cta": "Call to action text",
                    "features_title": "Featured Products/Services",
                    "features": [
                        {"title": "Feature 1", "description": "Short desc", "price": "$XX"},
                        {"title": "Feature 2", "description": "Short desc", "price": "$XX"},
                        {"title": "Feature 3", "description": "Short desc", "price": "$XX"},
                        {"title": "Feature 4", "description": "Short desc", "price": "$XX"}
                    ]
                },
                "about": {
                    "hero_headline": "About Us Headline",
                    "hero_subheadline": "Short intro",
                    "story_title": "Our Story",
                    "story_content": "2-3 paragraphs about the brand history and mission.",
                    "team_title": "Meet the Team",
                    "team_members": [
                        {"name": "Name 1", "role": "Role 1"},
                        {"name": "Name 2", "role": "Role 2"},
                        {"name": "Name 3", "role": "Role 3"}
                    ]
                },
                "contact": {
                    "hero_headline": "Get in Touch",
                    "hero_subheadline": "We'd love to hear from you",
                    "email": "hello@${productName.replace(/\s/g, '').toLowerCase()}.com",
                    "phone": "+1 (555) 123-4567",
                    "address": "123 Innovation Dr, Tech City",
                    "form_title": "Send us a message"
                }
              }
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
        
        // Add form_email default if missing
        if (data.pages && data.pages.contact) {
            data.pages.contact.form_email = data.pages.contact.email;
        }

        setWebsiteData(data);
        setViewMode('edit');
        setActivePage('home');

    } catch (error) {
        console.error("Error generating website:", error);
        alert("Failed to generate content. Please try again.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleSaveToLibrary = () => {
    if (!websiteData || !addToLibrary) return;
    setIsSaving(true);

    const newItem = {
        id: Date.now(),
        type: 'TEXT',
        title: `${productName} Full Website`,
        description: `3-Page Site: Home, About, Contact`,
        time: 'Just now',
        agent: 'Content AI',
        icon: LayoutTemplate,
        content: JSON.stringify(websiteData)
    };

    addToLibrary(newItem);

    setTimeout(() => {
        setIsSaving(false);
        alert("Website saved to Library!");
    }, 600);
  };

  const handleExportHTML = () => {
    if (!websiteData) return;

    // Logic for form submission via FormSubmit.co
    const formAction = `https://formsubmit.co/${websiteData.pages.contact.form_email || 'your@email.com'}`;

    // We'll create a single-file SPA using vanilla JS to switch tabs
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${websiteData.global.siteName}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                        serif: ['Playfair Display', 'serif'],
                    },
                    colors: {
                        primary: '${primaryColor}',
                    }
                }
            }
        }
        function showPage(pageId) {
            document.querySelectorAll('.page-section').forEach(el => el.classList.add('hidden'));
            document.getElementById(pageId).classList.remove('hidden');
            window.scrollTo(0, 0);
        }
        // Simple form validation visual feedback
        document.addEventListener('DOMContentLoaded', () => {
            const form = document.querySelector('form');
            if(form) {
                form.addEventListener('submit', function() {
                    const btn = this.querySelector('button[type="submit"]');
                    if(btn) {
                        btn.innerHTML = 'Sending...';
                        btn.disabled = true;
                        btn.classList.add('opacity-75');
                    }
                });
            }
        });
    </script>
</head>
<body class="bg-white text-slate-900 antialiased flex flex-col min-h-screen">

    <!-- Navigation -->
    <nav class="fixed w-full z-50 top-0 bg-white/95 backdrop-blur-sm border-b border-slate-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-20">
                <div class="flex items-center gap-2 cursor-pointer" onclick="showPage('home')">
                    <div class="w-8 h-8 rounded-full border border-primary flex items-center justify-center">
                        <span class="text-primary font-serif text-lg font-bold">${websiteData.global.siteName.charAt(0).toUpperCase()}</span>
                    </div>
                    <span class="text-primary font-serif text-sm uppercase tracking-widest font-bold">${websiteData.global.siteName}</span>
                </div>
                <div class="hidden md:flex gap-8">
                    <button onclick="showPage('home')" class="text-xs font-medium tracking-widest text-slate-500 uppercase hover:text-primary transition-colors">Home</button>
                    <button onclick="showPage('about')" class="text-xs font-medium tracking-widest text-slate-500 uppercase hover:text-primary transition-colors">About</button>
                    <button onclick="showPage('contact')" class="text-xs font-medium tracking-widest text-slate-500 uppercase hover:text-primary transition-colors">Contact</button>
                </div>
                <button class="md:hidden text-slate-500" onclick="document.getElementById('mobile-menu').classList.toggle('hidden')">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                </button>
            </div>
        </div>
        <div id="mobile-menu" class="hidden md:hidden bg-white border-t border-slate-100 px-4 py-2 space-y-2">
            <button onclick="showPage('home'); document.getElementById('mobile-menu').classList.add('hidden')" class="block w-full text-left py-2 text-sm text-slate-600">Home</button>
            <button onclick="showPage('about'); document.getElementById('mobile-menu').classList.add('hidden')" class="block w-full text-left py-2 text-sm text-slate-600">About</button>
            <button onclick="showPage('contact'); document.getElementById('mobile-menu').classList.add('hidden')" class="block w-full text-left py-2 text-sm text-slate-600">Contact</button>
        </div>
    </nav>

    <!-- Content Pages -->
    <main class="flex-grow pt-20">
        
        <!-- HOME PAGE -->
        <div id="home" class="page-section">
            <section class="relative h-[600px] w-full bg-stone-100 flex items-center">
                <div class="absolute inset-0">
                    <img src="${images.hero}" class="w-full h-full object-cover" />
                    <div class="absolute inset-0 bg-black/40"></div>
                </div>
                <div class="relative z-10 max-w-7xl mx-auto px-6 text-white">
                    <h1 class="text-5xl md:text-7xl font-serif font-bold mb-6">${websiteData.pages.home.hero_headline}</h1>
                    <p class="text-xl opacity-90 mb-8 max-w-2xl">${websiteData.pages.home.hero_subheadline}</p>
                    <button onclick="showPage('about')" class="px-8 py-3 bg-primary text-white text-sm uppercase tracking-widest font-bold hover:opacity-90 transition-colors">${websiteData.pages.home.hero_cta}</button>
                </div>
            </section>
            <section class="py-20 px-6 max-w-7xl mx-auto">
                <h2 class="text-3xl font-serif font-bold text-center mb-12">${websiteData.pages.home.features_title}</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    ${websiteData.pages.home.features.map((f, i) => `
                        <div class="group">
                            <div class="aspect-[3/4] bg-stone-100 mb-4 relative overflow-hidden">
                                <img src="${images.featureBase}&random=${i}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            </div>
                            <h3 class="font-serif text-lg font-bold mb-2">${f.title}</h3>
                            <p class="text-sm text-slate-500 mb-2">${f.description}</p>
                            <p class="text-primary font-bold">${f.price}</p>
                        </div>
                    `).join('')}
                </div>
            </section>
        </div>

        <!-- ABOUT PAGE -->
        <div id="about" class="page-section hidden">
            <section class="bg-[#fcfbf7] py-20 px-6">
                <div class="max-w-4xl mx-auto text-center mb-16">
                    <h1 class="text-4xl md:text-5xl font-serif font-bold mb-4">${websiteData.pages.about.hero_headline}</h1>
                    <p class="text-slate-500 text-lg">${websiteData.pages.about.hero_subheadline}</p>
                </div>
                <div class="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
                    <div class="flex-1">
                        <img src="${images.about}" class="w-full rounded-lg shadow-xl" />
                    </div>
                    <div class="flex-1">
                        <h2 class="text-3xl font-serif font-bold mb-6">${websiteData.pages.about.story_title}</h2>
                        <p class="text-slate-600 leading-relaxed whitespace-pre-line">${websiteData.pages.about.story_content}</p>
                    </div>
                </div>
            </section>
            <section class="py-20 px-6 max-w-7xl mx-auto">
                <h2 class="text-3xl font-serif font-bold text-center mb-12">${websiteData.pages.about.team_title}</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    ${websiteData.pages.about.team_members.map((m, i) => `
                        <div class="text-center">
                            <div class="w-24 h-24 bg-slate-200 rounded-full mx-auto mb-4 overflow-hidden">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${i}" class="w-full h-full object-cover" />
                            </div>
                            <h3 class="font-bold text-lg">${m.name}</h3>
                            <p class="text-slate-500 text-sm uppercase tracking-wider">${m.role}</p>
                        </div>
                    `).join('')}
                </div>
            </section>
        </div>

        <!-- CONTACT PAGE -->
        <div id="contact" class="page-section hidden">
            <section class="py-20 px-6 bg-slate-900 text-white text-center">
                <h1 class="text-4xl md:text-5xl font-serif font-bold mb-4">${websiteData.pages.contact.hero_headline}</h1>
                <p class="text-slate-400 text-lg">${websiteData.pages.contact.hero_subheadline}</p>
            </section>
            <section class="py-20 px-6 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
                <div>
                    <h2 class="text-2xl font-serif font-bold mb-8">Contact Information</h2>
                    <div class="space-y-6">
                        <div>
                            <span class="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Email</span>
                            <a href="mailto:${websiteData.pages.contact.email}" class="text-lg hover:text-primary transition-colors">${websiteData.pages.contact.email}</a>
                        </div>
                        <div>
                            <span class="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Phone</span>
                            <p class="text-lg">${websiteData.pages.contact.phone}</p>
                        </div>
                        <div>
                            <span class="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Address</span>
                            <p class="text-lg">${websiteData.pages.contact.address}</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
                    <h3 class="text-xl font-bold mb-6">${websiteData.pages.contact.form_title}</h3>
                    <!-- Functional Form via FormSubmit.co -->
                    <form action="${formAction}" method="POST" class="space-y-4">
                        <!-- Bot protection -->
                        <input type="text" name="_honey" style="display:none">
                        <!-- Disable Captcha for smoother demo flow (optional) -->
                        <input type="hidden" name="_captcha" value="false">
                        
                        <input type="text" name="name" placeholder="Name" required class="w-full p-3 border border-slate-200 rounded-lg" />
                        <input type="email" name="email" placeholder="Email" required class="w-full p-3 border border-slate-200 rounded-lg" />
                        <textarea name="message" placeholder="Message" required class="w-full p-3 border border-slate-200 rounded-lg h-32"></textarea>
                        <button type="submit" class="w-full py-3 bg-primary text-white font-bold rounded-lg hover:opacity-90 transition-opacity">Send Message</button>
                    </form>
                </div>
            </section>
        </div>

    </main>

    <!-- Footer -->
    <footer class="bg-slate-50 border-t border-slate-200 py-12 text-center text-sm text-slate-500">
        <div class="max-w-7xl mx-auto px-6">
            <div class="flex justify-center gap-6 mb-6">
                ${websiteData.global.footerLinks.map(l => `<a href="${l.url}" class="hover:text-primary transition-colors">${l.label}</a>`).join('')}
            </div>
            <p>${websiteData.global.footerText}</p>
        </div>
    </footer>

</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${websiteData.global.siteName.replace(/\s+/g, '-').toLowerCase()}-website.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Helper to update deeply nested state
  const updatePageContent = (page: 'home' | 'about' | 'contact', field: string, value: any) => {
      if (websiteData) {
          setWebsiteData({
              ...websiteData,
              pages: {
                  ...websiteData.pages,
                  [page]: {
                      ...websiteData.pages[page],
                      [field]: value
                  }
              }
          });
      }
  };

  const handlePreviewSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setPreviewFormState('submitting');
      
      // Simulate submission
      setTimeout(() => {
          setPreviewFormState('success');
      }, 1500);
  };

  const EditorSection = ({ title, id, children }: { title: string, id: string, children: React.ReactNode }) => (
      <div className="border-b border-slate-100 last:border-0">
          <button 
            onClick={() => setActiveEditorSection(activeEditorSection === id ? '' : id)}
            className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors"
          >
              <span className="font-semibold text-slate-700 text-sm">{title}</span>
              {activeEditorSection === id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
          </button>
          {activeEditorSection === id && (
              <div className="p-4 space-y-4 bg-white animate-in slide-in-from-top-1 duration-200">
                  {children}
              </div>
          )}
      </div>
  );

  return (
    <div className="p-8 animate-in fade-in slide-in-from-right-8 duration-500 pb-20">
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
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                    <LayoutTemplate size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{templateName}</h1>
                    <p className="text-slate-500">
                        {viewMode === 'create' ? 'Define your site parameters' : 'Edit and refine your website'}
                    </p>
                </div>
            </div>
         </div>
         {viewMode === 'edit' && (
             <button 
                onClick={() => setViewMode('create')}
                className="text-sm text-slate-500 hover:text-orange-600 font-medium underline-offset-4 hover:underline"
             >
                 Create New
             </button>
         )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Controls (Create or Edit) */}
        <div className="lg:col-span-4 space-y-6">
            
            {viewMode === 'create' ? (
                /* CREATE MODE FORM */
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                     <div>
                        <label className="block text-slate-700 font-medium mb-2 text-sm">Product/Service Name <span className="text-red-500">*</span></label>
                        <input 
                            type="text"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            className="w-full px-5 py-3.5 rounded-full border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 placeholder:text-slate-300 text-sm transition-all"
                            placeholder="Beauty website"
                        />
                    </div>
                    <div>
                        <label className="block text-slate-700 font-medium mb-2 text-sm">Target Audience</label>
                        <input 
                            type="text"
                            value={audience}
                            onChange={(e) => setAudience(e.target.value)}
                            className="w-full px-5 py-3.5 rounded-full border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 placeholder:text-slate-300 text-sm transition-all"
                            placeholder="e.g., Small business owners"
                        />
                    </div>
                    <div>
                        <label className="block text-slate-700 font-medium mb-2 text-sm">Value Proposition <span className="text-red-500">*</span></label>
                        <textarea 
                            value={valueProp}
                            onChange={(e) => setValueProp(e.target.value)}
                            className="w-full h-32 p-5 rounded-3xl border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 resize-none placeholder:text-slate-300 text-sm leading-relaxed transition-all"
                            placeholder="What's the main benefit?"
                        />
                    </div>
                     <div>
                        <label className="block text-slate-700 font-medium mb-2 text-sm">Tone</label>
                        <input 
                            type="text"
                            value={tone}
                            onChange={(e) => setTone(e.target.value)}
                            className="w-full px-5 py-3.5 rounded-full border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 placeholder:text-slate-300 text-sm transition-all"
                            placeholder="e.g. Luxurious, Minimalist"
                        />
                    </div>
                    <button 
                        onClick={handleGenerate}
                        disabled={isGenerating || !productName || !valueProp}
                        className={`w-full py-4 rounded-full text-white font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 ${
                            isGenerating || !productName || !valueProp ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'
                        }`}
                        style={{ backgroundColor: '#c2410c' }} 
                    >
                        {isGenerating ? (
                            <>
                                <RefreshCw className="animate-spin" size={20} /> Generating Website...
                            </>
                        ) : (
                            <>
                                <Sparkles size={20} /> Generate Website
                            </>
                        )}
                    </button>
                </div>
            ) : (
                /* EDIT MODE FORM */
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[800px]">
                    <div className="p-4 bg-slate-50 border-b border-slate-100">
                         <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                <Edit3 size={16} /> Site Editor
                            </h3>
                            <span className="text-xs text-slate-400">Auto-saving</span>
                         </div>
                         {/* Page Switcher */}
                         <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
                             {(['home', 'about', 'contact'] as const).map(p => (
                                 <button
                                    key={p}
                                    onClick={() => setActivePage(p)}
                                    className={`flex-1 py-1.5 text-xs font-medium rounded-md capitalize transition-all ${activePage === p ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                 >
                                     {p}
                                 </button>
                             ))}
                         </div>
                     </div>

                     <div className="overflow-y-auto custom-scrollbar flex-1">
                        {websiteData && (
                            <>
                                {/* Dynamic Content Editor based on Active Page */}
                                {activePage === 'home' && (
                                    <>
                                        <EditorSection title="Hero Section" id="hero">
                                            <div>
                                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Headline</label>
                                                <textarea 
                                                    value={websiteData.pages.home.hero_headline}
                                                    onChange={(e) => updatePageContent('home', 'hero_headline', e.target.value)}
                                                    className="w-full p-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-orange-400 min-h-[60px]"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Subheadline</label>
                                                <textarea 
                                                    value={websiteData.pages.home.hero_subheadline}
                                                    onChange={(e) => updatePageContent('home', 'hero_subheadline', e.target.value)}
                                                    className="w-full p-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-orange-400 min-h-[80px]"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">CTA Text</label>
                                                <input 
                                                    value={websiteData.pages.home.hero_cta}
                                                    onChange={(e) => updatePageContent('home', 'hero_cta', e.target.value)}
                                                    className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                                                />
                                            </div>
                                        </EditorSection>
                                        <EditorSection title="Features" id="features">
                                            <div>
                                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Title</label>
                                                <input 
                                                    value={websiteData.pages.home.features_title}
                                                    onChange={(e) => updatePageContent('home', 'features_title', e.target.value)}
                                                    className="w-full p-2 border border-slate-200 rounded-lg text-sm mb-4"
                                                />
                                            </div>
                                            {websiteData.pages.home.features.map((f, i) => (
                                                <div key={i} className="mb-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                                                    <input 
                                                        value={f.title}
                                                        onChange={(e) => {
                                                            const newFeatures = [...websiteData.pages.home.features];
                                                            newFeatures[i].title = e.target.value;
                                                            updatePageContent('home', 'features', newFeatures);
                                                        }}
                                                        className="w-full p-2 border border-slate-200 rounded text-sm mb-2 font-medium"
                                                        placeholder="Feature Title"
                                                    />
                                                    <input 
                                                        value={f.description}
                                                        onChange={(e) => {
                                                            const newFeatures = [...websiteData.pages.home.features];
                                                            newFeatures[i].description = e.target.value;
                                                            updatePageContent('home', 'features', newFeatures);
                                                        }}
                                                        className="w-full p-2 border border-slate-200 rounded text-sm text-slate-500"
                                                        placeholder="Description"
                                                    />
                                                </div>
                                            ))}
                                        </EditorSection>
                                    </>
                                )}

                                {activePage === 'about' && (
                                    <>
                                        <EditorSection title="Hero Section" id="hero">
                                            <input 
                                                value={websiteData.pages.about.hero_headline}
                                                onChange={(e) => updatePageContent('about', 'hero_headline', e.target.value)}
                                                className="w-full p-2 border border-slate-200 rounded-lg text-sm mb-2"
                                            />
                                            <input 
                                                value={websiteData.pages.about.hero_subheadline}
                                                onChange={(e) => updatePageContent('about', 'hero_subheadline', e.target.value)}
                                                className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                                            />
                                        </EditorSection>
                                        <EditorSection title="Our Story" id="story">
                                            <input 
                                                value={websiteData.pages.about.story_title}
                                                onChange={(e) => updatePageContent('about', 'story_title', e.target.value)}
                                                className="w-full p-2 border border-slate-200 rounded-lg text-sm mb-2 font-bold"
                                            />
                                            <textarea 
                                                value={websiteData.pages.about.story_content}
                                                onChange={(e) => updatePageContent('about', 'story_content', e.target.value)}
                                                className="w-full p-2 border border-slate-200 rounded-lg text-sm h-32"
                                            />
                                        </EditorSection>
                                    </>
                                )}

                                {activePage === 'contact' && (
                                    <>
                                        <EditorSection title="Hero Section" id="hero">
                                            <input 
                                                value={websiteData.pages.contact.hero_headline}
                                                onChange={(e) => updatePageContent('contact', 'hero_headline', e.target.value)}
                                                className="w-full p-2 border border-slate-200 rounded-lg text-sm mb-2"
                                            />
                                            <input 
                                                value={websiteData.pages.contact.hero_subheadline}
                                                onChange={(e) => updatePageContent('contact', 'hero_subheadline', e.target.value)}
                                                className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                                            />
                                        </EditorSection>
                                        <EditorSection title="Contact Info" id="info">
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Display Email</label>
                                            <input 
                                                value={websiteData.pages.contact.email}
                                                onChange={(e) => updatePageContent('contact', 'email', e.target.value)}
                                                className="w-full p-2 border border-slate-200 rounded-lg text-sm mb-2"
                                                placeholder="Email"
                                            />
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Form Recipient Email</label>
                                            <input 
                                                value={websiteData.pages.contact.form_email}
                                                onChange={(e) => updatePageContent('contact', 'form_email', e.target.value)}
                                                className="w-full p-2 border border-slate-200 rounded-lg text-sm mb-2 text-blue-600"
                                                placeholder="where.forms.go@email.com"
                                            />
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Phone</label>
                                            <input 
                                                value={websiteData.pages.contact.phone}
                                                onChange={(e) => updatePageContent('contact', 'phone', e.target.value)}
                                                className="w-full p-2 border border-slate-200 rounded-lg text-sm mb-2"
                                                placeholder="Phone"
                                            />
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Address</label>
                                            <input 
                                                value={websiteData.pages.contact.address}
                                                onChange={(e) => updatePageContent('contact', 'address', e.target.value)}
                                                className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                                                placeholder="Address"
                                            />
                                        </EditorSection>
                                    </>
                                )}
                            </>
                        )}
                     </div>

                     <div className="p-4 bg-white border-t border-slate-100">
                        <button 
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="w-full py-3 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                        >
                             <RefreshCw size={16} className={isGenerating ? "animate-spin" : ""} /> Regenerate Site
                        </button>
                     </div>
                </div>
            )}
        </div>

        {/* Right Column: Preview */}
        <div className="lg:col-span-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 flex flex-col min-h-[800px]">
            <div className="flex items-center gap-2 mb-6 text-slate-800 font-medium justify-between">
                <div className="flex items-center gap-2">
                    <Globe size={18} /> Live Site Preview
                </div>
                {websiteData && (
                    <div className="flex gap-3">
                         <button 
                            onClick={handleSaveToLibrary}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-4 py-2 rounded-full border border-orange-200 text-orange-700 text-xs font-medium hover:bg-orange-50 transition-colors"
                         >
                            {isSaving ? <Check size={14} /> : <Save size={14} />} {isSaving ? 'Saved' : 'Save'}
                         </button>
                         <button 
                            onClick={handleExportHTML}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white shadow-sm text-xs font-medium hover:bg-slate-800 transition-colors"
                        >
                            <Download size={14} /> Export Website
                        </button>
                    </div>
                )}
            </div>

            {/* Mockup Container */}
            <div className="flex-1 bg-slate-100 rounded-lg overflow-hidden relative group border-[8px] border-slate-900 shadow-2xl flex flex-col">
                 
                 {/* Browser Bar Mockup */}
                 <div className="bg-slate-900 px-4 py-2 flex items-center gap-2">
                     <div className="flex gap-1.5">
                         <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                         <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                         <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                     </div>
                     <div className="flex-1 bg-slate-800 rounded mx-4 h-6 flex items-center px-3 text-[10px] text-slate-400 font-mono overflow-hidden whitespace-nowrap">
                         {websiteData ? `https://${productName.toLowerCase().replace(/\s+/g, '')}.com/${activePage}` : 'https://...'}
                     </div>
                 </div>

                 {/* Content */}
                 <div className="bg-white flex-1 overflow-y-auto custom-scrollbar relative">
                     
                     {websiteData ? (
                         <div className="animate-in fade-in duration-700 flex flex-col min-h-full">
                             {/* Nav */}
                             <nav className="flex items-center justify-between px-8 py-6 sticky top-0 bg-white/95 backdrop-blur-sm z-30 border-b border-slate-50/50">
                                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActivePage('home')}>
                                    <div className="w-8 h-8 rounded-full border border-[#ea580c] flex items-center justify-center">
                                        <span className="text-[#ea580c] font-serif text-lg">{productName.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <div className="leading-tight">
                                        <span className="block text-[#ea580c] font-serif text-xs uppercase tracking-widest font-bold">{productName}</span>
                                    </div>
                                </div>
                                <div className="hidden md:flex items-center gap-8 text-[10px] font-medium tracking-widest text-slate-500 uppercase">
                                    <button onClick={() => setActivePage('home')} className={`hover:text-[#ea580c] transition-colors ${activePage === 'home' ? 'text-[#ea580c]' : ''}`}>Home</button>
                                    <button onClick={() => setActivePage('about')} className={`hover:text-[#ea580c] transition-colors ${activePage === 'about' ? 'text-[#ea580c]' : ''}`}>About</button>
                                    <button onClick={() => setActivePage('contact')} className={`hover:text-[#ea580c] transition-colors ${activePage === 'contact' ? 'text-[#ea580c]' : ''}`}>Contact</button>
                                </div>
                                <div className="flex items-center gap-4 text-slate-400">
                                     <button 
                                        onClick={() => setActivePage('contact')}
                                        className="hidden md:block px-4 py-1.5 bg-[#ea580c] text-white text-[10px] font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
                                     >
                                         Get Started
                                     </button>
                                     <Menu size={18} className="md:hidden text-slate-900" />
                                </div>
                             </nav>

                             {/* MAIN CONTENT AREA */}
                             <div className="flex-grow">
                                {activePage === 'home' && (
                                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="relative h-[500px] w-full bg-stone-100 overflow-hidden group/hero">
                                            <img src={images.hero} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center px-12 text-white pt-10">
                                                <h2 className="font-serif text-5xl max-w-lg mb-6 leading-tight">{websiteData.pages.home.hero_headline}</h2>
                                                <p className="text-base opacity-90 max-w-md mb-10 leading-relaxed font-light">
                                                    {websiteData.pages.home.hero_subheadline}
                                                </p>
                                                <div className="flex gap-4">
                                                    <button onClick={() => setActivePage('about')} className="px-8 py-3 bg-white text-stone-900 text-xs uppercase tracking-widest hover:bg-stone-100 transition-colors w-fit font-bold">
                                                        {websiteData.pages.home.hero_cta}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="py-20 px-8 text-center bg-white">
                                            <h3 className="font-serif text-3xl text-slate-900 mb-4">{websiteData.pages.home.features_title}</h3>
                                            <div className="w-16 h-1 bg-[#ea580c] mx-auto mb-16 rounded-full"></div>
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
                                                {websiteData.pages.home.features.map((feature, i) => (
                                                    <div key={i} className="group cursor-pointer text-left">
                                                        <div className="aspect-[3/4] bg-stone-50 mb-5 overflow-hidden relative">
                                                            <img src={`${images.featureBase}&random=${i}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                                        </div>
                                                        <h4 className="font-serif text-lg text-slate-900 mb-2 font-bold">{feature.title}</h4>
                                                        <p className="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed">{feature.description}</p>
                                                        <p className="text-sm font-bold text-[#ea580c] mb-4">{feature.price}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activePage === 'about' && (
                                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="bg-[#fcfbf7] py-20 px-12">
                                            <div className="max-w-2xl mx-auto text-center mb-12">
                                                <h1 className="text-4xl font-serif font-bold text-slate-900 mb-4">{websiteData.pages.about.hero_headline}</h1>
                                                <p className="text-slate-500">{websiteData.pages.about.hero_subheadline}</p>
                                            </div>
                                            <div className="flex flex-col md:flex-row gap-12 items-center">
                                                <img src={images.about} className="w-full md:w-1/2 rounded-lg shadow-lg" />
                                                <div className="flex-1">
                                                    <h2 className="text-2xl font-serif font-bold mb-4">{websiteData.pages.about.story_title}</h2>
                                                    <p className="text-slate-600 whitespace-pre-line leading-relaxed text-sm">{websiteData.pages.about.story_content}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="py-20 px-12 bg-white">
                                            <h2 className="text-3xl font-serif font-bold text-center mb-12">{websiteData.pages.about.team_title}</h2>
                                            <div className="grid grid-cols-3 gap-8">
                                                {websiteData.pages.about.team_members.map((m, i) => (
                                                    <div key={i} className="text-center">
                                                        <div className="w-24 h-24 bg-slate-100 rounded-full mx-auto mb-4 overflow-hidden">
                                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} className="w-full h-full object-cover" />
                                                        </div>
                                                        <h3 className="font-bold text-slate-900">{m.name}</h3>
                                                        <p className="text-xs text-slate-500 uppercase">{m.role}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activePage === 'contact' && (
                                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="bg-slate-900 text-white py-20 px-12 text-center">
                                            <h1 className="text-4xl font-serif font-bold mb-4">{websiteData.pages.contact.hero_headline}</h1>
                                            <p className="text-slate-400">{websiteData.pages.contact.hero_subheadline}</p>
                                        </div>
                                        <div className="py-20 px-12 grid grid-cols-1 md:grid-cols-2 gap-16 max-w-5xl mx-auto">
                                            <div className="space-y-8">
                                                <div>
                                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Email</h3>
                                                    <p className="text-lg font-medium text-slate-900">{websiteData.pages.contact.email}</p>
                                                </div>
                                                <div>
                                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Phone</h3>
                                                    <p className="text-lg font-medium text-slate-900">{websiteData.pages.contact.phone}</p>
                                                </div>
                                                <div>
                                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Address</h3>
                                                    <p className="text-lg font-medium text-slate-900">{websiteData.pages.contact.address}</p>
                                                </div>
                                            </div>
                                            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 -mt-32 relative z-10">
                                                <h3 className="text-xl font-bold mb-6">{websiteData.pages.contact.form_title}</h3>
                                                
                                                {/* Interactive Preview Form */}
                                                {previewFormState === 'success' ? (
                                                    <div className="text-center py-12 animate-in fade-in zoom-in-95">
                                                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                                            <Check size={32} />
                                                        </div>
                                                        <h4 className="text-lg font-bold text-slate-800 mb-2">Message Sent!</h4>
                                                        <p className="text-slate-500 text-sm mb-6">Thanks for reaching out. We'll be in touch soon.</p>
                                                        <button 
                                                            onClick={() => setPreviewFormState('idle')}
                                                            className="text-xs font-bold uppercase tracking-widest text-[#ea580c] hover:underline"
                                                        >
                                                            Send another
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <form className="space-y-4" onSubmit={handlePreviewSubmit}>
                                                        <input required placeholder="Name" className="w-full p-3 bg-slate-50 rounded-lg text-sm border border-transparent focus:bg-white focus:border-slate-200 outline-none transition-all" />
                                                        <input required type="email" placeholder="Email" className="w-full p-3 bg-slate-50 rounded-lg text-sm border border-transparent focus:bg-white focus:border-slate-200 outline-none transition-all" />
                                                        <textarea required placeholder="Message" className="w-full p-3 bg-slate-50 rounded-lg text-sm h-32 border border-transparent focus:bg-white focus:border-slate-200 outline-none transition-all"></textarea>
                                                        <button 
                                                            type="submit" 
                                                            disabled={previewFormState === 'submitting'}
                                                            className="w-full py-3 bg-[#ea580c] text-white font-bold rounded-lg text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                                                        >
                                                            {previewFormState === 'submitting' ? (
                                                                <>
                                                                    <Loader2 size={16} className="animate-spin" /> Sending...
                                                                </>
                                                            ) : (
                                                                'Send Message'
                                                            )}
                                                        </button>
                                                    </form>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                             </div>

                             {/* Footer */}
                             <div className="bg-slate-900 text-slate-400 py-16 px-8 text-xs mt-auto">
                                 <div className="text-center opacity-60">
                                     {websiteData.global.footerText}
                                 </div>
                             </div>

                         </div>
                     ) : (
                         <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-slate-50/50">
                             {isGenerating ? (
                                 <div className="flex flex-col items-center">
                                     <div className="w-12 h-12 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin mb-4"></div>
                                     <p className="text-slate-500 font-medium">Building your multi-page website...</p>
                                 </div>
                             ) : (
                                 <>
                                     <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                                         <LayoutTemplate size={32} />
                                     </div>
                                     <h3 className="text-slate-400 font-medium text-lg mb-2">Ready to Build</h3>
                                     <p className="text-slate-400/80 text-sm max-w-xs">
                                         Enter your product details on the left and click Generate to see your full custom website.
                                     </p>
                                 </>
                             )}
                         </div>
                     )}

                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};