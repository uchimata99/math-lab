# מסירה — חוברות דפי עבודה "מעבדת המספרים"

מסמך זה מכיל **כל מה שצריך** כדי להמשיך לייצר דפי עבודה באותו סגנון בדיוק:
מפרט עיצוב, מבנה HTML, סוגי כרטיסים, כללי תוכן, סולם רמות ותהליך הפקה.

---

## 1. מה זה

חוברות תרגול **מודפסות** (A4, עברית מנוקדת, RTL) לשתי רמות:
- **כיתה ב'** — חשבון בסיסי.
- **כיתות ה'–ו' ומעלה** — שברים, חזקות, פירוק לגורמים, משוואות בנעלם.

כל דף = **עמוד A4 אחד** עם **6 כרטיסים** (2 עמודות × 3 שורות), אווריריים,
עם הרבה מקום לפתור. מפתח הפתרונות תמיד **בקובץ נפרד** (כדי להדפיס לילד רק תרגילים).

הדפים נוצרים ע"י סקריפטי **Node.js** שכותבים HTML, שמומר ל-PDF ע"י **Chromium headless**.

---

## 2. מפרט עיצוב (Design System)

### פלטה
| תפקיד | ערך |
|---|---|
| טקסט ראשי / מספרים | `#2b2f42` |
| כותרת ראשית | `#21243a` |
| כחול פעולות (+ − = ×) | `#4c5fd5` |
| סגול הדגשה (מספר בפירוק, מספור במפתח) | `#4f46e5` |
| טקסט משני / כיתוביות | `#8a8fa5`, `#7a8096` |
| מסגרת כרטיס | `#e7e9f1` |
| מסגרת מקווקוות (תיבת עבודה) | `#d3d7e6` |
| רקע משבצת תשובה | `#f5f7ff` + מסגרת `#cdd3f0` |
| תגית רמה (pill) | רקע `#eef0f7`, מסגרת `#e2e5f0` |
| עיגול מספר (badge) | רקע `#eef0f5`, טקסט `#9aa0b5` |

### גופן
`'DejaVu Sans', Arial, sans-serif` — כולל עברית **עם ניקוד**. (אין תלות ב-CDN.)

### CSS מלא (קנוני — להעתיק כמו שהוא)

