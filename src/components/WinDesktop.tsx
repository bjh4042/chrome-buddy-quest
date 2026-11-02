import { useState, useCallback, useRef, useEffect, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderOpen, Trash2, Star as StarIcon,
  ChevronRight, Power, Search,
  FileText, Folder, Monitor, Volume2, Volume1, VolumeX, Wifi, Lock, Check,
  Bluetooth, Plane, Moon, Accessibility, Cast, Settings as SettingsIcon, ChevronLeft
} from "lucide-react";
import type { QuestType } from "@/types/quest";
import { WRONG_CLICK_HINTS } from "@/types/quest";
import MyPcWindow from "./apps/MyPcWindow";
import EdgeWindow, { EdgeIcon } from "./apps/EdgeWindow";
import HangulWindow, { HangulIcon } from "./apps/HangulWindow";
import ExcelWindow, { ExcelIcon } from "./apps/ExcelWindow";
import PowerPointWindow, { PptIcon } from "./apps/PowerPointWindow";
import SettingsWindow, { getWindowsPreferences, updateWindowsPreferences } from "./apps/SettingsWindow";
import WindowFrame from "./apps/WindowFrame";
import { loadPracticeFiles, validFileName } from "@/lib/browserPractice";
import { useQuestEmit } from "@/features/quests/useQuestEngine";
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
  freePractice?: boolean;
}

type OpenApp = "mypc" | "edge" | "hangul" | "excel" | "ppt" | "settings" | "notepad" | null;

