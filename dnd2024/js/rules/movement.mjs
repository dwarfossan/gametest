import {moveCost,heldTargets} from './grapple.mjs?v=20261014.23';
import * as R from './engine.mjs?v=20261014.27';
const directions=[[0,-1],[1,0],[0,1],[-1,0],[1,-1],[1,1],[-1,1],[-1,-1]];
// Search through the same single-step validator used by dispatch and AI.
// No dice or game-state mutation is needed to display movement range.
export function movementRange(s,c,actor){
 const u=R.unit(s,actor),out=new Map();
 if(s.page!=='battle'||s.pending||!u||!R.alive(u)||R.current(s)?.id!==actor)return out;
 const start={x:u.x,y:u.y,cost:0,path:[]};out.set(`${u.x},${u.y}`,start);const queue=[start];
 for(let i=0;i<queue.length;i++){
  const at=queue[i];if(at.cost+moveCost(s,u)>u.move)continue;
  const virtual={...s,units:s.units.map(t=>t.id===actor?{...u,x:at.x,y:at.y}:heldTargets(s,u).includes(t)?{...t,x:t.x+at.x-u.x,y:t.y+at.y-u.y}:t)};
  for(const [dx,dy] of directions){const x=at.x+dx,y=at.y+dy,key=`${x},${y}`;
   if(out.has(key)||R.validate(virtual,c,{kind:'move',actor,x,y}))continue;
   const next={x,y,cost:at.cost+moveCost(s,u),path:[...at.path,{x,y}]};out.set(key,next);queue.push(next);
  }
 }
 return out;
}
export function planWalk(s,c,actor,x,y){
 const cell=movementRange(s,c,actor).get(`${x},${y}`),u=R.unit(s,actor);
 if(!cell?.path.length)return {ok:false,error:'該格不可到達，或剩餘移動不足'};
 return {ok:true,walk:{actor,start:{x:u.x,y:u.y},path:cell.path,index:0}};
}
// A reaction may finish the in-flight step inside R.answer. Resume from its
// resulting position, without dispatching that step or charging it twice.
export function advanceWalk(s,c,walk,maxSteps=Infinity){
 let steps=0;
 while(walk.index<walk.path.length){
  if(s.pending)return {status:'reaction'};
  const u=R.unit(s,walk.actor);
  if(s.page!=='battle'||!u||!R.alive(u)||R.current(s)?.id!==walk.actor)return {status:'stopped',error:'移動已中斷'};
  const step=walk.path[walk.index],previous=walk.index?walk.path[walk.index-1]:walk.start;
  if(u.x===step.x&&u.y===step.y){walk.index++;continue;}
  if(u.x!==previous.x||u.y!==previous.y)return {status:'stopped',error:'位置已改變，請重新選擇目的地'};
  const r=R.dispatch(s,c,{kind:'move',actor:walk.actor,...step});
  if(!r.ok)return {status:'stopped',error:r.error};
  if(s.pending)return {status:'reaction'};
  if(u.x!==step.x||u.y!==step.y)return {status:'stopped',error:'移動已中斷'};
  walk.index++;steps++;
  if(steps>=maxSteps&&walk.index<walk.path.length)return {status:'moving'};
 }
 return {status:'done'};
}
