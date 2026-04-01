import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Monitor, FolderOpen, Trash2, Star as StarIcon,
  ChevronRight, Power, Search,
  FileText, Folder, Square, ChevronDown
} from "lucide-react";
import type { QuestType } from "@/types/quest";
import { WRONG_CLICK_HINTS } from "@/types/quest";
import MyPcWindow from "./apps/MyPcWindow";
import EdgeWindow, { EdgeIcon } from "./apps/EdgeWindow";
import HangulWindow, { HangulIcon } from "./apps/HangulWindow";
import ExcelWindow, { ExcelIcon } from "./apps/ExcelWindow";
import PowerPointWindow, { PptIcon } from "./apps/PowerPointWindow";
import FingerGuide from "./FingerGuide";
import WrongClickHint from "./WrongClickHint";

interface WinDesktopProps {
  currentQuestType: QuestType;
  onQuestComplete: () => void;
  instruction: string;
}

type OpenApp = "mypc" | "edge" | "hangul" | "excel" | "ppt" | null;

// Finger guide positions by quest type
const FINGER_POSITIONS: Partial<Record<QuestType, { x: string; y: string; label: string; delay: number }>> = {
  "click": { x: "35%", y: "25%", label: "여기를 클릭!", delay: 3000 },
  "double-click": { x: "48px", y: "80px", label: "더블클릭!", delay: 3000 },
  "right-click": { x: "50%", y: "50%", label: "오른쪽 버튼!", delay: 3000 },
  "start-menu": { x: "50%", y: "calc(100% - 28px)", label: "시작 버튼!", delay: 2000 },
  "open-browser": { x: "calc(50% + 80px)", y: "calc(100% - 28px)", label: "Edge!", delay: 2000 },
  "drag-drop": { x: "48px", y: "320px", label: "이 파일을 끌어요!", delay: 3000 },
};

