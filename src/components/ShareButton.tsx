'use client';

import { useState } from 'react';
import { Share2, Copy, Check, X, Loader2, QrCode } from 'lucide-react';
import { StructuredCard } from '@/lib/types';
import { QRCode } from '@/components/QRCode';

interface ShareButtonProps {
  cards: StructuredCard[];
  title?: string;
}

export function ShareButton({ cards, title }: ShareButtonProps) {
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle');
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    setState('loading');
    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards, title: title || 'My LifeBridge' }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const url = `${window.location.origin}/share/${data.shareId}`;
      setShareUrl(url);
      setState('done');
    } catch {
      setState('idle');
      alert('Failed to generate share link.');
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (state === 'done') {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={() => setState('idle')}
        role="dialog"
        aria-modal="true"
      >
        <div 
          className="w-full max-w-sm rounded-[2rem] bg-card border-glass shadow-navy-lg animate-slide-up overflow-hidden" 
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex justify-between items-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <div className="relative">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1">Bridge Share</p>
              <h3 className="text-xl font-heading font-black tracking-tight text-foreground leading-none">External Link</h3>
            </div>
            <button 
              onClick={() => setState('idle')} 
              className="p-2 rounded-xl hover:bg-white/5 text-foreground/20 hover:text-foreground transition-all relative z-10"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-8 flex flex-col items-center gap-6">
            <div className="p-4 bg-white rounded-[1.5rem] border-glass shadow-glow-seafoam relative group">
               <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-40 transition-opacity pointer-events-none" />
               <QRCode value={shareUrl} size={160} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 flex items-center gap-2">
               <QrCode size={12} /> Scan to bridge device
            </p>

            {/* Link Copy Zone */}
            <div className="w-full space-y-3">
              <div className="relative group">
                <input
                  readOnly
                  value={shareUrl}
                  className="w-full px-5 py-4 bg-secondary/30 border-glass rounded-2xl text-[10px] font-mono font-bold text-foreground/60 focus:outline-none truncate pr-14 transition-all group-hover:bg-secondary/50"
                />
                <button
                  onClick={copyLink}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-glow-seafoam active:scale-90"
                  title="Copy link"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
              
              <div className="flex items-center justify-between px-2">
                 <p className="text-[9px] font-black uppercase tracking-widest text-foreground/20">TTL: 7 DAYS</p>
                 {copied && <span className="text-[9px] font-black uppercase tracking-widest text-primary animate-in fade-in slide-in-from-right-2">Copied to clipboard</span>}
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-white/5 border-t border-white/5 text-center">
             <p className="text-[10px] font-medium text-foreground/30 italic">&quot;Secure, ephemeral, and structured.&quot;</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleShare}
      disabled={state === 'loading'}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border-glass text-foreground/40 hover:text-foreground hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
    >
      {state === 'loading' ? <Loader2 size={12} className="animate-spin" /> : <Share2 size={12} />}
      Share
    </button>
  );
}
