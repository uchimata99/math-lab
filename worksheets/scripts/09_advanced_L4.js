#!/usr/bin/env node
// רמה 4 מתקדמת: חזקות (סוגריים, חוקי חזקות, סדר פעולות) + פירוק לגורמים (126–252).
// 4 כרטיסים לעמוד, 2 עמודים לכל נושא + מפתח פתרונות.
const fs = require('fs'); const OUT = __dirname;

const pw=(b,e)=>`<span class="pow">${b}<sup>${e}</sup></span>`;
function primeFactor(n){const f={};let x=n;for(let p=2;p*p<=x;p++){while(x%p===0){f[p]=(f[p]||0)+1;x/=p;}}if(x>1)f[x]=(f[x]||0)+1;
  return Object.keys(f).map(Number).sort((a,b)=>a-b).map(p=>f[p]===1?`${p}`:pw(p,f[p])).join(' × ');}
const O=s=>`<span class="op">${s}</span>`;

/* ---- חזקות רמה 4 ---- js = ביטוי שמחושב בקוד (מקור האמת לתשובה) ---- */
const POW4 = [
  { js:'(2+3)**2',            expr:`(2 ${O('+')} 3)<sup>2</sup>`,                       key:'(2 + 3)²' },
  { js:'2**3 * 2**2',         expr:`${pw(2,3)} ${O('×')} ${pw(2,2)}`,                   key:'2³ × 2²' },
  { js:'(10-6)**3',           expr:`(10 ${O('−')} 6)<sup>3</sup>`,                      key:'(10 − 6)³' },
  { js:'2**4 + 3**3 - 5**2',  expr:`${pw(2,4)} ${O('+')} ${pw(3,3)} ${O('−')} ${pw(5,2)}`, key:'2⁴ + 3³ − 5²' },
  { js:'(3**2)**2',           expr:`(${pw(3,2)})<sup>2</sup>`,                          key:'(3²)²' },
  { js:'2**2 * 5**2',         expr:`${pw(2,2)} ${O('×')} ${pw(5,2)}`,                   key:'2² × 5²' },
  { js:'10**2 - (2+1)**3',    expr:`${pw(10,2)} ${O('−')} (2 ${O('+')} 1)<sup>3</sup>`, key:'10² − (2 + 1)³' },
  { js:'(6-2)**2 + 3**3',     expr:`(6 ${O('−')} 2)<sup>2</sup> ${O('+')} ${pw(3,3)}`,  key:'(6 − 2)² + 3³' },
];
POW4.forEach(it => { it.val = Function(`return ${it.js}`)(); });

/* ---- פירוק לגורמים רמה 4: מספרים גדולים עם הרבה גורמים ---- */
const FACT4 = [126,132,150,168,180,196,225,252];

const CSS = `
@page { size: A4; margin: 12mm 12mm 10mm; }
* { box-sizing: border-box; } html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family:'DejaVu Sans',Arial,sans-serif; direction:rtl; color:#2b2f42; margin:0; display:flex; flex-direction:column; min-height:100vh; }
.topbar { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }
.brand { font-size:12.5px; color:#7a8096; font-weight:bold; }
.pill { font-size:12px; color:#3a3f5a; background:#eef0f7; border:1px solid #e2e5f0; padding:3px 12px; border-radius:20px; font-weight:bold; }
.title h1 { font-size:27px; margin:0 0 2px; color:#21243a; font-weight:800; }
.title .sub { font-size:13px; color:#8a8fa5; margin-bottom:12px; }
.cards { flex:1; display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); grid-auto-rows:1fr; gap:22px; min-height:0; }
.card { position:relative; border:1px solid #e7e9f1; border-radius:16px; background:#fff; box-shadow:0 1px 3px rgba(20,20,60,.05); padding:20px 16px; display:flex; flex-direction:column; min-height:0; min-width:0; overflow:hidden; }
.badge { position:absolute; top:12px; right:14px; width:26px; height:26px; border-radius:50%; background:#eef0f5; color:#9aa0b5; font-size:12px; font-weight:bold; display:flex; align-items:center; justify-content:center; }
.prompt { text-align:center; font-size:23px; padding:10px 10px 4px; }
.math { direction:ltr; unicode-bidi:isolate; display:inline-flex; align-items:center; gap:8px; flex-wrap:wrap; max-width:100%; justify-content:center; }
.op { color:#4c5fd5; font-weight:bold; padding:0 1px; }
/* ביטוי שלם כיחידה אחת — אחרת ה-gap של ה-flex מנתק את ה-sup מהסוגריים */
.grp { white-space:nowrap; }
.grp .op { padding:0 6px; }
.workbox { flex:1; margin-top:12px; border:1.6px dashed #d3d7e6; border-radius:10px; min-height:60px; }
.pow sup { font-size:.62em; }
.blank { display:inline-block; min-width:80px; border-bottom:2.4px dotted #9aa0b5; height:22px; margin:0 4px; }
.fnum { text-align:center; font-size:34px; font-weight:800; color:#4f46e5; padding-top:8px; }
.tree { text-align:center; margin:2px 0 6px; }
.ansline { direction:ltr; unicode-bidi:isolate; display:flex; align-items:flex-end; gap:8px; margin-top:12px; padding:0 6px 2px; }
.ansline .dots { flex:1; border-bottom:2px dotted #9aa0b5; height:0; margin-bottom:5px; }
.ansline .eq { font-size:20px; font-weight:bold; white-space:nowrap; }
.foot { margin-top:12px; font-size:10px; color:#b0b4c4; text-align:center; }
.kwrap { margin-top:4px; } .krow { margin-bottom:12px; font-size:14px; line-height:1.9; }
.krow .kt { font-weight:bold; color:#21243a; } .kitem { direction:ltr; unicode-bidi:isolate; display:inline-block; margin:0 11px; }
.kitem .num { color:#4f46e5; font-weight:bold; }
`;

