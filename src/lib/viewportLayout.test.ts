import { describe, expect, it } from 'vitest';
import { placeFloatingMenu, type FloatingViewport } from './viewportLayout';

function expectBounded(result:ReturnType<typeof placeFloatingMenu>,viewport:FloatingViewport,desiredHeight:number){
  expect(result.left).toBeGreaterThanOrEqual(viewport.left);expect(result.top).toBeGreaterThanOrEqual(viewport.top);
  expect(result.width).toBeGreaterThan(0);expect(result.maxHeight).toBeGreaterThanOrEqual(0);
  expect(result.left+result.width).toBeLessThanOrEqual(viewport.left+viewport.width);
  expect(result.top+Math.min(desiredHeight,result.maxHeight)).toBeLessThanOrEqual(viewport.top+viewport.height);
  expect(result.maxHeight).toBeLessThanOrEqual(viewport.top+viewport.height-result.top);
}
describe('floating toolbar menu placement',()=>{
  it.each([[1024,600],[800,600],[640,480],[360,640],[568,320],[320,360]])('keeps an oversized menu within a %i × %i visible viewport',(width,height)=>{
    const viewport={left:0,top:0,width,height};
    const result=placeFloatingMenu({left:width-70,right:width-10,top:height-50,bottom:height-20},viewport,1200,1000);
    expectBounded(result,viewport,1000);
  });
  it('places the menu above a low anchor and limits its maximum height to the returned position',()=>{
    const viewport={left:0,top:0,width:800,height:600},anchor={left:300,right:400,top:550,bottom:575};
    const result=placeFloatingMenu(anchor,viewport,180,100);
    expect(result.top).toBeLessThan(anchor.top);expect(result.top+100).toBeLessThanOrEqual(anchor.top);
    expectBounded(result,viewport,100);
  });
  it('allows less than 120px when that is the actual available room',()=>{
    const viewport={left:0,top:0,width:320,height:100};
    const result=placeFloatingMenu({left:100,right:160,top:48,bottom:56},viewport,200,400);
    expect(result.maxHeight).toBeGreaterThan(0);expect(result.maxHeight).toBeLessThan(120);
    expectBounded(result,viewport,400);
  });
  it('honors keyboard-scrolled viewport offsets even when the anchor is outside the visible area',()=>{
    const viewport={left:10,top:240,width:350,height:210};
    for(const anchor of [{left:0,right:70,top:50,bottom:80},{left:600,right:660,top:600,bottom:630}]){
      expectBounded(placeFloatingMenu(anchor,viewport,500,500),viewport,500);
    }
  });
});
