(function () {
  const $ = function (id) { return document.getElementById(id); };
  if (!$("path")) return;
  const extraId = "predm_vat";
  if (window.PROFILES && !PROFILES.some(function (p) { return p.id === extraId; })) {
    PROFILES.unshift({ id: extraId, ar: "مقدّمات + LDL + حشوي", en: "Predm+VAT", blurb: "سكر صائم وLDL وVAT مرتفعة.", p: { age: 48, sex: "M", bmi: 31, beta: 0.7, sens: 0.55, hgo: 1.2, residual: 0.8, egfr: 90, sbp: 138, a1c: 6.1, fat: 28, ketones: 0.2, smoker: 0, t1: 0, ldl: 178, hdl: 36, tg: 210, vat: 17 } });
    const box = $("profiles");
    if (box && !box.querySelector('[data-id="' + extraId + '"]')) {
      const b = document.createElement("button");
      b.className = "pcard"; b.dataset.id = extraId;
      b.innerHTML = "<b>مقدّمات + LDL + حشوي</b><span>حالة الملصق قبل التغيير.</span>";
      box.insertBefore(b, box.firstChild);
    }
  }
  function paint() {
    const s = window.__state;
    if (!s || !ENGINE.pathSteps) return;
    $("path").innerHTML = ENGINE.pathSteps(s).map(function (st) {
      return '<div class="step' + (st.on ? " on" : "") + '"><b>' + st.n + "</b><span>" + st.ar + "</span></div>";
    }).join("");
    const labs = $("labs");
    if (labs) labs.innerHTML =
      '<div class="vital"><b>' + Math.round(s.ldl || 0) + "</b><span>LDL</span></div>" +
      '<div class="vital"><b>' + Math.round(s.tg || 0) + "</b><span>TG</span></div>" +
      '<div class="vital"><b>' + Math.round(s.hdl || 0) + "</b><span>HDL</span></div>" +
      '<div class="vital"><b>' + (s.vat ? s.vat.toFixed(1) : "—") + "</b><span>VAT</span></div>" +
      '<div class="vital"><b>' + (s.dnl ? s.dnl.toFixed(2) : "—") + "</b><span>DNL</span></div>" +
      '<div class="vital"><b>' + (s.p && s.p.sens ? s.p.sens.toFixed(2) : "—") + "</b><span>حساسية</span></div>";
  }
  setInterval(paint, 700);
  paint();
})();
