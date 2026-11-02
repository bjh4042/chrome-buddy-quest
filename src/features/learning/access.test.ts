import { describe, expect, it } from 'vitest';
import { QUESTS, type Quest } from '@/types/quest';
import { canAccessQuest, computeStoryUnlockedCategories } from './access';
const quests=():Quest[]=>QUESTS.map(q=>({...q,completed:false,starsEarned:0}));

describe('learning access', () => {
  it('does not unlock later categories by completing a predecessor out of order in free practice', () => {
    const data=quests();
    data.forEach(q=>{if(q.category==='windows')q.completed=true;});
    expect(computeStoryUnlockedCategories(data)).toEqual(['mouse']);
  });
  it('only unlocks the next contiguous category', () => {
    const data=quests();data.forEach(q=>{if(q.category==='mouse')q.completed=true;});
    expect(computeStoryUnlockedCategories(data)).toEqual(['mouse','windows']);
  });
  it('permits completed replays but prevents jumping to a future story task', () => {
    const data=quests();data[0].completed=true;
    expect(canAccessQuest(data[0],0,'story',data,null,1)).toBe(true);
    expect(canAccessQuest(data[1],1,'story',data,null,1)).toBe(true);
    expect(canAccessQuest(data[2],2,'story',data,null,1)).toBe(false);
  });
  it('free practice opens everything and teacher mode stays within the chosen category', () => {
    const data=quests();const excel=data.findIndex(q=>q.category==='excel');
    expect(canAccessQuest(data[excel],excel,'free-practice',data,null,0)).toBe(true);
    expect(canAccessQuest(data[excel],excel,'teacher',data,'excel',0)).toBe(true);
    expect(canAccessQuest(data[0],0,'teacher',data,'excel',0)).toBe(false);
  });
});
