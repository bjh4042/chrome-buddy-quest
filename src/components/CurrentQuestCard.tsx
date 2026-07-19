import { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle2, RotateCcw, Sparkles } from "lucide-react";

interface CurrentQuestCardProps {
  instruction: string;
  hint?: string;
  alreadyCompleted?: boolean;
  modeBadge?: { label: string; hint?: string };
}

const CurrentQuestCard = ({ instruction, hint, alreadyCompleted, modeBadge }: CurrentQuestCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = instruction.length > 60;
  return (
    <section
      className="shrink-0 border-b border-border bg-card px-3 sm:px-4 py-2 sm:py-2.5 flex items-start gap-3 z-20"
      aria-label="지금 할 일"
    >
      <div className="shrink-0 mt-0.5 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-secondary/25 text-secondary-foreground text-fluid-2xs font-display">
        <Sparkles className="w-3 h-3" /> 지금 할 일
      </div>

      <div className="flex-1 min-w-0">
        {modeBadge && (
          <div className="mb-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-fluid-2xs font-display">
            {modeBadge.label}
          </div>
        )}
        <p
          className={`font-display text-fluid-sm sm:text-fluid-base text-foreground ${
            expanded || !isLong ? "" : "line-clamp-2"
          }`}
        >
          {instruction}
        </p>
        {alreadyCompleted && (
          <div className="inline-flex items-center gap-1 mt-1 text-fluid-2xs text-accent">
            <CheckCircle2 className="w-3 h-3" /> 완료한 임무예요. 다시 연습해도 점수는 그대로예요.
          </div>
        )}
        {modeBadge?.hint && (
          <div className="text-fluid-2xs text-muted-foreground mt-0.5">{modeBadge.hint}</div>
        )}
        {expanded && hint && (
          <div className="mt-1 inline-flex items-start gap-1 text-fluid-2xs text-muted-foreground">
            <RotateCcw className="w-3 h-3 mt-0.5" /> <span>{hint}</span>
          </div>
        )}
      </div>

      {(isLong || hint) && (
        <button
          onClick={() => setExpanded(v => !v)}
          aria-label={expanded ? "임무 설명 접기" : "임무 설명 펼치기"}
          className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-muted transition"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      )}
    </section>
  );
};

export default CurrentQuestCard;