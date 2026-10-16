// Based on fuwafuwatavern dev 526d849; human characters retain hands without visible arms.
const MONSTER_LOOK={};
const ITEMS=[];
const leveling=()=>false; // dnd2024 currently has no level-up presentation.
/* 基礎裝備圖示（14 種＋10-03 火槍、手槍）（手繪風：黑框、平塗、一點亮面；10-03精簡外觀暫定GPT）
   ITEM_ART：圖示用（長兵器轉斜）；ITEM_RAW：拿在紙娃娃手上用（直立、未旋轉）
   畫布 120×120 */
const {ART: ITEM_ART, RAW: ITEM_RAW} = (()=>{
  const RAW = {};
  const INK="#2a2630", STEEL="#c9d0dc", STEEL_HI="#f2f4f8", STEEL_SH="#8c97ab",
        WOOD="#a0703f", WOOD_DK="#6e4a32", GOLD="#e0ab45", LEATHER="#6b4a35", SW=6;
  const p  = (d,f,w=SW) => `<path d="${d}" fill="${f}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
  const ln = (d,c,w=3)  => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
  const c  = (x,y,r,f,w=SW) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" stroke="${INK}" stroke-width="${w}"/>`;
  // 長兵器：縮到 80% 再轉斜，才不會被邊框切掉
  const rot = (inner,a=-45,k=.8) => `<g transform="translate(60 60) scale(${k}) translate(-60 -60) rotate(${a} 60 60)">${inner}</g>`;
  const grip = (y1,y2,w=6) => p(`M${60-w} ${y1} L${60+w} ${y1} L${60+w} ${y2} L${60-w} ${y2} Z`, LEATHER) + ln(`M${60-w} ${(y1+y2)/2} L${60+w} ${(y1+y2)/2+3}`, "#4a3020", 3);
  const haft = (y1,y2,w=7) => p(`M${60-w} ${y1} L${60+w} ${y1} L${60+w} ${y2} L${60-w} ${y2} Z`, WOOD) + ln(`M${60-w+3} ${y1+6} L${60-w+3} ${y2-6}`, WOOD_DK, 2);
  const ART = {
    // 哥布林常用的木棒／彎刀：敵我共用，純外觀
    club: rot(RAW.club = p("M52 44Q42 28 46 5Q48 -8 61 -8Q78 -8 78 8L70 44L66 132L54 132Z",WOOD)
      + ln("M53 8L52 30M62 59L61 111",WOOD_DK,4),-35),
    scimitar: rot(RAW.scimitar = p("M50 82Q39 26 81 -25Q71 23 68 81Z",STEEL)
      + ln("M59 69Q55 29 73 0",STEEL_HI,4)+p("M34 81L84 81L81 92L37 92Z",GOLD)+grip(93,122)+c(60,130,7,GOLD),-35),
    // 劍類：細長直劍、十字護手
    sword: rot(RAW.sword =
      p("M52 -14 L60 -30 L68 -14 L68 82 L52 82 Z", STEEL) + ln("M60 -18 L60 78", STEEL_SH, 2.5) + ln("M56 -12 L56 76", STEEL_HI, 3)
      + p("M28 82 L92 82 L92 93 L28 93 Z", GOLD) + c(60,87.5,4,"#40669a",2)
      + grip(93,122) + c(60,130,8,GOLD)),
    // 雙手重武器：寬大巨劍、彎護手、長握柄
    heavy: rot(RAW.heavy =
      p("M47 -8 L60 -34 L73 -8 L73 70 L47 70 Z", "#b7bfcc") + ln("M60 -18 L60 66", STEEL_SH, 3) + ln("M53 -6 L53 64", STEEL_HI, 3.5)
      + p("M18 66 Q20 80 36 76 L84 76 Q100 80 102 66 L96 84 L24 84 Z", GOLD)
      + grip(84,128,7) + c(60,135,9,GOLD)),
    // 斧類：單刃戰斧
    axe: rot(RAW.axe =
      haft(-18,138) + p("M65 -6 Q98 -22 110 8 Q112 36 100 54 Q88 40 65 42 Z", STEEL)
      + ln("M100 -2 Q110 20 102 44", STEEL_HI, 4) + p("M50 -2 L58 -2 L58 38 L50 38 Q44 18 50 -2 Z", STEEL_SH, 4)
      + p("M53 30 L67 30 L67 46 L53 46 Z", GOLD, 4), -40),
    // 錘類：凸緣硬頭錘
    mace: rot(RAW.mace =
      haft(24,138) + p("M36 -6 L46 -18 L60 -24 L74 -18 L84 -6 L86 12 L78 28 L60 34 L42 28 L34 12 Z", STEEL)
      + ln("M60 -24 L60 34 M36 -6 L84 28 M84 -6 L36 28", STEEL_SH, 3) + c(60,5,9,STEEL_HI,3)
      + p("M52 34 L68 34 L68 44 L52 44 Z", GOLD, 4) + grip(112,136,6)),
    // 長柄類：戟
    polearm: rot(RAW.polearm =
      haft(-6,142,6) + p("M60 -34 L68 -8 L52 -8 Z", STEEL, 5)
      + p("M64 -2 Q96 -10 98 16 Q96 40 64 32 Z", STEEL) + ln("M92 2 Q97 16 92 30", STEEL_HI, 3.5)
      + p("M56 2 L36 12 L56 22 Z", STEEL_SH, 4) + p("M53 -8 L67 -8 L67 38 L53 38 Z", "none", 4)
      + p("M54 36 L66 36 L66 44 L54 44 Z", GOLD, 4), -40),
    // 匕首類：短而寬的葉形刃
    dagger: rot(RAW.dagger =
      p("M60 4 Q80 34 72 74 L48 74 Q40 34 60 4 Z", STEEL) + ln("M60 12 L60 70", STEEL_SH, 3) + ln("M53 30 Q50 50 53 68", STEEL_HI, 3.5)
      + p("M36 74 L84 74 Q88 80 84 86 L36 86 Q32 80 36 74 Z", GOLD) + grip(86,112,7) + c(60,119,9,"#e0766e"), -45, .95),
    // 弓類：弓身、弓弦、搭好的箭
    bow: `<g transform="translate(60 60) scale(.88) translate(-60 -60) rotate(-18 60 60)">${RAW.bow = `
      ${ln("M34 4 L34 116", INK, 6)}${ln("M34 4 L34 116", "#f1e2c6", 3)}
      ${p("M34 4 Q106 28 106 60 Q106 92 34 116 Q84 90 84 60 Q84 30 34 4 Z", WOOD)}
      ${p("M86 50 L104 50 L104 70 L86 70 Z", LEATHER, 4)}
      ${ln("M28 60 L112 60", INK, 8)}${ln("M28 60 L112 60", "#d8c49a", 4)}
      ${p("M108 52 L122 60 L108 68 Z", STEEL, 4)}
      ${p("M34 60 L22 50 L18 56 L28 60 L18 64 L22 70 Z", "#e0766e", 3)}
    `}</g>`,
    // 弩類：弩身、弩臂、弩矢
    crossbow: rot(RAW.crossbow =
      p("M52 30 L68 30 L70 138 L50 138 Z", WOOD) + ln("M56 40 L56 130", WOOD_DK, 2)
      + ln("M12 44 Q60 18 108 44", INK, 11) + ln("M12 44 Q60 18 108 44", STEEL, 6)
      + ln("M12 44 L60 64 L108 44", INK, 5) + ln("M12 44 L60 64 L108 44", "#f1e2c6", 2.5)
      + p("M57 -14 L63 -14 L63 64 L57 64 Z", "#d8c49a", 3.5) + p("M60 -28 L67 -12 L53 -12 Z", STEEL, 3.5)
      + p("M46 88 L60 84 L60 100 Z", STEEL_SH, 3.5), -40),
    // 火槍類（10-03）：槍口朝上畫、跟弩一樣轉斜。右邊（+x）在戰場上是「槍管下面」：
    //   槍管下面墊一條木頭護木（大爺：一手托著這塊），後段是槍托（另一手握這裡）
    firearm: rot(RAW.firearm =
      p("M58 -6 L73 -6 L73 86 L58 86 Z", WOOD) + ln("M68 2 L68 80", WOOD_DK, 2)
      + p("M53 -44 L61 -44 L61 88 L53 88 Z", STEEL) + ln("M55 -38 L55 82", STEEL_HI, 2)
      + p("M51 -48 L63 -48 L63 -40 L51 -40 Z", STEEL_SH, 4) + p("M54 -54 L59 -54 L59 -48 L54 -48 Z", STEEL, 3)
      + p("M50 6 L75 6 L75 13 L50 13 Z", GOLD, 4) + p("M50 46 L75 46 L75 53 L50 53 Z", GOLD, 4)
      + p("M52 84 L72 84 L71 102 L76 112 L82 140 Q62 148 42 140 L50 112 L54 102 Z", WOOD) + ln("M60 108 L56 136", WOOD_DK, 2)
      + p("M40 82 L51 80 L52 92 L42 94 Z", STEEL_SH, 3.5) + p("M38 70 L46 66 L50 74 L44 80 Z", STEEL, 3)
      + ln("M72 92 Q82 100 72 108", INK, 4)
      + p("M42 138 Q62 146 82 138 L82 144 Q62 154 42 144 Z", GOLD, 3.5), -40, .7),
    // 手槍（火槍類裡長得不一樣的，item.art:"pistol"）：短槍管、彎握把
    pistol: rot(RAW.pistol =
      p("M53 18 L67 18 L67 66 L53 66 Z", WOOD)
      + p("M56 -8 L64 -8 L64 66 L56 66 Z", STEEL) + ln("M58 -2 L58 60", STEEL_HI, 2)
      + p("M54 -12 L66 -12 L66 -4 L54 -4 Z", STEEL_SH, 4)
      + p("M52 60 L68 60 L75 92 Q79 112 64 117 L56 117 Q45 107 50 90 Z", WOOD) + ln("M58 74 L62 104", WOOD_DK, 2)
      + c(61, 115, 6, GOLD, 3.5)
      + p("M64 50 L75 42 L78 48 L69 59 Z", STEEL, 3.5)
      + ln("M56 70 Q44 79 54 89", INK, 4), -40, .9),
    // 投擲類：標槍
    thrown: rot(RAW.thrown =
      haft(10,146,6) + p("M60 -38 Q76 -8 66 18 L54 18 Q44 -8 60 -38 Z", STEEL) + ln("M60 -26 L60 12", STEEL_SH, 2.5)
      + p("M55 60 L65 60 L65 84 L55 84 Z", LEATHER, 3.5) + p("M60 132 L48 150 L60 144 L72 150 Z", "#e0766e", 3.5), -45),
    // 徒手：纏著布的拳頭
    unarmed: RAW.unarmed = `<g>
      ${p("M30 58 Q30 30 44 30 L86 30 Q96 30 96 42 L96 84 Q96 104 72 104 L48 104 Q30 104 30 86 Z", "#f1d3ae")}
      ${ln("M42 30 L42 56 M56 30 L56 56 M70 30 L70 56 M84 32 L84 56", INK, 3.5)}
      ${p("M30 58 Q30 48 44 48 L70 48 Q78 48 78 58 Q78 68 66 68 L40 68 Q30 68 30 58 Z", "#e6c19a", 4)}
      ${p("M34 86 L94 86 L94 100 Q88 106 72 106 L48 106 Q36 106 34 100 Z", "#f6e9d8", 4)}
      ${ln("M40 92 L90 92 M40 99 L88 99", "#cbbd9e", 2.5)}
    </g>`,
    // 背包：皮革旅行背包（裝在角色背後）
    // 箭袋：依大爺確認的預覽重畫成共用 SVG，外觀暫定 GPT。
    quiver: RAW.quiver = `<g transform="rotate(-15 60 60)">
      ${p("M77 57Q116 72 95 106L84 109L81 101Q104 78 75 67Z", LEATHER, 5)}
      ${p("M34 48L78 48L83 104Q60 122 37 104Z", "#a0703f")}
      ${p("M37 57L48 60L52 107L39 102Z", WOOD_DK, 0)}
      <ellipse cx="56" cy="49" rx="23" ry="9" fill="${WOOD_DK}" stroke="${INK}" stroke-width="5"/>
      ${ln("M44 49L38 15M57 48L57 7M69 48L78 17", "#c49a62", 5)}
      ${p("M38 17L27 10L30 26L41 32L48 24L47 9Z", "#f2dfb5", 4)}
      ${p("M57 10L47 2L47 20L57 28L67 20L67 2Z", "#f2dfb5", 4)}
      ${p("M78 19L68 12L65 28L74 35L86 29L90 13Z", "#f2dfb5", 4)}
      ${ln("M38 15L42 30M57 7L57 26M78 17L75 33", WOOD_DK, 3)}
      ${p("M33 47Q55 62 79 47L80 57Q57 70 34 58Z", "#c49a62", 4)}
    </g>`,
    backpack: RAW.backpack = `<g>
      ${p("M26 34 Q26 18 42 18 L78 18 Q94 18 94 34 L100 102 Q100 114 88 114 L32 114 Q20 114 20 102 Z", LEATHER)}
      ${p("M30 46 L90 46 L94 98 Q94 106 84 106 L36 106 Q26 106 26 98 Z", "#8b6243", 4)}
      ${p("M38 16 Q40 4 60 4 Q80 4 82 16 L74 20 Q72 12 60 12 Q48 12 46 20 Z", WOOD_DK, 4)}
      ${p("M36 70 L84 70 L82 96 L38 96 Z", "#6f4b35", 4)}
      ${ln("M30 52 L90 52 M44 70 L44 96 M76 70 L76 96", "#d1a66f", 3)}
      ${p("M55 48 L65 48 L65 58 L55 58 Z", GOLD, 3)}
    </g>`,
    // 盾牌：一層輪廓＋大十字，縮小後仍清楚
    shield: RAW.shield = p("M60 7L104 22Q103 82 60 114Q17 82 16 22Z", "#426e9e")
      + ln("M60 20V98M30 48H90", GOLD, 8) + c(60,48,10,GOLD,4),
    round_shield: RAW.round_shield = c(60,60,51,WOOD,6) + ln("M36 22V98M60 12V108M84 22V98",WOOD_DK,4) + c(60,60,14,"#89939b",4),
    // 法杖：菱形水晶，與圓形法球分開辨識；握點不變
    arcane_staff: rot(RAW.arcane_staff =
      haft(27,148,6) + p("M60 -18L79 6L60 30L41 6Z", "#8fd0f0")
      + p("M60 -18L60 30L41 6Z", "#63a8cb", 2.5)
      + p("M46 26L74 26L70 37L50 37Z", GOLD,4), -30),
    // 治癒法書
    healing_book: `<g transform="rotate(-8 60 60)">${RAW.healing_book = `
      ${p("M20 20 L92 14 Q100 14 100 22 L104 100 Q104 108 96 108 L28 112 Q20 112 20 104 Z", "#6f9960")}
      ${p("M92 14 Q100 14 100 22 L104 100 L98 104 L94 22 Z", "#f1e2c6", 3)}
      ${ln("M30 24 L30 104", "#4f7a3a", 4)}
      ${p("M54 42 L68 42 L68 54 L80 54 L80 68 L68 68 L68 80 L54 80 L54 68 L42 68 L42 54 L54 54 Z", GOLD, 4)}

    `}</g>`,
    // 火焰法球
    flame_orb: RAW.flame_orb = `<g>

      ${c(60,50,34,"#f2b441")}
      ${p("M60 22 Q80 40 70 62 Q64 50 58 64 Q42 46 60 22 Z", "#e0584a", 4)}
      ${p("M60 40 Q68 50 62 60 Q58 54 55 60 Q52 50 60 40 Z", "#ffd98a", 3)}

      ${p("M32 86 L88 86 L80 110 L40 110 Z", GOLD)}${ln("M40 98 L80 98", WOOD_DK, 3)}
    </g>`,
    // 薩滿圖騰：彎彎的木杖、頂上一顆小骷髏、掛著三色羽毛（跟哥布林薩滿的頭飾同色）
    shaman_totem: rot(RAW.shaman_totem =
      p("M55 30 Q50 70 56 110 L54 148 L66 148 L68 110 Q62 70 65 30 Z", WOOD) + ln("M59 40 Q55 80 60 140", WOOD_DK, 2.5)
      // 頂端：三根羽毛＋一圈牙齒（10-10 大爺：原本的骷髏頭跟薩滿頭飾撞，拿掉）
      + `<ellipse cx="46" cy="12" rx="6" ry="17" fill="#e0766e" stroke="${INK}" stroke-width="3" transform="rotate(-24 46 12)"/>`
      + `<ellipse cx="74" cy="12" rx="6" ry="17" fill="#5fa8a0" stroke="${INK}" stroke-width="3" transform="rotate(24 74 12)"/>`
      + `<ellipse cx="60" cy="6" rx="6.5" ry="20" fill="#f2b441" stroke="${INK}" stroke-width="3"/>`
      + p("M50 26 L70 26 L70 34 L50 34 Z", "#6b4a35", 3)
      + p("M50 34 L53 44 L56 34 Z", "#f1e8d4", 2.5) + p("M57 34 L60 46 L63 34 Z", "#f1e8d4", 2.5) + p("M64 34 L67 44 L70 34 Z", "#f1e8d4", 2.5)
      + ln("M50 36 Q40 44 38 58 M70 36 Q80 44 82 56", "#6b4a35", 2.5)
      + `<ellipse cx="36" cy="66" rx="5" ry="12" fill="#e0766e" stroke="${INK}" stroke-width="3" transform="rotate(12 36 66)"/>`
      + `<ellipse cx="84" cy="64" rx="5" ry="12" fill="#5fa8a0" stroke="${INK}" stroke-width="3" transform="rotate(-12 84 64)"/>`
      , -30)
  };
  return {ART, RAW};
})();
// 狩獵者特性（狩印）沒有自己的裝備圖，借弓的圖示（10-03）
ITEM_ART.hunter = ITEM_ART.bow;


