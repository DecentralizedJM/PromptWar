'use client';

import { StructuredCard } from '@/lib/types';
import { Calendar, Mail, Bell, FileText, Languages, Check, Loader2 } from 'lucide-react';
import { useState } from 'react';

// Generates an ICS file
const generateIcs = (payload: Record<string, string>) => {
  const title = payload.title || 'Event';
  const description = payload.description || '';
  const location = payload.location || '';
  
  // Create a basic timestamp for right now if no date is provided
  // In a real app we'd parse the date
  const now = new Date();
  const later = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour later
  
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
  const [modalContent, setModalContent] = useState<{ title: string; content: string } | null>(null);

  const handleAction = (action: typeof card.actions[0], idx: number) => {
    setActiveAction(idx);
    
    setTimeout(() => {
      switch (action.type) {
        case 'ADD_CALENDAR':
          generateIcs(action.payload);
          break;
        case 'DRAFT_EMAIL':
          setModalContent({
            title: `Draft Email: ${action.payload.subject || 'Subject'}`,
            content: `To: ${action.payload.to || 'recipient@example.com'}\n\n${action.payload.body || ''}`
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
      case 'ADD_CALENDAR': return <Calendar size={16} />;
      case 'DRAFT_EMAIL': return <Mail size={16} />;
      case 'SET_REMINDER': return <Bell size={16} />;
      case 'GENERATE_PDF': return <FileText size={16} />;
      case 'TRANSLATE': return <Languages size={16} />;
      default: return <Check size={16} />;
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-navy/10 flex flex-wrap gap-2">
      {card.actions.map((action, idx) => (
        <button
          key={idx}
          onClick={() => handleAction(action, idx)}
          disabled={activeAction !== null}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full bg-navy/5 text-navy hover:bg-navy/10 transition-colors focus:ring-2 focus:ring-amber focus:outline-none"
        >
          {activeAction === idx ? <Loader2 size={16} className="animate-spin" /> : getIcon(action.type)}
          {action.label}
        </button>
      ))}

      {modalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/20 backdrop-blur-sm" onClick={() => setModalContent(null)}>
          <div className="bg-warmWhite p-6 rounded-2xl shadow-xl w-full max-w-lg border border-navy/10" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between flex-row items-center mb-4">
               <h3 className="text-xl font-heading font-bold text-navy">{modalContent.title}</h3>
               <button onClick={() => setModalContent(null)} className="text-navy/60 hover:text-navy px-2 text-xl font-bold">&times;</button>
            </div>
            <textarea className="w-full h-48 p-4 bg-white border border-navy/10 rounded-xl font-sans text-sm focus:outline-none focus:ring-2 focus:ring-seafoam" readOnly value={modalContent.content} />
            <div className="mt-4 flex justify-end gap-2">
              <button 
                className="px-4 py-2 bg-navy text-warmWhite rounded-lg hover:bg-navy/90 font-medium transition-colors cursor-pointer" 
                onClick={() => {
                  navigator.clipboard.writeText(modalContent.content);
                  setModalContent(null);
                }}
              >
                Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
