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
  termKey?: string;
}

export type QuestCategory = "mouse" | "windows" | "internet" | "settings" | "hangul" | "excel" | "powerpoint" | "finish";

export type QuestType =
  | "click"
  | "double-click"
  | "right-click"
  | "drag-drop"
  | "start-menu"
  | "open-mypc"
  | "close-mypc"
  | "create-file"
  | "rename-folder"
  | "delete-file"
  | "multi-select"
  | "wheel-scroll"
  | "window-move-resize"
  | "start-search"
  | "open-browser"
  | "type-url"
  | "close-edge"
  | "volume-control"
  | "wifi-connect"
  | "shortcut-copy"
  | "shortcut-paste"
  | "shortcut-save"
  | "shortcut-alt-tab"
  | "shortcut-emoji"
  | "open-hangul"
  | "hangul-typing"
  | "hangul-font-size"
  | "hangul-font-family"
  | "hangul-image"
  | "hangul-image-resize"
  | "hangul-table"
  | "hangul-save"
  | "hangul-open-file"
  | "open-excel"
  | "excel-input"
  | "open-ppt"
  | "ppt-text"
  | "ppt-font-size"
  | "ppt-font-family"
  | "ppt-image"
  | "ppt-image-resize"
  | "shutdown";

export const QUEST_CATEGORIES: { id: QuestCategory; label: string; emoji: string }[] = [
  { id: "mouse", label: "마우스 연습", emoji: "🖱️" },
  { id: "windows", label: "윈도우 기본", emoji: "🪟" },
  { id: "internet", label: "인터넷", emoji: "🌐" },
  { id: "settings", label: "설정", emoji: "⚙️" },
  { id: "hangul", label: "한글 문서", emoji: "📝" },
  { id: "excel", label: "엑셀", emoji: "📊" },
  { id: "powerpoint", label: "파워포인트", emoji: "📽️" },
  { id: "finish", label: "마무리", emoji: "🏁" },
];

export const TERMS: Record<string, { term: string; meaning: string; emoji: string }> = {
  click: { term: "클릭", meaning: "마우스 왼쪽 버튼을 한 번 누르는 것이에요. 무언가를 선택할 때 사용해요!", emoji: "👆" },
  "double-click": { term: "더블클릭", meaning: "마우스 왼쪽 버튼을 빠르게 두 번 누르는 것이에요. 프로그램을 실행할 때 사용해요!", emoji: "👆👆" },
  "right-click": { term: "마우스 오른쪽 버튼 클릭", meaning: "마우스 오른쪽 버튼을 누르는 것이에요. 숨겨진 메뉴가 나타나요!", emoji: "🖱️" },
  "drag-drop": { term: "드래그 앤 드롭", meaning: "마우스 왼쪽 버튼을 누른 채로 끌어서 놓는 것이에요. 파일을 옮길 때 사용해요!", emoji: "✋" },
  "start-menu": { term: "시작 메뉴", meaning: "윈도우 버튼을 누르면 나오는 메뉴예요. 프로그램을 찾거나 설정을 바꿀 수 있어요!", emoji: "🪟" },
  taskbar: { term: "작업 표시줄", meaning: "화면 맨 아래에 있는 긴 줄이에요. 자주 쓰는 프로그램을 빠르게 실행할 수 있어요!", emoji: "📌" },
  folder: { term: "폴더", meaning: "파일을 정리해서 넣어두는 서류함 같은 것이에요!", emoji: "📁" },
  url: { term: "URL(주소)", meaning: "인터넷에서 웹사이트를 찾아가는 주소예요. 예: naver.com", emoji: "🔗" },
  save: { term: "저장", meaning: "작업한 내용을 컴퓨터에 보관하는 것이에요. 저장하지 않으면 날아갈 수 있어요!", emoji: "💾" },
  shutdown: { term: "시스템 종료", meaning: "컴퓨터를 안전하게 끄는 방법이에요. 시작 → 전원 → 시스템 종료 순서로 해요!", emoji: "🔴" },
  volume: { term: "볼륨(소리 크기)", meaning: "스피커에서 나오는 소리의 크기예요. 작업 표시줄의 🔊 아이콘에서 조절할 수 있어요!", emoji: "🔊" },
  wifi: { term: "와이파이(Wi-Fi)", meaning: "선 없이 인터넷에 연결하는 방법이에요. 네트워크를 선택하고 비밀번호를 입력하면 연결돼요!", emoji: "📶" },
  shortcut: { term: "단축키", meaning: "키보드 두 개 이상을 동시에 눌러서 빠르게 명령하는 방법이에요. 예: Ctrl+C는 복사!", emoji: "⌨️" },
};

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

