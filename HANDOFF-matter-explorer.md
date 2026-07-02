# מסמך מסירה — קורס "מסע אל תוך החומר" (חוקר הטבלה המחזורית)

> נבנה במאגר `uchimata99/math-lab` בתאריך 2026-07-02. המסמך מכיל את **כל הקוד** כדי לשחזר את הפיצ'ר בפרויקט ה-LAB. האפליקציה היא קובץ יחיד `index.html` (React 18 + Babel-standalone מ-CDN, script `type="text/babel"`), RTL, עברית מנוקדת.

---

## מה זה עושה

מודול **חקר אינטראקטיבי** (לא שאלות-ותשובות) שמתחיל בטבלה המחזורית ומאפשר לילדה בת 7 להיכנס פנימה שכבה אחר שכבה — ולחזור למקור:

- **טבלה מחזורית** ב-RTL עם 22 יסודות אמיתיים (מימן→אורניום), צבע לפי משפחה, מקרא, וצללית אותנטית של הטבלה (כולל ה"חֶסֶר" של מתכות המעבר).
- **כניסה ליסוד** ← מודל בוהר מצויר (סוג `Figure` חדש בשם `"bohr"` שמצייר גרעין + קליפות אלקטרונים לפי מספר האלקטרונים האמיתי), מונה פרוטונים/נייטרונים/אלקטרונים, עובדות ושימושים לכל יסוד.
- **העמקה**: גרעין ← פרוטון/נייטרון ← קוורק מעלה/מטה ← שדה (המקור). מסלול מקביל: אלקטרונים ← אלקטרון (לפטון) ← שדה. וגם ענף "הכוח החזק".
- **ניווט**: פירורי-לחם לחיצים (קפיצה לכל שלב אחורה), כפתור "⟲ חזרה למקור" בכל מסך, והקראה (רמקול) על כל תוכן.

**אומת** בשתי דרכים: (1) טרנספורם Babel נקי; (2) טעינה בכרומיום עם ניווט מלא בכל הענפים — ללא שגיאות ריצה.

---

## תלויות בתוך הקוד הקיים (חייבות להתקיים)

המודול נשען על רכיבים/עוזרים גלובליים שכבר קיימים ב-math-lab. ודא שהם קיימים בפרויקט היעד (או התאם):

- `function Figure({fig,color})` — שם מוסיפים את הסוג `"bohr"` (שלב 1). משתמש גם בסוג `"quarks"` הקיים (פרוטון/נייטרון).
- `function speak(text)` — הקראת TTS בעברית (SpeechSynthesis he-IL).
- `function Icon({name,size,color})` + מילון `ICONS` — נדרשים המפתחות: `speaker`, `atom`, `bolt`.
- `function Shell({children,...sp})` — מעטפת עם כותרת שחקן/כוכבים.
- `const pick = arr => arr[...]` — כבר קיים.
- `const {useState} = React;`

אם `ICONS.speaker` / `atom` / `bolt` חסרים, הנה גרסאות (SVG בתוך `<g>`, עם `stroke=currentColor`):

```jsx
speaker: <g><path d="M4 9.5v5h3.3L12 18V6L7.3 9.5z" /><path d="M15.5 9.2a4 4 0 010 5.6" /><path d="M18 7a7 7 0 010 10" /></g>,
atom: <g><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" /><ellipse cx="12" cy="12" rx="10" ry="4" /><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" /><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-60 12 12)" /></g>,
bolt: <g><path d="M13 3L5 13.5h5l-1 7.5 8-11h-5z" /></g>,
```

---

## שלב 1 — הוסף סוג ציור `bohr` לרכיב `Figure`

בתוך `function Figure({ fig, color }) {...}`, הוסף את הבלוק הבא (למשל ממש לפני `if (fig.type === "quarks")`):

```jsx
  if (fig.type === "bohr") {
    const shells = fig.shells || [];
    const cx = 150, cy = 150, r0 = 42;
    const n = shells.length;
    const gap = n > 1 ? Math.min(24, (130 - r0) / (n - 1)) : 0;
    const rings = shells.map((_, i) => r0 + i * gap);
    const dots = [];
    shells.forEach((cnt, i) => {
      const rr = rings[i];
      for (let e = 0; e < cnt; e++) {
        const a = (Math.PI * 2 * e) / cnt + i * 0.55;
        dots.push({ x: cx + rr * Math.cos(a), y: cy + rr * Math.sin(a) });
      }
    });
    const nuc = [[0, 0], [-12, -5], [12, -5], [-7, 10], [7, 10], [0, -13], [0, 13], [-13, 6], [13, 6]];
    return (
      <svg width="300" height="300" viewBox="0 0 300 300" style={{ maxWidth: "100%" }}>
        {rings.map((rr, i) => <circle key={"r" + i} cx={cx} cy={cy} r={rr} fill="none" stroke={color} strokeWidth="1.6" opacity="0.4" />)}
        <g>{nuc.map((q, i) => <circle key={"n" + i} cx={cx + q[0]} cy={cy + q[1]} r="8.5" fill={i % 2 ? "#9aa0a6" : "#ff4d4f"} />)}</g>
        {dots.map((d, i) => <circle key={"e" + i} cx={d.x} cy={d.y} r="4.6" fill="#1677ff" />)}
      </svg>
    );
  }
```

---

## שלב 2 — נתוני היסודות + רכיב ה-Explorer

הדבק את כל הבלוק הבא **לפני** `const COURSES = [...]`. הוא מגדיר: `EL_CAT`, `ELEMENTS`, `EL_BY_Z`, `elNeutrons`, `TABLE_SHAPE`, `ExpSpeak`, `DrillCard`, ו-`Explorer`:

