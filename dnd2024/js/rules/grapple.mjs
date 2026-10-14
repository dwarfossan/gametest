import {heldWeapons} from './equipment.mjs?v=20261014.20';
export const sizeRank=u=>({tiny:0,small:1,medium:2,large:3,huge:4,gargantuan:5}[u.size||'medium']??2);
export const grapplers=(s,u)=>(u.grapples||[]).filter(g=>{const p=s.units.find(v=>v.id===g.actor);return p&&p.hp>0&&!p.dead&&Math.max(Math.abs(p.x-u.x),Math.abs(p.y-u.y))<=1;});
export const grabbed=(s,u)=>grapplers(s,u).length>0;
export const heldTargets=(s,u)=>s.units.filter(t=>t.hp>0&&!t.dead&&grapplers(s,t).some(g=>g.actor===u.id));
export const handsUsed=(s,u)=>heldWeapons(u).length+(u.shield?1:0)+heldTargets(s,u).length;
export const moveCost=(s,u)=>heldTargets(s,u).some(t=>sizeRank(t)>0&&sizeRank(u)-sizeRank(t)<2)?10:5;
export function cleanGrapples(s){for(const t of s.units)t.grapples=t.hp>0&&!t.dead?grapplers(s,t):[];}
