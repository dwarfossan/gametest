import {hasCondition} from './conditions.mjs?v=20261016.47';
export const items={healingPotion:{name:'治療藥水',weight:.5,description:'附贈動作：自己飲用，或餵給五呎內生物，恢復 2d4＋2 生命。'},net:{name:'網子',weight:3,description:'取代一次攻擊：投向十五呎內可見生物。敏捷豁免 DC＝8＋敏捷調整值＋熟練加值，失敗陷入束縛；巨型以上自動成功。目標或五呎內生物可花主要動作做 DC 10 運動檢定解除。網子 AC 10、HP 5，免疫鈍擊、毒素、心靈傷害。'}};
export const inventory=u=>u.inventory||{};
export const restrained=u=>hasCondition(u,'restrained');
export const weaponDamageType=k=>['mace','quarterstaff'].includes(k)?'bludgeoning':['longsword','scimitar'].includes(k)?'slashing':'piercing';

export function removeNet(u){const extra=u.net?.extra||[];if(extra.length)u.net={hp:extra[0].hp,extra:extra.slice(1)};else delete u.net;}

// User-approved possession rules: containers replace ordinary ammunition counts.
Object.assign(items,{
 quiver:{name:'箭袋',weight:1,passive:true,ammoFor:'bow',description:'持有生效：滿足弓的普通箭矢需求，不逐發消耗。'},
 boltCase:{name:'矢匣',weight:1.5,passive:true,ammoFor:'crossbow',description:'持有生效：滿足弩的普通弩矢需求，不逐發消耗；裝填限制仍保留。'},
 ammoPouch:{name:'彈袋',weight:1,passive:true,ammoFor:'pouch',description:'持有生效：供應投石索鉛彈、吹箭針、火槍與手槍普通子彈，不逐發消耗。'},
 adventureKit:{name:'冒險套裝',weight:55,passive:true,contains:['背包','睡袋','油（2 瓶）','口糧（1 天）','繩索（50 呎）','火絨盒','火把','水袋'],description:'持有生效：沿用毛絨絨探險者套組。涵蓋背包、睡袋、油（2 瓶）、口糧（10 天）、繩索（50 呎）、火絨盒、火把（10 支）、水袋；視為有對應物品、不逐個消耗。檢定仍照常。'},
 componentPouch:{name:'施法材料包',weight:2,passive:true,description:'持有生效：供應無標價且不會被消耗的一般施法材料。有標價或需消耗材料另查；言語、姿勢及空手需求不會被略過。'},
 holySymbol:{name:'聖徽',weight:1,passive:true,valueGP:5,description:'價值至少 5 金幣的聖徽。滿足祝福術特殊材料需求，不消耗；材料包不能代替。'}
});
const aliases={'繩索':'繩索（50 呎）','繩子':'繩索（50 呎）','口糧':'口糧（1 天）','油':'油（2 瓶）','冒險套裝':'冒險套裝'};
export function hasGear(u,name){const normalized=aliases[name]||name;return Object.entries(inventory(u)).some(([key,n])=>n>0&&items[key]&&(key===name||items[key].name===normalized||items[key].contains?.includes(normalized)));}
export const ammoContainer=(c,key)=>({bow:'quiver',crossbow:'boltCase',pouch:'ammoPouch'}[c.weapons[key]?.ammoFor]||c.weapons[key]?.ammoFor)||({longbow:'quiver',shortbow:'quiver',lightcrossbow:'boltCase',handcrossbow:'boltCase',heavycrossbow:'boltCase',sling:'ammoPouch',blowgun:'ammoPouch',musket:'ammoPouch',pistol:'ammoPouch'})[key];
export function ammoProblem(u,c,key){const container=ammoContainer(c,key);return container&&!hasGear(u,container)?'需要道具欄持有'+(items[container]?.name||container):'';}
export function startingInventory(c,u){const list={adventureKit:1};for(const key of u.weapons||[]){const container=ammoContainer(c,key);if(container)list[container]=1;}if(u.cantrips){list.componentPouch=1;if(u.class==='cleric')list.holySymbol=1;}return list;}
