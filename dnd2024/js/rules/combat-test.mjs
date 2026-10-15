import * as R from './engine.mjs?v=20261015.45';
// Development fixture only: uses the normal initiative and dispatch rules.
export function combatTest(c){
 c.map={...R.copy(c.map),width:16,height:16,walls:[[3,7],[3,8],[3,9],[3,10],[3,11]],difficult:[[5,8],[5,9],[5,10]],gaps:[[11,10],[11,11],[11,12]],elevations:[{x:3,y:10,height:5,surface:"wall"},{x:3,y:11,height:5,surface:"wall",narrow:true,balanceDC:10},{x:5,y:11,height:5},{x:6,y:11,height:5},{x:5,y:12,height:5},{x:6,y:12,height:5},{x:10,y:3,height:10,parapet:true},{x:11,y:3,height:10,parapet:true},{x:10,y:4,height:10},{x:11,y:4,height:10},{x:12,y:6,height:15,surface:'rock',climbDC:15},{x:12,y:7,height:15,surface:'rock',climbDC:15}],wallHeight:15,gapDepth:10,door:[0,0],cache:[0,15],foes:[[7,6],[10,6]],spawns:[[7,9],[8,9],[6,10],[9,10]]};
 const s=R.fresh(c,15);s.units.filter(u=>u.side==='party').forEach(u=>{u.control='manual';u.inventory={...u.inventory,healingPotion:3,net:2,quiver:1,boltCase:1,ammoPouch:1,adventureKit:1,componentPouch:1};});s.door=true;
 R.beginCombat(s,c);R.log(s,'戰鬥測試：固定隊伍與場地，四名隊員均手動；敵人使用原有 AI。');return s;
}
