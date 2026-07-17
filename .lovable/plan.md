# 윈도우 탐험대 3단계 후속 - 레이아웃·상태·문구·반응형

이번 턴은 신규 기능/퀘스트/판정 로직을 추가하지 않고, 오직 학습 화면의 **레이아웃 재편(3-B)**, **퀘스트 상태 표시 통일(3-C)**, **학생용 문구 리라이트(3-E)**, **1366×768 중심 반응형 회귀 점검(3-G)** 만 수행합니다.

## 작업 전 기준 화면 점검

Playwright로 다음 해상도 스냅샷을 먼저 저장하고 겹침/잘림/이중 스크롤을 기록합니다.
- 1920×1080, **1366×768(최우선)**, 1280×720, 1024×768
- 화면: 시작(진행 없음/있음), 학습 기본, 한글/엑셀/PPT/엣지 창 열림, 성공 카드, 오답 4회 후, 초기화 확인창

## 3-B 학습 화면 레이아웃 재편

`src/pages/Index.tsx` 구조를 다음으로 재편합니다.

```
h-[100dvh] flex-col
 ├─ TopLearnBar     : 고정 높이 (모바일 자동 축약)
 ├─ CurrentQuestCard: 내용 기반 제한 높이 (기본 1~3줄, 펼치기)
 └─ Simulation      : flex-1 (WinDesktop + Praise + Term)
```

- **TopLearnBar** (`src/components/TopLearnBar.tsx` 신규): `[☰ 임무 목록] [12 / 48] [현재 임무 제목…] ★24 [도움말] [설정?]`. 아이콘만 있는 버튼에는 `aria-label` + `title`. 좁은 화면에서 제목 truncate.
- **CurrentQuestCard** (`src/components/CurrentQuestCard.tsx` 신규): "지금 할 일" 라벨 + 현재 instruction + (완료 배지) + 힌트 문구. 접기/펼치기 지원. 기존 `currentAlreadyCompleted` 배지를 이 카드로 통합.
- **QuestPanel** → `Sheet`로 감싸 슬라이드 패널로 전환 (신규 `src/components/QuestSheet.tsx` 래퍼 사용, 기존 `QuestPanel` 컴포넌트 재사용). 기본 닫힘, TopLearnBar 버튼으로 open, 퀘스트 선택 시 자동 close, ESC/backdrop close. 데스크톱에서도 오버레이 방식 유지(고정 사이드바 폐지).
- **Simulation**: `WinDesktop`은 남은 높이를 100% 사용. 이중 스크롤 방지 위해 상위는 `overflow-hidden`, 내부만 스크롤.
- **레이어 우선순위 재정렬**: Praise > 힌트/손가락 > TopLearnBar > 시뮬레이션. z-index 정리 (top-bar z-30, sheet z-50, praise z-[110]).
- `100vh` → `100dvh` 로 교체.

## 3-C 퀘스트 상태 표시 통일

`src/components/QuestPanel.tsx`의 각 quest 아이템에 아이콘+글자 라벨을 함께 부여합니다.

| 상태 | 아이콘 | 텍스트 |
| --- | --- | --- |
| 완료 | ✓ CheckCircle2 | "완료" + 별 |
| 진행중 | ➤ Flag | "지금 하는 임무" (테두리 강조, 반짝임 제거) |
| 미완료 | ○ Circle | "아직" |
| 잠김 | 🔒 Lock | "앞 임무를 먼저 해요" |
| 재연습 | ↻ RotateCcw | "다시 연습 중" (완료+선택된 현재 퀘스트) |

색상만이 아닌 아이콘+라벨을 항상 병기. 좁은 폭에서는 라벨 truncate 하되 아이콘 유지. 카테고리 잠금 hover-only 안내는 화면 텍스트로 노출.

## 3-E 학생용 문구 리라이트