const WinDesktop = ({ currentQuestType, onQuestComplete, instruction }: WinDesktopProps) => {
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const [openApp, setOpenApp] = useState<OpenApp>(
    currentQuestType === "type-url" ? "edge" : null
  );
  const [clickTargets, setClickTargets] = useState([
    { id: 1, x: 35, y: 25, clicked: false },
    { id: 2, x: 55, y: 40, clicked: false },
    { id: 3, x: 70, y: 20, clicked: false },
  ]);
  const [newFolderCreated, setNewFolderCreated] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(true);
  const [selectedFile, setSelectedFile] = useState(false);
  const [fileContextMenu, setFileContextMenu] = useState(false);
  const [subMenuOpen, setSubMenuOpen] = useState(false);
  const [shutdownStep, setShutdownStep] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  // Drag and drop
  const [dragFile, setDragFile] = useState(true);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dropSuccess, setDropSuccess] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const dragFileRef = useRef<HTMLDivElement>(null);

  // Finger guide & hint
  const [showFingerGuide, setShowFingerGuide] = useState(false);
  const [wrongHint, setWrongHint] = useState<{ visible: boolean; pos: { x: number; y: number } }>({
    visible: false,
    pos: { x: 0, y: 0 },
  });
  const wrongClickCount = useRef(0);

  // Show finger guide after delay
  useEffect(() => {
    const fp = FINGER_POSITIONS[currentQuestType];
    if (fp) {
      const timer = setTimeout(() => setShowFingerGuide(true), fp.delay);
      return () => clearTimeout(timer);
    }
  }, [currentQuestType]);

  const triggerSuccess = useCallback(() => {
    setShowSuccess(true);
    setShowFingerGuide(false);
    setTimeout(() => {
      setShowSuccess(false);
      onQuestComplete();
    }, 1200);
  }, [onQuestComplete]);

  // Wrong click handler
  const handleWrongClick = (e: React.MouseEvent) => {
    wrongClickCount.current += 1;
    if (wrongClickCount.current >= 2) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setWrongHint({
        visible: true,
        pos: { x: e.clientX - rect.left, y: e.clientY - rect.top },
      });
      setTimeout(() => setWrongHint({ visible: false, pos: { x: 0, y: 0 } }), 3000);
    }
  };

  // Click stars
  const handleStarClick = (id: number) => {
    if (currentQuestType !== "click") return;
    const updated = clickTargets.map(t => t.id === id ? { ...t, clicked: true } : t);
    setClickTargets(updated);
    if (updated.every(t => t.clicked)) triggerSuccess();
  };

  // Double click handler
  const handleIconDoubleClick = (app: OpenApp, questTypes: QuestType[]) => {
    const now = Date.now();
    if (now - lastClickTime < 500) {
      if (questTypes.includes(currentQuestType)) {
        if (currentQuestType === "double-click") {
          triggerSuccess();
        } else {
          setOpenApp(app);
          triggerSuccess();
        }
      } else {
        setOpenApp(app);
      }
    }
    setLastClickTime(now);
  };

  // Right click desktop
  const handleDesktopRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentQuestType === "right-click" || currentQuestType === "create-file") {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setContextMenuPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setContextMenuOpen(true);
      setFileContextMenu(false);
      if (currentQuestType === "right-click") triggerSuccess();
    }
  };

  // File right-click for delete
  const handleFileRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentQuestType === "delete-file" && selectedFile) {
      const rect = (e.currentTarget.closest('.desktop-area') as HTMLElement)?.getBoundingClientRect();
      if (rect) {
        setContextMenuPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }
      setFileContextMenu(true);
      setContextMenuOpen(false);
    }
  };

  const handleDeleteFile = () => {
    setFileToDelete(false);
    setFileContextMenu(false);
    if (currentQuestType === "delete-file") triggerSuccess();
  };

  const handleStartClick = () => {
    setStartMenuOpen(!startMenuOpen);
    setContextMenuOpen(false);
    setFileContextMenu(false);
    if (currentQuestType === "start-menu") triggerSuccess();
    if (currentQuestType === "shutdown") setShutdownStep(1);
  };

  const handleCreateFolder = () => {
    setNewFolderCreated(true);
    setContextMenuOpen(false);
    setSubMenuOpen(false);
    if (currentQuestType === "create-file") triggerSuccess();
  };

  const handleBrowserClick = () => {
    setOpenApp("edge");
    if (currentQuestType === "open-browser") triggerSuccess();
  };

  const handleShutdown = () => {
    if (currentQuestType === "shutdown") triggerSuccess();
  };

  // Drag handlers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (currentQuestType !== "drag-drop" || !dragFile) return;
    e.preventDefault();
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStartPos.current = { x: clientX - dragPos.x, y: clientY - dragPos.y };
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragPos({
      x: clientX - dragStartPos.current.x,
      y: clientY - dragStartPos.current.y,
    });
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // Check if dropped on folder using viewport coordinates
    if (dropZoneRef.current && dragFileRef.current) {
      const dropRect = dropZoneRef.current.getBoundingClientRect();
      const fileRect = dragFileRef.current.getBoundingClientRect();
      const fileCenterX = fileRect.left + fileRect.width / 2;
      const fileCenterY = fileRect.top + fileRect.height / 2;
      const tolerance = 60;
      if (
        fileCenterX > dropRect.left - tolerance && fileCenterX < dropRect.right + tolerance &&
        fileCenterY > dropRect.top - tolerance && fileCenterY < dropRect.bottom + tolerance
      ) {
        setDropSuccess(true);
        setDragFile(false);
        if (currentQuestType === "drag-drop") triggerSuccess();
        return;
      }
    }
  };

  const closeAll = () => {
    setContextMenuOpen(false);
    setFileContextMenu(false);
    setStartMenuOpen(false);
    setSubMenuOpen(false);
    setSelectedFile(false);
  };

  const isHighlighted = (target: string) => {
    const map: Record<string, QuestType[]> = {
      star: ["click"],
      mypc: ["double-click", "open-mypc"],
      desktop: ["right-click", "create-file"],
      start: ["start-menu", "shutdown"],
      file: ["delete-file"],
      edge: ["open-browser", "type-url"],
      hangul: ["open-hangul"],
      excel: ["open-excel"],
      ppt: ["open-ppt"],
    };
    return map[target]?.includes(currentQuestType) || false;
  };

  const fingerPos = FINGER_POSITIONS[currentQuestType];

  return (
    <div
      className="relative w-full h-full flex flex-col overflow-hidden select-none"
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onTouchMove={handleDragMove}
      onTouchEnd={handleDragEnd}
    >
      {/* Windows 11 Desktop Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a3a5c] via-[#1e5799] to-[#2989d8]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(125,185,232,0.3)_0%,_transparent_70%)]" />
      </div>

      {/* Instruction banner */}
      <motion.div
        key={instruction}
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-white/95 backdrop-blur-sm border border-blue-200 rounded-xl px-5 py-2.5 shadow-lg max-w-lg"
      >
        <p className="font-display text-sm md:text-base text-gray-800 text-center">
          💡 {instruction}
        </p>
      </motion.div>

      {/* Desktop area */}
      <div
        className="desktop-area flex-1 relative p-3 pt-14"
        onContextMenu={handleDesktopRightClick}
        onClick={(e) => { closeAll(); handleWrongClick(e); }}
      >
        {/* Desktop icons grid */}
        <div className="flex flex-col gap-1 items-start">
          <DesktopIcon
            icon={<Monitor className="w-7 h-7 text-blue-400" />}
            label="내 PC"
            highlight={isHighlighted("mypc")}
            onClick={(e) => { e.stopPropagation(); handleIconDoubleClick("mypc", ["double-click", "open-mypc"]); }}
          />
          <DesktopIcon
            icon={<Trash2 className="w-7 h-7 text-gray-300" />}
            label="휴지통"
            onClick={(e) => e.stopPropagation()}
          />
          <DesktopIcon
            icon={<HangulIcon className="w-8 h-8" />}
            label="한글"
            highlight={isHighlighted("hangul")}
            onClick={(e) => { e.stopPropagation(); handleIconDoubleClick("hangul", ["open-hangul"]); }}
          />
          <DesktopIcon
            icon={<ExcelIcon className="w-8 h-8" />}
            label="Excel"
            highlight={isHighlighted("excel")}
            onClick={(e) => { e.stopPropagation(); handleIconDoubleClick("excel", ["open-excel"]); }}
          />
          <DesktopIcon
            icon={<PptIcon className="w-8 h-8" />}
            label="PowerPoint"
            highlight={isHighlighted("ppt")}
            onClick={(e) => { e.stopPropagation(); handleIconDoubleClick("ppt", ["open-ppt"]); }}
          />

          {/* File to delete */}
          {currentQuestType === "delete-file" && fileToDelete && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <div
                className={`flex flex-col items-center gap-0.5 cursor-pointer p-2 rounded-md w-20 transition-colors ${
                  selectedFile ? "bg-blue-500/40" : ""
                } ${isHighlighted("file") ? "animate-pulse-highlight" : ""}`}
                onClick={(e) => { e.stopPropagation(); setSelectedFile(true); }}
                onContextMenu={handleFileRightClick}
              >
                <div className="w-10 h-10 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-blue-300" />
                </div>
                <span className="text-[10px] text-white text-center leading-tight drop-shadow-sm">삭제할 파일.txt</span>
              </div>
            </motion.div>
          )}

          {newFolderCreated && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <DesktopIcon
                icon={<Folder className="w-7 h-7 text-yellow-400" />}
                label="새 폴더"
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          )}
        </div>

        {/* Drag and drop zone */}
        {currentQuestType === "drag-drop" && (
          <>
            {/* Drop target folder */}
            <div
              ref={dropZoneRef}
              className={`absolute right-12 top-1/3 flex flex-col items-center gap-1 p-4 rounded-xl border-2 border-dashed transition-all ${
                dropSuccess
                  ? "border-green-400 bg-green-500/20"
                  : isDragging
                  ? "border-yellow-400 bg-yellow-400/10 animate-pulse-highlight"
                  : "border-white/40 bg-white/5"
              }`}
            >
              <Folder className={`w-12 h-12 ${dropSuccess ? "text-green-400" : "text-yellow-400"}`} />
              <span className="text-xs text-white font-display">
                {dropSuccess ? "성공! ✨" : "여기에 넣어주세요!"}
              </span>
            </div>

            {/* Draggable file */}
            {dragFile && (
              <div
                ref={dragFileRef}
                className={`absolute cursor-grab active:cursor-grabbing z-30 ${
                  isDragging ? "opacity-80 scale-110" : "animate-pulse-highlight"
                }`}
                style={{
                  left: 48 + dragPos.x,
                  top: 320 + dragPos.y,
                }}
                onMouseDown={handleDragStart}
                onTouchStart={handleDragStart}
                onClick={e => e.stopPropagation()}
              >
                <div className="flex flex-col items-center gap-0.5 p-2 rounded-md bg-blue-500/30 w-20">
                  <FileText className="w-8 h-8 text-blue-300" />
                  <span className="text-[10px] text-white text-center drop-shadow-sm">보고서.txt</span>
                </div>
              </div>
            )}
          </>
        )}

        {/* Click targets (stars) */}
        {currentQuestType === "click" && clickTargets.map(target => (
          <motion.div
            key={target.id}
            className="absolute cursor-pointer"
            style={{ left: `${target.x}%`, top: `${target.y}%` }}
            animate={target.clicked ? { scale: 0, opacity: 0 } : { scale: [1, 1.15, 1] }}
            transition={target.clicked ? { duration: 0.3 } : { repeat: Infinity, duration: 1.5 }}
            onClick={(e) => { e.stopPropagation(); handleStarClick(target.id); }}
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
              target.clicked ? "bg-green-400" : "bg-yellow-400/90 animate-pulse-highlight"
            }`}>
              <StarIcon className="w-8 h-8 text-white fill-current" />
            </div>
          </motion.div>
        ))}

        {/* Finger guide */}
        {fingerPos && (
          <FingerGuide
            visible={showFingerGuide && !showSuccess}
            x={fingerPos.x}
            y={fingerPos.y}
            label={fingerPos.label}
          />
        )}

        {/* Wrong click hint */}
        <WrongClickHint
          visible={wrongHint.visible}
          message={WRONG_CLICK_HINTS[currentQuestType] || ""}
          position={wrongHint.pos}
        />

        {/* Desktop context menu */}
        <AnimatePresence>
          {contextMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute bg-white/95 backdrop-blur-md rounded-lg border border-gray-200 shadow-xl py-1 min-w-[220px] z-40"
              style={{ left: contextMenuPos.x, top: contextMenuPos.y }}
              onClick={(e) => e.stopPropagation()}
            >
              <CtxItem icon="👁️" label="보기" />
              <CtxItem icon="↕️" label="정렬 기준" />
              <CtxItem icon="🔄" label="새로 고침" />
              <div className="border-t border-gray-100 my-0.5" />
              <div className="relative" onMouseEnter={() => setSubMenuOpen(true)} onMouseLeave={() => setSubMenuOpen(false)}>
                <button className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-blue-50 ${
                  currentQuestType === "create-file" ? "bg-blue-50 text-blue-600 font-bold" : "text-gray-700"
                }`}>
                  <span>📁 새로 만들기</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
                <AnimatePresence>
                  {subMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -5 }}
                      className="absolute left-full top-0 bg-white/95 backdrop-blur-md rounded-lg border border-gray-200 shadow-xl py-1 min-w-[160px]"
                    >
                      <button
                        onClick={handleCreateFolder}
                        className={`w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 ${
                          currentQuestType === "create-file" ? "bg-yellow-50 text-blue-600 font-bold animate-pulse-highlight" : "text-gray-700"
                        }`}
                      >📂 폴더</button>
                      <button className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-blue-50">📄 텍스트 문서</button>
                      <button className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-blue-50">📋 바로 가기</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="border-t border-gray-100 my-0.5" />
              <CtxItem icon="🖥️" label="디스플레이 설정" />
              <CtxItem icon="🎨" label="개인 설정" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* File context menu */}
        <AnimatePresence>
          {fileContextMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute bg-white/95 backdrop-blur-md rounded-lg border border-gray-200 shadow-xl py-1 min-w-[180px] z-40"
              style={{ left: contextMenuPos.x, top: contextMenuPos.y }}
              onClick={(e) => e.stopPropagation()}
            >
              <CtxItem icon="📋" label="복사" />
              <CtxItem icon="✂️" label="잘라내기" />
              <CtxItem icon="✏️" label="이름 바꾸기" />
              <div className="border-t border-gray-100 my-0.5" />
              <button
                onClick={handleDeleteFile}
                className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-red-50 text-red-600 font-bold bg-red-50 animate-pulse-highlight"
              >
                <Trash2 className="w-3 h-3" /> 삭제
              </button>
              <div className="border-t border-gray-100 my-0.5" />
              <CtxItem icon="📋" label="속성" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* App windows */}
        <AnimatePresence>
          {openApp === "mypc" && <MyPcWindow onClose={() => setOpenApp(null)} />}
          {openApp === "edge" && (
            <EdgeWindow onClose={() => setOpenApp(null)} currentQuestType={currentQuestType} onQuestComplete={triggerSuccess} />
          )}
          {openApp === "hangul" && (
            <HangulWindow onClose={() => setOpenApp(null)} currentQuestType={currentQuestType} onQuestComplete={triggerSuccess} />
          )}
          {openApp === "excel" && (
            <ExcelWindow onClose={() => setOpenApp(null)} currentQuestType={currentQuestType} onQuestComplete={triggerSuccess} />
          )}
          {openApp === "ppt" && (
            <PowerPointWindow onClose={() => setOpenApp(null)} currentQuestType={currentQuestType} onQuestComplete={triggerSuccess} />
          )}
        </AnimatePresence>
      </div>

      {/* Start Menu */}
      <AnimatePresence>
        {startMenuOpen && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xl rounded-xl border border-gray-200 shadow-2xl w-80 md:w-96 p-5 z-40"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 mb-4">
              <Search className="w-4 h-4 text-gray-400" />
              <input placeholder="앱, 설정 및 문서 검색" className="w-full bg-transparent text-xs outline-none text-gray-700 placeholder:text-gray-400" />
            </div>
            <p className="text-xs font-medium text-gray-600 mb-2">고정됨</p>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[
                { icon: <EdgeIcon className="w-6 h-6" />, label: "Edge" },
                { icon: <HangulIcon className="w-6 h-6" />, label: "한글" },
                { icon: <ExcelIcon className="w-6 h-6" />, label: "Excel" },
                { icon: <PptIcon className="w-6 h-6" />, label: "PowerPoint" },
                { icon: <FolderOpen className="w-6 h-6 text-yellow-500" />, label: "파일 탐색기" },
                { icon: <Monitor className="w-6 h-6 text-blue-500" />, label: "설정" },
                { icon: <FileText className="w-6 h-6 text-blue-400" />, label: "메모장" },
                { icon: <Folder className="w-6 h-6 text-yellow-500" />, label: "문서" },
              ].map((app) => (
                <button key={app.label} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  {app.icon}
                  <span className="text-[10px] text-gray-600">{app.label}</span>
                </button>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">나</span>
                </div>
                <span className="text-xs text-gray-700">학생</span>
              </div>
              <button
                onClick={() => setShutdownStep(2)}
                className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                  currentQuestType === "shutdown" ? "animate-pulse-highlight bg-red-50" : ""
                }`}
              >
                <Power className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <AnimatePresence>
              {shutdownStep >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute bottom-full right-4 mb-2 bg-white rounded-lg border border-gray-200 shadow-xl py-1 min-w-[150px]"
                >
                  <button className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-100">😴 절전</button>
                  <button
                    onClick={handleShutdown}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-red-50 ${
                      currentQuestType === "shutdown" ? "bg-red-50 font-bold text-red-600 animate-pulse-highlight" : "text-gray-700"
                    }`}
                  >🔴 시스템 종료</button>
                  <button className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-100">🔄 다시 시작</button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Taskbar */}
      <div className="h-12 bg-gray-900/80 backdrop-blur-xl flex items-center justify-center px-3 z-50 border-t border-white/10">
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); handleStartClick(); }}
            className={`p-2 rounded-md hover:bg-white/10 transition-colors ${isHighlighted("start") ? "animate-pulse-highlight" : ""}`}
          >
            <svg width="20" height="20" viewBox="0 0 20 20">
              <rect x="1" y="1" width="8" height="8" rx="1.5" fill="#4FC3F7" />
              <rect x="11" y="1" width="8" height="8" rx="1.5" fill="#4FC3F7" opacity="0.7" />
              <rect x="1" y="11" width="8" height="8" rx="1.5" fill="#4FC3F7" opacity="0.7" />
              <rect x="11" y="11" width="8" height="8" rx="1.5" fill="#4FC3F7" opacity="0.5" />
            </svg>
          </button>
          <button className="p-2 rounded-md hover:bg-white/10 transition-colors">
            <Search className="w-5 h-5 text-white/70" />
          </button>
          <button className="p-2 rounded-md hover:bg-white/10 transition-colors">
            <FolderOpen className="w-5 h-5 text-yellow-400" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleBrowserClick(); }}
            className={`p-2 rounded-md hover:bg-white/10 transition-colors ${isHighlighted("edge") ? "animate-pulse-highlight" : ""}`}
          >
            <EdgeIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="absolute right-3 flex items-center gap-2 text-white/60 text-xs">
          <span>🔊</span>
          <span>🌐</span>
          <span>🔋</span>
          <span className="ml-1 text-[10px]">오후 2:30</span>
        </div>
      </div>

      {/* Success overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-green-500/20 backdrop-blur-sm flex items-center justify-center z-[100]"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", damping: 10 }}
              className="bg-white rounded-2xl p-8 shadow-2xl text-center"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: 2, duration: 0.3 }}
                className="text-5xl mb-3"
              >
                🎉
              </motion.div>
              <p className="font-display text-2xl text-green-600">미션 성공!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DesktopIcon = ({
  icon, label, highlight, onClick,
}: {
  icon: React.ReactNode; label: string; highlight?: boolean; onClick: (e: React.MouseEvent) => void;
}) => (
  <div
    className={`flex flex-col items-center gap-0.5 cursor-pointer p-2 rounded-md w-20 hover:bg-white/10 transition-colors ${
      highlight ? "animate-pulse-highlight" : ""
    }`}
    onClick={onClick}
  >
    <div className="w-10 h-10 flex items-center justify-center">{icon}</div>
    <span className="text-[10px] text-white text-center leading-tight drop-shadow-sm">{label}</span>
  </div>
);

const CtxItem = ({ icon, label }: { icon: string; label: string }) => (
  <button className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 text-gray-700 hover:bg-blue-50 transition-colors">
    <span>{icon}</span> {label}
  </button>
);

export default WinDesktop;
