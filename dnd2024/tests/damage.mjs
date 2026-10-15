import fs from 'node:fs';import assert from 'node:assert/strict';import * as R from '../js/rules/engine.mjs';import {damageTypes,damageProfile,damageTraits} from '../js/rules/damage.mjs';import {combatTest} from '../js/rules/combat-test.mjs';import {sheetHTML} from '../js/ui/sheet.mjs';import {battleHTML,newBattleUI} from '../js/ui/battle.mjs';import {diceRowHTML} from '../js/ui/dice-view.mjs';
const catalog=JSON.parse(fs.readFileSync(new URL('../data/catalog.json',import.meta.url)));
function setup(actor='fighter',seed=2){const c=R.copy(catalog),s=combatTest(c);s.seed=seed;s.inspirationPrompts=true;s.units.forEach((v,i)=>{v.inspiration=false;v.x=1+i;v.y=14;v.z=0;v.reaction=0;});const u=R.unit(s,actor),t=R.unit(s,'enemy0');Object.assign(u,{x:7,y:7,heldWeapons:[],shield:false,action:1,bonus:1});Object.assign(t,{x:7,y:6,hp:100,maxHp:100,armor:'none',scores:{...t.scores,DEX:10}});s.turn=s.order.indexOf(u.id);return {c,s,u,t};}
const cast=(s,c,u,spell,extra)=>{const r=R.dispatch(s,c,{kind:'spell',actor:u.id,spell,...extra});assert(r.ok,r.error);};
{
 for(const type of Object.keys(damageTypes)){assert.equal(damageProfile({},5,type).amount,5);assert.equal(damageProfile({resistances:[type,type]},5,type).amount,2);assert.equal(damageProfile({vulnerabilities:[type,type]},5,type).amount,10);assert.equal(damageProfile({resistances:[type],vulnerabilities:[type]},5,type).amount,4);assert.equal(damageProfile({damageImmunities:[type],vulnerabilities:[type]},5,type).amount,0);}
 assert.equal(damageProfile({resistances:['all','fire']},7,'fire').amount,3);assert.equal(damageProfile({resistances:['slashing']},5,'piercing').amount,5);assert.equal(damageProfile({vulnerabilities:['fire']},0,'fire').amount,0);assert.throws(()=>damageProfile({},5,'physical'));assert.equal(catalog.weapons.shortsword.damageType,'piercing');
}
{
 for(const kind of ['resistances','damageImmunities','vulnerabilities']){const {c,s,u,t}=setup();t[kind]=['slashing'];const before=s.seed;assert(R.dispatch(s,c,{kind:'attack',actor:u.id,target:t.id,weapon:0}).ok);const row=R.diceFeed(s).rows.find(r=>r.phase==='damage');assert(row);assert.equal(t.hp,100-damageProfile(t,row.total,'slashing').amount);assert.match(row.resolution,/揮砍/);assert(diceRowHTML(row).includes(row.resolution));assert.notEqual(s.seed,before);}
}
{
 const {c,s,u,t}=setup('wizard');t.damageImmunities=['fire'];cast(s,c,u,'firebolt',{target:t.id});assert.equal(t.hp,100);assert(s.log.some(l=>l.includes('免疫')));assert.equal(u.action,0);
 t.damageImmunities=[];t.resistances=['radiant'];u.spells.push('guidingbolt');u.action=1;u.slotSpent=false;cast(s,c,u,'guidingbolt',{target:t.id});const row=R.diceFeed(s).rows.find(r=>r.phase==='damage');assert.equal(t.hp,100-Math.floor(row.total/2));assert.equal(u.slots,1);
}
{
 const {c,s,u,t}=setup('wizard');t.x=8;t.y=7;t.scores.DEX=50;t.resistances=['fire'];cast(s,c,u,'burninghands',{aim:{x:9,y:7}});const row=R.diceFeed(s).rows.find(r=>r.label==='燃燒之手傷害');assert(row);assert.equal(t.hp,100-Math.floor(Math.floor(row.total/2)/2));assert(s.log.some(l=>l.includes('抗性')));
}
{
 const {c,s,u,t}=setup('wizard');t.resistances=['force'];cast(s,c,u,'magicmissile',{target:t.id});const rolls=R.diceFeed(s).rows.filter(r=>r.label.startsWith('魔法飛彈第'));assert.equal(rolls.length,3);assert.equal(t.hp,100-rolls.reduce((sum,r)=>sum+Math.floor(r.total/2),0));assert.equal(u.slots,1);
}
{
 // Immunity must not disturb a stable zero-HP character, including a melee critical.
 const {c,s,u,t}=setup('enemy1');const f=R.unit(s,'fighter');Object.assign(f,{x:7,y:6,hp:0,stable:true,stableUntil:120,death:{success:0,fail:0},damageImmunities:['slashing']});t.x=12;t.y=12;u.action=1;u.attackBonus=50;u.scores.DEX=20;assert(R.dispatch(s,c,{kind:'attack',actor:u.id,target:f.id,weapon:0}).ok);assert(f.stable);assert.equal(f.stableUntil,120);assert.equal(f.death.fail,0);assert(!f.dead);
}
{
 for(const immune of [false,true]){const {c,s,u,t}=setup('wizard');Object.assign(t,{temp:100,concentration:{spell:'guidance',expires:100},damageImmunities:immune?['fire']:[],resistances:immune?[]:['fire']});cast(s,c,u,'firebolt',{target:t.id});assert.equal(t.hp,100);const rows=R.diceFeed(s).rows;assert.equal(rows.some(r=>r.label==='專注豁免'),!immune);if(immune){assert.equal(t.temp,100);assert(t.concentration);}else assert(t.temp<100);}
}
{
 const {c,s,u,t}=setup();u.resistances=['cold'];u.damageImmunities=['poison'];u.vulnerabilities=['fire'];const html=sheetHTML(u,c,s,0,{esc:String,doll:()=>''});for(const text of damageTraits(u))assert(html.includes(text));t.resistances=['slashing'];const ui=newBattleUI();ui.info=t.id;assert(battleHTML(s,c,u.id,{kind:'move'},ui,{esc:String,doll:()=>'',testing:true,sound:false,msg:''}).includes('抗性：揮砍'));s.page='explore';const loaded=R.load(R.save(s),c);assert.deepEqual(R.unit(loaded,u.id).resistances,['cold']);u.resistances=['fake'];assert.throws(()=>R.load(R.save(s),c));u.resistances='fire';assert.throws(()=>R.load(R.save(s),c));
}
{
 const {c,s,u,t}=setup('cleric');t.scores.DEX=-30;t.resistances=['radiant'];cast(s,c,u,'sacredflame',{target:t.id});const row=R.diceFeed(s).rows.find(r=>r.label==='聖火傷害');assert.equal(t.hp,100-Math.floor(row.total/2));
}
{
 const {c,s,u,t}=setup('wizard'),b=R.unit(s,'enemy1');Object.assign(t,{x:9,y:7,damageImmunities:['fire']});Object.assign(b,{x:9,y:8,z:0,hp:100,maxHp:100,vulnerabilities:['fire'],scores:{...b.scores,DEX:-30}});cast(s,c,u,'burninghands',{aim:{x:10,y:7}});const row=R.diceFeed(s).rows.find(r=>r.label==='燃燒之手傷害');assert.equal(t.hp,100);assert.equal(b.hp,100-row.total*2);assert.equal(u.slots,1);
}
{
 const {c,s,u}=setup();u.hp=u.maxHp=100;u.z=20;u.resistances=['bludgeoning'];R.landAt(s,c,u,7,7);const row=R.diceFeed(s).rows.at(-1);assert.equal(u.hp,100-Math.floor(row.total/2));assert(u.prone);
}
{
 const {c,s,u,t}=setup();u.inspiration=true;t.resistances=['slashing'];assert(R.dispatch(s,c,{kind:'attack',actor:u.id,target:t.id,weapon:0}).ok);assert.equal(s.pending.kind,'inspiration');R.answer(s,c,false);assert.equal(t.hp,100);assert.equal(s.pending.mode,'sum');R.answer(s,c,0);const row=R.diceFeed(s).rows.find(r=>r.phase==='damage');assert.equal(R.unit(s,t.id).hp,100-Math.floor(row.total/2));assert.equal(R.unit(s,u.id).inspiration,false);assert.equal(R.unit(s,u.id).action,0);
}
console.log('✓ 十三類傷害、抗性／易傷順序與不疊加、免疫、武器／法術／範圍／逐發飛彈、專注與暫時 HP、瀕死、介面及存檔');
