'use client';

import { HistoryItem } from '@/lib/types';
import { Clock, Search, Bot } from 'lucide-react';
import { useState } from 'react';

export function HistorySidebar({
  history,
  onSelect
}: {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = history.filter(h => 
    h.inputSummary.toLowerCase().includes(searchTerm.toLowerCase()) || 
    h.results.some(r => r.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="w-full sm:w-80 h-full bg-warmWhite/50 backdrop-blur-md border-r border-navy/5 flex flex-col pt-6 sm:fixed sm:inset-y-0 sm:left-0 z-20">
      
      <div className="px-6 pb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-navy text-warmWhite rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3">
          <Bot size={24} />
        </div>
        <h1 className="text-2xl font-heading font-black tracking-tight text-navy">
          LifeBridge
        </h1>
      </div>

      <div className="px-6 pb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/30" />
          <input
            type="text"
            placeholder="Search past bridges..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-navy/10 rounded-xl py-2 pl-9 pr-4 text-sm font-medium text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-seafoam"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-20 sm:pb-4 space-y-2 no-scrollbar">
        {filteredHistory.length === 0 ? (
          <div className="text-center p-6 text-navy/40 text-sm">
            <Clock className="mx-auto mb-2 opacity-30" />
            No history yet. Start bridging.
          </div>
        ) : (
          filteredHistory.map(item => (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className="w-full text-left p-4 rounded-2xl hover:bg-white border border-transparent hover:border-navy/5 transition-all group flex flex-col gap-1"
            >
              <div className="text-xs font-bold text-navy/40 uppercase tracking-wider">
                {new Date(item.timestamp).toLocaleDateString()}
              </div>
              <div className="text-sm font-medium text-navy line-clamp-2 leading-relaxed">
                &quot;{item.inputSummary}&quot;
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {item.results.map(r => (
                  <span key={r.id} className="text-[10px] px-2 py-0.5 bg-navy/5 text-navy/60 rounded-full">
                    {r.domain}
                  </span>
                ))}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
