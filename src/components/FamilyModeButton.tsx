'use client';

import { useState } from 'react';
import { Users, X, Loader2, Plus, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FamilyModeButtonProps {
  onRoomJoined: (roomCode: string, memberId: string, memberEmoji: string, memberName: string) => void;
}

export function FamilyModeButton({ onRoomJoined }: FamilyModeButtonProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reset = () => { setMode('menu'); setName(''); setCode(''); setError(''); setLoading(false); };

  const createRoom = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberName: name.trim() || undefined }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setOpen(false); reset();
      onRoomJoined(data.roomCode, data.memberId, data.emoji, data.name);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create room.');
    } finally { setLoading(false); }
  };

  const joinRoom = async () => {
    if (code.length !== 6) { setError('Room code must be 6 characters.'); return; }
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ code: code.toUpperCase(), ...(name.trim() && { name: name.trim() }) });
      const res = await fetch(`/api/rooms?${params}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setOpen(false); reset();
      onRoomJoined(data.roomCode, data.memberId, data.emoji, data.name);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Room not found.');
    } finally { setLoading(false); }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-foreground/5 border-glass text-foreground/40 hover:text-foreground hover:bg-foreground/10 font-black text-[11px] uppercase tracking-widest transition-all active:scale-95"
      >
        <Users size={14} />
        Family Mode
      </button>

      {open && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-md animate-in fade-in duration-300" 
          onClick={() => { if (!loading) { setOpen(false); reset(); } }}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="w-full max-w-sm rounded-[2rem] bg-card border-glass shadow-navy-lg animate-slide-up overflow-hidden" 
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-border flex justify-between items-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              <div className="relative">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1">Collaborative</p>
                <h3 className="text-xl font-heading font-black tracking-tight text-foreground leading-none">
                  {mode === 'menu' ? 'Family Mode' : mode === 'create' ? 'Create Space' : 'Join Space'}
                </h3>
              </div>
              {!loading && (
                <button 
                  onClick={() => { setOpen(false); reset(); }} 
                  className="p-2 rounded-xl hover:bg-foreground/5 text-foreground/20 hover:text-foreground transition-all relative z-10"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            <div className="p-8">
              {mode === 'menu' && (
                <div className="space-y-4">
                  <p className="text-xs text-foreground/40 mb-6 leading-relaxed font-medium">
                    Bridge together. Everyone contributes inputs — LifeBridge merges them into one unified dashboard.
                  </p>
                  <button 
                    onClick={() => setMode('create')} 
                    className="w-full flex items-center gap-4 p-5 rounded-2xl bg-secondary/30 border-glass hover:bg-secondary/50 transition-all text-left group active:scale-[0.98]"
                  >
                    <div className="p-3 bg-primary/10 rounded-2xl group-hover:bg-primary/20 transition-colors text-primary">
                      <Plus size={20} />
                    </div>
                    <div>
                      <p className="font-black text-xs uppercase tracking-widest text-foreground">Create Space</p>
                      <p className="text-[10px] text-foreground/30 font-bold mt-0.5">Generate a 6-digit code</p>
                    </div>
                  </button>
                  <button 
                    onClick={() => setMode('join')} 
                    className="w-full flex items-center gap-4 p-5 rounded-2xl bg-secondary/30 border-glass hover:bg-secondary/50 transition-all text-left group active:scale-[0.98]"
                  >
                    <div className="p-3 bg-accent/10 rounded-2xl group-hover:bg-accent/20 transition-colors text-accent">
                      <LogIn size={20} />
                    </div>
                    <div>
                      <p className="font-black text-xs uppercase tracking-widest text-foreground">Join Space</p>
                      <p className="text-[10px] text-foreground/30 font-bold mt-0.5">Enter existing code</p>
                    </div>
                  </button>
                </div>
              )}

              {(mode === 'create' || mode === 'join') && (
                <div className="space-y-5">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 block mb-2">Display Name</label>
                    <input
                      type="text"
                      autoFocus
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Mom, Dad, Alex"
                      maxLength={20}
                      className="w-full px-5 py-3 bg-secondary/30 border-glass rounded-xl text-sm font-bold text-foreground placeholder:text-foreground/10 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  {mode === 'join' && (
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 block mb-2">Room Code</label>
                      <input
                        type="text"
                        value={code}
                        onChange={e => setCode(e.target.value.toUpperCase().slice(0, 6))}
                        placeholder="A3F9K2"
                        className="w-full px-5 py-4 bg-secondary/30 border-glass rounded-xl text-xl font-mono text-center font-black tracking-[0.5em] text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 uppercase"
                      />
                    </div>
                  )}

                  {error && (
                    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-[10px] font-bold text-destructive uppercase tracking-widest flex items-center gap-2">
                       <X size={12} /> {error}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button 
                      onClick={() => { setMode('menu'); setError(''); }} 
                      className="flex-1 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-foreground/30 hover:text-foreground hover:bg-foreground/5 transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={mode === 'create' ? createRoom : joinRoom}
                      disabled={loading}
                      className={cn(
                        "flex-1 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary-foreground transition-all flex items-center justify-center gap-2 active:scale-95 shadow-glow-seafoam",
                        mode === 'create' ? "bg-primary" : "bg-primary shadow-glow-seafoam"
                      )}
                    >
                      {loading ? <Loader2 size={14} className="animate-spin" /> : (mode === 'create' ? 'Create' : 'Join')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