```jsx
/* ============================================================
   מסע אל תוך החומר — חוקרים דרך הטבלה המחזורית
   נכנסים ליסוד → גרעין → פרוטון/נייטרון → קוורק → שדה,
   ואפשר תמיד לחזור למקור. אינטראקטיבי וחוקר.
   ============================================================ */
const EL_CAT = {
  nonmetal:  { name: "אַל-מַתֶּכֶת", color: "#36cfc9" },
  noble:     { name: "גַּז אָצִיל", color: "#9254de" },
  alkali:    { name: "מַתֶּכֶת אַלְקָלִית", color: "#ff7a45" },
  alkaline:  { name: "מַתֶּכֶת אֲדָמָה", color: "#ffa940" },
  metal:     { name: "מַתֶּכֶת", color: "#8c8c8c" },
  metalloid: { name: "מֶחֱצַת-מַתֶּכֶת", color: "#73d13d" },
  halogen:   { name: "הָלוֹגֵן", color: "#597ef4" },
};
/* g = טור (1–18), p = שורה (מחזור), mass = מספר מסה, sh = אלקטרונים בכל קליפה */
const ELEMENTS = [
  { z: 1, sym: "H", he: "מֵימָן", cat: "nonmetal", g: 1, p: 1, mass: 1, sh: [1],
    fact: "הַיְסוֹד הֲכִי קַל וְהֲכִי נָפוֹץ בַּיְּקוּם — הַכּוֹכָבִים בְּנוּיִים מִמֶּנּוּ.", use: "מַיִם עֲשׂוּיִים מִמֵּימָן וְחַמְצָן (H₂O)." },
  { z: 2, sym: "He", he: "הֶלְיוּם", cat: "noble", g: 18, p: 1, mass: 4, sh: [2],
    fact: "קַל מְאוֹד, לָכֵן בָּלוֹן מָלֵא בּוֹ עָף לְמַעְלָה.", use: "בָּלוֹנִים פּוֹרְחִים וּסְפִינוֹת אֲוִיר." },
  { z: 3, sym: "Li", he: "לִיתְיוּם", cat: "alkali", g: 1, p: 2, mass: 7, sh: [2, 1],
    fact: "מַתֶּכֶת כֹּה קַלָּה שֶׁהִיא צָפָה עַל מַיִם.", use: "סוֹלְלוֹת שֶׁל טֶלֶפוֹנִים וְצַעֲצוּעִים." },
  { z: 6, sym: "C", he: "פַּחְמָן", cat: "nonmetal", g: 14, p: 2, mass: 12, sh: [2, 4],
    fact: "הַבָּסִיס שֶׁל כָּל הַיְצוּרִים הַחַיִּים — גַּם אֲנַחְנוּ.", use: "יַהֲלוֹם וְעִפָּרוֹן — שְׁנֵיהֶם פַּחְמָן!" },
  { z: 7, sym: "N", he: "חַנְקָן", cat: "nonmetal", g: 15, p: 2, mass: 14, sh: [2, 5],
    fact: "רֹב הָאֲוִיר שֶׁאֲנַחְנוּ נוֹשְׁמִים הוּא חַנְקָן.", use: "מְמַלֵּא צְמִיגִים וּשְׁקִיּוֹת חֲטִיפִים." },
  { z: 8, sym: "O", he: "חַמְצָן", cat: "nonmetal", g: 16, p: 2, mass: 16, sh: [2, 6],
    fact: "נוֹשְׁמִים אוֹתוֹ כָּל הַזְּמַן כְּדֵי לִחְיוֹת.", use: "אֵשׁ צְרִיכָה חַמְצָן כְּדֵי לִבְעֹר." },
  { z: 10, sym: "Ne", he: "נֵאוֹן", cat: "noble", g: 18, p: 2, mass: 20, sh: [2, 8],
    fact: "כְּשֶׁמַּעֲבִירִים בּוֹ חַשְׁמַל הוּא זוֹהֵר בְּאָדֹם-כָּתֹם.", use: "שְׁלָטִים זוֹהֲרִים בָּרְחוֹב." },
  { z: 11, sym: "Na", he: "נַתְרָן", cat: "alkali", g: 1, p: 3, mass: 23, sh: [2, 8, 1],
    fact: "לְבַדּוֹ הוּא מְסֻכָּן, אֲבָל עִם כְּלוֹר הוּא מֶלַח בִּישׁוּל.", use: "מֶלַח שֶׁאֲנַחְנוּ אוֹכְלִים (NaCl)." },
  { z: 12, sym: "Mg", he: "מַגְנֵזְיוּם", cat: "alkaline", g: 2, p: 3, mass: 24, sh: [2, 8, 2],
    fact: "בּוֹעֵר בְּאוֹר לָבָן מְסַנְוֵר.", use: "זִקּוּקִין דִּי-נוּר וּמָטוֹסִים קַלִּים." },
  { z: 13, sym: "Al", he: "אֲלוּמִינְיוּם", cat: "metal", g: 13, p: 3, mass: 27, sh: [2, 8, 3],
    fact: "קַל וְלֹא מַחְלִיד בְּקַלּוּת.", use: "פַּחִיּוֹת שְׁתִיָּה וּנְיָר כֶּסֶף." },
  { z: 14, sym: "Si", he: "צוֹרָן", cat: "metalloid", g: 14, p: 3, mass: 28, sh: [2, 8, 4],
    fact: "רֹב הַחוֹל בַּיָּם עָשׂוּי מִמֶּנּוּ.", use: "שְׁבָבִים חֲכָמִים בְּתוֹךְ מַחְשְׁבִים." },
  { z: 16, sym: "S", he: "גָּפְרִית", cat: "nonmetal", g: 16, p: 3, mass: 32, sh: [2, 8, 6],
    fact: "צָהֹב, וּמֵרִיחַ כְּמוֹ בֵּיצָה מְקֻלְקֶלֶת.", use: "גַּפְרוּרִים וְדֶשֶׁן לִצְמָחִים." },
  { z: 17, sym: "Cl", he: "כְּלוֹר", cat: "halogen", g: 17, p: 3, mass: 35, sh: [2, 8, 7],
    fact: "גַּז יָרֹק-צָהֹב עִם רֵיחַ חָזָק.", use: "מְנַקֶּה מַיִם בַּבְּרֵכָה." },
  { z: 18, sym: "Ar", he: "אַרְגּוֹן", cat: "noble", g: 18, p: 3, mass: 40, sh: [2, 8, 8],
    fact: "כָּל כָּךְ עָצֵל שֶׁהוּא כִּמְעַט לֹא מִתְחַבֵּר לְאַף אֶחָד.", use: "מְמַלֵּא נוּרוֹת כְּדֵי שֶׁלֹּא יִשָּׂרְפוּ." },
  { z: 19, sym: "K", he: "אַשְׁלְגָן", cat: "alkali", g: 1, p: 4, mass: 39, sh: [2, 8, 8, 1],
    fact: "יֵשׁ הַרְבֵּה מִמֶּנּוּ בְּתוֹךְ בָּנָנוֹת!", use: "עוֹזֵר לַשְּׁרִירִים וְלַלֵּב שֶׁלָּנוּ." },
  { z: 20, sym: "Ca", he: "סִידָן", cat: "alkaline", g: 2, p: 4, mass: 40, sh: [2, 8, 8, 2],
    fact: "בּוֹנֶה עֲצָמוֹת וְשִׁנַּיִם חֲזָקוֹת.", use: "יֵשׁ הַרְבֵּה מִמֶּנּוּ בְּחָלָב וּגְבִינָה." },
  { z: 26, sym: "Fe", he: "בַּרְזֶל", cat: "metal", g: 8, p: 4, mass: 56, sh: [2, 8, 14, 2],
    fact: "מָגְנֵטִי, וְגַם זוֹרֵם בַּדָּם שֶׁלָּנוּ.", use: "בִּנְיָנִים, גְּשָׁרִים וּמְכוֹנִיּוֹת." },
  { z: 29, sym: "Cu", he: "נְחֹשֶׁת", cat: "metal", g: 11, p: 4, mass: 64, sh: [2, 8, 18, 1],
    fact: "כָּתֹם-אָדֹם, וּמַעֲבִיר חַשְׁמַל מְצֻיָּן.", use: "חוּטֵי הַחַשְׁמַל בַּבַּיִת." },
  { z: 47, sym: "Ag", he: "כֶּסֶף", cat: "metal", g: 11, p: 5, mass: 108, sh: [2, 8, 18, 18, 1],
    fact: "מַבְרִיק, וּמַעֲבִיר חַשְׁמַל וְחֹם הֲכִי טוֹב.", use: "תַּכְשִׁיטִים, מַטְבְּעוֹת וּמַרְאוֹת." },
  { z: 79, sym: "Au", he: "זָהָב", cat: "metal", g: 11, p: 6, mass: 197, sh: [2, 8, 18, 32, 18, 1],
    fact: "אֵינוֹ מַחְלִיד לְעוֹלָם, לָכֵן נִשְׁאָר מַבְרִיק.", use: "תַּכְשִׁיטִים יְקָרִים וּמֶדַלְיוֹת." },
  { z: 80, sym: "Hg", he: "כַּסְפִּית", cat: "metal", g: 12, p: 6, mass: 201, sh: [2, 8, 18, 32, 18, 2],
    fact: "הַמַּתֶּכֶת הַיְּחִידָה שֶׁהִיא נוֹזֶלֶת בַּחֶדֶר.", use: "פַּעַם הָיְתָה בְּמַדְחֹמִים." },
  { z: 92, sym: "U", he: "אוּרָנְיוּם", cat: "metal", g: 3, p: 7, mass: 238, sh: [2, 8, 18, 32, 21, 9, 2],
    fact: "כָּבֵד מְאוֹד, וּמְשַׁחְרֵר הַרְבֵּה אֶנֶרְגְיָה.", use: "דֶּלֶק לְתַחֲנוֹת כֹּחַ גַּרְעִינִיּוֹת." },
];
const EL_BY_Z = {};
ELEMENTS.forEach((e) => { EL_BY_Z[e.z] = e; });
const elNeutrons = (e) => Math.round(e.mass) - e.z;
/* צֵל שֶׁל הַטַּבְלָה — אֵילוּ תָּאִים תְּפוּסִים בְּכָל מַחְזוֹר (לְמַרְאֶה אֲמִתִּי) */
const TABLE_SHAPE = {
  1: [1, 18], 2: [1, 2, 13, 14, 15, 16, 17, 18], 3: [1, 2, 13, 14, 15, 16, 17, 18],
  4: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
  5: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
  6: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
  7: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
};

function ExpSpeak({ text, color, size = 40 }) {
  return (
    <button onClick={() => speak(text)} title="הַקְשִׁיבִי" style={{
      fontFamily: "inherit", cursor: "pointer", border: "none", borderRadius: 999, width: size, height: size,
      background: `${color}18`, display: "inline-flex", alignItems: "center", justifyContent: "center",
      touchAction: "manipulation", WebkitTapHighlightColor: "transparent", flex: "0 0 auto",
    }}><Icon name="speaker" size={size * 0.5} color={color} /></button>
  );
}
/* כרטיס-מעבר להעמקה */
function DrillCard({ title, sub, color, icon, onClick, isTablet }) {
  return (
    <button onClick={onClick} style={{
      fontFamily: "inherit", cursor: "pointer", border: `2px solid ${color}33`, borderRadius: 18,
      padding: isTablet ? "16px 18px" : "13px 15px", background: "#fff", textAlign: "right", width: "100%",
      boxShadow: "0 4px 12px rgba(2,6,23,0.06)", touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
      display: "flex", alignItems: "center", gap: 12,
    }}>
      <span style={{ width: 44, height: 44, borderRadius: 12, background: `${color}18`, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}>
        {icon}
      </span>
      <span style={{ flex: 1 }}>
        <span style={{ display: "block", fontSize: isTablet ? 20 : 17, fontWeight: 800, color: "#1f2937" }}>{title}</span>
        {sub && <span style={{ display: "block", fontSize: isTablet ? 14 : 12, color: "#9ca3af", marginTop: 2 }}>{sub}</span>}
      </span>
      <span style={{ fontSize: 22, color, fontWeight: 900 }}>‹</span>
    </button>
  );
}

function Explorer({ course, sp, isTablet, onBack }) {
  const [stack, setStack] = useState([{ view: "table" }]);
  const view = stack[stack.length - 1];
  const push = (v) => setStack((s) => s.concat([v]));
  const pop = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  const toSource = () => setStack([{ view: "table" }]);
  const jumpTo = (i) => setStack((s) => s.slice(0, i + 1));
  const accent = course.color;

  const crumbLabel = (v) => {
    if (v.view === "table") return "טַבְלָה";
    if (v.view === "element") return EL_BY_Z[v.z].he;
    if (v.view === "nucleus") return "גַּרְעִין";
    if (v.view === "nucleon") return v.kind === "proton" ? "פְּרוֹטוֹן" : "נֵייטְרוֹן";
    if (v.view === "electrons") return "אֶלֶקְטְרוֹנִים";
    if (v.view === "quark") return v.flavor === "up" ? "קְווַרְק מַעְלָה" : "קְווַרְק מַטָּה";
    if (v.view === "lepton") return "אֶלֶקְטְרוֹן";
    if (v.view === "force") return "הַכּוֹחַ הֶחָזָק";
    if (v.view === "field") return "שָׂדֶה";
    return "";
  };

  const Header = ({ title, speech }) => (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <button onClick={stack.length > 1 ? pop : onBack} style={{ fontFamily: "inherit", cursor: "pointer", border: "none", background: "transparent", color: "#6b7280", fontSize: isTablet ? 18 : 16, fontWeight: 700, padding: 5 }}>→ חֲזָרָה</button>
        {stack.length > 1 && (
          <button onClick={toSource} style={{ fontFamily: "inherit", cursor: "pointer", border: `1px solid ${accent}44`, background: "#fff", color: accent, borderRadius: 14, padding: isTablet ? "7px 14px" : "5px 11px", fontSize: isTablet ? 15 : 13, fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 6 }}>⟲ חֲזָרָה לַמָּקוֹר</button>
        )}
      </div>
      {/* פֵּרוּרֵי לֶחֶם — הַנָּתִיב, נִתָּן לִלְחֹץ לַחֲזָרָה */}
      <div dir="rtl" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 4, justifyContent: "center", marginBottom: 12, fontSize: isTablet ? 14 : 12 }}>
        {stack.map((v, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            {i > 0 && <span style={{ color: "#c7ccd6" }}>‹</span>}
            <button onClick={() => jumpTo(i)} style={{ fontFamily: "inherit", cursor: i < stack.length - 1 ? "pointer" : "default", border: "none", background: "transparent", padding: "2px 4px", fontWeight: i === stack.length - 1 ? 800 : 600, color: i === stack.length - 1 ? accent : "#9ca3af" }}>{crumbLabel(v)}</button>
          </span>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 14 }}>
        <h2 style={{ fontFamily: "'Rubik', sans-serif", fontSize: isTablet ? 32 : 25, margin: 0, color: "#1f2937", textAlign: "center" }}>{title}</h2>
        {speech && <ExpSpeak text={speech} color={accent} size={isTablet ? 42 : 36} />}
      </div>
    </div>
  );

  const Facts = ({ lines }) => (
    <div style={{ maxWidth: 620, margin: "0 auto" }}>
      {lines.map((ln, i) => (
        <div key={i} style={{ background: "#fff", borderRadius: 16, border: "1px solid #eef2f7", padding: isTablet ? "13px 16px" : "11px 14px", marginBottom: 10, fontSize: isTablet ? 18 : 15, lineHeight: 1.55, color: "#1f2937", display: "flex", gap: 10 }}>
          <span style={{ color: accent, fontWeight: 900 }}>•</span><span>{ln}</span>
        </div>
      ))}
    </div>
  );

  let body = null;

  /* ---------- הטבלה המחזורית ---------- */
  if (view.view === "table") {
    const cols = isTablet ? 18 : 18;
    const cats = ["nonmetal", "noble", "alkali", "alkaline", "metal", "metalloid", "halogen"];
    body = (
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <button onClick={onBack} style={{ fontFamily: "inherit", cursor: "pointer", border: "none", background: "transparent", color: "#6b7280", fontSize: isTablet ? 18 : 16, fontWeight: 700, padding: 5 }}>→ חֲזָרָה</button>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 6 }}>
          <h2 style={{ fontFamily: "'Rubik', sans-serif", fontSize: isTablet ? 32 : 24, margin: 0, color: "#1f2937", textAlign: "center" }}>הַטַּבְלָה הַמַּחְזוֹרִית</h2>
          <ExpSpeak text="זֹאת הַטַּבְלָה הַמַּחְזוֹרִית שֶׁל הַיְסוֹדוֹת. כָּל רִבּוּעַ הוּא חֹמֶר אַחֵר בָּעוֹלָם. לַחֲצִי עַל יְסוֹד כְּדֵי לְהִכָּנֵס וְלַחְקֹר מִמָּה הוּא בָּנוּי." color={accent} size={isTablet ? 42 : 36} />
        </div>
        <p style={{ textAlign: "center", color: "#6b7280", fontSize: isTablet ? 16 : 13, margin: "0 0 14px" }}>לַחֲצִי עַל יְסוֹד כְּדֵי לְהִכָּנֵס פְּנִימָה וְלִגְלוֹת מִמָּה הוּא עָשׂוּי</p>
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 6 }}>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, minmax(${isTablet ? 34 : 20}px, 1fr))`, gap: isTablet ? 4 : 2, minWidth: isTablet ? "auto" : 380, margin: "0 auto", maxWidth: 760 }}>
            {[1, 2, 3, 4, 5, 6, 7].map((per) =>
              (TABLE_SHAPE[per] || []).map((grp) => {
                const el = ELEMENTS.find((e) => e.p === per && e.g === grp);
                const key = per + "-" + grp;
                if (el) {
                  const c = EL_CAT[el.cat].color;
                  return (
                    <button key={key} onClick={() => push({ view: "element", z: el.z })}
                      style={{ gridColumn: grp, gridRow: per, aspectRatio: "1 / 1", fontFamily: "inherit", cursor: "pointer",
                        border: `1.5px solid ${c}`, background: `${c}1f`, borderRadius: isTablet ? 8 : 5, padding: 0,
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1,
                        touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}>
                      <span style={{ fontSize: isTablet ? 10 : 7, color: "#6b7280", fontWeight: 700 }}>{el.z}</span>
                      <span style={{ fontSize: isTablet ? 18 : 12, fontWeight: 900, color: c }}>{el.sym}</span>
                    </button>
                  );
                }
                return <div key={key} style={{ gridColumn: grp, gridRow: per, aspectRatio: "1 / 1", background: "#eef1f6", borderRadius: isTablet ? 8 : 5, opacity: 0.6 }} />;
              })
            )}
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: isTablet ? 12 : 8, justifyContent: "center", marginTop: 16 }}>
          {cats.map((k) => (
            <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: isTablet ? 13 : 11, color: "#6b7280" }}>
              <span style={{ width: 12, height: 12, borderRadius: 4, background: EL_CAT[k].color }} />{EL_CAT[k].name}
            </span>
          ))}
        </div>
      </div>
    );
  }

  /* ---------- יסוד ---------- */
  else if (view.view === "element") {
    const el = EL_BY_Z[view.z];
    const c = EL_CAT[el.cat].color;
    const nP = el.z, nN = elNeutrons(el), nE = el.z;
    const speech = `${el.he}. ${el.fact} בְּתוֹךְ הָאָטוֹם יֵשׁ ${nP} פְּרוֹטוֹנִים, ${nN} נֵייטְרוֹנִים, וּ-${nE} אֶלֶקְטְרוֹנִים סְבִיבוֹ.`;
    body = (
      <div>
        <Header title={`${el.he} · ${el.sym}`} speech={speech} />
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}><Figure fig={{ type: "bohr", shells: el.sh }} color={c} /></div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 14 }}>
          <span style={{ background: "#fff5f5", color: "#f5222d", borderRadius: 12, padding: "6px 12px", fontSize: isTablet ? 16 : 14, fontWeight: 800 }}>● {nP} פְּרוֹטוֹנִים</span>
          <span style={{ background: "#f5f5f5", color: "#595959", borderRadius: 12, padding: "6px 12px", fontSize: isTablet ? 16 : 14, fontWeight: 800 }}>● {nN} נֵייטְרוֹנִים</span>
          <span style={{ background: "#e6f4ff", color: "#1677ff", borderRadius: 12, padding: "6px 12px", fontSize: isTablet ? 16 : 14, fontWeight: 800 }}>● {nE} אֶלֶקְטְרוֹנִים</span>
          <span style={{ background: `${c}1f`, color: c, borderRadius: 12, padding: "6px 12px", fontSize: isTablet ? 16 : 14, fontWeight: 800 }}>{EL_CAT[el.cat].name}</span>
        </div>
        <Facts lines={[el.fact, el.use]} />
        <div style={{ maxWidth: 620, margin: "18px auto 0", display: "grid", gap: 10 }}>
          <div style={{ fontSize: isTablet ? 15 : 13, fontWeight: 800, color: "#6b7280", textAlign: "center" }}>לְאָן נִכְנָסוֹת? 🔍</div>
          <DrillCard title="אֶל הַגַּרְעִין" sub="הַלֵּב הַכָּבֵד שֶׁל הָאָטוֹם" color="#f5222d" icon={<Icon name="atom" size={26} color="#f5222d" />} onClick={() => push({ view: "nucleus", z: el.z })} isTablet={isTablet} />
          <DrillCard title="אֶל הָאֶלֶקְטְרוֹנִים" sub="הַחֲלָקִיקִים שֶׁנָּעִים סָבִיב" color="#1677ff" icon={<Icon name="atom" size={26} color="#1677ff" />} onClick={() => push({ view: "electrons", z: el.z })} isTablet={isTablet} />
        </div>
      </div>
    );
  }

  /* ---------- גרעין ---------- */
  else if (view.view === "nucleus") {
    const el = EL_BY_Z[view.z];
    const nP = el.z, nN = elNeutrons(el);
    const cluster = [];
    const total = Math.min(nP + nN, 24);
    for (let i = 0; i < total; i++) cluster.push(i < Math.round((nP / (nP + nN)) * total) ? "#f5222d" : "#9aa0a6");
    const speech = `זֶה הַגַּרְעִין שֶׁל ${el.he}. בְּתוֹכוֹ יֵשׁ ${nP} פְּרוֹטוֹנִים אֲדֻמִּים וּ-${nN} נֵייטְרוֹנִים אֲפֹרִים, צְפוּפִים יַחַד. הַגַּרְעִין קָטָן מְאוֹד אֲבָל כָּבֵד מְאוֹד. לַחֲצִי כְּדֵי לְהִכָּנֵס לְתוֹךְ פְּרוֹטוֹן אוֹ נֵייטְרוֹן.`;
    body = (
      <div>
        <Header title="הַגַּרְעִין" speech={speech} />
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
          <svg width="200" height="180" viewBox="0 0 200 180" style={{ maxWidth: "100%" }}>
            {cluster.map((col, i) => {
              const ang = i * 2.399, rr = 8 + i * 3.4;
              return <circle key={i} cx={100 + rr * Math.cos(ang)} cy={90 + rr * Math.sin(ang)} r="10" fill={col} stroke="#fff" strokeWidth="1.5" />;
            })}
          </svg>
        </div>
        <Facts lines={[`בַּגַּרְעִין יֵשׁ ${nP} פְּרוֹטוֹנִים (אֲדֻמִּים, מִטְעָן +) וְ-${nN} נֵייטְרוֹנִים (אֲפֹרִים, בְּלִי מִטְעָן).`, "הַגַּרְעִין קָטָן מְאוֹד, אֲבָל כִּמְעַט כָּל הַמִּשְׁקָל שֶׁל הָאָטוֹם נִמְצָא בּוֹ.", "מִסְפַּר הַפְּרוֹטוֹנִים הוּא שֶׁקּוֹבֵעַ אֵיזֶה יְסוֹד זֶה!"]} />
        <div style={{ maxWidth: 620, margin: "18px auto 0", display: "grid", gap: 10 }}>
          <div style={{ fontSize: isTablet ? 15 : 13, fontWeight: 800, color: "#6b7280", textAlign: "center" }}>לְתוֹךְ מָה נִכְנָסוֹת? 🔍</div>
          <DrillCard title="פְּרוֹטוֹן" sub="מִטְעָן חִיּוּבִי + · מִמָּה הוּא עָשׂוּי?" color="#f5222d" icon={<span style={{ fontSize: 22, fontWeight: 900, color: "#f5222d" }}>+</span>} onClick={() => push({ view: "nucleon", z: el.z, kind: "proton" })} isTablet={isTablet} />
          <DrillCard title="נֵייטְרוֹן" sub="בְּלִי מִטְעָן · מִמָּה הוּא עָשׂוּי?" color="#8c8c8c" icon={<span style={{ fontSize: 22, fontWeight: 900, color: "#8c8c8c" }}>0</span>} onClick={() => push({ view: "nucleon", z: el.z, kind: "neutron" })} isTablet={isTablet} />
        </div>
      </div>
    );
  }

  /* ---------- פרוטון/נייטרון → קוורקים ---------- */
  else if (view.view === "nucleon") {
    const isP = view.kind === "proton";
    const title = isP ? "פְּרוֹטוֹן" : "נֵייטְרוֹן";
    const combo = isP ? "מַעְלָה + מַעְלָה + מַטָּה (↑↑↓)" : "מַעְלָה + מַטָּה + מַטָּה (↑↓↓)";
    const speech = `${title} בָּנוּי מִשְּׁלוֹשָׁה קְווַרְקִים: ${combo}. הַכּוֹחַ הֶחָזָק מַחֲזִיק אוֹתָם יַחַד. לַחֲצִי עַל קְווַרְק כְּדֵי לְהִכָּנֵס עוֹד יוֹתֵר פְּנִימָה.`;
    body = (
      <div>
        <Header title={title} speech={speech} />
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}><Figure fig={{ type: "quarks", kind: view.kind }} color={accent} /></div>
        <Facts lines={[`${title} אֵינוֹ הֲכִי קָטָן — הוּא בָּנוּי מִ-3 קְווַרְקִים: ${combo}.`, "הַקְּווַרְקִים אַף פַּעַם לֹא לְבַד — תָּמִיד בִּקְבוּצוֹת."]} />
        <div style={{ maxWidth: 620, margin: "18px auto 0", display: "grid", gap: 10 }}>
          <div style={{ fontSize: isTablet ? 15 : 13, fontWeight: 800, color: "#6b7280", textAlign: "center" }}>עוֹד יוֹתֵר עָמֹק 🔍</div>
          <DrillCard title="קְווַרְק מַעְלָה ↑" sub="מִטְעָן ‎+2/3" color="#f5222d" icon={<span style={{ fontSize: 24, fontWeight: 900, color: "#f5222d" }}>↑</span>} onClick={() => push({ view: "quark", flavor: "up" })} isTablet={isTablet} />
          <DrillCard title="קְווַרְק מַטָּה ↓" sub="מִטְעָן ‎−1/3" color="#1677ff" icon={<span style={{ fontSize: 24, fontWeight: 900, color: "#1677ff" }}>↓</span>} onClick={() => push({ view: "quark", flavor: "down" })} isTablet={isTablet} />
          <DrillCard title="מָה מַחֲזִיק אוֹתָם יַחַד?" sub="הַכּוֹחַ הֶחָזָק" color="#722ed1" icon={<Icon name="bolt" size={24} color="#722ed1" />} onClick={() => push({ view: "force" })} isTablet={isTablet} />
        </div>
      </div>
    );
  }

  /* ---------- אלקטרונים ---------- */
  else if (view.view === "electrons") {
    const el = EL_BY_Z[view.z];
    const speech = `הָאֶלֶקְטְרוֹנִים נָעִים סְבִיב הַגַּרְעִין בְּמַהִירוּת עֲצוּמָה. הֵם קְטַנִּים וְקַלִּים מְאוֹד, וְטֶעוּנִים מִטְעָן שְׁלִילִי. לַ${el.he} יֵשׁ ${el.z} אֶלֶקְטְרוֹנִים.`;
    body = (
      <div>
        <Header title="הָאֶלֶקְטְרוֹנִים" speech={speech} />
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}><Figure fig={{ type: "bohr", shells: el.sh }} color="#1677ff" /></div>
        <Facts lines={[`לַ${el.he} יֵשׁ ${el.z} אֶלֶקְטְרוֹנִים שֶׁנָּעִים סְבִיב הַגַּרְעִין.`, "אֶלֶקְטְרוֹן טָעוּן שְׁלִילִי (−), לָכֵן הוּא נִמְשָׁךְ לַפְּרוֹטוֹנִים הַחִיּוּבִיִּים.", "אֶלֶקְטְרוֹן הוּא חֲלָקִיק יְסוֹדִי — הוּא לֹא בָּנוּי מִשּׁוּם דָּבָר קָטָן יוֹתֵר."]} />
        <div style={{ maxWidth: 620, margin: "18px auto 0", display: "grid", gap: 10 }}>
          <div style={{ fontSize: isTablet ? 15 : 13, fontWeight: 800, color: "#6b7280", textAlign: "center" }}>נִכְנָסוֹת לְאֶלֶקְטְרוֹן אֶחָד 🔍</div>
          <DrillCard title="אֶלֶקְטְרוֹן בּוֹדֵד" sub="חֲלָקִיק יְסוֹדִי מִמִּשְׁפַּחַת הַלֶּפְּטוֹנִים" color="#1677ff" icon={<span style={{ fontSize: 22, fontWeight: 900, color: "#1677ff" }}>−</span>} onClick={() => push({ view: "lepton" })} isTablet={isTablet} />
        </div>
      </div>
    );
  }

  /* ---------- קוורק ---------- */
  else if (view.view === "quark") {
    const up = view.flavor === "up";
    const c = up ? "#f5222d" : "#1677ff";
    const speech = up
      ? "קְווַרְק מַעְלָה הוּא אֶחָד הַחֲלָקִיקִים הֲכִי קְטַנִּים שֶׁאֲנַחְנוּ מַכִּירִים. הַמִּטְעָן שֶׁלּוֹ הוּא פְּלוּס שְׁנֵי שְׁלִישִׁים. הוּא לְעוֹלָם לֹא לְבַד. בֶּאֱמֶת בֶּאֱמֶת פְּנִימָה — הוּא בְּעֶצֶם אַדְוָה בְּתוֹךְ שָׂדֶה."
      : "קְווַרְק מַטָּה הוּא אֶחָד הַחֲלָקִיקִים הֲכִי קְטַנִּים שֶׁאֲנַחְנוּ מַכִּירִים. הַמִּטְעָן שֶׁלּוֹ הוּא מִינוּס שְׁלִישׁ. הוּא לְעוֹלָם לֹא לְבַד. בֶּאֱמֶת בֶּאֱמֶת פְּנִימָה — הוּא בְּעֶצֶם אַדְוָה בְּתוֹךְ שָׂדֶה.";
    body = (
      <div>
        <Header title={up ? "קְווַרְק מַעְלָה ↑" : "קְווַרְק מַטָּה ↓"} speech={speech} />
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
          <svg width="160" height="160" viewBox="0 0 160 160" style={{ maxWidth: "100%" }}>
            <circle cx="80" cy="80" r="52" fill={c} />
            <text x="80" y="98" textAnchor="middle" fontSize="60" fontWeight="800" fill="#fff">{up ? "↑" : "↓"}</text>
          </svg>
        </div>
        <Facts lines={[up ? "מִטְעָן: ‎+2/3 (פְּלוּס שְׁנֵי שְׁלִישִׁים)." : "מִטְעָן: ‎−1/3 (מִינוּס שְׁלִישׁ).", "קְווַרְק הוּא חֲלָקִיק יְסוֹדִי — הֲכִי קָטָן שֶׁאֲנַחְנוּ מַכִּירִים.", "הוּא לְעוֹלָם לֹא נִמְצָא לְבַד, תָּמִיד בִּקְבוּצָה."]} />
        <div style={{ maxWidth: 620, margin: "18px auto 0", display: "grid", gap: 10 }}>
          <div style={{ fontSize: isTablet ? 15 : 13, fontWeight: 800, color: "#6b7280", textAlign: "center" }}>וּמָה יֵשׁ עוֹד יוֹתֵר עָמֹק? 🔍</div>
          <DrillCard title="אֶל הַשָּׂדֶה" sub="הַמָּקוֹר שֶׁל הַכֹּל" color="#722ed1" icon={<Icon name="atom" size={24} color="#722ed1" />} onClick={() => push({ view: "field" })} isTablet={isTablet} />
        </div>
      </div>
    );
  }

  /* ---------- אלקטרון (לפטון) ---------- */
  else if (view.view === "lepton") {
    const speech = "הָאֶלֶקְטְרוֹן הוּא חֲלָקִיק יְסוֹדִי מִמִּשְׁפַּחַת הַלֶּפְּטוֹנִים — הוּא לֹא בָּנוּי מִקְּווַרְקִים וְלֹא מִשּׁוּם דָּבָר קָטָן יוֹתֵר. אֲבָל בֶּאֱמֶת בֶּאֱמֶת פְּנִימָה, גַּם הוּא בְּעֶצֶם אַדְוָה בְּתוֹךְ שָׂדֶה.";
    body = (
      <div>
        <Header title="אֶלֶקְטְרוֹן" speech={speech} />
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
          <svg width="160" height="160" viewBox="0 0 160 160" style={{ maxWidth: "100%" }}>
            <circle cx="80" cy="80" r="46" fill="#1677ff" />
            <text x="80" y="96" textAnchor="middle" fontSize="46" fontWeight="800" fill="#fff">−</text>
          </svg>
        </div>
        <Facts lines={["אֶלֶקְטְרוֹן שַׁיָּךְ לְמִשְׁפַּחַת הַלֶּפְּטוֹנִים.", "הוּא חֲלָקִיק יְסוֹדִי — לֹא בָּנוּי מִשּׁוּם דָּבָר קָטָן יוֹתֵר.", "הַמִּטְעָן שֶׁלּוֹ שְׁלִילִי (−)."]} />
        <div style={{ maxWidth: 620, margin: "18px auto 0", display: "grid", gap: 10 }}>
          <div style={{ fontSize: isTablet ? 15 : 13, fontWeight: 800, color: "#6b7280", textAlign: "center" }}>וּמָה יֵשׁ עוֹד יוֹתֵר עָמֹק? 🔍</div>
          <DrillCard title="אֶל הַשָּׂדֶה" sub="הַמָּקוֹר שֶׁל הַכֹּל" color="#722ed1" icon={<Icon name="atom" size={24} color="#722ed1" />} onClick={() => push({ view: "field" })} isTablet={isTablet} />
        </div>
      </div>
    );
  }

  /* ---------- הכוח החזק ---------- */
  else if (view.view === "force") {
    const speech = "הַכּוֹחַ הֶחָזָק הוּא הֲכִי חָזָק בַּטֶּבַע. הוּא מַחֲזִיק אֶת הַקְּווַרְקִים יַחַד בְּתוֹךְ הַפְּרוֹטוֹן וְהַנֵּייטְרוֹן, בְּעֶזְרַת חֲלָקִיקִים בְּשֵׁם גְּלוּאוֹנִים. גַּם כּוֹחַ הוּא סוּג שֶׁל שָׂדֶה.";
    body = (
      <div>
        <Header title="הַכּוֹחַ הֶחָזָק" speech={speech} />
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}><Figure fig={{ type: "quarks", kind: "proton" }} color="#722ed1" /></div>
        <Facts lines={["הַכּוֹחַ הֶחָזָק מַחֲזִיק אֶת הַקְּווַרְקִים יַחַד — חָזָק כָּל כָּךְ שֶׁקָּשֶׁה מְאוֹד לְהַפְרִיד אוֹתָם.", "הוּא פּוֹעֵל בְּעֶזְרַת חֲלָקִיקִים בְּשֵׁם גְּלוּאוֹנִים (מִלְּשׁוֹן 'דֶּבֶק' בְּאַנְגְּלִית).", "גַּם כּוֹחַ הוּא בְּעֶצֶם שָׂדֶה שֶׁמְּמַלֵּא אֶת הַמֶּרְחָב."]} />
        <div style={{ maxWidth: 620, margin: "18px auto 0", display: "grid", gap: 10 }}>
          <DrillCard title="אֶל הַשָּׂדֶה" sub="הַמָּקוֹר שֶׁל הַכֹּל" color="#722ed1" icon={<Icon name="atom" size={24} color="#722ed1" />} onClick={() => push({ view: "field" })} isTablet={isTablet} />
        </div>
      </div>
    );
  }

  /* ---------- שדה — המקור ---------- */
  else if (view.view === "field") {
    const speech = "הִגַּעְנוּ לַמָּקוֹר! לְפִי הַפִיזִיקָה, הַכֹּל בָּעוֹלָם עָשׂוּי מִשָּׂדוֹת — מַשֶּׁהוּ בִּלְתִּי-נִרְאֶה שֶׁמְּמַלֵּא אֶת כָּל הַמֶּרְחָב. כָּל חֲלָקִיק, כְּמוֹ אֶלֶקְטְרוֹן אוֹ קְווַרְק, הוּא בְּעֶצֶם אַדְוָה קְטַנָּה — גַּל — בְּתוֹךְ הַשָּׂדֶה שֶׁלּוֹ. גַּם הָאוֹר הוּא אַדְוָה בַּשָּׂדֶה הָאֶלֶקְטְרוֹמַגְנֵטִי. זֶהוּ הַמָּקוֹר שֶׁל כָּל הַחֹמֶר.";
    body = (
      <div>
        <Header title="שָׂדֶה — הַמָּקוֹר" speech={speech} />
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
          <svg width="240" height="150" viewBox="0 0 240 150" style={{ maxWidth: "100%" }}>
            {[0, 1, 2, 3].map((r) => (
              <path key={r} d={`M10 ${40 + r * 26} Q 45 ${10 + r * 26} 80 ${40 + r * 26} T 150 ${40 + r * 26} T 230 ${40 + r * 26}`} fill="none" stroke="#722ed1" strokeWidth="2.5" opacity={0.3 + r * 0.12} />
            ))}
            <circle cx="150" cy="66" r="9" fill="#722ed1" />
          </svg>
        </div>
        <Facts lines={["לְפִי הַפִיזִיקָה הַמּוֹדֶרְנִית — הַכֹּל עָשׂוּי מִשָּׂדוֹת.", "שָׂדֶה הוּא מַשֶּׁהוּ בִּלְתִּי-נִרְאֶה שֶׁמְּמַלֵּא אֶת כָּל הַמֶּרְחָב.", "כָּל חֲלָקִיק (אֶלֶקְטְרוֹן, קְווַרְק, אוֹר) הוּא אַדְוָה — גַּל קָטָן — בְּתוֹךְ שָׂדֶה.", "זֶהוּ הַמָּקוֹר: מִשָּׂדוֹת נִבְנֶה כָּל הַחֹמֶר בַּיְּקוּם. ✨"]} />
        <div style={{ textAlign: "center", marginTop: 22 }}>
          <button onClick={toSource} style={{ fontFamily: "inherit", cursor: "pointer", border: "none", borderRadius: 16, padding: isTablet ? "14px 26px" : "12px 20px", fontSize: isTablet ? 19 : 16, fontWeight: 800, background: accent, color: "#fff", boxShadow: "0 6px 16px rgba(2,6,23,0.15)", display: "inline-flex", alignItems: "center", gap: 8 }}>⟲ חֲזָרָה לַמָּקוֹר (לַטַּבְלָה)</button>
        </div>
      </div>
    );
  }

  return <Shell {...sp}>{body}</Shell>;
}
```

---

## שלב 3 — חיווט לאפליקציה (4 שינויים קטנים)

**3א. הוסף רשומת קורס** למערך `COURSES` (שים לב ל-`mode: "explore"`, ואין `topics`):

```jsx
{ id: "matter", title: "מסע אל תוך החומר", emoji: "⚛️", subtitle: "הטבלה המחזורית · אטום · קוורקים · שדות", color: "#1677ff", mode: "explore" },
```

**3ב. אייקון לקורס** — במילון `COURSE_ICONS` הוסף:

```js
matter: "atom",
```

**3ג. אל תסמן אותו כאדפטיבי** — הוא לא Q&A. ודא ש-`ADAPTIVE_COURSES` לא כולל `"matter"` (למשל `["grade2", "gifted"]`).

**3ד. רינדור ה-Explorer בתוך `App`** — אחרי שמחושב `courseObj` ולפני ניתוב המסכים (`screen === ...`), הוסף יציאה מוקדמת:

```jsx
const courseObj = COURSES.find((c) => c.id === course) || COURSES[0];
const backToCourses = () => { setScreen("home"); setProblem(null); setCourse(null); setTopic(null); };
if (courseObj.mode === "explore") return <Explorer course={courseObj} sp={sp} isTablet={isTablet} onBack={backToCourses} />;
const courseTopics = courseObj.topics;   // נשאר כמו שהיה — רק אחרי היציאה המוקדמת
```

כאן `sp` הוא אובייקט ה-props של `Shell` שכבר קיים ב-App:
`const sp = { stars, streak, solved, isTablet, landscape, player: current, onSwitch: switchPlayer };`
ו-`isTablet` מגיע מ-`useDevice()`.

---

## אופציה: לשלב בתוך קורס קיים במקום חוברת נפרדת

אם רוצים שזה יופיע **בתוך** קורס "מעבדת המספרים" (ולא כאריח קורס בפני עצמו), אפשר במקום רשומת קורס נפרדת להוסיף "נושא" מסומן ולנתב אותו ל-`<Explorer>` בלחיצה — למשל נושא `{ id: "matter", explore: true, ... }` שבמסך הנושאים פותח את ה-Explorer במקום את מסך הרמות/המסע. ה-Explorer עצמו לא משתנה. (החלטה לשיחה החדשה.)

---

## הערות תוכן/פדגוגיה

- כל הטקסטים מנוקדים ומתאימים לגיל 7. מספרי פרוטונים/נייטרונים/אלקטרונים נכונים (נייטרונים = עיגול מספר המסה פחות Z).
- הטבלה ב-RTL: טור 1 מימין (כמו בספרי מדע בעברית), גזים אצילים בטור השמאלי. הצללית האפורה נותנת צורה אותנטית בלי לצייר את כל 118 היסודות.
- שני מסלולי ההעמקה מתכנסים ל"שדה" — גם בניווט אחורה וגם רעיונית ("הכול עשוי משדות") = "חזרה למקור".
- אלקטרון וקוורק מוצגים כחלקיקים יסודיים; פרוטון/נייטרון בנויים מ-3 קוורקים (↑↑↓ / ↑↓↓).

---

## אימות מהיר בשיחה החדשה

1. **טרנספורם Babel**: `babel.transform(code, {presets:[["react",{runtime:"classic"}]]})` — חייב לעבור בלי שגיאה (runtime קלאסי, כי האפליקציה משתמשת ב-`React.createElement`, לא ב-import).
2. **טעינה בדפדפן**: בחר שחקן ← קורס "מסע אל תוך החומר" ← לחץ יסוד (חמצן/זהב) ← העמק גרעין←פרוטון←קוורק←שדה ← "חזרה למקור". ודא שאין שגיאות ב-console (טעינת גופן Rubik מ-CDN עשויה להיכשל בסביבת בדיקה — זה לא קשור לפיצ'ר).
