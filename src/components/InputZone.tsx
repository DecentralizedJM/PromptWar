/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @next/next/no-img-element */
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Upload, ClipboardPaste, Link2, X, Sparkles, Loader2, StopCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type InputMode = 'upload' | 'voice' | 'paste' | 'url';

export function InputZone({
  onSubmit,
  isProcessing
}: {
  onSubmit: (text: string, images: {data: string, mimeType: string}[]) => void;
  isProcessing: boolean;
}) {
  const [activeMode, setActiveMode] = useState<InputMode>('upload');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [images, setImages] = useState<{data: string, mimeType: string}[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              setText(prev => prev + transcript + ' ');
            } else {
              currentTranscript += transcript;
            }
          }
        };
        
        recognitionRef.current.onerror = () => setIsRecording(false);
        recognitionRef.current.onend = () => setIsRecording(false);
      }
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      setText('');
      recognitionRef.current?.start();
    }
    setIsRecording(!isRecording);
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const base64Data = result.split(',')[1];
      setImages(prev => [...prev, { data: base64Data, mimeType: file.type }]);
    };
    reader.readAsDataURL(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      Array.from(e.dataTransfer.files).forEach(handleFile);
    }
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const finalContent = activeMode === 'url' ? url : text;
    if (finalContent.trim() || images.length > 0) {
      onSubmit(finalContent, images);
      setText('');
      setUrl('');
      setImages([]);
      setActiveMode('upload');
    }
  };

  const pills: { mode: InputMode; icon: React.ReactNode; label: string }[] = [
    { mode: 'upload', icon: <Upload size={16} />, label: 'Upload' },
    { mode: 'voice', icon: <Mic size={16} />, label: 'Voice' },
    { mode: 'paste', icon: <ClipboardPaste size={16} />, label: 'Paste' },
    { mode: 'url', icon: <Link2 size={16} />, label: 'URL' },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      {/* Mode Selector Pills */}
      <nav className="flex flex-wrap gap-2 mb-8 justify-center p-1 bg-card/30 backdrop-blur-md rounded-full border border-white/5 shadow-2xl overflow-hidden" aria-label="Input methods">
        {pills.map(pill => (
          <button
            key={pill.mode}
            onClick={() => {
              if (isRecording) toggleRecording();
              setActiveMode(pill.mode);
            }}
            className={cn(
               "flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-95",
               activeMode === pill.mode 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                : "text-foreground/40 hover:text-foreground hover:bg-white/5"
            )}
          >
            {pill.icon}
            <span>{pill.label}</span>
          </button>
        ))}
      </nav>

      {/* Main Input Shell */}
      <div 
        className={cn(
          "w-full drop-zone-border bg-card/40 backdrop-blur-xl border-glass shadow-navy relative group transition-all duration-500",
          isDragging && "scale-[1.02] bg-secondary/40 shadow-glow-seafoam"
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
      >
        <div className="p-8 md:p-12 flex flex-col items-center">
          
          {/* Mode-specific content */}
          {activeMode === 'upload' && (
            <div className="flex flex-col items-center text-center animate-slide-up">
              <div 
                className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 cursor-pointer hover:bg-primary/20 transition-all active:scale-90"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="text-primary w-8 h-8" />
              </div>
              <h2 className="text-xl font-heading font-black mb-2 tracking-tight">Drop anything here</h2>
              <p className="text-foreground/40 text-sm max-w-xs font-medium">
                Photos, prescriptions, documents, or messy text notes
              </p>
              <input 
                ref={fileInputRef}
                type="file" 
                multiple 
                hidden 
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files) Array.from(e.target.files).forEach(handleFile);
                }}
              />
            </div>
          )}

          {activeMode === 'voice' && (
            <div className="flex flex-col items-center text-center animate-slide-up w-full">
              <div className="relative mb-8">
                {isRecording && (
                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-record-pulse" />
                )}
                <button 
                  onClick={toggleRecording}
                  className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center transition-all z-10 relative active:scale-90",
                    isRecording ? "bg-red-500 text-white" : "bg-primary text-primary-foreground"
                  )}
                >
                  {isRecording ? <StopCircle size={32} /> : <Mic size={32} />}
                </button>
              </div>
              <h2 className="text-xl font-heading font-black mb-2 tracking-tight">
                {isRecording ? "Listening..." : "Tap to record"}
              </h2>
              <p className="text-foreground/40 text-sm max-w-xs font-medium h-4">
                {text || (isRecording ? "Speak now" : "Voice your messy thoughts")}
              </p>
            </div>
          )}

          {activeMode === 'paste' && (
            <div className="w-full animate-slide-up">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                autoFocus
                placeholder="Dump everything here — prescriptions, bills, messy notes... We'll bridge the gap."
                className="w-full h-48 bg-secondary/30 rounded-2xl p-6 text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-foreground/20 resize-none border-glass"
              />
            </div>
          )}

          {activeMode === 'url' && (
            <div className="w-full animate-slide-up flex flex-col gap-4">
              <div className="relative">
                <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  autoFocus
                  placeholder="Paste a link to process (article, PDF, document)..."
                  className="w-full bg-secondary/30 rounded-2xl py-5 pl-12 pr-6 text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-foreground/20 border-glass"
                />
              </div>
            </div>
          )}

          {/* Image Previews */}
          {images.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-8 justify-center shrink-0">
              {images.map((img, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border-glass group animate-crystallize shadow-xl">
                  <img src={`data:${img.mimeType};base64,${img.data}`} className="object-cover w-full h-full" alt="Preview" />
                  <button 
                    type="button"
                    onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      {(text.trim() || url.trim() || images.length > 0) && (
        <button
          onClick={() => handleSubmit()}
          disabled={isProcessing}
          className={cn(
            "mt-8 px-10 py-4 rounded-full bg-primary text-primary-foreground font-black text-base transition-all duration-300 flex items-center gap-2 active:scale-95",
            isProcessing ? "opacity-50 cursor-not-allowed" : "animate-glow-pulse hover:shadow-[0_0_30px_rgba(78,205,196,0.5)]"
          )}
        >
          {isProcessing ? <Loader2 className="animate-spin" /> : <Sparkles />}
          {isProcessing ? "Bridging..." : "Bridge It →"}
        </button>
      )}
    </div>
  );
}
