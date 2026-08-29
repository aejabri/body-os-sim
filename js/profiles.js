window.PROFILES = [
  { id: "predm_vat", ar: "مقدّمات + LDL + حشوي", en: "Predm+VAT", blurb: "سكر صائم وLDL وVAT مرتفعة.", p: { age: 48, sex: "M", bmi: 31, beta: 0.7, sens: 0.55, hgo: 1.2, residual: 0.8, egfr: 90, sbp: 138, a1c: 6.1, fat: 28, ketones: 0.2, smoker: 0, t1: 0, ldl: 178, hdl: 36, tg: 210, vat: 17 } },
  { id: "healthy", ar: "بالغ سليم", en: "Healthy", blurb: "إفراز وحساسية محفوظان.", p: { age: 35, sex: "M", bmi: 23, beta: 1, sens: 1, hgo: 1, residual: 1, egfr: 100, sbp: 118, a1c: 5.2, fat: 14, ketones: 0.2, smoker: 0, t1: 0 } },
  { id: "predm", ar: "مقدّمات سكري", en: "Prediabetes", blurb: "سكر صائم مرتفع قليلًا مع بقاء إفراز.", p: { age: 46, sex: "M", bmi: 29, beta: 0.75, sens: 0.62, hgo: 1.15, residual: 0.85, egfr: 92, sbp: 132, a1c: 6.0, fat: 24, ketones: 0.2, smoker: 0, t1: 0 } },
  { id: "t2oral", ar: "نوع 2 — أقراص", en: "T2 oral", blurb: "مقاومة + متفورمين.", p: { age: 54, sex: "F", bmi: 32, beta: 0.45, sens: 0.45, hgo: 1.35, residual: 0.5, egfr: 85, sbp: 138, a1c: 7.4, fat: 32, ketones: 0.15, smoker: 0, t1: 0, metformin: 1 } },
  { id: "t2ins", ar: "نوع 2 — إنسولين", en: "T2 insulin", blurb: "إفراز ضعيف.", p: { age: 61, sex: "M", bmi: 31, beta: 0.22, sens: 0.4, hgo: 1.4, residual: 0.22, egfr: 72, sbp: 144, a1c: 8.6, fat: 30, ketones: 0.2, smoker: 0, t1: 0, insulinU: 28 } },
  { id: "t1", ar: "نوع 1", en: "T1", blurb: "إيقاف الإنسولين يفتح مسار حماض.", p: { age: 19, sex: "F", bmi: 21, beta: 0.02, sens: 1.05, hgo: 1.2, residual: 0.02, egfr: 108, sbp: 112, a1c: 7.8, fat: 16, ketones: 0.3, smoker: 0, t1: 1, insulinU: 36 } },
  { id: "ckd", ar: "سكري + كلى 3", en: "CKD3", blurb: "تصفية منخفضة.", p: { age: 67, sex: "M", bmi: 28, beta: 0.35, sens: 0.5, hgo: 1.25, residual: 0.4, egfr: 48, sbp: 148, a1c: 7.9, fat: 26, ketones: 0.2, smoker: 0, t1: 0, acei: 1 } },
  { id: "htn", ar: "ضغط مرتفع", en: "HTN", blurb: "صوديوم وماء يحرّكان الضغط.", p: { age: 50, sex: "M", bmi: 27, beta: 0.9, sens: 0.8, hgo: 1.05, residual: 0.9, egfr: 88, sbp: 152, a1c: 5.5, fat: 22, ketones: 0.2, smoker: 1, t1: 0, acei: 1 } },
  { id: "obese", ar: "سمنة / مقاومة", en: "Obesity", blurb: "حساسية منخفضة.", p: { age: 41, sex: "F", bmi: 36, beta: 1.1, sens: 0.38, hgo: 1.2, residual: 1.1, egfr: 96, sbp: 134, a1c: 5.8, fat: 38, ketones: 0.15, smoker: 0, t1: 0 } }
];
window.PROTOCOLS = [
  { id: "med", ar: "متوسطي", meal: { c: 45, p: 28, f: 22, fiber: 10, gi: 48, water: 350, tags: ["veg"] } },
  { id: "dash", ar: "DASH", meal: { c: 50, p: 25, f: 16, fiber: 12, gi: 50, water: 400, tags: ["veg"] } },
  { id: "keto", ar: "منخفض كرب", meal: { c: 8, p: 30, f: 40, fiber: 4, gi: 25, water: 300, tags: ["fat"] } },
  { id: "balanced", ar: "متوازن", meal: { c: 55, p: 22, f: 18, fiber: 8, gi: 55, water: 300, tags: ["mix"] } },
  { id: "sugary", ar: "نشا + سكر", meal: { c: 95, p: 12, f: 28, fiber: 2, gi: 78, water: 150, tags: ["sugar"] } },
  { id: "fast", ar: "ماء فقط", meal: { c: 0, p: 0, f: 0, fiber: 0, gi: 0, water: 250, tags: ["fast"] } }
];
