import fs from 'node:fs';import assert from 'node:assert/strict';import * as R from '../js/rules/engine.mjs';import {combatTest} from '../js/rules/combat-test.mjs';import {damagePacket,damageProfile,defenseSources,validDamageTraits} from '../js/rules/damage.mjs?v=20261016.50';import {statusFeed} from '../js/rules/status-events.mjs?v=20261016.50';import {choose} from '../js/controllers/ai.mjs';
const catalog=JSON.parse(fs.readFileSync(new URL('../data/catalog.json',import.meta.url)));
function setup(actor='wizard',scenario='bandit',seed=19){const c=R.copy(catalog),s=combatTest(c,scenario);c.map.walls=[];c.map.covers=[];c.map.elevations=[];s.units.forEach((v,i)=>{v.inspiration=false;v.control='manual';v.reaction=0;v.z=0;v.x=2+i;v.y=2;});const u=R.unit(s,actor),t=R.unit(s,'enemy0');u.x=7;u.y=7;u.heldWeapons=[];u.shield=false;u.scores[c.classes[u.class]?.stat||'INT']=40;u.action=u.bonus=1;t.x=8;t.y=7;t.hp=t.maxHp=200;t.scores.WIS=t.scores.CON=-40;s.order=[u.id,...s.units.filter(v=>v.id!==u.id).map(v=>v.id)];s.turn=0;s.round=1;s.minute=0;s.seed=seed;return {s,c,u,t};}
function cast(v,item,extra={}){const r=R.dispatch(v.s,v.c,{kind:'item',item,actor:v.u.id,target:v.t.id,...extra});assert(r.ok,r.error);return r;}
const hp=s=>s.units.map(v=>[v.id,v.hp,v.temp]);
{
 const u={resistances:['fire'],damageDefenses:[{trait:'resistances',types:['slashing'],when:{magical:false,weapon:true},source:'測試'}]};assert.equal(damageProfile(u,11,'slashing',{weapon:true}).amount,5);assert.equal(damageProfile(u,11,'slashing',{weapon:true,magical:true}).amount,11);assert.equal(damageProfile(u,11,'slashing',{weapon:false}).amount,11);assert.equal(damagePacket(u,[{type:'fire',value:3},{type:'fire',value:4},{type:'cold',value:5}]).amount,8);const x={inventory:{fireRing:1},equippedItems:['fireRing'],attunedItems:[]};assert.equal(damageProfile(x,10,'fire').amount,10);x.attunedItems=['fireRing'];assert.equal(damageProfile(x,10,'fire').amount,5);x.inventory.fireRing=0;assert.equal(damageProfile(x,10,'fire').amount,10);assert(!validDamageTraits({damageDefenses:[{trait:'oops',types:['fire']}]}));assert(!validDamageTraits({damageDefenses:[{trait:'resistances',types:['fire'],when:{magic:'no'}}]}));
}
{
 const v=setup(),{s,c,u,t}=v;t.side='party';t.class='cleric';t.hp=t.maxHp=100;t.temp=7;t.scores.CON=40;t.concentration={spell:'bless',expires:10};s.inspirationPrompts=true;const start=hp(s);R.applyDamage(s,c,t.id,[{type:'fire',value:15},{type:'cold',value:11}]);assert.equal(t.temp,0);assert.equal(t.hp,81);const rolls=R.diceFeed(s).rows.filter(v=>v.label==='專注豁免');assert.equal(rolls.length,1);assert.equal(rolls[0].total-rolls[0].bonus>=1,true);assert.equal(s.log.filter(l=>l.includes('專注中斷')).length,0);t.hp=0;t.stable=true;t.death={success:0,fail:0};R.applyDamage(s,c,t.id,[{type:'fire',value:3},{type:'cold',value:4}]);assert.equal(t.death.fail,1);assert(!t.stable);
}
{
 const v=setup(),{s,c,u,t}=v;cast(v,'holdScroll');assert(R.hasCondition(t,'paralyzed'));assert.equal(u.concentration.spell,'holdperson');const serial=statusFeed(s).serial;R.dispatch(s,c,{kind:'stopconcentration',actor:u.id});assert(!R.hasCondition(t,'paralyzed'));assert(statusFeed(s).serial>serial);assert.equal(u.action,0);
 const x=setup('wizard','monsters');const before=R.copy(x.s);assert(!R.dispatch(x.s,x.c,{kind:'item',item:'holdScroll',actor:x.u.id,target:x.t.id}).ok);assert.deepEqual(x.s,before);
}
{
 for(const key of ['blinded','deafened']){const v=setup();cast(v,'blindScroll',{choice:key});assert(R.hasCondition(v.t,key));assert(!v.u.concentration);v.t.scores.CON=40;R.next(v.s,v.c);while(R.current(v.s).id!==v.t.id)R.next(v.s,v.c);R.next(v.s,v.c);assert(!R.hasCondition(v.t,key));}
}
{
 const v=setup(),{s,c,u,t}=v;cast(v,'invisibleScroll',{target:u.id});assert(R.hasCondition(u,'invisible'));u.action=1;u.weapons=['quarterstaff'];u.heldWeapons=[0];t.armor='chain';t.shield=true;R.dispatch(s,c,{kind:'attack',actor:u.id,target:t.id,weapon:0});assert(!R.hasCondition(u,'invisible'));assert(!u.concentration);
 const x=setup();cast(x,'invisibleScroll',{target:x.u.id});x.u.action=1;x.u.bonus=1;cast(x,'laughterScroll');assert(!R.hasCondition(x.u,'invisible'));assert.equal(x.u.concentration.spell,'hideouslaughter');
}
{
 const v=setup(),{s,c,u,t}=v;cast(v,'laughterScroll');assert(R.hasCondition(t,'incapacitated'));assert(t.prone);s.turn=s.order.indexOf(t.id);t.move=30;assert(R.validate(s,c,{kind:'stand',actor:t.id}).includes('狂笑術'));s.turn=0;t.scores.WIS=40;s.inspirationPrompts=true;R.applyDamage(s,c,t.id,[{type:'fire',value:1},{type:'cold',value:1}]);assert(!R.hasCondition(t,'incapacitated'));assert(t.prone);assert.equal(R.diceFeed(s).rows.filter(v=>v.label==='狂笑術受傷解除豁免').length,1);assert.equal(R.diceFeed(s).rows[0].faces.length,2);
}
{
 const v=setup('cleric'),{s,c,u,t}=v;t.side='party';R.applyCondition(s,c,t.id,'poisoned',{source:'enemy1'});cast(v,'poisonWardScroll');assert(!R.hasCondition(t,'poisoned'));assert.equal(damageProfile(t,11,'poison').amount,5);R.applyCondition(s,c,t.id,'poisoned',{source:'enemy1'});assert(R.hasCondition(t,'poisoned'),'protection is not condition immunity');R.advanceTime(s,60);assert.equal(damageProfile(t,11,'poison').amount,11);
 const x=setup();x.t.side='party';cast(x,'energyWardScroll',{choice:'fire'});assert.equal(damageProfile(x.t,11,'fire').amount,5);assert.equal(damageProfile(x.t,11,'cold').amount,11);R.clearConcentration(x.s,x.u);assert.equal(damageProfile(x.t,11,'fire').amount,11);
}
{
 const v=setup(),{s,c,u,t}=v;cast(v,'holdScroll');u.action=1;R.applyCondition(s,c,t.id,'poisoned',{source:'enemy1'});cast(v,'dispelScroll');assert(!R.hasCondition(t,'paralyzed'));assert(R.hasCondition(t,'poisoned'));assert(!u.concentration);
}
{
 const v=setup('fighter','monsters'),{s,c,u}=v,g=R.unit(s,'enemy1');g.x=8;g.y=7;g.heldWeapons=[0];u.heldWeapons=[0];u.scores.DEX=u.scores.CON=-40;u.hp=u.maxHp=200;s.turn=s.order.indexOf(g.id);g.action=1;s.seed=7;const out=R.dispatch(s,c,{kind:'attack',actor:g.id,target:u.id,weapon:1});assert(out.ok,out.error);assert(R.hasCondition(u,'paralyzed'));while(R.current(s).id!==u.id)R.next(s,c);assert(R.hasCondition(u,'paralyzed'));R.next(s,c);assert(!R.hasCondition(u,'paralyzed'));
}
{
 const v=setup('fighter','monsters'),{s,c,u,t}=v;u.hp=u.maxHp=200;u.scores.DEX=-40;u.species='elf';u.heldWeapons=[0];const g=R.unit(s,'enemy1');g.x=8;g.y=7;s.turn=s.order.indexOf(g.id);g.action=1;s.seed=7;R.dispatch(s,c,{kind:'attack',actor:g.id,target:u.id,weapon:1});assert(!R.hasCondition(u,'paralyzed'));g.action=1;u.scores.CON=40;u.concentration={spell:'bless',expires:10};s.inspirationPrompts=true;const priorHits=s.log.filter(l=>l.includes(g.name+' → ')).length;R.dispatch(s,c,{kind:'monster',actor:g.id,target:u.id,ability:'multiattack'});assert.equal(g.action,0);assert.equal(s.log.filter(l=>l.includes(g.name+' → ')).length-priorHits,2);assert(!s.monsterChain);assert(!s.pending);
}
{
 const v=setup('wizard','monsters'),{s,c,u,t}=v;u.scores.DEX=-40;u.hp=u.maxHp=100;s.turn=s.order.indexOf(t.id);t.action=1;R.dispatch(s,c,{kind:'monster',actor:t.id,target:u.id,ability:'web'});assert(u.web);assert(R.hasCondition(u,'restrained'));assert(t.webCooldown);assert(R.validate(s,c,{kind:'monster',actor:t.id,target:u.id,ability:'web'}));s.turn=s.order.indexOf(u.id);u.action=1;u.scores.INT=40;s.seed=4;const r=R.dispatch(s,c,{kind:'webbreak',actor:u.id,target:u.id,spell:'firebolt'});assert(r.ok,r.error);assert(!u.web);assert.equal(u.hp,100);
}
{
 const v=setup(),{s,c,u,t}=v;u.inspiration=true;u.control='manual';s.inspirationPrompts=true;const old=R.copy(s);cast(v,'holdScroll');assert.equal(s.pending.kind,'inspiration');assert.equal(u.inventory.holdScroll,old.units.find(v=>v.id===u.id).inventory.holdScroll);assert(!R.hasCondition(t,'paralyzed'));R.answer(s,c,false);while(s.pending?.kind==='inspiration')R.answer(s,c,false);assert(R.hasCondition(t,'paralyzed'));assert.equal(u.inventory.holdScroll,2);
}
{
 const {s,c,u,t}=setup();cast({s,c,u,t},'holdScroll');s.page='explore';const text=R.save(s);const loaded=R.load(text,c);assert(R.hasCondition(R.unit(loaded,t.id),'paralyzed'));assert.equal(R.unit(loaded,u.id).concentration.spell,'holdperson');const wrong=JSON.parse(text);wrong.units[0].combatEffects=[{key:'protectionfromenergy',spell:'protectionfromenergy',source:'wizard',choice:'oops',expires:1}];assert.throws(()=>R.load(JSON.stringify(wrong),c),/效果/);assert.equal(catalog.presets.find(v=>v.id==='wizard').book.length,6);
}
{
 const v=setup('fighter','monsters'),{s,c,t}=v;s.turn=s.order.indexOf(t.id);t.action=1;const before=R.copy(s),cmd=choose(s,c);assert.deepEqual(s,before);assert.equal(cmd.kind,'monster');assert.equal(cmd.ability,'web');assert(!R.validate(s,c,cmd));
}
console.log('✓ 戰鬥整批：七種法術、專注來源／解除／到期／隱形觸發、狂笑受傷豁免、裝備／法術／條件抗性、混合傷害單次專注與瀕死、蛛網／破網、食屍鬼麻痺與連咬、激勵原子性、存檔驗證、怪物合法意圖');

