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

export const QUEST_VALIDATORS: Partial<Record<QuestType, QuestValidator>> = {
  click: on("DESKTOP_ICON_CLICKED", (e) => (e.icon === "star" ? "pass" : "wrong")),
  "double-click": on("DESKTOP_ICON_DOUBLE_CLICKED", (e) => (e.icon === "mypc" ? "pass" : "wrong")),
  "right-click": on("DESKTOP_RIGHT_CLICKED", () => "pass"),
  "drag-drop": on("FILE_MOVED", () => "pass"),

  "start-menu": on("START_MENU_OPENED", () => "pass"),
  "start-search": on("START_MENU_SEARCHED", (e) => (e.query.includes("메모장") ? "pass" : "wrong")),
  "open-mypc": on("APP_OPENED", (e) => (e.app === "mypc" ? "pass" : "wrong")),
  "close-mypc": on("APP_CLOSED", (e) => (e.app === "mypc" ? "pass" : "wrong")),
  "wheel-scroll": on("SCROLLED", (e) => (e.app === "mypc" && e.scrollTop > 150 ? "pass" : "ignore")),
  "window-move-resize": anyOf(
    on("WINDOW_MOVED", () => "pass"),
    on("WINDOW_RESIZED", () => "pass"),
  ),
  "create-file": on("FILE_CREATED", (e) => (e.kind === "folder" ? "pass" : "ignore")),
  "rename-folder": on("FILE_RENAMED", (e) => (e.to.trim().length > 0 && e.to !== e.from ? "pass" : "ignore")),
  "delete-file": on("FILE_DELETED", () => "pass"),
  "multi-select": on("FILES_MULTI_SELECTED", (e) => (e.count >= 2 ? "pass" : "ignore")),

  "open-browser": on("APP_OPENED", (e) => (e.app === "edge" ? "pass" : "wrong")),
  "type-url": on("BROWSER_NAVIGATED", (e) => (/naver\.com/i.test(e.url) ? "pass" : "wrong")),
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

  "shortcut-copy": on("SHORTCUT_PRESSED", (e) => (e.shortcut === "copy" ? "pass" : "wrong")),
  "shortcut-paste": on("SHORTCUT_PRESSED", (e) => (e.shortcut === "paste" ? "pass" : "wrong")),
  "shortcut-save": on("SHORTCUT_PRESSED", (e) => (e.shortcut === "save" ? "pass" : "wrong")),
  "shortcut-emoji": on("SHORTCUT_PRESSED", (e) => (e.shortcut === "emoji" ? "pass" : "wrong")),
  "shortcut-alt-tab": on("SHORTCUT_PRESSED", (e) => (e.shortcut === "alt-tab" ? "pass" : "wrong")),

  "open-excel": on("APP_OPENED", (e) => (e.app === "excel" ? "pass" : "wrong")),
  "excel-input": on("CELL_VALUE_ENTERED", (e) =>
    e.cell === "A1" && e.value.trim() === "100" && e.confirmed ? "pass" : "ignore"
  ),

  "open-ppt": on("APP_OPENED", (e) => (e.app === "ppt" ? "pass" : "wrong")),
  "ppt-text": on("TEXT_TYPED", (e) => (e.app === "ppt" && e.value.trim().length > 0 ? "pass" : "ignore")),
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