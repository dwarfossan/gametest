import {current,alive,distance,validate,unit} from '../rules/engine.mjs?v=20261014.27';
// No hidden state access: visible targets only; returns a command, never mutates rules.
export function choose(s,c){const u=current(s);if(!u)return null;const intent=(kind,extra={})=>({actor:u.id,kind,...extra}),legal=a=>!validate(s,c,a);const freeNet=intent('netescape',{target:u.id});if(legal(freeNet))return freeNet;const escape=intent('escape');if(legal(escape))return escape;if(u.prone){const a=intent('stand');if(legal(a))return a;}
 for(const item of s.groundItems||[]){const a=intent('pickup',{item:item.id});if(item.owner===u.id&&legal(a))return a;}if(u.class==='fighter'&&u.hp<u.maxHp/2){const a=intent('secondwind');if(legal(a))return a;}
 const allies=s.units.filter(t=>t.side===u.side&&!t.dead&&t.hp<t.maxHp/2).sort((a,b)=>a.hp-b.hp);
 for(const t of allies){const a=intent('spell',{spell:'healingword',target:t.id});if(legal(a))return a;}
 const targets=s.units.filter(t=>t.side!==u.side&&alive(t)&&!t.hidden&&s.found).sort((a,b)=>a.hp-b.hp||distance(u,a)-distance(u,b));
 for(const t of targets){for(const spell of ['magicmissile','sacredflame','firebolt']){const a=intent('spell',{spell,target:t.id});if(legal(a))return a;}for(let weapon=0;weapon<u.weapons.length;weapon++){const a=intent('attack',{target:t.id,weapon});if(legal(a))return a;}}
 if(!targets.length){const a=intent('detect');if(legal(a))return a;}
 if(u.action&&targets.length&&u.move>0){const t=targets.slice().sort((a,b)=>distance(u,a)-distance(u,b))[0];const moves=[];for(let x=u.x-1;x<=u.x+1;x++)for(let y=u.y-1;y<=u.y+1;y++){const a=intent('move',{x,y});if(legal(a)&&distance(a,t)<distance(u,t))moves.push(a);}moves.sort((a,b)=>distance(a,t)-distance(b,t));if(moves[0])return moves[0];}
 if(u.action){const a=intent('dodge');if(legal(a))return a;}return intent('end');}
