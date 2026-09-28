/* 10500.com — core site script (no dependencies) */
(function () {
  "use strict";
  var C = window.SITE_CONFIG || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var store = {
    get: function (k, t) { try { return (t ? sessionStorage : localStorage).getItem(k); } catch (e) { return null; } },
    set: function (k, v, t) { try { (t ? sessionStorage : localStorage).setItem(k, v); } catch (e) {} }
  };
  window.S10500 = window.S10500 || {};

  /* ---------- contact address (assembled only at runtime) ---------- */
  function addr() {
    try { return atob((C._k || []).join("").split("").reverse().join("")); } catch (e) { return ""; }
  }
  function endpoint() {
    return "https://formsubmit.co/ajax/" + (C.formAlias || addr());
  }
  function openMail(subject, body) {
    var a = document.createElement("a");
    a.href = "mai" + "lto:" + addr() + "?subject=" + encodeURIComponent(subject || "Inquiry via 10500.com") +
      (body ? "&body=" + encodeURIComponent(body) : "");
    a.rel = "nofollow"; document.body.appendChild(a); a.click(); a.remove();
  }
  S10500.openMail = openMail;
  S10500.paypalUrl = function (amount) {
    if (C.paypalMe) return C.paypalMe.replace(/\/$/, "") + (amount ? "/" + amount : "");
    if (!C.paypalDonate) return "";
    return "https://www.paypal.com/donate?business=" + encodeURIComponent(addr()) +
      "&currency_code=USD&item_name=" + encodeURIComponent("Support 10500.com") + (amount ? "&amount=" + amount : "");
  };

  /* ---------- toast ---------- */
  function toast(msg) {
    var t = $("#toast"); if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show"); clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove("show"); }, 2600);
  }
  S10500.toast = toast;

  /* ---------- theme ---------- */
  var root = document.documentElement;
  var saved = store.get("theme"); if (saved) root.setAttribute("data-theme", saved);
  function isDark() { var t = root.getAttribute("data-theme"); return t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches; }
  $$("[data-theme-toggle]").forEach(function (b) {
    b.textContent = isDark() ? "☀" : "☾";
    b.addEventListener("click", function () {
      var n = isDark() ? "light" : "dark"; root.setAttribute("data-theme", n); store.set("theme", n);
      $$("[data-theme-toggle]").forEach(function (x) { x.textContent = n === "dark" ? "☀" : "☾"; });
    });
  });

  /* ---------- nav ---------- */
  var burger = $("[data-burger]"), mm = $("#mobile-menu");
  if (burger && mm) burger.addEventListener("click", function () {
    var o = mm.classList.toggle("open"); burger.setAttribute("aria-expanded", o ? "true" : "false");
  });
  $$(".menu > li > button").forEach(function (b) {
    b.addEventListener("click", function (e) {
      e.stopPropagation(); var li = b.parentElement, o = li.classList.contains("open");
      $$(".menu > li.open").forEach(function (x) { x.classList.remove("open"); });
      if (!o) li.classList.add("open"); b.setAttribute("aria-expanded", !o ? "true" : "false");
    });
  });
  document.addEventListener("click", function () { $$(".menu > li.open").forEach(function (x) { x.classList.remove("open"); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { $$(".menu > li.open").forEach(function (x) { x.classList.remove("open"); }); closeModal(); } });

  /* ---------- year ---------- */
  $$("[data-year]").forEach(function (e) { e.textContent = new Date().getFullYear(); });

  /* ---------- contact links ---------- */
  $$("[data-contact]").forEach(function (a) {
    a.addEventListener("click", function (e) { e.preventDefault(); openMail(a.getAttribute("data-subject") || "Inquiry via 10500.com"); });
  });

  /* ---------- UTM capture ---------- */
  (function () {
    var p = new URLSearchParams(location.search), keep = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "ref"].forEach(function (k) { if (p.get(k)) keep[k] = p.get(k); });
    if (Object.keys(keep).length) store.set("utm", JSON.stringify(keep), true);
    if (!store.get("landing", true)) store.set("landing", location.pathname + location.search, true);
    if (!store.get("referrer", true)) store.set("referrer", document.referrer || "direct", true);
  })();

  /* ---------- forms ---------- */
  function formToObject(f) {
    var o = {}; new FormData(f).forEach(function (v, k) {
      if (k === "_hp") return;
      if (o[k]) o[k] = o[k] + ", " + v; else o[k] = v;
    }); return o;
  }
  function sendForm(f) {
    var status = $(".form-status", f) || (function () { var d = document.createElement("div"); d.className = "form-status"; d.setAttribute("aria-live", "polite"); f.appendChild(d); return d; })();
    if (f._hp && f._hp.value) { status.className = "form-status ok"; status.textContent = "Thank you!"; return; }
    if (!f.checkValidity()) { f.reportValidity(); return; }
    var data = formToObject(f);
    data._subject = "[10500.com] " + (f.getAttribute("data-form") || "Form") + (data.name ? " — " + data.name : "");
    data._template = "table"; data._captcha = "false";
    data.page = location.href; data.submitted = new Date().toISOString();
    try { var u = JSON.parse(store.get("utm", true) || "{}"); Object.keys(u).forEach(function (k) { data[k] = u[k]; }); } catch (e) {}
    data.landing_page = store.get("landing", true) || ""; data.referrer = store.get("referrer", true) || "";
    var btn = $("[type=submit]", f); var txt = btn ? btn.innerHTML : "";
    if (btn) { btn.disabled = true; btn.innerHTML = "Sending…"; }
    fetch(endpoint(), { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(data) })
      .then(function (r) { if (!r.ok) throw new Error("bad"); return r.json(); })
      .then(function () {
        if (typeof gtag === "function") gtag("event", "generate_lead", { form: f.getAttribute("data-form") });
        var redirect = f.getAttribute("data-redirect");
        if (redirect) { location.href = redirect; return; }
        status.className = "form-status ok"; status.textContent = f.getAttribute("data-success") || "Thank you! We received your message and will reply within 1–2 business days.";
        f.reset(); if (f._reset) f._reset();
      })
      .catch(function () {
        status.className = "form-status err";
        status.innerHTML = "We couldn't send this automatically. <a href='#' data-fallback>Click here to send it by email instead</a>.";
        var fb = $("[data-fallback]", status);
        fb.addEventListener("click", function (e) {
          e.preventDefault();
          var body = Object.keys(data).filter(function (k) { return k.charAt(0) !== "_"; }).map(function (k) { return k + ": " + data[k]; }).join("\n");
          openMail(data._subject, body);
        });
      })
      .finally(function () { if (btn) { btn.disabled = false; btn.innerHTML = txt; } });
  }
  S10500.sendForm = sendForm;
  $$("form[data-form]").forEach(function (f) {
    if (!f.querySelector("[name=_hp]")) { var h = document.createElement("input"); h.type = "text"; h.name = "_hp"; h.tabIndex = -1; h.autocomplete = "off"; h.className = "hp"; h.setAttribute("aria-hidden", "true"); f.appendChild(h); }
    f.addEventListener("submit", function (e) { e.preventDefault(); sendForm(f); });
  });

  /* ---------- copy / share ---------- */
  function copy(text) {
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () { toast("Copied!"); }, function () { toast("Copy failed"); });
    else { var t = document.createElement("textarea"); t.value = text; document.body.appendChild(t); t.select(); try { document.execCommand("copy"); toast("Copied!"); } catch (e) {} t.remove(); }
  }
  S10500.copy = copy;
  document.addEventListener("click", function (e) {
    var c = e.target.closest("[data-copy]"); if (c) { var el = document.getElementById(c.getAttribute("data-copy")); copy(el ? (el.value || el.textContent) : c.getAttribute("data-copy")); }
    var s = e.target.closest("[data-share]"); if (s) {
      var url = s.getAttribute("data-url") || location.href, title = s.getAttribute("data-title") || document.title;
      if (navigator.share) navigator.share({ title: title, url: url }).catch(function () {}); else copy(url);
    }
  });

  /* ---------- YouTube facade ---------- */
  $$(".yt[data-id]").forEach(function (y) {
    var id = y.getAttribute("data-id");
    if (!y.querySelector("img")) y.innerHTML = '<img loading="lazy" alt="" src="https://i.ytimg.com/vi/' + id + '/hqdefault.jpg"><div class="play"><span>▶</span></div>';
    y.setAttribute("role", "button"); y.setAttribute("tabindex", "0"); y.setAttribute("aria-label", "Play video: " + (y.getAttribute("data-title") || ""));
    function play() { y.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0" title="' + (y.getAttribute("data-title") || "YouTube video") + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'; }
    y.addEventListener("click", play, { once: true });
    y.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); play(); } });
  });
  $$("[data-yt-channel]").forEach(function (a) { if (C.youtubeChannel) a.href = C.youtubeChannel; });

  /* ---------- Ads ---------- */
  var houseAds = [
    ["Your brand here — reach number, luck & China-business audiences", "Advertise with 10500", "advertise.html"],
    ["Need a China supplier, translator or market-entry partner?", "Get expert help", "concierge.html"],
    ["Keep 10500 free — fund new tools, videos & contest prizes", "Support us", "support.html"],
    ["Win prizes in this month's Lucky Number Challenge", "Enter free", "contests.html"],
    ["Sponsor a tool or newsletter and own the category", "See packages", "advertise.html#packages"]
  ];
  var base = document.body.getAttribute("data-base") || "";
  function consented() { return store.get("cookie-consent") === "all"; }
  function renderAds() {
    var useAds = !!C.adsenseClient;
    if (useAds && !document.getElementById("adsbygoogle-js")) {
      var s = document.createElement("script"); s.async = true; s.id = "adsbygoogle-js"; s.crossOrigin = "anonymous";
      s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + C.adsenseClient; document.head.appendChild(s);
      if (!consented()) { (window.adsbygoogle = window.adsbygoogle || []).requestNonPersonalizedAds = 1; }
    }
    $$(".ad-slot").forEach(function (slot, i) {
      if (slot._done) return; slot._done = true;
      var type = slot.getAttribute("data-slot") || "incontent";
      if (useAds) {
        slot.innerHTML = '<div style="width:100%"><span class="ad-label">Advertisement</span><ins class="adsbygoogle" style="display:block" data-ad-client="' + C.adsenseClient + '"' +
          (C.adsenseSlots && C.adsenseSlots[type] ? ' data-ad-slot="' + C.adsenseSlots[type] + '"' : "") + ' data-ad-format="auto" data-full-width-responsive="true"></ins></div>';
        try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
      } else {
        var h = houseAds[(i + (new Date().getDate())) % houseAds.length];
        slot.innerHTML = '<div style="width:100%"><span class="ad-label">Sponsored</span><div class="house-ad"><b>' + h[0] + '</b><a class="btn btn-sm btn-primary" href="' + base + h[2] + '">' + h[1] + ' →</a></div></div>';
      }
    });
  }
  renderAds();
  var anchor = $(".ad-anchor"); if (anchor && !store.get("anchor-closed", true)) {
    setTimeout(function () { anchor.classList.add("on"); }, 4000);
    var x = $("[data-anchor-close]", anchor); if (x) x.addEventListener("click", function () { anchor.classList.remove("on"); store.set("anchor-closed", "1", true); });
  }

  /* ---------- Analytics (after consent) ---------- */
  function loadGA() {
    if (!C.ga4 || window.gtag) return;
    var s = document.createElement("script"); s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + C.ga4; document.head.appendChild(s);
    window.dataLayer = window.dataLayer || []; window.gtag = function () { dataLayer.push(arguments); };
    gtag("js", new Date()); gtag("config", C.ga4, { anonymize_ip: true });
  }

  /* ---------- Cookie consent ---------- */
  var ck = $("#cookie");
  if (ck) {
    var cv = store.get("cookie-consent");
    if (!cv) setTimeout(function () { ck.classList.add("show"); }, 900); else if (cv === "all") loadGA();
    $$("[data-cookie]", ck).forEach(function (b) {
      b.addEventListener("click", function () { var v = b.getAttribute("data-cookie"); store.set("cookie-consent", v); ck.classList.remove("show"); if (v === "all") loadGA(); });
    });
  }

  /* ---------- Modal / exit intent ---------- */
  var modal = $("#lead-modal");
  function openModal() { if (!modal) return; modal.classList.add("show"); store.set("exit-shown", "1", true); var i = $("input[type=email]", modal); if (i) setTimeout(function () { i.focus(); }, 50); }
  function closeModal() { if (modal) modal.classList.remove("show"); }
  S10500.openModal = openModal;
  if (modal) {
    $$("[data-close]", modal).forEach(function (b) { b.addEventListener("click", closeModal); });
    modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
    var noExit = document.body.hasAttribute("data-no-exit");
    if (!noExit && !store.get("exit-shown", true)) {
      document.addEventListener("mouseout", function (e) { if (!e.relatedTarget && e.clientY < 8 && !store.get("exit-shown", true)) openModal(); });
      var fired = false;
      window.addEventListener("scroll", function () {
        if (fired || store.get("exit-shown", true) || window.innerWidth > 767) return;
        var p = (window.scrollY + innerHeight) / document.body.scrollHeight;
        if (p > .75) { fired = true; setTimeout(openModal, 1200); }
      }, { passive: true });
    }
  }
  $$("[data-open-modal]").forEach(function (b) { b.addEventListener("click", function (e) { e.preventDefault(); openModal(); }); });

  /* ---------- Reveal ---------- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } }); }, { threshold: .12 });
    $$(".reveal").forEach(function (el) { io.observe(el); });
  } else $$(".reveal").forEach(function (el) { el.classList.add("in"); });

  /* ---------- Float CTA ---------- */
  var fc = $(".float-cta"); if (fc) window.addEventListener("scroll", function () { fc.style.display = window.scrollY > 700 && innerWidth > 767 ? "block" : ""; }, { passive: true });

  /* ---------- Speech (Mandarin) ---------- */
  S10500.speak = function (text) {
    if (!("speechSynthesis" in window)) { toast("Speech not supported in this browser"); return; }
    var u = new SpeechSynthesisUtterance(text); u.lang = "zh-CN"; u.rate = .85;
    var v = speechSynthesis.getVoices().filter(function (x) { return /zh[-_]CN|Chinese|普通话/i.test(x.lang + x.name); })[0]; if (v) u.voice = v;
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  };
  document.addEventListener("click", function (e) { var s = e.target.closest("[data-speak]"); if (s) S10500.speak(s.getAttribute("data-speak")); });

  /* ---------- Lucky number of the day ---------- */
  $$("[data-lucky-today]").forEach(function (el) {
    var d = new Date(), seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    var pool = ["8", "88", "168", "518", "666", "888", "99", "1314", "520", "6", "9", "28", "18", "368", "668", "189", "5188", "1688", "8888", "10500"];
    el.textContent = pool[(seed * 9301 + 49297) % 233280 % pool.length];
  });

  /* ---------- Search ---------- */
  document.addEventListener("DOMContentLoaded", function () {
  var sf = $("#site-search-form");
  if (sf && window.SEARCH_INDEX) {
    var q = new URLSearchParams(location.search).get("q") || ""; var inp = $("input", sf); inp.value = q;
    function run(qs) {
      var out = $("#search-results"); qs = qs.trim().toLowerCase();
      if (!qs) { out.innerHTML = ""; return; }
      var terms = qs.split(/\s+/);
      var res = SEARCH_INDEX.map(function (p) {
        var hay = (p.t + " " + p.d + " " + p.k).toLowerCase(), sc = 0;
        terms.forEach(function (t) { if (p.t.toLowerCase().indexOf(t) > -1) sc += 5; if (hay.indexOf(t) > -1) sc += 1; });
        return { p: p, s: sc };
      }).filter(function (x) { return x.s > 0; }).sort(function (a, b) { return b.s - a.s; });
      out.innerHTML = res.length ? res.map(function (x) { return '<a href="' + x.p.u + '"><b>' + x.p.t + '</b><span>' + x.p.d + '</span></a>'; }).join("") : "<p class='muted'>No results. Try “lucky”, “salary”, “zodiac” or “red envelope”.</p>";
    }
    run(q); inp.addEventListener("input", function () { run(inp.value); });
    sf.addEventListener("submit", function (e) { e.preventDefault(); run(inp.value); history.replaceState(null, "", "?q=" + encodeURIComponent(inp.value)); });
  }
  });
})();
