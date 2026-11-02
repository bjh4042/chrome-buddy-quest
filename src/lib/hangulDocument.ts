export type HangulDocument={html:string;table:string[][]|null;image:{src:string;x:number;y:number;w:number;h:number}|null;orientation:"portrait"|"landscape";zoom:number};
export const emptyHangulDocument=():HangulDocument=>({html:"",table:null,image:null,orientation:"portrait",zoom:100});
const tags=new Set(["SPAN","DIV","P","BR","B","STRONG","I","EM","U","S","UL","OL","LI"]);
const styles=["font-family","font-size","font-weight","font-style","text-decoration","text-align","color"];
/** Saved/imported rich text is untrusted data: retain text formatting only. */
export function cleanHangulHTML(html:string):string{
  const body=new DOMParser().parseFromString(html.slice(0,200_000),"text/html").body;
  // Reverse traversal preserves sanitized children when replacing ancestors.
  for(const node of Array.from(body.querySelectorAll("*")).reverse()){
    if(["SCRIPT","STYLE","IFRAME","OBJECT","SVG","MATH"].includes(node.tagName)){node.remove();continue;}
    if(!tags.has(node.tagName)){node.replaceWith(...Array.from(node.childNodes));continue;}
    const clean=document.createElement(node.tagName.toLowerCase());
    for(const property of styles){const v=(node as HTMLElement).style.getPropertyValue(property);if(v&&!/url|expression|javascript|[<>]/i.test(v))clean.style.setProperty(property,v);}
    clean.append(...Array.from(node.childNodes));node.replaceWith(clean);
  }
  return body.innerHTML;
}
export function loadHangulDocument(value:unknown):HangulDocument|null{
  if(!value||typeof value!=="object")return null;const v=value as Record<string,unknown>;
  if(typeof v.html!=="string"||v.html.length>200_000)return null;
  const table=Array.isArray(v.table)&&v.table.length<=20&&v.table.every(row=>Array.isArray(row)&&row.length<=20&&row.every(cell=>typeof cell==="string"&&cell.length<=5000))?v.table as string[][]:null;
  const image=v.image as HangulDocument["image"];
  const validImage=image&&typeof image.src==="string"&&image.src.length<1_500_000&&/^data:image\/(png|jpeg|webp|svg\+xml)[;,]/i.test(image.src)&&[image.x,image.y,image.w,image.h].every(n=>typeof n==="number"&&Number.isFinite(n));
  return {html:cleanHangulHTML(v.html),table,image:validImage?{...image,x:Math.max(0,Math.min(600,image.x)),y:Math.max(0,Math.min(600,image.y)),w:Math.max(50,Math.min(600,image.w)),h:Math.max(30,Math.min(600,image.h))}:null,orientation:v.orientation==="landscape"?"landscape":"portrait",zoom:[75,100,125].includes(Number(v.zoom))?Number(v.zoom):100};
}
