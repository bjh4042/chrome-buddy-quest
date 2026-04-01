import { useState, useCallback } from "react";
import StartScreen from "@/components/StartScreen";
import QuestPanel from "@/components/QuestPanel";
import WinDesktop from "@/components/WinDesktop";
import CompletionScreen from "@/components/CompletionScreen";
import { QUESTS, type Quest } from "@/types/quest";

type Screen = "start" | "tutorial" | "complete";

const Index = () => {
  const [screen, setScreen] = useState<Screen>("start");
  const [quests, setQuests] = useState<Quest[]>(
    QUESTS.map(q => ({ ...q, completed: false, starsEarned: 0 }))
  );
  const [currentQuest, setCurrentQuest] = useState(0);
  const [score, setScore] = useState(0);

  const totalScore = QUESTS.reduce((sum, q) => sum + q.points, 0);

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

    setTimeout(() => {
      if (currentQuest < QUESTS.length - 1) {
        setCurrentQuest(prev => prev + 1);
      } else {
        setScreen("complete");
      }
    }, 1500);
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
          showComplete={quests.every(q => q.completed)}
        />
      </div>
      <div className="flex-1 h-full overflow-hidden">
        <WinDesktop
          key={currentQuest}
          currentQuestType={quests[currentQuest].type}
          onQuestComplete={handleQuestComplete}
          instruction={quests[currentQuest].instruction}
        />
      </div>
    </div>
  );
};

export default Index;
