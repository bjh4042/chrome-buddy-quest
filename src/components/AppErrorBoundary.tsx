import { Component, type ReactNode } from 'react';
export default class AppErrorBoundary extends Component<{children:ReactNode},{error:boolean}>{
  state={error:false};static getDerivedStateFromError(){return {error:true};}
  render(){return this.state.error?<main className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 bg-slate-50 text-center"><h1 className="text-2xl">탐험 화면을 다시 불러와 주세요</h1><p>저장된 학습 기록은 유지됩니다. 아래 버튼으로 다시 시작할 수 있어요.</p><button className="rounded-lg bg-blue-600 text-white px-6 py-3" onClick={()=>location.reload()}>화면 새로 고침</button><details className="max-w-xl text-sm"><summary>계속 열리지 않을 때</summary><p>다른 브라우저에서 열거나 선생님께 알려 주세요. 개인정보 보호 모드에서는 저장 공간이 제한될 수 있습니다.</p></details></main>:this.props.children;}
}
