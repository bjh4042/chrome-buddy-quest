
## 3단계 최종 수동 확인

브라우저 미리보기에서 아래 4개 항목만 빠르게 점검하고, 치명적/높음 등급 문제가 없으면 3단계 완료 처리합니다.

- CharacterPraise 일반 성공 화면: 다음 임무 / 한 번 더 연습 버튼 동작, 8초 자동 이동, 1366×768 잘림 여부
- 재연습 성공 화면: 점수·별 미증가, 자동 이동 없음, 타이머 중복 없음
- 4단계 점진 힌트: 잘못된 클릭 1~4회 시 문구→위치→glow→라벨 순서, 퀘스트 변경 시 초기화
- Edge 창: 아이콘/작업표시줄로 실제 열리는지, 주소창·네비 버튼·닫기 동작

문제 발견 시 등급만 기록하고, 치명/높음이면 최소 수정만 반영합니다. 코드 대규모 변경 없음.

## 4단계 — 학습 모드 도입

학생이 세 가지 방식 중 하나로 학습할 수 있도록 확장합니다. 기존 퀘스트 ID, 판정, 점수, 별, CharacterPraise 자동 이동(8초), 힌트 4단계, RestartConfirmDialog, TopLearnBar, CurrentQuestCard, QuestSheet 는 변경하지 않습니다.

### 학습 모드 타입

`src/features/learning/learningMode.ts` 신규:

```ts
export type LearningMode = "story" | "free-practice" | "teacher";
```

관련 상수(라벨/설명/아이콘)도 여기서 관리해 컴포넌트에서 문자열 중복 금지.

### 상태 구조 (Index.tsx 확장, 재작성 아님)

- `learningMode: LearningMode` (기본 "story")
- 기존 `currentQuest`는 story 모드 진행 위치로 유지 → 이름 유지하되 내부 시맨틱은 "story 진행 위치"
- `practiceQuestId: string | null` — 자유 연습에서 열어본 마지막 퀘스트
- `teacherCategory: string | null` — 선생님 모드에서 선택한 카테고리 id
- 활성 퀘스트 계산: `activeQuestIndex = useMemo(...)` 모드에 따라 반환
  - story → `currentQuest`
  - free-practice → practiceQuestId의 index (없으면 0)
  - teacher → 카테고리의 첫 미완료 또는 practice 선택 index
- 자유/선생님 모드에서 퀘스트 선택 시 **`currentQuest`(story 위치)는 절대 변경하지 않음**

### localStorage 확장

`win-explorer-progress-v2` 유지 + optional 필드 추가:

```ts
type SavedProgress = {
  version: 2;
  screen: Screen;
  questsState: {...}[];
  currentQuest: number;         // story 위치
  learningMode?: LearningMode;  // 신규
  practiceQuestId?: string | null;
  teacherCategory?: string | null;
};
```

기존 데이터 로드 시 새 필드 없으면 안전한 기본값 사용. 개인정보 저장 없음.

### 시작 화면 (StartScreen.tsx)

진행 기록 유무와 무관하게 세 모드 카드 표시:

1. **이어서 탐험하기 / 탐험 시작하기** (story)
2. **원하는 임무 연습하기** (free-practice)
3. **선생님과 함께 배우기** (teacher) → 카테고리 선택 화면으로

`처음부터 시작하기`는 하단 작은 secondary 버튼으로 유지(삭제/숨김 금지). 1366×768, 1280×720에서 접근 가능.

### 카테고리 선택 화면

신규 `src/components/CategoryPicker.tsx`:

- QUEST_CATEGORIES를 순회하여 카드 렌더
- 카드 요소: 아이콘, 이름, 한 문장 설명, 완료 수/전체 수, 연습하기 버튼
- 빈 카테고리는 숨김(개발 콘솔 warn)
- 실제 `<button>` 사용, Tab/Enter/Space 접근 가능

`Index.tsx`에 `screen === "category-picker"` 추가.

### 접근 정책 (단일 함수)

신규 `src/features/learning/access.ts`:

```ts
export function canAccessQuest(
  quest: Quest, index: number, mode: LearningMode,
  quests: Quest[], teacherCategory: string | null
): boolean
```

- story: 이전 카테고리 완료 잠금 로직 유지
- free-practice: 항상 true
- teacher: `quest.category === teacherCategory`인 경우만

`QuestPanel`, `QuestSheet`, `CategoryPicker`에서 이 함수만 사용.

### 학습 화면 모드 뱃지

`CurrentQuestCard`에 optional prop `modeBadge?: { label, hint }` 추가해 우측 상단에 작은 pill 표시. 시뮬레이션 영역 축소 최소화. 자유/선생님 모드일 때만 렌더.

### CharacterPraise 모드별 버튼

기존 로직 유지, `mode`와 `isReplay` 기반으로 버튼 세트만 분기:

- story + 신규 완료 → 다음 임무 / 한 번 더 연습 (기존)
- story + replay → 확인
- free-practice → 임무 목록으로 / 한 번 더 연습 (자동 이동 없음)
- teacher → 같은 카테고리 다음 임무 / 임무 목록으로 / 한 번 더 연습

`praiceIsReplay` 로직 유지, 점수 중복 없음, 최고 별 유지(신 별 > 기존 별일 때만 갱신).

### 학습 방법 바꾸기

`TopLearnBar` 좌측 메뉴 옆에 작은 "학습 방법 바꾸기" 버튼(또는 QuestSheet 하단). 클릭 시:

- 타이머 정리 (clearNextTimer)
- 힌트 상태 초기화 (WinDesktop key 유지, 내부 힌트 state는 questType 변경 감지로 이미 초기화됨)
- CharacterPraise 닫기
- `screen`을 "start"로

### 회귀 방지

- 퀘스트 ID/판정/점수/별/힌트 4단계/8초 자동이동/RestartConfirmDialog 로직 그대로
- 자유 연습에서 뒤쪽 퀘스트 열어도 story `currentQuest`는 불변
- Hook은 항상 최상단에서 호출

### 수정/신규 파일

- 신규: `src/features/learning/learningMode.ts`, `src/features/learning/access.ts`, `src/components/CategoryPicker.tsx`
- 수정: `src/pages/Index.tsx` (상태 확장, category-picker screen 분기, 모드별 CharacterPraise action), `src/components/StartScreen.tsx` (3모드 카드 + 처음부터 서브 버튼), `src/components/CharacterPraise.tsx` (모드별 버튼 세트), `src/components/CurrentQuestCard.tsx` (modeBadge), `src/components/TopLearnBar.tsx` (학습 방법 바꾸기 버튼), `src/components/QuestPanel.tsx` (접근 정책 사용)

### 검사

TypeScript, ESLint, production build 통과. Hook 조건부 호출 금지. React #310 재발 방지 위해 모든 useState/useMemo/useEffect는 early return 위.

### 이번 4단계에서 하지 않음

교사 로그인, 학생 계정, 학급 코드, 서버 저장, 학생 통계, 새 퀘스트/앱 기능 추가, Quick Settings 변경, 대규모 구조 재작성.
