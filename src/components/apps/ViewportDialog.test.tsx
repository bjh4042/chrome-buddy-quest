import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import ViewportDialog, { getViewportBounds } from './ViewportDialog';

const originalVisualViewport=Object.getOwnPropertyDescriptor(window,'visualViewport');
class PracticeVisualViewport extends EventTarget {
  width=360; height=640; offsetLeft=0; offsetTop=0;
  resize(next:Partial<Pick<PracticeVisualViewport,'width'|'height'|'offsetLeft'|'offsetTop'>>){Object.assign(this,next);this.dispatchEvent(new Event('resize'));}
  scroll(next:Partial<Pick<PracticeVisualViewport,'offsetLeft'|'offsetTop'>>){Object.assign(this,next);this.dispatchEvent(new Event('scroll'));}
}
function useViewport(value:PracticeVisualViewport|undefined){Object.defineProperty(window,'visualViewport',{configurable:true,value});}
beforeEach(()=>{
  vi.useFakeTimers();useViewport(undefined);
  vi.stubGlobal('requestAnimationFrame',(callback:FrameRequestCallback)=>setTimeout(()=>callback(0),0));
  vi.stubGlobal('cancelAnimationFrame',(id:number)=>clearTimeout(id));
});
afterEach(()=>{
  cleanup();vi.useRealTimers();vi.restoreAllMocks();vi.unstubAllGlobals();
  if(originalVisualViewport)Object.defineProperty(window,'visualViewport',originalVisualViewport);else delete (window as unknown as {visualViewport?:unknown}).visualViewport;
});
const overlay=()=>document.querySelector<HTMLElement>('[data-viewport-dialog="true"]')!;

describe('viewport-owned dialogs',()=>{
  it('portals outside a clipped app and keeps footer actions outside the scrolling body',()=>{
    const close=vi.fn();const {container}=render(<div style={{height:100,overflow:'hidden',position:'relative'}}><ViewportDialog title="그림 넣기" onClose={close} footer={<button>삽입</button>}><label>사진 검색<input/></label>{Array.from({length:30},(_,i)=><p key={i}>사진 {i}</p>)}</ViewportDialog></div>);
    const dialog=screen.getByRole('dialog',{name:'그림 넣기'});
    expect(container).not.toContainElement(dialog);expect(overlay().parentElement).toBe(document.body);
    expect(dialog).toHaveAttribute('aria-modal','true');
    const body=dialog.querySelector('[data-dialog-body="true"]')!,footer=dialog.querySelector('[data-dialog-footer="true"]')!;
    expect(body.parentElement).toBe(dialog);expect(footer.parentElement).toBe(dialog);
    expect(body).not.toContainElement(screen.getByRole('button',{name:'삽입'}));
    expect(footer).toContainElement(screen.getByRole('button',{name:'삽입'}));
    expect(body.nextElementSibling).toBe(footer);
    fireEvent.click(screen.getByRole('button',{name:'대화상자 닫기'}));expect(close).toHaveBeenCalledTimes(1);
  });
  it.each([[1024,600],[800,600],[640,480],[360,640],[568,320],[320,360]])('uses the available %i × %i viewport without depending on app-window dimensions',(width,height)=>{
    vi.stubGlobal('innerWidth',width);vi.stubGlobal('innerHeight',height);
    expect(getViewportBounds()).toEqual({left:0,top:0,width,height});
    render(<ViewportDialog title="저장" onClose={()=>{}} footer={<button>저장</button>}><input aria-label="파일 이름"/></ViewportDialog>);
    expect(overlay().style.width).toBe(`${width}px`);expect(overlay().style.height).toBe(`${height}px`);
    expect(screen.getByRole('button',{name:'저장'}).closest('footer')).toBeInTheDocument();
  });
  it('follows keyboard-driven visualViewport size and offset changes and removes listeners on unmount',()=>{
    const viewport=new PracticeVisualViewport();useViewport(viewport);
    const add=vi.spyOn(viewport,'addEventListener'),remove=vi.spyOn(viewport,'removeEventListener');
    const {unmount}=render(<ViewportDialog title="파일 이름" onClose={()=>{}}><input/></ViewportDialog>);
    act(()=>viewport.resize({height:280,width:350,offsetTop:220,offsetLeft:5}));
    expect(overlay().style.height).toBe('280px');expect(overlay().style.width).toBe('350px');
    expect(overlay().style.top).toBe('220px');expect(overlay().style.left).toBe('5px');
    act(()=>viewport.scroll({offsetTop:260,offsetLeft:8}));
    expect(overlay().style.top).toBe('260px');expect(overlay().style.left).toBe('8px');
    const resizeListener=add.mock.calls.find(call=>call[0]==='resize')![1];
    const scrollListener=add.mock.calls.find(call=>call[0]==='scroll')![1];
    unmount();expect(remove).toHaveBeenCalledWith('resize',resizeListener);expect(remove).toHaveBeenCalledWith('scroll',scrollListener);
    act(()=>viewport.resize({height:640}));expect(document.querySelector('[data-viewport-dialog]')).not.toBeInTheDocument();
  });
  it('focuses the input, traps Tab in both directions, closes on Escape, and restores the trigger',()=>{
    const closed=vi.fn();function Harness(){const [open,setOpen]=useState(false);return <><button onClick={()=>setOpen(true)}>저장 창 열기</button>{open&&<ViewportDialog title="파일 저장" onClose={()=>{closed();setOpen(false);}} footer={<button>저장</button>}><input aria-label="이름"/></ViewportDialog>}</>;}
    render(<Harness/>);const trigger=screen.getByRole('button',{name:'저장 창 열기'});trigger.focus();fireEvent.click(trigger);
    act(()=>vi.runOnlyPendingTimers());expect(screen.getByRole('textbox',{name:'이름'})).toHaveFocus();
    const first=screen.getByRole('button',{name:'대화상자 닫기'}),last=screen.getByRole('button',{name:'저장'});
    last.focus();fireEvent.keyDown(document,{key:'Tab'});expect(first).toHaveFocus();
    fireEvent.keyDown(document,{key:'Tab',shiftKey:true});expect(last).toHaveFocus();
    fireEvent.keyDown(document,{key:'Escape'});expect(closed).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();expect(trigger).toHaveFocus();
    fireEvent.keyDown(document,{key:'Escape'});expect(closed).toHaveBeenCalledTimes(1);
  });
  it('closes only the top dialog and returns focus to its parent dialog',()=>{
    const parentClose=vi.fn(),childClose=vi.fn();
    function Nested(){const [child,setChild]=useState(false);return <ViewportDialog title="문서 저장" onClose={parentClose}><button onClick={()=>setChild(true)}>덮어쓰기 확인</button>{child&&<ViewportDialog title="덮어쓰기" onClose={()=>{childClose();setChild(false);}} footer={<button>확인</button>}>같은 이름이 있습니다.</ViewportDialog>}</ViewportDialog>;}
    render(<Nested/>);act(()=>vi.runOnlyPendingTimers());
    const trigger=screen.getByRole('button',{name:'덮어쓰기 확인'});trigger.focus();fireEvent.click(trigger);act(()=>vi.runOnlyPendingTimers());
    expect(screen.getAllByRole('dialog')).toHaveLength(2);fireEvent.keyDown(document,{key:'Escape'});
    expect(childClose).toHaveBeenCalledTimes(1);expect(parentClose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog',{name:'문서 저장'})).toBeInTheDocument();expect(trigger).toHaveFocus();
  });
});
