import { Keychain, Storage } from 'scripting'
export type Kind = 'ai' | 'server'
export type Row = { name: string, value: number | null, detail: string, unlimited?: boolean }
const num = (x: any): number | null => typeof x === 'number' && Number.isFinite(x) ? x : null
const pct = (x: any) => { const n = num(x); return n === null ? null : Math.max(0, Math.min(100, n)) }
const reset = (x: any) => { const n = num(x); if (!n) return ''; const d = n - Date.now()/1000; return d <= 0 ? '即将重置' : d < 3600 ? Math.ceil(d/60)+'分后' : d < 172800 ? Math.ceil(d/3600)+'时后' : Math.ceil(d/86400)+'天后' }
export function rows(kind: Kind, data: any): Row[] {
 const cards: any = {}; for (const c of data?.cards || []) if (c && typeof c.id === 'string') cards[c.id] = c
 if (kind === 'server') return [['relay1','中转 1'],['relay2','中转 2'],['exit1','落地'],['exit2','落地 H'],['webshare','Webshare']].map(([id,name]) => { const c = cards[id] || {}; const g = num(c.remain_gb); return {name, value:pct(c.pct), detail:g === null ? '' : `${g.toFixed(1)} GB`} })
 const c = cards.codex?.ok ? cards.codex : {}, m = cards.muse?.ok ? cards.muse : {}, x = cards.minimax?.ok ? cards.minimax : {}, a = cards.antigravity?.ok ? cards.antigravity : {}
 const cf=c.five_hour||{}, cw=c.weekly||{}, mw=m.weekly||{}, me=m.extra||{}, xf=x.five_hour||{}, xw=x.weekly||{}, af=a.gemini?.five_hour||a.five_hour||{}, aw=a.gemini?.weekly||a.weekly||{}, ag=a.claude_gpt?.weekly||{}
 return [
  {name:'Codex 5小时',value:pct(cf.remaining_pct ?? c.main_pct),detail:reset(cf.reset_at || c.main_reset_at)},
  {name:'Codex 每周',value:pct(cw.remaining_pct),detail:reset(cw.reset_at)},
  {name:'Muse 每周',value:pct(mw.remaining_pct ?? m.main_pct),detail:reset(mw.reset_at || m.main_reset_at)},
  {name:'Muse 额外',value:pct(me.remaining_pct),detail:me.tokens_left_text || ''},
  {name:'MiniMax 5小时',value:pct(xf.remaining_pct ?? x.main_pct),detail:reset(xf.reset_at || x.main_reset_at)},
  {name:'MiniMax 每周',value:pct(xw.remaining_pct),detail:reset(xw.reset_at),unlimited:xw.unlimited === true},
  {name:'反重力 5小时',value:pct(af.remaining_pct ?? a.main_pct),detail:reset(af.reset_at)},
  {name:'反重力 每周',value:pct(aw.remaining_pct),detail:reset(aw.reset_at)},
  {name:'反重力 C/G周',value:pct(ag.remaining_pct),detail:reset(ag.reset_at)}
 ]
}
export async function load(kind: Kind) {
 const key='quota.'+kind; const cached:any=Storage.get(key+'.cache');
 try {
  const url=Storage.get<string>(key+'.url'); if (!url || !/^https:\/\//i.test(url)) throw Error('config')
  const token=Keychain.get(key+'.token'); const headers: Record<string,string> = {'Cache-Control':'no-cache'}; if(token) headers.Authorization='Bearer '+token
  const response=await fetch(url,{headers,timeout:10,handleRedirect:async()=>null}); if(!response.ok) throw Error('http')
  const data=await response.json(); if(!data || !Array.isArray(data.cards)) throw Error('schema')
  const saved={data, at:Date.now()}; Storage.set(key+'.cache',saved); return {...saved,failed:false}
 } catch (_) { return {data:cached?.data || {cards:[]},at:cached?.at || 0,failed:true} }
}
