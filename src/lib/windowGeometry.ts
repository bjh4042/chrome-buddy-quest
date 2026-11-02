export type WindowBox={x:number;y:number;w:number;h:number};
export function fitWindowBox(box:WindowBox,parentWidth:number,parentHeight:number):WindowBox {
  if(parentWidth<=0||parentHeight<=0)return box;
  const w=Math.max(1,Math.min(box.w,Math.max(1,parentWidth-16)));
  const h=Math.max(1,Math.min(box.h,Math.max(1,parentHeight-16)));
  return {w,h,x:Math.max(0,Math.min(box.x,parentWidth-w)),y:Math.max(0,Math.min(box.y,parentHeight-h))};
}
export function resizeWindowBox(box:WindowBox,dx:number,dy:number,parentWidth:number,parentHeight:number):WindowBox {
  const availableW=Math.max(1,parentWidth-box.x),availableH=Math.max(1,parentHeight-box.y);
  return {...box,w:Math.min(availableW,Math.max(Math.min(240,availableW),box.w+dx)),h:Math.min(availableH,Math.max(Math.min(160,availableH),box.h+dy))};
}
