import ViewportDialog from "@/components/apps/ViewportDialog";
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
  canAccessQuest,
} from "@/features/learning/access";

import { loadProgress, STORAGE_KEY, type SavedProgress, type Screen } from '@/features/progress/progress';

const Index = () => {
  const [saved] = useState(loadProgress);
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
  const [storageFailed, setStorageFailed] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  // Persistent key — don't remount WinDesktop on quest change
  const [desktopKey] = useState(() => Math.random());

  // Completion stays visible until the learner chooses the next step.
  const completingRef = useRef(false);

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
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); setStorageFailed(false); } catch { setStorageFailed(true); }
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
    if (learningMode === "story") {
      // Replaying a past quest never moves the real story progress marker.
      if (replayQuestIndex !== null && replayQuestIndex >= 0 && replayQuestIndex < quests.length) {
        return replayQuestIndex;
      }
      return currentQuest;
    }
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
  }, [learningMode, currentQuest, replayQuestIndex, practiceQuestId, teacherCategory, quests]);

  const clampedActiveIndex = Math.max(0, Math.min(QUESTS.length - 1, activeQuestIndex));

  // Mode transitions
  const enterStory = () => {
    setLearningMode("story");
    setReplayQuestIndex(null);
    const firstUnfinished = quests.findIndex(q => !q.completed);
    if (firstUnfinished < 0) { setScreen("complete"); return; }
    setCurrentQuest(firstUnfinished);
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
    completingRef.current = false;
    setShowPraise(false);
    setReplayQuestIndex(null);
    setScreen("start");
  };

  const handleQuestComplete = useCallback(() => {
    // Guard: prevent duplicate completion for the same quest
    if (completingRef.current) return;
    const idx = clampedActiveIndex;
    if (idx < 0 || idx >= QUESTS.length) return;
    const already = quests[idx]?.completed;

    completingRef.current = true;

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
  }, [clampedActiveIndex, quests]);

  const closePraise = () => {
    setShowPraise(false);
    completingRef.current = false;
  };

  const advanceNow = () => {
    const idx = clampedActiveIndex;
    closePraise();
    if (learningMode === "story") {
      if (replayQuestIndex !== null) { setReplayQuestIndex(null); return; }
      const firstUnfinished = quests.findIndex(q => !q.completed);
      if (firstUnfinished >= 0) setCurrentQuest(firstUnfinished);
      else setScreen("complete");
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
    completingRef.current = false;
    setShowPraise(false);
    setQuests(QUESTS.map(q => ({ ...q, completed: false, starsEarned: 0 })));
    setCurrentQuest(0);
    setLearningMode("story");
    setPracticeQuestId(null);
    setTeacherCategory(null);
    setReplayQuestIndex(null);
    setScreen("start");
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setConfirmRestart(false);
  };
  const handleRestart = () => setConfirmRestart(true);

  const handleSelectQuest = (index: number) => {
    if (index < 0 || index >= QUESTS.length) return;
    if (!canAccessQuest(quests[index], index, learningMode, quests, teacherCategory, currentQuest)) return;
    completingRef.current = false;
    setShowPraise(false);
    if (learningMode === "story") {
      // Selecting an already-completed quest is a temporary replay: keep story progress.
      if (quests[index]?.completed) setReplayQuestIndex(index);
      else { setReplayQuestIndex(null); setCurrentQuest(index); }
    } else {
      setPracticeQuestId(quests[index]?.id ?? null);
    }
  };

  const handleRetryQuest = (index: number) => {
    if (index < 0 || index >= QUESTS.length) return;
    if (!canAccessQuest(quests[index], index, learningMode, quests, teacherCategory, currentQuest)) return;
    completingRef.current = false;
    setShowPraise(false);
    // Replay policy: keep completed / starsEarned / score intact — just re-enter the quest.
    // In story mode the real progress marker (currentQuest) must never move backwards.
    if (learningMode === "story") {
      if (index === currentQuest) setReplayQuestIndex(null);
      else setReplayQuestIndex(index);
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
        {storageFailed && <StorageNotice />}
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
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50">
          <button onClick={enterFreePractice} className="rounded-xl bg-white px-5 py-3 text-primary border border-primary/20 shadow-md font-medium">완료한 임무 다시 연습하기</button>
        </div>
        {confirmRestart && (
          <RestartConfirmDialog onCancel={() => setConfirmRestart(false)} onConfirm={doRestart} />
        )}
      </>
    );
  }

  return (
    <QuestEngineProvider value={engine}>
    <div className="h-[100dvh] flex flex-col overflow-hidden">
      {storageFailed && <StorageNotice />}
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
      {currentAlreadyCompleted && !showPraise && (
        <div className="flex items-center justify-between gap-3 bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-sm">
          <span>✓ 이 임무를 완료했어요. 계속 연습하거나 다음 임무를 골라요.</span>
          <button className="shrink-0 rounded-lg bg-emerald-700 text-white px-3 py-2" onClick={advanceNow}>
            {learningMode === 'story' ? (replayQuestIndex !== null ? '원래 임무로' : '다음 임무') : '임무 선택'}
          </button>
        </div>
      )}
      <div className="flex-1 min-h-0 relative overflow-hidden">
        <WinDesktop
          key={desktopKey}
          freePractice={learningMode !== "story"}
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

const StorageNotice = () => (
  <div className="fixed top-2 left-1/2 -translate-x-1/2 z-[200] max-w-lg rounded-xl bg-amber-50 border border-amber-300 px-4 py-2 text-sm text-amber-950" role="alert">
    이 브라우저에서 학습 기록을 저장하지 못했어요. 지금은 계속 연습할 수 있지만 새로고침하면 기록이 사라질 수 있어요.
  </div>
);

const RestartConfirmDialog = ({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) => (
  <ViewportDialog title="처음부터 다시 시작할까요?" onClose={onCancel} style={{maxWidth:440}} footer={<>
    <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg bg-muted text-foreground text-sm">계속 탐험하기</button>
    <button type="button" onClick={onConfirm} className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm">학습 기록 지우고 처음부터</button>
  </>}><p className="text-sm text-muted-foreground">지금까지 완료한 임무와 모은 별이 모두 사라져요. 작성한 문서는 각 프로그램에 남아 있어요.</p></ViewportDialog>
);

export default Index;
