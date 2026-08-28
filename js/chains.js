(function () {
  if (!window.ENGINE) return;
  const origEat = ENGINE.eat;
  const origStep = ENGINE.stepHour;
  const origExplain = ENGINE.explainNow;
  ENGINE._note = function (s, lvl, ar, en) {
    s.events.unshift({ t: s.t, lvl: lvl, ar: ar, en: en || "" });
    if (s.events.length > 80) s.events.pop();
  };
  ENGINE.eat = function (s, meal) {
    origEat(s, meal);
    s.naLoad = (s.naLoad || 0) + (meal.na || 0);
    s.micro = s.micro || { ca: 0, fe: 0, vitc: 0, k: 0 };
    s.micro.ca += meal.ca || 0; s.micro.fe += meal.fe || 0; s.micro.k += meal.k_mg || 0;
    if (meal.na) { s.Na += Math.min(3, meal.na / 800); ENGINE._note(s, meal.na > 600 ? "amber" : "info", "صوديوم ≈ " + meal.na + " مغ.", "Na"); }
    if (meal.sugars && meal.sugars > 15) { s._gi = Math.max(s._gi || 55, 70); ENGINE._note(s, "amber", "سكر حر " + meal.sugars + "غ.", "sugar"); }
    (meal.additives || []).forEach(function (a) {
      const e = a.effect || {};
      s.crp += e.crp || 0; s.motil = (s.motil || 1) + (e.motil || 0); s.hist = (s.hist || 1) + (e.hist || 0);
      if (e.kidney) s.egfr -= e.kidney * 0.15;
      if (e.na) s.Na += e.na / 1000;
      ENGINE._note(s, e.crp > 0.08 || e.kidney ? "amber" : "info", "E " + (a.id || "").toUpperCase() + " " + a.ar + " / " + a.cls, a.cls);
    });
    if (meal.tags && meal.tags.indexOf("ultra") >= 0) { s.crp += 0.05; ENGINE._note(s, "amber", "NOVA 4.", "nova"); }
    const rk = window.RESIDUE_KB && window.RESIDUE_KB[s.residue || "none"];
    if (rk && rk.load) {
      s.crp += rk.load * 0.04;
      s.flux.liver = Math.min(1, (s.flux.liver || 0.3) + rk.load * 0.2);
      ENGINE._note(s, rk.cls === "op" ? "amber" : "info", rk.ar, "residue");
    }
  };
  ENGINE.stepHour = function (s) {
    origStep(s);
    if (s.naLoad > 1500) s.sbp += 0.08;
    if (s.micro && s.micro.k > 400) s.K = Math.min(5.4, s.K + 0.005);
  };
  ENGINE.explainNow = function (s) {
    const bits = origExplain(s);
    const m = s.micro || {};
    bits.push({ sys: "مايكرو / E", en: "Micro", txt: "Naمتراكم≈" + Math.round(s.naLoad || 0) + " · Ca " + Math.round(m.ca || 0) + " · Fe " + (m.fe || 0) + " · CRP " + (s.crp || 0).toFixed(2) });
    if (s.residue && s.residue !== "none") bits.push({ sys: "بقايا رش", en: "Residues", txt: (window.RESIDUE_KB[s.residue] || {}).ar + " — ليس قياس مختبر." });
    return bits;
  };
})();
