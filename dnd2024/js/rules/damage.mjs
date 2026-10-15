import {hasCondition} from './conditions.mjs?v=20261016.47';
// Typed damage, after save/other modifiers, before temporary HP and concentration.
export const damageTypes=Object.freeze({acid:'強酸',bludgeoning:'鈍擊',cold:'寒冷',fire:'火焰',force:'力場',lightning:'閃電',necrotic:'黯蝕',piercing:'穿刺',poison:'毒素',psychic:'心靈',radiant:'光耀',slashing:'揮砍',thunder:'雷鳴'});
export const damageTraitKeys=Object.freeze({resistances:'抗性',damageImmunities:'免疫',vulnerabilities:'易傷'});
const has=(u,key,type)=>(u[key]||[]).includes(type)||(u[key]||[]).includes('all');
export function damageProfile(u,n,type){if(!Object.hasOwn(damageTypes,type))throw Error('未知傷害類型：'+type);const raw=Math.max(0,Math.floor(n)),immune=has(u,'damageImmunities',type),resistant=has(u,'resistances',type)||hasCondition(u,'petrified'),vulnerable=has(u,'vulnerabilities',type);let amount=raw;if(immune)amount=0;else{if(resistant)amount=Math.floor(amount/2);if(vulnerable)amount*=2;}return {raw,amount,type,immune,resistant,vulnerable};}
export function damageText(u,n,type){const p=damageProfile(u,n,type),reasons=p.immune?['免疫']:[...(p.resistant?['抗性']:[]),...(p.vulnerable?['易傷']:[])];return `${p.amount} ${damageTypes[type]}傷害${reasons.length?'（'+reasons.join('→')+'：'+p.raw+'→'+p.amount+'）':''}`;}
export const damageTraits=u=>Object.entries(damageTraitKeys).filter(([key])=>u[key]?.length).map(([key,name])=>name+'：'+[...new Set(u[key])].map(k=>k==='all'?'所有傷害':damageTypes[k]).join('、'));
export function validDamageTraits(u){return Object.keys(damageTraitKeys).every(key=>u[key]===undefined||Array.isArray(u[key])&&u[key].every(k=>k==='all'||Object.hasOwn(damageTypes,k)));}
