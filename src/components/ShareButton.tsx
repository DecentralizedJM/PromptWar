'use client';

import { useState } from 'react';
import { Share2, Copy, Check, X, Loader2 } from 'lucide-react';
import { StructuredCard } from '@/lib/types';
import { QRCode } from './QRCode';

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
      alert('Failed to create share link. Make sure Firebase is configured.');
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (state === 'done') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/30 backdrop-blur-sm" onClick={() => setState('idle')}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-navy/10 overflow-hidden" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="p-5 bg-gradient-to-br from-seafoam/10 to-white border-b border-navy/5 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-seafoam">Bridge Share</p>
              <h3 className="text-lg font-heading font-bold text-navy mt-0.5">Share this insight</h3>
            </div>
            <button onClick={() => setState('idle')} className="p-2 rounded-full hover:bg-navy/5 text-navy/40 hover:text-navy transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* QR Code */}
          <div className="p-6 flex flex-col items-center gap-4">
            <div className="p-3 bg-warmWhite rounded-xl border border-navy/10">
              <QRCode value={shareUrl} size={160} />
            </div>
            <p className="text-xs text-navy/50 text-center">Scan to view on any device</p>

            {/* Link */}
            <div className="w-full flex gap-2">
              <input
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2 text-xs bg-warmWhite border border-navy/10 rounded-xl font-mono text-navy/70 focus:outline-none truncate"
              />
              <button
                onClick={copyLink}
                className="px-3 py-2 rounded-xl bg-navy text-white hover:bg-navy/90 transition-colors flex items-center gap-1.5 text-xs font-bold shrink-0"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <p className="text-[10px] text-navy/30">Link expires in 7 days</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleShare}
      disabled={state === 'loading'}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full border border-seafoam/30 text-seafoam hover:bg-seafoam/10 transition-colors focus:outline-none focus:ring-2 focus:ring-seafoam disabled:opacity-50"
    >
      {state === 'loading' ? <Loader2 size={13} className="animate-spin" /> : <Share2 size={13} />}
      Share
    </button>
  );
}
