import { motion } from "framer-motion";
import { Monitor, MousePointer, Star, Play, ListChecks, RotateCcw } from "lucide-react";
import { QUESTS } from "@/types/quest";

interface StartScreenProps {
  onStart: () => void;
  hasProgress?: boolean;
  completedCount?: number;
  totalQuests?: number;
  currentQuestTitle?: string;
  onResume?: () => void;
  onJumpTo?: () => void;
  onFreshStart?: () => void;
}

const StartScreen = ({
  onStart,
  hasProgress,
  completedCount = 0,
  totalQuests,
  currentQuestTitle,
  onResume,
  onJumpTo,
  onFreshStart,
}: StartScreenProps) => {
  const total = totalQuests ?? QUESTS.length;
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary/90 to-primary p-6">
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="bg-card rounded-3xl shadow-card p-8 md:p-12 max-w-lg w-full text-center"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-6"
        >
          <Monitor className="w-12 h-12 text-primary" />
        </motion.div>

        <h1 className="text-3xl md:text-4xl font-display text-foreground mb-3">
          윈도우 탐험대! 🚀
        </h1>
        <p className="text-muted-foreground font-body text-base md:text-lg mb-6 leading-relaxed">
          컴퓨터를 처음 사용하는 친구들을 위한<br />
          <span className="text-primary font-bold">윈도우 사용법 모험</span>이 시작됩니다!
        </p>

        <div className="flex items-center justify-center gap-6 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MousePointer className="w-4 h-4 text-primary" />
            <span>{total}개 미션</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-star" />
            <span>별 모으기</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mb-2">이런 것을 배워요</p>
        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-6 text-xs">
          <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full">🖱️ 마우스</span>
          <span className="text-muted-foreground/60">→</span>
          <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full">🪟 윈도우</span>
          <span className="text-muted-foreground/60">→</span>
          <span className="bg-green-50 text-green-600 px-2 py-1 rounded-full">🌐 인터넷</span>
          <span className="text-muted-foreground/60">→</span>
          <span className="bg-purple-50 text-purple-600 px-2 py-1 rounded-full">📝 한글</span>
          <span className="text-muted-foreground/60">→</span>
          <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full">📊 엑셀</span>
          <span className="text-muted-foreground/60">→</span>
          <span className="bg-orange-50 text-orange-600 px-2 py-1 rounded-full">📽️ PPT</span>
        </div>

        {hasProgress ? (
          <div className="space-y-2">
            <div className="bg-accent/10 border border-accent/30 rounded-xl p-3 text-sm text-foreground">
              지난번에 <span className="font-display text-accent">{completedCount}/{total}</span> 임무까지 했어요.
              {currentQuestTitle && (
                <div className="text-xs text-muted-foreground mt-1 truncate">
                  다음 임무: {currentQuestTitle}
                </div>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={onResume ?? onStart}
              className="w-full min-h-[52px] py-3 px-6 rounded-2xl bg-secondary text-secondary-foreground font-display text-lg shadow-quest flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" /> 이어서 탐험하기
            </motion.button>
            <div className="flex gap-2">
              <button
                onClick={onJumpTo}
                className="flex-1 min-h-[44px] py-2 rounded-xl bg-primary/10 text-primary font-display text-sm flex items-center justify-center gap-1.5 hover:bg-primary/20 transition"
              >
                <ListChecks className="w-4 h-4" /> 임무 골라서 연습하기
              </button>
              <button
                onClick={onFreshStart}
                className="flex-1 min-h-[44px] py-2 rounded-xl bg-muted text-foreground font-display text-sm flex items-center justify-center gap-1.5 hover:bg-muted/70 transition"
              >
                <RotateCcw className="w-4 h-4" /> 모두 지우고 처음부터
              </button>
            </div>
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStart}
            className="w-full min-h-[56px] py-4 px-8 rounded-2xl bg-secondary text-secondary-foreground font-display text-xl shadow-quest hover:brightness-105 transition-all"
          >
            모험 시작하기! 🎮
          </motion.button>
        )}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-6 text-primary-foreground/70 text-sm"
      >
        약 40분 정도 걸려요 · 천천히 따라해 보세요!
      </motion.p>
    </div>
  );
};

export default StartScreen;
