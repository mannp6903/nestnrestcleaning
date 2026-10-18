/* Nest & Rest Cleaning: site behaviour. Reads all business data from window.NR_CONFIG (js/config.js). */
(function () {
  "use strict";

  var C = window.NR_CONFIG;
  var B = C.business;
  var PREVIEW = !!C.preview;
  var DRAFT_KEY = "nr-booking-v2";
  var host = document.querySelector("[data-page]");
  var PAGE = host ? host.getAttribute("data-page") : "";
  var ROOT = host ? host.getAttribute("data-root") || "" : "";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var money = function (n) { return "$" + Math.round(n).toLocaleString("en-CA"); };
  var roundTo = function (n, s) { return Math.round(n / s) * s; };
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function store(key, val) {
    try {
      if (val === undefined) return JSON.parse(localStorage.getItem(key) || "null");
      if (val === null) localStorage.removeItem(key); else localStorage.setItem(key, JSON.stringify(val));
    } catch (e) { return null; }
  }
  function toast(msg) {
    var t = $("[data-toast]");
    if (!t) return;
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toast.t);
    toast.t = setTimeout(function () { t.hidden = true; }, 3000);
  }
  function link(p) {
    var href = ROOT + p;
    if (PREVIEW && (p === "" || /\/$/.test(p))) href += "index.html";
    return href;
  }

  /* ---------- Analytics (only when IDs are set) ---------- */
  var A = C.analytics || {};
  function initAnalytics() {
    if (PREVIEW) return;
    if (A.ga4Id) {
      var s = document.createElement("script");
      s.async = true;
      s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(A.ga4Id);
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag("js", new Date());
      window.gtag("config", A.ga4Id);
    }
    if (A.metaPixelId) {
      /* Standard Meta Pixel loader */
      (function (f, b, e, v, n, t, s) {
        if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
        if (!f._fbq) f._fbq = n; n.push = n; n.loaded = true; n.version = "2.0"; n.queue = [];
        t = b.createElement(e); t.async = true; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
      })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
      window.fbq("init", A.metaPixelId);
      window.fbq("track", "PageView");
    }
  }
  function track(name, params, lead) {
    try {
      if (window.gtag) window.gtag("event", name, params || {});
      if (window.fbq) window.fbq(lead ? "track" : "trackCustom", lead ? "Lead" : name, params || {});
    } catch (e) { /* tracking must never break the page */ }
  }

  /* ---------- Shared content from config ---------- */
  function fillCommon() {
    $$("[data-phone-text]").forEach(function (el) { el.textContent = B.phoneDisplay; });
    $$("[data-email-text]").forEach(function (el) { el.textContent = B.email; });
    $$("[data-tel]").forEach(function (el) { el.href = "tel:" + B.phone; });
    $$("[data-sms]").forEach(function (el) { el.href = "sms:" + B.phone; });
    $$("[data-mailto]").forEach(function (el) { el.href = "mailto:" + B.email; });
    $$("[data-hours]").forEach(function (el) { el.textContent = B.hours; });
    $$("[data-reply]").forEach(function (el) { el.textContent = B.replyPromise; });
    $$("[data-owner]").forEach(function (el) { el.textContent = B.owner; });
    $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
    $$("[data-referral]").forEach(function (el) { el.textContent = C.offers.referral; });
    $$("[data-review-thanks]").forEach(function (el) { el.textContent = C.offers.reviewThanks; });
    $$("[data-from]").forEach(function (el) {
      var s = C.services[el.getAttribute("data-from")];
      if (s) el.textContent = money(s.base);
    });

    var f = C.offers.founding;
    var founding = $("[data-founding]");
    if (founding && f && f.active) {
      $("[data-founding-pct]").textContent = f.percent;
      $("[data-founding-text]").textContent = f.text;
      founding.hidden = false;
    }
    $$("[data-offer-note]").forEach(function (el) {
      if (f && f.active) { el.textContent = f.label + "s: " + f.percent + "% off your first visit"; el.hidden = false; }
    });

    var assure = $("[data-assure]");
    var bd = C.badges || {};
    if (assure) {
      [[bd.insured, "i-shield", "Fully insured"], [bd.ecoProducts, "i-leaf", "Eco-friendly, pet-safe products"], [bd.backgroundChecked, "i-user", "Police-checked cleaners"]]
        .filter(function (x) { return x[0]; })
        .forEach(function (x) { assure.insertAdjacentHTML("beforeend", '<li><svg class="ic" aria-hidden="true"><use href="#' + x[1] + '"/></svg>' + esc(x[2]) + "</li>"); });
    }

    var plans = $("[data-plans]");
    if (plans) {
      var ex = price("regular", +plans.getAttribute("data-beds"), +plans.getAttribute("data-baths"), "condo");
      $$("[data-plan]", plans).forEach(function (p) {
        var fr = C.frequencies[p.getAttribute("data-plan")];
        if (fr) $("[data-plan-price]", p).textContent = money(ex * (1 - fr.discount / 100));
      });
    }

    var g = $("[data-google-review]");
    if (g && B.googleReviewUrl) { g.href = B.googleReviewUrl; g.hidden = false; }
  }

  function renderReviews() {
    var box = $("[data-reviews]");
    var list = C.reviews || [];
    if (!box || !list.length) return;
    var avg = list.reduce(function (t, r) { return t + r.rating; }, 0) / list.length;
    $("[data-reviews-sub]").textContent = avg.toFixed(1) + " out of 5 from " + list.length + " verified review" + (list.length > 1 ? "s" : "") + ".";
    $("[data-reviews-list]").innerHTML = list.map(function (r) {
      var stars = "";
      for (var i = 1; i <= 5; i++) stars += '<svg class="ic' + (i > r.rating ? " off" : "") + '" aria-hidden="true"><use href="#i-star"/></svg>';
      return '<figure class="review-card"><div class="stars" role="img" aria-label="' + r.rating + ' out of 5 stars">' + stars + "</div><blockquote><p>" + esc(r.text) +
        "</p></blockquote><footer><strong>" + esc(r.name) + "</strong>" + (r.area ? ", " + esc(r.area) : "") + (r.service ? " · " + esc(r.service) : "") + "</footer></figure>";
    }).join("");
    box.hidden = false;
  }

  /* ---------- Pricing ---------- */
  function price(key, beds, baths, home) {
    var s = C.services[key];
    var f = (C.homeTypes[home] || C.homeTypes.condo).factor;
    var b = key === "detail" ? 1 : beds;
    return roundTo((s.base + Math.max(0, b - 1) * s.perBed + Math.max(0, baths - 1) * s.perBath) * f, 5);
  }
  function hoursFor(key, beds, baths, home, addons) {
    var s = C.services[key];
    var f = (C.homeTypes[home] || C.homeTypes.condo).factor;
    var b = key === "detail" ? 1 : beds;
    var h = s.hours * f + (b - 1) * 0.5 + (baths - 1) * (key === "detail" ? 0.75 : 0.5);
    (addons || []).forEach(function (a) { h += a.hours || 0; });
    return Math.max(1.5, roundTo(h, 0.5));
  }

  /* ---------- Postal codes ---------- */
  function normPostal(v) { return String(v || "").toUpperCase().replace(/[^A-Z0-9]/g, ""); }
  function fullPostalOk(v) { return /^[ABCEGHJ-NPRSTVXY]\d[A-Z]\d[A-Z]\d$/.test(normPostal(v)); }
  function formatPostal(v) { var p = normPostal(v); return p.length > 3 ? p.slice(0, 3) + " " + p.slice(3, 6) : p; }
  function zoneFor(v) {
    var p = normPostal(v);
    if (!/^[A-Z]\d[A-Z]/.test(p)) return null;
    var fsa = p.slice(0, 3), A = C.serviceArea;
    var starts = function (list) { return list.some(function (x) { return fsa.indexOf(x) === 0; }); };
    if (starts(A.home.prefixes)) return { zone: "home", fsa: fsa, fee: 0 };
    if (starts(A.city.prefixes)) return { zone: "city", fsa: fsa, fee: 0 };
    if (A.extended.prefixes.indexOf(fsa) > -1) return { zone: "extended", fsa: fsa, fee: A.extended.travelFee || 0 };
    return { zone: "outside", fsa: fsa, fee: 0 };
  }
  function zoneMessage(z) {
    if (!z) return { cls: "no", text: "Enter a postal code like M1B 2K3." };
    if (z.zone === "home") return { cls: "ok", text: "Yes. " + z.fsa + " is Scarborough, our home turf. No travel fee." };
    if (z.zone === "city") return { cls: "ok", text: "Yes, we clean in " + z.fsa + ". No travel fee." };
    if (z.zone === "extended") return { cls: "warn", text: "Yes, " + z.fsa + " is in our extended area" + (z.fee ? ", with a " + money(z.fee) + " travel fee." : ".") };
    return { cls: "no", text: z.fsa + " is outside our usual area. Send a request anyway and we'll tell you if we can make it work." };
  }
  function bindPostalChecks() {
    $$("[data-pc-form]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var m = zoneMessage(zoneFor($("input", form).value));
        var out = $("[data-pc-result]", form);
        out.className = "pc-result " + m.cls;
        out.textContent = m.text;
        if (m.cls !== "no") {
          var d = store(DRAFT_KEY) || {};
          d.postal = formatPostal($("input", form).value);
          store(DRAFT_KEY, d);
        }
      });
    });
  }

  /* ---------- Instant pricer (home, service and area pages) ---------- */
  function bindPricer() {
    var form = $("[data-pricer]");
    if (!form) return;
    var st = { service: form.getAttribute("data-default-service") || "regular", home: "condo", beds: 1, baths: 1 };
    var d = store(DRAFT_KEY);
    if (d && d.state && PAGE === "home") {
      ["service", "beds", "baths"].forEach(function (k) { if (d.state[k] != null) st[k] = d.state[k]; });
      if (d.state.homeType) st.home = d.state.homeType;
    }
    var sel = $("[data-p-service]", form), homeSel = $("[data-p-home]", form);
    sel.value = st.service; homeSel.value = st.home;
    var bedsBox = $("[data-p-beds]", form), bathsBox = $("[data-p-baths]", form);

    function render() {
      $("output", bedsBox).textContent = st.beds;
      $("output", bathsBox).textContent = st.baths;
      $("[data-dec]", bedsBox).disabled = st.beds <= 1 || st.service === "detail";
      $("[data-inc]", bedsBox).disabled = st.beds >= 8 || st.service === "detail";
      $("[data-dec]", bathsBox).disabled = st.baths <= 1;
      $("[data-inc]", bathsBox).disabled = st.baths >= 6;
      bedsBox.style.opacity = st.service === "detail" ? ".45" : "";
      var p = price(st.service, st.beds, st.baths, st.home);
      $("[data-p-amount]", form).textContent = money(p);
      var f = C.offers.founding;
      var first = f && f.active ? " · " + money(p * (1 - f.percent / 100)) + " first visit" : "";
      $("[data-p-meta]", form).textContent = "Estimate · about " + hoursFor(st.service, st.beds, st.baths, st.home) + " hours" + first;
      var go = $("[data-p-go]", form);
      go.href = link("book/") + "?s=" + st.service + "&h=" + st.home + "&bd=" + st.beds + "&ba=" + st.baths;
    }
    sel.addEventListener("change", function () { st.service = sel.value; render(); });
    homeSel.addEventListener("change", function () { st.home = homeSel.value; render(); });
    [[bedsBox, "beds", 8], [bathsBox, "baths", 6]].forEach(function (x) {
      x[0].addEventListener("click", function (e) {
        var b = e.target.closest("button");
        if (!b) return;
        st[x[1]] = Math.min(x[2], Math.max(1, st[x[1]] + (b.hasAttribute("data-inc") ? 1 : -1)));
        render();
      });
    });
    $("[data-p-go]", form).addEventListener("click", function () {
      var dd = store(DRAFT_KEY) || {};
      dd.state = Object.assign(dd.state || {}, { service: st.service, homeType: st.home, beds: st.beds, baths: st.baths, step: 1 });
      dd.at = Date.now();
      store(DRAFT_KEY, dd);
      track("pricer_continue", { service: st.service, value: price(st.service, st.beds, st.baths, st.home), currency: C.currency });
    });
    form.addEventListener("submit", function (e) { e.preventDefault(); });
    render();
  }

  /* ---------- Booking flow ---------- */
  function bindBooking() {
    var form = $("#booking-form");
    if (!form) return;
    var state = { step: 1, service: "regular", homeType: "condo", beds: 1, baths: 1, addons: [], freq: "once", date: null, flex: false, slot: null };
    var fieldIds = ["f-name", "f-phone", "f-email", "f-address", "f-postal", "f-access", "f-notes"];

    function availableDates() {
      var out = [], d = new Date();
      d.setHours(12, 0, 0, 0);
      for (var i = 1; i <= C.daysAhead; i++) {
        var x = new Date(d.getTime() + i * 86400000);
        if (C.openDays.indexOf(x.getDay()) > -1) out.push(x);
      }
      return out;
    }
    function iso(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
    function parseIso(s) { var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
    function longDate(s) { return new Intl.DateTimeFormat("en-CA", { weekday: "long", month: "long", day: "numeric" }).format(parseIso(s)); }
    function slotById(id) { return C.timeSlots.filter(function (t) { return t.id === id; })[0]; }

    var wd = new Intl.DateTimeFormat("en-CA", { weekday: "short" }), mo = new Intl.DateTimeFormat("en-CA", { month: "short" });
    $("[data-dates]").innerHTML = availableDates().map(function (d) {
      return '<label class="date-chip"><input type="radio" name="date" value="' + iso(d) + '" aria-label="' + esc(longDate(iso(d))) + '"><span><small>' +
        wd.format(d) + "</small><strong>" + d.getDate() + "</strong><small>" + mo.format(d) + "</small></span></label>";
    }).join("");

    function quote() {
      var s = C.services[state.service];
      var ht = C.homeTypes[state.homeType] || C.homeTypes.condo;
      var beds = state.service === "detail" ? 1 : state.beds;
      var base = price(state.service, beds, state.baths, state.homeType);
      var incl = (C.includedAddons || {})[state.service] || [];
      var addons = C.addons.filter(function (a) { return state.addons.indexOf(a.id) > -1 && incl.indexOf(a.id) === -1; });
      var addonTotal = addons.reduce(function (t, a) { return t + a.price; }, 0);
      var z = zoneFor($("#f-postal").value);
      var travel = z && z.zone === "extended" ? z.fee : 0;
      var subtotal = base + addonTotal + travel;
      var freq = s.recurring ? C.frequencies[state.freq] : C.frequencies.once;
      var rec = freq ? freq.discount : 0;
      var f = C.offers.founding;
      var fp = f && f.active ? f.percent : 0;
      var firstPct = Math.max(fp, rec);
      var firstLabel = fp >= rec && fp > 0 ? f.label : (freq ? freq.label + " plan" : "");
      var tax = C.taxRate || 0;
      return {
        s: s, ht: ht, beds: beds, base: base, addons: addons, travel: travel, subtotal: subtotal, freq: freq, zone: z,
        firstPct: firstPct, firstLabel: firstLabel, firstDisc: subtotal * firstPct / 100,
        first: subtotal * (1 - firstPct / 100) * (1 + tax),
        repeat: rec ? subtotal * (1 - rec / 100) * (1 + tax) : null, tax: tax,
        hours: hoursFor(state.service, beds, state.baths, state.homeType, addons)
      };
    }
    function homeLine(q) {
      if (state.service === "detail") return q.ht.label + " · kitchen + " + state.baths + " bath" + (state.baths > 1 ? "s" : "");
      return q.ht.label + " · " + q.beds + " bed, " + state.baths + " bath";
    }
    function renderSummary() {
      var q = quote();
      var html = "<div><dt><strong>" + esc(q.s.name) + "</strong><br>" + esc(homeLine(q)) + "</dt><dd>" + money(q.base) + "</dd></div>";
      q.addons.forEach(function (a) { html += "<div><dt>" + esc(a.name) + "</dt><dd>+" + money(a.price) + "</dd></div>"; });
      if (q.travel) html += "<div><dt>Travel fee</dt><dd>+" + money(q.travel) + "</dd></div>";
      if (q.firstDisc > 0) html += '<div class="disc"><dt>' + esc(q.firstLabel) + " · " + q.firstPct + "%</dt><dd>−" + money(q.firstDisc) + "</dd></div>";
      html += '<div class="total"><dt>' + (q.repeat ? "First visit" : "Estimated total") + "</dt><dd>" + money(q.first) + "</dd></div>";
      if (q.repeat) html += '<div class="then"><dt>Then ' + esc(q.freq.label.toLowerCase()) + "</dt><dd>" + money(q.repeat) + "</dd></div>";
      html += '<div class="then"><dt>Time on site</dt><dd>about ' + q.hours + " hrs</dd></div>";
      $("[data-lines]").innerHTML = html;
      $("[data-total]").textContent = money(q.first);
      $("[data-fine]").textContent = "Estimate in " + C.currency + (q.tax ? ", HST included" : "") + ". No payment now. We confirm the final price before we start.";
    }
    function sync() {
      $$('input[name="service"]', form).forEach(function (i) { i.checked = i.value === state.service; });
      $$('input[name="homeType"]', form).forEach(function (i) { i.checked = i.value === state.homeType; });
      $$('input[name="freq"]', form).forEach(function (i) { i.checked = i.value === state.freq; });
      $$('input[name="slot"]', form).forEach(function (i) { i.checked = i.value === state.slot; });
      $$('input[name="date"]', form).forEach(function (i) { i.checked = i.value === state.date; });
      $("[data-flex]").checked = state.flex;
      $("[data-dates]").classList.toggle("is-disabled", state.flex);
      var beds = $('[data-counter="beds"]'), baths = $('[data-counter="baths"]');
      $("output", beds).textContent = state.beds;
      $("output", baths).textContent = state.baths;
      $("[data-dec]", beds).disabled = state.beds <= 1;
      $("[data-inc]", beds).disabled = state.beds >= 8;
      $("[data-dec]", baths).disabled = state.baths <= 1;
      $("[data-inc]", baths).disabled = state.baths >= 6;
      beds.hidden = state.service === "detail";
      var incl = (C.includedAddons || {})[state.service] || [];
      $$("[data-addon]").forEach(function (chip) {
        var id = chip.getAttribute("data-addon"), input = $("input", chip), on = incl.indexOf(id) > -1;
        var a = C.addons.filter(function (x) { return x.id === id; })[0];
        chip.classList.toggle("included", on);
        input.disabled = on;
        input.checked = on || state.addons.indexOf(id) > -1;
        $("b", chip).textContent = on ? "included" : "+" + money(a.price);
      });
      var recurring = C.services[state.service].recurring;
      $("[data-freq-field]").hidden = !recurring;
      if (!recurring) state.freq = "once";
    }
    function showStep(n, focus) {
      state.step = n;
      $$(".step", form).forEach(function (fs) { fs.hidden = +fs.getAttribute("data-step") !== n; });
      $$("[data-dot]").forEach(function (li) {
        var i = +li.getAttribute("data-dot");
        li.classList.toggle("is-done", i < n);
        li.classList.toggle("is-current", i === n);
        if (i === n) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
      });
      $("[data-prev]").hidden = n === 1;
      $("[data-next]").hidden = n === 3;
      $("[data-submit]").hidden = n !== 3;
      $("[data-form-error]").hidden = true;
      if (focus) {
        var top = $(".book-head").getBoundingClientRect().top;
        if (top < -10) $(".book-head").scrollIntoView({ behavior: "smooth", block: "start" });
        var lg = $('.step[data-step="' + n + '"] legend', form);
        lg.setAttribute("tabindex", "-1");
        lg.focus({ preventScroll: true });
      }
      save();
    }
    function setInvalid(el, bad) { el.classList.toggle("invalid", bad); if (bad) el.setAttribute("aria-invalid", "true"); else el.removeAttribute("aria-invalid"); }
    function validate(n) {
      var msg = "";
      if (n === 2) {
        if (!state.date && !state.flex) msg = "Choose a day, or tick “I'm flexible”.";
        else if (!state.slot) msg = "Choose an arrival window.";
      }
      if (n === 3) {
        var checks = [
          ["#f-name", function (v) { return v.trim().length >= 2; }, "Add your name."],
          ["#f-phone", phoneOk, "Add a 10-digit mobile number so we can confirm by text."],
          ["#f-email", emailOk, "Check your email address, or leave it blank."],
          ["#f-address", function (v) { return v.trim().length >= 5; }, "Add your street address."],
          ["#f-postal", fullPostalOk, "Add a full postal code, like M1B 2K3."]
        ];
        var first = null;
        checks.forEach(function (c) { var el = $(c[0]), bad = !c[1](el.value); setInvalid(el, bad); if (bad && !first) { first = el; msg = c[2]; } });
        if (first) first.focus();
        else if (!$("#f-consent").checked) msg = "Tick the box to confirm you've read how booking works.";
      }
      if (msg) {
        var err = $("[data-form-error]");
        if (n === 3) { err.textContent = msg; err.hidden = false; }
        toast(msg);
        return false;
      }
      return true;
    }
    function save() {
      var fields = {};
      fieldIds.forEach(function (id) { fields[id] = $("#" + id).value; });
      fields.pets = ($('input[name="pets"]:checked', form) || {}).value;
      fields.contactPref = ($('input[name="contactPref"]:checked', form) || {}).value;
      store(DRAFT_KEY, { state: state, fields: fields, postal: $("#f-postal").value, at: Date.now() });
    }
    function restore() {
      var d = store(DRAFT_KEY);
      if (d && d.at && Date.now() - d.at < 14 * 86400000) {
        if (d.state) Object.keys(state).forEach(function (k) { if (d.state[k] != null) state[k] = d.state[k]; });
        var f = d.fields || {};
        fieldIds.forEach(function (id) { if (f[id]) $("#" + id).value = f[id]; });
        ["pets", "contactPref"].forEach(function (n) { var i = f[n] && $('input[name="' + n + '"][value="' + f[n] + '"]', form); if (i) i.checked = true; });
        if (!$("#f-postal").value && d.postal) $("#f-postal").value = d.postal;
      }
      var q = new URLSearchParams(location.search);
      if (q.get("s") && C.services[q.get("s")]) { state.service = q.get("s"); state.step = 1; }
      if (q.get("h") && C.homeTypes[q.get("h")]) state.homeType = q.get("h");
      if (+q.get("bd")) state.beds = Math.min(8, +q.get("bd"));
      if (+q.get("ba")) state.baths = Math.min(6, +q.get("ba"));
      if (!C.services[state.service]) state.service = "regular";
      if (state.date && availableDates().map(iso).indexOf(state.date) === -1) state.date = null;
      if (state.step > 3 || state.step < 1) state.step = 1;
    }
    function onPostal() {
      var el = $("#f-postal"), out = $("[data-pc-booking]");
      if (normPostal(el.value).length >= 3) { var m = zoneMessage(zoneFor(el.value)); out.className = "pc-result " + m.cls; out.textContent = m.text; }
      else out.textContent = "";
      renderSummary();
    }

    form.addEventListener("change", function (e) {
      var t = e.target;
      if (t.name === "service") { state.service = t.value; sync(); }
      if (t.name === "homeType") state.homeType = t.value;
      if (t.name === "freq") state.freq = t.value;
      if (t.name === "slot") state.slot = t.value;
      if (t.name === "date") { state.date = t.value; state.flex = false; sync(); }
      if (t.hasAttribute("data-flex")) { state.flex = t.checked; if (state.flex) state.date = null; sync(); }
      if (t.name === "addon") state.addons = $$('input[name="addon"]:checked:not(:disabled)', form).map(function (i) { return i.value; });
      if (t.id === "f-consent" && t.checked) $("[data-form-error]").hidden = true;
      renderSummary();
      save();
    });
    form.addEventListener("input", function (e) {
      if (e.target.classList.contains("invalid")) setInvalid(e.target, false);
      if (e.target.id === "f-postal") onPostal();
      clearTimeout(form.t);
      form.t = setTimeout(save, 400);
    });
    $("#f-postal").addEventListener("blur", function () { if (normPostal(this.value).length === 6) this.value = formatPostal(this.value); });
    $$("[data-counter]").forEach(function (c) {
      var key = c.getAttribute("data-counter");
      c.addEventListener("click", function (e) {
        var b = e.target.closest("button");
        if (!b) return;
        state[key] = Math.min(key === "beds" ? 8 : 6, Math.max(1, state[key] + (b.hasAttribute("data-inc") ? 1 : -1)));
        sync(); renderSummary(); save();
      });
    });
    $("[data-next]").addEventListener("click", function () {
      if (!validate(state.step)) return;
      if (state.step === 1) track("begin_checkout", { service: state.service, value: Math.round(quote().first), currency: C.currency });
      showStep(state.step + 1, true);
    });
    $("[data-prev]").addEventListener("click", function () { showStep(Math.max(1, state.step - 1), true); });
    form.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && e.target.tagName === "INPUT" && state.step < 3) { e.preventDefault(); $("[data-next]").click(); }
    });
    var sum = $("[data-summary]");
    $("[data-summary-toggle]").addEventListener("click", function () {
      var open = !sum.classList.contains("open");
      sum.classList.toggle("open", open);
      this.setAttribute("aria-expanded", String(open));
    });

    function ref() { var c = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", s = ""; for (var i = 0; i < 4; i++) s += c[Math.floor(Math.random() * c.length)]; return "NR-" + s; }
    function text(r) {
      var q = quote(), slot = slotById(state.slot);
      return ["Booking request " + r, q.s.name + ", " + homeLine(q),
        q.addons.length ? "Extras: " + q.addons.map(function (a) { return a.name; }).join(", ") : "",
        "When: " + (state.flex ? "earliest opening" : longDate(state.date)) + (slot ? ", " + slot.label + " (" + slot.time + ")" : ""),
        q.repeat ? "Plan: " + q.freq.label : "",
        "Estimate: " + money(q.first) + (q.repeat ? ", then " + money(q.repeat) + "/visit" : ""),
        "Name: " + $("#f-name").value, "Phone: " + $("#f-phone").value,
        "Address: " + $("#f-address").value + ", " + formatPostal($("#f-postal").value),
        $("#f-notes").value ? "Notes: " + $("#f-notes").value : ""].filter(Boolean).join("\n");
    }
    var last = null;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate(3)) return;
      var r = ref(), q = quote(), slot = slotById(state.slot), z = q.zone;
      var when = state.flex ? "Flexible: earliest opening" : longDate(state.date);
      var btn = $("[data-submit]");
      btn.disabled = true; btn.textContent = "Sending…";
      send({
        _subject: "New booking " + r + ": " + q.s.name + ", " + when,
        _template: "table", _captcha: "false", _replyto: $("#f-email").value || undefined,
        _honey: $('[name="_honey"]', form).value,
        "Reference": r, "Service": q.s.name, "Home": homeLine(q),
        "Extras": q.addons.map(function (a) { return a.name; }).join(", ") || "None",
        "Plan": q.freq ? q.freq.label : "One time", "Date": when,
        "Arrival window": slot ? slot.label + " (" + slot.time + ")" : "",
        "Estimate, first visit": money(q.first), "Estimate, repeat visits": q.repeat ? money(q.repeat) : "n/a",
        "Estimated time": "about " + q.hours + " hours",
        "Name": $("#f-name").value.trim(), "Phone": $("#f-phone").value.trim(), "Email": $("#f-email").value.trim() || "not given",
        "Address": $("#f-address").value.trim(), "Postal code": formatPostal($("#f-postal").value) + (z ? " (" + z.zone + " zone)" : ""),
        "Getting in": $("#f-access").value, "Pets": ($('input[name="pets"]:checked', form) || {}).value,
        "Notes": $("#f-notes").value.trim() || "None", "Confirm by": ($('input[name="contactPref"]:checked', form) || {}).value
      }).then(function (res) {
        track("generate_lead", { form: "booking", service: state.service, value: Math.round(q.first), currency: C.currency }, true);
        last = { ref: r, date: state.flex ? null : state.date, slot: slot, hours: q.hours, service: q.s.name, address: $("#f-address").value };
        var firstName = $("#f-name").value.trim().split(/\s+/)[0];
        var how = { Text: "text", Call: "call", Email: "email" }[($('input[name="contactPref"]:checked', form) || {}).value] || "text";
        form.hidden = true;
        $("[data-progress]").hidden = true;
        var done = $("[data-done]");
        $("[data-ref]").textContent = r;
        if (res && res.skipped) {
          $("[data-done-title]").textContent = "Preview only.";
          $("[data-done-text]").textContent = "This preview doesn't send bookings. On the live site, " + B.ownerFirstName + " receives this request by email.";
        } else {
          $("[data-done-title]").textContent = "Thank you, " + firstName + ".";
          $("[data-done-text]").textContent = B.ownerFirstName + " will " + how + " you " + B.replyPromise + " to confirm " +
            (state.flex ? "the earliest opening" : longDate(state.date) + (slot ? ", " + slot.label.toLowerCase() : "")) + ". Nothing to pay until after your clean.";
        }
        $("[data-sms-booking]").href = "sms:" + B.phone + "?&body=" + encodeURIComponent(text(r));
        $("[data-ics]").hidden = PREVIEW || !last.date;
        done.hidden = false;
        done.focus();
        window.scrollTo({ top: 0, behavior: "smooth" });
        store(DRAFT_KEY, null);
      }).catch(function () {
        var err = $("[data-form-error]");
        err.innerHTML = "We couldn't send your request online. Please <a href=\"sms:" + B.phone + "?&body=" + encodeURIComponent(text(r)) + "\">text it to us</a> or <a href=\"mailto:" + B.email +
          "?subject=" + encodeURIComponent("Booking request " + r) + "&body=" + encodeURIComponent(text(r)) + "\">email it</a>. Your details are filled in.";
        err.hidden = false;
      }).then(function () { btn.disabled = false; btn.textContent = "Request this booking"; });
    });

    $("[data-ics]").addEventListener("click", function () {
      if (!last || !last.date) return;
      var pad = function (n) { return String(n).padStart(2, "0"); };
      var start = (last.slot && last.slot.start) || 9, d = last.date.replace(/-/g, "");
      var ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Nest & Rest Cleaning//Booking//EN", "BEGIN:VEVENT",
        "UID:" + last.ref + "@nestandrestcleaning", "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z",
        "DTSTART;TZID=America/Toronto:" + d + "T" + pad(start) + "0000",
        "DTEND;TZID=America/Toronto:" + d + "T" + pad(Math.min(21, start + Math.ceil(last.hours + 3))) + "0000",
        "SUMMARY:Nest & Rest: " + last.service + " (requested)", "LOCATION:" + last.address.replace(/[,;]/g, "\\$&"),
        "DESCRIPTION:Booking request " + last.ref + ". We'll confirm by text. " + B.phoneDisplay, "STATUS:TENTATIVE", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
      var a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
      a.download = "nest-and-rest-" + last.ref + ".ics";
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    });

    restore();
    sync();
    onPostal();
    renderSummary();
    showStep(state.step, false);
  }

  /* ---------- Delivery ---------- */
  function phoneOk(v) { var d = String(v).replace(/\D/g, ""); return d.length === 10 || (d.length === 11 && d[0] === "1"); }
  function emailOk(v) { return !v || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }
  function send(data) {
    if (PREVIEW || !C.delivery || C.delivery.provider === "none") return Promise.resolve({ skipped: true });
    return fetch(C.delivery.endpoint, {
      method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data)
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok || String(j.success) === "false") throw new Error(j.message || "Request failed");
        return j;
      });
    });
  }

  /* ---------- Quote forms ---------- */
  function bindQuote() {
    var form = $("[data-quote-form]");
    if (!form) return;
    var name = form.getAttribute("data-quote-name");
    form.addEventListener("input", function (e) { e.target.classList.remove("invalid"); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var err = $("[data-q-error]"), first = null, msg = "";
      $$("input, select, textarea", form).forEach(function (el) {
        if (el.type === "hidden" || el.name === "_honey") return;
        var v = el.value.trim(), bad = false, m = "";
        if (el.hasAttribute("data-required") && v.length < 2) { bad = true; m = "Add your " + el.name.toLowerCase() + "."; }
        if (el.hasAttribute("data-phone") && !phoneOk(v)) { bad = true; m = "Add a 10-digit phone number."; }
        if (el.hasAttribute("data-email") && !emailOk(v)) { bad = true; m = "Check your email address, or leave it blank."; }
        if (el.hasAttribute("data-postal") && !fullPostalOk(v)) { bad = true; m = "Add a full postal code, like M1B 2K3."; }
        el.classList.toggle("invalid", bad);
        if (bad && !first) { first = el; msg = m; }
      });
      if (first) { err.textContent = msg; err.hidden = false; first.focus(); return; }
      err.hidden = true;
      var data = { _subject: "New quote request: " + name, _template: "table", _captcha: "false", "Service": name };
      $$("input, select, textarea", form).forEach(function (el) {
        if (el.name === "_honey") data._honey = el.value;
        else if (el.name) data[el.name] = el.value.trim() || "—";
      });
      if (data.Email && data.Email !== "—") data._replyto = data.Email;
      var btn = $('button[type="submit"]', form);
      btn.disabled = true; btn.textContent = "Sending…";
      send(data).then(function (res) {
        track("generate_lead", { form: "quote", service: name }, true);
        form.hidden = true;
        var done = $("[data-quote-done]");
        if (res && res.skipped) {
          $("[data-qd-title]").textContent = "Preview only.";
          $("[data-qd-text]").textContent = "On the live site, " + B.ownerFirstName + " receives this quote request by email.";
        } else {
          $("[data-qd-title]").textContent = "Thank you, " + String(data.Name).split(/\s+/)[0] + ".";
          $("[data-qd-text]").textContent = B.ownerFirstName + " will reply " + form.getAttribute("data-reply-time") + ". Questions in the meantime? Call or text " + B.phoneDisplay + ".";
        }
        done.hidden = false;
        done.focus();
      }).catch(function () {
        var body = Object.keys(data).filter(function (k) { return k[0] !== "_"; }).map(function (k) { return k + ": " + data[k]; }).join("\n");
        err.innerHTML = "We couldn't send that online. Please <a href=\"mailto:" + B.email + "?subject=" + encodeURIComponent("Quote request: " + name) +
          "&body=" + encodeURIComponent(body) + "\">email it to us</a> or call " + esc(B.phoneDisplay) + ".";
        err.hidden = false;
      }).then(function () { btn.disabled = false; btn.textContent = "Request a free quote"; });
    });
  }

  /* ---------- Review page ---------- */
  function bindReview() {
    var form = $("[data-review-form]");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var err = $("[data-review-error]");
      var rating = ($('input[name="rating"]:checked', form) || {}).value;
      var nm = $("#rv-name").value.trim(), tx = $("#rv-text").value.trim(), ct = $("#rv-contact").value.trim();
      var msg = !rating ? "Choose a star rating." : nm.length < 2 ? "Add your name." : tx.length < 10 ? "Tell us a little more in your review." : !ct ? "Add the phone or email you booked with." : "";
      if (msg) { err.textContent = msg; err.hidden = false; return; }
      err.hidden = true;
      var btn = $('button[type="submit"]', form);
      btn.disabled = true;
      send({ _subject: "New review: " + rating + " stars from " + nm, _template: "table", _captcha: "false", _honey: $('[name="_honey"]', form).value,
        "Rating": rating + " / 5", "Name": nm, "Neighbourhood": $("#rv-area").value.trim(), "Service": $("#rv-service").value, "Review": tx, "Booked with": ct
      }).then(function (res) {
        form.hidden = true;
        if (res && res.skipped) $("[data-review-done-text]").textContent = "Preview only: reviews aren't sent from this preview.";
        var done = $("[data-review-done]");
        done.hidden = false;
        done.focus();
      }).catch(function () {
        err.innerHTML = "We couldn't send that online. Please <a href=\"mailto:" + B.email + "?subject=My%20review&body=" + encodeURIComponent(rating + " stars\n" + tx) + "\">email it to us</a>.";
        err.hidden = false;
      }).then(function () { btn.disabled = false; });
    });
  }

  /* ---------- Chrome: menu, action bar, sharing, tracking clicks ---------- */
  function bindChrome() {
    var btn = $(".menu-btn"), menu = $("#menu");
    if (btn && menu) {
      var setMenu = function (open) {
        menu.hidden = !open;
        btn.setAttribute("aria-expanded", String(open));
        btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        $("use", btn).setAttribute("href", open ? "#i-close" : "#i-menu");
        document.body.classList.toggle("menu-open", open);
      };
      btn.addEventListener("click", function () { setMenu(menu.hidden); });
      menu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
    }

    var bar = $("[data-action-bar]");
    if (bar && "IntersectionObserver" in window) {
      var seen = new Set();
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) seen.add(en.target); else seen.delete(en.target); });
        bar.classList.toggle("is-hidden", seen.size > 0);
      });
      $$("[data-pricer] [data-p-go], [data-quote-form], [data-review-form], .final-cta, .site-footer").forEach(function (el) { io.observe(el); });
    }

    document.addEventListener("click", function (e) {
      var t = e.target.closest("[data-track]");
      if (t) track(t.getAttribute("data-track"), { page: PAGE });
    });

    $$("[data-share]").forEach(function (b) {
      b.addEventListener("click", function () {
        var url = C.siteUrl + "/";
        var msg = "I use " + B.name + ". Book your first clean and we both get $" + C.offers.referral + " off: " + url;
        if (navigator.share) navigator.share({ title: B.name, text: msg, url: url }).catch(function () {});
        else if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(msg).then(function () { toast("Link copied. Paste it to a friend."); }, function () { toast(url); });
        else toast(url);
      });
    });
  }

  initAnalytics();
  fillCommon();
  renderReviews();
  bindPostalChecks();
  bindPricer();
  bindBooking();
  bindQuote();
  bindReview();
  bindChrome();
})();
