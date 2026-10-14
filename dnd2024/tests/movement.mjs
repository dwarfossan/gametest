import fs from 'node:fs';import assert from 'node:assert/strict';import * as R from '../js/rules/engine.mjs';import {combatTest} from '../js/rules/combat-test.mjs';import {movementRange,planWalk,advanceWalk} from '../js/rules/movement.mjs';
const base=JSON.parse(fs.readFileSync(new URL('../data/catalog.json',import.meta.url)));
function setup(){const c=R.copy(base),s=combatTest(c),u=R.unit(s,'fighter');u.x=1;u.y=1;s.units.filter(t=>t.id!==u.id).forEach((t,i)=>{t.x=10+i;t.y=12;});return {s,c,u};}
{
 const {s,c,u}=setup(),before=R.copy(s),range=movementRange(s,c,u.id);assert.equal(range.get('7,1').cost,30);assert(!range.has('8,1'));assert.deepEqual(s,before);assert.equal(c.map.width,16);assert.equal(c.map.height,16);assert(!planWalk(s,c,u.id,16,1).ok);assert.deepEqual(s,before);
}
{
 const {s,c,u}=setup();c.map.walls=[[2,1],[2,2]];const range=movementRange(s,c,u.id);assert.equal(range.get('3,1').cost,20);assert(!range.has('2,1'));u.move=5;c.map.walls=[[2,1],[1,2]];assert(!movementRange(s,c,u.id).has('2,2'));
}
{
 const {s,c,u}=setup();R.unit(s,'rogue').x=2;R.unit(s,'rogue').y=1;assert(!movementRange(s,c,u.id).has('2,1'));u.move=0;assert.equal(movementRange(s,c,u.id).size,1);assert(!planWalk(s,c,u.id,2,2).ok);s.turn=s.order.indexOf('enemy0');assert.equal(movementRange(s,c,u.id).size,0);
}
{
 const {s,c,u}=setup(),seed=s.seed,walk=planWalk(s,c,u.id,4,1).walk;assert.equal(advanceWalk(s,c,walk).status,'done');assert.equal(u.x,4);assert.equal(u.move,15);assert.equal(s.seed,seed);assert.equal(u.action,1);
}
{
 const {s,c,u}=setup(),walk=planWalk(s,c,u.id,4,1).walk;assert.equal(advanceWalk(s,c,walk,1).status,'moving');assert.equal(u.x,2);assert.equal(u.move,25);c.map.walls.push([3,1]);const before=R.copy(s);assert.equal(advanceWalk(s,c,walk).status,'stopped');assert.deepEqual(s,before);
}
{
 const {s,c}=setup(),u=R.unit(s,'wizard');u.x=2;u.y=2;s.turn=s.order.indexOf(u.id);u.move=30;s.seed=1;const enemy=R.unit(s,'enemy0');enemy.x=1;enemy.y=2;enemy.reaction=1;
 const walk=planWalk(s,c,u.id,4,2).walk;assert.equal(advanceWalk(s,c,walk,1).status,'reaction');assert.equal(s.pending.kind,'shield');assert.equal(u.move,30);assert.equal(u.x,2);
 R.answer(s,c,true);assert.equal(u.x,3);assert.equal(u.move,25);assert.equal(u.slots,1);const seed=s.seed;assert.equal(advanceWalk(s,c,walk).status,'done');assert.equal(u.x,4);assert.equal(u.move,20);assert.equal(u.slots,1);assert.equal(s.seed,seed);
}
console.log('Movement: complete range, wall detours, corners, occupancy, budget, no side effects, per-step cost, dynamic interruption and shield resume passed');