{
 const v=setup(),{s,c,u,t}=v;R.applyCondition(s,c,t.id,'poisoned',{source:'enemy1',spell:'rayofsickness',minutes:1});cast(v,'dispelScroll');assert(R.hasCondition(t,'poisoned'),'instantaneous spell aftermath is not an ongoing spell');
}
{
 let checked=false;for(let seed=1;seed<40&&!checked;seed++){const v=setup('wizard','monsters',seed),{s,c,u}=v,g=R.unit(s,'enemy1');u.x=7;u.y=7;u.hp=u.maxHp=200;u.scores.INT=15;u.reaction=1;u.slots=2;g.x=8;g.y=7;g.action=1;s.turn=s.order.indexOf(g.id);const before=s.log.filter(l=>l.includes(g.name+' → ')).length;R.dispatch(s,c,{kind:'monster',actor:g.id,target:u.id,ability:'multiattack'});if(s.pending?.kind!=='shield'||!s.monsterChain?.length)continue;assert.equal(g.action,0);assert.equal(s.monsterChain.length,1);for(let i=0;s.pending&&i<4;i++)R.answer(s,c,false);assert(!s.pending);assert(!s.monsterChain);assert.equal(s.log.filter(l=>l.includes(g.name+' → ')).length-before,2);const done=R.copy(s);R.answer(s,c,false);assert.deepEqual(s,done);checked=true;}assert(checked,'multiattack pauses and resumes around shield');
}

{
 const v=setup('cleric'),{s,c,u,t}=v;t.side='party';cast(v,'poisonWardScroll');R.applyCondition(s,c,t.id,'poisoned',{source:'enemy1',minutes:10,save:{stat:'CON',dc:100,timing:'end'}});s.inspirationPrompts=true;s.turn=s.order.indexOf(t.id);R.next(s,c);const row=R.diceFeed(s).rows.find(r=>r.label==='中毒解除豁免');assert(row);assert.equal(row.faces.length,2);
 const target={resistances:['fire'],inventory:{fireRing:1},equippedItems:['fireRing'],attunedItems:['fireRing'],combatEffects:[{key:'protectionfromenergy',choice:'fire',name:'防護能量'}]};assert.equal(damageProfile(target,11,'fire').amount,5,'same resistance does not stack across sources');
}

{
 const v=setup(),{s,c,u,t}=v;cast(v,'invisibleScroll',{target:u.id});assert(R.hasCondition(u,'invisible'));R.applyDamage(s,c,t.id,[{type:'fire',value:1}],{source:u.id,magical:true});assert(!R.hasCondition(u,'invisible'),'damage without a new attack or casting still breaks invisibility');
}
