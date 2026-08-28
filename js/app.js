(function () {
  let profile = window.PROFILES[0];
  let state = null;
  let protocol = "balanced";
  const $ = (id) => document.getElementById(id);
  function heat(v) {
    const x = Math.max(0, Math.min(1, v || 0));
    return "rgb(" + Math.round(20 + x * 200) + "," + Math.round(80 + x * 80) + "," + Math.round(90 + (1 - x) * 80) + ")";
  }
  function drawBody(flux) {
    const f = flux || {};
    $("body").innerHTML =
      '<text x="140" y="22" text-anchor="middle" fill="#9bb3bf" font-size="11">تدفق النشاط هذه الساعة</text>' +
      '<ellipse cx="140" cy="58" rx="28" ry="32" fill="' + heat(f.brain) + '" stroke="#3ecfbf"/><text x="140" y="62" text-anchor="middle" fill="#071018" font-size="10">مخ</text>' +
      '<rect x="128" y="90" width="24" height="18" fill="' + heat(f.mouth) + '"/><text x="140" y="103" text-anchor="middle" fill="#071018" font-size="8">فم</text>' +
      '<rect x="108" y="118" width="64" height="36" rx="8" fill="' + heat(f.gut) + '"/><text x="140" y="140" text-anchor="middle" fill="#071018" font-size="10">أمعاء</text>' +
      '<ellipse cx="92" cy="175" rx="22" ry="16" fill="' + heat(f.liver) + '"/><text x="92" y="179" text-anchor="middle" fill="#071018" font-size="9">كبد</text>' +
      '<ellipse cx="188" cy="175" rx="16" ry="12" fill="' + heat(f.pancreas) + '"/><text x="188" y="179" text-anchor="middle" fill="#071018" font-size="8">بنكرياس</text>' +
      '<ellipse cx="140" cy="210" rx="18" ry="14" fill="' + heat(f.heart) + '"/><text x="140" y="214" text-anchor="middle" fill="#071018" font-size="9">قلب</text>' +
      '<rect x="70" y="235" width="28" height="70" rx="10" fill="' + heat(f.kidney) + '"/><rect x="182" y="235" width="28" height="70" rx="10" fill="' + heat(f.kidney) + '"/>' +
      '<text x="84" y="274" text-anchor="middle" fill="#071018" font-size="8">كلية</text><text x="196" y="274" text-anchor="middle" fill="#071018" font-size="8">كلية</text>' +
      '<rect x="108" y="248" width="64" height="46" rx="6" fill="' + heat(f.adipose) + '"/><text x="140" y="274" text-anchor="middle" fill="#071018" font-size="9">شحم</text>' +
      '<rect x="118" y="305" width="18" height="90" rx="7" fill="' + heat(f.muscle) + '"/><rect x="146" y="305" width="18" height="90" rx="7" fill="' + heat(f.muscle) + '"/>' +
      '<text x="140" y="408" text-anchor="middle" fill="#9bb3bf" font-size="10">عضل</text>';
  }
  function tone(id, n) {
    if (id === "glucose" && (n < 70 || n > 250)) return n < 55 || n > 350 ? "bad" : "warn";
    if (id === "ketones" && n > 1.5) return n > 3 ? "bad" : "warn";
    if (id === "pH" && n < 7.32) return n < 7.25 ? "bad" : "warn";
    if (id === "K" && (n < 3.3 || n > 5.3)) return "warn";
    if (id === "egfr" && n < 60) return n < 45 ? "bad" : "warn";
    if (id === "sbp" && n > 150) return "warn";
    return "";
  }
  function render() {
    const snap = ENGINE.snapshot(state);
    $("clock").textContent = String(snap.t);
    drawBody(snap.flux);
    const rows = [
      ["glucose", "سكر مغ/دل", snap.glucose],
      ["insulin", "إنسولين نسبي", snap.insulin],
      ["ketones", "كيتون", snap.ketones],
      ["pH", "pH", snap.pH],
      ["K", "بوتاسيوم", snap.K],
      ["sbp", "ضغط", snap.sbp],
      ["egfr", "eGFR", snap.egfr],
      ["a1c", "تراكمي", snap.a1c],
      ["water", "حجم ماء", snap.water]
    ];
    $("vitals").innerHTML = rows.map(function (r) {
      return '<div class="vital ' + tone(r[0], r[2]) + '"><b>' + r[2] + '</b><span>' + r[1] + '</span></div>';
    }).join("");
    $("explain").innerHTML = ENGINE.explainNow(state).map(function (e) {
      return '<article><small>' + e.en + '</small><div><strong>' + e.sys + '</strong> — ' + e.txt + '</div></article>';
    }).join("");
    $("log").innerHTML = state.events.slice(0, 24).map(function (e) {
      return '<div class="' + e.lvl + '">س' + e.t + ' · ' + e.ar + '</div>';
    }).join("") || "<div>لا أحداث بعد.</div>";
  }
  function mealFromForm() {
    return { c: +$("mc").value, p: +$("mp").value, f: +$("mf").value, fiber: +$("mfi").value, gi: +$("mgi").value, water: +$("mw").value, tags: ["custom"] };
  }
  function applyMedChecks() {
    ENGINE.setMed(state, "insulinU", $("med-ins").checked, +$("med-ins-u").value);
    ENGINE.setMed(state, "metformin", $("med-met").checked);
    ENGINE.setMed(state, "acei", $("med-ace").checked);
  }
  function loadProfile(pr) {
    profile = pr;
    state = ENGINE.bootState(pr);
    $("med-ins").checked = !!pr.p.insulinU;
    $("med-ins-u").value = pr.p.insulinU || 24;
    $("med-met").checked = !!pr.p.metformin;
    $("med-ace").checked = !!pr.p.acei;
    document.querySelectorAll(".pcard").forEach(function (el) { el.classList.toggle("on", el.dataset.id === pr.id); });
    state.events.unshift({ t: 0, lvl: "info", ar: "بدأت المحاكاة على: " + pr.ar + " — " + pr.blurb, en: pr.en });
    render();
  }
  function paintSetup() {
    $("profiles").innerHTML = PROFILES.map(function (pr) {
      return '<button class="pcard" data-id="' + pr.id + '"><b>' + pr.ar + '</b><span>' + pr.en + ' · ' + pr.blurb + '</span></button>';
    }).join("");
    $("profiles").onclick = function (e) {
      var btn = e.target.closest(".pcard");
      if (!btn) return;
      loadProfile(PROFILES.find(function (x) { return x.id === btn.dataset.id; }));
    };
    $("protocols").innerHTML = PROTOCOLS.map(function (p) {
      return '<button class="chip ' + (p.id === protocol ? "on" : "") + '" data-id="' + p.id + '">' + p.ar + '</button>';
    }).join("");
    $("protocols").onclick = function (e) {
      var btn = e.target.closest(".chip");
      if (!btn) return;
      protocol = btn.dataset.id;
      var p = PROTOCOLS.find(function (x) { return x.id === protocol; });
      $("mc").value = p.meal.c; $("mp").value = p.meal.p; $("mf").value = p.meal.f;
      $("mfi").value = p.meal.fiber; $("mgi").value = p.meal.gi; $("mw").value = p.meal.water;
      document.querySelectorAll("#protocols .chip").forEach(function (el) { el.classList.toggle("on", el.dataset.id === protocol); });
    };
  }
  $("btn-eat").onclick = function () { applyMedChecks(); ENGINE.eat(state, mealFromForm()); ENGINE.stepHour(state); render(); };
  $("btn-1h").onclick = function () { applyMedChecks(); ENGINE.stepHour(state); render(); };
  $("btn-4h").onclick = function () { applyMedChecks(); ENGINE.runHours(state, 4); render(); };
  $("btn-24h").onclick = function () { applyMedChecks(); ENGINE.runHours(state, 24); render(); };
  $("btn-7d").onclick = function () {
    applyMedChecks();
    var meal = mealFromForm();
    for (var d = 0; d < 7; d++) { ENGINE.eat(state, meal); ENGINE.runHours(state, 5); ENGINE.eat(state, meal); ENGINE.runHours(state, 19); }
    render();
  };
  $("btn-reset").onclick = function () { loadProfile(profile); };
  paintSetup();
  loadProfile(PROFILES[0]);
})();