```css
@page { size: A4; margin: 12mm 12mm 10mm; }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family:'DejaVu Sans',Arial,sans-serif; direction:rtl; color:#2b2f42; margin:0;
       display:flex; flex-direction:column; min-height:100vh; }

/* כותרת עליונה */
.topbar { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }
.brand { font-size:12.5px; color:#7a8096; font-weight:bold; }
.pill  { font-size:12px; color:#3a3f5a; background:#eef0f7; border:1px solid #e2e5f0;
         padding:3px 12px; border-radius:20px; font-weight:bold; }
.title h1  { font-size:26px; margin:0 0 2px; color:#21243a; font-weight:800; }
.title .sub{ font-size:13px; color:#8a8fa5; margin-bottom:12px; }

/* רשת הכרטיסים — ממלאת את גובה העמוד */
.cards { flex:1; display:grid;
         grid-template-columns:minmax(0,1fr) minmax(0,1fr);   /* ← קריטי, ראה §7 */
         grid-auto-rows:1fr; gap:20px; min-height:0; }
.card  { position:relative; border:1px solid #e7e9f1; border-radius:16px; background:#fff;
         box-shadow:0 1px 3px rgba(20,20,60,.05); padding:18px 16px;
         display:flex; flex-direction:column; min-height:0; min-width:0; overflow:hidden; }
.badge { position:absolute; top:12px; right:14px; width:26px; height:26px; border-radius:50%;
         background:#eef0f5; color:#9aa0b5; font-size:12px; font-weight:bold;
         display:flex; align-items:center; justify-content:center; }

/* תוכן הכרטיס */
.prompt { text-align:center; font-size:23px; padding:8px 12px 4px; }
.math   { direction:ltr; unicode-bidi:isolate;      /* ← קריטי, ראה §5 */
          display:inline-flex; align-items:center; gap:7px;
          flex-wrap:wrap; max-width:100%; justify-content:center; }
.op     { color:#4c5fd5; font-weight:bold; padding:0 1px; }
.mono   { letter-spacing:.5px; }
.workbox{ flex:1; margin-top:10px; border:1.6px dashed #d3d7e6; border-radius:10px; min-height:46px; }
.foot   { margin-top:12px; font-size:10px; color:#b0b4c4; text-align:center; }

/* שבר מוצג */
.frac { display:inline-flex; flex-direction:column; align-items:center; vertical-align:middle;
        margin:0 3px; line-height:1; }
.frac .fn { padding:0 6px 3px; border-bottom:2.4px solid currentColor; }
.frac .fd { padding:3px 6px 0; }
.mx { font-weight:700; margin-inline-end:2px; }   /* השלם במספר מעורב */

/* תבנית שבר ריקה לתשובה */
.efrac { display:inline-flex; flex-direction:column; vertical-align:middle; margin:0 6px; min-width:52px; }
.efrac .en { height:26px; background:#f5f7ff; border:1px solid #dfe3f2;
             border-bottom:2.6px solid #b9c0dd; border-radius:5px 5px 0 0; }
.efrac .ed { height:26px; background:#f5f7ff; border:1px solid #dfe3f2;
             border-top:none; border-radius:0 0 5px 5px; }
/* תבנית מספר מעורב: משבצת לשלם + שבר */
.emix   { display:inline-flex; align-items:center; gap:5px; vertical-align:middle; margin:0 5px; }
.ewhole { display:inline-block; width:38px; height:54px; background:#f5f7ff;
          border:1px solid #dfe3f2; border-radius:6px; }

/* חזקה */
.pow sup { font-size:.62em; }

/* קו תשובה מנוקד */
.blank { display:inline-block; min-width:70px; border-bottom:2.4px dotted #9aa0b5; height:20px; margin:0 4px; }

/* משבצת תשובה גדולה (כיתה ב') */
.ansbox { display:inline-block; width:62px; height:52px; background:#f5f7ff;
          border:1.6px solid #cdd3f0; border-radius:8px; vertical-align:middle; }

/* פירוק לגורמים */
.fnum { text-align:center; font-size:30px; font-weight:800; color:#4f46e5; padding-top:6px; }
.tree { text-align:center; margin:2px 0 4px; }
.ansline { direction:ltr; unicode-bidi:isolate; display:flex; align-items:flex-end; gap:8px;
           margin-top:10px; padding:0 6px 2px; }
.ansline .dots { flex:1; border-bottom:2px dotted #9aa0b5; height:0; margin-bottom:5px; }
.ansline .eq   { font-size:19px; font-weight:bold; white-space:nowrap; }

/* שורת פתרון למשוואה */
.solline { direction:ltr; unicode-bidi:isolate; display:flex; align-items:flex-end;
           justify-content:center; gap:10px; margin-top:10px; padding:0 6px 2px; font-size:19px; }
.solline .seg  { display:flex; align-items:flex-end; gap:6px; }
.solline .dots { width:80px; border-bottom:2.4px dotted #9aa0b5; height:0; margin-bottom:5px; }

/* תרגיל במאונך (טור) */
.vwrap { text-align:center; padding-top:8px; }
.vcalc { position:relative; display:inline-block; min-width:132px; direction:ltr; text-align:right;
         font-size:36px; font-weight:800; letter-spacing:12px; color:#2b2f42; }
.vcalc .l1,.vcalc .l2 { display:block; padding-right:10px; }
.vcalc .vop  { position:absolute; left:0; color:#4c5fd5; letter-spacing:0; }
.vcalc .vbar { display:block; border-top:3px solid #2b2f42; margin-top:8px; }

/* מפתח פתרונות */
.kwrap { margin-top:4px; }
.krow  { margin-bottom:12px; font-size:14px; line-height:1.8; }
.krow .kt { font-weight:bold; color:#21243a; }
.kitem { direction:ltr; unicode-bidi:isolate; display:inline-block; margin:0 11px; }
.kitem .num { color:#4f46e5; font-weight:bold; }
```

