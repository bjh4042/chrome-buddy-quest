import {describe,it,expect} from 'vitest';
import {parsePracticeAddress,isNaverHost,validFileName,loadPracticeFiles,FILES_KEY} from './browserPractice';
describe('practice browser URL checks',()=>{
 it('accepts actual Naver host and normalizes missing scheme',()=>{expect(parsePracticeAddress('naver.com')).toMatchObject({kind:'site',host:'naver.com'});expect(isNaverHost('www.naver.com')).toBe(true);});
 it('rejects lookalikes, URL credentials and unsafe protocols',()=>{for(const value of ['https://naver.com.evil.example','https://evil.example/naver.com','https://naver.com@evil.example','javascript:alert(1)','data:text/html,hello'])expect(parsePracticeAddress(value).kind).toBe('blocked');});
 it('keeps a search distinct from a visited Naver site',()=>{expect(parsePracticeAddress('naver 사이트 찾기').kind).toBe('search');expect(parsePracticeAddress('http://naver.com').kind).toBe('blocked');});
});
describe('Windows file names',()=>{it('rejects reserved and invalid names',()=>{for(const name of ['','CON','nul.txt','a/b','report?.txt','folder.'])expect(validFileName(name)).toBe(false);expect(validFileName('나의 자료')).toBe(true);});});

describe('saved Explorer data',()=>{it('recovers malformed storage and preserves fixed folders',()=>{localStorage.setItem(FILES_KEY,JSON.stringify([null,{id:'bad',name:{},parent:'root',kind:'file'},{id:'valid',name:'기록.txt',parent:'documents',kind:'file',content:{unexpected:1}},{id:'valid',name:'중복.txt',parent:'documents',kind:'file'},{id:'documents',name:'잘못된 문서',parent:'other',kind:'file'}]));const files=loadPracticeFiles();expect(files.filter(f=>f.id==='valid')).toHaveLength(1);expect(files.find(f=>f.id==='valid')?.content).toBe('');expect(files.find(f=>f.id==='documents')).toMatchObject({kind:'folder',parent:'root',name:'문서'});localStorage.setItem(FILES_KEY,'{broken');expect(loadPracticeFiles().length).toBeGreaterThan(6);localStorage.clear();});});
