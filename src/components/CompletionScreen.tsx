import { motion } from "framer-motion";
import { Trophy, Star, RotateCcw, Award } from "lucide-react";

interface CompletionScreenProps {
  score: number;
  totalScore: number;
  totalStars: number;
  onRestart: () => void;
}

const CompletionScreen = ({ score, totalScore, totalStars, onRestart }: CompletionScreenProps) => {
  const percentage = Math.round((score / totalScore) * 100);

  const getBadge = () => {
    if (percentage >= 90) return { label: "골드", emoji: "🥇", color: "from-yellow-400 to-yellow-600", textColor: "text-yellow-600", desc: "최고의 윈도우 탐험가!" };
    if (percentage >= 60) return { label: "실버", emoji: "🥈", color: "from-gray-300 to-gray-500", textColor: "text-gray-500", desc: "훌륭한 윈도우 탐험가!" };
    return { label: "브론즈", emoji: "🥉", color: "from-orange-300 to-orange-500", textColor: "text-orange-500", desc: "멋진 윈도우 초보 탐험가!" };
  };

  const badge = getBadge();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-accent/80 to-primary p-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="bg-card rounded-3xl shadow-card p-8 md:p-12 max-w-md w-full text-center"
      >
        {/* Badge */}
        <motion.div
          initial={{ rotateY: 180, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mb-6"
        >
          <div className={`inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br ${badge.color} shadow-lg`}>
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Award className="w-14 h-14 text-white" />
            </motion.div>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className={`font-display text-2xl mt-3 ${badge.textColor}`}
          >
            {badge.emoji} {badge.label} 뱃지 획득!
          </motion.p>
        </motion.div>

        <h1 className="text-3xl md:text-4xl font-display text-foreground mb-2">
          축하합니다! 🎊
        </h1>
        <p className="text-muted-foreground font-body text-base mb-1">
          모든 미션을 완료했어요!
        </p>
        <p className="text-muted-foreground font-body text-sm mb-6">
          {badge.desc}
        </p>

        <div className="bg-muted/50 rounded-2xl p-6 mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-body text-muted-foreground">총 점수</span>
            <span className="font-display text-2xl text-primary">{score} / {totalScore}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-body text-muted-foreground">달성률</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className={`h-full rounded-full bg-gradient-to-r ${badge.color}`}
                />
              </div>
              <span className="font-display text-lg text-accent">{percentage}%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-body text-muted-foreground">별</span>
            <div className="flex items-center gap-0.5">
              {[...Array(Math.min(totalStars, 20))].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.8 + i * 0.05 }}
                >
                  <Star className="w-4 h-4 text-star fill-star" />
                </motion.div>
              ))}
              {totalStars > 20 && (
                <span className="text-xs text-star font-display ml-1">+{totalStars - 20}</span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-body text-muted-foreground">등급</span>
            <span className={`font-display text-lg ${badge.textColor}`}>
              {badge.emoji} {badge.label}
            </span>
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
