export interface Quest {
  id: string;
  title: string;
  description: string;
  instruction: string;
  points: number;
  completed: boolean;
  starsEarned: number;
  type: QuestType;
}

export type QuestType =
  | "click"
  | "double-click"
  | "right-click"
  | "start-menu"
  | "open-mypc"
  | "create-file"
  | "delete-file"
  | "open-browser"
  | "type-url"
  | "shutdown";

export const QUESTS: Omit<Quest, "completed" | "starsEarned">[] = [
  {
    id: "click",
    title: "마우스 클릭 연습",
    description: "마우스 왼쪽 버튼을 눌러보세요!",
    instruction: "바탕화면에 있는 ⭐ 별을 클릭해보세요!",
    points: 10,
    type: "click",
  },
  {
    id: "double-click",
    title: "더블클릭 연습",
    description: "마우스를 빠르게 두 번 눌러보세요!",
    instruction: "바탕화면의 '내 PC' 아이콘을 더블클릭해보세요!",
    points: 15,
    type: "double-click",
  },
  {
    id: "right-click",
    title: "마우스 우클릭",
    description: "마우스 오른쪽 버튼을 눌러보세요!",
    instruction: "바탕화면 빈 곳에서 오른쪽 버튼을 클릭해보세요!",
    points: 15,
    type: "right-click",
  },
  {
    id: "start-menu",
    title: "시작 버튼 누르기",
    description: "화면 아래 시작 버튼을 찾아보세요!",
    instruction: "작업 표시줄에 있는 윈도우(시작) 버튼을 클릭하세요!",
    points: 10,
    type: "start-menu",
  },
  {
    id: "open-mypc",
    title: "내 PC 열기",
    description: "내 PC를 열어서 폴더를 확인해보세요!",
    instruction: "바탕화면의 '내 PC' 아이콘을 더블클릭하세요!",
    points: 15,
    type: "open-mypc",
  },
  {
    id: "create-file",
    title: "새 폴더 만들기",
    description: "바탕화면에 새 폴더를 만들어보세요!",
    instruction: "바탕화면에서 우클릭 → '새로 만들기' → '폴더'를 클릭하세요!",
    points: 20,
    type: "create-file",
  },
  {
    id: "delete-file",
    title: "파일 삭제하기",
    description: "필요 없는 파일을 삭제해보세요!",
    instruction: "삭제할 파일을 클릭한 후 '삭제' 버튼을 누르세요!",
    points: 15,
    type: "delete-file",
  },
  {
    id: "open-browser",
    title: "웹 브라우저 실행",
    description: "인터넷을 사용해보세요!",
    instruction: "작업 표시줄의 Chrome 아이콘을 클릭하세요!",
    points: 10,
    type: "open-browser",
  },
  {
    id: "type-url",
    title: "주소창에 입력하기",
    description: "웹사이트 주소를 입력해보세요!",
    instruction: "주소창을 클릭하고 주소를 입력한 후 Enter를 누르세요!",
    points: 20,
    type: "type-url",
  },
  {
    id: "shutdown",
    title: "컴퓨터 끄기",
    description: "안전하게 컴퓨터를 종료해보세요!",
    instruction: "시작 버튼 → 전원 → 시스템 종료를 클릭하세요!",
    points: 20,
    type: "shutdown",
  },
];
