import { NextResponse } from 'next/server';
import { getGeminiApiKeyFromEnv } from '@/lib/gemini-env';

/**
 * Cloud Run and load balancers use this route for readiness.
 * `googleCloud` fields populate automatically on Google Cloud Run (K_SERVICE, etc.).
 */
export async function GET() {
  const geminiConfigured = Boolean(getGeminiApiKeyFromEnv());

  return NextResponse.json(
    {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      gemini: {
        /** True if any supported env var is non-empty (value is never returned). */
        configured: geminiConfigured,
      },
      googleCloud: {
        service: process.env.K_SERVICE ?? null,
        revision: process.env.K_REVISION ?? null,
        region: process.env.GOOGLE_CLOUD_REGION ?? process.env.REGION ?? null,
        projectId: process.env.GOOGLE_CLOUD_PROJECT ?? process.env.GCP_PROJECT ?? null,
      },
    },
    { status: 200 }
  );
}
