import { useState } from "react";
import { Search, ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import WindowFrame from "./WindowFrame";
import type { QuestType } from "@/types/quest";

interface EdgeWindowProps {
  onClose: () => void;
  onMinimize?: () => void;
  currentQuestType: QuestType;
  onQuestComplete: () => void;
  highlightClose?: boolean;
}

const EdgeIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none">
    <path d="M12 2C6.48 2 2 6.48 2 12c0 2.69 1.07 5.13 2.81 6.93.17-.49.52-1.25 1.17-2.05C7.42 15.13 9.54 14 12 14c1.62 0 3.11.46 4.38 1.25.29-.87.46-1.79.46-2.75 0-4.14-2.72-7.64-6.47-8.82" fill="#0078D4"/>
    <path d="M12 14c-2.46 0-4.58 1.13-6.02 2.88-.65.8-1 1.56-1.17 2.05C6.87 20.93 9.31 22 12 22c5.52 0 10-4.48 10-10 0-1.07-.17-2.1-.49-3.07C20.28 11.71 18 14 15 14h-3z" fill="#50E6FF"/>
    <path d="M21.51 8.93C20.28 5.07 16.47 2.25 12 2c.36.06.72.14 1.07.24C16.81 3.42 19.53 6.05 20.49 9.5c.11.39.21.79.28 1.2.16-.57.23-1.16.23-1.77 0-.34-.02-.68-.05-1h.56z" fill="#00B294"/>
  </svg>
);

