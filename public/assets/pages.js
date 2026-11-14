/*
 * WebEra — pokret za stranice usluga, radova i kontakta.
 * Isti jezik kao početna: film kroz epohe u pozadini koji ide sa skrolom,
 * prašina u svjetlu, procjep svjetla na ulasku, timecode i linija vremena,
 * natpisi koji se dekodiraju i redovi koji izlaze iz maske.
 * Bez biblioteka. Ako korisnik traži manje pokreta, sve stoji mirno.
 */
(function () {
  var doc = document.documentElement;
  var body = document.body;
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var GLYPHS = "ABCDEFGHIJKLMNOPRSTUVZ0123456789/—:";


  /* ---------- Film kroz epohe ---------- */
  var film = body.getAttribute("data-film") || "sat";
  var COUNT = 6;
  var layer = document.querySelector(".film-frames");
  var frames = [];
  if (layer) {
    for (var i = 0; i < COUNT; i++) {
      var f = document.createElement("div");
      f.className = "film-frame";
      if (i === 0) f.style.backgroundImage = "url(/assets/epohe/" + film + "-0.webp)";
      layer.appendChild(f);
      frames.push(f);
    }
    // ostali kadrovi kad se stranica smiri
    var loadRest = function () {
      for (var j = 1; j < COUNT; j++) frames[j].style.backgroundImage = "url(/assets/epohe/" + film + "-" + j + ".webp)";
    };
    if ("requestIdleCallback" in window) requestIdleCallback(loadRest, { timeout: 1500 });
    else setTimeout(loadRest, 800);
  }

  /* ---------- Prašina u svjetlu ---------- */
  var canvas = document.querySelector(".dust");
  var ctx = canvas && canvas.getContext && canvas.getContext("2d");
  var motes = [];
  var cw = 0;
  var ch = 0;
  function sizeDust() {
    if (!ctx) return;
    var r = Math.min(window.devicePixelRatio || 1, 1.5);
    cw = canvas.width = Math.round(innerWidth * r);
    ch = canvas.height = Math.round(innerHeight * r);
    var n = innerWidth < 768 ? 46 : 90;
    motes = [];
    for (var k = 0; k < n; k++) {
      var big = Math.random() < 0.12;
      motes.push({
        x: Math.random() * cw,
        y: Math.random() * ch,
        r: (big ? 2.2 + Math.random() * 3.2 : 0.5 + Math.random() * 1.3) * r,
        a: big ? 0.08 + Math.random() * 0.1 : 0.25 + Math.random() * 0.45,
        vx: (Math.random() - 0.5) * 0.12 * r,
        vy: (-0.05 - Math.random() * 0.18) * r,
        depth: 0.3 + Math.random() * 0.7,
        tw: Math.random() * 6.28,
      });
    }
  }

  /* ---------- Skrol, timecode i linija vremena ---------- */
  var hudTime = document.querySelector(".hud-time");
  var hudLabel = document.querySelector(".hud-label");
  var railFill = document.querySelector(".rail span");
  var SECONDS = { sat: [0, 4.4], temelji: [5.3, 11.1], svjetlo: [11.1, 14.9], digital: [16.7, 25], horizont: [25.2, 29.1] }[film] || [0, 29];
  var target = 0;
  var smooth = 0;
  var lastY = scrollY;
  var velocity = 0;

  function progress() {
    var max = doc.scrollHeight - innerHeight;
    return max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
  }

  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }

  var then = performance.now();
  function frame(now) {
    var dt = Math.min(0.05, (now - then) / 1000);
    then = now;
    target = progress();
    smooth += (target - smooth) * (still ? 1 : 1 - Math.exp(-dt * 4));
    velocity += ((scrollY - lastY) / Math.max(dt, 0.001) - velocity) * 0.12;
    lastY = scrollY;

    // kadrovi: blago pretapanje i polagano primicanje kamere
    var pos = smooth * (COUNT - 1);
    for (var i = 0; i < frames.length; i++) {
      var d = Math.abs(pos - i);
      var o = Math.max(0, 1 - d);
      frames[i].style.opacity = o.toFixed(3);
      if (o > 0) frames[i].style.transform = "scale(" + (1.06 + smooth * 0.08 - o * 0.03).toFixed(4) + ")";
    }

    // timecode prati film ove epohe
    if (hudTime) {
      var sec = SECONDS[0] + (SECONDS[1] - SECONDS[0]) * smooth;
      hudTime.textContent = "00:00:" + pad(Math.floor(sec)) + ":" + pad(Math.floor((sec % 1) * 24));
    }
    if (railFill) railFill.style.transform = "scaleY(" + smooth.toFixed(4) + ")";

    // prašina se pomjera sa skrolom, kao da kamera ide kroz nju
    if (ctx && !document.hidden) {
      ctx.clearRect(0, 0, cw, ch);
      var push = Math.max(-40, Math.min(40, velocity * 0.02));
      for (var m = 0; m < motes.length; m++) {
        var p = motes[m];
        p.x += p.vx;
        p.y += p.vy - push * p.depth * 0.08;
        p.tw += dt * 1.4;
        if (p.y < -10) p.y = ch + 10;
        if (p.y > ch + 10) p.y = -10;
        if (p.x < -10) p.x = cw + 10;
        if (p.x > cw + 10) p.x = -10;
        var alpha = p.a * (0.75 + 0.25 * Math.sin(p.tw));
        ctx.beginPath();
        ctx.fillStyle = "rgba(205,225,245," + alpha.toFixed(3) + ")";
        ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fill();
      }
    }
    if (!still) requestAnimationFrame(frame);
  }

  /* ---------- Natpisi koji se dekodiraju ---------- */
  function scramble(el, text, ms) {
    if (!el) return;
    if (still) {
      el.textContent = text;
      return;
    }
    var start = performance.now();
    (function step(now) {
      var k = Math.min(1, (now - start) / ms);
      var shown = Math.floor(k * text.length);
      var out = text.slice(0, shown);
      for (var i = shown; i < text.length; i++) {
        out += text[i] === " " ? " " : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      if (k < 1) requestAnimationFrame(step);
    })(start);
  }

  /* ---------- Ulazak blokova ---------- */
  function setupReveal() {
    var items = document.querySelectorAll("[data-reveal]");
    if (still || !("IntersectionObserver" in window)) {
      items.forEach(function (el) {
        el.classList.add("is-in");
      });
      return;
    }
    var seen = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var el = e.target;
          el.classList.add("is-in");
          var label = el.querySelector(":scope > h2");
          if (label && !label.dataset.done) {
            label.dataset.done = "1";
            scramble(label, label.dataset.text || label.textContent, 700);
          }
          seen.unobserve(el);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
    );
    items.forEach(function (el) {
      var label = el.querySelector(":scope > h2");
      if (label) label.dataset.text = label.textContent;
      seen.observe(el);
    });

    // natpis poglavlja u timecode-u prati blok na sredini ekrana
    var blocks = document.querySelectorAll(".block > h2");
    if (hudLabel && blocks.length) {
      var mid = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) scramble(hudLabel, e.target.dataset.text || e.target.textContent, 500);
          });
        },
        { rootMargin: "-45% 0px -45% 0px" }
      );
      blocks.forEach(function (b) {
        mid.observe(b);
      });
    }
  }

  /* ---------- Kartice radova: nagib i natpis uz kursor ---------- */
  function setupCards() {
    var tag = document.querySelector(".cursor-tag");
    var fine = window.matchMedia("(pointer: fine)").matches;
    document.querySelectorAll(".card .shot").forEach(function (shot) {
      if (!fine || still) return;
      shot.addEventListener("pointermove", function (e) {
        var r = shot.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        shot.style.transform = "perspective(900px) rotateY(" + (x * 6).toFixed(2) + "deg) rotateX(" + (-y * 6).toFixed(2) + "deg)";
        shot.style.setProperty("--gx", ((x + 0.5) * 100).toFixed(1) + "%");
        shot.style.setProperty("--gy", ((y + 0.5) * 100).toFixed(1) + "%");
        if (tag) {
          tag.style.transform = "translate3d(" + e.clientX + "px," + e.clientY + "px,0)";
          tag.classList.add("is-on");
        }
      });
      shot.addEventListener("pointerleave", function () {
        shot.style.transform = "";
        if (tag) tag.classList.remove("is-on");
      });
    });
  }

  /* ---------- Procjep svjetla na ulasku ---------- */
  function intro() {
    var slit = document.querySelector(".slit-intro");
    if (!slit) return;
    if (still || sessionStorage.getItem("we-slit")) {
      slit.remove();
      body.classList.add("is-entered");
      return;
    }
    try {
      sessionStorage.setItem("we-slit", "1");
    } catch (e) {}
    requestAnimationFrame(function () {
      slit.classList.add("is-open");
      setTimeout(function () {
        body.classList.add("is-entered");
      }, 380);
      setTimeout(function () {
        slit.remove();
      }, 1300);
    });
  }

  sizeDust();
  addEventListener("resize", sizeDust);
  setupReveal();
  setupCards();
  intro();
  scramble(document.querySelector(".hero .label"), (document.querySelector(".hero .label") || {}).textContent || "", 900);
  requestAnimationFrame(frame);
  if (still) addEventListener("scroll", function () { requestAnimationFrame(frame); }, { passive: true });
})();
