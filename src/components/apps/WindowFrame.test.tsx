import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import WindowFrame from './WindowFrame';

let dimensions={width:1000,height:700};
let resizeCallbacks:(()=>void)[]=[];
beforeEach(()=>{
  dimensions={width:1000,height:700};resizeCallbacks=[];
  vi.stubGlobal('ResizeObserver',class {constructor(callback:()=>void){resizeCallbacks.push(callback);}observe(){}disconnect(){}});
  vi.stubGlobal('PointerEvent',MouseEvent);
  vi.spyOn(HTMLElement.prototype,'clientWidth','get').mockImplementation(function(){return this.dataset.testid==='window-viewport'?dimensions.width:0;});
  vi.spyOn(HTMLElement.prototype,'clientHeight','get').mockImplementation(function(){return this.dataset.testid==='window-viewport'?dimensions.height:0;});
  HTMLElement.prototype.setPointerCapture=vi.fn();
});
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();});

const mount=(title='내 PC')=>render(<div data-testid="window-viewport"><WindowFrame title={title} icon={<span/>} onClose={()=>{}} onMinimize={()=>{}}>연습 내용</WindowFrame></div>);
const pointer=(element:Element,from:{clientX:number;clientY:number},to:{clientX:number;clientY:number})=>{
  fireEvent.pointerDown(element,from);fireEvent.pointerMove(window,to);fireEvent.pointerUp(window,to);
};

describe('window geometry and identity',()=>{
  it('keeps the title bar reachable when dragged and enforces resize bounds',()=>{
    mount();const frame=screen.getByRole('region',{name:'내 PC'});
    const title=screen.getByText('내 PC').parentElement!.parentElement!;
    pointer(title,{clientX:100,clientY:100},{clientX:5000,clientY:5000});
    expect(parseFloat(frame.style.left)).toBe(240);
    expect(parseFloat(frame.style.top)).toBe(664);
    pointer(title,{clientX:100,clientY:100},{clientX:-5000,clientY:-5000});
    expect(frame.style.left).toBe('0px');expect(frame.style.top).toBe('0px');
    const handle=screen.getByRole('separator',{name:'창 크기 조절'});
    pointer(handle,{clientX:100,clientY:100},{clientX:-5000,clientY:-5000});
    expect(frame.style.width).toBe('240px');expect(frame.style.height).toBe('160px');
    pointer(handle,{clientX:100,clientY:100},{clientX:5000,clientY:5000});
    expect(frame.style.width).toBe('1000px');expect(frame.style.height).toBe('700px');
  });
  it('preserves normal window dimensions through a hidden zero-size parent notification',()=>{
    mount();const frame=screen.getByRole('region',{name:'내 PC'});
    expect(frame.style.width).toBe('760px');expect(frame.style.height).toBe('520px');
    dimensions={width:0,height:0};act(()=>resizeCallbacks.forEach(fn=>fn()));
    expect(frame.style.width).toBe('760px');expect(frame.style.height).toBe('520px');
    dimensions={width:1000,height:700};act(()=>resizeCallbacks.forEach(fn=>fn()));
    expect(frame.style.width).toBe('760px');expect(frame.style.height).toBe('520px');
  });
  it('reports a Settings drag as settings rather than completing a File Explorer mission',()=>{
    const interacted=vi.fn();window.addEventListener('window-interacted',interacted);
    try{
      mount('설정');const title=screen.getByText('설정').parentElement!.parentElement!;
      pointer(title,{clientX:100,clientY:100},{clientX:150,clientY:150});
      expect(interacted).toHaveBeenCalledTimes(1);
      expect((interacted.mock.calls[0][0] as CustomEvent).detail).toEqual({kind:'move',app:'settings'});
    }finally{window.removeEventListener('window-interacted',interacted);}
  });
});
