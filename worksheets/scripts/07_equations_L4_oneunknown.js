#!/usr/bin/env node
// משוואות בנעלם אחד — רמה 4 (סוגריים), 2 עמודים + מפתח. סגנון "מעבדת המספרים".
const fs=require('fs'); const OUT=__dirname;
function mulberry32(s){return function(){let t=s+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
const R=mulberry32(90190); const ri=(a,b)=>a+Math.floor(R()*(b-a+1));
const mono=s=>`<span class="mono">${s}</span>`;

function gen(){
  const form=ri(1,4);
  if(form===1){ // a(x+b)=c
    const a=ri(2,5),x=ri(2,10),b=ri(1,6),c=a*(x+b);
    return {prompt:`${mono(a)}(x <span class="op">+</span> ${b}) <span class="op">=</span> ${c}`, key:`${a}(x + ${b}) = ${c}`, x};
  }
  if(form===2){ // a(x−b)=c
    const a=ri(2,5),x=ri(4,12),b=ri(1,x-1),c=a*(x-b);
    return {prompt:`${mono(a)}(x <span class="op">−</span> ${b}) <span class="op">=</span> ${c}`, key:`${a}(x − ${b}) = ${c}`, x};
  }
  if(form===3){ // a(x+b)=x+c
    const a=ri(2,4),x=ri(2,9),b=ri(1,5),c=a*(x+b)-x;
    if(c<=0) return null;
    return {prompt:`${mono(a)}(x <span class="op">+</span> ${b}) <span class="op">=</span> x <span class="op">+</span> ${c}`, key:`${a}(x + ${b}) = x + ${c}`, x};
  }
  // form4: a(x+b)=dx+c
  const a=ri(3,5),d=ri(1,a-1),x=ri(2,9),b=ri(1,5),c=a*(x+b)-d*x;
  if(c<=0) return null;
  const dTerm = d===1 ? 'x' : mono(d+'x');          // מקדם 1 לא נכתב
  const dKey  = d===1 ? 'x' : `${d}x`;
  return {prompt:`${mono(a)}(x <span class="op">+</span> ${b}) <span class="op">=</span> ${dTerm} <span class="op">+</span> ${c}`, key:`${a}(x + ${b}) = ${dKey} + ${c}`, x};
}
const seen=new Set(), items=[]; let g=0;
while(items.length<12 && g++<6000){ const it=gen(); if(!it) continue; if(seen.has(it.key)) continue; seen.add(it.key); items.push(it); }

const CSS=`
@page { size: A4; margin: 12mm 12mm 10mm; }
* { box-sizing: border-box; } html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family:'DejaVu Sans',Arial,sans-serif; direction:rtl; color:#2b2f42; margin:0; display:flex; flex-direction:column; min-height:100vh; }
.topbar { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }
.brand { font-size:12.5px; color:#7a8096; font-weight:bold; }
.pill { font-size:12px; color:#3a3f5a; background:#eef0f7; border:1px solid #e2e5f0; padding:3px 12px; border-radius:20px; font-weight:bold; }
.title h1 { font-size:26px; margin:0 0 2px; color:#21243a; font-weight:800; }
.title .sub { font-size:13px; color:#8a8fa5; margin-bottom:12px; }
.cards { flex:1; display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); grid-auto-rows:1fr; gap:20px; min-height:0; }
.card { position:relative; border:1px solid #e7e9f1; border-radius:16px; background:#fff; box-shadow:0 1px 3px rgba(20,20,60,.05); padding:18px 16px; display:flex; flex-direction:column; min-height:0; min-width:0; overflow:hidden; }
.badge { position:absolute; top:12px; right:14px; width:26px; height:26px; border-radius:50%; background:#eef0f5; color:#9aa0b5; font-size:12px; font-weight:bold; display:flex; align-items:center; justify-content:center; }
.prompt { text-align:center; font-size:23px; padding:8px 14px 4px; }
.math { direction:ltr; unicode-bidi:isolate; display:inline-flex; align-items:center; gap:7px; flex-wrap:wrap; max-width:100%; justify-content:center; }
.op { color:#4c5fd5; font-weight:bold; padding:0 1px; } .mono { letter-spacing:.5px; }
.workbox { flex:1; margin-top:10px; border:1.6px dashed #d3d7e6; border-radius:10px; min-height:46px; }
.solline { direction:ltr; unicode-bidi:isolate; display:flex; align-items:flex-end; justify-content:center; gap:10px; margin-top:10px; padding:0 6px 2px; font-size:19px; }
.solline .seg { display:flex; align-items:flex-end; gap:6px; } .solline .dots { width:80px; border-bottom:2.4px dotted #9aa0b5; height:0; margin-bottom:5px; }
.foot { margin-top:12px; font-size:10px; color:#b0b4c4; text-align:center; }
.kwrap{margin-top:4px;} .krow{margin-bottom:12px;font-size:14px;line-height:1.8;} .krow .kt{font-weight:bold;color:#21243a;}
.kitem{direction:ltr;unicode-bidi:isolate;display:inline-block;margin:0 11px;} .kitem .num{color:#4f46e5;font-weight:bold;}
`;
function card(it,n){
  return `<div class="card"><div class="badge">${n}</div><div class="prompt"><span class="math">${it.prompt}</span></div><div class="workbox"></div><div class="solline"><span class="seg">x =<span class="dots"></span></span></div></div>`;
}
function page(pageItems,p){
  return `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><title>משוואות רמה 4</title><style>${CSS}</style></head><body>
<div class="topbar"><div class="brand">מַעְבְּדַת הַמִּסְפָּרִים • דַּף עֲבוֹדָה</div><div class="pill">רָמָה 4 / 10</div></div>
<div class="title"><h1>מִשְׁוָאוֹת בְּנֶעֱלָם אֶחָד — רָמָה 4</h1><div class="sub">מִשְׁוָאוֹת עִם סוֹגְרַיִם · עַמּוּד ${p} מִתּוֹךְ 2</div></div>
<div class="cards">${pageItems.map((it,i)=>card(it,(p-1)*6+i+1)).join('')}</div>
<div class="foot">מַעְבְּדַת הַמִּסְפָּרִים — דַּף עֲבוֹדָה לְהַדְפָּסָה</div>
</body></html>`;
}
fs.writeFileSync(`${OUT}/p7-1.html`, page(items.slice(0,6),1));
fs.writeFileSync(`${OUT}/p7-2.html`, page(items.slice(6,12),2));
const kit=(arr,off)=>arr.map((it,i)=>`<span class="kitem"><span class="num">${off+i+1})</span> ${it.key} → x = ${it.x}</span>`).join('');
fs.writeFileSync(`${OUT}/p7-answers.html`, `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><title>מפתח</title><style>${CSS}</style></head><body>
<div class="topbar"><div class="brand">מַעְבְּדַת הַמִּסְפָּרִים • דַּף עֲבוֹדָה</div><div class="pill">לַהוֹרֶה</div></div>
<div class="title"><h1>מַפְתֵּחַ פִּתְרוֹנוֹת</h1><div class="sub">מִשְׁוָאוֹת בְּנֶעֱלָם אֶחָד — רָמָה 4</div></div>
<div class="kwrap"><div class="krow"><span class="kt">עַמּוּד 1:</span> ${kit(items.slice(0,6),0)}</div><div class="krow"><span class="kt">עַמּוּד 2:</span> ${kit(items.slice(6,12),6)}</div></div>
<div class="foot">מַעְבְּדַת הַמִּסְפָּרִים — מַפְתֵּחַ פִּתְרוֹנוֹת</div>
</body></html>`);
// אימות: לפתור כל משוואה מהמפתח ולוודא x
function verify(it){
  // בונים משוואה מספרית מ-key ובודקים מול x
  const k=it.key, x=it.x;
  const m=k.match(/^(\d+)\(x ([+−]) (\d+)\) = (.*)$/);
  const a=+m[1], sgn=m[2]==='+'?1:-1, b=+m[3], rhs=m[4];
  const L=a*(x+sgn*b);
  let Rv;
  if(/^\d+$/.test(rhs)) Rv=+rhs;
  else { const m2=rhs.match(/^(?:(\d+)x \+ )?(\d+)$/) || rhs.match(/^x \+ (\d+)$/);
    if(rhs.startsWith('x + ')) Rv=x+ +rhs.slice(4);
    else { const mm=rhs.match(/^(\d+)x \+ (\d+)$/); Rv=(+mm[1])*x + (+mm[2]); } }
  return L===Rv;
}
console.log('רמה 4 נעלם אחד — ייחודיים:', items.length, '| אימות:', items.every(verify)?'✓ הכל נכון':'✗ שגיאה');
