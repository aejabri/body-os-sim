window.ADDITIVE_KB = {
  e322: { cls: "emulsifier", ar: "ليسيثين", effect: { gut: 0.05, crp: 0.02 } },
  e471: { cls: "emulsifier", ar: "مونو/دي غليسريد", effect: { gut: 0.12, crp: 0.08, motil: -0.05 } },
  e433: { cls: "emulsifier", ar: "بولي سوربات 80", effect: { gut: 0.2, crp: 0.15, motil: -0.08 } },
  e407: { cls: "emulsifier", ar: "كارجينان", effect: { gut: 0.18, crp: 0.12 } },
  e250: { cls: "nitrite", ar: "نيتريت صوديوم", effect: { crp: 0.1, kidney: 0.08 } },
  e251: { cls: "nitrite", ar: "نترات صوديوم", effect: { crp: 0.08, kidney: 0.06 } },
  e621: { cls: "flavor", ar: "غلوتامات", effect: { na: 80, hist: 0.1 } },
  e951: { cls: "sweetener", ar: "أسبرتام", effect: { incretin: 0.05, crp: 0.04 } },
  e955: { cls: "sweetener", ar: "سكرالوز", effect: { incretin: 0.06, gut: 0.08 } },
  e950: { cls: "sweetener", ar: "أسيسلفام K", effect: { incretin: 0.04 } },
  e102: { cls: "color", ar: "تارترازين", effect: { hist: 0.15, crp: 0.05 } },
  e110: { cls: "color", ar: "أصفر غروب", effect: { hist: 0.12 } },
  e129: { cls: "color", ar: "أحمر أللورا", effect: { hist: 0.12 } },
  e211: { cls: "preservative", ar: "بنزوات صوديوم", effect: { hist: 0.08, crp: 0.04 } },
  e320: { cls: "antiox", ar: "BHA", effect: { crp: 0.06, liver: 0.05 } },
  e321: { cls: "antiox", ar: "BHT", effect: { crp: 0.06, liver: 0.05 } },
  e339: { cls: "phosphate", ar: "فوسفات صوديوم", effect: { kidney: 0.1, na: 40 } },
  e452: { cls: "phosphate", ar: "بولي فوسفات", effect: { kidney: 0.12 } }
};
window.RESIDUE_KB = {
  none: { ar: "لا افتراض رش", load: 0 },
  washed: { ar: "منتج زراعي مغسول", load: 0.15, cls: "mix" },
  conventional: { ar: "زراعة تقليدية — طبقة تعليمية", load: 0.45, cls: "mix" },
  op: { ar: "فئة فوسفور عضوي", load: 0.8, cls: "op" },
  pyrethroid: { ar: "فئة بيرثرويد", load: 0.55, cls: "pyr" },
  glyphosate: { ar: "غليفوسات", load: 0.4, cls: "gly" }
};
window.parseAdditiveTag = function (tag) {
  const m = String(tag).toLowerCase().match(/e(\d{3,4}[a-z]?)/);
  return m ? "e" + m[1] : null;
};
