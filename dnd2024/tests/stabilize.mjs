import fs from 'node:fs';import assert from 'node:assert/strict';import * as R from '../js/rules/engine.mjs';import {combatTest} from '../js/rules/combat-test.mjs';import {battleHTML,newBattleUI} from '../js/ui/battle.mjs';
const catalog=JSON.parse(fs.readFileSync(new URL('../data/catalog.json',import.meta.url)));
function setup(seed=1){const c=R.copy(catalog),s=combatTest(c),u=R.unit(s,'fighter'),t=R.unit(s,'rogue');s.seed=seed;s.inspirationPrompts=false;s.turn=s.order.indexOf(u.id);Object.assign(u,{x:7,y:7,z:0,action:1});Object.assign(t,{x:6,y:7,z:0,hp:0,prone:true,death:{success:2,fail:2}});return {c,s,u,t};}
const aid=(s,c)=>R.dispatch(s,c,{kind:'stabilize',actor:'fighter',target:'rogue'});
{
 const {c,s,u,t}=setup();u.skillBonuses={medicine:30};const html=battleHTML(s,c,u.id,{kind:'move'},Object.assign(newBattleUI(),{menu:'main-actions'}),{esc:String,doll:()=>'',testing:true,sound:false,msg:''});assert.match(html,/data-do="stabilize"/);assert(aid(s,c).ok);assert(t.stable);assert.equal(t.hp,0);assert(t.prone);assert.equal(u.action,0);assert.deepEqual(t.death,{success:0,fail:0});assert(t.stableUntil>=R.effectNow(s)+60&&t.stableUntil<=R.effectNow(s)+240);const after=JSON.stringify(s);assert(!aid(s,c).ok);assert.equal(JSON.stringify(s),after);
 const end=t.stableUntil;s.page='explore';s.turn=0;s.minute=0;const loaded=R.load(R.save(s),c);assert.equal(R.unit(loaded,t.id).stableUntil,end);R.advanceTime(s,end-.01);assert.equal(t.hp,0);R.advanceTime(s,.01);assert.equal(t.hp,1);assert(!t.stable);assert.equal(t.stableUntil,undefined);assert(t.prone);const seed=s.seed;R.syncEffects(s);assert.equal(s.seed,seed);
}
{
 const {c,s,u,t}=setup();u.skillBonuses={medicine:-30};assert(aid(s,c).ok);assert.equal(u.action,0);assert(!t.stable);assert.deepEqual(t.death,{success:2,fail:2});
}
{
 for(const change of [t=>t.x=1,t=>t.hp=1,t=>t.dead=true,t=>t.stable=true]){const {c,s,t}=setup();change(t);const before=JSON.stringify(s);assert(!aid(s,c).ok);assert.equal(JSON.stringify(s),before);}
}
{
 const {c,s,u,t}=setup();s.inspirationPrompts=true;u.control='manual';u.inspiration=true;const before=R.copy(s);assert(aid(s,c).pending||s.pending);assert.equal(s.pending.kind,'inspiration');assert.equal(u.action,1);assert(!R.unit(s,t.id).stable);R.answer(s,c,false);assert.equal(R.unit(s,u.id).action,0);assert.equal(R.unit(s,u.id).inspiration,true);assert.equal(before.units.find(v=>v.id===t.id).hp,R.unit(s,t.id).hp);
}
{
 // Third success stabilizes and resets both counters; stable turns consume no d20.
 const {c,s,t}=setup(2);t.death={success:2,fail:1};s.order=['fighter','rogue','enemy0','enemy1','cleric','wizard'];s.turn=0;R.next(s,c);assert(t.stable);assert.deepEqual(t.death,{success:0,fail:0});const seed=s.seed;s.turn=0;R.next(s,c);assert.equal(s.seed,seed);
}
{
 // Damage to a stable zero-HP target resumes dying, including through temporary HP.
 const {c,s,t}=setup();t.stable=true;t.stableUntil=120;t.death={success:0,fail:0};t.temp=100;const e=R.unit(s,'enemy0');e.action=1;e.x=7;e.y=7;e.z=0;e.scores.DEX=40;e.attackBonus=50;e.weapons=['scimitar'];s.turn=s.order.indexOf(e.id);s.seed=2;assert(R.dispatch(s,c,{kind:'attack',actor:e.id,target:t.id,weapon:0}).ok);assert(!t.stable);assert.equal(t.stableUntil,undefined);assert.equal(t.death.fail,2);assert(!t.dead);assert.equal(t.hp,0);R.advanceTime(s,240);assert.equal(t.hp,0);
}
{
 const {c,s,t}=setup();t.stable=true;t.stableUntil=120;s.page='explore';const broken=R.copy(s);R.unit(broken,t.id).stableUntil='bad';assert.throws(()=>R.load(JSON.stringify(broken),c));const legacy=R.copy(s);delete R.unit(legacy,t.id).stableUntil;const loaded=R.load(JSON.stringify(legacy),c);assert(Number.isFinite(R.unit(loaded,t.id).stableUntil));
}
console.log('✓ 急救：成功／失敗、非法原子性、英雄激勵暫停、三成功穩定、受傷恢復瀕死、甦醒與存讀檔');

{const {c,s,u,t}=setup();t.stable=true;t.stableUntil=120;s.page='explore';u.inventory.healingPotion=1;assert(R.dispatch(s,c,{kind:'item',actor:u.id,target:t.id,item:'healingPotion'}).ok);assert(t.hp>0);assert(!t.stable);assert.equal(t.stableUntil,undefined);assert.deepEqual(t.death,{success:0,fail:0});}
