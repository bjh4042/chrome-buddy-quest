import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import WinDesktop from './WinDesktop';
import { QuestEngineProvider, useQuestEngine } from '@/features/quests/useQuestEngine';
import type { QuestType } from '@/types/quest';
import { FILES_KEY } from '@/lib/browserPractice';

vi.mock('./apps/ExcelWindow',()=>({ExcelIcon:()=> <span/>,default:({onMinimize}:any)=>{
  const [text,setText]=useState('');return <section aria-label="엑셀 연습"><input aria-label="엑셀 연습 내용" value={text} onChange={e=>setText(e.target.value)}/><button onClick={onMinimize}>엑셀 최소화</button></section>;
}}));
vi.mock('./apps/HangulWindow',()=>({HangulIcon:()=> <span/>,default:()=> <section aria-label="한글 연습"/>}));
vi.mock('./apps/PowerPointWindow',()=>({PptIcon:()=> <span/>,default:()=> <section aria-label="PPT 연습"/>}));
vi.mock('./apps/EdgeWindow',()=>({EdgeIcon:()=> <span/>,default:()=> <section aria-label="Edge 연습"/>}));
vi.mock('./apps/MyPcWindow',()=>({default:()=> <section aria-label="파일 탐색 연습"/>}));
vi.mock('./apps/SettingsWindow',async importOriginal=>({...await importOriginal<typeof import('./apps/SettingsWindow')>(),default:()=>null}));
vi.mock('./FingerGuide',()=>({default:()=>null}));
vi.mock('./WrongClickHint',()=>({default:({visible,message}:any)=>visible?<div data-testid="wrong-hint">{message}</div>:null}));

function Harness({quest='open-excel',free=true,onComplete=()=>{}}:{quest?:QuestType;free?:boolean;onComplete?:()=>void}){
  const engine=useQuestEngine({currentQuest:quest,onComplete});
  return <QuestEngineProvider value={engine}><WinDesktop currentQuestType={quest} freePractice={free} onQuestComplete={onComplete} instruction="연습하세요"/></QuestEngineProvider>;
}
beforeEach(()=>{localStorage.clear();});
afterEach(()=>{cleanup();vi.useRealTimers();});

