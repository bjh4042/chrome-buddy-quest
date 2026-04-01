import { useState } from "react";
import { ChevronDown, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Undo, Redo } from "lucide-react";
import WindowFrame from "./WindowFrame";
import type { QuestType } from "@/types/quest";

interface ExcelWindowProps {
  onClose: () => void;
  currentQuestType: QuestType;
  onQuestComplete: () => void;
}

const ExcelIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <div className={`${className} bg-green-600 rounded-sm flex items-center justify-center text-white font-bold`}
    style={{ fontSize: "65%" }}>
    X
  </div>
);

const allCols = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W"];
const rows = Array.from({ length: 40 }, (_, i) => i + 1);

const ExcelWindow = ({ onClose, currentQuestType, onQuestComplete }: ExcelWindowProps) => {
  const [cells, setCells] = useState<Record<string, string>>({});
  const [activeCell, setActiveCell] = useState<string>("A1");
  const [editValue, setEditValue] = useState("");

  const isInputQuest = currentQuestType === "excel-input";

  const handleCellClick = (cellId: string) => {
    // Save current cell value
    if (activeCell && editValue) {
      setCells(prev => ({ ...prev, [activeCell]: editValue }));
    }
    setActiveCell(cellId);
    setEditValue(cells[cellId] || "");
  };

  const handleCellKeyDown = (e: React.KeyboardEvent, cellId: string) => {
    if (e.key === "Enter") {
      setCells(prev => ({ ...prev, [cellId]: editValue }));
      if (isInputQuest && cellId === "A1" && editValue === "100") {
        onQuestComplete();
      }
      const col = cellId.match(/[A-Z]+/)?.[0] || "A";
      const row = parseInt(cellId.replace(/[A-Z]+/, "")) + 1;
      if (row <= 40) {
        const newCell = `${col}${row}`;
        setActiveCell(newCell);
        setEditValue(cells[newCell] || "");
      }
    }
  };

  const toolbar = (
    <div className="flex flex-col">
      {/* Tab bar */}
      <div className="flex items-center gap-0 px-1 py-0.5 bg-green-50 border-b border-gray-200 text-[11px]">
        <span className="px-3 py-1 text-gray-600 hover:bg-gray-200 cursor-pointer">파일</span>
        <span className="px-3 py-1 text-green-700 font-medium border-b-2 border-green-600 bg-white">홈</span>
        <span className="px-3 py-1 text-gray-600 hover:bg-gray-200 cursor-pointer">삽입</span>
        <span className="px-3 py-1 text-gray-600 hover:bg-gray-200 cursor-pointer">그리기</span>
        <span className="px-3 py-1 text-gray-600 hover:bg-gray-200 cursor-pointer">페이지 레이아웃</span>
        <span className="px-3 py-1 text-gray-600 hover:bg-gray-200 cursor-pointer">수식</span>
        <span className="px-3 py-1 text-gray-600 hover:bg-gray-200 cursor-pointer">데이터</span>
        <span className="px-3 py-1 text-gray-600 hover:bg-gray-200 cursor-pointer">검토</span>
        <span className="px-3 py-1 text-gray-600 hover:bg-gray-200 cursor-pointer">보기</span>
      </div>
      {/* Ribbon toolbar */}
      <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 border-b border-gray-200 flex-wrap">
        <button className="p-1 rounded hover:bg-gray-200"><Undo className="w-3.5 h-3.5 text-gray-500" /></button>
        <button className="p-1 rounded hover:bg-gray-200"><Redo className="w-3.5 h-3.5 text-gray-500" /></button>
        <span className="w-px h-4 bg-gray-300 mx-0.5" />
        {/* Font family */}
        <div className="flex items-center gap-0.5 px-2 py-0.5 bg-white border border-gray-300 rounded text-[11px] min-w-[80px]">
          <span>맑은 고딕</span>
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </div>
        {/* Font size */}
        <div className="flex items-center gap-0.5 px-2 py-0.5 bg-white border border-gray-300 rounded text-[11px] min-w-[35px]">
          <span>11</span>
        </div>
        <span className="w-px h-4 bg-gray-300 mx-0.5" />
        <button className="p-1 rounded hover:bg-gray-200"><Bold className="w-3.5 h-3.5 text-gray-600" /></button>
        <button className="p-1 rounded hover:bg-gray-200"><Italic className="w-3.5 h-3.5 text-gray-600" /></button>
        <button className="p-1 rounded hover:bg-gray-200"><Underline className="w-3.5 h-3.5 text-gray-600" /></button>
        <span className="w-px h-4 bg-gray-300 mx-0.5" />
        <button className="p-1 rounded hover:bg-gray-200"><AlignLeft className="w-3.5 h-3.5 text-gray-600" /></button>
        <button className="p-1 rounded hover:bg-gray-200"><AlignCenter className="w-3.5 h-3.5 text-gray-600" /></button>
        <button className="p-1 rounded hover:bg-gray-200"><AlignRight className="w-3.5 h-3.5 text-gray-600" /></button>
      </div>
      {/* Formula bar */}
      <div className="flex items-center gap-1 px-2 py-0.5 bg-white border-b border-gray-200">
        <div className="bg-white border border-gray-300 rounded px-2 py-0.5 w-14 text-center text-[11px] text-gray-600 font-medium">
          {activeCell}
        </div>
        <span className="text-gray-400 text-xs">:</span>
        <span className="text-gray-400 text-xs">✓</span>
        <span className="text-gray-500 text-xs font-medium">fx</span>
        <div className="flex-1 bg-white border border-gray-300 rounded px-2 py-0.5 text-[11px] text-gray-700 min-h-[20px]">
          {editValue || cells[activeCell] || ""}
        </div>
      </div>
    </div>
  );

  return (
    <WindowFrame
      title="통합 문서1 - Excel"
      icon={<ExcelIcon className="w-4 h-4" />}
      onClose={onClose}
      toolbar={toolbar}
    >
      <div className="flex-1 overflow-auto">
        <table className="border-collapse w-full text-[11px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gray-100">
              <th className="border border-gray-300 w-8 p-0.5 text-gray-500 sticky left-0 bg-gray-100 z-20"></th>
              {allCols.map(c => (
                <th key={c} className={`border border-gray-300 min-w-[72px] p-0.5 font-medium ${
                  activeCell.startsWith(c) ? "bg-green-100 text-green-700" : "text-gray-600"
                }`}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r}>
                <td className={`border border-gray-300 bg-gray-100 text-center p-0.5 w-8 sticky left-0 z-10 font-medium ${
                  activeCell.endsWith(String(r)) ? "bg-green-100 text-green-700" : "text-gray-500"
                }`}>{r}</td>
                {allCols.map(c => {
                  const cellId = `${c}${r}`;
                  const isActive = activeCell === cellId;
                  const isTarget = isInputQuest && cellId === "A1";
                  return (
                    <td
                      key={cellId}
                      onClick={() => handleCellClick(cellId)}
                      className={`border p-0 cursor-cell ${
                        isActive
                          ? "border-2 border-green-600 bg-white"
                          : isTarget
                          ? "border-2 border-yellow-400 bg-yellow-50 animate-pulse-highlight"
                          : "border-gray-200"
                      }`}
                    >
                      {isActive ? (
                        <input
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onKeyDown={e => handleCellKeyDown(e, cellId)}
                          className="w-full h-full p-0.5 outline-none text-[11px]"
                          autoFocus
                        />
                      ) : (
                        <div className="p-0.5 min-h-[20px] text-gray-800">{cells[cellId] || ""}</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Sheet tabs */}
      <div className="flex items-center gap-0 bg-gray-100 border-t border-gray-200 px-2 py-0.5">
        <button className="text-gray-400 text-xs px-1 hover:text-gray-600">◀</button>
        <button className="text-gray-400 text-xs px-1 hover:text-gray-600">▶</button>
        <div className="ml-2 flex items-center">
          <div className="px-3 py-1 bg-white border border-gray-300 border-b-0 rounded-t text-[11px] text-gray-700 font-medium">
            Sheet1
          </div>
          <button className="px-2 py-1 text-gray-400 text-xs hover:text-gray-600">+</button>
        </div>
      </div>
      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-0.5 bg-green-700 text-[9px] text-white/80">
        <span>준비</span>
        <span>접근성: 계속 진행 가능</span>
      </div>
    </WindowFrame>
  );
};

export { ExcelIcon };
export default ExcelWindow;
