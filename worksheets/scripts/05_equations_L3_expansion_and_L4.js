#!/usr/bin/env node
// רמה 3: 4 עמודים "נעלם אחד" (משני הצדדים) + 4 עמודים "שני נעלמים" (שני מקדמים). + רמה 4 (עמוד אחד).
const fs = require('fs');
const OUT = __dirname;

/* RNG */
function mulberry32(s){return function(){let t=s+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
const R = mulberry32(778201);
const rand=(a,b)=>a+Math.floor(R()*(b-a+1));

const term=(c,v)=>c===1?v:`<span class="mono">${c}${v}</span>`;
const termK=(c,v)=>c===1?v:`${c}${v}`;

/* נעלם אחד — משני הצדדים: ax ± b = cx + d (a>c, פתרון שלם חיובי) */
function genOne(seen){
  while(true){
    const x=rand(2,12), a=rand(2,6), c=rand(1,a-1), diff=a-c, sign=rand(0,1), b=rand(1,12);
    const d = sign===0 ? b+diff*x : diff*x-b;
    if(d<1||d>45) continue;
    const key=`${termK(a,'x')} ${sign?'−':'+'} ${b} = ${termK(c,'x')} + ${d}`;
    if(seen.has(key)) continue; seen.add(key);
    const prompt=`${term(a,'x')} <span class="op">${sign?'−':'+'}</span> ${b} <span class="op">=</span> ${term(c,'x')} <span class="op">+</span> ${d}`;
    return {prompt, key, ans:`x = ${x}`};
  }
}
/* שני נעלמים — שני מקדמים: a1x+b1y=c1 ; a2x+b2y=c2 (יחיד, שלם חיובי) */
function genTwo(seen){
  while(true){
    const x=rand(1,9), y=rand(1,9);
    const a1=rand(1,3),b1=rand(1,3),a2=rand(1,3),b2=rand(1,3);
    if(a1*b2-a2*b1===0) continue;                 // אי-תלות → פתרון יחיד
    if(!((a1>1||b1>1)&&(a2>1||b2>1))) continue;    // "שני מקדמים" בכל משוואה
    const c1=a1*x+b1*y, c2=a2*x+b2*y;
    if(c1>45||c2>45) continue;
    const key=`${termK(a1,'x')}+${termK(b1,'y')}=${c1}, ${termK(a2,'x')}+${termK(b2,'y')}=${c2}`;
    if(seen.has(key)) continue; seen.add(key);
    const l1=`${term(a1,'x')} <span class="op">+</span> ${term(b1,'y')} <span class="op">=</span> ${c1}`;
    const l2=`${term(a2,'x')} <span class="op">+</span> ${term(b2,'y')} <span class="op">=</span> ${c2}`;
    return {two:true, lines:[l1,l2], key, ans:`x = ${x} , y = ${y}`};
  }
}

/* רמה 4 — סוגריים + מערכות שדורשות הכפלה (מאומת בהמשך) */
const L4 = [
  {prompt:`<span class="mono">2</span>(x <span class="op">+</span> 3) <span class="op">=</span> 16`, key:'2(x + 3) = 16', ans:'x = 5'},
  {prompt:`<span class="mono">3</span>(x <span class="op">−</span> 1) <span class="op">=</span> 18`, key:'3(x − 1) = 18', ans:'x = 7'},
  {prompt:`<span class="mono">4</span>(x <span class="op">+</span> 2) <span class="op">=</span> 28`, key:'4(x + 2) = 28', ans:'x = 5'},
  {prompt:`<span class="mono">2</span>(x <span class="op">+</span> 1) <span class="op">=</span> x <span class="op">+</span> 9`, key:'2(x + 1) = x + 9', ans:'x = 7'},
  {two:true, lines:['<span class="mono">3x</span> <span class="op">+</span> <span class="mono">2y</span> <span class="op">=</span> 16','<span class="mono">2x</span> <span class="op">+</span> <span class="mono">5y</span> <span class="op">=</span> 18'], key:'3x+2y=16, 2x+5y=18', ans:'x = 4 , y = 2'},
  {two:true, lines:['<span class="mono">2x</span> <span class="op">+</span> <span class="mono">3y</span> <span class="op">=</span> 17','<span class="mono">3x</span> <span class="op">+</span> <span class="mono">2y</span> <span class="op">=</span> 18'], key:'2x+3y=17, 3x+2y=18', ans:'x = 4 , y = 3'},
];

const CSS = `
@page { size: A4; margin: 12mm 12mm 10mm; }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family:'DejaVu Sans',Arial,sans-serif; direction:rtl; color:#2b2f42; margin:0; display:flex; flex-direction:column; min-height:100vh; }
.topbar { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }
.brand { font-size:12.5px; color:#7a8096; font-weight:bold; }
.pill { font-size:12px; color:#3a3f5a; background:#eef0f7; border:1px solid #e2e5f0; padding:3px 12px; border-radius:20px; font-weight:bold; }
.title h1 { font-size:26px; margin:0 0 2px; color:#21243a; font-weight:800; }
.title .sub { font-size:13px; color:#8a8fa5; margin-bottom:12px; }
.cards { flex:1; display:grid; grid-template-columns:1fr 1fr; grid-auto-rows:1fr; gap:20px; min-height:0; }
.card { position:relative; border:1px solid #e7e9f1; border-radius:16px; background:#fff; box-shadow:0 1px 3px rgba(20,20,60,.05); padding:18px 20px; display:flex; flex-direction:column; min-height:0; }
.badge { position:absolute; top:12px; right:14px; width:26px; height:26px; border-radius:50%; background:#eef0f5; color:#9aa0b5; font-size:12px; font-weight:bold; display:flex; align-items:center; justify-content:center; }
.prompt { text-align:center; font-size:23px; padding:8px 30px 4px; }
.two-prompt { text-align:center; font-size:22px; padding:6px 30px 4px; line-height:1.7; }
.math { direction:ltr; unicode-bidi:isolate; display:inline-flex; align-items:center; gap:8px; flex-wrap:wrap; justify-content:center; }
.op { color:#4c5fd5; font-weight:bold; padding:0 1px; }
.mono { letter-spacing:.5px; }
.workbox { flex:1; margin-top:10px; border:1.6px dashed #d3d7e6; border-radius:10px; min-height:46px; }
.solline { direction:ltr; unicode-bidi:isolate; display:flex; align-items:flex-end; justify-content:center; gap:10px; margin-top:10px; padding:0 6px 2px; font-size:19px; }
.solline .seg { display:flex; align-items:flex-end; gap:6px; }
.solline .dots { width:70px; border-bottom:2.4px dotted #9aa0b5; height:0; margin-bottom:5px; }
.foot { margin-top:12px; font-size:10px; color:#b0b4c4; text-align:center; }
.kwrap { margin-top:4px; } .krow { margin-bottom:12px; font-size:13.5px; line-height:1.7; }
.krow .kt { font-weight:bold; color:#21243a; } .kitem { direction:ltr; unicode-bidi:isolate; display:inline-block; margin:0 10px; }
.kitem .num { color:#4f46e5; font-weight:bold; }
`;

function card(it,n){
  const inner = it.two
    ? `<div class="two-prompt"><span class="math">${it.lines[0]}</span><br><span class="math">${it.lines[1]}</span></div><div class="workbox"></div><div class="solline"><span class="seg">x =<span class="dots"></span></span><span class="seg">y =<span class="dots"></span></span></div>`
    : `<div class="prompt"><span class="math">${it.prompt}</span></div><div class="workbox"></div><div class="solline"><span class="seg">x =<span class="dots"></span></span></div>`;
  return `<div class="card"><div class="badge">${n}</div>${inner}</div>`;
}
function page({pill,title,sub,items}){
  return `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><title>${title}</title><style>${CSS}</style></head><body>
<div class="topbar"><div class="brand">מַעְבְּדַת הַמִּסְפָּרִים • דַּף עֲבוֹדָה</div><div class="pill">${pill}</div></div>
<div class="title"><h1>${title}</h1><div class="sub">${sub}</div></div>
<div class="cards">${items.map((it,i)=>card(it,i+1)).join('')}</div>
<div class="foot">מַעְבְּדַת הַמִּסְפָּרִים — דַּף עֲבוֹדָה לְהַדְפָּסָה</div>
</body></html>`;
}
function keyPage({title,sub,groups}){
  const rows=groups.map(g=>`<div class="krow"><span class="kt">${g.label}:</span> ${g.items.map((t,i)=>`<span class="kitem"><span class="num">${i+1})</span> ${t}</span>`).join('')}</div>`).join('');
  return `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><title>${title}</title><style>${CSS}</style></head><body>
<div class="topbar"><div class="brand">מַעְבְּדַת הַמִּסְפָּרִים • דַּף עֲבוֹדָה</div><div class="pill">לַהוֹרֶה</div></div>
<div class="title"><h1>${title}</h1><div class="sub">${sub}</div></div>
<div class="kwrap">${rows}</div>
<div class="foot">מַעְבְּדַת הַמִּסְפָּרִים — מַפְתֵּחַ פִּתְרוֹנוֹת</div>
</body></html>`;
}

/* ----- הפקה ----- */
const seenOne=new Set(), seenTwo=new Set();
const onePages=[], twoPages=[];
for(let p=0;p<4;p++){
  const its=Array.from({length:6},()=>genOne(seenOne));
  onePages.push(its);
  fs.writeFileSync(`${OUT}/L3one-${p+1}.html`, page({pill:`רָמָה 3 / 10`, title:`מִשְׁוָאוֹת בְּנֶעֱלָם אֶחָד — רָמָה 3`, sub:`נֶעֱלָם מִשְּׁנֵי הַצְּדָדִים · עַמּוּד ${p+1} מִתּוֹךְ 4`, items:its}));
}
for(let p=0;p<4;p++){
  const its=Array.from({length:6},()=>genTwo(seenTwo));
  twoPages.push(its);
  fs.writeFileSync(`${OUT}/L3two-${p+1}.html`, page({pill:`רָמָה 3 / 10`, title:`מִשְׁוָאוֹת בִּשְׁנֵי נֶעֱלָמִים — רָמָה 3`, sub:`מַעֲרָכוֹת עִם שְׁנֵי מְקַדְּמִים · עַמּוּד ${p+1} מִתּוֹךְ 4`, items:its}));
}
fs.writeFileSync(`${OUT}/L4.html`, page({pill:`רָמָה 4 / 10`, title:`מִשְׁוָאוֹת בְּנֶעֱלָם — רָמָה 4`, sub:`נֶעֱלָם עִם סוֹגְרַיִם, וּמַעֲרָכוֹת שֶׁדּוֹרְשׁוֹת הַכְפָּלָה`, items:L4}));

/* מפתחות */
fs.writeFileSync(`${OUT}/key-L3one.html`, keyPage({title:'מַפְתֵּחַ פִּתְרוֹנוֹת', sub:'נֶעֱלָם אֶחָד — רָמָה 3',
  groups:onePages.map((its,p)=>({label:`עַמּוּד ${p+1}`, items:its.map(it=>`${it.key} → ${it.ans}`)}))}));
fs.writeFileSync(`${OUT}/key-L3two.html`, keyPage({title:'מַפְתֵּחַ פִּתְרוֹנוֹת', sub:'שְׁנֵי נֶעֱלָמִים — רָמָה 3',
  groups:twoPages.map((its,p)=>({label:`עַמּוּד ${p+1}`, items:its.map(it=>`${it.key} → ${it.ans}`)}))}));
fs.writeFileSync(`${OUT}/key-L4.html`, keyPage({title:'מַפְתֵּחַ פִּתְרוֹנוֹת', sub:'רָמָה 4',
  groups:[{label:'רָמָה 4', items:L4.map(it=>`${it.key} → ${it.ans}`)}]}));

console.log('נכתבו: L3one-1..4, L3two-1..4, L4, key-L3one, key-L3two, key-L4');

/* אימות רמה 4 */
const t=[2*(5+3)===16, 3*(7-1)===18, 4*(5+2)===28, 2*(7+1)===7+9,
  (3*4+2*2===16&&2*4+5*2===18), (2*4+3*3===17&&3*4+2*3===18)];
console.log('רמה 4 — בדיקות:', t.every(Boolean)?'✓':('נכשל '+t.join(',')));
console.log(`ייחודיים: נעלם אחד=${seenOne.size}, שני נעלמים=${seenTwo.size}`);
