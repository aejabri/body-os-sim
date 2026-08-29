window.ACTIVITY = {
  sedentary: { ar: "خامل", muscle: 0.82, vat: 2.2, sens: -0.06, sbp: 6 },
  walk: { ar: "مشي يومي 30–45د", muscle: 1.18, vat: 0, sens: 0.03, sbp: -2 },
  resistance: { ar: "قوة / أثقال", muscle: 1.28, vat: -0.8, sens: 0.05, sbp: -2 },
  cardio: { ar: "هوائي معتدل", muscle: 1.32, vat: -1.0, sens: 0.04, sbp: -4 },
  hiit: { ar: "HIIT متقطع", muscle: 1.4, vat: -1.2, sens: 0.06, sbp: -3 },
  mixed: { ar: "مختلط قوة+مشي", muscle: 1.3, vat: -1.0, sens: 0.05, sbp: -3 }
};
(function () {
  if (!window.ENGINE) return;
  const origStep = ENGINE.stepHour;
  const origBoot = ENGINE.bootState;
  ENGINE.bootState = function (pr) {
    const s = origBoot(pr);
    s.life = { activity: "walk", age: pr.p.age || 40, sex: pr.p.sex || "M", weight: Math.round((pr.p.bmi || 25) * 1.72 * 1.72), diet: "balanced" };
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
    const act = window.ACTIVITY[(s.life && s.life.activity) || "walk"] || window.ACTIVITY.walk;
    const age = +(s.life && s.life.age) || s.p.age || 40;
    const bmi = s.p.bmi || 25;
    if (age > 60) s.egfr = Math.min(s.egfr, 92 - (age - 60) * 0.55);
    if (age > 50) s.sbp += (age - 50) * 0.25;
    s.sbp = Math.max(88, Math.min(190, s.sbp + (act.sbp || 0)));
    s.p.sens = Math.min(1.2, Math.max(0.2, s.p.sens + (act.sens || 0)));
    if (typeof s.vat === "number") s.vat = Math.max(4, s.vat + (act.vat || 0) + (bmi > 30 ? (bmi - 30) * 0.35 : 0));
    if (bmi > 30) { s.crp += 0.35; s.p.sens = Math.max(0.22, s.p.sens - 0.04); s.tg = (s.tg || 100) + 12; }
    if (s.life && s.life.sex === "F") { s.fat += 3; if (typeof s.vat === "number") s.vat += 0.6; }
    s.flux.muscle = Math.min(1, 0.28 * act.muscle);
    s.flux.heart = Math.min(1, 0.2 + (s.sbp - 110) / 120);
    const diet = (window.PROTOCOLS || []).find(function (p) { return p.id === (s.life && s.life.diet); });
    s.life.dietMeal = diet ? diet.meal : null;
    s.events.unshift({
      t: 0, lvl: "info",
      ar: "قبل التشغيل: " + age + "س · " + (s.p.sex === "F" ? "أنثى" : "ذكر") +
        " · " + Math.round(s.weight || 0) + "كغ · BMI " + s.p.bmi +
        " · " + act.ar + (diet ? " · حمية " + diet.ar : "")
    });
    return s;
  };
  ENGINE.stepHour = function (s) {
    origStep(s);
    const act = window.ACTIVITY[(s.life && s.life.activity) || "walk"] || window.ACTIVITY.walk;
    s.flux.muscle = Math.min(1, (s.flux.muscle || 0.3) * Math.min(1.15, act.muscle));
    if (typeof s.vat === "number") s.vat = Math.max(4, s.vat + (act.vat || 0) * 0.002);
    if (act.muscle > 1.1) s.glucose = Math.max(70, s.glucose - 0.28);
  };
  ENGINE.runLifestyle = function (s, meal, days, mealsPerDay) {
    const n = mealsPerDay || 2;
    const wake = Math.max(1, Math.round(16 / n));
    for (let d = 0; d < days; d++) {
      for (let m = 0; m < n; m++) {
        ENGINE.eat(s, meal);
        ENGINE.runHours(s, wake);
      }
      ENGINE.runHours(s, Math.max(0, 24 - wake * n));
    }
    return s;
  };
})();
