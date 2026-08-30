import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import StartScreen from "@/components/StartScreen";
import QuestPanel from "@/components/QuestPanel";
import QuestSheet from "@/components/QuestSheet";
import TopLearnBar from "@/components/TopLearnBar";
import CurrentQuestCard from "@/components/CurrentQuestCard";
import WinDesktop from "@/components/WinDesktop";
import CompletionScreen from "@/components/CompletionScreen";
import CharacterPraise from "@/components/CharacterPraise";
import TermDictionary from "@/components/TermDictionary";
import CategoryPicker from "@/components/CategoryPicker";
import { QUESTS, type Quest, type QuestCategory } from "@/types/quest";
import { QuestEngineProvider, useQuestEngine } from "@/features/quests/useQuestEngine";
import {
  LEARNING_MODES,
  getLearningMode,
  type LearningMode,
} from "@/features/learning/learningMode";
import {
  computeStoryUnlockedCategories,
  unlockedCategoriesForMode,
  visibleCategoriesForMode,
  strictQuestOrder,
} from "@/features/learning/access";

type Screen = "start" | "tutorial" | "complete" | "category-picker";

const STORAGE_KEY = "win-explorer-progress-v2";
const NEXT_QUEST_DELAY_MS = 8000;

type SavedProgress = {
  version: 2;
  screen: Screen;
  questsState: { id: string; completed: boolean; starsEarned: number }[];
  currentQuest: number;
  learningMode?: LearningMode;
  practiceQuestId?: string | null;
  teacherCategory?: QuestCategory | null;
};

