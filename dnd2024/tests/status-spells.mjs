import fs from 'node:fs';import assert from 'node:assert/strict';import * as R from '../js/rules/engine.mjs';import {combatTest} from '../js/rules/combat-test.mjs';import {statusFeed} from '../js/rules/status-events.mjs?v=20261016.51';import {commandAvailable} from '../js/ui/battle.mjs';import {spellIntent} from '../js/ui/spell-aim.mjs';
const catalog=JSON.parse(fs.readFileSync(new URL('../data/catalog.json',import.meta.url)));
function setup(actor='wizard',seed=17){const c=R.copy(catalog),s=combatTest(c);s.seed=seed;s.units.forEach(v=>{v.inspiration=false;v.reaction=0;});const u=R.unit(s,actor),t=R.unit(s,'enemy0');s.order=[u.id,...s.units.filter(v=>v.id!==u.id).map(v=>v.id)];s.turn=0;s.round=1;s.minute=0;c.map.walls=[];c.map.covers=[];c.map.terrain=[];u.x=7;u.y=7;u.z=0;u.shield=false;u.heldWeapons=[];u.action=u.bonus=1;t.x=8;t.y=7;t.z=0;t.hp=t.maxHp=100;return {s,c,u,t};}
const cast=(v,item,extra={})=>R.dispatch(v.s,v.c,{kind:'item',actor:v.u.id,item,target:v.t.id,...extra});
{
 let hits=0,misses=0;for(let seed=1;seed<50;seed++){const v=setup('wizard',seed),{s,u,t,c}=v,slots=u.slots,hp=t.hp;const r=cast(v,'sicknessScroll');assert(r.ok,r.error);assert.equal(u.inventory.sicknessScroll,2);assert.equal(u.slots,slots);assert.equal(u.action,0);assert.equal(u.bonus,1);if(R.hasCondition(t,'poisoned')){hits++;assert(t.hp<hp);assert.equal(t.conditions.find(e=>e.k==='poisoned').spell,'rayofsickness');assert.equal(s.log.filter(l=>l.includes('豁免')).length,0);R.next(s,c);assert(R.hasCondition(t,'poisoned'),'does not end on casting turn');while(R.current(s).id!==u.id)R.next(s,c);assert(R.hasCondition(t,'poisoned'),'lasts through next caster turn');R.next(s,c);assert(!R.hasCondition(t,'poisoned'));}else{misses++;assert.equal(t.hp,hp);}}assert(hits&&misses);
}
{
 const v=setup(),{s,c,u,t}=v;t.damageImmunities=['poison'];u.scores.INT=100;assert(cast(v,'sicknessScroll').ok);assert.equal(t.hp,100); // Scroll stays +5 regardless of caster INT.
 const good=setup();good.t.armor='none';good.t.scores.DEX=-40;good.t.conditionImmunities=['poisoned'];assert(cast(good,'sicknessScroll').ok);assert(good.t.hp<100);assert(!R.hasCondition(good.t,'poisoned'));
}
{
 const v=setup(),{s,c,u,t}=v;t.scores.CON=-40;const ally=R.unit(s,'fighter');ally.x=9;ally.y=7;ally.z=0;ally.scores.CON=-40;const hp=s.units.map(v=>v.hp),r=cast(v,'colorScroll',{aim:{x:10,y:7},target:undefined});assert(r.ok,r.error);assert(R.hasCondition(t,'blinded'));assert(R.hasCondition(ally,'blinded'));assert.deepEqual(s.units.map(v=>v.hp),hp);assert.equal(u.inventory.colorScroll,2);assert.equal(u.slots,2);assert(statusFeed(s).events.some(v=>v.key==='blinded'));
}
{
 for(const key of ['blinded','deafened','paralyzed','poisoned']){let pass=false,fail=false;for(let seed=1;seed<35;seed++){const v=setup('cleric',seed),{s,c,u,t}=v;R.applyCondition(s,c,t.id,key,{source:'enemy1'});R.applyCondition(s,c,t.id,key,{source:'wizard'});R.applyCondition(s,c,t.id,'frightened',{source:'enemy1'});const before=t.hp;assert(cast(v,'restorationScroll',{condition:key}).ok);assert.equal(u.inventory.restorationScroll,2);assert.equal(u.bonus,0);assert.equal(u.action,1);assert.equal(u.slots,2);assert.equal(t.hp,before);assert(R.hasCondition(t,'frightened'));if(R.hasCondition(t,key))fail=true;else{pass=true;assert(!t.conditions.some(e=>e.k===key));}}assert(pass&&fail,key);}
}
{
 const v=setup('cleric'),{s,c,u,t}=v;R.applyCondition(s,c,t.id,'poisoned',{source:'enemy1'});u.inspiration=true;s.inspirationPrompts=true;const serial=statusFeed(s).serial;cast(v,'restorationScroll',{condition:'poisoned'});assert.equal(s.pending.kind,'inspiration');assert.equal(u.inventory.restorationScroll,3);assert.equal(u.bonus,1);assert(R.hasCondition(t,'poisoned'));assert.equal(statusFeed(s).serial,serial);R.answer(s,c,false);assert.equal(u.inventory.restorationScroll,2);assert.equal(u.bonus,0);const done=R.copy(s);R.answer(s,c,false);assert.deepEqual(s,done);
}
{
 const v=setup('wizard'),{s,c,u,t}=v;for(const extra of [{item:'restorationScroll',condition:'poisoned'},{item:'sicknessScroll',target:'missing'},{item:'colorScroll',aim:{x:u.x,y:u.y}},{item:'colorScroll',aim:{x:-1,y:0}}]){const before=R.copy(s);assert(!cast(v,extra.item,extra).ok);assert.deepEqual(s,before);}
 u.heldWeapons=[0];u.grips={0:2};const before=R.copy(s);assert(!cast(v,'sicknessScroll').ok);assert.deepEqual(s,before);
}
{
 const v=setup('cleric'),{s,c,u,t}=v;R.applyCondition(s,c,t.id,'poisoned',{source:'enemy1'});assert(commandAvailable(s,c,u,{kind:'item',item:'restorationScroll'}));assert(!commandAvailable(s,c,u,{kind:'item',item:'sicknessScroll'}));const intent=spellIntent(u,{item:'colorScroll',spell:'colorspray',type:'cone',aim:{x:10,y:7}});assert.equal(intent.kind,'item');assert.equal(intent.item,'colorScroll');const before=R.copy(s);assert(R.validate(s,c,{kind:'spell',actor:u.id,spell:'lesserrestoration',target:t.id,condition:'poisoned'}));assert.deepEqual(s,before);
}
{
 const {s,c,u,t}=setup();R.applyCondition(s,c,t.id,'poisoned',{source:u.id,minutes:1});s.page='explore';const loaded=R.load(R.save(s),c);assert.equal(R.unit(loaded,'wizard').inventory.sicknessScroll,3);assert.deepEqual(R.unit(loaded,'wizard').book,c.presets.find(v=>v.id==='wizard').book);const broken=R.copy(s);t.conditions=[{k:'poisoned',source:u.id,spell:'rayofsickness',turnEnd:{actor:'bogus',round:2},expires:1}];assert.throws(()=>R.load(R.save(s),c),/狀態/);
}
console.log('✓ 狀態法術／卷軸：命中中毒、範圍目盲友軍、精確回合期限、傷害與狀態免疫分離、四種解除選擇、越級成敗消耗、激勵原子性、非法資源不變、存讀檔與模板隔離');
