import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { FIRESTORE_COLLECTIONS } from '@/lib/google-services';
import { SharedBridge, StructuredCard } from '@/lib/types';

const MAX_CARDS = 32;
const MAX_TITLE_LEN = 120;
const MAX_JSON_BYTES = 512 * 1024;

function generateShareId(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export async function POST(request: Request) {
  try {
    const raw = await request.text();
    if (raw.length > MAX_JSON_BYTES) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
    }
    let body: { cards: StructuredCard[]; title: string };
    try {
      body = JSON.parse(raw) as { cards: StructuredCard[]; title: string };
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    const { cards, title } = body;

    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      return NextResponse.json({ error: 'No cards provided' }, { status: 400 });
    }
    if (cards.length > MAX_CARDS) {
      return NextResponse.json({ error: 'Too many cards' }, { status: 400 });
    }

    const safeTitle =
      typeof title === 'string' ? title.slice(0, MAX_TITLE_LEN).trim() : '';

    const shareId = generateShareId();
    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    const sharedBridge: SharedBridge = {
      shareId,
      cards,
      title: safeTitle || 'Shared Bridge',
      createdAt: now,
      expiresAt: now + sevenDays,
    };

    await setDoc(doc(collection(db, FIRESTORE_COLLECTIONS.shares), shareId), sharedBridge);

    return NextResponse.json({ shareId });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create share';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
