import {conditions,hasCondition,exhaustion} from './conditions.mjs?v=20261016.50';
const feeds=new WeakMap(),tracking=new WeakMap();
export const statusFeed=s=>feeds.get(s);
export function statusKeys(u){if(u.dead)return [];const list=Object.keys(conditions).filter(k=>k!=='exhaustion'&&hasCondition(u,k));if(exhaustion(u))list.push('exhaustion:'+exhaustion(u));for(const k of ['bless','guidance','magearmor','light','shieldSpell','dodge','disengage','ready','concentration','sap','slow','guiding','vex'])if(u[k])list.push(k);for(const e of u.combatEffects||[])if(!list.includes(e.key))list.push(e.key);if(u.helpedBy?.length)list.push('helped');return list;}
export const statusSnapshot=s=>new Map(s.units.map(u=>[u.id,{dead:!!u.dead,keys:statusKeys(u)}]));
export function statusChanges(before,s){const out=[];for(const u of s.units){const old=before.get(u.id);if(!old||u.dead)continue;const next=statusKeys(u);for(const key of next)if(!old.keys.includes(key))out.push({unit:u.id,key,kind:'added'});for(const key of old.keys)if(!next.includes(key))out.push({unit:u.id,key,kind:'removed'});}return out;}
export function publishStatus(s,before){const changes=statusChanges(before,s);if(!changes.length)return;const old=feeds.get(s)||{serial:0,events:[]},serial=old.serial+1,at=Date.now();feeds.set(s,{serial,events:[...old.events,...changes.map((v,i)=>({...v,id:serial+':'+i,serial,at}))].slice(-96)});}
// Only complete outer operations publish. Drafts paused for Inspiration never leak events.
export function trackStatus(s,execute){if(tracking.has(s))return execute();const before=statusSnapshot(s);tracking.set(s,true);try{const result=execute();publishStatus(s,before);return result;}finally{tracking.delete(s);}}
