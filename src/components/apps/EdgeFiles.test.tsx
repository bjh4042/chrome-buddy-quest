import {beforeEach,describe,it,expect,vi} from 'vitest';
import {render,screen,fireEvent,within,cleanup} from '@testing-library/react';
import EdgeWindow from './EdgeWindow';
import MyPcWindow from './MyPcWindow';
import {FILES_KEY} from '@/lib/browserPractice';
vi.mock('./WindowFrame',()=>({default:({children}:{children:React.ReactNode})=><div>{children}</div>}));
beforeEach(()=>{cleanup();localStorage.clear();});
describe('Edge student practice',()=>{
 it('never awards the URL mission for a lookalike address, and supports navigation history',()=>{
  const done=vi.fn();render(<EdgeWindow onClose={()=>{}} currentQuestType="type-url" onQuestComplete={done}/>);
  const address=screen.getByLabelText('검색 또는 웹 주소 입력');
  fireEvent.change(address,{target:{value:'https://naver.com.evil.example'}});fireEvent.submit(address.closest('form')!);
  expect(screen.getByText('주소를 한 번 더 확인하세요')).toBeInTheDocument();expect(done).not.toHaveBeenCalled();
  fireEvent.change(address,{target:{value:'naver.com'}});fireEvent.submit(address.closest('form')!);
  expect(done).toHaveBeenCalledTimes(1);expect(address).toHaveValue('https://naver.com/');
  fireEvent.click(screen.getByLabelText('뒤로'));expect(screen.getByText('주소를 한 번 더 확인하세요')).toBeInTheDocument();
  fireEvent.click(screen.getByLabelText('앞으로'));expect(address).toHaveValue('https://naver.com/');expect(done).toHaveBeenCalledTimes(1);
 });
 it('keeps offline navigation incomplete and retries after Wi-Fi connects',()=>{
  const done=vi.fn();const {rerender}=render(<EdgeWindow onClose={()=>{}} currentQuestType="type-url" onQuestComplete={done} connected={false}/>);const address=screen.getByLabelText('검색 또는 웹 주소 입력');fireEvent.change(address,{target:{value:'naver.com'}});fireEvent.submit(address.closest('form')!);expect(screen.getByText('인터넷에 연결되어 있지 않음')).toBeInTheDocument();expect(done).not.toHaveBeenCalled();rerender(<EdgeWindow onClose={()=>{}} currentQuestType="type-url" onQuestComplete={done} connected/>);fireEvent.click(screen.getByRole('button',{name:'재시도'}));expect(screen.queryByText('인터넷에 연결되어 있지 않음')).not.toBeInTheDocument();expect(done).toHaveBeenCalledOnce();
 });
 it('searches typed queries and opens and closes actual tabs',()=>{
  render(<EdgeWindow onClose={()=>{}} currentQuestType="click" onQuestComplete={()=>{}}/>);
  const query=screen.getByLabelText('페이지 검색어');fireEvent.change(query,{target:{value:'인터넷 안전'}});fireEvent.submit(query.closest('form')!);
  expect(screen.getByText('“인터넷 안전”에 관한 연습용 검색 결과')).toBeInTheDocument();
  fireEvent.click(screen.getByLabelText('새 탭'));expect(screen.getAllByRole('tab')).toHaveLength(2);
  fireEvent.click(screen.getByLabelText('2번 탭 닫기'));expect(screen.getAllByRole('tab')).toHaveLength(1);
 });
});
describe('File Explorer student practice',()=>{
 it('creates, renames, deletes and restores a folder using the actual file store',()=>{
  render(<MyPcWindow onClose={()=>{}}/>);fireEvent.click(screen.getByRole('button',{name:'문서'}));
  fireEvent.click(screen.getByRole('button',{name:'새 폴더'}));
  fireEvent.change(screen.getByLabelText('파일 또는 폴더 이름'),{target:{value:'나의 자료'}});fireEvent.click(screen.getByRole('button',{name:'확인'}));
  expect(JSON.parse(localStorage.getItem(FILES_KEY)!).some((f:{name:string})=>f.name==='나의 자료')).toBe(true);
  fireEvent.click(screen.getByLabelText('이름 바꾸기'));fireEvent.change(screen.getByLabelText('파일 또는 폴더 이름'),{target:{value:'우리반 자료'}});fireEvent.click(screen.getByRole('button',{name:'확인'}));
  fireEvent.click(screen.getByLabelText('삭제'));expect(JSON.parse(localStorage.getItem(FILES_KEY)!).find((f:{name:string})=>f.name==='우리반 자료').deleted).toBe(true);
  fireEvent.click(screen.getByRole('button',{name:'휴지통'}));const list=screen.getByRole('listbox',{name:'파일과 폴더'});fireEvent.click(within(list).getByRole('option',{name:/우리반 자료/}));
  fireEvent.click(screen.getByRole('button',{name:'복원'}));expect(JSON.parse(localStorage.getItem(FILES_KEY)!).find((f:{name:string})=>f.name==='우리반 자료').deleted).toBe(false);
 });
 it('opens the recycle bin requested before mount and blocks invalid file names',()=>{
  localStorage.setItem('win-explorer-open-folder','휴지통');render(<MyPcWindow onClose={()=>{}}/>);
  expect(screen.getByText('삭제한 연습 파일을 선택한 뒤 복원할 수 있습니다. 영구 삭제하면 되돌릴 수 없습니다.')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'문서'}));fireEvent.click(screen.getByRole('button',{name:'새 폴더'}));fireEvent.change(screen.getByLabelText('파일 또는 폴더 이름'),{target:{value:'CON'}});fireEvent.click(screen.getByRole('button',{name:'확인'}));
  expect(screen.getByRole('alert')).toHaveTextContent('예약어');expect(screen.getByRole('dialog')).toBeInTheDocument();
 });
});
