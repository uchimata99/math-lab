#!/usr/bin/env node
// חיבור וחיסור שברים — רמה 4 (מספרים מעורבים, מכנים שונים) — עמוד אחד + מפתח.
const fs=require('fs'); const OUT=__dirname;
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b];}return a||1;};
const simp=([n,d])=>{const g=gcd(n,d);return [n/g,d/g];};
const frac=(n,d)=>`<span class="frac"><span class="fn">${n}</span><span class="fd">${d}</span></span>`;
const mixed=(w,n,d)=>`<span class="mx">${w}</span>${frac(n,d)}`;                  // תצוגת מספר מעורב
const impr=(w,n,d)=>[w*d+n, d];                                                   // מעורב → שבר מדומה
function ansTxt([n,d]){ const s=simp([n,d]); if(s[1]===1) return `${s[0]}`;
  if(s[0]<s[1]) return frac(s[0],s[1]);
  const w=Math.floor(s[0]/s[1]), r=s[0]%s[1];
  return r===0? `${w}` : `${mixed(w,r,s[1])}`; }

// [w1,n1,d1, op, w2,n2,d2]
const ITEMS=[
  [1,1,2,'+',2,1,3],
  [2,3,4,'+',1,2,5],
  [3,5,6,'−',1,1,4],
  [4,1,3,'−',1,5,6],
  [2,5,8,'+',1,5,6],
  [5,1,4,'−',2,1,3],
];
function value(it){
  const [w1,n1,d1,op,w2,n2,d2]=it;
  const A=impr(w1,n1,d1), B=impr(w2,n2,d2);
  const L=A[1]*B[1]/gcd(A[1],B[1]);
  const num = op==='+' ? A[0]*(L/A[1])+B[0]*(L/B[1]) : A[0]*(L/A[1])-B[0]*(L/B[1]);
  return simp([num,L]);
}

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
.card { position:relative; border:1px solid #e7e9f1; border-radius:16px; background:#fff; box-shadow:0 1px 3px rgba(20,20,60,.05); padding:18px 14px; display:flex; flex-direction:column; min-height:0; min-width:0; overflow:hidden; }
.badge { position:absolute; top:12px; right:14px; width:26px; height:26px; border-radius:50%; background:#eef0f5; color:#9aa0b5; font-size:12px; font-weight:bold; display:flex; align-items:center; justify-content:center; }
.prompt { text-align:center; font-size:23px; padding:8px 10px 4px; }
.math { direction:ltr; unicode-bidi:isolate; display:inline-flex; align-items:center; gap:7px; flex-wrap:wrap; max-width:100%; justify-content:center; }
.op { color:#4c5fd5; font-weight:bold; padding:0 1px; }
.workbox { flex:1; margin-top:10px; border:1.6px dashed #d3d7e6; border-radius:10px; min-height:46px; }
.frac { display:inline-flex; flex-direction:column; align-items:center; vertical-align:middle; margin:0 2px; line-height:1; }
.frac .fn { padding:0 5px 3px; border-bottom:2.4px solid currentColor; } .frac .fd { padding:3px 5px 0; }
.mx { font-weight:700; margin-inline-end:2px; }
/* תבנית תשובה: משבצת לשלם + תבנית שבר */
.emix { display:inline-flex; align-items:center; gap:5px; vertical-align:middle; margin:0 5px; }
.ewhole { display:inline-block; width:38px; height:54px; background:#f5f7ff; border:1px solid #dfe3f2; border-radius:6px; }
.efrac { display:inline-flex; flex-direction:column; min-width:48px; }
.efrac .en { height:26px; background:#f5f7ff; border:1px solid #dfe3f2; border-bottom:2.6px solid #b9c0dd; border-radius:5px 5px 0 0; }
.efrac .ed { height:26px; background:#f5f7ff; border:1px solid #dfe3f2; border-top:none; border-radius:0 0 5px 5px; }
.foot { margin-top:12px; font-size:10px; color:#b0b4c4; text-align:center; }
.kwrap{margin-top:4px;} .krow{margin-bottom:12px;font-size:14px;line-height:2.1;} .krow .kt{font-weight:bold;color:#21243a;}
.kitem{direction:ltr;unicode-bidi:isolate;display:inline-block;margin:0 12px;} .kitem .num{color:#4f46e5;font-weight:bold;} .kitem .frac{font-size:11px;}
`;
const eAns=`<span class="emix"><span class="ewhole"></span><span class="efrac"><span class="en"></span><span class="ed"></span></span></span>`;
function card(it,n){
  const [w1,n1,d1,op,w2,n2,d2]=it;
  return `<div class="card"><div class="badge">${n}</div>`+
    `<div class="prompt"><span class="math">${mixed(w1,n1,d1)} <span class="op">${op}</span> ${mixed(w2,n2,d2)} <span class="op">=</span> ${eAns}</span></div>`+
    `<div class="workbox"></div></div>`;
}
fs.writeFileSync(`${OUT}/p8-frac-L4.html`, `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><title>שברים רמה 4</title><style>${CSS}</style></head><body>
<div class="topbar"><div class="brand">מַעְבְּדַת הַמִּסְפָּרִים • דַּף עֲבוֹדָה</div><div class="pill">רָמָה 4 / 10</div></div>
<div class="title"><h1>חִבּוּר וְחִסּוּר שְׁבָרִים — רָמָה 4</h1><div class="sub">מִסְפָּרִים מְעֹרָבִים עִם מְכַנִּים שׁוֹנִים — כִּתְבוּ שָׁלֵם בַּמִּשְׁבֶּצֶת וְשֶׁבֶר עַל הַקַּו</div></div>
<div class="cards">${ITEMS.map((it,i)=>card(it,i+1)).join('')}</div>
<div class="foot">מַעְבְּדַת הַמִּסְפָּרִים — דַּף עֲבוֹדָה לְהַדְפָּסָה</div>
</body></html>`);

const kit=ITEMS.map((it,i)=>{const [w1,n1,d1,op,w2,n2,d2]=it;
  return `<span class="kitem"><span class="num">${i+1})</span> ${mixed(w1,n1,d1)} ${op} ${mixed(w2,n2,d2)} = ${ansTxt(value(it))}</span>`;}).join('');
fs.writeFileSync(`${OUT}/p8-frac-L4-answers.html`, `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><title>מפתח</title><style>${CSS}</style></head><body>
<div class="topbar"><div class="brand">מַעְבְּדַת הַמִּסְפָּרִים • דַּף עֲבוֹדָה</div><div class="pill">לַהוֹרֶה</div></div>
<div class="title"><h1>מַפְתֵּחַ פִּתְרוֹנוֹת</h1><div class="sub">חִבּוּר וְחִסּוּר שְׁבָרִים — רָמָה 4 (מִסְפָּרִים מְעֹרָבִים)</div></div>
<div class="kwrap"><div class="krow"><span class="kt">רָמָה 4:</span> ${kit}</div></div>
<div class="foot">מַעְבְּדַת הַמִּסְפָּרִים — מַפְתֵּחַ פִּתְרוֹנוֹת</div>
</body></html>`);

// אימות עצמאי: חישוב בשברים עשרוניים והשוואה לתשובה המצומצמת
let ok=true;
ITEMS.forEach((it,i)=>{
  const [w1,n1,d1,op,w2,n2,d2]=it;
  const dec = op==='+' ? (w1+n1/d1)+(w2+n2/d2) : (w1+n1/d1)-(w2+n2/d2);
  const [n,d]=value(it);
  if(Math.abs(n/d-dec)>1e-9 || n<=0){ ok=false; console.log('בעיה בתרגיל',i+1,it,n+'/'+d,dec); }
});
console.log('שברים רמה 4 — אימות:', ok?'✓ כל 6 נכונים':'✗ שגיאה');
ITEMS.forEach((it,i)=>{const [n,d]=value(it);console.log(` ${i+1})`, it.join(' '), '=', n+'/'+d);});
