(function () {
  const $ = function (id) { return document.getElementById(id); };
  if (!$("age")) return;
  const actBox = $("activity");
  actBox.innerHTML = Object.keys(window.ACTIVITY).map(function (k) {
    return '<option value="' + k + '">' + window.ACTIVITY[k].ar + "</option>";
  }).join("");
  actBox.value = "walk";

  function applyLife() {
    if (!window.__state) return;
    ENGINE.setLife(window.__state, {
      activity: $("activity").value,
      age: +$("age").value,
      sex: $("sex").value,
      weight: +$("weight").value
    });
  }

  $("btn-run").onclick = function () {
    applyLife();
    const s = window.__state;
    s.residue = ($("residue") && $("residue").value) || "none";
    const meal = window._scannedMeal ? Object.assign({}, window._scannedMeal) : {
      c: +$("mc").value, p: +$("mp").value, f: +$("mf").value,
      fiber: +$("mfi").value, gi: +$("mgi").value, water: +$("mw").value, tags: ["custom"]
    };
    meal.water = +$("mw").value || 300;
    const hours = +$("duration").value;
    if (hours <= 24) ENGINE.runHours(s, hours);
    else ENGINE.runLifestyle(s, meal, Math.round(hours / 24), +$("mealsn").value || 2);
    s.events.unshift({
      t: s.t, lvl: "info",
      ar: "محاكاة " + hours + "س · " + (window.ACTIVITY[$("activity").value] || {}).ar +
        " · " + $("sex").options[$("sex").selectedIndex].text + " · " + $("age").value + "سنة · " + $("weight").value + "كغ"
    });
    if (typeof window.__forceRender === "function") window.__forceRender();
    else {
      const clk = document.getElementById("clock");
      if (clk) clk.textContent = String(s.t);
    }
  };

  ["age", "sex", "weight", "activity"].forEach(function (id) {
    $(id).addEventListener("change", applyLife);
  });
})();
