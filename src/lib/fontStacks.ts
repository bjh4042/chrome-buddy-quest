/**
 * Maps the Korean font names used by quest state/validation to real CSS font stacks.
 * IMPORTANT: state values (e.g. "함초롬바탕") are never changed — only rendering.
 */
export const WINDOWS_UI_STACK =
  '"Segoe UI", "Malgun Gothic", "맑은 고딕", Arial, sans-serif';

export const HANGUL_DOC_STACK =
  '"HCR Batang", "함초롬바탕", "Batang", "바탕", serif';

export const OFFICE_DOC_STACK =
  '"Aptos", "Malgun Gothic", "맑은 고딕", Arial, sans-serif';

const SERIF_NAMES = new Set(["함초롬바탕", "바탕", "궁서"]);

export function getFontStack(fontName: string): string {
  if (fontName === "함초롬바탕") return HANGUL_DOC_STACK;
  if (SERIF_NAMES.has(fontName)) return `"${fontName}", "Batang", serif`;
  return `"${fontName}", "Malgun Gothic", "맑은 고딕", Arial, sans-serif`;
}
