export type FloatingViewport={left:number;top:number;width:number;height:number};
export function placeFloatingMenu(anchor:{left:number;top:number;right:number;bottom:number},viewport:FloatingViewport,desiredWidth:number,desiredHeight:number) {
  const margin=Math.min(8,viewport.width/4,viewport.height/4),gap=4;
  const width=Math.max(1,Math.min(desiredWidth,viewport.width-2*margin));
  const right=viewport.left+viewport.width-margin,bottom=viewport.top+viewport.height-margin;
  const left=Math.max(viewport.left+margin,Math.min(anchor.left,right-width));
  const below=Math.max(0,bottom-Math.max(viewport.top+margin,anchor.bottom+gap));
  const above=Math.max(0,Math.min(bottom,anchor.top-gap)-(viewport.top+margin));
  const goesBelow=below>=Math.min(desiredHeight,160)||below>=above;
  const maxHeight=Math.max(0,Math.min(viewport.height-2*margin,goesBelow?below:above));
  const height=Math.min(desiredHeight,maxHeight);
  const top=Math.max(viewport.top+margin,Math.min(goesBelow?anchor.bottom+gap:anchor.top-gap-height,bottom-height));
  return {left,top,width,maxHeight:Math.min(maxHeight,Math.max(0,bottom-top))};
}
