window.ACTIVITY = {
  sedentary: { ar: "خامل", muscle: 0.82, vat: 0, sens: 0, sbp: 0.04 },
  walk: { ar: "مشي يومي 30–45د", muscle: 1.18, vat: -0.004, sens: 0.0004, sbp: -0.03 },
  resistance: { ar: "قوة / أثقال", muscle: 1.28, vat: -0.006, sens: 0.0006, sbp: -0.02 },
  cardio: { ar: "هوائي معتدل", muscle: 1.32, vat: -0.007, sens: 0.0005, sbp: -0.05 },
  hiit: { ar: "HIIT متقطع", muscle: 1.4, vat: -0.008, sens: 0.0007, sbp: -0.04 },
  mixed: { ar: "مختلط قوة+مشي", muscle: 1.3, vat: -0.007, sens: 0.0006, sbp: -0.04 }
};
(function () {
  if (!window.ENGINE) return;
  const origStep = ENGINE.stepHour;
  const origBoot = ENGINE.bootState;
  ENGINE.bootState = function (pr) {
    const s = origBoot(pr);
    s.life = { activity: "walk", age: pr.p.age || 40, sex: pr.p.sex || "M", weight: Math.round((pr.p.bmi || 25) * 1.72 * 1.72) };
    return s;
  };
  ENGINE.setLife = function (s, life) {
    s.life = Object.assign(s.life || {}, life || {});
    if (s.life.age) {
      s.p.age = +s.life.age;
      if (s.p.age > 60) s.egfr = Math.min(s.egfr, 95 - (s.p.age - 60) * 0.6);
    }
    if (s.life.weight) {
      const h = 1.72;
      s.p.bmi = +(s.life.weight / (h * h)).toFixed(1);
      s.weight = +s.life.weight;
    }
    if (s.life.sex) s.p.sex = s.life.sex;
  };
  ENGINE.stepHour = function (s) {
    origStep(s);
    const act = window.ACTIVITY[(s.life && s.life.activity) || "walk"] || window.ACTIVITY.walk;
    s.flux.muscle = Math.min(1, (s.flux.muscle || 0.3) * act.muscle);
    if (typeof s.vat === "number") s.vat = Math.max(4, s.vat + (act.vat || 0));
    s.p.sens = Math.min(1.2, Math.max(0.2, s.p.sens + (act.sens || 0)));
    s.sbp = Math.max(88, s.sbp + (act.sbp || 0));
    if (act.muscle > 1.1) s.glucose = Math.max(70, s.glucose - 0.35);
    if (s.life && s.life.sex === "F" && typeof s.vat === "number") s.vat += 0.001;
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
