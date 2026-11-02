export type TextStyle = {font:string; size:number; bold:boolean; italic:boolean; underline:boolean; color:string};
export type RichText = {text:string; styles:TextStyle[]; align:'left'|'center'|'right'};
export type Slide = {id:string; title:RichText; subtitle:RichText; notes:string; background:string; accent:string; layout:'title'|'content'|'blank'; image:string|null; imageBox:{x:number;y:number;w:number;h:number}};
export type Presentation = {version:1; name:string; slides:Slide[]};
export const baseStyle:TextStyle={font:'맑은 고딕',size:32,bold:false,italic:false,underline:false,color:'#20242b'};
export const textBox=(size:number,bold=false):RichText=>({text:'',styles:[],align:'center'});
export const createSlide=():Slide=>({id:globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random()}`,title:textBox(32,true),subtitle:textBox(18),notes:'',background:'#ffffff',accent:'#c43e1c',layout:'title',image:null,imageBox:{x:66,y:56,w:25,h:33}});
export function styleAt(block:RichText,index:number,defaultSize=32):TextStyle{return block.styles[Math.max(0,Math.min(block.styles.length-1,index))]||{...baseStyle,size:defaultSize,bold:defaultSize===32};}
export function replaceText(block:RichText,newText:string,style:TextStyle):RichText {
  const value=newText.slice(0,1600);let start=0;while(start<block.text.length&&start<value.length&&block.text[start]===value[start])start++;
  let oldEnd=block.text.length,newEnd=value.length;while(oldEnd>start&&newEnd>start&&block.text[oldEnd-1]===value[newEnd-1]){oldEnd--;newEnd--;}
  return {...block,text:value,styles:[...block.styles.slice(0,start),...Array.from({length:newEnd-start},()=>({...style})),...block.styles.slice(oldEnd)]};
}
export function formatRange(block:RichText,start:number,end:number,patch:Partial<TextStyle>,defaultSize=32):RichText {
  const from=Math.max(0,Math.min(start,end)),to=Math.min(block.text.length,Math.max(start,end));
  return {...block,styles:Array.from({length:block.text.length},(_,i)=>({...styleAt(block,i,defaultSize),...(i>=from&&i<to?patch:{})}))};
}
export function slideChecklist(p:Presentation){return [p.slides.length>=3,p.slides.every(s=>s.title.text.trim().length>0),p.slides.some(s=>s.image!==null),p.slides.some(s=>s.background!=='#ffffff'),p.slides.some(s=>s.notes.trim().length>0)];}
export function parsePresentation(raw:string):Presentation {
  const p=JSON.parse(raw);if(p?.version!==1||!Array.isArray(p.slides)||p.slides.length<1||p.slides.length>30)throw new Error('탐험대 발표 파일 형식이 아닙니다.');
  const normalize=(b:unknown,size:number):RichText=>{const v=b as RichText;if(!v||typeof v.text!=='string'||v.text.length>1600)throw new Error('텍스트 형식이 올바르지 않습니다.');return {text:v.text,align:['left','center','right'].includes(v.align)?v.align:'center',styles:Array.from({length:v.text.length},(_,i)=>{const s=v.styles?.[i];return {font:['맑은 고딕','바탕','돋움','굴림','궁서','나눔고딕'].includes(s?.font)?s.font:'맑은 고딕',size:Number.isFinite(s?.size)?Math.min(72,Math.max(10,s.size)):size,bold:!!s?.bold,italic:!!s?.italic,underline:!!s?.underline,color:/^#[0-9a-f]{6}$/i.test(s?.color)?s.color:'#20242b'};})};};
  const slides=p.slides.map((v:Slide)=>{const d=createSlide();if(!v||typeof v!=='object')throw new Error('슬라이드 형식이 올바르지 않습니다.');const x=Math.min(90,Math.max(0,Number(v.imageBox?.x)||0)),y=Math.min(90,Math.max(0,Number(v.imageBox?.y)||0));return {...d,title:normalize(v.title,32),subtitle:normalize(v.subtitle,18),notes:typeof v.notes==='string'?v.notes.slice(0,3000):'',background:/^#[0-9a-f]{6}$/i.test(v.background)?v.background:'#ffffff',accent:/^#[0-9a-f]{6}$/i.test(v.accent)?v.accent:'#c43e1c',layout:['title','content','blank'].includes(v.layout)?v.layout:'title',image:typeof v.image==='string'&&/^data:image\/(png|jpeg|webp|gif|svg\+xml)[;,]/.test(v.image)&&v.image.length<2500000?v.image:null,imageBox:{x,y,w:Math.min(100-x,Math.max(10,Number(v.imageBox?.w)||25)),h:Math.min(100-y,Math.max(10,Number(v.imageBox?.h)||33))}};});
  return {version:1,name:typeof p.name==='string'?p.name.slice(0,80):'나의 발표',slides};
}
