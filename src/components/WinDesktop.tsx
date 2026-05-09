import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderOpen, Trash2, Star as StarIcon,
  ChevronRight, Power, Search,
  FileText, Folder, Square, ChevronDown, Monitor, Calendar as CalendarIcon
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
import desktopMypcImg from "@/assets/desktop-mypc.png";
import desktopTrashImg from "@/assets/desktop-trash.png";
import desktopExcelImg from "@/assets/desktop-excel.png";
import desktopPptImg from "@/assets/desktop-ppt.png";
import desktopHangulImg from "@/assets/desktop-hangul.png";

interface WinDesktopProps {
  currentQuestType: QuestType;
  onQuestComplete: () => void;
  instruction: string;
}

type OpenApp = "mypc" | "edge" | "hangul" | "excel" | "ppt" | null;

const QUEST_APP_MAP: Partial<Record<QuestType, OpenApp>> = {
  "close-mypc": "mypc",
  "close-edge": "edge",
  "hangul-typing": "hangul",
  "hangul-font-size": "hangul",
  "hangul-font-family": "hangul",
  "hangul-image": "hangul",
  "hangul-image-resize": "hangul",
  "hangul-table": "hangul",
  "hangul-save": "hangul",
  "hangul-open-file": "hangul",
  "excel-input": "excel",
  "type-url": "edge",
  "ppt-text": "ppt",
  "ppt-font-size": "ppt",
  "ppt-font-family": "ppt",
  "ppt-image": "ppt",
  "ppt-image-resize": "ppt",
};

// App-internal quests where finger guide should NOT show
const APP_INTERNAL_QUESTS: QuestType[] = [
  "hangul-typing", "hangul-font-size", "hangul-font-family", "hangul-image", "hangul-image-resize",
  "hangul-table", "hangul-save", "hangul-open-file",
  "excel-input",
  "ppt-text", "ppt-font-size", "ppt-font-family", "ppt-image", "ppt-image-resize",
  "type-url",
];

// Finger positions are anchored to the actual clickable center of each target.
const DESKTOP_ICON_X = "52px";
const DESKTOP_ICON_START_Y = 84;
const DESKTOP_ICON_STEP = 74;
const WINDOW_CLOSE_POS = { x: "calc(100% - 44px)", y: "80px" };
const TASKBAR_CENTER_Y = "calc(100% - 24px)";
const TASKBAR_START_X = "calc(50% - 60px)";
const TASKBAR_EDGE_X = "calc(50% + 60px)";

const desktopIconFinger = (row: number, label = "더블클릭!", delay = 2000) => ({
  x: DESKTOP_ICON_X,
  y: `${DESKTOP_ICON_START_Y + row * DESKTOP_ICON_STEP}px`,
  label,
  delay,
});

const FINGER_POSITIONS: Partial<Record<QuestType, { x: string; y: string; label: string; delay: number }>> = {
  "double-click": desktopIconFinger(0, "더블클릭!", 3000),
  "right-click": { x: "50%", y: "50%", label: "오른쪽 버튼!", delay: 3000 },
  "open-mypc": desktopIconFinger(0),
  "close-mypc": { ...WINDOW_CLOSE_POS, label: "X를 눌러 닫기!", delay: 2000 },
  "close-edge": { ...WINDOW_CLOSE_POS, label: "X를 눌러 닫기!", delay: 2000 },
  "drag-drop": { x: "88px", y: "344px", label: "이 파일을 끌어요!", delay: 3000 },
  "open-hangul": desktopIconFinger(2),
  "open-excel": desktopIconFinger(3),
  "open-ppt": desktopIconFinger(4),
};

const TASKBAR_FINGER_POSITIONS: Partial<Record<QuestType, { x: string; y: string; label: string; delay: number }>> = {
  "start-menu": { x: TASKBAR_START_X, y: TASKBAR_CENTER_Y, label: "시작 버튼!", delay: 2000 },
  "open-browser": { x: TASKBAR_EDGE_X, y: TASKBAR_CENTER_Y, label: "Edge!", delay: 2000 },
};

// Real-time Korean clock
function useKoreanClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const kr = new Intl.DateTimeFormat("ko-KR", {
        timeZone: "Asia/Seoul",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(now);
      const date = new Intl.DateTimeFormat("ko-KR", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(now);
      setTime(`${kr}\n${date}`);
    };
    update();
    const id = setInterval(update, 10000);
    return () => clearInterval(id);
  }, []);
  return time;
}

