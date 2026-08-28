(function () {
  const $ = function (id) { return document.getElementById(id); };
  if (!$("btn-lookup")) return;
  let stream = null, scanTimer = null;
  function setStatus(t) { $("scan-status").textContent = t; }
  async function loadCode(code) {
    setStatus("جلب Open Food Facts… " + code);
    try {
      const prod = await LOOKUP.off(code);
      const meal = LOOKUP.toMeal(prod, +$("grams").value || 100);
      $("mc").value = meal.c; $("mp").value = meal.p; $("mf").value = meal.f;
      $("mfi").value = meal.fiber; $("mgi").value = meal.gi;
      window._scannedMeal = meal;
      $("scan-card").innerHTML = (meal.image ? "<img alt='' src='" + meal.image + "'/>" : "") +
        "<div><b>" + meal.name + "</b><div class='mute'>" + meal.brands + " · NOVA " + (meal.nova || "?") +
        "</div><div>" + LOOKUP.analyze(meal, $("residue").value).join("<br/>") + "</div></div>";
      setStatus("جاهز. أدخل الوجبة لتشغيل السلاسل.");
    } catch (e) { setStatus(String(e.message || e)); }
  }
  $("btn-lookup").onclick = function () {
    const code = ($("barcode").value || "").replace(/\s/g, "");
    if (!code) { setStatus("أدخل باركودًا أو امسح."); return; }
    loadCode(code);
  };
  $("btn-cam").onclick = async function () {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      const v = $("cam"); v.srcObject = stream; await v.play();
      $("cam-wrap").classList.add("on");
      setStatus("وجّه الكاميرا لـ EAN…");
      scanTimer = setInterval(async function () {
        try {
          const val = await LOOKUP.scanOnce(v);
          if (val) { $("barcode").value = val; stopCam(); await loadCode(val); }
        } catch (err) { setStatus(String(err.message || err)); stopCam(); }
      }, 700);
    } catch (e) { setStatus("الكاميرا مرفوضة. اكتب الرقم."); }
  };
  $("btn-cam-stop").onclick = stopCam;
  function stopCam() {
    if (scanTimer) clearInterval(scanTimer);
    scanTimer = null;
    if (stream) stream.getTracks().forEach(function (t) { t.stop(); });
    stream = null;
    $("cam-wrap").classList.remove("on");
  }
})();