export const WRONG_CLICK_HINTS: Record<QuestType, string> = {
  click: "반짝이는 ⭐ 별을 눌러 보세요.",
  "double-click": "'내 PC' 아이콘을 두 번 빠르게 눌러 보세요.",
  "right-click": "바탕화면의 빈 곳에서 마우스 오른쪽 버튼을 눌러요.",
  "drag-drop": "파일을 누른 채로 폴더까지 끌어요.",
  "start-menu": "화면 맨 아래 가운데의 윈도우 모양 버튼을 눌러요.",
  "open-mypc": "'내 PC' 아이콘을 두 번 빠르게 눌러요.",
  "close-mypc": "'내 PC' 창의 오른쪽 위 X 버튼을 눌러요.",
  "create-file": "바탕화면 빈 곳에서 마우스 오른쪽 버튼을 눌러 보세요.",
  "rename-folder": "폴더에서 마우스 오른쪽 버튼을 눌러 '이름 바꾸기' 또는 F2 키를 눌러요.",
  "delete-file": "파일을 먼저 누른 다음, 마우스 오른쪽 버튼 → 삭제 또는 Del 키를 눌러요.",
  "open-browser": "화면 맨 아래에서 Edge 아이콘을 찾아 눌러요.",
  "type-url": "주소창에 naver.com 을 쓰고 Enter 를 눌러요.",
  "close-edge": "Edge 창의 오른쪽 위 X 버튼을 눌러요.",
  "volume-control": "작업 표시줄 오른쪽의 🔊 아이콘을 눌러 슬라이더를 50 까지 옮겨요.",
  "wifi-connect": "🌐 아이콘 → '우리집 WiFi' → 비밀번호 12345678 → 연결 순서예요.",
  "shortcut-copy": "Ctrl 을 꾹 누른 채로 C 를 눌러요.",
  "shortcut-paste": "Ctrl 을 꾹 누른 채로 V 를 눌러요.",
  "shortcut-save": "Ctrl 을 꾹 누른 채로 S 를 눌러요.",
  "shortcut-alt-tab": "Alt 를 꾹 누른 채로 Tab 을 눌러요.",
  "shortcut-emoji": "한글 문서에서 Ctrl 과 . 을 함께 눌러요.",
  "multi-select": "Ctrl 을 꾹 누른 채로 파일을 두 개 이상 눌러요.",
  "wheel-scroll": "내 PC 창 위에서 마우스 가운데 휠을 아래로 굴려요.",
  "window-move-resize": "위쪽 제목 줄을 끌거나, 오른쪽 아래 모서리를 끌어 크기를 바꿔요.",
  "start-search": "시작 메뉴를 열고 검색 칸에 '메모장' 을 써요.",
  "open-hangul": "바탕화면에서 파란 '한' 아이콘을 두 번 빠르게 눌러요.",
  "hangul-typing": "문서 영역을 누르고 '안녕하세요' 를 써요.",
  "hangul-font-size": "글자를 파랗게 고른 뒤, 글자 크기에서 20 을 골라요.",
  "hangul-font-family": "글자를 파랗게 고른 뒤, 글꼴에서 '돋움' 을 골라요.",
  "hangul-image": "위쪽 도구 모음의 🖼️ 그림 버튼을 눌러요.",
  "hangul-image-resize": "그림 모서리의 파란 점을 끌어서 크기를 바꿔요.",
  "hangul-table": "위쪽 도구 모음에서 격자 무늬 표 버튼을 눌러요.",
  "hangul-save": "위쪽 도구 모음의 💾 저장 버튼을 눌러요.",
  "hangul-open-file": "위쪽 도구 모음의 📂 불러오기 버튼을 눌러요.",
  "open-excel": "바탕화면의 초록색 X 아이콘을 두 번 빠르게 눌러요.",
  "excel-input": "A1 칸을 누르고 100 을 쓴 뒤 Enter 를 눌러요.",
  "open-ppt": "바탕화면의 주황색 P 아이콘을 두 번 빠르게 눌러요.",
  "ppt-text": "제목 자리를 누르고 '나의 발표' 를 써요.",
  "ppt-font-size": "글자를 파랗게 고른 뒤, 글자 크기에서 28 을 골라요.",
  "ppt-font-family": "글자를 파랗게 고른 뒤, 글꼴에서 '바탕' 을 골라요.",
  "ppt-image": "위쪽 도구 모음의 🖼️ 그림 버튼을 눌러요.",
  "ppt-image-resize": "그림 모서리의 파란 점을 끌어서 크기를 바꿔요.",
  shutdown: "시작 → 전원 → 시스템 종료 순서로 눌러요.",
};

