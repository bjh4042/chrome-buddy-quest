import { Children, cloneElement, isValidElement, useEffect, useRef, useState, type ReactNode } from 'react';
import { Search, ChevronLeft, ChevronRight, RotateCw, Home, Plus, X, Star, History, Download, MoreHorizontal, ShieldCheck, FolderOpen, Pencil, Trash2 } from 'lucide-react';
import WindowFrame from './WindowFrame';
import { AppIcon } from '../icons/WindowsIcon';
import ViewportDialog from './ViewportDialog';
import type { QuestType } from '@/types/quest';
import type { LearningEvent } from '@/features/quests/questEvents';
import { useQuestEmit } from '@/features/quests/useQuestEngine';
import { FILES_KEY, parsePracticeAddress, isNaverHost, downloadPracticeFile, loadPracticeFiles, type PracticeFile } from '@/lib/browserPractice';
import { EDGE_STORAGE_KEY, FAVORITE_FOLDERS, fileFolderPath, loadEdgeData, persistEdgeData, synchronizeDownloads, trustedSite, validFolder, type EdgeData, type Favorite } from '@/lib/edgeStorage';

interface EdgeWindowProps {
  onClose: () => void;
  onMinimize?: () => void;
  currentQuestType: QuestType;
  onQuestComplete: () => void;
  highlightClose?: boolean;
  connected?: boolean;
}
type Tab = { id: number; history: string[]; index: number };
type Panel = 'favorites' | 'favorite-edit' | 'history' | 'downloads' | 'menu' | 'download-settings' | 'folder' | null;
type FavoriteDraft = { id?: string; name: string; url: string; folder: string };
let nextTabId = 0;
const newTab = (): Tab => ({ id: ++nextTabId, history: ['edge://newtab'], index: 0 });
const uid = () => Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
const button = 'rounded-md border border-slate-200 bg-white px-3 py-2 text-xs hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40';
const iconButton = 'shrink-0 rounded p-1.5 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent';
const handoutName = '안전한_인터넷_사용_안내.txt';
const handoutContent = '안전한 인터넷 사용\n1. 주소의 실제 도메인을 확인합니다.\n2. 개인정보와 진짜 비밀번호를 입력하지 않습니다.\n3. 모르는 파일은 열기 전에 선생님께 물어봅니다.\n4. 출처와 날짜를 확인합니다.';

const EdgeIcon = ({ className = "w-4 h-4" }: { className?: string }) => <AppIcon name="edge" className={className} />;

function highlightPage(node: ReactNode, query: string, selected: number) {
  let count = 0;
  const needle = query.trim().toLocaleLowerCase();
  function walk(child: ReactNode): ReactNode {
    if (typeof child === 'string' && needle) {
      const source = child.toLocaleLowerCase();
      const parts: ReactNode[] = [];
      let start = 0, found = source.indexOf(needle);
      while (found >= 0) {
        if (found > start) parts.push(child.slice(start, found));
        const index = count++;
        parts.push(<mark key={'match-' + index} data-edge-match={index} className={index === selected ? 'rounded bg-orange-300 text-slate-900 ring-1 ring-orange-500' : 'rounded bg-yellow-200 text-slate-900'}>{child.slice(found, found + needle.length)}</mark>);
        start = found + needle.length;
        found = source.indexOf(needle, start);
      }
      if (start < child.length) parts.push(child.slice(start));
      return parts.length ? parts : child;
    }
    if (isValidElement<{ children?: ReactNode }>(child) && child.props.children !== undefined) return cloneElement(child, {}, Children.map(child.props.children, walk));
    if (Array.isArray(child)) return child.map(walk);
    return child;
  }
  return { content: walk(node), count };
}
function locallyVisible(element: HTMLElement | null) {
  for (let node = element; node; node = node.parentElement) if (node.hidden || node.style.display === 'none' || node.getAttribute('aria-hidden') === 'true') return false;
  return true;
}
function initialVisits() {
  try { const value = JSON.parse(localStorage.getItem(EDGE_STORAGE_KEY + '-history') || '[]'); return Array.isArray(value) ? value.filter(url => typeof url === 'string').slice(0, 80) : []; } catch { return []; }
}

