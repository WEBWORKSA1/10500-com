/* 10500.com — Chinese number engine (shared by converter, analyzer, learn & quiz) */
(function (g) {
  "use strict";
  var D = "零一二三四五六七八九".split("");
  var F = "零壹贰叁肆伍陆柒捌玖".split("");
  var U = ["", "十", "百", "千"], FU = ["", "拾", "佰", "仟"];
  var G = ["", "万", "亿", "万亿"];
  var PY = { "零": "líng", "〇": "líng", "一": "yī", "二": "èr", "三": "sān", "四": "sì", "五": "wǔ", "六": "liù", "七": "qī", "八": "bā", "九": "jiǔ", "十": "shí", "百": "bǎi", "千": "qiān", "万": "wàn", "亿": "yì", "点": "diǎn", "两": "liǎng", "幺": "yāo", "负": "fù",
    "壹": "yī", "贰": "èr", "叁": "sān", "肆": "sì", "伍": "wǔ", "陆": "liù", "柒": "qī", "捌": "bā", "玖": "jiǔ", "拾": "shí", "佰": "bǎi", "仟": "qiān", "元": "yuán", "角": "jiǎo", "分": "fēn", "整": "zhěng" };
  var TRAD = { "万": "萬", "亿": "億", "点": "點", "贰": "貳", "叁": "參", "陆": "陸", "负": "負", "两": "兩" };

  function group4(s, digits, units) {
    var out = "", zero = false, started = false;
    for (var i = 0; i < 4; i++) {
      var d = +s.charAt(i), pos = 3 - i;
      if (d === 0) { if (started) zero = true; continue; }
      if (zero) { out += digits[0]; zero = false; }
      out += digits[d] + units[pos]; started = true;
    }
    return out;
  }
  function intToChinese(str, financial) {
    str = String(str).replace(/^0+(?=\d)/, "");
    if (!/^\d+$/.test(str)) return "";
    if (str.length > 16) return "";
    var digits = financial ? F : D, units = financial ? FU : U;
    if (/^0+$/.test(str)) return digits[0];
    var pad = (4 - (str.length % 4)) % 4; str = "0000".slice(0, pad) + str;
    var groups = []; for (var i = 0; i < str.length; i += 4) groups.push(str.slice(i, i + 4));
    var res = "", needZero = false, n = groups.length;
    for (var j = 0; j < n; j++) {
      var gs = groups[j], gi = n - 1 - j, v = +gs;
      if (v === 0) { if (res) needZero = true; continue; }
      if (res && (needZero || v < 1000)) res += digits[0];
      res += group4(gs, digits, units) + G[gi]; needZero = false;
    }
    if (!financial && res.indexOf("一十") === 0) res = res.slice(1);
    return res;
  }
  function toChinese(input, opts) {
    opts = opts || {};
    var s = String(input).replace(/[,\s_]/g, "");
    var neg = false; if (s.charAt(0) === "-") { neg = true; s = s.slice(1); }
    if (!/^\d+(\.\d+)?$/.test(s)) return "";
    var parts = s.split("."), out;
    if (opts.financial) {
      var ip = parts[0], dp = (parts[1] || "").slice(0, 2);
      var j = +(dp.charAt(0) || 0), f = +(dp.charAt(1) || 0);
      var intPart = +ip === 0 && (j || f) ? "" : intToChinese(ip, true) + "元";
      if (!intPart && !j && !f) intPart = "零元";
      var tail = "";
      if (!j && !f) tail = "整";
      else {
        if (j) tail += F[j] + "角"; else if (intPart) tail += "零";
        if (f) tail += F[f] + "分"; else tail += "整";
      }
      out = intPart + tail;
    } else {
      out = intToChinese(parts[0], false);
      if (parts[1]) out += "点" + parts[1].split("").map(function (c) { return D[+c]; }).join("");
    }
    if (!out) return "";
    if (neg) out = "负" + out;
    if (opts.traditional) out = out.split("").map(function (c) { return TRAD[c] || c; }).join("");
    return out;
  }
  function pinyin(zh) {
    return zh.split("").map(function (c) {
      var k = c; for (var t in TRAD) if (TRAD[t] === c) k = t;
      return PY[k] || c;
    }).join(" ");
  }
  var VAL = { "零": 0, "〇": 0, "一": 1, "壹": 1, "幺": 1, "二": 2, "贰": 2, "貳": 2, "两": 2, "兩": 2, "三": 3, "叁": 3, "參": 3, "四": 4, "肆": 4, "五": 5, "伍": 5, "六": 6, "陆": 6, "陸": 6, "七": 7, "柒": 7, "八": 8, "捌": 8, "九": 9, "玖": 9 };
  var UNIT = { "十": 10, "拾": 10, "百": 100, "佰": 100, "千": 1000, "仟": 1000 };
  function fromChinese(str) {
    str = String(str).replace(/\s|元|圓|圆|整/g, "");
    if (!str) return null;
    var neg = false; if (/^[负負]/.test(str)) { neg = true; str = str.slice(1); }
    var dec = ""; var m = str.split(/[点點]/);
    if (m.length > 1) { dec = m[1].split("").map(function (c) { return VAL[c] != null ? VAL[c] : ""; }).join(""); str = m[0]; }
    var hasUnit = /[十拾百佰千仟万萬亿億]/.test(str);
    var val;
    if (!hasUnit) {
      var ds = str.split("").map(function (c) { return VAL[c]; });
      if (ds.some(function (x) { return x == null; })) return null;
      val = ds.join("");
      return (neg ? "-" : "") + val + (dec ? "." + dec : "");
    }
    var total = 0, section = 0, number = 0, lastUnit = 0, zeroSince = false;
    for (var i = 0; i < str.length; i++) {
      var c = str.charAt(i);
      if (VAL[c] != null) { if (VAL[c] === 0) zeroSince = true; number = VAL[c]; }
      else if (UNIT[c]) { if (number === 0 && c.match(/[十拾]/)) number = 1; section += number * UNIT[c]; number = 0; lastUnit = UNIT[c]; zeroSince = false; }
      else if (c === "万" || c === "萬") { section = (section + number) * 10000; number = 0; lastUnit = 10000; zeroSince = false; }
      else if (c === "亿" || c === "億") { total = (total + section + number) * 1e8; section = 0; number = 0; lastUnit = 1e8; zeroSince = false; }
      else return null;
    }
    if (number && !zeroSince && lastUnit >= 100) number = number * lastUnit / 10; // colloquial: 一万五 = 15000
    val = total + section + number;
    return (neg ? "-" : "") + String(val) + (dec ? "." + dec : "");
  }
  function digitReading(s, yao) {
    return String(s).replace(/\D/g, "").split("").map(function (c) { return c === "1" && yao ? "幺" : D[+c]; }).join("");
  }
  g.CN = { toChinese: toChinese, fromChinese: fromChinese, pinyin: pinyin, digitReading: digitReading, D: D, F: F };
})(typeof window !== "undefined" ? window : globalThis);
