import { useState } from "react";
import WindowFrame from "./WindowFrame";
import type { QuestType } from "@/types/quest";

interface PowerPointWindowProps {
  onClose: () => void;
  currentQuestType: QuestType;
  onQuestComplete: () => void;
}

const PptIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <div className={`${className} bg-orange-500 rounded-sm flex items-center justify-center text-white font-bold`}
    style={{ fontSize: "65%" }}>
    P
  </div>
);

const PowerPointWindow = ({ onClose, currentQuestType, onQuestComplete }: PowerPointWindowProps) => {
  const [title, setTitle] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const isTextQuest = currentQuestType === "ppt-text";

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (isTextQuest && e.target.value.includes("나의 발표")) {
      onQuestComplete();
    }
  };

  const toolbar = (
    <div className="flex items-center gap-2 px-3 py-1.5 text-xs">
      <span className="px-2 py-1 bg-orange-50 text-orange-600 rounded font-medium">홈</span>
      <span className="px-2 py-1 hover:bg-gray-100 rounded text-gray-600">삽입</span>
      <span className="px-2 py-1 hover:bg-gray-100 rounded text-gray-600">디자인</span>
      <span className="px-2 py-1 hover:bg-gray-100 rounded text-gray-600">전환</span>
      <span className="px-2 py-1 hover:bg-gray-100 rounded text-gray-600">애니메이션</span>
      <span className="px-2 py-1 hover:bg-gray-100 rounded text-gray-600">슬라이드 쇼</span>
    </div>
  );

  return (
    <WindowFrame
      title="프레젠테이션1 - PowerPoint"
      icon={<PptIcon className="w-4 h-4" />}
      onClose={onClose}
      toolbar={toolbar}
    >
      <div className="flex h-full min-h-[400px]">
        {/* Slide panel */}
        <div className="w-24 md:w-32 bg-gray-100 border-r border-gray-200 p-2">
          <div className="bg-white border-2 border-blue-500 rounded aspect-[16/9] flex items-center justify-center">
            <span className="text-[8px] text-gray-400 text-center px-1 truncate">
              {title || "제목을 입력하세요"}
            </span>
          </div>
        </div>

        {/* Slide area */}
        <div className="flex-1 bg-gray-200 flex items-center justify-center p-4">
          <div className="bg-white shadow-lg rounded-sm w-full max-w-xl aspect-[16/9] flex flex-col items-center justify-center p-8 relative">
            {isEditing ? (
              <div className={`border-2 rounded px-4 py-2 w-4/5 ${
                isTextQuest ? "border-orange-400 animate-pulse-highlight" : "border-blue-400"
              }`}>
                <input
                  value={title}
                  onChange={handleTitleChange}
                  placeholder={isTextQuest ? "'나의 발표'를 입력하세요!" : "제목 입력"}
                  className="w-full text-center text-lg md:text-2xl outline-none text-gray-800 font-bold"
                  autoFocus
                />
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className={`border-2 border-dashed rounded px-8 py-4 w-4/5 transition-colors ${
                  isTextQuest
                    ? "border-orange-400 bg-orange-50 animate-pulse-highlight hover:bg-orange-100"
                    : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                }`}
              >
                <span className={`text-lg md:text-2xl ${
                  title ? "text-gray-800 font-bold" : "text-gray-400"
                }`}>
                  {title || "제목을 추가하려면 클릭하세요"}
                </span>
              </button>
            )}

            <div className="mt-6 border-2 border-dashed border-gray-200 rounded px-6 py-3 w-3/5">
              <span className="text-sm text-gray-400">부제목을 입력하세요</span>
            </div>
          </div>
        </div>
      </div>
    </WindowFrame>
  );
};

export { PptIcon };
export default PowerPointWindow;
