import type { QuestType } from "@/types/quest";

/**
 * Learning events — a stable vocabulary of user actions that the UI can emit.
 * Validators (see questValidators.ts) decide if a given event completes the
 * current quest. UI components stay free of `currentQuestType === "..."` checks.
 */
export type AppName = "mypc" | "edge" | "hangul" | "excel" | "ppt";
export type DesktopIconId = "mypc" | "trash" | "hangul" | "excel" | "ppt" | "star" | "report-txt";

export type ShortcutId = "copy" | "paste" | "save" | "emoji" | "alt-tab";

export type LearningEvent =
  | { type: "DESKTOP_ICON_CLICKED"; icon: DesktopIconId }
  | { type: "DESKTOP_ICON_DOUBLE_CLICKED"; icon: DesktopIconId }
  | { type: "DESKTOP_RIGHT_CLICKED" }
  | { type: "DESKTOP_EMPTY_CLICKED" }
  | { type: "START_MENU_OPENED" }
  | { type: "START_MENU_SEARCHED"; query: string }
  | { type: "APP_OPENED"; app: AppName }
  | { type: "APP_CLOSED"; app: AppName }
  | { type: "APP_MINIMIZED"; app: AppName }
  | { type: "APP_MAXIMIZED"; app: AppName }
  | { type: "WINDOW_MOVED"; app: AppName }
  | { type: "WINDOW_RESIZED"; app: AppName }
  | { type: "SCROLLED"; app: AppName; delta: number; scrollTop: number }
  | { type: "FILE_CREATED"; kind: "folder" | "file"; name?: string }
  | { type: "FILE_RENAMED"; from?: string; to: string }
  | { type: "FILE_MOVED"; name?: string; targetFolder?: string }
  | { type: "FILE_DELETED"; name?: string }
  | { type: "FILES_MULTI_SELECTED"; count: number }
  | { type: "TEXT_TYPED"; app: AppName; value: string }
  | { type: "TEXT_SELECTED"; app: AppName; length: number }
  | { type: "TEXT_FORMAT_CHANGED"; app: AppName; property: "font-size" | "font-family"; value: string; withSelection: boolean }
  | { type: "IMAGE_INSERTED"; app: AppName }
  | { type: "IMAGE_RESIZED"; app: AppName }
  | { type: "TABLE_INSERTED"; app: AppName }
  | { type: "DOC_SAVED"; app: AppName }
  | { type: "DOC_OPENED"; app: AppName }
  | { type: "CELL_SELECTED"; app: "excel"; cell: string }
  | { type: "CELL_VALUE_ENTERED"; app: "excel"; cell: string; value: string; confirmed: boolean }
  | { type: "SLIDE_ADDED"; app: "ppt" }
  | { type: "BROWSER_NAVIGATED"; url: string }
  | { type: "SHORTCUT_PRESSED"; shortcut: ShortcutId; context?: AppName }
  | { type: "VOLUME_CHANGED"; value: number }
  | { type: "WIFI_CONNECTED"; ssid: string; password?: string }
  | { type: "SYSTEM_SHUTDOWN" };

export type LearningEventType = LearningEvent["type"];

/**
 * A tiny helper so call sites can emit typed events without repeating literals.
 * Example: emit(ev("APP_OPENED", { app: "hangul" }))
 */
export const ev = <T extends LearningEventType>(
  type: T,
  payload: Omit<Extract<LearningEvent, { type: T }>, "type"> = {} as never,
): Extract<LearningEvent, { type: T }> => ({ type, ...(payload as object) } as Extract<LearningEvent, { type: T }>);

/** Convenience: pair a quest type with the app it lives inside (if any). */
export const APP_FOR_QUEST: Partial<Record<QuestType, AppName>> = {
  "close-mypc": "mypc",
  "wheel-scroll": "mypc",
  "window-move-resize": "mypc",
  "close-edge": "edge",
  "type-url": "edge",
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
  "ppt-text": "ppt",
  "ppt-font-size": "ppt",
  "ppt-font-family": "ppt",
  "ppt-image": "ppt",
  "ppt-image-resize": "ppt",
};