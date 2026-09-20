#!/usr/bin/env node
// דף: משוואות בנעלם — רמה 3/10 (נעלם משני הצדדים + מערכות עם שני מקדמים).
const fs = require('fs');
const OUT = __dirname;
const LEVEL = 3, LEVELS = 10;

const items = [
  {prompt:`<span class="mono">2x</span> <span class="op">+</span> 1 <span class="op">=</span> x <span class="op">+</span> 7`, key:'2x + 1 = x + 7', ans:'x = 6'},
  {prompt:`<span class="mono">3x</span> <span class="op">−</span> 2 <span class="op">=</span> x <span class="op">+</span> 8`, key:'3x − 2 = x + 8', ans:'x = 5'},
  {prompt:`<span class="mono">4x</span> <span class="op">+</span> 3 <span class="op">=</span> <span class="mono">2x</span> <span class="op">+</span> 15`, key:'4x + 3 = 2x + 15', ans:'x = 6'},
  {prompt:`<span class="mono">5x</span> <span class="op">−</span> 4 <span class="op">=</span> <span class="mono">3x</span> <span class="op">+</span> 10`, key:'5x − 4 = 3x + 10', ans:'x = 7'},
  {two:true, lines:['<span class="mono">2x</span> <span class="op">+</span> y <span class="op">=</span> 11','x <span class="op">+</span> <span class="mono">2y</span> <span class="op">=</span> 10'], key:'2x+y=11, x+2y=10', ans:'x = 4 , y = 3'},
  {two:true, lines:['<span class="mono">2x</span> <span class="op">+</span> <span class="mono">3y</span> <span class="op">=</span> 19','<span class="mono">3x</span> <span class="op">+</span> y <span class="op">=</span> 18'], key:'2x+3y=19, 3x+y=18', ans:'x = 5 , y = 3'},
];

const CSS = `
@page { size: A4; margin: 12mm 12mm 10mm; }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family:'DejaVu Sans',Arial,sans-serif; direction:rtl; color:#2b2f42; margin:0; display:flex; flex-direction:column; min-height:100vh; }
.topbar { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }
.brand { font-size:12.5px; color:#7a8096; font-weight:bold; }
.pill { font-size:12px; color:#3a3f5a; background:#eef0f7; border:1px solid #e2e5f0; padding:3px 12px; border-radius:20px; font-weight:bold; }
.title h1 { font-size:27px; margin:0 0 2px; color:#21243a; font-weight:800; }
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
.kwrap { margin-top:4px; } .krow { margin-bottom:13px; font-size:14px; line-height:1.7; }
.krow .kt { font-weight:bold; color:#21243a; } .kitem { direction:ltr; unicode-bidi:isolate; display:inline-block; margin:0 12px; }
.kitem .num { color:#4f46e5; font-weight:bold; }
`;

function card(it,n){
  const inner = it.two
    ? `<div class="two-prompt"><span class="math">${it.lines[0]}</span><br><span class="math">${it.lines[1]}</span></div><div class="workbox"></div><div class="solline"><span class="seg">x =<span class="dots"></span></span><span class="seg">y =<span class="dots"></span></span></div>`
    : `<div class="prompt"><span class="math">${it.prompt}</span></div><div class="workbox"></div><div class="solline"><span class="seg">x =<span class="dots"></span></span></div>`;
  return `<div class="card"><div class="badge">${n}</div>${inner}</div>`;
}

const cards = items.map((it,i)=>card(it,i+1)).join('');
fs.writeFileSync(`${OUT}/07-equations-L3.html`, `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><title>משוואות בנעלם — רמה ${LEVEL}</title><style>${CSS}</style></head><body>
<div class="topbar"><div class="brand">מַעְבְּדַת הַמִּסְפָּרִים • דַּף עֲבוֹדָה</div><div class="pill">רָמָה ${LEVEL} / ${LEVELS}</div></div>
<div class="title"><h1>מִשְׁוָאוֹת בְּנֶעֱלָם — רָמָה ${LEVEL}</h1><div class="sub">נֶעֱלָם מִשְּׁנֵי הַצְּדָדִים, וּמַעֲרָכוֹת עִם שְׁנֵי מְקַדְּמִים</div></div>
<div class="cards">${cards}</div>
<div class="foot">מַעְבְּדַת הַמִּסְפָּרִים — דַּף עֲבוֹדָה לְהַדְפָּסָה</div>
</body></html>`);

const kits = items.map((it,i)=>`<span class="kitem"><span class="num">${i+1})</span> ${it.key} → ${it.ans}</span>`).join('');
fs.writeFileSync(`${OUT}/07-equations-L3-answers.html`, `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><title>מפתח — משוואות רמה ${LEVEL}</title><style>${CSS}</style></head><body>
<div class="topbar"><div class="brand">מַעְבְּדַת הַמִּסְפָּרִים • דַּף עֲבוֹדָה</div><div class="pill">לַהוֹרֶה</div></div>
<div class="title"><h1>מַפְתֵּחַ פִּתְרוֹנוֹת</h1><div class="sub">מִשְׁוָאוֹת בְּנֶעֱלָם — רָמָה ${LEVEL}</div></div>
<div class="kwrap"><div class="krow"><span class="kt">מִשְׁוָאוֹת בְּנֶעֱלָם · רָמָה ${LEVEL}:</span> ${kits}</div></div>
<div class="foot">מַעְבְּדַת הַמִּסְפָּרִים — מַפְתֵּחַ פִּתְרוֹנוֹת</div>
</body></html>`);

// אימות
const t=[2*6+1===6+7, 3*5-2===5+8, 4*6+3===2*6+15, 5*7-4===3*7+10, (2*4+3===11&&4+2*3===10), (2*5+3*3===19&&3*5+3===18)];
console.log('רמה 3 — בדיקות פתרון:', t.every(Boolean)?'כולן עברו ✓':('נכשל: '+t.join(',')));
