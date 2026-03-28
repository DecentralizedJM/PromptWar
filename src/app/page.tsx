'use client';

import { useState, useEffect } from 'react';
import { HistorySidebar } from '@/components/HistorySidebar';
import { InputZone } from '@/components/InputZone';
import { ProcessingStage } from '@/components/ProcessingStage';
import { StructuredCardView } from '@/components/StructuredCard';
import { HistoryItem, StructuredCard } from '@/lib/types';
import { submitToGemini } from './actions';

export default function Home() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeResults, setActiveResults] = useState<StructuredCard[] | null>(null);
  
  useEffect(() => {
    const saved = localStorage.getItem('lifebridge-history');
    if (saved) {
      try {
        // eslint-disable-next-line
        setHistory(JSON.parse(saved));
      } catch (err) { }
    }
  }, []);

  const saveHistory = (items: HistoryItem[]) => {
    setHistory(items);
    localStorage.setItem('lifebridge-history', JSON.stringify(items));
  };

  const processInput = async (text: string, images: {data: string, mimeType: string}[]) => {
    setIsProcessing(true);
    setActiveResults(null);

    const result = await submitToGemini(text, images);
    
    if (result.error) {
       alert('Error: ' + result.error);
       setIsProcessing(false);
       return;
    }

    if (result.cards && result.cards.length > 0) {
      setActiveResults(result.cards);
      
      const newItem: HistoryItem = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        inputSummary: text.slice(0, 60) + (text.length > 60 ? '...' : '') || 'Image/Audio Input',
        results: result.cards
      };
      
      saveHistory([newItem, ...history]);
    } else {
      alert('No structured actions could be extracted from this input.');
    }
    
    setIsProcessing(false);
  };

  return (
    <main className="flex h-screen w-full bg-[#fafaf8] text-[#1a2744] overflow-hidden">
      
      <div className="hidden sm:block w-80 flex-shrink-0">
         <HistorySidebar history={history} onSelect={item => setActiveResults(item.results)} />
      </div>

      <div className="flex-1 flex flex-col items-center overflow-y-auto pb-32 pt-12 px-4 sm:px-12 relative w-full">
         
         <div className="w-full max-w-3xl flex-1 flex flex-col">
            <h1 className="text-4xl md:text-5xl font-heading font-black text-center mb-4 tracking-tight">
               Bridge the gap.
            </h1>
            <p className="text-center text-[#1a2744]/50 text-lg md:text-xl font-medium mb-12 text-balance leading-relaxed">
               Drop messy notes, photos, or voice memos and turn them into clear, actionable next steps.
            </p>

            <div className="w-full z-10 relative">
               <InputZone onSubmit={processInput} isProcessing={isProcessing} />
            </div>

            <div className="mt-12 w-full flex-1 relative">
               {isProcessing ? (
                 <ProcessingStage />
               ) : activeResults ? (
                 <div className="space-y-6 pb-12 w-full">
                   <h2 className="text-xl font-heading font-bold text-[#1a2744]/40 uppercase tracking-widest text-center mb-8">Structured Output</h2>
                   <div className="grid grid-cols-1 gap-6 w-full relative z-0">
                     {activeResults.map((card, idx) => (
                       <StructuredCardView key={card.id || idx} card={card} />
                     ))}
                   </div>
                 </div>
               ) : (
                 <div className="w-full text-center mt-24">
                   <div className="flex flex-col sm:flex-row justify-center gap-4 opacity-50">
                      <button onClick={() => processInput("I take 20mg Lisinopril every morning and just got prescribed 400mg Ibuprofen for my knee pain. Should I be worried?", [])} className="px-5 py-3 border-2 border-[#1a2744]/10 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#1a2744]/5 hover:border-[#1a2744]/20 transition-all cursor-pointer">
                        Demo: Medication Check
                      </button>
                      <button onClick={() => processInput("Got an urgent notice from PG&E. Bill is $245.80 due on Oct 15th. Disconnection warning.", [])} className="px-5 py-3 border-2 border-[#1a2744]/10 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#1a2744]/5 hover:border-[#1a2744]/20 transition-all cursor-pointer">
                        Demo: Urgent Bill
                      </button>
                   </div>
                 </div>
               )}
            </div>
         </div>
      </div>
    </main>
  );
}
