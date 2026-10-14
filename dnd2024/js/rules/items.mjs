export const items={healingPotion:{name:'治療藥水',weight:.5,description:'附贈動作：自己飲用，或餵給五呎內生物，恢復 2d4＋2 生命。'},net:{name:'網子',weight:3,description:'取代一次攻擊：投向十五呎內可見生物。敏捷豁免 DC＝8＋敏捷調整值＋熟練加值，失敗陷入束縛；巨型以上自動成功。目標或五呎內生物可花主要動作做 DC 10 運動檢定解除。網子 AC 10、HP 5，免疫鈍擊、毒素、心靈傷害。'}};
export const inventory=u=>u.inventory||{};
export const restrained=u=>!!u.net;
export const weaponDamageType=k=>['mace','quarterstaff'].includes(k)?'bludgeoning':['longsword','shortsword','scimitar'].includes(k)?'slashing':'piercing';

export function removeNet(u){const extra=u.net?.extra||[];if(extra.length)u.net={hp:extra[0].hp,extra:extra.slice(1)};else delete u.net;}
