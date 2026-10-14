import {mainWeapon,heldWeapons} from '../rules/equipment.mjs?v=20261014.21';
import {humanLook,dollSVG,DOLL_DUR} from '../art/fuwa-paperdoll.mjs';
const weaponArt={longsword:'sword',shortsword:'shortsword',longbow:'longbow',shortbow:'bow',quarterstaff:'quarterstaff',mace:'mace',scimitar:'scimitar',lightcrossbow:'crossbow',none:null};
const armorArt={chain:'鏈甲',chainshirt:'鏈甲衫',leather:'皮甲',none:null};
let serial=0;
export function normalizeAppearance(a={}){return {sex:a.sex==='female'?'female':'male',hair:/^(0[1-9]|10)$/.test(a.hair)?a.hair:'01',beard:['braid','full','none','long'].includes(a.beard)?a.beard:'braid',hairColor:/^#[0-9a-f]{6}$/i.test(a.hairColor||'')?a.hairColor:'#171717'};}
export function paperDollHTML(u={},opts={}){
 const a=normalizeAppearance(opts.appearance||u.appearance),species=opts.species||u.species||'human',lineage=u.speciesOptions?.lineage||'high',beard=species==='elf'?null:{braid:'05',full:'03',long:'04',none:null}[a.beard];
 const look=humanLook({sex:a.sex,hair:a.hair,beard,ears:species==='elf'?'elf':'human',hairColor:a.hairColor,beardColor:'#171717',skin:species==='elf'&&lineage==='drow'?'#796789':'#e8bb9b'});
 const raw=dollSVG({id:u.id||'preview',look,main:weaponArt[opts.weapon??u.weapons?.[mainWeapon(u)]??'none'],off:(opts.shield??u.shield)?'shield':weaponArt[u.weapons?.[heldWeapons(u).find(i=>i!==mainWeapon(u))]]||null,armor:armorArt[opts.armor??u.armor??'none'],face:opts.face??-1,down:!!u.dead||u.hp===0,prone:!!u.prone,x:0,y:0,w:140,seed:0});
 const sid='fuwa'+(++serial);
 return raw.replace('class="doll','data-rig data-unit="'+(['fighter','rogue','cleric','wizard'].includes(u.id)?u.id:'')+'" data-species="'+species+'" data-motion="idle" class="portrait fuwa-doll doll').replace(/id="([^"]+)"/g,(_,name)=>`id="${sid}-${name}"`);
}
export function playMotion(container,motion,unitId=null){const k=({block:'guard',slash:'slash',shoot:'shoot',walk:'walk',cast:'cast'})[motion];if(!k)return;container.querySelectorAll('[data-rig]:not(.dl-down)').forEach(el=>{if(unitId&&el.dataset.unit!==unitId)return;const act=el.querySelector('.dl-act');if(!act)return;clearTimeout(el._motionTimer);act.className.baseVal='dl-act';void el.getBoundingClientRect();act.classList.add('act-'+k);act.style.setProperty('--d','0ms');el.dataset.motion=motion;el._motionTimer=setTimeout(()=>{act.classList.remove('act-'+k);el.dataset.motion='idle';},DOLL_DUR[k]||600);});}
