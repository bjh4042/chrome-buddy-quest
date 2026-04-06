import { motion, AnimatePresence } from "framer-motion";

interface FingerGuideProps {
  visible: boolean;
  x: string;
  y: string;
  label?: string;
}

const FingerGuide = ({ visible, x, y, label }: FingerGuideProps) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        className="absolute z-[90] pointer-events-none flex flex-col items-center"
        style={{ left: x, top: y, transform: "translate(-50%, -92%)" }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
      >
        {label && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-1 bg-foreground/90 text-background text-xs font-display px-3 py-1.5 rounded-full whitespace-nowrap shadow-lg"
          >
            {label}
          </motion.div>
        )}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
          className="text-4xl drop-shadow-lg"
        >
          👇
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default FingerGuide;
