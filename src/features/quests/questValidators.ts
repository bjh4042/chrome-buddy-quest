import type { QuestType } from "@/types/quest";
import type { LearningEvent } from "./questEvents";

/**
 * A validator returns:
 *  - "pass"  → the current quest is completed by this event
 *  - "wrong" → the event is clearly the wrong target for this quest (hint)
 *  - "ignore"→ event is unrelated; do nothing
 *
 * Keep validators pure: no side effects, no DOM access. UI passes what it knows.
 */
export type ValidationResult = "pass" | "wrong" | "ignore";
export type QuestValidator = (event: LearningEvent) => ValidationResult;

const on = <T extends LearningEvent["type"]>(
  type: T,
  match: (e: Extract<LearningEvent, { type: T }>) => ValidationResult,
): QuestValidator => (event) => (event.type === type ? match(event as Extract<LearningEvent, { type: T }>) : "ignore");

/** Compose several validators — first non-"ignore" result wins. */
const anyOf = (...vs: QuestValidator[]): QuestValidator => (event) => {
  for (const v of vs) {
    const r = v(event);
    if (r !== "ignore") return r;
  }
  return "ignore";
};

/** Exact hostname validation prevents lookalike addresses from passing URL practice. */
export function isNaverAddress(value: string): boolean {
  try {
    const url = new URL(/^https?:\/\//i.test(value.trim()) ? value.trim() : `https://${value.trim()}`);
    return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password &&
      (url.hostname === "naver.com" || url.hostname === "www.naver.com");
  } catch { return false; }
}

/** URL-based Edge missions accept only HTTPS sites represented by the practice browser. */
export function isTrustedPracticeSite(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) return false;
    const host = url.hostname.toLowerCase().replace(/\.$/, '');
    return ['naver.com','bing.com','microsoft.com','school.example'].some(domain => host === domain || host.endsWith('.' + domain)) &&
      !((host === 'bing.com' || host.endsWith('.bing.com')) && url.pathname === '/search');
  } catch { return false; }
}
const hasValue = (value: string) => typeof value === 'string' && value.trim().length > 0;

