'use client';

import { RoomMember } from '@/lib/types';
import { Users } from 'lucide-react';

interface MemberIndicatorProps {
  members: RoomMember[];
}

export function MemberIndicator({ members }: MemberIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2 overflow-hidden">
        {members.slice(0, 5).map((member) => (
          <div 
            key={member.id}
            title={member.name}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-navy/20 border-2 border-navy ring-2 ring-white text-base shadow-sm hover:scale-110 transition-transform cursor-default"
          >
            {member.emoji}
          </div>
        ))}
        {members.length > 5 && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy/40 border-2 border-navy ring-2 ring-white text-[10px] font-bold text-white">
            +{members.length - 5}
          </div>
        )}
      </div>
      <div className="hidden sm:flex flex-col ml-1">
        <span className="text-[9px] font-black uppercase tracking-tighter text-white/40 leading-none">Family Sync</span>
        <span className="text-xs font-bold text-white leading-tight">
          {members.length} {members.length === 1 ? 'active' : 'active members'}
        </span>
      </div>
    </div>
  );
}
