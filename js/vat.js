(function () {
  if (!window.ENGINE) return;
  const origBoot = ENGINE.bootState;
  const origStep = ENGINE.stepHour;
  const origSnap = ENGINE.snapshot;
  const origExplain = ENGINE.explainNow;
  ENGINE.bootState = function (pr) {
    const s = origBoot(pr);
    const p = pr.p || {};
    s.ldl = p.ldl || 95; s.hdl = p.hdl || 52; s.tg = p.tg || 95; s.vat = p.vat || 8; s.dnl = 0.1; s.spill = 0;
    return s;
  };
  ENGINE.stepHour = function (s) {
    origStep(s);
    const highGI = (s._gi || 55) >= 65;
    const carbLoad = s.gutC > 6 || s.glucose > 140;
    const hyperIns = s.insulin > 14;
    if ((carbLoad && hyperIns) || (highGI && s.glucose > 130)) {
      s.dnl = Math.min(1, s.dnl + 0.04);
      s.tg += 0.18 + s.dnl * 0.1;
      s.vat += 0.01 + (s.dnl > 0.4 ? 0.008 : 0);
      s.ldl += 0.05; s.hdl = Math.max(28, s.hdl - 0.025);
      s.p.sens = Math.max(0.22, s.p.sens - 0.0009);
      s.crp += 0.012; s.spill = Math.min(1, s.spill + 0.02);
    }
    if ((s.gutFiber || 0) > 5 && (s._gi || 55) < 52) {
      s.dnl = Math.max(0.05, s.dnl - 0.03);
      s.tg = Math.max(70, s.tg - 0.12);
      s.vat = Math.max(5, s.vat - 0.006);
      s.hdl = Math.min(70, s.hdl + 0.02);
      s.p.sens = Math.min(1.15, s.p.sens + 0.0005);
    }
    if (s.vat > 14) { s.crp += 0.008; s.sbp += 0.04; s.p.sens = Math.max(0.22, s.p.sens - 0.0004); }
    s.tg = Math.max(50, Math.min(420, s.tg));
    s.ldl = Math.max(55, Math.min(280, s.ldl));
  };
  ENGINE.snapshot = function (s) {
    const snap = origSnap(s);
    snap.ldl = +s.ldl.toFixed(0); snap.hdl = +s.hdl.toFixed(0); snap.tg = +s.tg.toFixed(0);
    snap.vat = +s.vat.toFixed(1); snap.dnl = +s.dnl.toFixed(2); snap.sens = +s.p.sens.toFixed(2);
    return snap;
  };
  ENGINE.explainNow = function (s) {
    const bits = origExplain(s);
    bits.push({ sys: "تخليق دهون جديد (DNL)", en: "DNL", txt: s.dnl > 0.35 ? "فائض كرب + إنسولين: الكبد يحوّل جزءًا من الجلوكوز إلى ثلاثي غليسريد وVLDL." : "DNL هادئ." });
    bits.push({ sys: "دهون حشوية", en: "VAT", txt: s.vat > 14 ? "VAT نشط: أحماض حرة وسيتوكينات ترفع المقاومة والضغط." : "مخزون حشوي معتدل." });
    bits.push({ sys: "دسم الدم", en: "Lipids", txt: "LDL≈" + s.ldl.toFixed(0) + " · TG≈" + s.tg.toFixed(0) + " · HDL≈" + s.hdl.toFixed(0) });
    return bits;
  };
  ENGINE.pathSteps = function (s) {
    return [
      { n: 1, ar: "أمعاء", on: s.gutC + s.gutP + s.gutF > 2 },
      { n: 2, ar: "بنكرياس", on: s.insulin > 10 },
      { n: 3, ar: "كبد / DNL", on: s.dnl > 0.3 },
      { n: 4, ar: "امتلاء", on: s.spill > 0.25 },
      { n: 5, ar: "VAT", on: s.vat > 12 },
      { n: 6, ar: "التهاب", on: s.p.sens < 0.7 || s.crp > 1.6 },
      { n: 7, ar: "ضغط", on: s.sbp > 135 },
      { n: 8, ar: "كورتيزول", on: s.cortisol > 13 }
    ];
  };
})();
