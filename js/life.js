window.ACTIVITY = {
  sedentary: { ar: "خامل", muscle: 0.82, vat: 2.2, sens: -0.06, sbp: 6 },
  walk: { ar: "مشي يومي 30–45د", muscle: 1.18, vat: 0, sens: 0.03, sbp: -2 },
  resistance: { ar: "قوة / أثقال", muscle: 1.28, vat: -0.8, sens: 0.05, sbp: -2 },
  cardio: { ar: "هوائي معتدل", muscle: 1.32, vat: -1.0, sens: 0.04, sbp: -4 },
  hiit: { ar: "HIIT متقطع", muscle: 1.4, vat: -1.2, sens: 0.06, sbp: -3 },
  mixed: { ar: "مختلط قوة+مشي", muscle: 1.3, vat: -1.0, sens: 0.05, sbp: -3 }
};
window.FASTING = {
  none: { ar: "بلا صيام", hours: 0, meals: 3, kind: "none" },
  "12_12": { ar: "12:12", hours: 12, meals: 3, kind: "tre" },
  "14_10": { ar: "14:10", hours: 14, meals: 2, kind: "tre" },
  "16_8": { ar: "16:8", hours: 16, meals: 2, kind: "tre" },
  "18_6": { ar: "18:6", hours: 18, meals: 2, kind: "tre" },
  "20_4": { ar: "20:4", hours: 20, meals: 1, kind: "tre" },
  omad: { ar: "وجبة واحدة (OMAD)", hours: 23, meals: 1, kind: "tre" },
  ramadan: { ar: "أسلوب رمضاني تقريبي", hours: 14, meals: 2, kind: "tre" },
  "5_2": { ar: "5:2 (يومان خفيفان/أسبوع)", hours: 20, meals: 1, kind: "weekly" },
  adf: { ar: "يوم بعد يوم (ADF)", hours: 24, meals: 0, kind: "alt" }
};
window.FAST_FREQ = {
  daily: { ar: "يوميًا", days: 7 },
  "5d": { ar: "5 أيام/أسبوع", days: 5 },
  "3d": { ar: "3 أيام/أسبوع", days: 3 },
  alt: { ar: "يوم نعم ويوم لا", days: 3.5 }
};
(function () {
  if (!window.ENGINE) return;
  const origStep = ENGINE.stepHour;
  const origBoot = ENGINE.bootState;
  ENGINE.bootState = function (pr) {
    const s = origBoot(pr);
    s.life = {
      activity: "walk", age: pr.p.age || 40, sex: pr.p.sex || "M",
      weight: Math.round((pr.p.bmi || 25) * 1.72 * 1.72), diet: "balanced",
      waterL: 2.2, sleepH: 7, sbpNow: pr.p.sbp || 120, dbpNow: 80,
      fastStyle: "none", fastFreq: "daily", fastHours: 0
    };
    return s;
  };
  ENGINE.setLife = function (s, life) {
    s.life = Object.assign(s.life || {}, life || {});
    if (s.life.age) s.p.age = +s.life.age;
    if (s.life.sex) s.p.sex = s.life.sex;
    if (s.life.weight) {
      s.weight = +s.life.weight;
      s.p.bmi = +(s.life.weight / (1.72 * 1.72)).toFixed(1);
    }
  };
  ENGINE.applyBaseline = function (s) {
    const L = s.life || {};
    const act = window.ACTIVITY[L.activity || "walk"] || window.ACTIVITY.walk;
    const fst = window.FASTING[L.fastStyle || "none"] || window.FASTING.none;
    const age = +L.age || s.p.age || 40;
    const bmi = s.p.bmi || 25;
    const waterL = Math.max(0.5, Math.min(6, +L.waterL || 2.2));
    const sleepH = Math.max(3, Math.min(12, +L.sleepH || 7));
    const sbpNow = Math.max(85, Math.min(220, +L.sbpNow || s.p.sbp || 120));
    const dbpNow = Math.max(50, Math.min(130, +L.dbpNow || 80));
    let fastH = +L.fastHours;
    if (!fastH && fastH !== 0) fastH = fst.hours;
    if (L.fastStyle && L.fastStyle !== "none" && !(+L.fastHours > 0)) fastH = fst.hours;
    L.waterL = waterL; L.sleepH = sleepH; L.sbpNow = sbpNow; L.dbpNow = dbpNow; L.fastHours = fastH;
    s.sbp = sbpNow; s.dbp = dbpNow;
    s.water = Math.max(0.55, Math.min(1.6, 0.55 + waterL * 0.28));
    s.cortisol = sleepH >= 7.5 ? 10 : sleepH >= 6 ? 12.5 : 16;
    if (sleepH < 6) { s.p.sens = Math.max(0.2, s.p.sens - 0.06); s.crp += 0.25; s.glucose += 6; }
    else if (sleepH >= 7.5) { s.p.sens = Math.min(1.2, s.p.sens + 0.03); s.crp = Math.max(0.4, s.crp - 0.1); }
    if (waterL < 1.5) { s.Na += 2; s.sbp += 3; }
    if (age > 60) s.egfr = Math.min(s.egfr, 92 - (age - 60) * 0.55);
    s.sbp = Math.max(88, Math.min(210, s.sbp + (act.sbp || 0)));
    s.p.sens = Math.min(1.2, Math.max(0.2, s.p.sens + (act.sens || 0)));
    if (typeof s.vat === "number") s.vat = Math.max(4, s.vat + (act.vat || 0) + (bmi > 30 ? (bmi - 30) * 0.35 : 0));
    if (bmi > 30) { s.crp += 0.35; s.p.sens = Math.max(0.22, s.p.sens - 0.04); s.tg = (s.tg || 100) + 12; }
    if (L.sex === "F") { s.fat += 3; if (typeof s.vat === "number") s.vat += 0.6; }
    if (fastH >= 14) { s.insulin = Math.max(2, s.insulin * 0.92); s.p.sens = Math.min(1.2, s.p.sens + 0.02); }
    if (s.p.t1 && fastH >= 14 && !(s.meds && s.meds.insulinU)) {
      s.events.unshift({ t: 0, lvl: "red", ar: "نوع 1 + صيام بلا إنسولين: النموذج يفتح مسار حماض. ليس بروتوكولًا علاجيًا." });
    }
    s.flux.muscle = Math.min(1, 0.28 * act.muscle);
    s.flux.heart = Math.min(1, 0.2 + (s.sbp - 110) / 120);
    const diet = (window.PROTOCOLS || []).find(function (p) { return p.id === L.diet; });
    L.dietMeal = diet ? diet.meal : null;
    const fr = window.FAST_FREQ[L.fastFreq || "daily"] || window.FAST_FREQ.daily;
    s.events.unshift({
      t: 0, lvl: "info",
      ar: "قبل التشغيل: " + age + "س · " + act.ar +
        " · صيام " + fst.ar + (fastH ? " ≈" + fastH + "س" : "") +
        " · " + fr.ar + (diet ? " · " + diet.ar : "")
    });
    return s;
  };
  ENGINE.stepHour = function (s) {
    origStep(s);
    const L = s.life || {};
    const act = window.ACTIVITY[L.activity || "walk"] || window.ACTIVITY.walk;
    const waterL = +L.waterL || 2.2;
    const sleepH = +L.sleepH || 7;
    s.flux.muscle = Math.min(1, (s.flux.muscle || 0.3) * Math.min(1.15, act.muscle));
    if (typeof s.vat === "number") s.vat = Math.max(4, s.vat + (act.vat || 0) * 0.002);
    if (act.muscle > 1.1) s.glucose = Math.max(70, s.glucose - 0.28);
    if (s.t % 24 === 0 && s.t > 0) {
      s.water = Math.min(1.6, s.water + waterL * 0.12);
      if (sleepH < 6) { s.cortisol = Math.min(20, s.cortisol + 0.4); s.glucose += 1.5; }
      else if (sleepH >= 7.5) s.cortisol = Math.max(8, s.cortisol - 0.25);
    }
  };
  function sip(s) {
    s.water = Math.min(1.6, s.water + ((s.life && s.life.waterL) || 2.2) * 0.02);
  }
  function isFastDay(style, freq, dayIndex) {
    const fst = window.FASTING[style] || window.FASTING.none;
    if (fst.kind === "none") return false;
    if (fst.kind === "alt" || freq === "alt") return dayIndex % 2 === 1;
    if (fst.kind === "weekly" || style === "5_2") return dayIndex % 7 === 5 || dayIndex % 7 === 6;
    if (freq === "5d") return dayIndex % 7 < 5;
    if (freq === "3d") return dayIndex % 7 === 0 || dayIndex % 7 === 2 || dayIndex % 7 === 4;
    return true;
  }
  ENGINE.runLifestyle = function (s, meal, days, mealsPerDay) {
    const L = s.life || {};
    const fst = window.FASTING[L.fastStyle || "none"] || window.FASTING.none;
    const fastH = Math.max(0, Math.min(23, +L.fastHours || fst.hours || 0));
    const waterOnly = { c: 0, p: 0, f: 0, fiber: 0, gi: 0, water: 280, tags: ["fast"] };
    for (let d = 0; d < days; d++) {
      const fastDay = isFastDay(L.fastStyle || "none", L.fastFreq || "daily", d);
      if (!fastDay || fst.kind === "none" || fastH < 4) {
        const n = Math.max(1, mealsPerDay || 2);
        const gap = Math.max(1, Math.round(16 / n));
        for (let m = 0; m < n; m++) { ENGINE.eat(s, meal); ENGINE.runHours(s, gap); }
        ENGINE.runHours(s, Math.max(0, 24 - gap * n));
        continue;
      }
      if (fst.kind === "alt" && fastDay) {
        sip(s); ENGINE.eat(s, waterOnly); ENGINE.runHours(s, 24);
        continue;
      }
      if (fst.kind === "weekly" && fastDay) {
        const small = { c: 20, p: 18, f: 8, fiber: 6, gi: 35, water: 400, tags: ["fast"] };
        ENGINE.eat(s, small); ENGINE.runHours(s, 6); sip(s); ENGINE.runHours(s, 18);
        continue;
      }
      const eatH = Math.max(1, 24 - fastH);
      const n = Math.max(1, Math.min(mealsPerDay || fst.meals || 2, eatH));
      const gap = Math.max(1, Math.round(eatH / n));
      ENGINE.runHours(s, fastH);
      for (let m = 0; m < n; m++) { ENGINE.eat(s, meal); ENGINE.runHours(s, m === n - 1 ? Math.max(1, eatH - gap * (n - 1)) : gap); }
    }
    return s;
  };
})();
