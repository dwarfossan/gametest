import {statusSnapshot,publishStatus,trackStatus} from './status-events.mjs?v=20261016.49';
// Rule operations replay only up to a decision. No partial damage/resource changes
// escape the draft, and previously answered dice consume the same seeded stream.
const operations=new Map(),contexts=new WeakMap(),feeds=new WeakMap();
export const diceFeed=s=>feeds.get(s);
function publish(s,rows,scope=s.seed){if(rows.length)feeds.set(s,{serial:(feeds.get(s)?.serial||0)+1,scope,rows:structuredClone(rows.slice(-6))});}
export function recordDice(s,row){if(!s.inspirationPrompts||!row.faces.length)return;const ctx=contexts.get(s);if(ctx)ctx.rows.push(row);else publish(s,[row]);}
class Pause extends Error{constructor(offer){super('inspiration decision');this.offer=offer;}}
export const registerOperation=(key,fn)=>operations.set(key,fn);
function commit(s,draft){const units=new Map(s.units.map(u=>[u.id,u]));draft.units=draft.units.map(next=>{const u=units.get(next.id);if(!u)return next;for(const key of Object.keys(u))if(!(key in next))delete u[key];return Object.assign(u,next);});for(const key of Object.keys(s))if(!(key in draft))delete s[key];Object.assign(s,draft);}
export function runOperation(s,c,op,args=[],decisions=[],base=s){
 const execute=operations.get(op);if(!execute)throw Error('未知規則操作：'+op);
 if(contexts.has(s))return execute(s,c,...args);if(!s.inspirationPrompts)return trackStatus(s,()=>execute(s,c,...args));const statusBefore=statusSnapshot(s);
 const snapshot=structuredClone(base),draft=structuredClone(snapshot);const ctx={decisions,cursor:0,rows:[]};contexts.set(draft,ctx);
 try{const result=execute(draft,c,...args);commit(s,draft);publishStatus(s,statusBefore);publish(s,ctx.rows,snapshot.seed);return result;}
 catch(e){if(!(e instanceof Pause))throw e;s.pending={kind:'inspiration',...e.offer,beforeRows:structuredClone(ctx.rows.slice(-6)),transaction:{base:snapshot,op,args:structuredClone(args),decisions:structuredClone(decisions)}};return {ok:true,paused:true};}
 finally{contexts.delete(draft);}
}
export function resumeInspiration(s,c,choice){const p=s.pending;if(p?.kind!=='inspiration'||!p.transaction)return {ok:false,error:'目前沒有待確認的英雄激勵'};if(choice!==null&&(!Number.isInteger(choice)||choice<0||choice>=p.faces.length))return {ok:false,error:'請選擇要重擲的一顆骰子'};const t=p.transaction;return runOperation(s,c,t.op,t.args,[...t.decisions,{choice}],t.base);}
export function inspirationDice(s,u,faces,adv,bonus,label,reroll,log,{sides=20,diceSides=faces.map(()=>sides),mode='test'}={}){
 const ctx=contexts.get(s);if(!ctx||!u?.inspiration||u.side!=='party'||u.control!=='manual'||!faces.length)return faces;
 const index=ctx.cursor++,decision=ctx.decisions[index],value=values=>mode==='sum'?values.reduce((a,b)=>a+b,0):adv>0?Math.max(...values):adv<0?Math.min(...values):values[0],natural=value(faces);
 if(!decision)throw new Pause({actor:u.id,faces,adv,bonus,label,natural,total:natural+bonus,sides,diceSides,mode,offerIndex:index});
 if(decision.choice===null){log(s,u.name+' '+label+'：['+faces.map((v,i)=>'d'+diceSides[i]+' '+v).join('／')+']，合計 '+(natural+bonus)+'；保留英雄激勵。');faces.offerIndex=index;return faces;}
 const changed=[...faces],old=changed[decision.choice],fresh=reroll(decision.choice);changed[decision.choice]=fresh;changed.reroll={index:decision.choice,from:old,to:fresh};changed.offerIndex=index;u.inspiration=false;
 const used=value(changed);log(s,u.name+'使用英雄激勵：第 '+(decision.choice+1)+' 顆 d'+diceSides[decision.choice]+' '+old+' → '+fresh+'；'+(mode==='sum'?'骰池加總':adv>0?'優勢取高':adv<0?'劣勢取低':'採用新骰')+' '+used+'，合計 '+(used+bonus)+'。');return changed;
}
