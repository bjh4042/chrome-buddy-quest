import { useState, useCallback, useMemo } from "react";
import StartScreen from "@/components/StartScreen";
import QuestPanel from "@/components/QuestPanel";
import WinDesktop from "@/components/WinDesktop";
import CompletionScreen from "@/components/CompletionScreen";
import CharacterPraise from "@/components/CharacterPraise";
import TermDictionary from "@/components/TermDictionary";
import { QUESTS, QUEST_CATEGORIES, type Quest } from "@/types/quest";

type Screen = "start" | "tutorial" | "complete";

const Index = () => {
  const [screen, setScreen] = useState<Screen>("start");
  const [quests, setQuests] = useState<Quest[]>(
    QUESTS.map(q => ({ ...q, completed: false, starsEarned: 0 }))
  );
  const [currentQuest, setCurrentQuest] = useState(0);
  const [score, setScore] = useState(0);
  const [showPraise, setShowPraise] = useState(false);
  // Persistent key — don't remount WinDesktop on quest change
  const [desktopKey] = useState(() => Math.random());

  const totalScore = QUESTS.reduce((sum, q) => sum + q.points, 0);

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

  const handleQuestComplete = useCallback(() => {
    setQuests(prev => {
      const updated = [...prev];
      updated[currentQuest] = {
        ...updated[currentQuest],
        completed: true,
        starsEarned: 3,
      };
      return updated;
    });
    setScore(prev => prev + quests[currentQuest].points);
    setShowPraise(true);

    setTimeout(() => {
      setShowPraise(false);
      if (currentQuest < QUESTS.length - 1) {
        setCurrentQuest(prev => prev + 1);
      } else {
        setScreen("complete");
      }
    }, 2000);
  }, [currentQuest, quests]);

  const handleRestart = () => {
    setQuests(QUESTS.map(q => ({ ...q, completed: false, starsEarned: 0 })));
    setCurrentQuest(0);
    setScore(0);
    setScreen("start");
  };

  const handleSelectQuest = (index: number) => {
    setCurrentQuest(index);
  };

  const handleRetryQuest = (index: number) => {
    setQuests(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], completed: false, starsEarned: 0 };
      return updated;
    });
    setScore(prev => prev - QUESTS[index].points);
    setCurrentQuest(index);
  };

  if (screen === "start") return <StartScreen onStart={handleStart} />;

  if (screen === "complete") {
    const totalStars = quests.reduce((sum, q) => sum + q.starsEarned, 0);
    return (
      <CompletionScreen
        score={score}
        totalScore={totalScore}
        totalStars={totalStars}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden">
      <div className="md:h-full h-auto max-h-[30vh] md:max-h-full overflow-auto">
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
        <TermDictionary termKey={quests[currentQuest].termKey} />
        <CharacterPraise visible={showPraise} />
      </div>
    </div>
  );
};

export default Index;