export const QUESTS: Omit<Quest, "completed" | "starsEarned">[] = [
  // Mouse basics
  {
    id: "click", title: "별 눌러 보기", description: "마우스 왼쪽 버튼을 눌러 봐요.",
    instruction: "바탕화면의 ⭐ 별을 한 번 눌러요.",
    points: 10, type: "click", category: "mouse",
    hint: "반짝이는 별 위에 마우스를 올리고 왼쪽 버튼을 한 번 눌러요.", termKey: "click",
  },
  {
    id: "double-click", title: "두 번 눌러 열기", description: "마우스를 빠르게 두 번 눌러 봐요.",
    instruction: "바탕화면의 '내 PC' 아이콘을 두 번 빠르게 눌러요.",
    points: 15, type: "double-click", category: "mouse",
    hint: "'내 PC' 아이콘 위에서 두 번 빠르게 눌러요(더블클릭).", termKey: "double-click",
  },
  {
    id: "right-click", title: "오른쪽 버튼 눌러 보기", description: "숨은 메뉴를 열어 봐요.",
    instruction: "바탕화면 빈 곳에서 마우스 오른쪽 버튼을 눌러요.",
    points: 15, type: "right-click", category: "mouse",
    hint: "아무 아이콘도 없는 빈 자리에서 오른쪽 버튼을 눌러요.", termKey: "right-click",
  },
  {
    id: "drag-drop", title: "끌어서 옮기기", description: "파일을 폴더로 옮겨 봐요.",
    instruction: "파일을 누른 채로 끌어서 폴더 안에 놓아요.",
    points: 20, type: "drag-drop", category: "mouse",
    hint: "왼쪽 버튼을 꾹 누른 채로 폴더 위까지 끌고 가서 놓아요.", termKey: "drag-drop",
  },
  // Windows basics
  {
    id: "start-menu", title: "시작 버튼 누르기", description: "화면 아래 시작 버튼을 찾아요.",
    instruction: "화면 맨 아래 가운데의 윈도우 모양 버튼을 눌러요.",
    points: 10, type: "start-menu", category: "windows",
    hint: "작업 표시줄 가운데 네모 창 모양(윈도우) 버튼이에요.", termKey: "start-menu",
  },
  {
    id: "start-search", title: "시작 메뉴 검색", description: "이름으로 프로그램을 찾아 봐요.",
    instruction: "시작 버튼을 누르고, 검색 칸에 '메모장' 을 써요.",
    points: 15, type: "start-search", category: "windows",
    hint: "시작 메뉴 위쪽 검색 칸을 누른 다음 '메모장' 이라고 써요.",
    termKey: "start-menu",
  },
  {
    id: "open-mypc", title: "내 PC 열기", description: "내 PC 창을 열어 봐요.",
    instruction: "바탕화면의 '내 PC' 아이콘을 두 번 빠르게 눌러요.",
    points: 15, type: "open-mypc", category: "windows",
    hint: "두 번 빠르게 누르면 창이 열려요.",
  },
  {
    id: "wheel-scroll", title: "휠 굴려 보기", description: "휠을 굴려 아래쪽을 봐요.",
    instruction: "내 PC 창 위에서 마우스 가운데 휠을 아래로 굴려요.",
    points: 15, type: "wheel-scroll", category: "windows",
    hint: "마우스 가운데 작은 바퀴가 휠이에요. 아래로 굴려 봐요.",
  },
  {
    id: "window-move-resize", title: "창 옮기고 크기 바꾸기", description: "창을 옮기거나 커지게 해요.",
    instruction: "위쪽 제목 줄을 끌어서 옮기거나, 오른쪽 아래 모서리를 끌어서 크기를 바꿔요.",
    points: 15, type: "window-move-resize", category: "windows",
    hint: "제목 줄을 잡고 끌면 창이 옮겨져요. 모서리를 끌면 크기가 바뀌어요.",
  },
  {
    id: "close-mypc", title: "내 PC 닫기", description: "창을 닫아 봐요.",
    instruction: "'내 PC' 창의 오른쪽 위 X 버튼을 눌러요.",
    points: 10, type: "close-mypc", category: "windows",
    hint: "창 오른쪽 위 모서리의 빨간 X 를 눌러요.",
  },
  {
    id: "create-file", title: "새 폴더 만들기", description: "바탕화면에 폴더를 만들어 봐요.",
    instruction: "바탕화면에서 마우스 오른쪽 버튼 → '새로 만들기' → '폴더' 순서로 눌러요.",
    points: 20, type: "create-file", category: "windows",
    hint: "빈 곳에서 오른쪽 버튼 → 새로 만들기 → 폴더 순서예요.", termKey: "folder",
  },
  {
    id: "rename-folder", title: "폴더 이름 바꾸기", description: "폴더 이름을 바꿔 봐요.",
    instruction: "폴더에서 마우스 오른쪽 버튼 → '이름 바꾸기' 를 누르거나, 폴더를 누른 뒤 F2 키를 눌러요. 새 이름을 쓰고 Enter 를 눌러요.",
    points: 15, type: "rename-folder", category: "windows",
    hint: "F2 키를 쓰면 더 빨라요. 이름을 다 쓰면 Enter 를 꼭 눌러요.", termKey: "folder",
  },
  {
    id: "delete-file", title: "파일 지우기", description: "필요 없는 파일을 지워 봐요.",
    instruction: "파일을 눌러 고른 뒤, 마우스 오른쪽 버튼 → '삭제' 또는 Del 키를 눌러요.",
    points: 15, type: "delete-file", category: "windows",
    hint: "먼저 파일을 눌러서 골라요. 그 다음 오른쪽 버튼 → 삭제 또는 Del 키.",
  },
  {
    id: "multi-select", title: "여러 파일 고르기", description: "여러 파일을 한 번에 골라 봐요.",
    instruction: "Ctrl 키를 누른 채로 파일을 두 개 이상 눌러요.",
    points: 15, type: "multi-select", category: "windows",
    hint: "Ctrl 을 꾹 누른 채로 파일을 하나씩 눌러요.",
  },
  // Internet
  {
    id: "open-browser", title: "Edge 열기", description: "인터넷을 열어 봐요.",
    instruction: "화면 맨 아래에서 Edge 아이콘을 눌러요.",
    points: 10, type: "open-browser", category: "internet",
    hint: "화면 맨 아래(작업 표시줄)에서 Edge 아이콘을 찾아요.", termKey: "taskbar",
  },
  {
    id: "type-url", title: "주소로 이동하기", description: "웹사이트 주소를 써 봐요.",
    instruction: "위쪽 주소창에 naver.com 을 쓰고 Enter 를 눌러요.",
    points: 20, type: "type-url", category: "internet",
    hint: "위쪽의 긴 주소창을 누르고 naver.com 을 써요.", termKey: "url",
  },
  {
    id: "close-edge", title: "Edge 닫기", description: "인터넷 창을 닫아 봐요.",
    instruction: "Edge 창의 오른쪽 위 X 버튼을 눌러요.",
    points: 10, type: "close-edge", category: "internet",
    hint: "창 오른쪽 위 모서리의 X 버튼이에요.",
  },
  // Settings (volume, wifi)
  {
    id: "volume-control", title: "소리 크기 바꾸기", description: "스피커 소리를 조절해 봐요.",
    instruction: "화면 맨 아래 🔊 아이콘을 누르고, 슬라이더를 50 까지 옮겨요.",
    points: 15, type: "volume-control", category: "settings",
    hint: "작업 표시줄 오른쪽 🔊 아이콘을 누르면 슬라이더가 나와요.", termKey: "volume",
  },
  {
    id: "wifi-connect", title: "와이파이 연결하기", description: "인터넷에 연결해 봐요.",
    instruction: "🌐 아이콘을 누르고, '우리집 WiFi' 를 골라 비밀번호 12345678 을 쓴 뒤 '연결' 을 눌러요.",
    points: 25, type: "wifi-connect", category: "settings",
    hint: "작업 표시줄의 🌐 아이콘을 누르면 와이파이 목록이 나와요.", termKey: "wifi",
  },
  // 한글
  {
    id: "open-hangul", title: "한글 열기", description: "한글 프로그램을 열어 봐요.",
    instruction: "바탕화면의 '한글' 아이콘을 두 번 빠르게 눌러요.",
    points: 10, type: "open-hangul", category: "hangul",
    hint: "바탕화면에서 '한' 이라고 쓰인 파란 아이콘을 찾아요.",
  },
  {
    id: "hangul-typing", title: "글자 써 보기", description: "글을 한 줄 써 봐요.",
    instruction: "하얀 종이 부분을 누르고 '안녕하세요' 를 써요.",
    points: 15, type: "hangul-typing", category: "hangul",
    hint: "문서 영역을 먼저 누르고 키보드로 써요.",
  },
  {
    id: "shortcut-copy", title: "복사 단축키 Ctrl+C", description: "글자를 골라 복사해 봐요.",
    instruction: "글자를 누른 채로 끌어서 고른 뒤, Ctrl 과 C 를 함께 눌러요.",
    points: 15, type: "shortcut-copy", category: "hangul",
    hint: "먼저 글자를 끌어서 파랗게 골라요. 그 다음 Ctrl+C 를 눌러요.", termKey: "shortcut",
  },
  {
    id: "shortcut-paste", title: "붙여넣기 Ctrl+V", description: "복사한 글자를 붙여 봐요.",
    instruction: "문서를 한 번 누른 다음, Ctrl 과 V 를 함께 눌러요.",
    points: 15, type: "shortcut-paste", category: "hangul",
    hint: "복사(Ctrl+C) 한 내용이 있어야 붙여넣을 수 있어요.", termKey: "shortcut",
  },
  {
    id: "shortcut-emoji", title: "이모지 넣기 Ctrl+.", description: "귀여운 이모지를 넣어 봐요.",
    instruction: "한글 문서에서 Ctrl 과 . 을 함께 눌러 이모지 창을 열고, 하나 골라요.",
    points: 15, type: "shortcut-emoji", category: "hangul",
    hint: "이 학습에서는 Ctrl+. 로 이모지 창이 열려요.",
    termKey: "shortcut",
  },
  {
    id: "hangul-font-size", title: "글자 크기 바꾸기", description: "글자 크기를 바꿔 봐요.",
    instruction: "글자를 끌어서 파랗게 고른 뒤, 글자 크기를 20 으로 바꿔요.",
    points: 15, type: "hangul-font-size", category: "hangul",
    hint: "먼저 글자를 끌어서 골라요. 그 다음 위쪽 숫자에서 20 을 골라요.",
  },
  {
    id: "hangul-font-family", title: "글꼴 바꾸기", description: "글꼴을 바꿔 봐요.",
    instruction: "글자를 끌어서 파랗게 고른 뒤, 글꼴 이름에서 '돋움' 을 골라요.",
    points: 15, type: "hangul-font-family", category: "hangul",
    hint: "글자를 먼저 골라야 글꼴을 바꿀 수 있어요.",
  },
  {
    id: "hangul-image", title: "그림 넣기", description: "문서에 그림을 넣어 봐요.",
    instruction: "위쪽 도구 모음에서 🖼️ '그림' 버튼을 누르고, 그림을 골라 '열기' 를 눌러요.",
    points: 15, type: "hangul-image", category: "hangul",
    hint: "🖼️ 아이콘을 누르면 그림을 고를 수 있는 창이 나와요.",
  },
  {
    id: "hangul-image-resize", title: "그림 크기 바꾸기", description: "그림의 크기를 바꿔 봐요.",
    instruction: "그림 모서리의 파란 점을 끌어서 크기를 바꿔요.",
    points: 15, type: "hangul-image-resize", category: "hangul",
    hint: "그림을 한 번 누르면 모서리에 파란 점이 생겨요. 그 점을 끌어요.",
  },
  {
    id: "hangul-table", title: "표 만들기", description: "문서에 표를 넣어 봐요.",
    instruction: "위쪽 도구 모음에서 표 모양 버튼을 눌러요.",
    points: 20, type: "hangul-table", category: "hangul",
    hint: "격자 무늬가 있는 아이콘이 표 버튼이에요.",
  },
  {
    id: "shortcut-save", title: "저장 단축키 Ctrl+S", description: "단축키로 저장해 봐요.",
    instruction: "한글 문서에서 Ctrl 과 S 를 함께 눌러요.",
    points: 15, type: "shortcut-save", category: "hangul",
    hint: "가장 많이 쓰는 저장 단축키예요.", termKey: "shortcut",
  },
  {
    id: "hangul-save", title: "파일 저장하기", description: "만든 문서를 저장해 봐요.",
    instruction: "위쪽 도구 모음의 💾 저장 버튼을 눌러요.",
    points: 15, type: "hangul-save", category: "hangul",
    hint: "디스켓 모양 💾 아이콘이 저장 버튼이에요.", termKey: "save",
  },
  {
    id: "hangul-open-file", title: "파일 불러오기", description: "저장한 파일을 열어 봐요.",
    instruction: "위쪽 도구 모음의 📂 '불러오기' 버튼을 눌러요.",
    points: 15, type: "hangul-open-file", category: "hangul",
    hint: "폴더 모양 📂 아이콘이 불러오기 버튼이에요.",
  },
  // Excel
  {
    id: "open-excel", title: "엑셀 열기", description: "엑셀 프로그램을 열어 봐요.",
    instruction: "바탕화면의 '엑셀' 아이콘을 두 번 빠르게 눌러요.",
    points: 10, type: "open-excel", category: "excel",
    hint: "초록색 X 모양 아이콘이 엑셀이에요.",
  },
  {
    id: "excel-input", title: "셀에 숫자 넣기", description: "칸에 숫자를 넣어 봐요.",
    instruction: "A1 칸을 눌러 100 을 쓰고 Enter 를 눌러요.",
    points: 20, type: "excel-input", category: "excel",
    hint: "왼쪽 맨 위 첫 번째 칸(A1)이에요.",
  },
  // PowerPoint
  {
    id: "open-ppt", title: "파워포인트 열기", description: "파워포인트를 열어 봐요.",
    instruction: "바탕화면의 '파워포인트' 아이콘을 두 번 빠르게 눌러요.",
    points: 10, type: "open-ppt", category: "powerpoint",
    hint: "주황색 P 모양 아이콘이 파워포인트예요.",
  },
  {
    id: "ppt-text", title: "제목 쓰기", description: "슬라이드에 제목을 써 봐요.",
    instruction: "제목 자리를 누르고 '나의 발표' 를 써요.",
    points: 20, type: "ppt-text", category: "powerpoint",
    hint: "'제목을 추가하려면 클릭하세요' 라고 쓰인 곳을 눌러요.",
  },
  {
    id: "ppt-font-size", title: "글자 크기 바꾸기", description: "글자 크기를 바꿔 봐요.",
    instruction: "글자를 끌어서 파랗게 고른 뒤, 글자 크기를 28 로 바꿔요.",
    points: 15, type: "ppt-font-size", category: "powerpoint",
    hint: "먼저 글자를 끌어서 골라요. 그 다음 숫자에서 28 을 골라요.",
  },
  {
    id: "ppt-font-family", title: "글꼴 바꾸기", description: "글꼴을 바꿔 봐요.",
    instruction: "글자를 끌어서 파랗게 고른 뒤, 글꼴에서 '바탕' 을 골라요.",
    points: 15, type: "ppt-font-family", category: "powerpoint",
    hint: "글자를 먼저 골라야 글꼴을 바꿀 수 있어요.",
  },
  {
    id: "ppt-image", title: "그림 넣기", description: "슬라이드에 그림을 넣어 봐요.",
    instruction: "위쪽 도구 모음에서 🖼️ 그림 버튼을 누르고, 그림을 골라 '열기' 를 눌러요.",
    points: 15, type: "ppt-image", category: "powerpoint",
    hint: "🖼️ 아이콘을 누르면 그림 고르는 창이 나와요.",
  },
  {
    id: "ppt-image-resize", title: "그림 크기 바꾸기", description: "그림 크기를 바꿔 봐요.",
    instruction: "그림 모서리의 파란 점을 끌어서 크기를 바꿔요.",
    points: 15, type: "ppt-image-resize", category: "powerpoint",
    hint: "그림을 한 번 누르면 모서리에 파란 점이 생겨요.",
  },
  // Finish
  {
    id: "shutdown", title: "컴퓨터 끄기", description: "안전하게 컴퓨터를 꺼요.",
    instruction: "시작 버튼 → 전원 → '시스템 종료' 를 차례대로 눌러요.",
    points: 20, type: "shutdown", category: "finish",
    hint: "시작 → 전원 → 시스템 종료 순서예요.", termKey: "shutdown",
  },
];
