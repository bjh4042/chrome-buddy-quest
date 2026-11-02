import {loadPracticeFiles,parsePracticeAddress,type PracticeFile} from './browserPractice';

export const EDGE_STORAGE_KEY='win-expedition-edge-v1';
export type Favorite={id:string;url:string;name:string;folder:string;addedAt:number;openedAt?:number};
export type DownloadRecord={fileId:string;name:string;folderId:string;originalFolderId:string;sourceUrl:string;createdAt:number;revealedAt?:number};
export type EdgeSettings={downloadFolderId:string;askWhereEachTime:boolean};
export type EdgeData={version:2;favorites:Favorite[];downloads:Record<string,DownloadRecord>;settings:EdgeSettings};
export const FAVORITE_FOLDERS=['즐겨찾기 모음','기타 즐겨찾기'];
export const defaultEdgeData:EdgeData={version:2,favorites:[],downloads:{},settings:{downloadFolderId:'downloads',askWhereEachTime:false}};
export function trustedSite(url:unknown):url is string{return typeof url==='string'&&url.startsWith('https://')&&parsePracticeAddress(url).kind==='site';}
export function fileFolderPath(files:PracticeFile[],id:string){
 const parts:string[]=[];const seen=new Set<string>();let current=id;
 while(current!=='root'){if(seen.has(current))return '위치를 확인할 수 없음';seen.add(current);const f=files.find(x=>x.id===current&&!x.deleted&&x.kind==='folder');if(!f)return '폴더를 찾을 수 없음';parts.unshift(f.name);current=f.parent;}
 return ['내 PC',...parts].join(' / ');
}
export function validFolder(files:PracticeFile[],id:string){return files.some(f=>f.id===id&&f.kind==='folder'&&!f.deleted)&&!['폴더를 찾을 수 없음','위치를 확인할 수 없음'].includes(fileFolderPath(files,id));}
export function synchronizeDownloads(records:Record<string,DownloadRecord>,files:PracticeFile[]){
 const next={...records};
 for(const file of files){if(file.kind!=='file'||!file.downloaded||!trustedSite(file.sourceUrl))continue;const old=next[file.id];next[file.id]={fileId:file.id,name:file.name,folderId:file.parent,originalFolderId:old?.originalFolderId||file.parent,sourceUrl:file.sourceUrl,createdAt:old?.createdAt||file.modified,...(old?.revealedAt?{revealedAt:old.revealedAt}:{})};}
 return next;
}
export function loadEdgeData(files=loadPracticeFiles()):EdgeData{
 let raw:unknown;try{raw=JSON.parse(localStorage.getItem(EDGE_STORAGE_KEY)||'null');}catch{raw=null;}
 const data:EdgeData={...defaultEdgeData,settings:{...defaultEdgeData.settings},favorites:[],downloads:{}};
 if(Array.isArray(raw)){data.favorites=raw.filter(trustedSite).slice(0,80).map((url,i)=>({id:'legacy-'+i,url,name:parsePracticeAddress(url).host||url,folder:FAVORITE_FOLDERS[0],addedAt:0}));}
 else if(raw&&typeof raw==='object'){
  const value=raw as Partial<EdgeData>;
  if(Array.isArray(value.favorites)){const ids=new Set<string>();for(const f of value.favorites.slice(0,80)){if(!f||typeof f.id!=='string'||ids.has(f.id)||!trustedSite(f.url)||typeof f.name!=='string'||!f.name.trim())continue;ids.add(f.id);data.favorites.push({id:f.id,url:f.url,name:f.name.slice(0,100),folder:FAVORITE_FOLDERS.includes(f.folder)?f.folder:FAVORITE_FOLDERS[0],addedAt:Number.isFinite(f.addedAt)?f.addedAt:0,...(Number.isFinite(f.openedAt)&&(f.openedAt||0)>0?{openedAt:f.openedAt}:{})});}}
  if(value.downloads&&typeof value.downloads==='object'&&!Array.isArray(value.downloads)){for(const [key,r]of Object.entries(value.downloads).slice(0,200)){if(!r||r.fileId!==key||!key.startsWith('download-')||!trustedSite(r.sourceUrl)||typeof r.name!=='string'||typeof r.folderId!=='string')continue;data.downloads[key]={fileId:key,name:r.name,folderId:r.folderId,originalFolderId:typeof r.originalFolderId==='string'?r.originalFolderId:r.folderId,sourceUrl:r.sourceUrl,createdAt:Number.isFinite(r.createdAt)?r.createdAt:0,...(Number.isFinite(r.revealedAt)&&(r.revealedAt||0)>0?{revealedAt:r.revealedAt}:{})};}}
  if(value.settings&&typeof value.settings==='object'){data.settings={downloadFolderId:typeof value.settings.downloadFolderId==='string'&&validFolder(files,value.settings.downloadFolderId)?value.settings.downloadFolderId:'downloads',askWhereEachTime:value.settings.askWhereEachTime===true};}
 }
 data.downloads=synchronizeDownloads(data.downloads,files);return data;
}
export function persistEdgeData(data:EdgeData){localStorage.setItem(EDGE_STORAGE_KEY,JSON.stringify(data));}
