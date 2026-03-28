import { describe, it, expect, vi } from 'vitest';
import { processInputWithGemini } from '../lib/gemini';

// Mock the genai client
vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class {
      models = {
        generateContent: vi.fn().mockResolvedValue({
          text: JSON.stringify({
            cards: [
              {
                id: "test-id",
                domain: "HEALTH",
                title: "Test Prescription",
                summary: "Take 2 pills",
                logicReasoning: "Flagging as healthy because the dosage is standard.",
                confidenceScore: 95,
                items: [{ label: "Dosage", value: "2 pills", status: "normal" }],
                actions: [{ type: "ADD_CALENDAR", label: "Remind me", payload: { title: "Pills" } }]
              }
            ]
          })
        })
      }
    }
  };
});

describe('processInputWithGemini', () => {
  it('should successfully parse valid mock text input', async () => {
    // If running in CI without env variables, we pass a temporary override
    // just to prevent early exit from processInputWithGemini
    process.env.GEMINI_API_KEY = "dummy_for_testing";

    const result = await processInputWithGemini("Take 2 pills at night");
    expect(result.error).toBeUndefined();
    expect(result.cards).toHaveLength(1);
    expect(result.cards[0].domain).toBe("HEALTH");
    expect(result.cards[0].confidenceScore).toBe(95);
  });
});
