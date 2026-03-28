import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { SharedBridge, StructuredCard } from '@/lib/types';

function generateShareId(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export async function POST(request: Request) {
  try {
    const { cards, title }: { cards: StructuredCard[]; title: string } = await request.json();

    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      return NextResponse.json({ error: 'No cards provided' }, { status: 400 });
    }

    const shareId = generateShareId();
    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    const sharedBridge: SharedBridge = {
      shareId,
      cards,
      title: title || 'Shared Bridge',
      createdAt: now,
      expiresAt: now + sevenDays,
    };

    await setDoc(doc(collection(db, 'shares'), shareId), sharedBridge);

    return NextResponse.json({ shareId });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create share';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
