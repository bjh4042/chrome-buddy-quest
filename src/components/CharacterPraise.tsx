import { motion, AnimatePresence } from "framer-motion";
import { PRAISE_MESSAGES } from "@/types/quest";
import { useMemo } from "react";
import { Star, ArrowRight, RotateCcw } from "lucide-react";

interface CharacterPraiseProps {
  visible: boolean;
  onNext?: () => void;
  onPractice?: () => void;
  isLast?: boolean;
  practiceMode?: boolean;
}

const CONFETTI_COLORS = [
  "hsl(45 100% 55%)", "hsl(213 90% 60%)", "hsl(145 65% 50%)",
  "hsl(0 75% 60%)", "hsl(280 70% 60%)", "hsl(30 100% 60%)",
];

const CharacterPraise = ({ visible, onNext, onPractice, isLast, practiceMode }: CharacterPraiseProps) => {
  const msg = useMemo(
    () => PRAISE_MESSAGES[Math.floor(Math.random() * PRAISE_MESSAGES.length)],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visible]
  );
  const confetti = useMemo(
    () => Array.from({ length: 28 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.4,
      duration: 1.4 + Math.random() * 1.2,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      size: 6 + Math.random() * 8,
      rotate: Math.random() * 360,
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visible]
  );

  return (
    <AnimatePresence>
      {visible && (
        <>
        {/* Confetti */}
        <div className="fixed inset-0 z-[105] pointer-events-none overflow-hidden">
          {confetti.map(c => (
            <span
              key={c.id}
              style={{
                position: "absolute",
                left: `${c.left}%`,
                top: "-20px",
                width: c.size,
                height: c.size * 1.4,
                background: c.color,
                transform: `rotate(${c.rotate}deg)`,
                animation: `confetti-fall ${c.duration}s ${c.delay}s ease-in forwards`,
                borderRadius: "2px",
              }}
            />
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.8 }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[110] flex items-end gap-2"
        >
          {/* Character */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="text-6xl"
          >
            {msg.emoji}
          </motion.div>
          {/* Speech bubble */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="relative bg-card rounded-2xl shadow-card px-5 py-3 border border-border max-w-[320px] pointer-events-auto"
          >
            <div className="absolute -left-2 bottom-3 w-4 h-4 bg-card border-l border-b border-border rotate-45" />
            <p className="font-display text-base text-foreground relative z-10">
              {practiceMode ? "잘했어요! 한 번 더 연습해도 좋아요." : msg.text}
            </p>
            {/* Sequential star fill */}
            <div className="flex items-center justify-center gap-1 mt-2">
              {[0, 1, 2].map(i => (
                <Star
                  key={i}
                  className="w-5 h-5 text-[hsl(var(--star-fill))] fill-[hsl(var(--star-fill))] animate-star-pop"
                  style={{ animationDelay: `${0.4 + i * 0.18}s` }}
                />
              ))}
            </div>
            {(onNext || onPractice) && (
              <div className="flex gap-2 mt-3">
                {onPractice && (
                  <button
                    onClick={onPractice}
                    className="flex-1 min-h-[44px] px-3 py-2 rounded-xl bg-muted text-foreground text-sm font-display flex items-center justify-center gap-1.5 hover:bg-muted/70 active:scale-95 transition"
                  >
                    <RotateCcw className="w-4 h-4" /> 한 번 더 연습
                  </button>
                )}
                {onNext && !practiceMode && (
                  <button
                    onClick={onNext}
                    className="flex-1 min-h-[44px] px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-display flex items-center justify-center gap-1.5 hover:brightness-110 active:scale-95 transition"
                  >
                    {isLast ? "완료 화면 보기" : "다음 임무"} <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                {practiceMode && onNext && (
                  <button
                    onClick={onNext}
                    className="flex-1 min-h-[44px] px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-display hover:brightness-110 active:scale-95 transition"
                  >
                    확인
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CharacterPraise;
