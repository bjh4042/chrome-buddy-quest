import { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { Save, Table, Image as ImageIcon, Bold, Italic, Underline, Undo, Redo, AlignLeft, AlignCenter, AlignRight, FolderOpen, Copy, Scissors, FileText, Download, Smile, Search, X } from "lucide-react";
import WindowFrame from "./WindowFrame";
import ViewportDialog from "./ViewportDialog";
import TableDialog from "./TableDialog";
import ImagePickerDialog from "./ImagePickerDialog";
import type { QuestType } from "@/types/quest";
import { getFontStack } from "@/lib/fontStacks";
import { cleanHangulHTML, loadHangulDocument, type HangulDocument, emptyHangulDocument } from "@/lib/hangulDocument";
import { AppIcon } from "../icons/WindowsIcon";

interface HangulWindowProps {onClose:()=>void;onMinimize?:()=>void;currentQuestType:QuestType;onQuestComplete:()=>void;}
const HangulIcon = ({ className = "w-4 h-4" }: { className?: string }) => <AppIcon name="hangul" className={className} alt="한글" />;
const DRAFT_KEY="win-explorer-hangul-draft-v3", SAVES_KEY="win-explorer-hangul-files-v3";
const fontSizes=["8","9","10","11","12","14","16","18","20","24","28","36"];
const fonts=["함초롬바탕","맑은 고딕","바탕","돋움","굴림","궁서"];
type SavedFile={name:string;date:string;document:HangulDocument};
function readFiles():SavedFile[]{try{const data=JSON.parse(localStorage.getItem(SAVES_KEY)||"[]");return Array.isArray(data)?data.filter(f=>typeof f?.name==="string"&&loadHangulDocument(f.document)).slice(0,20):[];}catch{return [];}}
function readDraft(){try{return loadHangulDocument(JSON.parse(localStorage.getItem(DRAFT_KEY)||"null"))||emptyHangulDocument();}catch{return emptyHangulDocument();}}
function readDraftMeta(){try{const v=JSON.parse(localStorage.getItem(`${DRAFT_KEY}-meta`)||"null");return v&&typeof v.name==="string"&&typeof v.dirty==="boolean"?{name:v.name.slice(0,80),dirty:v.dirty}:null;}catch{return null;}}

const HangulWindow=({onClose,onMinimize,currentQuestType,onQuestComplete}:HangulWindowProps)=>{
  const [doc,setDoc]=useState<HangulDocument>(readDraft),docRef=useRef(doc);docRef.current=doc;
  const editor=useRef<HTMLDivElement>(null),paper=useRef<HTMLDivElement>(null),selection=useRef<Range|null>(null);
  const [selected,setSelected]=useState(false),[font,setFont]=useState("함초롬바탕"),[size,setSize]=useState("10");
  const [tab,setTab]=useState("편집"),[showTable,setShowTable]=useState(false),[showImage,setShowImage]=useState(false),[showEmoji,setShowEmoji]=useState(false);
  const [dialog,setDialog]=useState<"save"|"open"|null>(null),[name,setName]=useState("나의 초대장"),[files,setFiles]=useState<SavedFile[]>(readFiles);
  const [message,setMessage]=useState(""),[savedName,setSavedName]=useState(()=>readDraftMeta()?.name||"빈 문서 1"),[dirty,setDirty]=useState(()=>readDraftMeta()?.dirty??!!(doc.html||doc.image||doc.table)),[storageFailed,setStorageFailed]=useState(false);
  const [practice,setPractice]=useState(false),[selectedImage,setSelectedImage]=useState(false),[find,setFind]=useState("");
  const clipboard=useRef(""),undo=useRef<HangulDocument[]>([]),redo=useRef<HangulDocument[]>([]),[,bumpHistory]=useState(0),pendingShortcut=useRef(false);
  const drag=useRef<{mode:"move"|"resize";x:number;y:number;start:NonNullable<HangulDocument["image"]>}|null>(null);
  const [evidence,setEvidence]=useState({formatted:false,resized:false,saved:false});
  const complete=useCallback((type:QuestType)=>{if(currentQuestType===type)onQuestComplete();},[currentQuestType,onQuestComplete]);
  const update=useCallback((next:HangulDocument,record=true)=>{
    if(JSON.stringify(next)===JSON.stringify(docRef.current))return;
    if(record){undo.current=[...undo.current,structuredClone(docRef.current)].slice(-60);redo.current=[];bumpHistory(n=>n+1);}
    docRef.current=next;setDoc(next);setDirty(true);setEvidence(v=>({...v,saved:false}));
  },[]);
  useLayoutEffect(()=>{if(editor.current&&editor.current.innerHTML!==doc.html)editor.current.innerHTML=doc.html;},[doc.html]);
  useEffect(()=>{try{localStorage.setItem(DRAFT_KEY,JSON.stringify(doc));setStorageFailed(false);}catch{setStorageFailed(true);}},[doc]);
  useEffect(()=>{try{localStorage.setItem(`${DRAFT_KEY}-meta`,JSON.stringify({name:savedName,dirty}));}catch{setStorageFailed(true);}},[savedName,dirty]);
  useEffect(()=>{
    const fit=()=>{const image=docRef.current.image,p=paper.current;if(!image||!p||p.clientWidth<50)return;const w=Math.min(image.w,p.clientWidth),h=Math.min(image.h,p.clientHeight),x=Math.min(image.x,p.clientWidth-w),y=Math.min(image.y,p.clientHeight-h);if(x!==image.x||y!==image.y||w!==image.w||h!==image.h)update({...docRef.current,image:{...image,x,y,w,h}},false);};
    fit();const observer=typeof ResizeObserver!=="undefined"&&paper.current?new ResizeObserver(fit):null;if(observer&&paper.current)observer.observe(paper.current);return()=>observer?.disconnect();
  },[doc.orientation,doc.zoom,update]);
  useEffect(()=>{if(["hangul-font-size","hangul-font-family","shortcut-copy"].includes(currentQuestType)&&!editor.current?.textContent?.trim())update({...docRef.current,html:"안녕하세요"});},[currentQuestType,update]);
  const capture=useCallback(()=>{
    const sel=window.getSelection();if(!sel||sel.rangeCount===0)return;
    const r=sel.getRangeAt(0);if(!editor.current?.contains(r.commonAncestorContainer))return;
    selection.current=r.cloneRange();setSelected(!r.collapsed&&!!r.toString().trim());
  },[]);
  useEffect(()=>{document.addEventListener("selectionchange",capture);return()=>document.removeEventListener("selectionchange",capture);},[capture]);
  const restore=()=>{const r=selection.current;if(!r||!editor.current?.contains(r.commonAncestorContainer))return null;editor.current.focus();const sel=window.getSelection();sel?.removeAllRanges();sel?.addRange(r);return r;};
  const sync=()=>{if(editor.current)update({...docRef.current,html:cleanHangulHTML(editor.current.innerHTML)});};
  const format=(property:string,value:string)=>{
    const r=restore();if(!r||r.collapsed||!r.toString().trim()){setMessage("먼저 바꿀 글자를 드래그해 블록으로 지정하세요.");return;}
    const selectedNodes:Text[]=[];const walker=document.createTreeWalker(editor.current!,NodeFilter.SHOW_TEXT);let node:Node|null;
    while((node=walker.nextNode())){if(node.textContent&&r.intersectsNode(node))selectedNodes.push(node as Text);}
    const probe=document.createElement("span");probe.style.setProperty(property,value);
    const normalized=probe.style.getPropertyValue(property);
    if(selectedNodes.length&&selectedNodes.every(n=>{let p=n.parentElement;while(p&&p!==editor.current){if(p.style.getPropertyValue(property))return p.style.getPropertyValue(property)===normalized;p=p.parentElement;}return false;})){setMessage("선택한 글자에 이미 같은 글자 모양이 적용되어 있습니다.");return;}
    const span=document.createElement("span");span.style.setProperty(property,value);span.appendChild(r.extractContents());r.insertNode(span);
    r.selectNodeContents(span);selection.current=r.cloneRange();window.getSelection()?.removeAllRanges();window.getSelection()?.addRange(r);sync();setSelected(true);setEvidence(v=>({...v,formatted:true}));
    if(property==="font-size"&&value==="20pt")complete("hangul-font-size");if(property==="font-family"&&value===getFontStack("돋움"))complete("hangul-font-family");
    setMessage("선택한 글자의 모양을 바꿨습니다.");
  };
  const align=(value:"left"|"center"|"right")=>{const r=restore();if(!r){editor.current?.focus();return;}document.execCommand(value==="center"?"justifyCenter":value==="right"?"justifyRight":"justifyLeft");sync();capture();};
  const toggleMark=(command:"bold"|"italic"|"underline")=>{const r=restore();if(!r||r.collapsed||!r.toString().trim()){setMessage("먼저 바꿀 글자를 드래그해 블록으로 지정하세요.");return;}if(typeof document.execCommand==="function"){document.execCommand(command);sync();capture();setEvidence(v=>({...v,formatted:true}));}else{format(command==="bold"?"font-weight":command==="italic"?"font-style":"text-decoration",command==="bold"?"bold":command==="italic"?"italic":"underline");}};
  const history=(direction:"undo"|"redo")=>{const source=direction==="undo"?undo:redo,target=direction==="undo"?redo:undo;const previous=source.current.pop();if(!previous)return;target.current.push(structuredClone(docRef.current));update(previous,false);selection.current=null;setSelected(false);bumpHistory(n=>n+1);};
  const copyText=(cut=false,shortcut=false)=>{
    const r=restore();if(!r||r.collapsed||!r.toString().trim()){setMessage("복사할 글자를 먼저 선택하세요.");return;}
    clipboard.current=r.toString();try{sessionStorage.setItem("win-explorer-hangul-clipboard",clipboard.current);}catch{/* memory clipboard remains */}
    if(cut){r.deleteContents();sync();capture();}setMessage(cut?"선택한 글자를 잘라냈습니다.":"선택한 글자를 복사했습니다.");if(shortcut)complete("shortcut-copy");
  };
  const insertText=(text:string)=>{
    if(!editor.current)return;let r=restore();if(!r){r=document.createRange();r.selectNodeContents(editor.current);r.collapse(false);}
    r.deleteContents();const node=document.createTextNode(text);r.insertNode(node);r.setStartAfter(node);r.collapse(true);selection.current=r.cloneRange();window.getSelection()?.removeAllRanges();window.getSelection()?.addRange(r);sync();capture();
  };
  const pasteText=(shortcut=false)=>{
    let value=clipboard.current;try{value=value||sessionStorage.getItem("win-explorer-hangul-clipboard")||"";}catch{/* memory only */}
    if(!value){setMessage("먼저 이 문서에서 글자를 복사하세요. 외부 글자는 문서에서 직접 붙여넣을 수도 있습니다.");return;}
    insertText(value);setMessage("복사한 글자를 붙였습니다.");if(shortcut)complete("shortcut-paste");
  };
  const saveNamed=(fileName:string,shortcut=false)=>{
    const n=fileName.trim().replace(/[\\/:*?"<>|]/g,"_").slice(0,80);if(!n){setMessage("파일 이름을 입력하세요.");return;}
    const next=[{name:n,date:new Date().toLocaleString("ko-KR"),document:structuredClone(docRef.current)},...readFiles().filter(f=>f.name!==n)].slice(0,20);
    try{localStorage.setItem(SAVES_KEY,JSON.stringify(next));setFiles(next);setSavedName(n);setDirty(false);setDialog(null);setEvidence(v=>({...v,saved:true}));setMessage(`${n} 문서를 저장했습니다.`);complete("hangul-save");if(shortcut||pendingShortcut.current)complete("shortcut-save");pendingShortcut.current=false;}catch{setMessage("저장 공간이 부족하거나 저장이 차단되었습니다. 내려받기로 문서를 보관하세요.");}
  };
  const save=(shortcut=false)=>{if(!editor.current?.textContent?.trim()&&!doc.image&&!doc.table){setMessage("내용을 입력한 뒤 저장하세요.");return;}if(shortcut&&savedName!=="빈 문서 1"){saveNamed(savedName,true);return;}setDialog("save");pendingShortcut.current=shortcut;};
  const loadFile=(file:SavedFile)=>{const next=loadHangulDocument(file.document);if(!next){setMessage("이 문서는 열 수 없습니다.");return;}update(next);setSavedName(file.name);setName(file.name);setDirty(false);setDialog(null);selection.current=null;setEvidence({formatted:false,resized:false,saved:true});setMessage(`${file.name} 문서를 불러왔습니다.`);complete("hangul-open-file");};
  const download=()=>{const blob=new Blob([JSON.stringify({format:"windows-expedition-hangul",version:1,name:savedName,document:doc},null,2)],{type:"application/json"});const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=`${(savedName==="빈 문서 1"?name:savedName).replace(/[\\/:*?"<>|]/g,"_")}.hangul-practice.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setMessage("실습 문서(JSON)를 내려받았습니다. 실제 HWP 파일 형식은 아닙니다.");};
  const importFile=async(file?:File)=>{if(!file)return;if(file.size>2_000_000){setMessage("2MB 이하의 실습 문서만 열 수 있습니다.");return;}try{const data=JSON.parse(await file.text()),parsed=loadHangulDocument(data.document);if(data.format!=="windows-expedition-hangul"||!parsed)throw new Error();loadFile({name:typeof data.name==="string"?data.name:"불러온 문서",date:"",document:parsed});}catch{setMessage("이 앱에서 내려받은 .hangul-practice.json 문서를 선택하세요.");}};
  const keyDown=(e:React.KeyboardEvent)=>{
    if(!(e.ctrlKey||e.metaKey))return;const k=e.key.toLowerCase();
    if(k==="s"){e.preventDefault();save(true);}else if(k==="z"){e.preventDefault();history(e.shiftKey?"redo":"undo");}else if(k==="y"){e.preventDefault();history("redo");}
    else if(k==="c"&&editor.current?.contains(document.activeElement)){e.preventDefault();capture();copyText(false,true);}else if(k==="x"&&editor.current?.contains(document.activeElement)){e.preventDefault();capture();copyText(true);}
    else if(k==="v"&&editor.current?.contains(document.activeElement)&&clipboard.current){e.preventDefault();pasteText(true);}else if(k==="b"){e.preventDefault();toggleMark("bold");}else if(k==="i"){e.preventDefault();toggleMark("italic");}else if(k==="u"){e.preventDefault();toggleMark("underline");}else if(k==="."){e.preventDefault();capture();setShowEmoji(true);}
  };
  const imageStart=(e:React.PointerEvent,mode:"move"|"resize")=>{if(!doc.image)return;e.preventDefault();e.stopPropagation();setSelectedImage(true);e.currentTarget.setPointerCapture(e.pointerId);drag.current={mode,x:e.clientX,y:e.clientY,start:{...doc.image}};undo.current=[...undo.current,structuredClone(docRef.current)].slice(-60);redo.current=[];bumpHistory(n=>n+1);};
  const imageMove=(e:React.PointerEvent)=>{const d=drag.current;if(!d||!paper.current||!docRef.current.image)return;const bounds=paper.current.getBoundingClientRect(),scale=doc.zoom/100,dx=(e.clientX-d.x)/scale,dy=(e.clientY-d.y)/scale,image={...d.start};if(d.mode==="move"){image.x=Math.max(0,Math.min(bounds.width/scale-image.w,d.start.x+dx));image.y=Math.max(0,Math.min(bounds.height/scale-image.h,d.start.y+dy));}else{image.w=Math.max(50,Math.min(bounds.width/scale-image.x,d.start.w+dx));image.h=Math.max(30,Math.min(bounds.height/scale-image.y,d.start.h+dy));if(Math.abs(image.w-d.start.w)>20||Math.abs(image.h-d.start.h)>20){setEvidence(v=>({...v,resized:true}));complete("hangul-image-resize");}}update({...docRef.current,image},false);};
  const setTableCell=(r:number,c:number,value:string)=>{const table=doc.table!.map(row=>[...row]);table[r][c]=value;update({...doc,table});};
  const text=(()=>{const e=document.createElement("div");e.innerHTML=doc.html;return e.textContent||"";})();
  const checks=[{done:/초대/.test(text),text:"제목에 ‘초대’를 넣어 초대장 쓰기"},{done:/일시|날짜/.test(text)&&/장소/.test(text),text:"날짜(일시)와 장소 안내하기"},{done:evidence.formatted,text:"글자를 선택하고 글자 모양 바꾸기"},{done:!!doc.table&&doc.table.some(row=>row.some(Boolean)),text:"표를 넣고 내용 입력하기"},{done:!!doc.image&&evidence.resized,text:"그림을 넣고 크기 조절하기"},{done:evidence.saved&&!dirty,text:"이름을 정해 완성 문서 저장하기"}];
  const button=(label:string,icon:React.ReactNode,action:()=>void,disabled=false)=><button key={label} type="button" title={label} aria-label={label} disabled={disabled} onMouseDown={e=>e.preventDefault()} onClick={action} className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-orange-100 disabled:opacity-35 disabled:cursor-not-allowed text-[11px] whitespace-nowrap">{icon}{label}</button>;
  const toolbar=<div className="bg-[#f7f7f7] text-gray-700" onKeyDown={keyDown}>
    <div className="flex gap-0.5 border-b border-gray-200 px-2 text-xs" role="tablist" aria-label="한글 메뉴">{["파일","편집","보기","입력","서식","쪽","도구"].map(t=><button key={t} role="tab" aria-selected={tab===t} onMouseDown={e=>e.preventDefault()} onClick={()=>setTab(t)} className={`px-3 py-2 ${tab===t?"bg-white border-b-2 border-orange-500 text-orange-700":"hover:bg-gray-200"}`}>{t}</button>)}</div>
    <div className="flex items-center flex-wrap gap-0.5 px-2 py-1 border-b border-gray-200 min-h-[46px]">
      {tab==="파일"?<>{button("저장",<Save size={15}/>,()=>save())}{button("불러오기",<FolderOpen size={15}/>,()=>{setFiles(readFiles());setDialog("open");})}{button("내려받기",<Download size={15}/>,download)}<span className="text-[10px] text-gray-500 ml-2">실습 문서는 이 브라우저에 저장됩니다.</span></>:
      tab==="입력"?<>{button("그림",<ImageIcon size={15}/>,()=>setShowImage(true))}{button("표",<Table size={15}/>,()=>setShowTable(true))}{button("이모지",<Smile size={15}/>,()=>{capture();setShowEmoji(true);})}</>:
      tab==="보기"?<><span className="text-xs mr-2">쪽 확대</span>{[75,100,125].map(n=><button key={n} onClick={()=>update({...doc,zoom:n})} className={`px-3 py-1 rounded text-xs ${doc.zoom===n?"bg-orange-100":"hover:bg-gray-200"}`}>{n}%</button>)}{button(practice?"실습 과제 닫기":"초대장 만들기 실습",<FileText size={15}/>,()=>setPractice(v=>!v))}</>:
      tab==="쪽"?<><span className="text-xs">편집 용지</span>{["portrait","landscape"].map(v=><button key={v} onClick={()=>update({...doc,orientation:v as "portrait"|"landscape"})} className={`px-3 py-1 text-xs rounded ${doc.orientation===v?"bg-orange-100":"hover:bg-gray-200"}`}>{v==="portrait"?"세로":"가로"}</button>)}<span className="text-[10px] text-gray-500">A4 비율의 실습 용지</span></>:
      tab==="도구"?<><label className="text-xs flex items-center gap-2"><Search size={14}/>찾을 내용<input aria-label="찾을 내용" value={find} onChange={e=>setFind(e.target.value)} className="w-32 px-2 py-1 border rounded"/></label><span className="text-xs ml-3">{find?`${text.split(find).length-1}개 찾음`:`공백 포함 ${text.length}글자`}</span>{button("초대장 실습",<FileText size={15}/>,()=>setPractice(v=>!v))}</>:
      <>{button("되돌리기",<Undo size={15}/>,()=>history("undo"),!undo.current.length)}{button("다시 실행",<Redo size={15}/>,()=>history("redo"),!redo.current.length)}{button("잘라내기",<Scissors size={15}/>,()=>copyText(true))}{button("복사",<Copy size={15}/>,()=>copyText())}{button("붙이기",<Copy size={15}/>,()=>pasteText())}{button("그림",<ImageIcon size={15}/>,()=>setShowImage(true))}{button("표",<Table size={15}/>,()=>setShowTable(true))}{button("저장",<Save size={15}/>,()=>save())}{button("불러오기",<FolderOpen size={15}/>,()=>{setFiles(readFiles());setDialog("open");})}</>}
    </div>
    <div className="flex items-center gap-1 px-2 py-1.5 flex-wrap bg-white border-b border-gray-200">
      <select aria-label="한글 글꼴" value={font} onMouseDown={capture} onChange={e=>{setFont(e.target.value);format("font-family",getFontStack(e.target.value));}} className="border rounded px-2 py-1 text-xs w-32">{fonts.map(f=><option key={f}>{f}</option>)}</select>
      <select aria-label="한글 글자 크기" value={size} onMouseDown={capture} onChange={e=>{setSize(e.target.value);format("font-size",`${e.target.value}pt`);}} className="border rounded px-1 py-1 text-xs w-16">{fontSizes.map(s=><option key={s}>{s}</option>)}</select><span className="text-[10px] mr-1">pt</span>
      {button("진하게",<Bold size={15}/>,()=>toggleMark("bold"))}{button("기울임",<Italic size={15}/>,()=>toggleMark("italic"))}{button("밑줄",<Underline size={15}/>,()=>toggleMark("underline"))}<span className="h-5 border-l mx-1"/>{button("왼쪽 정렬",<AlignLeft size={15}/>,()=>align("left"))}{button("가운데 정렬",<AlignCenter size={15}/>,()=>align("center"))}{button("오른쪽 정렬",<AlignRight size={15}/>,()=>align("right"))}<span className="text-[10px] ml-auto text-gray-500">{selected?"블록 지정됨":"글자 모양: 바꿀 글자를 먼저 선택"}</span>
    </div>
  </div>;
  return <WindowFrame title={`${savedName}${dirty?" *":""} - 한글 실습`} icon={<HangulIcon/>} onClose={onClose} onMinimize={onMinimize} toolbar={toolbar}>
    <div className="flex flex-col min-h-full bg-[#dedfe2] relative" onKeyDown={keyDown}>
      <div className="px-3 py-1 text-[10px] bg-orange-50 border-b text-orange-900">한글 사용 연습용 시뮬레이터 · 실제 HWP/HWPX 파일은 열거나 저장하지 않습니다. {storageFailed&&<strong role="alert">자동 저장이 차단되었습니다. 내려받기로 보관하세요.</strong>}</div>
      {message&&<div role="status" className="px-3 py-2 text-xs text-blue-800 bg-blue-50 flex justify-between items-center">{message}<button aria-label="알림 닫기" onClick={()=>setMessage("")}><X size={14}/></button></div>}
      {practice&&<aside aria-label="초대장 실습 과제" className="mx-3 mt-3 bg-white border border-orange-200 rounded p-3 text-xs"><div className="flex justify-between font-semibold mb-1"><span>우리 반 발표회 초대장 만들기</span><span>{checks.filter(c=>c.done).length}/{checks.length}</span></div><p className="text-gray-600 mb-2">제목, 일시, 장소, 준비물 표와 그림을 넣어 친구를 초대하세요. 실제 작성한 문서로 확인합니다.</p><div className="grid sm:grid-cols-2 gap-1">{checks.map(c=><div key={c.text} className={c.done?"text-green-700":"text-gray-600"}>{c.done?"✓":"○"} {c.text}</div>)}</div></aside>}
      <div className="flex-1 overflow-auto p-3 sm:p-6"><div className="h-5 max-w-2xl mx-auto bg-white border border-gray-300 flex text-[8px] text-gray-500 justify-around items-end mb-2" aria-hidden>{Array.from({length:16},(_,i)=><span key={i} className="border-l pl-1">{i}</span>)}</div>
        <div ref={paper} className="relative bg-white shadow-md border border-gray-300 mx-auto p-8 sm:p-12" style={{width:doc.orientation==="landscape"?"min(100%, 850px)":"min(100%, 670px)",minHeight:doc.orientation==="landscape"?510:740,zoom:doc.zoom/100}} onClick={()=>setSelectedImage(false)}>
          <div ref={editor} role="textbox" aria-label="한글 문서 본문" aria-multiline="true" contentEditable suppressContentEditableWarning spellCheck={false} className="min-h-[320px] outline-none whitespace-pre-wrap break-words" style={{fontFamily:getFontStack("함초롬바탕"),fontSize:"10pt",lineHeight:1.8}} onInput={()=>{sync();capture();if(editor.current?.textContent?.includes("안녕하세요"))complete("hangul-typing");}} onKeyUp={capture} onPointerUp={capture} onDrop={e=>e.preventDefault()} onPaste={e=>{e.preventDefault();const pasted=e.clipboardData.getData("text/plain");if(pasted){insertText(pasted);complete("shortcut-paste");}}} data-placeholder="여기에 글을 입력하세요…"/>
          {doc.table&&<table aria-label="삽입된 표" className="w-full border-collapse my-4 relative"><tbody>{doc.table.map((row,r)=><tr key={r}>{row.map((value,c)=><td key={c} className="border border-gray-600 p-1"><input aria-label={`표 ${r+1}행 ${c+1}열`} value={value} onChange={e=>setTableCell(r,c,e.target.value)} className="w-full min-w-0 outline-none bg-transparent text-xs p-1"/></td>)}</tr>)}</tbody></table>}
          {doc.image&&<div className={`absolute touch-none cursor-move ${selectedImage?"ring-2 ring-blue-600":""}`} style={{left:doc.image.x,top:doc.image.y,width:doc.image.w,height:doc.image.h}} onClick={e=>{e.stopPropagation();setSelectedImage(true);}} onPointerDown={e=>imageStart(e,"move")} onPointerMove={imageMove} onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}}><img src={doc.image.src} alt="문서에 삽입한 그림" draggable={false} className="w-full h-full object-contain pointer-events-none"/><button aria-label="그림 크기 조절" title="모서리를 드래그해 크기 조절" className="absolute -right-2 -bottom-2 w-5 h-5 border-2 border-blue-600 bg-white cursor-se-resize touch-none" onPointerDown={e=>imageStart(e,"resize")}/>{selectedImage&&<button aria-label="그림 삭제" className="absolute -top-6 right-0 bg-white border rounded p-1 text-xs" onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();update({...doc,image:null});}}>삭제</button>}</div>}
        </div>
      </div><div className="flex justify-between text-[10px] bg-[#f6f6f6] border-t px-3 py-1"><span>1/1쪽 · {text.length}글자 · {dirty?"수정됨":"저장됨"}</span><button onClick={()=>setPractice(v=>!v)} className="text-orange-700 underline">초대장 만들기 실습</button><span>{doc.zoom}%</span></div>
    </div>
    {showTable&&<TableDialog onInsert={(rows,cols)=>{update({...doc,table:Array.from({length:rows},()=>Array(cols).fill(""))});setShowTable(false);complete("hangul-table");}} onClose={()=>setShowTable(false)} isQuest={currentQuestType==="hangul-table"}/>}
    {showImage&&<ImagePickerDialog onSelect={src=>{update({...doc,image:{src,x:40,y:300,w:160,h:110}});setShowImage(false);setSelectedImage(true);complete("hangul-image");}} onClose={()=>setShowImage(false)} isQuest={currentQuestType==="hangul-image"}/>}
    {showEmoji&&<ViewportDialog title="이모지" ariaLabel="이모지 선택" onClose={()=>setShowEmoji(false)} style={{maxWidth:320}} footer={<button type="button" className="border rounded px-4 py-1.5 text-xs" onClick={()=>setShowEmoji(false)}>닫기</button>}>
      <div className="grid grid-cols-5 gap-1">{["😀","😂","😍","👍","🎉","🌟","🐱","🐶","🍎","🚀","⚽","🎵","🌸","❤️","🌈"].map(emoji=><button key={emoji} type="button" aria-label={emoji} className="text-2xl p-2 rounded hover:bg-blue-50 min-w-0" onClick={()=>{insertText(emoji);setShowEmoji(false);complete("shortcut-emoji");}}>{emoji}</button>)}</div>
      <p className="text-[11px] text-gray-500 mt-3">실제 Windows: Win + . · 이 앱에서는 Ctrl + . 로도 연습</p>
    </ViewportDialog>}
    {dialog&&<ViewportDialog title={dialog==="save"?"다른 이름으로 저장":"불러오기"} ariaLabel={dialog==="save"?"문서 저장":"문서 불러오기"} onClose={()=>{setDialog(null);pendingShortcut.current=false;}} style={{maxWidth:560}} footer={dialog==="save"?<>
      <button type="button" onClick={()=>{setDialog(null);pendingShortcut.current=false;}} className="border px-4 py-1.5 text-xs rounded">취소</button>
      <button type="submit" form="hangul-save-form" className="bg-blue-600 text-white px-4 py-1.5 text-xs rounded">저장</button>
    </>:<button type="button" onClick={()=>setDialog(null)} className="border px-4 py-1.5 text-xs rounded">닫기</button>}>
      <p className="text-[11px] text-gray-500 mb-3">이 앱의 실습 문서 보관함입니다. 브라우저 데이터를 지우면 사라집니다.</p>
      {dialog==="save"?<form id="hangul-save-form" onSubmit={e=>{e.preventDefault();saveNamed(name);}}>
        <label className="text-xs block mb-1" htmlFor="hangul-filename">파일 이름</label>
        <input id="hangul-filename" value={name} onChange={e=>setName(e.target.value)} maxLength={80} className="border rounded px-3 py-2 w-full min-w-0 text-sm"/>
        <p className="text-[11px] text-gray-500 mt-2">같은 이름이 있으면 덮어씁니다.</p>
        {(message.includes("저장 공간")||message==="파일 이름을 입력하세요.")&&<p role="alert" className="text-xs text-red-700 mt-3">{message}</p>}
      </form>:<>
        <div className="border rounded overflow-hidden">{files.length?files.map(f=><button key={f.name} type="button" className="flex flex-wrap justify-between items-start gap-x-3 gap-y-1 w-full min-w-0 text-left hover:bg-blue-50 px-3 py-3 border-b text-xs" onClick={()=>loadFile(f)}>
          <span className="flex min-w-0 flex-1 items-start gap-2"><FileText size={16} className="shrink-0"/><span className="min-w-0 break-all">{f.name}</span></span>
          <span className="text-[10px] text-gray-500 min-w-0 break-words">{f.date}</span>
        </button>):<p className="text-xs text-gray-500 p-4">저장한 문서가 없습니다. 먼저 내용을 쓰고 저장하세요.</p>}</div>
        <label className="block text-xs mt-4 border rounded p-2 cursor-pointer hover:bg-gray-50">내려받은 실습 문서 열기 (.json)<input type="file" accept=".json,application/json" className="block text-xs mt-2 w-full min-w-0" onChange={e=>importFile(e.target.files?.[0])}/></label>
        {(message.startsWith("2MB")||message.startsWith("이 앱에서 내려받은")||message==="이 문서는 열 수 없습니다.")&&<p role="alert" className="text-xs text-red-700 mt-3">{message}</p>}
      </>}
    </ViewportDialog>}
  </WindowFrame>;
};
export {HangulIcon};
export default HangulWindow;
