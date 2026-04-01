import { motion, AnimatePresence } from "framer-motion";
import { PRAISE_MESSAGES } from "@/types/quest";
import { useMemo } from "react";

interface CharacterPraiseProps {
  visible: boolean;
}

const CharacterPraise = ({ visible }: CharacterPraiseProps) => {
  const msg = useMemo(
    () => PRAISE_MESSAGES[Math.floor(Math.random() * PRAISE_MESSAGES.length)],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visible]
  );

  return (
    <AnimatePresence>
      {visible && (
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
            className="relative bg-card rounded-2xl shadow-card px-5 py-3 border border-border max-w-[260px]"
          >
            <div className="absolute -left-2 bottom-3 w-4 h-4 bg-card border-l border-b border-border rotate-45" />
            <p className="font-display text-base text-foreground relative z-10">{msg.text}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CharacterPraise;
