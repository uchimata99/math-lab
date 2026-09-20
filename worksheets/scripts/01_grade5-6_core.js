#!/usr/bin/env node
// מחולל דפי עבודה — סגנון "מעבדת המספרים" (כרטיסים אווריריים, 6 לעמוד).
// נושאים: שברים · חזקות · פירוק לגורמים · משוואות בנעלם (+ שני נעלמים) · מפתח פתרונות.
const fs = require('fs');
const OUT = __dirname;

/* ---------- עזרים ---------- */
function gcd(a,b){a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b];}return a||1;}
function simplify([n,d]){const g=gcd(n,d);return [n/g,d/g];}
function frac(n,d){return `<span class="frac"><span class="fn">${n}</span><span class="fd">${d}</span></span>`;}
function fracAns([n,d]){if(d===1)return `${n}`;let s=frac(n,d);if(n>d){const w=Math.floor(n/d),r=n%d;s+=r===0?` = ${w}`:` = ${w}${frac(r,d)}`;}return s;}
function pw(b,e){return `<span class="pow">${b}<sup>${e}</sup></span>`;}
function primeFactor(n){const f={};let x=n;for(let p=2;p*p<=x;p++){while(x%p===0){f[p]=(f[p]||0)+1;x/=p;}}if(x>1)f[x]=(f[x]||0)+1;
  return Object.keys(f).map(Number).sort((a,b)=>a-b).map(p=>f[p]===1?`${p}`:pw(p,f[p])).join(' × ');}

/* ---------- נתוני הדפים ---------- */
// כל פריט: {prompt, ans}. סוג נקבע לפי type הדף.
const sheets = [
  { file:'01-fractions.html', idx:1, type:'fraction',
    title:'חִבּוּר וְחִסּוּר שְׁבָרִים', sub:'מְכַנֶּה שָׁוֶה וּמְכַנִּים שׁוֹנִים',
    items:[
      {a:[5,8],op:'+',b:[1,8]}, {a:[5,9],op:'+',b:[1,9]}, {a:[3,4],op:'+',b:[1,4]},
      {a:[1,2],op:'+',b:[1,4]}, {a:[2,3],op:'-',b:[1,6]}, {a:[5,6],op:'-',b:[1,3]},
    ]},
  { file:'02-powers.html', idx:2, type:'power',
    title:'חֶזְקוֹת', sub:'חַשְּׁבוּ אֶת עֵרֶךְ הַחֶזְקָה',
    items:[
      {expr:pw(2,3),val:8}, {expr:pw(5,2),val:25}, {expr:pw(10,2),val:100},
      {expr:`${pw(2,4)} <span class="op">+</span> ${pw(3,2)}`,val:25},
      {expr:pw(5,3),val:125},
      {expr:`${pw(3,3)} <span class="op">−</span> ${pw(2,4)}`,val:11},
    ]},
  { file:'03-factors.html', idx:3, type:'factor',
    title:'פֵּרוּק לְגוֹרְמִים', sub:'עַד 50 — כִּתְבוּ כְּמַכְפֶּלֶת גּוֹרְמִים רִאשׁוֹנִיִּים',
    items:[ {n:12},{n:18},{n:20},{n:24},{n:28},{n:45} ]},
  { file:'04-equations.html', idx:4, type:'equation',
    title:'מִשְׁוָאוֹת בְּנֶעֱלָם', sub:'מִצְאוּ אֶת הַנֶּעֱלָם',
    items:[
      {prompt:`<span class="mono">5x</span> <span class="op">=</span> 20`, key:'5x = 20', ans:'x = 4'},
      {prompt:`x <span class="op">+</span> 7 <span class="op">=</span> 15`, key:'x + 7 = 15', ans:'x = 8'},
      {prompt:`12 <span class="op">−</span> x <span class="op">=</span> 5`, key:'12 − x = 5', ans:'x = 7'},
      {prompt:`${frac('x',3)} <span class="op">=</span> 4`, key:'x/3 = 4', ans:'x = 12'},
      {two:true, lines:['x <span class="op">+</span> y <span class="op">=</span> 10','x <span class="op">−</span> y <span class="op">=</span> 4'], key:'x+y=10, x−y=4', ans:'x = 7 , y = 3'},
      {two:true, lines:['x <span class="op">+</span> y <span class="op">=</span> 9','x <span class="op">−</span> y <span class="op">=</span> 1'], key:'x+y=9, x−y=1', ans:'x = 5 , y = 4'},
    ]},
];

/* ---------- חישוב תשובות ---------- */
function answerFor(sheet, it){
  if(sheet.type==='fraction'){
    const [n1,d1]=it.a,[n2,d2]=it.b; const L=d1*d2/gcd(d1,d2);
    const num=it.op==='+'? n1*(L/d1)+n2*(L/d2) : n1*(L/d1)-n2*(L/d2);
    return fracAns(simplify([num,L]));
  }
  if(sheet.type==='power') return `${it.val}`;
  if(sheet.type==='factor') return primeFactor(it.n);
  if(sheet.type==='equation') return it.ans;
}

