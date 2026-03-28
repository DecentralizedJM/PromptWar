import { describe, it, expect } from 'vitest';
import { isSharedBridgeExpired } from '@/lib/shared-bridge-server';

describe('isSharedBridgeExpired', () => {
  it('returns false when now is before expiry', () => {
    expect(isSharedBridgeExpired(1_000_000, 999_999)).toBe(false);
  });

  it('returns true when now is after expiry', () => {
    expect(isSharedBridgeExpired(1_000_000, 1_000_001)).toBe(true);
  });
});
