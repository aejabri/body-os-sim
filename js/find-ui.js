(function () {
  const $ = function (id) { return document.getElementById(id); };
  if (!$("btn-name")) return;
  let net = null;
  function status(t) { $("scan-status").textContent = t; }
  $("btn-name").onclick = async function () {
    const q = ($("foodname").value || "").trim();
    if (!q) { status("اكتب اسم غذاء أو وجبة."); return; }
    const grams = +$("grams").value || 100;
    const staple = window.matchStaple(q);
    if (staple) {
      SEARCH.showMeal(window.stapleToMeal(staple, grams), "مرجع شائع");
      status("من قاعدة الأطعمة الشائعة.");
    } else status("بحث Open Food Facts…");
    try {
      const prods = await SEARCH.offName(q);
      const items = prods.slice(0, 8).map(function (p) {
        return { label: (p.product_name || "منتج") + (p.brands ? " — " + p.brands : ""), prod: p };
      });
      if (staple) items.unshift({ label: "مرجع: " + staple.name, staple: staple });
      SEARCH.listHits(items, function (it) {
        if (it.staple) SEARCH.showMeal(window.stapleToMeal(it.staple, grams), "مرجع");
        else SEARCH.showMeal(LOOKUP.toMeal(it.prod, grams), it.prod.code || "");
        status("حُدّد. أدخل الوجبة.");
      });
      if (!staple && items[0] && items[0].prod) SEARCH.showMeal(LOOKUP.toMeal(items[0].prod, grams), "أول نتيجة");
      if (!items.length && !staple) status("لا نتيجة. جرّب إنجليزي أو باركود.");
    } catch (e) { if (!staple) status(String(e.message || e)); }
  };
  $("foodname").addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); $("btn-name").click(); }
  });
  async function ensureNet() {
    if (net) return net;
    status("تحميل نموذج التعرف البصري…");
    if (!window.mobilenet) throw new Error("mobilenet missing");
    net = await window.mobilenet.load({ version: 2, alpha: 1 });
    return net;
  }
  $("btn-photo").onclick = function () { $("photo-file").click(); };
  $("photo-file").onchange = async function (ev) {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;
    const img = $("photo-preview");
    img.src = URL.createObjectURL(file);
    img.style.display = "block";
    try {
      const model = await ensureNet();
      const preds = await model.classify(img, 5);
      status("اقترح الشكل — اختر أقرب صنف.");
      SEARCH.listHits(preds.filter(function (p) { return p.probability > 0.08; }).map(function (p) {
        return { label: Math.round(p.probability * 100) + "% · " + p.className, q: p.className.split(",")[0] };
      }), function (it) { $("foodname").value = it.q; $("btn-name").click(); });
    } catch (e) { status("التعرف البصري فشل. اكتب الاسم. " + (e.message || "")); }
  };
})();
