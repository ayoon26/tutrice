import Anthropic from '@anthropic-ai/sdk';
import { hasAnthropic } from '@/lib/config';
import type { MemoryCategory } from '@/lib/types';

export interface ExtractedUpdate {
  category: MemoryCategory;
  label: string;
  value: string | null;
  badge: string | null;
}

const LESSON_MOCK: ExtractedUpdate[] = [
  { category: 'progress', label: 'Progress: comfortable translating word problems into equations', value: null, badge: 'New' },
  { category: 'challenge', label: 'Challenge: multi-step problems still slow', value: null, badge: 'New' },
  { category: 'technique', label: 'Technique: diagrams help separate known and unknown values', value: null, badge: 'New' },
  { category: 'homework', label: 'Homework: practice set 7, problems 1–12', value: null, badge: 'New' },
];

const ONBOARDING_MOCK: ExtractedUpdate[] = [
  { category: 'learning_preference', label: 'Visual learner — responds well to diagrams and worked examples', value: null, badge: null },
];

const MANUAL_MOCK: ExtractedUpdate[] = [
  { category: 'schedule', label: 'Exam date: October 15 → October 18', value: null, badge: 'Updated' },
  { category: 'request', label: 'Request: short progress update after each lesson', value: null, badge: 'New' },
  { category: 'goal', label: 'Focus on word problems for the next two weeks', value: null, badge: 'Temporary' },
];

const updatesTool: Anthropic.Tool = {
  name: 'record_updates',
  description: 'Record the student-memory updates detected in the text.',
  input_schema: {
    type: 'object',
    properties: {
      updates: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              enum: ['learning_preference', 'goal', 'schedule', 'progress', 'challenge', 'technique', 'homework', 'request', 'note'],
            },
            label: { type: 'string', description: 'Short human-readable summary of the update, e.g. "Homework: practice set 7"' },
            value: { type: 'string', description: 'Optional extra detail' },
            badge: { type: 'string', enum: ['New', 'Updated', 'Temporary'] },
          },
          required: ['category', 'label', 'badge'],
        },
      },
    },
    required: ['updates'],
  },
};

async function callClaude(systemPrompt: string, text: string): Promise<ExtractedUpdate[]> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const msg = await client.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 1024,
    system: systemPrompt,
    tools: [updatesTool],
    tool_choice: { type: 'tool', name: 'record_updates' },
    messages: [{ role: 'user', content: text }],
  });
  const toolUse = msg.content.find((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use');
  const updates = (toolUse?.input as { updates?: ExtractedUpdate[] } | undefined)?.updates ?? [];
  return updates.map((u) => ({ ...u, value: u.value ?? null, badge: u.badge ?? null }));
}

// Turns a lesson transcript into reviewable "suggested memory update" rows —
// nothing is written to the student's memory until the tutor accepts them.
export async function extractLessonUpdates(transcript: string, studentName: string): Promise<ExtractedUpdate[]> {
  if (!hasAnthropic) {
    await new Promise((r) => setTimeout(r, 400));
    return LESSON_MOCK;
  }
  return callClaude(
    `You are Tutrice, an assistant that reviews a tutoring lesson transcript for ${studentName} and proposes concrete, ` +
      'specific student-memory updates (progress made, challenges, techniques that worked, homework assigned). ' +
      'Keep each label to one short sentence. Use "New" for anything not previously known.',
    transcript
  );
}

// Turns free-text calendar notes into a single tentative learning-preference
// guess, surfaced for the tutor to confirm during onboarding.
export async function extractOnboardingPreference(notes: string, studentName: string): Promise<ExtractedUpdate[]> {
  if (!hasAnthropic) {
    await new Promise((r) => setTimeout(r, 300));
    return ONBOARDING_MOCK;
  }
  const updates = await callClaude(
    `You are Tutrice. From this calendar note about ${studentName}, infer at most one tentative learning-preference or ` +
      'style observation the tutor should confirm. If there is nothing to infer, return an empty updates array.',
    notes
  );
  return updates.map((u) => ({ ...u, category: 'learning_preference', badge: null }));
}

// Turns a pasted parent message / tutor note into the same kind of
// reviewable suggestion rows.
export async function extractTextUpdates(text: string, studentName: string): Promise<ExtractedUpdate[]> {
  if (!hasAnthropic) {
    await new Promise((r) => setTimeout(r, 400));
    return MANUAL_MOCK;
  }
  return callClaude(
    `You are Tutrice, an assistant that reads a note or parent message about ${studentName} and proposes concrete ` +
      'student-memory updates (schedule changes, requests, goals, preferences). Keep each label to one short sentence. ' +
      'Use "Updated" when it changes something previously known, "New" for new information, "Temporary" for short-term ' +
      'requests that should expire.',
    text
  );
}
