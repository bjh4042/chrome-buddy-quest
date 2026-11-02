import { describe, expect, it } from 'vitest';
import { QUESTS } from '@/types/quest';
import { APP_FOR_QUEST, type LearningEvent } from './questEvents';
import { isTrustedPracticeSite, validateEvent } from './questValidators';
import { parseProgress } from '@/features/progress/progress';

const ids=['edge-favorite-add','edge-favorite-open','edge-download-file','edge-download-reveal','edge-download-move','edge-download-location','edge-find-text','edge-restore-tab'] as const;
describe('Edge practical mission evidence',()=>{
  it('places all eight practical tasks after address entry and before closing Edge',()=>{
    const start=QUESTS.findIndex(q=>q.id==='type-url');
    expect(QUESTS.slice(start+1,start+9).map(q=>q.id)).toEqual(ids);
    expect(QUESTS[start+9].id).toBe('close-edge');
    for(const id of ids){expect(QUESTS.find(q=>q.id===id).category).toBe('internet');expect(APP_FOR_QUEST[id]).toBe(id==='edge-download-move'?'mypc':'edge');}
  });
  it.each(['https://school.example/','https://www.naver.com/','https://learn.microsoft.com/','https://www.bing.com/'])('accepts a represented HTTPS practice site %s',url=>{
    expect(isTrustedPracticeSite(url)).toBe(true);
  });
  it.each(['edge://newtab','http://school.example/','https://school.example.evil.test/','https://evil.test/?url=school.example','https://school.example@evil.test/','https://user:pass@school.example/','javascript:alert(1)','https://www.bing.com/search?q=안전'])('does not award site-action missions for unsafe or non-site addresses %s',url=>{
    expect(isTrustedPracticeSite(url)).toBe(false);
    expect(validateEvent('edge-favorite-add',{type:'FAVORITE_ADDED',url,name:'우리 학교',folder:'즐겨찾기 모음'})).toBe('wrong');
    expect(validateEvent('edge-download-file',{type:'DOWNLOAD_COMPLETED',fileId:'download-1',name:'안내.txt',folderId:'downloads',sourceUrl:url})).toBe('wrong');
    expect(validateEvent('edge-restore-tab',{type:'BROWSER_TAB_RESTORED',url})).toBe('wrong');
  });
  const actions:[typeof ids[number],LearningEvent][]=[
    ['edge-favorite-add',{type:'FAVORITE_ADDED',url:'https://school.example/',name:'우리 학교',folder:'즐겨찾기 모음'}],
    ['edge-favorite-open',{type:'FAVORITE_OPENED',url:'https://school.example/'}],
    ['edge-download-file',{type:'DOWNLOAD_COMPLETED',fileId:'download-1',name:'안내.txt',folderId:'downloads',sourceUrl:'https://school.example/'}],
    ['edge-download-reveal',{type:'DOWNLOAD_FOLDER_OPENED',fileId:'download-1',folderId:'downloads'}],
    ['edge-download-move',{type:'DOWNLOAD_MOVED',fileId:'download-1',from:'downloads',to:'documents'}],
    ['edge-download-location',{type:'DOWNLOAD_LOCATION_CHANGED',folderId:'documents'}],
    ['edge-find-text',{type:'BROWSER_TEXT_FOUND',query:'안전',matches:2}],
    ['edge-restore-tab',{type:'BROWSER_TAB_RESTORED',url:'https://school.example/'}],
  ];
  it.each(actions)('awards %s only from its own completed action',(id,event)=>{
    expect(validateEvent(id,event)).toBe('pass');
    for(const other of ids.filter(q=>q!==id))expect(validateEvent(other,event)).toBe('ignore');
  });
  it('requires a real favorite name and folder as well as a valid URL',()=>{
    expect(validateEvent('edge-favorite-add',{type:'FAVORITE_ADDED',url:'https://school.example/',name:' ',folder:'모음'})).toBe('wrong');
    expect(validateEvent('edge-favorite-add',{type:'FAVORITE_ADDED',url:'https://school.example/',name:'학교',folder:''})).toBe('wrong');
  });
  it('requires a download file identity, name and destination folder',()=>{
    const event={type:'DOWNLOAD_COMPLETED',fileId:'download-1',name:'안내.txt',folderId:'downloads',sourceUrl:'https://school.example/'} as const;
    for(const key of ['fileId','name','folderId'] as const)expect(validateEvent('edge-download-file',{...event,[key]:' '})).toBe('wrong');
    expect(validateEvent('edge-download-reveal',{type:'DOWNLOAD_FOLDER_OPENED',fileId:'',folderId:'downloads'})).toBe('ignore');
    expect(validateEvent('edge-download-reveal',{type:'DOWNLOAD_FOLDER_OPENED',fileId:'download-1',folderId:''})).toBe('ignore');
  });
  it('does not count a copy to the same folder or an unidentified file as a download move',()=>{
    expect(validateEvent('edge-download-move',{type:'DOWNLOAD_MOVED',fileId:'download-1',from:'downloads',to:'downloads'})).toBe('ignore');
    expect(validateEvent('edge-download-move',{type:'DOWNLOAD_MOVED',fileId:'download-1',from:'downloads',to:' downloads '})).toBe('ignore');
    expect(validateEvent('edge-download-move',{type:'DOWNLOAD_MOVED',fileId:'',from:'downloads',to:'documents'})).toBe('ignore');
  });
  it('requires a new non-default folder for the download-location task',()=>{
    for(const folderId of ['',' ','downloads',' downloads '])expect(validateEvent('edge-download-location',{type:'DOWNLOAD_LOCATION_CHANGED',folderId})).toBe('ignore');
  });
  it('requires finding the instructed word with a finite positive match count',()=>{
    for(const matches of [0,-1,NaN,Infinity])expect(validateEvent('edge-find-text',{type:'BROWSER_TEXT_FOUND',query:'안전',matches})).toBe('ignore');
    expect(validateEvent('edge-find-text',{type:'BROWSER_TEXT_FOUND',query:'다른 말',matches:5})).toBe('ignore');
  });
  it('preserves old completed missions and resumes the first added Edge task after an upgrade',()=>{
    const previousQuests=QUESTS.filter(q=>!ids.some(id=>id===q.id));
    const recovered=parseProgress(JSON.stringify({version:2,screen:'complete',currentQuest:QUESTS.length-1,questsState:previousQuests.map(q=>({id:q.id,completed:true,starsEarned:3}))}));
    expect(recovered.screen).toBe('start');expect(QUESTS[recovered.currentQuest].id).toBe(ids[0]);
    expect(recovered.questsState).toHaveLength(previousQuests.length);expect(recovered.questsState.every(q=>q.completed&&q.starsEarned===3)).toBe(true);
  });
});
