export const tileTerrain=(c,p)=>(c.map.elevations||[]).find(t=>t.x===p.x&&t.y===p.y);
export const isGap=(c,p)=>(c.map.gaps||[]).some(([x,y])=>x===p.x&&y===p.y);
export const heightAt=(c,p)=>tileTerrain(c,p)?.height??(isGap(c,p)?-(c.map.gapDepth||10):0);
export const horizontal=(a,b)=>Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y));
export const heightOf=(c,p)=>Number.isFinite(p.z)?p.z:heightAt(c,p);
export const terrainDescription=(c,p)=>{const t=tileTerrain(c,p),h=heightAt(c,p);if(c.map.walls.some(([x,y])=>x===p.x&&y===p.y))return `石牆 · 高 ${c.map.wallHeight||15} 呎\n不能通行；遮擋視線。`;if(isGap(c,p))return `裂隙 · 深 ${-h} 呎\n須跳過，或明確選擇下落；墜落每十呎造成 1d6 傷害。`;if(t)return `${t.surface==='rock'?'岩壁':'高台'} · 高 ${h} 呎\n攀爬每呎花 ${t.difficult?3:2} 呎移動${t.climbDC?'；運動 DC '+t.climbDC:'；抓點充足，無須檢定'}。${t.parapet?'\n石欄對低處攻擊提供半掩護。':''}`;if((c.map.difficult||[]).some(([x,y])=>x===p.x&&y===p.y))return '碎石 · 困難地形\n每格十呎；爬行每格十五呎。跳躍落地需 DC 10 特技檢定。';return '';};
