'use client';

import { StructuredCard } from '@/lib/types';
import { ShieldCheck, HeartPulse, Landmark, Package, FileText } from 'lucide-react';
import { ActionEngine } from './ActionEngine';

export function StructuredCardView({ card }: { card: StructuredCard }) {
  const getDomainIcon = (domain: string) => {
    switch (domain) {
      case 'HEALTH': return <HeartPulse className="text-amber" />;
      case 'FINANCE': return <Landmark className="text-seafoam" />;
      case 'LOGISTICS': return <Package className="text-navy" />;
      case 'GOVERNMENT_LEGAL': return <FileText className="text-amber" />;
      default: return <FileText className="text-navy/60" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-navy/10 overflow-hidden flex flex-col transition-all hover:shadow-md animate-shatter-merge">
      {/* Header */}
      <div className="p-5 border-b border-navy/5 bg-gradient-to-br from-white to-navy/[0.02]">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warmWhite rounded-xl border border-navy/5">
              {getDomainIcon(card.domain)}
            </div>
            <div>
              <p className="text-xs font-bold tracking-wider text-navy/50 uppercase">{card.domain.replace('_', ' ')}</p>
              <h3 className="text-lg font-heading font-bold text-navy">{card.title}</h3>
            </div>
          </div>
          <div className="flex flex-col items-end">
             {/* Verification badge */}
             <div className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-seafoam/10 text-seafoam">
               <ShieldCheck size={14} /> verified
             </div>
             <div className="text-[10px] text-navy/40 mt-1 uppercase tracking-wide">
               {card.confidenceScore >= 90 ? 'High Confidence' : 'Review Suggested'}
             </div>
          </div>
        </div>
        <p className="text-sm text-navy/70 leading-relaxed mt-3">{card.summary}</p>
      </div>

      {/* Items List */}
      <div className="p-5 flex-1 flex flex-col gap-3 bg-white">
        {card.items.map((item, idx) => (
          <div key={idx} className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
            item.status === 'warning' ? 'bg-amber/5 border-amber/20' :
            item.status === 'success' ? 'bg-seafoam/5 border-seafoam/20' :
            'bg-warmWhite border-transparent'
          }`}>
            <span className="text-xs font-bold text-navy/60 uppercase tracking-widest">{item.label}</span>
            <span className={`text-sm font-medium text-right ${
              item.status === 'warning' ? 'text-amber' :
              item.status === 'success' ? 'text-seafoam' :
              'text-navy'
            }`}>{item.value}</span>
            {item.status === 'warning' && (
               <div className="absolute top-0 right-0 -mt-1 -mr-1 w-3 h-3 bg-amber rounded-full animate-ping"></div>
            )}
          </div>
        ))}
        
        <ActionEngine card={card} />
      </div>
    </div>
  );
}
