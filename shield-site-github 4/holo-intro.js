/* Hologram agency intro: spinning hologram emblem, HUD rings, radar, status lines, then the hologram disintegrates. */
(function () {
  "use strict";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var seen = false;
  try { seen = sessionStorage.getItem("holoIntro") === "1"; } catch (e) {}
  if (seen && !/[?&]intro=1/.test(location.search)) return;

  var root = document.createElement("div");
  root.className = "holo";
  var rings = '<svg class="holo-rings" viewBox="-300 -300 600 600" aria-hidden="true">' +
    '<circle class="rg r1" r="285"/><circle class="rg r2" r="248"/><circle class="rg r3" r="212"/>' +
    '<circle class="rg r4" r="180"/><circle class="rg r5" r="146"/></svg>';
  var blips = "";
  [[28, 30], [70, 24], [78, 62], [40, 76], [22, 58]].forEach(function (p, i) {
    blips += '<i class="holo-blip" style="left:' + p[0] + '%;top:' + p[1] + '%;animation-delay:' + (1.4 + i * 0.5) + 's"></i>';
  });

  // map of Ukraine (lon/lat -> svg)
  var MAIN = [[31.79,52.1],[32.16,52.06],[32.41,52.29],[32.72,52.24],[33.75,52.34],[34.39,51.77],[34.14,51.57],[34.22,51.26],[35.02,51.21],[35.38,50.77],[35.36,50.58],[36.63,50.23],[37.39,50.38],[38.01,49.92],[38.59,49.93],[40.07,49.6],[40.08,49.31],[39.67,48.78],[39.9,48.23],[39.74,47.9],[38.77,47.83],[38.26,47.55],[38.22,47.1],[37.43,47.02],[36.76,46.7],[35.82,46.65],[34.96,46.27],[35.02,45.65],[35.51,45.41],[36.53,45.47],[36.33,45.11],[35.24,44.94],[33.88,44.36],[33.33,44.56],[33.55,45.03],[32.45,45.33],[32.63,45.52],[33.59,45.85],[33.3,46.08],[31.74,46.33],[31.68,46.71],[30.75,46.58],[30.38,46.03],[29.6,45.29],[29.15,45.46],[28.68,45.3],[28.23,45.49],[28.49,45.6],[28.66,45.94],[28.93,46.26],[28.86,46.44],[29.07,46.52],[29.17,46.38],[29.76,46.35],[30.02,46.42],[29.84,46.53],[29.91,46.67],[29.56,46.93],[29.42,47.35],[29.05,47.51],[29.12,47.85],[28.67,48.12],[28.26,48.16],[27.52,48.47],[26.86,48.37],[26.62,48.22],[26.2,48.22],[25.95,47.99],[25.21,47.89],[24.87,47.74],[24.4,47.98],[23.76,47.99],[23.14,48.1],[22.71,47.88],[22.64,48.15],[22.09,48.42],[22.28,48.83],[22.56,49.09],[22.78,49.03],[22.52,49.48],[23.43,50.31],[23.92,50.42],[24.03,50.71],[23.53,51.58],[24.01,51.62],[24.55,51.89],[25.33,51.91],[26.34,51.83],[27.45,51.59],[28.24,51.57],[28.62,51.43],[28.99,51.6],[29.25,51.37],[30.16,51.42],[30.56,51.32],[30.62,51.82],[30.93,52.04],[31.79,52.1]];
  var CITIES = [["КИЇВ",30.5,50.45],["ЛЬВІВ",24.0,49.84],["ХАРКІВ",36.2,50.0],["ОДЕСА",30.7,46.5],["ДНІПРО",35.0,48.45],["ВІННИЦЯ",28.5,49.2]];
  var BORDERS = "";
  function px(c) { return [((c[0] - 22) * 52).toFixed(1), ((52.5 - c[1]) * 80).toFixed(1)]; }
  function poly(a) { return "M" + a.map(function (c) { return px(c).join(" "); }).join("L") + "Z"; }
  var kyiv = px([CITIES[0][1], CITIES[0][2]]);
  var mapSvg = '<svg class="holo-mapsvg" viewBox="0 0 960 660" aria-hidden="true"><g class="mz" style="transform-origin:' + kyiv[0] + 'px ' + kyiv[1] + 'px">';
  for (var gx = 0; gx <= 960; gx += 80) mapSvg += '<line class="mg" x1="' + gx + '" y1="0" x2="' + gx + '" y2="660"/>';
  for (var gy = 0; gy <= 660; gy += 80) mapSvg += '<line class="mg" x1="0" y1="' + gy + '" x2="960" y2="' + gy + '"/>';
  mapSvg += '<path class="mfill" d="' + poly(MAIN) + '"/>';
  mapSvg += '<path class="mline" pathLength="1" d="' + poly(MAIN) + '"/>';
  CITIES.forEach(function (c, i) {
    var q = px([c[1], c[2]]);
    if (i > 0) mapSvg += '<path class="mnet" pathLength="1" style="animation-delay:' + (1 + i * 0.12) + 's" d="M' + q[0] + ' ' + q[1] + 'Q' + ((+q[0] + +kyiv[0]) / 2) + ' ' + (Math.min(q[1], kyiv[1]) - 70) + ' ' + kyiv[0] + ' ' + kyiv[1] + '"/>';
    mapSvg += '<circle class="mdot" style="animation-delay:' + (0.7 + i * 0.12) + 's" cx="' + q[0] + '" cy="' + q[1] + '" r="' + (i ? 5 : 7) + '"/>';
  });
  mapSvg += '<circle class="mping" cx="' + kyiv[0] + '" cy="' + kyiv[1] + '" r="14"/><circle class="mping p2" cx="' + kyiv[0] + '" cy="' + kyiv[1] + '" r="14"/>';
  mapSvg += '<rect class="mret" x="' + (kyiv[0] - 60) + '" y="' + (kyiv[1] - 60) + '" width="120" height="120" style="transform-origin:' + kyiv[0] + 'px ' + kyiv[1] + 'px"/>';
  mapSvg += '</g></svg>';
  root.innerHTML =
    '<div class="holo-map">' + mapSvg + '</div>' +
    '<div class="holo-grid"></div><div class="holo-scan"></div>' +
        '<div class="holo-search"><div class="hs-grid"></div><div class="hs-beam"></div>' +
      '<i class="hs-box b1"></i><i class="hs-box b2"></i><i class="hs-box b3"></i><i class="hs-box b4"></i>' +
      '<i class="hs-lh"></i><i class="hs-lv"></i>' +
      '<div class="hs-lock"><i class="c tl"></i><i class="c tr"></i><i class="c bl"></i><i class="c br"></i><b></b></div>' +
      '<i class="hs-logo"></i><i class="hs-ping"></i><i class="hs-ping p2"></i></div>' +
    '<div class="holo-stage">' + rings +
      '<div class="holo-radar"></div>' + blips +
      '<div class="holo-emblem"><i class="holo-emblem-i g1"></i><i class="holo-emblem-i g2"></i><i class="holo-emblem-i"></i><div class="holo-emblem-base"></div></div>' +
    '</div>' +
    '<div class="holo-log"></div><div class="holo-bar"><i></i></div>' +
    '<button class="holo-skip" type="button" aria-label="skip"></button>';
  document.documentElement.appendChild(root);
  // the intro lives inside the hero video frame
  function dock() {
    var h = document.querySelector(".hero-media");
    if (h) { root.classList.add("in-hero"); h.appendChild(root); }
  }

  function dock() {
    var h = document.querySelector(".hero-media");
    if (h) { root.classList.add("in-hero"); h.appendChild(root); }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", dock); else dock();

  var log = root.querySelector(".holo-log");
  var bar = root.querySelector(".holo-bar i");
  var stage = root.querySelector(".holo-stage");
  var emblem = root.querySelector(".holo-emblem");
  var timers = [];
  var done = false;
  function at(ms, fn) { timers.push(setTimeout(fn, ms)); }


  function setProgress(p) { bar.style.width = p + "%"; }
  var D = 2600;
  at(D, function () { root.classList.add("p2"); });
  at(D + 400, function () { setProgress(35); });
  at(D + 1600, function () { setProgress(70); });
  at(D + 2800, function () { setProgress(100); });

  function finish() {
    if (done) return;
    done = true;
    timers.forEach(clearTimeout);
    try { sessionStorage.setItem("holoIntro", "1"); } catch (e) {}
    root.classList.add("is-slide");
    setTimeout(function () { window.dispatchEvent(new Event("holo:done")); }, 250);
    setTimeout(function () { root.remove(); }, 1500);
  }
  at(D + 3900, finish);
  at(D + 6500, finish); // safety net: never hang

  root.querySelector(".holo-skip").addEventListener("click", function () { done = false; finish(); });
})();
