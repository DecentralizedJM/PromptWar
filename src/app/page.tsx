'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { HistorySidebar } from '@/components/HistorySidebar';
import { InputZone } from '@/components/InputZone';
import { ProcessingStage } from '@/components/ProcessingStage';
import { StructuredCardView } from '@/components/StructuredCard';
import { FamilyModeButton } from '@/components/FamilyModeButton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { WavyHover } from '@/components/WavyHover';
import { HistoryItem, StructuredCard } from '@/lib/types';
import { submitToGemini } from './actions';
import { Sparkles, RefreshCw, ShieldCheck } from 'lucide-react';

const RoomDashboard = dynamic(
  () => import('@/components/RoomDashboard').then((m) => ({ default: m.RoomDashboard })),
  { ssr: false }
);

function GeminiLogo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="geminiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4285F4" />
          <stop offset="25%" stopColor="#9B72CB" />
          <stop offset="50%" stopColor="#D96570" />
          <stop offset="75%" stopColor="#D96570" />
          <stop offset="100%" stopColor="#9B72CB" />
        </linearGradient>
        <linearGradient id="geminiGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4285F4" />
          <stop offset="50%" stopColor="#34A853" />
          <stop offset="100%" stopColor="#FBBC05" />
        </linearGradient>
      </defs>
      <path
        d="M14 0C14 7.732 7.732 14 0 14C7.732 14 14 20.268 14 28C14 20.268 20.268 14 28 14C20.268 14 14 7.732 14 0Z"
        fill="url(#geminiGrad)"
      />
    </svg>
  );
}

