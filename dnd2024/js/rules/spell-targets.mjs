import {heightAt} from './terrain.mjs?v=20261015.35';
// Adapted interaction from fuwafuwatavern boardMarkState/coneTiles: floor aim,
// marked cells and independently selected darts. Geometry follows this game's
// 5-foot grid: cell centers; cone width equals forward distance (not 90 degrees).
export const areaKind=sp=>['cone','cube'].includes(sp?.kind);
export function areaDirection(u,p){const n=Math.hypot(p.x-u.x,p.y-u.y);return n?{dx:(p.x-u.x)/n,dy:(p.y-u.y)/n}:null;}
export function areaContains(u,p,kind,aim){const d=areaDirection(u,aim);if(!d)return false;const x=p.x-u.x,y=p.y-u.y,f=x*d.dx+y*d.dy,side=Math.abs(x*d.dy-y*d.dx),z=((p.z??u.z??0)-(u.z||0))/5;if(f<=0||f>3+1e-8)return false;return kind==='cone'?Math.hypot(side,z)<=f/2+1e-8:side<=1+1e-8&&Math.abs(z)<=1+1e-8;}
export function areaCells(c,u,kind,aim,visible){const out=[];if(!aim||!areaDirection(u,aim))return out;for(let y=0;y<c.map.height;y++)for(let x=0;x<c.map.width;x++){const p={x,y,z:heightAt(c,{x,y})};if(areaContains(u,p,kind,aim)&&visible(u,p))out.push(p);}return out;}
