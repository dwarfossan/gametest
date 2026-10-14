import fs from 'node:fs';import assert from 'node:assert/strict';import * as R from '../js/rules/engine.mjs';import {combatTest} from '../js/rules/combat-test.mjs';
const original=JSON.parse(fs.readFileSync(new URL('../data/catalog.json',import.meta.url)));
function setup(){const c=R.copy(original),s=combatTest(c),u=R.unit(s,'fighter'),t=R.unit(s,'enemy0');c.map.walls=[];s.door=true;u.x=5;u.y=5;t.x=6;t.y=5;t.scores.STR=-40;t.scores.DEX=-40;u.shield=false;u.heldWeapons=[0];t.heldWeapons=[0];return {s,c,u,t};}
{
 const {s,c,u,t}=setup(),hp=t.hp;assert(R.dispatch(s,c,{kind:'disarm',actor:u.id,target:t.id,weapon:0,item:0}).ok);assert.equal(u.action,0);assert.equal(t.hp,hp);assert.deepEqual(t.heldWeapons,[]);assert.equal(s.groundItems.length,1);assert.equal(s.groundItems[0].x,t.x);assert(R.validate(s,c,{kind:'draw',actor:u.id,weapon:1})==='');
 s.order=[t.id,u.id];s.turn=0;t.action=1;t.objectUsed=false;t.attackGearAvailable=false;
 const before=R.copy(s);assert(!R.dispatch(s,c,{kind:'attack',actor:t.id,target:u.id,weapon:0}).ok);assert.deepEqual(s,before);
 assert(R.dispatch(s,c,{kind:'pickup',actor:t.id,item:s.groundItems[0].id}).ok);assert.equal(t.objectUsed,true);assert.equal(t.action,1);assert.deepEqual(t.heldWeapons,[0]);assert.equal(s.groundItems.length,0);
}
{
 const {s,c,u,t}=setup();R.dispatch(s,c,{kind:'disarm',actor:u.id,target:t.id,weapon:0});u.heldWeapons=[];assert(R.dispatch(s,c,{kind:'pickup',actor:u.id,item:s.groundItems[0].id}).ok);assert(u.weapons.length>2);assert(R.validate(s,c,{kind:'draw',actor:t.id,weapon:0}));assert.equal(s.groundItems.length,0);
}
{
 const {s,c,u,t}=setup();t.x=10;const before=R.copy(s);assert(!R.dispatch(s,c,{kind:'disarm',actor:u.id,target:t.id,weapon:0}).ok);assert.deepEqual(s,before);
}
{
 const {s,c,u,t}=setup();t.weapons[0]='longbow';const expected=R.copy(s);R.rng(expected);R.rng(expected);R.rng(expected);R.dispatch(s,c,{kind:'disarm',actor:u.id,target:t.id,weapon:0});assert.equal(s.seed,expected.seed); // two attack dice for two-handed target, one defense die
}
{
 const {s,c,u,t}=setup();t.size='large';const expected=R.copy(s);R.rng(expected);R.rng(expected);R.rng(expected);R.dispatch(s,c,{kind:'disarm',actor:u.id,target:t.id,weapon:0});assert.equal(s.seed,expected.seed); // defense advantage for larger target
}
{
 const {s,c,u,t}=setup();const preview=R.copy(s);const a=R.rng(preview),b=R.rng(preview);u.scores.STR=10;t.scores.STR=t.scores.DEX=10+2*(a+2-b);const hp=t.hp;R.dispatch(s,c,{kind:'disarm',actor:u.id,target:t.id,weapon:0});assert.equal(s.groundItems?.length||0,0);assert.deepEqual(t.heldWeapons,[0]);assert.equal(t.hp,hp);
}
console.log('Disarm: no damage, contested tie, two-hand disadvantage, size advantage, invalid atomicity, weapon drop, pickup cost and no duplicated inventory passed');
