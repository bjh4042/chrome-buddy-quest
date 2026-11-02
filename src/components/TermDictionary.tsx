import ViewportDialog from "./apps/ViewportDialog";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, X } from "lucide-react";
import { TERMS } from "@/types/quest";

interface TermDictionaryProps {
  termKey?: string;
}

const TermDictionary = ({ termKey }: TermDictionaryProps) => {
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const currentTerm = termKey ? TERMS[termKey] : null;

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed bottom-16 left-3 z-[60] bg-primary text-primary-foreground rounded-full p-2.5 shadow-game hover:scale-110 transition-transform"
        whileTap={{ scale: 0.9 }}
        title="용어 사전"
      >
        <BookOpen className="w-5 h-5" />
      </motion.button>

      {/* Auto popup for new term */}
      <AnimatePresence>
        {currentTerm && !open && (
          <motion.div
            key={termKey}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ delay: 0.5 }}
            className="term-auto-tip fixed bottom-28 left-3 z-[60] bg-card border border-border rounded-xl shadow-card p-3 max-w-[260px]"
          >
            <div className="flex items-start gap-2">
              <span className="text-2xl">{currentTerm.emoji}</span>
              <div className="flex-1">
                <p className="font-display text-sm text-primary">{currentTerm.term}</p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{currentTerm.meaning}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full dictionary modal */}
      <AnimatePresence>
        {open && (
          <ViewportDialog title="📖 컴퓨터 용어 사전" onClose={()=>setOpen(false)} style={{maxWidth:420}} footer={<button type="button" onClick={()=>setOpen(false)} className="border rounded px-4 py-2 text-sm">닫기</button>}>
              {currentTerm && !showAll && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 mb-3">
                  <div className="flex items-start gap-2">
                    <span className="text-2xl">{currentTerm.emoji}</span>
                    <div>
                      <p className="font-display text-sm text-primary">{currentTerm.term}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{currentTerm.meaning}</p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowAll(!showAll)}
                className="text-xs text-primary font-display mb-3 hover:underline"
              >
                {showAll ? "현재 용어만 보기" : "모든 용어 보기"}
              </button>

              {showAll && (
                <div className="space-y-2">
                  {Object.values(TERMS).map((t, i) => (
                    <div key={i} className="bg-muted/50 rounded-lg p-2.5 flex items-start gap-2">
                      <span className="text-lg">{t.emoji}</span>
                      <div>
                        <p className="font-display text-xs text-foreground">{t.term}</p>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">{t.meaning}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </ViewportDialog>
        )}
      </AnimatePresence>
    </>
  );
};

export default TermDictionary;
