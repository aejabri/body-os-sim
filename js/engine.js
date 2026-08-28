(function () {
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  function bootState(profile) {
    const p = profile.p;
    const glu = p.t1 ? 160 : p.a1c >= 6.5 ? 145 : p.a1c >= 5.7 ? 118 : 92;
    return {
      t: 0, glucose: glu, insulin: p.t1 ? (p.insulinU ? 12 : 0.4) : 8 * p.residual,
      glucagon: p.t1 && !p.insulinU ? 90 : 55, ketones: p.ketones, ffa: 0.4,
      glyL: p.t1 ? 40 : 70, glyM: 280, gutC: 0, gutP: 0, gutF: 0, gutFiber: 0,
      water: 1, Na: 140, K: 4.2, HCO3: 24, pH: 7.40, sbp: p.sbp, egfr: p.egfr, a1c: p.a1c,
      weight: Math.round(p.bmi * 1.75 * 1.75), fat: p.fat, cortisol: 12, crp: p.bmi > 30 ? 2.4 : 0.8,
      hist: 1, motil: 1, events: [], alerts: [],
      flux: { mouth: 0, gut: 0, liver: 0, pancreas: 0, muscle: 0, adipose: 0, kidney: 0, brain: 0, heart: 0 },
      meds: { insulinU: p.insulinU || 0, metformin: !!p.metformin, acei: !!p.acei },
      p: Object.assign({}, p)
    };
  }
  function log(s, lvl, ar, en) {
    s.events.unshift({ t: s.t, lvl, ar, en });
    if (s.events.length > 80) s.events.pop();
    if (lvl === "red" || lvl === "amber") { s.alerts.unshift({ t: s.t, lvl, ar }); if (s.alerts.length > 12) s.alerts.pop(); }
  }
  function eat(s, meal) {
    s.gutC += meal.c; s.gutP += meal.p; s.gutF += meal.f; s.gutFiber += meal.fiber || 0;
    s.water += (meal.water || 0) / 400; s.flux.mouth = 1; s._gi = meal.gi || 55;
    const tags = meal.tags || [];
    if (tags.includes("sugar")) log(s, "amber", "حمل جلايسيمي عالٍ دخل الفم — امتصاص سريع متوقع.", "High-GI load.");
    if (tags.includes("veg")) log(s, "info", "ألياف تبطئ الإفراغ وترفع الإنكرتين قليلاً.", "Fiber / GLP-1.");
    if (tags.includes("fast")) log(s, "info", "لا سعرات. الجسم ينتقل للكبد ثم الشحم.", "Fasting shift.");
    log(s, "info", "وجبة: كرب " + meal.c + " · بروتين " + meal.p + " · دهن " + meal.f + " · ألياف " + (meal.fiber || 0), "Meal");
  }
  function setMed(s, key, on, units) {
    if (key === "insulinU") {
      const prev = s.meds.insulinU;
      s.meds.insulinU = on ? (units || Math.max(prev, 20)) : 0;
      if (prev > 0 && s.meds.insulinU === 0) {
        if (s.p.t1) log(s, "red", "إيقاف إنسولين في نوع 1: مسار حماض كيتوني مفتوح.", "T1 DKA path open.");
        else log(s, "amber", "إيقاف إنسولين خارجي في نوع 2: السكر سيرتفع أولاً.", "T2 hyperglycemia first.");
      }
      if (s.meds.insulinU > 0 && prev === 0) log(s, "info", "إنسولين خارجي يدفع K للخلايا ويقف الكيتوجينيز.", "Exogenous insulin on.");
    }
    if (key === "metformin") { s.meds.metformin = on; log(s, "info", on ? "متفورمين يخفض HGO." : "إيقاف متفورمين.", "Metformin"); }
    if (key === "acei") { s.meds.acei = on; log(s, "info", on ? "مثبط ACE." : "إيقاف ACE.", "ACEi"); }
  }
  function stepHour(s) {
    const p = s.p;
    const gi = s._gi || 55;
    const fiberSlow = 1 + s.gutFiber * 0.04;
    const absorbC = Math.min(s.gutC, (8 + gi * 0.12) / fiberSlow);
    const absorbP = Math.min(s.gutP, 4);
    const absorbF = Math.min(s.gutF, 3.2);
    s.gutC = Math.max(0, s.gutC - absorbC);
    s.gutP = Math.max(0, s.gutP - absorbP);
    s.gutF = Math.max(0, s.gutF - absorbF);
    s.gutFiber = Math.max(0, s.gutFiber - 0.6);
    s.flux.gut = absorbC + absorbP + absorbF > 1 ? 1 : absorbC > 0 ? 0.5 : 0.1;
    s.flux.mouth = s.gutC + s.gutP + s.gutF > 5 ? 0.4 : 0;
    const fed = absorbC + absorbP + absorbF;
    s.cortisol = lerp(s.cortisol, fed < 1 ? 14 : 10, 0.06);
    const incretin = absorbC > 0 ? 1 + Math.min(1.2, absorbC / 40) * (s.gutFiber > 3 ? 1.15 : 1) : 1;
    const targetIns = p.t1 ? 0.3 : clamp((s.glucose - 80) * 0.12 * p.beta * p.sens * incretin, 0.4, 45);
    const exo = s.meds.insulinU > 0 ? s.meds.insulinU * 0.35 : 0;
    s.insulin = lerp(s.insulin, targetIns + exo, 0.35);
    s.flux.pancreas = p.t1 ? (exo > 0 ? 0.5 : 0.05) : clamp(targetIns / 20, 0.1, 1);
    const metFactor = s.meds.metformin ? 0.78 : 1;
    const insulinBrake = clamp(s.insulin / (12 / Math.max(p.sens, 0.2)), 0, 2);
    const hgo = 7.2 * p.hgo * metFactor * (1.15 + s.cortisol / 40) / (1 + insulinBrake);
    s.flux.liver = clamp(hgo / 12 + absorbC / 30, 0.1, 1);
    const brainUse = 5.0;
    const muscleUse = 2.2 + insulinBrake * 3.4 * p.sens + (s.glucose > 180 ? 0.6 : 0);
    const adiposeStore = insulinBrake * absorbC * 0.08;
    s.flux.brain = 0.85;
    s.flux.muscle = clamp(muscleUse / 10, 0.15, 1);
    s.flux.adipose = clamp(adiposeStore / 4 + (insulinBrake < 0.25 ? 0.5 : 0), 0.1, 1);
    s.glucose += absorbC * 3.8 + hgo - brainUse - muscleUse - adiposeStore * 2;
    if (s.glucose > 180) {
      const spill = (s.glucose - 180) * 0.04;
      s.glucose -= spill; s.water -= spill * 0.008;
      s.flux.kidney = clamp(0.3 + spill / 8, 0.3, 1);
    } else s.flux.kidney = 0.25 + (p.egfr < 60 ? 0.2 : 0);
    const lipolysis = clamp(0.15 + (0.9 - insulinBrake) * 0.55 + (fed < 0.5 ? 0.2 : 0), 0.05, 1.4);
    s.ffa = lerp(s.ffa, 0.25 + lipolysis * 0.7, 0.2);
    if (p.t1 && s.insulin < 4) { s.ketones += 0.35 + lipolysis * 0.45; s.HCO3 -= 0.55; s.pH -= 0.012; s.K += 0.08; }
    else if (s.insulin < 6 && p.residual < 0.25 && !s.meds.insulinU) { s.ketones += 0.08; s.HCO3 -= 0.08; }
    else { s.ketones = Math.max(0.1, s.ketones - 0.12 - insulinBrake * 0.08); s.HCO3 = lerp(s.HCO3, 24, 0.08); s.pH = lerp(s.pH, 7.40, 0.08); }
    if (exo > 0) s.K = Math.max(2.8, s.K - 0.04);
    s.water = clamp(s.water - 0.04 + (fed < 0.3 ? -0.01 : 0), 0.35, 1.6);
    s.Na = lerp(s.Na, s.water < 0.7 ? 146 : 140, 0.05);
    s.sbp += (s.Na - 140) * 0.15 + (s.water - 1) * 2 - (s.meds.acei ? 0.15 : 0);
    s.sbp = clamp(s.sbp, 88, 210);
    s.flux.heart = clamp((s.sbp - 100) / 80, 0.15, 1);
    if (s.glucose > 200) s.egfr -= 0.01;
    if (absorbP > 3 && s.egfr < 60 && s.water < 0.8) s.egfr -= 0.03;
    s.egfr = clamp(s.egfr, 12, 120);
    s.a1c = lerp(s.a1c, 2.59 + 0.024 * s.glucose, 0.002);
    if (s.insulin > 10 && absorbC > 5) s.fat += 0.004;
    if (fed < 0.4 && insulinBrake < 0.4) s.fat = Math.max(6, s.fat - 0.006);
    s.crp = lerp(s.crp, (s.fat / 20) + (s.gutFiber < 1 ? 0.4 : 0), 0.03);
    s.glucose = clamp(s.glucose, 38, 620);
    s.ketones = clamp(s.ketones, 0.05, 12);
    s.pH = clamp(s.pH, 6.9, 7.5);
    s.t += 1;
    if (s.p.t1 && s.meds.insulinU === 0 && s.ketones > 3 && s.pH < 7.3) log(s, "red", "عتبة حماض كيتوني تعليمية.", "DKA threshold");
    if (s.glucose < 55) log(s, "red", "هبوط سكر خطر.", "Hypoglycemia");
    if (s.glucose > 300) log(s, "amber", "فرط سكر + إدرار أسموزي.", "Hyperglycemia");
    if (s.K < 3.2) log(s, "amber", "بوتاسيوم منخفض.", "Low K");
    if (s.egfr < 45 && absorbP > 3) log(s, "amber", "حمل بروتين على كلية ضعيفة.", "Protein vs CKD");
  }
  function runHours(s, n) { for (let i = 0; i < n; i++) stepHour(s); return s; }
  function snapshot(s) {
    return { t: s.t, glucose: +s.glucose.toFixed(0), insulin: +s.insulin.toFixed(1), ketones: +s.ketones.toFixed(2), pH: +s.pH.toFixed(2), K: +s.K.toFixed(2), Na: +s.Na.toFixed(0), HCO3: +s.HCO3.toFixed(1), sbp: +s.sbp.toFixed(0), egfr: +s.egfr.toFixed(0), a1c: +s.a1c.toFixed(2), water: +s.water.toFixed(2), fat: +s.fat.toFixed(1), crp: +s.crp.toFixed(1), flux: Object.assign({}, s.flux) };
  }
  function explainNow(s) {
    return [
      { sys: "فم → أمعاء", en: "Mouth-gut", txt: s.gutC + s.gutP + s.gutF > 2 ? "طعام ما زال في اللمعة. الإفراغ أبطأ مع الدهن والألياف." : "القناة فارغة تقريبًا. المصدر التالي: الكبد." },
      { sys: "بنكرياس", en: "Pancreas", txt: s.p.t1 ? (s.meds.insulinU ? "لا خلايا بيتا فاعلة. الإنسولين الظاهر خارجي." : "لا إنسولين فاعل. الليباز الحساس للهرمون بلا كابح.") : "إفراز ذاتي يتناسب مع السكر والحساسية (β=" + s.p.beta + ")." },
      { sys: "كبد", en: "Liver", txt: s.meds.metformin ? "متفورمين يخفض إنتاج الجلوكوز الكبدي." : "الكبد يضخ جلوكوزًا حسب الكورتيزول ونقص الإنسولين." },
      { sys: "عضل / مخ", en: "Muscle/brain", txt: "المخ يستهلك ~120غ جلوكوز/يوم في النموذج المختزل. العضل يأخذ أكثر بوجود إنسولين." },
      { sys: "شحم", en: "Adipose", txt: s.insulin < 5 ? "تحلل شحمي → أحماض حرة → كيتون إن غاب الإنسولين." : "الإنسولين يكبح التحلل الشحمي ويميل للتخزين." },
      { sys: "كلى", en: "Kidney", txt: s.glucose > 180 ? "تجاوز عتبة إعادة الامتصاص → جلوكوز في البول وجفاف." : "eGFR≈" + s.egfr.toFixed(0) + ". لا إدرار سكري مهم." },
      { sys: "قلب / حجم", en: "Heart", txt: "ضغط≈" + s.sbp.toFixed(0) + ". الصوديوم والماء وACE يحرّكون الرقم." }
    ];
  }
  window.ENGINE = { bootState, eat, setMed, stepHour, runHours, snapshot, explainNow };
})();
