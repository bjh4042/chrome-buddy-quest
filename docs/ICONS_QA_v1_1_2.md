# 윈도우 탐험대 v1.1.2 — 아이콘 출처와 검증

작성일: 2026-11-03. **아이콘 출처·자동 검증·6개 브라우저 뷰포트 확인 완료.** 아이콘 통합 후 회귀 검사를 실행했고, 마지막 중앙 정렬·높이 보정은 아래의 실제 브라우저 재검수로 확인했습니다.

## 적용 목표와 판독 기준

바탕화면·시작 메뉴·작업 표시줄·프로그램 제목 표시줄에서 같은 프로그램은 같은 아이콘을 사용하도록 맞춥니다. 제품 아이콘은 공식 배포 자료를 우선 확인하고, 시스템 기호는 출처가 확인된 Fluent 아이콘과 이 앱에서 작성한 벡터를 구분합니다. 아이콘의 출처와 실제 Windows 전체 화면의 동일성은 별개의 검증 대상입니다.

공통 `WindowsIcon.tsx`의 `AppIcon`에 22종의 로컬 자산 연결을 확인했습니다. 바탕화면 48px·시작 메뉴 32px·작업 표시줄 24px·제목 표시줄 16px의 연결을 확인했고, 작은 화면의 바탕화면과 시작 메뉴 경계를 아래의 범위에서 확인했습니다.

## 확보한 원본의 분류

| 분류 | 확보한 자료 | 출처와 구분 |
|---|---|---|
| Microsoft 제품 브랜드 자료 | Excel FY26 SVG, PowerPoint FY26 SVG | Microsoft 공식 웹사이트의 제품 아이콘. PowerToys·Fluent의 MIT 자산과 별도로 분류합니다. |
| Microsoft 제품 브랜드 자료 | Edge 공식 favicon PNG | 공식 CDN의 PNG를 `edge.png`로 그대로 사용합니다. SVG 로고도 원본 후보로 확보했으나 공통 제품 아이콘에는 PNG를 선정했습니다. |
| Microsoft 제품 브랜드 자료의 여백 정리본 | 메모장 Microsoft Store PNG | 원본 150×150에서 투명 여백만 `(49,47)–(102,109)`로 잘라 53×62 PNG로 저장했습니다. 재표본화는 하지 않았으며 원본 바이트 그대로인 파일과 구분합니다. |
| 검토 후 미선정한 공식 자료 | 설정 Microsoft 지원 PNG | 확보 원본은 16×16 PNG입니다. 실제 공통 설정 앱 아이콘은 별도로 작성한 SVG를 사용합니다. |
| Microsoft PowerToys 저장소 자산 | FileExplorer.svg·FileExplorer.png | Microsoft PowerToys 저장소의 파일 탐색기 자산. 확인한 저장소 라이선스는 MIT이며 저작권 고지와 라이선스 원문을 보존합니다. Windows 셸 바이너리의 추출 원본으로 표기하지 않습니다. |
| Microsoft Fluent UI System Icons 자산 | 검색·작업 보기·볼륨·음소거·배터리·전원·밝기·Bluetooth·비행기·야간 모드·접근성·캐스트·설정 기호 | Microsoft의 MIT 아이콘 모음입니다. 작은 UI 기호이며, 예를 들어 Fluent 설정 기호와 Windows 설정 앱의 컬러 제품 아이콘은 서로 다른 자료입니다. |
| 앱에서 직접 작성한 앱·시스템 자산 | `AppIcon`의 내 PC·휴지통·폴더류·드라이브·설정·시작·작업 보기·검색 등 16종 | Windows 스타일을 참고하여 코드로 다시 작성한 SVG입니다. 공식 Windows 셸에서 추출한 원본으로 표기하지 않습니다. |
| 앱에서 직접 작성한 상태 기호 | `WindowsGlyph`의 Wi-Fi 켜짐·꺼짐 2종 | 원호·점·차단선 도형을 이 시뮬레이터용으로 작성했습니다. |
| 한컴 공식 도형 데이터의 SVG 직렬화본 | 한컴독스 `SvgIcLandingHwp` | 공식 번들의 경로·그라디언트를 재작성하지 않고 SVG로 직렬화한 파일을 `hangul.svg`로 사용합니다. 별도로 만든 HWP 2024 참조 재작성 후보는 선정하지 않았습니다. |

