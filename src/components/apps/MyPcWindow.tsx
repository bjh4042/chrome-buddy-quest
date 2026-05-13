import { useState } from "react";
import { Monitor, ChevronRight, ChevronDown, HardDrive } from "lucide-react";
import WindowFrame from "./WindowFrame";

interface MyPcWindowProps {
  onClose: () => void;
  onMinimize?: () => void;
  highlightClose?: boolean;
}

const sidebarItems = [
  { icon: "🏠", label: "홈", type: "header" },
  { icon: "🖼️", label: "갤러리", type: "item" },
  { icon: "🖥️", label: "바탕 화면", pinned: true },
  { icon: "📥", label: "Downloads", pinned: true },
  { icon: "💬", label: "카카오톡 받은 파일", pinned: true },
  { icon: "📂", label: "문서", pinned: true },
  { icon: "📁", label: "내 드라이브", pinned: true },
  { icon: "📥", label: "다운로드", type: "item" },
  { icon: "📄", label: "문서", type: "item" },
  { icon: "🖼️", label: "사진", type: "item" },
  { icon: "🎵", label: "음악", type: "item" },
  { icon: "🎬", label: "동영상", type: "item" },
];

const drives = [
  { label: "로컬 디스크 (C:)", total: 475, used: 191, color: "#2563eb" },
  { label: "Waterchestnut (D:)", total: 1810, used: 650, color: "#2563eb" },
  { label: "Watermelon (E:)", total: 1810, used: 460, color: "#2563eb" },
];

const networkFolders = [
  { label: "백업(Watermelon)", icon: "📁" },
];

const MyPcWindow = ({ onClose, onMinimize, highlightClose }: MyPcWindowProps) => {
  const [expandedSections, setExpandedSections] = useState({ drives: true, network: true });

  const toggleSection = (s: "drives" | "network") => {
    setExpandedSections(prev => ({ ...prev, [s]: !prev[s] }));
  };

  return (
    <WindowFrame
      title="내 PC"
      icon={<Monitor className="w-4 h-4 text-blue-500" />}
      onClose={onClose}
      onMinimize={onMinimize}
      highlightClose={highlightClose}
      toolbar={
        <div className="flex items-center gap-1 px-3 py-1 text-xs text-gray-500">
          <button className="px-2 py-1 hover:bg-gray-100 rounded text-gray-400">📋 새로 만들기</button>
          <span className="text-gray-300">|</span>
          <button className="px-2 py-1 hover:bg-gray-100 rounded text-gray-400">✂️</button>
          <button className="px-2 py-1 hover:bg-gray-100 rounded text-gray-400">📋</button>
          <button className="px-2 py-1 hover:bg-gray-100 rounded text-gray-400">📎</button>
          <button className="px-2 py-1 hover:bg-gray-100 rounded text-gray-400">🗑️</button>
          <span className="text-gray-300">|</span>
          <button className="px-2 py-1 hover:bg-gray-100 rounded">↕️ 정렬</button>
          <button className="px-2 py-1 hover:bg-gray-100 rounded">👁️ 보기</button>
        </div>
      }
    >
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-44 border-r border-gray-200 bg-gray-50/50 overflow-y-auto text-xs py-1">
          {sidebarItems.map((item, i) => (
            <button
              key={i}
              className="w-full text-left px-3 py-1 hover:bg-blue-50 flex items-center gap-2 text-gray-700"
            >
              <span className="text-sm">{item.icon}</span>
              <span className="truncate">{item.label}</span>
              {item.pinned && <span className="ml-auto text-gray-300 text-[10px]">📌</span>}
            </button>
          ))}
          <div className="border-t border-gray-200 mt-1 pt-1">
            <button className="w-full text-left px-3 py-1 hover:bg-blue-50 flex items-center gap-2 text-gray-700 bg-blue-100">
              <Monitor className="w-3 h-3 text-blue-500" />
              <span className="font-medium">내 PC</span>
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Address bar */}
          <div className="flex items-center gap-2 mb-4 px-2 py-1.5 bg-gray-100 rounded-md text-xs text-gray-600">
            <span>←</span> <span>→</span> <span>↑</span>
            <div className="flex-1 flex items-center gap-1 bg-white px-2 py-1 rounded border border-gray-200">
              <Monitor className="w-3 h-3 text-blue-500" />
              <span>내 PC</span>
              <ChevronRight className="w-3 h-3" />
            </div>
            <div className="bg-white px-2 py-1 rounded border border-gray-200 text-gray-400">내 PC 검색 🔍</div>
          </div>

          {/* Devices and drives */}
          <button
            onClick={() => toggleSection("drives")}
            className="flex items-center gap-1 text-xs text-gray-600 mb-3 hover:text-gray-800"
          >
            {expandedSections.drives ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            <span className="font-medium">장치 및 드라이브</span>
          </button>

          {expandedSections.drives && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              {drives.map((drive, i) => {
                const pct = (drive.used / drive.total) * 100;
                const freeGB = drive.total - drive.used;
                return (
                  <div
                    key={i}
                    className="border border-gray-200 rounded-md p-3 hover:bg-blue-50 cursor-pointer transition-colors flex items-start gap-3"
                  >
                    <HardDrive className="w-8 h-8 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{drive.label}</p>
                      <div className="w-full h-2 bg-gray-200 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: pct > 80 ? "#ef4444" : drive.color }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">
                        {drive.total}GB 중 {freeGB}GB 사용 가능
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Network locations */}
          <button
            onClick={() => toggleSection("network")}
            className="flex items-center gap-1 text-xs text-gray-600 mb-3 hover:text-gray-800"
          >
            {expandedSections.network ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            <span className="font-medium">네트워크 위치</span>
          </button>

          {expandedSections.network && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {networkFolders.map((folder, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-1 p-3 rounded-md hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <span className="text-3xl">📁</span>
                  <span className="text-[10px] text-gray-700 text-center">{folder.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </WindowFrame>
  );
};

export default MyPcWindow;
