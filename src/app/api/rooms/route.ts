import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { FamilyRoom } from '@/lib/types';

const ANIMALS = ['🐻', '🦊', '🐼', '🐨', '🦁', '🐯', '🐸', '🦉', '🦋', '🐬'];
const NAMES = ['Bear', 'Fox', 'Panda', 'Koala', 'Lion', 'Tiger', 'Frog', 'Owl', 'Butterfly', 'Dolphin'];

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// POST — create a new room
export async function POST(request: Request) {
  try {
    const { memberName } = await request.json();
    const roomCode = generateRoomCode();
    const memberId = crypto.randomUUID();
    const animalIdx = Math.floor(Math.random() * ANIMALS.length);

    const room: FamilyRoom = {
      roomCode,
      createdAt: Date.now(),
      members: [{
        id: memberId,
        name: memberName || NAMES[animalIdx],
        emoji: ANIMALS[animalIdx],
        joinedAt: Date.now(),
      }],
    };

    await setDoc(doc(collection(db, 'rooms'), roomCode), room);

    return NextResponse.json({ roomCode, memberId, emoji: ANIMALS[animalIdx], name: room.members[0].name });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create room';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET — validate a room code and join
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const memberName = searchParams.get('name');

    if (!code) return NextResponse.json({ error: 'Room code required' }, { status: 400 });

    const roomSnap = await getDoc(doc(db, 'rooms', code));
    if (!roomSnap.exists()) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

    const memberId = crypto.randomUUID();
    const animalIdx = Math.floor(Math.random() * ANIMALS.length);
    const newMember = {
      id: memberId,
      name: memberName || NAMES[animalIdx],
      emoji: ANIMALS[animalIdx],
      joinedAt: Date.now(),
    };

    const room = roomSnap.data() as FamilyRoom;
    const updatedMembers = [...(room.members || []), newMember];
    await setDoc(doc(db, 'rooms', code), { ...room, members: updatedMembers });

    return NextResponse.json({ roomCode: code, memberId, emoji: newMember.emoji, name: newMember.name });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to join room';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
