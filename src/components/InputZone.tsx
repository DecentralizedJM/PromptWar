/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Upload, ClipboardPaste, Link2, X, Sparkles, Loader2, StopCircle } from 'lucide-react';
import { getBrowserSpeechLang } from '@/lib/speech-lang';
import { cn } from '@/lib/utils';

type InputMode = 'upload' | 'voice' | 'paste' | 'url';

const VOICE_UNSUPPORTED =
  'Voice needs Chrome or Edge with microphone access. If it still fails, check site permissions (lock icon → allow mic).';
const VOICE_PERMISSION = 'Microphone blocked. Allow microphone for this site in your browser settings.';

export function InputZone({
  onSubmit,
  isProcessing,
}: {
  onSubmit: (text: string, images: { data: string; mimeType: string }[]) => void;
  isProcessing: boolean;
}) {
  const [activeMode, setActiveMode] = useState<InputMode>('upload');
  /** Typed text: upload captions + paste mode (not voice transcript). */
  const [text, setText] = useState('');
  const [voiceFinal, setVoiceFinal] = useState('');
  const [voiceInterim, setVoiceInterim] = useState('');
  const [url, setUrl] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [images, setImages] = useState<{ data: string; mimeType: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [speechReady, setSpeechReady] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Web Speech API differs per browser
  const recognitionRef = useRef<any>(null);
  /** User wants listening active (mic on). */
  const listeningIntentRef = useRef(false);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSpeechReady(Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition));
  }, []);

  const stopRecognition = useCallback(() => {
    listeningIntentRef.current = false;
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    const r = recognitionRef.current;
    recognitionRef.current = null;
    if (r) {
      try {
        r.onend = null;
        r.onerror = null;
        r.onresult = null;
        r.stop();
      } catch {
        /* already stopped */
      }
    }
    setIsRecording(false);
  }, []);

  const appendInterimToFinal = useCallback(() => {
    setVoiceInterim((prev) => {
      if (prev) {
        setVoiceFinal((f) => (f + (f && !f.endsWith(' ') ? ' ' : '') + prev).trim());
      }
      return '';
    });
  }, []);

  const startRecognition = useCallback(() => {
    if (typeof window === 'undefined') return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setVoiceError(VOICE_UNSUPPORTED);
      return;
    }

    stopRecognition();
    setVoiceError(null);
    setVoiceFinal('');
    setVoiceInterim('');

    const recognition: any = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = getBrowserSpeechLang();
    if ('maxAlternatives' in recognition) recognition.maxAlternatives = 1;

    recognition.onresult = (event: {
      resultIndex: number;
      results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
    }) => {
      let interim = '';
      let nextFinal = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const row = event.results[i]!;
        const piece = row[0]!.transcript;
        if (row.isFinal) {
          nextFinal += piece;
        } else {
          interim += piece;
        }
      }
      if (nextFinal) {
        setVoiceFinal((prev) => (prev + nextFinal + ' ').trimStart());
        setVoiceInterim('');
      } else {
        setVoiceInterim(interim);
      }
    };

    recognition.onerror = (event: { error: string; message?: string }) => {
      if (event.error === 'aborted') return;
      if (event.error === 'no-speech') {
        /* Common during pauses; keep session if user still wants to record */
        return;
      }
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        listeningIntentRef.current = false;
        recognitionRef.current = null;
        setIsRecording(false);
        setVoiceError(VOICE_PERMISSION);
        return;
      }
      /* network, audio-capture, etc. */
      if (listeningIntentRef.current) {
        setVoiceError(event.message || `Speech error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      if (!listeningIntentRef.current) {
        recognitionRef.current = null;
        setIsRecording(false);
        return;
      }
      /* Chrome ends the session after silence; restart shortly so one mic tap keeps listening */
      restartTimerRef.current = setTimeout(() => {
        restartTimerRef.current = null;
        if (!listeningIntentRef.current) return;
        const current = recognitionRef.current;
        if (!current) return;
        try {
          current.start();
        } catch {
          listeningIntentRef.current = false;
          recognitionRef.current = null;
          setIsRecording(false);
          setVoiceError('Voice session ended. Tap the mic again to continue.');
        }
      }, 120);
    };

    listeningIntentRef.current = true;
    recognitionRef.current = recognition;

    try {
      recognition.start();
      setIsRecording(true);
    } catch {
      listeningIntentRef.current = false;
      recognitionRef.current = null;
      setIsRecording(false);
      setVoiceError(VOICE_UNSUPPORTED);
    }
  }, [stopRecognition]);

  useEffect(() => {
    return () => {
      listeningIntentRef.current = false;
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      const r = recognitionRef.current;
      recognitionRef.current = null;
      if (r) {
        try {
          r.stop();
        } catch {
          /* ignore */
        }
      }
    };
  }, []);

  /* Stop mic when leaving voice tab */
  useEffect(() => {
    if (activeMode !== 'voice') {
      stopRecognition();
    }
  }, [activeMode, stopRecognition]);

  const toggleRecording = () => {
    if (!speechReady) {
      setVoiceError(VOICE_UNSUPPORTED);
      return;
    }
    if (isRecording || listeningIntentRef.current) {
      appendInterimToFinal();
      stopRecognition();
      return;
    }
    startRecognition();
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

  const voiceDisplay =
    [voiceFinal, voiceInterim].filter(Boolean).join(voiceFinal && voiceInterim ? ' ' : '') || '';

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const fromVoice = activeMode === 'voice' ? voiceDisplay.trim() : '';
    const fromTyped = activeMode !== 'url' && activeMode !== 'voice' ? text.trim() : '';
    const fromUrl = activeMode === 'url' ? url.trim() : '';
    const finalContent = activeMode === 'url' ? fromUrl : activeMode === 'voice' ? fromVoice : fromTyped;

    if (finalContent || images.length > 0) {
      onSubmit(finalContent, images);
      setText('');
      setVoiceFinal('');
      setVoiceInterim('');
      setUrl('');
      setImages([]);
      setActiveMode('upload');
      stopRecognition();
    }
  };

  const pills: { mode: InputMode; icon: React.ReactNode; label: string }[] = [
    { mode: 'upload', icon: <Upload size={16} />, label: 'Upload' },
    { mode: 'voice', icon: <Mic size={16} />, label: 'Voice' },
    { mode: 'paste', icon: <ClipboardPaste size={16} />, label: 'Paste' },
    { mode: 'url', icon: <Link2 size={16} />, label: 'URL' },
  ];

  const canSubmitNow =
    text.trim() ||
    voiceDisplay.trim() ||
    url.trim() ||
    images.length > 0;

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
            <div className="flex w-full flex-col items-center text-center animate-slide-up">
              <button
                type="button"
                className="mb-6 flex h-16 w-16 cursor-pointer items-center justify-center rounded-2xl bg-primary/10 transition-all hover:bg-primary/20 active:scale-90"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 text-primary" />
              </button>
              <h2 className="mb-2 font-heading text-xl font-black tracking-tight">Drop images here</h2>
              <p className="mb-6 max-w-xs text-sm font-medium text-foreground/50">
                Photos, prescriptions, screenshots — add optional text below for context.
              </p>
              <label className="sr-only" htmlFor="upload-context">
                Optional text with images
              </label>
              <textarea
                id="upload-context"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                placeholder="Optional: type context, notes, or questions to go with your images…"
                className="premium-field-light mb-2 w-full max-w-lg resize-y rounded-2xl border-glass bg-secondary/30 p-4 text-left text-base font-medium text-foreground placeholder:text-foreground/35 focus:outline-none focus:ring-2 focus:ring-primary/45"
              />
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
                  disabled={!speechReady}
                  className={cn(
                    'relative z-10 flex h-20 w-20 items-center justify-center rounded-full transition-all active:scale-90',
                    !speechReady && 'cursor-not-allowed opacity-50',
                    isRecording ? 'bg-red-500 text-white' : 'bg-primary text-primary-foreground'
                  )}
                >
                  {isRecording ? <StopCircle size={32} /> : <Mic size={32} />}
                </button>
              </div>
              <h2 className="mb-2 font-heading text-xl font-black tracking-tight">
                {isRecording ? 'Listening…' : 'Tap to speak'}
              </h2>
              <p className="mb-2 min-h-[4rem] max-w-lg px-2 text-sm font-medium text-foreground/55">
                {voiceError ||
                  voiceDisplay ||
                  (isRecording ? 'Speak clearly — you can pause; we keep listening until you tap stop.' : speechReady ? 'Tap the mic, then speak. Tap again when you are done.' : VOICE_UNSUPPORTED)}
              </p>
              <p className="max-w-md text-[11px] text-foreground/40">
                Using browser language: <span className="font-mono">{getBrowserSpeechLang()}</span> — change system/browser language for other speech recognition languages.
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

      {canSubmitNow && (
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