- `src/types/quest.ts`의 각 quest `title`, `instruction` 을 초등 저학년 눈높이로 다듬음. 제목 12자 이내, 설명 1문장 짧게, "~해요/눌러요" 톤. 우클릭/더블클릭/드래그 표현을 명세대로 통일. **id, type, points, category, termKey 등은 변경 금지**.
- `StartScreen.tsx` 버튼 라벨: "이어서 탐험하기", "임무 골라서 연습하기", "모두 지우고 처음부터".
- `CharacterPraise.tsx` 버튼: 기존 "다음 임무"/"한 번 더 연습" 유지. 재연습 확인 버튼은 "연습 마치기"로 검토했다가 흐름 위험이 있으면 "확인" 유지하고 개선 후보로만 기록.
- `WrongClickHint.tsx` 및 힌트 라벨: 탓하는 표현 제거, "다른 곳을 눌렀어요. 임무를 다시 살펴봐요." 등으로 교체.
- 판정 로직/quest id/points/카테고리 언락 규칙은 **변경 금지**.

## 3-G 반응형 회귀 점검 (1366×768 최우선)

- Tailwind fluid 토큰(`text-fluid-*`, `p-fluid-*`) 이미 존재 → TopLearnBar/카드/패널에 적용.
- TopLearnBar: 좁은 폭에서 도움말/설정 버튼을 아이콘 전용으로 축소, 제목 truncate.
- CurrentQuestCard: 기본 max-h + 펼치기.
- Sheet: `w-[320px] sm:w-[360px] max-w-[85vw]`.
- 1024×768 이하: 점수 별 표시 아이콘+숫자로 축약, "도움말" 텍스트 라벨 숨김.
- Playwright로 4개 해상도 재검증 후 스크린샷 확인.

## 접근성/모션

- 기존 `prefers-reduced-motion` 규칙 유지. 신규 Sheet/카드 애니메이션도 reduced motion에서 즉시 표시되도록 duration 최소화.
- 반복 pulse는 진행중 배지에서 정적 border로 대체.

## 회귀 방지 (변경 금지)

- 8초 자동 이동, 다음/연습 버튼, 재연습 무점수, 1~4단계 힌트, 3회 glow / 4회 손가락, 시작 3버튼, localStorage v2 스키마, 퀘스트 판정, Hook 순서 안정성.
- **Hook 규칙**: 신규 컴포넌트 모두 최상단 Hook 사용, 조기 return 뒤 Hook 호출 금지.

## 수정 예정 파일

- `src/pages/Index.tsx` — 레이아웃 컨테이너 재편, QuestPanel을 Sheet로 감싸기, 배지 이동.
- `src/components/TopLearnBar.tsx` — 신규.
- `src/components/CurrentQuestCard.tsx` — 신규.
- `src/components/QuestSheet.tsx` — 신규 (shadcn `Sheet` 래퍼).
- `src/components/QuestPanel.tsx` — 상태 라벨/아이콘 통일, 헤더 축약(스코어/맵은 상단바로 이관).
- `src/components/StartScreen.tsx` — 버튼 문구 다듬기.
- `src/components/WrongClickHint.tsx` — 문구.
- `src/components/CharacterPraise.tsx` — 문구 미세 조정 (동작 유지).
- `src/types/quest.ts` — title/instruction 리라이트.
- `src/index.css` — `100dvh` 유틸리티, reduced-motion 신규 애니메이션 커버.

## 검증

- `tsgo --noEmit`, `eslint`, `bun run build`.
- Playwright 4해상도 × 주요 화면 스크린샷 후 `code--view`로 확인.
- 기능 시나리오: 시작(기록 무/유), 이어서/골라서/처음부터(취소·확정), 목록 선택, 완료 재선택, 성공 후 다음/연습, 재연습 완료, 오답 4회, 새로고침 복구.

## 보고 형식

명세대로: 수정 전 문제 → 적용 변경 → 수정 파일 → 회귀 결과 → 해상도별 결과 → 검사 결과 → 남은 문제.
