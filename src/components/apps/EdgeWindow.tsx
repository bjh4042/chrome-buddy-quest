import { useState } from "react";
import { Search, ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import WindowFrame from "./WindowFrame";
import type { QuestType } from "@/types/quest";

interface EdgeWindowProps {
  onClose: () => void;
  currentQuestType: QuestType;
  onQuestComplete: () => void;
}

const EdgeIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none">
    <path d="M12 2C6.48 2 2 6.48 2 12c0 2.69 1.07 5.13 2.81 6.93.17-.49.52-1.25 1.17-2.05C7.42 15.13 9.54 14 12 14c1.62 0 3.11.46 4.38 1.25.29-.87.46-1.79.46-2.75 0-4.14-2.72-7.64-6.47-8.82" fill="#0078D4"/>
    <path d="M12 14c-2.46 0-4.58 1.13-6.02 2.88-.65.8-1 1.56-1.17 2.05C6.87 20.93 9.31 22 12 22c5.52 0 10-4.48 10-10 0-1.07-.17-2.1-.49-3.07C20.28 11.71 18 14 15 14h-3z" fill="#50E6FF"/>
    <path d="M21.51 8.93C20.28 5.07 16.47 2.25 12 2c.36.06.72.14 1.07.24C16.81 3.42 19.53 6.05 20.49 9.5c.11.39.21.79.28 1.2.16-.57.23-1.16.23-1.77 0-.34-.02-.68-.05-1h.56z" fill="#00B294"/>
  </svg>
);

const EdgeWindow = ({ onClose, currentQuestType, onQuestComplete }: EdgeWindowProps) => {
  const [url, setUrl] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const isUrlQuest = currentQuestType === "type-url";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.toLowerCase().includes("naver")) {
      setSubmitted(true);
      if (isUrlQuest) {
        onQuestComplete();
      }
    }
  };

  return (
    <WindowFrame
      title={submitted ? "NAVER - Microsoft Edge" : "새 탭 - Microsoft Edge"}
      icon={<EdgeIcon className="w-4 h-4" />}
      onClose={onClose}
    >
      {/* Tab bar */}
      <div className="flex items-center bg-gray-100 px-2 pt-0.5">
        <div className="flex items-center bg-white rounded-t-lg px-3 py-1.5 text-xs border border-b-0 border-gray-200 gap-2 max-w-[200px]">
          <EdgeIcon className="w-3 h-3 flex-shrink-0" />
          <span className="truncate text-gray-700">{submitted ? "NAVER" : "새 탭"}</span>
          <button className="ml-1 hover:bg-gray-200 rounded-sm p-0.5">×</button>
        </div>
        <button className="ml-1 p-1 hover:bg-gray-200 rounded text-gray-400 text-xs">+</button>
      </div>

      {/* Navigation bar */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-200 bg-white">
        <button className="p-1 hover:bg-gray-100 rounded"><ChevronLeft className="w-3 h-3 text-gray-400" /></button>
        <button className="p-1 hover:bg-gray-100 rounded"><ChevronRight className="w-3 h-3 text-gray-400" /></button>
        <button className="p-1 hover:bg-gray-100 rounded"><RotateCw className="w-3 h-3 text-gray-400" /></button>

        <form onSubmit={handleSubmit} className="flex-1 ml-2">
          <div className={`flex items-center bg-gray-100 rounded-full px-3 py-1.5 border ${
            isUrlQuest ? "border-blue-400 ring-2 ring-blue-200 animate-pulse-highlight" : "border-transparent"
          }`}>
            <Search className="w-3 h-3 text-gray-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder={isUrlQuest ? "naver.com 을 입력하세요!" : "검색 또는 URL 입력"}
              className="w-full bg-transparent text-xs outline-none text-gray-800 placeholder:text-gray-400"
              autoFocus={isUrlQuest}
            />
          </div>
        </form>
      </div>

      {/* Content */}
      <div className="flex-1 bg-white">
        {submitted ? (
          <div className="p-6">
            {/* Fake Naver page */}
            <div className="max-w-md mx-auto text-center pt-8">
              <div className="text-3xl font-bold text-green-500 mb-6">NAVER</div>
              <div className="bg-gray-100 rounded-full px-4 py-2.5 flex items-center border border-green-400 mb-4">
                <input
                  type="text"
                  placeholder="검색어를 입력해 주세요."
                  className="flex-1 bg-transparent text-sm outline-none text-gray-600"
                  readOnly
                />
                <Search className="w-4 h-4 text-green-500" />
              </div>
              <div className="flex justify-center gap-4 text-xs text-gray-500">
                <span>뉴스</span><span>쇼핑</span><span>지도</span><span>웹툰</span>
              </div>
              <p className="mt-8 text-sm text-green-600 font-display">🎉 네이버에 접속했어요!</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center text-gray-400">
            <EdgeIcon className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-sm font-body">
              {isUrlQuest
                ? "위 주소창에 naver.com을 입력하고 Enter를 눌러보세요!"
                : "Microsoft Edge에 오신 것을 환영합니다"}
            </p>
          </div>
        )}
      </div>
    </WindowFrame>
  );
};

export { EdgeIcon };
export default EdgeWindow;