const QUEST_APP_MAP: Partial<Record<QuestType, OpenApp>> = {
  "close-mypc": "mypc",
  "wheel-scroll": "mypc",
  "window-move-resize": "mypc",
  "close-edge": "edge",
  "hangul-typing": "hangul",
  "hangul-font-size": "hangul",
  "hangul-font-family": "hangul",
  "hangul-image": "hangul",
  "hangul-image-resize": "hangul",
  "hangul-table": "hangul",
  "hangul-save": "hangul",
  "hangul-open-file": "hangul",
  "shortcut-copy": "hangul",
  "shortcut-paste": "hangul",
  "shortcut-save": "hangul",
  "shortcut-emoji": "hangul",
  "excel-input": "excel",
  "type-url": "edge",
  "edge-favorite-add":"edge","edge-favorite-open":"edge","edge-download-file":"edge","edge-download-reveal":"edge","edge-download-move":"mypc","edge-download-location":"edge","edge-find-text":"edge","edge-restore-tab":"edge",
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
  "shortcut-copy", "shortcut-paste", "shortcut-save", "shortcut-emoji",
  "excel-input",
  "ppt-text", "ppt-font-size", "ppt-font-family", "ppt-image", "ppt-image-resize",
  "type-url",
  "edge-favorite-add","edge-favorite-open","edge-download-file","edge-download-reveal","edge-download-move","edge-download-location","edge-find-text","edge-restore-tab",
  "wheel-scroll", "window-move-resize",
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

const WinDesktop = ({ currentQuestType, onQuestComplete, instruction, freePractice = false }: WinDesktopProps) => {
  const emit = useQuestEmit();
  const desktopRootRef=useRef<HTMLDivElement>(null);
  const [guideAnchor,setGuideAnchor]=useState<{x:string;y:string}|null>(null);
  const [settingsPage, setSettingsPage] = useState('system');
  const [background, setBackground] = useState(() => getWindowsPreferences().background);
  const [brightness, setBrightness] = useState(() => getWindowsPreferences().brightness);
  const [bluetooth, setBluetooth] = useState(() => getWindowsPreferences().bluetooth);
  const [airplane, setAirplane] = useState(false);
  const [nightLight, setNightLight] = useState(false);
  const [wifiEnabled, setWifiEnabled] = useState(() => getWindowsPreferences().wifi);
  const [muted, setMuted] = useState(false);
  const [lastVolume, setLastVolume] = useState(30);
  const [notice, setNotice] = useState('');
  const [powerState, setPowerState] = useState<'on'|'sleep'|'off'>('on');
  const [taskView, setTaskView] = useState(false);
  const [runningApps, setRunningApps] = useState<Exclude<OpenApp,null>[]>([]);
  const [notepad, setNotepad] = useState(() => { try { return localStorage.getItem('win-notepad') || ''; } catch { return ''; } });
  const [showWifiPassword, setShowWifiPassword] = useState(false);
  const lastIconClick = useRef<{ app: OpenApp; at: number }>({app:null,at:0});
  const notify = (text:string) => setNotice(text);
  const openSettings = (page='system') => { setSettingsPage(page); setOpenApp('settings');setQuickSettingsOpen(false);setContextMenuOpen(false);setStartMenuOpen(false); };
  useEffect(() => { if(!notice)return;const t=setTimeout(()=>setNotice(''),4000);return()=>clearTimeout(t); },[notice]);
  useEffect(() => { try {localStorage.setItem('win-background', background);} catch {setNotice('배경을 이 브라우저에 저장할 수 없어요.');} },[background]);
  useEffect(() => { const handler=(event:Event)=>{const d=(event as CustomEvent).detail||{};if(typeof d.background==='string')setBackground(d.background);if(Number.isFinite(d.volume))setVolume(d.volume);if(Number.isFinite(d.brightness))setBrightness(d.brightness);if(typeof d.wifi==='boolean')setWifiEnabled(d.wifi);if(typeof d.bluetooth==='boolean')setBluetooth(d.bluetooth);if(typeof d.network==='string'){setWifiSelected(d.network||null);setWifiConnected(!!d.network&&d.wifi!==false);}};window.addEventListener('win-settings-changed',handler);return()=>window.removeEventListener('win-settings-changed',handler); },[]);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const [openApp, setOpenApp] = useState<OpenApp>(
    QUEST_APP_MAP[currentQuestType] ?? null
  );
  const activateApp = (app:OpenApp) => {
    setOpenApp(app); setStartMenuOpen(false);
    if(app && ['mypc','edge','hangul','excel','ppt'].includes(app))emit({type:'APP_OPENED',app:app as 'mypc'|'edge'|'hangul'|'excel'|'ppt'});
  };
  const [minimizedApp, setMinimizedApp] = useState<OpenApp>(null);
  useEffect(() => { if(openApp)setRunningApps(prev=>prev.includes(openApp)?prev:[...prev,openApp]); },[openApp]);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [quickSettingsOpen, setQuickSettingsOpen] = useState(false);
  const [wifiSubOpen, setWifiSubOpen] = useState(false);
  const [volume, setVolume] = useState(() => getWindowsPreferences().volume);
  const [wifiSelected, setWifiSelected] = useState<string | null>(()=>getWindowsPreferences().network||null);
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiConnected, setWifiConnected] = useState(()=>!!getWindowsPreferences().network&&getWindowsPreferences().wifi);
  const [wifiError, setWifiError] = useState("");
  const [clickTargets, setClickTargets] = useState([
    { id: 1, x: 35, y: 25, clicked: false },
    { id: 2, x: 55, y: 40, clicked: false },
    { id: 3, x: 70, y: 20, clicked: false },
  ]);
  const [newFolderCreated, setNewFolderCreated] = useState(false);
  const [folderName, setFolderName] = useState("새 폴더");
  const [selectedFolder, setSelectedFolder] = useState(false);
  const [folderContextMenu, setFolderContextMenu] = useState(false);
  const [renamingFolder, setRenamingFolder] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(true);
  const [selectedFile, setSelectedFile] = useState(false);
  const [fileContextMenu, setFileContextMenu] = useState(false);
  const [subMenuOpen, setSubMenuOpen] = useState(false);
  const [multiSelected, setMultiSelected] = useState<Set<number>>(new Set());
  const [startSearch, setStartSearch] = useState("");
  const [shutdownStep, setShutdownStep] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
   const [showSuccess, setShowSuccess] = useState(false);
  const isCompleting = useRef(false);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearSuccessTimer = useCallback(() => {
    if (successTimerRef.current !== null) {
      clearTimeout(successTimerRef.current);
      successTimerRef.current = null;
    }
  }, []);

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
  const [tieredHint, setTieredHint] = useState<string>("");

  // Hint timers (wrong-click bubble + strong highlight) — must not leak across quests
  const wrongHintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearHintTimers = useCallback(() => {
    if (wrongHintTimerRef.current !== null) {
      clearTimeout(wrongHintTimerRef.current);
      wrongHintTimerRef.current = null;
    }
    if (highlightTimerRef.current !== null) {
      clearTimeout(highlightTimerRef.current);
      highlightTimerRef.current = null;
    }
  }, []);

  // Long-press for mobile right-click
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressPos = useRef({ x: 0, y: 0 });
  const fileLongPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearLongPressTimers = useCallback(() => {
    if (longPressTimer.current !== null) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (fileLongPressTimer.current !== null) {
      clearTimeout(fileLongPressTimer.current);
      fileLongPressTimer.current = null;
    }
  }, []);

  const koreanTime = useKoreanClock();
  useEffect(()=>{const reveal=(event:Event)=>{const id=(event as CustomEvent<{fileId?:string}>).detail?.fileId;if(typeof id!=='string')return;const file=loadPracticeFiles().find(f=>f.id===id&&f.kind==='file'&&!f.deleted);if(!file){setNotice('연습 파일을 찾을 수 없습니다. 다운로드 목록을 새로 확인하세요.');return;}try{localStorage.setItem('win-explorer-reveal-file',id);localStorage.setItem('win-explorer-open-folder',file.parent);}catch{setNotice('폴더 열기를 저장하지 못했어요. 탐색기에서 다운로드 폴더를 선택하세요.');}setOpenApp('mypc');setStartMenuOpen(false);};window.addEventListener('win-explorer-reveal',reveal);return()=>window.removeEventListener('win-explorer-reveal',reveal);},[]);

  useLayoutEffect(()=>{
    const root=desktopRootRef.current,area=root?.querySelector<HTMLElement>('.desktop-area');if(!root||!area)return;
    const iconForQuest:Partial<Record<QuestType,string>>={'double-click':'mypc','open-mypc':'mypc','open-hangul':'hangul','open-excel':'excel','open-ppt':'ppt'};
    const update=()=>{let target:HTMLElement|null=null;const id=iconForQuest[currentQuestType];if(id)target=area.querySelector<HTMLElement>(`[data-desktop-icon="${id}"]`);else if(currentQuestType==='close-mypc'||currentQuestType==='close-edge')target=Array.from(area.querySelectorAll<HTMLElement>('.window-frame button[aria-label="닫기"]')).find(el=>el.getBoundingClientRect().height>0)||null;else if(currentQuestType==='drag-drop')target=dragFileRef.current;
      if(!target){setGuideAnchor(null);return;}const r=target.getBoundingClientRect(),a=area.getBoundingClientRect();setGuideAnchor({x:`${r.left+r.width/2-a.left}px`,y:`${r.top+r.height/2-a.top}px`});};
    update();const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(update):null;observer?.observe(area);window.addEventListener('resize',update);return()=>{observer?.disconnect();window.removeEventListener('resize',update);};
  },[currentQuestType,openApp,showFingerGuide]);

  useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){setStartMenuOpen(false);setQuickSettingsOpen(false);setContextMenuOpen(false);setTaskView(false);}if(e.altKey&&e.key==='Tab'){e.preventDefault();setTaskView(true);}if(e.ctrlKey&&e.altKey&&e.key.toLowerCase()==='a'){e.preventDefault();setQuickSettingsOpen(v=>!v);}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[]);

  // Auto-open app for continuation quests & reset state on quest change
  useEffect(() => {
    const neededApp = QUEST_APP_MAP[currentQuestType];
    if (neededApp && openApp !== neededApp) {
      setOpenApp(neededApp);
    }
    // Reset quest-specific states
    clearSuccessTimer();
    clearHintTimers();
    clearLongPressTimers();
    setIntensifyHighlight(false);
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
      setFolderName("새 폴더");
      setSelectedFolder(false);
    }
    if (currentQuestType === "rename-folder") {
      // Need a folder to rename — auto-create one
      setNewFolderCreated(true);
      setFolderName("새 폴더");
      setRenamingFolder(false);
    }
    if (currentQuestType === "wifi-connect") {
      setWifiSelected(null);
      setWifiPassword("");
      setWifiConnected(false);
      setWifiError("");
      setWifiSubOpen(false);
    }
    if (currentQuestType === "volume-control") {
      setVolume(30);
    }
    if (currentQuestType === "multi-select") {
      setMultiSelected(new Set());
    }
    if (currentQuestType === "start-search") {
      setStartSearch("");
    }
    // Always close popups/panels on quest change so they don't bleed into the next mission
    setQuickSettingsOpen(false);
    setWifiSubOpen(false);
    setCalendarOpen(false);
  }, [currentQuestType, clearSuccessTimer, clearHintTimers, clearLongPressTimers]);

  // Cancel any pending timers on unmount
  useEffect(
    () => () => {
      clearSuccessTimer();
      clearHintTimers();
      clearLongPressTimers();
    },
    [clearSuccessTimer, clearHintTimers, clearLongPressTimers]
  );

  // Show finger guide after delay
  useEffect(() => {
    setShowFingerGuide(false);
    wrongClickCount.current = 0;
    setTieredHint("");
    setWrongHint({ visible: false, pos: { x: 0, y: 0 } });
    clearHintTimers();
    if (APP_INTERNAL_QUESTS.includes(currentQuestType)) return;
    if (currentQuestType === "click") {
      const timer = setTimeout(() => setShowFingerGuide(true), 10000);
      return () => clearTimeout(timer);
    }
    const fp = FINGER_POSITIONS[currentQuestType] || TASKBAR_FINGER_POSITIONS[currentQuestType];
    if (fp) {
      const timer = setTimeout(() => setShowFingerGuide(true), 10000);
      return () => clearTimeout(timer);
    }
  }, [currentQuestType, clearHintTimers]);

  const triggerSuccess = useCallback(() => {
    if (isCompleting.current) return;
    clearSuccessTimer();
    isCompleting.current = true;
    setShowSuccess(true);
    setShowFingerGuide(false);
    successTimerRef.current = setTimeout(() => {
      successTimerRef.current = null;
      setShowSuccess(false);
      isCompleting.current = false;
      onQuestComplete();
    }, 1200);
  }, [onQuestComplete, clearSuccessTimer]);

  const handleCloseApp = useCallback((app: OpenApp) => {
    setOpenApp(null);
    setRunningApps(prev=>prev.filter(a=>a!==app));
    if (app === "mypc" && currentQuestType === "close-mypc") triggerSuccess();
    if (app === "edge" && currentQuestType === "close-edge") triggerSuccess();
  }, [currentQuestType, triggerSuccess]);

  const handleWrongClick = (e: React.MouseEvent) => {
    if (freePractice) return;
    wrongClickCount.current += 1;
    const n = wrongClickCount.current;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const pos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    // Tiered hint messages (elementary-friendly, escalating)
    let msg = "";
    if (n === 1) msg = "앗, 그곳은 아니에요. 임무를 한 번 더 읽어 볼까요?";
    else if (n === 2) msg = WRONG_CLICK_HINTS[currentQuestType] || "임무에 나온 그림을 찾아보세요.";
    else if (n === 3) msg = "정답 위치를 반짝이게 표시할게요. 잘 살펴봐요.";
    else msg = "손가락 안내를 보여 줄게요. 그대로 따라해 봐요!";
    setWrongHint({ visible: true, pos });
    if (wrongHintTimerRef.current !== null) clearTimeout(wrongHintTimerRef.current);
    wrongHintTimerRef.current = setTimeout(() => {
      wrongHintTimerRef.current = null;
      setWrongHint({ visible: false, pos: { x: 0, y: 0 } });
    }, 3500);
    if (n >= 3) {
      setIntensifyHighlight(true);
      if (highlightTimerRef.current !== null) clearTimeout(highlightTimerRef.current);
      highlightTimerRef.current = setTimeout(() => {
        highlightTimerRef.current = null;
        setIntensifyHighlight(false);
      }, 5000);
    }
    if (n >= 4) {
      setShowFingerGuide(true);
    }
    setTieredHint(msg);
  };

  const handleStarClick = (id: number) => {
    if (currentQuestType !== "click") return;
    const updated = clickTargets.map(t => t.id === id ? { ...t, clicked: true } : t);
    setClickTargets(updated);
    triggerSuccess();
  };

  const handleIconDoubleClick = (app: OpenApp, questTypes: QuestType[]) => {
    const now = Date.now();
    if(lastIconClick.current.app===app && now-lastIconClick.current.at<500){
      lastIconClick.current={app:null,at:0};
      setOpenApp(app);
      if(questTypes.includes(currentQuestType))triggerSuccess();
    } else lastIconClick.current={app,at:now};
  };

  const openContextMenu = (x: number, y: number, fromDesktop: boolean) => {
    if (fromDesktop) {
      setContextMenuPos({ x: Math.max(0,Math.min(x,window.innerWidth-260)), y: Math.max(0,Math.min(y,window.innerHeight-320)) });
      setContextMenuOpen(true);
      setFileContextMenu(false);
      if (currentQuestType === "right-click") {
        // Close the context menu when the mission ends
        setTimeout(() => setContextMenuOpen(false), 600);
        triggerSuccess();
      }
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
    const touchPoint = { x: touch.clientX, y: touch.clientY };
    // Capture the element now: React nulls out `currentTarget` after dispatch.
    const areaEl = e.currentTarget as HTMLElement;
    longPressTimer.current = setTimeout(() => {
      longPressTimer.current = null;
      const rect = areaEl.getBoundingClientRect();
      openContextMenu(
        touchPoint.x - rect.left,
        touchPoint.y - rect.top,
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
  const handleFileTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    setSelectedFile(true);
    const touch = e.touches[0];
    const touchPoint = { x: touch.clientX, y: touch.clientY };
    // Capture the desktop element now: React nulls out `currentTarget` after dispatch.
    const desktopEl = (e.currentTarget as HTMLElement).closest('.desktop-area') as HTMLElement | null;
    fileLongPressTimer.current = setTimeout(() => {
      fileLongPressTimer.current = null;
      // The file is selected synchronously above, so don't re-read the stale `selectedFile` state here.
      if (currentQuestType === "delete-file") {
        const rect = desktopEl?.getBoundingClientRect();
        if (rect) {
          setContextMenuPos({ x: touchPoint.x - rect.left, y: touchPoint.y - rect.top });
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
  const handleFileTouchMove = handleFileTouchEnd;

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

  const handleRenameFolder = () => {
    setRenamingFolder(true);
    setFolderContextMenu(false);
  };

  const handleBrowserClick = () => {
    setOpenApp("edge");
    if (currentQuestType === "open-browser") triggerSuccess();
  };

  const handleShutdown = () => {
    setPowerState("off"); setStartMenuOpen(false);
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
    setFolderContextMenu(false);
    setStartMenuOpen(false);
    setSubMenuOpen(false);
    setSelectedFile(false);
    setSelectedFolder(false);
    setSelectedIcon(null);
    setCalendarOpen(false);
    setQuickSettingsOpen(false);
    setWifiSubOpen(false);
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
      folder: ["rename-folder"],
      edge: ["open-browser", "type-url"],
      hangul: ["open-hangul"],
      excel: ["open-excel"],
      ppt: ["open-ppt"],
      volume: ["volume-control"],
      wifi: ["wifi-connect"],
      quickSettings: ["volume-control", "wifi-connect"],
    };
    return map[target]?.includes(currentQuestType) || false;
  };

  // Del key for delete-file, F2 for rename-folder
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if ((e.target as HTMLElement)?.closest('input,textarea,select,[contenteditable=true]')) return;
      if (currentQuestType === "delete-file" && (e.key === "Delete" || e.key === "Del") && selectedFile) {
        e.preventDefault();
        handleDeleteFile();
      }
      if (currentQuestType === "rename-folder" && e.key === "F2") {
        e.preventDefault();
        setRenamingFolder(true);
        setFolderContextMenu(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentQuestType, selectedFile, triggerSuccess]);

  // Volume slider — success when reaches 50 (±2)
  useEffect(() => {
    if (currentQuestType === "volume-control" && volume === 50) {
      triggerSuccess();
    }
  }, [volume, currentQuestType, triggerSuccess]);

  // Window move/resize quest — listen to WindowFrame events
  useEffect(() => {
    if (currentQuestType !== "window-move-resize") return;
    const handler = (event:CustomEvent) => { if(event.detail?.app === "mypc") triggerSuccess(); };
    window.addEventListener("window-interacted", handler as EventListener);
    return () => window.removeEventListener("window-interacted", handler as EventListener);
  }, [currentQuestType, triggerSuccess]);

  // Multi-select quest — completes when 2+ files are selected
  useEffect(() => {
    if (currentQuestType === "multi-select" && multiSelected.size >= 2) {
      triggerSuccess();
    }
  }, [multiSelected, currentQuestType, triggerSuccess]);

  // Start menu search quest
  useEffect(() => {
    if (currentQuestType === "start-search" && startSearch.trim().includes("메모장")) {
      triggerSuccess();
    }
  }, [startSearch, currentQuestType, triggerSuccess]);

  const handleWifiConnect = () => {
    if (wifiEnabled && !airplane && ((wifiSelected === "우리집 WiFi" && wifiPassword === "12345678") || (wifiSelected === "학교 연습 Wi-Fi" && wifiPassword === "class2026") || wifiSelected === "공개 연습망")) {
      setWifiConnected(true);
      updateWindowsPreferences({wifi:true,network:wifiSelected||""});
      setWifiError("");
      if (currentQuestType === "wifi-connect" && wifiSelected === "우리집 WiFi") triggerSuccess();
    } else {
      setWifiError("연결할 수 없습니다. 네트워크와 연습용 보안 키를 확인하세요.");
    }
  };

  const fingerPos = currentQuestType === "click"
    ? (() => {
        const nextStar = clickTargets.find(t => !t.clicked);
        return nextStar
          ? { x: `calc(${nextStar.x}% + 28px)`, y: `calc(${nextStar.y}% + 28px)`, label: "여기를 클릭!", delay: 3000 }
          : null;
      })()
    : FINGER_POSITIONS[currentQuestType] ? {...FINGER_POSITIONS[currentQuestType],...(guideAnchor||{})} : null;
  const taskbarFingerPos = TASKBAR_FINGER_POSITIONS[currentQuestType] ?? null;
  const showFinger = !freePractice && !openApp && showFingerGuide && !showSuccess && !APP_INTERNAL_QUESTS.includes(currentQuestType);

  return (
    <div
      ref={desktopRootRef} className="relative w-full h-full flex flex-col overflow-hidden select-none"
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onTouchMove={handleDragMove}
      onTouchEnd={handleDragEnd}
    >
      {/* Windows 11 Desktop Background */}
      <div className="absolute inset-0 win-desktop-wallpaper" style={background.startsWith("data:image/")?{backgroundImage:`url(${background})`,backgroundSize:"cover",backgroundPosition:"center",filter:`brightness(${brightness}%)`}:{background:background.startsWith("#")||background.startsWith("linear-gradient(")?background:background==="sunset"?"linear-gradient(135deg,#fbd7ad,#e09ebe,#697ece)":background==="forest"?"linear-gradient(130deg,#bbdfca,#3e9a8a,#204658)":"radial-gradient(ellipse at 55% 50%,#69c4fa 0%,transparent 35%),conic-gradient(from 50deg at 60% 55%,#1759ac,#86cbff,#246bd0,#c5e6ff,#2c80da,#164b9c)",filter:`brightness(${brightness}%)`}}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(125,185,232,0.3)_0%,_transparent_70%)]" />
      </div>

      {/* Desktop area */}
      <div
        className="desktop-area flex-1 min-h-0 relative p-3 pt-14 overflow-hidden"
        onContextMenu={handleDesktopRightClick}
        onTouchStart={handleDesktopTouchStart}
        onTouchMove={handleDesktopTouchMove}
        onTouchEnd={handleDesktopTouchEnd}
        onTouchCancel={handleDesktopTouchEnd}
        onClick={handleDesktopClick}
      >
        {/* Desktop icons grid */}
        <div className="desktop-icons flex flex-col flex-wrap content-start gap-1 items-start h-full max-h-full">
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
            onClick={(e) => { e.stopPropagation(); try{localStorage.setItem('win-explorer-open-folder','휴지통');}catch{/* event fallback */} setOpenApp('mypc');window.dispatchEvent(new CustomEvent('win-open-folder',{detail:'휴지통'})); }}
          />
          <DesktopIcon
            id="hangul"
            selected={selectedIcon === "hangul"}
            onSelect={setSelectedIcon}
            icon={<img src={desktopHangulImg} alt="한글" className="w-10 h-10 object-contain" />}
            label="한글"
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
                onTouchMove={handleFileTouchMove}
                onTouchEnd={handleFileTouchEnd}
                onTouchCancel={handleFileTouchEnd}
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
              <div
                className={`flex flex-col items-center gap-0.5 cursor-pointer p-2 rounded-md w-20 transition-colors ${
                  selectedFolder ? "bg-blue-500/40 ring-1 ring-blue-300/70" : "hover:bg-white/10"
                } ${isHighlighted("folder") ? "animate-pulse-highlight" : ""}`}
                onClick={(e) => { e.stopPropagation(); setSelectedFolder(true); }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (currentQuestType === "rename-folder") {
                    setSelectedFolder(true);
                    const rect = (e.currentTarget.closest('.desktop-area') as HTMLElement)?.getBoundingClientRect();
                    if (rect) setContextMenuPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                    setFolderContextMenu(true);
                    setFileContextMenu(false);
                    setContextMenuOpen(false);
                  }
                }}
              >
                <div className="w-10 h-10 flex items-center justify-center">
                  <Folder className="w-7 h-7 text-yellow-400" />
                </div>
                {renamingFolder ? (
                  <input
                    autoFocus
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    onBlur={() => setRenamingFolder(false)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if(!validFileName(folderName.trim())){notify('파일 이름에 쓸 수 없는 문자나 예약어가 있어요.');return;}
                        setRenamingFolder(false);
                        if (currentQuestType === "rename-folder" && folderName.trim() && folderName.trim() !== "새 폴더") {
                          triggerSuccess();
                        }
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="text-[10px] text-center w-full px-1 rounded bg-white text-gray-800 border border-blue-400"
                  />
                ) : (
                  <span className="text-[10px] text-white text-center leading-tight drop-shadow-sm">{folderName}</span>
                )}
              </div>
            </motion.div>
          )}

          {currentQuestType === "multi-select" && (
            <div className="mt-2 flex flex-wrap gap-1">
              {[1, 2, 3].map(id => {
                const sel = multiSelected.has(id);
                return (
                  <div
                    key={id}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (e.ctrlKey || e.metaKey) {
                        setMultiSelected(prev => {
                          const next = new Set(prev);
                          if (next.has(id)) next.delete(id); else next.add(id);
                          return next;
                        });
                      } else {
                        setMultiSelected(new Set([id]));
                      }
                    }}
                    className={`flex flex-col items-center gap-0.5 cursor-pointer p-2 rounded-md w-20 transition-colors ${
                      sel ? "bg-blue-500/40 ring-1 ring-blue-300/70" : "hover:bg-white/10 animate-pulse-highlight"
                    }`}
                  >
                    <FileText className="w-8 h-8 text-blue-300" />
                    <span className="text-[10px] text-white text-center drop-shadow-sm">파일{id}.txt</span>
                  </div>
                );
              })}
              <div className="basis-full text-[10px] text-yellow-200 mt-1">
                Ctrl 키를 누른 채로 파일을 두 개 이상 클릭하세요! ({multiSelected.size}/2)
              </div>
            </div>
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
                style={{ left: 48 + dragPos.x, top: 460 + dragPos.y }}
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
          message={tieredHint || WRONG_CLICK_HINTS[currentQuestType] || ""}
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
              <CtxItem icon="🔄" label="새로 고침" onClick={()=>{setContextMenuOpen(false);notify("바탕 화면을 새로 고쳤어요. 파일이 삭제되지는 않아요.");}} />
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
                      <button onClick={()=>{activateApp("mypc");setContextMenuOpen(false);notify("파일 탐색기의 새로 만들기에서 텍스트 문서를 만들어 보세요.");}} className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-blue-50">📄 텍스트 문서</button>
                      <button disabled title="이 연습 버전에서는 지원하지 않습니다." className="w-full text-left px-3 py-1.5 text-xs text-gray-400">📋 바로 가기</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="border-t border-gray-100 my-0.5" />
              <CtxItem icon="🖥️" label="디스플레이 설정" onClick={()=>openSettings("display")} />
              <CtxItem icon="🎨" label="개인 설정" onClick={()=>openSettings("background")} />
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

        {/* Folder context menu (rename) */}
        <AnimatePresence>
          {folderContextMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute bg-white/95 backdrop-blur-md rounded-lg border border-gray-200 shadow-xl py-1 min-w-[200px] z-40"
              style={{ left: contextMenuPos.x, top: contextMenuPos.y }}
              onClick={(e) => e.stopPropagation()}
            >
              <CtxItem icon="📂" label="열기" />
              <CtxItem icon="📋" label="복사" />
              <CtxItem icon="✂️" label="잘라내기" />
              <div className="border-t border-gray-100 my-0.5" />
              <button
                onClick={handleRenameFolder}
                className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-blue-50 ${
                  currentQuestType === "rename-folder" ? "bg-yellow-50 text-blue-600 font-bold animate-pulse-highlight" : "text-gray-700"
                }`}
              >
                <span>✏️</span> 이름 바꾸기
                <span className="ml-auto text-[10px] text-gray-400">F2</span>
              </button>
              <div className="border-t border-gray-100 my-0.5" />
              <CtxItem icon="🗑️" label="삭제" />
              <CtxItem icon="📋" label="속성" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* App windows */}
        <AnimatePresence>
          {runningApps.includes("mypc") && (
            <div key="mypc" className="absolute inset-0" style={{display:openApp==="mypc"?"block":"none"}}>
            <MyPcWindow
              onClose={() => handleCloseApp("mypc")}
              onMinimize={() => handleMinimize("mypc")}
              highlightClose={currentQuestType === "close-mypc"}
              currentQuestType={currentQuestType}
              onQuestComplete={triggerSuccess}
            /></div>
          )}
          {runningApps.includes("edge") && (
            <div key="edge" className="absolute inset-0" style={{display:openApp==="edge"?"block":"none"}}>
            <EdgeWindow
              onClose={() => handleCloseApp("edge")}
              onMinimize={() => handleMinimize("edge")}
              currentQuestType={currentQuestType}
              onQuestComplete={triggerSuccess}
              highlightClose={currentQuestType === "close-edge"}
              connected={wifiEnabled&&!airplane&&wifiConnected}
            /></div>
          )}
          {runningApps.includes("hangul") && (
            <div key="hangul" className="absolute inset-0" style={{display:openApp==="hangul"?"block":"none"}}>
            <HangulWindow onClose={() => handleCloseApp("hangul")} onMinimize={() => handleMinimize("hangul")} currentQuestType={currentQuestType} onQuestComplete={triggerSuccess} /></div>
          )}
          {runningApps.includes("excel") && (
            <div key="excel" className="absolute inset-0" style={{display:openApp==="excel"?"block":"none"}}>
            <ExcelWindow onClose={() => handleCloseApp("excel")} onMinimize={() => handleMinimize("excel")} currentQuestType={currentQuestType} onQuestComplete={triggerSuccess} /></div>
          )}
          {runningApps.includes("ppt") && (
            <div key="ppt" className="absolute inset-0" style={{display:openApp==="ppt"?"block":"none"}}>
            <PowerPointWindow active={openApp==="ppt"} onClose={() => handleCloseApp("ppt")} onMinimize={() => handleMinimize("ppt")} currentQuestType={currentQuestType} onQuestComplete={triggerSuccess} /></div>
          )}
          {runningApps.includes('settings') && <div key="settings" className="absolute inset-0" style={{display:openApp==='settings'?'block':'none'}}><SettingsWindow onClose={()=>handleCloseApp('settings')} onMinimize={()=>handleMinimize('settings')} initialPage={settingsPage} onBackgroundChange={setBackground} onVolumeChange={setVolume}/></div>}
          {runningApps.includes('notepad') && <div key="notepad" className="absolute inset-0" style={{display:openApp==='notepad'?'block':'none'}}><WindowFrame title="제목 없음 - 메모장" icon={<FileText size={16}/>} onClose={()=>handleCloseApp('notepad')} onMinimize={()=>handleMinimize('notepad')} toolbar={<div className="flex gap-3 px-3 py-2 text-xs"><button onClick={()=>{try{localStorage.setItem('win-notepad',notepad);notify('메모를 저장했어요.');}catch{notify('저장 공간을 확인하세요.');}}}>저장</button><button onClick={()=>{try{setNotepad(localStorage.getItem('win-notepad')||'');}catch{notify('저장된 메모를 읽을 수 없어요.');}}}>열기</button><button onClick={()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([notepad],{type:'text/plain;charset=utf-8'}));a.download='탐험대 메모.txt';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}}>텍스트 파일 다운로드</button></div>}><textarea aria-label="메모장 문서" onKeyDown={e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="s"){e.preventDefault();try{localStorage.setItem("win-notepad",notepad);notify("메모를 저장했어요.");}catch{notify("저장할 수 없습니다. 텍스트 파일 다운로드를 이용하세요.");}}}} placeholder="여기에 글을 입력하세요." className="flex-1 min-h-64 p-4 resize-none outline-none select-text" value={notepad} onChange={e=>setNotepad(e.target.value)}/></WindowFrame></div>}
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
            className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xl rounded-xl border border-gray-200 shadow-2xl w-[min(384px,calc(100vw-1rem))] p-3 sm:p-5 z-40 max-h-[calc(100vh-4rem)] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 mb-4 ${
              currentQuestType === "start-search" ? "ring-2 ring-yellow-400 animate-pulse-highlight" : ""
            }`}>
              <Search className="w-4 h-4 text-gray-400" />
              <input
                value={startSearch}
                onChange={(e) => setStartSearch(e.target.value)}
                placeholder="앱, 설정 및 문서 검색"
                autoFocus={currentQuestType === "start-search"}
                className="w-full bg-transparent text-xs outline-none text-gray-700 placeholder:text-gray-400"
              />
            </div>
            {currentQuestType === "start-search" && startSearch.trim().length > 0 && (
              <div className="mb-3 p-2 rounded bg-blue-50 border border-blue-200 text-[11px] text-blue-700">
                🔍 "{startSearch}" 검색 결과
              </div>
            )}
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
              ].filter(app=>!startSearch.trim()||app.label.toLowerCase().includes(startSearch.trim().toLowerCase())).map((app) => (
                <button key={app.label} onClick={()=>{const apps:Record<string,OpenApp>={Edge:'edge','한글':'hangul',Excel:'excel',PowerPoint:'ppt','파일 탐색기':'mypc','설정':'settings','메모장':'notepad','문서':'mypc'};if(app.label==='문서'){try{localStorage.setItem('win-explorer-open-folder','문서');}catch{}window.dispatchEvent(new CustomEvent('win-open-folder',{detail:'문서'}));}activateApp(apps[app.label]||'mypc');}} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors">
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
                  <button onClick={()=>{setPowerState("sleep");setStartMenuOpen(false);}} className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-100">절전</button>
                  <button
                    onClick={handleShutdown}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-red-50 ${
                      currentQuestType === "shutdown" ? "bg-red-50 font-bold text-red-600 animate-pulse-highlight" : "text-gray-700"
                    }`}
                  >🔴 시스템 종료</button>
                  <button onClick={()=>{setOpenApp(null);setRunningApps([]);setStartMenuOpen(false);setShutdownStep(0);notify("연습용 PC를 다시 시작했어요. 저장한 파일은 남아 있어요.");}} className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-100">다시 시작</button>
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
      <div className="h-12 shrink-0 bg-[#e8f0fc]/95 backdrop-blur-xl flex items-center justify-center px-3 z-50 border-t border-white/10">
        <div className="flex items-center gap-1">
          <button
            aria-label="시작" title="시작" onClick={(e) => { e.stopPropagation(); handleStartClick(); }}
            className={`p-2 rounded-md hover:bg-white/10 transition-colors ${isHighlighted("start") ? "animate-pulse-highlight" : ""}`}
          >
            <svg width="20" height="20" viewBox="0 0 20 20">
              <rect x="1" y="1" width="8" height="8" rx="1.5" fill="#4FC3F7" />
              <rect x="11" y="1" width="8" height="8" rx="1.5" fill="#4FC3F7" opacity="0.7" />
              <rect x="1" y="11" width="8" height="8" rx="1.5" fill="#4FC3F7" opacity="0.7" />
              <rect x="11" y="11" width="8" height="8" rx="1.5" fill="#4FC3F7" opacity="0.5" />
            </svg>
          </button>
          <button title="검색" aria-label="검색" onClick={()=>{setStartMenuOpen(true);setStartSearch('');}} className="p-2 rounded-md hover:bg-white/50 transition-colors">
            <Search className="w-5 h-5 text-gray-700" />
          </button>
          <button title="파일 탐색기" aria-label="파일 탐색기" onClick={()=>activateApp('mypc')} className="p-2 rounded-md hover:bg-white/50 transition-colors">
            <FolderOpen className="w-5 h-5 text-yellow-400" />
          </button>
          <button aria-label="Microsoft Edge" title="Microsoft Edge"
            onClick={(e) => { e.stopPropagation(); handleBrowserClick(); }}
            className={`p-2 rounded-md hover:bg-white/10 transition-colors ${isHighlighted("edge") ? "animate-pulse-highlight" : ""}`}
          >
            <EdgeIcon className="w-5 h-5" />
          </button>
          <button title="작업 보기" aria-label="작업 보기" onClick={()=>setTaskView(v=>!v)} className="p-2 hover:bg-white/60 rounded"><Monitor size={18}/></button>
          {runningApps.filter(a=>!['edge','mypc'].includes(a)).map(a=><button key={a} title={a} aria-label={{hangul:'한글',excel:'Excel',ppt:'PowerPoint',settings:'설정',notepad:'메모장'}[a]||a} onClick={()=>setOpenApp(openApp===a?null:a)} className={`px-2 py-1 rounded text-xs ${openApp===a?'bg-white border-b-2 border-blue-600':'hover:bg-white/50'}`}>{a==='hangul'?<HangulIcon className="w-5 h-5"/>:a==='excel'?<ExcelIcon className="w-5 h-5"/>:a==='ppt'?<PptIcon className="w-5 h-5"/>:a==='settings'?<SettingsIcon size={18}/>:<FileText size={18}/>}</button>)}

        </div>
        <div className="absolute right-3 flex items-center gap-2 text-gray-700 text-xs">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setQuickSettingsOpen(o => !o);
              setCalendarOpen(false);
              setWifiSubOpen(false);
            }}
            className={`flex items-center gap-1 p-1 rounded hover:bg-white/10 transition-colors ${
              isHighlighted("quickSettings") ? "animate-pulse-highlight" : ""
            }`}
            title="빠른 설정" aria-label="빠른 설정"
          >
            <Wifi className={`w-4 h-4 ${wifiConnected ? "text-blue-600" : ""}`} />
            {volume === 0 ? <VolumeX className="w-4 h-4" /> : volume < 50 ? <Volume1 className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>🔋</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setCalendarOpen(o => !o); }}
            className="ml-1 text-[10px] text-right whitespace-pre-line leading-tight hover:bg-white/10 rounded px-1.5 py-0.5 transition-colors text-gray-800"
          >
            {koreanTime}
          </button>
        </div>

        {/* Quick Settings panel (Windows 11 style) */}
        <AnimatePresence>
          {quickSettingsOpen && (
            <>
              <div className="fixed inset-0 z-[55]" onClick={() => { setQuickSettingsOpen(false); setWifiSubOpen(false); }} />
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 10, opacity: 0 }}
                className="absolute right-2 left-2 sm:left-auto bottom-14 z-[56] bg-white/95 backdrop-blur-xl rounded-2xl border border-gray-200 shadow-2xl p-3 sm:p-4 w-auto sm:w-[360px] max-w-[calc(100vw-1rem)] max-h-[calc(100vh-4rem)] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {!wifiSubOpen ? (
                  <>
                    {/* Tile grid */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <QSTile
                        icon={<Wifi className="w-5 h-5" />}
                        label={wifiConnected ? wifiSelected || "Wi-Fi" : "Wi-Fi"}
                        active={wifiConnected}
                        chevron
                        highlight={isHighlighted("wifi")}
                        onClick={() => setWifiSubOpen(true)} onToggle={()=>{setWifiEnabled(v=>!v);setWifiConnected(false);updateWindowsPreferences({wifi:!wifiEnabled,network:""});}}
                      />
                      <QSTile icon={<Bluetooth className="w-5 h-5" />} label={bluetooth?"Bluetooth 켜짐":"Bluetooth"} active={bluetooth} onClick={()=>{setBluetooth(v=>!v);updateWindowsPreferences({bluetooth:!bluetooth});}} />
                      <QSTile icon={<Plane className="w-5 h-5" />} label="비행기 모드" active={airplane} onClick={()=>{setAirplane(v=>!v);setWifiConnected(false);updateWindowsPreferences({wifi:airplane,network:""});}} />
                      <QSTile icon={<Moon className="w-5 h-5" />} label="야간 모드" active={nightLight} onClick={()=>setNightLight(v=>!v)} />
                      <QSTile icon={<Accessibility className="w-5 h-5" />} label="접근성" chevron onClick={()=>openSettings("accessibility")} />
                      <QSTile icon={<Cast className="w-5 h-5" />} label="디스플레이" chevron onClick={()=>openSettings("display")} />
                    </div>
                    <label className="flex items-center gap-3 text-xs mb-3">☀ <input aria-label="밝기" className="flex-1 accent-blue-600" type="range" min="20" max="100" value={brightness} onChange={e=>{setBrightness(Number(e.target.value));updateWindowsPreferences({brightness:Number(e.target.value)});}}/><span>{brightness}</span></label>
                    {/* Volume slider */}
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex items-center gap-3">
                        <button aria-label={volume===0?"음소거 해제":"음소거"} title={volume===0?"음소거 해제":"음소거"} onClick={()=>{const next=volume===0?lastVolume||30:0;if(volume>0)setLastVolume(volume);setVolume(next);updateWindowsPreferences({volume:next});}}>{volume === 0 ? <VolumeX className="w-5 h-5 text-gray-700" /> : volume < 50 ? <Volume1 className="w-5 h-5 text-gray-700" /> : <Volume2 className="w-5 h-5 text-gray-700" />}</button>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={volume}
                          aria-label="볼륨" onChange={(e) => {setVolume(Number(e.target.value));updateWindowsPreferences({volume:Number(e.target.value)});setMuted(false);}}
                          className={`flex-1 accent-blue-500 ${currentQuestType === "volume-control" ? "animate-pulse-highlight rounded" : ""}`}
                        />
                        <span className="text-xs text-gray-500 w-8 text-right">{volume}</span>
                      </div>
                      {currentQuestType === "volume-control" && (
                        <p className="mt-2 text-[11px] text-blue-600 text-center">🎯 슬라이더를 50까지 옮겨주세요!</p>
                      )}
                    </div>
                    <div className="flex justify-end pt-3">
                      <button aria-label="모든 설정" title="모든 설정" onClick={()=>openSettings()} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors">
                        <SettingsIcon className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <button onClick={() => { setWifiSubOpen(false); if(!wifiConnected)setWifiSelected(null); setWifiPassword(""); setWifiError(""); }} className="p-1 hover:bg-gray-100 rounded">
                        <ChevronLeft className="w-4 h-4 text-gray-600" />
                      </button>
                      <Wifi className="w-4 h-4 text-blue-500" />
                      <span className="font-display text-sm text-gray-800">Wi-Fi 네트워크</span>
                    </div>
                    <label className="flex items-center justify-between text-sm mb-3">Wi-Fi <input aria-label="Wi-Fi 켜기" type="checkbox" checked={wifiEnabled&&!airplane} onChange={e=>{setWifiEnabled(e.target.checked);updateWindowsPreferences({wifi:e.target.checked,...(!e.target.checked?{network:""}:{})});setAirplane(false);if(!e.target.checked)setWifiConnected(false);}}/></label>
                    {!wifiEnabled||airplane?<p className="p-3 text-sm">Wi-Fi가 꺼져 있습니다.</p>:null}
                    {!wifiSelected && !wifiConnected && wifiEnabled && !airplane && (
                      <div className="space-y-1">
                        {[
                          { name: "우리집 WiFi", strength: 4, secure: true, target: true },
                          { name: "학교 연습 Wi-Fi", strength: 3, secure: true },
                          { name: "공개 연습망", strength: 2, secure: false },
                        ].map(net => (
                          <button
                            key={net.name}
                            onClick={() => { setWifiSelected(net.name); setWifiPassword(""); setWifiError(""); }}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 text-left transition-colors ${
                              net.target && currentQuestType === "wifi-connect" ? "animate-pulse-highlight bg-yellow-50" : ""
                            }`}
                          >
                            <Wifi className={`w-4 h-4 ${net.strength >= 3 ? "text-blue-500" : "text-gray-400"}`} />
                            <span className="text-xs text-gray-800 flex-1">{net.name}</span>
                            {net.secure && <Lock className="w-3 h-3 text-gray-400" />}
                          </button>
                        ))}
                      </div>
                    )}
                    {wifiSelected && !wifiConnected && (
                      <div>
                        <p className="text-xs text-gray-700 mb-2">
                          <span className="font-bold">{wifiSelected}</span> 에 연결
                        </p>
                        <p className="text-[11px] text-gray-500 mb-2">네트워크 보안 키를 입력하세요</p>
                        <input
                          type={showWifiPassword?"text":"password"} aria-label="네트워크 보안 키" onKeyDown={e=>{if(e.key==="Enter")handleWifiConnect();}}
                          value={wifiPassword}
                          onChange={(e) => { setWifiPassword(e.target.value); setWifiError(""); }}
                          placeholder="비밀번호"
                          className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                          autoFocus
                        />
                        <label className="flex items-center gap-2 text-xs mt-2"><input type="checkbox" checked={showWifiPassword} onChange={e=>setShowWifiPassword(e.target.checked)}/>문자 표시</label><p className="text-[10px] text-gray-500 mt-2">연습용 보안 키: 우리집 12345678 / 학교 class2026. 실제 비밀번호를 입력하지 마세요.</p>
                        {wifiError && <p className="text-[10px] text-red-500 mt-1">{wifiError}</p>}
                        {currentQuestType === "wifi-connect" && (
                          <p className="text-[10px] text-blue-600 mt-1">힌트: 12345678</p>
                        )}
                        <div className="flex gap-2 mt-3 justify-end">
                          <button
                            onClick={() => { setWifiSelected(null); setWifiPassword(""); setWifiError(""); }}
                            className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
                          >
                            취소
                          </button>
                          <button
                            onClick={handleWifiConnect}
                            className="px-3 py-1 text-xs bg-blue-500 text-white hover:bg-blue-600 rounded animate-pulse-highlight"
                          >
                            연결
                          </button>
                        </div>
                      </div>
                    )}
                    {wifiConnected && (
                      <div className="text-center py-2">
                        <Check className="w-8 h-8 text-green-500 mx-auto mb-1" />
                        <p className="text-xs text-green-600 font-bold">연결됨, 보안: {wifiSelected}</p><button className="mt-3 border rounded px-4 py-1 text-xs" onClick={()=>{setWifiConnected(false);setWifiSelected(null);setWifiPassword('');updateWindowsPreferences({network:''});}}>연결 끊기</button><p className="text-[10px] mt-2 text-gray-500">앱 안의 연습용 연결입니다.</p>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Calendar popup */}
        <AnimatePresence>
          {calendarOpen && (
            <>
              <div className="fixed inset-0 z-[55]" onClick={() => setCalendarOpen(false)} />
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 10, opacity: 0 }}
                className="absolute right-2 bottom-14 z-[56] bg-white/95 backdrop-blur-xl rounded-xl border border-gray-200 shadow-2xl p-4 w-72 max-w-[calc(100vw-1rem)]"
                onClick={(e) => e.stopPropagation()}
              >
                <CalendarPopup />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {taskView&&<div className="absolute inset-0 z-[95] bg-slate-800/80 backdrop-blur-md p-8 flex flex-col items-center justify-center gap-4" onClick={()=>setTaskView(false)}><h2 className="text-white text-xl">열려 있는 앱</h2><div className="flex flex-wrap gap-3">{runningApps.map(a=><button key={a} onClick={e=>{e.stopPropagation();setOpenApp(a);setTaskView(false);if(currentQuestType==='shortcut-alt-tab'&&runningApps.length>=2&&a!==openApp)triggerSuccess();}} className="bg-white rounded-xl p-6 shadow">{{mypc:'파일 탐색기',edge:'Edge',hangul:'한글',excel:'Excel',ppt:'PowerPoint',settings:'설정',notepad:'메모장'}[a]}</button>)}</div><p className="text-white/80 text-xs">실제 Alt+Tab은 기기가 처리할 수 있어요. 이 화면에서 앱을 선택해 전환하세요.</p></div>}
      {nightLight&&<div className="absolute inset-0 bg-amber-400/10 pointer-events-none z-[90]"/>}
      {notice&&<div role="status" className="absolute bottom-16 left-1/2 -translate-x-1/2 z-[110] bg-white shadow-xl border rounded-xl px-5 py-3 text-sm max-w-[90%]">{notice}</div>}
      {powerState!=='on'&&<div className="absolute inset-0 z-[96] bg-[#102447] text-white flex flex-col gap-5 items-center justify-center"><Power size={42}/><h2 className="text-2xl">{powerState==='off'?'연습용 PC가 종료되었습니다':'절전 모드입니다'}</h2><p className="text-sm">실제 컴퓨터 전원은 바뀌지 않습니다.</p><button className="bg-white text-blue-800 rounded-lg px-6 py-3" onClick={()=>{setPowerState('on');setShutdownStep(0);}}>연습용 PC 켜기</button></div>}
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
    role="button" tabIndex={0} aria-label={label} data-desktop-icon={id}
    onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();onClick(e as unknown as React.MouseEvent);onClick(e as unknown as React.MouseEvent);}}}
    onClick={(e) => {
      if (id && onSelect) onSelect(id);
      onClick(e);
    }}
  >
    <div className="w-10 h-10 flex items-center justify-center">{icon}</div>
    <span className="text-[10px] text-white text-center leading-tight drop-shadow-sm">{label}</span>
  </div>
);

