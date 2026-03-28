'use client';

import { useState, useEffect } from 'react';
import { HistorySidebar } from '@/components/HistorySidebar';
import { InputZone } from '@/components/InputZone';
import { ProcessingStage } from '@/components/ProcessingStage';
import { StructuredCardView } from '@/components/StructuredCard';
import { FamilyModeButton } from '@/components/FamilyModeButton';
import { RoomDashboard } from '@/components/RoomDashboard';
import { HistoryItem, StructuredCard } from '@/lib/types';
import { submitToGemini } from './actions';
import { cn } from '@/lib/utils';
import { Bot, Sparkles, RefreshCw } from 'lucide-react';

export default function Home() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeResults, setActiveResults] = useState<StructuredCard[] | null>(null);

  // Family mode state
  const [room, setRoom] = useState<{ code: string; memberId: string; emoji: string; name: string } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('lifebridge-history');
    if (saved) {
      try { setHistory(JSON.parse(saved)); } catch { /* ignore */ }
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

  // If in Family Mode, show the room dashboard full-screen
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
      <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none" />

      {/* Sidebar */}
      <div className="hidden sm:block flex-shrink-0 h-full relative z-20 transition-all duration-300">
        <HistorySidebar history={history} onSelect={item => setActiveResults(item.results)} />
      </div>

      {/* Main Content Stage */}
      <div className="flex-1 flex flex-col items-center overflow-y-auto pb-32 pt-6 px-4 md:px-16 relative w-full z-10 no-scrollbar">
        <div className="w-full max-w-4xl flex-1 flex flex-col relative">

          {/* Header row with Family Mode button */}
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setActiveResults(null)}>
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Bot size={18} />
              </div>
              <span className="text-sm font-black uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100 transition-opacity">Neural Core v3.1</span>
            </div>
            <FamilyModeButton
              onRoomJoined={(code, memberId, emoji, name) => setRoom({ code, memberId, emoji, name })}
            />
          </div>

          {!isProcessing && !activeResults && (
            <div className="flex-1 flex flex-col items-center justify-center py-12 animate-in fade-in zoom-in-95 duration-700">
              <h1 className="text-6xl md:text-8xl font-heading font-black text-center mb-8 tracking-tighter leading-[0.9]">
                Bridge <br />
                <span className="text-primary italic">the</span> gap.
              </h1>
              <p className="max-w-2xl text-center text-foreground/40 text-lg md:text-xl font-medium mb-12 leading-relaxed tracking-tight text-balance">
                The universal interface for messy human intent. Drop notes, voice memos, or photos and turn chaos into structure.
              </p>

              <div className="w-full relative z-10 transition-all duration-500">
                <InputZone onSubmit={processInput} isProcessing={isProcessing} />
              </div>

              {/* Demo Section */}
              <div className="mt-20 w-full animate-slide-up" style={{ animationDelay: '400ms' }}>
                 <div className="flex items-center justify-center gap-3 mb-6 opacity-30">
                    <div className="h-px w-8 bg-foreground" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Ignition Sequences</span>
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
                     <button 
                       key={idx}
                       onClick={() => processInput(demo.prompt, [])} 
                       className="group px-5 py-3 glass border-white/5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-foreground/50 hover:text-foreground hover:bg-primary/20 hover:border-primary/30 transition-all cursor-pointer flex items-center gap-2"
                     >
                       <span className="opacity-40 group-hover:opacity-100 transition-opacity">{demo.icon}</span>
                       {demo.label}
                     </button>
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
                  className="px-4 py-2 rounded-xl bg-white/5 border-glass text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-foreground hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  <RefreshCw size={12} />
                  Reset Stage
                </button>
              </div>

              <div className="grid grid-cols-1 gap-8 w-full relative">
                {activeResults.map((card, idx) => (
                  <StructuredCardView key={card.id || idx} card={card} allCards={activeResults} index={idx} />
                ))}
              </div>
              
              {/* Optional: Add a call to action at the bottom of results */}
              <div className="mt-12 p-8 glass border-dashed border-white/10 rounded-3xl text-center">
                 <p className="text-sm font-medium text-foreground/40 italic">"The shortest path between thought and action."</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
