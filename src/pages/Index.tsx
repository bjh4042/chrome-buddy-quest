import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import StartScreen from "@/components/StartScreen";
import QuestPanel from "@/components/QuestPanel";
import WinDesktop from "@/components/WinDesktop";
import CompletionScreen from "@/components/CompletionScreen";
import CharacterPraise from "@/components/CharacterPraise";
import TermDictionary from "@/components/TermDictionary";
import { QUESTS, QUEST_CATEGORIES, type Quest } from "@/types/quest";
import { QuestEngineProvider, useQuestEngine } from "@/features/quests/useQuestEngine";

type Screen = "start" | "tutorial" | "complete";

const STORAGE_KEY = "win-explorer-progress-v2";
const NEXT_QUEST_DELAY_MS = 8000;

type SavedProgress = {
  version: 2;
  screen: Screen;
  questsState: { id: string; completed: boolean; starsEarned: number }[];
  currentQuest: number;
};

const ALLOWED_SCREENS: Screen[] = ["start", "tutorial", "complete"];

const loadProgress = (): SavedProgress | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const screen: Screen = ALLOWED_SCREENS.includes(parsed.screen) ? parsed.screen : "tutorial";
    const rawStates = Array.isArray(parsed.questsState) ? parsed.questsState : [];
    const validIds = new Set(QUESTS.map(q => q.id));
    const questsState = rawStates
      .filter((s: unknown): s is { id: string; completed: boolean; starsEarned: number } => {
        if (!s || typeof s !== "object") return false;
        const o = s as Record<string, unknown>;
        return (
          typeof o.id === "string" &&
          validIds.has(o.id) &&
          typeof o.completed === "boolean" &&
          typeof o.starsEarned === "number" &&
          o.starsEarned >= 0 &&
          o.starsEarned <= 3
        );
      })
      .map(s => ({ id: s.id, completed: !!s.completed, starsEarned: Math.max(0, Math.min(3, Math.floor(s.starsEarned))) }));
    const cq = typeof parsed.currentQuest === "number" ? Math.floor(parsed.currentQuest) : 0;
    const currentQuest = Math.max(0, Math.min(QUESTS.length - 1, cq));
    return { version: 2, screen, questsState, currentQuest };
  } catch {
    return null;
  }
};

