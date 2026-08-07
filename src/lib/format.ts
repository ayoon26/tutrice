import type { MemoryCategory } from '@/lib/types';

const CATEGORY_LABEL: Record<MemoryCategory, string> = {
  learning_preference: 'Learning preference',
  goal: 'Goal',
  schedule: 'Schedule',
  progress: 'Progress',
  challenge: 'Challenge',
  technique: 'Technique',
  homework: 'Homework',
  request: 'Parent request',
  note: 'Note',
};

export function categoryLabel(category: MemoryCategory): string {
  return CATEGORY_LABEL[category];
}

export function relativeDay(iso: string): string {
  const date = new Date(iso);
  const days = Math.round((Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) - Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())) / 86400000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}
