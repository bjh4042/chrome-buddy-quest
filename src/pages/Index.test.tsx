import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, act } from '@testing-library/react';
import Index from './Index';
import { STORAGE_KEY } from '@/features/progress/progress';

vi.mock('@/components/StartScreen',()=>({default:({onStart,onFreePractice}:any)=><div><button onClick={onStart}>start</button><button onClick={onFreePractice}>free</button></div>}));
vi.mock('@/components/WinDesktop',()=>({default:({currentQuestType,onQuestComplete}:any)=><div><output data-testid="mission">{currentQuestType}</output><button onClick={onQuestComplete}>perform mission</button></div>}));
vi.mock('@/components/TopLearnBar',()=>({default:({stars,onChangeMode}:any)=><div><output data-testid="stars">{stars}</output><button onClick={onChangeMode}>change mode</button></div>}));
vi.mock('@/components/CurrentQuestCard',()=>({default:()=>null}));
vi.mock('@/components/TermDictionary',()=>({default:()=>null}));
vi.mock('@/components/QuestPanel',()=>({default:()=>null}));
vi.mock('@/components/QuestSheet',()=>({default:()=>null}));
vi.mock('@/components/CategoryPicker',()=>({default:()=>null}));
vi.mock('@/components/CompletionScreen',()=>({default:()=>null}));
vi.mock('@/components/CharacterPraise',()=>({default:({visible,onNext,onPractice}:any)=>visible?<div><span>mission complete</span><button onClick={onNext}>praise next</button><button onClick={onPractice}>practice again</button></div>:null}));

beforeEach(()=>localStorage.clear());
afterEach(()=>{cleanup();vi.useRealTimers();vi.restoreAllMocks();});

describe('learner progress flow',()=>{
  it('keeps a completed task visible until the learner explicitly advances',()=>{
    vi.useFakeTimers();render(<Index />);fireEvent.click(screen.getByText('start'));
    fireEvent.click(screen.getByText('perform mission'));
    expect(screen.getByTestId('mission')).toHaveTextContent('click');
    act(()=>vi.advanceTimersByTime(60_000));
    expect(screen.getByTestId('mission')).toHaveTextContent('click');
    expect(screen.getByText('mission complete')).toBeInTheDocument();
    fireEvent.click(screen.getByText('praise next'));
    expect(screen.getByTestId('mission')).toHaveTextContent('double-click');
  });
  it('repeating a task does not award duplicate stars or strand the learner',()=>{
    render(<Index />);fireEvent.click(screen.getByText('start'));
    fireEvent.click(screen.getByText('perform mission'));
    expect(screen.getByTestId('stars')).toHaveTextContent('3');
    fireEvent.click(screen.getByText('practice again'));
    fireEvent.click(screen.getByText('perform mission'));
    expect(screen.getByTestId('stars')).toHaveTextContent('3');
    fireEvent.click(screen.getByText('praise next'));
    expect(screen.getByTestId('mission')).toHaveTextContent('double-click');
  });
  it('resumes the next unfinished task after reloading a completed first task',()=>{
    localStorage.setItem(STORAGE_KEY,JSON.stringify({version:2,currentQuest:0,screen:'tutorial',questsState:[{id:'click',completed:true,starsEarned:3}]}));
    render(<Index />);fireEvent.click(screen.getByText('start'));
    expect(screen.getByTestId('mission')).toHaveTextContent('double-click');
    expect(screen.getByTestId('stars')).toHaveTextContent('3');
  });
  it('shows a useful notice when progress cannot be saved',()=>{
    vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new DOMException('Quota exceeded','QuotaExceededError');});
    render(<Index />);
    expect(screen.getByRole('alert')).toHaveTextContent('학습 기록을 저장하지 못했어요');
    fireEvent.click(screen.getByText('start'));
    fireEvent.click(screen.getByText('perform mission'));
    expect(screen.getByTestId('stars')).toHaveTextContent('3');
  });
});
