import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Video, Sparkles, Download, RefreshCw, Play, Pause, Zap, Share2, Image as ImageIcon, Type, Upload, X, Mic, Volume2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface VideoGeneratorProps {
  onBack: () => void;
  primaryColor?: string;
}

const VOICE_OPTIONS = [
    { name: 'Professional Male', id: 'Fenrir' },
    { name: 'Professional Female', id: 'Kore' },
    { name: 'Casual Male', id: 'Puck' },
    { name: 'Casual Female', id: 'Charon' },
];

export const VideoGenerator: React.FC<VideoGeneratorProps> = ({ onBack, primaryColor = '#ea580c' }) => {
  // Mode: Text-to-Video or Image-to-Video
  const [mode, setMode] = useState<'text' | 'image'>('text');
  
  // Inputs
  const [prompt, setPrompt] = useState('A cinematic drone shot of a futuristic city with neon lights and flying cars');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio / TTS Settings
  const [addVoiceover, setAddVoiceover] = useState(false);
  const [voiceScript, setVoiceScript] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('Fenrir');

  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');
  
  // Outputs
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  // Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Refs for sync
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Clean up ObjectURLs on unmount
  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [videoUrl, audioUrl]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setUploadedImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
      setUploadedImage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    if (mode === 'image' && !uploadedImage) return;

    setIsGenerating(true);
    setGenerationStatus('Initializing AI models...');
    setVideoUrl(null);
    setAudioUrl(null);
    setIsPlaying(false);

    // Create instance fresh to get latest key if changed
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        // --- 1. Generate Video (Veo) ---
        setGenerationStatus('Generating video (this may take a moment)...');
        
        let videoOperation;
        
        // Handle Image-to-Video vs Text-to-Video
        if (mode === 'image' && uploadedImage) {
            const base64Image = uploadedImage.split(',')[1];
            const mimeType = uploadedImage.match(/:(.*?);/)?.[1] || 'image/png';

            videoOperation = await ai.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt: prompt,
                image: {
                    imageBytes: base64Image,
                    mimeType: mimeType
                },
                config: {
                    numberOfVideos: 1,
                    resolution: '720p',
                    aspectRatio: '16:9'
                }
            });
        } else {
            videoOperation = await ai.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt: prompt,
                config: {
                    numberOfVideos: 1,
                    resolution: '720p',
                    aspectRatio: '16:9'
                }
            });
        }

        // Poll for completion
        let videoUri = '';
        while (true) {
            if (videoOperation.done) {
                videoUri = videoOperation.response?.generatedVideos?.[0]?.video?.uri || '';
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 3000)); // Poll every 3s
            videoOperation = await ai.operations.getVideosOperation({ operation: videoOperation });
        }

        if (!videoUri) throw new Error("Video generation returned no URI");

        // Fetch the video content securely
        const videoRes = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
        
        // Critical Fix: Check if fetch was successful. 
        // If the key is invalid for this resource, it might return 404 or 403 here even if generation 'succeeded' in initiating.
        if (!videoRes.ok) {
            const errText = await videoRes.text().catch(() => '');
            throw new Error(`Failed to download video: ${videoRes.status} ${errText}`);
        }

        const videoBlob = await videoRes.blob();
        const vUrl = URL.createObjectURL(videoBlob);
        setVideoUrl(vUrl);


        // --- 2. Generate Audio (TTS) if enabled ---
        if (addVoiceover && voiceScript) {
            setGenerationStatus('Generating voiceover...');
            const audioResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash-preview-tts',
                contents: { parts: [{ text: voiceScript }] },
                config: {
                    responseModalities: ['AUDIO'],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: selectedVoice }
                        }
                    }
                }
            });

            const base64Audio = audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
                const binaryString = atob(base64Audio);
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                const audioBlob = new Blob([bytes], { type: 'audio/wav' });
                const aUrl = URL.createObjectURL(audioBlob);
                setAudioUrl(aUrl);
            }
        }

    } catch (error: any) {
        console.error("Video/Audio Generation Error:", error);
        
        const errorMessage = error.message || error.toString();
        // Handle Veo 404 / Key Selection
        const isNotFound = errorMessage.includes("404") || errorMessage.includes("not found");
        
        if (isNotFound) {
             if ((window as any).aistudio && (window as any).aistudio.openSelectKey) {
                 alert("Veo video generation requires a specific paid API key project. Please select a valid project in the dialog that appears.");
                 try {
                    await (window as any).aistudio.openSelectKey();
                    setGenerationStatus('API Key updated. Please try generating again.');
                    setIsGenerating(false);
                    return;
                 } catch (keyErr) {
                    console.error("Key selection error", keyErr);
                 }
             }
        }
        
        alert(`Generation failed: ${errorMessage}`);
    } finally {
        setIsGenerating(false);
        if (!generationStatus.includes('Key updated')) {
            setGenerationStatus('');
        }
    }
  };

  const togglePlay = async () => {
    if (videoRef.current) {
        if (isPlaying) {
            videoRef.current.pause();
            if (audioRef.current) audioRef.current.pause();
            setIsPlaying(false);
        } else {
            // Optimistic update
            setIsPlaying(true);
            try {
                await videoRef.current.play();
                if (audioRef.current) {
                    audioRef.current.currentTime = 0;
                    await audioRef.current.play();
                }
            } catch (err) {
                console.error("Playback interrupted or failed:", err);
                setIsPlaying(false);
            }
        }
    }
  };

  // Sync video end to stop state
  const handleVideoEnded = () => {
      setIsPlaying(false);
      if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
      }
  };

  const handleDownload = () => {
    if (videoUrl) {
        const link = document.createElement('a');
        link.href = videoUrl;
        link.download = `sirz-video-${Date.now()}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    // Note: merging audio/video client-side without ffmpeg.wasm is complex. 
    // For this demo, we download the video. Ideally, we'd zip them or use a backend.
    if (audioUrl) {
        setTimeout(() => {
            const link = document.createElement('a');
            link.href = audioUrl;
            link.download = `sirz-voiceover-${Date.now()}.wav`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }, 500);
    }
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
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Video Generator</h1>
          <p className="text-slate-500">Create AI videos from text or images with custom voiceovers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Controls */}
        <div className="space-y-6">
            
            {/* Mode Switcher */}
             <div className="bg-slate-100/50 p-1.5 rounded-xl flex gap-1 border border-slate-200">
                <button
                onClick={() => setMode('text')}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                    mode === 'text' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
                >
                    <Type size={16} /> Text to Video
                </button>
                <button
                onClick={() => setMode('image')}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                    mode === 'image' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
                >
                    <ImageIcon size={16} /> Image to Video
                </button>
            </div>

            {/* Input Section */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                
                {mode === 'image' && (
                     <div className="mb-4">
                        <label className="block text-slate-700 font-medium mb-3">Reference Image</label>
                        {uploadedImage ? (
                            <div className="relative rounded-xl overflow-hidden border border-slate-200">
                                <img src={uploadedImage} alt="Reference" className="w-full h-48 object-cover" />
                                <button 
                                    onClick={clearImage}
                                    className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-slate-500 hover:text-red-500 shadow-sm"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition-colors"
                            >
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-3">
                                    <Upload size={24} />
                                </div>
                                <p className="text-sm font-medium text-slate-600">Upload an image</p>
                                <p className="text-xs text-slate-400">to bring to life</p>
                            </div>
                        )}
                     </div>
                )}

                <div>
                    <label className="block text-slate-700 font-medium mb-2">
                        {mode === 'image' ? 'What should happen in the video?' : 'Describe the video'}
                    </label>
                    <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full h-28 p-4 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 resize-none placeholder:text-slate-400 text-sm leading-relaxed"
                        placeholder={mode === 'image' ? "E.g., The camera pans around the building, cinematic lighting" : "E.g., A cyberpunk city street in the rain, neon signs reflecting in puddles"}
                    />
                </div>
            </div>

            {/* Audio Settings */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                 <div className="flex items-center justify-between mb-4">
                    <label className="flex items-center gap-2 text-slate-700 font-medium cursor-pointer">
                        <Mic size={18} className="text-slate-400" />
                        Add AI Voiceover
                    </label>
                    <button 
                        onClick={() => setAddVoiceover(!addVoiceover)}
                        className={`w-11 h-6 rounded-full transition-colors relative ${addVoiceover ? 'bg-orange-500' : 'bg-slate-200'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${addVoiceover ? 'left-6' : 'left-1'}`} />
                    </button>
                 </div>

                 {addVoiceover && (
                     <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                         <div>
                            <label className="block text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Script</label>
                            <textarea 
                                value={voiceScript}
                                onChange={(e) => setVoiceScript(e.target.value)}
                                className="w-full h-24 p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-orange-300"
                                placeholder="Type what you want the voice to say..."
                            />
                         </div>
                         <div>
                             <label className="block text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Voice</label>
                             <div className="grid grid-cols-2 gap-2">
                                 {VOICE_OPTIONS.map(v => (
                                     <button
                                        key={v.id}
                                        onClick={() => setSelectedVoice(v.id)}
                                        className={`px-3 py-2 rounded-lg text-xs font-medium border text-left flex items-center justify-between ${
                                            selectedVoice === v.id 
                                            ? 'border-orange-500 bg-orange-50 text-orange-700' 
                                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                     >
                                         {v.name}
                                         {selectedVoice === v.id && <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
                                     </button>
                                 ))}
                             </div>
                         </div>
                     </div>
                 )}
            </div>

            {/* Generate Button */}
            <button 
                onClick={handleGenerate}
                disabled={isGenerating || !prompt || (mode === 'image' && !uploadedImage)}
                className={`w-full py-4 rounded-full text-white font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 ${
                    isGenerating ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'
                }`}
                style={{ backgroundColor: '#c2410c' }}
            >
                {isGenerating ? (
                    <>
                         <RefreshCw className="animate-spin" size={20} /> {generationStatus || 'Generating...'}
                    </>
                ) : (
                    <>
                        <Sparkles size={20} /> Generate Video
                    </>
                )}
            </button>

            {/* Note */}
            <div className="bg-orange-50/50 p-4 rounded-xl flex gap-3">
                <Zap size={20} className="text-orange-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 leading-relaxed">
                    <span className="font-semibold text-slate-800">Note:</span> Video generation takes about 30-60 seconds. {addVoiceover && 'Voiceover will be generated and synced automatically.'}
                </p>
            </div>
        </div>

        {/* Right Column - Preview */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col h-full min-h-[740px]">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 text-slate-800 font-medium">
                    <Video size={18} /> Video Preview
                </div>
                {videoUrl && (
                    <div className="flex gap-2 relative">
                        <button 
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-slate-100"
                            onClick={handleDownload}
                            title="Download"
                        >
                            <Download size={18} />
                        </button>
                    </div>
                )}
            </div>

            {videoUrl ? (
                <div className="flex-1 flex flex-col">
                    <div className="relative rounded-2xl overflow-hidden aspect-video bg-black group mb-6 shadow-xl">
                        <video 
                            ref={videoRef}
                            src={videoUrl}
                            className="w-full h-full object-contain"
                            playsInline
                            onEnded={handleVideoEnded}
                        />
                        {/* Hidden Audio Player for Sync */}
                        {audioUrl && (
                            <audio ref={audioRef} src={audioUrl} />
                        )}
                        
                        {/* Play/Pause Overlay */}
                        <div className={`absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/10 transition-colors ${isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
                            <button 
                                onClick={togglePlay}
                                className="w-16 h-16 rounded-full bg-[#c2410c] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                            >
                                {isPlaying ? (
                                    <Pause size={24} fill="currentColor" />
                                ) : (
                                    <Play size={24} fill="currentColor" className="ml-1" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="bg-slate-50 rounded-2xl p-6 grid grid-cols-2 gap-y-6">
                        <div>
                            <span className="block text-xs text-slate-400 font-medium mb-1">Mode</span>
                            <span className="text-slate-800 font-medium text-sm">{mode === 'text' ? 'Text to Video' : 'Image to Video'}</span>
                        </div>
                        <div>
                            <span className="block text-xs text-slate-400 font-medium mb-1">Audio</span>
                            <div className="flex items-center gap-2">
                                {audioUrl ? (
                                    <>
                                        <Volume2 size={14} className="text-green-600" />
                                        <span className="text-slate-800 font-medium text-sm">Generated ({selectedVoice})</span>
                                    </>
                                ) : (
                                    <span className="text-slate-400 text-sm">Silent</span>
                                )}
                            </div>
                        </div>
                        <div className="col-span-2">
                             <span className="block text-xs text-slate-400 font-medium mb-1">Prompt</span>
                             <p className="text-slate-800 text-sm line-clamp-3">{prompt}</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    {isGenerating ? (
                        <div className="flex flex-col items-center">
                             <div className="w-16 h-16 relative mb-6">
                                <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
                                <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
                             </div>
                             <h3 className="text-slate-600 font-medium mb-1">Dreaming up your video...</h3>
                             <p className="text-slate-400 text-sm">{generationStatus}</p>
                        </div>
                    ) : (
                        <>
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 text-slate-300 shadow-sm">
                                <Video size={32} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-slate-400 font-medium mb-1">Your generated video will appear here</h3>
                            <p className="text-slate-400/70 text-sm">Select a mode, fill details, and click Generate</p>
                        </>
                    )}
                </div>
            )}
        </div>

      </div>
    </div>
  );
};