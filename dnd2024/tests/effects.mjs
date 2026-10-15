import fs from 'node:fs';import assert from 'node:assert/strict';import * as R from '../js/rules/engine.mjs';import {combatTest} from '../js/rules/combat-test.mjs';import {sheetHTML} from '../js/ui/sheet.mjs';
const c=JSON.parse(fs.readFileSync(new URL('../data/catalog.json',import.meta.url)));const setup=()=>{const s=R.fresh(c,15);for(const u of s.units){u.heldWeapons=[];u.shield=false;}return s;};
const cast=(s,spell,actor,target=actor)=>{const r=R.dispatch(s,c,{kind:'spell',spell,actor,target});assert(r.ok,r.error);};
{
 const s=setup(),u=R.unit(s,'wizard');cast(s,'magearmor',u.id);cast(s,'light',u.id);assert.equal(R.ac(u),13+R.mod(u.scores.DEX));const saved=R.load(R.save(s),c);assert.deepEqual(saved,s);R.advanceTime(s,59.99);assert(u.light);R.advanceTime(s,.01);assert(!u.light);assert(u.magearmor);R.advanceTime(s,420);assert(!u.magearmor);assert.equal(R.ac(u),10+R.mod(u.scores.DEX));
}
{
 const s=setup(),u=R.unit(s,'cleric');cast(s,'guidance',u.id);R.advanceTime(s,.99);assert(u.guidance);R.advanceTime(s,.01);assert(!u.guidance);assert.equal(u.concentration,null);const count=s.log.length;R.syncEffects(s);assert.equal(s.log.length,count);
}
{
 const s=combatTest(R.copy(c)),u=R.unit(s,'cleric');s.turn=s.order.indexOf(u.id);u.heldWeapons=[];u.shield=false;cast(s,'bless',u.id);const start=R.effectNow(s),seed=s.seed;for(let i=0;i<s.order.length*10-1;i++)R.next(s,c);assert(u.bless);assert(R.effectNow(s)-start<1);R.next(s,c);assert(!u.bless);assert.equal(u.concentration,null);assert.equal(s.seed,seed);
}
{
 const s=setup(),u=R.unit(s,'wizard');cast(s,'light',u.id);cast(s,'magearmor',u.id);u.hp=0;assert(R.rest(s,c).ok);assert(!u.light);assert(u.magearmor);R.advanceTime(s,420);assert(!u.magearmor);
}
{
 const s=setup(),u=R.unit(s,'cleric');cast(s,'guidance',u.id);R.clearConcentration(s,u);assert(!u.guidance);assert.equal(R.effectLabels(s,u).length,0);const w=R.unit(s,'wizard');cast(s,'light',w.id);const before=JSON.stringify(s),html=sheetHTML(w,c,s,0,{esc:String,doll:()=>''});assert(html.includes('光亮術：剩餘'));assert.equal(JSON.stringify(s),before);assert(!R.dispatch(s,c,{kind:'spell',actor:w.id,spell:'nope',target:w.id}).ok);assert.equal(JSON.stringify(s),before);
}
{
 const s=setup(),u=R.unit(s,'wizard');u.light=true;const loaded=R.load(R.save(s),c);assert(!R.unit(loaded,u.id).light);u.effectTimers={light:{source:u.id,expires:'bad'}};assert.throws(()=>R.load(R.save(s),c));
}
{
 const local=R.copy(c),s=combatTest(local),u=R.unit(s,'cleric');s.turn=s.order.indexOf(u.id);u.heldWeapons=[];u.shield=false;cast(s,'bless',u.id);for(const e of s.units.filter(v=>v.side==='enemy')){e.hp=0;e.dead=true;}const before=R.effectNow(s);R.next(s,local);assert.equal(s.page,'explore');assert(R.effectNow(s)>=before);assert(u.bless);assert(u.concentration);R.advanceTime(s,1);assert(!u.bless);
}
console.log('✓ 效果期限：施放、回合邊界、探索、休息、存讀檔與唯讀狀態卡');
