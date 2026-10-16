const $=id=>document.getElementById(id),stage=$('stage');
const rigs={
 tall:{view:'0 0 550 1024',left:'20,180 165,180 148,299 116,409 109,583 15,583',right:'379,180 489,180 520,440 515,585 409,585 390,405 380,300',torso:'165,0 379,0 407,180 380,300 390,425 118,425 148,299 165,180',lower:'110,410 395,410 409,585 500,595 500,750 530,800 530,1024 0,1024 0,583 109,583',lp:[132,230],rp:[415,235]},
 dwarf:{view:'500 150 600 874',left:'560,370 640,330 645,440 610,552 607,692 505,692 505,600 525,500 540,420',right:'933,328 1034,350 1094,697 986,697 952,553 939,440',torso:'640,150 937,150 959,328 939,440 952,568 610,568 645,440 640,330',lower:'610,553 952,553 986,697 1100,697 1100,1024 530,1024 530,880 555,760 570,692 607,692',lp:[615,395],rp:[980,395]}
};
let breath=true,paused=false,current='idle';
const labels={idle:'待機',slash:'揮砍',block:'格擋',shoot:'射擊',cast:'施法',jump:'跳躍',hurt:'受擊'};
function render(){
 const r=rigs[$('body').value],img='<image href="./assets/paperdoll/source.png" width="1536" height="1024"/>';
 const clip=(name,points)=>`<clipPath id="clip-${name}"><polygon points="${points}"/></clipPath>`;
 const part=(name)=>`<g clip-path="url(#clip-${name})">${img}</g>`;
 stage.innerHTML=`<svg viewBox="${r.view}" role="img" aria-label="原圖紙娃娃動作預覽"><defs>${['left','right','torso','lower'].map(k=>clip(k,r[k])).join('')}</defs><g class="facing"><g class="lower">${part('lower')}</g><g class="upper"><g class="torso">${part('torso')}</g><g class="arm left" style="transform-origin:${r.lp[0]}px ${r.lp[1]}px">${part('left')}</g><g class="arm right" style="transform-origin:${r.rp[0]}px ${r.rp[1]}px">${part('right')}</g></g></g></svg>`;
 stage.classList.toggle('mirror',$('face').value==='1');stage.classList.toggle('still',!breath);stage.classList.toggle('paused',paused);setMotion(current);update();
}
function setMotion(m){current=m;stage.dataset.motion='idle';void stage.offsetWidth;stage.dataset.motion=m;$('result').textContent=labels[m]+' · 原圖遮罩分件測試';}
function update(){stage.style.setProperty('--left',`${$('left').value}deg`);stage.style.setProperty('--right',`${$('right').value}deg`);$('leftValue').textContent=$('left').value+'°';$('rightValue').textContent=$('right').value+'°';}
$('body').onchange=render;$('face').onchange=render;
for(const id of ['left','right'])$(id).oninput=()=>{setMotion('idle');update();};
$('actions').onclick=e=>{if(e.target.dataset.motion)setMotion(e.target.dataset.motion);};
$('breath').onclick=()=>{breath=!breath;stage.classList.toggle('still',!breath);$('breath').textContent=breath?'呼吸：開':'呼吸：關';};
$('pause').onclick=()=>{paused=!paused;stage.classList.toggle('paused',paused);$('pause').textContent=paused?'繼續':'暫停';};
$('reset').onclick=()=>{breath=true;paused=false;current='idle';$('body').selectedIndex=0;$('face').selectedIndex=0;$('left').value=0;$('right').value=0;$('breath').textContent='呼吸：開';$('pause').textContent='暫停';render();};
render();
