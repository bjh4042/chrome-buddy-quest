import { useState, useRef, useCallback, useEffect } from "react";
import { Save, Table, Image as ImageIcon, Bold, Italic, Underline, ChevronDown, Undo, Redo, AlignLeft, AlignCenter, AlignRight, Strikethrough, FolderOpen, Copy, Scissors, FileText, Columns, BarChart3, Search as SearchIcon, Shield, PenTool, Layout, Type } from "lucide-react";
import WindowFrame from "./WindowFrame";
import TableDialog from "./TableDialog";
import ImagePickerDialog from "./ImagePickerDialog";
import type { QuestType } from "@/types/quest";
import hangulIconImg from "@/assets/hangul-icon.png";

interface HangulWindowProps {
  onClose: () => void;
  onMinimize?: () => void;
  currentQuestType: QuestType;
  onQuestComplete: () => void;
}

const HangulIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <img src={hangulIconImg} alt="한글" className={`${className} object-contain`} />
);

const fontSizes = ["8", "9", "10", "11", "12", "14", "16", "18", "20", "24", "28", "36"];
const fonts = ["함초롬바탕", "맑은 고딕", "바탕", "돋움", "굴림", "궁서"];

const HangulWindow = ({ onClose, onMinimize, currentQuestType, onQuestComplete }: HangulWindowProps) => {
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState("10.0");
  const [fontFamily, setFontFamily] = useState("함초롬바탕");
  const [tableData, setTableData] = useState<{ rows: number; cols: number } | null>(null);
  const [saved, setSaved] = useState(false);
  const [showFontSizeDropdown, setShowFontSizeDropdown] = useState(false);
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [fileLoaded, setFileLoaded] = useState(false);
  const [clipboard, setClipboard] = useState<string>("");
  const [pasted, setPasted] = useState(false);

  // Text selection state
  const [textSelected, setTextSelected] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const selectionRange = useRef<{ start: number; end: number }>({ start: 0, end: 0 });

  // Image state
  const [insertedImage, setInsertedImage] = useState<string | null>(null);
  const [imagePos, setImagePos] = useState({ x: 60, y: 80 });
  const [imageSize, setImageSize] = useState({ w: 160, h: 110 });
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(false);
  const [imageResized, setImageResized] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });

  const isQuest = (t: QuestType) => currentQuestType === t;

  // Pre-fill sample text for selection-based quests so users have something to drag-select
  useEffect(() => {
    if (
      (isQuest("hangul-font-size") ||
        isQuest("hangul-font-family") ||
        isQuest("shortcut-copy")) &&
      text.length === 0
    ) {
      setText("안녕하세요");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestType]);

  // Keyboard shortcuts inside Hangul document
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (!ctrl) return;
      const key = e.key.toLowerCase();

      if (key === "c" && isQuest("shortcut-copy")) {
        const ta = textAreaRef.current;
        const { start, end } = selectionRange.current;
        if (ta && start !== end) {
          setClipboard(ta.value.slice(start, end));
          e.preventDefault();
          onQuestComplete();
        }
      }
      if (key === "v" && isQuest("shortcut-paste")) {
        e.preventDefault();
        const insert = clipboard || "안녕하세요";
        const ta = textAreaRef.current;
        if (ta) {
          const pos = ta.selectionStart ?? text.length;
          setText(text.slice(0, pos) + insert + text.slice(pos));
        } else {
          setText(text + insert);
        }
        setPasted(true);
        onQuestComplete();
      }
      if (key === "s" && isQuest("shortcut-save")) {
        e.preventDefault();
        setSaved(true);
        onQuestComplete();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestType, text, clipboard]);

  const checkTextSelection = useCallback(() => {
    if (textAreaRef.current) {
      const { selectionStart, selectionEnd } = textAreaRef.current;
      const hasSelection = selectionStart !== selectionEnd;
      setTextSelected(hasSelection);
      if (hasSelection) {
        selectionRange.current = { start: selectionStart, end: selectionEnd };
      }
    }
  }, []);

  // Restore text selection after font change
  const restoreSelection = useCallback(() => {
    const { start, end } = selectionRange.current;
    if (start !== end && textAreaRef.current) {
      setTimeout(() => {
        textAreaRef.current?.focus();
        textAreaRef.current?.setSelectionRange(start, end);
        setTextSelected(true);
      }, 0);
    }
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (isQuest("hangul-typing") && e.target.value.includes("안녕하세요")) {
      onQuestComplete();
    }
  };

  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
    setShowFontSizeDropdown(false);
    if (isQuest("hangul-font-size") && size === "20" && textSelected) {
      onQuestComplete();
    }
    restoreSelection();
  };

  const handleFontFamilyChange = (f: string) => {
    setFontFamily(f);
    setShowFontDropdown(false);
    if (isQuest("hangul-font-family") && f === "돋움" && textSelected) {
      onQuestComplete();
    }
    restoreSelection();
  };

  const handleInsertTable = (rows: number, cols: number) => {
    setTableData({ rows, cols });
    setShowTableDialog(false);
    if (isQuest("hangul-table")) onQuestComplete();
  };

  const handleSave = () => {
    setSaved(true);
    if (isQuest("hangul-save")) onQuestComplete();
  };

  const handleOpenFile = () => {
    setFileLoaded(true);
    if (isQuest("hangul-open-file")) onQuestComplete();
  };

  const handleImageButtonClick = () => {
    setShowImagePicker(true);
  };

  const handleImageSelect = (imageSrc: string) => {
    setInsertedImage(imageSrc);
    setSelectedImage(true);
    setShowImagePicker(false);
    if (isQuest("hangul-image")) onQuestComplete();
  };

  // Pointer handlers for image drag/resize
  const getPointerPos = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e) {
      const t = e.touches[0] || (e as React.TouchEvent).changedTouches[0];
      return { x: t.clientX, y: t.clientY };
    }
    return { x: (e as React.MouseEvent).clientX, y: (e as React.MouseEvent).clientY };
  };

  const handleImagePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if ('preventDefault' in e && 'touches' in e) e.preventDefault();
    setSelectedImage(true);
    setIsDraggingImage(true);
    const pos = getPointerPos(e);
    dragStart.current = { x: pos.x - imagePos.x, y: pos.y - imagePos.y };
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getPointerPos(e);
    if (isDraggingImage) {
      setImagePos({ x: pos.x - dragStart.current.x, y: pos.y - dragStart.current.y });
    }
    if (isResizing) {
      const dx = pos.x - resizeStart.current.x;
      const dy = pos.y - resizeStart.current.y;
      const newW = Math.max(50, resizeStart.current.w + dx);
      const newH = Math.max(30, resizeStart.current.h + dy);
      setImageSize({ w: newW, h: newH });
      if (isQuest("hangul-image-resize") && !imageResized && (Math.abs(dx) > 20 || Math.abs(dy) > 20)) {
        setImageResized(true);
        onQuestComplete();
      }
    }
  };

  const handlePointerUp = () => {
    setIsDraggingImage(false);
    setIsResizing(false);
  };

  const handleResizePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if ('preventDefault' in e && 'touches' in e) e.preventDefault();
    setIsResizing(true);
    const pos = getPointerPos(e);
    resizeStart.current = { x: pos.x, y: pos.y, w: imageSize.w, h: imageSize.h };
  };

  const needsSelection = (isQuest("hangul-font-size") || isQuest("hangul-font-family")) && text.length > 0;
  const selectionHint = needsSelection && !textSelected;

  const toolbar = (
    <div className="flex flex-col border-b border-gray-200">
      {/* Menu bar - matches reference exactly */}
      <div className="flex items-center px-1 py-0 bg-gray-100 border-b border-gray-200 text-[11px]">
        <span className="px-2 py-1 text-gray-600 hover:bg-gray-200 cursor-pointer">파일</span>
        <span className="px-2 py-1 text-orange-600 font-medium bg-orange-50 border-b-2 border-orange-400">편집 ▾</span>
        <span className="px-2 py-1 text-gray-600 hover:bg-gray-200 cursor-pointer">보기 ▾</span>
        <span className="px-2 py-1 text-gray-600 hover:bg-gray-200 cursor-pointer">입력 ▾</span>
        <span className="px-2 py-1 text-gray-600 hover:bg-gray-200 cursor-pointer">서식 ▾</span>
        <span className="px-2 py-1 text-gray-600 hover:bg-gray-200 cursor-pointer">쪽</span>
        <span className="px-2 py-1 text-gray-600 hover:bg-gray-200 cursor-pointer">보안 ▾</span>
        <span className="px-2 py-1 text-gray-600 hover:bg-gray-200 cursor-pointer">검토 ▾</span>
        <span className="px-2 py-1 text-gray-600 hover:bg-gray-200 cursor-pointer">도구 ▾</span>
        <div className="flex-1" />
        <span className="px-2 py-1 text-[10px] text-gray-400">빈 문서 1 - 초급</span>
      </div>

      {/* Icon toolbar row - matches HWP reference with labeled icons */}
      <div className="flex items-center gap-0 px-1 py-0.5 bg-gray-50 border-b border-gray-100 overflow-x-auto">
        <ToolbarIconBtn icon={<Scissors className="w-3.5 h-3.5" />} label="자르기" />
        <ToolbarIconBtn icon={<Copy className="w-3.5 h-3.5" />} label="붙이기" sub="복사" />
        <ToolbarIconBtn icon={<PenTool className="w-3.5 h-3.5" />} label="모양" sub="지우기" />
        <div className="w-px h-8 bg-gray-300 mx-0.5" />
        <ToolbarIconBtn icon={<Type className="w-3.5 h-3.5" />} label="글자" />
        <ToolbarIconBtn icon={<AlignLeft className="w-3.5 h-3.5" />} label="문단" />
        <ToolbarIconBtn icon={<Layout className="w-3.5 h-3.5" />} label="스타일" />
        <div className="w-px h-8 bg-gray-300 mx-0.5" />
        <ToolbarIconBtn icon={<Columns className="w-3.5 h-3.5" />} label="세로" highlight={false} />
        <ToolbarIconBtn icon={<FileText className="w-3.5 h-3.5" />} label="가로" />
        <ToolbarIconBtn icon={<FileText className="w-3.5 h-3.5" />} label="목" />
        <ToolbarIconBtn icon={<FileText className="w-3.5 h-3.5" />} label="바탕쪽" />
        <ToolbarIconBtn icon={<Columns className="w-3.5 h-3.5" />} label="단" />
        <div className="w-px h-8 bg-gray-300 mx-0.5" />
        <ToolbarIconBtn icon={<PenTool className="w-3.5 h-3.5" />} label="도형" />
        <button
          onClick={handleImageButtonClick}
          className={`flex flex-col items-center px-1.5 py-0.5 rounded hover:bg-gray-200 transition-colors min-w-[32px] ${
            isQuest("hangul-image") ? "bg-yellow-100 ring-2 ring-yellow-400 animate-pulse-highlight" : ""
          }`}
          title="그림 삽입"
        >
          <ImageIcon className="w-3.5 h-3.5 text-gray-600" />
          <span className="text-[7px] text-gray-500 leading-none mt-0.5">그림</span>
        </button>
        <button
          onClick={() => setShowTableDialog(true)}
          className={`flex flex-col items-center px-1.5 py-0.5 rounded hover:bg-gray-200 transition-colors min-w-[32px] ${
            isQuest("hangul-table") ? "bg-yellow-100 ring-2 ring-yellow-400 animate-pulse-highlight" : ""
          }`}
          title="표 삽입"
        >
          <Table className="w-3.5 h-3.5 text-gray-600" />
          <span className="text-[7px] text-gray-500 leading-none mt-0.5">표</span>
        </button>
        <ToolbarIconBtn icon={<BarChart3 className="w-3.5 h-3.5" />} label="차트" />
        <div className="w-px h-8 bg-gray-300 mx-0.5" />
        <ToolbarIconBtn icon={<Shield className="w-3.5 h-3.5" />} label="개체" sub="보호" />
        <div className="w-px h-8 bg-gray-300 mx-0.5" />
        <ToolbarIconBtn icon={<SearchIcon className="w-3.5 h-3.5" />} label="찾기" />
        <button
          onClick={handleSave}
          className={`flex flex-col items-center px-1.5 py-0.5 rounded hover:bg-gray-200 transition-colors min-w-[32px] ${
            isQuest("hangul-save") ? "bg-yellow-100 ring-2 ring-yellow-400 animate-pulse-highlight" : ""
          }`}
          title="저장"
        >
          <Save className="w-3.5 h-3.5 text-gray-600" />
          <span className="text-[7px] text-gray-500 leading-none mt-0.5">저장</span>
        </button>
        <button
          onClick={handleOpenFile}
          className={`flex flex-col items-center px-1.5 py-0.5 rounded hover:bg-gray-200 transition-colors min-w-[32px] ${
            isQuest("hangul-open-file") ? "bg-yellow-100 ring-2 ring-yellow-400 animate-pulse-highlight" : ""
          }`}
          title="불러오기"
        >
          <FolderOpen className="w-3.5 h-3.5 text-gray-600" />
          <span className="text-[7px] text-gray-500 leading-none mt-0.5">불러오기</span>
        </button>
      </div>

      {/* Font controls row */}
      <div className="flex items-center gap-1 px-2 py-1 bg-white flex-wrap">
        {selectionHint && (
          <div className="w-full text-[10px] text-orange-500 font-bold mb-1 animate-pulse">
            ⚠️ 먼저 글자를 드래그해서 블록 지정하세요!
          </div>
        )}
        {/* Undo/Redo */}
        <button className="p-0.5 rounded hover:bg-gray-200"><Undo className="w-3 h-3 text-gray-500" /></button>
        <button className="p-0.5 rounded hover:bg-gray-200"><Redo className="w-3 h-3 text-gray-500" /></button>
        <span className="w-px h-4 bg-gray-300 mx-0.5" />
        {/* Font family dropdown */}
        <div className="relative">
          <button
            onClick={() => { setShowFontDropdown(!showFontDropdown); setShowFontSizeDropdown(false); }}
            className={`flex items-center gap-1 px-2 py-0.5 bg-white border rounded text-[11px] min-w-[90px] ${
              isQuest("hangul-font-family")
                ? "border-yellow-400 ring-2 ring-yellow-200 animate-pulse-highlight"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <span>{fontFamily}</span>
            <ChevronDown className="w-3 h-3" />
          </button>
          {showFontDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-50 min-w-[130px]">
              {fonts.map(f => (
                <button key={f} onClick={() => handleFontFamilyChange(f)}
                  className={`w-full text-left px-3 py-1.5 text-[11px] hover:bg-blue-50 transition-colors ${
                    isQuest("hangul-font-family") && f === "돋움" ? "bg-yellow-50 font-bold text-blue-600" : ""
                  }`}>{f}</button>
              ))}
            </div>
          )}
        </div>
        {/* Style dropdown */}
        <div className="flex items-center gap-0.5 px-1 py-0.5 bg-white border border-gray-300 rounded text-[11px] min-w-[50px]">
          <span>대표</span>
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </div>
        {/* Font size */}
        <div className="relative">
          <button
            onClick={() => { setShowFontSizeDropdown(!showFontSizeDropdown); setShowFontDropdown(false); }}
            className={`flex items-center gap-0.5 px-2 py-0.5 bg-white border rounded text-[11px] min-w-[45px] ${
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
                <button key={s} onClick={() => handleFontSizeChange(s)}
                  className={`w-full text-left px-3 py-1.5 text-[11px] hover:bg-blue-50 transition-colors ${
                    isQuest("hangul-font-size") && s === "20" ? "bg-yellow-50 font-bold text-blue-600" : ""
                  }`}>{s}</button>
              ))}
            </div>
          )}
        </div>
        <span className="text-[10px] text-gray-500">pt</span>
        <span className="w-px h-4 bg-gray-300 mx-0.5" />
        <button className="p-1 rounded hover:bg-gray-200"><Bold className="w-3.5 h-3.5 text-gray-600" /></button>
        <button className="p-1 rounded hover:bg-gray-200"><Italic className="w-3.5 h-3.5 text-gray-600" /></button>
        <button className="p-1 rounded hover:bg-gray-200"><Underline className="w-3.5 h-3.5 text-gray-600" /></button>
        <button className="p-1 rounded hover:bg-gray-200"><Strikethrough className="w-3.5 h-3.5 text-gray-600" /></button>
        <span className="w-px h-4 bg-gray-300 mx-0.5" />
        <button className="p-1 rounded hover:bg-gray-200"><AlignLeft className="w-3.5 h-3.5 text-gray-600" /></button>
        <button className="p-1 rounded hover:bg-gray-200"><AlignCenter className="w-3.5 h-3.5 text-gray-600" /></button>
        <button className="p-1 rounded hover:bg-gray-200"><AlignRight className="w-3.5 h-3.5 text-gray-600" /></button>
      </div>
    </div>
  );

  return (
    <WindowFrame
      title={saved ? "문서1.hwp - 한글" : "빈 문서 1 - 한글"}
      icon={<HangulIcon className="w-4 h-4" />}
      onClose={onClose}
      onMinimize={onMinimize}
      toolbar={toolbar}
    >
      <div className="flex h-full"
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      >
        {/* Left page navigation panel */}
        <div className="w-6 bg-gray-100 border-r border-gray-200 flex flex-col items-center pt-2">
          {[1,2,3,4,5,6,7,8,9,10].map(n => (
            <div key={n} className="text-[7px] text-gray-400 py-0.5 cursor-pointer hover:text-blue-500">{n}</div>
          ))}
        </div>
        {/* Document area */}
        <div className="flex-1 bg-gray-200 p-4 md:p-6 min-h-[300px] overflow-auto"
          onClick={() => { setShowFontDropdown(false); setShowFontSizeDropdown(false); setSelectedImage(false); }}>
          {/* Ruler */}
          <div className="bg-white border-b border-gray-300 h-5 mb-2 mx-auto max-w-2xl flex items-end px-2">
            {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
              <div key={n} className="flex-1 text-center text-[7px] text-gray-400 border-l border-gray-300">
                {n > 0 ? n : ''}
              </div>
            ))}
          </div>
          {/* Paper */}
          <div className="bg-white shadow-md mx-auto max-w-2xl min-h-[500px] p-8 rounded-sm border border-gray-300 relative">
            <div className="absolute top-4 left-4 w-3 h-3 border-t border-l border-gray-300" />
            <div className="absolute top-4 right-4 w-3 h-3 border-t border-r border-gray-300" />
            <div className="absolute bottom-4 left-4 w-3 h-3 border-b border-l border-gray-300" />
            <div className="absolute bottom-4 right-4 w-3 h-3 border-b border-r border-gray-300" />

            <textarea
              ref={textAreaRef}
              value={text}
              onChange={handleTextChange}
              onSelect={checkTextSelection}
              onMouseUp={checkTextSelection}
              onTouchEnd={checkTextSelection}
              placeholder={isQuest("hangul-typing") ? "'안녕하세요'를 입력해보세요!" : "여기에 글을 입력하세요..."}
              className="w-full h-full min-h-[200px] outline-none resize-none text-gray-800"
              style={{ fontFamily: fontFamily, fontSize: `${parseFloat(fontSize) * 1.5}px` }}
              autoFocus={isQuest("hangul-typing")}
            />

            {/* Inserted image */}
            {insertedImage && (
              <div
                className={`absolute cursor-move ${selectedImage ? "ring-2 ring-blue-500" : ""} ${
                  isQuest("hangul-image-resize") && !imageResized ? "ring-2 ring-yellow-400 animate-pulse-highlight" : ""
                }`}
                style={{ left: imagePos.x, top: imagePos.y, width: imageSize.w, height: imageSize.h }}
                onMouseDown={handleImagePointerDown}
                onTouchStart={handleImagePointerDown}
                onClick={(e) => { e.stopPropagation(); setSelectedImage(true); }}
              >
                <img src={insertedImage} alt="삽입된 이미지" className="w-full h-full object-contain" draggable={false} />
                {(selectedImage || isQuest("hangul-image-resize")) && (
                  <>
                    <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-white border-2 border-blue-500 cursor-nw-resize" />
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white border-2 border-blue-500 cursor-ne-resize" />
                    <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-white border-2 border-blue-500 cursor-sw-resize" />
                    <div
                      className="absolute -bottom-1 -right-1 w-3 h-3 bg-white border-2 border-blue-500 cursor-se-resize"
                      onMouseDown={handleResizePointerDown}
                      onTouchStart={handleResizePointerDown}
                    />
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2.5 h-2.5 bg-white border-2 border-blue-500 cursor-w-resize" />
                    <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2.5 h-2.5 bg-white border-2 border-blue-500 cursor-e-resize" />
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-2 border-blue-500 cursor-n-resize" />
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-2 border-blue-500 cursor-s-resize" />
                  </>
                )}
              </div>
            )}

            {tableData && (
              <div className="mt-4 border border-gray-400">
                <div className="grid" style={{ gridTemplateColumns: `repeat(${tableData.cols}, 1fr)` }}>
                  {Array(tableData.rows * tableData.cols).fill(0).map((_, i) => (
                    <div key={i} className="border border-gray-300 p-2 text-xs text-gray-400 min-h-[30px]" />
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
          {fileLoaded && (
            <div className="text-center mt-3 text-sm text-blue-600 font-display">
              📂 파일을 불러왔습니다!
            </div>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-0.5 bg-gray-100 border-t border-gray-200 text-[9px] text-gray-500">
        <div className="flex items-center gap-3">
          <span>1/1쪽</span>
          <span>1단</span>
          <span>1줄</span>
          <span>{text.length}글자</span>
          <span>문자 입력</span>
          <span>1/1 구역</span>
          <span>삽입</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-blue-500">변경 내용 [기록 중지]</span>
          <span>타수 : {text.length}타</span>
        </div>
      </div>

      {showTableDialog && (
        <TableDialog
          onInsert={handleInsertTable}
          onClose={() => setShowTableDialog(false)}
          isQuest={isQuest("hangul-table")}
        />
      )}

      {showImagePicker && (
        <ImagePickerDialog
          onSelect={handleImageSelect}
          onClose={() => setShowImagePicker(false)}
          isQuest={isQuest("hangul-image")}
        />
      )}
    </WindowFrame>
  );
};

// Small toolbar icon button with label
const ToolbarIconBtn = ({ icon, label, sub, highlight }: { icon: React.ReactNode; label: string; sub?: string; highlight?: boolean }) => (
  <button className={`flex flex-col items-center px-1.5 py-0.5 rounded hover:bg-gray-200 transition-colors min-w-[32px] ${highlight ? "bg-yellow-100 ring-2 ring-yellow-400" : ""}`}>
    <span className="text-gray-600">{icon}</span>
    <span className="text-[7px] text-gray-500 leading-none mt-0.5">{label}</span>
    {sub && <span className="text-[6px] text-gray-400 leading-none">{sub}</span>}
  </button>
);

export { HangulIcon };
export default HangulWindow;
