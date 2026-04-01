import { motion, AnimatePresence } from "framer-motion";

interface WrongClickHintProps {
  visible: boolean;
  message: string;
  position: { x: number; y: number };
}

const WrongClickHint = ({ visible, message, position }: WrongClickHintProps) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -10 }}
        className="absolute z-[80] pointer-events-none"
        style={{ left: Math.min(position.x, window.innerWidth - 280), top: Math.max(position.y - 60, 10) }}
      >
        <div className="bg-secondary/95 text-secondary-foreground rounded-xl px-4 py-2.5 shadow-quest max-w-[260px] border border-secondary">
          <p className="font-display text-xs leading-relaxed">{message}</p>
        </div>
        <div className="w-3 h-3 bg-secondary/95 border-r border-b border-secondary rotate-45 ml-6 -mt-1.5" />
      </motion.div>
    )}
  </AnimatePresence>
);

export default WrongClickHint;
