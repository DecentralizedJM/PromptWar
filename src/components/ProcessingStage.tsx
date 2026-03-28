'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const STATUS_MESSAGES = [
  "Reading your input...",
  "Extracting entities...",
  "Cross-referencing data...",
  "Identifying domains...",
  "Building your bridge...",
  "Finalizing structure..."
];

export function ProcessingStage() {
  const [statusIdx, setStatusIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIdx((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 min-h-[50vh] w-full max-w-4xl mx-auto px-4 overflow-hidden">
      <div className="relative w-full flex items-center justify-center gap-4 md:gap-16 mb-16">
        
        {/* Left: floating fragments (Chaos) */}
        <div className="flex flex-col gap-4 w-32 md:w-48" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "px-4 py-2 rounded-xl bg-secondary/30 border-glass text-[10px] md:text-xs text-foreground/40 font-mono animate-float-fragment whitespace-nowrap overflow-hidden",
                i % 2 === 0 ? "self-end" : "self-start"
              )}
              style={{ animationDelay: `${i * 0.4}s`, animationDuration: '3s' }}
            >
              {i === 0 && "0x7F4A...B2E"}
              {i === 1 && "raw_data_stream"}
              {i === 2 && "unstructured_node"}
              {i === 3 && "temp_fragment_42"}
            </div>
          ))}
        </div>

        {/* Center: Neural Bridge (Light Paths) */}
        <div className="relative flex-shrink-0 w-24 md:w-32 h-32 flex items-center justify-center">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 120 120"
            fill="none"
            className="w-full h-full"
            aria-hidden="true"
          >
            <path
              d="M10 30 Q60 10 110 30"
              stroke="url(#bridgeGrad)"
              strokeWidth="2"
              className="animate-draw-path"
              style={{ animationDelay: '0s' }}
            />
            <path
              d="M10 60 Q60 40 110 60"
              stroke="url(#bridgeGrad)"
              strokeWidth="2"
              className="animate-draw-path"
              style={{ animationDelay: '0.4s' }}
            />
            <path
              d="M10 90 Q60 70 110 90"
              stroke="url(#bridgeGrad)"
              strokeWidth="2"
              className="animate-draw-path"
              style={{ animationDelay: '0.8s' }}
            />
            <defs>
              <linearGradient id="bridgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(152, 60%, 45%)" />
                <stop offset="50%" stopColor="hsl(45, 90%, 55%)" />
                <stop offset="100%" stopColor="hsl(80, 70%, 50%)" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Central Pulse */}
          <div className="absolute inset-0 bg-primary/20 blur-2xl animate-pulse rounded-full" />
        </div>

        {/* Right: Crystallizing Cards (Order) */}
        <div className="flex flex-col gap-4 w-32 md:w-48" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-full h-10 md:h-12 rounded-xl bg-card/60 border-glass animate-crystallize relative overflow-hidden"
              style={{ animationDelay: `${1.2 + i * 0.4}s` }}
            >
               <div className="absolute inset-y-0 left-0 w-1 bg-primary/50" />
               <div className="absolute top-3 left-4 w-3/4 h-1.5 bg-foreground/10 rounded-full" />
               <div className="absolute bottom-3 left-4 w-1/2 h-1.5 bg-foreground/5 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      <div className="text-center relative h-12 flex items-center justify-center">
        {STATUS_MESSAGES.map((msg, idx) => (
          <h2
            key={idx}
            className={cn(
              "absolute text-xl md:text-2xl font-black tracking-tight transition-all duration-700 font-heading whitespace-nowrap",
              statusIdx === idx 
                ? "opacity-100 translate-y-0" 
                : "opacity-0 translate-y-4"
            )}
            aria-hidden={statusIdx !== idx}
          >
            {msg}
            <span className="typewriter-dots" />
          </h2>
        ))}
      </div>
      
      <p className="text-foreground/30 text-xs md:text-sm mt-4 font-bold uppercase tracking-[0.2em]">
        Gemini Processing Engine Active
      </p>

      {/* Screen Reader Announcement */}
      <div className="sr-only" aria-live="polite">
        LifeBridge is currently {STATUS_MESSAGES[statusIdx]} processing your input and generating structured actions. Please wait.
      </div>
    </div>
  );
}
