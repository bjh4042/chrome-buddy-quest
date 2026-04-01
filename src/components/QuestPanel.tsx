import { motion, AnimatePresence } from "framer-motion";
import { Star, CheckCircle2, Lock, Trophy, RotateCcw } from "lucide-react";
import type { Quest } from "@/types/quest";

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

  return (
    <div className="w-full md:w-80 bg-card border-r border-border flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border bg-primary/5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg text-foreground">미션 목록</h2>
          <div className="flex items-center gap-1 bg-secondary/30 px-3 py-1 rounded-full">
            <Star className="w-4 h-4 text-star fill-star" />
            <span className="font-display text-sm text-foreground">{score}</span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {quests.filter(q => q.completed).length} / {quests.length} 완료
        </p>
      </div>

      {/* Quest list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {quests.map((quest, index) => {
          const isCurrent = index === currentQuest;
          const isLocked = index > currentQuest && !quest.completed;
          const isCompleted = quest.completed;

          return (
            <motion.button
              key={quest.id}
              onClick={() => !isLocked && onSelectQuest(index)}
              disabled={isLocked}
              className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                isCurrent
                  ? "border-primary bg-primary/10 shadow-game"
                  : isCompleted
                  ? "border-accent/50 bg-accent/5"
                  : isLocked
                  ? "border-border bg-muted/50 opacity-60 cursor-not-allowed"
                  : "border-border hover:border-primary/30"
              }`}
              whileHover={!isLocked ? { scale: 1.02 } : {}}
              whileTap={!isLocked ? { scale: 0.98 } : {}}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isCompleted ? "bg-accent" : isCurrent ? "bg-primary" : "bg-muted"
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-accent-foreground" />
                  ) : isLocked ? (
                    <Lock className="w-3 h-3 text-muted-foreground" />
                  ) : (
                    <span className="text-xs font-bold text-primary-foreground">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-body text-sm font-medium truncate ${
                    isCurrent ? "text-primary" : isCompleted ? "text-accent" : "text-foreground"
                  }`}>
                    {quest.title}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(3)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          isCompleted && i < quest.starsEarned
                            ? "text-star fill-star"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">+{quest.points}점</span>
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Restart button */}
      {showComplete && (
        <div className="p-4 border-t border-border">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRestart}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-display flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            처음부터 다시하기
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default QuestPanel;
