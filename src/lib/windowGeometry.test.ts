import { describe, expect, it } from 'vitest';
import { fitWindowBox, resizeWindowBox, type WindowBox } from './windowGeometry';

function expectWithin(box:WindowBox,width:number,height:number){
  expect(box.x).toBeGreaterThanOrEqual(0);expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.w).toBeGreaterThan(0);expect(box.h).toBeGreaterThan(0);
  expect(box.x+box.w).toBeLessThanOrEqual(width);expect(box.y+box.h).toBeLessThanOrEqual(height);
}
describe('responsive window geometry',()=>{
  it.each([[1024,600],[800,600],[640,480],[360,640],[568,320],[320,360]])('keeps a previously dragged window wholly inside a %i × %i parent after shrinking',(width,height)=>{
    const dragged=fitWindowBox({x:1200,y:900,w:760,h:520},1600,1000);
    const shrunk=fitWindowBox(dragged,width,height);
    expectWithin(shrunk,width,height);
    expect(shrunk.w).toBeLessThanOrEqual(dragged.w);expect(shrunk.h).toBeLessThanOrEqual(dragged.h);
    expectWithin(resizeWindowBox(shrunk,10_000,10_000,width,height),width,height);
  });
  it('preserves window state while its parent is hidden instead of permanently reducing its size',()=>{
    const saved={x:240,y:80,w:760,h:520};
    expect(fitWindowBox(saved,0,700)).toBe(saved);expect(fitWindowBox(saved,1000,0)).toBe(saved);
    expect(fitWindowBox(saved,0,0)).toBe(saved);
    expect(fitWindowBox(saved,1000,700)).toEqual(saved);
  });
  it('reduces resize minima to the actual space of tiny parents',()=>{
    for(const [width,height] of [[200,120],[120,80],[40,30],[1,1]]){
      const fitted=fitWindowBox({x:12,y:48,w:760,h:520},width,height);
      const smaller=resizeWindowBox(fitted,-10_000,-10_000,width,height);
      expectWithin(smaller,width,height);
      expect(smaller.w).toBeLessThanOrEqual(240);expect(smaller.h).toBeLessThanOrEqual(160);
      expectWithin(resizeWindowBox(smaller,10_000,10_000,width,height),width,height);
    }
  });
});
