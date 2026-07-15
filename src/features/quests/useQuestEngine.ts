import { createContext, useCallback, useContext, useMemo, useRef } from "react";
import type { QuestType } from "@/types/quest";
import type { LearningEvent } from "./questEvents";
import { validateEvent } from "./questValidators";

/**
 * QuestEngine — the single place that turns learning events into pass/wrong
 * signals for the current quest. UI components emit events; validators decide.
 *
 * Additive: existing components can still call onQuestComplete() directly.
 * New/refactored components should call emit(event) via useQuestEmit().
 */
export interface QuestEngineValue {
  currentQuest: QuestType;
  emit: (event: LearningEvent) => "pass" | "wrong" | "ignore";
  onWrong?: (event: LearningEvent) => void;
}

const QuestEngineContext = createContext<QuestEngineValue | null>(null);

export interface QuestEngineOptions {
  currentQuest: QuestType;
  onComplete: () => void;
  onWrong?: (event: LearningEvent) => void;
}

/** Build a QuestEngine value that can be provided via <QuestEngineProvider>. */
export const useQuestEngine = ({ currentQuest, onComplete, onWrong }: QuestEngineOptions): QuestEngineValue => {
  const currentRef = useRef(currentQuest);
  currentRef.current = currentQuest;
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;
  const wrongRef = useRef(onWrong);
  wrongRef.current = onWrong;

  const emit = useCallback((event: LearningEvent) => {
    const result = validateEvent(currentRef.current, event);
    if (result === "pass") completeRef.current();
    else if (result === "wrong") wrongRef.current?.(event);
    return result;
  }, []);

  return useMemo(() => ({ currentQuest, emit, onWrong }), [currentQuest, emit, onWrong]);
};

export const QuestEngineProvider = QuestEngineContext.Provider;

/** Emit a learning event; safe no-op when no provider is mounted. */
export const useQuestEmit = (): ((event: LearningEvent) => "pass" | "wrong" | "ignore") => {
  const ctx = useContext(QuestEngineContext);
  return useCallback(
    (event: LearningEvent) => (ctx ? ctx.emit(event) : "ignore"),
    [ctx],
  );
};

/** Read the currently active quest type (for UI hints only, not for judgment). */
export const useCurrentQuest = (): QuestType | null => {
  const ctx = useContext(QuestEngineContext);
  return ctx?.currentQuest ?? null;
};