/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @next/next/no-img-element */
'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, ArrowUp, Paperclip, X, Image as ImageIcon, Loader2 } from 'lucide-react';

export function InputZone({
  onSubmit,
  isProcessing
}: {
  onSubmit: (text: string, images: {data: string, mimeType: string}[]) => void;
  isProcessing: boolean;
}) {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [images, setImages] = useState<{data: string, mimeType: string}[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Setup Speech Recognition
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
      setText(''); // clear or append depending on preference
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

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <form 
      onSubmit={(e) => {
        e.preventDefault();
        if (text.trim() || images.length > 0) {
          onSubmit(text, images);
          setText('');
          setImages([]);
        }
      }}
      className={`relative flex flex-col w-full max-w-3xl mx-auto rounded-3xl p-2 transition-all duration-300 shadow-[0_2px_40px_rgba(26,39,68,0.06)] bg-white border ${
        isDragging ? 'border-seafoam ring-4 ring-seafoam/20' : 'border-navy/10'
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Image Preview Area */}
      {images.length > 0 && (
        <div className="flex gap-2 p-3 overflow-x-auto">
          {images.map((img, i) => (
            <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden shadow-sm border border-navy/10 group filter shrink-0">
              <img src={`data:${img.mimeType};base64,${img.data}`} className="object-cover w-full h-full" alt="Upload preview" />
              <button 
                type="button"
                onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                className="absolute top-1 right-1 bg-navy/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Input */}
      <div className="flex items-end gap-2 p-2 relative">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-3 text-navy/40 hover:text-navy hover:bg-warmWhite rounded-2xl transition-all"
        >
          <Paperclip size={24} />
        </button>
        <input 
          type="file" 
          accept="image/*" 
          hidden 
          ref={fileInputRef} 
          onChange={(e) => e.target.files && handleFile(e.target.files[0])}
        />

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste messiness here, drop a file, or tap mic..."
          className="flex-1 max-h-48 min-h-[56px] resize-none bg-transparent p-3 font-sans text-lg text-navy placeholder:text-navy/30 focus:outline-none"
          rows={Math.min(5, text.split('\n').length || 1)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (text.trim() || images.length > 0) {
                onSubmit(text, images);
                setText('');
                setImages([]);
              }
            }
          }}
        />

        <div className="flex gap-2 items-center">
          <button
            type="button"
            onClick={toggleRecording}
            className={`p-3 rounded-2xl transition-all ${
              isRecording 
                ? 'bg-amber text-warmWhite shadow-[0_0_20px_rgba(232,168,56,0.5)] animate-pulse' 
                : 'text-navy/40 hover:text-navy hover:bg-warmWhite'
            }`}
          >
            <Mic size={24} />
          </button>

          <button
            type="submit"
            disabled={(!text.trim() && images.length === 0) || isProcessing}
            className={`p-3 rounded-2xl transition-all font-medium ${
              (!text.trim() && images.length === 0) || isProcessing
                ? 'bg-navy/5 text-navy/20 cursor-not-allowed'
                : 'bg-seafoam text-white shadow-lg shadow-seafoam/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-seafoam/40'
            }`}
          >
            {isProcessing ? <Loader2 className="animate-spin" size={24} /> : <ArrowUp size={24} strokeWidth={3} />}
          </button>
        </div>
      </div>
    </form>
  );
}
