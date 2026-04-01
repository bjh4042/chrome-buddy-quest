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
  hint?: string;
  termKey?: string; // key for terminology dictionary
}

export type QuestCategory = "mouse" | "windows" | "internet" | "hangul" | "excel" | "powerpoint" | "finish";

export type QuestType =
  | "click"
  | "double-click"
  | "right-click"
  | "drag-drop"
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

// Terminology dictionary
export const TERMS: Record<string, { term: string; meaning: string; emoji: string }> = {
  click: { term: "클릭", meaning: "마우스 왼쪽 버튼을 한 번 누르는 것이에요. 무언가를 선택할 때 사용해요!", emoji: "👆" },
  "double-click": { term: "더블클릭", meaning: "마우스 왼쪽 버튼을 빠르게 두 번 누르는 것이에요. 프로그램을 실행할 때 사용해요!", emoji: "👆👆" },
  "right-click": { term: "우클릭(오른쪽 클릭)", meaning: "마우스 오른쪽 버튼을 누르는 것이에요. 숨겨진 메뉴가 나타나요!", emoji: "🖱️" },
  "drag-drop": { term: "드래그 앤 드롭", meaning: "마우스 왼쪽 버튼을 누른 채로 끌어서 놓는 것이에요. 파일을 옮길 때 사용해요!", emoji: "✋" },
  "start-menu": { term: "시작 메뉴", meaning: "윈도우 버튼을 누르면 나오는 메뉴예요. 프로그램을 찾거나 설정을 바꿀 수 있어요!", emoji: "🪟" },
  "taskbar": { term: "작업 표시줄", meaning: "화면 맨 아래에 있는 긴 줄이에요. 자주 쓰는 프로그램을 빠르게 실행할 수 있어요!", emoji: "📌" },
  folder: { term: "폴더", meaning: "파일을 정리해서 넣어두는 서류함 같은 것이에요!", emoji: "📁" },
  url: { term: "URL(주소)", meaning: "인터넷에서 웹사이트를 찾아가는 주소예요. 예: naver.com", emoji: "🔗" },
  save: { term: "저장", meaning: "작업한 내용을 컴퓨터에 보관하는 것이에요. 저장하지 않으면 날아갈 수 있어요!", emoji: "💾" },
  shutdown: { term: "시스템 종료", meaning: "컴퓨터를 안전하게 끄는 방법이에요. 시작 → 전원 → 시스템 종료 순서로 해요!", emoji: "🔴" },
};

// Character praise messages (random pick)
export const PRAISE_MESSAGES = [
  { text: "대단해요! 정말 잘했어요! 🌟", emoji: "🦊" },
  { text: "와~ 천재인가요?! 멋져요! ✨", emoji: "🐻" },
  { text: "짝짝짝! 완벽해요! 👏", emoji: "🐰" },
  { text: "최고예요! 다음 미션도 화이팅! 💪", emoji: "🐱" },
  { text: "잘했어요! 점점 컴퓨터 박사가 되고 있어요! 🎓", emoji: "🐶" },
  { text: "어머~ 이렇게 잘하다니! 놀라워요! 😮", emoji: "🐼" },
  { text: "슈퍼스타예요! 빛나고 있어요! ⭐", emoji: "🦁" },
  { text: "와우! 이 미션을 이렇게 빨리?! 대박! 🚀", emoji: "🐧" },
];

