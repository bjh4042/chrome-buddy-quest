import type { Quest, QuestCategory } from "@/types/quest";
import { QUEST_CATEGORIES } from "@/types/quest";
import type { LearningMode } from "./learningMode";

/**
 * Categories unlocked in story mode: a category unlocks once all quests
 * in the previous category are completed. First category is always unlocked.
 */
export function computeStoryUnlockedCategories(quests: Quest[]): string[] {
  const unlocked: string[] = [];
  for (const cat of QUEST_CATEGORIES) {
    unlocked.push(cat.id);
    const categoryQuests = quests.filter(q => q.category === cat.id);
    if (!categoryQuests.every(q => q.completed)) break;
  }
  return unlocked;
}

/**
 * Which categories are visible in the QuestPanel for the given mode.
 * - story: all (but locking is applied via unlockedCategories)
 * - free-practice: all
 * - teacher: only the selected category (or all if none selected yet)
 */
export function visibleCategoriesForMode(
  mode: LearningMode,
  teacherCategory: QuestCategory | null
): string[] {
  if (mode === "teacher" && teacherCategory) return [teacherCategory];
  return QUEST_CATEGORIES.map(c => c.id);
}

/**
 * Which categories should be treated as unlocked (no lock icon) for the mode.
 */
export function unlockedCategoriesForMode(
  mode: LearningMode,
  storyUnlocked: string[]
): string[] {
  if (mode === "story") return storyUnlocked;
  return QUEST_CATEGORIES.map(c => c.id);
}

/**
 * Should individual quests be locked based on story progress?
 */
export function strictQuestOrder(mode: LearningMode): boolean {
  return mode === "story";
}

export function canAccessQuest(
  quest: Quest,
  index: number,
  mode: LearningMode,
  quests: Quest[],
  teacherCategory: QuestCategory | null,
  storyCurrentQuest: number
): boolean {
  if (mode === "free-practice") return true;
  if (mode === "teacher") return !teacherCategory || quest.category === teacherCategory;
  // story: same rule the panel uses — allow current or already completed or earlier
  if (quest.completed) return true;
  if (index <= storyCurrentQuest) return true;
  return false;
}