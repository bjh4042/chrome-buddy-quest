import { QUESTS, type QuestCategory } from '@/types/quest';
import type { LearningMode } from '@/features/learning/learningMode';

export type Screen = 'start' | 'tutorial' | 'complete' | 'category-picker';
export type SavedProgress = {
  version: 2;
  screen: Screen;
  questsState: { id: string; completed: boolean; starsEarned: number }[];
  currentQuest: number;
  learningMode?: LearningMode;
  practiceQuestId?: string | null;
  teacherCategory?: QuestCategory | null;
};
export const STORAGE_KEY = 'win-explorer-progress-v2';

/** Recover only known records. Resume at the first unfinished task, even after a crash. */
export function parseProgress(raw: string | null): SavedProgress | null {
  try {
    const value = JSON.parse(raw || 'null');
    if (!value || typeof value !== 'object' || value.version !== 2) return null;
    const validIds = new Set(QUESTS.map(q => q.id));
    const states = new Map<string, SavedProgress['questsState'][number]>();
    for (const entry of Array.isArray(value.questsState) ? value.questsState : []) {
      if (!entry || !validIds.has(entry.id) || typeof entry.completed !== 'boolean') continue;
      const stars = typeof entry.starsEarned === 'number' && Number.isFinite(entry.starsEarned)
        ? Math.max(0, Math.min(3, Math.floor(entry.starsEarned))) : 0;
      states.set(entry.id, {id:entry.id, completed:entry.completed, starsEarned:entry.completed ? stars : 0});
    }
    const questsState = [...states.values()];
    const firstUnfinished = QUESTS.findIndex(q => !states.get(q.id)?.completed);
    const currentQuest = firstUnfinished < 0 ? QUESTS.length - 1 : firstUnfinished;
    const mode: LearningMode = ['story','free-practice','teacher'].includes(value.learningMode) ? value.learningMode : 'story';
    const categories = new Set(QUESTS.map(q=>q.category));
    return {
      version:2, questsState, currentQuest,
      screen:value.screen === 'complete' && firstUnfinished < 0 ? 'complete' : 'start',
      learningMode:mode,
      practiceQuestId:validIds.has(value.practiceQuestId) ? value.practiceQuestId : null,
      teacherCategory:categories.has(value.teacherCategory) ? value.teacherCategory : null,
    };
  } catch { return null; }
}

export function loadProgress(): SavedProgress | null {
  try { return parseProgress(localStorage.getItem(STORAGE_KEY)); } catch { return null; }
}
