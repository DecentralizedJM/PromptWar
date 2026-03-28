'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { HistorySidebar } from '@/components/HistorySidebar';
import { InputZone } from '@/components/InputZone';
import { ProcessingStage } from '@/components/ProcessingStage';
import { StructuredCardView } from '@/components/StructuredCard';
import { FamilyModeButton } from '@/components/FamilyModeButton';
import { LifeBridgeLogo } from '@/components/LifeBridgeLogo';
import { useI18n } from '@/components/I18nProvider';
import { LanguageSelector } from '@/components/LanguageSelector';
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

function HomeContent() {
  const { locale, t } = useI18n();
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
    const result = await submitToGemini(text, images, { uiLocale: locale });
    if (result.error) {
      alert(`${t.errorPrefix} ${result.error}`);
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
      alert(t.noActions);
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
    <main className="flex h-full min-h-0 w-full bg-background text-foreground overflow-hidden font-sans selection:bg-primary/30 relative">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vh] bg-health/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40vw] h-[40vh] bg-primary/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />

      {/* Sidebar */}
      <div className="relative z-10 hidden h-full shrink-0 transition-all duration-300 sm:block">
        <HistorySidebar history={history} onSelect={item => setActiveResults(item.results)} />
      </div>

      {/* Main Content Stage */}
      <div className="relative z-20 flex w-full flex-1 flex-col items-center overflow-y-auto px-4 pb-32 pt-6 no-scrollbar md:px-16">
        <div className="relative flex w-full max-w-4xl flex-1 flex-col">
          {/* Header: above sidebar stacking so theme + language stay clickable */}
          <div className="relative z-30 mb-12 flex items-center justify-between gap-3">
            <LifeBridgeLogo size="md" className="opacity-95" />
            <div className="flex items-center gap-2 sm:gap-3">
              <LanguageSelector />
              <ThemeToggle />
              <FamilyModeButton
                onRoomJoined={(code, memberId, emoji, name) => setRoom({ code, memberId, emoji, name })}
              />
            </div>
          </div>

          {!isProcessing && !activeResults && (
            <div className="flex-1 flex flex-col items-center justify-center py-12 animate-in fade-in zoom-in-95 duration-700">
              <WavyHover intensity={6} scale={1.01}>
                <h1 className="text-6xl md:text-8xl font-heading font-black text-center mb-8 tracking-tighter leading-[0.9]">
                  {t.heroTitleLine1} <br />
                  <span className="text-gold italic">{t.heroTitleThe}</span> {t.heroTitleLine2}
                </h1>
              </WavyHover>

              <p className="max-w-2xl text-center text-foreground/45 text-lg md:text-xl font-medium mb-5 leading-relaxed tracking-tight text-balance">
                {t.heroSubtitle}
              </p>

              <p className="max-w-xl text-center text-foreground/40 text-sm md:text-[15px] font-medium mb-2 leading-relaxed text-balance px-2">
                {t.heroDescription} {t.heroDescription2}
              </p>
              <div
                className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-10 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30"
                aria-label="Example audiences"
              >
                <span>{t.audienceCaregivers}</span>
                <span className="hidden sm:inline text-foreground/15" aria-hidden>
                  ·
                </span>
                <span>{t.audienceBureaucracy}</span>
                <span className="hidden sm:inline text-foreground/15" aria-hidden>
                  ·
                </span>
                <span>{t.audienceAnyone}</span>
              </div>

              {/* Powered by Gemini badge */}
              <div className="flex items-center gap-2 mb-12 opacity-70 transition-opacity hover:opacity-100">
                <GeminiLogo className="w-5 h-5" />
                <span className="text-xs font-semibold tracking-wide text-foreground/65">{t.poweredByGemini}</span>
              </div>

              <WavyHover className="w-full relative z-10 transition-all duration-500" intensity={4} scale={1.005}>
                <InputZone onSubmit={processInput} isProcessing={isProcessing} />
              </WavyHover>

              {/* Privacy Disclaimer */}
              <div className="premium-edge-light mt-8 flex max-w-xl items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-5 py-3">
                <ShieldCheck size={16} className="shrink-0 text-primary" />
                <p className="text-[11px] font-medium leading-relaxed text-foreground/55">{t.privacyNote}</p>
              </div>

              {/* Demo Section */}
              <div className="mt-16 w-full animate-slide-up" style={{ animationDelay: '400ms' }}>
                 <div className="mb-6 flex items-center justify-center gap-3 opacity-35">
                    <div className="h-px w-8 bg-foreground" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">{t.tryItOut}</span>
                    <div className="h-px w-8 bg-foreground" />
                 </div>
                 <div className="flex flex-wrap justify-center gap-3">
                   {[
                     { 
                       label: t.demoMed, 
                       prompt: 'I take 20mg Lisinopril every morning and just got prescribed 400mg Ibuprofen for my knee pain. Should I be worried?',
                       icon: <Sparkles size={12} />
                     },
                     { 
                       label: t.demoPay, 
                       prompt: 'Got an urgent notice from PG&E. Bill is $245.80 due on Oct 15th. Disconnection warning.',
                       icon: <RefreshCw size={12} />
                     }
                   ].map((demo, idx) => (
                     <WavyHover key={idx} intensity={10} scale={1.04}>
                       <button 
                         type="button"
                         onClick={() => processInput(demo.prompt, [])} 
                         className="group flex cursor-pointer items-center gap-2 rounded-2xl border-glass bg-card/40 px-5 py-3 text-[11px] font-black uppercase tracking-widest text-foreground/55 transition-all hover:border-primary/35 hover:bg-primary/15 hover:text-foreground premium-edge-light"
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
                  <h2 className="mb-1 text-sm font-black uppercase tracking-[0.3em] text-foreground/35">{t.bridgeResult}</h2>
                  <p className="text-2xl font-black tracking-tight">{t.structuredOutput}</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setActiveResults(null)}
                  className="flex items-center gap-2 rounded-xl border-glass bg-secondary px-4 py-2 text-[10px] font-black uppercase tracking-widest text-foreground/45 transition-all hover:bg-secondary/80 hover:text-foreground premium-edge-light"
                >
                  <RefreshCw size={12} />
                  {t.resetStage}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-8 w-full relative">
                {activeResults.map((card, idx) => (
                  <WavyHover key={card.id || idx} intensity={5} scale={1.01}>
                    <StructuredCardView card={card} allCards={activeResults} index={idx} />
                  </WavyHover>
                ))}
              </div>
              
              <div className="mt-12 rounded-3xl border border-dashed border-glass bg-card/30 p-8 text-center premium-panel-light">
                 <p className="text-sm font-medium italic text-foreground/45">&ldquo;{t.quoteFooter}&rdquo;</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  return <HomeContent />;
}