제품 브랜드 자산에 일반 MIT 사용 허가가 있다고 기록하지 않습니다. PowerToys·Fluent의 MIT 고지는 해당 저장소 자산에 적용하며, 제품 상표에 대한 별도 권리까지 포괄하는 것으로 확대하지 않습니다.

### 제품·저장소 원본 추적

아래 값은 원본 수집 기록 `download-manifest.json`에 기록된 SHA-256입니다. 크롭·벡터 재작성·렌더링을 거친 최종 파일은 원본과 별도 항목으로 기록해야 합니다.

| 확보 파일 | 원본 출처 | SHA-256 |
|---|---|---|
| Excel-Icon-FY26.svg | [Microsoft 공식 SVG](https://www.microsoft.com/content/dam/microsoft/bade/images/icons/en-us/m365-app-icons-fy26/Excel-Icon-FY26.svg) | `ff01cdad545c6f1c0bff371c1f1758ad228174520c718c679bd454f6b4fcacf8` |
| PowerPoint-Icon-FY26.svg | [Microsoft 공식 SVG](https://www.microsoft.com/content/dam/microsoft/bade/images/icons/en-us/m365-app-icons-fy26/PowerPoint-Icon-FY26.svg) | `9bdf04481c14b24f419bad93903daff9884ad5a4b957a77241ddc0294ce5b423` |
| edge-official-favicon.png → edge.png | [Edge 공식 CDN](https://edgecdn-embza6g8cacagcbn.z01.azurefd.net/welcome/static/favicon.png) | `4d755ac02a070a1b4bb1b6f1c88ab493440109a8ac1e314aaced92f94cdc98e9` |
| FileExplorer.svg | [PowerToys 원본](https://github.com/microsoft/PowerToys/blob/main/src/modules/cmdpal/ext/Microsoft.CmdPal.Ext.Indexer/Assets/FileExplorer.svg) | `35ef9673671c71790b8854f7b3d65f950b5e5e01407d2cc8ddfc4908a01e4936` |
| Notepad-store.png | [Microsoft Store 이미지](https://store-images.s-microsoft.com/image/apps.41930.13825011251621706.e8a531ea-e643-41b9-8969-8a0182f70030.40b3aa63-5e70-4bee-b320-40ca636ec530) | `caa32604f6879d77bfa6513456f532878ac1bf01b72bab8d0a220f8e5c8bbe1e` |
| Settings-support.png | [Microsoft 지원 이미지](https://support.microsoft.com/en-us/windows/media/settingsapp.png) | `d72455cc718457c8975118df69fd8eb58dd443ebd3642d6ed8aeb96cdfec27c9` |

Fluent의 14개 SVG 원본 URL·해시는 `src/assets/windows-glyphs/sources.json`, MIT 원문은 같은 폴더의 `LICENSE.microsoft-fluent.txt`에 있습니다. 렌더링에서는 경로를 유지하고 색상을 `currentColor`로 적용합니다. 작업 보기는 Fluent의 Window Multiple 기호를 사용합니다.

한컴 자료의 확인 출처는 [한컴독스](https://www.hancomdocs.com/ko/)와 해당 페이지의 `index-BOT5wBe3.js` 번들입니다. 확보한 번들의 SHA-256은 `990b95791b784972e76bfc37783b91a866c553753c4ea41e81d97ad3d56dbbf0`입니다. 최종 `hangul.svg`의 SHA-256은 `9cbe8acd922213448841aee6384c7690591fadb38d839be1815962485f28b2cb`입니다. 한컴 출처 기록은 `src/assets/windows-icons/hancom-provenance.json`에 보관합니다.

## 공통 앱 아이콘 연결

`src/components/icons/WindowsIcon.tsx`에서 다음 로컬 파일을 참조합니다. 경로의 기준은 `src/assets/windows-icons/`입니다.

| 이름 | 연결 파일 | 가공·작성 구분 |
|---|---|---|
| Excel / PowerPoint | `excel.svg` / `powerpoint.svg` | 공식 FY26 SVG 원본과 SHA-256 일치 |
| Edge | `edge.png` | 공식 favicon PNG 원본과 SHA-256 일치 |
| 파일 탐색기 | `file-explorer.svg` | PowerToys SVG 원본과 SHA-256 일치 |
| 한글 | `hangul.svg` | 한컴 공식 SVG 경로·그라디언트의 직렬화본 |
| 메모장 | `notepad.png` | 공식 Store PNG에서 투명 여백만 크롭, 53×62, 재표본화 없음 |
| 내 PC / 휴지통 비어 있음·가득 참 | `this-pc.svg` / `recycle-bin.svg` / `recycle-bin-full.svg` | 앱에서 작성한 SVG |
| 폴더·문서·다운로드·사진·음악·동영상·바탕 화면 | `folder.svg` / `documents.svg` / `downloads.svg` / `pictures.svg` / `music.svg` / `videos.svg` / `desktop.svg` | 앱에서 작성한 SVG |
| 텍스트 파일 / 드라이브 / 설정 | `text-file.svg` / `drive.svg` / `settings.svg` | 앱에서 작성한 SVG |
| 시작 / 작업 보기 / 검색 | `start.svg` / `task-view.svg` / `search.svg` | 앱에서 작성한 SVG |

메모장 크롭본의 SHA-256은 `36add191b9f3f81a3157e8466e38b028a65e24d335c4313722b576edae64c995`입니다. `WindowsGlyph`의 14개 Fluent 기호와 2개 자체 Wi-Fi 상태는 별도 체계이며, 같은 ‘설정·검색·작업 보기’ 이름이라도 앱 아이콘과 작은 상태 기호의 출처를 혼동하지 않습니다.

## QA 기록 — 자동 검증·브라우저 확인 완료

| 검증 항목 | 이번 변경 상태 |
|---|---|
| 공통 `AppIcon` 22종의 파일 연결·원본 해시 대조 | 연결·출처 분류 확인 |
| 화면별 아이콘과 크기 | 48/32/24/16px 적용 확인. Chrome 1363×936에서 바탕화면·시작 메뉴 로딩, 탐색기를 실제 열어 드라이브 48px·좌측 폴더 16px·문서/다운로드 위치 아이콘 확인 |
| 여백·제품 도형 표시 | Chrome 1363×936에서 흰 여백 제거, Excel·PowerPoint·한글 ㅎ·탐색기·설정·메모장 표시 확인. 6개 작은 바탕화면에서 이미지 로딩 확인 |
| 볼륨·Wi-Fi 등 기존 버튼 동작 | 전체 회귀 테스트 통과. 상태 기호 전체에 대한 별도 시각 전수 검사는 수행하지 않음 |
| 버튼 이름·키보드 동작 | 기존 관련 회귀 테스트 통과. 320px 시작 메뉴의 메모장 실제 클릭·편집 영역 표시 확인. 키보드의 별도 시각 전수 검사는 수행하지 않음 |
| 6개 작은 바탕화면 | 이미지 깨짐 0, 문서 가로 넘침 없음, 앱 버튼·상태 영역 겹침 없음 |
| 작은 시작 메뉴 | 중앙 정렬·부모 영역 기준 높이 보정 후 6개 너비의 경계·이미지 확인. 짧은 2개 화면은 메뉴 스크롤 확인 |
| 전체 회귀 테스트·TypeScript 검사 | 아이콘 통합 후 전체 24개 파일·165개 테스트 통과. 마지막 정렬·높이 보정 후 데스크톱 회귀 8개와 TypeScript 검사 재통과 |
| 일반 빌드·GitHub Pages 경로/자산 검사 | 마지막 높이 보정 후 일반 빌드·Pages 빌드·3개 진입 파일 자산 검사 재통과 |
| SVG 구조·버전 | 공통 앱 아이콘 SVG 20종 XML 파싱 통과, script 태그·외부 href 0. package·잠금 파일의 버전 1.1.2 일치 |

### 작은 화면의 실제 브라우저 확인

Chrome의 독립 iframe을 다음 CSS 뷰포트 크기로 실행했습니다. 표의 대상은 바탕화면이며, 각 화면에서 검사한 이미지 8개의 깨짐이 없고 문서 폭이 뷰포트 폭과 같았습니다. 물리 기기·OS 배율별 실기 검사를 뜻하지 않습니다.

| 뷰포트 | 검사 이미지 | 깨진 이미지 | 문서 가로 넘침 | 앱 버튼·상태 영역 겹침 |
|---|---|---|---|---|
| 1024×600 | 8개 | 0개 | 없음 | 없음 |
| 800×600 | 8개 | 0개 | 없음 | 없음 |
| 640×480 | 8개 | 0개 | 없음 | 없음 |
| 360×640 | 8개 | 0개 | 없음 | 없음 |
| 568×320 | 8개 | 0개 | 없음 | 없음 |
| 320×360 | 8개 | 0개 | 없음 | 없음 |

320px 너비에서는 앱 버튼 영역 자체의 가로 스크롤로 5개 버튼에 접근합니다. 문서 전체가 옆으로 넘치는 구조와 구분하여 확인했습니다.

### 시작 메뉴 보정과 재검수

320px 시작 메뉴의 오른쪽 이탈을 발견하여 중앙 정렬을 보정했습니다. 메뉴 높이도 전체 브라우저 높이 대신 앱의 부모 영역 높이를 기준으로 제한하여, 짧은 화면에서 메뉴 위쪽이 학습 안내 뒤로 숨는 문제를 고쳤습니다.

| 뷰포트 | 메뉴 왼쪽 / 오른쪽 | 검사 이미지 | 깨진 이미지 |
|---|---|---|---|
| 1024×600 | 320 / 704 | 8개 | 0개 |
| 800×600 | 208 / 592 | 8개 | 0개 |
| 640×480 | 128 / 512 | 8개 | 0개 |
| 360×640 | 7 / 353 | 8개 | 0개 |
| 568×320 | 92 / 476 | 8개 | 0개 |
| 320×360 | 7 / 313 | 8개 | 0개 |

높이 보정 후 568×320과 320×360을 다시 확인했습니다. 두 화면 모두 바탕화면 위쪽이 y=77, 메뉴 위쪽이 y=84였고, 메뉴 아래쪽은 각각 y=271·311이었습니다. 메뉴 내부 스크롤로 나머지 항목에 접근할 수 있었습니다. 320px 화면에서 메모장 버튼을 실제 클릭하여 `제목 없음 - 메모장` 창과 입력 영역이 나타나는 것을 확인했습니다.

이 기록은 Chrome 내부의 CSS iframe 뷰포트 검수입니다. 실제 Windows 화면 배율·설치 글꼴·물리 태블릿·다른 브라우저의 아이콘 렌더링을 전수 검증한 결과로 확대하지 않습니다.

제품 자산의 출처·가공 기록은 `src/assets/windows-icons/sources.json`, 제품 브랜드와 별도 권리 구분은 `ASSET_NOTICES.md`, PowerToys MIT 원문은 `PowerToys-LICENSE.txt`에 보관합니다. 모든 아이콘은 로컬 파일로 묶어 실행 중 외부 아이콘 서버에 요청하지 않습니다.

이번 작업은 아이콘 정비입니다. 기존 GitHub Pages 기본 경로·자동 배포 설정을 유지합니다. 이번 검사의 Pages 경로·자산 검사는 통과했으며 실제 원격 GitHub Actions 게시 여부는 별도 확인 대상입니다. 기존 배포·기능 검증은 [v1.1.1 Pages 기록](GITHUB_PAGES_QA_v1_1_1.md)과 [기존 반응형 기록](RESPONSIVE_QA_v1_1.md)에 보존합니다.
