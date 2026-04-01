import { motion } from "framer-motion";
import { Star, CheckCircle2, Lock, RotateCcw } from "lucide-react";
import type { Quest } from "@/types/quest";
import { QUEST_CATEGORIES } from "@/types/quest";

interface QuestPanelProps {
  quests: Quest[];
  currentQuest: number;
  score: number;
  totalScore: number;
  onSelectQuest: (index: number) => void;
  onRestart: () => void;
  showComplete: boolean;
}

const QuestPanel = ({ quests, currentQuest, score, totalScore, onSelectQuest, onRestart, showComplete }: QuestPanelProps) => {
  const progress = (quests.filter(q => q.completed).length / quests.length) * 100;

  // Group quests by category
  const categories = QUEST_CATEGORIES.map(cat => ({
    ...cat,
    quests: quests.map((q, i) => ({ ...q, index: i })).filter(q => q.category === cat.id),
  })).filter(cat => cat.quests.length > 0);

  return (
    <div className="w-full md:w-72 bg-card border-r border-border flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-border bg-primary/5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display text-base text-foreground">미션 목록</h2>
          <div className="flex items-center gap-1 bg-secondary/30 px-2 py-0.5 rounded-full">
            <Star className="w-3 h-3 text-star fill-star" />
            <span className="font-display text-xs text-foreground">{score}</span>
          </div>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {quests.filter(q => q.completed).length} / {quests.length} 완료
        </p>
      </div>

      {/* Quest list grouped by category */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {categories.map(cat => (
          <div key={cat.id}>
            <p className="text-[10px] font-bold text-muted-foreground uppercase px-1 mb-1">
              {cat.emoji} {cat.label}
            </p>
            <div className="space-y-1">
              {cat.quests.map(quest => {
                const isCurrent = quest.index === currentQuest;
                const isLocked = quest.index > currentQuest && !quest.completed;
                const isCompleted = quest.completed;

                return (
                  <motion.button
                    key={quest.id}
                    onClick={() => !isLocked && onSelectQuest(quest.index)}
                    disabled={isLocked}
                    className={`w-full text-left p-2 rounded-lg border transition-all text-xs ${
                      isCurrent
                        ? "border-primary bg-primary/10 shadow-game"
                        : isCompleted
                        ? "border-accent/50 bg-accent/5"
                        : isLocked
                        ? "border-border bg-muted/50 opacity-50 cursor-not-allowed"
                        : "border-border hover:border-primary/30"
                    }`}
                    whileHover={!isLocked ? { scale: 1.01 } : {}}
                    whileTap={!isLocked ? { scale: 0.99 } : {}}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCompleted ? "bg-accent" : isCurrent ? "bg-primary" : "bg-muted"
                      }`}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-3 h-3 text-accent-foreground" />
                        ) : isLocked ? (
                          <Lock className="w-2.5 h-2.5 text-muted-foreground" />
                        ) : (
                          <span className="text-[8px] font-bold text-primary-foreground">{quest.index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-body text-xs font-medium truncate ${
                          isCurrent ? "text-primary" : isCompleted ? "text-accent" : "text-foreground"
                        }`}>
                          {quest.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[...Array(3)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-2 h-2 ${
                              isCompleted && i < quest.starsEarned
                                ? "text-star fill-star"
                                : "text-muted-foreground/20"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Restart button */}
      {showComplete && (
        <div className="p-3 border-t border-border">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRestart}
            className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-display text-sm flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            처음부터 다시하기
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default QuestPanel;
