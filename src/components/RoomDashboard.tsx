'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { RoomCard, StructuredCard, DomainType, RoomMember, FamilyRoom } from '@/lib/types';
import { HeartPulse, Landmark, Package, FileText, Copy, Check, LogOut } from 'lucide-react';
import { submitToGemini } from '@/app/actions';
import { InputZone } from './InputZone';
import { ProcessingStage } from './ProcessingStage';
import { MemberIndicator } from './MemberIndicator';

interface RoomDashboardProps {
  roomCode: string;
  memberId: string;
  memberEmoji: string;
  memberName: string;
  onLeave: () => void;
}

const DOMAIN_COLORS: Record<DomainType, string> = {
  HEALTH: 'bg-amber/5 border-amber/20',
  FINANCE: 'bg-seafoam/5 border-seafoam/20',
  LOGISTICS: 'bg-navy/5 border-navy/10',
  GOVERNMENT_LEGAL: 'bg-amber/5 border-amber/20',
  GENERAL: 'bg-gray-50 border-gray-100',
};

const DOMAIN_ICONS: Record<DomainType, React.ReactNode> = {
  HEALTH: <HeartPulse size={16} className="text-amber" />,
  FINANCE: <Landmark size={16} className="text-seafoam" />,
  LOGISTICS: <Package size={16} className="text-navy/70" />,
  GOVERNMENT_LEGAL: <FileText size={16} className="text-amber" />,
  GENERAL: <FileText size={16} className="text-navy/40" />,
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
    <div className="flex flex-col h-screen bg-[#fafaf8]">
      {/* Room Header */}
      <header className="bg-[#1a2744] text-white px-6 py-3 flex items-center justify-between shrink-0 shadow-lg z-20">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <p className="text-[9px] font-black uppercase tracking-widest text-amber/80 leading-none mb-1">Family Room</p>
            <div className="flex items-center gap-2">
              <span className="text-xl font-mono font-black tracking-widest leading-none">{roomCode}</span>
              <button onClick={copyCode} title="Copy Code" className="p-1 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white">
                {codeCopied ? <Check size={14} className="text-seafoam" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
          
          <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />
          
          <MemberIndicator members={members} />
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-lg leading-none">{memberEmoji}</span>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-tight leading-none">Your Persona</span>
              <span className="text-xs text-white font-medium leading-tight">{memberName}</span>
            </div>
          </div>
          
          <button 
            onClick={onLeave} 
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all text-xs font-bold border border-red-500/20"
          >
            <LogOut size={14} />
            Leave Room
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Input Panel */}
        <div className="md:w-96 shrink-0 p-4 border-b md:border-b-0 md:border-r border-navy/10 overflow-y-auto">
          <p className="text-xs font-bold text-navy/40 uppercase tracking-wider mb-3">Your Contribution</p>
          {isProcessing ? <ProcessingStage /> : (
            <InputZone onSubmit={processInput} isProcessing={isProcessing} />
          )}
        </div>

        {/* Merged Dashboard */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <h2 className="text-sm font-bold text-navy/40 uppercase tracking-widest mb-4">
            Family Dashboard · {cards.length} insight{cards.length !== 1 ? 's' : ''}
          </h2>

          {cards.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center text-navy/30">
              <span className="text-4xl mb-3">🏠</span>
              <p className="text-sm font-medium">Waiting for family members to add inputs…</p>
              <p className="text-xs mt-1">Share your room code: <span className="font-mono font-bold">{roomCode}</span></p>
            </div>
          ) : (
            <div className="space-y-6">
              {(Object.entries(grouped) as [DomainType, RoomCard[]][]).map(([domain, domainCards]) => (
                <div key={domain}>
                  <div className="flex items-center gap-2 mb-3">
                    {DOMAIN_ICONS[domain]}
                    <h3 className="text-xs font-black uppercase tracking-widest text-navy/60">{domain.replace('_', ' ')}</h3>
                    <span className="text-[10px] bg-navy/5 text-navy/40 px-2 py-0.5 rounded-full font-bold">{domainCards.length}</span>
                  </div>
                  <div className={`rounded-xl border p-4 space-y-3 ${DOMAIN_COLORS[domain]}`}>
                    {domainCards.map(card => (
                      <div key={card.id} className="bg-white rounded-xl p-3 shadow-sm border border-white">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-sm font-bold text-navy">{card.title}</p>
                          <span className="text-sm" title={card.contributedBy}>{card.contributorEmoji}</span>
                        </div>
                        <p className="text-xs text-navy/60 leading-relaxed mb-2">{card.summary}</p>
                        {card.items.map((item, i) => (
                          <div key={i} className={`flex justify-between text-xs px-2 py-1 rounded-lg mt-1 ${
                            item.status === 'warning' ? 'bg-amber/10 text-amber' :
                            item.status === 'success' ? 'bg-seafoam/10 text-seafoam' :
                            'bg-navy/5 text-navy/70'
                          }`}>
                            <span className="font-bold uppercase tracking-wide opacity-60">{item.label}</span>
                            <span>{item.value}</span>
                          </div>
                        ))}
                        <p className="text-[9px] text-navy/30 mt-2 font-medium">Added by {card.contributorEmoji} {card.contributedBy}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
