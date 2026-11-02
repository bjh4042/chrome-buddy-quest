import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EDGE_STORAGE_KEY, fileFolderPath, loadEdgeData, persistEdgeData, synchronizeDownloads, validFolder } from './edgeStorage';
import { FILES_KEY, downloadPracticeFile, loadPracticeFiles } from './browserPractice';

beforeEach(() => {
  localStorage.clear(); vi.restoreAllMocks();
  Object.defineProperty(URL, 'createObjectURL', { configurable: true, writable: true, value: vi.fn(() => 'blob:practice-download') });
  Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, writable: true, value: vi.fn() });
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
});

describe('persistent Edge practice data', () => {
  it('migrates old URL favorites to named objects and drops spoofed/invalid URLs', () => {
    localStorage.setItem(EDGE_STORAGE_KEY, JSON.stringify(['https://www.naver.com/', 'https://naver.com.evil.example', 'javascript:alert(1)']));
    const data = loadEdgeData();
    expect(data.favorites).toHaveLength(1);
    expect(data.favorites[0]).toMatchObject({ name: 'www.naver.com', url: 'https://www.naver.com/', folder: '즐겨찾기 모음' });
    persistEdgeData(data);
    expect(JSON.parse(localStorage.getItem(EDGE_STORAGE_KEY)!).version).toBe(2);
    expect(loadEdgeData().favorites).toEqual(data.favorites);
  });
  it('looks up custom nested folders and rejects cycles/missing parents', () => {
    const files = loadPracticeFiles();
    files.push({ id: 'class', name: '수박반', kind: 'folder', parent: 'documents', modified: 1 });
    expect(fileFolderPath(files, 'class')).toBe('내 PC / 문서 / 수박반');
    expect(validFolder(files, 'class')).toBe(true);
    files.push({ id: 'loop', name: '잘못된 경로', kind: 'folder', parent: 'loop', modified: 1 });
    expect(validFolder(files, 'loop')).toBe(false);
    expect(validFolder(files, 'missing')).toBe(false);
  });
  it('stores downloaded source metadata and synchronizes renamed/moved files by stable ID', () => {
    const file = downloadPracticeFile('안내.txt', '안전한 인터넷', { folderId: 'downloads', sourceUrl: 'https://school.example/' });
    const original = synchronizeDownloads({}, loadPracticeFiles());
    const moved = loadPracticeFiles().map(item => item.id === file.id ? { ...item, name: '인터넷 안전.txt', parent: 'documents' } : item);
    const records = synchronizeDownloads(original, moved);
    expect(records[file.id]).toMatchObject({ fileId: file.id, name: '인터넷 안전.txt', folderId: 'documents', originalFolderId: 'downloads', sourceUrl: 'https://school.example/' });
    expect(file.id.startsWith('download-')).toBe(true);
    expect(loadPracticeFiles().find(item => item.id === file.id)).toMatchObject({ downloaded: true, sourceUrl: 'https://school.example/' });
  });
  it('chooses unique file names and respects the requested existing folder', () => {
    downloadPracticeFile('안내.txt', '첫째', { folderId: 'documents', sourceUrl: 'https://school.example/' });
    const second = downloadPracticeFile('안내.txt', '둘째', { folderId: 'documents', sourceUrl: 'https://school.example/' });
    expect(second.name).toBe('안내 (1).txt'); expect(second.parent).toBe('documents');
    expect(() => downloadPracticeFile('안내.txt', '셋째', { folderId: 'missing' })).toThrow('폴더');
  });
  it('does not request a native file or announce success if shared file storage fails', () => {
    const downloaded = vi.fn(); window.addEventListener('win-explorer-download', downloaded);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
    expect(() => downloadPracticeFile('안내.txt', '내용', { sourceUrl: 'https://school.example/' })).toThrow('저장');
    expect(HTMLAnchorElement.prototype.click).not.toHaveBeenCalled(); expect(downloaded).not.toHaveBeenCalled();
    window.removeEventListener('win-explorer-download', downloaded);
  });
});
