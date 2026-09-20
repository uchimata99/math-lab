#!/usr/bin/env node
// רמה 3 מתקדמת: חזקות, פירוק לגורמים, שברים — 2 עמודים לכל נושא + מפתח פתרונות.
const fs = require('fs');
const OUT = __dirname;

function gcd(a,b){a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b];}return a||1;}
function simplify([n,d]){const g=gcd(n,d);return [n/g,d/g];}
function frac(n,d){return `<span class="frac"><span class="fn">${n}</span><span class="fd">${d}</span></span>`;}
function fracAns([n,d]){if(d===1)return `${n}`;let s=frac(n,d);if(n>d){const w=Math.floor(n/d),r=n%d;s+=r===0?` = ${w}`:` = ${w}${frac(r,d)}`;}return s;}
function pw(b,e){return `<span class="pow">${b}<sup>${e}</sup></span>`;}
function primeFactor(n){const f={};let x=n;for(let p=2;p*p<=x;p++){while(x%p===0){f[p]=(f[p]||0)+1;x/=p;}}if(x>1)f[x]=(f[x]||0)+1;
  return Object.keys(f).map(Number).sort((a,b)=>a-b).map(p=>f[p]===1?`${p}`:pw(p,f[p])).join(' × ');}

/* ---- תוכן רמה 3 ---- */
// חזקות: [b1,e1,op,b2,e2]
const POW = [
  [2,5,'+',3,3],[10,2,'−',4,3],[5,3,'−',6,2],[3,4,'−',2,5],[2,6,'+',5,2],[4,3,'−',3,3],
  [2,4,'+',4,2],[5,2,'+',7,2],[10,2,'−',3,4],[2,5,'+',4,2],[6,2,'+',5,2],[3,4,'−',4,2],
];
const powVal=([b1,e1,op,b2,e2])=>op==='+'?b1**e1+b2**e2:b1**e1-b2**e2;
// פירוק: מספרים 60-120
const FACT = [60,72,84,90,96,100,108,120,64,80,88,112];
// שברים: [n1,d1,op,n2,d2]
const FR = [
  [2,3,'+',3,4],[3,4,'+',2,5],[5,6,'+',3,8],[5,6,'−',3,8],[5,6,'−',2,9],[7,10,'−',2,15],
  [3,8,'+',5,12],[7,8,'−',5,6],[4,5,'−',2,3],[3,4,'−',5,8],[5,6,'+',7,9],[2,3,'+',4,9],
];
const frVal=([n1,d1,op,n2,d2])=>{const L=d1*d2/gcd(d1,d2);const num=op==='+'?n1*(L/d1)+n2*(L/d2):n1*(L/d1)-n2*(L/d2);return simplify([num,L]);};

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
.prompt { text-align:center; font-size:24px; padding:8px 30px 4px; }
.math { direction:ltr; unicode-bidi:isolate; display:inline-flex; align-items:center; gap:8px; flex-wrap:wrap; justify-content:center; }
.op { color:#4c5fd5; font-weight:bold; padding:0 1px; }
.workbox { flex:1; margin-top:10px; border:1.6px dashed #d3d7e6; border-radius:10px; min-height:46px; }
.frac { display:inline-flex; flex-direction:column; align-items:center; vertical-align:middle; margin:0 3px; line-height:1; }
.frac .fn { padding:0 6px 3px; border-bottom:2.4px solid currentColor; } .frac .fd { padding:3px 6px 0; }
.efrac { display:inline-flex; flex-direction:column; vertical-align:middle; margin:0 6px; min-width:52px; }
.efrac .en { height:26px; background:#f5f7ff; border:1px solid #dfe3f2; border-bottom:2.6px solid #b9c0dd; border-radius:5px 5px 0 0; }
.efrac .ed { height:26px; background:#f5f7ff; border:1px solid #dfe3f2; border-top:none; border-radius:0 0 5px 5px; }
.pow sup { font-size:.62em; }
.blank { display:inline-block; min-width:70px; border-bottom:2.4px dotted #9aa0b5; height:20px; margin:0 4px; }
.fnum { text-align:center; font-size:30px; font-weight:800; color:#4f46e5; padding-top:6px; }
.tree { text-align:center; margin:2px 0 4px; }
.ansline { direction:ltr; unicode-bidi:isolate; display:flex; align-items:flex-end; gap:8px; margin-top:10px; padding:0 6px 2px; }
.ansline .dots { flex:1; border-bottom:2px dotted #9aa0b5; height:0; margin-bottom:5px; }
.ansline .eq { font-size:19px; font-weight:bold; white-space:nowrap; }
.foot { margin-top:12px; font-size:10px; color:#b0b4c4; text-align:center; }
.kwrap { margin-top:4px; } .krow { margin-bottom:12px; font-size:13.5px; line-height:1.8; }
.krow .kt { font-weight:bold; color:#21243a; } .kitem { direction:ltr; unicode-bidi:isolate; display:inline-block; margin:0 10px; }
.kitem .num { color:#4f46e5; font-weight:bold; } .kitem .frac{font-size:11px;}
`;

function card(type,it,n){
  let inner;
  if(type==='power'){
    inner=`<div class="prompt"><span class="math">${pw(it[0],it[1])} <span class="op">${it[2]}</span> ${pw(it[3],it[4])} <span class="op">=</span> <span class="blank"></span></span></div><div class="workbox"></div>`;
  } else if(type==='factor'){
    inner=`<div class="fnum">${it}</div><div class="tree"><svg width="40" height="18" viewBox="0 0 40 18"><path d="M4 16 L20 3 L36 16" fill="none" stroke="#c7cbe0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div class="workbox"></div><div class="ansline"><span class="dots"></span><span class="eq">= ${it}</span></div>`;
  } else { // fraction
    const efrac=`<span class="efrac"><span class="en"></span><span class="ed"></span></span>`;
    inner=`<div class="prompt"><span class="math">${frac(it[0],it[1])} <span class="op">${it[2]==='+'?'+':'−'}</span> ${frac(it[3],it[4])} <span class="op">=</span> ${efrac}</span></div><div class="workbox"></div>`;
  }
  return `<div class="card"><div class="badge">${n}</div>${inner}</div>`;
}
function page({pill,title,sub,type,items}){
  return `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><title>${title}</title><style>${CSS}</style></head><body>
<div class="topbar"><div class="brand">מַעְבְּדַת הַמִּסְפָּרִים • דַּף עֲבוֹדָה</div><div class="pill">${pill}</div></div>
<div class="title"><h1>${title}</h1><div class="sub">${sub}</div></div>
<div class="cards">${items.map((it,i)=>card(type,it,i+1)).join('')}</div>
<div class="foot">מַעְבְּדַת הַמִּסְפָּרִים — דַּף עֲבוֹדָה לְהַדְפָּסָה</div>
</body></html>`;
}
function keyPage({groups}){
  const rows=groups.map(g=>`<div class="krow"><span class="kt">${g.label}:</span> ${g.items.map((t,i)=>`<span class="kitem"><span class="num">${i+1})</span> ${t}</span>`).join('')}</div>`).join('');
  return `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><title>מפתח פתרונות</title><style>${CSS}</style></head><body>
<div class="topbar"><div class="brand">מַעְבְּדַת הַמִּסְפָּרִים • דַּף עֲבוֹדָה</div><div class="pill">לַהוֹרֶה</div></div>
<div class="title"><h1>מַפְתֵּחַ פִּתְרוֹנוֹת — רָמָה 3</h1><div class="sub">חֶזְקוֹת · פֵּרוּק לְגוֹרְמִים · שְׁבָרִים</div></div>
<div class="kwrap">${rows}</div>
<div class="foot">מַעְבְּדַת הַמִּסְפָּרִים — מַפְתֵּחַ פִּתְרוֹנוֹת</div>
</body></html>`;
}
const half=(arr,p)=>arr.slice(p*6,p*6+6);

/* ---- הפקה ---- */
const groups=[];
for(let p=0;p<2;p++){
  const it=half(POW,p);
  fs.writeFileSync(`${OUT}/p6-pow-${p+1}.html`, page({pill:'רָמָה 3 / 10', title:'חֶזְקוֹת — רָמָה 3', sub:`צֵרוּפֵי חֶזְקוֹת · עַמּוּד ${p+1} מִתּוֹךְ 2`, type:'power', items:it}));
  groups.push({label:`חֶזְקוֹת · עַמּוּד ${p+1}`, items:it.map(x=>`${x[0]}<sup>${x[1]}</sup> ${x[2]} ${x[3]}<sup>${x[4]}</sup> = ${powVal(x)}`)});
}
for(let p=0;p<2;p++){
  const it=half(FACT,p);
  fs.writeFileSync(`${OUT}/p6-fact-${p+1}.html`, page({pill:'רָמָה 3 / 10', title:'פֵּרוּק לְגוֹרְמִים — רָמָה 3', sub:`מִסְפָּרִים 60–120 · עַמּוּד ${p+1} מִתּוֹךְ 2`, type:'factor', items:it}));
  groups.push({label:`פֵּרוּק לְגוֹרְמִים · עַמּוּד ${p+1}`, items:it.map(n=>`${n} = ${primeFactor(n)}`)});
}
for(let p=0;p<2;p++){
  const it=half(FR,p);
  fs.writeFileSync(`${OUT}/p6-frac-${p+1}.html`, page({pill:'רָמָה 3 / 10', title:'חִבּוּר וְחִסּוּר שְׁבָרִים — רָמָה 3', sub:`מְכַנִּים שׁוֹנִים (מְכַנֶּה מְשֻׁתָּף) · עַמּוּד ${p+1} מִתּוֹךְ 2`, type:'fraction', items:it}));
  groups.push({label:`שְׁבָרִים · עַמּוּד ${p+1}`, items:it.map(x=>`${frac(x[0],x[1])} ${x[2]} ${frac(x[3],x[4])} = ${fracAns(frVal(x))}`)});
}
fs.writeFileSync(`${OUT}/p6-answers.html`, keyPage({groups}));
console.log('נכתבו: p6-pow-1/2, p6-fact-1/2, p6-frac-1/2, p6-answers');

/* אימות */
let ok=true;
POW.forEach(x=>{const v=powVal(x); if(v<=0||!Number.isInteger(v)){ok=false;console.log('חזקה בעייתית',x,v);}});
FR.forEach(x=>{const [n,d]=frVal(x); if(n<=0){ok=false;console.log('שבר שלילי/אפס',x);}});
console.log('אימות רמה 3:', ok?'✓ הכל תקין':'יש בעיה');
