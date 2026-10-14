import * as R from './engine.mjs';
// Development fixture only: uses the normal initiative and dispatch rules.
export function combatTest(c){
 c.map={...R.copy(c.map),walls:[],door:[0,0],cache:[0,9],foes:[[3,3],[5,3]],spawns:[[3,4],[4,4],[2,5],[5,5]]};
 const s=R.fresh(c,15);s.units.filter(u=>u.side==='party').forEach(u=>u.control='manual');s.door=true;
 R.beginCombat(s,c);R.log(s,'戰鬥測試：固定隊伍與場地，四名隊員均手動；敵人使用原有 AI。');return s;
}
