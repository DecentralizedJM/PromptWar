'use client';

import { useState } from 'react';
import { Users, X, Loader2, Plus, LogIn } from 'lucide-react';

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
      setError(e instanceof Error ? e.message : 'Failed to create room. Check Firebase config.');
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
      setError(e instanceof Error ? e.message : 'Room not found. Check the code.');
    } finally { setLoading(false); }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-amber/30 text-amber bg-amber/5 hover:bg-amber/10 font-bold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-amber"
      >
        <Users size={15} />
        Family Mode
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/30 backdrop-blur-sm" onClick={() => { if (!loading) { setOpen(false); reset(); } }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-navy/10 overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="p-5 bg-gradient-to-br from-amber/10 to-white border-b border-navy/5 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-amber">Family Mode</p>
                <h3 className="text-lg font-heading font-bold text-navy mt-0.5">
                  {mode === 'menu' ? 'Collaborate with family' : mode === 'create' ? 'Create a room' : 'Join a room'}
                </h3>
              </div>
              {!loading && (
                <button onClick={() => { setOpen(false); reset(); }} className="p-2 rounded-full hover:bg-navy/5 text-navy/40 hover:text-navy transition-colors">
                  <X size={18} />
                </button>
              )}
            </div>

            <div className="p-6">
              {mode === 'menu' && (
                <div className="space-y-3">
                  <p className="text-sm text-navy/60 mb-4 leading-relaxed">
                    Share a room code with family members. Everyone contributes inputs — LifeBridge merges them into one unified dashboard.
                  </p>
                  <button onClick={() => setMode('create')} className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-seafoam/20 hover:border-seafoam/40 hover:bg-seafoam/5 transition-all text-left group">
                    <div className="p-2 bg-seafoam/10 rounded-xl group-hover:bg-seafoam/20 transition-colors"><Plus size={18} className="text-seafoam" /></div>
                    <div><p className="font-bold text-navy">Create Room</p><p className="text-xs text-navy/50">Get a 6-digit code to share</p></div>
                  </button>
                  <button onClick={() => setMode('join')} className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-amber/20 hover:border-amber/40 hover:bg-amber/5 transition-all text-left group">
                    <div className="p-2 bg-amber/10 rounded-xl group-hover:bg-amber/20 transition-colors"><LogIn size={18} className="text-amber" /></div>
                    <div><p className="font-bold text-navy">Join Room</p><p className="text-xs text-navy/50">Enter an existing room code</p></div>
                  </button>
                </div>
              )}

              {(mode === 'create' || mode === 'join') && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-navy/60 uppercase tracking-wider block mb-1.5">Your Name (optional)</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Mom, Dad, Grandma..."
                      maxLength={20}
                      className="w-full px-4 py-2.5 border border-navy/15 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-seafoam bg-warmWhite"
                    />
                  </div>

                  {mode === 'join' && (
                    <div>
                      <label className="text-xs font-bold text-navy/60 uppercase tracking-wider block mb-1.5">Room Code</label>
                      <input
                        type="text"
                        value={code}
                        onChange={e => setCode(e.target.value.toUpperCase().slice(0, 6))}
                        placeholder="A3F9K2"
                        className="w-full px-4 py-2.5 border border-navy/15 rounded-xl text-sm font-mono text-center text-lg tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-amber bg-warmWhite uppercase"
                      />
                    </div>
                  )}

                  {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

                  <div className="flex gap-2 pt-1">
                    <button onClick={() => { setMode('menu'); setError(''); }} className="flex-1 px-4 py-2.5 border border-navy/15 rounded-xl text-sm font-bold text-navy/60 hover:bg-navy/5 transition-colors">Back</button>
                    <button
                      onClick={mode === 'create' ? createRoom : joinRoom}
                      disabled={loading}
                      className="flex-2 flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-navy hover:bg-navy/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading && <Loader2 size={14} className="animate-spin" />}
                      {mode === 'create' ? 'Create Room' : 'Join Room'}
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
