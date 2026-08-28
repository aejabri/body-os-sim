window.LOOKUP = (function () {
  async function off(code) {
    const url = "https://world.openfoodfacts.org/api/v2/product/" + encodeURIComponent(code) +
      ".json?fields=product_name,brands,quantity,nutriments,additives_tags,additives_n,ingredients_text,ingredients_text_ar,nova_group,nutriscore_grade,serving_size,image_small_url,allergens_tags";
    const res = await fetch(url, { headers: { Accept: "application/json", "User-Agent": "BodyOSSim/1.0 (educational)" } });
    if (!res.ok) throw new Error("OFF HTTP " + res.status);
    const j = await res.json();
    if (j.status !== 1 || !j.product) throw new Error("الباركود غير موجود في Open Food Facts");
    return j.product;
  }
  function n(obj, key) {
    const v = obj && obj[key];
    return typeof v === "number" ? v : parseFloat(v || 0) || 0;
  }
  function toMeal(prod, grams) {
    const g = grams || 100;
    const k = g / 100;
    const nu = prod.nutriments || {};
    const tags = prod.additives_tags || [];
    const adds = [];
    tags.forEach(function (t) {
      const id = window.parseAdditiveTag(t);
      if (id && window.ADDITIVE_KB[id]) adds.push(Object.assign({ id: id }, window.ADDITIVE_KB[id]));
      else if (id) adds.push({ id: id, cls: "other", ar: id.toUpperCase(), effect: { crp: 0.02 } });
    });
    return {
      name: prod.product_name || "منتج", brands: prod.brands || "", image: prod.image_small_url || "",
      nova: prod.nova_group || null, nutri: prod.nutriscore_grade || "",
      ingredients: prod.ingredients_text_ar || prod.ingredients_text || "",
      additives_n: prod.additives_n || tags.length,
      c: +(n(nu, "carbohydrates_100g") * k).toFixed(1),
      sugars: +(n(nu, "sugars_100g") * k).toFixed(1),
      p: +(n(nu, "proteins_100g") * k).toFixed(1),
      f: +(n(nu, "fat_100g") * k).toFixed(1),
      sat: +(n(nu, "saturated-fat_100g") * k).toFixed(1),
      fiber: +(n(nu, "fiber_100g") * k).toFixed(1),
      na: +(n(nu, "sodium_100g") * k * 1000).toFixed(0) || +(n(nu, "salt_100g") * k * 400).toFixed(0),
      k_mg: +(n(nu, "potassium_100g") * k * 1000).toFixed(0),
      ca: +(n(nu, "calcium_100g") * k * 1000).toFixed(0),
      fe: +(n(nu, "iron_100g") * k * 1000).toFixed(1),
      vitc: +(n(nu, "vitamin-c_100g") * k * 1000).toFixed(1),
      energy: +(n(nu, "energy-kcal_100g") * k).toFixed(0),
      gi: n(nu, "sugars_100g") > 20 ? 72 : n(nu, "fiber_100g") > 6 ? 45 : 58,
      water: 0, tags: ["barcode", (prod.nova_group >= 4 ? "ultra" : "packaged")], additives: adds, grams: g
    };
  }
  function analyze(meal, residue) {
    const lines = [];
    lines.push("ماكرو: كرب " + meal.c + " (سكر " + (meal.sugars || 0) + ") · بروتين " + meal.p + " · دهن " + meal.f + " · ألياف " + meal.fiber + ".");
    lines.push("مايكرو: ناتريوم " + (meal.na || 0) + " مغ · بوتاسيوم " + (meal.k_mg || 0) + " · كالسيوم " + (meal.ca || 0) + " · حديد " + (meal.fe || 0) + ".");
    if (meal.nova >= 4) lines.push("NOVA 4: معالجة فائقة.");
    if (meal.additives && meal.additives.length) lines.push("E: " + meal.additives.map(function (a) { return a.id.toUpperCase() + " " + a.ar; }).join("، ") + ".");
    const res = window.RESIDUE_KB[residue || "none"];
    if (res && res.load) lines.push("بقايا رش: " + res.ar);
    return lines;
  }
  async function scanOnce(video) {
    if (!window.BarcodeDetector) throw new Error("المتصفح لا يدعم BarcodeDetector. اكتب الرقم.");
    const det = new BarcodeDetector({ formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128"] });
    const codes = await det.detect(video);
    if (!codes || !codes.length) return null;
    return codes[0].rawValue;
  }
  return { off: off, toMeal: toMeal, analyze: analyze, scanOnce: scanOnce };
})();