const CtxItem = ({ icon, label, onClick }: { icon: string; label: string; onClick?:()=>void }) => (
  <button onClick={onClick} disabled={!onClick} title={!onClick?"파일 탐색기에서 연습할 수 있어요.":label} className="w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 text-gray-700 hover:bg-blue-50 transition-colors">
    <span>{icon}</span> {label}
  </button>
);

const QSTile = ({icon,label,active,chevron,highlight,onClick,onToggle}:{icon:React.ReactNode;label:string;active?:boolean;chevron?:boolean;highlight?:boolean;onClick?:()=>void;onToggle?:()=>void}) => (
  <div className="flex flex-col gap-1 items-center min-w-0">
    <div className={`w-full flex rounded-md border overflow-hidden ${active?'bg-[#0067c0] text-white border-[#0067c0]':'bg-white text-gray-700 border-gray-300'} ${highlight?'ring-2 ring-yellow-400':''}`}>
      <button aria-label={onToggle?`${label} 켜기 또는 끄기`:label} aria-pressed={active||false} onClick={onToggle||onClick} className="flex-1 flex justify-center items-center py-3 hover:bg-black/10" disabled={!onToggle&&!onClick}>{icon}</button>
      {chevron&&<button aria-label={`${label} 연결 관리`} title={`${label} 연결 관리`} onClick={onClick} className="w-7 border-l border-current/15 hover:bg-black/10 flex items-center justify-center"><ChevronRight size={14}/></button>}
    </div>
    <span className="text-[11px] text-gray-700 truncate w-full text-center">{label}</span>
  </div>
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