export default function Home() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeResults, setActiveResults] = useState<StructuredCard[] | null>(null);

  const [room, setRoom] = useState<{ code: string; memberId: string; emoji: string; name: string } | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lifebridge-history');
      if (!saved) return;
      const parsed = JSON.parse(saved) as unknown;
      if (Array.isArray(parsed)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only localStorage hydrate after mount (must match SSR empty state)
        setHistory(parsed as HistoryItem[]);
      }
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  const saveHistory = (items: HistoryItem[]) => {
    setHistory(items);
    localStorage.setItem('lifebridge-history', JSON.stringify(items));
  };

  const processInput = async (text: string, images: { data: string; mimeType: string }[]) => {
    setIsProcessing(true);
    setActiveResults(null);
    const result = await submitToGemini(text, images);
    if (result.error) {
      alert('Error: ' + result.error);
      setIsProcessing(false);
      return;
    }
    if (result.cards && result.cards.length > 0) {
      setActiveResults(result.cards);
      const newItem: HistoryItem = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        inputSummary: text.slice(0, 60) + (text.length > 60 ? '...' : '') || 'Image/Audio Input',
        results: result.cards,
      };
      saveHistory([newItem, ...history]);
    } else {
      alert('No structured actions could be extracted from this input.');
    }
    setIsProcessing(false);
  };

  if (room) {
    return (
      <RoomDashboard
        roomCode={room.code}
        memberId={room.memberId}
        memberEmoji={room.emoji}
        memberName={room.name}
        onLeave={() => setRoom(null)}
      />
    );
  }

  return (
    <main className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans selection:bg-primary/30 relative">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vh] bg-health/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40vw] h-[40vh] bg-primary/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />

      {/* Sidebar */}
      <div className="hidden sm:block flex-shrink-0 h-full relative z-20 transition-all duration-300">
        <HistorySidebar history={history} onSelect={item => setActiveResults(item.results)} />
      </div>

      {/* Main Content Stage */}
      <div className="flex-1 flex flex-col items-center overflow-y-auto pb-32 pt-6 px-4 md:px-16 relative w-full z-10 no-scrollbar">
        <div className="w-full max-w-4xl flex-1 flex flex-col relative">

          {/* Header row: Theme toggle + Family Mode */}
          <div className="flex items-center justify-end gap-3 mb-12">
            <ThemeToggle />
            <FamilyModeButton
              onRoomJoined={(code, memberId, emoji, name) => setRoom({ code, memberId, emoji, name })}
            />
          </div>

          {!isProcessing && !activeResults && (
            <div className="flex-1 flex flex-col items-center justify-center py-12 animate-in fade-in zoom-in-95 duration-700">
              <WavyHover intensity={6} scale={1.01}>
                <h1 className="text-6xl md:text-8xl font-heading font-black text-center mb-8 tracking-tighter leading-[0.9]">
                  Bridge <br />
                  <span className="text-gold italic">the</span> gap.
                </h1>
              </WavyHover>

              <p className="max-w-2xl text-center text-foreground/40 text-lg md:text-xl font-medium mb-5 leading-relaxed tracking-tight text-balance">
                The universal interface for messy human intent. Drop notes, voice memos, or photos and turn chaos into structure.
              </p>

              <p className="max-w-xl text-center text-foreground/35 text-sm md:text-[15px] font-medium mb-2 leading-relaxed text-balance px-2">
                Built for real life: bills beside school forms, bottles beside lab printouts, notices you cannot afford to misread.
                LifeBridge reads what you have and hands back categories, warnings, and actions—not another empty dashboard.
              </p>
              <div
                className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-10 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/25"
                aria-label="Example audiences"
              >
                <span>Caregivers</span>
                <span className="hidden sm:inline text-foreground/15" aria-hidden>
                  ·
                </span>
                <span>Newcomers to bureaucracy</span>
                <span className="hidden sm:inline text-foreground/15" aria-hidden>
                  ·
                </span>
                <span>Anyone past capacity</span>
              </div>

              {/* Powered by Gemini badge */}
              <div className="flex items-center gap-2 mb-12 opacity-60 hover:opacity-100 transition-opacity">
                <GeminiLogo className="w-5 h-5" />
                <span className="text-xs font-semibold tracking-wide text-foreground/60">Powered by Gemini</span>
              </div>

              <WavyHover className="w-full relative z-10 transition-all duration-500" intensity={4} scale={1.005}>
                <InputZone onSubmit={processInput} isProcessing={isProcessing} />
              </WavyHover>

              {/* Privacy Disclaimer */}
              <div className="mt-8 flex items-center gap-2 px-5 py-3 rounded-full bg-primary/5 border border-primary/10 max-w-xl">
                <ShieldCheck size={16} className="text-primary shrink-0" />
                <p className="text-[11px] text-foreground/50 font-medium leading-relaxed">
                  Your privacy matters. We never store, log, or retain your personal documents or data. All processing happens in real-time and nothing is saved to our servers.
                </p>
              </div>

              {/* Demo Section */}
              <div className="mt-16 w-full animate-slide-up" style={{ animationDelay: '400ms' }}>
                 <div className="flex items-center justify-center gap-3 mb-6 opacity-30">
                    <div className="h-px w-8 bg-foreground" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Try It Out</span>
                    <div className="h-px w-8 bg-foreground" />
                 </div>
                 <div className="flex flex-wrap justify-center gap-3">
                   {[
                     { 
                       label: 'Medication Synergy', 
                       prompt: 'I take 20mg Lisinopril every morning and just got prescribed 400mg Ibuprofen for my knee pain. Should I be worried?',
                       icon: <Sparkles size={12} />
                     },
                     { 
                       label: 'Urgent Payables', 
                       prompt: 'Got an urgent notice from PG&E. Bill is $245.80 due on Oct 15th. Disconnection warning.',
                       icon: <RefreshCw size={12} />
                     }
                   ].map((demo, idx) => (
                     <WavyHover key={idx} intensity={10} scale={1.04}>
                       <button 
                         onClick={() => processInput(demo.prompt, [])} 
                         className="group px-5 py-3 glass border-glass rounded-2xl text-[11px] font-black uppercase tracking-widest text-foreground/50 hover:text-foreground hover:bg-primary/20 hover:border-primary/30 transition-all cursor-pointer flex items-center gap-2"
                       >
                         <span className="opacity-40 group-hover:opacity-100 transition-opacity">{demo.icon}</span>
                         {demo.label}
                       </button>
                     </WavyHover>
                   ))}
                 </div>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in duration-500">
              <ProcessingStage />
            </div>
          )}

          {activeResults && (
            <div className="space-y-10 pb-20 w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <h2 className="text-sm font-black text-foreground/30 uppercase tracking-[0.3em] mb-1">Bridge Result</h2>
                  <p className="text-2xl font-black tracking-tight">Structured Output</p>
                </div>
                <button 
                  onClick={() => setActiveResults(null)}
                  className="px-4 py-2 rounded-xl bg-secondary border-glass text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-foreground hover:bg-secondary/80 transition-all flex items-center gap-2"
                >
                  <RefreshCw size={12} />
                  Reset Stage
                </button>
              </div>

              <div className="grid grid-cols-1 gap-8 w-full relative">
                {activeResults.map((card, idx) => (
                  <WavyHover key={card.id || idx} intensity={5} scale={1.01}>
                    <StructuredCardView card={card} allCards={activeResults} index={idx} />
                  </WavyHover>
                ))}
              </div>
              
              <div className="mt-12 p-8 glass border-dashed border-glass rounded-3xl text-center">
                 <p className="text-sm font-medium text-foreground/40 italic">&ldquo;The shortest path between thought and action.&rdquo;</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
