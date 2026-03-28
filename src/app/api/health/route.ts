import { NextResponse } from 'next/server';

/**
 * Cloud Run and load balancers use this route for readiness.
 * `googleCloud` fields populate automatically on Google Cloud Run (K_SERVICE, etc.).
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'healthy',
      timestamp: new Date().toISOString(),
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