/* 武器外觀唯一表：只分外觀，不改技能組、裝備數值。原創SVG造型暫定GPT。
   同一 RAW 用於手持／掉落／投擲，ART 只包旋轉縮放供各介面使用。 */
const WEAPON_ART_MAP={
 '短棒':'club','匕首':'dagger','巨棒':'greatclub','手斧':'handaxe','標槍':'javelin','輕錘':'light_hammer','硬頭錘':'mace','長棍':'quarterstaff','鐮刀':'sickle','矛':'spear',
 '飛鏢':'dart','輕弩':'crossbow','短弓':'bow','投石索':'sling','戰斧':'axe','鏈枷':'flail','長柄刀':'glaive','巨斧':'greataxe','巨劍':'heavy','戟':'polearm','長劍':'sword','巨錘':'maul','釘頭錘':'morningstar','長矛':'pike','刺劍':'rapier','彎刀':'scimitar','短劍':'shortsword','三叉戟':'trident','戰錘':'warhammer','戰鎬':'warpick','鞭':'whip','吹箭筒':'blowgun','手弩':'hand_crossbow','重弩':'heavy_crossbow','長弓':'longbow','火槍':'firearm','手槍':'pistol'
};
const WEAPON_HELD={};
(()=>{
 const ink='#2a2630',steel='#c9d0dc',wood='#a0703f',gold='#e0ab45',leather='#6b4a35';
 const p=(d,c,w=5)=>`<path d="${d}" fill="${c}" stroke="${ink}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
 const line=(d,c=ink,w=3)=>p(d,'none',w).replace(`stroke="${ink}"`,`stroke="${c}"`);
 const shaft=(top=-15,bottom=140,width=5)=>p(`M${60-width} ${top} H${60+width} V${bottom} H${60-width}Z`,wood);
 const grip=(top=94,bottom=125)=>p(`M54 ${top} H66 V${bottom} H54Z`,leather)+line(`M55 ${top+9} L65 ${top+12} M55 ${top+20} L65 ${top+23}`,'#3b302c',2);
 const blade=(tip=-15,shoulder=5,bottom=81,width=8)=>p(`M60 ${tip} L${60+width} ${shoulder} V${bottom} H${60-width} V${shoulder}Z`,steel)+line(`M60 ${tip+10} V${bottom-4}`,'#8c97ab',2);
 const guard=p('M31 83 H89 V92 H31Z',gold);
 const scaled=(raw,k,x=60,y=106)=>`<g transform="translate(${x} ${y}) scale(${k}) translate(${-x} ${-y})">${raw}</g>`;
 const add=(key,raw,base,meta={})=>{
  ITEM_RAW[key]=`<g data-weapon-art="${key}">${raw}</g>`;
  ITEM_ART[key]=`<g transform="translate(60 60) scale(.62) translate(-60 -52) rotate(-32 60 52)">${ITEM_RAW[key]}</g>`;
  WEAPON_HELD[key]={base,...meta};
 };
 add('shortsword',blade(15,29,81,9)+guard+grip()+p('M53 128 H67 V135 H53Z',gold),'sword');
 add('rapier',blade(-35,-16,80,3.5)+p('M29 85 Q32 67 61 77 Q91 73 92 89 Q78 103 63 93Z',gold)+grip()+p('M58 126 H64 V135 H58Z',gold),'sword');
 add('greataxe',shaft(-14,140,7)+p('M60 -12 Q92 -38 112 -22 Q129 10 106 45 Q84 31 60 33 Q36 31 14 45 Q-9 10 8 -22 Q28 -38 60 -12Z',steel)+p('M51 -14 H69 V41 H51Z','#8c97ab',4),'heavy',{gy:100,two:128});
 add('maul',shaft(18,142,7)+p('M16 -18 H104 V29 H16Z',steel)+p('M16 -18 H29 V29 H16Z','#8c97ab',3)+p('M91 -18 H104 V29 H91Z','#8c97ab',3),'heavy',{gy:100,two:128});
 add('greatclub',p('M50 140 L45 38 Q32 9 42 -16 Q60 -40 80 -17 Q89 8 76 38 L70 140Z',wood)+line('M51 -3 L50 26 M61 38 L60 119','#6e4a32',4),'heavy',{gy:100,two:128});
 add('handaxe',scaled(ITEM_RAW.axe,.7,60,112),'axe');
 add('light_hammer',shaft(29,139,4)+p('M36 3 H84 V28 H36Z',steel),'mace');
 add('warhammer',shaft(22,139)+p('M25 -8 H87 V28 H25Z',steel)+p('M87 -4 L113 7 L87 19Z',steel),'mace');
 add('morningstar',shaft(28,139)+p('M60 -30 L68 -15 L83 -23 L84 -5 L102 0 L91 13 L99 28 L80 31 L72 48 L60 36 L48 48 L40 31 L21 28 L29 13 L18 0 L36 -5 L37 -23 L52 -15Z',steel),'mace');
 add('flail',shaft(32,139)+line('M60 32 Q68 -19 93 2 M78 -2 L91 13 M87 3 L99 18',steel,6)+p('M102 13 L110 7 L115 19 L128 19 L124 30 L132 39 L119 43 L117 55 L106 48 L94 52 L94 39 L84 32 L96 26Z',steel),'mace');
 add('warpick',shaft(8,139)+p('M28 -4 L67 -12 Q91 -11 115 13 Q82 5 67 17 L28 17Z',steel),'axe');
 add('quarterstaff',shaft(-35,145)+p('M53 -35 H67 V-18 H53Z',gold,3)+p('M53 126 H67 V145 H53Z',gold,3),'polearm');
 add('spear',shaft(17,144)+blade(-36,-8,25,9),'polearm');
 add('javelin',shaft(25,137,3.5)+blade(-17,2,30,6),'thrown',{gy:102,ang:15});
 add('pike',shaft(-5,152,4)+blade(-48,-27,4,6),'polearm',{s:.34});
 add('glaive',shaft(13,146)+p('M54 26 Q43 -9 77 -43 Q79 -2 67 26Z',steel)+p('M48 25 H72 V35 H48Z',gold,3),'polearm');
 add('trident',shaft(33,145)+p('M35 -28 L41 -16 V13 H54 V-26 L60 -43 L66 -26 V13 H79 V-16 L85 -28 V22 Q60 40 35 22Z',steel),'polearm');
 add('sickle',grip(89,125)+p('M55 89 Q26 73 36 36 Q45 5 81 18 Q113 30 91 59 Q99 32 77 29 Q54 24 52 50 Q48 69 66 76Z',steel),'dagger');
 add('whip',grip(100,132)+line('M60 100 Q19 83 32 55 Q45 30 91 47 Q120 58 94 84 Q81 96 76 83',ink,9)+line('M60 100 Q19 83 32 55 Q45 30 91 47 Q120 58 94 84 Q81 96 76 83',leather,4),'polearm',{gy:113,ang:20,two:null});
 add('dart',shaft(49,101,2.5)+blade(7,27,49,5)+p('M57 84 L46 105 L57 99 M63 84 L74 105 L63 99Z','#e0766e',3),'thrown',{gy:74});
 add('sling',line('M54 18 Q29 10 32 54 L48 90 M66 20 Q92 7 88 55 L70 90',ink,8)+line('M54 18 Q29 10 32 54 L48 90 M66 20 Q92 7 88 55 L70 90','#d8c49a',3)+p('M47 82 Q60 72 73 82 L71 107 Q60 116 49 107Z',leather),'thrown',{gy:25,ang:12});
 add('blowgun',shaft(-25,128,3.5)+p('M53 -26 H67 V-13 H53Z',gold,3)+p('M53 113 H67 V129 H53Z',gold,3),'thrown',{gy:105,ang:75});
 add('longbow',scaled(ITEM_RAW.bow,1.2,95,60),'bow',{s:.56});
 add('hand_crossbow',scaled(ITEM_RAW.crossbow,.66,60,112),'crossbow',{s:.4,two:null});
 add('heavy_crossbow',scaled(ITEM_RAW.crossbow,1.18,60,112)+p('M44 106 H76 V119 H44Z',steel,3),'crossbow',{two:65});
 // 輕弩的第二手托在弩身；手弩保留單手。
 WEAPON_HELD.crossbow={base:'crossbow',two:65};
})();

/* 人類（GPT 畫、大爺 10-10 給的素材包，香香接成紙娃娃資料）：只有外觀，沒有數值、敵人配置
   大爺：人類素材是延伸各種族的基礎（精靈耳就是第一個例子）。頭比四小隻小、身體比較高、有脖子
   - humanLook({sex, hair, beard, ears, hairColor, beardColor, skin}) 組出一種外觀；性別只是展示分類，髮型可以跨用
   - 疊的順序照素材說明：後髮（畫在身體後面，用 tail 的位置）→ 耳朵 → 臉 → 前髮 → 鬍子
   - 女性身體比較窄：身上的衣服、護甲照素材的 outfit-fit 一起縮（gearFit）
   - 平民服：素材裡的衣服，做成可以穿的衣服（數值暫定，香香）
   原圖朝右，戰場照共用方式翻成朝左；不要永久翻轉來源 */
const HUMAN_PARTS = {"hair": {"male-01": {"back": "<g id=\"male-hair-01-back\"></g>", "front": "<g id=\"male-hair-01-front\"><path d=\"M41 40 L41 25 L50 27 L52 15 L64 19 L75 12 L81 19 L94 20 L100 35 L95 45 L88 33 L55 32 L47 45Z\" fill=\"var(--hair-color, #6b4a35)\" stroke=\"#2a2630\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/></g>", "name": "俐落短髮"}, "male-02": {"back": "<g id=\"male-hair-02-back\"></g>", "front": "<g id=\"male-hair-02-front\"><path d=\"M40 42 Q38 18 62 13 Q86 8 98 26 L99 42 L89 33 L79 24 Q59 40 45 35Z\" fill=\"var(--hair-color, #6b4a35)\" stroke=\"#2a2630\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/></g>", "name": "側分髮"}, "male-03": {"back": "<g id=\"male-hair-03-back\"></g>", "front": "<g id=\"male-hair-03-front\"><path d=\"M41 43 L40 26 Q47 10 69 11 Q94 10 99 32 L96 43 L87 30 Q69 24 52 32 L47 44Z\" fill=\"var(--hair-color, #6b4a35)\" stroke=\"#2a2630\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M49 26 Q64 16 85 23\" fill=\"none\" stroke=\"#2a2630\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/></g>", "name": "後梳髮"}, "male-04": {"back": "<g id=\"male-hair-04-back\"></g>", "front": "<g id=\"male-hair-04-front\"><path d=\"M40 43 Q31 34 40 28 Q34 19 46 18 Q43 7 56 12 Q64 1 73 11 Q85 4 89 16 Q103 13 100 27 Q109 34 97 45 L88 34 Q77 39 67 31 Q56 40 46 34Z\" fill=\"var(--hair-color, #6b4a35)\" stroke=\"#2a2630\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/></g>", "name": "捲髮"}, "male-05": {"back": "<g id=\"male-hair-05-back\"></g>", "front": "<g id=\"male-hair-05-front\"><path d=\"M40 42 Q36 24 52 15 Q72 4 90 19 L99 34 L94 43 L86 30 Q66 27 50 33 L47 43Z\" fill=\"var(--hair-color, #6b4a35)\" stroke=\"#2a2630\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M39 25 Q22 23 27 12 Q35 4 44 16Z\" fill=\"var(--hair-color, #6b4a35)\" stroke=\"#2a2630\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/></g>", "name": "束髮"}, "female-01": {"back": "<g id=\"female-hair-01-back\"><path d=\"M39 34 Q39 12 66 12 Q95 9 101 35 L99 92 L85 88 L76 69 L52 86 L35 90Z\" fill=\"var(--hair-color, #6b4a35)\" stroke=\"#2a2630\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/></g>", "front": "<g id=\"female-hair-01-front\"><path d=\"M40 42 L45 24 Q60 8 82 15 L99 28 L99 45 L88 34 L83 26 Q62 43 43 36Z\" fill=\"var(--hair-color, #6b4a35)\" stroke=\"#2a2630\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/></g>", "name": "側分長髮"}, "female-02": {"back": "<g id=\"female-hair-02-back\"><path d=\"M39 34 Q40 9 71 11 Q99 13 101 38 L100 76 L88 79 L80 67 L49 75 L36 73Z\" fill=\"var(--hair-color, #6b4a35)\" stroke=\"#2a2630\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/></g>", "front": "<g id=\"female-hair-02-front\"><path d=\"M39 42 Q38 17 68 12 Q96 12 99 40 L85 31 L70 25 Q57 39 43 36Z\" fill=\"var(--hair-color, #6b4a35)\" stroke=\"#2a2630\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/></g>", "name": "短鮑伯"}, "female-03": {"back": "<g id=\"female-hair-03-back\"><path d=\"M38 35 Q39 10 69 10 Q99 10 101 38 L101 93 L82 91 L52 92 L35 93Z\" fill=\"var(--hair-color, #6b4a35)\" stroke=\"#2a2630\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/></g>", "front": "<g id=\"female-hair-03-front\"><path d=\"M40 41 L43 24 Q69 10 95 25 L98 42 L83 40 L78 31 L74 40 L59 40 L55 32 L51 41Z\" fill=\"var(--hair-color, #6b4a35)\" stroke=\"#2a2630\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/></g>", "name": "齊瀏海長髮"}, "female-04": {"back": "<g id=\"female-hair-04-back\"><path d=\"M45 26 Q24 9 24 35 L21 76 L30 91 L44 78 L40 46Z\" fill=\"var(--hair-color, #6b4a35)\" stroke=\"#2a2630\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/></g>", "front": "<g id=\"female-hair-04-front\"><path d=\"M40 43 Q39 15 67 11 Q94 10 99 32 L96 44 L85 30 Q68 28 48 35 L46 44Z\" fill=\"var(--hair-color, #6b4a35)\" stroke=\"#2a2630\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/></g>", "name": "高馬尾"}, "female-05": {"back": "<g id=\"female-hair-05-back\"><path d=\"M43 59 Q25 53 27 73 L23 94 Q40 96 47 79 L48 66Z\" fill=\"var(--hair-color, #6b4a35)\" stroke=\"#2a2630\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/></g>", "front": "<g id=\"female-hair-05-front\"><path d=\"M40 42 Q39 16 68 13 Q95 13 99 36 L96 44 L88 33 L80 27 Q59 42 44 36Z\" fill=\"var(--hair-color, #6b4a35)\" stroke=\"#2a2630\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/></g>", "name": "低馬尾"}, "female-06": {"back": "<g id=\"female-hair-06-back\"><path d=\"M43 34 Q23 22 24 44 L21 79 L30 88 L44 70Z M96 33 Q114 23 113 45 L118 77 L108 86 L98 65Z\" fill=\"var(--hair-color, #6b4a35)\" stroke=\"#2a2630\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/></g>", "front": "<g id=\"female-hair-06-front\"><path d=\"M40 42 Q39 15 69 11 Q96 12 99 41 L85 33 L73 24 L62 34 L44 36Z\" fill=\"var(--hair-color, #6b4a35)\" stroke=\"#2a2630\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/></g>", "name": "雙馬尾"}, "female-07": {"back": "<g id=\"female-hair-07-back\"><path d=\"M39 22 Q26 10 37 3 Q50 -3 56 11Z\" fill=\"var(--hair-color, #6b4a35)\" stroke=\"#2a2630\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/></g>", "front": "<g id=\"female-hair-07-front\"><path d=\"M40 43 Q38 19 64 12 Q93 8 99 34 L95 44 L86 29 Q63 27 47 37 L45 45Z\" fill=\"var(--hair-color, #6b4a35)\" stroke=\"#2a2630\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/></g>", "name": "盤髮"}, "female-08": {"back": "<g id=\"female-hair-08-back\"><path d=\"M39 32 Q40 11 68 11 Q96 9 101 34 L102 51 Q114 64 103 73 Q115 87 101 95 L84 87 L77 70 L51 83 Q38 100 28 88 Q22 77 34 68 Q25 53 37 46Z\" fill=\"var(--hair-color, #6b4a35)\" stroke=\"#2a2630\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/></g>", "front": "<g id=\"female-hair-08-front\"><path d=\"M40 43 Q37 19 64 13 Q90 8 98 34 L96 45 L84 29 Q72 43 60 33 Q51 43 43 37Z\" fill=\"var(--hair-color, #6b4a35)\" stroke=\"#2a2630\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/></g>", "name": "波浪長髮"}, "female-09": {"back": "<g id=\"female-hair-09-back\"><path d=\"M43 55 Q30 64 38 73 Q27 81 36 89 Q30 102 44 107 Q56 99 47 90 Q57 81 47 74 Q56 65 49 58Z\" fill=\"var(--hair-color, #6b4a35)\" stroke=\"#2a2630\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/></g>", "front": "<g id=\"female-hair-09-front\"><path d=\"M40 43 Q38 17 67 12 Q96 10 99 36 L95 44 L86 31 L78 24 Q58 42 44 37Z\" fill=\"var(--hair-color, #6b4a35)\" stroke=\"#2a2630\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/></g>", "name": "單側辮髮"}, "female-10": {"back": "<g id=\"female-hair-10-back\"><path d=\"M38 34 Q39 11 68 12 Q98 12 101 35 L101 89 L89 93 L79 72 L49 84 L35 91Z\" fill=\"var(--hair-color, #6b4a35)\" stroke=\"#2a2630\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/></g>", "front": "<g id=\"female-hair-10-front\"><path d=\"M40 42 Q40 20 66 13 Q92 13 99 36 L95 44 L84 28 L72 23 Q61 37 45 36Z\" fill=\"var(--hair-color, #6b4a35)\" stroke=\"#2a2630\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M45 30 Q63 44 86 29\" fill=\"none\" stroke=\"#2a2630\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/></g>", "name": "精靈式半束髮"}}, "beards": {"01": {"art": "<g id=\"beard-01\"><path d=\"M76 60 Q67 56 61 64 Q67 69 75 65 L79 62 Q82 65 88 66 L93 61 Q84 57 79 60Z\" fill=\"var(--beard-color, #6b4a35)\" stroke=\"#2a2630\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/></g>", "name": "八字鬍"}, "02": {"art": "<g id=\"beard-02\"><path d=\"M68 68 Q79 72 88 66 L86 79 L78 85 L70 79Z\" fill=\"var(--beard-color, #6b4a35)\" stroke=\"#2a2630\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/></g>", "name": "山羊鬍"}, "03": {"art": "<g id=\"beard-03\"><path d=\"M44 52 L53 60 L58 69 Q75 76 89 65 L99 53 L97 68 Q91 81 77 84 Q55 83 45 67Z\" fill=\"var(--beard-color, #6b4a35)\" stroke=\"#2a2630\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/></g>", "name": "短絡腮鬍"}, "04": {"art": "<g id=\"beard-04\"><path d=\"M44 53 L52 60 L59 67 Q75 73 90 64 L99 53 L97 73 L91 89 L80 98 L73 92 L65 95 L52 81 L45 68Z\" fill=\"var(--beard-color, #6b4a35)\" stroke=\"#2a2630\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/></g>", "name": "長鬍鬚"}, "05": {"art": "<g id=\"beard-05\"><path d=\"M47 59 L59 68 Q78 75 93 62 L96 73 L84 84 Q91 89 82 94 Q90 101 79 107 Q66 104 74 96 Q65 90 73 84 L58 80Z\" fill=\"var(--beard-color, #6b4a35)\" stroke=\"#2a2630\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M74 92 L84 92 M74 101 L83 101\" fill=\"none\" stroke=\"#2a2630\" stroke-width=\"2\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/></g>", "name": "編辮鬍"}}, "ears": {"human": "<g id=\"ears-human\"><path d=\"M44 43 L35 39 L36 51 L45 57Z\" fill=\"var(--skin-color, #e8bb9b)\" stroke=\"#2a2630\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/></g>", "elf": "<g id=\"ears-elf\"><path d=\"M45 43 L23 29 L30 49 L45 57Z\" fill=\"var(--skin-color, #e8bb9b)\" stroke=\"#2a2630\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/><path d=\"M30 37 L40 49\" fill=\"none\" stroke=\"#2a2630\" stroke-width=\"1.5\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/></g>"}, "base": {"male": {"body": "<g id=\"human-body\" stroke=\"#2a2630\" stroke-width=\"3\" stroke-linejoin=\"round\"><g transform=\"\"><path d=\"M52 87 Q69 77 88 88 L92 126 L82 134 L56 134 L47 122Z\" fill=\"#bba795\" /><path d=\"M58 127 L58 137 M81 127 L81 137\" stroke=\"#6b4a35\" stroke-width=\"9\" /><ellipse cx=\"57\" cy=\"138\" rx=\"10\" ry=\"4.5\" fill=\"#6b4a35\" /><ellipse cx=\"83\" cy=\"138\" rx=\"10\" ry=\"4.5\" fill=\"#6b4a35\" /></g></g>", "neck": "<path id=\"human-neck\" d=\"M63 74 L63 86 Q73 94 81 84 L81 75Z\" fill=\"#e8bb9b\" stroke=\"#2a2630\" stroke-width=\"3\" />", "tunic": "<g id=\"civilian-tunic\" stroke=\"#2a2630\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"><path d=\"M48 85 Q70 78 92 86 L96 107 L92 129 Q70 138 47 130 L43 107Z\" fill=\"#638a83\" /><path d=\"M59 83 L71 96 L82 83\" fill=\"none\" stroke=\"#bed0b8\" stroke-width=\"2.5\" /><path d=\"M47 111 Q71 118 94 110\" fill=\"none\" stroke=\"#6b4a35\" stroke-width=\"5\" /><path d=\"M67 111 L77 112 L77 118 L67 117Z\" fill=\"#bda366\" stroke-width=\"1.5\" /><path d=\"M71 97 L73 109 M72 119 L72 133\" fill=\"none\" stroke=\"#426963\" stroke-width=\"2\" /></g>", "fit": "", "headAttr": "stroke=\"#2a2630\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\" transform=\"translate(72 78) scale(0.65) translate(-72 -78)\"", "face": "<path d=\"M43 37 Q44 15 68 16 Q93 16 97 37 L99 54 Q96 71 77 78 Q57 78 44 63Z\" fill=\"#e8bb9b\" /><ellipse cx=\"63\" cy=\"48\" rx=\"5\" ry=\"6.5\" fill=\"#2a2630\" stroke=\"none\" /><ellipse cx=\"87\" cy=\"46\" rx=\"4\" ry=\"5.5\" fill=\"#2a2630\" stroke=\"none\" /><circle cx=\"64\" cy=\"47\" r=\"1.7\" fill=\"#fff2dd\" stroke=\"none\" /><circle cx=\"87\" cy=\"45\" r=\"1.4\" fill=\"#fff2dd\" stroke=\"none\" /><path d=\"M76 53 L83 57 L77 59 M65 65 Q75 70 85 63\" fill=\"none\" stroke-width=\"2\" /><path d=\"M57 38 L68 40 M83 37 L91 37\" fill=\"none\" stroke=\"#6b4a35\" stroke-width=\"3\" />", "arms": "<g id=\"human-arms\" transform=\"\" stroke=\"#2a2630\" stroke-width=\"3\" stroke-linecap=\"round\"><path d=\"M48 92 L40 105 M91 92 L100 105\" stroke=\"#638a83\" stroke-width=\"9\" /><circle cx=\"40\" cy=\"107\" r=\"7.5\" fill=\"#e8bb9b\" /><circle cx=\"100\" cy=\"107\" r=\"7.5\" fill=\"#e8bb9b\" /></g>"}, "female": {"body": "<g id=\"human-body\" stroke=\"#2a2630\" stroke-width=\"3\" stroke-linejoin=\"round\"><g transform=\"translate(70 0) scale(.88 1) translate(-70 0)\"><path d=\"M55 86 Q70 80 85 86 Q93 96 86 104 L87 113 Q89 121 94 128 L84 134 L54 134 L46 128 Q53 119 53 111 L54 104 Q47 94 55 86Z\" fill=\"#bba795\" /><path d=\"M58 127 L58 137 M81 127 L81 137\" stroke=\"#6b4a35\" stroke-width=\"9\" /><ellipse cx=\"57\" cy=\"138\" rx=\"10\" ry=\"4.5\" fill=\"#6b4a35\" /><ellipse cx=\"83\" cy=\"138\" rx=\"10\" ry=\"4.5\" fill=\"#6b4a35\" /></g></g>", "neck": "<path id=\"human-neck\" d=\"M63 74 L63 86 Q73 94 81 84 L81 75Z\" fill=\"#e8bb9b\" stroke=\"#2a2630\" stroke-width=\"3\" />", "tunic": "<g id=\"civilian-tunic\" stroke=\"#2a2630\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\"><path d=\"M54 85 Q70 80 86 86 Q95 96 87 104 L89 114 Q91 123 97 129 Q70 140 43 130 Q49 121 51 113 L53 104 Q46 96 54 85Z\" fill=\"#638a83\" /><path d=\"M61 84 L71 96 L80 84\" fill=\"none\" stroke=\"#bed0b8\" stroke-width=\"2.5\" /><path d=\"M51 112 Q71 117 90 112\" fill=\"none\" stroke=\"#6b4a35\" stroke-width=\"5\" /><path d=\"M67 111 L77 112 L77 118 L67 117Z\" fill=\"#bda366\" stroke-width=\"1.5\" /><path d=\"M71 97 L72 109 M72 119 L72 133\" fill=\"none\" stroke=\"#426963\" stroke-width=\"2\" /><path d=\"M56 98 Q62 104 69 100 M75 100 Q81 104 87 98\" fill=\"none\" stroke=\"#426963\" stroke-width=\"2\" stroke-linecap=\"round\" /></g>", "fit": "translate(70 0) scale(.88 1) translate(-70 0)", "headAttr": "stroke=\"#2a2630\" stroke-width=\"3\" stroke-linejoin=\"round\" stroke-linecap=\"round\" transform=\"translate(72 78) scale(.65 .64) translate(-72 -78)\"", "face": "<path d=\"M43 37 Q44 15 68 16 Q93 16 97 37 L99 54 Q96 71 77 78 Q57 78 44 63Z\" fill=\"#e8bb9b\" /><ellipse cx=\"63\" cy=\"48\" rx=\"5\" ry=\"6.5\" fill=\"#2a2630\" stroke=\"none\" /><ellipse cx=\"87\" cy=\"46\" rx=\"4\" ry=\"5.5\" fill=\"#2a2630\" stroke=\"none\" /><circle cx=\"64\" cy=\"47\" r=\"1.7\" fill=\"#fff2dd\" stroke=\"none\" /><circle cx=\"87\" cy=\"45\" r=\"1.4\" fill=\"#fff2dd\" stroke=\"none\" /><path d=\"M76 53 L83 57 L77 59 M65 65 Q75 70 85 63\" fill=\"none\" stroke-width=\"2\" /><path d=\"M58 39 L67 40 M84 38 L90 38\" fill=\"none\" stroke=\"#59403a\" stroke-width=\"2\" /><path d=\"M58 46 L55 44\" fill=\"none\" stroke-width=\"2\" />", "arms": "<g id=\"human-arms\" transform=\"translate(70 0) scale(.88 1) translate(-70 0)\" stroke=\"#2a2630\" stroke-width=\"3\" stroke-linecap=\"round\"><path d=\"M54 92 L44 105 M86 92 L96 105\" stroke=\"#638a83\" stroke-width=\"9\" /><circle cx=\"44\" cy=\"107\" r=\"7\" fill=\"#e8bb9b\" /><circle cx=\"96\" cy=\"107\" r=\"7\" fill=\"#e8bb9b\" /></g>"}}};

var humanLook = function({sex="male", hair="01", beard=null, ears="human", hairColor="#6b4a35", beardColor=hairColor, skin="#e8bb9b"}={}){
  const B = HUMAN_PARTS.base[sex], H = HUMAN_PARTS.hair[`${sex}-${hair}`] || HUMAN_PARTS.hair[`${sex}-01`];
  const col = s => (s||"").replace(/var\(--hair-color,[^)]*\)/g, hairColor).replace(/var\(--beard-color,[^)]*\)/g, beardColor).replace(/var\(--skin-color,[^)]*\)/g, skin);
  const face = B.face.replace(/#e8bb9b/g, skin);
  const inner = f => `<g ${B.headAttr}>${col(HUMAN_PARTS.ears[ears])}${f}${col(H.front)}${beard ? col(HUMAN_PARTS.beards[beard].art) : ""}</g>`;
  const hurtFace = face.replace(/<ellipse cx="(63|87)" cy="(4[68])"[^>]*\/>/g, (m,x,y)=>`<path d="M${x-5} ${y-5} L${+x+5} ${+y+5} M${+x+5} ${y-5} L${x-5} ${+y+5}" stroke="#2a2630" stroke-width="3"/>`).replace(/<circle cx="(64|87)" cy="4[57]"[^>]*\/>/g, "");
  const svg = g => `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${g}</svg>`;
  const placed = f => `<g transform="scale(1.3158) translate(-32 -6)">${inner(f)}</g>`;
  return {face: svg(`<g transform="translate(50 54) scale(2.3) translate(-71 -57)">${inner(face)}</g>`),
    head: svg(placed(face)), headHurt: svg(placed(hurtFace)),
    body:"#bba795", skin, feet:"#6b4a35", belly:false,
    tail: `<g ${B.headAttr}>${col(H.back)}</g>`,                                  // 後髮：畫在身體後面
    bodyArt: B.body + B.neck.replace(/#e8bb9b/g, skin), gearFit: B.fit || "",
    anchor: {head:[50,44,.8], neck:[72,88]},                                     // 頭小一號：頭飾、項鍊對準人類的頭（暫定）
    human: {sex, hair, beard, ears}};
};
MONSTER_LOOK.human_male = humanLook({sex:"male"});
MONSTER_LOOK.human_female = humanLook({sex:"female"});

// ---------- 正面回合頭像（大爺 10-10 要正面；香香畫，外觀暫定） ----------
// 素材只有朝右的 3/4 側臉，正面是照每種髮型、鬍子、耳朵的特徵另外畫的簡化版；髮色、鬍色、膚色跟著 humanLook 的參數
function humanFrontSVG({sex="male", hair="01", beard=null, ears="human", hairColor="#6b4a35", beardColor=hairColor, skin="#e8bb9b"}={}){
  const INK="#2a2630", p=(d,f,w=2.6)=>`<path d="${d}" fill="${f}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
  const H=hairColor, k=`${sex}-${hair}`;
  // 頭髮在臉後面的部分（長髮兩側、馬尾、包頭）
  const back = {
    "female-01":p("M27 46 Q22 76 30 92 L44 86 L40 52 Z M73 46 Q78 76 70 92 L56 86 L60 52 Z",H),
    "female-02":p("M27 46 Q24 64 30 74 L40 72 L40 52 Z M73 46 Q76 64 70 74 L60 72 L60 52 Z",H),
    "female-03":p("M27 46 Q22 78 29 94 L42 88 L40 52 Z M73 46 Q78 78 71 94 L58 88 L60 52 Z",H),
    "female-04":p("M66 24 Q86 14 88 34 Q90 54 80 66 Q82 46 72 34 Z",H),
    "female-05":p("M70 58 Q84 66 80 88 Q74 78 66 72 Z",H),
    "female-06":p("M28 44 Q12 56 18 80 Q26 68 32 58 Z M72 44 Q88 56 82 80 Q74 68 68 58 Z",H),
    "female-07":`<circle cx="50" cy="18" r="9" fill="${H}" stroke="${INK}" stroke-width="2.6"/>`,
    "female-08":p("M27 46 Q18 62 26 74 Q20 84 30 94 L44 86 L40 52 Z M73 46 Q82 62 74 74 Q80 84 70 94 L56 86 L60 52 Z",H),
    "female-09":p("M70 56 Q80 70 74 92 L66 90 Q70 74 64 62 Z",H)+`<path d="M68 66 L76 70 M67 74 L75 78 M67 82 L74 86" stroke="${INK}" stroke-width="1.6"/>`,
    "female-10":p("M27 46 Q22 76 30 92 L44 86 L40 52 Z M73 46 Q78 76 70 92 L56 86 L60 52 Z",H)+`<circle cx="50" cy="22" r="6" fill="${H}" stroke="${INK}" stroke-width="2.4"/>`,
    "male-05":`<circle cx="50" cy="17" r="7" fill="${H}" stroke="${INK}" stroke-width="2.6"/>`
  }[k] || "";
  // 耳朵（精靈耳往外上方尖）
  const ear = ears==="elf"
    ? p("M28 52 L12 38 L18 58 L29 63 Z",skin)+p("M72 52 L88 38 L82 58 L71 63 Z",skin)
    : p("M28 50 Q20 52 22 60 Q24 66 30 64 Z",skin)+p("M72 50 Q80 52 78 60 Q76 66 70 64 Z",skin);
  const face = p("M28 50 Q28 26 50 26 Q72 26 72 50 Q72 72 50 80 Q28 72 28 50 Z",skin)
    + `<ellipse cx="41" cy="54" rx="3.4" ry="4.4" fill="${INK}"/><ellipse cx="59" cy="54" rx="3.4" ry="4.4" fill="${INK}"/><circle cx="42" cy="52.6" r="1.2" fill="#fff2dd"/><circle cx="60" cy="52.6" r="1.2" fill="#fff2dd"/>`
    + `<path d="M35 46 L45 47 M55 47 L65 46" stroke="${H}" stroke-width="2.6" stroke-linecap="round"/>`
    + `<path d="M50 58 L48 64 L52 64" fill="none" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>`
    + (beard==="01"||beard==="03"||beard==="04"||beard==="05" ? "" : `<path d="M44 69 Q50 73 56 69" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`)
    + `<ellipse cx="34" cy="63" rx="4" ry="2" fill="#e99b9e" opacity=".5"/><ellipse cx="66" cy="63" rx="4" ry="2" fill="#e99b9e" opacity=".5"/>`;
  // 頭頂與瀏海
  const front = {
    "male-01":p("M27 48 Q26 22 50 22 Q74 22 73 48 L68 38 Q60 34 50 36 Q40 34 32 38 Z",H),
    "male-02":p("M27 48 Q26 22 50 22 Q74 22 73 48 L70 40 Q58 32 40 40 L34 36 Z",H),
    "male-03":p("M28 44 Q28 20 50 20 Q72 20 72 44 Q62 30 50 30 Q38 30 28 44 Z",H),
    "male-04":p("M26 48 Q22 40 27 34 Q25 24 34 24 Q38 16 46 20 Q52 14 58 20 Q66 16 68 25 Q77 26 74 35 Q78 42 73 48 L68 38 Q50 30 32 38 Z",H),
    "male-05":p("M27 48 Q26 22 50 22 Q74 22 73 48 Q64 32 50 32 Q36 32 27 48 Z",H),
    "female-01":p("M27 52 Q24 22 50 22 Q76 22 73 52 L66 36 Q50 32 40 44 L36 36 Z",H),
    "female-02":p("M26 56 Q22 22 50 22 Q78 22 74 56 L68 40 L62 44 L56 38 L50 44 L44 38 L38 44 L32 40 Z",H),
    "female-03":p("M27 52 Q24 22 50 22 Q76 22 73 52 L70 44 L30 44 Z",H),
    "female-04":p("M27 50 Q26 22 50 22 Q74 22 73 50 Q66 34 50 34 Q36 36 27 50 Z",H),
    "female-05":p("M27 50 Q26 22 50 22 Q74 22 73 50 L64 38 Q52 34 42 40 L34 38 Z",H),
    "female-06":p("M27 50 Q26 22 50 22 Q74 22 73 50 L66 40 L58 36 L50 41 L42 36 L34 40 Z",H),
    "female-07":p("M27 50 Q26 24 50 24 Q74 24 73 50 Q64 36 50 36 Q36 36 27 50 Z",H),
    "female-08":p("M26 54 Q20 22 50 22 Q80 22 74 54 Q70 40 60 40 Q56 34 50 38 Q44 34 40 40 Q30 40 26 54 Z",H),
    "female-09":p("M27 50 Q26 22 50 22 Q74 22 73 50 L62 36 Q48 34 36 42 Z",H),
    "female-10":p("M27 52 Q24 22 50 22 Q76 22 73 52 Q64 36 50 37 Q36 36 27 52 Z",H)
  }[k] || p("M27 48 Q26 22 50 22 Q74 22 73 48 Q62 34 50 34 Q38 34 27 48 Z",H);
  const B=beardColor;
  const beardArt = !beard ? "" : {
    "01":p("M38 67 Q44 62 50 66 Q56 62 62 67 Q56 70 50 68 Q44 70 38 67 Z",B,2),                                          // 八字鬍
    "02":p("M44 70 Q50 68 56 70 L54 82 Q50 86 46 82 Z",B,2)+`<path d="M44 69 Q50 72 56 69" fill="none" stroke="${INK}" stroke-width="1.8"/>`,   // 山羊鬍
    "03":p("M29 56 Q32 76 50 82 Q68 76 71 56 L66 60 Q62 70 50 72 Q38 70 34 60 Z",B,2)+p("M40 67 Q50 63 60 67 Q50 71 40 67 Z",B,1.8),   // 短絡腮鬍
    "04":p("M29 56 Q30 86 50 98 Q70 86 71 56 L66 60 Q62 70 50 72 Q38 70 34 60 Z",B,2)+p("M40 67 Q50 63 60 67 Q50 71 40 67 Z",B,1.8),   // 長鬍鬚
    "05":p("M30 56 Q34 76 50 80 Q66 76 70 56 L65 60 Q61 70 50 72 Q39 70 35 60 Z",B,2)+p("M46 78 L54 78 L53 96 L47 96 Z",B,2)+`<path d="M47 84 L53 86 M47 90 L53 92" stroke="${INK}" stroke-width="1.5"/><circle cx="50" cy="97" r="2.5" fill="#bda366" stroke="${INK}" stroke-width="1.5"/>`   // 編辮鬍
  }[beard] || "";
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" data-front="human">${back}${ear}${face}${front}${beardArt}</svg>`;
}
{
  const side = humanLook;
  humanLook = o => ({...side(o), face:humanFrontSVG(o||{})});
  MONSTER_LOOK.human_male = humanLook({sex:"male"});
  MONSTER_LOOK.human_female = humanLook({sex:"female"});
}

/* ======================== 紙娃娃：簡單身體＋浮空的手＋掛上裝備 ========================
   手沒有手臂，是浮在身體旁的圓球（不用處理關節透視）。
   主手拿武器（或法杖），副手拿盾／法書／法球；雙手武器兩隻手都握在武器上。
   動作用 CSS 即時演出：整隻（.dl-act）、主手（.dl-arm）、副手（.dl-off）各自動。
   畫布 140×150，腳底在 (70,140) */

// 裝備怎麼拿：握把位置 (gx,gy)、平常的角度、縮放、雙手時第二隻手的位置
const HELD = {
  club:         {gy:112, ang:30},
  scimitar:     {gy:106, ang:35},
  sword:        {gy:106, ang:35},
  heavy:        {gy:96,  ang:25, two:122},
  axe:          {gy:112, ang:30},
  mace:         {gy:122, ang:30},
  polearm:      {gy:96,  ang:12, two:128},
  dagger:       {gy:99,  ang:40},
  bow:          {gx:95,  gy:60, ang:-6, s:.56, hx:130, hy:100},   // 弓要拿在身體外側，弦才不會壓在身上
  crossbow:     {gy:112, ang:75},
  firearm:      {gy:100, ang:78, two:24, twoX:70},   // 火槍：主手握槍托、副手托住槍管下面的護木（twoX：副手偏到槍管下面）（10-03 大爺）
  pistol:       {gy:100, ang:80, s:.34},     // 手槍：單手（item.art；SRD 手槍不是雙手武器）
  thrown:       {gy:72,  ang:25},
  arcane_staff: {gy:100, ang:12},
  shaman_totem: {gy:100, ang:12},
  shield:       {gy:60,  ang:0,  s:.34},
  healing_book: {gx:62,  gy:62, ang:-10, s:.4},
  flame_orb:    {gy:70,  ang:0,  s:.4}
};
const GLOW = {arcane_staff:"#8fd0f0", healing_book:"#9be08a", flame_orb:"#f2b441", shaman_totem:"#c58af0"};
HELD.round_shield={...HELD.shield};
for(const [key,meta] of Object.entries(WEAPON_HELD))HELD[key]={...HELD[meta.base],...meta};

// 每個動作的長度（毫秒）與「打中」的時間點
const DOLL_DUR    = {slash:550, smash:720, combo:850, spin:760, thrust:520, guard:600, shoot:680, fire:1150, throw:620, punch:420, cast:820, slam:760, hurt:600, getup:520, fall:450, hop:160, lunge:460};
const DOLL_IMPACT = {slash:230, smash:400, combo:180, spin:260, thrust:280, guard:0,   shoot:450, fire:820, throw:380, punch:230, cast:320, slam:420, lunge:200};

// 技能 → 動作（武器：普攻＋三招；法器：法術，法杖第一招是打擊）
const SKILL_ANIM = {
  // 跟 data/skills.js 每組的招式一一對應（2026-10-01 合併重複招式後：劍、長柄、投擲、徒手少了幾招）
  sword:["slash","guard","combo"], heavy:["smash"], axe:["slash","smash"],
  mace:["smash"], polearm:["thrust"], dagger:["thrust","thrust","thrust"],
  bow:["shoot"], crossbow:["shoot"], firearm:["fire"], thrown:["throw"],
  unarmed:["punch"], arcane_staff:["smash","cast","cast","cast"], healing_book:["cast","cast"], flame_orb:["cast","cast","cast"],
  shaman_totem:["cast","cast","cast"]
};
const animFor = (groupId, idx) => (SKILL_ANIM[groupId]||[])[idx] || "slash";

// 各角色的尾巴（畫在身體後面）
function tailSVG(id, c){
  const INK="#2a2630";
  const pp = (d,f,w=3) => `<path d="${d}" fill="${f}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
  if(id==="fox") return pp("M54 120 Q22 116 20 84 Q32 98 46 98 Q40 88 44 76 Q58 96 60 112 Z", c) + pp("M20 84 Q24 76 32 78 Q30 90 38 96 Q26 96 20 84 Z", "#fbead6", 2.5);
  if(id==="tiger") return `<path d="M54 124 Q28 126 28 104 Q28 92 38 88" fill="none" stroke="${INK}" stroke-width="11" stroke-linecap="round"/>
    <path d="M54 124 Q28 126 28 104 Q28 92 38 88" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round"/>
    <path d="M38 118 L34 126 M29 106 L22 108 M32 94 L28 88" stroke="#3b3a44" stroke-width="3.5" stroke-linecap="round"/>`;
  if(id==="wolf") return pp("M54 120 Q24 124 20 98 Q32 108 44 106 Q38 96 44 86 Q58 102 60 114 Z", c) + pp("M20 98 Q24 90 30 92 Q30 100 36 104 Q26 106 20 98 Z", "#6e7690", 2.5);
  // 狸貓：短而蓬的尾巴，尾端深咖啡（沒有浣熊的環紋）
  return pp("M56 120 Q30 124 26 102 Q24 88 36 86 Q48 88 48 100 Q50 110 60 110 Z", c)
    + pp("M26 102 Q24 88 36 86 Q42 87 45 92 Q36 92 32 100 Q30 106 33 112 Q27 109 26 102 Z", "#4a3226", 2.5);
}

// 護甲（紙娃娃的衣服層，蓋在身體上）
/* 身體裝備分三層（大爺 10-02）：
     body＝蓋在身上（大家共用同一個身體形狀，直接畫在紙娃娃座標上）
     neck＝項鍊之類，以「頸錨點」為原點畫；畫在身體上、頭下面
     head＝頭飾，以「頭錨點」為原點畫（頭的 100×100 座標，原點＝額頭正中、布帶的位置）；畫在頭上面
   錨點每種外觀各一組（critterLook、MONSTER_LOOK 的 anchor），沒寫就用 DEFAULT_ANCHOR
   ARMOR_ART 的值可以是字串（只有 body），或 {body, neck, head}
   身體裝備（2026-10-01：改回 SRD 的 12 件＋法袍，每件畫出差異，大爺之後修）
   kind＝裝備名稱；沒有專屬畫法的照分類（輕甲／中甲／重甲）畫。畫在紙娃娃的身體上（身體約 x 48~92、y 83~133） */
const ARMOR_ART = (()=>{
  // 外框比身體大一圈，蓋住肩膀（2026-10-01 大爺：原本比身體窄，肩膀會露出來）
  const INK="#2a2630", T="M47 84 Q70 72 93 84 Q100 110 94 127 Q70 138 46 127 Q40 110 47 84 Z";      // 一般上衣
  const LONG="M47 84 Q70 72 93 84 Q101 110 96 132 Q70 142 44 132 Q39 110 47 84 Z";                  // 長到大腿
  const body = (d, fill, w=3) => `<path d="${d}" fill="${fill}" stroke="${INK}" stroke-width="${w}"/>`;
  const line = (d, c, w=2.5, extra="") => `<path d="${d}" stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round" ${extra}/>`;
  const dots = (pts, r, fill, stroke) => pts.map(([x,y])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${stroke?`stroke="${stroke}" stroke-width="1.3"`:""}/>`).join("");
  const rings = (pts, r, c) => pts.map(([x,y])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${c}" stroke-width="1.6"/>`).join("");
  const grid = (x0,x1,y0,y1,dx,dy,off=true) => { const o=[]; for(let y=y0,k=0;y<=y1;y+=dy,k++) for(let x=x0+(off&&k%2?dx/2:0);x<=x1;x+=dx) o.push([x,y]); return o; };
  const belt = (c="#5e3a20") => line("M52 116 Q70 122 88 116", c, 4.5);
  return {
    // 衣服：法袍，長到腳邊，深紫配金邊、V 領和腰帶
    "法袍": `<path d="M48 86 Q70 78 92 86 Q99 108 101 132 Q70 141 39 132 Q41 108 48 86 Z" fill="#5b4f8f" stroke="${INK}" stroke-width="3"/>
      ${line("M70 101 L70 136","#473d73")}${line("M42 128 Q70 137 98 128","#e0ab45",3)}${line("M47 110 Q70 117 93 110","#e0ab45",4)}
      ${line("M57 84 L70 101 L83 84","#e0ab45",3,'stroke-linejoin="round"')}`,
    // 衣服：破布衣（哥布林穿的），形狀跟紙娃娃身體一樣；麻繩腰帶、下襬破成鋸齒
    "破布衣": `<path d="M50 86 Q70 74 90 86 Q98 110 92 128 L85 126 L79 133 L72 128 L65 134 L58 127 L49 130 Q42 110 50 86 Z" fill="#7a5a3c" stroke="${INK}" stroke-width="3.5"/>
      ${line("M49 112 Q70 119 91 112","#c9a86a",3.5)}`,
    // +1 薩滿袍（大爺 10-02）：紫袍＋骷髏頭飾＋牙齒項鍊，一整套
    "+1 薩滿袍": {
      body: `<path d="M50 86 Q70 74 90 86 Q98 110 92 128 Q70 140 48 128 Q42 110 50 86 Z" fill="#5e4a6e" stroke="${INK}" stroke-width="3.5"/>
        <path d="M50 90 Q70 101 90 90" stroke="${INK}" stroke-width="1.5" fill="none"/>${line("M49 112 Q70 119 91 112","#c9a86a",3.5)}`,
      neck: [[-12,-2],[-6,1.5],[0,3],[6,1.5],[12,-2]].map(([x,y])=>`<path d="M${x-2.6} ${y-2}L${x+2.6} ${y-2}L${x} ${y+5}Z" fill="#fffbe8" stroke="${INK}" stroke-width="1.3"/>`).join(""),
      head: `<path d="M-23 5 Q0 -5 23 5" stroke="${INK}" stroke-width="8.5" fill="none" stroke-linecap="round"/><path d="M-23 5 Q0 -5 23 5" stroke="#a33c32" stroke-width="5.5" fill="none" stroke-linecap="round"/>
        <g transform="translate(2 -13)"><path d="M-11 2 Q-12 -13 0 -14 Q12 -13 11 2 Q11 7 6 8 L6 12 L-6 12 L-6 8 Q-11 7 -11 2 Z" fill="#f3ead2" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
        <ellipse cx="-4.5" cy="-1.5" rx="3.3" ry="3.8" fill="${INK}"/><ellipse cx="4.5" cy="-1.5" rx="3.3" ry="3.8" fill="${INK}"/>
        <path d="M0 2.5 L-1.8 6 L1.8 6 Z" fill="${INK}"/><path d="M-3 12 L-3 8.5 M0 12 L0 8.5 M3 12 L3 8.5" stroke="${INK}" stroke-width="1.3"/></g>
        <path d="M-1 -2 L5 -2 L2 6 Z" fill="#fffbe8" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>`
    },
    // 輕甲
    "軟甲": body(T,"#d8c7a0") + line("M54 98 L86 120 M54 112 L76 126 M60 90 L88 108 M86 98 L54 120 M86 112 L64 126 M80 90 L52 108","#b59f72",1.8) + line("M58 89 Q70 94 82 89","#b59f72",3),   // 菱格縫線的棉甲
    "皮甲": body(T,"#9a6a3e") + line("M70 88 L70 128","#6e4a32",2.2,'stroke-dasharray="3 3"') + belt(),                                   // 素面皮衣
    "鑲釘皮甲": body(T,"#7a4a2a") + line("M70 88 L70 128","#5e3a20",2.2,'stroke-dasharray="3 3"') + belt("#4a2c18")
      + dots([[58,97],[82,97],[58,108],[82,108]],2.2,"#d9dee6","#2a2630"),                            // 皮衣＋金屬鉚釘
    // 中甲
    "獸皮甲": body(T,"#a8865e") + `<path d="M52 121 L56 129 L60 122 L64 130 L68 123 L72 130 L76 123 L80 130 L84 122 L88 128 L88 121 Z" fill="#c9a77a" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`
      + `<path d="M54 90 Q62 84 70 88 Q78 84 86 90 Q80 97 70 94 Q60 97 54 90 Z" fill="#e2cfa8" stroke="${INK}" stroke-width="2"/>` + line("M60 104 q3 -3 6 0 M74 108 q3 -3 6 0 M64 114 q3 -3 6 0","#7e6040",2),   // 毛領＋毛邊下擺
    "鏈甲衫": body(T,"#9aa3b2") + rings(grid(58,82,98,118,12,10),2.8,"#6f7888") + `<path d="M58 88 Q70 94 82 88 L80 92 Q70 97 60 92 Z" fill="#6b4a35" stroke="${INK}" stroke-width="1.5"/>`,   // 鏈環＋皮領
    "鱗甲": body(T,"#a99a72") + grid(58,82,98,122,12,8).map(([x,y])=>`<path d="M${x-3.5} ${y} Q${x} ${y+5} ${x+3.5} ${y}" stroke="#6e6244" stroke-width="1.6" fill="none"/>`).join("") + belt("#5e3a20"),   // 一片一片的鱗
    "胸甲": body(T,"#7a5a3c") + `<path d="M55 90 Q70 84 85 90 Q90 104 84 114 Q70 120 56 114 Q50 104 55 90 Z" fill="#c9d0dc" stroke="${INK}" stroke-width="2.5"/>`
      + line("M70 88 L70 116","#8c97ab",2) + `<ellipse cx="62" cy="97" rx="4" ry="6" fill="#f2f4f8" opacity=".8"/>` + belt("#4a2c18"),   // 亮面胸板＋皮裙
    "半身板甲": body(T,"#7a5a3c") + `<path d="M55 90 Q70 84 85 90 Q90 104 84 114 Q70 120 56 114 Q50 104 55 90 Z" fill="#b7bfcc" stroke="${INK}" stroke-width="2.5"/>`
      + `<path d="M46 92 Q52 84 60 89 Q56 96 48 98 Z M94 92 Q88 84 80 89 Q84 96 92 98 Z" fill="#c9d0dc" stroke="${INK}" stroke-width="2"/>`
      + `<path d="M54 116 L86 116 L88 124 L52 124 Z" fill="#9aa3b2" stroke="${INK}" stroke-width="2"/>` + line("M70 88 L70 114","#7b8494",2),   // 胸板＋護肩＋腰甲片
    // 重甲
    "環甲": body(LONG,"#6b4a35") + rings(grid(58,84,96,126,10,9,false),3.6,"#b7bfcc") + line("M50 120 Q70 126 90 120","#4a2c18",3.5),   // 皮衣縫上大鐵環
    "鏈甲": body(LONG,"#8c95a4") + rings(grid(56,84,96,128,9,8),2.4,"#5f6878") + `<path d="M56 87 Q70 92 84 87 L83 91 Q70 96 57 91 Z" fill="#5f6878" stroke="${INK}" stroke-width="1.5"/>` + belt("#4a2c18"),   // 長到大腿的細密鏈甲
    "板條甲": body(LONG,"#6b4a35") + [57,63,69,75,81].map(x=>`<rect x="${x}" y="92" width="5" height="34" rx="1.5" fill="#b7bfcc" stroke="${INK}" stroke-width="1.5"/>`).join("")
      + dots([[59.5,96],[65.5,96],[71.5,96],[77.5,96],[83.5,96],[59.5,121],[65.5,121],[71.5,121],[77.5,121],[83.5,121]],1,"#2a2630"),   // 直條鐵片＋鉚釘
    "全身板甲": body(LONG,"#c9d0dc") + line("M50 104 Q70 110 90 104 M49 116 Q70 122 91 116","#8c97ab",3)
      + `<path d="M44 92 Q52 82 62 88 Q58 97 47 100 Z M96 92 Q88 82 78 88 Q82 97 93 100 Z" fill="#dfe6ee" stroke="${INK}" stroke-width="2"/>`
      + line("M56 91 Q70 85 84 91","#e0ab45",4) + `<ellipse cx="62" cy="97" rx="5" ry="3" fill="#f2f4f8" opacity=".9"/>`,   // 整身亮面＋金邊＋護肩
  };
})();
const ARMOR_BY_TIER = {"衣服":"法袍", "輕甲":"皮甲", "中甲":"鏈甲衫", "重甲":"鏈甲"};
ARMOR_ART["平民服"] = {body:HUMAN_PARTS.base.male.tunic+`<path d="M48 92 L40 105 M91 92 L100 105" stroke="#2a2630" stroke-width="13" stroke-linecap="round"/><path d="M48 92 L40 105 M91 92 L100 105" stroke="#638a83" stroke-width="9" stroke-linecap="round"/>`};
function armorArt(kind){                    // 一律回傳 {body, neck, head}
  if(!kind) return {};
  let a = ARMOR_ART[kind];
  if(!a){ const it = ITEMS.find(i=>i.type==="armor" && i.n===kind); a = ARMOR_ART[ARMOR_BY_TIER[it && it.tier] || "皮甲"]; }
  return typeof a==="string" ? {body:a} : a;
}
function armorSVG(kind){ const a = armorArt(kind); return (a.body||"") + (a.neck ? `<g transform="translate(${DEFAULT_ANCHOR.neck.join(" ")})">${a.neck}</g>` : ""); }   // 圖示用：身體＋項鍊
// 錨點：head＝[x, y, 縮放]（頭的 100×100 座標），neck＝[x, y]（紙娃娃座標）
const DEFAULT_ANCHOR = {head:[52,28,1], neck:[70,95]};