---

## 3. שלד העמוד

```html
<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8">
<title>…</title><style>/* ה-CSS מ-§2 */</style></head><body>

<div class="topbar">
  <div class="brand">מַעְבְּדַת הַמִּסְפָּרִים • דַּף עֲבוֹדָה</div>
  <div class="pill">רָמָה 3 / 10</div>          <!-- או: דַּף 2 / 5 -->
</div>

<div class="title">
  <h1>חֶזְקוֹת — רָמָה 3</h1>
  <div class="sub">צֵרוּפֵי חֶזְקוֹת · עַמּוּד 1 מִתּוֹךְ 2</div>
</div>

<div class="cards">
  <!-- 6 כרטיסים -->
</div>

<div class="foot">מַעְבְּדַת הַמִּסְפָּרִים — דַּף עֲבוֹדָה לְהַדְפָּסָה</div>
</body></html>
```

**המנגנון שממלא את העמוד:** `body` הוא flex-column עם `min-height:100vh`,
ו-`.cards` מקבל `flex:1` + `grid-auto-rows:1fr` → הכרטיסים נמתחים אוטומטית
למלא בדיוק עמוד אחד, בלי קשר לכמות התוכן בכרטיס.

---

## 4. סוגי כרטיסים (HTML)

> בכולם: `<div class="card"><div class="badge">N</div> … </div>`
> המספר בעיגול תמיד בפינה **ימנית עליונה**.

