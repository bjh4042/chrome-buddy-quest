import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { QUEST_CATEGORIES, type Quest, type QuestCategory } from "@/types/quest";
import { CATEGORY_DESCRIPTIONS } from "@/features/learning/learningMode";

interface CategoryPickerProps {
  quests: Quest[];
  onPick: (category: QuestCategory) => void;
  onBack: () => void;
}

const CategoryPicker = ({ quests, onPick, onBack }: CategoryPickerProps) => {
  const cats = QUEST_CATEGORIES.map(c => {
    const catQuests = quests.filter(q => q.category === c.id);
    return {
      ...c,
      total: catQuests.length,
      done: catQuests.filter(q => q.completed).length,
    };
  }).filter(c => {
    if (c.total === 0) {
      if (typeof console !== "undefined") console.warn(`[CategoryPicker] category '${c.id}' has no quests`);
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-[100dvh] flex flex-col bg-gradient-to-b from-primary/90 to-primary p-4 sm:p-6">
      <div className="max-w-3xl w-full mx-auto flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 min-h-[40px] px-3 rounded-lg bg-white/15 text-primary-foreground text-sm font-display hover:bg-white/25 transition"
          >
            <ArrowLeft className="w-4 h-4" /> 뒤로
          </button>
          <h1 className="text-primary-foreground font-display text-lg sm:text-xl">
            🧑‍🏫 함께 배울 주제를 골라요
          </h1>
        </div>

        <div className="bg-card rounded-2xl p-3 sm:p-4 shadow-card overflow-y-auto">
          <p className="text-sm text-muted-foreground mb-3 px-1">
            원하는 주제를 눌러 그 주제의 임무부터 함께 연습해요.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {cats.map(cat => {
              const complete = cat.total > 0 && cat.done === cat.total;
              return (
                <motion.button
                  key={cat.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onPick(cat.id as QuestCategory)}
                  className="text-left rounded-xl border-2 border-border bg-card hover:border-primary hover:bg-primary/5 transition p-3 flex items-start gap-3 min-h-[92px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <span className="text-3xl leading-none" aria-hidden>{cat.emoji}</span>
                  <span className="flex-1 min-w-0">
                    <span className="flex items-center gap-1.5">
                      <span className="font-display text-base text-foreground truncate">{cat.label}</span>
                      {complete && <CheckCircle2 className="w-4 h-4 text-accent shrink-0" aria-label="모두 완료" />}
                    </span>
                    <span className="block text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {CATEGORY_DESCRIPTIONS[cat.id as QuestCategory]}
                    </span>
                    <span className="block text-[11px] font-display text-primary mt-1">
                      {cat.done} / {cat.total} 완료 · 연습하기 →
                    </span>
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPicker;