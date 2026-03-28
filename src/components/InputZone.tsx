/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Upload, ClipboardPaste, Link2, X, Sparkles, Loader2, StopCircle } from 'lucide-react';
import { getBrowserSpeechLang } from '@/lib/speech-lang';
import { cn } from '@/lib/utils';

type InputMode = 'upload' | 'voice' | 'paste' | 'url';

const VOICE_UNSUPPORTED =
  'Voice input needs a Chromium-based browser (Chrome or Edge) with microphone access.';
const VOICE_PERMISSION = 'Microphone blocked. Allow access in your browser settings and try again.';

export function InputZone({
  onSubmit,
  isProcessing,
}: {
  onSubmit: (text: string, images: { data: string; mimeType: string }[]) => void;
  isProcessing: boolean;
}) {
  const [activeMode, setActiveMode] = useState<InputMode>('upload');
  const [text, setText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [url, setUrl] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [images, setImages] = useState<{ data: string; mimeType: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<{
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    start: () => void;
    stop: () => void;
    onresult: ((e: {
      resultIndex: number;
      results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
    }) => void) | null;
    onerror: ((e: { error: string; message?: string }) => void) | null;
    onend: (() => void) | null;
  } | null>(null);
  const listeningIntentRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setVoiceSupported(false);
      return;
    }
    setVoiceSupported(true);
    const recognition = new SR() as NonNullable<typeof recognitionRef.current>;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = getBrowserSpeechLang();

    recognition.onresult = (event) => {
      let interim = '';
      let nextFinal = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const piece = event.results[i]![0]!.transcript;
        if (event.results[i]!.isFinal) {
          nextFinal += piece;
        } else {
          interim += piece;
        }
      }
      if (nextFinal) {
        setText((prev) => (prev + nextFinal + ' ').trimStart());
        setInterimText('');
      } else {
        setInterimText(interim);
      }
    };

    recognition.onerror = (event: { error: string; message?: string }) => {
      listeningIntentRef.current = false;
      setIsRecording(false);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setVoiceError(VOICE_PERMISSION);
      } else if (event.error !== 'aborted' && event.error !== 'no-speech') {
        setVoiceError(event.message || event.error);
      }
    };

    recognition.onend = () => {
      if (!listeningIntentRef.current) {
        setIsRecording(false);
        return;
      }
      try {
        recognition.start();
        setIsRecording(true);
      } catch {
        setIsRecording(false);
        listeningIntentRef.current = false;
      }
    };

    recognitionRef.current = recognition;
    return () => {
      listeningIntentRef.current = false;
      try {
        recognition.stop();
      } catch {
        /* already stopped */
      }
      recognitionRef.current = null;
    };
  }, []);

  const toggleRecording = () => {
    setVoiceError(null);
    const recognition = recognitionRef.current;
    if (!voiceSupported || !recognition) {
      setVoiceError(VOICE_UNSUPPORTED);
      return;
    }
    if (isRecording) {
      listeningIntentRef.current = false;
      try {
        recognition.stop();
      } catch {
        /* ignore */
      }
      setIsRecording(false);
      setInterimText((prev) => {
        if (prev) setText((t0) => (t0 + (t0 && !t0.endsWith(' ') ? ' ' : '') + prev).trim());
        return '';
      });
      return;
    }
    setText('');
    setInterimText('');
    listeningIntentRef.current = true;
    try {
      recognition.start();
      setIsRecording(true);
    } catch {
      listeningIntentRef.current = false;
      setIsRecording(false);
      setVoiceError(VOICE_UNSUPPORTED);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const base64Data = result.split(',')[1]!;
      setImages((prev) => [...prev, { data: base64Data, mimeType: file.type }]);
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

  const voiceDisplay = [text, interimText].filter(Boolean).join(text && interimText ? ' ' : '') || '';

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const finalContent = activeMode === 'url' ? url : activeMode === 'voice' ? voiceDisplay.trim() : text;
    if (finalContent.trim() || images.length > 0) {
      onSubmit(finalContent, images);
      setText('');
      setInterimText('');
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
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center">
      <nav
        className="premium-edge-light mb-8 flex flex-wrap justify-center gap-2 overflow-hidden rounded-full border border-border bg-card/40 p-1 shadow-navy backdrop-blur-md"
        aria-label="Input methods"
      >
        {pills.map((pill) => (
          <button
            key={pill.mode}
            type="button"
            onClick={() => {
              if (isRecording) toggleRecording();
              setActiveMode(pill.mode);
            }}
            className={cn(
              'flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-95',
              activeMode === pill.mode
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 ring-1 ring-primary/30'
                : 'text-foreground/45 hover:bg-foreground/5 hover:text-foreground'
            )}
          >
            {pill.icon}
            <span>{pill.label}</span>
          </button>
        ))}
      </nav>

      <div
        className={cn(
          'premium-panel-light drop-zone-border relative w-full border-glass bg-card/50 shadow-navy backdrop-blur-xl transition-all duration-500',
          isDragging && 'scale-[1.02] bg-secondary/40 shadow-glow-seafoam'
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
      >
        <div className="flex flex-col items-center p-8 md:p-12">
          {activeMode === 'upload' && (
            <div className="flex flex-col items-center text-center animate-slide-up">
              <button
                type="button"
                className="mb-6 flex h-16 w-16 cursor-pointer items-center justify-center rounded-2xl bg-primary/10 transition-all hover:bg-primary/20 active:scale-90"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 text-primary" />
              </button>
              <h2 className="mb-2 font-heading text-xl font-black tracking-tight">Drop anything here</h2>
              <p className="max-w-xs text-sm font-medium text-foreground/50">
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
            <div className="flex w-full flex-col items-center text-center animate-slide-up">
              <div className="relative mb-8">
                {isRecording && (
                  <div className="absolute inset-0 animate-record-pulse rounded-full bg-primary/20" />
                )}
                <button
                  type="button"
                  onClick={toggleRecording}
                  disabled={!voiceSupported}
                  className={cn(
                    'relative z-10 flex h-20 w-20 items-center justify-center rounded-full transition-all active:scale-90',
                    !voiceSupported && 'cursor-not-allowed opacity-50',
                    isRecording ? 'bg-red-500 text-white' : 'bg-primary text-primary-foreground'
                  )}
                >
                  {isRecording ? <StopCircle size={32} /> : <Mic size={32} />}
                </button>
              </div>
              <h2 className="mb-2 font-heading text-xl font-black tracking-tight">
                {isRecording ? 'Listening…' : 'Tap to record'}
              </h2>
              <p className="min-h-[4rem] max-w-lg px-2 text-sm font-medium text-foreground/55">
                {voiceError ||
                  voiceDisplay ||
                  (isRecording ? 'Speak now' : voiceSupported ? 'Voice your messy thoughts' : VOICE_UNSUPPORTED)}
              </p>
            </div>
          )}

          {activeMode === 'paste' && (
            <div className="w-full animate-slide-up">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                autoFocus
                placeholder="Dump everything here — prescriptions, bills, messy notes… We'll bridge the gap."
                className="premium-field-light h-48 w-full resize-none rounded-2xl border-glass bg-secondary/30 p-6 text-base font-medium text-foreground placeholder:text-foreground/35 focus:outline-none focus:ring-2 focus:ring-primary/45"
              />
            </div>
          )}

          {activeMode === 'url' && (
            <div className="flex w-full animate-slide-up flex-col gap-4">
              <div className="relative">
                <Link2 className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-primary" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  autoFocus
                  placeholder="Paste a link to process (article, PDF, document)…"
                  className="premium-field-light w-full rounded-2xl border-glass bg-secondary/30 py-5 pl-12 pr-6 text-base font-medium text-foreground placeholder:text-foreground/35 focus:outline-none focus:ring-2 focus:ring-primary/45"
                />
              </div>
            </div>
          )}

          {images.length > 0 && (
            <div className="mt-8 flex shrink-0 flex-wrap justify-center gap-3">
              {images.map((img, i) => (
                <div
                  key={i}
                  className="group animate-crystallize relative h-20 w-20 overflow-hidden rounded-xl border-glass shadow-xl"
                >
                  <img
                    src={`data:${img.mimeType};base64,${img.data}`}
                    className="h-full w-full object-cover"
                    alt="Preview"
                  />
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {(text.trim() || interimText.trim() || url.trim() || images.length > 0) && (
        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={isProcessing}
          className={cn(
            'premium-cta-light mt-8 flex items-center gap-2 rounded-full bg-primary px-10 py-4 text-base font-black text-primary-foreground transition-all duration-300 active:scale-95',
            isProcessing ? 'cursor-not-allowed opacity-50' : 'animate-glow-pulse hover:shadow-glow-seafoam'
          )}
        >
          {isProcessing ? <Loader2 className="animate-spin" /> : <Sparkles />}
          {isProcessing ? 'Bridging…' : 'Bridge It →'}
        </button>
      )}
    </div>
  );
}