// 拿在手上的裝備：放在 (hx,hy)，握把對準手
function heldSVG(key, hx, hy, angExtra=0){
  const h = HELD[key]; if(!h) return "";
  const gx = h.gx ?? 60, s = h.s ?? .4;
  return `<g transform="translate(${hx} ${hy}) rotate(${h.ang+angExtra})"><g transform="scale(${s}) translate(${-gx} ${-h.gy})">${ITEM_RAW[key]}</g></g>`;
}
const handSVG = (x,y,c,r=8.5) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="#2a2630" stroke-width="3"/><circle cx="${x-2.5}" cy="${y-2.5}" r="${r*.3}" fill="#fff" opacity=".35"/>`;

// 四隻的頭、頸錨點（大爺 10-02）：頭比哥布林圓、大，頭飾放大一點、往上一點；目測，大爺看過再調
const CRITTER_ANCHOR = {
  fox:     {head:[52,30,1.25], neck:[70,95]},   // 10-11 大爺：頭飾放大一點、往下壓（暫定）
  tiger:   {head:[51,30,1.28], neck:[70,95]},
  wolf:    {head:[52,30,1.25], neck:[70,95]},
  raccoon: {head:[51,31,1.28], neck:[70,95]}
};
// 四隻的外觀
function critterLook(id, c, mood="normal"){
  const limb = id==="raccoon" ? "#5a3e2e" : c;   // 狸貓的手腳是深咖啡色
  return {head: critterSide(id, mood), headHurt: critterSide(id, true), headHappy: critterSide(id, false, true), body:c, skin:limb, feet:limb, belly:true, tail: tailSVG(id, c), anchor: CRITTER_ANCHOR[id],
    extra: id==="tiger" ? `<path d="M50 100 L58 102 M49 112 L57 112 M90 100 L82 102 M91 112 L83 112" stroke="#3b3a44" stroke-width="3" stroke-linecap="round"/>` : ""};
}

/* o: {id, color 或 look, main, off, armor, anim:{k, el}, face, down, prone, x, y, w, seed}
   down＝生命歸零（橫躺、半透明、X_X）；prone＝被推倒（橫躺、顏色正常） */
function dollSVG(o){
  if(o.look?.render)return o.look.render(o);
  const L = o.look || critterLook(o.id, o.color, o.mood), c = L.skin, INK="#2a2630";
  const gear = armorArt(o.armor), anc = {...DEFAULT_ANCHOR, ...(L.anchor||{})};
  const main = o.main, off = o.off, baseHand = main && HELD[main], h = baseHand && o.twoHanded===true && !baseHand.two ? {...baseHand,two:baseHand.gy+24} : baseHand;
  const two = h && h.two && !off && (o.twoHanded??true);
  const now = Date.now(), level = leveling(o), cheer = o.cheer || level;
  // 主手：武器跟著手一起轉
  let arm;
  if(main && h){
    const s = h.s ?? .4;
    arm = `<g transform="translate(${h.hx??100} ${h.hy??104}) rotate(${h.ang})">
      <g transform="scale(${s}) translate(${-(h.gx??60)} ${-h.gy})">${ITEM_RAW[main]}</g>
      ${`<g class="dl-hand-main">${handSVG(0,0,c)}</g>`}${two?`<g class="dl-hand-off">${handSVG(((h.twoX??(h.gx??60))-(h.gx??60))*s,(h.two-h.gy)*s,c)}</g>`:""}</g>`;
  } else arm = `<g class="dl-hand-main">${handSVG(100,104,c, main==="unarmed"?10:8.5)}</g>`;
  // 副手
  let offHand = "";
  if(!two){
    if(off==="shield"||off==="round_shield") offHand = `<g class="dl-hand-off">${handSVG(40,106,c)}</g>` + heldSVG(off,38,108);
    else if(off) offHand = heldSVG(off,36,96) + `<g class="dl-hand-off">${handSVG(40,110,c)}</g>`;
    else offHand = `<g class="dl-hand-off">${handSVG(40,106,c)}</g>`;
  }
  const glow = GLOW[off] || GLOW[main] || "#f2b441";
  const act = o.walking ? "act-walk" : o.anim ? `act-${o.anim.k}${o.anim.hand==="off"?" offhand-attack":""}` : "";
  const flip = (o.face||1) < 0 ? `transform="translate(140 0) scale(-1 1)"` : "";
  const bob = -((now + (o.seed||0)*237) % 1600);
  const H = o.w*150/140;
  return `<svg class="doll ${o.down?"dl-down":o.prone?"dl-prone":cheer?"dl-cheer":""}" x="${o.x}" y="${o.y}" width="${o.w}" height="${H}" viewBox="0 0 140 150" overflow="visible" aria-hidden="true">
    ${level?`<g class="dl-level-aura" style="--level-delay:${-(now-o.levelUpAt)}ms"><ellipse cx="70" cy="136" rx="42" ry="12"/><path d="M28 136 Q22 118 32 104 M112 136 Q118 118 108 104"/><path class="level-front" d="M29 133 Q70 160 111 133"/></g>`:""}
    <g class="dl-face" ${flip}><g class="dl-lie"><g class="dl-act ${act}" style="--d:${o.anim?-o.anim.el:0}ms;--b:${bob}ms;--walk:${-(now%360)}ms">
      <ellipse class="dl-foot-left" cx="60" cy="138" rx="10" ry="5.5" fill="${L.feet}" stroke="${INK}" stroke-width="3"/>
      <ellipse class="dl-foot-right" cx="80" cy="138" rx="10" ry="5.5" fill="${L.feet}" stroke="${INK}" stroke-width="3"/>
      <g class="dl-bob">
        <g class="dl-backpack" transform="translate(42 74) scale(.42)">${o.backpack?ITEM_RAW.backpack:""}</g>
        ${L.tail}
        ${L.bodyArt ?? `<path d="M50 86 Q70 74 90 86 Q98 110 92 128 Q70 140 48 128 Q42 110 50 86 Z" fill="${L.body}" stroke="${INK}" stroke-width="3.5"/>`}
        ${L.belly?`<ellipse cx="70" cy="113" rx="13" ry="14" fill="#fbf4ee" opacity=".85"/>`:""}
        ${L.extra||""}
        <g class="dl-gear-body"${L.gearFit?` transform="${L.gearFit}"`:""}>${gear.body||""}</g>
        <g class="dl-gear-neck">${gear.neck ? `<g transform="translate(${anc.neck.join(" ")})">${gear.neck}</g>` : ""}</g>
        ${L.head.replace('<svg viewBox="0 0 100 100"', '<svg x="32" y="6" width="76" height="76" viewBox="0 0 100 100"')}
        ${cheer && L.headHappy ? `<g>${L.headHappy.replace('<svg viewBox="0 0 100 100"', '<svg x="32" y="6" width="76" height="76" viewBox="0 0 100 100"')}</g>` : ""}
        <g class="dl-gear-head">${gear.head ? `<g transform="translate(32 6) scale(.76)"><g transform="translate(${anc.head[0]} ${anc.head[1]}) scale(${anc.head[2]})">${gear.head}</g></g>` : ""}</g>
        ${L.headHurt && o.down ? `<g>${L.headHurt.replace('<svg viewBox="0 0 100 100"', '<svg x="32" y="6" width="76" height="76" viewBox="0 0 100 100"')}</g>` :
          L.headHurt && o.anim && o.anim.k==="hurt" ? `<g class="dl-xeyes" data-exp="${now - o.anim.el + DOLL_DUR.hurt}">${L.headHurt.replace('<svg viewBox="0 0 100 100"', '<svg x="32" y="6" width="76" height="76" viewBox="0 0 100 100"')}</g>` : ""}
        <g class="dl-off">${offHand}<circle class="dl-glow" cx="40" cy="96" r="18" fill="${glow}"/></g>
        <g class="dl-arm">${arm}</g>
      </g>
    </g></g></g>
  </svg>`;
}


export {ITEM_RAW,ITEM_ART,humanLook,dollSVG,DOLL_DUR,HELD,HUMAN_PARTS};
