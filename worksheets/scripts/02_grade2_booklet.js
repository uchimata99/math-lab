#!/usr/bin/env node
// חוברת כיתה ב' — 2 עמודים לכל נושא (תרגילים ייחודיים) + מפתח פתרונות. סגנון "מעבדת המספרים".
const fs = require('fs');
const OUT = __dirname;
function mulberry32(s){return function(){let t=s+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
const R=mulberry32(424242);
const ri=(a,b)=>a+Math.floor(R()*(b-a+1));
function uniq(gen,count){const s=new Set(),out=[];let g=0;while(out.length<count&&g++<8000){const it=gen();const k=`${it.a}${it.op}${it.b}`;if(s.has(k))continue;s.add(k);out.push(it);}return out;}

/* מחוללי נושאים */
const G={
  add10:()=>R()<0.5?(()=>{const a=ri(1,9),b=ri(1,10-a);return{a,op:'+',b};})():(()=>{const a=ri(2,10),b=ri(1,a);return{a,op:'−',b};})(),
  add20:()=>{ if(R()<0.5){let a,b;do{a=ri(4,15);b=ri(4,15);}while(a+b>20||a+b<11);return{a,op:'+',b};} const a=ri(11,20),b=ri(2,Math.min(9,a-1));return{a,op:'−',b}; },
  tens:()=>{ if(R()<0.5){let t1,t2;do{t1=ri(1,9);t2=ri(1,9);}while(t1+t2>10);return{a:t1*10,op:'+',b:t2*10};} const t1=ri(2,10),t2=ri(1,t1-1);return{a:t1*10,op:'−',b:t2*10}; },
  tens100:()=>{ if(R()<0.5){let t1,t2;do{t1=ri(4,9);t2=ri(4,9);}while(t1+t2<11||t1+t2>19);return{a:t1*10,op:'+',b:t2*10};} const s=ri(11,19),b=ri(4,9);return{a:s*10,op:'−',b:b*10}; },
  upto100:()=>{ if(R()<0.5){const t1=ri(1,7),u1=ri(0,9),t2=ri(1,9-t1),u2=ri(0,9-u1);return{a:t1*10+u1,op:'+',b:t2*10+u2};}
    let t1,u1,t2,u2,b;do{t1=ri(2,9);u1=ri(0,9);t2=ri(1,t1);u2=ri(0,u1);b=t2*10+u2;}while(b<10||b>=t1*10+u1);return{a:t1*10+u1,op:'−',b}; },
  vert:()=>{ if(R()<0.5){let a,b;do{a=ri(13,80);b=ri(11,99-a);}while(b<11);return{a,op:'+',b};} const a=ri(23,99),b=ri(11,a-1);return{a,op:'−',b}; },
  mult:()=>{const a=ri(2,5),b=ri(2,5);return{a,op:'×',b};},
};
const topics=[
  {key:'add10', cap:10, title:'חִבּוּר וְחִסּוּר עַד 10', sub:'חַשְּׁבוּ וְכִתְבוּ אֶת הַתְּשׁוּבָה'},
  {key:'add20', cap:20, title:'חִבּוּר וְחִסּוּר עַד 20', sub:'חַשְּׁבוּ וְכִתְבוּ אֶת הַתְּשׁוּבָה'},
  {key:'tens', cap:100, title:'חִבּוּר וְחִסּוּר עֲשָׂרוֹת', sub:'עֲשָׂרוֹת שְׁלֵמוֹת — עַד 100'},
  {key:'tens100', cap:200, title:'עֲשָׂרוֹת — מֵעַל 100', sub:'עֲשָׂרוֹת שֶׁחוֹצוֹת אֶת הַ-100'},
  {key:'upto100', cap:100, title:'חִבּוּר וְחִסּוּר עַד 100', sub:'מִסְפָּרִים דּוּ-סִפְרָתִיִּים'},
  {key:'mult', cap:25, title:'כֶּפֶל 1 עַד 5', sub:'כֶּפֶל הוּא חִבּוּר חוֹזֵר — לְמָשָׁל <span style="unicode-bidi:isolate;direction:ltr">3×4 = 4+4+4</span>'},
];
function calc(it){return it.op==='+'?it.a+it.b:it.op==='−'?it.a-it.b:it.a*it.b;}

const CSS=`
@page { size: A4; margin: 12mm 12mm 10mm; }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family:'DejaVu Sans',Arial,sans-serif; direction:rtl; color:#2b2f42; margin:0; display:flex; flex-direction:column; min-height:100vh; }
.topbar { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }
.brand { font-size:12.5px; color:#7a8096; font-weight:bold; }
.pill { font-size:12px; color:#3a3f5a; background:#eef0f7; border:1px solid #e2e5f0; padding:3px 12px; border-radius:20px; font-weight:bold; }
.title h1 { font-size:28px; margin:0 0 2px; color:#21243a; font-weight:800; }
.title .sub { font-size:13px; color:#8a8fa5; margin-bottom:12px; }
.cards { flex:1; display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); grid-auto-rows:1fr; gap:20px; min-height:0; }
.card { position:relative; border:1px solid #e7e9f1; border-radius:16px; background:#fff; box-shadow:0 1px 3px rgba(20,20,60,.05); padding:18px 16px; display:flex; flex-direction:column; min-height:0; min-width:0; overflow:hidden; }
.badge { position:absolute; top:12px; right:14px; width:26px; height:26px; border-radius:50%; background:#eef0f5; color:#9aa0b5; font-size:12px; font-weight:bold; display:flex; align-items:center; justify-content:center; }
.prompt { text-align:center; padding:10px 12px 4px; }
.math { direction:ltr; unicode-bidi:isolate; display:inline-flex; align-items:center; gap:10px; justify-content:center; flex-wrap:wrap; max-width:100%; font-size:30px; font-weight:700; }
.op { color:#4c5fd5; font-weight:800; }
.ansbox { display:inline-block; width:62px; height:52px; background:#f5f7ff; border:1.6px solid #cdd3f0; border-radius:8px; vertical-align:middle; }
.workbox { flex:1; margin-top:12px; border:1.6px dashed #d3d7e6; border-radius:10px; min-height:60px; }
.vwrap { text-align:center; padding-top:8px; }
.vcalc { position:relative; display:inline-block; min-width:132px; direction:ltr; text-align:right; font-size:36px; font-weight:800; letter-spacing:12px; color:#2b2f42; }
.vcalc .l1,.vcalc .l2 { display:block; padding-right:10px; }
.vcalc .vop { position:absolute; left:0; color:#4c5fd5; letter-spacing:0; }
.vcalc .vbar { display:block; border-top:3px solid #2b2f42; margin-top:8px; }
.foot { margin-top:12px; font-size:10px; color:#b0b4c4; text-align:center; }
.kwrap { margin-top:4px; } .krow { margin-bottom:11px; font-size:13.5px; line-height:1.7; }
.krow .kt { font-weight:bold; color:#21243a; } .kitem { direction:ltr; unicode-bidi:isolate; display:inline-block; margin:0 9px; }
.kitem .num { color:#4f46e5; font-weight:bold; }
`;
function card(it,n,type){
  const inner = type==='vert'
    ? `<div class="vwrap"><span class="vcalc"><span class="l1">${it.a}</span><span class="l2"><span class="vop">${it.op}</span>${it.b}</span><span class="vbar"></span></span></div><div class="workbox"></div>`
    : `<div class="prompt"><span class="math">${it.a} <span class="op">${it.op}</span> ${it.b} <span class="op">=</span> <span class="ansbox"></span></span></div><div class="workbox"></div>`;
  return `<div class="card"><div class="badge">${n}</div>${inner}</div>`;
}
function page({pill,title,sub,type,items}){
  return `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><title>${title}</title><style>${CSS}</style></head><body>
<div class="topbar"><div class="brand">מַעְבְּדַת הַמִּסְפָּרִים • כִּתָּה ב'</div><div class="pill">${pill}</div></div>
<div class="title"><h1>${title}</h1><div class="sub">${sub}</div></div>
<div class="cards">${items.map((it,i)=>card(it,i+1,type)).join('')}</div>
<div class="foot">מַעְבְּדַת הַמִּסְפָּרִים — דַּף עֲבוֹדָה לְהַדְפָּסָה</div>
</body></html>`;
}

/* הפקה: 2 עמודים לכל נושא — ללא מפתח תשובות */
const files=[];
topics.forEach((t,ti)=>{
  const all=uniq(G[t.key],12);
  for(let p=0;p<2;p++){
    const items=all.slice(p*6,p*6+6);
    const fn=`g2-${String(ti+1).padStart(2,'0')}${p===0?'a':'b'}-${t.key}.html`;
    fs.writeFileSync(`${OUT}/${fn}`, page({pill:`נוֹשֵׂא ${ti+1} · עַמּוּד ${p+1}/2`, title:t.title, sub:t.sub, type:t.type, items}));
    files.push(fn.replace('.html',''));
    items.forEach((it,i)=>{const r=calc(it);if(r<0||r>t.cap)console.log('חריגה',fn,i+1,r);});
  }
});
console.log('דפים:', files.length, '(6 נושאים × 2, ללא מפתח)');
console.log('DONE');