const WinDesktop = ({ currentQuestType, onQuestComplete, instruction }: WinDesktopProps) => {
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const [openApp, setOpenApp] = useState<OpenApp>(
    QUEST_APP_MAP[currentQuestType] ?? null
  );
  const [minimizedApp, setMinimizedApp] = useState<OpenApp>(null);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
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
  const isCompleting = useRef(false);

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
    visible: false, pos: { x: 0, y: 0 },
  });
  const wrongClickCount = useRef(0);
  const [intensifyHighlight, setIntensifyHighlight] = useState(false);

  // Long-press for mobile right-click
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressPos = useRef({ x: 0, y: 0 });

  const koreanTime = useKoreanClock();

  // Auto-open app for continuation quests & reset state on quest change
  useEffect(() => {
    const neededApp = QUEST_APP_MAP[currentQuestType];
    if (neededApp && openApp !== neededApp) {
      setOpenApp(neededApp);
    }
    // Reset quest-specific states
    isCompleting.current = false;
    setShowSuccess(false);
    if (currentQuestType === "click") {
      setClickTargets([
        { id: 1, x: 35, y: 25, clicked: false },
        { id: 2, x: 55, y: 40, clicked: false },
        { id: 3, x: 70, y: 20, clicked: false },
      ]);
    }
    if (currentQuestType === "drag-drop") {
      setDragFile(true);
      setDragPos({ x: 0, y: 0 });
      setDropSuccess(false);
    }
    if (currentQuestType === "delete-file") {
      setFileToDelete(true);
      setSelectedFile(false);
    }
    if (currentQuestType === "create-file") {
      setNewFolderCreated(false);
    }
  }, [currentQuestType]);

  // Show finger guide after delay
  useEffect(() => {
    setShowFingerGuide(false);
    wrongClickCount.current = 0;
    if (APP_INTERNAL_QUESTS.includes(currentQuestType)) return;
    if (currentQuestType === "click") {
      const timer = setTimeout(() => setShowFingerGuide(true), 3000);
      return () => clearTimeout(timer);
    }
    const fp = FINGER_POSITIONS[currentQuestType] || TASKBAR_FINGER_POSITIONS[currentQuestType];
    if (fp) {
      const timer = setTimeout(() => setShowFingerGuide(true), fp.delay);
      return () => clearTimeout(timer);
    }
  }, [currentQuestType]);

  const triggerSuccess = useCallback(() => {
    if (isCompleting.current) return;
    isCompleting.current = true;
    setShowSuccess(true);
    setShowFingerGuide(false);
    setTimeout(() => {
      setShowSuccess(false);
      isCompleting.current = false;
      onQuestComplete();
    }, 1200);
  }, [onQuestComplete]);

  const handleCloseApp = useCallback((app: OpenApp) => {
    setOpenApp(null);
    if (app === "mypc" && currentQuestType === "close-mypc") triggerSuccess();
    if (app === "edge" && currentQuestType === "close-edge") triggerSuccess();
  }, [currentQuestType, triggerSuccess]);

  const handleWrongClick = (e: React.MouseEvent) => {
    wrongClickCount.current += 1;
    if (wrongClickCount.current >= 2) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setWrongHint({
        visible: true,
        pos: { x: e.clientX - rect.left, y: e.clientY - rect.top },
      });
      setTimeout(() => setWrongHint({ visible: false, pos: { x: 0, y: 0 } }), 3000);
      setIntensifyHighlight(true);
      setTimeout(() => setIntensifyHighlight(false), 4000);
    }
  };

  const handleStarClick = (id: number) => {
    if (currentQuestType !== "click") return;
    const updated = clickTargets.map(t => t.id === id ? { ...t, clicked: true } : t);
    setClickTargets(updated);
    if (updated.every(t => t.clicked)) triggerSuccess();
  };

  const handleIconDoubleClick = (app: OpenApp, questTypes: QuestType[]) => {
    if (isCompleting.current) return;
    const now = Date.now();
    if (now - lastClickTime < 600) {
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

  const openContextMenu = (x: number, y: number, fromDesktop: boolean) => {
    if (fromDesktop && (currentQuestType === "right-click" || currentQuestType === "create-file")) {
      setContextMenuPos({ x, y });
      setContextMenuOpen(true);
      setFileContextMenu(false);
      if (currentQuestType === "right-click") triggerSuccess();
    }
  };

  const handleDesktopRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    openContextMenu(e.clientX - rect.left, e.clientY - rect.top, true);
  };

  // Long-press touch handlers for mobile right-click
  const handleDesktopTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    longPressPos.current = { x: touch.clientX, y: touch.clientY };
    longPressTimer.current = setTimeout(() => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      openContextMenu(
        touch.clientX - rect.left,
        touch.clientY - rect.top,
        true
      );
    }, 600);
  };

  const handleDesktopTouchMove = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleDesktopTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

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

  // Long-press on file for mobile
  const fileLongPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleFileTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    setSelectedFile(true);
    const touch = e.touches[0];
    fileLongPressTimer.current = setTimeout(() => {
      if (currentQuestType === "delete-file" && selectedFile) {
        const rect = (e.currentTarget.closest('.desktop-area') as HTMLElement)?.getBoundingClientRect();
        if (rect) {
          setContextMenuPos({ x: touch.clientX - rect.left, y: touch.clientY - rect.top });
        }
        setFileContextMenu(true);
        setContextMenuOpen(false);
      }
    }, 600);
  };
  const handleFileTouchEnd = () => {
    if (fileLongPressTimer.current) {
      clearTimeout(fileLongPressTimer.current);
      fileLongPressTimer.current = null;
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
    setSelectedIcon(null);
    setCalendarOpen(false);
  };

  const handleDesktopClick = (e: React.MouseEvent) => {
    closeAll();
    handleWrongClick(e);
  };

  const handleMinimize = (app: OpenApp) => {
    setMinimizedApp(app);
    setOpenApp(null);
  };

  const handleRestore = (app: OpenApp) => {
    setOpenApp(app);
    setMinimizedApp(null);
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

  const fingerPos = currentQuestType === "click"
    ? (() => {
        const nextStar = clickTargets.find(t => !t.clicked);
        return nextStar
          ? { x: `calc(${nextStar.x}% + 28px)`, y: `calc(${nextStar.y}% + 28px)`, label: "여기를 클릭!", delay: 3000 }
          : null;
      })()
    : FINGER_POSITIONS[currentQuestType] ?? null;
  const taskbarFingerPos = TASKBAR_FINGER_POSITIONS[currentQuestType] ?? null;
  const showFinger = showFingerGuide && !showSuccess && !APP_INTERNAL_QUESTS.includes(currentQuestType);

  return (
    <div
      className="relative w-full h-full flex flex-col overflow-hidden select-none"
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onTouchMove={handleDragMove}
      onTouchEnd={handleDragEnd}
    >
      {/* Windows 11 Desktop Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(210,50%,25%)] via-[hsl(213,60%,40%)] to-[hsl(210,70%,50%)]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(125,185,232,0.3)_0%,_transparent_70%)]" />
      </div>

      {/* Instruction banner */}
      <motion.div
        key={instruction}
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
      >
        <div className="bg-[hsl(213,50%,30%)]/95 backdrop-blur-sm rounded-b-2xl px-6 py-3 shadow-lg pointer-events-auto max-w-[90%]">
          <p className="font-display text-sm md:text-base text-white text-center whitespace-nowrap">
            💡 {instruction}
          </p>
        </div>
      </motion.div>

      {/* Desktop area */}
      <div
        className="desktop-area flex-1 relative p-3 pt-14"
        onContextMenu={handleDesktopRightClick}
        onTouchStart={handleDesktopTouchStart}
        onTouchMove={handleDesktopTouchMove}
        onTouchEnd={handleDesktopTouchEnd}
        onClick={handleDesktopClick}
      >
        {/* Desktop icons grid */}
        <div className="flex flex-col gap-1 items-start">
          <DesktopIcon
            id="mypc"
            selected={selectedIcon === "mypc"}
            onSelect={setSelectedIcon}
            icon={<img src={desktopMypcImg} alt="내 PC" className="w-10 h-10 object-contain" />}
            label="내 PC"
            highlight={isHighlighted("mypc")}
            intense={intensifyHighlight && isHighlighted("mypc")}
            onClick={(e) => { e.stopPropagation(); handleIconDoubleClick("mypc", ["double-click", "open-mypc"]); }}
          />
          <DesktopIcon
            id="trash"
            selected={selectedIcon === "trash"}
            onSelect={setSelectedIcon}
            icon={<img src={desktopTrashImg} alt="휴지통" className="w-10 h-10 object-contain" />}
            label="휴지통"
            onClick={(e) => e.stopPropagation()}
          />
          <DesktopIcon
            id="hangul"
            selected={selectedIcon === "hangul"}
            onSelect={setSelectedIcon}
            icon={<img src={desktopHangulImg} alt="한글" className="w-10 h-10 object-contain" />}
            label="한글 2024"
            highlight={isHighlighted("hangul")}
            intense={intensifyHighlight && isHighlighted("hangul")}
            onClick={(e) => { e.stopPropagation(); handleIconDoubleClick("hangul", ["open-hangul"]); }}
          />
          <DesktopIcon
            id="excel"
            selected={selectedIcon === "excel"}
            onSelect={setSelectedIcon}
            icon={<img src={desktopExcelImg} alt="Excel" className="w-10 h-10 object-contain" />}
            label="Excel"
            highlight={isHighlighted("excel")}
            intense={intensifyHighlight && isHighlighted("excel")}
            onClick={(e) => { e.stopPropagation(); handleIconDoubleClick("excel", ["open-excel"]); }}
          />
          <DesktopIcon
            id="ppt"
            selected={selectedIcon === "ppt"}
            onSelect={setSelectedIcon}
            icon={<img src={desktopPptImg} alt="PowerPoint" className="w-10 h-10 object-contain" />}
            label="PowerPoint"
            highlight={isHighlighted("ppt")}
            intense={intensifyHighlight && isHighlighted("ppt")}
            onClick={(e) => { e.stopPropagation(); handleIconDoubleClick("ppt", ["open-ppt"]); }}
          />

          {currentQuestType === "delete-file" && fileToDelete && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <div
                className={`flex flex-col items-center gap-0.5 cursor-pointer p-2 rounded-md w-20 transition-colors ${
                  selectedFile ? "bg-blue-500/40" : ""
                } ${isHighlighted("file") ? "animate-pulse-highlight" : ""}`}
                onClick={(e) => { e.stopPropagation(); setSelectedFile(true); }}
                onContextMenu={handleFileRightClick}
                onTouchStart={handleFileTouchStart}
                onTouchEnd={handleFileTouchEnd}
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

            {dragFile && (
              <div
                ref={dragFileRef}
                className={`absolute cursor-grab active:cursor-grabbing z-30 ${
                  isDragging ? "opacity-80 scale-110" : "animate-pulse-highlight"
                }`}
                style={{ left: 48 + dragPos.x, top: 320 + dragPos.y }}
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
              target.clicked
                ? "bg-green-400"
                : intensifyHighlight
                ? "bg-yellow-400 animate-target-glow"
                : "bg-yellow-400/90 animate-pulse-highlight"
            }`}>
              <StarIcon className="w-8 h-8 text-white fill-current" />
            </div>
          </motion.div>
        ))}

        {/* Finger guide */}
        {fingerPos && (
          <FingerGuide
            visible={showFinger}
            x={fingerPos.x}
            y={fingerPos.y}
            label={fingerPos.label}
          />
        )}

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
              <div className="relative" onMouseEnter={() => setSubMenuOpen(true)} onMouseLeave={() => setSubMenuOpen(false)}
                onClick={() => setSubMenuOpen(true)}>
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
          {openApp === "mypc" && <MyPcWindow onClose={() => handleCloseApp("mypc")} onMinimize={() => handleMinimize("mypc")} />}
          {openApp === "edge" && (
            <EdgeWindow onClose={() => handleCloseApp("edge")} onMinimize={() => handleMinimize("edge")} currentQuestType={currentQuestType} onQuestComplete={triggerSuccess} />
          )}
          {openApp === "hangul" && (
            <HangulWindow onClose={() => handleCloseApp("hangul")} onMinimize={() => handleMinimize("hangul")} currentQuestType={currentQuestType} onQuestComplete={triggerSuccess} />
          )}
          {openApp === "excel" && (
            <ExcelWindow onClose={() => handleCloseApp("excel")} onMinimize={() => handleMinimize("excel")} currentQuestType={currentQuestType} onQuestComplete={triggerSuccess} />
          )}
          {openApp === "ppt" && (
            <PowerPointWindow onClose={() => handleCloseApp("ppt")} onMinimize={() => handleMinimize("ppt")} currentQuestType={currentQuestType} onQuestComplete={triggerSuccess} />
          )}
        </AnimatePresence>
      </div>

      {/* Start Menu */}
      <AnimatePresence>
        {startMenuOpen && (
          <>
          <div className="absolute inset-0 z-[39]" onClick={() => setStartMenuOpen(false)} />
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
          </>
        )}
      </AnimatePresence>

      {/* Taskbar finger guide (for start-menu, open-browser) */}
      {taskbarFingerPos && (
        <div className="absolute inset-0 pointer-events-none z-[90]">
          <FingerGuide
            visible={showFinger}
            x={taskbarFingerPos.x}
            y={taskbarFingerPos.y}
            label={taskbarFingerPos.label}
          />
        </div>
      )}

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
          {/* Minimized app chip */}
          {minimizedApp && (
            <button
              onClick={(e) => { e.stopPropagation(); handleRestore(minimizedApp); }}
              className="ml-2 px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white/90 text-[11px] font-display border-b-2 border-blue-400 transition-colors"
              title="창 복원"
            >
              {minimizedApp === "mypc" && "🖥️ 내 PC"}
              {minimizedApp === "edge" && "🌐 Edge"}
              {minimizedApp === "hangul" && "📝 한글"}
              {minimizedApp === "excel" && "📊 Excel"}
              {minimizedApp === "ppt" && "📽️ PPT"}
            </button>
          )}
        </div>
        <div className="absolute right-3 flex items-center gap-2 text-white/60 text-xs">
          <span>🔊</span>
          <span>🌐</span>
          <span>🔋</span>
          <button
            onClick={(e) => { e.stopPropagation(); setCalendarOpen(o => !o); }}
            className="ml-1 text-[10px] text-right whitespace-pre-line leading-tight hover:bg-white/10 rounded px-1.5 py-0.5 transition-colors text-white/80"
          >
            {koreanTime}
          </button>
        </div>

        {/* Calendar popup */}
        <AnimatePresence>
          {calendarOpen && (
            <>
              <div className="fixed inset-0 z-[55]" onClick={() => setCalendarOpen(false)} />
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 10, opacity: 0 }}
                className="absolute right-2 bottom-14 z-[56] bg-white/95 backdrop-blur-xl rounded-xl border border-gray-200 shadow-2xl p-4 w-72"
                onClick={(e) => e.stopPropagation()}
              >
                <CalendarPopup />
              </motion.div>
            </>
          )}
        </AnimatePresence>
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
  icon, label, highlight, intense, onClick, id, selected, onSelect,
}: {
  icon: React.ReactNode; label: string; highlight?: boolean; intense?: boolean;
  onClick: (e: React.MouseEvent) => void;
  id?: string; selected?: boolean; onSelect?: (id: string | null) => void;
}) => (
  <div
    className={`flex flex-col items-center gap-0.5 cursor-pointer p-2 rounded-md w-20 transition-colors ${
      selected ? "bg-blue-500/40 ring-1 ring-blue-300/70" : "hover:bg-white/10"
    } ${intense ? "animate-target-glow" : highlight ? "animate-pulse-highlight" : ""}`}
    onClick={(e) => {
      if (id && onSelect) onSelect(id);
      onClick(e);
    }}
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

const CalendarPopup = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const todayDate = today.getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div>
      <div className="text-center mb-3">
        <p className="text-[11px] text-gray-500">{year}년</p>
        <p className="font-display text-base text-gray-800">
          {today.toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "long" })}
        </p>
      </div>
      <div className="text-xs font-display text-gray-700 mb-2 flex items-center justify-between">
        <span>{year}년 {month + 1}월</span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-[10px] text-center">
        {weekdays.map((w, i) => (
          <div key={w} className={`py-1 font-bold ${i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-gray-500"}`}>{w}</div>
        ))}
        {cells.map((d, i) => (
          <div
            key={i}
            className={`py-1.5 rounded ${
              d === todayDate
                ? "bg-blue-500 text-white font-bold"
                : d == null
                ? ""
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {d ?? ""}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WinDesktop;
