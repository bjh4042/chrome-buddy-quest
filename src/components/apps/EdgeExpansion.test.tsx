import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import EdgeWindow from './EdgeWindow';
import { EDGE_STORAGE_KEY, loadEdgeData } from '@/lib/edgeStorage';
import { loadPracticeFiles } from '@/lib/browserPractice';
vi.mock('./WindowFrame', () => ({ default: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
beforeEach(() => {
  cleanup(); localStorage.clear(); vi.restoreAllMocks();
  Object.defineProperty(URL, 'createObjectURL', { configurable: true, writable: true, value: vi.fn(() => 'blob:edge-handout') });
  Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, writable: true, value: vi.fn() });
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
});
function visitSchool() { const address = screen.getByLabelText('검색 또는 웹 주소 입력'); fireEvent.change(address, { target: { value: 'https://school.example/' } }); fireEvent.submit(address.closest('form')!); }
function menu() { fireEvent.click(screen.getByRole('button', { name: '설정 및 기타' })); }

describe('expanded Edge learning flow', () => {
  it('saves a named favorite in its folder, reopens it and persists edits/removal', () => {
    const done = vi.fn(); const { rerender } = render(<EdgeWindow onClose={() => {}} currentQuestType="edge-favorite-add" onQuestComplete={done} />);
    visitSchool(); fireEvent.click(screen.getByLabelText('즐겨찾기 추가 또는 제거'));
    fireEvent.change(screen.getByLabelText('즐겨찾기 이름'), { target: { value: '우리 반 안전 수업' } });
    fireEvent.change(screen.getByLabelText('즐겨찾기 폴더'), { target: { value: '기타 즐겨찾기' } });
    fireEvent.click(screen.getByRole('button', { name: '완료' }));
    expect(done).toHaveBeenCalledOnce(); expect(loadEdgeData().favorites[0]).toMatchObject({ name: '우리 반 안전 수업', folder: '기타 즐겨찾기' });
    rerender(<EdgeWindow onClose={() => {}} currentQuestType="edge-favorite-open" onQuestComplete={done} />);
    fireEvent.click(screen.getByLabelText('우리 반 안전 수업 즐겨찾기 열기'));
    expect(done).toHaveBeenCalledTimes(2); expect(loadEdgeData().favorites[0].openedAt).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: '즐겨찾기' })); fireEvent.click(screen.getByLabelText('우리 반 안전 수업 즐겨찾기 편집'));
    fireEvent.change(screen.getByLabelText('즐겨찾기 이름'), { target: { value: '안전 자료실' } }); fireEvent.click(screen.getByRole('button', { name: '완료' }));
    expect(loadEdgeData().favorites[0].name).toBe('안전 자료실');
    fireEvent.click(screen.getByLabelText('안전 자료실 즐겨찾기 삭제')); expect(loadEdgeData().favorites).toHaveLength(0);
  });
  it('downloads a native TXT plus shared file, requests exact reveal, and changes only future download location', () => {
    const done = vi.fn(), reveal = vi.fn(); window.addEventListener('win-explorer-reveal', reveal);
    const { rerender } = render(<EdgeWindow onClose={() => {}} currentQuestType="edge-download-file" onQuestComplete={done} />);
    visitSchool(); fireEvent.click(screen.getByRole('button', { name: '안전한 인터넷 사용 안내.txt 다운로드' }));
    const file = loadPracticeFiles().find(item => item.downloaded)!;
    expect(file.parent).toBe('downloads'); expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledOnce(); expect(done).toHaveBeenCalledOnce();
    expect(screen.getByRole('dialog', { name: '다운로드' }).querySelector('[data-dialog-footer]')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '폴더에 표시' }));
    expect(reveal).toHaveBeenCalledOnce(); expect((reveal.mock.calls[0][0] as CustomEvent).detail).toEqual({ fileId: file.id });
    expect(localStorage.getItem('win-explorer-reveal-file')).toBe(file.id);
    rerender(<EdgeWindow onClose={() => {}} currentQuestType="edge-download-location" onQuestComplete={done} />);
    menu(); fireEvent.click(screen.getByRole('button', { name: '설정 · 다운로드' })); fireEvent.click(screen.getByRole('button', { name: '저장 위치 변경' }));
    fireEvent.change(screen.getByLabelText('다운로드 저장 폴더'), { target: { value: 'documents' } }); fireEvent.click(screen.getByRole('button', { name: '폴더 선택' }));
    expect(loadEdgeData().settings.downloadFolderId).toBe('documents'); expect(loadPracticeFiles().find(item => item.id === file.id)?.parent).toBe('downloads'); expect(done).toHaveBeenCalledTimes(2);
    fireEvent.click(screen.getByRole('button', { name: '닫기' })); fireEvent.click(screen.getByRole('button', { name: '안전한 인터넷 사용 안내.txt 다운로드' }));
    expect(loadPracticeFiles().filter(item => item.downloaded).some(item => item.parent === 'documents')).toBe(true);
    window.removeEventListener('win-explorer-reveal', reveal);
  });
  it('highlights real page matches, navigates matches, and restores the last closed tab with its URL', () => {
    const done = vi.fn(); const { rerender } = render(<EdgeWindow onClose={() => {}} currentQuestType="edge-find-text" onQuestComplete={done} />);
    visitSchool(); menu(); fireEvent.click(screen.getByRole('button', { name: /페이지에서 찾기/ }));
    fireEvent.change(screen.getByLabelText('페이지에서 찾을 내용'), { target: { value: '안전' } });
    const marks = document.querySelectorAll('mark[data-edge-match]'); expect(marks.length).toBeGreaterThan(1); expect(done).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByLabelText('다음 일치 항목')); expect(document.querySelector('mark[data-edge-match="1"]')).toHaveClass('bg-orange-300');
    fireEvent.click(screen.getByLabelText('찾기 닫기')); fireEvent.click(screen.getByLabelText('1번 탭 닫기'));
    rerender(<EdgeWindow onClose={() => {}} currentQuestType="edge-restore-tab" onQuestComplete={done} />);
    menu(); fireEvent.click(screen.getByRole('button', { name: /닫은 탭 다시 열기/ }));
    expect(screen.getByLabelText('검색 또는 웹 주소 입력')).toHaveValue('https://school.example/'); expect(done).toHaveBeenCalledTimes(2);
  });
  it('does not complete a favorite action when persistent storage is blocked', () => {
    const done = vi.fn(); render(<EdgeWindow onClose={() => {}} currentQuestType="edge-favorite-add" onQuestComplete={done} />); visitSchool();
    fireEvent.click(screen.getByLabelText('즐겨찾기 추가 또는 제거'));
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
    fireEvent.click(screen.getByRole('button', { name: '완료' }));
    expect(done).not.toHaveBeenCalled(); expect(screen.getByRole('alert')).toHaveTextContent('저장하지 못했습니다');
    expect(JSON.parse(localStorage.getItem(EDGE_STORAGE_KEY)!).favorites).toHaveLength(0);
  });
});