const NaverPage = () => (
  <div className="w-full h-full bg-white overflow-auto">
    {/* Top bar */}
    <div className="bg-white border-b border-gray-200 px-3 py-2 flex items-center justify-between">
      <div className="flex items-center gap-3 text-[10px] text-gray-500">
        <span>☰</span>
        <span className="font-bold text-green-600 text-xs">Pay</span>
      </div>
      <div className="flex items-center gap-2 text-[10px] text-gray-500">
        <span>🔔</span>
        <span>🛒</span>
      </div>
    </div>

    {/* Logo + Search */}
    <div className="flex flex-col items-center pt-3 pb-2 px-4">
      <div className="text-2xl md:text-3xl font-black text-green-500 tracking-tight mb-3">NAVER</div>
      <div className="w-full max-w-md bg-white rounded-full border-2 border-green-500 flex items-center px-3 py-2 mb-2">
        <input
          type="text"
          placeholder="검색어를 입력해 주세요."
          className="flex-1 bg-transparent text-xs outline-none text-gray-600 placeholder:text-gray-400"
          readOnly
        />
        <Search className="w-4 h-4 text-green-500" />
      </div>

      {/* Category icons */}
      <div className="flex items-center gap-3 md:gap-4 mt-1 flex-wrap justify-center">
        {[
          { emoji: "✉️", label: "메일", color: "#4CAF50" },
          { emoji: "☕", label: "카페", color: "#8BC34A" },
          { emoji: "📝", label: "블로그", color: "#2196F3" },
          { emoji: "🛍️", label: "스토어", color: "#FF9800" },
          { emoji: "📰", label: "뉴스", color: "#607D8B" },
          { emoji: "📈", label: "증권", color: "#F44336" },
          { emoji: "🏠", label: "부동산", color: "#009688" },
          { emoji: "🗺️", label: "지도", color: "#3F51B5" },
          { emoji: "📺", label: "웹툰", color: "#E91E63" },
        ].map(item => (
          <div key={item.label} className="flex flex-col items-center gap-0.5 cursor-pointer">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ backgroundColor: item.color + "20" }}>
              {item.emoji}
            </div>
            <span className="text-[9px] text-gray-600">{item.label}</span>
          </div>
        ))}
      </div>
    </div>

    <div className="flex gap-3 px-3 pb-3 max-w-2xl mx-auto">
      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* News tabs */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-2">
          <div className="flex items-center gap-0 text-[10px] border-b border-gray-200">
            <span className="px-2 py-1.5 font-bold text-gray-800 border-b-2 border-green-500">뉴스스탠드</span>
            <span className="px-2 py-1.5 text-gray-500">언론사편집</span>
            <span className="px-2 py-1.5 text-gray-500">엔터</span>
            <span className="px-2 py-1.5 text-gray-500">스포츠</span>
            <span className="px-2 py-1.5 text-gray-500">경제</span>
          </div>
          {/* News grid */}
          <div className="grid grid-cols-3 gap-px bg-gray-200 p-px">
            {["뉴시스", "일간스포츠", "디지털타임스", "한국일보", "세계일보", "SBS NEWS"].map((name, i) => (
              <div key={i} className="bg-white p-2 text-[9px] text-gray-600 text-center hover:bg-gray-50 cursor-pointer">
                {name}
              </div>
            ))}
          </div>
        </div>

        {/* Trending */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-2">
          <div className="flex items-center gap-2 text-[10px] border-b border-gray-200 px-2 py-1.5">
            <span className="font-bold text-gray-800">추천</span>
            <span className="text-gray-500">카테크</span>
            <span className="text-gray-500">웹툰</span>
            <span className="text-gray-500">패션뷰티</span>
          </div>
          <div className="grid grid-cols-2 gap-2 p-2">
            {[
              { title: "차분한 외관에 힘 승차감...", source: "조선비즈", color: "#e8f5e9" },
              { title: "단종되고 잊혀질 뻔했는데...", source: "오지다 OGDA", color: "#e3f2fd" },
              { title: "대중차에 이런 하체 처음본다!", source: "신차정보", color: "#fff3e0" },
              { title: "그랜저 살 이유 없어졌다...", source: "차가치", color: "#fce4ec" },
            ].map((item, i) => (
              <div key={i} className="flex gap-1.5 cursor-pointer hover:bg-gray-50 rounded p-1">
                <div className="w-14 h-10 rounded flex-shrink-0 flex items-center justify-center text-lg" style={{ backgroundColor: item.color }}>
                  🚗
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] text-gray-800 line-clamp-2 leading-tight">{item.title}</p>
                  <p className="text-[8px] text-gray-400 mt-0.5">{item.source}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right sidebar */}
      <div className="w-36 md:w-44 flex-shrink-0 hidden md:block">
        {/* Login */}
        <div className="bg-white border border-gray-200 rounded-lg p-3 mb-2">
          <p className="text-[10px] text-gray-600 text-center mb-2">네이버를 더 안전하고 편리하게 이용하세요</p>
          <button className="w-full bg-green-500 text-white rounded-md py-1.5 text-[11px] font-bold hover:bg-green-600">
            NAVER 로그인
          </button>
          <div className="flex justify-center gap-2 mt-2 text-[9px] text-gray-500">
            <span>아이디 찾기</span>
            <span>|</span>
            <span>비밀번호 찾기</span>
          </div>
        </div>

        {/* Weather */}
        <div className="bg-white border border-gray-200 rounded-lg p-3 mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-gray-700">날씨</span>
            <span className="text-[9px] text-gray-400">전국</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">☀️</span>
            <div>
              <span className="text-lg font-bold text-gray-800">13.9°</span>
              <p className="text-[9px] text-gray-500">맑음</p>
            </div>
          </div>
          <div className="flex gap-1 mt-1 text-[8px] text-gray-500">
            <span className="text-blue-500">13°</span>
            <span className="text-red-500">20°</span>
            <span className="mx-1">미세 좋음</span>
          </div>
        </div>

        {/* Stock */}
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-gray-700">증시</span>
          </div>
          <div className="text-[9px] text-gray-700">
            <div className="flex justify-between">
              <span>삼성전자</span>
              <span className="text-red-500">▲4.37%</span>
            </div>
            <div className="flex justify-between mt-0.5">
              <span>SK하이닉스</span>
              <span className="text-red-500">▲5.54%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <p className="text-center text-xs text-green-600 font-bold pb-4">🎉 네이버에 접속했어요!</p>
  </div>
);

const EdgeWindow = ({ onClose, onMinimize, currentQuestType, onQuestComplete, highlightClose }: EdgeWindowProps) => {
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
      onMinimize={onMinimize}
      highlightClose={highlightClose}
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
          <NaverPage />
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
