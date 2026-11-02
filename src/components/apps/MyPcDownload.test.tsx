import {beforeEach,afterEach,describe,it,expect,vi} from 'vitest';
import {render,screen,fireEvent,within,cleanup,act} from '@testing-library/react';
import MyPcWindow from './MyPcWindow';
import {FILES_KEY,defaultFiles,downloadPracticeFile,loadPracticeFiles,type PracticeFile} from '@/lib/browserPractice';
const {emit}=vi.hoisted(()=>({emit:vi.fn((_event:unknown)=> 'ignore')}));
vi.mock('@/features/quests/useQuestEngine',()=>({useQuestEmit:()=>emit}));
vi.mock('./WindowFrame',()=>({default:({children,title}:{children:React.ReactNode;title:string})=><div><h1>{title}</h1>{children}</div>}));
beforeEach(()=>{cleanup();localStorage.clear();emit.mockClear();vi.stubGlobal('URL',Object.assign(URL,{createObjectURL:vi.fn(()=> 'blob:practice'),revokeObjectURL:vi.fn()}));vi.spyOn(HTMLAnchorElement.prototype,'click').mockImplementation(()=>{});});
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();});
function events(type:string){return emit.mock.calls.map(c=>c[0] as {type:string;fileId?:string;folderId?:string;from?:string;to?:string}).filter(e=>e.type===type);}
function reveal(fileId:string){act(()=>window.dispatchEvent(new CustomEvent('win-explorer-reveal',{detail:{fileId}})));}
const downloaded=(parent='downloads'):PracticeFile=>({id:'download-test',name:'배운 기능 정리.txt',kind:'file',parent,modified:10,downloaded:true,content:'학습 자료'});
function seed(files:PracticeFile[]){localStorage.setItem(FILES_KEY,JSON.stringify([...defaultFiles,...files]));}
describe('actual Edge download and Explorer integration',()=>{
 it('downloads, reveals the actual saved item, and moves that same item before notifying observers',()=>{
  const confirmations:unknown[]=[];const confirmed=(e:Event)=>confirmations.push((e as CustomEvent).detail);window.addEventListener('win-explorer-revealed',confirmed);
  const persistedParents:string[]=[];const changed=()=>{const f=loadPracticeFiles().find(f=>f.downloaded);if(f)persistedParents.push(f.parent);};window.addEventListener('win-files-changed',changed);
  render(<MyPcWindow onClose={()=>{}}/>);let file!:PracticeFile;
  act(()=>{file=downloadPracticeFile('수업 자료.txt','내가 배운 기능',{sourceUrl:'https://school.example/'});});
  expect(events('DOWNLOAD_FOLDER_OPENED')).toHaveLength(0);reveal(file.id);
  expect(screen.getByRole('heading',{name:'다운로드'})).toBeInTheDocument();expect(within(screen.getByRole('listbox',{name:'파일과 폴더'})).getByRole('option',{name:/수업 자료/})).toHaveAttribute('aria-selected','true');
  expect(events('DOWNLOAD_FOLDER_OPENED')).toEqual([{type:'DOWNLOAD_FOLDER_OPENED',fileId:file.id,folderId:'downloads'}]);
  expect(confirmations).toEqual([{fileId:file.id,folderId:'downloads'}]);expect(loadPracticeFiles().find(f=>f.id===file.id)?.parent).toBe('downloads');
  fireEvent.click(screen.getByRole('button',{name:'선택 항목 이동'}));const dialog=screen.getByRole('dialog',{name:'항목 이동'});expect(within(dialog).getByRole('button',{name:'문서'})).toHaveAttribute('aria-pressed','true');fireEvent.click(within(dialog).getByRole('button',{name:'이동'}));
  expect(loadPracticeFiles().find(f=>f.id===file.id)?.parent).toBe('documents');expect(events('DOWNLOAD_MOVED')).toEqual([{type:'DOWNLOAD_MOVED',fileId:file.id,from:'downloads',to:'documents'}]);expect(persistedParents.at(-1)).toBe('documents');
  expect(screen.getByRole('status')).toHaveTextContent('수업 자료.txt · 저장 위치: 문서');expect(screen.getByRole('status')).not.toHaveTextContent('저장 위치: 다운로드');
  fireEvent.click(screen.getByLabelText('문서 폴더로 가기'));expect(screen.queryByRole('status')).not.toBeInTheDocument();fireEvent.click(screen.getByLabelText('다운로드 폴더로 가기'));expect(screen.queryByRole('status')).not.toBeInTheDocument();
  reveal(file.id);expect(screen.getByRole('heading',{name:'문서'})).toBeInTheDocument();expect(events('DOWNLOAD_FOLDER_OPENED')).toHaveLength(2);expect(loadPracticeFiles().filter(f=>f.id===file.id)).toHaveLength(1);
  window.removeEventListener('win-explorer-revealed',confirmed);window.removeEventListener('win-files-changed',changed);
 });
 it('only awards reveal for a pending user request and follows a custom folder without moving it',()=>{
  seed([{id:'custom',name:'나의 학습 자료',kind:'folder',parent:'documents',modified:0},downloaded('custom')]);render(<MyPcWindow onClose={()=>{}}/>);
  expect(events('DOWNLOAD_FOLDER_OPENED')).toHaveLength(0);reveal('missing');expect(events('DOWNLOAD_FOLDER_OPENED')).toHaveLength(0);expect(screen.getByRole('status')).toHaveTextContent('찾을 수 없습니다');
  reveal('download-test');expect(screen.getByRole('heading',{name:'나의 학습 자료'})).toBeInTheDocument();expect(loadPracticeFiles().find(f=>f.id==='download-test')?.parent).toBe('custom');expect(events('DOWNLOAD_FOLDER_OPENED')[0]).toMatchObject({fileId:'download-test',folderId:'custom'});
  reveal('download-test');expect(events('DOWNLOAD_FOLDER_OPENED')).toHaveLength(2);
 });
 it('consumes a before-mount reveal request and rejects cyclic or deleted locations',()=>{
  seed([downloaded()]);localStorage.setItem('win-explorer-reveal-file','download-test');const {unmount}=render(<MyPcWindow onClose={()=>{}}/>);
  expect(events('DOWNLOAD_FOLDER_OPENED')).toHaveLength(1);expect(localStorage.getItem('win-explorer-reveal-file')).toBeNull();unmount();emit.mockClear();
  seed([{id:'cycle-a',name:'순환 A',kind:'folder',parent:'cycle-b',modified:0},{id:'cycle-b',name:'순환 B',kind:'folder',parent:'cycle-a',modified:0},downloaded('cycle-a')]);localStorage.setItem('win-explorer-open-folder','cycle-a');render(<MyPcWindow onClose={()=>{}}/>);reveal('download-test');expect(events('DOWNLOAD_FOLDER_OPENED')).toHaveLength(0);expect(screen.getByRole('heading',{name:'내 PC'})).toBeInTheDocument();
 });
 it('distinguishes a copy from an actual cut/paste movement',()=>{
  seed([downloaded()]);render(<MyPcWindow onClose={()=>{}}/>);reveal('download-test');fireEvent.click(screen.getByLabelText('복사'));fireEvent.click(screen.getByLabelText('문서 폴더로 가기'));fireEvent.click(screen.getByLabelText('붙여넣기'));
  expect(events('DOWNLOAD_MOVED')).toHaveLength(0);expect(loadPracticeFiles().find(f=>f.id==='download-test')?.parent).toBe('downloads');
  reveal('download-test');fireEvent.click(screen.getByLabelText('잘라내기'));fireEvent.click(screen.getByLabelText('문서 폴더로 가기'));fireEvent.click(screen.getByLabelText('붙여넣기'));
  // The copy has the same name, so the original move must fail until its conflict is resolved.
  expect(events('DOWNLOAD_MOVED')).toHaveLength(0);expect(loadPracticeFiles().find(f=>f.id==='download-test')?.parent).toBe('downloads');
  fireEvent.click(screen.getByRole('button',{name:'사진'}));fireEvent.click(screen.getByLabelText('붙여넣기'));expect(loadPracticeFiles().find(f=>f.id==='download-test')?.parent).toBe('pictures');expect(events('DOWNLOAD_MOVED')[0]).toMatchObject({fileId:'download-test',from:'downloads',to:'pictures'});
 });
 it('does not emit a move when persistent storage rejects the changed path',()=>{
  seed([downloaded()]);render(<MyPcWindow onClose={()=>{}}/>);reveal('download-test');fireEvent.click(screen.getByRole('button',{name:'선택 항목 이동'}));const fail=vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new Error('quota');});
  fireEvent.click(within(screen.getByRole('dialog',{name:'항목 이동'})).getByRole('button',{name:'이동'}));expect(events('DOWNLOAD_MOVED')).toHaveLength(0);expect(screen.getByRole('status')).toHaveTextContent('저장 공간');expect(loadPracticeFiles().find(f=>f.id==='download-test')?.parent).toBe('downloads');expect(within(screen.getByRole('listbox',{name:'파일과 폴더'})).getByRole('option',{name:/배운 기능 정리/})).toBeInTheDocument();fail.mockRestore();
 });
 it('emits the actual parent change when a downloaded file is dragged into a custom folder',()=>{
  seed([{id:'lesson-folder',name:'자료 모음',kind:'folder',parent:'downloads',modified:0},downloaded()]);render(<MyPcWindow onClose={()=>{}}/>);reveal('download-test');
  const folder=within(screen.getByRole('listbox',{name:'파일과 폴더'})).getByRole('option',{name:/자료 모음/});fireEvent.drop(folder,{dataTransfer:{getData:()=>JSON.stringify(['download-test'])}});
  expect(loadPracticeFiles().find(f=>f.id==='download-test')?.parent).toBe('lesson-folder');expect(events('DOWNLOAD_MOVED')).toEqual([{type:'DOWNLOAD_MOVED',fileId:'download-test',from:'downloads',to:'lesson-folder'}]);
 });
 it('syncs a new external download without replacing unsaved preview text',()=>{
  seed([downloaded()]);render(<MyPcWindow onClose={()=>{}}/>);reveal('download-test');fireEvent.doubleClick(within(screen.getByRole('listbox',{name:'파일과 폴더'})).getByRole('option',{name:/배운 기능 정리/}));
  fireEvent.change(screen.getByLabelText('문서 내용'),{target:{value:'아직 저장하지 않은 내 기록'}});let next!:PracticeFile;act(()=>{next=downloadPracticeFile('다른 수업 자료.txt','다른 자료',{folderId:'documents',sourceUrl:'https://school.example/'});});
  expect(screen.getByLabelText('문서 내용')).toHaveValue('아직 저장하지 않은 내 기록');fireEvent.click(within(screen.getByRole('dialog',{name:'텍스트 문서'})).getByRole('button',{name:'저장'}));
  expect(loadPracticeFiles().find(f=>f.id==='download-test')?.content).toBe('아직 저장하지 않은 내 기록');expect(loadPracticeFiles().find(f=>f.id===next.id)?.parent).toBe('documents');
 });
});
