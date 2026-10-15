import fs from 'node:fs';import assert from 'node:assert/strict';import * as R from '../js/rules/engine.mjs';import {statusFeed,statusSnapshot,statusChanges} from '../js/rules/status-events.mjs?v=20261016.49';import {stateModel,statusBadgesHTML,statusBodyHTML,statusVisualStep,visualDuration} from '../js/ui/status-view.mjs';import {paperDollHTML} from '../js/ui/paperdoll.mjs';import {combatTest} from '../js/rules/combat-test.mjs';
const catalog=JSON.parse(fs.readFileSync(new URL('../data/catalog.json',import.meta.url)));
function setup(){const c=R.copy(catalog),s=combatTest(c),u=R.unit(s,'fighter'),t=R.unit(s,'enemy0');s.inspirationPrompts=true;s.units.forEach(v=>v.inspiration=false);s.turn=s.order.indexOf(u.id);u.x=7;u.y=7;t.x=7;t.y=6;t.hp=t.maxHp=100;return {s,c,u,t};}
const give=(s,c,u,k,opts={})=>{const r=R.applyCondition(s,c,u.id,k,{source:'enemy0',...opts});assert(r.ok,r.error);};
{
 const {s,c,u}=setup();let ledger=statusVisualStep(s,null);const before=R.copy(s);give(s,c,u,'poisoned',{minutes:1});const feed=statusFeed(s);assert(feed.events.some(v=>v.key==='poisoned'&&v.kind==='added'));const now=feed.events.at(-1).at;ledger=statusVisualStep(s,ledger,now);assert.equal(ledger.active.length,1);const once=ledger.active[0].id;for(let i=0;i<20;i++){ledger=statusVisualStep(s,ledger,now+20+i);assert.equal(ledger.active.length,1);assert.equal(ledger.active[0].id,once);}assert.equal(statusVisualStep(s,ledger,now+visualDuration+1).active.length,0);assert.equal(s.seed,before.seed);assert.equal(u.hp,before.units.find(v=>v.id===u.id).hp);assert(!JSON.stringify(s).includes('statusFeed'));assert(!JSON.stringify(s).includes('state-pop'));
 const serial=feed.serial;R.dispatch(s,c,{kind:'grip',actor:u.id,weapon:99,hands:2});assert.equal(statusFeed(s).serial,serial);
}
{
 const {s,c,u}=setup();const ledger=statusVisualStep(s,null);give(s,c,u,'poisoned');const now=statusFeed(s).events.at(-1).at;const delayed=statusVisualStep(s,ledger,now,true,860);assert(delayed.active.every(v=>v.at===now+860));const again=statusVisualStep(s,delayed,now+100,true,860);assert.equal(again.active[0].at,now+860);assert.equal(statusVisualStep(s,again,now+200,false).active.length,0);assert.equal(statusVisualStep(s,null,now).active.length,0);
}
{
 const {s,c,u}=setup();give(s,c,u,'poisoned',{minutes:.1});const start=statusFeed(s).serial;R.advanceTime(s,.1);assert.equal(statusFeed(s).serial,start+1);assert(statusFeed(s).events.some(v=>v.kind==='removed'&&v.key==='poisoned'));give(s,c,u,'poisoned');const serial=statusFeed(s).serial;R.removeCondition(s,u.id,'poisoned');assert.equal(statusFeed(s).serial,serial+1);const loaded=R.load(R.save({...s,page:'explore'}),c);assert.equal(statusFeed(loaded),undefined);
}
{
 // Pause for a save to release a condition: no removed effect is published until the choice commits.
 const {s,c,u}=setup();u.control='manual';u.inspiration=true;give(s,c,u,'poisoned',{save:{stat:'WIS',dc:0,timing:'end'}});const serial=statusFeed(s).serial;R.next(s,c);assert.equal(s.pending.kind,'inspiration');assert.equal(statusFeed(s).serial,serial);R.answer(s,c,false);assert(statusFeed(s).serial>serial);assert(statusFeed(s).events.filter(v=>v.serial>serial).some(v=>v.key==='poisoned'&&v.kind==='removed'));const done=statusFeed(s).serial;R.answer(s,c,false);assert.equal(statusFeed(s).serial,done);
}
{
 const {s,c,u}=setup();for(const key of ['poisoned','paralyzed','restrained','blinded','deafened','frightened','invisible'])give(s,c,u,key,{minutes:1});const before=JSON.stringify(s),seed=s.seed,html=statusBadgesHTML(s,u),body=statusBodyHTML(s,u),model=stateModel(s,u);assert.equal((html.match(/class="state-badge /g)||[]).length,5);assert(html.includes('data-state-overflow'));assert(html.includes('data-tooltip='));assert(model.every(v=>v.turns===10||v.key==='incapacitated'));assert(body.includes('state-poison-bubble'));assert(body.includes('state-electric'));assert(body.includes('#dac69a'));assert.equal(JSON.stringify(s),before);assert.equal(s.seed,seed);R.removeCondition(s,u.id,'poisoned');assert(!statusBodyHTML(s,u).includes('state-poison-bubble'));u.dead=true;assert.equal(statusBodyHTML(s,u),'');assert.equal(statusBadgesHTML(s,u),'');
}
{
 const {s,c,u}=setup();give(s,c,u,'unconscious');const doll=paperDollHTML(u);assert(doll.includes('dl-down'));assert(doll.includes('dl-status-pose'));const noEffects=statusSnapshot(s);assert.equal(statusChanges(noEffects,s).length,0);const before=R.copy(s);for(let i=0;i<10;i++){statusBadgesHTML(s,u);statusBodyHTML(s,u);}assert.deepEqual(s,before);
}
console.log('✓ 狀態視覺：提交後事件、原子暫停、期限／解除、重畫不重播、延遲只排一次、載入不回放、五格溢出、持續身上效果與規則隔離');
