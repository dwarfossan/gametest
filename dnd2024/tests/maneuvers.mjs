import fs from 'node:fs';import assert from 'node:assert/strict';import * as R from '../js/rules/engine.mjs';import {combatTest} from '../js/rules/combat-test.mjs';import {movementRange} from '../js/rules/movement.mjs';
const original=JSON.parse(fs.readFileSync(new URL('../data/catalog.json',import.meta.url)));
function setup(){const c=R.copy(original),s=combatTest(c),u=R.unit(s,'fighter'),t=R.unit(s,'enemy0');c.map.walls=[];s.door=true;u.x=5;u.y=5;t.x=6;t.y=5;t.scores.STR=-40;t.scores.DEX=-40;u.shield=false;u.heldWeapons=[];return {s,c,u,t};}
{
 const {s,c,u,t}=setup();u.shield=true;u.heldWeapons=[0];const before=R.copy(s);assert(!R.dispatch(s,c,{kind:'grapple',actor:u.id,target:t.id}).ok);assert.deepEqual(s,before);
 assert(R.dispatch(s,c,{kind:'shove',effect:'prone',actor:u.id,target:t.id}).ok);assert(t.prone);assert.equal(u.action,0);assert.equal(t.hp,t.maxHp);
}
{
 const {s,c,u,t}=setup();assert(R.dispatch(s,c,{kind:'shove',effect:'push',actor:u.id,target:t.id}).ok);assert.equal(t.x,7);assert.equal(t.reaction,1);
}
{
 const {s,c,u,t}=setup();c.map.walls=[[7,5]];R.dispatch(s,c,{kind:'shove',effect:'push',actor:u.id,target:t.id});assert.equal(t.x,6);
}
{
 const {s,c,u,t}=setup();R.dispatch(s,c,{kind:'grapple',actor:u.id,target:t.id});assert.equal(t.grapples[0].actor,u.id);assert.equal(u.action,0);
 const range=movementRange(s,c,u.id);assert.equal(range.get('4,5').cost,10);assert.equal(range.get('4,5').path.length,1);
 assert(R.dispatch(s,c,{kind:'move',actor:u.id,x:4,y:5}).ok);assert.equal(t.x,5);assert.equal(u.move,20);
 u.action=1;assert(R.dispatch(s,c,{kind:'draw',actor:u.id,weapon:0}).ok);const snapshot=R.copy(s);assert(!R.dispatch(s,c,{kind:'draw',actor:u.id,weapon:1}).ok);assert.deepEqual(s,snapshot);
 assert(R.dispatch(s,c,{kind:'release',actor:u.id}).ok);assert.equal(t.grapples.length,0);assert.equal(u.action,1);
}
{
 const {s,c,u,t}=setup();R.dispatch(s,c,{kind:'grapple',actor:u.id,target:t.id});s.order=[t.id,u.id];s.turn=0;t.action=1;t.move=30;
 assert(!R.dispatch(s,c,{kind:'move',actor:t.id,x:7,y:5}).ok);t.scores.STR=50;t.scores.DEX=50;
 assert(R.dispatch(s,c,{kind:'escape',actor:t.id}).ok);assert.equal(t.action,0);assert.equal(t.grapples.length,0);
}
{
 const {s,c,u,t}=setup();t.size='huge';const before=R.copy(s);assert(!R.dispatch(s,c,{kind:'shove',effect:'prone',actor:u.id,target:t.id}).ok);assert.deepEqual(s,before);
}
console.log('Maneuvers: occupied hands, size limits, no damage, shove obstacle/OA, grapple drag cost and range, hand reservation, free release and action escape passed');
