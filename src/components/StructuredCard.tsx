'use client';

import { useState } from 'react';
import { StructuredCard } from '@/lib/types';
import { ShieldCheck, HeartPulse, Landmark, Package, FileText, Search, Info } from 'lucide-react';
import { ActionEngine } from './ActionEngine';
import { ShareButton } from './ShareButton';
import { cn } from '@/lib/utils';

export function StructuredCardView({ card, allCards, index = 0 }: { card: StructuredCard; allCards?: StructuredCard[]; index?: number }) {
  const [showVerify, setShowVerify] = useState(false);

  const domainMap: Record<string, { class: string, text: string, icon: any }> = {
    'HEALTH': { class: 'border-l-health', text: 'text-health', icon: HeartPulse },
    'FINANCE': { class: 'border-l-finance', text: 'text-finance', icon: Landmark },
    'LOGISTICS': { class: 'border-l-logistics', text: 'text-logistics', icon: Package },
    'GOVERNMENT_LEGAL': { class: 'border-l-legal', text: 'text-legal', icon: FileText },
  };

  const domainInfo = domainMap[card.domain] || { class: 'border-l-muted', text: 'text-muted-foreground', icon: FileText };
  const Icon = domainInfo.icon;

  const confidenceColor = (c: number) => {
    if (c >= 85) return 'bg-primary';
    if (c >= 60) return 'bg-finance';
    return 'bg-destructive';
  };

  return (
    <article
      className={cn(
        "animate-slide-up rounded-2xl bg-card/40 backdrop-blur-xl border-glass border-l-4 shadow-navy hover:translate-y-[-2px] hover:shadow-navy-lg transition-all duration-300 overflow-hidden",
        domainInfo.class
      )}
      style={{ animationDelay: `${index * 150}ms` }}
    >
      {/* Header Section */}
      <div className="p-6 pb-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={cn("p-2.5 rounded-xl bg-white/5 border-glass", domainInfo.text)}>
              <Icon size={24} />
            </div>
            <div>
              <p className={cn("text-[10px] font-black uppercase tracking-[0.2em] mb-0.5 opacity-60", domainInfo.text)}>
                {card.domain.replace('_', ' ')}
              </p>
              <h3 className="text-lg font-heading font-black tracking-tight text-foreground">{card.title}</h3>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 min-w-[100px]">
               <span className="text-[10px] font-mono text-foreground/40 font-bold uppercase tracking-wider">Confidence</span>
               <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                 <div 
                   className={cn("h-full rounded-full transition-all duration-1000", confidenceColor(card.confidenceScore))}
                   style={{ width: `${card.confidenceScore}%` }}
                   role="progressbar"
                   aria-valuenow={card.confidenceScore}
                 />
               </div>
               <span className="text-[10px] font-mono font-bold text-foreground/60">{card.confidenceScore}%</span>
            </div>
            <ShareButton cards={allCards ?? [card]} title={card.title} />
          </div>
        </div>
        
        <p className="mt-4 text-sm text-foreground/70 leading-relaxed font-medium">
          {card.summary}
        </p>
      </div>

      {/* Structured Elements */}
      <div className="p-6 space-y-3">
        {card.items.map((item, idx) => (
          <div key={idx} className="flex items-baseline gap-4 group">
            <span className="text-[11px] font-bold text-foreground/30 uppercase tracking-widest min-w-[120px] shrink-0 group-hover:text-foreground/50 transition-colors">
              {item.label}
            </span>
            <div className="flex-1 border-b border-dashed border-white/5 mb-[0.3rem]" />
            <span className={cn(
              "text-sm font-mono font-bold tracking-tight",
              item.status === 'warning' ? 'text-finance' : 
              item.status === 'success' ? 'text-health' : 
              'text-foreground/90'
            )}>
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {/* Verification / AI Logic Section */}
      {showVerify && (
        <div className="mx-6 mb-4 p-5 rounded-2xl bg-secondary/30 border-glass animate-crystallize">
          <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest mb-2">
            <ShieldCheck size={14} />
            AI Reasoning & Verification
          </div>
          <p className="text-xs leading-relaxed text-foreground/60 font-medium italic">
            "{card.logicReasoning}"
          </p>
        </div>
      )}

      {/* Footer Actions */}
      <div className="px-6 pb-6 flex flex-wrap items-center gap-3">
        <ActionEngine card={card} />
        
        <button
          onClick={() => setShowVerify(!showVerify)}
          className={cn(
            "px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 border-glass",
            showVerify ? "bg-primary text-primary-foreground" : "bg-white/5 text-foreground/40 hover:text-foreground hover:bg-white/10"
          )}
        >
          {showVerify ? <Info size={14} /> : <Search size={14} />}
          {showVerify ? "Hide Insight" : "View Insight"}
        </button>
      </div>
    </article>
  );
}
