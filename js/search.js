window.SEARCH = (function () {
  async function offName(q) {
    const url = "https://world.openfoodfacts.org/cgi/search.pl?search_simple=1&action=process&json=1&page_size=8&search_terms=" + encodeURIComponent(q);
    const res = await fetch(url, { headers: { Accept: "application/json", "User-Agent": "BodyOSSim/1.1 (educational)" } });
    if (!res.ok) throw new Error("بحث OFF فشل");
    const j = await res.json();
    return j.products || [];
  }
  function fillForm(meal) {
    const $ = function (id) { return document.getElementById(id); };
    $("mc").value = meal.c; $("mp").value = meal.p; $("mf").value = meal.f;
    $("mfi").value = meal.fiber; $("mgi").value = meal.gi || 55;
    window._scannedMeal = meal;
  }
  function showMeal(meal, extra) {
    const box = document.getElementById("scan-card");
    const res = (document.getElementById("residue") || {}).value || "none";
    const lines = window.LOOKUP && LOOKUP.analyze ? LOOKUP.analyze(meal, res) : [];
    box.innerHTML = (meal.image ? "<img alt='' src='" + meal.image + "'/>" : "") +
      "<div><b>" + meal.name + "</b><div class='mute'>" + (meal.brands || "") +
      (extra ? " · " + extra : "") + "</div><div>" + lines.join("<br/>") + "</div></div>";
    fillForm(meal);
  }
  function listHits(items, onPick) {
    const box = document.getElementById("hits");
    if (!box) return;
    box.innerHTML = items.map(function (it, i) {
      return "<button type='button' class='hit' data-i='" + i + "'>" + it.label + "</button>";
    }).join("") || "<span class='mute'>لا نتائج</span>";
    box.onclick = function (e) {
      const b = e.target.closest(".hit");
      if (!b) return;
      onPick(items[+b.dataset.i]);
    };
  }
  return { offName: offName, fillForm: fillForm, showMeal: showMeal, listHits: listHits };
})();