function card(type,it,n){
  const inner = type==='power'
    ? `<div class="prompt"><span class="math"><span class="grp">${it.expr}</span> ${O('=')} <span class="blank"></span></span></div><div class="workbox"></div>`
    : `<div class="fnum">${it}</div><div class="tree"><svg width="44" height="20" viewBox="0 0 44 20"><path d="M4 18 L22 3 L40 18" fill="none" stroke="#c7cbe0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div class="workbox"></div><div class="ansline"><span class="dots"></span><span class="eq">= ${it}</span></div>`;
  return `<div class="card"><div class="badge">${n}</div>${inner}</div>`;
}
function page({pill,title,sub,type,items,offset}){
  return `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><title>${title}</title><style>${CSS}</style></head><body>
<div class="topbar"><div class="brand">מַעְבְּדַת הַמִּסְפָּרִים • דַּף עֲבוֹדָה</div><div class="pill">${pill}</div></div>
<div class="title"><h1>${title}</h1><div class="sub">${sub}</div></div>
<div class="cards">${items.map((it,i)=>card(type,it,offset+i+1)).join('')}</div>
<div class="foot">מַעְבְּדַת הַמִּסְפָּרִים — דַּף עֲבוֹדָה לְהַדְפָּסָה</div>
</body></html>`;
}

const groups=[];
for(let p=0;p<2;p++){
  const it=POW4.slice(p*4,p*4+4);
  fs.writeFileSync(`${OUT}/p9-pow4-${p+1}.html`, page({pill:'רָמָה 4 / 10', title:'חֶזְקוֹת — רָמָה 4',
    sub:`סוֹגְרַיִם, חֻקֵּי חֶזְקוֹת וְסֵדֶר פְּעֻלּוֹת · עַמּוּד ${p+1} מִתּוֹךְ 2`, type:'power', items:it, offset:p*4}));
  groups.push({label:`חֶזְקוֹת · רָמָה 4 · עַמּוּד ${p+1}`, items:it.map(x=>`${x.key} = ${x.val}`)});
}
for(let p=0;p<2;p++){
  const it=FACT4.slice(p*4,p*4+4);
  fs.writeFileSync(`${OUT}/p9-fact4-${p+1}.html`, page({pill:'רָמָה 4 / 10', title:'פֵּרוּק לְגוֹרְמִים — רָמָה 4',
    sub:`מִסְפָּרִים 126–252 · עַמּוּד ${p+1} מִתּוֹךְ 2`, type:'factor', items:it, offset:p*4}));
  groups.push({label:`פֵּרוּק לְגוֹרְמִים · רָמָה 4 · עַמּוּד ${p+1}`, items:it.map(n=>`${n} = ${primeFactor(n)}`)});
}
const rows=groups.map(g=>`<div class="krow"><span class="kt">${g.label}:</span> ${g.items.map((t,i)=>`<span class="kitem"><span class="num">${i+1})</span> ${t}</span>`).join('')}</div>`).join('');
fs.writeFileSync(`${OUT}/p9-answers.html`, `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><title>מפתח — רמה 4</title><style>${CSS}</style></head><body>
<div class="topbar"><div class="brand">מַעְבְּדַת הַמִּסְפָּרִים • דַּף עֲבוֹדָה</div><div class="pill">לַהוֹרֶה</div></div>
<div class="title"><h1>מַפְתֵּחַ פִּתְרוֹנוֹת — רָמָה 4</h1><div class="sub">חֶזְקוֹת · פֵּרוּק לְגוֹרְמִים</div></div>
<div class="kwrap">${rows}</div>
<div class="foot">מַעְבְּדַת הַמִּסְפָּרִים — מַפְתֵּחַ פִּתְרוֹנוֹת</div>
</body></html>`);

/* ---- אימות ---- */
let ok=true;
POW4.forEach(it=>{ if(!Number.isInteger(it.val)||it.val<=0){ok=false;console.log('חזקה בעייתית:',it.key,it.val);} });
FACT4.forEach(n=>{ // מכפלת הגורמים חייבת להחזיר את המספר
  let x=n,prod=1; for(let p=2;p*p<=x;p++){while(x%p===0){prod*=p;x/=p;}} if(x>1)prod*=x;
  if(prod!==n){ok=false;console.log('פירוק בעייתי:',n);} });
console.log('רמה 4 — חזקות:', POW4.map(i=>`${i.key}=${i.val}`).join(' | '));
console.log('רמה 4 — אימות:', ok?'✓ הכל תקין':'✗ שגיאה');
