import { useState } from "react";
import { X } from "lucide-react";

interface TableDialogProps {
  onInsert: (rows: number, cols: number) => void;
  onClose: () => void;
  isQuest: boolean;
}

const TableDialog = ({ onInsert, onClose, isQuest }: TableDialogProps) => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(2);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20">
      <div className="bg-white rounded-lg border border-gray-300 shadow-2xl w-[380px]">
        {/* Title bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
          <span className="text-sm font-medium text-gray-800">표 만들기</span>
          <div className="flex items-center gap-1">
            <button className="text-gray-400 hover:text-gray-600 text-xs">🔖</button>
            <button className="text-gray-400 hover:text-gray-600 text-xs">?</button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex">
          {/* Left form */}
          <div className="flex-1 p-4">
            {/* Row/Col section */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3 border-b border-gray-200 pb-2">
                <span className="text-xs font-bold text-gray-700">줄/칸</span>
                <div className="flex-1 border-b border-gray-300" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <label className="text-xs text-gray-600 w-16">줄 개수</label>
                  <input
                    type="number"
                    value={rows}
                    onChange={e => setRows(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-xs text-center bg-blue-50 focus:border-blue-400 outline-none"
                    min={1}
                    max={20}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-xs text-gray-600 w-16">칸 개수</label>
                  <input
                    type="number"
                    value={cols}
                    onChange={e => setCols(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-xs text-center focus:border-blue-400 outline-none"
                    min={1}
                    max={20}
                  />
                </div>
              </div>
            </div>

            {/* Size section */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3 border-b border-gray-200 pb-2">
                <span className="text-xs font-bold text-gray-700">크기 지정</span>
                <div className="flex-1 border-b border-gray-300" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <label className="text-xs text-gray-600 w-10">너비</label>
                  <div className="flex items-center gap-1 px-2 py-1 border border-gray-300 rounded text-xs bg-white min-w-[80px]">
                    <span className="text-gray-500">단에 맞춤</span>
                  </div>
                  <span className="text-[10px] text-gray-400">148.0 mm</span>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-xs text-gray-600 w-10">높이</label>
                  <div className="flex items-center gap-1 px-2 py-1 border border-gray-300 rounded text-xs bg-white min-w-[80px]">
                    <span className="text-gray-500">자동</span>
                  </div>
                  <span className="text-[10px] text-gray-400">22.6 mm</span>
                </div>
              </div>
            </div>

            {/* Extra options */}
            <div>
              <div className="flex items-center gap-2 mb-3 border-b border-gray-200 pb-2">
                <span className="text-xs font-bold text-gray-700">기타</span>
                <div className="flex-1 border-b border-gray-300" />
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs text-gray-600">
                  <input type="checkbox" className="w-3 h-3" /> 글자처럼 취급
                </label>
                <label className="flex items-center gap-2 text-xs text-gray-600">
                  <input type="checkbox" className="w-3 h-3" /> 마우스 끌기로 만들기
                </label>
              </div>
            </div>
          </div>

          {/* Right buttons */}
          <div className="w-24 p-3 flex flex-col gap-2 border-l border-gray-200">
            <button
              onClick={() => onInsert(rows, cols)}
              className={`px-3 py-1.5 text-xs rounded border font-medium transition-colors ${
                isQuest
                  ? "border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-300 animate-pulse-highlight hover:bg-blue-100"
                  : "border-blue-400 bg-white text-blue-600 hover:bg-blue-50"
              }`}
            >
              만들기(D)
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              취소
            </button>
            <button className="px-3 py-1.5 text-xs rounded border border-gray-300 text-gray-600 hover:bg-gray-50">
              표마당(A)...
            </button>
            <button className="px-3 py-1.5 text-xs rounded border border-gray-300 text-gray-600 hover:bg-gray-50">
              표속성(P)...
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableDialog;
