(function () {
  const box = document.getElementById("path");
  if (!box) return;
  function paint() {
    const s = window.__state;
    if (!s || !window.ENGINE || !ENGINE.pathSteps) return;
    box.innerHTML = ENGINE.pathSteps(s).map(function (st) {
      return '<div class="step' + (st.on ? " on" : "") + '"><b>' + st.n + "</b><span>" + st.ar + "</span></div>";
    }).join("");
  }
  setInterval(paint, 1200);
  paint();
})();
