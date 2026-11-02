import { describe, expect, it } from 'vitest';
import { parseProgress } from './progress';
import { QUESTS } from '@/types/quest';
const saved = (patch:Record<string,unknown>) => JSON.stringify({version:2, questsState:[],currentQuest:0,...patch});

describe('saved learning progress', () => {
  it('recovers malformed, missing and unsupported versions safely', () => {
    expect(parseProgress(null)).toBe(null);
    expect(parseProgress('{broken')).toBe(null);
    expect(parseProgress(saved({version:999}))).toBe(null);
    expect(parseProgress(saved({currentQuest:'not a number'}))?.currentQuest).toBe(0);
  });
  it('ignores stale pointer and resumes at the first unfinished mission', () => {
    const result=parseProgress(saved({currentQuest:35,questsState:[{id:QUESTS[0].id,completed:true,starsEarned:3}]}));
    expect(result.currentQuest).toBe(1);
    expect(result.screen).toBe('start');
  });
  it('does not show a completion screen if progress is incomplete', () => {
    expect(parseProgress(saved({screen:'complete'}))?.screen).toBe('start');
  });
  it('rejects unknown records, deduplicates records, and never awards stars to an incomplete task', () => {
    const result=parseProgress(saved({questsState:[{id:QUESTS[0].id,completed:true,starsEarned:4},{id:QUESTS[0].id,completed:false,starsEarned:3},{id:'unknown',completed:true,starsEarned:3}]}));
    expect(result.questsState).toEqual([{id:QUESTS[0].id,completed:false,starsEarned:0}]);
  });
  it('retains valid teacher/free practice and completed state', () => {
    const result=parseProgress(saved({screen:'complete',learningMode:'teacher',teacherCategory:'excel',practiceQuestId:'excel-input',questsState:QUESTS.map(q=>({id:q.id,completed:true,starsEarned:3}))}));
    expect(result.screen).toBe('complete');
    expect(result.learningMode).toBe('teacher');
    expect(result.teacherCategory).toBe('excel');
    expect(result.practiceQuestId).toBe('excel-input');
    expect(result.currentQuest).toBe(QUESTS.length-1);
  });
});