// Wrong click hint messages
export const WRONG_CLICK_HINTS: Record<QuestType, string> = {
  click: "⭐ 별을 눌러보세요! 반짝이는 곳이 보이나요?",
  "double-click": "💡 '내 PC' 아이콘을 빠르게 두 번 눌러보세요!",
  "right-click": "💡 빈 곳에서 마우스 오른쪽 버튼을 눌러보세요!",
  "drag-drop": "💡 파일을 꾹 누른 채로 폴더까지 끌어보세요!",
  "start-menu": "💡 화면 맨 아래 윈도우 모양 버튼을 눌러보세요!",
  "open-mypc": "💡 '내 PC' 아이콘을 빠르게 두 번 클릭하세요!",
  "create-file": "💡 바탕화면 빈 곳에서 오른쪽 버튼을 눌러보세요!",
  "delete-file": "💡 먼저 파일을 클릭해서 선택한 후, 오른쪽 버튼을 눌러보세요!",
  "open-browser": "💡 작업 표시줄에서 Edge 아이콘을 찾아보세요!",
  "type-url": "💡 주소창에 naver.com을 입력하고 Enter를 누르세요!",
  "open-hangul": "💡 바탕화면의 '한글' 아이콘을 더블클릭하세요!",
  "hangul-typing": "💡 문서 영역을 클릭하고 '안녕하세요'를 입력하세요!",
  "hangul-font-size": "💡 글자 크기 버튼을 클릭해서 '20'을 선택하세요!",
  "hangul-table": "💡 도구 모음에서 표 아이콘을 찾아보세요!",
  "hangul-save": "💡 도구 모음에서 💾 저장 버튼을 클릭하세요!",
  "open-excel": "💡 바탕화면의 'Excel' 아이콘을 더블클릭하세요!",
  "excel-input": "💡 A1 셀을 클릭하고 '100'을 입력하세요!",
  "open-ppt": "💡 바탕화면의 'PowerPoint' 아이콘을 더블클릭하세요!",
  "ppt-text": "💡 제목 영역을 클릭하고 '나의 발표'를 입력하세요!",
  shutdown: "💡 시작 버튼 → 전원 → 시스템 종료를 순서대로 클릭하세요!",
};

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
    hint: "반짝이는 별을 마우스로 가리키고 왼쪽 버튼을 한 번 눌러요!",
    termKey: "click",
  },
  {
    id: "double-click",
    title: "더블클릭 연습",
    description: "마우스를 빠르게 두 번 눌러보세요!",
    instruction: "바탕화면의 '내 PC' 아이콘을 더블클릭해보세요!",
    points: 15,
    type: "double-click",
    category: "mouse",
    hint: "'내 PC' 아이콘 위에서 빠르게 두 번 클릭해요!",
    termKey: "double-click",
  },
  {
    id: "right-click",
    title: "마우스 우클릭",
    description: "마우스 오른쪽 버튼을 눌러보세요!",
    instruction: "바탕화면 빈 곳에서 오른쪽 버튼을 클릭해보세요!",
    points: 15,
    type: "right-click",
    category: "mouse",
    hint: "바탕화면의 빈 곳에서 마우스 오른쪽 버튼을 눌러요!",
    termKey: "right-click",
  },
  {
    id: "drag-drop",
    title: "드래그 앤 드롭 연습",
    description: "파일을 끌어서 폴더에 넣어보세요!",
    instruction: "파일을 마우스로 끌어서 폴더 안에 넣어보세요!",
    points: 20,
    type: "drag-drop",
    category: "mouse",
    hint: "파일 위에서 마우스 왼쪽 버튼을 누른 채로 폴더까지 끌어요!",
    termKey: "drag-drop",
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
    hint: "화면 맨 아래 가운데에 있는 윈도우 모양 버튼이에요!",
    termKey: "start-menu",
  },
  {
    id: "open-mypc",
    title: "내 PC 열기",
    description: "내 PC를 열어서 드라이브를 확인해보세요!",
    instruction: "바탕화면의 '내 PC' 아이콘을 더블클릭하세요!",
    points: 15,
    type: "open-mypc",
    category: "windows",
    hint: "'내 PC' 아이콘을 빠르게 두 번 클릭하면 열려요!",
  },
  {
    id: "create-file",
    title: "새 폴더 만들기",
    description: "바탕화면에 새 폴더를 만들어보세요!",
    instruction: "바탕화면에서 우클릭 → '새로 만들기' → '폴더'를 클릭하세요!",
    points: 20,
    type: "create-file",
    category: "windows",
    hint: "바탕화면 빈 곳에서 오른쪽 버튼 → 새로 만들기 → 폴더!",
    termKey: "folder",
  },
  {
    id: "delete-file",
    title: "파일 삭제하기",
    description: "필요 없는 파일을 삭제해보세요!",
    instruction: "삭제할 파일을 클릭한 후 마우스 우클릭 → '삭제'를 누르세요!",
    points: 15,
    type: "delete-file",
    category: "windows",
    hint: "먼저 파일을 클릭해서 선택! 그 다음 오른쪽 버튼 → 삭제!",
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
    hint: "작업 표시줄(화면 맨 아래)에서 Edge 아이콘을 찾아보세요!",
    termKey: "taskbar",
  },
  {
    id: "type-url",
    title: "주소창에 입력하기",
    description: "웹사이트 주소를 입력해보세요!",
    instruction: "Edge를 실행한 후 주소창에 naver.com을 입력하고 Enter를 누르세요!",
    points: 20,
    type: "type-url",
    category: "internet",
    hint: "위에 있는 주소창을 클릭하고 naver.com을 입력해요!",
    termKey: "url",
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
    hint: "바탕화면에서 '한' 이라고 적힌 파란 아이콘을 찾아보세요!",
  },
  {
    id: "hangul-typing",
    title: "타이핑 연습",
    description: "한글에서 글을 입력해보세요!",
    instruction: "문서 영역을 클릭하고 '안녕하세요'를 입력하세요!",
    points: 15,
    type: "hangul-typing",
    category: "hangul",
    hint: "하얀 종이 부분을 클릭하고 키보드로 '안녕하세요'를 입력해요!",
  },
  {
    id: "hangul-font-size",
    title: "글자 크기 바꾸기",
    description: "글자 크기를 변경해보세요!",
    instruction: "글자를 선택한 후 상단 도구 모음에서 글자 크기를 '20'으로 변경하세요!",
    points: 15,
    type: "hangul-font-size",
    category: "hangul",
    hint: "숫자가 적힌 버튼을 클릭하고 20을 선택하세요!",
  },
  {
    id: "hangul-table",
    title: "표 만들기",
    description: "문서에 표를 넣어보세요!",
    instruction: "도구 모음에서 '표 삽입' 버튼을 클릭하세요!",
    points: 20,
    type: "hangul-table",
    category: "hangul",
    hint: "도구 모음에서 표 모양 아이콘을 찾아보세요!",
  },
  {
    id: "hangul-save",
    title: "파일 저장하기",
    description: "작성한 문서를 저장해보세요!",
    instruction: "도구 모음에서 '저장' 버튼(💾)을 클릭하세요!",
    points: 15,
    type: "hangul-save",
    category: "hangul",
    hint: "디스켓 모양 아이콘이 저장 버튼이에요!",
    termKey: "save",
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
    hint: "바탕화면에서 초록색 'X' 아이콘을 찾아보세요!",
  },
  {
    id: "excel-input",
    title: "셀에 데이터 입력하기",
    description: "엑셀 셀에 데이터를 입력해보세요!",
    instruction: "A1 셀을 클릭하고 '100'을 입력한 후 Enter를 누르세요!",
    points: 20,
    type: "excel-input",
    category: "excel",
    hint: "왼쪽 위 첫 번째 칸(A1)을 클릭하고 100을 입력해요!",
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
    hint: "바탕화면에서 주황색 'P' 아이콘을 찾아보세요!",
  },
  {
    id: "ppt-text",
    title: "슬라이드에 제목 입력하기",
    description: "슬라이드에 제목을 입력해보세요!",
    instruction: "제목 영역을 클릭하고 '나의 발표'를 입력하세요!",
    points: 20,
    type: "ppt-text",
    category: "powerpoint",
    hint: "'제목을 추가하려면 클릭하세요'라고 적힌 곳을 눌러요!",
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
    hint: "시작 버튼을 먼저 누르고, 전원 아이콘 → 시스템 종료!",
    termKey: "shutdown",
  },
];
