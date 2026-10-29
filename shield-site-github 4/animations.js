/* Premium scroll/entrance animations powered by GSAP + ScrollTrigger.
   Progressive enhancement: elements are visible by default in CSS, so if GSAP
   fails to load or prefers-reduced-motion is set, nothing is hidden — we simply
   skip animating and the page renders in its final state.

   Every tween clears its inline transform on completion (clearProps) so CSS
   :hover lift effects on the same elements (service-card, price-card, etc.)
   regain control instead of being permanently overridden by GSAP's inline style. */
(function () {
  "use strict";

  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || typeof gsap === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);
  gsap.config({ nullTargetWarn: false });

  var CLEAR = "transform";
  var isMobile = window.matchMedia("(max-width: 768px)").matches;

  // Every block slides up from below (about 90px on a phone, 80px on a computer) and fades in
  // as soon as it scrolls into view, one by one, like on veteranventure.skelar.tech.
  function mobileReveal(target, extra) {
    var first = target && target.length !== undefined && !target.tagName ? target[0] : target;
    if (!first) return;
    gsap.from(target, Object.assign({
      y: isMobile ? 90 : 80,
      opacity: 0,
      duration: 0.85,
      ease: "power3.out",
      clearProps: CLEAR,
      scrollTrigger: { trigger: first, start: "top 92%", once: true }
    }, extra || {}));
  }

  // breakpoint-reload: animations are set up once for the layout the page was opened in
  // (phone or computer), so when the window crosses the 768px line the page re-initialises itself.
  (function () {
    var mq = window.matchMedia("(max-width: 768px)");
    var timer;
    function onChange() {
      clearTimeout(timer);
      timer = setTimeout(function () { location.reload(); }, 350);
    }
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);
  })();

  // ---------- Hero parallax (subtle) ----------
  // Skipped on mobile: the hero is short there, so the moving video/logo
  // only adds visual noise right at the top of the page.
  var heroVideo = isMobile ? null : document.querySelector(".hero-video");
  var heroGlow = isMobile ? null : document.querySelector(".hero-glow");
  if (heroVideo) {
    gsap.to(heroVideo, {
      yPercent: 12,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  }
  if (heroGlow) {
    gsap.to(heroGlow, {
      yPercent: -18,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  }

  // ---------- Locations map parallax (mobile) ----------
  // Desktop fakes the "pinned map" look with background-attachment:fixed,
  // which mobile browsers don't honor — so on mobile we drive the same
  // reveal with a real scroll-linked transform instead.
  var locationsMapImg = document.querySelector(".locations-map-img");
  if (locationsMapImg && window.matchMedia("(max-width: 768px)").matches) {
    gsap.fromTo(
      locationsMapImg,
      { yPercent: -15 },
      {
        yPercent: 15,
        ease: "none",
        scrollTrigger: {
          trigger: ".locations-map",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      }
    );
  }

  // ---------- Locations map parallax (desktop) ----------
  // Replaces background-attachment:fixed (which repaints the whole image on every scroll frame)
  // with a real scroll-linked transform on a slightly oversized layer.
  if (false && locationsMapImg && !isMobile) { // desktop: back to the fixed-background map (see CSS)
    gsap.fromTo(
      locationsMapImg,
      { yPercent: -10 },
      {
        yPercent: 10,
        ease: "none",
        scrollTrigger: {
          trigger: ".locations-map",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      }
    );
  }

  // ---------- Hero entrance ----------
  var heroStats = gsap.utils.toArray(".stat-card");
  if (heroStats.length) {
    gsap.from(heroStats, {
      y: 28,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      stagger: 0.12,
      delay: 0.15,
      clearProps: CLEAR,
    });
  }

  // ---------- Count-up for numeric stats (e.g. "702+", "1315+") ----------
  // Strict pattern: digits optionally followed by "+" only — skips "24/7", "4 роки", etc.
  document.querySelectorAll(".stat-num").forEach(function (el) {
    var match = el.textContent.trim().match(/^(\d+)(\+?)$/);
    if (!match) return;
    var target = parseInt(match[1], 10);
    if (isNaN(target)) return;
    var suffix = match[2] || "";
    var counter = { val: 0 };
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // After the count-up finishes the number keeps creeping up on its own,
    // one step at a time, at a slightly random pace.
    function keepTicking() {
      if (reduceMotion) return;
      var current = target;
      (function tick() {
        var wait = 3500 + Math.random() * 5500;
        setTimeout(function () {
          if (!document.hidden) {
            current += 1;
            el.textContent = current + suffix;
          }
          tick();
        }, wait);
      })();
    }

    el.style.fontVariantNumeric = "tabular-nums";
    gsap.to(counter, {
      val: target,
      duration: 3.4,
      ease: "power2.out",
      delay: 0.5,
      onUpdate: function () {
        el.textContent = Math.round(counter.val) + suffix;
      },
      onComplete: keepTicking,
    });
  });


  // ---------- Generic scroll reveal ----------
  function revealHeading(section) {
    var eyebrow = section.querySelector(".eyebrow");
    var title = section.querySelector(".section-title");
    var targets = [eyebrow, title].filter(Boolean);
    if (!targets.length) return;
    mobileReveal(targets, { stagger: 0.1 }); return;
    gsap.from(targets, {
      y: section.classList.contains("process") ? 18 : 24,
      opacity: 0,
      duration: section.classList.contains("process") ? 1.1 : 0.7,
      ease: "power3.out",
      stagger: 0.08,
      clearProps: CLEAR,
      scrollTrigger: {
        trigger: section,
        start: "top 82%",
        once: true,
      },
    });
  }

  function revealGrid(selector, opts) {
    var items = gsap.utils.toArray(selector);
    if (!items.length) return;

    // carousels and the partner grid are revealed as one block on a phone; everything else block by block
    // (on a computer, cards of the same row follow each other with a tiny delay)
    var asHolder = isMobile && (selector === ".service-card" || selector === ".review-card" || selector === ".logo-card");
    if (asHolder) {
      var holder = items[0].parentElement;
      if (holder && !holder._mobileRevealed) { holder._mobileRevealed = true; mobileReveal(holder); }
    } else {
      items.forEach(function (el) {
        var row = items.filter(function (o) { return Math.abs(o.offsetTop - el.offsetTop) < 8; });
        var col = Math.max(0, row.indexOf(el));
        mobileReveal(el, isMobile ? {} : { delay: Math.min(col, 5) * 0.09 });
      });
    }
    return;

    var groups = new Map();
    items.forEach(function (el) {
      var trigger = el.closest("section") || el.parentElement;
      if (!groups.has(trigger)) groups.set(trigger, []);
      groups.get(trigger).push(el);
    });

    groups.forEach(function (els, trigger) {
      gsap.from(els, Object.assign({
        y: 26,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.08,
        clearProps: CLEAR,
        scrollTrigger: {
          trigger: trigger,
          start: "top 80%",
          once: true,
        },
      }, opts || {}));
    });
  }

  document.querySelectorAll(".section").forEach(revealHeading);

  revealGrid(".service-card");
  revealGrid(".price-card", { y: 34, duration: 0.75, stagger: 0.1, scale: 0.97 });
  revealGrid(".logo-card", { duration: 0.4, stagger: 0.04, y: 16 });
  revealGrid(".review-card");
  revealGrid(".location-card");
  revealGrid(".accordion-item", { y: 14, duration: 0.5, stagger: 0.06 });

  // Horizon divider at the top of the process section: draws the glowing
  // curve and fades in the dark fill once the section scrolls into view.
  (function processHorizon() {
    var section = document.querySelector(".process");
    if (!section || !section.querySelector(".process-horizon")) return;
    ScrollTrigger.create({
      trigger: section,
      start: "top 85%",
      once: true,
      onEnter: function () { section.classList.add("is-inview"); },
    });
  })();


  // Process section — chain-reaction reveal: step 01's text appears first,
  // then a glowing dot + drawing line travel the curved connector to step
  // 02 — the instant the beam arrives, step 02's text appears. Repeats
  // through step 04. Plain text, no card backgrounds, so each step's
  // number/rule/heading/paragraph fade in together as one unit.
  (function processFlow() {
    var cards = gsap.utils.toArray(".process-card");
    var paths = gsap.utils.toArray(".process-flow-path");
    var dot = document.querySelector(".process-flow-dot");
    if (!cards.length) return;

    // Phone layout: one column, so the beam travels down a winding curved
    // line (not a straight rail) and each step appears the moment it arrives.
    if (window.matchMedia("(max-width: 768px)").matches) {
      var grid = document.querySelector(".process-grid");
      var centers = cards.map(function (c) { return c.offsetTop + 30; });
      var gridH = grid.offsetHeight;

      // One glowing arc per step, like the desktop connector: the beam draws the arc from one
      // card to the next, the arc lights up while the beam travels and fades once it has arrived.
      var cardLeft = cards[0].offsetLeft;
      var railW = Math.max(44, cardLeft);
      var xEdge = railW - 1;
      var bulge = Math.min(34, railW - 8);
      var svgNS = "http://www.w3.org/2000/svg";
      var svg = document.createElementNS(svgNS, "svg");
      svg.setAttribute("class", "process-rail-svg");
      svg.setAttribute("viewBox", "0 0 " + railW + " " + gridH);
      svg.setAttribute("preserveAspectRatio", "none");
      svg.setAttribute("fill", "none");
      svg.style.width = railW + "px";

      var arcs = [];
      var totalLen = 0;
      for (var i = 0; i < cards.length - 1; i++) {
        var y0 = cards[i].offsetTop + cards[i].offsetHeight * 0.36;
        var y1 = cards[i + 1].offsetTop + 30;
        var cx = xEdge - bulge * 1.35;
        var arcPath = document.createElementNS(svgNS, "path");
        arcPath.setAttribute("d", "M" + xEdge + "," + y0.toFixed(1) +
          " C" + cx + "," + y0.toFixed(1) + " " + cx + "," + y1.toFixed(1) + " " + xEdge + "," + y1.toFixed(1));
        arcPath.setAttribute("class", "process-rail-lit");
        svg.appendChild(arcPath);
        var len = arcPath.getTotalLength();
        arcs.push({ el: arcPath, len: len, start: totalLen });
        totalLen += len;
      }

      grid.appendChild(svg);

      // cards stay slightly dimmed until the beam reaches them
      grid.classList.add("process-rail-live");

      var lastReached = -1;
      function setBeam(p) {
        var pos = Math.max(0, Math.min(totalLen, p * totalLen));
        var active = 0;
        arcs.forEach(function (arc, k) { if (pos >= arc.start) active = k; });
        // arcs are always visible (dim); the ones the scroll has reached switch to the bright colour
        arcs.forEach(function (arc, k) {
          arc.el.classList.toggle("is-lit", pos > arc.start + 0.5);
        });
        // which card has the beam reached?
        var reached = pos >= totalLen - 0.5 ? cards.length - 1 : -1;
        if (reached < 0) {
          for (var k2 = 0; k2 < centers.length; k2++) {
            if (k2 <= active && (k2 === 0 || pos >= arcs[k2 - 1].start + arcs[k2 - 1].len - 0.5)) reached = k2;
          }
        }
        cards.forEach(function (c, k) { c.classList.toggle("is-reached", k <= reached); });
        if (reached > lastReached && reached > 0) {
          var hitCard = cards[reached];
          hitCard.classList.add("process-card--hit");
          gsap.delayedCall(0.9, function () { hitCard.classList.remove("process-card--hit"); });
        }
        lastReached = reached;
      }
      cards[0].classList.add("is-reached");

      // scroll-linked: the beam follows the scroll position, down and back up
      ScrollTrigger.create({
        trigger: grid,
        start: "top 70%",
        end: "bottom 65%",
        scrub: 0.5,
        onUpdate: function (self) { setBeam(self.progress); },
        onRefresh: function (self) { setBeam(self.progress); }
      });
      return;
    }

    var lengths = paths.map(function (p) { return p.getTotalLength(); });

    // Hidden until the beam draws each segment in; once the dot arrives the
    // line fades from lit back to dark instead of staying on permanently.
    paths.forEach(function (p, i) {
      p.style.strokeDasharray = lengths[i];
      p.style.strokeDashoffset = lengths[i];
    });

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".process-grid",
        start: "top 75%",
        once: true,
      },
    });

    function revealCard(card, position) {
      var els = card.querySelectorAll(".process-num, .process-rule, h3, p");
      tl.from(els, {
        opacity: 0,
        y: 14,
        duration: 0.45,
        ease: "power2.out",
        stagger: 0.04,
        clearProps: CLEAR,
      }, position);
    }

    cards.forEach(function (card, i) {
      // First step just appears; the rest are revealed exactly when the
      // beam travelling toward them completes (see below).
      if (i === 0) revealCard(card, undefined);

      var path = paths[i];
      var len = lengths[i];
      var nextCard = cards[i + 1];
      if (path && dot) {
        var proxy = { t: 0 };
        tl.to(proxy, {
          t: 1,
          duration: 0.3,
          ease: "power1.inOut",
          onStart: function () {
            dot.setAttribute("opacity", "1");
          },
          onUpdate: function () {
            var pt = path.getPointAtLength(proxy.t * len);
            dot.setAttribute("cx", pt.x);
            dot.setAttribute("cy", pt.y);
            path.style.strokeDasharray = len;
            path.style.strokeDashoffset = String(len * (1 - proxy.t));
          },
          onComplete: function () {
            dot.setAttribute("opacity", "0");
            gsap.to(path, { opacity: 0, duration: 0.6, ease: "power2.in" });
            if (nextCard) {
              nextCard.classList.add("process-card--hit");
              gsap.delayedCall(0.9, function () {
                nextCard.classList.remove("process-card--hit");
              });
            }
          },
        });

        if (nextCard) revealCard(nextCard, ">");
      }
    });
  })();


  // Section transitions, fully automatic (time-based, not tied to the scroll position).
  // Pick the style with ?t=colour|panel|circle|diagonal|fade|doors|curtain|zoom|wave|stack
  (function sectionTransitions() {
    var body = document.body;
    var mode = (new URLSearchParams(location.search).get("t") || "colour").toLowerCase();
    var steps = [
      { sel: ".services",     before: ".hero",         prev: "#040508" },
      { sel: ".process",      before: ".services",     prev: "#f9fbfe", dur: 1.9 },
      { sel: ".pricing",      before: ".ajax-section", prev: "#040508" },
      { sel: ".locations",    before: ".pricing",      prev: "#f4f5f8" },
      { sel: ".partners",     before: ".locations",    prev: "#05060f" },
      { sel: ".reviews",      before: ".partners",     prev: "#ffffff" },
      { sel: ".consultation", before: ".faq",          prev: "#02040e" },
      { sel: ".site-footer",  before: ".consultation", prev: "#ffffff" }
    ];
    var side = isMobile ? 5 : 8;
    var radius = isMobile ? 32 : 56;

    var styles = {
      // the block's background colour changes smoothly from the previous block's colour to its own
      // an own overlay element whose opacity is animated (compositor-friendly: no style recalculation of the whole section)
      colour: function (el, p) {
        if (!el._wash) {
          var d = document.createElement("div");
          d.className = "wash-overlay";
          d.setAttribute("aria-hidden", "true");
          el.insertBefore(d, el.firstChild);
          el._wash = d;
        }
        el._wash.style.opacity = (1 - p).toFixed(3);
      },
      panel: function (el, p) {
        var k = 1 - p;
        el.style.clipPath = "inset(0 " + (side * k).toFixed(2) + "% 0 " + (side * k).toFixed(2) +
          "% round " + (radius * k).toFixed(1) + "px " + (radius * k).toFixed(1) + "px 0 0)";
      },
      circle: function (el, p) { el.style.clipPath = "circle(" + (p * 150).toFixed(1) + "% at 50% 0%)"; },
      diagonal: function (el, p) {
        el.style.clipPath = "polygon(0 " + ((1 - p) * 22).toFixed(2) + "%, 100% 0, 100% 100%, 0 100%)";
      },
      fade: function (el, p) { el.style.opacity = (p * p * (3 - 2 * p)).toFixed(3); },
      doors: function (el, p) {
        var o = ((1 - p) * 50).toFixed(2);
        el.style.clipPath = "inset(0 " + o + "% 0 " + o + "%)";
      },
      curtain: function (el, p) { el.style.clipPath = "inset(0 0 " + ((1 - p) * 70).toFixed(2) + "% 0)"; },
      zoom: function (el, p) {
        var k = 1 - p;
        el.style.transformOrigin = "50% 0";
        el.style.transform = "scale(" + (0.9 + 0.1 * p).toFixed(4) + ")";
        el.style.clipPath = "inset(0 round " + (radius * k).toFixed(1) + "px " + (radius * k).toFixed(1) + "px 0 0)";
        el.style.opacity = (0.4 + 0.6 * p).toFixed(3);
      },
      wave: function (el, p) {
        var k = 1 - p, pts = ["0 100%"], i, x, y;
        for (i = 0; i <= 12; i++) {
          x = i * (100 / 12);
          y = k * 16 * (1 + Math.sin(i * 0.9 + p * 7));
          pts.push(x.toFixed(2) + "% " + y.toFixed(2) + "%");
        }
        pts.push("100% 100%");
        el.style.clipPath = "polygon(" + pts.join(",") + ")";
      },
      stack: function (el, p, prev) {
        var k = 1 - p;
        el.style.clipPath = "inset(0 0 0 0 round " + (radius * k).toFixed(1) + "px " + (radius * k).toFixed(1) + "px 0 0)";
        if (prev) {
          prev.style.transformOrigin = "50% 100%";
          prev.style.transform = "scale(" + (1 - 0.06 * p).toFixed(4) + ")";
          prev.style.filter = "brightness(" + (1 - 0.55 * p).toFixed(3) + ")";
        }
      }
    };
    var apply = styles[mode] || styles.colour;

    function clear(el, prev) {
      el.style.clipPath = ""; el.style.opacity = ""; el.style.transform = ""; el.style.transformOrigin = "";
      el.style.setProperty("--wash", "0");
      if (el._wash) el._wash.style.opacity = "0";
      if (prev) { prev.style.transform = ""; prev.style.filter = ""; prev.style.transformOrigin = ""; }
    }

    steps.forEach(function (s) {
      var el = document.querySelector(s.sel);
      if (!el) return;
      var prevEl = document.querySelector(s.before);
      var state = { p: 0 };
      apply(el, 0, prevEl);                       // start in the "closed" state
      gsap.to(state, {
        p: 1,
        duration: s.dur || 1.3,
        ease: "power3.out",
        onUpdate: function () { apply(el, state.p, prevEl); },
        onComplete: function () { clear(el, prevEl); },
        onReverseComplete: function () { apply(el, 0, prevEl); },
        scrollTrigger: {
          trigger: el,
          start: s.sel === ".site-footer" ? "top 96%" : "top 88%",
          toggleActions: "play none none reverse",
          onEnter: function () { body.style.backgroundColor = s.prev; },
          onLeaveBack: function () { body.style.backgroundColor = s.prev; }
        }
      });
    });
  })();

  // AJAX banner
  var ajaxCard = document.querySelector(".ajax-card");
  if (ajaxCard) {
    mobileReveal(ajaxCard);
  } else if (ajaxCard) {
    gsap.from(ajaxCard, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      clearProps: CLEAR,
      scrollTrigger: {
        trigger: ajaxCard,
        start: "top 82%",
        once: true,
      },
    });
  }

  // AJAX media panel — gentle scale/fade reveal as the video comes into view.
  var ajaxMedia = document.querySelector(".ajax-media");
  if (ajaxMedia && !isMobile) {
    gsap.from(ajaxMedia, {
      scale: 0.94,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      clearProps: CLEAR,
      scrollTrigger: {
        trigger: ajaxMedia,
        start: "top 78%",
        once: true,
      },
    });
  }

  // Consultation form + text column
  var consultationText = document.querySelector(".consultation-text");
  var consultationForm = document.querySelector(".consultation-form");
  if (consultationText && consultationForm) {
    mobileReveal(consultationText);
    mobileReveal(consultationForm);
  } else if (consultationText && consultationForm) {
    gsap.from(consultationText, {
      x: -24,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      clearProps: CLEAR,
      scrollTrigger: { trigger: consultationText, start: "top 80%", once: true },
    });
    gsap.from(consultationForm, {
      x: 24,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      clearProps: CLEAR,
      scrollTrigger: { trigger: consultationForm, start: "top 80%", once: true },
    });
  }

  // FAQ brand panel
  var faqBrand = document.querySelector(".faq-brand");
  if (faqBrand) {
    mobileReveal(faqBrand);
  } else if (faqBrand) {
    gsap.from(faqBrand, {
      x: -20,
      opacity: 0,
      duration: 0.7,
      ease: "power3.out",
      clearProps: CLEAR,
      scrollTrigger: { trigger: faqBrand, start: "top 82%", once: true },
    });
  }

})();
