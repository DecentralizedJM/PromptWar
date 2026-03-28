'use server';

import { processInputWithGemini } from '@/lib/gemini';
import { ProcessingResult } from '@/lib/types';

export async function submitToGemini(
  text: string, 
  imagesBase64: { data: string, mimeType: string }[] = []
): Promise<ProcessingResult> {
  return await processInputWithGemini(text, imagesBase64);
}
