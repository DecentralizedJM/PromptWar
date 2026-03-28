/**
 * LifeBridge — Google platform integration surface.
 *
 * - **Gemini** (`@google/genai`): multimodal structuring via Google AI (AI Studio / compatible endpoints).
 * - **Firestore** (`firebase/firestore`): real-time rooms and ephemeral Bridge Share documents (Firebase / Google Cloud project).
 * - **Google Cloud Run**: production hosting; optional env `K_SERVICE`, `K_REVISION`, `GOOGLE_CLOUD_REGION` are exposed on `/api/health` for observability.
 */
/** Matches Generative Language API model id (e.g. `gemini-flash-latest` alias). */
export const GEMINI_MODEL_ID = 'gemini-flash-latest' as const;

export const FIRESTORE_COLLECTIONS = {
  shares: 'shares',
  rooms: 'rooms',
} as const;

/** Subcollections under each room document. */
export const FIRESTORE_SUBCOLLECTIONS = {
  roomCards: 'cards',
} as const;
