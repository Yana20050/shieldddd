/* Camera HUD over the hero video; the video "powers on" when the intro is gone. */
(function () {
  "use strict";
  var hero = document.querySelector(".hero-media");
  var video = document.querySelector(".hero-video");
  if (!hero || !video) return;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var hud = document.createElement("div");
  hud.className = "hud";
  hud.setAttribute("aria-hidden", "true");
  hud.innerHTML =
    '<i class="hud-c tl"></i><i class="hud-c tr"></i><i class="hud-c bl"></i><i class="hud-c br"></i>' +
    '<div class="hud-t tl"><span class="hud-rec"></span>REC · CAM 01<span class="hud-sub" id="hudSig">Сигнал…</span></div>' +
    '<div class="hud-t tr"><span id="hudTime">00:00:00</span><span class="hud-sub" id="hudDate"></span></div>' +
    '<div class="hud-t bl">Зона 1 · датчики активні</div>';
  hero.appendChild(hud);

  if (reduced) { hero.classList.add("hud-on"); return; }
  hero.classList.add("hud-pre");
  try { var pp = video.play(); if (pp && pp.catch) pp.catch(function () {}); } catch (e) {}

  var timeEl = hud.querySelector("#hudTime"), dateEl = hud.querySelector("#hudDate");
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function tick() {
    var d = new Date();
    timeEl.textContent = pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
    dateEl.textContent = pad(d.getDate()) + "." + pad(d.getMonth() + 1) + "." + d.getFullYear();
  }
  tick();
  setInterval(function () { if (!document.hidden) tick(); }, 1000);

  var started = false;
  function start() {
    if (started) return;
    started = true;
    
    try { video.currentTime = 0; video.play(); } catch (e) {}
    hero.classList.remove("hud-pre");
    hero.classList.add("hud-on");
    // "signal acquired" is typed a moment later
    var sig = hud.querySelector("#hudSig"), txt = "Сигнал отримано", n = 0;
    setTimeout(function () {
      var iv = setInterval(function () { n++; sig.textContent = txt.slice(0, n); if (n >= txt.length) clearInterval(iv); }, 45);
    }, 1200);
  }

  if (document.querySelector(".holo")) {
    window.addEventListener("holo:done", start, { once: true });
    setTimeout(start, 13500); // safety net
  } else {
    setTimeout(start, 350);
  }
})();
