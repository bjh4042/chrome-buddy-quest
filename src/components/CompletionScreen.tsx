import { motion } from "framer-motion";
import { Trophy, Star, RotateCcw, Award, Medal } from "lucide-react";

interface CompletionScreenProps {
  score: number;
  totalScore: number;
  totalStars: number;
  onRestart: () => void;
}

const MEDAL_THRESHOLD = 10; // 10 stars = 1 gold medal

const CompletionScreen = ({ score, totalScore, totalStars, onRestart }: CompletionScreenProps) => {
  const percentage = Math.round((score / totalScore) * 100);

  const getBadge = () => {
    if (percentage >= 90) return {
      label: "골드",
      color: "from-[hsl(45,90%,50%)] to-[hsl(35,95%,40%)]",
      textColor: "text-[hsl(45,90%,40%)]",
      ringColor: "ring-[hsl(45,90%,50%)]",
      desc: "최고의 윈도우 탐험가!",
      innerColor: "hsl(45,90%,55%)",
      ribbonColor: "hsl(35,80%,35%)",
    };
    if (percentage >= 60) return {
      label: "실버",
      color: "from-[hsl(210,15%,70%)] to-[hsl(210,10%,50%)]",
      textColor: "text-[hsl(210,15%,45%)]",
      ringColor: "ring-[hsl(210,15%,60%)]",
      desc: "훌륭한 윈도우 탐험가!",
      innerColor: "hsl(210,15%,75%)",
      ribbonColor: "hsl(210,10%,45%)",
    };
    return {
      label: "브론즈",
      color: "from-[hsl(25,70%,55%)] to-[hsl(20,65%,40%)]",
      textColor: "text-[hsl(25,70%,45%)]",
      ringColor: "ring-[hsl(25,70%,55%)]",
      desc: "멋진 윈도우 초보 탐험가!",
      innerColor: "hsl(25,70%,60%)",
      ribbonColor: "hsl(20,60%,35%)",
    };
  };

  const badge = getBadge();
  const goldMedals = Math.floor(totalStars / MEDAL_THRESHOLD);
  const remainingStars = totalStars % MEDAL_THRESHOLD;

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
          <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br ${badge.color} shadow-xl ring-4 ${badge.ringColor} ring-offset-2`}>
            <motion.div
              animate={{ scale: [1, 1.08, 1], rotate: [0, 3, -3, 0] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="flex flex-col items-center"
            >
              {/* Custom badge SVG */}
              <svg viewBox="0 0 80 80" className="w-20 h-20">
                {/* Medal circle */}
                <circle cx="40" cy="32" r="22" fill="white" fillOpacity="0.3" />
                <circle cx="40" cy="32" r="18" fill="white" fillOpacity="0.2" />
                {/* Award icon */}
                <circle cx="40" cy="28" r="8" fill="none" stroke="white" strokeWidth="2.5" />
                <line x1="40" y1="36" x2="40" y2="42" stroke="white" strokeWidth="2.5" />
                <line x1="34" y1="48" x2="40" y2="42" stroke="white" strokeWidth="2.5" />
                <line x1="46" y1="48" x2="40" y2="42" stroke="white" strokeWidth="2.5" />
                {/* Ribbon */}
                <path d="M30 55 L35 65 L40 58 L45 65 L50 55" fill="white" fillOpacity="0.4" />
              </svg>
            </motion.div>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className={`font-display text-2xl mt-4 ${badge.textColor}`}
          >
            🏅 {badge.label} 뱃지 획득!
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
            <div className="flex items-center gap-1 flex-wrap justify-end">
              {/* Gold medals for every 10 stars */}
              {goldMedals > 0 && (
                <div className="flex items-center gap-0.5">
                  {[...Array(goldMedals)].map((_, i) => (
                    <motion.div
                      key={`medal-${i}`}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.8 + i * 0.1 }}
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[hsl(45,90%,55%)] to-[hsl(35,85%,40%)] flex items-center justify-center shadow-sm">
                        <span className="text-[10px]">🏅</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              {/* Remaining stars */}
              {remainingStars > 0 && (
                <div className="flex items-center gap-0.5">
                  {[...Array(remainingStars)].map((_, i) => (
                    <motion.div
                      key={`star-${i}`}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.8 + goldMedals * 0.1 + i * 0.05 }}
                    >
                      <Star className="w-4 h-4 text-star fill-star" />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-body text-muted-foreground">등급</span>
            <span className={`font-display text-lg ${badge.textColor}`}>
              🏅 {badge.label}
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
