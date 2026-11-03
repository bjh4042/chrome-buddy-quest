# GitHub Pages 배포 패키지 검증 — v1.1.1

확인일: 2026-11-03. 현재 GitHub main `828c21dcf768a5548a3f05f6168c7ca1b5913caa`를 기준으로 수정했습니다.

## 수정

- 기존 BrowserRouter basename을 유지하고 `/index.html` 직접 접속도 같은 시작 화면으로 연결.
- 시작 화면의 교사용 안내와 404 복귀 링크에 빌드 기본 경로 적용.
- 정적 교사용 안내의 복귀 링크를 같은 프로젝트 디렉터리로 수정.
- GitHub Pages 전용 빌드 명령과 산출물의 경로/파일 존재 검사 추가.
- main Push와 수동 실행을 지원하는 GitHub Actions 자동 배포 파일 추가. Node22 빌드, 타입 검사·회귀 테스트 선행, dist만 게시. 공식 액션은 확인한 안정 릴리스의 전체 SHA로 고정.
- package.json과 잠금 파일 버전 동기화.

## 완료한 검사

- 자동 테스트: 24개 파일, 165개 통과.
- TypeScript 검사: 통과.
- 일반 루트 주소용 빌드: 통과.
- GitHub Pages `/chrome-buddy-quest/`용 빌드: 통과.
- 컴파일된 JS/CSS/favicon의 경로와 실제 산출물 존재 검사: 통과.
- 워크플로 YAML 구문, 트리거, 권한, 환경과 dist 업로드 설정 검사: 통과.
- 정적 Pages 형태로 배치한 실제 프로덕션 빌드를 Chrome에서 열어 시작 화면, Bloom 이미지 경로, 교사용 안내 경로와 안내 페이지 표시 확인.
- 안내의 상대 복귀 링크는 표준 URL 해석으로 프로젝트 루트에 연결됨을 확인. 검수 브라우저가 이후 클릭을 URL 정책으로 차단하여 복귀 후 학습 시작 클릭과 index.html 직접 진입의 브라우저 실기 검증은 완료하지 못함. 앱 코드를 이 검수 정책에 맞춰 변경하지 않았음.

## 업로드 후 확인

이 패키지는 GitHub 저장소나 Pages 설정을 원격으로 변경하지 않습니다. 사용자가 압축을 풀어 `.github`를 포함해 저장소에 올리고 Settings → Pages → Source를 GitHub Actions로 선택해야 합니다. 실제 GitHub Actions 서버에서의 배포 성공은 업로드 후 Actions의 초록 체크와 최종 접속 화면으로 확인합니다.

코드·에셋 원본을 포함하며 node_modules, dist, Git 메타데이터와 로컬 미리보기 파일은 ZIP에서 제외합니다.
