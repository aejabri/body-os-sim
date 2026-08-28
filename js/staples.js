window.STAPLES = [
  { q: ["تمر", "dates"], name: "تمر", c: 75, sugars: 63, p: 2, f: 0.4, fiber: 8, gi: 42, na: 2, k_mg: 650, tags: ["fruit"] },
  { q: ["عسل", "honey"], name: "عسل", c: 82, sugars: 82, p: 0.3, f: 0, fiber: 0, gi: 58, na: 4, tags: ["sugar"] },
  { q: ["سكر", "sugar"], name: "سكر أبيض", c: 100, sugars: 100, p: 0, f: 0, fiber: 0, gi: 80, na: 0, tags: ["sugar"] },
  { q: ["أرز", "rice", "رز"], name: "أرز مطبوخ", c: 28, sugars: 0, p: 2.7, f: 0.3, fiber: 0.4, gi: 73, na: 1, tags: ["starch"] },
  { q: ["خبز أبيض", "white bread", "توست"], name: "خبز أبيض", c: 49, sugars: 5, p: 9, f: 3.2, fiber: 2.7, gi: 75, na: 490, tags: ["starch"] },
  { q: ["دجاج", "chicken"], name: "دجاج مشوي", c: 0, sugars: 0, p: 31, f: 3.6, fiber: 0, gi: 0, na: 74, tags: ["protein"] },
  { q: ["بيض", "egg"], name: "بيض", c: 1.1, sugars: 1, p: 13, f: 11, fiber: 0, gi: 0, na: 124, tags: ["protein"] },
  { q: ["حليب", "milk"], name: "حليب كامل", c: 5, sugars: 5, p: 3.3, f: 3.3, fiber: 0, gi: 30, na: 44, ca: 120, tags: ["dairy"] },
  { q: ["لبن", "yogurt"], name: "لبن", c: 4.7, sugars: 4.7, p: 3.5, f: 3.3, fiber: 0, gi: 35, na: 46, ca: 120, tags: ["dairy"] },
  { q: ["بطاطس", "potato"], name: "بطاطس مسلوقة", c: 20, sugars: 0.8, p: 2, f: 0.1, fiber: 1.8, gi: 78, na: 6, k_mg: 425, tags: ["starch"] },
  { q: ["بطاطس مقلية", "fries"], name: "بطاطس مقلية", c: 41, sugars: 0.3, p: 3.4, f: 15, fiber: 3.8, gi: 75, na: 210, tags: ["ultra", "starch"] },
  { q: ["تفاح", "apple"], name: "تفاح", c: 14, sugars: 10, p: 0.3, f: 0.2, fiber: 2.4, gi: 38, na: 1, tags: ["fruit", "veg"] },
  { q: ["موز", "banana"], name: "موز", c: 23, sugars: 12, p: 1.1, f: 0.3, fiber: 2.6, gi: 51, na: 1, k_mg: 358, tags: ["fruit"] },
  { q: ["زيت زيتون", "olive oil"], name: "زيت زيتون", c: 0, sugars: 0, p: 0, f: 100, fiber: 0, gi: 0, na: 2, tags: ["fat"] },
  { q: ["كولا", "cola", "بيبسي"], name: "مشروب غازي", c: 10.6, sugars: 10.6, p: 0, f: 0, fiber: 0, gi: 63, na: 4, tags: ["sugar"] },
  { q: ["نوتيلا", "nutella"], name: "نوتيلا", c: 57, sugars: 57, p: 6, f: 31, fiber: 0, gi: 70, na: 40, tags: ["sugar", "ultra"] },
  { q: ["كبسة", "kabsa", "مندي"], name: "كبسة/مندي", c: 32, sugars: 2, p: 18, f: 12, fiber: 1.5, gi: 68, na: 480, tags: ["mix"] },
  { q: ["سلطة", "salad"], name: "سلطة", c: 4, sugars: 2, p: 1.2, f: 0.2, fiber: 2.2, gi: 15, na: 20, tags: ["veg"] }
];
window.matchStaple = function (text) {
  const t = String(text || "").toLowerCase().trim();
  if (!t) return null;
  return window.STAPLES.find(function (s) {
    return s.q.some(function (q) { return t.indexOf(q.toLowerCase()) >= 0; });
  }) || null;
};
window.stapleToMeal = function (s, grams) {
  const k = (grams || 100) / 100;
  return { name: s.name, brands: "مرجع شائع", image: "", nova: s.tags.indexOf("ultra") >= 0 ? 4 : 1, nutri: "", ingredients: s.name, additives_n: 0, c: +(s.c * k).toFixed(1), sugars: +((s.sugars || 0) * k).toFixed(1), p: +(s.p * k).toFixed(1), f: +(s.f * k).toFixed(1), sat: 0, fiber: +(s.fiber * k).toFixed(1), na: Math.round((s.na || 0) * k), k_mg: Math.round((s.k_mg || 0) * k), ca: Math.round((s.ca || 0) * k), fe: 0, energy: 0, gi: s.gi, water: 0, tags: s.tags.concat(["staple"]), additives: [], grams: grams || 100 };
};
