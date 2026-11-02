import { describe, expect, it } from 'vitest';
import { isNaverAddress, validateEvent, QUEST_VALIDATORS } from './questValidators';
import { QUESTS } from '@/types/quest';

describe('learning evidence', () => {
  it('has a validator for every existing mission', () => {
    for (const quest of QUESTS) expect(QUEST_VALIDATORS[quest.type], quest.id).toBeTypeOf('function');
  });
  it.each(['naver.com','www.naver.com','https://www.naver.com/search?q=school','http://naver.com'])('accepts the target hostname %s', url => {
    expect(isNaverAddress(url)).toBe(true);
  });
  it.each(['naver.com.evil.test','evil.test/?url=naver.com','https://naver.com@evil.test','https://evil.test/naver.com','https://user:pass@naver.com','javascript:naver.com','naverXcom'])('rejects misleading addresses %s', url => {
    expect(isNaverAddress(url)).toBe(false);
    expect(validateEvent('type-url',{type:'BROWSER_NAVIGATED',url})).toBe('wrong');
  });
  it('does not complete Hangul shortcuts from another app or without context', () => {
    expect(validateEvent('shortcut-copy',{type:'SHORTCUT_PRESSED',shortcut:'copy',context:'ppt'})).toBe('wrong');
    expect(validateEvent('shortcut-copy',{type:'SHORTCUT_PRESSED',shortcut:'copy'})).toBe('wrong');
    expect(validateEvent('shortcut-copy',{type:'SHORTCUT_PRESSED',shortcut:'copy',context:'hangul'})).toBe('pass');
  });
  it('requires the instructed title and selection-based formatting', () => {
    expect(validateEvent('ppt-text',{type:'TEXT_TYPED',app:'ppt',value:'다른 제목'})).toBe('ignore');
    expect(validateEvent('ppt-text',{type:'TEXT_TYPED',app:'ppt',value:'나의 발표'})).toBe('pass');
    expect(validateEvent('ppt-font-size',{type:'TEXT_FORMAT_CHANGED',app:'ppt',property:'font-size',value:'28',withSelection:false})).toBe('ignore');
    expect(validateEvent('ppt-font-size',{type:'TEXT_FORMAT_CHANGED',app:'ppt',property:'font-size',value:'28',withSelection:true})).toBe('pass');
  });
  it('requires a confirmed value in A1, not an uncommitted edit or another cell', () => {
    expect(validateEvent('excel-input',{type:'CELL_VALUE_ENTERED',app:'excel',cell:'A1',value:'100',confirmed:false})).toBe('ignore');
    expect(validateEvent('excel-input',{type:'CELL_VALUE_ENTERED',app:'excel',cell:'A2',value:'100',confirmed:true})).toBe('ignore');
    expect(validateEvent('excel-input',{type:'CELL_VALUE_ENTERED',app:'excel',cell:'A1',value:'100',confirmed:true})).toBe('pass');
  });
  it('requires evidence of an actual drag destination and the correct window', () => {
    expect(validateEvent('drag-drop',{type:'FILE_MOVED'})).toBe('ignore');
    expect(validateEvent('drag-drop',{type:'FILE_MOVED',name:'보고서.txt',targetFolder:'문서'})).toBe('pass');
    expect(validateEvent('window-move-resize',{type:'WINDOW_MOVED',app:'ppt'})).toBe('ignore');
    expect(validateEvent('window-move-resize',{type:'WINDOW_MOVED',app:'mypc'})).toBe('pass');
  });
  it('does not accept almost-50 volume or incorrect Wi-Fi credentials', () => {
    expect(validateEvent('volume-control',{type:'VOLUME_CHANGED',value:49})).toBe('ignore');
    expect(validateEvent('volume-control',{type:'VOLUME_CHANGED',value:50})).toBe('pass');
    expect(validateEvent('wifi-connect',{type:'WIFI_CONNECTED',ssid:'우리집 WiFi',password:'wrong'})).toBe('wrong');
    expect(validateEvent('wifi-connect',{type:'WIFI_CONNECTED',ssid:'우리집 WiFi',password:'12345678'})).toBe('pass');
  });
});
