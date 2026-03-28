import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { SharedBridge } from '@/lib/types';
import { notFound } from 'next/navigation';
import { HeartPulse, Landmark, Package, FileText, ShieldCheck, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default async function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  let bridge: SharedBridge | null = null;
  try {
    const snap = await getDoc(doc(db, 'shares', id));
    if (!snap.exists()) return notFound();
    bridge = snap.data() as SharedBridge;
    if (Date.now() > bridge.expiresAt) return notFound();
  } catch {
    return notFound();
  }

  const getDomainIcon = (domain: string) => {
    switch (domain) {
      case 'HEALTH': return <HeartPulse className="text-amber-500" size={18} />;
      case 'FINANCE': return <Landmark className="text-teal-500" size={18} />;
      case 'LOGISTICS': return <Package className="text-blue-500" size={18} />;
      case 'GOVERNMENT_LEGAL': return <FileText className="text-amber-500" size={18} />;
      default: return <FileText className="text-gray-400" size={18} />;
    }
  };

  const getDomainColor = (domain: string) => {
    switch (domain) {
      case 'HEALTH': return 'border-l-amber-400';
      case 'FINANCE': return 'border-l-teal-400';
      case 'LOGISTICS': return 'border-l-blue-400';
      case 'GOVERNMENT_LEGAL': return 'border-l-amber-400';
      default: return 'border-l-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      {/* LifeBridge Header */}
      <header className="bg-[#1a2744] text-white px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-teal-400 mb-0.5">LifeBridge</p>
          <h1 className="text-lg font-bold">Shared Bridge</h1>
        </div>
        <div className="text-right">
          <p className="text-xs text-white/40">Shared insight</p>
          <p className="text-xs text-white/60 font-mono">{id}</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        <p className="text-center text-[#1a2744]/50 text-sm mb-8">
          Someone shared a structured life insight with you via LifeBridge.
        </p>

        {/* Cards */}
        <div className="space-y-6">
          {bridge.cards.map((card, idx) => (
            <article key={card.id || idx} className={`bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 ${getDomainColor(card.domain)} overflow-hidden`}>
              <div className="p-5 border-b border-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 rounded-xl">
                      {getDomainIcon(card.domain)}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">{card.domain.replace('_', ' ')}</p>
                      <h2 className="text-base font-bold text-[#1a2744]">{card.title}</h2>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-teal-50 text-teal-600">
                    <ShieldCheck size={12} />
                    {card.confidenceScore}%
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{card.summary}</p>

                {card.logicReasoning && (
                  <div className="mt-3 p-3 bg-teal-50/50 border border-teal-100 rounded-xl">
                    <p className="text-[9px] font-black uppercase tracking-widest text-teal-500 mb-1">AI Insight</p>
                    <p className="text-xs text-teal-700 italic leading-relaxed">{card.logicReasoning}</p>
                  </div>
                )}
              </div>

              <div className="p-5 space-y-2">
                {card.items.map((item, i) => (
                  <div key={i} className={`px-3 py-2 rounded-lg flex justify-between items-center text-sm ${
                    item.status === 'warning' ? 'bg-amber-50 text-amber-700' :
                    item.status === 'success' ? 'bg-teal-50 text-teal-700' :
                    'bg-gray-50 text-gray-700'
                  }`}>
                    <span className="text-xs font-bold uppercase tracking-wider opacity-60">{item.label}</span>
                    <span className="font-medium text-right">{item.value}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-2xl bg-[#1a2744] text-white p-8 text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-teal-400 mb-2">LifeBridge</p>
          <h2 className="text-xl font-bold mb-3">Process your own documents</h2>
          <p className="text-white/60 text-sm mb-6 max-w-sm mx-auto">
            Drop any messy text, photo, or voice memo. Get structured, actionable insights instantly — powered by Gemini 3.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-400 text-[#1a2744] font-bold rounded-full hover:bg-teal-300 transition-colors"
          >
            Try LifeBridge Free
            <ExternalLink size={16} />
          </Link>
        </div>
      </main>
    </div>
  );
}
