import { ArrowRight, BookOpen, GraduationCap, ListChecks, MousePointer2, Play, RotateCcw, Star, UserRound } from "lucide-react";
import { QUESTS } from "@/types/quest";
import bloomWallpaper from "@/assets/windows11-bloom-light.jpg";
import "./StartScreen.css";

interface StartScreenProps {
  onStart: () => void;
  hasProgress?: boolean;
  completedCount?: number;
  totalQuests?: number;
  currentQuestTitle?: string;
  onResume?: () => void;
  onFreePractice?: () => void;
  onTeacher?: () => void;
  onFreshStart?: () => void;
}

const StartScreen = ({
  onStart,
  hasProgress,
  completedCount = 0,
  totalQuests,
  currentQuestTitle,
  onResume,
  onFreePractice,
  onTeacher,
  onFreshStart,
}: StartScreenProps) => {
  const total = totalQuests ?? QUESTS.length;
  const primaryLabel = hasProgress ? "이어서 탐험하기" : "탐험 시작하기";
  const primaryHandler = hasProgress ? (onResume ?? onStart) : onStart;
  const progress = total > 0 ? Math.min(100, Math.max(0, completedCount / total * 100)) : 0;

  return (
    <main className="windows-welcome" style={{ backgroundImage: `url(${bloomWallpaper})` }}>
      <section className="welcome-window" aria-labelledby="welcome-title">
        <header className="welcome-titlebar">
          <span className="welcome-brand">
            <span className="welcome-windows-mark" aria-hidden="true"><i /><i /><i /><i /></span>
            <span>Windows 11 <span className="welcome-brand-divider">|</span> 컴퓨터 실습</span>
          </span>
          <span className="welcome-version">26H2</span>
        </header>

        <div className="welcome-content">
          <div className="welcome-app-icon" aria-hidden="true">
            <span className="welcome-windows-mark"><i /><i /><i /><i /></span>
          </div>
          <p className="welcome-eyebrow">컴퓨터와 친해지는 첫걸음</p>
          <h1 id="welcome-title">윈도우 탐험대</h1>
          <p className="welcome-description">클릭부터 나만의 발표 자료까지,<br className="welcome-mobile-break" /> 직접 해 보며 배워요.</p>

          <div className="welcome-facts" aria-label="학습 구성">
            <span><MousePointer2 size={15} aria-hidden="true" /> {total}개 미션</span>
            <span className="welcome-fact-divider" aria-hidden="true" />
            <span><Star size={15} aria-hidden="true" /> 별 모으기</span>
          </div>

          {hasProgress && (
            <div className="welcome-progress">
              <div className="welcome-progress-heading"><span>나의 탐험 기록</span><strong>{completedCount}<span> / {total} 완료</span></strong></div>
              <div className="welcome-progress-track" role="progressbar" aria-label="완료한 미션" aria-valuemin={0} aria-valuemax={total} aria-valuenow={completedCount}><span style={{ width: `${progress}%` }} /></div>
              {currentQuestTitle && <p>다음 임무: {currentQuestTitle}</p>}
            </div>
          )}

          <nav className="welcome-actions" aria-label="학습 시작 방법">
            <button type="button" onClick={primaryHandler} className="welcome-primary">
              <Play size={18} aria-hidden="true" /><span>{primaryLabel}</span><ArrowRight size={18} aria-hidden="true" />
            </button>
            <button type="button" onClick={onFreePractice} className="welcome-secondary">
              <span className="welcome-action-icon"><ListChecks size={21} aria-hidden="true" /></span>
              <span><strong>원하는 임무 연습하기</strong><small>궁금한 기능을 자유롭게 골라요</small></span>
              <ArrowRight size={16} aria-hidden="true" />
            </button>
            <button type="button" onClick={onTeacher} className="welcome-secondary">
              <span className="welcome-action-icon"><GraduationCap size={22} aria-hidden="true" /></span>
              <span><strong>선생님과 함께 배우기</strong><small>오늘 배울 주제로 바로 시작해요</small></span>
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </nav>

          {hasProgress && (
            <button type="button" onClick={onFreshStart} className="welcome-reset"><RotateCcw size={13} aria-hidden="true" /> 학습 기록 지우고 처음부터 시작하기</button>
          )}

          <details className="welcome-guidance">
            <summary>실습 범위와 사용 안내</summary>
            <p>Windows 11 26H2의 바탕화면·창·파일·빠른 설정을 연습하고, 한글·Microsoft 365 스타일의 엑셀·파워포인트·Edge 학습 화면에서 자료를 만들어요. 프로그램 안의 실습 안내를 따라 완성해 보세요.</p>
            <p>컴퓨터 전체를 실행하는 운영체제는 아니에요. Wi-Fi·볼륨·종료는 탐험대 안에서 연습하며, 실제 컴퓨터 설정은 바뀌지 않아요. 한글·엑셀·파워포인트의 모든 기능이나 전용 파일 형식을 지원하지는 않아요.</p>
            <p>학습 기록과 연습 문서는 현재 브라우저에 저장돼요. 여러 학생이 같은 기기를 쓰면 시작 전에 기록을 확인해 주세요. 실제 비밀번호나 개인정보는 입력하지 않아요.</p>
          </details>
        </div>

        <footer className="welcome-footer">
          <span className="welcome-profile"><span><UserRound size={16} aria-hidden="true" /></span>우리 반 컴퓨터 교실</span>
          <a href="/guide.html" target="_blank" rel="noopener noreferrer"><BookOpen size={15} aria-hidden="true" /> 교사용 실습 안내<span className="sr-only"> 열기 (새 창)</span></a>
        </footer>
      </section>
      <p className="welcome-caption">한 번에 한 주제씩, 나의 속도로 탐험해요.</p>
    </main>
  );
};

export default StartScreen;
