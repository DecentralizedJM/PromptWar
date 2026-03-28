import { fetchSharedBridgeById } from '@/lib/shared-bridge-server';
import { notFound } from 'next/navigation';
import {
  HeartPulse,
  Landmark,
  Package,
  FileText,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { BridgeTheGapLogo } from '@/components/BridgeTheGapLogo';
import { cn } from '@/lib/utils';

export default async function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const bridge = await fetchSharedBridgeById(id);
  if (!bridge) return notFound();

  const DOMAIN_MAP: Record<string, { class: string; text: string; icon: LucideIcon }> = {
    HEALTH: { class: 'border-l-health', text: 'text-health', icon: HeartPulse },
    FINANCE: { class: 'border-l-finance', text: 'text-finance', icon: Landmark },
    LOGISTICS: { class: 'border-l-logistics', text: 'text-logistics', icon: Package },
    GOVERNMENT_LEGAL: { class: 'border-l-legal', text: 'text-legal', icon: FileText },
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden selection:bg-primary/30 font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[60vw] h-[60vh] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[50vw] h-[50vh] bg-accent/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />
      <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none" />

      {/* Brand header */}
      <header className="glass border-b border-border px-6 py-6 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex min-w-0 items-center gap-3 group">
          <BridgeTheGapLogo size="lg" className="shrink-0 group-hover:opacity-90 transition-opacity" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30 leading-none">
            Shared Insight
          </p>
        </Link>
        <div className="text-right hidden sm:block">
          <div className="flex items-center gap-2 px-4 py-2 bg-foreground/5 border-glass rounded-2xl">
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/20">ID:</span>
            <span className="text-xs font-mono font-bold text-foreground/40">{id}</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-16 relative z-10">
        <div className="flex items-center justify-center gap-3 mb-10 opacity-40 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Sparkles size={16} aria-hidden />
          <p className="text-xs font-black uppercase tracking-[0.3em]">Synthesis Complete</p>
        </div>

        {/* Cards */}
        <div className="space-y-10">
          {bridge.cards.map((card, idx) => {
            const info = DOMAIN_MAP[card.domain] || {
              class: 'border-l-muted',
              text: 'text-muted-foreground',
              icon: FileText,
            };
            const Icon = info.icon;

            return (
              <article
                key={card.id || idx}
                className={cn(
                  'relative group rounded-[2.5rem] bg-card/40 backdrop-blur-xl border-glass border-l-4 p-8 shadow-navy-lg transition-all duration-500 hover:translate-y-[-4px] animate-in fade-in slide-in-from-bottom-8',
                  info.class
                )}
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={cn('p-3 rounded-2xl bg-foreground/5 border-glass', info.text)}>
                      <Icon size={20} aria-hidden />
                    </div>
                    <div>
                      <p className="text-[10px] font-black tracking-[0.3em] text-foreground/30 uppercase">
                        {card.domain.replace('_', ' ')}
                      </p>
                      <h2 className="text-2xl font-heading font-black tracking-tight text-foreground">{card.title}</h2>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-glow-seafoam shrink-0">
                    <ShieldCheck size={12} aria-hidden />
                    {card.confidenceScore}% Quality
                  </div>
                </div>

                <p className="text-base text-foreground/60 leading-relaxed font-medium mb-8">{card.summary}</p>

                {card.logicReasoning && (
                  <div className="mb-8 p-6 bg-primary/5 border border-primary/10 rounded-[1.5rem] relative overflow-hidden group/insight">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/insight:opacity-20 transition-opacity">
                      <Sparkles size={40} aria-hidden />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2">Bridge Context</p>
                    <p className="text-sm text-foreground/80 font-medium italic leading-relaxed relative z-10">
                      &ldquo;{card.logicReasoning}&rdquo;
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {card.items.map((item, i) => (
                    <div
                      key={i}
                      className={cn(
                        'px-4 py-3 rounded-2xl flex justify-between items-center text-sm border-glass transition-all duration-300',
                        item.status === 'warning'
                          ? 'bg-accent/10 text-accent group-hover:bg-accent/20'
                          : item.status === 'success'
                            ? 'bg-health/10 text-health group-hover:bg-health/20'
                            : 'bg-foreground/5 text-foreground/70 group-hover:bg-foreground/10'
                      )}
                    >
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">{item.label}</span>
                      <span className="font-bold font-mono tracking-tight">{item.value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-2 opacity-20">
                    <Sparkles size={14} aria-hidden />
                    <span className="text-[9px] font-black uppercase tracking-widest leading-none">
                      AI Synthesized Result
                    </span>
                  </div>
                  <span className="text-[9px] font-mono font-black text-foreground/10 uppercase tracking-widest">
                    Hash Verified
                  </span>
                </div>
              </article>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-20 rounded-[3rem] bg-card border-glass p-12 text-center relative overflow-hidden group shadow-navy-lg animate-in fade-in slide-in-from-bottom-12 duration-1000">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-foreground/5 border-glass rounded-[1.5rem] flex items-center justify-center text-3xl mb-6 shadow-2xl" aria-hidden>
              ⚡️
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-primary mb-3">Experience Unity</p>
            <h2 className="text-4xl font-heading font-black tracking-tighter mb-4 text-balance">Process your own documents.</h2>
            <p className="text-foreground/40 text-lg font-medium mb-10 max-w-sm mx-auto leading-relaxed">
              Synthesize messy human intent into clear, actionable next steps instantly.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground font-black text-xs uppercase tracking-[0.2em] rounded-full hover:bg-primary/90 transition-all shadow-glow-seafoam active:scale-95 translate-y-0 group-hover:-translate-y-1"
            >
              Bridge My Life
              <ExternalLink size={16} aria-hidden />
            </Link>
          </div>
        </div>

        <footer className="mt-20 text-center opacity-20 group">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] group-hover:tracking-[0.6em] transition-all duration-700 cursor-default">
            LIFEBRIDGE
          </p>
        </footer>
      </main>
    </div>
  );
}
