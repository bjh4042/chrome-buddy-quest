import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, CheckCircle2, Lock, RotateCcw, RefreshCw, ChevronDown, ChevronRight, Flag, Circle } from "lucide-react";
import type { Quest } from "@/types/quest";
import { QUEST_CATEGORIES } from "@/types/quest";

interface QuestPanelProps {
  quests: Quest[];
  currentQuest: number;
  score: number;
  totalScore: number;
  onSelectQuest: (index: number) => void;
  onRestart: () => void;
  onRetryQuest: (index: number) => void;
  showComplete: boolean;
  unlockedCategories: string[];
  showHeader?: boolean;
}

const MEDAL_THRESHOLD = 10;

const QuestPanel = ({
  quests, currentQuest, score, totalScore, onSelectQuest, onRestart,
  onRetryQuest, showComplete, unlockedCategories, showHeader = true,
}: QuestPanelProps) => {
  const progress = (quests.filter(q => q.completed).length / quests.length) * 100;
  const totalStars = quests.reduce((sum, q) => sum + q.starsEarned, 0);
  const goldMedals = Math.floor(totalStars / MEDAL_THRESHOLD);
  const remainingStars = totalStars % MEDAL_THRESHOLD;
  const [expandedCats, setExpandedCats] = useState<string[]>(
    QUEST_CATEGORIES.map(c => c.id)
  );

  const toggleCat = (id: string) => {
    setExpandedCats(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const categories = QUEST_CATEGORIES.map(cat => ({
    ...cat,
    quests: quests.map((q, i) => ({ ...q, index: i })).filter(q => q.category === cat.id),
  })).filter(cat => cat.quests.length > 0);

  const getBadge = () => {
    const pct = (score / totalScore) * 100;
    if (pct >= 90) return { label: "🏅 골드", color: "text-[hsl(45,90%,40%)]" };
    if (pct >= 60) return { label: "🥈 실버", color: "text-[hsl(210,15%,45%)]" };
    return { label: "🥉 브론즈", color: "text-[hsl(25,70%,45%)]" };
  };

  return (
    <div className="w-full bg-card flex flex-col h-full overflow-hidden">
      {showHeader && (
      <div className="p-3 border-b border-border bg-primary/5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display text-base text-foreground">🗺️ 탐험 지도</h2>
          <div className="flex items-center gap-1 bg-secondary/30 px-2 py-0.5 rounded-full">
            {goldMedals > 0 && (
              <span className="text-xs">🏅×{goldMedals}</span>
            )}
            {remainingStars > 0 && (
              <>
                <Star className="w-3 h-3 text-star fill-star" />
                <span className="font-display text-xs text-foreground">×{remainingStars}</span>
              </>
            )}
            {totalStars === 0 && (
              <>
                <Star className="w-3 h-3 text-star fill-star" />
                <span className="font-display text-xs text-foreground">{score}</span>
              </>
            )}
          </div>
        </div>

        {/* Progress map bar */}
        <div className="relative h-3 bg-muted rounded-full overflow-hidden mb-1">
          <motion.div
            className="h-full bg-gradient-to-r from-primary via-accent to-secondary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 text-sm"
            animate={{ left: `${Math.max(progress - 3, 0)}%` }}
            transition={{ duration: 0.5 }}
          >
            🚀
          </motion.div>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-[10px] text-muted-foreground">
            {quests.filter(q => q.completed).length} / {quests.length} 완료
          </p>
          {score > 0 && (
            <span className={`text-[10px] font-display ${getBadge().color}`}>
              {getBadge().label}
            </span>
          )}
        </div>
      </div>
      )}
      {!showHeader && (
        <div className="px-3 pt-2 pb-3 border-b border-border bg-primary/5">
          <div className="relative h-2 bg-muted rounded-full overflow-hidden mb-1">
            <motion.div
              className="h-full bg-gradient-to-r from-primary via-accent to-secondary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <div className="flex items-center justify-between text-fluid-2xs text-muted-foreground">
            <span>{quests.filter(q => q.completed).length} / {quests.length} 완료</span>
            <span className="inline-flex items-center gap-1">
              {goldMedals > 0 && <span>🏅×{goldMedals}</span>}
              <Star className="w-3 h-3 text-star fill-star" />×{remainingStars || totalStars}
            </span>
          </div>
        </div>
      )}

      {/* Quest list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {categories.map(cat => {
          const isCatUnlocked = unlockedCategories.includes(cat.id);
          const catCompleted = cat.quests.every(q => q.completed);
          const isExpanded = expandedCats.includes(cat.id);

          return (
            <div key={cat.id} className="relative">
              <button
                onClick={() => isCatUnlocked && toggleCat(cat.id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-display transition-all ${
                  !isCatUnlocked
                    ? "opacity-40 cursor-not-allowed bg-muted/30"
                    : catCompleted
                    ? "bg-accent/10 text-accent"
                    : "bg-primary/5 text-foreground hover:bg-primary/10"
                }`}
              >
                {!isCatUnlocked ? (
                  <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                ) : catCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                ) : isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
                <span>{cat.emoji} {cat.label}</span>
                {!isCatUnlocked && (
                  <span className="text-[8px] ml-auto text-muted-foreground">🔒 잠김</span>
                )}
              </button>

              <AnimatePresence>
                {isExpanded && isCatUnlocked && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="relative pl-5 py-1">
                      <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-border" />

                      {cat.quests.map((quest) => {
                        const isCurrent = quest.index === currentQuest;
                        const isCompleted = quest.completed;
                        const isLocked = quest.index > currentQuest && !quest.completed;

                        return (
                          <div key={quest.id} className="relative flex items-center gap-2 py-1">
                            <div className={`relative z-10 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                              isCompleted
                                ? "bg-accent border-accent"
                                : isCurrent
                                ? "bg-primary border-primary animate-pulse-highlight"
                                : "bg-card border-border"
                            }`}>
                              {isCompleted ? (
                                <CheckCircle2 className="w-3 h-3 text-accent-foreground" />
                              ) : isLocked ? (
                                <Lock className="w-2 h-2 text-muted-foreground" />
                              ) : (
                                <span className="text-[7px] font-bold text-primary-foreground">
                                  {quest.index + 1}
                                </span>
                              )}
                            </div>

                            <button
                              onClick={() => {
                                if (!isLocked) onSelectQuest(quest.index);
                              }}
                              disabled={isLocked}
                              className={`flex-1 flex items-center justify-between text-left px-2 py-1 rounded-lg text-xs transition-all min-h-[36px] ${
                                isCurrent
                                  ? "bg-primary/10 border-2 border-primary shadow-game text-primary font-bold"
                                  : isCompleted
                                  ? "text-accent hover:bg-accent/5"
                                  : isLocked
                                  ? "text-muted-foreground/40 cursor-not-allowed"
                                  : "text-foreground hover:bg-muted/50"
                              }`}
                              aria-label={
                                isLocked ? `잠김: ${quest.title}` :
                                isCurrent && isCompleted ? `다시 연습 중: ${quest.title}` :
                                isCurrent ? `지금 하는 임무: ${quest.title}` :
                                isCompleted ? `완료: ${quest.title}` : `아직 하지 않은 임무: ${quest.title}`
                              }
                            >
                              <span className="flex items-center gap-1 min-w-0">
                                {isLocked ? (
                                  <Lock className="w-3 h-3 shrink-0 text-muted-foreground" />
                                ) : isCurrent && isCompleted ? (
                                  <RotateCcw className="w-3 h-3 shrink-0 text-accent" />
                                ) : isCurrent ? (
                                  <Flag className="w-3 h-3 shrink-0 text-primary" />
                                ) : isCompleted ? (
                                  <CheckCircle2 className="w-3 h-3 shrink-0 text-accent" />
                                ) : (
                                  <Circle className="w-3 h-3 shrink-0 text-muted-foreground" />
                                )}
                                <span className="truncate">{quest.title}</span>
                                <span className={`hidden sm:inline shrink-0 text-[9px] font-normal px-1 py-[1px] rounded ${
                                  isLocked ? "bg-muted text-muted-foreground" :
                                  isCurrent && isCompleted ? "bg-accent/15 text-accent" :
                                  isCurrent ? "bg-primary/15 text-primary" :
                                  isCompleted ? "bg-accent/15 text-accent" :
                                  "bg-muted text-muted-foreground"
                                }`}>
                                  {isLocked ? "앞 임무 먼저" :
                                   isCurrent && isCompleted ? "다시 연습 중" :
                                   isCurrent ? "지금 하는 임무" :
                                   isCompleted ? "완료" : "아직"}
                                </span>
                              </span>
                              <div className="flex items-center gap-1 shrink-0">
                                {isCompleted && (
                                  <button
                                    onClick={e => { e.stopPropagation(); onRetryQuest(quest.index); }}
                                    className="p-0.5 hover:bg-accent/20 rounded"
                                    title="다시 연습하기"
                                    aria-label="다시 연습하기"
                                  >
                                    <RefreshCw className="w-2.5 h-2.5 text-accent" />
                                  </button>
                                )}
                                <div className="flex">
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
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

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
