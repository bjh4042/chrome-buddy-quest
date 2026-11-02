import {describe,it,expect} from 'vitest';
import {baseStyle,createSlide,formatRange,replaceText,parsePresentation,slideChecklist} from './pptModel';
describe('presentation editing',()=>{
  it('formats only the selected text and preserves neighboring characters',()=>{const b=replaceText(createSlide().title,'나의 발표',baseStyle);const r=formatRange(b,3,5,{size:28,font:'바탕'});expect(r.styles.slice(0,3).every(s=>s.size===32)).toBe(true);expect(r.styles.slice(3).every(s=>s.size===28&&s.font==='바탕')).toBe(true);});
  it('retains style when text is inserted/deleted in the middle',()=>{const b=formatRange(replaceText(createSlide().title,'ABC',baseStyle),1,2,{bold:true});const r=replaceText(b,'AXBC',baseStyle);expect(r.styles[2].bold).toBe(true);expect(replaceText(r,'ABC',baseStyle).styles[1].bold).toBe(true);});
  it('rejects invalid imports and normalizes untrusted text fields',()=>{expect(()=>parsePresentation('{"version":1,"slides":[]}')).toThrow();const s=createSlide();s.title=replaceText(s.title,'<script>alert(1)</script>',baseStyle);const p=parsePresentation(JSON.stringify({version:1,name:'safe',slides:[s]}));expect(p.slides[0].title.text).toContain('<script>');expect(p.slides[0].id).not.toBe(s.id);});
  it('requires real document state to satisfy the student checklist',()=>{const p={version:1 as const,name:'test',slides:[createSlide()]};expect(slideChecklist(p)).toEqual([false,false,false,false,false]);});
});
