import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Music, Sparkles, Download, RefreshCw, Play, Volume2, Pause, Share2, Mic, StopCircle, Type, X, Video, Instagram, Facebook, Linkedin } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface AudioGeneratorProps {
  onBack: () => void;
  primaryColor?: string;
}

// Valid voice names for Gemini 2.5 Flash TTS
const VOICE_MAP: Record<string, string> = {
    'Professional Male': 'Fenrir',
    'Professional Female': 'Kore',
    'Casual Male': 'Puck',
    'Casual Female': 'Charon',
    'Energetic': 'Zephyr',
    'Calm & Soothing': 'Kore'
};

export const AudioGenerator: React.FC<AudioGeneratorProps> = ({ onBack, primaryColor = '#ea580c' }) => {
  const [mode, setMode] = useState<'text' | 'voice'>('text');
  
  // Text Mode State
  const [script, setScript] = useState("Welcome to our product demo. Today we'll show you how to use Moss beauty products for effective skin care.");
  
  // Voice Mode State
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Shared Config
  const [voiceStyle, setVoiceStyle] = useState('Professional Male');
  
  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudioBuffer, setGeneratedAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  
  // Audio Context Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const voiceStyles = ['Professional Male', 'Professional Female', 'Casual Male', 'Casual Female', 'Energetic', 'Calm & Soothing'];

  // Initialize AudioContext
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  // --- Recording Logic ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(blob);
        // Clear generated audio when new recording is made
        setGeneratedAudioBuffer(null);
        stopPlayback();
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please allow permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const clearRecording = () => {
      setRecordedBlob(null);
      setGeneratedAudioBuffer(null);
  };

  // --- Helpers for PCM Audio ---
  const base64ToUint8Array = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext) => {
      // The API returns raw PCM 16-bit, 24kHz, Mono (usually)
      // We need to convert Int16 to Float32 for the AudioBuffer
      const int16Data = new Int16Array(data.buffer);
      const float32Data = new Float32Array(int16Data.length);
      
      for (let i = 0; i < int16Data.length; i++) {
          float32Data[i] = int16Data[i] / 32768.0;
      }

      const buffer = ctx.createBuffer(1, float32Data.length, 24000);
      buffer.copyToChannel(float32Data, 0);
      return buffer;
  };

  // --- Generation Logic ---
  const handleGenerate = async () => {
    if (mode === 'text' && !script) return;
    if (mode === 'voice' && !recordedBlob) return;

    setIsGenerating(true);
    stopPlayback();
    setGeneratedAudioBuffer(null);
    setShowShareMenu(false);

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let base64Output: string | undefined;

    try {
        if (mode === 'text') {
             const voiceName = VOICE_MAP[voiceStyle] || 'Kore';
             const result = await ai.models.generateContent({
                model: 'gemini-2.5-flash-preview-tts',
                contents: { parts: [{ text: script }] },
                config: {
                    responseModalities: ['AUDIO'],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName } }
                    }
                }
            });
            base64Output = result.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        } else if (mode === 'voice' && recordedBlob) {
            const base64Input = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
                reader.readAsDataURL(recordedBlob);
            });

            // Step 1: Transcribe the audio using a multimodal model (Gemini 2.0 Flash Exp)
            // This model supports audio input but we just want text output here.
            const transcriptionResult = await ai.models.generateContent({
                model: 'gemini-2.0-flash-exp',
                contents: { parts: [
                    { inlineData: { mimeType: recordedBlob.type || 'audio/webm', data: base64Input } },
                    { text: "Transcribe the spoken content of this audio exactly. Do not add any descriptions or preamble." }
                ]}
            });

            const transcribedText = transcriptionResult.text;
            if (!transcribedText) {
                throw new Error("Could not transcribe audio input.");
            }

            // Step 2: Generate new audio from the transcript using the TTS model
            const voiceName = VOICE_MAP[voiceStyle] || 'Kore';
            const ttsResult = await ai.models.generateContent({
                model: 'gemini-2.5-flash-preview-tts',
                contents: { parts: [{ text: transcribedText }] },
                config: {
                    responseModalities: ['AUDIO'],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName } }
                    }
                }
            });
            base64Output = ttsResult.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        }

        if (base64Output && audioContextRef.current) {
            const rawBytes = base64ToUint8Array(base64Output);
            const audioBuffer = await decodeAudioData(rawBytes, audioContextRef.current);
            setGeneratedAudioBuffer(audioBuffer);
        }

    } catch (e: any) {
        console.error(e);
        // Check for common error messages to provide better feedback
        if (e.toString().includes("404") || e.toString().includes("not found")) {
            alert("The selected AI model is currently unavailable. Please try again later.");
        } else if (e.toString().includes("modality")) {
             alert("The model configuration is invalid for this request type.");
        } else {
             alert(`Generation failed: ${e.message || "Unknown error"}`);
        }
    } finally {
        setIsGenerating(false);
    }
  };

  // --- Playback Logic ---
  const playAudio = () => {
    if (!generatedAudioBuffer || !audioContextRef.current) return;

    if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = generatedAudioBuffer;
    source.connect(audioContextRef.current.destination);
    
    // Start from where we paused, or 0
    source.start(0);
    
    source.onended = () => {
        setIsPlaying(false);
    };

    sourceNodeRef.current = source;
    setIsPlaying(true);
  };

  const stopPlayback = () => {
      if (sourceNodeRef.current) {
          try {
            sourceNodeRef.current.stop();
          } catch(e) {} // ignore if already stopped
          sourceNodeRef.current = null;
      }
      setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) {
        stopPlayback();
    } else {
        playAudio();
    }
  };

  // --- WAV Conversion for Download ---
  const bufferToWav = (ab: AudioBuffer) => {
    const numOfChan = ab.numberOfChannels;
    const length = ab.length * numOfChan * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    const channels = [];
    let i;
    let sample;
    let offset = 0;
    let pos = 0;

    // write WAVE header
    setUint32(0x46464952);                         // "RIFF"
    setUint32(length - 8);                         // file length - 8
    setUint32(0x45564157);                         // "WAVE"

    setUint32(0x20746d66);                         // "fmt " chunk
    setUint32(16);                                 // length = 16
    setUint16(1);                                  // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(ab.sampleRate);
    setUint32(ab.sampleRate * 2 * numOfChan);      // avg. bytes/sec
    setUint16(numOfChan * 2);                      // block-align
    setUint16(16);                                 // 16-bit (hardcoded in this example)

    setUint32(0x61746164);                         // "data" - chunk
    setUint32(length - pos - 4);                   // chunk length

    // write interleaved data
    for(i = 0; i < ab.numberOfChannels; i++)
        channels.push(ab.getChannelData(i));

    while(pos < ab.length) {
        for(i = 0; i < numOfChan; i++) {             // interleave channels
            sample = Math.max(-1, Math.min(1, channels[i][pos])); // clamp
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767)|0; // scale to 16-bit signed int
            view.setInt16(44 + offset, sample, true);          // write 16-bit sample
            offset += 2;
        }
        pos++;
    }

    return new Blob([buffer], { type: "audio/wav" });

    function setUint16(data: any) {
        view.setUint16(pos, data, true);
        pos += 2;
    }

    function setUint32(data: any) {
        view.setUint32(pos, data, true);
        pos += 4;
    }
  };

  const handleDownload = () => {
      if (!generatedAudioBuffer) return;
      const wavBlob = bufferToWav(generatedAudioBuffer);
      const url = URL.createObjectURL(wavBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sirz-audio-${Date.now()}.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleShare = async () => {
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
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Audio Generator</h1>
          <p className="text-slate-500">Create voice-overs, music, and sound effects</p>
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
                    <Type size={16} /> Text to Speech
                </button>
                <button
                onClick={() => setMode('voice')}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                    mode === 'voice' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
                >
                    <Mic size={16} /> Voice Refinement
                </button>
            </div>

            {/* Input Area */}
            {mode === 'text' ? (
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <label className="block text-slate-700 font-medium mb-4">Script</label>
                    <textarea 
                        value={script}
                        onChange={(e) => setScript(e.target.value)}
                        className="w-full h-32 p-4 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 resize-none placeholder:text-slate-400 text-sm leading-relaxed"
                        placeholder="Enter your script here..."
                    />
                </div>
            ) : (
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center min-h-[200px]">
                    <label className="block text-slate-700 font-medium mb-4 self-start">Record Voice</label>
                    
                    {!recordedBlob ? (
                        <>
                            <button
                                onClick={isRecording ? stopRecording : startRecording}
                                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                                    isRecording 
                                    ? 'bg-red-50 text-red-500 ring-4 ring-red-100 animate-pulse' 
                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                }`}
                            >
                                {isRecording ? <StopCircle size={32} /> : <Mic size={32} />}
                            </button>
                            <p className="mt-4 text-sm text-slate-500 font-medium">
                                {isRecording ? 'Recording... Click to stop' : 'Click microphone to start recording'}
                            </p>
                        </>
                    ) : (
                        <div className="w-full">
                            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl mb-4">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-600 shadow-sm">
                                    <Music size={18} />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="text-sm font-medium text-slate-900">Recording captured</p>
                                    <p className="text-xs text-slate-500">Ready to refine</p>
                                </div>
                                <button onClick={clearRecording} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                            <p className="text-xs text-slate-400">Click Generate to refine this recording</p>
                        </div>
                    )}
                </div>
            )}

            {/* Voice Style Selector */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <label className="block text-slate-700 font-medium mb-4">Target Voice Style</label>
                <div className="grid grid-cols-2 gap-3">
                    {voiceStyles.map((style) => (
                        <button
                            key={style}
                            onClick={() => setVoiceStyle(style)}
                            className={`py-3 px-4 rounded-full text-sm font-medium transition-all border ${
                                voiceStyle === style 
                                ? 'border-[#8ba856] bg-[#f7fee7] text-[#3f6212]' 
                                : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                        >
                            {style}
                        </button>
                    ))}
                </div>
            </div>

            {/* Generate Button */}
            <button 
                onClick={handleGenerate}
                disabled={isGenerating || (mode === 'text' && !script) || (mode === 'voice' && !recordedBlob)}
                className={`w-full py-4 rounded-full text-white font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 ${
                    isGenerating || (mode === 'text' && !script) || (mode === 'voice' && !recordedBlob)
                    ? 'opacity-70 cursor-not-allowed' 
                    : 'hover:-translate-y-0.5'
                }`}
                style={{ backgroundColor: '#c2410c' }}
            >
                {isGenerating ? (
                    <>
                         <RefreshCw className="animate-spin" size={20} /> Generating...
                    </>
                ) : (
                    <>
                        <Sparkles size={20} /> {mode === 'text' ? 'Generate Speech' : 'Refine Voice'}
                    </>
                )}
            </button>
        </div>

        {/* Right Column - Preview */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col h-full min-h-[600px]">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 text-slate-800 font-medium">
                    <Music size={18} /> Audio Player
                </div>
                {generatedAudioBuffer && (
                     <div className="flex gap-2 relative">
                        <button 
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-slate-100"
                            onClick={handleDownload}
                            title="Download WAV"
                        >
                            <Download size={18} />
                        </button>
                        <button 
                            className={`p-2 hover:bg-slate-100 rounded-lg transition-colors border border-slate-100 ${showShareMenu ? 'bg-slate-100 text-slate-800' : 'text-slate-400'}`}
                            onClick={handleShare}
                            title="Share"
                        >
                            <Share2 size={18} />
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

            {generatedAudioBuffer ? (
                <div className="bg-slate-50 rounded-3xl p-8 flex-1 flex flex-col items-center justify-center relative overflow-hidden">
                    
                    {/* Visualizer Simulation (Animated when playing) */}
                    <div className="flex items-center justify-center gap-1 h-32 w-full mb-12 px-8">
                        {Array.from({ length: 40 }).map((_, i) => {
                            // Pseudo-random heights that animate if playing
                            const baseHeight = Math.max(20, Math.random() * 80);
                            const activeHeight = isPlaying ? Math.max(20, Math.random() * 100) : baseHeight;
                            
                            return (
                                <div 
                                    key={i} 
                                    className="w-1.5 bg-[#c2410c] rounded-full transition-all duration-100 ease-in-out"
                                    style={{ 
                                        height: `${activeHeight}%`,
                                        opacity: Math.random() > 0.5 ? 1 : 0.7
                                    }}
                                />
                            );
                        })}
                    </div>

                    {/* Controls */}
                    <div className="w-full max-w-md space-y-6">
                        
                        {/* Play Button */}
                        <div className="flex justify-center">
                            <button 
                                onClick={togglePlay}
                                className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-105 transition-transform"
                                style={{ backgroundColor: '#c2410c' }}
                            >
                                {isPlaying ? (
                                    <Pause size={24} fill="currentColor" />
                                ) : (
                                    <Play size={24} fill="currentColor" className="ml-1" />
                                )}
                            </button>
                        </div>

                        {/* Progress Bar (Visual Only for now as strict sync with AudioBufferSourceNode is complex) */}
                        <div className="space-y-2">
                             <div className="h-1.5 bg-slate-200 rounded-full w-full overflow-hidden">
                                 <div className={`h-full bg-[#c2410c] rounded-full transition-all duration-300 ${isPlaying ? 'w-full duration-[30s]' : 'w-0'}`} />
                             </div>
                             <div className="flex justify-between text-xs text-slate-400 font-medium font-mono">
                                 <span>{isPlaying ? 'Playing' : 'Ready'}</span>
                                 <span>{generatedAudioBuffer.duration.toFixed(1)}s</span>
                             </div>
                        </div>

                        {/* Volume Icon */}
                        <div className="flex justify-center text-slate-400">
                             <Volume2 size={20} />
                        </div>
                    </div>

                    {/* Metadata Card */}
                    <div className="absolute bottom-6 left-6 right-6 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="grid grid-cols-2 gap-y-4">
                            <div>
                                <span className="block text-xs text-slate-400 font-medium mb-1">Mode</span>
                                <span className="text-slate-800 font-medium text-sm">{mode === 'text' ? 'Text to Speech' : 'Voice Refinement'}</span>
                            </div>
                            <div>
                                <span className="block text-xs text-slate-400 font-medium mb-1">Duration</span>
                                <span className="text-slate-800 font-medium text-sm">{generatedAudioBuffer.duration.toFixed(1)}s</span>
                            </div>
                            <div className="col-span-2">
                                <span className="block text-xs text-slate-400 font-medium mb-1">Voice Style</span>
                                <span className="text-slate-800 font-medium text-sm">{voiceStyle}</span>
                            </div>
                        </div>
                    </div>

                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 text-slate-300 shadow-sm">
                        <Music size={32} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-slate-400 font-medium mb-1">Your generated audio will appear here</h3>
                    <p className="text-slate-400/70 text-sm">
                        {mode === 'text' ? 'Enter script' : 'Record voice'} and click Generate
                    </p>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};