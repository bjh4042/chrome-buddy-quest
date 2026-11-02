import {beforeEach,describe,it,expect,vi} from "vitest";
import {render,screen,fireEvent,cleanup,waitFor,within} from "@testing-library/react";
import HangulWindow from "./HangulWindow";
vi.mock("./WindowFrame",()=>({default:({toolbar,children}:{toolbar:React.ReactNode;children:React.ReactNode})=><div>{toolbar}{children}</div>}));
beforeEach(()=>{cleanup();localStorage.clear();sessionStorage.clear();window.getSelection()?.removeAllRanges();});
function selectText(element:HTMLElement,start:number,end:number){const r=document.createRange();r.setStart(element.firstChild!,start);r.setEnd(element.firstChild!,end);window.getSelection()?.removeAllRanges();window.getSelection()?.addRange(r);fireEvent.pointerUp(element);}
describe("Hangul concrete practice actions",()=>{
  it("does not pass formatting just by changing a font-size control without text selection",async()=>{
    const done=vi.fn();render(<HangulWindow onClose={()=>{}} currentQuestType="hangul-font-size" onQuestComplete={done}/>);
    await screen.findByText("안녕하세요");fireEvent.change(screen.getByLabelText("한글 글자 크기"),{target:{value:"20"}});
    expect(done).not.toHaveBeenCalled();expect(screen.getByRole("status")).toHaveTextContent("먼저 바꿀 글자");
  });
  it("formats exactly selected characters and leaves the surrounding text unchanged",async()=>{
    const done=vi.fn();render(<HangulWindow onClose={()=>{}} currentQuestType="hangul-font-size" onQuestComplete={done}/>);
    const editor=screen.getByRole("textbox",{name:"한글 문서 본문"});await waitFor(()=>expect(editor.textContent).toBe("안녕하세요"));
    selectText(editor,1,3);fireEvent.change(screen.getByLabelText("한글 글자 크기"),{target:{value:"20"}});
    expect(editor.childNodes[0].textContent).toBe("안");expect(editor.querySelector("span")?.textContent).toBe("녕하");
    expect(editor.querySelector("span")?.style.fontSize).toBe("20pt");expect(editor.lastChild?.textContent).toBe("세요");expect(done).toHaveBeenCalledOnce();
  });
  it("requires a successful named save and restores the saved rich document",async()=>{
    const done=vi.fn();render(<HangulWindow onClose={()=>{}} currentQuestType="hangul-save" onQuestComplete={done}/>);
    const editor=screen.getByRole("textbox",{name:"한글 문서 본문"});editor.textContent="우리 반 발표회 초대장";fireEvent.input(editor);
    fireEvent.click(screen.getByRole("button",{name:"저장"}));expect(done).not.toHaveBeenCalled();
    const dialog=screen.getByRole("dialog",{name:"문서 저장"});fireEvent.change(screen.getByLabelText("파일 이름"),{target:{value:"3학년 초대장"}});fireEvent.submit(dialog.querySelector("form")!);
    expect(done).toHaveBeenCalledOnce();expect(JSON.parse(localStorage.getItem("win-explorer-hangul-files-v3")!)[0]).toMatchObject({name:"3학년 초대장",document:{html:"우리 반 발표회 초대장"}});
    editor.textContent="지워도 저장본은 보존";fireEvent.input(editor);fireEvent.click(screen.getByRole("button",{name:"불러오기"}));fireEvent.click(screen.getByRole("button",{name:/3학년 초대장/}));
    expect(editor.textContent).toBe("우리 반 발표회 초대장");
  });
  it("does not complete copy for an empty selection",()=>{
    const done=vi.fn();render(<HangulWindow onClose={()=>{}} currentQuestType="shortcut-copy" onQuestComplete={done}/>);
    const editor=screen.getByRole("textbox",{name:"한글 문서 본문"});editor.focus();fireEvent.keyDown(editor,{key:"c",ctrlKey:true});expect(done).not.toHaveBeenCalled();
  });
  it("does not pass save if browser storage rejects the write",()=>{
    const done=vi.fn();render(<HangulWindow onClose={()=>{}} currentQuestType="hangul-save" onQuestComplete={done}/>);
    const editor=screen.getByRole("textbox",{name:"한글 문서 본문"});editor.textContent="저장 실패를 확인할 문서";fireEvent.input(editor);
    fireEvent.click(screen.getByRole("button",{name:"저장"}));const spy=vi.spyOn(Storage.prototype,"setItem").mockImplementation(()=>{throw new Error("quota");});
    fireEvent.submit(screen.getByRole("dialog",{name:"문서 저장"}).querySelector("form")!);expect(done).not.toHaveBeenCalled();expect(screen.getByRole("status")).toHaveTextContent("저장 공간이 부족");spy.mockRestore();
  });
  it("submits the named-save body from the pinned portal footer",()=>{
    const done=vi.fn();render(<HangulWindow onClose={()=>{}} currentQuestType="hangul-save" onQuestComplete={done}/>);
    const editor=screen.getByRole("textbox",{name:"한글 문서 본문"});editor.textContent="좁은 화면에서도 저장할 초대장";fireEvent.input(editor);
    fireEvent.click(screen.getByRole("button",{name:"저장"}));const dialog=screen.getByRole("dialog",{name:"문서 저장"});
    expect(dialog.closest('[data-viewport-dialog="true"]')?.parentElement).toBe(document.body);
    const button=within(dialog).getByRole("button",{name:"저장"});expect(button.closest('[data-dialog-body="true"]')).toBeNull();
    expect(button).toHaveAttribute("form","hangul-save-form");fireEvent.change(within(dialog).getByLabelText("파일 이름"),{target:{value:"긴 파일 이름으로 저장한 우리 반 초대장"}});
    fireEvent.click(button);expect(done).toHaveBeenCalledOnce();expect(screen.queryByRole("dialog",{name:"문서 저장"})).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("win-explorer-hangul-files-v3")!)[0].name).toBe("긴 파일 이름으로 저장한 우리 반 초대장");
  });
  it("keeps the document selection when an emoji is chosen from the viewport dialog",()=>{
    render(<HangulWindow onClose={()=>{}} currentQuestType="shortcut-emoji" onQuestComplete={()=>{}}/>);
    const editor=screen.getByRole("textbox",{name:"한글 문서 본문"});editor.textContent="안녕 친구";fireEvent.input(editor);editor.focus();selectText(editor,3,5);
    fireEvent.keyDown(editor,{key:".",ctrlKey:true});const dialog=screen.getByRole("dialog",{name:"이모지 선택"});fireEvent.click(within(dialog).getByRole("button",{name:"😀"}));
    expect(editor.textContent).toBe("안녕 😀");expect(screen.queryByRole("dialog",{name:"이모지 선택"})).not.toBeInTheDocument();
  });
});
