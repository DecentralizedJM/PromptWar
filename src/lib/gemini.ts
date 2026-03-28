/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { GoogleGenAI } from '@google/genai';
import { GEMINI_MODEL_ID } from './google-services';
import { ProcessingResult } from './types';
const responseSchema: any = {
  type: "object",
  properties: {
    cards: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          domain: { type: "string", enum: ['HEALTH', 'FINANCE', 'LOGISTICS', 'GOVERNMENT_LEGAL', 'GENERAL'] },
          title: { type: "string" },
          summary: { type: "string" },
          logicReasoning: { type: "string", description: "A concise explanation of the logical context (e.g. why a specific status or categorization was chosen based on the input context)." },
          confidenceScore: { type: "number", description: "A score from 0 to 100" },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                label: { type: "string" },
                value: { type: "string" },
                status: { type: "string", enum: ['normal', 'warning', 'success'] }
              },
              required: ["label", "value", "status"]
            }
          },
          actions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string", enum: ['ADD_CALENDAR', 'DRAFT_EMAIL', 'SET_REMINDER', 'GENERATE_PDF', 'TRANSLATE'] },
                label: { type: "string" },
                payload: { type: "object", description: "A simple string-to-string dictionary containing required data, e.g. 'title','date' for calendars, 'subject','body' for emails. Use string keys and string values." }
              },
              required: ["type", "label", "payload"]
            }
          }
        },
        required: ["id", "domain", "title", "summary", "logicReasoning", "confidenceScore", "items", "actions"]
      }
    }
  },
  required: ["cards"]
};

export async function processInputWithGemini(
  textContent: string,
  imagesBase64: { data: string, mimeType: string }[] = []
): Promise<ProcessingResult> {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) {
    return { cards: [], error: "Missing GEMINI_API_KEY in server environment variables." };
  }
  const ai = new GoogleGenAI({ apiKey });

  try {
    const prompt = `You are LifeBridge, an advanced AI that acts as a universal bridge between messy human intent and structured life-serving actions.
Your task is to take the provided raw input (text, images, or audio transcript) and parse, structure, verify, and convert it into clear, actionable next steps.

Output the data as a JSON object matching the requested schema.
- Organize items into logical domains (HEALTH, FINANCE, LOGISTICS, GOVERNMENT_LEGAL, GENERAL).
- Use the 'status' field to flag items: 'warning' for conflicts, interactions, or urgent deadlines; 'success' for confirmed or good status; 'normal' otherwise.
- Propose relevant actions based on the context. Ensure the 'payload' contains the necessary info (e.g. for an email, provide 'recipient', 'subject', 'body').

RAW INPUT TO PROCESS:
${textContent}`;

    const parts: any[] = [{ text: prompt }];
    
    // Add images if present
    for (const img of imagesBase64) {
      parts.push({
        inlineData: {
          data: img.data,
          mimeType: img.mimeType
        }
      });
    }

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_ID,
      contents: [{ parts }],
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: responseSchema,
        temperature: 0.2, // Low temperature for deterministic structuring
      }
    });

    const resultText = response.text || "";
    
    try {
      const parsed = JSON.parse(resultText);
      return { cards: parsed.cards || [] };
    } catch (e) {
      return { cards: [], error: "Failed to parse Gemini response." };
    }

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return { cards: [], error: error.message || "An error occurred while processing your input." };
  }
}
