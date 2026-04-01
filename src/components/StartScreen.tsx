import { motion } from "framer-motion";
import { Monitor, MousePointer, Star } from "lucide-react";

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen = ({ onStart }: StartScreenProps) => {
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

        <div className="flex items-center justify-center gap-6 mb-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MousePointer className="w-4 h-4 text-primary" />
            <span>10개 미션</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-star" />
            <span>별 모으기</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="w-full py-4 px-8 rounded-2xl bg-secondary text-secondary-foreground font-display text-xl shadow-quest hover:brightness-105 transition-all"
        >
          모험 시작하기! 🎮
        </motion.button>
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
