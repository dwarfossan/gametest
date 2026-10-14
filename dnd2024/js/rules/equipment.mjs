// Pure equipment planning. Weapon indices identify separate physical weapons.
export const heldWeapons=u=>u.heldWeapons??[0];
export const heldHands=u=>heldWeapons(u).reduce((n,i)=>n+(u.grips?.[i]===2?2:1),0);
export const twoHandGrip=(u,c,i)=>!!c.weapons[u.weapons[i]]?.twoHanded||!!c.weapons[u.weapons[i]]?.versatile&&u.grips?.[i]===2;
export const weaponDice=(u,c,i)=>twoHandGrip(u,c,i)&&c.weapons[u.weapons[i]].versatile?c.weapons[u.weapons[i]].versatile:c.weapons[u.weapons[i]].dice;
export const mainWeapon=u=>heldWeapons(u).includes(u.activeWeapon)?u.activeWeapon:heldWeapons(u)[0];
export const ownsShield=(u,c)=>c.presets.find(p=>p.id===u.id)?.shield??u.ownsShield??!!u.shield;
export function attackEquipment(u,c,index,{bonus=false,reaction=false,battle=true}={}){
 const w=c.weapons[u.weapons[index]];if(!w)return {error:'沒有這把武器'};if(u.droppedWeapons?.includes(index))return {error:'武器在地上，須先拾取'};
 let held=[...heldWeapons(u)],operations=[];
 if(twoHandGrip(u,c,index)&&u.shield)return {error:'雙手武器攻擊前須先卸盾（1 主要動作）'};
 if(bonus||reaction){if(!held.includes(index))return {error:'須先拔出並持握這把武器'};}
 else if(!held.includes(index)&&held.some(i=>u.grips?.[i]===2))return {error:'請先將兩用武器改為單手或收起'};
 else if(!held.includes(index))operations.push({kind:'draw',weapon:index});
 const others=held.filter(i=>i!==index),capacity=u.shield?1:2;
 const stow=twoHandGrip(u,c,index)?others:others.slice(0,Math.max(0,others.length+1-capacity));
 operations=[...stow.map(weapon=>({kind:'stow',weapon})),...operations];
 if((bonus||reaction)&&operations.length)return {error:'目前雙手占用，不能以此武器攻擊'};
 const free=operations.length>1;
 if(battle&&(operations.length>2||(free&&u.objectUsed)))return {error:'拔收次數不足；請先收起武器，或下回合再攻擊'};
 held=held.filter(i=>!stow.includes(i));if(!held.includes(index))held.push(index);
 return {held,operations,useObject:battle&&free};
}
export function gearProblem(u,c,a,battle){
 if(a.kind==='shield'){if(!ownsShield(u,c))return '沒有盾牌';if(!u.shield&&heldHands(u)>=2)return '須先空出一隻手';return battle&&!u.action?'穿卸盾牌需要 1 主要動作':'';}
 const held=heldWeapons(u),index=a.weapon;if(!Number.isInteger(index)||!c.weapons[u.weapons[index]])return '沒有這把武器';
 if(a.kind==='draw'){if(held.includes(index))return '已持握';if(heldHands(u)+(u.shield?1:0)>=2)return '雙手已占用，請先收起武器';}
 if(a.kind==='stow'&&!held.includes(index))return '未持握這把武器';
 return battle&&!u.attackGearAvailable&&u.objectUsed&&!u.action?'物件互動已用完，且沒有主要動作':'';
}
export function applyGear(u,c,a,battle){
 if(a.kind==='shield'){u.ownsShield=ownsShield(u,c);u.shield=!u.shield;if(battle)u.action--;return;}
 if(a.kind==='stow'&&u.grips)delete u.grips[a.weapon];
 u.heldWeapons=a.kind==='draw'?[...heldWeapons(u),a.weapon]:heldWeapons(u).filter(i=>i!==a.weapon);
 if(a.kind==='draw')u.activeWeapon=a.weapon;
 if(battle){if(u.attackGearAvailable)u.attackGearAvailable=false;else if(u.objectUsed)u.action--;else u.objectUsed=true;}
}
export function meleeWeapon(u,c){return heldWeapons(u).find(i=>{const w=c.weapons[u.weapons[i]];return w&&!w.range&&!attackEquipment(u,c,i,{reaction:true}).error;});}
