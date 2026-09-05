import { GoogleGenAI, Modality } from '@google/genai';

let aiClient: GoogleGenAI | null = null;
const reasoningCache = new Map<string, string>();
const audioCache = new Map<string, string>();
let circuitBreakerUntil = 0;

const modelCooldowns = new Map<string, number>();

export function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (e) {
      console.warn('Failed to initialize GoogleGenAI client:', e);
    }
  }
  return aiClient;
}

export async function generateGeminiReasoning(
  systemInstruction: string,
  prompt: string
): Promise<string> {
  const cacheKey = `${systemInstruction.slice(0, 40)}::${prompt}`;
  if (reasoningCache.has(cacheKey)) {
    return reasoningCache.get(cacheKey)!;
  }

  const client = getGeminiClient();
  const now = Date.now();

  if (client) {
    // Prefer gemini-3.1-flash-lite for rapid sub-second to 3s inference with high rate limits, then gemini-3.8-flash
    const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
    const modelsToTry = candidateModels.filter(m => (modelCooldowns.get(m) || 0) <= now);

    for (const model of modelsToTry) {
      let timeoutHandle: NodeJS.Timeout | null = null;
      try {
        // Generous 12-second timeout to handle complex clinical context without premature aborts
        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutHandle = setTimeout(() => reject(new Error(`Gemini API request timed out after 12s on ${model}`)), 12000);
        });

        const response = await Promise.race([
          client.models.generateContent({
            model,
            contents: prompt,
            config: {
              systemInstruction,
              temperature: 0.2,
              maxOutputTokens: 350,
            },
          }),
          timeoutPromise,
        ]);

        if (timeoutHandle) clearTimeout(timeoutHandle);

        if (response.text) {
          const result = response.text.trim();
          reasoningCache.set(cacheKey, result);
          return result;
        }
      } catch (err: any) {
        if (timeoutHandle) clearTimeout(timeoutHandle);

        const isQuota =
          err?.status === 'RESOURCE_EXHAUSTED' ||
          err?.message?.includes('429') ||
          err?.message?.includes('Quota exceeded') ||
          err?.message?.includes('RESOURCE_EXHAUSTED');

        const isDemandSpike =
          err?.status === 'UNAVAILABLE' ||
          err?.message?.includes('503') ||
          err?.message?.includes('high demand');

        if (isQuota || isDemandSpike) {
          // Cool down this specific model for 45s, then seamlessly attempt next candidate model
          modelCooldowns.set(model, Date.now() + 45000);
          console.info(`[LifeLink AI Engine] Model ${model} temporarily busy/rate-limited. Seamlessly routing to alternative engine.`);
          continue;
        } else {
          console.info(`[LifeLink AI Engine] ${model} unavailable: ${err?.message || 'unknown error'}. Checking alternative...`);
        }
      }
    }
  }

  return '';
}

/**
 * Synthesizes a high-fidelity voice note call for emergency contacts using Gemini TTS (gemini-3.1-flash-tts-preview)
 */
export async function generateEmergencyVoiceNoteAudio(
  voiceScript: string,
  voiceName: 'Kore' | 'Zephyr' | 'Puck' | 'Fenrir' = 'Kore'
): Promise<string | null> {
  if (!voiceScript) return null;
  if (audioCache.has(voiceScript)) {
    return audioCache.get(voiceScript)!;
  }

  const client = getGeminiClient();
  if (client && Date.now() > circuitBreakerUntil) {
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3.1-flash-tts-preview',
        contents: [{ parts: [{ text: `Speak in a calm, clear, highly urgent, and reassuring voice tone: ${voiceScript}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        audioCache.set(voiceScript, base64Audio);
        return base64Audio;
      }
    } catch (err: any) {
      console.info('[LifeLink Audio Engine] Gemini TTS preview not available or quota limited. Fallback audio active:', err?.message || err);
    }
  }

  return null;
}

