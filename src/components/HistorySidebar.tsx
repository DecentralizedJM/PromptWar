'use client';

import { useState } from 'react';
import { HistoryItem } from '@/lib/types';
import { Clock, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { BridgeTheGapLogo } from '@/components/BridgeTheGapLogo';
import { cn } from '@/lib/utils';

export function HistorySidebar({
  history,
  onSelect
}: {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const domains = ['HEALTH', 'FINANCE', 'LOGISTICS', 'GOVERNMENT_LEGAL'];

  const filteredHistory = history.filter(h => {
    const matchesSearch = h.inputSummary.toLowerCase().includes(searchTerm.toLowerCase()) || 
      h.results.some(r => r.title.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filter === 'all' || h.results.some(r => r.domain === filter);
    
    return matchesSearch && matchesFilter;
  });

  const getDomainColor = (domain: string) => {
    switch (domain) {
      case 'HEALTH': return 'bg-health';
      case 'FINANCE': return 'bg-finance';
      case 'LOGISTICS': return 'bg-logistics';
      case 'GOVERNMENT_LEGAL': return 'bg-legal';
      default: return 'bg-muted';
    }
  };

  return (
    <aside 
      className={cn(
        "h-full glass border-r border-border flex flex-col transition-all duration-500 z-30 relative overflow-hidden",
        isCollapsed ? "w-20" : "w-80"
      )}
      aria-label="Bridge history"
    >
      {/* Header */}
      <div className={cn("p-6 flex items-center justify-between border-b border-border", isCollapsed && "px-4")}>
        {!isCollapsed && (
          <div className="flex min-w-0 items-center gap-2 animate-slide-up">
            <BridgeTheGapLogo size="lg" className="-translate-y-px" />
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "p-2 rounded-xl hover:bg-foreground/5 text-foreground/40 hover:text-foreground transition-all active:scale-90",
            isCollapsed && "mx-auto"
          )}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {!isCollapsed && (
        <>
          {/* Search & Filter */}
          <div className="p-4 space-y-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/20" />
              <input
                type="text"
                placeholder="Search history..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-secondary/30 border-glass rounded-xl py-2 pl-9 pr-4 text-xs font-bold text-foreground placeholder:text-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setFilter('all')}
                className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                  filter === 'all' ? "bg-primary text-primary-foreground" : "bg-foreground/5 text-foreground/40 hover:bg-foreground/10"
                )}
              >
                All
              </button>
              {domains.map(d => (
                <button
                  key={d}
                  onClick={() => setFilter(d)}
                  className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                    filter === d ? "bg-primary text-primary-foreground" : "bg-foreground/5 text-foreground/40 hover:bg-foreground/10"
                  )}
                >
                  {d.split('_')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline List */}
          <div className="flex-1 overflow-y-auto px-3 pb-8 space-y-2 no-scrollbar animate-slide-up" style={{ animationDelay: '200ms' }}>
            {filteredHistory.length === 0 ? (
              <div className="text-center p-12 flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center text-foreground/20">
                   <Clock size={24} />
                </div>
                <p className="text-[11px] font-bold text-foreground/30 uppercase tracking-[0.2em]">
                  No bridges found
                </p>
              </div>
            ) : (
              filteredHistory.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className="w-full text-left p-4 rounded-2xl hover:bg-foreground/5 border border-transparent hover:border-border transition-all group relative overflow-hidden"
                >
                  {/* Active Indicator Line */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-black text-foreground/20 group-hover:text-primary transition-colors">
                      {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: '2-digit' })}
                    </span>
                    <span className="text-[10px] font-mono font-black text-foreground/10 group-hover:text-foreground/30 transition-colors">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <h4 className="text-sm font-bold text-foreground/80 line-clamp-2 leading-relaxed mb-3 group-hover:text-foreground transition-colors">
                    &quot;{item.inputSummary}&quot;
                  </h4>
                  
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from(new Set(item.results.map(r => r.domain))).map(domain => (
                      <div 
                        key={domain} 
                        className={cn(
                          "w-2 h-2 rounded-full shadow-lg",
                          getDomainColor(domain)
                        )} 
                        title={domain}
                      />
                    ))}
                  </div>
                </button>
              ))
            )}
          </div>
        </>
      )}

      {/* Collapsed State Mini-Icons */}
      {isCollapsed && (
        <div className="flex-1 flex flex-col items-center pt-8 gap-6 animate-slide-up">
           <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
              <Clock size={16} />
           </div>
           {history.slice(0, 8).map(item => (
             <button
               key={item.id}
               onClick={() => onSelect(item)}
               className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center text-foreground/20 hover:text-primary hover:bg-primary/10 transition-all active:scale-90 relative group"
               title={item.inputSummary}
             >
                <div className={cn("w-2 h-2 rounded-full", getDomainColor(item.results[0]?.domain))} />
                <div className="absolute left-14 px-3 py-1.5 rounded-lg bg-card border-glass text-[10px] font-bold text-foreground opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-2xl">
                  {item.inputSummary.slice(0, 30)}...
                </div>
             </button>
           ))}
        </div>
      )}
    </aside>
  );
}
