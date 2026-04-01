import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Monitor, FolderOpen, Trash2, Globe, Star as StarIcon,
  X, Minus, Square, ChevronRight, Power, Search,
  FileText, Folder, HardDrive, ChevronDown
} from "lucide-react";
import type { QuestType } from "@/types/quest";

interface WinDesktopProps {
  currentQuestType: QuestType;
  onQuestComplete: () => void;
  instruction: string;
}

const WinDesktop = ({ currentQuestType, onQuestComplete, instruction }: WinDesktopProps) => {
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const [myPcOpen, setMyPcOpen] = useState(false);
  const [browserOpen, setBrowserOpen] = useState(false);
  const [clickTargets, setClickTargets] = useState([
    { id: 1, x: 30, y: 25, clicked: false },
    { id: 2, x: 55, y: 40, clicked: false },
    { id: 3, x: 70, y: 20, clicked: false },
  ]);
  const [newFolderCreated, setNewFolderCreated] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(true);
  const [subMenuOpen, setSubMenuOpen] = useState(false);
  const [urlTyped, setUrlTyped] = useState("");
  const [urlSubmitted, setUrlSubmitted] = useState(false);
  const [shutdownStep, setShutdownStep] = useState(0); // 0: none, 1: start clicked, 2: power menu
  const [doubleClickCount, setDoubleClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const triggerSuccess = useCallback(() => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onQuestComplete();
    }, 1200);
  }, [onQuestComplete]);

  // Quest: Click stars
  const handleStarClick = (id: number) => {
    if (currentQuestType !== "click") return;
    const updated = clickTargets.map(t => t.id === id ? { ...t, clicked: true } : t);
    setClickTargets(updated);
    if (updated.every(t => t.clicked)) {
      triggerSuccess();
    }
  };

  // Quest: Double click on My PC icon
  const handleMyPcDoubleClick = () => {
    const now = Date.now();
    if (now - lastClickTime < 500) {
      setDoubleClickCount(prev => prev + 1);
      if (currentQuestType === "double-click") {
        triggerSuccess();
      } else if (currentQuestType === "open-mypc") {
        setMyPcOpen(true);
        triggerSuccess();
      }
    }
    setLastClickTime(now);
  };

  // Quest: Right click
  const handleDesktopRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentQuestType === "right-click" || currentQuestType === "create-file") {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setContextMenuPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setContextMenuOpen(true);
      if (currentQuestType === "right-click") {
        triggerSuccess();
      }
    }
  };

  // Quest: Start menu
  const handleStartClick = () => {
    setStartMenuOpen(!startMenuOpen);
    setContextMenuOpen(false);
    if (currentQuestType === "start-menu") {
      triggerSuccess();
    }
    if (currentQuestType === "shutdown") {
      setShutdownStep(1);
    }
  };

  // Quest: Create folder
  const handleCreateFolder = () => {
    setNewFolderCreated(true);
    setContextMenuOpen(false);
    setSubMenuOpen(false);
    if (currentQuestType === "create-file") {
      triggerSuccess();
    }
  };

  // Quest: Delete file
  const handleDeleteFile = () => {
    setFileToDelete(false);
    if (currentQuestType === "delete-file") {
      triggerSuccess();
    }
  };

  // Quest: Open browser
  const handleBrowserClick = () => {
    setBrowserOpen(true);
    if (currentQuestType === "open-browser") {
      triggerSuccess();
    }
  };

  // Quest: Type URL
  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlTyped.length > 3) {
      setUrlSubmitted(true);
      if (currentQuestType === "type-url") {
        triggerSuccess();
      }
    }
  };

  // Quest: Shutdown
  const handleShutdown = () => {
    if (currentQuestType === "shutdown") {
      triggerSuccess();
    }
  };

  const isHighlighted = (target: string) => {
    const map: Record<string, QuestType[]> = {
      star: ["click"],
      mypc: ["double-click", "open-mypc"],
      desktop: ["right-click", "create-file"],
      start: ["start-menu", "shutdown"],
      file: ["delete-file"],
      chrome: ["open-browser"],
      urlbar: ["type-url"],
    };
    return map[target]?.includes(currentQuestType) || false;
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-win-desktop overflow-hidden select-none">
      {/* Instruction banner */}
      <motion.div
        key={instruction}
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-card/95 backdrop-blur-sm border-2 border-secondary rounded-2xl px-6 py-3 shadow-quest max-w-md"
      >
        <p className="font-display text-sm md:text-base text-foreground text-center">
          💡 {instruction}
        </p>
      </motion.div>

      {/* Desktop area */}
      <div
        className="flex-1 relative p-4 pt-16"
        onContextMenu={handleDesktopRightClick}
        onClick={() => { setContextMenuOpen(false); setStartMenuOpen(false); setSubMenuOpen(false); }}
      >
        {/* Desktop icons */}
        <div className="flex flex-col gap-4 items-start">
          {/* My PC */}
          <div
            className={`flex flex-col items-center gap-1 cursor-pointer p-2 rounded-lg hover:bg-primary/10 transition-colors ${
              isHighlighted("mypc") ? "animate-pulse-highlight" : ""
            }`}
            onClick={(e) => { e.stopPropagation(); handleMyPcDoubleClick(); }}
          >
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
              <Monitor className="w-7 h-7 text-primary" />
            </div>
            <span className="text-xs font-body text-foreground font-medium bg-card/60 px-1 rounded">내 PC</span>
          </div>

          {/* Recycle Bin */}
          <div className="flex flex-col items-center gap-1 cursor-pointer p-2 rounded-lg hover:bg-primary/10 transition-colors">
            <div className="w-12 h-12 bg-muted/60 rounded-lg flex items-center justify-center">
              <Trash2 className="w-7 h-7 text-muted-foreground" />
            </div>
            <span className="text-xs font-body text-foreground font-medium bg-card/60 px-1 rounded">휴지통</span>
          </div>

          {/* File to delete */}
          {currentQuestType === "delete-file" && fileToDelete && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`flex flex-col items-center gap-1 cursor-pointer p-2 rounded-lg hover:bg-destructive/10 transition-colors ${
                isHighlighted("file") ? "animate-pulse-highlight" : ""
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteFile();
              }}
            >
              <div className="w-12 h-12 bg-destructive/20 rounded-lg flex items-center justify-center">
                <FileText className="w-7 h-7 text-destructive" />
              </div>
              <span className="text-xs font-body text-foreground font-medium bg-card/60 px-1 rounded">삭제할 파일</span>
            </motion.div>
          )}

          {/* New folder */}
          {newFolderCreated && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex flex-col items-center gap-1 p-2 rounded-lg"
            >
              <div className="w-12 h-12 bg-secondary/40 rounded-lg flex items-center justify-center">
                <Folder className="w-7 h-7 text-secondary-foreground" />
              </div>
              <span className="text-xs font-body text-foreground font-medium bg-card/60 px-1 rounded">새 폴더</span>
            </motion.div>
          )}
        </div>

        {/* Click targets (stars) */}
        {currentQuestType === "click" && clickTargets.map(target => (
          <motion.div
            key={target.id}
            className="absolute cursor-pointer"
            style={{ left: `${target.x}%`, top: `${target.y}%` }}
            animate={target.clicked ? { scale: 0, opacity: 0 } : { scale: [1, 1.2, 1] }}
            transition={target.clicked ? { duration: 0.3 } : { repeat: Infinity, duration: 1.5 }}
            onClick={(e) => { e.stopPropagation(); handleStarClick(target.id); }}
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
              target.clicked ? "bg-accent" : "bg-secondary animate-pulse-highlight"
            }`}>
              <StarIcon className={`w-8 h-8 ${target.clicked ? "text-accent-foreground" : "text-secondary-foreground"} fill-current`} />
            </div>
          </motion.div>
        ))}

        {/* Context menu */}
        <AnimatePresence>
          {contextMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute bg-card rounded-xl border border-border shadow-card py-2 min-w-[200px] z-40"
              style={{ left: contextMenuPos.x, top: contextMenuPos.y }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="w-full text-left px-4 py-2 text-sm font-body hover:bg-muted transition-colors flex items-center gap-2">
                <Square className="w-3 h-3" /> 보기
              </button>
              <button className="w-full text-left px-4 py-2 text-sm font-body hover:bg-muted transition-colors flex items-center gap-2">
                <ChevronDown className="w-3 h-3" /> 정렬 기준
              </button>
              <div className="border-t border-border my-1" />
              <div className="relative">
                <button
                  className={`w-full text-left px-4 py-2 text-sm font-body hover:bg-muted transition-colors flex items-center justify-between ${
                    currentQuestType === "create-file" ? "bg-secondary/30 text-primary font-bold" : ""
                  }`}
                  onMouseEnter={() => setSubMenuOpen(true)}
                >
                  <span>📁 새로 만들기</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
                <AnimatePresence>
                  {subMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="absolute left-full top-0 bg-card rounded-xl border border-border shadow-card py-2 min-w-[160px]"
                      onMouseLeave={() => setSubMenuOpen(false)}
                    >
                      <button
                        onClick={handleCreateFolder}
                        className={`w-full text-left px-4 py-2 text-sm font-body hover:bg-muted transition-colors ${
                          currentQuestType === "create-file" ? "bg-secondary/30 text-primary font-bold animate-pulse-highlight" : ""
                        }`}
                      >
                        📂 폴더
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm font-body hover:bg-muted transition-colors">
                        📄 텍스트 문서
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="border-t border-border my-1" />
              <button className="w-full text-left px-4 py-2 text-sm font-body hover:bg-muted transition-colors">
                🖥️ 디스플레이 설정
              </button>
              <button className="w-full text-left px-4 py-2 text-sm font-body hover:bg-muted transition-colors">
                🎨 개인 설정
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* My PC window */}
        <AnimatePresence>
          {myPcOpen && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="absolute inset-8 top-16 bg-win-window rounded-xl border border-border shadow-card flex flex-col overflow-hidden z-30"
            >
              {/* Title bar */}
              <div className="flex items-center justify-between px-4 py-2 bg-muted/50">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-primary" />
                  <span className="text-sm font-body font-medium">내 PC</span>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-1 hover:bg-muted rounded"><Minus className="w-3 h-3" /></button>
                  <button className="p-1 hover:bg-muted rounded"><Square className="w-3 h-3" /></button>
                  <button onClick={() => setMyPcOpen(false)} className="p-1 hover:bg-destructive/20 rounded"><X className="w-3 h-3" /></button>
                </div>
              </div>
              {/* Content */}
              <div className="flex-1 p-6 grid grid-cols-3 md:grid-cols-4 gap-6">
                <div className="flex flex-col items-center gap-2">
                  <HardDrive className="w-10 h-10 text-primary" />
                  <span className="text-xs font-body">로컬 디스크 (C:)</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <FolderOpen className="w-10 h-10 text-secondary-foreground" />
                  <span className="text-xs font-body">문서</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <FolderOpen className="w-10 h-10 text-secondary-foreground" />
                  <span className="text-xs font-body">다운로드</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <FolderOpen className="w-10 h-10 text-secondary-foreground" />
                  <span className="text-xs font-body">사진</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Browser window */}
        <AnimatePresence>
          {browserOpen && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="absolute inset-8 top-16 bg-win-window rounded-xl border border-border shadow-card flex flex-col overflow-hidden z-30"
            >
              <div className="flex items-center justify-between px-4 py-2 bg-muted/50">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" />
                  <span className="text-sm font-body font-medium">Chrome</span>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-1 hover:bg-muted rounded"><Minus className="w-3 h-3" /></button>
                  <button className="p-1 hover:bg-muted rounded"><Square className="w-3 h-3" /></button>
                  <button onClick={() => setBrowserOpen(false)} className="p-1 hover:bg-destructive/20 rounded"><X className="w-3 h-3" /></button>
                </div>
              </div>
              {/* Address bar */}
              <form onSubmit={handleUrlSubmit} className="px-4 py-2 border-b border-border flex items-center gap-2">
                <div className={`flex-1 flex items-center bg-muted rounded-full px-4 py-1.5 ${
                  isHighlighted("urlbar") ? "ring-2 ring-secondary animate-pulse-highlight" : ""
                }`}>
                  <Search className="w-3 h-3 text-muted-foreground mr-2" />
                  <input
                    type="text"
                    value={urlTyped}
                    onChange={(e) => setUrlTyped(e.target.value)}
                    placeholder="주소를 입력하세요 (예: www.google.com)"
                    className="w-full bg-transparent text-sm font-body outline-none text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <button type="submit" className="px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-xs font-body">
                  이동
                </button>
              </form>
              {/* Page content */}
              <div className="flex-1 flex items-center justify-center p-8">
                {urlSubmitted ? (
                  <div className="text-center">
                    <Globe className="w-16 h-16 text-primary mx-auto mb-4" />
                    <p className="font-display text-lg text-foreground">🎉 웹사이트에 접속했어요!</p>
                    <p className="text-sm text-muted-foreground mt-1">{urlTyped}</p>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <Globe className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-body">주소창에 주소를 입력하고 Enter를 눌러보세요!</p>
                  </div>
                )}
              </div>
            </motion.div>
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
            className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-card/95 backdrop-blur-md rounded-2xl border border-border shadow-card w-72 md:w-80 p-4 z-40"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4 px-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                placeholder="검색하려면 여기에 입력하세요"
                className="w-full bg-transparent text-sm font-body outline-none text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { icon: <Globe className="w-6 h-6" />, label: "Chrome" },
                { icon: <FileText className="w-6 h-6" />, label: "메모장" },
                { icon: <FolderOpen className="w-6 h-6" />, label: "파일 탐색기" },
                { icon: <Monitor className="w-6 h-6" />, label: "설정" },
                { icon: <Folder className="w-6 h-6" />, label: "문서" },
                { icon: <HardDrive className="w-6 h-6" />, label: "내 PC" },
              ].map((app) => (
                <button key={app.label} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-muted transition-colors">
                  <span className="text-primary">{app.icon}</span>
                  <span className="text-xs font-body text-foreground">{app.label}</span>
                </button>
              ))}
            </div>
            <div className="border-t border-border pt-3 flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">나</span>
                </div>
                <span className="text-sm font-body text-foreground">학생</span>
              </div>
              <button
                onClick={() => { setShutdownStep(2); }}
                className={`p-2 rounded-lg hover:bg-destructive/10 transition-colors ${
                  currentQuestType === "shutdown" ? "animate-pulse-highlight bg-destructive/10" : ""
                }`}
              >
                <Power className="w-5 h-5 text-destructive" />
              </button>
            </div>

            {/* Shutdown submenu */}
            <AnimatePresence>
              {shutdownStep >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full right-0 mb-2 bg-card rounded-xl border border-border shadow-card py-2 min-w-[160px]"
                >
                  <button className="w-full text-left px-4 py-2 text-sm font-body hover:bg-muted transition-colors">
                    😴 절전
                  </button>
                  <button
                    onClick={handleShutdown}
                    className={`w-full text-left px-4 py-2 text-sm font-body hover:bg-destructive/10 transition-colors ${
                      currentQuestType === "shutdown" ? "bg-destructive/10 font-bold text-destructive" : ""
                    }`}
                  >
                    🔴 시스템 종료
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm font-body hover:bg-muted transition-colors">
                    🔄 다시 시작
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Taskbar */}
      <div className="h-12 bg-win-taskbar flex items-center px-2 gap-1 z-50">
        {/* Start button */}
        <button
          onClick={(e) => { e.stopPropagation(); handleStartClick(); }}
          className={`p-2 rounded-lg hover:bg-primary/20 transition-colors ${
            isHighlighted("start") ? "animate-pulse-highlight" : ""
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" className="text-primary-foreground">
            <rect x="1" y="1" width="8" height="8" rx="1" fill="currentColor" opacity="0.9" />
            <rect x="11" y="1" width="8" height="8" rx="1" fill="currentColor" opacity="0.7" />
            <rect x="1" y="11" width="8" height="8" rx="1" fill="currentColor" opacity="0.7" />
            <rect x="11" y="11" width="8" height="8" rx="1" fill="currentColor" opacity="0.5" />
          </svg>
        </button>

        {/* Search */}
        <div className="flex-1 flex items-center max-w-xs bg-primary/10 rounded-full px-3 py-1.5 mx-2">
          <Search className="w-3 h-3 text-primary-foreground/60 mr-2" />
          <span className="text-xs text-primary-foreground/40 font-body">검색</span>
        </div>

        {/* Chrome */}
        <button
          onClick={(e) => { e.stopPropagation(); handleBrowserClick(); }}
          className={`p-2 rounded-lg hover:bg-primary/20 transition-colors ${
            isHighlighted("chrome") ? "animate-pulse-highlight" : ""
          }`}
        >
          <Globe className="w-5 h-5 text-primary-foreground" />
        </button>

        {/* File explorer */}
        <button className="p-2 rounded-lg hover:bg-primary/20 transition-colors">
          <FolderOpen className="w-5 h-5 text-primary-foreground" />
        </button>

        {/* System tray */}
        <div className="ml-auto flex items-center gap-2 text-primary-foreground/70 text-xs font-body pr-2">
          <span>🔋</span>
          <span>🔊</span>
          <span>오후 2:30</span>
        </div>
      </div>

      {/* Success overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-accent/20 backdrop-blur-sm flex items-center justify-center z-[100]"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", damping: 10 }}
              className="bg-card rounded-3xl p-8 shadow-card text-center"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: 2, duration: 0.3 }}
                className="text-5xl mb-3"
              >
                🎉
              </motion.div>
              <p className="font-display text-2xl text-accent">미션 성공!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WinDesktop;