**א. תרגיל אופקי + משבצת תשובה** (כיתה ב')
```html
<div class="prompt"><span class="math">
  34 <span class="op">+</span> 25 <span class="op">=</span> <span class="ansbox"></span>
</span></div>
<div class="workbox"></div>
```

**ב. שבר → תבנית שבר ריקה**
```html
<div class="prompt"><span class="math">
  <span class="frac"><span class="fn">2</span><span class="fd">3</span></span>
  <span class="op">+</span>
  <span class="frac"><span class="fn">3</span><span class="fd">4</span></span>
  <span class="op">=</span>
  <span class="efrac"><span class="en"></span><span class="ed"></span></span>
</span></div>
<div class="workbox"></div>
```

**ג. מספר מעורב (רמה 4) → משבצת שלם + תבנית שבר**
```html
<span class="mx">1</span><span class="frac">…</span>
<span class="op">+</span>
<span class="mx">2</span><span class="frac">…</span>
<span class="op">=</span>
<span class="emix"><span class="ewhole"></span>
  <span class="efrac"><span class="en"></span><span class="ed"></span></span></span>
```

**ד. חזקה**
```html
<span class="math">
  <span class="pow">2<sup>5</sup></span> <span class="op">+</span>
  <span class="pow">3<sup>3</sup></span> <span class="op">=</span> <span class="blank"></span>
</span>
```

**ה. פירוק לגורמים** (מספר למעלה, "עץ", תיבה, ואז `= N`)
```html
<div class="fnum">72</div>
<div class="tree"><svg width="40" height="18" viewBox="0 0 40 18">
  <path d="M4 16 L20 3 L36 16" fill="none" stroke="#c7cbe0" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round"/></svg></div>
<div class="workbox"></div>
<div class="ansline"><span class="dots"></span><span class="eq">= 72</span></div>
```

**ו. משוואה** (נעלם אחד / שני נעלמים)
```html
<div class="prompt"><span class="math">
  <span class="mono">2x</span> <span class="op">+</span> 3 <span class="op">=</span> 11
</span></div>
<div class="workbox"></div>
<div class="solline"><span class="seg">x =<span class="dots"></span></span></div>
<!-- שני נעלמים: שתי שורות ב-.two-prompt + שני segments (x, y) -->
```

**ז. מאונך (טור)**
```html
<div class="vwrap"><span class="vcalc">
  <span class="l1">45</span>
  <span class="l2"><span class="vop">+</span>23</span>
  <span class="vbar"></span>
</span></div>
<div class="workbox"></div>
```

---

## 5. כללי תוכן — חובה

1. **עברית מנוקדת** בכותרות, כיתוביות והוראות.
2. **כל ביטוי מתמטי עטוף ב-`.math`** (`direction:ltr; unicode-bidi:isolate`).
   בלי זה RTL הופך את הביטוי: `x + 9 = 15` יוצג כ-`15 = 9 + x`, ו-`100 > 81` יוצג כ-`81 < 100`.
   זה נכון גם לנוסחה משובצת בתוך משפט עברי (עטוף ב-span מבודד).
3. **משוואות: בלי `×` ובלי `:`** — כותבים מקדם צמוד `5x`, וחילוק כשבר (`x` מעל `3`).
4. **מקדם 1 לא נכתב** — `x + 19`, לא `1x + 19`.
5. **כפל בכיתה ב' דווקא כן `×`** (זה הסימן המקובל בגיל הזה).
6. **סימן חיסור** — מינוס `−` (U+2212), לא מקף `-`.
7. **פירוק לגורמים — התשובות בחזקות**: `72 = 2³ × 3`, `18 = 2 × 3²`.
8. **תוצאות תקינות**: אין חיסור שלילי, שברים מצומצמים, תוצאה מעל 1 מוצגת גם כמספר מעורב.
9. **מפתח הפתרונות תמיד בקובץ נפרד.**
10. **התשובות מחושבות בקוד** — אף פעם לא נכתבות ביד. זו הדרך היחידה להבטיח מפתח נכון.

---

## 6. סולם הרמות (מה מגדיר כל רמה)

### משוואות בנעלם
| רמה | נעלם אחד | שני נעלמים |
|---|---|---|
| 1 | חד-שלבי `5x = 20`, `x + 7 = 15`, `x/3 = 4` | `x+y=10` / `x−y=4` (מקדמים 1) |
| 2 | דו-שלבי `2x + 3 = 11` | מקדם אחד `2x + y = 13` / `x + y = 8` |
| 3 | נעלם משני הצדדים `3x − 8 = 2x + 2` | שני מקדמים `2x + y = 11` / `x + 2y = 10` |
| 4 | סוגריים `4(x + 6) = 52`, `3(x + 3) = x + 19` | דורש הכפלה `3x + 2y = 16` / `2x + 5y = 18` |

### שברים
| רמה | תוכן |
|---|---|
| 1 | מכנה שווה + מכנים שונים פשוטים (`1/2 + 1/4`) |
| 3 | מכנים שונים אמיתיים, דורש מכנה משותף (`2/3 + 3/4`, `5/6 − 2/9`) |
| 4 | **מספרים מעורבים** (`1½ + 2⅓`), כולל פריטה בחיסור (`4⅓ − 1⅚`) |

### חזקות
| רמה | תוכן |
|---|---|
| 1 | הערכת ערך (`2³`), כתיבה כחזקה, השוואה `>,<,=`, צירוף פשוט |
| 3 | צירופי שתי חזקות גדולות (`2⁵ + 3³`, `10² − 4³`) |

### פירוק לגורמים
| רמה | תוכן |
|---|---|
| 1 | עד 50 (12, 18, 24, 45) |
| 3 | 60–120, הרבה גורמים (`96 = 2⁵ × 3`, `108 = 2² × 3³`) |

### כיתה ב' (נושאים, לא רמות)
עד 10 · עד 20 · עשרות שלמות · עשרות שחוצות 100 · דו-ספרתי עד 100 · כפל 1–5
(+ מאונך — קיים במחולל אבל **הוסר** מהחוברת הנוכחית לפי בקשה).

---

## 7. תהליך הפקה + מלכודות

### הפקה
```bash
node <generator>.js                      # כותב קובצי HTML
chromium --headless --no-pdf-header-footer \
         --print-to-pdf=out.pdf file://$PWD/page.html
# מיזוג לחוברת (Python + PyMuPDF):
python3 -c "
import pymupdf; d=pymupdf.open()
for p in ['p1.pdf','p2.pdf']: d.insert_pdf(pymupdf.open(p))
d.save('booklet.pdf')"
```

### ⚠ מלכודות אמיתיות שנתקלנו בהן

1. **אל תאמת לפי צילום מסך של ה-HTML.**
   חלון דפדפן ברוחב 794px רחב יותר מ-A4 מודפס (≈703px אחרי שוליים).
   תוכן רחב נראה תקין בצילום — **ונחתך ב-PDF**.
   ✅ תמיד רנדר את ה-**PDF** לתמונה ובדוק אותו:
   ```python
   pymupdf.open('page.pdf')[0].get_pixmap(dpi=110).save('check.png')
   ```

2. **`grid-template-columns:1fr 1fr` מתנפח.** אם תוכן כרטיס רחב מהעמודה,
   ה-track גדל, הרשת חורגת מהעמוד, והצד השמאלי נחתך.
   ✅ תמיד `minmax(0,1fr)` + `.card{min-width:0; overflow:hidden}` + `.math{flex-wrap:wrap; max-width:100%}`.

3. **bidi הופך ביטויים מתמטיים** — ראה §5 סעיף 2.

4. **מספרים גדולים צריכים פונט קטן יותר** — בכיתה ב' ירדנו מ-34px ל-30px
   כדי ש-`130 − 60 = □` ייכנס.

5. **טווח כמו "1-5" בכותרת עברית מתהפך** ל-"5-1".
   ✅ כתוב "כֶּפֶל 1 עַד 5" או עטוף ב-span מבודד.

6. **PDF לא תמיד נפתח בתצוגה מקדימה בצ'אט** — לשליחת תצוגה, שלח PNG.

---

## 8. מה קיים היום (בריפו)

`uchimata99/math-lab`, ענף `claude/primary-factors-exercise-variety-s6gftu`,
תיקייה `worksheets/`:

```
worksheets/
├── README.md
├── HANDOFF.md              ← המסמך הזה
├── scripts/                ← מחוללי Node (ללא תלויות)
│   ├── 01_grade5-6_core.js
│   ├── 02_grade2_booklet.js
│   ├── 03_equations_L2.js
│   ├── 04_equations_L3_single.js
│   ├── 05_equations_L3_expansion_and_L4.js
│   ├── 06_advanced_L3.js
│   ├── 07_equations_L4_oneunknown.js
│   └── 08_fractions_L4_mixed.js
└── pdf/
    ├── grade2-booklet.pdf              (12 עמ' — 6 נושאים × 2, ללא מפתח)
    ├── grade5-6-core.pdf               (רמה 1 + מפתח)
    ├── equations-ladder.pdf            (12 עמ' — רמות 1→4, תרגילים בלבד)
    ├── equations-answers.pdf
    ├── equations-L4-oneunknown.pdf     (2 עמ')
    ├── equations-L4-oneunknown-answers.pdf
    ├── advanced-L3.pdf                 (6 עמ' — חזקות/פירוק/שברים)
    ├── advanced-L3-answers.pdf
    ├── fractions-L4.pdf                (מספרים מעורבים)
    └── fractions-L4-answers.pdf
```

### מה עוד אפשר לבנות
- חזקות רמה 4, פירוק לגורמים רמה 4.
- משוואות רמה 5 (סוגריים משני הצדדים `3(x+2) = 2(x+5)`, שברים במשוואה).
- כיתה ב': בעיות מילוליות, כפל עד 10, מאונך עם החלפה.
