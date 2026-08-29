(function () {
  function readState(s) {
    s = s || window.__state || {};
    const life = s.life || {};
    const p = s.p || {};
    const glu = +(s.glucose || 100);
    const vat = +(s.vat || 8);
    const fat = +(s.fat || 18);
    const sbp = +(s.sbp || life.sbpNow || 120);
    const dnl = +(s.dnl || 0.1);
    const egfr = +(s.egfr || 90);
    const ket = +(s.ketones || 0.2);
    const ldl = +(s.ldl || 110);
    const tg = +(s.tg || 140);
    const sex = life.sex || p.sex || "M";
    const age = +(life.age || p.age || 40);
    const w = +(life.weight || 78);
    const h = 1.72;
    const bmi = +(p.bmi || (w / (h * h))).toFixed(1);
    return {
      t: +(s.t || 0), sex: sex, age: age, weight: w, bmi: +bmi,
      glu: glu, vat: vat, sat: fat, sbp: sbp, dnl: dnl, egfr: egfr,
      ket: ket, ldl: ldl, tg: tg, water: +(s.water || 2),
      female: sex === "F",
      liverHot: dnl > 0.35 || vat > 14,
      heartHot: sbp > 140,
      kidneyHot: egfr < 60 || glu > 180,
      vatHot: vat > 14,
      satHot: fat > 28,
      gluHot: glu > 140,
      dka: ket > 3 && glu > 250
    };
  }
  function tone(hot, mid, cool) {
    if (hot) return "#e24b4b";
    if (mid) return "#e0a53a";
    return cool || "#3ecfbf";
  }
  function label(ctx, text, x, y, color) {
    ctx.fillStyle = color || "#d7e6ee";
    ctx.font = "600 13px 'IBM Plex Sans Arabic', sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(text, x, y);
  }
  function blob(ctx, x, y, rx, ry, color, a) {
    ctx.save();
    ctx.globalAlpha = a == null ? 0.9 : a;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  function drawFrame(canvas, s, seed) {
    const c = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    const st = readState(s);
    const rnd = (function (n) {
      let x = (n || 1) * 99991;
      return function () { x = (x * 16807) % 2147483647; return (x - 1) / 2147483646; };
    })(seed || (st.t + 1));
    c.clearRect(0, 0, W, H);
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#102433");
    g.addColorStop(1, "#071018");
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
    const cx = W * 0.46;
    const waist = 42 + (st.bmi - 22) * 2.2 + st.vat * 1.1;
    const hip = 48 + (st.female ? 10 : 2) + st.sat * 0.55;
    const chest = st.female ? 50 + st.sat * 0.25 : 46 + (st.bmi - 22) * 0.6;
    const skin = st.female ? "#c9a07a" : "#b88862";
    const skinDark = st.female ? "#a87858" : "#8f6544";
    c.fillStyle = skin;
    c.beginPath();
    c.ellipse(cx, 78, 28, 34, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = skinDark;
    c.fillRect(cx - 10, 108, 20, 16);
    c.fillStyle = skin;
    c.beginPath();
    c.moveTo(cx - chest * 0.55, 128);
    c.quadraticCurveTo(cx, 118, cx + chest * 0.55, 128);
    c.lineTo(cx + waist * 0.55, 250);
    c.quadraticCurveTo(cx, 268, cx - waist * 0.55, 250);
    c.closePath();
    c.fill();
    c.beginPath();
    c.moveTo(cx - waist * 0.5, 248);
    c.quadraticCurveTo(cx - hip * 0.7, 278, cx - 22, 320);
    c.lineTo(cx - 8, 320);
    c.lineTo(cx, 262);
    c.lineTo(cx + 8, 320);
    c.lineTo(cx + 22, 320);
    c.quadraticCurveTo(cx + hip * 0.7, 278, cx + waist * 0.5, 248);
    c.closePath();
    c.fill();
    c.fillStyle = skinDark;
    c.fillRect(cx - 26, 318, 16, 92);
    c.fillRect(cx + 10, 318, 16, 92);
    const satW = 10 + st.sat * 0.35;
    c.fillStyle = "rgba(232, 176, 92, 0.45)";
    c.beginPath();
    c.ellipse(cx - waist * 0.62, 210, satW, 58, 0.15, 0, Math.PI * 2);
    c.ellipse(cx + waist * 0.62, 210, satW, 58, -0.15, 0, Math.PI * 2);
    c.fill();
    const vatR = 18 + st.vat * 1.15;
    blob(c, cx, 232, vatR, 16 + st.vat * 0.35, st.vatHot ? "#c62828" : "#d35400", 0.55 + st.vat / 40);
    blob(c, cx - 26, 178, 22 + st.dnl * 10, 14 + st.dnl * 6, st.liverHot ? "#c0392b" : "#b86a2a", 0.92);
    blob(c, cx + 8, 168, 11, 9, st.heartHot ? "#ff5d5d" : "#8e2b2b", 0.95);
    blob(c, cx + 22, 196, 10, 7, st.gluHot ? "#f0b429" : "#d4a017", 0.9);
    blob(c, cx - 18, 248, 9, 13, st.kidneyHot ? "#ff7a7a" : "#c97b7b", 0.9);
    blob(c, cx + 18, 248, 9, 13, st.kidneyHot ? "#ff7a7a" : "#c97b7b", 0.9);
    for (let i = 0; i < 8; i++) {
      const a = rnd();
      blob(c, cx - 8 + a * 18, 220 + rnd() * 24, 3 + rnd() * 4, 2 + rnd() * 3, "#e67e22", 0.25 + st.dnl * 0.4);
    }
    c.fillStyle = "rgba(7,16,24,0.72)";
    c.fillRect(W - 210, 16, 194, 168);
    c.strokeStyle = "#1e3a4a";
    c.strokeRect(W - 210, 16, 194, 168);
    c.fillStyle = "#3ecfbf";
    c.font = "700 14px 'IBM Plex Sans Arabic', sans-serif";
    c.textAlign = "right";
    c.fillText("صورة حالة المحاكاة", W - 28, 38);
    c.fillStyle = "#d7e6ee";
    c.font = "12px 'IBM Plex Sans Arabic', sans-serif";
    const lines = [
      (st.female ? "أنثى" : "ذكر") + " · " + st.age + " سنة · BMI " + st.bmi,
      "ساعة المحاكاة: " + st.t,
      "سكر " + Math.round(st.glu) + " · إنسولين/حمل " + (st.gluHot ? "مرتفع" : "هادئ"),
      "VAT " + st.vat.toFixed(1) + " · SAT " + Math.round(st.sat) + "%",
      "كبد DNL " + st.dnl.toFixed(2) + (st.liverHot ? " نشط" : ""),
      "ضغط " + Math.round(st.sbp) + " · eGFR " + Math.round(st.egfr),
      "LDL " + Math.round(st.ldl) + " · TG " + Math.round(st.tg),
      st.dka ? "تنبيه: اتجاه حموضة كيتونية" : "ليست أشعة وليست تشخيصًا"
    ];
    lines.forEach(function (ln, i) { c.fillText(ln, W - 28, 60 + i * 16); });
    label(c, "قلب", cx + 48, 166, tone(st.heartHot, st.sbp > 130));
    label(c, "كبد", cx - 56, 176, tone(st.liverHot, st.dnl > 0.2));
    label(c, "VAT", cx + 64, 236, tone(st.vatHot, st.vat > 10));
    label(c, "SAT", cx + 88, 200, tone(st.satHot, st.sat > 22));
    c.fillStyle = "#9bb3bf";
    c.font = "11px 'IBM Plex Sans Arabic', sans-serif";
    c.textAlign = "center";
    c.fillText("توليد داخل التطبيق من أرقام المحاكاة — تعليمي فقط", W / 2, H - 14);
    return canvas.toDataURL("image/png");
  }
  function promptFrom(s) {
    const st = readState(s);
    const body = st.female ? "adult woman" : "adult man";
    const fat = st.vatHot ? "visible visceral fat around organs" : "moderate abdominal fat";
    const liver = st.liverHot ? "slightly fatty liver tone" : "healthy liver tone";
    return "educational medical textbook sagittal cutaway illustration of " + body +
      ", age " + st.age + ", BMI " + st.bmi + ", " + fat + ", " + liver +
      ", labeled heart liver visceral fat subcutaneous fat, clean dark clinical background, no gore, no text, anatomy atlas style";
  }
  const gallery = [];
  function showUrl(url, note) {
    const img = document.getElementById("simgen");
    if (img) { img.src = url; img.style.display = "block"; }
    const cap = document.getElementById("simgen-cap");
    if (cap) cap.textContent = note || "صورة مولّدة من حالة المحاكاة الحالية";
  }
  function addThumb(url, title) {
    gallery.unshift({ url: url, title: title, t: Date.now() });
    if (gallery.length > 12) gallery.pop();
    const box = document.getElementById("sim-gallery");
    if (!box) return;
    box.innerHTML = gallery.map(function (g, i) {
      return '<button class="gthumb" data-i="' + i + '"><img src="' + g.url + '" alt=""/><span>' + g.title + "</span></button>";
    }).join("");
  }
  function canvasSnap(title) {
    const cv = document.getElementById("simcanvas");
    if (!cv) return null;
    const url = drawFrame(cv, window.__state, Date.now() % 99991);
    showUrl(url, title || ("إطار الساعة " + ((window.__state && window.__state.t) || 0)));
    addThumb(url, title || ("س" + ((window.__state && window.__state.t) || 0)));
    return url;
  }
  function regenCanvas() {
    return canvasSnap("إعادة توليد · س" + ((window.__state && window.__state.t) || 0));
  }
  function regenAI() {
    const st = readState(window.__state);
    const seed = Math.floor(Math.random() * 99999);
    const q = encodeURIComponent(promptFrom(window.__state));
    const url = "https://image.pollinations.ai/prompt/" + q + "?width=768&height=1024&nologo=true&seed=" + seed + "&model=flux";
    const img = document.getElementById("simgen");
    const cap = document.getElementById("simgen-cap");
    if (cap) cap.textContent = "جاري توليد صورة من وصف الحالة (قد يستغرق ثوانٍ)…";
    if (img) {
      img.style.opacity = "0.45";
      img.onload = function () { img.style.opacity = "1"; addThumb(url, "AI س" + st.t); if (cap) cap.textContent = "صورة مولّدة حسب الحالة — تعليمي، ليست أشعة"; };
      img.onerror = function () { if (cap) cap.textContent = "تعذّر التوليد الشبكي — أُعيد الرسم المحلي"; regenCanvas(); };
      img.src = url;
      img.style.display = "block";
    }
  }
  function download() {
    const img = document.getElementById("simgen");
    if (!img || !img.src) return;
    const a = document.createElement("a");
    a.href = img.src;
    a.download = "body-os-sim-t" + ((window.__state && window.__state.t) || 0) + ".png";
    a.click();
  }
  let lastSnapT = -99;
  function paintAuto() {
    const cv = document.getElementById("simcanvas");
    if (!cv) return;
    const tNow = (window.__state && window.__state.t) || 0;
    const url = drawFrame(cv, window.__state, tNow + 17);
    const img = document.getElementById("simgen");
    if (img && (!img.dataset.lock || img.dataset.lock === "auto")) {
      img.src = url;
      img.style.display = "block";
      img.dataset.lock = "auto";
    }
    const cap = document.getElementById("simgen-cap");
    if (cap && img && img.dataset.lock === "auto") {
      cap.textContent = "تحديث تلقائي لصورة الحالة · الساعة " + tNow;
    }
    if (tNow === 0 && lastSnapT !== 0) { lastSnapT = 0; addThumb(url, "بداية س0"); }
    else if (tNow - lastSnapT >= 24) { lastSnapT = tNow; addThumb(url, "س" + tNow); }
  }
  function wire() {
    const g = document.getElementById("sim-gallery");
    if (g) g.onclick = function (e) {
      const b = e.target.closest(".gthumb");
      if (!b) return;
      const item = gallery[+b.dataset.i];
      if (item) showUrl(item.url, item.title);
    };
    const b1 = document.getElementById("btn-gen-local");
    const b2 = document.getElementById("btn-gen-ai");
    const b3 = document.getElementById("btn-gen-dl");
    const b4 = document.getElementById("btn-gen-shot");
    if (b1) b1.onclick = function () { const img = document.getElementById("simgen"); if (img) img.dataset.lock = "manual"; regenCanvas(); };
    if (b2) b2.onclick = function () { const img = document.getElementById("simgen"); if (img) img.dataset.lock = "manual"; regenAI(); };
    if (b3) b3.onclick = download;
    if (b4) b4.onclick = function () { const img = document.getElementById("simgen"); if (img) img.dataset.lock = "manual"; canvasSnap("لقطة س" + ((window.__state && window.__state.t) || 0)); };
    const tabs = document.getElementById("viewtabs");
    if (tabs) {
      const old = tabs.onclick;
      tabs.onclick = function (e) {
        if (typeof old === "function") old(e);
        const b = e.target.closest("[data-v]");
        if (!b) return;
        const pane = document.getElementById("simimg-pane");
        if (pane) pane.style.display = b.dataset.v === "img" ? "block" : "none";
        const svg = document.getElementById("body");
        const d3 = document.getElementById("body3d");
        if (b.dataset.v === "img") {
          if (svg) svg.style.display = "none";
          if (d3) d3.style.display = "none";
          paintAuto();
        }
      };
    }
  }
  window.SIMIMG = { drawFrame: drawFrame, paint: paintAuto, snap: canvasSnap, regen: regenCanvas, regenAI: regenAI, promptFrom: promptFrom };
  const prev = window.__forceRender;
  window.__forceRender = function () {
    if (prev) prev();
    paintAuto();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wire);
  else wire();
  setTimeout(paintAuto, 260);
})();