describe('desktop launching and taskbar flow',()=>{
  it('accepts starting Excel from the Windows Start menu as a real app-open action',()=>{
    const done=vi.fn();render(<Harness onComplete={done}/>);
    fireEvent.click(screen.getByRole('button',{name:'시작'}));
    fireEvent.click(screen.getAllByRole('button',{name:'Excel'}).find(element=>element.tagName==='BUTTON')!);
    expect(screen.getByRole('region',{name:'엑셀 연습'})).toBeVisible();
    expect(done).toHaveBeenCalledTimes(1);
  });
  it('requires two clicks on the same desktop icon rather than one click on each of two icons',()=>{
    render(<Harness quest="open-ppt"/>);
    fireEvent.click(screen.getByText('한글',{exact:true}));
    fireEvent.click(screen.getByText('Excel',{exact:true}));
    expect(screen.queryByRole('region',{name:'엑셀 연습'})).not.toBeInTheDocument();
    expect(screen.queryByRole('region',{name:'한글 연습'})).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Excel',{exact:true}));
    expect(screen.getByRole('region',{name:'엑셀 연습'})).toBeVisible();
  });
  it('retains unsaved app content when minimized and restored from its taskbar button',()=>{
    render(<Harness quest="open-ppt"/>);
    fireEvent.click(screen.getByText('Excel',{exact:true}));fireEvent.click(screen.getByText('Excel',{exact:true}));
    const editor=screen.getByRole('textbox',{name:'엑셀 연습 내용'});
    fireEvent.change(editor,{target:{value:'저장 전에도 남아 있어야 하는 내용'}});
    fireEvent.click(screen.getByRole('button',{name:'엑셀 최소화'}));
    expect(editor).toBeInTheDocument();expect(editor).not.toBeVisible();
    fireEvent.click(screen.getAllByRole('button',{name:'Excel'}).find(element=>element.tagName==='BUTTON')!);
    expect(editor).toBeVisible();expect(editor).toHaveValue('저장 전에도 남아 있어야 하는 내용');
  });
  it('lets free-practice learners click empty desktop space without wrong-answer hints',()=>{
    const {container}=render(<Harness free={true}/>);
    const desktop=container.querySelector('.desktop-area')!;
    fireEvent.click(desktop);fireEvent.click(desktop);fireEvent.click(desktop);
    expect(screen.queryByTestId('wrong-hint')).not.toBeInTheDocument();
  });
  it('rejects the home password on a different network and completes only a real home-network connection',()=>{
    vi.useFakeTimers();const done=vi.fn();render(<Harness quest="wifi-connect" onComplete={done}/>);
    fireEvent.click(screen.getByRole('button',{name:'빠른 설정'}));
    fireEvent.click(screen.getByRole('button',{name:'Wi-Fi 연결 관리'}));
    fireEvent.click(screen.getByRole('button',{name:'학교 연습 Wi-Fi'}));
    fireEvent.change(screen.getByLabelText('네트워크 보안 키'),{target:{value:'12345678'}});
    fireEvent.click(screen.getByRole('button',{name:'연결'}));
    expect(screen.getByText('연결할 수 없습니다. 네트워크와 연습용 보안 키를 확인하세요.')).toBeInTheDocument();
    act(()=>vi.advanceTimersByTime(1500));expect(done).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button',{name:'취소'}));
    fireEvent.click(screen.getByRole('button',{name:'우리집 WiFi'}));
    fireEvent.change(screen.getByLabelText('네트워크 보안 키'),{target:{value:'12345678'}});
    fireEvent.click(screen.getByRole('button',{name:'연결'}));
    expect(screen.getByText('연결됨, 보안: 우리집 WiFi')).toBeInTheDocument();
    act(()=>vi.advanceTimersByTime(1300));expect(done).toHaveBeenCalledTimes(1);
  });
  it('restores the pre-mute volume and awards volume practice only at exactly 50',()=>{
    vi.useFakeTimers();const done=vi.fn();render(<Harness quest="volume-control" onComplete={done}/>);
    fireEvent.click(screen.getByRole('button',{name:'빠른 설정'}));
    const volume=screen.getByRole('slider',{name:'볼륨'}) as HTMLInputElement;
    fireEvent.change(volume,{target:{value:'49'}});
    act(()=>vi.advanceTimersByTime(1300));expect(done).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button',{name:'음소거'}));expect(volume.value).toBe('0');
    fireEvent.click(screen.getByRole('button',{name:'음소거 해제'}));expect(volume.value).toBe('49');
    act(()=>vi.advanceTimersByTime(1300));expect(done).not.toHaveBeenCalled();
    fireEvent.change(volume,{target:{value:'50'}});
    act(()=>vi.advanceTimersByTime(1300));expect(done).toHaveBeenCalledTimes(1);
  });
  it('opens File Explorer at the current folder of a persisted downloaded file',()=>{
    localStorage.setItem(FILES_KEY,JSON.stringify([{id:'download-real',name:'안전 안내.txt',parent:'documents',kind:'file',content:'안전 안내',modified:1,downloaded:true,sourceUrl:'https://school.example/'}]));
    render(<Harness quest="edge-download-reveal"/>);
    const edge=screen.getByRole('region',{name:'Edge 연습'});expect(edge).toBeVisible();
    act(()=>window.dispatchEvent(new CustomEvent('win-explorer-reveal',{detail:{fileId:'download-real'}})));
    expect(screen.getByRole('region',{name:'파일 탐색 연습'})).toBeVisible();expect(edge).not.toBeVisible();
    expect(localStorage.getItem('win-explorer-reveal-file')).toBe('download-real');
    expect(localStorage.getItem('win-explorer-open-folder')).toBe('documents');
  });
  it('keeps Edge active and gives feedback instead of revealing missing or deleted files',()=>{
    localStorage.setItem(FILES_KEY,JSON.stringify([{id:'download-deleted',name:'지운 안내.txt',parent:'downloads',kind:'file',modified:1,downloaded:true,deleted:true}]));
    render(<Harness quest="edge-download-reveal"/>);
    const edge=screen.getByRole('region',{name:'Edge 연습'});
    for(const fileId of ['missing-download','download-deleted']){
      act(()=>window.dispatchEvent(new CustomEvent('win-explorer-reveal',{detail:{fileId}})));
      expect(edge).toBeVisible();expect(screen.queryByRole('region',{name:'파일 탐색 연습'})).not.toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveTextContent('연습 파일을 찾을 수 없습니다');
      expect(localStorage.getItem('win-explorer-reveal-file')).toBe(null);
      expect(localStorage.getItem('win-explorer-open-folder')).toBe(null);
    }
  });
});
