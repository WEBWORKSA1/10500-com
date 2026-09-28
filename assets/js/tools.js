/* 10500.com — interactive tools */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var fmt = function (n, d) { return Number(n).toLocaleString("en-US", { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); };
  var params = new URLSearchParams(location.search);
  function setParams(obj) { var p = new URLSearchParams(); Object.keys(obj).forEach(function (k) { if (obj[k] !== "" && obj[k] != null) p.set(k, obj[k]); }); history.replaceState(null, "", location.pathname + "?" + p.toString()); }

  /* ======================= LUCKY NUMBER ANALYZER ======================= */
  var an = $("#analyzer");
  if (an) {
    var modeBtns = $$("[data-mode]", an), mode = params.get("mode") || "phone";
    var hints = { phone: "e.g. 138 8888 1688", plate: "e.g. ABC 8868", address: "e.g. 1688 Harmony Rd, Unit 1808", price: "e.g. 10500", date: "e.g. 2026-08-08", domain: "e.g. 10500.com" };
    function setMode(m) { mode = m; modeBtns.forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-mode") === m); }); $("#an-input").placeholder = hints[m] || ""; }
    modeBtns.forEach(function (b) { b.addEventListener("click", function () { setMode(b.getAttribute("data-mode")); }); });
    setMode(mode);
    function analyze(raw) {
      var digits = String(raw).replace(/\D/g, "");
      if (!digits) return null;
      var W = {}; DIGITS.forEach(function (d) { W[d.n] = d.w; });
      var sum = 0, fw = 0, L = digits.length;
      for (var i = 0; i < L; i++) { var f = i >= L - 4 ? 1.6 : 1; sum += W[digits[i]] * f; fw += f; }
      var base = 50 + (sum / fw) * 4;
      var found = [], bonus = 0;
      COMBOS.slice().sort(function (a, b) { return b.c.length - a.c.length; }).forEach(function (c) {
        if (c.c.length < 2) return;
        var idx = digits.indexOf(c.c); if (idx < 0) return;
        if (found.some(function (x) { return x.c.indexOf(c.c) > -1 && x.t === c.t; })) return;
        var endBoost = idx + c.c.length >= L - 1 ? 1.5 : 1;
        var val = (c.t === "good" ? 5 : c.t === "bad" ? -7 : 0) * Math.min(c.c.length, 4) / 2 * endBoost;
        bonus += val; found.push({ c: c.c, zh: c.zh, m: c.m, t: c.t, v: val });
      });
      // repetition & sequences
      var rep = digits.match(/(\d)\1{2,}/g) || [];
      rep.forEach(function (r) { var v = W[r[0]] > 0 ? 3 * r.length : W[r[0]] < 0 ? -3 * r.length : 1; bonus += v; });
      if (/(0123|1234|2345|3456|5678|6789)/.test(digits)) { bonus += 4; found.push({ c: "↗", zh: "步步高升", m: "Ascending sequence means rising step by step.", t: "good", v: 4 }); }
      bonus = Math.max(-35, Math.min(30, bonus));
      var score = Math.round(Math.max(1, Math.min(99, base + bonus)));
      var fours = (digits.match(/4/g) || []).length, eights = (digits.match(/8/g) || []).length;
      var grade = score >= 85 ? ["Exceptional", "大吉 · Very auspicious"] : score >= 70 ? ["Very lucky", "吉 · Auspicious"] : score >= 55 ? ["Good", "小吉 · Mildly auspicious"] : score >= 40 ? ["Neutral", "平 · Balanced"] : ["Unlucky", "凶 · Consider alternatives"];
      return { digits: digits, score: score, grade: grade, found: found, fours: fours, eights: eights, reps: rep };
    }
    function tipsFor(r) {
      var t = [];
      if (r.fours) t.push("It contains " + r.fours + " × 4 (sounds like “death”). If you can choose, swap 4s for 8s or 6s.");
      if (/4$/.test(r.digits)) t.push("It ends in 4. Endings carry the most weight in Chinese number reading.");
      if (/8$/.test(r.digits)) t.push("It ends in 8. Ending on prosperity is the classic lucky pattern.");
      if (!r.eights && r.score < 70) t.push("No 8s. Adding an 8 or 88 near the end would lift the score a lot.");
      if (mode === "price") t.push("Pricing tip: in Chinese markets, prices ending in 8 or 88 (e.g. 10,588 or 10,888) signal prosperity. Avoid ending in 4.");
      if (mode === "address") t.push("Addresses: many buyers avoid units or floors containing 4 or 14, and resale can be harder. Ask before you buy.");
      if (mode === "date") t.push("Dates: double digits (6/6, 8/8, 9/9) and 520 / 1314 dates are popular for weddings and launches.");
      if (mode === "phone") t.push("Phones: the last 4 digits matter most, and a 4-digit ending such as 8888, 6666, 1688 or 5188 carries a premium.");
      if (mode === "plate") t.push("Plates: short plates with 8, 6, 9, 28 or 18 have sold for millions at Hong Kong auctions.");
      if (mode === "domain") t.push("Numeric domains are highly brandable in China (163.com, 58.com, 360.cn). Luck adds resale value.");
      return t;
    }
    function render(raw) {
      var r = analyze(raw), box = $("#an-result");
      if (!r) { S10500.toast("Enter a number that contains digits"); return; }
      var chips = r.digits.split("").map(function (d) { var x = DIGITS[+d]; return '<div class="digit ' + (x.tone === "good" ? "good" : x.tone === "bad" ? "bad" : "") + '"><b>' + d + '</b><small class="cn">' + x.zh.split(" ")[0] + '</small><small>' + x.py.split(" ")[0] + "</small></div>"; }).join("");
      var combos = r.found.length ? r.found.map(function (f) { return "<li><b>" + esc(f.c) + "</b> <span class='cn'>" + esc(f.zh) + "</span>: " + esc(f.m) + " <span class='tag " + (f.t === "good" ? "green" : f.t === "bad" ? "red" : "") + "'>" + (f.v > 0 ? "+" : "") + Math.round(f.v) + "</span></li>"; }).join("") : "<li>No famous combinations found. The score comes from individual digits.</li>";
      var reading = CN.digitReading(r.digits, mode === "phone" || mode === "plate");
      box.innerHTML =
        '<div class="result-head"><div class="score-ring" style="--p:' + r.score + '"><div><div><b>' + r.score + '</b><small>/ 100</small></div></div></div>' +
        '<div><span class="eyebrow">Luck score</span><h3 style="margin:0">' + r.grade[0] + '</h3><p class="cn" style="margin:4px 0">' + r.grade[1] + '</p>' +
        '<p class="small muted" style="margin:0">Chinese reading: <span class="cn">' + reading + '</span> <button class="copy" data-speak="' + reading + '">🔊 Listen</button></p></div></div>' +
        '<div class="digits">' + chips + '</div><h4>Combinations detected</h4><ul>' + combos + '</ul><h4>Tips</h4><ul>' + tipsFor(r).map(function (x) { return "<li>" + x + "</li>"; }).join("") + '</ul>' +
        '<div class="cta-inline"><div><b>Want the full Lucky Number Report (PDF) or a hand-picked premium number?</b><br><span class="small muted">Naming, pricing and premium-number sourcing by specialists.</span></div><a class="btn btn-primary btn-sm" href="concierge.html?service=numbers&amp;ref=analyzer&amp;n=' + encodeURIComponent(r.digits) + '">Get expert help →</a></div>' +
        '<div class="inline-form"><button class="btn btn-ghost btn-sm" data-share data-title="My lucky number score: ' + r.score + '/100">↗ Share result</button><button class="btn btn-ghost btn-sm" data-open-modal onclick="S10500.openModal()">✉ Email me the report</button></div>' +
        '<p class="small muted" style="margin-top:12px">For entertainment and cultural education only. Folk numerology is not a prediction or professional advice.</p>';
      box.classList.add("show");
      setParams({ mode: mode, n: raw });
    }
    $("#an-form").addEventListener("submit", function (e) { e.preventDefault(); render($("#an-input").value); });
    $$("[data-example]", an).forEach(function (b) { b.addEventListener("click", function () { $("#an-input").value = b.getAttribute("data-example"); render(b.getAttribute("data-example")); }); });
    if (params.get("n")) { $("#an-input").value = params.get("n"); render(params.get("n")); }
  }

  /* ======================= NUMBER CONVERTER ======================= */
  var cv = $("#converter");
  if (cv) {
    var dir = "a2c";
    var dirBtns = $$("[data-dir]", cv);
    function setDir(d) { dir = d; dirBtns.forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-dir") === d); }); $("#cv-input").placeholder = d === "a2c" ? "e.g. 10500 or 10500.50" : "e.g. 一万零五百 or 壹万零伍佰元整"; }
    dirBtns.forEach(function (b) { b.addEventListener("click", function () { setDir(b.getAttribute("data-dir")); }); });
    function row(label, val, id, speak) { return '<div class="out-row"><div><div class="small muted">' + label + '</div><div class="val" id="' + id + '">' + esc(val) + '</div></div><div>' + (speak ? '<button class="copy" data-speak="' + esc(speak) + '">🔊</button> ' : "") + '<button class="copy" data-copy="' + id + '">Copy</button></div></div>'; }
    function convert(v) {
      v = String(v).trim(); var box = $("#cv-result"), html = "";
      if (!v) return;
      if (dir === "a2c") {
        var clean = v.replace(/[,\s_]/g, "");
        if (!/^-?\d+(\.\d+)?$/.test(clean) || clean.replace(/[-.]/g, "").split(".")[0].length > 16) { S10500.toast("Enter a number up to 16 digits"); return; }
        var s = CN.toChinese(clean), f = CN.toChinese(clean, { financial: true }), ts = CN.toChinese(clean, { traditional: true }), tf = CN.toChinese(clean, { financial: true, traditional: true });
        html += row("Simplified (小写)", s, "o1", s) + row("Pinyin", CN.pinyin(s), "o2") + row("Financial / cheque (大写) · CNY", f, "o3") + row("Traditional (繁體)", ts, "o4") + row("Traditional financial (繁體大写)", tf, "o5") + row("Digit-by-digit (phone style)", CN.digitReading(clean.replace(/[-.]/g, ""), true), "o6");
        html += '<div class="cheque"><div class="small">支票金额 / Cheque amount</div><div style="font-size:1.25rem;font-weight:700">人民币 ' + esc(f) + '</div><div class="small">¥ ' + esc(fmt(Math.abs(+clean), clean.indexOf(".") > -1 ? 2 : 0)) + '</div></div>';
        if (/^1\d{4}$/.test(clean) && clean[1] === "0" && clean[2] !== "0") html += '<div class="callout gold small"><b>Learner trap:</b> ' + fmt(clean) + ' is <span class="cn">' + esc(s) + '</span>. You need 零 because the thousands place is empty. <span class="cn">一万' + CN.D[+clean[2]] + '</span> means ' + fmt(+("1" + clean[2] + "000")) + '.</div>';
      } else {
        var n = CN.fromChinese(v);
        if (n == null || n === "NaN") { S10500.toast("Couldn't read that. Use Chinese numerals like 一万零五百"); return; }
        html += row("Arabic numeral", fmt(n.split(".")[0]) + (n.indexOf(".") > -1 ? "." + n.split(".")[1] : ""), "o1") + row("Plain digits", n, "o2") + row("Standard written form", CN.toChinese(n), "o3", CN.toChinese(n)) + row("Pinyin", CN.pinyin(CN.toChinese(n)), "o4");
        if (/^[一二三四五六七八九两][万千百][一二三四五六七八九]$/.test(v.replace(/\s/g, ""))) html += '<div class="callout gold small"><b>Colloquial shortcut detected:</b> <span class="cn">' + esc(v) + '</span> drops the last unit, so it means ' + fmt(n) + '.</div>';
      }
      box.innerHTML = html; box.classList.add("show"); setParams({ dir: dir, v: v });
    }
    $("#cv-form").addEventListener("submit", function (e) { e.preventDefault(); convert($("#cv-input").value); });
    $$("[data-example]", cv).forEach(function (b) { b.addEventListener("click", function () { var d = b.getAttribute("data-d") || "a2c"; setDir(d); $("#cv-input").value = b.getAttribute("data-example"); convert(b.getAttribute("data-example")); }); });
    setDir(params.get("dir") || "a2c");
    if (params.get("v")) { $("#cv-input").value = params.get("v"); convert(params.get("v")); }
  }

  /* ======================= RED ENVELOPE CALCULATOR ======================= */
  var hb = $("#hongbao");
  if (hb) {
    var REG = {
      cn1: { cur: "¥", code: "CNY", base: { lny: 200, wedding: 800, birthday: 400, baby: 400, grad: 300, business: 800, funeral: 300, house: 400 }, ladder: [20, 50, 66, 88, 99, 100, 128, 166, 168, 188, 200, 288, 300, 366, 388, 500, 520, 600, 666, 800, 888, 999, 1000, 1088, 1200, 1314, 1666, 1888, 2000, 2888, 3000, 3666, 5000, 6666, 8888, 10000, 18888] },
      cn2: { cur: "¥", code: "CNY", base: { lny: 100, wedding: 500, birthday: 200, baby: 200, grad: 200, business: 500, funeral: 200, house: 200 } },
      hk: { cur: "HK$", code: "HKD", base: { lny: 50, wedding: 800, birthday: 300, baby: 300, grad: 300, business: 600, funeral: 300, house: 300 }, ladder: [20, 50, 88, 100, 128, 168, 188, 200, 288, 300, 388, 500, 600, 688, 800, 888, 1000, 1288, 1688, 1888, 2000, 2888, 3888, 5000, 8888, 10000] },
      tw: { cur: "NT$", code: "TWD", base: { lny: 600, wedding: 2200, birthday: 1200, baby: 1200, grad: 1200, business: 1600, funeral: 1100, house: 1200 }, ladder: [200, 600, 800, 1000, 1200, 1600, 1800, 2000, 2200, 2600, 3200, 3600, 6000, 6600, 8800, 10000, 12000, 16000, 20000, 36000] },
      sg: { cur: "S$", code: "SGD", base: { lny: 10, wedding: 150, birthday: 50, baby: 50, grad: 50, business: 88, funeral: 50, house: 50 } },
      my: { cur: "RM", code: "MYR", base: { lny: 10, wedding: 200, birthday: 50, baby: 50, grad: 50, business: 100, funeral: 50, house: 50 } },
      na: { cur: "$", code: "USD/CAD", base: { lny: 20, wedding: 150, birthday: 50, baby: 50, grad: 50, business: 100, funeral: 50, house: 50 } },
      eu: { cur: "£/€/A$", code: "GBP/EUR/AUD", base: { lny: 20, wedding: 120, birthday: 40, baby: 40, grad: 40, business: 80, funeral: 40, house: 40 } }
    };
    var SMALL = [2, 5, 6, 8, 10, 12, 16, 18, 20, 28, 30, 38, 50, 66, 68, 88, 99, 100, 108, 128, 168, 188, 200, 288, 300, 388, 500, 588, 688, 888, 1000, 1288, 1888, 2888];
    REG.cn2.ladder = REG.cn1.ladder;
    var REL = { family: 3, relative: 1.8, close: 1.5, friend: 1, coworker: .8, acq: .5, employee: 1.2, child: 1.3 };
    var CLOSE = [0, .7, .85, 1, 1.25, 1.6];
    function snap(v, ladder) { var best = ladder[0]; ladder.forEach(function (x) { if (Math.abs(x - v) < Math.abs(best - v)) best = x; }); return best; }
    function neighbors(v, ladder) { var i = ladder.indexOf(v); return [ladder[Math.max(0, i - 1)], ladder[Math.min(ladder.length - 1, i + 1)]]; }
    function oddSnap(v) { var nice = [10, 20, 30, 50, 100, 200, 300, 500, 1000, 2000, 3000, 5000, 10000]; return snap(v, nice) + 1; }
    function calc() {
      var reg = REG[$("#hb-region").value], occ = $("#hb-occasion").value, rel = $("#hb-rel").value, cl = +$("#hb-close").value;
      var raw = reg.base[occ] * REL[rel] * CLOSE[cl];
      var ladder = reg.ladder || SMALL, amt, lo, hi, notes = [];
      if (occ === "funeral") { amt = oddSnap(raw); lo = oddSnap(raw * .6); hi = oddSnap(raw * 1.6); notes.push("Funeral gifts (白金 / 帛金) use a <b>white</b> envelope, and many communities give <b>odd</b> amounts. Never use a red envelope for a funeral."); }
      else { amt = snap(raw, ladder); var nb = neighbors(amt, ladder); lo = nb[0]; hi = nb[1]; notes.push("Use a <b>red</b> envelope, with even or lucky amounts (6, 8, 9). Avoid any amount containing <b>4</b>."); }
      if (occ === "wedding") notes.push("Weddings: many guests aim to at least cover their banquet seat. Amounts like 1314, 520 or 999 carry romantic meaning.");
      if (occ === "lny") notes.push("Lunar New Year: give with both hands, use crisp new notes, and say 新年快乐 (xīn nián kuài lè) or 恭喜发财 (gōng xǐ fā cái).");
      if (occ === "business") notes.push("Business openings: 8-ending amounts (888, 1688) wish the business prosperity (生意兴隆).");
      if (rel === "employee") notes.push("As an employer, keep amounts consistent within each level so no one feels slighted.");
      notes.push("Don't open a red envelope in front of the giver. Thank them and put it away.");
      $("#hb-result").innerHTML = '<span class="eyebrow">Suggested amount</span><div class="bignum">' + reg.cur + fmt(amt) + '</div><p class="muted">Typical range: ' + reg.cur + fmt(lo) + " – " + reg.cur + fmt(hi) + " (" + reg.code + ')</p><ul>' + notes.map(function (n) { return "<li>" + n + "</li>"; }).join("") + '</ul><p class="small muted">Guidance built from common customs; family and local norms vary. You know your relationships best.</p><div class="inline-form"><button class="btn btn-ghost btn-sm" data-share data-title="Red envelope amount calculator">↗ Share</button> <a class="btn btn-gold btn-sm" href="support.html">Like this tool? Support us</a></div>';
      $("#hb-result").classList.add("show");
    }
    $("#hb-form").addEventListener("submit", function (e) { e.preventDefault(); calc(); });
    $("#hb-close").addEventListener("input", function () { $("#hb-close-out").textContent = ["", "Distant", "Casual", "Normal", "Close", "Very close"][+this.value]; });
  }

  /* ======================= ZODIAC ======================= */
  var zd = $("#zodiac");
  if (zd) {
    var ELEM = ["Metal", "Metal", "Water", "Water", "Wood", "Wood", "Fire", "Fire", "Earth", "Earth"], ELZH = { Metal: "金", Water: "水", Wood: "木", Fire: "火", Earth: "土" };
    function lunarInfo(date) {
      try {
        var parts = new Intl.DateTimeFormat("en-u-ca-chinese", { year: "numeric", month: "numeric", day: "numeric", timeZone: "Asia/Shanghai" }).formatToParts(date);
        var o = {}; parts.forEach(function (p) { o[p.type] = p.value; });
        var y = +(o.relatedYear || o.year);
        if (!y || y < 1000) return null;
        return { year: y, month: o.month, day: o.day, exact: true };
      } catch (e) { return null; }
    }
    function sign(y) { return ((y - 4) % 12 + 12) % 12; }
    function info(dateStr) {
      var d = new Date(dateStr + "T12:00:00+08:00"), gy = +dateStr.slice(0, 4);
      var li = lunarInfo(d) || { year: gy, exact: false };
      var idx = sign(li.year), el = ELEM[((li.year % 10) + 10) % 10];
      return { idx: idx, z: ZODIAC[idx], el: el, yin: li.year % 2 ? "Yin" : "Yang", ly: li.year, li: li, gy: gy };
    }
    var TRINE = [[0, 4, 8], [1, 5, 9], [2, 6, 10], [3, 7, 11]], HARM6 = [[0, 1], [2, 11], [3, 10], [4, 9], [5, 8], [6, 7]], CLASH = [[0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11]], HARM = [[0, 7], [1, 6], [2, 5], [3, 4], [8, 11], [9, 10]];
    function pairIn(list, a, b) { return list.some(function (p) { return (p[0] === a && p[1] === b) || (p[0] === b && p[1] === a); }); }
    function compat(a, b) {
      if (a === b) return [70, "Same sign: you understand each other well, but you may compete."];
      if (TRINE.some(function (t) { return t.indexOf(a) > -1 && t.indexOf(b) > -1; })) return [92, "Trine (三合): one of the most harmonious pairings, with shared values and a natural team."];
      if (pairIn(HARM6, a, b)) return [88, "Six Harmony (六合): a complementary, supportive match."];
      if (pairIn(CLASH, a, b)) return [35, "Clash (六冲): opposite signs, so expect friction and plenty of chemistry. It needs conscious effort."];
      if (pairIn(HARM, a, b)) return [48, "Harm (六害): small misunderstandings can build up. Communication is key."];
      return [65, "Neutral: a workable match. Results depend on the individuals."];
    }
    $("#zd-form").addEventListener("submit", function (e) {
      e.preventDefault(); var v = $("#zd-date").value; if (!v) return;
      var r = info(v), note = "";
      if (r.ly !== r.gy) note = '<div class="callout gold small"><b>Lunar New Year adjustment:</b> you were born before that year\'s Lunar New Year, so your sign belongs to the previous lunar year (' + r.ly + ').</div>';
      if (!r.li.exact) note += '<p class="small muted">Your browser lacks the Chinese calendar, so this uses the Gregorian year. Births in January or February may belong to the previous sign.</p>';
      $("#zd-result").innerHTML = '<div class="result-head"><div style="font-size:4rem;line-height:1">' + r.z.e + '</div><div><span class="eyebrow">Your sign</span><h3 style="margin:0">' + r.el + " " + r.z.a + ' <span class="cn">' + ELZH[r.el] + r.z.zh + '</span></h3><p class="muted" style="margin:4px 0">' + r.yin + " · Lunar year " + r.ly + (r.li.exact ? " · Lunar date: month " + r.li.month + ", day " + r.li.day : "") + '</p><p style="margin:0">' + r.z.tr + '</p></div></div>' + note +
        '<p class="small" style="margin-top:12px">Your years: ' + [-24, -12, 0, 12, 24, 36].map(function (k) { return r.ly + k; }).join(" · ") + '</p><div class="inline-form"><button class="btn btn-ghost btn-sm" data-share data-title="I\'m a ' + r.el + " " + r.z.a + '! Find your Chinese zodiac">↗ Share</button><a class="btn btn-primary btn-sm" href="concierge.html?service=consult&amp;ref=zodiac">Book a personal reading →</a></div>';
      $("#zd-result").classList.add("show");
    });
    var opts = ZODIAC.map(function (z, i) { return '<option value="' + i + '">' + z.e + " " + z.a + " " + z.zh + "</option>"; }).join("");
    $("#zc-a").innerHTML = opts; $("#zc-b").innerHTML = opts; $("#zc-b").value = "4";
    $("#zc-form").addEventListener("submit", function (e) {
      e.preventDefault(); var a = +$("#zc-a").value, b = +$("#zc-b").value, c = compat(a, b);
      $("#zc-result").innerHTML = '<div class="result-head"><div class="score-ring" style="--p:' + c[0] + '"><div><div><b>' + c[0] + '</b><small>match</small></div></div></div><div><h3 style="margin:0">' + ZODIAC[a].e + " " + ZODIAC[a].a + " + " + ZODIAC[b].e + " " + ZODIAC[b].a + '</h3><p style="margin:6px 0 0">' + c[1] + "</p></div></div>";
      $("#zc-result").classList.add("show");
    });
    $("#zd-grid").innerHTML = ZODIAC.map(function (z, i) { var ys = []; for (var y = 1960 + ((i - 1960 + 4) % 12 + 12) % 12; y <= 2031; y += 12) ys.push(y); return '<div class="card num-card"><div style="font-size:2.4rem">' + z.e + '</div><h3 style="margin:6px 0 2px">' + z.a + ' <span class="cn">' + z.zh + '</span></h3><p class="small muted" style="margin:0 0 6px">' + z.tr + '</p><p class="small" style="margin:0">' + ys.join(", ") + "</p></div>"; }).join("");
  }

  /* ======================= CHINA SALARY CALCULATOR ======================= */
  var sc = $("#salary");
  if (sc) {
    var BR = [[36000, .03, 0], [144000, .10, 2520], [300000, .20, 16920], [420000, .25, 31920], [660000, .30, 52920], [960000, .35, 85920], [Infinity, .45, 181920]];
    function iit(annualTaxable) { if (annualTaxable <= 0) return 0; for (var i = 0; i < BR.length; i++) if (annualTaxable <= BR[i][0]) return annualTaxable * BR[i][1] - BR[i][2]; return 0; }
    function run() {
      var g = +$("#sc-gross").value || 0, baseIn = +$("#sc-base").value || g;
      var p = +$("#sc-pen").value / 100, m = +$("#sc-med").value / 100, u = +$("#sc-une").value / 100, h = +$("#sc-hf").value / 100, sd = +$("#sc-sd").value || 0;
      var si = baseIn * (p + m + u), hf = baseIn * h;
      var taxableM = Math.max(0, g - si - hf - 5000 - sd), taxA = iit(taxableM * 12), taxM = taxA / 12;
      var net = g - si - hf - taxM;
      var tot = g || 1, w = function (x) { return (x / tot * 100).toFixed(2) + "%"; };
      var avgNP = 129441 / 12, avgP = 71590 / 12;
      $("#sc-result").innerHTML = '<span class="eyebrow">Estimated monthly take-home</span><div class="bignum">¥' + fmt(net, 2) + '</div><p class="muted">≈ ¥' + fmt(net * 12, 0) + ' per year · effective total deduction ' + ((1 - net / tot) * 100).toFixed(1) + '%</p>' +
        '<div class="bar" aria-hidden="true"><i style="width:' + w(net) + ';background:var(--ok)"></i><i style="width:' + w(si) + ';background:var(--gold)"></i><i style="width:' + w(hf) + ';background:#6b8afd"></i><i style="width:' + w(taxM) + ';background:var(--red)"></i></div>' +
        '<div class="legend"><span style="--c:var(--ok)">Net ¥' + fmt(net, 0) + '</span><span style="--c:var(--gold)">Social insurance ¥' + fmt(si, 0) + '</span><span style="--c:#6b8afd">Housing fund ¥' + fmt(hf, 0) + '</span><span style="--c:var(--red)">Income tax ¥' + fmt(taxM, 0) + '</span></div>' +
        '<div class="table-wrap" style="margin-top:14px"><table><tbody><tr><td>Gross monthly salary</td><td>¥' + fmt(g, 2) + '</td></tr><tr><td>Social insurance (' + ((p + m + u) * 100).toFixed(1) + '%)</td><td>−¥' + fmt(si, 2) + '</td></tr><tr><td>Housing provident fund (' + (h * 100).toFixed(0) + '%)</td><td>−¥' + fmt(hf, 2) + '</td></tr><tr><td>Basic deduction</td><td>¥5,000.00</td></tr><tr><td>Special additional deductions</td><td>¥' + fmt(sd, 2) + '</td></tr><tr><td>Taxable income (monthly avg.)</td><td>¥' + fmt(taxableM, 2) + '</td></tr><tr><td>Individual income tax (avg./month)</td><td>−¥' + fmt(taxM, 2) + '</td></tr><tr><td><b>Net pay</b></td><td><b>¥' + fmt(net, 2) + '</b></td></tr></tbody></table></div>' +
        '<div class="callout small" style="margin-top:14px"><b>How you compare (NBS 2025):</b> the average urban non-private employee earns ≈ ¥' + fmt(avgNP) + '/month gross; urban private-sector ≈ ¥' + fmt(avgP) + '/month. Your gross is <b>' + (g / avgNP * 100).toFixed(0) + '%</b> of the non-private average.</div>' +
        '<p class="small muted">Estimate only. Under cumulative withholding, monthly tax rises during the year while the annual total matches this. Contribution bases have city-specific floors and caps. This is not tax advice.</p>' +
        '<div class="inline-form"><button class="btn btn-ghost btn-sm" data-share data-title="China salary after tax calculator">↗ Share</button><a class="btn btn-primary btn-sm" href="concierge.html?service=entry&amp;ref=salary">Hiring or relocating to China? Talk to us →</a></div>';
      $("#sc-result").classList.add("show"); setParams({ g: g });
    }
    $("#sc-form").addEventListener("submit", function (e) { e.preventDefault(); run(); });
    if (params.get("g")) { $("#sc-gross").value = params.get("g"); run(); }
  }

  /* ======================= MEANINGS DATABASE ======================= */
  var md = $("#meanings-db");
  if (md) {
    $("#digit-grid").innerHTML = DIGITS.map(function (d) { return '<div class="card num-card reveal in"><div class="n">' + d.n + '</div><div class="c">' + d.zh + '</div><div class="small muted">' + d.py + '</div><span class="tag ' + (d.tone === "good" ? "green" : d.tone === "bad" ? "red" : "") + '">' + (d.tone === "good" ? "Lucky" : d.tone === "bad" ? "Unlucky" : "Mixed") + '</span><p class="small" style="margin:10px 0 4px"><b>Sounds like:</b> ' + d.sound + '</p><p class="small" style="margin:0">' + d.meaning + '</p><button class="copy" style="margin-top:8px" data-speak="' + d.zh.split(" ")[0] + '">🔊 Hear it</button></div>'; }).join("");
    var filter = "all";
    function draw() {
      var q = ($("#md-q").value || "").toLowerCase().trim();
      var rows = COMBOS.filter(function (c) { return (filter === "all" || c.t === filter || c.tags.indexOf(filter) > -1) && (!q || (c.c + c.zh + c.m + c.tags).toLowerCase().indexOf(q) > -1); });
      $("#md-body").innerHTML = rows.map(function (c) { return "<tr><td><b style='font-size:1.1rem'>" + c.c + "</b></td><td class='cn'>" + c.zh + "</td><td>" + c.m + "</td><td><span class='tag " + (c.t === "good" ? "green" : c.t === "bad" ? "red" : "") + "'>" + (c.t === "good" ? "Lucky" : c.t === "bad" ? "Avoid" : "Neutral") + "</span></td></tr>"; }).join("") || "<tr><td colspan=4>No matches.</td></tr>";
      $("#md-count").textContent = rows.length + " combinations";
    }
    $("#md-q").addEventListener("input", draw);
    $$("[data-filter]", md).forEach(function (b) { b.addEventListener("click", function () { filter = b.getAttribute("data-filter"); $$("[data-filter]", md).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); }); draw(); }); });
    draw();
  }

  /* ======================= QUIZ ======================= */
  var qz = $("#quiz");
  if (qz) {
    var lvl = "easy", score = 0, streak = 0, best = 0, answer;
    try { best = +localStorage.getItem("quiz-best") || 0; } catch (e) {}
    function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
    function gen() { if (lvl === "easy") return rnd(0, 99); if (lvl === "mid") return rnd(100, 9999); return [10500, 15000, 10050, 100000, 105000, 1500, 1050, 20008, 30300, 88888][rnd(0, 9)] + (Math.random() < .5 ? 0 : rnd(1, 9) * 1000 * (Math.random() < .5 ? 1 : 0)); }
    function next() {
      answer = gen(); var set = [answer];
      while (set.length < 4) { var d = lvl === "hard" ? [answer + 4500, answer - 500, answer * 10, Math.round(answer / 10), answer + 1000][rnd(0, 4)] : gen(); if (d >= 0 && set.indexOf(d) < 0) set.push(d); }
      set.sort(function () { return Math.random() - .5; });
      $("#qz-q").textContent = CN.toChinese(answer);
      $("#qz-q").setAttribute("data-speak", CN.toChinese(answer));
      $("#qz-opts").innerHTML = set.map(function (n) { return '<button data-v="' + n + '">' + fmt(n) + "</button>"; }).join("");
    }
    $("#qz-opts").addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b || $("#qz-opts").dataset.lock) return;
      var ok = +b.getAttribute("data-v") === answer; $("#qz-opts").dataset.lock = "1";
      b.classList.add(ok ? "right" : "wrong");
      if (!ok) $$("#qz-opts button").forEach(function (x) { if (+x.getAttribute("data-v") === answer) x.classList.add("right"); });
      if (ok) { score++; streak++; if (streak > best) { best = streak; try { localStorage.setItem("quiz-best", best); } catch (e) {} } } else streak = 0;
      $("#qz-score").textContent = score; $("#qz-streak").textContent = streak; $("#qz-best").textContent = best;
      setTimeout(function () { delete $("#qz-opts").dataset.lock; next(); }, ok ? 700 : 1600);
    });
    $$("[data-lvl]", qz).forEach(function (b) { b.addEventListener("click", function () { lvl = b.getAttribute("data-lvl"); $$("[data-lvl]", qz).forEach(function (x) { x.classList.toggle("active", x === b); }); next(); }); });
    $("#qz-best").textContent = best; next();
  }

  /* ======================= MULTI-STEP LEAD FORM ======================= */
  var lf = $("#lead-form");
  if (lf) {
    var steps = $$(".step", lf), cur = 0, bar = $(".progress i", lf.parentElement);
    function show(i) {
      cur = i; steps.forEach(function (s, k) { s.classList.toggle("active", k === i); });
      if (bar) bar.style.width = ((i + 1) / steps.length * 100) + "%";
      var lab = $("#step-label"); if (lab) lab.textContent = "Step " + (i + 1) + " of " + steps.length;
    }
    function valid(i) {
      var ok = true; $$("input,select,textarea", steps[i]).forEach(function (el) { if (ok && !el.checkValidity()) { el.reportValidity(); ok = false; } });
      if (ok && i === 0 && !$("input[name=service]:checked", lf)) { S10500.toast("Choose a service to continue"); ok = false; }
      return ok;
    }
    lf.addEventListener("click", function (e) {
      if (e.target.closest("[data-next]")) { e.preventDefault(); if (valid(cur)) { show(cur + 1); lf.scrollIntoView({ behavior: "smooth", block: "start" }); } }
      if (e.target.closest("[data-prev]")) { e.preventDefault(); show(cur - 1); }
    });
    lf._reset = function () { show(0); };
    var svc = params.get("service");
    if (svc) { var r = $("input[name=service][data-key=" + svc + "]", lf); if (r) r.checked = true; }
    var n = params.get("n"); if (n && $("[name=details]", lf)) $("[name=details]", lf).value = "Number I analyzed: " + n + "\n";
    if (params.get("ref") && $("[name=source_tool]", lf)) $("[name=source_tool]", lf).value = params.get("ref");
    show(0);
  }

  /* ======================= DONATIONS ======================= */
  var dn = $("#donate");
  if (dn) {
    var C = window.SITE_CONFIG || {}, amount = 25;
    $$("[data-amt]", dn).forEach(function (b) { b.addEventListener("click", function () { amount = +b.getAttribute("data-amt"); $$("[data-amt]", dn).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); }); $("#dn-custom").value = ""; upd(); }); });
    $("#dn-custom").addEventListener("input", function () { amount = +this.value || 0; $$("[data-amt]", dn).forEach(function (x) { x.setAttribute("aria-pressed", "false"); }); upd(); });
    function upd() { $("#dn-amt").textContent = "$" + fmt(amount); $("#dn-amount-field").value = amount; }
    var rails = [["PayPal", S10500.paypalUrl ? "pp" : ""], ["Ko-fi", C.kofi], ["Buy Me a Coffee", C.buyMeACoffee], ["GitHub Sponsors", C.githubSponsors], ["Card (Stripe)", C.stripeLink]];
    $("#dn-rails").innerHTML = rails.filter(function (r) { return r[1]; }).map(function (r) { return '<button type="button" class="btn ' + (r[0] === "PayPal" ? "btn-primary" : "btn-ghost") + '" data-rail="' + r[0] + '">' + (r[0] === "PayPal" ? "Donate with PayPal" : r[0]) + "</button>"; }).join("");
    $("#dn-rails").addEventListener("click", function (e) {
      var b = e.target.closest("[data-rail]"); if (!b) return; var k = b.getAttribute("data-rail"), url;
      if (k === "PayPal") url = S10500.paypalUrl(amount); else rails.forEach(function (r) { if (r[0] === k) url = r[1]; });
      if (url) window.open(url, "_blank", "noopener");
    });
    upd();
  }

  /* ======================= CONTEST ======================= */
  var ct = $("#contest");
  if (ct) {
    function tick() {
      var now = new Date(), end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59), s = Math.max(0, (end - now) / 1000);
      $("#cd-d").textContent = Math.floor(s / 86400); $("#cd-h").textContent = Math.floor(s % 86400 / 3600); $("#cd-m").textContent = Math.floor(s % 3600 / 60); $("#cd-s").textContent = Math.floor(s % 60);
      $("#ct-month").textContent = now.toLocaleString("en-US", { month: "long", year: "numeric" });
    }
    tick(); setInterval(tick, 1000);
    var refIn = $("[name=referred_by]"); try { var u = JSON.parse(sessionStorage.getItem("utm") || "{}"); if (u.ref && refIn) refIn.value = u.ref; } catch (e) {}
    var gen = $("#ref-gen");
    if (gen) gen.addEventListener("submit", function (e) {
      e.preventDefault(); var nm = ($("#ref-name").value || "friend").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 12) || "friend";
      var code = nm + Math.floor(100 + Math.random() * 900), link = location.origin + location.pathname + "?ref=" + code;
      $("#ref-out").innerHTML = '<div class="out-row"><div><div class="small muted">Your referral link (+3 bonus entries per friend who enters)</div><div class="val" id="ref-link" style="font-family:inherit;font-size:1rem">' + esc(link) + '</div></div><button class="copy" data-copy="ref-link">Copy</button></div>';
    });
  }
})();
