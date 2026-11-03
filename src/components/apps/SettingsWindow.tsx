import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Accessibility, ArrowLeft, Bluetooth, Check, ChevronRight, CircleHelp, Home, ImageIcon, Info, Laptop, LockKeyhole, Monitor, Palette, Search, Settings, Shield, Sun, Upload, UserRound, Volume2, Wifi, X } from "lucide-react";
import WindowFrame from "./WindowFrame";
import { AppIcon } from "../icons/WindowsIcon";
import ViewportDialog from "./ViewportDialog";
import "./SettingsWindow.css";
import { useQuestEmit } from "@/features/quests/useQuestEngine";

export interface WindowsPreferences {
  background: string;
  volume: number;
  brightness: number;
  dark: boolean;
  scale: number;
  wifi: boolean;
  network: string;
  bluetooth: boolean;
  camera: boolean;
  microphone: boolean;
  location: boolean;
}
const PREF_KEY = "windows-expedition-preferences-v1";
const DEFAULTS: WindowsPreferences = { background: "linear-gradient(135deg,#102b74 0%,#176ada 40%,#59bcec 70%,#b9e8fa 100%)", volume: 60, brightness: 100, dark: false, scale: 100, wifi: true, network: "학교 연습 Wi-Fi", bluetooth: false, camera: true, microphone: false, location: false };
const bounded = (value: unknown, fallback: number, min = 0, max = 100) => typeof value === "number" && Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
export function getWindowsPreferences(): WindowsPreferences {
  try {
    const raw = JSON.parse(localStorage.getItem(PREF_KEY) || "{}");
    if (!raw || typeof raw !== "object") return { ...DEFAULTS };
    const background = typeof raw.background === "string" && raw.background.length < 1_400_000 && (/^linear-gradient\([#\w\s,.%()-]+\)$/.test(raw.background) || /^#[a-f\d]{6}$/i.test(raw.background) || /^data:image\/(jpeg|png|webp);base64,[a-z\d+/=]+$/i.test(raw.background)) ? raw.background : DEFAULTS.background;
    return { ...DEFAULTS, background, volume: bounded(raw.volume, 60), brightness: bounded(raw.brightness, 100, 30), scale: bounded(raw.scale, 100, 100, 150), dark: typeof raw.dark === "boolean" ? raw.dark : false, wifi: typeof raw.wifi === "boolean" ? raw.wifi : true, network: ["우리집 WiFi", "학교 연습 Wi-Fi", "공개 연습망", ""].includes(raw.network) ? raw.network : DEFAULTS.network, bluetooth: raw.bluetooth === true, camera: raw.camera !== false, microphone: raw.microphone === true, location: raw.location === true };
  } catch { return { ...DEFAULTS }; }
}
export function updateWindowsPreferences(changes: Partial<WindowsPreferences>) {
  const next = { ...getWindowsPreferences(), ...changes };
  try { localStorage.setItem(PREF_KEY, JSON.stringify(next)); } catch { /* Session state still updates when persistence is blocked. */ }
  window.dispatchEvent(new CustomEvent("win-settings-changed", { detail: next }));
  return next;
}
// Practice credentials intentionally remain in memory. Refreshing the page clears them.
let practicePin = "";
let practicePassword = "";
export const hasPracticeLock = () => Boolean(practicePin || practicePassword);
export const verifyPracticeLock = (value: string) => Boolean(value) && (value === practicePin || value === practicePassword);
const dispatchAction = (action: string) => window.dispatchEvent(new CustomEvent("win-settings-action", { detail: { action } }));
const wallpapers = [
  { label: "파란 물결", value: DEFAULTS.background },
  { label: "보라 오로라", value: "linear-gradient(135deg,#202357 0%,#7654cd 40%,#d899de 75%,#f2d5ee 100%)" },
  { label: "초록 숲", value: "linear-gradient(145deg,#123d32 0%,#247a62 38%,#6cb193 70%,#d1ece0 100%)" },
  { label: "따뜻한 노을", value: "linear-gradient(135deg,#633356 0%,#be6174 40%,#f3b38b 75%,#ffe4b7 100%)" },
];
const pages = [
  { id: "home", label: "홈", icon: Home },
  { id: "system", label: "시스템", icon: Laptop },
  { id: "bluetooth", label: "Bluetooth 및 장치", icon: Bluetooth },
  { id: "network", label: "네트워크 및 인터넷", icon: Wifi },
  { id: "background", label: "개인 설정", icon: Palette },
  { id: "accounts", label: "계정", icon: UserRound },
  { id: "accessibility", label: "접근성", icon: Accessibility },
  { id: "privacy", label: "개인 정보 및 보안", icon: Shield },
  { id: "update", label: "Windows 업데이트", icon: Settings },
];
const pageTitle: Record<string, string> = { home: "홈", system: "시스템", display: "시스템  ›  디스플레이", sound: "시스템  ›  소리", bluetooth: "Bluetooth 및 장치", network: "네트워크 및 인터넷", background: "개인 설정  ›  배경", accounts: "계정  ›  로그인 옵션", accessibility: "접근성  ›  텍스트 크기", privacy: "개인 정보 및 보안", update: "Windows 업데이트", about: "시스템  ›  정보" };
const Switch = ({ label, value, onChange }: { label: string; value: boolean; onChange: () => void }) => <button type="button" role="switch" aria-label={label} aria-checked={value} className={`ws-switch ${value ? "is-on" : ""}`} onClick={onChange}><span /></button>;
const Card = ({ icon, title, description, children, onClick }: { icon?: ReactNode; title: string; description?: string; children?: ReactNode; onClick?: () => void }) => {
  const body = <>{icon && <span className="ws-card-icon">{icon}</span>}<span className="ws-card-copy"><strong>{title}</strong>{description && <small>{description}</small>}</span>{children}{onClick && <ChevronRight size={17} />}</>;
  return onClick ? <button type="button" className="ws-card ws-card-button" onClick={onClick}>{body}</button> : <div className="ws-card">{body}</div>;
};
interface SettingsWindowProps { onClose: () => void; onMinimize?: () => void; initialPage?: string; onBackgroundChange?: (value: string) => void; onVolumeChange?: (value: number) => void; }
export default function SettingsWindow({ onClose, onMinimize, initialPage = "home", onBackgroundChange, onVolumeChange }: SettingsWindowProps) {
  const emit = useQuestEmit();
  const authFormId = useId();
  const networkFormId = useId();
  const unlockFormId = useId();
  const [prefs, setPrefs] = useState(getWindowsPreferences);
  const [page, setPage] = useState(pageTitle[initialPage] ? initialPage : "home");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [storageError, setStorageError] = useState(false);
  const [authKind, setAuthKind] = useState<"pin" | "password" | null>(null);
  const [authMode, setAuthMode] = useState<"set" | "remove">("set");
  const [current, setCurrent] = useState("");
  const [secret, setSecret] = useState("");
  const [confirm, setConfirm] = useState("");
  const [authError, setAuthError] = useState("");
  const [authRevision, setAuthRevision] = useState(0);
  const [locked, setLocked] = useState(false);
  const [unlockValue, setUnlockValue] = useState("");
  const [unlockError, setUnlockError] = useState("");
  const [completed, setCompleted] = useState<string[]>([]);
  const [networkTarget, setNetworkTarget] = useState("");
  const [networkPassword, setNetworkPassword] = useState("");
  const [networkError, setNetworkError] = useState("");
  const [pairing, setPairing] = useState("");
  const [paired, setPaired] = useState<string[]>([]);
  const [updateState, setUpdateState] = useState<"idle" | "checking" | "done">("idle");
  const [updateProgress, setUpdateProgress] = useState(0);
  const [loadingImage, setLoadingImage] = useState(false);
  const imageInput = useRef<HTMLInputElement>(null);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => { if (pageTitle[initialPage]) setPage(initialPage); }, [initialPage]);
  useEffect(() => {
    const changed = (event: Event) => { const detail = (event as CustomEvent<Partial<WindowsPreferences>>).detail; if (detail && typeof detail === "object") setPrefs(previous => ({ ...previous, ...detail })); };
    window.addEventListener("win-settings-changed", changed);
    return () => window.removeEventListener("win-settings-changed", changed);
  }, []);
  useEffect(() => {
    if (updateState !== "checking") return;
    const timer = window.setInterval(() => setUpdateProgress(v => Math.min(100, v + 20)), 300);
    return () => window.clearInterval(timer);
  }, [updateState]);
  useEffect(() => { if (updateState === "checking" && updateProgress === 100) { setUpdateState("done"); mark("update"); } }, [updateProgress, updateState]);
  const mark = (id: string) => setCompleted(list => list.includes(id) ? list : [...list, id]);
  const go = (id: string) => { setHistory(list => [...list, page]); setPage(id); setSearch(""); };
  const back = () => { setPage(history[history.length - 1] || "home"); setHistory(list => list.slice(0, -1)); };
  const patch = (changes: Partial<WindowsPreferences>) => {
    const next = { ...prefs, ...changes };
    setPrefs(next);
    try { localStorage.setItem(PREF_KEY, JSON.stringify(next)); setStorageError(false); } catch { setStorageError(true); }
    window.dispatchEvent(new CustomEvent("win-settings-changed", { detail: next }));
    if (changes.background !== undefined) { onBackgroundChange?.(changes.background); mark("background"); dispatchAction("background-changed"); }
    if (changes.volume !== undefined) { onVolumeChange?.(changes.volume); mark("volume"); dispatchAction("volume-changed"); }
    if (changes.brightness !== undefined) dispatchAction("brightness-changed");
  };
  const beginAuth = (kind: "pin" | "password", mode: "set" | "remove" = "set") => { setAuthKind(kind); setAuthMode(mode); setCurrent(""); setSecret(""); setConfirm(""); setAuthError(""); };
  const saveAuth = () => {
    const existing = authKind === "pin" ? practicePin : practicePassword;
    if (existing && current !== existing) { setAuthError("현재 연습용 암호가 맞지 않습니다."); return; }
    if (authMode !== "remove") {
      if (authKind === "pin" && !/^\d{4,12}$/.test(secret)) { setAuthError("이 연습에서는 숫자 4~12자리로 PIN을 만드세요."); return; }
      if (authKind === "password" && (secret.length < 4 || secret.length > 64)) { setAuthError("이 연습에서는 암호를 4~64자로 만드세요."); return; }
      if (secret !== confirm) { setAuthError("두 번 입력한 내용이 다릅니다. 다시 확인하세요."); return; }
    }
    if (authKind === "pin") practicePin = authMode === "remove" ? "" : secret;
    else practicePassword = authMode === "remove" ? "" : secret;
    if (authMode !== "remove") { mark("lock"); dispatchAction(`${authKind}-created`); }
    setNotice(authMode === "remove" ? "연습용 잠금 방법을 제거했습니다." : "연습용 잠금 방법을 설정했습니다. 잠금 테스트로 확인해 보세요.");
    setAuthRevision(v => v + 1); setAuthKind(null); setSecret(""); setConfirm(""); setCurrent("");
  };
  const startLock = () => { setUnlockValue(""); setUnlockError(""); setLocked(true); dispatchAction("screen-locked"); };
  const unlock = () => { if (!verifyPracticeLock(unlockValue)) { setUnlockError("PIN 또는 암호가 맞지 않습니다. 다시 입력하세요."); return; } setLocked(false); setUnlockValue(""); mark("unlock"); setNotice("직접 설정한 연습용 암호로 잠금을 해제했습니다."); dispatchAction("screen-unlocked"); };
  const chooseImage = async (file?: File) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setNotice("JPG, PNG 또는 WebP 사진을 선택하세요."); return; }
    if (file.size > 15 * 1024 * 1024) { setNotice("15MB 이하의 사진을 선택하세요."); return; }
    setLoadingImage(true);
    const url = URL.createObjectURL(file);
    try {
      const image = new Image(); image.src = url;
      await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error("이미지를 열 수 없습니다.")); });
      const ratio = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement("canvas"); canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio)); canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
      const context = canvas.getContext("2d"); if (!context) throw new Error("사진을 처리할 수 없습니다.");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      let quality = 0.85; let data = canvas.toDataURL("image/jpeg", quality);
      while (data.length > 1_000_000 && quality > 0.25) { quality -= 0.15; data = canvas.toDataURL("image/jpeg", quality); }
      if (data.length > 1_000_000) throw new Error("사진의 크기를 줄인 후 다시 선택하세요.");
      if (mounted.current) { patch({ background: data }); setNotice("사진을 연습용 바탕 화면에 적용했습니다."); }
    } catch (error) { if (mounted.current) setNotice(error instanceof Error ? error.message : "사진을 불러오지 못했습니다."); }
    finally { URL.revokeObjectURL(url); if (mounted.current) setLoadingImage(false); }
  };
  const connectNetwork = () => {
    const expectedKey = networkTarget === "우리집 WiFi" ? "12345678" : networkTarget === "학교 연습 Wi-Fi" ? "class2026" : "";
    if (expectedKey && networkPassword !== expectedKey) { setNetworkError(`연습용 네트워크 보안 키 ${expectedKey}를 입력하세요.`); return; }
    patch({ wifi: true, network: networkTarget });
    // This is a fixed practice key, passed only to the active quest validator; never saved.
    if (networkTarget === "우리집 WiFi") emit({ type: "WIFI_CONNECTED", ssid: networkTarget, password: networkPassword });
    setNetworkTarget(""); setNetworkPassword(""); setNetworkError(""); mark("network"); dispatchAction("wifi-connected");
  };
  const slider = (key: "brightness" | "volume" | "scale", label: string, min = 0, max = 100) => <label className="ws-range"><span>{label}</span><input aria-label={label} type="range" min={min} max={max} value={prefs[key]} onChange={e => patch({ [key]: Number(e.target.value) })} /><output>{prefs[key]}%</output></label>;
  const isNavActive = (id: string) => id === page || id === "system" && ["display", "sound", "about"].includes(page);
  const matchingPages = Object.entries(pageTitle).filter(([id, title]) => title.toLocaleLowerCase().includes(search.toLocaleLowerCase()) || ({ accounts: "비밀번호 암호 잠금 PIN", background: "배경화면 사진", display: "밝기 화면", sound: "볼륨 음량 소리", privacy: "카메라 마이크 권한", network: "와이파이 Wi-Fi" }[id] || "").toLocaleLowerCase().includes(search.toLocaleLowerCase()));
  void authRevision;
  return <WindowFrame title="설정" icon={<AppIcon name="settings" className="w-4 h-4" />} onClose={onClose} onMinimize={onMinimize}>
    <div className={`ws-settings ${prefs.dark ? "ws-dark" : ""}`} style={{ fontSize: `${prefs.scale}%` }}>
      <aside className="ws-sidebar">
        <div className="ws-profile"><span className="ws-avatar"><UserRound size={27} /></span><div><strong>탐험대원</strong><small>로컬 연습 계정</small></div></div>
        <label className="ws-search"><Search size={16} /><input aria-label="설정 찾기" value={search} onChange={e => setSearch(e.target.value)} placeholder="설정 찾기" /></label>
        <nav aria-label="설정 범주">{pages.map(item => <button key={item.id} type="button" aria-label={item.label} title={item.label} aria-current={isNavActive(item.id) ? "page" : undefined} className={isNavActive(item.id) ? "selected" : ""} onClick={() => go(item.id)}><item.icon size={19} /><span>{item.label}</span></button>)}</nav>
        <p className="ws-sim-note"><Info size={14} />학습용 모의 설정<br />실제 PC 설정은 바뀌지 않아요.</p>
      </aside>
      <main className="ws-main">
        <div className="ws-heading"><button aria-label="설정 이전 화면" className="ws-icon-button" type="button" onClick={back}><ArrowLeft size={19} /></button><h1>{search ? "검색 결과" : pageTitle[page]}</h1></div>
        {storageError && <div role="status" className="ws-message">브라우저 저장 공간이 부족합니다. 현재 창에서는 적용되지만 다음 실행까지 보관되지 않을 수 있습니다.</div>}
        {notice && <div role="status" className="ws-message"><span>{notice}</span><button aria-label="안내 닫기" onClick={() => setNotice("")}><X size={15} /></button></div>}
        {search ? <div className="ws-cards">{matchingPages.length ? matchingPages.map(([id, title]) => <Card key={id} title={title} onClick={() => go(id)} />) : <p className="ws-muted">찾은 설정이 없습니다. ‘암호’, ‘배경’, ‘음량’으로 검색해 보세요.</p>}</div> : <>
          {page === "home" && <>
            <div className="ws-device"><Monitor size={54} className="ws-blue" /><div><h2>탐험대-PC</h2><p>Windows 11 · 연습용 컴퓨터</p></div><span className="ws-connected"><Wifi size={17} />{prefs.wifi ? prefs.network || "연결 안 됨" : "Wi-Fi 꺼짐"}</span></div>
            <h2>추천 설정</h2><div className="ws-cards"><Card icon={<Palette />} title="내 바탕 화면 꾸미기" description="사진과 색으로 배경 변경" onClick={() => go("background")} /><Card icon={<LockKeyhole />} title="안전한 로그인" description="연습용 PIN과 암호를 만들고 잠금 해제" onClick={() => go("accounts")} /><Card icon={<Volume2 />} title="소리" description="볼륨과 출력 장치 확인" onClick={() => go("sound")} /></div>
            <section className="ws-practice"><h2>직접 해 본 설정</h2>{[["background", "배경 바꾸기"], ["volume", "볼륨 조절하기"], ["lock", "PIN 또는 암호 만들기"], ["unlock", "암호로 잠금 해제하기"], ["network", "Wi-Fi 연결하기"], ["update", "업데이트 확인하기"]].map(([id, label]) => <div key={id}><span className={completed.includes(id) ? "ws-check complete" : "ws-check"}>{completed.includes(id) && <Check size={13} />}</span>{label}</div>)}</section>
          </>}
          {page === "system" && <div className="ws-cards"><Card icon={<Monitor />} title="디스플레이" description="밝기, 야간 모드 및 화면 배율" onClick={() => go("display")} /><Card icon={<Volume2 />} title="소리" description="볼륨 및 출력 장치" onClick={() => go("sound")} /><Card icon={<Info />} title="정보" description="장치 사양과 Windows 사양" onClick={() => go("about")} /></div>}
          {page === "display" && <><div className="ws-display-preview"><Monitor size={85} strokeWidth={1.3} /><b>1</b></div><h2>밝기 및 색</h2><div className="ws-cards"><div className="ws-card ws-stack">{slider("brightness", "밝기", 30)}</div><Card icon={<Sun />} title="설정 창 다크 모드" description="이 설정 창의 색을 어둡게 바꿉니다."><Switch label="설정 창 다크 모드" value={prefs.dark} onChange={() => patch({ dark: !prefs.dark })} /></Card></div><h2>배율 및 레이아웃</h2><Card title="텍스트 크기" description="글자를 읽기 편한 크기로 조절합니다." onClick={() => go("accessibility")} /><p className="ws-muted">밝기는 연습 화면에 적용됩니다. 모니터의 실제 밝기는 바뀌지 않습니다.</p></>}
          {page === "sound" && <><h2>출력</h2><Card icon={<Volume2 />} title="스피커" description="연습용 기본 출력 장치"><span className="ws-badge">기본값</span></Card><div className="ws-card ws-stack">{slider("volume", "볼륨")}<div className="ws-inline"><button className="ws-button" onClick={() => patch({ volume: prefs.volume === 0 ? 60 : 0 })}>{prefs.volume === 0 ? "음소거 해제" : "음소거"}</button><button className="ws-button" onClick={() => { try { const AudioCtor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext; if (!AudioCtor) throw new Error(); const ctx = new AudioCtor(); const oscillator = ctx.createOscillator(); const gain = ctx.createGain(); gain.gain.value = prefs.volume / 100 * 0.12; oscillator.frequency.value = 660; oscillator.connect(gain); gain.connect(ctx.destination); oscillator.start(); oscillator.stop(ctx.currentTime + 0.35); oscillator.onended = () => void ctx.close(); setNotice(prefs.volume ? "테스트 소리를 재생했습니다. 실제 PC 볼륨도 켜져 있어야 들립니다." : "볼륨이 0입니다. 볼륨을 높여 보세요."); } catch { setNotice("이 브라우저에서는 테스트 소리를 재생할 수 없습니다."); } }}>소리 테스트</button></div></div><p className="ws-muted">이 볼륨은 웹앱의 연습용 소리 크기입니다.</p></>}
          {page === "background" && <><div className="ws-wallpaper-preview" style={prefs.background.startsWith("data:") ? { backgroundImage: `url(${prefs.background})` } : { background: prefs.background }}><span>탐험대의 바탕 화면</span></div><Card title="배경 개인 설정"><select aria-label="배경 종류" value={prefs.background.startsWith("#") ? "color" : "picture"} onChange={e => patch({ background: e.target.value === "color" ? "#176ada" : wallpapers[0].value })}><option value="picture">그림</option><option value="color">단색</option></select></Card><h2>최근 이미지</h2><div className="ws-wallpapers">{wallpapers.map(item => <button aria-label={`${item.label} 배경 적용`} aria-pressed={prefs.background === item.value} key={item.label} style={{ background: item.value }} onClick={() => patch({ background: item.value })}>{prefs.background === item.value && <Check size={19} />}<span>{item.label}</span></button>)}</div><Card icon={<ImageIcon />} title="사진 선택" description="선택한 사진은 이 브라우저에만 보관됩니다."><button className="ws-button" disabled={loadingImage} onClick={() => imageInput.current?.click()}><Upload size={15} />{loadingImage ? "처리 중…" : "사진 찾아보기"}</button><input ref={imageInput} className="sr-only" aria-label="배경 사진 파일" type="file" accept="image/png,image/jpeg,image/webp" onChange={e => { void chooseImage(e.target.files?.[0]); e.target.value = ""; }} /></Card><h2>배경색 선택</h2><div className="ws-color-options">{["#176ada", "#152747", "#7352a3", "#2c7864", "#d58b54", "#e6e9f0", "#181818"].map(color => <button key={color} aria-label={`${color} 배경색`} aria-pressed={prefs.background === color} style={{ background: color }} onClick={() => patch({ background: color })}>{prefs.background === color && <Check size={18} />}</button>)}</div></>}
          {page === "accounts" && <><div className="ws-security-note"><Shield size={20} /><p><strong>연습용 잠금만 설정해요.</strong><br />실제 사용하는 암호를 입력하지 마세요. 연습용 PIN·암호는 새로고침하면 지워집니다.</p></div><h2>로그인하는 방법</h2>{([{ kind: "pin" as const, title: "PIN (Windows Hello)", description: "숫자로 빠르게 로그인합니다.", exists: Boolean(practicePin) }, { kind: "password" as const, title: "암호", description: "연습용 암호를 만들어 계정을 보호합니다.", exists: Boolean(practicePassword) }]).map(item => <Card key={item.kind} icon={<LockKeyhole />} title={item.title} description={`${item.description} · ${item.exists ? "설정됨" : "아직 설정하지 않음"}`}><div className="ws-inline"><button className="ws-button" onClick={() => beginAuth(item.kind)}>{item.exists ? "변경" : "설정"}</button>{item.exists && <button className="ws-button" onClick={() => beginAuth(item.kind, "remove")}>제거</button>}</div></Card>)}<Card title="잠금 화면에서 확인하기" description="설정한 연습용 PIN 또는 암호로 직접 잠금을 해제합니다."><button className="ws-button ws-primary" disabled={!hasPracticeLock()} onClick={startLock}>잠금 테스트</button></Card><p className="ws-muted">PIN 또는 암호를 설정하면 잠금 테스트가 활성화됩니다. 얼굴·지문 등록은 이 웹 연습 환경에서 지원하지 않습니다.</p></>}
          {page === "network" && <><Card icon={<Wifi />} title="Wi-Fi" description={prefs.wifi ? prefs.network ? `${prefs.network} · 연결됨 (연습)` : "연결 안 됨" : "꺼짐"}><Switch label="Wi-Fi" value={prefs.wifi} onChange={() => patch({ wifi: !prefs.wifi, network: prefs.wifi ? "" : prefs.network })} /></Card>{prefs.wifi && <><h2>사용 가능한 네트워크 (연습)</h2>{["우리집 WiFi", "학교 연습 Wi-Fi", "공개 연습망"].map(name => <Card key={name} icon={<Wifi />} title={name} description={prefs.network === name ? "연결됨 · 보안" : name === "공개 연습망" ? "개방형 연습망 · 실제 공용망은 주의하세요" : name === "우리집 WiFi" ? "보안 · 연습용 키: 12345678" : "보안 · 연습용 키: class2026"}><button className="ws-button" onClick={() => { if (prefs.network === name) patch({ network: "" }); else { setNetworkTarget(name); setNetworkPassword(""); setNetworkError(""); } }}>{prefs.network === name ? "연결 끊기" : "연결"}</button></Card>)}</>}<p className="ws-muted">실제 네트워크를 검색하거나 연결하지 않습니다. 네트워크 선택·보안 키 입력 순서를 연습합니다.</p></>}
          {page === "bluetooth" && <><Card icon={<Bluetooth />} title="Bluetooth" description={prefs.bluetooth ? "탐험대-PC로 검색할 수 있습니다. (연습)" : "꺼짐"}><Switch label="Bluetooth" value={prefs.bluetooth} onChange={() => patch({ bluetooth: !prefs.bluetooth })} /></Card>{prefs.bluetooth && <><h2>장치 추가 (연습)</h2>{["탐험대 무선 마우스", "교실 헤드폰"].map(name => <Card key={name} icon={<Bluetooth />} title={name} description={paired.includes(name) ? "연결됨 (연습)" : "페어링 준비됨"}><button className="ws-button" onClick={() => { if (paired.includes(name)) setPaired(list => list.filter(x => x !== name)); else setPairing(name); }}>{paired.includes(name) ? "장치 제거" : "연결"}</button></Card>)}</>}<p className="ws-muted">실제 Bluetooth 장치를 검색하거나 연결하지 않습니다.</p></>}
          {page === "accessibility" && <><h2>미리 보기</h2><div className="ws-card"><p>탐험대원 여러분, 반가워요!<br />글자를 읽기 편한 크기로 조절해 보세요.</p></div><div className="ws-card ws-stack">{slider("scale", "텍스트 크기", 100, 150)}</div><p className="ws-muted">이 설정 창의 텍스트 크기를 100~150%로 조절합니다. 브라우저 전체 확대와는 별개입니다.</p><Card title="텍스트 크기 복원"><button className="ws-button" onClick={() => patch({ scale: 100 })}>100%로 복원</button></Card></>}
          {page === "privacy" && <><div className="ws-security-note"><Shield size={20} /><p>필요한 기능에만 권한을 허용하세요. 아래 항목은 권한 설정 연습이며, 실제 브라우저의 카메라·마이크 권한은 별도로 요청됩니다.</p></div><h2>앱 사용 권한</h2>{([{ key: "camera" as const, title: "카메라", description: "촬영할 때만 사용을 허용합니다." }, { key: "microphone" as const, title: "마이크", description: "녹음이 필요할 때 허용합니다." }, { key: "location" as const, title: "위치", description: "현재 위치가 꼭 필요한지 먼저 확인합니다." }]).map(item => <Card key={item.key} title={item.title} description={item.description}><Switch label={`${item.title} 연습 권한`} value={prefs[item.key]} onChange={() => { patch({ [item.key]: !prefs[item.key] }); dispatchAction("permission-changed"); }} /></Card>)}</>}
          {page === "update" && <><div className="ws-update-hero"><Shield size={64} className="ws-blue" /><div><h2>{updateState === "checking" ? "업데이트 확인 중…" : updateState === "done" ? "최신 상태입니다 (연습 결과)" : "업데이트를 확인해 보세요"}</h2><p>Windows 업데이트 절차 연습</p></div></div><Card title="업데이트 확인" description="실제 업데이트 파일을 내려받거나 설치하지 않습니다."><button className="ws-button ws-primary" disabled={updateState === "checking"} onClick={() => { setUpdateProgress(0); setUpdateState("checking"); }}>업데이트 확인</button></Card>{updateState === "checking" && <div className="ws-progress" role="progressbar" aria-label="연습 업데이트 확인" aria-valuenow={updateProgress} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${updateProgress}%` }} /></div>}{updateState === "done" && <div className="ws-message"><Check size={17} />확인 연습을 마쳤습니다. 실제 PC에서는 교실 선생님의 안내에 따라 업데이트하세요.</div>}<Card title="Windows 버전 확인" description="현재 학습 화면의 기준 버전을 확인합니다." onClick={() => go("about")} /></>}
          {page === "about" && <><h2>장치 사양 (연습)</h2><div className="ws-specs"><dl><dt>장치 이름</dt><dd>탐험대-PC</dd><dt>사용자</dt><dd>탐험대원 · 로컬 연습 계정</dd><dt>시스템 종류</dt><dd>웹 기반 Windows 학습 시뮬레이터</dd></dl></div><h2>Windows 사양 (화면 기준)</h2><div className="ws-specs"><dl><dt>에디션</dt><dd>Windows 11 학습용 모의 환경</dd><dt>버전</dt><dd>26H2 (2026 Update)</dd><dt>기준 확인일</dt><dd>2026년 11월 2일</dd></dl></div><p className="ws-muted">현재 PC의 실제 사양을 읽은 결과가 아닙니다. Windows·Office의 일부 기본 동작을 학습할 수 있도록 구성했습니다.</p><a className="ws-source" href="https://learn.microsoft.com/en-us/windows/release-health/status-windows-11-26h2" target="_blank" rel="noreferrer"><CircleHelp size={16} />Microsoft 공식 버전 안내</a></>}
        </>}
      </main>
      {authKind && <ViewportDialog
        title={`${authKind === "pin" ? "PIN" : "암호"} ${authMode === "remove" ? "제거" : (authKind === "pin" ? practicePin : practicePassword) ? "변경" : "설정"}`}
        onClose={() => { setAuthKind(null); setCurrent(""); setSecret(""); setConfirm(""); setAuthError(""); }}
        className={`ws-settings-dialog ${prefs.dark ? "ws-dark" : ""}`}
        style={{ fontSize: `${14 * prefs.scale / 100}px`, maxWidth: 430 }}
        bodyClassName="ws-dialog-form-body"
        footer={<><button type="button" className="ws-button" onClick={() => { setAuthKind(null); setCurrent(""); setSecret(""); setConfirm(""); setAuthError(""); }}>취소</button><button type="submit" form={authFormId} className="ws-button ws-primary">{authMode === "remove" ? "제거" : "확인"}</button></>}
      >
        <p className="ws-muted">실제 암호 대신 연습용 값을 입력하세요. 새로고침하면 지워집니다.</p>
        <form id={authFormId} onSubmit={e => { e.preventDefault(); saveAuth(); }}>
          {(authKind === "pin" ? practicePin : practicePassword) && <label>현재 연습용 {authKind === "pin" ? "PIN" : "암호"}<input autoFocus autoComplete="off" aria-label="현재 연습용 암호" type="password" value={current} onChange={e => setCurrent(e.target.value)} maxLength={64} /></label>}
          {authMode === "set" && <><label>새 연습용 {authKind === "pin" ? "PIN" : "암호"}<input autoComplete="new-password" autoFocus={!(authKind === "pin" ? practicePin : practicePassword)} aria-label="새 연습용 암호" type="password" inputMode={authKind === "pin" ? "numeric" : "text"} value={secret} onChange={e => setSecret(e.target.value)} maxLength={authKind === "pin" ? 12 : 64} /></label><label>한 번 더 입력<input autoComplete="new-password" aria-label="연습용 암호 확인" type="password" inputMode={authKind === "pin" ? "numeric" : "text"} value={confirm} onChange={e => setConfirm(e.target.value)} maxLength={authKind === "pin" ? 12 : 64} /></label></>}
          {authError && <p className="ws-error" role="alert">{authError}</p>}
        </form>
      </ViewportDialog>}
      {locked && <ViewportDialog
        title="연습 잠금 화면" ariaLabel="연습 잠금 화면"
        onClose={() => { setLocked(false); setUnlockValue(""); setUnlockError(""); }}
        className={`ws-settings-dialog ws-lock-dialog ${prefs.dark ? "ws-dark" : ""}`}
        style={{ fontSize: `${14 * prefs.scale / 100}px`, maxWidth: 480 }}
        bodyClassName="ws-lock-dialog-body"
        footer={<><button type="button" className="ws-button" onClick={() => { setLocked(false); setUnlockValue(""); setUnlockError(""); }}>연습 종료하고 설정으로 돌아가기</button><button className="ws-button ws-primary" type="submit" form={unlockFormId}>로그인</button></>}
      >
        <div className="ws-lock-content"><div className="ws-lock-avatar"><UserRound size={55} /></div><h2>탐험대원</h2><p>연습 잠금 화면 · 실제 PC는 잠기지 않았습니다.</p><form id={unlockFormId} onSubmit={e => { e.preventDefault(); unlock(); }}><input autoFocus aria-label="잠금 해제용 연습 암호" type="password" autoComplete="off" placeholder={practicePin ? "PIN 또는 암호" : "암호"} value={unlockValue} onChange={e => setUnlockValue(e.target.value)} /></form>{unlockError && <p role="alert">{unlockError}</p>}</div>
      </ViewportDialog>}
      {networkTarget && <ViewportDialog
        title={networkTarget} ariaLabel="Wi-Fi 연결 연습"
        onClose={() => { setNetworkTarget(""); setNetworkPassword(""); setNetworkError(""); }}
        className={`ws-settings-dialog ${prefs.dark ? "ws-dark" : ""}`}
        style={{ fontSize: `${14 * prefs.scale / 100}px`, maxWidth: 430 }}
        bodyClassName="ws-dialog-form-body"
        footer={<><button type="button" className="ws-button" onClick={() => { setNetworkTarget(""); setNetworkPassword(""); setNetworkError(""); }}>취소</button><button type="submit" form={networkFormId} className="ws-button ws-primary">다음</button></>}
      >
        <form id={networkFormId} onSubmit={e => { e.preventDefault(); connectNetwork(); }}>{networkTarget !== "공개 연습망" ? <label>네트워크 보안 키 입력<input autoFocus aria-label="연습 네트워크 보안 키" type="password" autoComplete="off" value={networkPassword} onChange={e => setNetworkPassword(e.target.value)} /><small>연습용 키: {networkTarget === "우리집 WiFi" ? "12345678" : "class2026"} · 실제 Wi-Fi 암호를 입력하지 마세요.</small></label> : <p>공개된 네트워크는 민감한 정보를 주고받지 않도록 주의하세요. 이 연결은 연습입니다.</p>}{networkError && <p role="alert" className="ws-error">{networkError}</p>}</form>
      </ViewportDialog>}
      {pairing && <ViewportDialog
        title="장치를 연결할까요?" ariaLabel="Bluetooth 페어링 연습"
        onClose={() => setPairing("")}
        className={`ws-settings-dialog ${prefs.dark ? "ws-dark" : ""}`}
        style={{ fontSize: `${14 * prefs.scale / 100}px`, maxWidth: 430 }}
        footer={<><button className="ws-button" onClick={() => setPairing("")}>취소</button><button className="ws-button ws-primary" onClick={() => { setPaired(list => [...list, pairing]); setPairing(""); dispatchAction("bluetooth-paired"); }}>연결</button></>}
      ><p>{pairing}</p><p>연습용 페어링 코드: <strong>246810</strong></p><p className="ws-muted">실제 연결에서는 양쪽 장치의 코드가 같은지 확인해야 해요.</p></ViewportDialog>}
    </div>
  </WindowFrame>;
}
