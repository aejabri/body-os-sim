(function () {
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function cond(s) {
    if (!s) return {};
    const glu = s.glucose || 100;
    const vat = +s.vat || 8;
    const fat = +s.fat || 18;
    const sbp = +s.sbp || 120;
    const dnl = +s.dnl || 0.1;
    const egfr = +s.egfr || 90;
    const sex = (s.life && s.life.sex) || (s.p && s.p.sex) || "M";
    const bmi = (s.p && s.p.bmi) || 25;
    return {
      sex: sex, bmi: bmi, vat: vat, sat: fat, glu: glu, sbp: sbp, dnl: dnl, egfr: egfr,
      liverHot: dnl > 0.35 || vat > 14,
      heartHot: sbp > 140,
      kidneyHot: egfr < 60 || glu > 180,
      vatHot: vat > 14,
      satHot: fat > 28,
      gluHot: glu > 140
    };
  }
  function organTone(hot, mid) {
    if (hot) return "#ff5d5d";
    if (mid) return "#f0b429";
    return "#3ecfbf";
  }
  function draw2d(svg, s) {
    if (!svg) return;
    const c = cond(s);
    const vatC = organTone(c.vatHot, c.vat > 10);
    const satC = organTone(c.satHot, c.sat > 22);
    const livC = organTone(c.liverHot, c.dnl > 0.2);
    const hrtC = organTone(c.heartHot, c.sbp > 130);
    const kidC = organTone(c.kidneyHot, c.egfr < 75);
    const panC = organTone(c.gluHot && (s.insulin || 0) > 16, c.gluHot);
    const gutC = organTone((s.gutC || 0) > 20, (s.gutC || 0) > 6);
    svg.innerHTML =
      '<rect x="0" y="0" width="280" height="420" fill="#08131b"/>' +
      '<text x="140" y="18" text-anchor="middle" fill="#9bb3bf" font-size="11">مخطط حالة الأعضاء · لون = حمل</text>' +
      '<ellipse cx="140" cy="52" rx="26" ry="30" fill="#5b8def"/>' +
      '<text x="140" y="56" text-anchor="middle" fill="#071018" font-size="10">مخ</text>' +
      '<path d="M118 108 Q140 118 162 108 L168 148 Q140 168 112 148 Z" fill="' + gutC + '"/>' +
      '<ellipse cx="96" cy="178" rx="24" ry="16" fill="' + livC + '"/>' +
      '<text x="96" y="182" text-anchor="middle" fill="#071018" font-size="9">كبد</text>' +
      '<ellipse cx="184" cy="180" rx="16" ry="11" fill="' + panC + '"/>' +
      '<ellipse cx="140" cy="208" rx="16" ry="13" fill="' + hrtC + '"/>' +
      '<ellipse cx="88" cy="248" rx="14" ry="20" fill="' + kidC + '"/>' +
      '<ellipse cx="192" cy="248" rx="14" ry="20" fill="' + kidC + '"/>' +
      '<ellipse cx="140" cy="268" rx="' + (28 + c.vat) + '" ry="' + (16 + c.vat * 0.4) + '" fill="' + vatC + '" opacity="0.55"/>' +
      '<text x="140" y="272" text-anchor="middle" fill="#e8f2f6" font-size="10">VAT</text>' +
      '<rect x="' + (108 - c.sat * 0.35) + '" y="292" width="' + (64 + c.sat * 0.7) + '" height="22" rx="10" fill="' + satC + '" opacity="0.7"/>' +
      '<rect x="118" y="318" width="16" height="78" rx="7" fill="#4aa3c7"/>' +
      '<rect x="146" y="318" width="16" height="78" rx="7" fill="#4aa3c7"/>';
  }
  function draw3d(box, s) {
    if (!box) return;
    const c = cond(s);
    const vat = clamp(c.vat || 8, 4, 28);
    const sat = clamp(c.sat || 18, 8, 42);
    const female = c.sex === "F";
    if (window.BODY_REAL_IMG) {
      const img = box.querySelector("#realbody");
      if (img && img.src !== window.BODY_REAL_IMG) img.src = window.BODY_REAL_IMG;
    }
    let cap = box.querySelector(".cap3d");
    if (!cap) {
      cap = document.createElement("div");
      cap.className = "cap3d";
      box.appendChild(cap);
    }
    cap.innerHTML =
      "<b>" + (female ? "أنثى" : "ذكر") + " · BMI " + c.bmi + "</b>" +
      "<span>حشوي VAT " + vat.toFixed(1) + " — " + (c.vatHot ? "نشط" : "معتدل") + "</span>" +
      "<span>تحت الجلد SAT " + sat.toFixed(0) + "% — " + (c.satHot ? "مرتفع" : "مضبوط") + "</span>" +
      "<span>كبد " + (c.liverHot ? "DNL/دهن مرتفع" : "هادئ") + " · قلب " + Math.round(c.sbp) + "</span>" +
      "<span class='mute'>صورة مولّدة تعليميًا لهذه الحالة — ليست أشعة ولا تشخيصًا</span>";
    const img = box.querySelector("#realbody");
    if (img) {
      img.style.filter = c.vatHot ? "saturate(1.18) contrast(1.06)" : "saturate(0.95)";
    }
    const paintTag = function (sel, hot) {
      const el = box.querySelector(sel);
      if (!el) return;
      el.style.borderColor = hot ? "#ff5d5d" : "#3ecfbf";
      el.style.color = hot ? "#ffb4b4" : "#d5e6ee";
    };
    paintTag(".tag.vat", c.vatHot);
    paintTag(".tag.sat", c.satHot);
    paintTag(".tag.liv", c.liverHot);
    paintTag(".tag.hrt", c.heartHot);
  }
  function paint() {
    const s = window.__state;
    draw2d(document.getElementById("body"), s);
    draw3d(document.getElementById("body3d"), s);
  }
  window.BODYVIS = { cond: cond, draw2d: draw2d, draw3d: draw3d, paint: paint };
  const tabs = document.getElementById("viewtabs");
  if (tabs) tabs.onclick = function (e) {
    const b = e.target.closest("[data-v]");
    if (!b) return;
    const v = b.dataset.v;
    const svg = document.getElementById("body");
    const d3 = document.getElementById("body3d");
    if (svg) svg.style.display = v === "2d" ? "block" : "none";
    if (d3) d3.style.display = v === "3d" ? "flex" : "none";
    tabs.querySelectorAll("[data-v]").forEach(function (x) { x.classList.toggle("on", x === b); });
  };
  const prev = window.__forceRender;
  window.__forceRender = function () { if (prev) prev(); paint(); };
  setTimeout(paint, 200);
})();
