import { motion } from "framer-motion";
import { Monitor, MousePointer, Star, Play, ListChecks, RotateCcw, GraduationCap } from "lucide-react";
import { QUESTS } from "@/types/quest";

interface StartScreenProps {
  onStart: () => void;
  hasProgress?: boolean;
  completedCount?: number;
  totalQuests?: number;
  currentQuestTitle?: string;
  onResume?: () => void;
  onFreePractice?: () => void;
  onTeacher?: () => void;
  onFreshStart?: () => void;
}

const StartScreen = ({
  onStart,
  hasProgress,
  completedCount = 0,
  totalQuests,
  currentQuestTitle,
  onResume,
  onFreePractice,
  onTeacher,
  onFreshStart,
}: StartScreenProps) => {
  const total = totalQuests ?? QUESTS.length;
  const primaryLabel = hasProgress ? "이어서 탐험하기" : "탐험 시작하기";
  const primaryHandler = hasProgress ? (onResume ?? onStart) : onStart;
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary/90 to-primary p-6">
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="bg-card rounded-3xl shadow-card p-6 sm:p-8 md:p-10 max-w-lg w-full text-center"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary/10 mb-4 sm:mb-6"
        >
          <Monitor className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
        </motion.div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-logo text-foreground mb-2 sm:mb-3">
          윈도우 탐험대! 🚀
        </h1>
        <p className="text-muted-foreground font-body text-sm sm:text-base md:text-lg mb-4 sm:mb-6 leading-relaxed">
          컴퓨터를 처음 사용하는 친구들을 위한<br />
          <span className="text-primary font-bold">윈도우 사용법 모험</span>이 시작됩니다!
        </p>

        <div className="flex items-center justify-center gap-6 mb-3 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MousePointer className="w-4 h-4 text-primary" />
            <span>{total}개 미션</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-star" />
            <span>별 모으기</span>
          </div>
        </div>

        {hasProgress && (
          <div className="bg-accent/10 border border-accent/30 rounded-xl p-2.5 text-xs sm:text-sm text-foreground mb-3 text-left">
            지난번에 <span className="font-display text-accent">{completedCount}/{total}</span> 임무까지 했어요.
            {currentQuestTitle && (
              <div className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 truncate">
                다음 임무: {currentQuestTitle}
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={primaryHandler}
            className="w-full min-h-[52px] py-3 px-4 rounded-2xl bg-secondary text-secondary-foreground font-display text-base sm:text-lg shadow-quest flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" /> 🗺️ {primaryLabel}
          </motion.button>
          <button
            onClick={onFreePractice}
            className="w-full min-h-[48px] py-2.5 px-3 rounded-xl bg-primary/10 text-primary font-display text-sm flex items-center justify-center gap-1.5 hover:bg-primary/20 transition"
          >
            <ListChecks className="w-4 h-4" /> 🎯 원하는 임무 연습하기
          </button>
          <button
            onClick={onTeacher}
            className="w-full min-h-[48px] py-2.5 px-3 rounded-xl bg-accent/10 text-accent font-display text-sm flex items-center justify-center gap-1.5 hover:bg-accent/20 transition"
          >
            <GraduationCap className="w-4 h-4" /> 🧑‍🏫 선생님과 함께 배우기
          </button>
          {hasProgress && (
            <button
              onClick={onFreshStart}
              className="w-full min-h-[36px] py-1.5 rounded-lg text-muted-foreground text-xs font-display flex items-center justify-center gap-1 hover:text-foreground hover:bg-muted/50 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" /> 모두 지우고 처음부터 시작하기
            </button>
          )}
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-4 text-primary-foreground/70 text-xs sm:text-sm text-center"
      >
        약 40분 정도 걸려요 · 천천히 따라해 보세요!
      </motion.p>
    </div>
  );
};

export default StartScreen;
