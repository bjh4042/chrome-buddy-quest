import { motion, AnimatePresence } from "framer-motion";

interface FingerGuideProps {
  visible: boolean;
  x: string;
  y: string;
  label?: string;
}

const FingerGuide = ({ visible, x, y, label }: FingerGuideProps) => (
  <AnimatePresence>
    {visible && label && (
      <motion.div
        className="absolute z-[90] pointer-events-none flex flex-col items-center"
        style={{ left: x, top: y, transform: "translate(-50%, -120%)" }}
        initial={{ opacity: 0, y: 5, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
      >
        <div className="bg-foreground/90 text-background text-xs font-display px-3 py-1.5 rounded-full whitespace-nowrap shadow-lg animate-bounce-gentle">
          {label}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default FingerGuide;