/* ---------- CSS (סגנון מעבדת המספרים) ---------- */
const CSS = `
@page { size: A4; margin: 12mm 12mm 10mm; }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family:'DejaVu Sans',Arial,sans-serif; direction:rtl; color:#2b2f42; margin:0;
  display:flex; flex-direction:column; min-height:100vh; }
.topbar { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }
.brand { font-size:12.5px; color:#7a8096; font-weight:bold; }
.pill { font-size:12px; color:#3a3f5a; background:#eef0f7; border:1px solid #e2e5f0;
  padding:3px 12px; border-radius:20px; font-weight:bold; }
.title h1 { font-size:27px; margin:0 0 2px; color:#21243a; font-weight:800; }
.title .sub { font-size:13px; color:#8a8fa5; margin-bottom:12px; }
.cards { flex:1; display:grid; grid-template-columns:1fr 1fr; grid-auto-rows:1fr; gap:20px; min-height:0; }
.card { position:relative; border:1px solid #e7e9f1; border-radius:16px; background:#fff;
  box-shadow:0 1px 3px rgba(20,20,60,.05); padding:18px 20px; display:flex; flex-direction:column; min-height:0; }
.badge { position:absolute; top:12px; right:14px; width:26px; height:26px; border-radius:50%;
  background:#eef0f5; color:#9aa0b5; font-size:12px; font-weight:bold; display:flex; align-items:center; justify-content:center; }
.prompt { text-align:center; font-size:24px; padding:8px 30px 4px; }
.two-prompt { text-align:center; font-size:22px; padding:6px 30px 4px; line-height:1.7; }
.math { direction:ltr; unicode-bidi:isolate; display:inline-flex; align-items:center; gap:8px; flex-wrap:wrap; justify-content:center; }
.op { color:#4c5fd5; font-weight:bold; padding:0 1px; }
.mono { letter-spacing:.5px; }
.workbox { flex:1; margin-top:10px; border:1.6px dashed #d3d7e6; border-radius:10px; min-height:46px; }
/* שבר */
.frac { display:inline-flex; flex-direction:column; align-items:center; vertical-align:middle; margin:0 3px; line-height:1; }
.frac .fn { padding:0 6px 3px; border-bottom:2.4px solid currentColor; }
.frac .fd { padding:3px 6px 0; }
.efrac { display:inline-flex; flex-direction:column; vertical-align:middle; margin:0 6px; min-width:52px; }
.efrac .en { height:26px; background:#f5f7ff; border:1px solid #dfe3f2; border-bottom:2.6px solid #b9c0dd; border-radius:5px 5px 0 0; }
.efrac .ed { height:26px; background:#f5f7ff; border:1px solid #dfe3f2; border-top:none; border-radius:0 0 5px 5px; }
.pow sup { font-size:.62em; }
.blank { display:inline-block; min-width:70px; border-bottom:2.4px dotted #9aa0b5; height:20px; margin:0 4px; }
/* פירוק לגורמים */
.fnum { text-align:center; font-size:30px; font-weight:800; color:#4f46e5; padding-top:6px; }
.tree { text-align:center; margin:2px 0 4px; }
.ansline { direction:ltr; unicode-bidi:isolate; display:flex; align-items:flex-end; gap:8px; margin-top:10px; padding:0 6px 2px; }
.ansline .dots { flex:1; border-bottom:2px dotted #9aa0b5; height:0; margin-bottom:5px; }
.ansline .eq { font-size:19px; font-weight:bold; white-space:nowrap; }
/* משוואה */
.solline { direction:ltr; unicode-bidi:isolate; display:flex; align-items:flex-end; justify-content:center; gap:10px; margin-top:10px; padding:0 6px 2px; font-size:19px; }
.solline .seg { display:flex; align-items:flex-end; gap:6px; }
.solline .dots { width:70px; border-bottom:2.4px dotted #9aa0b5; height:0; margin-bottom:5px; }
.foot { margin-top:12px; font-size:10px; color:#b0b4c4; text-align:center; }
/* מפתח פתרונות */
.kwrap { margin-top:4px; }
.krow { margin-bottom:13px; font-size:13.5px; line-height:1.6; }
.krow .kt { font-weight:bold; color:#21243a; }
.klist { display:inline; }
.kitem { direction:ltr; unicode-bidi:isolate; display:inline-block; margin:0 10px; }
.kitem .num { color:#4f46e5; font-weight:bold; }
`;

