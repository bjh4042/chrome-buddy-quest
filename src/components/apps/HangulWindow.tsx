import { useState } from "react";
import { Save, Table, Image, Bold, Italic, Underline, ChevronDown } from "lucide-react";
import WindowFrame from "./WindowFrame";
import type { QuestType } from "@/types/quest";

interface HangulWindowProps {
  onClose: () => void;
  currentQuestType: QuestType;
  onQuestComplete: () => void;
}

const HangulIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <div className={`${className} bg-blue-600 rounded-sm flex items-center justify-center text-white font-bold`}
    style={{ fontSize: "65%" }}>
    한
  </div>
);

const fontSizes = ["10", "11", "12", "14", "16", "18", "20", "24", "28", "36"];
const fonts = ["맑은 고딕", "바탕", "돋움", "굴림", "궁서"];

const HangulWindow = ({ onClose, currentQuestType, onQuestComplete }: HangulWindowProps) => {
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState("12");
  const [fontFamily, setFontFamily] = useState("맑은 고딕");
  const [tableInserted, setTableInserted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showFontSizeDropdown, setShowFontSizeDropdown] = useState(false);
  const [showFontDropdown, setShowFontDropdown] = useState(false);

  const isQuest = (t: QuestType) => currentQuestType === t;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (isQuest("hangul-typing") && e.target.value.includes("안녕하세요")) {
      onQuestComplete();
    }
  };

  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
    setShowFontSizeDropdown(false);
    if (isQuest("hangul-font-size") && size === "20") {
      onQuestComplete();
    }
  };

  const handleInsertTable = () => {
    setTableInserted(true);
    if (isQuest("hangul-table")) {
      onQuestComplete();
    }
  };

  const handleSave = () => {
    setSaved(true);
    if (isQuest("hangul-save")) {
      onQuestComplete();
    }
  };

  const toolbar = (
    <div className="flex flex-wrap items-center gap-1 px-2 py-1.5">
      {/* Save */}
      <button
        onClick={handleSave}
        className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${
          isQuest("hangul-save") ? "bg-yellow-100 ring-2 ring-yellow-400 animate-pulse-highlight" : ""
        }`}
        title="저장"
      >
        <Save className="w-4 h-4 text-gray-600" />
      </button>

      <span className="w-px h-5 bg-gray-300 mx-1" />

      {/* Font family */}
      <div className="relative">
        <button
          onClick={() => { setShowFontDropdown(!showFontDropdown); setShowFontSizeDropdown(false); }}
          className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-300 rounded text-xs min-w-[80px] hover:border-gray-400"
        >
          <span>{fontFamily}</span>
          <ChevronDown className="w-3 h-3" />
        </button>
        {showFontDropdown && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-50 min-w-[120px]">
            {fonts.map(f => (
              <button
                key={f}
                onClick={() => { setFontFamily(f); setShowFontDropdown(false); }}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 transition-colors"
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Font size */}
      <div className="relative">
        <button
          onClick={() => { setShowFontSizeDropdown(!showFontSizeDropdown); setShowFontDropdown(false); }}
          className={`flex items-center gap-1 px-2 py-1 bg-white border rounded text-xs min-w-[50px] ${
            isQuest("hangul-font-size")
              ? "border-yellow-400 ring-2 ring-yellow-200 animate-pulse-highlight"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <span>{fontSize}</span>
          <ChevronDown className="w-3 h-3" />
        </button>
        {showFontSizeDropdown && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-50 min-w-[60px]">
            {fontSizes.map(s => (
              <button
                key={s}
                onClick={() => handleFontSizeChange(s)}
                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 transition-colors ${
                  isQuest("hangul-font-size") && s === "20" ? "bg-yellow-50 font-bold text-blue-600" : ""
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <span className="w-px h-5 bg-gray-300 mx-1" />

      {/* Bold, Italic, Underline */}
      <button className="p-1.5 rounded hover:bg-gray-200"><Bold className="w-3.5 h-3.5 text-gray-600" /></button>
      <button className="p-1.5 rounded hover:bg-gray-200"><Italic className="w-3.5 h-3.5 text-gray-600" /></button>
      <button className="p-1.5 rounded hover:bg-gray-200"><Underline className="w-3.5 h-3.5 text-gray-600" /></button>

      <span className="w-px h-5 bg-gray-300 mx-1" />

      {/* Table */}
      <button
        onClick={handleInsertTable}
        className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${
          isQuest("hangul-table") ? "bg-yellow-100 ring-2 ring-yellow-400 animate-pulse-highlight" : ""
        }`}
        title="표 삽입"
      >
        <Table className="w-4 h-4 text-gray-600" />
      </button>

      {/* Image */}
      <button className="p-1.5 rounded hover:bg-gray-200" title="그림 삽입">
        <Image className="w-4 h-4 text-gray-600" />
      </button>
    </div>
  );

  return (
    <WindowFrame
      title={saved ? "문서1.hwp - 한글" : "제목 없음 - 한글"}
      icon={<HangulIcon className="w-4 h-4" />}
      onClose={onClose}
      toolbar={toolbar}
    >
      <div className="flex-1 bg-gray-100 p-4 md:p-8 min-h-[300px]" onClick={() => { setShowFontDropdown(false); setShowFontSizeDropdown(false); }}>
        {/* Paper */}
        <div className="bg-white shadow-md mx-auto max-w-2xl min-h-[400px] p-8 rounded">
          <textarea
            value={text}
            onChange={handleTextChange}
            placeholder={isQuest("hangul-typing") ? "'안녕하세요'를 입력해보세요!" : "여기에 글을 입력하세요..."}
            className="w-full h-full min-h-[350px] outline-none resize-none text-gray-800"
            style={{ fontFamily: fontFamily, fontSize: `${fontSize}px` }}
            autoFocus={isQuest("hangul-typing")}
          />

          {tableInserted && (
            <div className="mt-4 border border-gray-400">
              <div className="grid grid-cols-3">
                {Array(9).fill(0).map((_, i) => (
                  <div key={i} className="border border-gray-300 p-2 text-xs text-gray-400 min-h-[30px]">
                    {i === 0 ? "이름" : i === 1 ? "과목" : i === 2 ? "점수" : ""}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {saved && (
          <div className="text-center mt-3 text-sm text-green-600 font-display">
            💾 파일이 저장되었습니다!
          </div>
        )}
      </div>
    </WindowFrame>
  );
};

export { HangulIcon };
export default HangulWindow;