const Index = () => {
  const saved = loadProgress();
  // Do NOT auto-jump into the tutorial on load — always start on the start screen.
  const [screen, setScreen] = useState<Screen>(saved?.screen === "complete" ? "complete" : "start");
  const [quests, setQuests] = useState<Quest[]>(() => {
    const base = QUESTS.map(q => ({ ...q, completed: false, starsEarned: 0 }));
    if (saved?.questsState) {
      for (const s of saved.questsState) {
        const i = base.findIndex(b => b.id === s.id);
        if (i >= 0) {
          base[i] = { ...base[i], completed: s.completed, starsEarned: s.starsEarned };
        }
      }
    }
    return base;
  });
  const [currentQuest, setCurrentQuest] = useState(saved?.currentQuest ?? 0);
  const [showPraise, setShowPraise] = useState(false);
  const [praiceIsReplay, setPraiseIsReplay] = useState(false);
  const [confirmRestart, setConfirmRestart] = useState(false);
  // Persistent key — don't remount WinDesktop on quest change
  const [desktopKey] = useState(() => Math.random());

  // Locks / timers to prevent duplicate completions
  const completingRef = useRef(false);
  const nextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearNextTimer = () => {
    if (nextTimerRef.current) {
      clearTimeout(nextTimerRef.current);
      nextTimerRef.current = null;
    }
  };
  useEffect(() => () => { clearNextTimer(); }, []);

  // Persist progress
  useEffect(() => {
    const data: SavedProgress = {
      version: 2,
      screen,
      questsState: quests.map(q => ({ id: q.id, completed: q.completed, starsEarned: q.starsEarned })),
      currentQuest,
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
  }, [screen, quests, currentQuest]);

  const totalScore = QUESTS.reduce((sum, q) => sum + q.points, 0);

  // Derived score — always from completed quests
  const score = useMemo(
    () => quests.reduce((sum, q) => sum + (q.completed ? q.points : 0), 0),
    [quests]
  );

  const unlockedCategories = useMemo(() => {
    const unlocked: string[] = [];
    for (const cat of QUEST_CATEGORIES) {
      const prevCatIndex = QUEST_CATEGORIES.findIndex(c => c.id === cat.id) - 1;
      if (prevCatIndex < 0) {
        unlocked.push(cat.id);
      } else {
        const prevCat = QUEST_CATEGORIES[prevCatIndex];
        const prevCatQuests = quests.filter(q => q.category === prevCat.id);
        if (prevCatQuests.every(q => q.completed)) {
          unlocked.push(cat.id);
        }
      }
    }
    return unlocked;
  }, [quests]);

  const handleStart = () => setScreen("tutorial");
  const handleResume = () => setScreen("tutorial");
  const handleJumpTo = (index: number) => {
    if (index < 0 || index >= QUESTS.length) return;
    setCurrentQuest(index);
    setScreen("tutorial");
  };

  const handleQuestComplete = useCallback(() => {
    // Guard: prevent duplicate completion for the same quest
    if (completingRef.current) return;
    const idx = currentQuest;
    if (idx < 0 || idx >= QUESTS.length) return;
    const already = quests[idx]?.completed;

    completingRef.current = true;
    clearNextTimer();

    if (!already) {
      setQuests(prev => {
        if (prev[idx]?.completed) return prev;
        const updated = [...prev];
        updated[idx] = { ...updated[idx], completed: true, starsEarned: 3 };
        return updated;
      });
    }
    // Always show praise (even in practice mode) but no double-score because state guarded above
    setPraiseIsReplay(!!already);
    setShowPraise(true);

    nextTimerRef.current = setTimeout(() => {
      setShowPraise(false);
      nextTimerRef.current = null;
      completingRef.current = false;
      if (already) return; // practice replay — don't auto-advance
      if (idx < QUESTS.length - 1) {
        setCurrentQuest(idx + 1);
      } else {
        setScreen("complete");
      }
    }, NEXT_QUEST_DELAY_MS);
  }, [currentQuest, quests]);

  const closePraise = () => {
    clearNextTimer();
    setShowPraise(false);
    completingRef.current = false;
  };

  const advanceNow = () => {
    const idx = currentQuest;
    const wasReplay = praiceIsReplay;
    closePraise();
    if (wasReplay) return; // replay: just close
    if (idx < QUESTS.length - 1) {
      setCurrentQuest(idx + 1);
    } else {
      setScreen("complete");
    }
  };

  const stayForPractice = () => {
    closePraise();
  };

  const doRestart = () => {
    clearNextTimer();
    completingRef.current = false;
    setShowPraise(false);
    setQuests(QUESTS.map(q => ({ ...q, completed: false, starsEarned: 0 })));
    setCurrentQuest(0);
    setScreen("start");
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setConfirmRestart(false);
  };
  const handleRestart = () => setConfirmRestart(true);

  const handleSelectQuest = (index: number) => {
    if (index < 0 || index >= QUESTS.length) return;
    clearNextTimer();
    completingRef.current = false;
    setShowPraise(false);
    setCurrentQuest(index);
  };

  const handleRetryQuest = (index: number) => {
    if (index < 0 || index >= QUESTS.length) return;
    clearNextTimer();
    completingRef.current = false;
    setShowPraise(false);
    setQuests(prev => {
      if (!prev[index]?.completed) {
        // No score deduction if it wasn't completed
        return prev;
      }
      const updated = [...prev];
      updated[index] = { ...updated[index], completed: false, starsEarned: 0 };
      return updated;
    });
    setCurrentQuest(index);
  };

  const currentAlreadyCompleted = quests[currentQuest]?.completed === true;

  const engine = useQuestEngine({
    currentQuest: quests[currentQuest]?.type ?? QUESTS[0].type,
    onComplete: handleQuestComplete,
  });

  if (screen === "start") {
    const completedCount = quests.filter(q => q.completed).length;
    return (
      <StartScreen
        onStart={handleStart}
        hasProgress={completedCount > 0}
        completedCount={completedCount}
        totalQuests={QUESTS.length}
        currentQuestTitle={quests[currentQuest]?.title}
        onResume={handleResume}
        onJumpTo={() => handleJumpTo(0)}
        onFreshStart={() => setConfirmRestart(true)}
      />
    );
  }

  if (screen === "complete") {
    const totalStars = quests.reduce((sum, q) => sum + q.starsEarned, 0);
    return (
      <>
        <CompletionScreen
          score={score}
          totalScore={totalScore}
          totalStars={totalStars}
          onRestart={handleRestart}
        />
        {confirmRestart && (
          <RestartConfirmDialog onCancel={() => setConfirmRestart(false)} onConfirm={doRestart} />
        )}
      </>
    );
  }

  return (
    <QuestEngineProvider value={engine}>
    <div className="h-screen flex flex-col md:flex-row overflow-hidden">
      <div className="md:h-full h-auto max-h-[35vh] md:max-h-full overflow-auto shrink-0">
        <QuestPanel
          quests={quests}
          currentQuest={currentQuest}
          score={score}
          totalScore={totalScore}
          onSelectQuest={handleSelectQuest}
          onRestart={handleRestart}
          onRetryQuest={handleRetryQuest}
          showComplete={quests.every(q => q.completed)}
          unlockedCategories={unlockedCategories}
        />
      </div>
      <div className="flex-1 h-full overflow-hidden relative">
        <WinDesktop
          key={desktopKey}
          currentQuestType={quests[currentQuest].type}
          onQuestComplete={handleQuestComplete}
          instruction={quests[currentQuest].instruction}
        />
        {currentAlreadyCompleted && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 bg-accent/90 text-accent-foreground text-xs md:text-sm px-3 py-1.5 rounded-full shadow-md pointer-events-none">
            ✅ 완료한 임무예요. 다시 연습할 수 있지만 점수는 추가되지 않아요.
          </div>
        )}
        <TermDictionary termKey={quests[currentQuest].termKey} />
        <CharacterPraise
          visible={showPraise}
          onNext={advanceNow}
          onPractice={stayForPractice}
          isLast={currentQuest === QUESTS.length - 1}
          practiceMode={praiceIsReplay}
        />
        {confirmRestart && (
          <RestartConfirmDialog onCancel={() => setConfirmRestart(false)} onConfirm={doRestart} />
        )}
      </div>
    </div>
    </QuestEngineProvider>
  );
};

const RestartConfirmDialog = ({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) => (
  <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
    <div className="bg-card rounded-2xl shadow-xl max-w-sm w-full p-6">
      <h3 className="font-display text-lg text-foreground mb-2">처음부터 다시 시작할까요?</h3>
      <p className="text-sm text-muted-foreground mb-5">
        지금까지 완료한 임무와 모은 별이 모두 사라져요.
      </p>
      <div className="flex gap-2 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg bg-muted text-foreground text-sm font-display hover:bg-muted/70"
        >
          계속 탐험하기
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-display hover:opacity-90"
        >
          모두 지우고 처음부터
        </button>
      </div>
    </div>
  </div>
);

export default Index;
