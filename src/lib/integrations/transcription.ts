import { GoogleGenAI } from '@google/genai';
import { hasTranscription } from '@/lib/config';

export const MOCK_TRANSCRIPT =
  "Okay, let's try problem four. A train leaves the station going sixty miles an hour... " +
  "so first figure out what's known and what's unknown before you write the equation. " +
  "Good — now translate that sentence into an equation the same way. That's it, you separated the two rates cleanly. " +
  "Let's do the same thing with the next one so it sticks. For homework, finish practice set seven, problems one through twelve.";

export interface TranscriptionResult {
  transcript: string;
  mocked: boolean;
}

// Speech-to-text via Gemini's audio input — shares GEMINI_API_KEY with the
// memory-extraction integration, so a single free key covers both.
export async function transcribeAudio(audio: Blob): Promise<TranscriptionResult> {
  if (!hasTranscription) {
    await new Promise((r) => setTimeout(r, 300));
    return { transcript: MOCK_TRANSCRIPT, mocked: true };
  }

  const buffer = Buffer.from(await audio.arrayBuffer());
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType: audio.type || 'audio/webm', data: buffer.toString('base64') } },
          { text: 'Transcribe this tutoring lesson recording exactly, word for word. Return only the transcript text, with no commentary or formatting.' },
        ],
      },
    ],
  });

  return { transcript: response.text ?? '', mocked: false };
}
