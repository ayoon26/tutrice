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

// Speech-to-text is provider-agnostic by design: swap this one function for
// whichever ASR vendor you standardize on. Ships wired to OpenAI's
// transcription endpoint since it needs no extra SDK dependency.
export async function transcribeAudio(audio: Blob): Promise<TranscriptionResult> {
  if (!hasTranscription) {
    await new Promise((r) => setTimeout(r, 300));
    return { transcript: MOCK_TRANSCRIPT, mocked: true };
  }

  const form = new FormData();
  form.append('file', audio, 'lesson.webm');
  form.append('model', 'whisper-1');

  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: form,
  });
  if (!res.ok) throw new Error(`Transcription failed: HTTP ${res.status}`);
  const data = await res.json();
  return { transcript: data.text as string, mocked: false };
}
