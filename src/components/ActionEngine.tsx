'use client';

import { StructuredCard } from '@/lib/types';
import { Calendar, Mail, Bell, FileText, Languages, Check, Loader2, X, Copy, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

// Generates an ICS file
const generateIcs = (payload: Record<string, string>) => {
  const title = payload.title || 'Event';
  const description = payload.description || '';
  const location = payload.location || '';
  
  const now = new Date();
  const later = new Date(now.getTime() + 60 * 60 * 1000); 
  
  const formatDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART:${formatDate(now)}`,
    `DTEND:${formatDate(later)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\n');
  
  const blob = new Blob([ics], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/\s+/g, '_')}.ics`;
  a.click();
  URL.revokeObjectURL(url);
};

export function ActionEngine({ card }: { card: StructuredCard }) {
  const [activeAction, setActiveAction] = useState<number | null>(null);
  const [modalContent, setModalContent] = useState<{ title: string; content: string; subject?: string; to?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleAction = (action: typeof card.actions[0], idx: number) => {
    setActiveAction(idx);
    
    setTimeout(() => {
      switch (action.type) {
        case 'ADD_CALENDAR':
          generateIcs(action.payload);
          break;
        case 'DRAFT_EMAIL':
          setModalContent({
            title: `Draft Email`,
            subject: action.payload.subject || 'Subject',
            to: action.payload.to || 'recipient@example.com',
            content: action.payload.body || ''
          });
          break;
        case 'SET_REMINDER':
          alert(`Reminder set: ${action.label}`);
          break;
        case 'GENERATE_PDF':
          alert('Generating PDF summary...');
          break;
        case 'TRANSLATE':
          alert('Translating contents...');
          break;
      }
      setActiveAction(null);
    }, 600);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'ADD_CALENDAR': return <Calendar size={14} />;
      case 'DRAFT_EMAIL': return <Mail size={14} />;
      case 'SET_REMINDER': return <Bell size={14} />;
      case 'GENERATE_PDF': return <FileText size={14} />;
      case 'TRANSLATE': return <Languages size={14} />;
      default: return <Check size={14} />;
    }
  };

  const handleCopy = () => {
    if (!modalContent) return;
    const fullText = modalContent.subject 
      ? `To: ${modalContent.to}\nSubject: ${modalContent.subject}\n\n${modalContent.content}`
      : modalContent.content;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenMail = () => {
    if (!modalContent) return;
    window.open(`mailto:${modalContent.to}?subject=${encodeURIComponent(modalContent.subject || '')}&body=${encodeURIComponent(modalContent.content)}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {card.actions.map((action, idx) => (
        <button
          key={idx}
          onClick={() => handleAction(action, idx)}
          disabled={activeAction !== null}
          className={cn(
            "px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all duration-200 flex items-center gap-2 border-glass active:scale-95",
            activeAction === idx 
              ? "bg-primary text-primary-foreground" 
              : "bg-foreground/5 text-foreground/40 hover:text-foreground hover:bg-foreground/10"
          )}
        >
          {activeAction === idx ? <Loader2 size={14} className="animate-spin" /> : getIcon(action.type)}
          {action.label}
        </button>
      ))}

      {modalContent && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-md animate-in fade-in duration-300" 
          onClick={() => setModalContent(null)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="w-full max-w-lg rounded-2xl bg-card border-glass shadow-navy-lg animate-slide-up overflow-hidden" 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-glass">
              <h3 className="text-sm font-black uppercase tracking-[0.2em]">{modalContent.title}</h3>
              <button 
                onClick={() => setModalContent(null)} 
                className="p-1.5 rounded-lg hover:bg-foreground/5 text-foreground/40 hover:text-foreground transition-all"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {modalContent.to && (
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 mb-1.5 block">Recipient</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={modalContent.to} 
                    className="w-full bg-secondary/30 border-glass rounded-xl px-4 py-2.5 text-sm font-medium text-foreground/80 focus:outline-none"
                  />
                </div>
              )}
              {modalContent.subject && (
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 mb-1.5 block">Subject</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={modalContent.subject} 
                    className="w-full bg-secondary/30 border-glass rounded-xl px-4 py-2.5 text-sm font-medium text-foreground/80 focus:outline-none"
                  />
                </div>
              )}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 mb-1.5 block">Message Content</label>
                <textarea 
                  className="w-full h-48 p-4 bg-secondary/30 border-glass rounded-xl font-mono text-xs text-foreground/80 leading-relaxed resize-none focus:outline-none" 
                  readOnly 
                  value={modalContent.content} 
                />
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t border-glass">
              <button 
                className="flex-1 px-4 py-2.5 rounded-xl bg-secondary/50 text-foreground text-xs font-black uppercase tracking-widest hover:bg-secondary transition-all flex items-center justify-center gap-2 active:scale-95" 
                onClick={handleCopy}
              >
                <Copy size={14} />
                {copied ? 'Copied' : 'Copy'}
              </button>
              {modalContent.to && (
                <button 
                  className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest hover:shadow-glow-seafoam transition-all flex items-center justify-center gap-2 active:scale-95" 
                  onClick={handleOpenMail}
                >
                  <ExternalLink size={14} />
                  Send Magic
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
