(function () {
  let profile = window.PROFILES[0];
  let state = null;
  let protocol = "balanced";
  const $ = function (id) { return document.getElementById(id); };
  function heat(v) {
    const x = Math.max(0, Math.min(1, v || 0));
    return "rgb(" + Math.round(20 + x * 200) + "," + Math.round(80 + x * 80) + "," + Math.round(90 + (1 - x) * 80) + ")";
  }
  function drawBody(flux) {
    const f = flux || {};
    $("body").innerHTML =
      '<ellipse cx="140" cy="58" rx="28" ry="32" fill="' + heat(f.brain) + '"/><text x="140" y="62" text-anchor="middle" fill="#071018" font-size="10">مخ</text>' +
      '<rect x="128" y="90" width="24" height="18" fill="' + heat(f.mouth) + '"/><rect x="108" y="118" width="64" height="36" rx="8" fill="' + heat(f.gut) + '"/>' +
      '<ellipse cx="92" cy="175" rx="22" ry="16" fill="' + heat(f.liver) + '"/><ellipse cx="188" cy="175" rx="16" ry="12" fill="' + heat(f.pancreas) + '"/>' +
      '<ellipse cx="140" cy="210" rx="18" ry="14" fill="' + heat(f.heart) + '"/>' +
      '<rect x="70" y="235" width="28" height="70" rx="10" fill="' + heat(f.kidney) + '"/><rect x="182" y="235" width="28" height="70" rx="10" fill="' + heat(f.kidney) + '"/>' +
      '<rect x="108" y="248" width="64" height="46" rx="6" fill="' + heat(f.adipose) + '"/>' +
      '<rect x="118" y="305" width="18" height="90" rx="7" fill="' + heat(f.muscle) + '"/><rect x="146" y="305" width="18" height="90" rx="7" fill="' + heat(f.muscle) + '"/>';
  }
  function tone(id, n) {
    if (id === "glucose" && (n < 70 || n > 250)) return n < 55 || n > 350 ? "bad" : "warn";
    if (id === "ketones" && n > 1.5) return n > 3 ? "bad" : "warn";
    if (id === "pH" && n < 7.32) return n < 7.25 ? "bad" : "warn";
    if (id === "egfr" && n < 60) return n < 45 ? "bad" : "warn";
    return "";
  }
  function render() {
    window.__state = state;
    const snap = ENGINE.snapshot(state);
    $("clock").textContent = String(snap.t);
    drawBody(snap.flux);
    const rows = [["glucose","سكر",snap.glucose],["insulin","إنسولين",snap.insulin],["ketones","كيتون",snap.ketones],["pH","pH",snap.pH],["K","K",snap.K],["sbp","ضغط",snap.sbp],["egfr","eGFR",snap.egfr],["a1c","A1c",snap.a1c],["water","ماء",snap.water]];
    $("vitals").innerHTML = rows.map(function (r) {
      return '<div class="vital ' + tone(r[0], r[2]) + '"><b>' + r[2] + '</b><span>' + r[1] + '</span></div>';
    }).join("");
    $("explain").innerHTML = ENGINE.explainNow(state).map(function (e) {
      return '<article><small>' + e.en + '</small><div><strong>' + e.sys + '</strong> — ' + e.txt + '</div></article>';
    }).join("");
    $("log").innerHTML = state.events.slice(0, 24).map(function (e) {
      return '<div class="' + e.lvl + '">س' + e.t + ' · ' + e.ar + '</div>';
    }).join("") || "<div>لا أحداث</div>";
  }
  function mealFromForm() {
    return { c: +$("mc").value, p: +$("mp").value, f: +$("mf").value, fiber: +$("mfi").value, gi: +$("mgi").value, water: +$("mw").value, tags: ["custom"] };
  }
  function currentMeal() {
    const meal = window._scannedMeal ? Object.assign({}, window._scannedMeal) : mealFromForm();
    meal.water = +$("mw").value || meal.water || 0;
    return meal;
  }
  function applyMedChecks() {
    ENGINE.setMed(state, "insulinU", $("med-ins").checked, +$("med-ins-u").value);
    ENGINE.setMed(state, "metformin", $("med-met").checked);
    ENGINE.setMed(state, "acei", $("med-ace").checked);
  }
  function loadProfile(pr) {
    profile = pr;
    state = ENGINE.bootState(pr);
    window.__state = state;
    $("med-ins").checked = !!pr.p.insulinU;
    $("med-ins-u").value = pr.p.insulinU || 24;
    $("med-met").checked = !!pr.p.metformin;
    $("med-ace").checked = !!pr.p.acei;
    document.querySelectorAll(".pcard").forEach(function (el) { el.classList.toggle("on", el.dataset.id === pr.id); });
    state.events.unshift({ t: 0, lvl: "info", ar: "بدأت: " + pr.ar, en: pr.en });
    render();
  }
  function paintSetup() {
    $("profiles").innerHTML = PROFILES.map(function (pr) {
      return '<button class="pcard" data-id="' + pr.id + '"><b>' + pr.ar + '</b><span>' + pr.en + '</span></button>';
    }).join("");
    $("profiles").onclick = function (e) {
      const btn = e.target.closest(".pcard");
      if (!btn) return;
      loadProfile(PROFILES.find(function (x) { return x.id === btn.dataset.id; }));
    };
    $("protocols").innerHTML = PROTOCOLS.map(function (p) {
      return '<button class="chip" data-id="' + p.id + '">' + p.ar + '</button>';
    }).join("");
    $("protocols").onclick = function (e) {
      const btn = e.target.closest(".chip");
      if (!btn) return;
      const p = PROTOCOLS.find(function (x) { return x.id === btn.dataset.id; });
      $("mc").value = p.meal.c; $("mp").value = p.meal.p; $("mf").value = p.meal.f;
      $("mfi").value = p.meal.fiber; $("mgi").value = p.meal.gi; $("mw").value = p.meal.water;
      window._scannedMeal = null;
    };
  }
  $("btn-eat").onclick = function () {
    applyMedChecks();
    state.residue = ($("residue") && $("residue").value) || "none";
    ENGINE.eat(state, currentMeal());
    ENGINE.stepHour(state);
    render();
  };
  $("btn-1h").onclick = function () { applyMedChecks(); ENGINE.stepHour(state); render(); };
  $("btn-4h").onclick = function () { applyMedChecks(); ENGINE.runHours(state, 4); render(); };
  $("btn-24h").onclick = function () { applyMedChecks(); ENGINE.runHours(state, 24); render(); };
  $("btn-7d").onclick = function () {
    applyMedChecks();
    state.residue = ($("residue") && $("residue").value) || "none";
    const meal = currentMeal();
    for (var d = 0; d < 7; d++) { ENGINE.eat(state, meal); ENGINE.runHours(state, 5); ENGINE.eat(state, meal); ENGINE.runHours(state, 19); }
    render();
  };
  $("btn-reset").onclick = function () { loadProfile(profile); };
  paintSetup();
  loadProfile(PROFILES[0]);
})();
