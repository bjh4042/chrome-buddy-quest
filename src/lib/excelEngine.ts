/** A deliberately small spreadsheet engine. Never executes document text as JavaScript. */
export type CellMap = Record<string, string>;
export type CellResult = number | string;
type RangeValue = { range: CellResult[] };
type Value = CellResult | RangeValue;
class FormulaError extends Error {}
const fail = (code: string): never => { throw new FormulaError(code); };
export function colName(index: number): string {
  let value = index + 1, name = '';
  while (value > 0) { name = String.fromCharCode(65 + (value - 1) % 26) + name; value = Math.floor((value - 1) / 26); }
  return name;
}
export function cellPosition(cell: string) {
  const match = /^([A-Z]+)([1-9]\d*)$/.exec(cell.toUpperCase().replace(/\$/g, ''));
  if (!match) return null;
  let col = 0; for (const ch of match[1]) col = col * 26 + ch.charCodeAt(0) - 64;
  return { col: col - 1, row: Number(match[2]) - 1 };
}
export function rangeCells(start: string, end: string): string[] {
  const a = cellPosition(start), b = cellPosition(end);
  if (!a || !b) return [];
  if ((Math.abs(a.col - b.col) + 1) * (Math.abs(a.row - b.row) + 1) > 2000) return [];
  const result: string[] = [];
  for (let r = Math.min(a.row,b.row); r <= Math.max(a.row,b.row); r++) for (let c = Math.min(a.col,b.col); c <= Math.max(a.col,b.col); c++) result.push(`${colName(c)}${r+1}`);
  return result;
}
export function evaluateCell(cells: CellMap, id: string, stack: Set<string> = new Set()): CellResult {
  id = id.toUpperCase().replace(/\$/g, '');
  if (stack.has(id)) return '#CIRC!';
  if (stack.size > 80) return '#CIRC!';
  const raw = cells[id] ?? '';
  if (!raw.startsWith('=')) {
    if (raw.startsWith("'")) return raw.slice(1);
    return raw.trim() !== '' && Number.isFinite(Number(raw)) ? Number(raw) : raw;
  }
  try {
    const path = new Set(stack); path.add(id);
    const formula = raw.slice(1).toUpperCase().replace(/\$/g, '');
    const tokens: string[] = []; let pos = 0;
    while (pos < formula.length) {
      if (/\s/.test(formula[pos])) { pos++; continue; }
      const match = /^(?:\d+(?:\.\d*)?|\.\d+|[A-Z]+[1-9]\d*|[A-Z_]+|[+\-*/^%(),:;])/.exec(formula.slice(pos));
      if (!match) return fail('#VALUE!');
      tokens.push(match[0]); pos += match[0].length;
    }
    let cursor = 0;
    const read = () => tokens[cursor++]; const peek = () => tokens[cursor];
    const number = (v: Value): number => {
      if (typeof v === 'object') return fail('#VALUE!');
      if (typeof v === 'string' && v.startsWith('#')) return fail(v);
      if (v === '') return 0;
      if (typeof v !== 'number') return fail('#VALUE!');
      return v;
    };
    const primary = (): Value => {
      const t = read(); if (t === undefined) return fail('#VALUE!');
      if (t === '(') { const v = expression(); if (read() !== ')') return fail('#VALUE!'); return v; }
      if (/^(\d|\.)/.test(t)) return Number(t);
      if (/^[A-Z]+[1-9]\d*$/.test(t)) {
        if (peek() === ':') { read(); const end = read(); const ids = end ? rangeCells(t,end) : []; if (!ids.length) return fail('#REF!'); return {range:ids.map(ref=>evaluateCell(cells,ref,path))}; }
        return evaluateCell(cells,t,path);
      }
      if (/^[A-Z_]+$/.test(t)) {
        if (!['SUM','AVERAGE','MIN','MAX','COUNT'].includes(t)) return fail('#NAME?');
        if (read() !== '(') return fail('#NAME?');
        const args: CellResult[] = [];
        if (peek() !== ')') { do { const v = expression(); args.push(...(typeof v==='object'?v.range:[v])); if (peek() !== ',' && peek() !== ';') break; read(); } while (cursor<tokens.length); }
        if (read() !== ')') return fail('#VALUE!');
        const error = args.find(v=>typeof v==='string'&&v.startsWith('#')); if (error) return fail(String(error));
        const numbers=args.filter((v):v is number=>typeof v==='number');
        if (t==='COUNT') return numbers.length;
        if (t==='AVERAGE') return numbers.length?numbers.reduce((a,b)=>a+b,0)/numbers.length:fail('#DIV/0!');
        if (!numbers.length) return 0;
        if (t==='MIN') return Math.min(...numbers); if (t==='MAX') return Math.max(...numbers);
        return numbers.reduce((a,b)=>a+b,0);
      }
      return fail('#VALUE!');
    };
    // Excel puts negation before %, then ^, and evaluates equal-precedence operators left-to-right.
    // Source: Microsoft Support, Calculation operators and precedence in Excel.
    const unary=():Value=>peek()==='+'?(read(),number(unary())):peek()==='-'?(read(),-number(unary())):primary();
    const percent=():Value=>{let v=unary();while(peek()==='%'){read();v=number(v)/100;}return v;};
    const power=():Value=>{let v=percent();while(peek()==='^'){read();v=Math.pow(number(v),number(percent()));}return v;};
    const multiply=():Value=>{let v=power();while(peek()==='*'||peek()==='/'){const op=read(),right=number(power());v=op==='*'?number(v)*right:right===0?fail('#DIV/0!'):number(v)/right;}return v;};
    const expression=():Value=>{let v=multiply();while(peek()==='+'||peek()==='-'){const op=read(),right=number(multiply());v=op==='+'?number(v)+right:number(v)-right;}return v;};
    const result=expression(); if(cursor!==tokens.length||typeof result==='object')return fail('#VALUE!');
    if(typeof result==='number'&&!Number.isFinite(result))return fail('#NUM!');
    return typeof result==='number'?Number(result.toPrecision(12)):result;
  } catch (e) { return e instanceof FormulaError ? e.message : '#VALUE!'; }
}
/** CSV export neutralizes formula-looking text, but preserves computed numeric values. */
export function exportCsv(cells: CellMap, maxRows=40, maxCols=24): string {
  const used=Object.keys(cells).filter(k=>cells[k]!=='' ).map(cellPosition).filter((p):p is {row:number;col:number}=>!!p);
  const rowCount=Math.min(maxRows,Math.max(1,...used.map(p=>p.row+1))),colCount=Math.min(maxCols,Math.max(1,...used.map(p=>p.col+1)));
  return '\uFEFF'+Array.from({length:rowCount},(_,r)=>Array.from({length:colCount},(_,c)=>{
    const value=evaluateCell(cells,`${colName(c)}${r+1}`);let text=String(value);
    if(typeof value==='string'&&/^[\t\r ]*[=+@-]/.test(text))text="'"+text;
    return /[",\n\r]/.test(text)?'"'+text.replace(/"/g,'""')+'"':text;
  }).join(',')).join('\r\n');
}