export const QUEST_VALIDATORS: Partial<Record<QuestType, QuestValidator>> = {
  click: on("DESKTOP_ICON_CLICKED", (e) => (e.icon === "star" ? "pass" : "wrong")),
  "double-click": on("DESKTOP_ICON_DOUBLE_CLICKED", (e) => (e.icon === "mypc" ? "pass" : "wrong")),
  "right-click": on("DESKTOP_RIGHT_CLICKED", () => "pass"),
  "drag-drop": on("FILE_MOVED", (e) => (e.name?.trim() && e.targetFolder?.trim() ? "pass" : "ignore")),

  "start-menu": on("START_MENU_OPENED", () => "pass"),
  "start-search": on("START_MENU_SEARCHED", (e) => (e.query.includes("메모장") ? "pass" : "wrong")),
  "open-mypc": on("APP_OPENED", (e) => (e.app === "mypc" ? "pass" : "wrong")),
  "close-mypc": on("APP_CLOSED", (e) => (e.app === "mypc" ? "pass" : "wrong")),
  "wheel-scroll": on("SCROLLED", (e) => (e.app === "mypc" && e.scrollTop > 150 ? "pass" : "ignore")),
  "window-move-resize": anyOf(
    on("WINDOW_MOVED", (e) => e.app === "mypc" ? "pass" : "ignore"),
    on("WINDOW_RESIZED", (e) => e.app === "mypc" ? "pass" : "ignore"),
  ),
  "create-file": on("FILE_CREATED", (e) => (e.kind === "folder" ? "pass" : "ignore")),
  "rename-folder": on("FILE_RENAMED", (e) => (e.to.trim().length > 0 && e.to !== e.from ? "pass" : "ignore")),
  "delete-file": on("FILE_DELETED", () => "pass"),
  "multi-select": on("FILES_MULTI_SELECTED", (e) => (e.count >= 2 ? "pass" : "ignore")),

  "open-browser": on("APP_OPENED", (e) => (e.app === "edge" ? "pass" : "wrong")),
  "type-url": on("BROWSER_NAVIGATED", (e) => (isNaverAddress(e.url) ? "pass" : "wrong")),
  "edge-favorite-add": on("FAVORITE_ADDED", e => isTrustedPracticeSite(e.url) && hasValue(e.name) && hasValue(e.folder) ? 'pass' : 'wrong'),
  "edge-favorite-open": on("FAVORITE_OPENED", e => isTrustedPracticeSite(e.url) ? 'pass' : 'wrong'),
  "edge-download-file": on("DOWNLOAD_COMPLETED", e => hasValue(e.fileId) && hasValue(e.name) && hasValue(e.folderId) && isTrustedPracticeSite(e.sourceUrl) ? 'pass' : 'wrong'),
  "edge-download-reveal": on("DOWNLOAD_FOLDER_OPENED", e => hasValue(e.fileId) && hasValue(e.folderId) ? 'pass' : 'ignore'),
  "edge-download-move": on("DOWNLOAD_MOVED", e => hasValue(e.fileId) && hasValue(e.from) && hasValue(e.to) && e.from.trim() !== e.to.trim() ? 'pass' : 'ignore'),
  "edge-download-location": on("DOWNLOAD_LOCATION_CHANGED", e => hasValue(e.folderId) && e.folderId.trim() !== 'downloads' ? 'pass' : 'ignore'),
  "edge-find-text": on("BROWSER_TEXT_FOUND", e => e.query.trim() === '안전' && Number.isFinite(e.matches) && e.matches > 0 ? 'pass' : 'ignore'),
  "edge-restore-tab": on("BROWSER_TAB_RESTORED", e => isTrustedPracticeSite(e.url) ? 'pass' : 'wrong'),
  "close-edge": on("APP_CLOSED", (e) => (e.app === "edge" ? "pass" : "wrong")),

  "volume-control": on("VOLUME_CHANGED", (e) => (e.value === 50 ? "pass" : "ignore")),
  "wifi-connect": on("WIFI_CONNECTED", (e) => (e.ssid === "우리집 WiFi" && e.password === "12345678" ? "pass" : "wrong")),

  "open-hangul": on("APP_OPENED", (e) => (e.app === "hangul" ? "pass" : "wrong")),
  "hangul-typing": on("TEXT_TYPED", (e) => (e.app === "hangul" && e.value.includes("안녕하세요") ? "pass" : "ignore")),
  "hangul-font-size": on("TEXT_FORMAT_CHANGED", (e) =>
    e.app === "hangul" && e.property === "font-size" && e.value === "20" && e.withSelection ? "pass" : "ignore"
  ),
  "hangul-font-family": on("TEXT_FORMAT_CHANGED", (e) =>
    e.app === "hangul" && e.property === "font-family" && e.value === "돋움" && e.withSelection ? "pass" : "ignore"
  ),
  "hangul-image": on("IMAGE_INSERTED", (e) => (e.app === "hangul" ? "pass" : "wrong")),
  "hangul-image-resize": on("IMAGE_RESIZED", (e) => (e.app === "hangul" ? "pass" : "wrong")),
  "hangul-table": on("TABLE_INSERTED", (e) => (e.app === "hangul" ? "pass" : "wrong")),
  "hangul-save": on("DOC_SAVED", (e) => (e.app === "hangul" ? "pass" : "wrong")),
  "hangul-open-file": on("DOC_OPENED", (e) => (e.app === "hangul" ? "pass" : "wrong")),

  "shortcut-copy": on("SHORTCUT_PRESSED", (e) => (e.shortcut === "copy" && e.context === "hangul" ? "pass" : "wrong")),
  "shortcut-paste": on("SHORTCUT_PRESSED", (e) => (e.shortcut === "paste" && e.context === "hangul" ? "pass" : "wrong")),
  "shortcut-save": on("SHORTCUT_PRESSED", (e) => (e.shortcut === "save" && e.context === "hangul" ? "pass" : "wrong")),
  "shortcut-emoji": on("SHORTCUT_PRESSED", (e) => (e.shortcut === "emoji" && e.context === "hangul" ? "pass" : "wrong")),
  "shortcut-alt-tab": on("SHORTCUT_PRESSED", (e) => (e.shortcut === "alt-tab" ? "pass" : "wrong")),

  "open-excel": on("APP_OPENED", (e) => (e.app === "excel" ? "pass" : "wrong")),
  "excel-input": on("CELL_VALUE_ENTERED", (e) =>
    e.app === "excel" && e.cell === "A1" && e.value.trim() === "100" && e.confirmed ? "pass" : "ignore"
  ),

  "open-ppt": on("APP_OPENED", (e) => (e.app === "ppt" ? "pass" : "wrong")),
  "ppt-text": on("TEXT_TYPED", (e) => (e.app === "ppt" && e.value.includes("나의 발표") ? "pass" : "ignore")),
  "ppt-font-size": on("TEXT_FORMAT_CHANGED", (e) =>
    e.app === "ppt" && e.property === "font-size" && e.value === "28" && e.withSelection ? "pass" : "ignore"
  ),
  "ppt-font-family": on("TEXT_FORMAT_CHANGED", (e) =>
    e.app === "ppt" && e.property === "font-family" && e.value === "바탕" && e.withSelection ? "pass" : "ignore"
  ),
  "ppt-image": on("IMAGE_INSERTED", (e) => (e.app === "ppt" ? "pass" : "wrong")),
  "ppt-image-resize": on("IMAGE_RESIZED", (e) => (e.app === "ppt" ? "pass" : "wrong")),

  shutdown: on("SYSTEM_SHUTDOWN", () => "pass"),
};

export const validateEvent = (
  quest: QuestType,
  event: LearningEvent,
): ValidationResult => {
  const v = QUEST_VALIDATORS[quest];
  return v ? v(event) : "ignore";
};
