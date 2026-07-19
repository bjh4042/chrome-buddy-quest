import type { QuestCategory } from "@/types/quest";

export type LearningMode = "story" | "free-practice" | "teacher";

export const LEARNING_MODES: {
  id: LearningMode;
  label: string;
  short: string;
  description: string;
  emoji: string;
  hint: string;
}[] = [
  {
    id: "story",
    label: "순서대로 탐험하기",
    short: "순서대로 탐험 중",
    description: "처음부터 차례대로 배우고 임무를 하나씩 열어요.",
    emoji: "🗺️",
    hint: "완료한 다음 임무만 순서대로 열려요.",
  },
  {
    id: "free-practice",
    label: "원하는 임무 연습하기",
    short: "자유 연습 중",
    description: "배우고 싶은 임무를 골라서 자유롭게 연습해요.",
    emoji: "🎯",
    hint: "연습 모드에서는 순서와 상관없이 임무를 골라서 할 수 있어요.",
  },
  {
    id: "teacher",
    label: "선생님과 함께 배우기",
    short: "선생님과 함께 배우는 중",
    description: "선생님이 고른 주제부터 함께 연습해요.",
    emoji: "🧑‍🏫",
    hint: "선택한 주제 안에서 자유롭게 연습할 수 있어요.",
  },
];

export const getLearningMode = (id: LearningMode) =>
  LEARNING_MODES.find(m => m.id === id) ?? LEARNING_MODES[0];

export const CATEGORY_DESCRIPTIONS: Record<QuestCategory, string> = {
  mouse: "마우스로 클릭하고 끄는 방법을 익혀요.",
  windows: "창 열기, 닫기, 폴더 만들기를 배워요.",
  internet: "Edge 브라우저로 웹사이트에 가 봐요.",
  settings: "소리와 와이파이를 조절해 봐요.",
  hangul: "글자를 입력하고 그림과 표를 넣어 봐요.",
  excel: "칸에 숫자를 넣고 표를 만들어요.",
  powerpoint: "슬라이드로 발표 자료를 만들어요.",
  finish: "컴퓨터를 안전하게 마무리해요.",
};