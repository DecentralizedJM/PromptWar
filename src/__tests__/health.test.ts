import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/health/route';

describe('/api/health', () => {
  it('returns healthy status and googleCloud envelope', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      status: string;
      timestamp: string;
      googleCloud: Record<string, string | null>;
    };
    expect(body.status).toBe('healthy');
    expect(body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(body.googleCloud).toBeDefined();
    expect('service' in body.googleCloud).toBe(true);
    expect('revision' in body.googleCloud).toBe(true);
    expect('region' in body.googleCloud).toBe(true);
    expect('projectId' in body.googleCloud).toBe(true);
  });
});
