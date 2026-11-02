import { describe, it, expect } from "vitest";
import {cleanHangulHTML,emptyHangulDocument,loadHangulDocument} from "./hangulDocument";

describe("Hangul practice document",()=>{
  it("preserves formatting of selected text without flattening unselected siblings",()=>{
    const value=cleanHangulHTML('앞 <span style="font-size:20pt;font-weight:bold">선택</span> 뒤');
    const root=document.createElement("div");root.innerHTML=value;
    expect(root.childNodes[0].textContent).toBe("앞 ");
    expect(root.querySelector("span")?.style.fontSize).toBe("20pt");
    expect(root.querySelector("span")?.textContent).toBe("선택");
    expect(root.lastChild?.textContent).toBe(" 뒤");
  });
  it("removes executable imports, event handlers, links and unrelated CSS",()=>{
    const value=cleanHangulHTML('<script>alert(1)</script><img src=x onerror=alert(1)><span onclick="alert(1)" style="font-size:20pt;background-image:url(https://evil.test)">안녕</span><a href="javascript:alert(1)">링크</a>');
    expect(value).not.toMatch(/script|onerror|onclick|href|background|img/i);
    expect(value).toContain("안녕");expect(value).toContain("링크");
  });
  it("keeps nested formatting while sanitizing ancestors",()=>{
    const value=cleanHangulHTML('<div><span style="font-size:20pt"><b onmouseover="bad()">제목</b></span></div>');
    expect(value).toContain("<b>제목</b>");expect(value).not.toContain("onmouseover");
  });
  it("round trips a named-document payload with editable table and image geometry",()=>{
    const original={...emptyHangulDocument(),html:"초대장",table:[["일시","장소"],["금요일","교실"]],image:{src:"data:image/png;base64,AAA",x:40,y:300,w:160,h:110}};
    expect(loadHangulDocument(JSON.parse(JSON.stringify(original)))).toEqual(original);
  });
  it("rejects malformed and oversized documents and unsafe image sources",()=>{
    expect(loadHangulDocument(null)).toBeNull();expect(loadHangulDocument({html:123})).toBeNull();
    expect(loadHangulDocument({html:"a".repeat(200001)})).toBeNull();
    const loaded=loadHangulDocument({...emptyHangulDocument(),image:{src:"javascript:alert(1)",x:0,y:0,w:100,h:100}});
    expect(loaded?.image).toBeNull();
  });
  it("clamps corrupted zoom and image geometry",()=>{
    const loaded=loadHangulDocument({...emptyHangulDocument(),zoom:900,orientation:"oops",image:{src:"data:image/png;base64,AAA",x:-3,y:2000,w:5000,h:-2}});
    expect(loaded?.zoom).toBe(100);expect(loaded?.orientation).toBe("portrait");
    expect(loaded?.image).toMatchObject({x:0,y:600,w:600,h:30});
  });
});