const EdgeWindow = ({ onClose, onMinimize, currentQuestType, onQuestComplete, highlightClose, connected = true }: EdgeWindowProps) => {
  const emit = useQuestEmit();
  const [tabs, setTabs] = useState<Tab[]>(() => [newTab()]);
  const [active, setActive] = useState(0);
  const [closedTabs, setClosedTabs] = useState<Tab[]>([]);
  const tab = tabs[active] || tabs[0];
  const current = tab.history[tab.index];
  const page = parsePracticeAddress(current);
  const [files, setFiles] = useState<PracticeFile[]>(loadPracticeFiles);
  const [data, setData] = useState<EdgeData>(() => loadEdgeData());
  const dataRef = useRef(data); dataRef.current = data;
  const [visits, setVisits] = useState<string[]>(initialVisits);
  const [address, setAddress] = useState('');
  const [query, setQuery] = useState('');
  const [panel, setPanel] = useState<Panel>(null);
  const [draft, setDraft] = useState<FavoriteDraft>({ name: '', url: '', folder: FAVORITE_FOLDERS[0] });
  const [folderMode, setFolderMode] = useState<'default' | 'once'>('default');
  const [folderChoice, setFolderChoice] = useState('downloads');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [zoom, setZoom] = useState(100);
  const [steps, setSteps] = useState<string[]>([]);
  const [quiz, setQuiz] = useState<'correct' | 'wrong' | null>(null);
  const [failedNavigation, setFailedNavigation] = useState<{ tabId: number; url: string } | null>(null);
  const [findOpen, setFindOpen] = useState(false);
  const [findQuery, setFindQuery] = useState('');
  const [findIndex, setFindIndex] = useState(0);
  const [findAction, setFindAction] = useState(0);
  const wrapper = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const addr = useRef<HTMLInputElement>(null);
  const findInput = useRef<HTMLInputElement>(null);
  const completed = useRef(false);
  const awardRef = useRef<(event: LearningEvent, quest: QuestType) => void>(() => {});
  const offline = failedNavigation?.tabId === tab.id && failedNavigation.url === current;
  const usableSite = connected && !offline && page.kind === 'site' && trustedSite(current);

  useEffect(() => { completed.current = false; }, [currentQuestType]);
  useEffect(() => { commit(previous => previous, true); }, []);
  useEffect(() => { setAddress(current === 'edge://newtab' ? '' : current); setQuery(page.query || ''); setFindIndex(0); }, [current]);
  useEffect(() => { try { localStorage.setItem(EDGE_STORAGE_KEY + '-history', JSON.stringify(visits)); } catch { /* History stays usable for this session. */ } }, [visits]);
  useEffect(() => { if (findOpen) findInput.current?.focus(); }, [findOpen]);

  function commit(change: (previous: EdgeData) => EdgeData, quiet = false) {
    const next = change(dataRef.current);
    try { persistEdgeData(next); dataRef.current = next; setData(next); return true; }
    catch { if (!quiet) { setError('저장 공간이 부족하거나 저장이 차단되었습니다. 작업을 저장하지 못했습니다.'); setMessage('작업을 저장하지 못했습니다. 저장 공간과 브라우저 설정을 확인하세요.'); } return false; }
  }
  function learned(step: string) { setSteps(previous => previous.includes(step) ? previous : [...previous, step]); }
  function award(event: LearningEvent, quest: QuestType) {
    if (currentQuestType === quest && completed.current) return;
    const result = emit(event);
    if (currentQuestType === quest && result !== 'wrong') { completed.current = true; if (result === 'ignore') onQuestComplete(); }
  }
  awardRef.current = award;

  useEffect(() => {
    const changed = () => {
      const nextFiles = loadPracticeFiles(); setFiles(nextFiles);
      const nextRecords = synchronizeDownloads(dataRef.current.downloads, nextFiles);
      if (JSON.stringify(nextRecords) !== JSON.stringify(dataRef.current.downloads)) commit(previous => ({ ...previous, downloads: nextRecords }), true);
    };
    const storage = (event: StorageEvent) => { if (event.key === FILES_KEY) changed(); else if (event.key === EDGE_STORAGE_KEY) { const next = loadEdgeData(); dataRef.current = next; setData(next); } };
    const revealed = (event: Event) => {
      const detail = (event as CustomEvent<{ fileId?: string; folderId?: string }>).detail;
      const actual = loadPracticeFiles().find(file => file.id === detail?.fileId && file.kind === 'file' && file.downloaded && !file.deleted);
      if (!actual || actual.parent !== detail?.folderId || !dataRef.current.downloads[actual.id]) return;
      commit(previous => ({ ...previous, downloads: { ...previous.downloads, [actual.id]: { ...previous.downloads[actual.id], revealedAt: Date.now() } } }), true);
    };
    window.addEventListener('win-files-changed', changed); window.addEventListener('win-explorer-files-changed', changed); window.addEventListener('storage', storage); window.addEventListener('win-explorer-revealed', revealed);
    return () => { window.removeEventListener('win-files-changed', changed); window.removeEventListener('win-explorer-files-changed', changed); window.removeEventListener('storage', storage); window.removeEventListener('win-explorer-revealed', revealed); };
  }, []);

  function navigate(input: string, replace = false) {
    const target = parsePracticeAddress(input);
    if (target.kind !== 'home') setVisits(previous => [target.url, ...previous].slice(0, 80));
    setTabs(previous => previous.map((item, index) => index === active ? (replace ? { ...item, history: item.history.map((url, i) => i === item.index ? target.url : url) } : { ...item, history: [...item.history.slice(0, item.index + 1), target.url], index: item.index + 1 }) : item));
    setPanel(null); setError('');
    if (!connected && (target.kind === 'site' || target.kind === 'search')) { setFailedNavigation({ tabId: tab.id, url: target.url }); return false; }
    setFailedNavigation(null);
    if (target.kind === 'search') learned('search');
    if (target.kind === 'site') learned('address');
    if (isNaverHost(target.host) && target.kind === 'site') award({ type: 'BROWSER_NAVIGATED', url: target.url }, 'type-url');
    return target.kind === 'site';
  }
  function move(delta: number) { if (tab.index + delta < 0 || tab.index + delta >= tab.history.length) return; setTabs(previous => previous.map((item, i) => i === active ? { ...item, index: item.index + delta } : item)); learned('history'); }
  function addTab() { setTabs(previous => [...previous, newTab()]); setActive(tabs.length); setPanel(null); learned('tab'); }
  function closeTab(index: number) {
    setClosedTabs(previous => [tabs[index], ...previous].slice(0, 10));
    if (tabs.length === 1) { setTabs([newTab()]); setActive(0); return; }
    setTabs(previous => previous.filter((_, i) => i !== index)); setActive(previous => index < previous ? previous - 1 : Math.min(previous, tabs.length - 2));
  }
  function restoreTab() {
    const restored = closedTabs[0]; if (!restored) { setMessage('최근에 닫은 탭이 없습니다.'); return; }
    const url = restored.history[restored.index];
    setClosedTabs(previous => previous.slice(1));
    if (tabs.length === 1 && current === 'edge://newtab') { setTabs([restored]); setActive(0); } else { setTabs(previous => [...previous, restored]); setActive(tabs.length); }
    setPanel(null); setMessage('최근에 닫은 탭을 다시 열었습니다.');
    if (connected && trustedSite(url)) award({ type: 'BROWSER_TAB_RESTORED', url }, 'edge-restore-tab');
    if (!connected && trustedSite(url)) setFailedNavigation({ tabId: restored.id, url });
  }
  function editFavorite(favorite?: Favorite) {
    setError('');
    if (favorite) setDraft({ id: favorite.id, url: favorite.url, name: favorite.name, folder: favorite.folder });
    else {
      if (!usableSite) { setMessage('인터넷에 연결한 뒤 연습 사이트에 접속해 즐겨찾기를 추가하세요.'); return; }
      const existing = data.favorites.find(item => item.url === current);
      setDraft(existing ? { ...existing } : { url: current, name: isNaverHost(page.host) ? 'NAVER' : page.host === 'school.example' ? '탐험대 학교' : '디지털 교실', folder: FAVORITE_FOLDERS[0] });
    }
    setPanel('favorite-edit');
  }
  function saveFavorite() {
    const name = draft.name.trim();
    if (!name || name.length > 100) { setError('즐겨찾기 이름을 1~100자로 입력하세요.'); return; }
    if (!trustedSite(draft.url) || !FAVORITE_FOLDERS.includes(draft.folder)) { setError('올바른 연습 사이트 주소와 폴더를 선택하세요.'); return; }
    if (!connected) { setError('Wi-Fi에 연결한 뒤 즐겨찾기를 저장하세요.'); return; }
    const favorite: Favorite = { id: draft.id || 'favorite-' + uid(), name, url: draft.url, folder: draft.folder, addedAt: data.favorites.find(item => item.id === draft.id)?.addedAt || Date.now(), ...(data.favorites.find(item => item.id === draft.id)?.url === draft.url && data.favorites.find(item => item.id === draft.id)?.openedAt ? { openedAt: data.favorites.find(item => item.id === draft.id)!.openedAt } : {}) };
    if (!commit(previous => ({ ...previous, favorites: draft.id ? previous.favorites.map(item => item.id === draft.id ? favorite : item) : [...previous.favorites, favorite].slice(-80) }))) return;
    setPanel('favorites'); setMessage('즐겨찾기를 저장했습니다. 목록에서 이름을 눌러 다시 열어 보세요.'); learned('favorite');
    if (!draft.id) award({ type: 'FAVORITE_ADDED', url: favorite.url, name: favorite.name, folder: favorite.folder }, 'edge-favorite-add');
  }
  function openFavorite(favorite: Favorite) {
    if (!connected || !trustedSite(favorite.url)) { setMessage('Wi-Fi에 연결한 뒤 즐겨찾기를 다시 여세요.'); return; }
    if (!commit(previous => ({ ...previous, favorites: previous.favorites.map(item => item.id === favorite.id ? { ...item, openedAt: Date.now() } : item) }))) return;
    navigate(favorite.url); award({ type: 'FAVORITE_OPENED', url: favorite.url }, 'edge-favorite-open');
  }
  function chooseFolder(mode: 'default' | 'once') { setFolderMode(mode); setFolderChoice(validFolder(files, data.settings.downloadFolderId) ? data.settings.downloadFolderId : 'downloads'); setError(''); setPanel('folder'); }
  function confirmFolder() {
    const actual = loadPracticeFiles(); if (!validFolder(actual, folderChoice)) { setError('저장할 폴더를 선택하세요.'); return; }
    if (folderMode === 'once') { performDownload(folderChoice); return; }
    const previousId = data.settings.downloadFolderId;
    if (!commit(previous => ({ ...previous, settings: { ...previous.settings, downloadFolderId: folderChoice } }))) return;
    setPanel('download-settings'); setMessage('앞으로 다운로드할 연습 파일의 기본 저장 위치를 바꿨습니다. 기존 파일은 이동하지 않습니다.');
    if (folderChoice !== previousId && folderChoice !== 'downloads') award({ type: 'DOWNLOAD_LOCATION_CHANGED', folderId: folderChoice }, 'edge-download-location');
  }
  function startDownload() { if (!usableSite) { setMessage('인터넷에 연결한 뒤 탐험대 학교 등 연습 사이트에서 다운로드하세요.'); return; } if (data.settings.askWhereEachTime) chooseFolder('once'); else performDownload(data.settings.downloadFolderId); }
  function performDownload(folderId: string) {
    if (!usableSite || !validFolder(loadPracticeFiles(), folderId)) { setError('연결 상태와 저장할 폴더를 확인하세요.'); setMessage('연결 상태와 저장할 폴더를 확인하세요.'); return; }
    try {
      const file = downloadPracticeFile(handoutName, handoutContent, { folderId, sourceUrl: current }); const nextFiles = loadPracticeFiles(); setFiles(nextFiles);
      if (!commit(previous => ({ ...previous, downloads: { ...synchronizeDownloads(previous.downloads, nextFiles), [file.id]: { fileId: file.id, name: file.name, folderId: file.parent, originalFolderId: file.parent, sourceUrl: current, createdAt: file.modified } } }))) return;
      setPanel('downloads'); setError(''); setMessage('연습 파일을 저장하고 PC로 TXT 내보내기를 요청했습니다. ‘폴더에 표시’로 위치를 확인하세요.'); learned('download');
      award({ type: 'DOWNLOAD_COMPLETED', fileId: file.id, name: file.name, folderId: file.parent, sourceUrl: current }, 'edge-download-file');
    } catch (reason) { const text = reason instanceof Error ? reason.message : '다운로드하지 못했습니다.'; setError(text); setMessage(text); }
  }
  function revealFile(fileId: string) {
    const actual = loadPracticeFiles().find(file => file.id === fileId && file.downloaded && !file.deleted);
    if (!actual || !validFolder(loadPracticeFiles(), actual.parent)) { setError('파일이 이동되거나 삭제되어 위치를 확인할 수 없습니다. 목록을 다시 확인하세요.'); return; }
    try { localStorage.setItem('win-explorer-reveal-file', actual.id); } catch { setError('파일 위치 열기 요청을 저장하지 못했습니다.'); return; }
    setPanel(null); window.dispatchEvent(new CustomEvent('win-explorer-reveal', { detail: { fileId: actual.id } }));
  }

  const normalPage = <section className="mx-auto max-w-3xl px-4 py-6">
    <div className="mb-5 flex items-center justify-center gap-3">{isNaverHost(page.host) ? <span className="text-4xl font-black text-[#03c75a]">NAVER</span> : <><EdgeIcon className="h-10 w-10" /><h2 className="text-xl font-medium">{page.host === 'school.example' ? '탐험대 학교' : page.host?.endsWith('microsoft.com') ? '안전한 디지털 교실' : '무엇이 궁금한가요?'}</h2></>}</div>
    <form className="mx-auto flex max-w-xl items-center gap-2 rounded-full border-2 border-slate-300 bg-white p-2 pl-4 shadow-sm focus-within:border-blue-500" onSubmit={event => { event.preventDefault(); if (query.trim()) navigate('https://www.bing.com/search?q=' + encodeURIComponent(query.trim())); }}><input aria-label="페이지 검색어" value={query} onChange={event => setQuery(event.target.value)} placeholder="예: 안전한 인터넷 사용" className="min-w-0 flex-1 text-sm outline-none" /><button aria-label="검색" className="p-2 text-blue-700"><Search size={19} /></button></form>
    {page.kind === 'search' ? <div className="mt-6 grid gap-3"><h3 className="text-sm text-slate-500">“{page.query}”에 관한 연습용 검색 결과</h3>{[{ name: '탐험대 학교 · 인터넷 안전 수업', url: 'https://school.example/internet', desc: '개인정보를 지키고 안전하게 자료를 찾는 방법을 배워요.' }, { name: 'NAVER · 검색 시작하기', url: 'https://www.naver.com/', desc: '검색어와 주소의 차이를 알아보고 검색창을 사용해요.' }, { name: 'Microsoft · 디지털 교실', url: 'https://www.microsoft.com/', desc: '다운로드한 파일을 안전하게 확인하고 출처를 살펴봐요.' }].map(item => <article className="rounded-lg border p-4" key={item.url}><p className="text-[11px] text-green-700">{item.url}</p><button className="my-1 text-left text-base text-blue-700 hover:underline" onClick={() => navigate(item.url)}>{item.name}</button><p className="leading-relaxed text-slate-600">{item.desc}</p></article>)}</div> : <div className="mt-5 grid gap-3 sm:grid-cols-3">{[{ title: '탐험대 학교', desc: '인터넷 안전 수업', url: 'https://school.example/' }, { title: '네이버', desc: '주소 입력 연습', url: 'https://www.naver.com/' }, { title: '디지털 교실', desc: '자료 다운로드 연습', url: 'https://www.microsoft.com/' }].map(item => <button key={item.url} className="rounded-xl border p-4 text-left hover:bg-blue-50" onClick={() => navigate(item.url)}><span className="mb-1 block font-semibold">{item.title}</span><span className="text-slate-500">{item.desc}</span></button>)}</div>}
    <section className="mt-5 rounded-xl border bg-slate-50 p-4"><h3 className="mb-2 text-sm font-semibold">실습 자료실</h3><p className="mb-3 leading-relaxed text-slate-600">출처: 윈도우 탐험대 교육 자료 · 안전한 인터넷 사용 안내는 TXT 텍스트 문서입니다. 파일 종류를 확인하고 다운로드해 보세요.</p><button className={button} onClick={startDownload}><Download size={14} className="mr-2 inline" />안전한 인터넷 사용 안내.txt 다운로드</button>{page.kind === 'home' && <p className="mt-2 text-[11px] text-slate-500">먼저 위의 탐험대 학교 링크를 열고 다운로드하세요.</p>}</section>
    <section className="mt-5 rounded-xl border p-4"><h3 className="mb-2 text-sm font-semibold">주소 구별하기</h3><p className="mb-3">네이버의 실제 도메인인 주소는 어느 것일까요?</p><div className="grid gap-2">{['https://naver.com.evil.example', 'https://www.naver.com', 'https://naver-login.example'].map(value => <button key={value} className={button + ' break-all text-left'} onClick={() => { const ok = value === 'https://www.naver.com'; setQuiz(ok ? 'correct' : 'wrong'); if (ok) learned('security'); }}>{value}</button>)}</div>{quiz && <p role="status" className={'mt-3 ' + (quiz === 'correct' ? 'text-green-700' : 'text-amber-700')}>{quiz === 'correct' ? '맞아요. www 뒤의 실제 도메인이 naver.com인지 확인합니다.' : '다시 확인하세요. naver라는 글자가 있어도 주소 끝의 실제 도메인이 다르면 다른 사이트입니다.'}</p>}</section>
    <section className="mt-5 rounded-xl border p-4"><h3 className="mb-2 text-sm font-semibold">안전하게 자료를 보관하는 순서</h3><p className="leading-relaxed text-slate-600">사이트를 즐겨찾기에 추가한 뒤 목록에서 다시 열어요. 자료를 다운로드하고 폴더에 표시해 위치를 확인해요. 탐색기에서 문서 폴더로 파일을 옮겨요. 기본 다운로드 위치 변경은 앞으로 받는 파일에만 적용됩니다.</p></section>
  </section>;
  const highlighted = highlightPage(normalPage, findOpen ? findQuery : '', findIndex);
  const matchCount = offline || page.kind === 'blocked' ? 0 : highlighted.count;
  useEffect(() => {
    if (!findOpen || !findQuery.trim() || !matchCount || !connected || offline || page.kind === 'blocked') return;
    if (findQuery.trim() === '안전') awardRef.current({ type: 'BROWSER_TEXT_FOUND', query: findQuery.trim(), matches: matchCount }, 'edge-find-text');
  }, [findAction]);
  useEffect(() => { content.current?.querySelector<HTMLElement>(`[data-edge-match="${findIndex}"]`)?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' }); }, [findIndex, findAction]);
  function findStep(delta: number) { if (matchCount) setFindIndex(previous => (previous + delta + matchCount) % matchCount); }
  function showFind() { setFindOpen(true); setPanel(null); requestAnimationFrame(() => findInput.current?.focus()); }

  const records = Object.values(data.downloads).sort((a, b) => b.createdAt - a.createdAt);
  const liveRecords = records.filter(record => files.some(file => file.id === record.fileId && !file.deleted));
  const chainChecks = [
    ['favorite-add', data.favorites.length > 0, '즐겨찾기 이름·폴더 저장'],
    ['favorite-open', data.favorites.some(favorite => !!favorite.openedAt), '즐겨찾기에서 사이트 다시 열기'],
    ['download', liveRecords.length > 0, 'TXT 자료 다운로드'],
    ['reveal', liveRecords.some(record => !!record.revealedAt), '폴더에 표시로 실제 파일 선택'],
    ['move', liveRecords.some(record => !!record.revealedAt && record.originalFolderId !== 'documents' && files.find(file => file.id === record.fileId)?.parent === 'documents'), '탐색기에서 문서 폴더로 이동'],
    ['location', data.settings.downloadFolderId !== 'downloads' && validFolder(files, data.settings.downloadFolderId), '앞으로 받을 파일의 기본 위치 변경'],
  ] as const;
  const panelTitle = panel === 'favorites' ? '즐겨찾기' : panel === 'favorite-edit' ? (draft.id ? '즐겨찾기 편집' : '즐겨찾기 추가') : panel === 'history' ? '기록' : panel === 'downloads' ? '다운로드' : panel === 'download-settings' ? '설정 · 다운로드' : panel === 'folder' ? (folderMode === 'default' ? '기본 다운로드 위치 변경' : '다운로드 저장 위치 선택') : '설정 및 기타';
  let panelFooter: ReactNode = <button type="button" className={button} onClick={() => setPanel(null)}>닫기</button>;
  if (panel === 'favorite-edit') panelFooter = <><button type="button" className={button + ' text-blue-700'} onClick={saveFavorite}>완료</button><button type="button" className={button} onClick={() => setPanel('favorites')}>취소</button></>;
  if (panel === 'folder') panelFooter = <><button type="button" className={button + ' text-blue-700'} onClick={confirmFolder}>{folderMode === 'default' ? '폴더 선택' : '저장'}</button><button type="button" className={button} onClick={() => setPanel(folderMode === 'default' ? 'download-settings' : null)}>취소</button></>;

  return <WindowFrame title={(page.kind === 'home' ? '새 탭' : isNaverHost(page.host) ? 'NAVER' : page.kind === 'blocked' ? '주소 확인' : '인터넷 연습') + ' - Microsoft Edge'} icon={<EdgeIcon />} onClose={onClose} onMinimize={onMinimize} highlightClose={highlightClose}>
    <div ref={wrapper} tabIndex={-1} className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white text-xs text-slate-800" onKeyDown={event => {
      if (!locallyVisible(wrapper.current)) return;
      const ctrl = event.ctrlKey || event.metaKey, key = event.key.toLowerCase();
      if (ctrl && key === 'l') { event.preventDefault(); event.stopPropagation(); addr.current?.focus(); addr.current?.select(); }
      else if (ctrl && key === 'f') { event.preventDefault(); event.stopPropagation(); showFind(); }
      else if (ctrl && event.shiftKey && key === 't') { event.preventDefault(); event.stopPropagation(); restoreTab(); }
      else if (ctrl && event.shiftKey && key === 'o') { event.preventDefault(); event.stopPropagation(); setPanel('favorites'); }
      else if (ctrl && key === 'd') { event.preventDefault(); event.stopPropagation(); editFavorite(); }
      else if (ctrl && key === 'j') { event.preventDefault(); event.stopPropagation(); setPanel('downloads'); }
      else if (event.altKey && event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
      else if (event.altKey && event.key === 'ArrowRight') { event.preventDefault(); move(1); }
    }}>
      <div data-edge-chrome="true" role="region" aria-label="브라우저 도구 모음" tabIndex={0} style={{ flex: '0 1 auto', minHeight: 0, maxHeight: '55%', overflow: 'auto', overscrollBehavior: 'contain' }}>
      <div className="flex shrink-0 items-center gap-1 overflow-x-auto bg-[#e7edf3] px-2 pt-1" role="tablist" aria-label="브라우저 탭">{tabs.map((item, index) => <div key={item.id} className={'flex shrink-0 items-center rounded-t-lg border border-b-0 ' + (index === active ? 'border-slate-200 bg-white' : 'border-transparent')}><button role="tab" aria-selected={index === active} className="flex w-28 items-center gap-2 p-2 text-left sm:w-36" onClick={() => setActive(index)}><EdgeIcon className="h-4 w-4 shrink-0" /><span className="truncate">{item.history[item.index] === 'edge://newtab' ? '새 탭' : parsePracticeAddress(item.history[item.index]).host || '검색'}</span></button><button className={iconButton} aria-label={`${index + 1}번 탭 닫기`} onClick={() => closeTab(index)}><X size={13} /></button></div>)}<button aria-label="새 탭" className={iconButton} onClick={addTab}><Plus size={17} /></button></div>
      <div className="flex shrink-0 items-center gap-0.5 border-b border-slate-200 p-1.5"><button aria-label="뒤로" disabled={tab.index === 0} className={iconButton} onClick={() => move(-1)}><ChevronLeft size={17} /></button><button aria-label="앞으로" disabled={tab.index === tab.history.length - 1} className={iconButton} onClick={() => move(1)}><ChevronRight size={17} /></button><button aria-label="새로 고침" className={iconButton} onClick={() => { navigate(current, true); setMessage('현재 연습 페이지를 새로 고쳤습니다.'); }}><RotateCw size={15} /></button><button aria-label="홈" className={iconButton} onClick={() => navigate('edge://newtab')}><Home size={15} /></button><form className="min-w-0 flex-1" onSubmit={event => { event.preventDefault(); navigate(address); }}><div className="flex min-w-0 items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2 py-1.5"><ShieldCheck size={14} className="shrink-0 text-slate-500" /><input ref={addr} aria-label="검색 또는 웹 주소 입력" className="min-w-0 w-full bg-transparent text-xs outline-none sm:text-sm" value={address} onChange={event => setAddress(event.target.value)} onFocus={event => event.target.select()} placeholder="검색 또는 웹 주소 입력" /><button aria-label="주소로 이동" className="shrink-0"><ChevronRight size={14} /></button></div></form></div>
      <div className="flex shrink-0 items-center gap-1 border-b bg-slate-50 px-2 py-0.5"><span className="mr-auto text-[10px] text-blue-700">브라우저 실습</span><button aria-label="즐겨찾기 추가 또는 제거" title="즐겨찾기 추가 · Ctrl+D" className={iconButton} onClick={() => editFavorite()}><Star size={17} fill={data.favorites.some(item => item.url === current) ? '#eab308' : 'none'} /></button><button aria-label="기록" className={iconButton} onClick={() => { setError(''); setPanel('history'); }}><History size={17} /></button><button aria-label="다운로드 목록" className={iconButton} onClick={() => { setError(''); setPanel('downloads'); }}><Download size={17} /></button><button aria-label="설정 및 기타" className={iconButton} onClick={() => { setError(''); setPanel('menu'); }}><MoreHorizontal size={18} /></button><button className="text-[11px] text-blue-700 underline" onClick={() => { setError(''); setPanel('favorites'); }}>즐겨찾기</button></div>
      <p className="shrink-0 border-b bg-slate-50 px-3 py-1 text-[10px] text-slate-500">연습 사이트 · 실제 로그인과 외부 웹 접속은 제공하지 않습니다.</p>
      {message && <div role="status" className="flex shrink-0 justify-between gap-2 bg-blue-50 px-3 py-2 text-[11px] text-blue-800">{message}<button aria-label="메시지 닫기" className="shrink-0 self-start" onClick={() => setMessage('')}><X size={14} /></button></div>}
      {findOpen && <form className="flex shrink-0 flex-wrap items-center gap-1 border-b bg-white p-2" aria-label="페이지에서 찾기" onSubmit={event => { event.preventDefault(); findStep(1); }}><input ref={findInput} aria-label="페이지에서 찾을 내용" value={findQuery} onChange={event => { setFindQuery(event.target.value); setFindIndex(0); setFindAction(previous => previous + 1); }} placeholder="페이지에서 찾기 (예: 안전)" className="min-w-0 flex-1 rounded border px-2 py-1" /><span className="text-[11px] text-slate-500" role="status">{matchCount ? findIndex + 1 : 0}/{matchCount}</span><button type="button" aria-label="이전 일치 항목" className={iconButton} disabled={!matchCount} onClick={() => findStep(-1)}><ChevronLeft size={15} /></button><button type="button" aria-label="다음 일치 항목" className={iconButton} disabled={!matchCount} onClick={() => findStep(1)}><ChevronRight size={15} /></button><button type="button" aria-label="찾기 닫기" className={iconButton} onClick={() => setFindOpen(false)}><X size={15} /></button></form>}
      </div>
      <div ref={content} data-edge-content="true" role="region" aria-label="브라우저 페이지" className="min-w-0 overflow-auto" style={{ flex: '1 1 40px', minHeight: 40, overscrollBehavior: 'contain' }}><div className="min-h-full" style={{ zoom: zoom / 100 }}>{offline ? <section className="mx-auto max-w-xl p-6"><h2 className="mb-3 text-xl">인터넷에 연결되어 있지 않음</h2><p className="mb-4 leading-relaxed text-slate-600">작업 표시줄의 빠른 설정을 열어 Wi-Fi를 켜고 네트워크에 연결하세요. 비행기 모드가 켜져 있다면 먼저 끄세요. 연결한 뒤 재시도를 누릅니다.</p><p className="mb-4 break-all rounded bg-slate-100 p-3">{current}</p><button className={button} onClick={() => navigate(current, true)}>재시도</button></section> : page.kind === 'blocked' ? <section className="mx-auto max-w-xl p-6"><ShieldCheck size={42} className="mb-4 text-amber-600" /><h2 className="mb-3 text-xl">주소를 한 번 더 확인하세요</h2><p className="mb-3 break-all rounded bg-slate-100 p-3">{page.url}</p><p className="mb-4 leading-relaxed">{page.reason}</p><button className={button} onClick={() => navigate('https://www.naver.com')}>올바른 네이버 주소로 이동</button></section> : highlighted.content}</div></div>
      <details className="border-t bg-slate-50 px-3 py-2 text-[11px]" style={{ flex: '0 1 auto', minHeight: 26, maxHeight: '25%', overflow: 'auto', overscrollBehavior: 'contain' }}><summary className="sticky top-0 cursor-pointer bg-slate-50 font-medium">인터넷 실습 체크 · 자료 보관 {chainChecks.filter(item => item[1]).length}/6</summary><ol className="list-decimal space-y-1 py-2 pl-5">{chainChecks.map(([id, done, label]) => <li key={id} className={done ? 'text-green-700' : 'text-slate-500'}>{done ? '✓ ' : ''}{label}</li>)}</ol><p className="text-slate-500">검색·새 탭·뒤로/앞으로 이동도 화면 버튼으로 연습할 수 있어요. 단축키가 실제 브라우저에 적용되면 설정 및 기타 메뉴의 같은 명령을 사용하세요.</p></details>
      {panel && <ViewportDialog title={panelTitle} onClose={() => { setPanel(null); setError(''); }} footer={panelFooter}>
        {error && <p role="alert" className="mb-3 rounded bg-red-50 p-2 text-xs text-red-700">{error}</p>}
        {panel === 'menu' && <div className="grid gap-2 text-xs"><button className={button} onClick={addTab}>새 탭</button><button className={button} disabled={!closedTabs.length} onClick={restoreTab}>닫은 탭 다시 열기 <span className="ml-2 text-slate-400">Ctrl+Shift+T</span></button><button className={button} onClick={() => setPanel('favorites')}>즐겨찾기</button><button className={button} onClick={() => setPanel('downloads')}>다운로드</button><button className={button} onClick={showFind}>페이지에서 찾기 <span className="ml-2 text-slate-400">Ctrl+F</span></button><button className={button} onClick={() => setPanel('download-settings')}>설정 · 다운로드</button><div className="flex items-center justify-between gap-2">확대/축소<button aria-label="축소" className={button} disabled={zoom <= 75} onClick={() => setZoom(previous => Math.max(75, previous - 10))}>−</button>{zoom}%<button aria-label="확대" className={button} disabled={zoom >= 150} onClick={() => setZoom(previous => Math.min(150, previous + 10))}>+</button></div></div>}
        {panel === 'favorite-edit' && <form className="grid gap-3 text-xs" onSubmit={event => { event.preventDefault(); saveFavorite(); }}><label>이름<input aria-label="즐겨찾기 이름" value={draft.name} maxLength={100} onChange={event => setDraft(previous => ({ ...previous, name: event.target.value }))} className="mt-1 block w-full rounded border p-2" /></label><label>폴더<select aria-label="즐겨찾기 폴더" value={draft.folder} onChange={event => setDraft(previous => ({ ...previous, folder: event.target.value }))} className="mt-1 block w-full rounded border bg-white p-2">{FAVORITE_FOLDERS.map(folder => <option key={folder}>{folder}</option>)}</select></label><label>주소<input aria-label="즐겨찾기 주소" value={draft.url} onChange={event => setDraft(previous => ({ ...previous, url: event.target.value }))} className="mt-1 block w-full rounded border p-2" /></label></form>}
        {panel === 'favorites' && <div className="space-y-4 text-xs">{data.favorites.length === 0 && <p className="text-slate-500">아직 즐겨찾기가 없습니다. 사이트를 연 뒤 주소창 아래의 별을 눌러 추가하세요.</p>}{FAVORITE_FOLDERS.map(folder => <section key={folder}><h3 className="mb-2 flex items-center gap-2 font-semibold"><FolderOpen size={15} />{folder}</h3><div className="space-y-2">{data.favorites.filter(item => item.folder === folder).map(favorite => <article key={favorite.id} className="flex min-w-0 flex-wrap items-center gap-1 rounded border p-2"><button className="min-w-0 flex-1 break-all text-left text-blue-700 hover:underline" aria-label={`${favorite.name} 즐겨찾기 열기`} onClick={() => openFavorite(favorite)}><span className="block font-medium">{favorite.name}</span><span className="block text-[10px] text-slate-500">{favorite.url}</span></button><button aria-label={`${favorite.name} 즐겨찾기 편집`} className={iconButton} onClick={() => editFavorite(favorite)}><Pencil size={14} /></button><button aria-label={`${favorite.name} 즐겨찾기 삭제`} className={iconButton} onClick={() => commit(previous => ({ ...previous, favorites: previous.favorites.filter(item => item.id !== favorite.id) }))}><Trash2 size={14} /></button></article>)}</div></section>)}</div>}
        {panel === 'history' && <div className="grid gap-2 text-xs">{visits.length ? <><button className={button} onClick={() => setVisits([])}>검색 기록 지우기</button>{visits.map((url, index) => <button key={index} className={button + ' break-all text-left'} onClick={() => navigate(url)}>{url}</button>)}</> : <p className="text-slate-500">아직 기록이 없습니다.</p>}</div>}
        {panel === 'downloads' && <div className="space-y-3 text-xs"><button className={button} onClick={() => setPanel('download-settings')}>다운로드 설정 · 저장 위치 변경</button><p className="text-[11px] leading-relaxed text-slate-500">아래 위치는 앱 안의 연습 폴더입니다. PC로 내보낸 TXT는 실제 브라우저의 다운로드 설정에 따라 저장됩니다.</p>{records.length === 0 && <p className="text-slate-500">아직 다운로드한 파일이 없습니다.</p>}{records.map(record => { const actual = files.find(file => file.id === record.fileId); const available = actual && !actual.deleted; return <article key={record.fileId} className="min-w-0 rounded border p-3"><p className="break-all font-semibold">{actual?.name || record.name}</p><p className="my-1 break-all text-[11px] text-slate-500">{available ? fileFolderPath(files, actual.parent) : '파일이 삭제되었거나 없습니다.'}</p><p className="mb-2 break-all text-[10px] text-slate-500">출처: {record.sourceUrl}</p><div className="flex flex-wrap gap-2"><button className={button} disabled={!available} onClick={() => revealFile(record.fileId)}>폴더에 표시</button></div></article>; })}</div>}
        {panel === 'download-settings' && <div className="space-y-4 text-xs"><p className="text-[11px] text-slate-500">설정 및 기타 → 설정 → 다운로드</p><section className="rounded border p-3"><h3 className="mb-2 font-semibold">위치</h3><p className="mb-2 break-all">{fileFolderPath(files, data.settings.downloadFolderId)}</p><button className={button} onClick={() => chooseFolder('default')}>저장 위치 변경</button></section><label className="flex items-start gap-2"><input type="checkbox" checked={data.settings.askWhereEachTime} onChange={event => commit(previous => ({ ...previous, settings: { ...previous.settings, askWhereEachTime: event.target.checked } }))} /><span>다운로드할 때마다 저장 위치 묻기</span></label><p className="leading-relaxed text-slate-500">이 설정은 앞으로 받는 연습 파일에 적용됩니다. 기존 파일을 옮기려면 다운로드 목록의 폴더에 표시를 누르고 파일 탐색기에서 이동하세요. 실제 PC의 Edge 다운로드 위치는 변경하지 않습니다.</p></div>}
        {panel === 'folder' && <div className="space-y-3 text-xs"><p>앱 안의 연습 저장 폴더를 선택하세요.</p><label className="block">폴더<select aria-label="다운로드 저장 폴더" className="mt-2 block w-full rounded border bg-white p-2" value={folderChoice} onChange={event => setFolderChoice(event.target.value)}>{files.filter(file => file.kind === 'folder' && validFolder(files, file.id)).map(folder => <option key={folder.id} value={folder.id}>{fileFolderPath(files, folder.id)}</option>)}</select></label>{folderMode === 'default' && <p className="leading-relaxed text-slate-500">기본 위치를 바꿔도 이미 다운로드한 파일은 이동하지 않습니다.</p>}</div>}
      </ViewportDialog>}
    </div>
  </WindowFrame>;
};
export { EdgeIcon };
export default EdgeWindow;
