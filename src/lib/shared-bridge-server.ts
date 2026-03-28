import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { SharedBridge } from '@/lib/types';
import { FIRESTORE_COLLECTIONS } from '@/lib/google-services';

/** Pure helper for unit tests and expiry checks (inject `nowMs` for determinism). */
export function isSharedBridgeExpired(expiresAt: number, nowMs: number): boolean {
  return nowMs > expiresAt;
}

/**
 * Loads a share document from Firestore and validates TTL at request time.
 * Date comparison runs here (not in React render) to satisfy strict purity linting on RSC.
 */
export async function fetchSharedBridgeById(shareId: string): Promise<SharedBridge | null> {
  try {
    const snap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.shares, shareId));
    if (!snap.exists()) return null;
    const bridge = snap.data() as SharedBridge;
    if (isSharedBridgeExpired(bridge.expiresAt, Date.now())) return null;
    return bridge;
  } catch {
    return null;
  }
}
