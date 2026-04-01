export interface Quest {
  id: string;
  title: string;
  description: string;
  instruction: string;
  points: number;
  completed: boolean;
  starsEarned: number;
  type: QuestType;
  category: QuestCategory;
}

export type QuestCategory = "mouse" | "windows" | "internet" | "hangul" | "excel" | "powerpoint" | "finish";

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
  | "open-hangul"
  | "hangul-typing"
  | "hangul-font-size"
  | "hangul-table"
  | "hangul-save"
  | "open-excel"
  | "excel-input"
  | "open-ppt"
  | "ppt-text"
  | "shutdown";

export const QUEST_CATEGORIES: { id: QuestCategory; label: string; emoji: string }[] = [
  { id: "mouse", label: "마우스 연습", emoji: "🖱️" },
  { id: "windows", label: "윈도우 기본", emoji: "🪟" },
  { id: "internet", label: "인터넷", emoji: "🌐" },
  { id: "hangul", label: "한글 문서", emoji: "📝" },
  { id: "excel", label: "엑셀", emoji: "📊" },
  { id: "powerpoint", label: "파워포인트", emoji: "📽️" },
  { id: "finish", label: "마무리", emoji: "🏁" },
];

export const QUESTS: Omit<Quest, "completed" | "starsEarned">[] = [
  // Mouse basics
  {
    id: "click",
    title: "마우스 클릭 연습",
    description: "마우스 왼쪽 버튼을 눌러보세요!",
    instruction: "바탕화면에 있는 ⭐ 별을 클릭해보세요!",
    points: 10,
    type: "click",
    category: "mouse",
  },
  {
    id: "double-click",
    title: "더블클릭 연습",
    description: "마우스를 빠르게 두 번 눌러보세요!",
    instruction: "바탕화면의 '내 PC' 아이콘을 더블클릭해보세요!",
    points: 15,
    type: "double-click",
    category: "mouse",
  },
  {
    id: "right-click",
    title: "마우스 우클릭",
    description: "마우스 오른쪽 버튼을 눌러보세요!",
    instruction: "바탕화면 빈 곳에서 오른쪽 버튼을 클릭해보세요!",
    points: 15,
    type: "right-click",
    category: "mouse",
  },
  // Windows basics
  {
    id: "start-menu",
    title: "시작 버튼 누르기",
    description: "화면 아래 시작 버튼을 찾아보세요!",
    instruction: "작업 표시줄에 있는 윈도우(시작) 버튼을 클릭하세요!",
    points: 10,
    type: "start-menu",
    category: "windows",
  },
  {
    id: "open-mypc",
    title: "내 PC 열기",
    description: "내 PC를 열어서 드라이브를 확인해보세요!",
    instruction: "바탕화면의 '내 PC' 아이콘을 더블클릭하세요!",
    points: 15,
    type: "open-mypc",
    category: "windows",
  },
  {
    id: "create-file",
    title: "새 폴더 만들기",
    description: "바탕화면에 새 폴더를 만들어보세요!",
    instruction: "바탕화면에서 우클릭 → '새로 만들기' → '폴더'를 클릭하세요!",
    points: 20,
    type: "create-file",
    category: "windows",
  },
  {
    id: "delete-file",
    title: "파일 삭제하기",
    description: "필요 없는 파일을 삭제해보세요!",
    instruction: "삭제할 파일을 클릭한 후 마우스 우클릭 → '삭제'를 누르세요!",
    points: 15,
    type: "delete-file",
    category: "windows",
  },
  // Internet
  {
    id: "open-browser",
    title: "Edge 브라우저 실행",
    description: "인터넷을 사용해보세요!",
    instruction: "작업 표시줄의 Edge 아이콘을 클릭하세요!",
    points: 10,
    type: "open-browser",
    category: "internet",
  },
  {
    id: "type-url",
    title: "주소창에 입력하기",
    description: "웹사이트 주소를 입력해보세요!",
    instruction: "Edge를 실행한 후 주소창에 naver.com을 입력하고 Enter를 누르세요!",
    points: 20,
    type: "type-url",
    category: "internet",
  },
  // 한글
  {
    id: "open-hangul",
    title: "한글 실행하기",
    description: "한글 프로그램을 열어보세요!",
    instruction: "바탕화면의 '한글' 아이콘을 더블클릭하세요!",
    points: 10,
    type: "open-hangul",
    category: "hangul",
  },
  {
    id: "hangul-typing",
    title: "타이핑 연습",
    description: "한글에서 글을 입력해보세요!",
    instruction: "문서 영역을 클릭하고 '안녕하세요'를 입력하세요!",
    points: 15,
    type: "hangul-typing",
    category: "hangul",
  },
  {
    id: "hangul-font-size",
    title: "글자 크기 바꾸기",
    description: "글자 크기를 변경해보세요!",
    instruction: "글자를 선택한 후 상단 도구 모음에서 글자 크기를 '20'으로 변경하세요!",
    points: 15,
    type: "hangul-font-size",
    category: "hangul",
  },
  {
    id: "hangul-table",
    title: "표 만들기",
    description: "문서에 표를 넣어보세요!",
    instruction: "도구 모음에서 '표 삽입' 버튼을 클릭하세요!",
    points: 20,
    type: "hangul-table",
    category: "hangul",
  },
  {
    id: "hangul-save",
    title: "파일 저장하기",
    description: "작성한 문서를 저장해보세요!",
    instruction: "도구 모음에서 '저장' 버튼(💾)을 클릭하세요!",
    points: 15,
    type: "hangul-save",
    category: "hangul",
  },
  // Excel
  {
    id: "open-excel",
    title: "엑셀 실행하기",
    description: "엑셀 프로그램을 열어보세요!",
    instruction: "바탕화면의 '엑셀' 아이콘을 더블클릭하세요!",
    points: 10,
    type: "open-excel",
    category: "excel",
  },
  {
    id: "excel-input",
    title: "셀에 데이터 입력하기",
    description: "엑셀 셀에 데이터를 입력해보세요!",
    instruction: "A1 셀을 클릭하고 '100'을 입력한 후 Enter를 누르세요!",
    points: 20,
    type: "excel-input",
    category: "excel",
  },
  // PowerPoint
  {
    id: "open-ppt",
    title: "파워포인트 실행하기",
    description: "파워포인트를 열어보세요!",
    instruction: "바탕화면의 '파워포인트' 아이콘을 더블클릭하세요!",
    points: 10,
    type: "open-ppt",
    category: "powerpoint",
  },
  {
    id: "ppt-text",
    title: "슬라이드에 제목 입력하기",
    description: "슬라이드에 제목을 입력해보세요!",
    instruction: "제목 영역을 클릭하고 '나의 발표'를 입력하세요!",
    points: 20,
    type: "ppt-text",
    category: "powerpoint",
  },
  // Finish
  {
    id: "shutdown",
    title: "컴퓨터 끄기",
    description: "안전하게 컴퓨터를 종료해보세요!",
    instruction: "시작 버튼 → 전원 → 시스템 종료를 클릭하세요!",
    points: 20,
    type: "shutdown",
    category: "finish",
  },
];
