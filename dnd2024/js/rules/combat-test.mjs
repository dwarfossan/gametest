import * as R from './engine.mjs?v=20261014.20';
// Development fixture only: uses the normal initiative and dispatch rules.
export function combatTest(c){
 c.map={...R.copy(c.map),width:16,height:16,walls:[],door:[0,0],cache:[0,15],foes:[[7,6],[10,6]],spawns:[[7,9],[8,9],[6,10],[9,10]]};
 const s=R.fresh(c,15);s.units.filter(u=>u.side==='party').forEach(u=>u.control='manual');s.door=true;
 R.beginCombat(s,c);R.log(s,'戰鬥測試：固定隊伍與場地，四名隊員均手動；敵人使用原有 AI。');return s;
}
