import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import './ViewportDialog.css';

export type ViewportBounds={left:number;top:number;width:number;height:number};
export function getViewportBounds():ViewportBounds {
  const v=window.visualViewport;
  return {left:v?.offsetLeft||0,top:v?.offsetTop||0,width:Math.max(1,v?.width||window.innerWidth),height:Math.max(1,v?.height||window.innerHeight)};
}
const dialogStack:symbol[]=[];
const focusable='button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])';
interface ViewportDialogProps {
  title:string;ariaLabel?:string;onClose:()=>void;children:ReactNode;footer?:ReactNode;className?:string;bodyClassName?:string;style?:CSSProperties;
}
/** The viewport, rather than the app window, owns popup size. Only the middle scrolls. */
export default function ViewportDialog({title,ariaLabel,onClose,children,footer,className='',bodyClassName='',style}:ViewportDialogProps) {
  const previousFocus=useRef(document.activeElement as HTMLElement|null);
  const titleId=useId();const panel=useRef<HTMLElement>(null);const token=useRef(Symbol('dialog'));const close=useRef(onClose);close.current=onClose;
  const [bounds,setBounds]=useState(getViewportBounds);
  useLayoutEffect(()=>{const update=()=>setBounds(getViewportBounds());const v=window.visualViewport;update();window.addEventListener('resize',update);v?.addEventListener('resize',update);v?.addEventListener('scroll',update);return()=>{window.removeEventListener('resize',update);v?.removeEventListener('resize',update);v?.removeEventListener('scroll',update);};},[]);
  useEffect(()=>{
    const previous=previousFocus.current;const id=token.current;dialogStack.push(id);
    const nodes=()=>Array.from(panel.current?.querySelectorAll<HTMLElement>(focusable)||[]).filter(el=>!el.hidden&&!el.closest('[hidden],[aria-hidden="true"]')&&getComputedStyle(el).display!=='none'&&getComputedStyle(el).visibility!=='hidden');
    const raf=requestAnimationFrame(()=>{if(!panel.current?.contains(document.activeElement)){const initial=panel.current?.querySelector<HTMLElement>('[autofocus]')||panel.current?.querySelector<HTMLElement>('input:not([type="hidden"]),textarea,select');(initial||nodes()[0]||panel.current)?.focus({preventScroll:true});}});
    const key=(event:KeyboardEvent)=>{
      if(dialogStack[dialogStack.length-1]!==id)return;
      if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();close.current();return;}
      if(event.key!=='Tab')return;
      const items=nodes(),first=items[0],last=items[items.length-1];if(!first){event.preventDefault();panel.current?.focus();return;}
      if(event.shiftKey&&(document.activeElement===first||!panel.current?.contains(document.activeElement))){event.preventDefault();last?.focus();}
      else if(!event.shiftKey&&(document.activeElement===last||!panel.current?.contains(document.activeElement))){event.preventDefault();first.focus();}
    };
    document.addEventListener('keydown',key,true);
    return()=>{cancelAnimationFrame(raf);document.removeEventListener('keydown',key,true);const index=dialogStack.indexOf(id);if(index>=0)dialogStack.splice(index,1);if(previous?.isConnected)previous.focus({preventScroll:true});};
  },[]);
  return createPortal(<div className="viewport-dialog-overlay" data-viewport-dialog="true" style={{left:bounds.left,top:bounds.top,width:bounds.width,height:bounds.height}} onClick={e=>e.stopPropagation()} onPointerDown={e=>e.stopPropagation()} onTouchStart={e=>e.stopPropagation()} onContextMenu={e=>e.stopPropagation()} onKeyDown={e=>e.stopPropagation()}>
    <section ref={panel} role="dialog" aria-modal="true" aria-label={ariaLabel} aria-labelledby={ariaLabel?undefined:titleId} tabIndex={-1} className={`viewport-dialog-panel ${className}`} style={style}>
      <header className="viewport-dialog-header"><h2 id={titleId}>{title}</h2><button type="button" aria-label="대화상자 닫기" title="닫기" onClick={onClose}><X size={16}/></button></header>
      <div className={`viewport-dialog-body ${bodyClassName}`} data-dialog-body="true">{children}</div>
      {footer&&<footer className="viewport-dialog-footer" data-dialog-footer="true">{footer}</footer>}
    </section>
  </div>,document.body);
}
