'use server';

import { processInputWithGemini } from '@/lib/gemini';
import type { AppLocale } from '@/lib/i18n/config';
import { ProcessingResult } from '@/lib/types';

export async function submitToGemini(
  text: string,
  imagesBase64: { data: string; mimeType: string }[] = [],
  options?: { uiLocale?: AppLocale }
): Promise<ProcessingResult> {
  return await processInputWithGemini(text, imagesBase64, { uiLocale: options?.uiLocale });
}
