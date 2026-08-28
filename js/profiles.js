window.PROFILES = [
  { id: "healthy", ar: "بالغ سليم", en: "Healthy adult", blurb: "إفراز إنسولين محفوظ وحساسية طبيعية. مرجع للمقارنة.", p: { age: 35, sex: "M", bmi: 23, beta: 1, sens: 1, hgo: 1, residual: 1, egfr: 100, sbp: 118, a1c: 5.2, fat: 14, ketones: 0.2, smoker: 0, t1: 0 } },
  { id: "predm", ar: "مقدّمات سكري", en: "Prediabetes", blurb: "سكر صائم 110–125. مقاومة إنسولين مبكرة مع بقاء إفراز.", p: { age: 46, sex: "M", bmi: 29, beta: 0.75, sens: 0.62, hgo: 1.15, residual: 0.85, egfr: 92, sbp: 132, a1c: 6.0, fat: 24, ketones: 0.2, smoker: 0, t1: 0 } },
  { id: "t2oral", ar: "سكري نوع 2 — أقراص", en: "T2DM on metformin", blurb: "مقاومة أعلى وإنتاج كبدي زائد. متفورمين يخفض إنتاج الكبد للجلوكوز.", p: { age: 54, sex: "F", bmi: 32, beta: 0.45, sens: 0.45, hgo: 1.35, residual: 0.5, egfr: 85, sbp: 138, a1c: 7.4, fat: 32, ketones: 0.15, smoker: 0, t1: 0, metformin: 1 } },
  { id: "t2ins", ar: "سكري نوع 2 — إنسولين", en: "T2DM on insulin", blurb: "إفراز ذاتي ضعيف. الإيقاف يرفع السكر لكنه أقل عرضة للحماض من النوع 1.", p: { age: 61, sex: "M", bmi: 31, beta: 0.22, sens: 0.4, hgo: 1.4, residual: 0.22, egfr: 72, sbp: 144, a1c: 8.6, fat: 30, ketones: 0.2, smoker: 0, t1: 0, insulinU: 28 } },
  { id: "t1", ar: "سكري نوع 1", en: "Type 1 diabetes", blurb: "لا إفراز ذاتي يُعتد به. إيقاف الإنسولين يفتح مسار الحماض الكيتوني خلال ساعات إلى يومين.", p: { age: 19, sex: "F", bmi: 21, beta: 0.02, sens: 1.05, hgo: 1.2, residual: 0.02, egfr: 108, sbp: 112, a1c: 7.8, fat: 16, ketones: 0.3, smoker: 0, t1: 1, insulinU: 36 } },
  { id: "ckd", ar: "سكري + كلى مرحلة 3", en: "T2DM + CKD3", blurb: "تصفية منخفضة. حمل بروتين عالٍ وجفاف يرفعان الضغط على النفرون.", p: { age: 67, sex: "M", bmi: 28, beta: 0.35, sens: 0.5, hgo: 1.25, residual: 0.4, egfr: 48, sbp: 148, a1c: 7.9, fat: 26, ketones: 0.2, smoker: 0, t1: 0, metformin: 0, acei: 1 } },
  { id: "htn", ar: "ضغط مرتفع", en: "Hypertension", blurb: "صوديوم عالٍ ومياه قليلة يرفعان الحجم والضغط.", p: { age: 50, sex: "M", bmi: 27, beta: 0.9, sens: 0.8, hgo: 1.05, residual: 0.9, egfr: 88, sbp: 152, a1c: 5.5, fat: 22, ketones: 0.2, smoker: 1, t1: 0, acei: 1 } },
  { id: "obese", ar: "سمنة ومقاومة إنسولين", en: "Obesity / IR", blurb: "كتلة شحمية عالية وحساسية منخفضة.", p: { age: 41, sex: "F", bmi: 36, beta: 1.1, sens: 0.38, hgo: 1.2, residual: 1.1, egfr: 96, sbp: 134, a1c: 5.8, fat: 38, ketones: 0.15, smoker: 0, t1: 0 } }
];
window.PROTOCOLS = [
  { id: "med", ar: "نمط متوسطي", en: "Mediterranean", meal: { c: 45, p: 28, f: 22, fiber: 10, gi: 48, water: 350, tags: ["veg", "olive", "fish"] } },
  { id: "dash", ar: "DASH", en: "DASH", meal: { c: 50, p: 25, f: 16, fiber: 12, gi: 50, water: 400, tags: ["veg", "lowna"] } },
  { id: "keto", ar: "منخفض كربوهيدرات", en: "Low-carb / keto-like", meal: { c: 8, p: 30, f: 40, fiber: 4, gi: 25, water: 300, tags: ["fat"] } },
  { id: "balanced", ar: "وجبة متوازنة", en: "Balanced plate", meal: { c: 55, p: 22, f: 18, fiber: 8, gi: 55, water: 300, tags: ["mix"] } },
  { id: "sugary", ar: "نشا + سكر − خضار", en: "Starch + sugar, low veg", meal: { c: 95, p: 12, f: 28, fiber: 2, gi: 78, water: 150, tags: ["sugar", "lowfiber"] } },
  { id: "fast", ar: "صيام / ماء فقط", en: "Water-only fast", meal: { c: 0, p: 0, f: 0, fiber: 0, gi: 0, water: 250, tags: ["fast"] } }
];
