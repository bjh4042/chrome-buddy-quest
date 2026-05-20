import { useState, useRef, useCallback, useEffect } from "react";
import { ChevronDown, Bold, Italic, Underline, Image as ImageIcon, AlignLeft, AlignCenter, AlignRight, Undo, Redo } from "lucide-react";
import WindowFrame from "./WindowFrame";
import ImagePickerDialog from "./ImagePickerDialog";
import type { QuestType } from "@/types/quest";
import pptIconImg from "@/assets/ppt-icon.png";

interface PowerPointWindowProps {
  onClose: () => void;
  onMinimize?: () => void;
  currentQuestType: QuestType;
  onQuestComplete: () => void;
}

const PptIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <img src={pptIconImg} alt="PowerPoint" className={`${className} object-contain`} />
);

const fontSizes = ["10", "12", "14", "16", "18", "20", "24", "28", "32", "36", "44", "54"];
const fonts = ["맑은 고딕", "바탕", "돋움", "굴림", "궁서", "나눔고딕"];

const PowerPointWindow = ({ onClose, onMinimize, currentQuestType, onQuestComplete }: PowerPointWindowProps) => {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingSubtitle, setIsEditingSubtitle] = useState(false);
  const [fontSize, setFontSize] = useState("44");
  const [fontFamily, setFontFamily] = useState("맑은 고딕");
  const [showFontSizeDropdown, setShowFontSizeDropdown] = useState(false);
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);

  // Text selection for title
  const [titleSelected, setTitleSelected] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const titleSelectionRange = useRef<{ start: number; end: number }>({ start: 0, end: 0 });

  // Image state
  const [insertedImage, setInsertedImage] = useState<string | null>(null);
  const [imagePos, setImagePos] = useState({ x: 50, y: 60 });
  const [imageSize, setImageSize] = useState({ w: 150, h: 100 });
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(false);
  const [imageResized, setImageResized] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });

  const isQuest = (t: QuestType) => currentQuestType === t;

  // Pre-fill title for selection-based PPT quests
  useEffect(() => {
    if ((isQuest("ppt-font-size") || isQuest("ppt-font-family")) && title.length === 0) {
      setTitle("나의 발표");
      setIsEditingTitle(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestType]);

  const checkTitleSelection = useCallback(() => {
    if (titleInputRef.current) {
      const { selectionStart, selectionEnd } = titleInputRef.current;
      const hasSelection = (selectionStart ?? 0) !== (selectionEnd ?? 0);
      setTitleSelected(hasSelection);
      if (hasSelection) {
        titleSelectionRange.current = { start: selectionStart ?? 0, end: selectionEnd ?? 0 };
      }
    }
  }, []);

  const restoreTitleSelection = useCallback(() => {
    const { start, end } = titleSelectionRange.current;
    if (start !== end && titleInputRef.current) {
      setTimeout(() => {
        titleInputRef.current?.focus();
        titleInputRef.current?.setSelectionRange(start, end);
        setTitleSelected(true);
      }, 0);
    }
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (isQuest("ppt-text") && e.target.value.includes("나의 발표")) {
      onQuestComplete();
    }
  };

  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
    setShowFontSizeDropdown(false);
    if (isQuest("ppt-font-size") && size === "28" && titleSelected) {
      onQuestComplete();
    }
    restoreTitleSelection();
  };

  const handleFontFamilyChange = (f: string) => {
    setFontFamily(f);
    setShowFontDropdown(false);
    if (isQuest("ppt-font-family") && f === "바탕" && titleSelected) {
      onQuestComplete();
    }
    restoreTitleSelection();
  };

  const handleImageButtonClick = () => {
    setShowImagePicker(true);
  };

  const handleImageSelect = (imageSrc: string) => {
    setInsertedImage(imageSrc);
    setSelectedImage(true);
    setShowImagePicker(false);
    if (isQuest("ppt-image")) onQuestComplete();
  };

  // Pointer handlers
  const getPointerPos = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e) {
      const t = e.touches[0] || (e as React.TouchEvent).changedTouches[0];
      return { x: t.clientX, y: t.clientY };
    }
    return { x: (e as React.MouseEvent).clientX, y: (e as React.MouseEvent).clientY };
  };

  const handleImagePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if ('touches' in e) e.preventDefault();
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
      if (isQuest("ppt-image-resize") && !imageResized && (Math.abs(dx) > 20 || Math.abs(dy) > 20)) {
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
    if ('touches' in e) e.preventDefault();
    setIsResizing(true);
    const pos = getPointerPos(e);
    resizeStart.current = { x: pos.x, y: pos.y, w: imageSize.w, h: imageSize.h };
  };

  const needsSelection = (isQuest("ppt-font-size") || isQuest("ppt-font-family")) && title.length > 0;
  const selectionHint = needsSelection && !titleSelected;

  const toolbar = (
    <div className="flex flex-col">
      {/* Tab bar */}
      <div className="flex items-center gap-0 px-1 py-0.5 bg-orange-50 border-b border-gray-200 text-[11px]">
        <span className="px-3 py-1 text-gray-600 hover:bg-gray-200 cursor-pointer">파일</span>
        <span className="px-3 py-1 text-orange-700 font-medium border-b-2 border-orange-500 bg-white">홈</span>
        <span className="px-3 py-1 text-gray-600 hover:bg-gray-200 cursor-pointer">삽입</span>
        <span className="px-3 py-1 text-gray-600 hover:bg-gray-200 cursor-pointer">그리기</span>
        <span className="px-3 py-1 text-gray-600 hover:bg-gray-200 cursor-pointer">디자인</span>
        <span className="px-3 py-1 text-gray-600 hover:bg-gray-200 cursor-pointer">전환</span>
        <span className="px-3 py-1 text-gray-600 hover:bg-gray-200 cursor-pointer">애니메이션</span>
        <span className="px-3 py-1 text-gray-600 hover:bg-gray-200 cursor-pointer">슬라이드 쇼</span>
        <span className="px-3 py-1 text-gray-600 hover:bg-gray-200 cursor-pointer">검토</span>
      </div>
      {/* Ribbon */}
      <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 flex-wrap">
        {selectionHint && (
          <div className="w-full text-[10px] text-orange-500 font-bold mb-1 animate-pulse">
            ⚠️ 먼저 제목 글자를 드래그해서 블록 지정하세요!
          </div>
        )}
        <button className="p-1 rounded hover:bg-gray-200"><Undo className="w-3.5 h-3.5 text-gray-500" /></button>
        <button className="p-1 rounded hover:bg-gray-200"><Redo className="w-3.5 h-3.5 text-gray-500" /></button>
        <span className="w-px h-4 bg-gray-300 mx-0.5" />
        {/* Font family */}
        <div className="relative">
          <button
            onClick={() => { setShowFontDropdown(!showFontDropdown); setShowFontSizeDropdown(false); }}
            className={`flex items-center gap-1 px-2 py-0.5 bg-white border rounded text-[11px] min-w-[80px] ${
              isQuest("ppt-font-family")
                ? "border-yellow-400 ring-2 ring-yellow-200 animate-pulse-highlight"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <span>{fontFamily}</span>
            <ChevronDown className="w-3 h-3" />
          </button>
          {showFontDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-50 min-w-[120px]">
              {fonts.map(f => (
                <button key={f} onClick={() => handleFontFamilyChange(f)}
                  className={`w-full text-left px-3 py-1.5 text-[11px] hover:bg-blue-50 ${
                    isQuest("ppt-font-family") && f === "바탕" ? "bg-yellow-50 font-bold text-orange-600" : ""
                  }`}>{f}</button>
              ))}
            </div>
          )}
        </div>
        {/* Font size */}
        <div className="relative">
          <button
            onClick={() => { setShowFontSizeDropdown(!showFontSizeDropdown); setShowFontDropdown(false); }}
            className={`flex items-center gap-0.5 px-2 py-0.5 bg-white border rounded text-[11px] min-w-[40px] ${
              isQuest("ppt-font-size")
                ? "border-yellow-400 ring-2 ring-yellow-200 animate-pulse-highlight"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <span>{fontSize}</span>
            <ChevronDown className="w-3 h-3" />
          </button>
          {showFontSizeDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-50 min-w-[55px]">
              {fontSizes.map(s => (
                <button key={s} onClick={() => handleFontSizeChange(s)}
                  className={`w-full text-left px-3 py-1.5 text-[11px] hover:bg-blue-50 ${
                    isQuest("ppt-font-size") && s === "28" ? "bg-yellow-50 font-bold text-orange-600" : ""
                  }`}>{s}</button>
              ))}
            </div>
          )}
        </div>
        <span className="w-px h-4 bg-gray-300 mx-0.5" />
        <button className="p-1 rounded hover:bg-gray-200"><Bold className="w-3.5 h-3.5 text-gray-600" /></button>
        <button className="p-1 rounded hover:bg-gray-200"><Italic className="w-3.5 h-3.5 text-gray-600" /></button>
        <button className="p-1 rounded hover:bg-gray-200"><Underline className="w-3.5 h-3.5 text-gray-600" /></button>
        <span className="w-px h-4 bg-gray-300 mx-0.5" />
        <button className="p-1 rounded hover:bg-gray-200"><AlignLeft className="w-3.5 h-3.5 text-gray-600" /></button>
        <button className="p-1 rounded hover:bg-gray-200"><AlignCenter className="w-3.5 h-3.5 text-gray-600" /></button>
        <button className="p-1 rounded hover:bg-gray-200"><AlignRight className="w-3.5 h-3.5 text-gray-600" /></button>
        <span className="w-px h-4 bg-gray-300 mx-0.5" />
        <button onClick={handleImageButtonClick}
          className={`p-1 rounded hover:bg-gray-200 transition-colors ${
            isQuest("ppt-image") ? "bg-yellow-100 ring-2 ring-yellow-400 animate-pulse-highlight" : ""
          }`} title="그림 삽입">
          <ImageIcon className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>
  );

  return (
    <WindowFrame
      title="프레젠테이션1 - PowerPoint"
      icon={<PptIcon className="w-4 h-4" />}
      onClose={onClose}
      onMinimize={onMinimize}
      toolbar={toolbar}
    >
      <div className="flex h-full min-h-[400px]"
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        onClick={() => { setShowFontDropdown(false); setShowFontSizeDropdown(false); }}
      >
        {/* Slide panel */}
        <div className="w-28 md:w-36 bg-gray-100 border-r border-gray-200 p-2">
          <div className="bg-white border-2 border-orange-400 rounded aspect-[16/9] flex flex-col items-center justify-center p-1 relative shadow-sm">
            <span className="text-[6px] text-gray-700 text-center font-bold truncate w-full px-1">
              {title || "제목을 추가하려면 클릭하십시오."}
            </span>
            <span className="text-[5px] text-gray-400 mt-0.5">
              {subtitle || "부제목을 입력하십시오"}
            </span>
          </div>
          <div className="text-[9px] text-gray-500 text-center mt-1">1</div>
        </div>

        {/* Slide area */}
        <div className="flex-1 bg-gray-300 flex flex-col">
          <div className="flex-1 flex items-center justify-center p-4">
            <div
              className="bg-white shadow-lg rounded-sm w-full max-w-xl aspect-[16/9] flex flex-col items-center justify-center relative overflow-hidden"
              onClick={() => setSelectedImage(false)}
            >
              {/* Title placeholder */}
              <div className="w-4/5 mb-2">
                {isEditingTitle ? (
                  <div className={`border-2 rounded px-4 py-3 ${
                    isQuest("ppt-text") ? "border-orange-400" : "border-blue-400"
                  }`}>
                    <input
                      ref={titleInputRef}
                      value={title}
                      onChange={handleTitleChange}
                      onSelect={checkTitleSelection}
                      onMouseUp={checkTitleSelection}
                      onTouchEnd={checkTitleSelection}
                      placeholder={isQuest("ppt-text") ? "'나의 발표'를 입력하세요!" : "제목을 추가하려면 클릭하십시오."}
                      className="w-full text-center outline-none text-gray-800 font-bold"
                      style={{ fontSize: `${Math.min(parseInt(fontSize) * 0.6, 28)}px`, fontFamily }}
                      autoFocus
                      onBlur={() => !isQuest("ppt-text") && setIsEditingTitle(false)}
                    />
                  </div>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); setIsEditingTitle(true); }}
                    className={`w-full border-2 border-dashed rounded px-4 py-3 transition-colors text-center ${
                      isQuest("ppt-text")
                        ? "border-orange-400 bg-orange-50/50 animate-pulse-highlight hover:bg-orange-100/50"
                        : "border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    <span className={`font-bold ${title ? "text-gray-800" : "text-gray-400"}`}
                      style={{ fontSize: `${Math.min(parseInt(fontSize) * 0.6, 28)}px`, fontFamily }}>
                      {title || "제목을 추가하려면 클릭하십시오."}
                    </span>
                  </button>
                )}
              </div>

              {/* Subtitle */}
              <div className="w-3/5">
                {isEditingSubtitle ? (
                  <div className="border-2 border-gray-300 rounded px-3 py-2">
                    <input
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="부제목을 입력하십시오"
                      className="w-full text-center text-sm outline-none text-gray-700"
                      style={{ fontFamily }}
                      autoFocus
                      onBlur={() => setIsEditingSubtitle(false)}
                    />
                  </div>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); setIsEditingSubtitle(true); }}
                    className="w-full border-2 border-dashed border-gray-200 rounded px-3 py-2 hover:border-gray-400 hover:bg-gray-50 transition-colors"
                  >
                    <span className={`text-sm ${subtitle ? "text-gray-700" : "text-gray-400"}`} style={{ fontFamily }}>
                      {subtitle || "부제목을 입력하십시오"}
                    </span>
                  </button>
                )}
              </div>

              {/* Inserted image */}
              {insertedImage && (
                <div
                  className={`absolute cursor-move ${selectedImage ? "ring-2 ring-blue-500" : ""} ${
                    isQuest("ppt-image-resize") && !imageResized ? "ring-2 ring-yellow-400 animate-pulse-highlight" : ""
                  }`}
                  style={{ left: imagePos.x, top: imagePos.y, width: imageSize.w, height: imageSize.h }}
                  onMouseDown={handleImagePointerDown}
                  onTouchStart={handleImagePointerDown}
                  onClick={(e) => { e.stopPropagation(); setSelectedImage(true); }}
                >
                  <img src={insertedImage} alt="삽입된 이미지" className="w-full h-full object-contain" draggable={false} />
                  {(selectedImage || isQuest("ppt-image-resize")) && (
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
            </div>
          </div>
          {/* Notes area */}
          <div className="border-t border-gray-300 bg-white px-4 py-1">
            <span className="text-[10px] text-gray-400">여기에 슬라이드 노트의 내용을 입력하십시오</span>
          </div>
        </div>
      </div>
      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-0.5 bg-gray-200 border-t border-gray-300 text-[9px] text-gray-500">
        <div className="flex items-center gap-2">
          <span>슬라이드 1/1</span>
          <span>한국어</span>
          <span>접근성: 계속 진행 가능</span>
        </div>
        <div className="flex items-center gap-1">
          <span>스메모</span>
        </div>
      </div>

      {showImagePicker && (
        <ImagePickerDialog
          onSelect={handleImageSelect}
          onClose={() => setShowImagePicker(false)}
          isQuest={isQuest("ppt-image")}
        />
      )}
    </WindowFrame>
  );
};

export { PptIcon };
export default PowerPointWindow;
