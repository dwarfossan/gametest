import {hasGear,items,inventory} from './items.mjs?v=20261014.23';
import {handsUsed} from './grapple.mjs?v=20261014.23';
export function componentProblem(s,u,sp){
 const components=sp.components||'';
 if(components.includes('V')&&(u.silenced||u.statuses?.some(v=>(v.k||v)==='silenced')))return '言語成分需要能說話';
 if(components.includes('S')&&handsUsed(s,u)>=2&&!u.warCaster)return '姿勢成分需要空手';
 if(components.includes('M')){
  if(handsUsed(s,u)>=2)return '取用施法材料需要空手';
  if(sp.materialItem){if(!hasGear(u,sp.materialItem)||(items[sp.materialItem]?.valueGP||0)<(sp.materialCost||0))return '缺少特殊材料：'+sp.materialName;}
  else if(sp.materialCost||sp.materialConsumed)return '特殊或消耗材料尚未配置，材料包不能代替';
  else if(!hasGear(u,'componentPouch'))return '需要道具欄持有施法材料包';
 }
 return '';
}
