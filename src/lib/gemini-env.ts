/**
 * Server-only Gemini API key resolution.
 * Cloud Run / Vercel must set at least one of these at **runtime** (not at Docker build time).
 */
export function getGeminiApiKeyFromEnv(): string {
  return (
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim() ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    ''
  );
}

export const GEMINI_API_KEY_MISSING_MESSAGE =
  'Missing Gemini API key on the server. Set GEMINI_API_KEY in Cloud Run (or .env.local). ' +
  'Optional fallbacks: GOOGLE_API_KEY, GOOGLE_GENERATIVE_AI_API_KEY. ' +
  'Verify with GET /api/health — JSON field gemini.configured should be true. See README → Deployment.';
