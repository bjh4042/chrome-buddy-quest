export type PracticeLocation={kind:'home'|'search'|'site'|'blocked';url:string;host?:string;query?:string;reason?:string};
export function parsePracticeAddress(input:string):PracticeLocation{
 const text=input.trim();
 if(!text||text==='edge://newtab')return {kind:'home',url:'edge://newtab'};
 const looksUrl=/^[a-z][a-z\d+.-]*:/i.test(text)||(!/\s/.test(text)&&text.includes('.'));
 if(!looksUrl)return {kind:'search',url:'https://www.bing.com/search?q='+encodeURIComponent(text),host:'www.bing.com',query:text};
 try{
  const url=new URL(/^[a-z][a-z\d+.-]*:/i.test(text)?text:'https://'+text);
  if(!['https:','http:'].includes(url.protocol)||url.username||url.password) return {kind:'blocked',url:text,reason:'인터넷 주소는 https:// 또는 http://로 시작해야 하고 사용자 정보가 들어가면 안 됩니다.'};
  const host=url.hostname.toLowerCase().replace(/\.$/,'');
  if(url.protocol!=='https:')return {kind:'blocked',url:url.href,host,reason:'이 연습에서는 암호화된 HTTPS 주소를 사용합니다. 주소의 https://를 확인하세요.'};
  const allowed=['naver.com','bing.com','microsoft.com','school.example'];
  if(!allowed.some(domain=>host===domain||host.endsWith('.'+domain)))return {kind:'blocked',url:url.href,host,reason:'이 주소는 연습 사이트에 없습니다. 비슷한 철자나 주소 끝에 붙은 다른 도메인을 확인하세요.'};
  if((host==='bing.com'||host.endsWith('.bing.com'))&&url.pathname==='/search')return {kind:'search',url:url.href,host,query:url.searchParams.get('q')||''};
  return {kind:'site',url:url.href,host};
 }catch{return {kind:'blocked',url:text,reason:'주소 형식을 확인하세요. 예: https://www.naver.com'};}
}
export const isNaverHost=(host?:string)=>!!host&&(host==='naver.com'||host.endsWith('.naver.com'));
export type PracticeFile={id:string;name:string;parent:string;kind:'folder'|'file';content?:string;modified:number;deleted?:boolean;originalParent?:string;downloaded?:boolean;sourceUrl?:string};
export const FILES_KEY='win-expedition-files-v1';
export const defaultFiles:PracticeFile[]=[
 {id:'documents',name:'문서',parent:'root',kind:'folder',modified:0},{id:'downloads',name:'다운로드',parent:'root',kind:'folder',modified:0},{id:'pictures',name:'사진',parent:'root',kind:'folder',modified:0},{id:'desktop',name:'바탕 화면',parent:'root',kind:'folder',modified:0},{id:'music',name:'음악',parent:'root',kind:'folder',modified:0},{id:'videos',name:'동영상',parent:'root',kind:'folder',modified:0},
 {id:'guide',name:'파일 정리 안내.txt',parent:'documents',kind:'file',content:'1. 문서에 나의 자료 폴더를 만듭니다.\n2. 파일 이름을 알아보기 쉽게 바꿉니다.\n3. 복사와 잘라내기의 차이를 연습합니다.\n4. 삭제한 파일을 휴지통에서 복원합니다.',modified:0},
 ...Array.from({length:12},(_,i)=>({id:'sample-'+i,name:`${String(i+1).padStart(2,'0')}_탐험 기록.txt`,parent:'documents',kind:'file' as const,content:`탐험 ${i+1}일째 기록\n오늘 배운 윈도우 기능을 적어 보세요.`,modified:0})),
 {id:'readme',name:'다운로드 안내.txt',parent:'downloads',kind:'file',content:'Edge 연습 사이트에서 다운로드한 파일은 이 폴더에도 나타납니다. 실제 브라우저가 저장한 파일과 앱 안 연습 파일은 별도입니다.',modified:0}
];
export function loadPracticeFiles():PracticeFile[]{try{const v=JSON.parse(localStorage.getItem(FILES_KEY)||'null');if(Array.isArray(v)){const ids=new Set<string>();const roots=defaultFiles.filter(f=>f.parent==='root');roots.forEach(f=>ids.add(f.id));const clean:PracticeFile[]=[];for(const f of v.slice(0,2000)){if(!f||typeof f.id!=='string'||!f.id||ids.has(f.id)||typeof f.name!=='string'||typeof f.parent!=='string'||!['folder','file'].includes(f.kind))continue;ids.add(f.id);clean.push({id:f.id,name:f.name,parent:f.parent,kind:f.kind,content:typeof f.content==='string'?f.content:'',modified:typeof f.modified==='number'&&Number.isFinite(f.modified)?f.modified:0,deleted:f.deleted===true,originalParent:typeof f.originalParent==='string'?f.originalParent:undefined,downloaded:f.downloaded===true,sourceUrl:typeof f.sourceUrl==='string'&&f.sourceUrl.startsWith('https://')&&parsePracticeAddress(f.sourceUrl).kind==='site'?parsePracticeAddress(f.sourceUrl).url:undefined});}return [...roots.map(f=>({...f})),...clean];}}catch{}return defaultFiles.map(f=>({...f}));}
export function validFileName(name:string){return !!name.trim()&&!/[<>:"/\\|?*\u0000-\u001f]/.test(name)&&!/[. ]$/.test(name)&&! /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\.|$)/i.test(name)&&name.length<=100;}
export function downloadPracticeFile(name:string,content:string,options:{folderId?:string;sourceUrl?:string}={}){
 const all=loadPracticeFiles();const folderId=options.folderId||'downloads';
 if(!validFileName(name))throw new Error('올바른 파일 이름을 입력하세요.');
 if(!all.some(f=>f.id===folderId&&f.kind==='folder'&&!f.deleted))throw new Error('저장할 폴더를 찾을 수 없습니다.');
 const source=options.sourceUrl?parsePracticeAddress(options.sourceUrl):undefined;
 if(source&&source.kind!=='site')throw new Error('안전한 연습 사이트에서만 자료를 다운로드할 수 있습니다.');
 let storedName=name,number=1;const dot=name.lastIndexOf('.');const base=dot>0?name.slice(0,dot):name,ext=dot>0?name.slice(dot):'';
 while(all.some(f=>!f.deleted&&f.parent===folderId&&f.name.toLocaleLowerCase()===storedName.toLocaleLowerCase()))storedName=base+' ('+(number++)+')'+ext;
 const item:PracticeFile={id:'download-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),name:storedName,parent:folderId,kind:'file',content,modified:Date.now(),downloaded:true,sourceUrl:source?.url};
 const blob=new Blob([content],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);
 try{localStorage.setItem(FILES_KEY,JSON.stringify([...all,item]));}catch{URL.revokeObjectURL(url);throw new Error('저장 공간이 부족하거나 저장이 차단되었습니다. 다운로드를 완료하지 못했습니다.');}
 const link=document.createElement('a');link.href=url;link.download=storedName;
 try{link.click();}catch{try{localStorage.setItem(FILES_KEY,JSON.stringify(all));}catch{}URL.revokeObjectURL(url);throw new Error('브라우저가 파일 내보내기를 허용하지 않았습니다. 다시 시도하세요.');}
 setTimeout(()=>URL.revokeObjectURL(url),5000);
 window.dispatchEvent(new CustomEvent('win-explorer-download',{detail:item}));
 window.dispatchEvent(new CustomEvent('win-files-changed',{detail:{files:[...all,item],source:'edge'}}));
 return item;
}
