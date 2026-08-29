(function () {
  const $ = function (id) { return document.getElementById(id); };
  if (!$("age") || !window.ACTIVITY) return;
  const actBox = $("activity");
  if (actBox && !actBox.options.length) {
    actBox.innerHTML = Object.keys(window.ACTIVITY).map(function (k) {
      return '<option value="' + k + '">' + window.ACTIVITY[k].ar + "</option>";
    }).join("");
    actBox.value = "walk";
  }
  const fs = $("fastStyle");
  if (fs && window.FASTING && !fs.options.length) {
    fs.innerHTML = Object.keys(window.FASTING).map(function (k) {
      return '<option value="' + k + '">' + window.FASTING[k].ar + "</option>";
    }).join("");
    fs.value = "none";
  }
  const ff = $("fastFreq");
  if (ff && window.FAST_FREQ && !ff.options.length) {
    ff.innerHTML = Object.keys(window.FAST_FREQ).map(function (k) {
      return '<option value="' + k + '">' + window.FAST_FREQ[k].ar + "</option>";
    }).join("");
    ff.value = "daily";
  }
  function syncFastHours() {
    if (!$("fastHours") || !window.FASTING) return;
    const st = window.FASTING[$("fastStyle") && $("fastStyle").value || "none"];
    if (st && !$("fastHours").dataset.touched) $("fastHours").value = st.hours;
    if (st && st.meals && $("mealsn") && ($("fastStyle").value === "omad" || $("fastStyle").value === "20_4")) {
      $("mealsn").value = st.meals;
    }
  }
  if ($("fastStyle")) $("fastStyle").addEventListener("change", function () {
    if ($("fastHours")) delete $("fastHours").dataset.touched;
    syncFastHours();
  });
  if ($("fastHours")) $("fastHours").addEventListener("input", function () { this.dataset.touched = "1"; });
  window.__dietId = window.__dietId || "balanced";
  function selectedProfile() {
    const on = document.querySelector("#profiles .pcard.on");
    const id = on && on.dataset.id;
    return (window.PROFILES || []).find(function (p) { return p.id === id; }) || PROFILES[0];
  }
  function currentMeal() {
    if (window._scannedMeal) return Object.assign({}, window._scannedMeal, { water: +$("mw").value || 300 });
    return { c: +$("mc").value, p: +$("mp").value, f: +$("mf").value, fiber: +$("mfi").value, gi: +$("mgi").value, water: +$("mw").value || 300, tags: ["custom"] };
  }
  function lifeFields() {
    const style = ($("fastStyle") && $("fastStyle").value) || "none";
    const defH = (window.FASTING[style] || {}).hours || 0;
    return {
      activity: $("activity").value, age: +$("age").value, sex: $("sex").value, weight: +$("weight").value,
      diet: window.__dietId || "balanced",
      waterL: +(($("waterL") && $("waterL").value) || 2.2),
      sleepH: +(($("sleepH") && $("sleepH").value) || 7),
      sbpNow: +(($("sbpNow") && $("sbpNow").value) || 120),
      dbpNow: +(($("dbpNow") && $("dbpNow").value) || 80),
      fastStyle: style,
      fastFreq: ($("fastFreq") && $("fastFreq").value) || "daily",
      fastHours: +(($("fastHours") && $("fastHours").value) || defH)
    };
  }
  function paintPreset() {
    const box = $("preset");
    if (!box) return;
    const pr = selectedProfile();
    const d = (window.PROTOCOLS || []).find(function (p) { return p.id === window.__dietId; });
    const act = window.ACTIVITY[$("activity").value] || {};
    const hours = +$("duration").value;
    const L = lifeFields();
    const fst = (window.FASTING[L.fastStyle] || {}).ar || "بلا صيام";
    const fr = (window.FAST_FREQ[L.fastFreq] || {}).ar || "";
    box.innerHTML = "<b>قبل التشغيل</b> — " + pr.ar + " · " + L.age + " سنة · " + (L.sex === "F" ? "أنثى" : "ذكر") +
      " · " + L.weight + " كغ · " + act.ar +
      " · صيام " + fst + (L.fastHours ? " ≈" + L.fastHours + "س" : "") + " · " + fr +
      " · ماء " + L.waterL + " ل · نوم " + L.sleepH + " س · ضغط " + L.sbpNow + "/" + L.dbpNow +
      " · حمية " + (d ? d.ar : "مخصصة") +
      " · مدة " + (hours >= 24 ? (hours / 24) + " يوم" : hours + " ساعة");
  }
  window.rebaseBeforeSim = function () {
    const pr = selectedProfile();
    const s = ENGINE.bootState(pr);
    ENGINE.setLife(s, lifeFields());
    ENGINE.applyBaseline(s);
    if ($("med-ins")) ENGINE.setMed(s, "insulinU", $("med-ins").checked, +$("med-ins-u").value);
    if ($("med-met")) ENGINE.setMed(s, "metformin", $("med-met").checked);
    if ($("med-ace")) ENGINE.setMed(s, "acei", $("med-ace").checked);
    window.__state = s;
    paintPreset();
    if (window.__forceRender) window.__forceRender();
    return s;
  };
  $("btn-run").onclick = function () {
    const s = window.rebaseBeforeSim();
    s.residue = ($("residue") && $("residue").value) || "none";
    const meal = currentMeal();
    const hours = +$("duration").value;
    const L = lifeFields();
    const useFast = L.fastStyle && L.fastStyle !== "none";
    if (hours <= 24 && !useFast) { ENGINE.eat(s, meal); ENGINE.runHours(s, hours); }
    else ENGINE.runLifestyle(s, meal, Math.max(1, Math.round(hours / 24)), +$("mealsn").value || 2);
    s.events.unshift({ t: s.t, lvl: "info", ar: "انتهت المدة المختارة." });
    if (window.__forceRender) window.__forceRender();
  };
  ["age","sex","weight","activity","duration","mealsn","waterL","sleepH","sbpNow","dbpNow","fastStyle","fastFreq","fastHours"].forEach(function (id) {
    if ($(id)) $(id).addEventListener("change", window.rebaseBeforeSim);
  });
  syncFastHours();
  setTimeout(window.rebaseBeforeSim, 80);
})();