const ALLOWED_SCREENS: Screen[] = ["start", "tutorial", "complete", "category-picker"];
const ALLOWED_MODES: LearningMode[] = ["story", "free-practice", "teacher"];
const ALLOWED_CATEGORIES: QuestCategory[] = ["mouse", "windows", "internet", "settings", "hangul", "excel", "powerpoint", "finish"];

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
    const learningMode: LearningMode = ALLOWED_MODES.includes(parsed.learningMode) ? parsed.learningMode : "story";
    const practiceQuestId =
      typeof parsed.practiceQuestId === "string" && validIds.has(parsed.practiceQuestId)
        ? parsed.practiceQuestId
        : null;
    const teacherCategory =
      ALLOWED_CATEGORIES.includes(parsed.teacherCategory) ? (parsed.teacherCategory as QuestCategory) : null;
    return { version: 2, screen, questsState, currentQuest, learningMode, practiceQuestId, teacherCategory };
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
  const [learningMode, setLearningMode] = useState<LearningMode>(saved?.learningMode ?? "story");
  const [practiceQuestId, setPracticeQuestId] = useState<string | null>(saved?.practiceQuestId ?? null);
  // Temporary story replay target (NOT persisted): story progress (`currentQuest`) must stay intact.
  const [replayQuestIndex, setReplayQuestIndex] = useState<number | null>(null);
  const [teacherCategory, setTeacherCategory] = useState<QuestCategory | null>(saved?.teacherCategory ?? null);
  const [showPraise, setShowPraise] = useState(false);
  const [praiceIsReplay, setPraiseIsReplay] = useState(false);
  const [confirmRestart, setConfirmRestart] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
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
      learningMode,
      practiceQuestId,
      teacherCategory,
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
  }, [screen, quests, currentQuest, learningMode, practiceQuestId, teacherCategory]);

  const totalScore = QUESTS.reduce((sum, q) => sum + q.points, 0);

  // Derived score — always from completed quests
  const score = useMemo(
    () => quests.reduce((sum, q) => sum + (q.completed ? q.points : 0), 0),
    [quests]
  );

  const storyUnlockedCategories = useMemo(
    () => computeStoryUnlockedCategories(quests),
    [quests]
  );
  const unlockedCategories = useMemo(
    () => unlockedCategoriesForMode(learningMode, storyUnlockedCategories),
    [learningMode, storyUnlockedCategories]
  );
  const visibleCategoryIds = useMemo(
    () => visibleCategoriesForMode(learningMode, teacherCategory),
    [learningMode, teacherCategory]
  );

  // Active quest index depends on mode:
  // - story: storyCurrentQuest (state `currentQuest`)
  // - free-practice: practiceQuestId (fallback: currentQuest)
  // - teacher: practiceQuestId (must be within category) or first quest in category
  const activeQuestIndex = useMemo(() => {
    if (learningMode === "story") return currentQuest;
    const findById = (id: string | null) => (id ? quests.findIndex(q => q.id === id) : -1);
    if (learningMode === "free-practice") {
      const i = findById(practiceQuestId);
      return i >= 0 ? i : currentQuest;
    }
    // teacher
    if (teacherCategory) {
      const i = findById(practiceQuestId);
      if (i >= 0 && quests[i]?.category === teacherCategory) return i;
      const firstIncomplete = quests.findIndex(q => q.category === teacherCategory && !q.completed);
      if (firstIncomplete >= 0) return firstIncomplete;
      const first = quests.findIndex(q => q.category === teacherCategory);
      return first >= 0 ? first : currentQuest;
    }
    return currentQuest;
  }, [learningMode, currentQuest, practiceQuestId, teacherCategory, quests]);

  const clampedActiveIndex = Math.max(0, Math.min(QUESTS.length - 1, activeQuestIndex));

  // Mode transitions
  const enterStory = () => {
    setLearningMode("story");
    setScreen("tutorial");
  };
  const enterFreePractice = () => {
    setLearningMode("free-practice");
    if (!practiceQuestId) setPracticeQuestId(quests[currentQuest]?.id ?? quests[0].id);
    setScreen("tutorial");
  };
  const enterTeacher = () => {
    setLearningMode("teacher");
    setScreen("category-picker");
  };
  const handlePickCategory = (cat: QuestCategory) => {
    setTeacherCategory(cat);
    const firstIncomplete = quests.findIndex(q => q.category === cat && !q.completed);
    const first = firstIncomplete >= 0 ? firstIncomplete : quests.findIndex(q => q.category === cat);
    if (first >= 0) setPracticeQuestId(quests[first].id);
    setScreen("tutorial");
  };
  const changeMode = () => {
    clearNextTimer();
    completingRef.current = false;
    setShowPraise(false);
    setScreen("start");
  };

  const handleQuestComplete = useCallback(() => {
    // Guard: prevent duplicate completion for the same quest
    if (completingRef.current) return;
    const idx = clampedActiveIndex;
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
      // Only auto-advance in story mode
      if (learningMode === "story") {
        if (idx < QUESTS.length - 1) {
          setCurrentQuest(idx + 1);
        } else {
          setScreen("complete");
        }
      }
    }, NEXT_QUEST_DELAY_MS);
  }, [clampedActiveIndex, quests, learningMode]);

  const closePraise = () => {
    clearNextTimer();
    setShowPraise(false);
    completingRef.current = false;
  };

  const advanceNow = () => {
    const idx = clampedActiveIndex;
    const wasReplay = praiceIsReplay;
    closePraise();
    if (wasReplay) return; // replay: just close
    if (learningMode === "story") {
      if (idx < QUESTS.length - 1) {
        setCurrentQuest(idx + 1);
      } else {
        setScreen("complete");
      }
      return;
    }
    if (learningMode === "teacher" && teacherCategory) {
      // move to next incomplete quest in same category
      const nextInCat = quests.findIndex(
        (q, i) => i > idx && q.category === teacherCategory && !q.completed
      );
      if (nextInCat >= 0) setPracticeQuestId(quests[nextInCat].id);
      else setSheetOpen(true);
      return;
    }
    // free-practice: open list
    setSheetOpen(true);
  };

  const backToList = () => {
    closePraise();
    setSheetOpen(true);
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
    setLearningMode("story");
    setPracticeQuestId(null);
    setTeacherCategory(null);
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
    if (learningMode === "story") {
      setCurrentQuest(index);
    } else {
      setPracticeQuestId(quests[index]?.id ?? null);
    }
  };

  const handleRetryQuest = (index: number) => {
    if (index < 0 || index >= QUESTS.length) return;
    clearNextTimer();
    completingRef.current = false;
    setShowPraise(false);
    // Replay policy: keep completed / starsEarned / score intact — just re-enter the quest.
    if (learningMode === "story") {
      setCurrentQuest(index);
    } else {
      setPracticeQuestId(quests[index]?.id ?? null);
    }
  };

  const currentAlreadyCompleted = quests[clampedActiveIndex]?.completed === true;

  const engine = useQuestEngine({
    currentQuest: quests[clampedActiveIndex]?.type ?? QUESTS[0].type,
    onComplete: handleQuestComplete,
  });

  const totalStars = useMemo(
    () => quests.reduce((sum, q) => sum + q.starsEarned, 0),
    [quests]
  );

  const modeMeta = getLearningMode(learningMode);
  const hasCategoryNext = useMemo(() => {
    if (learningMode !== "teacher" || !teacherCategory) return false;
    return quests.some(
      (q, i) => i > clampedActiveIndex && q.category === teacherCategory && !q.completed
    );
  }, [learningMode, teacherCategory, quests, clampedActiveIndex]);

  const handleSelectFromSheet = (index: number) => {
    handleSelectQuest(index);
    setSheetOpen(false);
  };
  const handleRetryFromSheet = (index: number) => {
    handleRetryQuest(index);
    setSheetOpen(false);
  };

  if (screen === "start") {
    const completedCount = quests.filter(q => q.completed).length;
    return (
      <>
        <StartScreen
          onStart={enterStory}
          hasProgress={completedCount > 0}
          completedCount={completedCount}
          totalQuests={QUESTS.length}
          currentQuestTitle={quests[currentQuest]?.title}
          onResume={enterStory}
          onFreePractice={enterFreePractice}
          onTeacher={enterTeacher}
          onFreshStart={() => setConfirmRestart(true)}
        />
        {confirmRestart && (
          <RestartConfirmDialog onCancel={() => setConfirmRestart(false)} onConfirm={doRestart} />
        )}
      </>
    );
  }

  if (screen === "category-picker") {
    return (
      <CategoryPicker
        quests={quests}
        onPick={handlePickCategory}
        onBack={() => setScreen("start")}
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
    <div className="h-[100dvh] flex flex-col overflow-hidden">
      <TopLearnBar
        index={clampedActiveIndex}
        total={QUESTS.length}
        title={quests[clampedActiveIndex]?.title ?? ""}
        stars={totalStars}
        onOpenList={() => setSheetOpen(true)}
        onHelp={() => setSheetOpen(true)}
        onChangeMode={changeMode}
        modeShort={modeMeta.short}
      />
      <CurrentQuestCard
        instruction={quests[clampedActiveIndex]?.instruction ?? ""}
        hint={quests[clampedActiveIndex]?.hint}
        alreadyCompleted={currentAlreadyCompleted}
        modeBadge={
          learningMode === "story"
            ? undefined
            : { label: `${modeMeta.emoji} ${modeMeta.short}`, hint: modeMeta.hint }
        }
      />
      <div className="flex-1 min-h-0 relative overflow-hidden">
        <WinDesktop
          key={desktopKey}
          currentQuestType={quests[clampedActiveIndex].type}
          onQuestComplete={handleQuestComplete}
          instruction={quests[clampedActiveIndex].instruction}
        />
        <TermDictionary termKey={quests[clampedActiveIndex].termKey} />
        <CharacterPraise
          visible={showPraise}
          onNext={advanceNow}
          onPractice={stayForPractice}
          isLast={clampedActiveIndex === QUESTS.length - 1}
          practiceMode={praiceIsReplay}
          mode={learningMode}
          hasCategoryNext={hasCategoryNext}
          onBackToList={backToList}
        />
      </div>

      <QuestSheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <QuestPanel
          quests={quests}
          currentQuest={clampedActiveIndex}
          score={score}
          totalScore={totalScore}
          onSelectQuest={handleSelectFromSheet}
          onRestart={() => { setSheetOpen(false); handleRestart(); }}
          onRetryQuest={handleRetryFromSheet}
          showComplete={quests.every(q => q.completed)}
          unlockedCategories={unlockedCategories}
          showHeader={false}
          strictOrder={strictQuestOrder(learningMode)}
          visibleCategoryIds={visibleCategoryIds}
        />
      </QuestSheet>

      {confirmRestart && (
        <RestartConfirmDialog onCancel={() => setConfirmRestart(false)} onConfirm={doRestart} />
      )}
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
