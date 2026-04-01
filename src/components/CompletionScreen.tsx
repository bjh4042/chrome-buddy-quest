import { motion } from "framer-motion";
import { Trophy, Star, RotateCcw } from "lucide-react";

interface CompletionScreenProps {
  score: number;
  totalScore: number;
  totalStars: number;
  onRestart: () => void;
}

const CompletionScreen = ({ score, totalScore, totalStars, onRestart }: CompletionScreenProps) => {
  const percentage = Math.round((score / totalScore) * 100);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-accent/80 to-primary p-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="bg-card rounded-3xl shadow-card p-8 md:p-12 max-w-md w-full text-center"
      >
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-secondary/30 mb-6"
        >
          <Trophy className="w-14 h-14 text-star" />
        </motion.div>

        <h1 className="text-3xl md:text-4xl font-display text-foreground mb-2">
          축하합니다! 🎊
        </h1>
        <p className="text-muted-foreground font-body text-lg mb-6">
          모든 미션을 완료했어요!
        </p>

        <div className="bg-muted/50 rounded-2xl p-6 mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-body text-muted-foreground">총 점수</span>
            <span className="font-display text-2xl text-primary">{score} / {totalScore}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-body text-muted-foreground">달성률</span>
            <span className="font-display text-xl text-accent">{percentage}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-body text-muted-foreground">별</span>
            <div className="flex items-center gap-1">
              {[...Array(totalStars)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-star fill-star" />
              ))}
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRestart}
          className="w-full py-4 px-8 rounded-2xl bg-primary text-primary-foreground font-display text-xl flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          다시 도전하기!
        </motion.button>
      </motion.div>
    </div>
  );
};

export default CompletionScreen;
