(function () {
  const $ = function (id) { return document.getElementById(id); };
  if (!$("age")) return;
  const actBox = $("activity");
  actBox.innerHTML = Object.keys(window.ACTIVITY).map(function (k) {
    return '<option value="' + k + '">' + window.ACTIVITY[k].ar + "</option>";
  }).join("");
  actBox.value = "walk";
  window.__dietId = "balanced";

  function selectedProfile() {
    const on = document.querySelector("#profiles .pcard.on");
    const id = on && on.dataset.id;
    return (window.PROFILES || []).find(function (p) { return p.id === id; }) || PROFILES[0];
  }
  function currentMeal() {
    if (window._scannedMeal) return Object.assign({}, window._scannedMeal, { water: +$("mw").value || 300 });
    return {
      c: +$("mc").value, p: +$("mp").value, f: +$("mf").value,
      fiber: +$("mfi").value, gi: +$("mgi").value, water: +$("mw").value || 300, tags: ["custom"]
    };
  }
  function lifeFields() {
    return {
      activity: $("activity").value,
      age: +$("age").value,
      sex: $("sex").value,
      weight: +$("weight").value,
      diet: window.__dietId || "balanced"
    };
  }
  function paintPreset() {
    const box = $("preset");
    if (!box) return;
    const pr = selectedProfile();
    const d = (window.PROTOCOLS || []).find(function (p) { return p.id === window.__dietId; });
    const act = window.ACTIVITY[$("activity").value] || {};
    const hours = +$("duration").value;
    box.innerHTML = "<b>قبل التشغيل</b> — " + pr.ar +
      " · " + $("age").value + " سنة · " + ($("sex").value === "F" ? "أنثى" : "ذكر") +
      " · " + $("weight").value + " كغ · " + act.ar +
      " · حمية " + (d ? d.ar : "مخصصة") +
      " · مدة " + (hours >= 24 ? (hours / 24) + " يوم" : hours + " ساعة") +
      " · " + ($("mealsn").value || 2) + " وجبات/يوم";
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
    if (hours <= 24) {
      ENGINE.eat(s, meal);
      ENGINE.runHours(s, hours);
    } else ENGINE.runLifestyle(s, meal, Math.round(hours / 24), +$("mealsn").value || 2);
    s.events.unshift({ t: s.t, lvl: "info", ar: "انتهت المدة المختارة." });
    if (window.__forceRender) window.__forceRender();
  };

  ["age", "sex", "weight", "activity", "duration", "mealsn"].forEach(function (id) {
    $(id).addEventListener("change", window.rebaseBeforeSim);
  });
  const proto = $("protocols");
  if (proto) proto.addEventListener("click", function (e) {
    const btn = e.target.closest(".chip");
    if (btn && btn.dataset.id) window.__dietId = btn.dataset.id;
    setTimeout(window.rebaseBeforeSim, 0);
  });
  const profiles = $("profiles");
  if (profiles) profiles.addEventListener("click", function () { setTimeout(window.rebaseBeforeSim, 0); });
  setTimeout(window.rebaseBeforeSim, 200);
})();
