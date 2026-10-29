/* Cursor = three SHIELD emblems (big -> small), each following a little later; they glow over interactive elements. */
(function () {
  "use strict";
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var sizes = [58, 40, 26], lerps = [0.26, 0.17, 0.1], alphas = [0.95, 0.7, 0.45];
  var dots = sizes.map(function (s, i) {
    var d = document.createElement("div");
    d.className = "cursor-logo";
    d.setAttribute("aria-hidden", "true");
    d.style.width = d.style.height = s + "px";
    d.style.marginLeft = d.style.marginTop = (-s / 2) + "px";
    d.style.opacity = "0";
    document.body.appendChild(d);
    return { el: d, x: -100, y: -100, k: lerps[i], a: alphas[i] };
  });
  var tx = -100, ty = -100, moving = false, idle, running = false, hot = false;
  var HOT = "a,button,.btn,.service-card,.price-card,.ajax-card,.process-card,.stat-card,.logo-card,.location-card,.review-card,.faq-item,summary,[role=button],.social-circle,.nav-toggle,input,select,textarea,label";
  var lastScroll = 0;
  function scrolled() { lastScroll = performance.now(); moving = false; dots.forEach(function (d) { d.el.style.opacity = 0; }); }
  window.addEventListener("scroll", scrolled, { passive: true });
  window.addEventListener("wheel", scrolled, { passive: true });
  window.addEventListener("touchmove", scrolled, { passive: true });
  function loop() {
    var busy = false;
    dots.forEach(function (d) {
      d.x += (tx - d.x) * d.k; d.y += (ty - d.y) * d.k;
      d.el.style.transform = "translate(" + d.x.toFixed(1) + "px," + d.y.toFixed(1) + "px)";
      d.el.style.opacity = (moving && performance.now() - lastScroll > 450) ? d.a : 0;
      if (Math.abs(tx - d.x) > 0.3 || Math.abs(ty - d.y) > 0.3) busy = true;
    });
    if (busy || moving) requestAnimationFrame(loop); else running = false;
  }
  window.addEventListener("pointermove", function (e) {
    tx = e.clientX; ty = e.clientY;
    if (dots[0].x < 0) dots.forEach(function (d) { d.x = tx; d.y = ty; });
    var h = !!(e.target.closest && e.target.closest(HOT));
    if (h !== hot) { hot = h; dots.forEach(function (d) { d.el.classList.toggle("hot", h); }); }
    if (performance.now() - lastScroll < 450) return;
    moving = true;
    clearTimeout(idle);
    idle = setTimeout(function () { moving = false; }, 900);
    if (!running) { running = true; requestAnimationFrame(loop); }
  }, { passive: true });
  document.addEventListener("pointerleave", function () { moving = false; });
})();