/* ---------- רינדור כרטיס ---------- */
function cardHTML(sheet, it, n){
  let inner='';
  if(sheet.type==='fraction'){
    const efrac=`<span class="efrac"><span class="en"></span><span class="ed"></span></span>`;
    inner=`<div class="prompt"><span class="math">${frac(it.a[0],it.a[1])} <span class="op">${it.op==='+'?'+':'−'}</span> ${frac(it.b[0],it.b[1])} <span class="op">=</span> ${efrac}</span></div>`+
      `<div class="workbox"></div>`;
  } else if(sheet.type==='power'){
    inner=`<div class="prompt"><span class="math">${it.expr} <span class="op">=</span> <span class="blank"></span></span></div>`+
      `<div class="workbox"></div>`;
  } else if(sheet.type==='factor'){
    inner=`<div class="fnum">${it.n}</div>`+
      `<div class="tree"><svg width="40" height="18" viewBox="0 0 40 18"><path d="M4 16 L20 3 L36 16" fill="none" stroke="#c7cbe0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`+
      `<div class="workbox"></div>`+
      `<div class="ansline"><span class="dots"></span><span class="eq">= ${it.n}</span></div>`;
  } else if(sheet.type==='equation'){
    if(it.two){
      inner=`<div class="two-prompt"><span class="math">${it.lines[0]}</span><br><span class="math">${it.lines[1]}</span></div>`+
        `<div class="workbox"></div>`+
        `<div class="solline"><span class="seg">x =<span class="dots"></span></span><span class="seg">y =<span class="dots"></span></span></div>`;
    } else {
      inner=`<div class="prompt"><span class="math">${it.prompt}</span></div>`+
        `<div class="workbox"></div>`+
        `<div class="solline"><span class="seg">x =<span class="dots"></span></span></div>`;
    }
  }
  return `<div class="card"><div class="badge">${n}</div>${inner}</div>`;
}

/* ---------- רינדור דף ---------- */
function renderSheet(sheet, total){
  const cards = sheet.items.map((it,i)=>cardHTML(sheet,it,i+1)).join('');
  return `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><title>${sheet.title}</title><style>${CSS}</style></head><body>
<div class="topbar"><div class="brand">מַעְבְּדַת הַמִּסְפָּרִים • דַּף עֲבוֹדָה</div><div class="pill">דַּף ${sheet.idx} / ${total}</div></div>
<div class="title"><h1>${sheet.title}</h1><div class="sub">${sheet.sub}</div></div>
<div class="cards">${cards}</div>
<div class="foot">מַעְבְּדַת הַמִּסְפָּרִים — דַּף עֲבוֹדָה לְהַדְפָּסָה</div>
</body></html>`;
}

/* ---------- מפתח פתרונות ---------- */
function renderAnswers(){
  let rows='';
  for(const sh of sheets){
    const items=sh.items.map((it,i)=>{
      let a;
      if(sh.type==='fraction'){ a=`${frac(it.a[0],it.a[1])} ${it.op} ${frac(it.b[0],it.b[1])} = ${answerFor(sh,it)}`; }
      else if(sh.type==='power'){ a=`${it.expr} = ${it.val}`; }
      else if(sh.type==='factor'){ a=`${it.n} = ${primeFactor(it.n)}`; }
      else { a = `${it.key} → ${it.ans}`; }
      return `<span class="kitem"><span class="num">${i+1})</span> ${a}</span>`;
    }).join('');
    rows+=`<div class="krow"><span class="kt">${sh.title}:</span> <span class="klist">${items}</span></div>`;
  }
  return `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><title>מפתח פתרונות</title><style>${CSS}</style></head><body>
<div class="topbar"><div class="brand">מַעְבְּדַת הַמִּסְפָּרִים • דַּף עֲבוֹדָה</div><div class="pill">לַהוֹרֶה</div></div>
<div class="title"><h1>מַפְתֵּחַ פִּתְרוֹנוֹת</h1><div class="sub">לַהוֹרֶה / הַמּוֹרֶה — הַמִּסְפּוּר תּוֹאֵם לְכָל דַּף</div></div>
<div class="kwrap">${rows}</div>
<div class="foot">מַעְבְּדַת הַמִּסְפָּרִים — מַפְתֵּחַ פִּתְרוֹנוֹת</div>
</body></html>`;
}

/* ---------- הפקה ---------- */
const total=sheets.length;
sheets.forEach(sh=>{ fs.writeFileSync(`${OUT}/${sh.file}`, renderSheet(sh,total)); console.log(`${sh.file}: ${sh.items.length} כרטיסים`); });
fs.writeFileSync(`${OUT}/05-answers.html`, renderAnswers());
console.log('05-answers.html: מפתח פתרונות');
// בדיקת שפיות תשובות
sheets.forEach(sh=>sh.items.forEach((it,i)=>{const a=answerFor(sh,it);if(!a)console.log('חסר תשובה',sh.file,i+1);}));
console.log('DONE');
