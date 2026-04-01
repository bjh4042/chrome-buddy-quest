import { useState } from "react";
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

const cols = ["A", "B", "C", "D", "E", "F"];
const rows = Array.from({ length: 15 }, (_, i) => i + 1);

const ExcelWindow = ({ onClose, currentQuestType, onQuestComplete }: ExcelWindowProps) => {
  const [cells, setCells] = useState<Record<string, string>>({});
  const [activeCell, setActiveCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const isInputQuest = currentQuestType === "excel-input";

  const handleCellClick = (cellId: string) => {
    setActiveCell(cellId);
    setEditValue(cells[cellId] || "");
  };

  const handleCellKeyDown = (e: React.KeyboardEvent, cellId: string) => {
    if (e.key === "Enter") {
      setCells(prev => ({ ...prev, [cellId]: editValue }));
      if (isInputQuest && cellId === "A1" && editValue === "100") {
        onQuestComplete();
      }
      // Move down
      const col = cellId[0];
      const row = parseInt(cellId.slice(1)) + 1;
      if (row <= 15) {
        setActiveCell(`${col}${row}`);
        setEditValue(cells[`${col}${row}`] || "");
      }
    }
  };

  const toolbar = (
    <div className="flex items-center gap-2 px-3 py-1 text-xs">
      <div className="bg-white border border-gray-300 rounded px-2 py-0.5 w-12 text-center text-gray-600">
        {activeCell || ""}
      </div>
      <span className="text-gray-400">fx</span>
      <div className="flex-1 bg-white border border-gray-300 rounded px-2 py-0.5 text-gray-700">
        {activeCell ? (editValue || cells[activeCell || ""] || "") : ""}
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
      <div className="overflow-auto">
        <table className="border-collapse w-full text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 w-8 p-1 text-gray-500"></th>
              {cols.map(c => (
                <th key={c} className="border border-gray-300 min-w-[80px] p-1 text-gray-600 font-normal">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r}>
                <td className="border border-gray-300 bg-gray-100 text-center text-gray-500 p-1 w-8">{r}</td>
                {cols.map(c => {
                  const cellId = `${c}${r}`;
                  const isActive = activeCell === cellId;
                  const isTarget = isInputQuest && cellId === "A1";
                  return (
                    <td
                      key={cellId}
                      onClick={() => handleCellClick(cellId)}
                      className={`border p-0 cursor-cell ${
                        isActive
                          ? "border-2 border-blue-500"
                          : isTarget
                          ? "border-2 border-yellow-400 bg-yellow-50 animate-pulse-highlight"
                          : "border-gray-300"
                      }`}
                    >
                      {isActive ? (
                        <input
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onKeyDown={e => handleCellKeyDown(e, cellId)}
                          className="w-full h-full p-1 outline-none text-xs"
                          autoFocus
                        />
                      ) : (
                        <div className="p-1 min-h-[22px] text-gray-800">{cells[cellId] || ""}</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </WindowFrame>
  );
};

export { ExcelIcon };
export default ExcelWindow;
