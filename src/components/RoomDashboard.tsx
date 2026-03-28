'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { RoomCard, StructuredCard, DomainType, RoomMember, FamilyRoom } from '@/lib/types';
import { HeartPulse, Landmark, Package, FileText, Copy, Check, LogOut, Bot, ShieldCheck, UserCircle2 } from 'lucide-react';
import { submitToGemini } from '@/app/actions';
import { InputZone } from './InputZone';
import { ProcessingStage } from './ProcessingStage';
import { MemberIndicator } from './MemberIndicator';
import { cn } from '@/lib/utils';

interface RoomDashboardProps {
  roomCode: string;
  memberId: string;
  memberEmoji: string;
  memberName: string;
  onLeave: () => void;
}

const DOMAIN_MAP: Record<string, { class: string, text: string, icon: any }> = {
  'HEALTH': { class: 'border-l-health', text: 'text-health', icon: HeartPulse },
  'FINANCE': { class: 'border-l-finance', text: 'text-finance', icon: Landmark },
  'LOGISTICS': { class: 'border-l-logistics', text: 'text-logistics', icon: Package },
  'GOVERNMENT_LEGAL': { class: 'border-l-legal', text: 'text-legal', icon: FileText },
};

export function RoomDashboard({ roomCode, memberId, memberEmoji, memberName, onLeave }: RoomDashboardProps) {
  const [cards, setCards] = useState<RoomCard[]>([]);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  // Real-time listener for cards
  useEffect(() => {
    const unsubCards = onSnapshot(collection(db, 'rooms', roomCode, 'cards'), snap => {
      const fetched: RoomCard[] = [];
      snap.forEach(d => fetched.push(d.data() as RoomCard));
      setCards(fetched.sort((a, b) => b.addedAt - a.addedAt));
    });

    // Real-time listener for members
    const unsubRoom = onSnapshot(doc(db, 'rooms', roomCode), snap => {
      if (snap.exists()) {
        const roomData = snap.data() as FamilyRoom;
        setMembers(roomData.members || []);
      }
    });

    return () => {
      unsubCards();
      unsubRoom();
    };
  }, [roomCode]);

  const processInput = async (text: string, images: { data: string; mimeType: string }[]) => {
    setIsProcessing(true);
    const result = await submitToGemini(text, images);
    if (result.error) { alert('Error: ' + result.error); setIsProcessing(false); return; }

    // Write each card to Firestore room
    for (const card of result.cards) {
      const roomCard: RoomCard = {
        ...card,
        id: card.id || crypto.randomUUID(),
        contributedBy: memberName,
        contributorEmoji: memberEmoji,
        addedAt: Date.now(),
      };
      await setDoc(doc(db, 'rooms', roomCode, 'cards', roomCard.id), roomCard);
    }
    setIsProcessing(false);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  // Group by domain
  const grouped = cards.reduce<Partial<Record<DomainType, RoomCard[]>>>((acc, card) => {
    acc[card.domain] = [...(acc[card.domain] || []), card];
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-screen bg-background text-foreground relative overflow-hidden selection:bg-primary/30">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[40vw] h-[40vh] bg-accent/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40vw] h-[40vh] bg-primary/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />

      {/* Room Header */}
      <header className="glass border-b border-white/5 px-6 py-4 flex items-center justify-between shrink-0 z-30 relative">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
             <div className="w-9 h-9 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-glow-seafoam -rotate-3">
                <Bot size={20} />
             </div>
             <div className="flex flex-col">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/60 leading-none mb-1">Family Room</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-mono font-black tracking-widest leading-none">{roomCode}</span>
                  <button 
                    onClick={copyCode} 
                    className="p-1 px-2 rounded-lg bg-white/5 border-glass text-foreground/20 hover:text-foreground transition-all flex items-center gap-1.5"
                  >
                    {codeCopied ? <Check size={12} className="text-health" /> : <Copy size={12} />}
                    <span className="text-[10px] font-black uppercase tracking-widest">{codeCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
             </div>
          </div>
          
          <div className="h-10 w-px bg-white/5 hidden sm:block" />
          
          <div className="hidden sm:block">
            <MemberIndicator members={members} />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border-glass">
            <span className="text-xl leading-none">{memberEmoji}</span>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-foreground/30 uppercase tracking-widest leading-none">Perspective</span>
              <span className="text-xs text-foreground font-black leading-tight mt-0.5">{memberName}</span>
            </div>
          </div>
          
          <button 
            onClick={onLeave} 
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-destructive/10 hover:bg-destructive/20 text-destructive text-[11px] font-black uppercase tracking-widest border border-destructive/20 transition-all active:scale-95"
          >
            <LogOut size={14} />
            Leave Room
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative z-20">
        {/* Left Panel: Contribution (Sidebar-style) */}
        <div className="md:w-[400px] shrink-0 p-8 glass border-r border-white/5 overflow-y-auto no-scrollbar">
          <div className="flex items-center gap-3 mb-8">
             <div className="w-8 h-8 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                <UserCircle2 size={18} />
             </div>
             <h2 className="text-xs font-black text-foreground/30 uppercase tracking-[0.3em]">Your Addition</h2>
          </div>
          
          <div className="relative">
            {isProcessing ? (
               <div className="scale-75 origin-top -mt-10">
                 <ProcessingStage />
               </div>
            ) : (
              <InputZone onSubmit={processInput} isProcessing={isProcessing} />
            )}
          </div>
          
          <div className="mt-12 p-6 rounded-2xl bg-white/5 border-glass border-dashed">
             <p className="text-[11px] leading-relaxed text-foreground/40 font-medium italic">
                "Contributions here are instantly synthesized and reflected on the shared family dashboard in real-time."
             </p>
          </div>
        </div>

        {/* Right Panel: Merged Dashboard */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 no-scrollbar">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div className="flex flex-col">
                <h2 className="text-sm font-black text-foreground/30 uppercase tracking-[0.3em] mb-1">Collaborative Matrix</h2>
                <p className="text-3xl font-black tracking-tight">{cards.length} Active Insight{cards.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="p-3 px-5 rounded-2xl bg-white/5 border-glass flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-health animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-foreground/50">Live Sync Active</span>
              </div>
            </div>

            {cards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in zoom-in-95 duration-700">
                <div className="w-20 h-20 rounded-[2.5rem] bg-white/5 flex items-center justify-center text-5xl mb-6 shadow-2xl">🏠</div>
                <h3 className="text-xl font-heading font-black tracking-tight mb-2">Populating the Space...</h3>
                <p className="text-foreground/40 text-sm font-medium max-w-xs">Waiting for contributions. Share your code <span className="text-accent font-black tracking-widest">{roomCode}</span> to start bridging together.</p>
              </div>
            ) : (
              <div className="space-y-12 pb-24">
                {(Object.entries(grouped) as [DomainType, RoomCard[]][]).map(([domain, domainCards]) => {
                  const info = DOMAIN_MAP[domain] || { class: 'border-l-muted', text: 'text-muted-foreground', icon: FileText };
                  const Icon = info.icon;
                  
                  return (
                    <div key={domain} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-center gap-4 mb-6">
                        <div className={cn("p-2 rounded-xl bg-white/5 border-glass", info.text)}>
                          <Icon size={18} />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-[0.2em]">{domain.replace('_', ' ')}</h3>
                        <div className="h-px flex-1 bg-white/5" />
                        <span className="text-[10px] font-mono font-black text-foreground/20">{domainCards.length} UNITS</span>
                      </div>

                      <div className="grid grid-cols-1 gap-6">
                        {domainCards.map((card, idx) => (
                          <div 
                            key={card.id} 
                            className={cn(
                              "relative group rounded-2xl bg-card/40 backdrop-blur-xl border-glass border-l-4 p-6 shadow-navy transition-all duration-300 hover:translate-y-[-2px] hover:shadow-navy-lg",
                              info.class
                            )}
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="text-lg font-heading font-black tracking-tight text-foreground">{card.title}</h4>
                                <p className="text-xs text-foreground/60 font-medium leading-relaxed mt-1">{card.summary}</p>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <span className="text-lg" title={card.contributedBy}>{card.contributorEmoji}</span>
                                <span className="text-[9px] font-black uppercase tracking-widest text-foreground/20">{card.contributedBy}</span>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              {card.items.map((item, i) => (
                                <div key={i} className={cn(
                                  "px-3 py-1.5 rounded-xl border-glass flex items-center gap-3",
                                  item.status === 'warning' ? 'bg-accent/10 text-accent' :
                                  item.status === 'success' ? 'bg-health/10 text-health' :
                                  'bg-white/5 text-foreground/70'
                                )}>
                                  <span className="text-[9px] font-black uppercase tracking-widest opacity-60 shrink-0">{item.label}</span>
                                  <span className="text-[11px] font-bold font-mono tracking-tight">{item.value}</span>
                                </div>
                              ))}
                            </div>
                            
                            {/* Metadata footer */}
                            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                               <div className="flex items-center gap-2 text-primary/50">
                                  <ShieldCheck size={12} />
                                  <span className="text-[10px] font-black uppercase tracking-widest leading-none">Gemini Verified</span>
                               </div>
                               <span className="text-[10px] font-mono font-black text-foreground/10">
                                  {new Date(card.addedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
