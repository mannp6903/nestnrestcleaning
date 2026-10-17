/* Nest & Rest Cleaning: site behaviour.
   Reads everything business-specific from window.NR_CONFIG (js/config.js). */
(function () {
  "use strict";

  var C = window.NR_CONFIG;
  var PREVIEW = !!window.NR_PREVIEW;
  var STORE_KEY = "nr-booking-draft-v1";
  var STEP_NAMES = ["Service", "Home", "Timing", "Details", "Send"];
  var INCLUDED_ADDONS = { move: ["oven", "fridge", "cabinets"], deep: [] };

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function money(n) {
    var v = Math.round(n);
    return "$" + v.toLocaleString("en-CA");
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function roundTo(n, step) { return Math.round(n / step) * step; }
  function store(get, val) {
    try {
      if (get) return JSON.parse(localStorage.getItem(STORE_KEY) || "null");
      if (val === null) localStorage.removeItem(STORE_KEY);
      else localStorage.setItem(STORE_KEY, JSON.stringify(val));
    } catch (e) { return null; }
  }
  function toast(msg) {
    var t = $("[data-toast]");
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(function () { t.hidden = true; }, 2800);
  }

  /* ---------- Static content from config ---------- */
  function fillBusiness() {
    var b = C.business;
    $$("[data-phone-text]").forEach(function (el) { el.textContent = b.phoneDisplay; });
    $$("[data-email-text]").forEach(function (el) { el.textContent = b.email; });
    $$("[data-tel]").forEach(function (el) { el.href = "tel:" + b.phone; });
    $$("[data-sms]").forEach(function (el) { el.href = "sms:" + b.phone; });
    $$("[data-mailto]").forEach(function (el) { el.href = "mailto:" + b.email; });
    $$("[data-copy]").forEach(function (el) {
      if (el.closest("li").querySelector("[data-tel]")) el.setAttribute("data-copy", b.phoneDisplay);
      if (el.closest("li").querySelector("[data-mailto]")) el.setAttribute("data-copy", b.email);
    });
    $$("[data-owner]").forEach(function (el) { el.textContent = b.owner; });
    $$("[data-owner-first]").forEach(function (el) { el.textContent = b.ownerFirstName; });
    $$("[data-base]").forEach(function (el) { el.textContent = b.base; });
    $$("[data-hours]").forEach(function (el) { el.textContent = b.hours; });
    $$("[data-reply]").forEach(function (el) { el.textContent = b.replyPromise; });
    $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
    $$("[data-referral]").forEach(function (el) { el.textContent = C.offers.referral; });
    $$("[data-review-thanks]").forEach(function (el) { el.textContent = "$" + C.offers.reviewThanks; });

    var g = $("[data-google-review]");
    if (b.googleReviewUrl) { g.href = b.googleReviewUrl; g.hidden = false; }

    var minFrom = Math.min.apply(null, Object.keys(C.services).map(function (k) { return C.services[k].base; }));
    $$("[data-from]").forEach(function (el) { el.textContent = "from " + money(minFrom); });

    var f = C.offers.founding;
    if (f && f.active) {
      var tag = $("[data-offer-tag]");
      tag.querySelector("span").textContent = f.percent + "% off your first clean";
      tag.hidden = false;
      $("[data-offer-label]").textContent = f.label + ".";
      $("[data-offer-text]").textContent = f.text;
      $("[data-offer-strip]").hidden = false;
    }

    var ext = C.serviceArea.extended;
    $("[data-extended-note]").textContent = "Markham, Pickering, Ajax, Richmond Hill, Vaughan and more. " +
      (ext.travelFee ? money(ext.travelFee) + " travel fee." : "No travel fee.");
    $("[data-areas]").innerHTML = C.serviceArea.areas.map(function (a) { return "<li>" + esc(a) + "</li>"; }).join("");
  }

  function svcFrom(key) { return C.services[key].base; }

  function renderServices() {
    var keys = Object.keys(C.services);
    $("[data-quick-services]").innerHTML = keys.map(function (k) {
      var s = C.services[k];
      return '<button type="button" class="quick-svc" data-pick="' + k + '"><strong>' + esc(s.name) +
        "</strong><span>from <b>" + money(s.base) + "</b></span></button>";
    }).join("");

    $("[data-services]").innerHTML = keys.map(function (k) {
      var s = C.services[k];
      var tag = s.recurring ? "Save up to " + maxDiscount() + "% when recurring" : s.tag;
      return '<article class="svc">' +
        (tag ? '<span class="svc-tag">' + esc(tag) + "</span>" : "") +
        '<div class="svc-top"><h3>' + esc(s.name) + '</h3><div class="svc-price"><small>from</small><strong>' + money(s.base) + "</strong></div></div>" +
        '<p class="svc-short">' + esc(s.short) + "</p>" +
        "<ul>" + s.includes.map(function (i) { return '<li><svg class="ic" aria-hidden="true"><use href="#i-check"/></svg><span>' + esc(i) + "</span></li>"; }).join("") + "</ul>" +
        '<div class="svc-foot"><span class="svc-time"><svg class="ic" aria-hidden="true"><use href="#i-clock"/></svg>from ' + s.hours + " hrs</span>" +
        '<button type="button" class="btn btn-dark btn-sm" data-pick="' + k + '">Book this</button></div>' +
        "</article>";
    }).join("");

    $("[data-addons-list]").innerHTML = C.addons.map(function (a) {
      return "<li><span>" + esc(a.name) + "</span><b>+" + money(a.price) + "</b></li>";
    }).join("");
  }

  function maxDiscount() {
    return Math.max.apply(null, Object.keys(C.frequencies).map(function (k) { return C.frequencies[k].discount; }));
  }

  /* ---------- Service area ---------- */
  function normPostal(v) { return String(v || "").toUpperCase().replace(/[^A-Z0-9]/g, ""); }
  function fullPostalOk(v) { return /^[ABCEGHJ-NPRSTVXY]\d[A-Z]\d[A-Z]\d$/.test(normPostal(v)); }
  function zoneFor(v) {
    var p = normPostal(v);
    if (!/^[A-Z]\d[A-Z]/.test(p)) return null;
    var fsa = p.slice(0, 3);
    var A = C.serviceArea;
    if (A.home.prefixes.some(function (x) { return fsa.indexOf(x) === 0; })) return { zone: "home", fsa: fsa, fee: 0 };
    if (A.city.prefixes.some(function (x) { return fsa.indexOf(x) === 0; })) return { zone: "city", fsa: fsa, fee: 0 };
    if (A.extended.prefixes.indexOf(fsa) > -1) return { zone: "extended", fsa: fsa, fee: A.extended.travelFee || 0 };
    return { zone: "outside", fsa: fsa, fee: 0 };
  }
  function zoneMessage(z) {
    if (!z) return { cls: "no", text: "Enter a postal code like M1B 2K3." };
    var A = C.serviceArea;
    if (z.zone === "home") return { cls: "ok", text: "Yes! " + z.fsa + " is " + A.home.label + ". " + A.home.note };
    if (z.zone === "city") return { cls: "ok", text: "Yes, we clean in " + z.fsa + ". No travel fee." };
    if (z.zone === "extended") return { cls: "warn", text: "Yes, " + z.fsa + " is in our extended area" + (z.fee ? " (" + money(z.fee) + " travel fee)." : ".") };
    return { cls: "no", text: z.fsa + " is outside our usual area. Send a request anyway and we'll tell you if we can make it work." };
  }
  function bindPostalChecks() {
    $$("[data-pc-form]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var input = form.querySelector("input");
        var out = form.querySelector("[data-pc-result]");
        var m = zoneMessage(zoneFor(input.value));
        out.className = "pc-result " + m.cls;
        out.textContent = m.text;
        var postal = $("#f-postal");
        if (m.cls !== "no" && !postal.value && normPostal(input.value).length === 6) {
          postal.value = formatPostal(input.value);
          onPostalChange();
        }
      });
    });
  }
  function formatPostal(v) {
    var p = normPostal(v);
    return p.length > 3 ? p.slice(0, 3) + " " + p.slice(3, 6) : p;
  }

  /* ---------- Booking state ---------- */
  var state = {
    step: 1,
    service: null,
    homeType: "condo",
    beds: 1,
    baths: 1,
    addons: [],
    freq: "once",
    date: null,
    flex: false,
    slot: null
  };
  var form = $("#booking-form");
  var fieldIds = ["f-name", "f-phone", "f-email", "f-address", "f-postal", "f-access", "f-notes"];

  function quote() {
    if (!state.service) return null;
    var s = C.services[state.service];
    var ht = C.homeTypes[state.homeType] || C.homeTypes.condo;
    var beds = state.service === "detail" ? 1 : state.beds;
    var base = s.base + Math.max(0, beds - 1) * s.perBed + Math.max(0, state.baths - 1) * s.perBath;
    base = roundTo(base * ht.factor, 5);
    var included = INCLUDED_ADDONS[state.service] || [];
    var addons = C.addons.filter(function (a) { return state.addons.indexOf(a.id) > -1 && included.indexOf(a.id) === -1; });
    var addonTotal = addons.reduce(function (t, a) { return t + a.price; }, 0);
    var z = zoneFor($("#f-postal").value);
    var travel = z && z.zone === "extended" ? z.fee : 0;
    var subtotal = base + addonTotal + travel;

    var freq = s.recurring ? C.frequencies[state.freq] : C.frequencies.once;
    var recurringPct = freq ? freq.discount : 0;
    var f = C.offers.founding;
    var foundingPct = f && f.active ? f.percent : 0;
    var firstPct = Math.max(foundingPct, recurringPct);
    var firstLabel = foundingPct >= recurringPct && foundingPct > 0 ? f.label : (freq ? freq.label + " discount" : "");
    var firstDisc = subtotal * firstPct / 100;
    var first = subtotal - firstDisc;
    var repeat = recurringPct ? subtotal * (1 - recurringPct / 100) : null;
    var tax = C.taxRate || 0;

    var hrs = s.hours * ht.factor + Math.max(0, beds - 1) * 0.5 + Math.max(0, state.baths - 1) * (state.service === "detail" ? 0.75 : 0.5);
    hrs += addons.reduce(function (t, a) { return t + (a.hours || 0); }, 0);
    hrs = Math.max(1.5, roundTo(hrs, 0.5));

    return {
      service: s, homeType: ht, beds: beds, base: base, addons: addons, travel: travel,
      subtotal: subtotal, firstPct: firstPct, firstLabel: firstLabel, firstDisc: firstDisc,
      first: first * (1 + tax), repeat: repeat == null ? null : repeat * (1 + tax), tax: tax,
      freq: freq, hours: hrs, zone: z
    };
  }

  function homeLine(q) {
    var t = q.homeType.label;
    if (state.service === "detail") return t + " · 1 kitchen, " + state.baths + " bath" + (state.baths > 1 ? "s" : "");
    return t + " · " + q.beds + " bed, " + state.baths + " bath";
  }

  function renderSummary() {
    var q = quote();
    var total = $("[data-total]");
    var lines = $("[data-lines]");
    var fine = $("[data-fine]");
    if (!q) {
      total.textContent = "from " + money(Math.min(svcFrom("regular"), svcFrom("detail")));
      lines.innerHTML = "<div><dt>Choose a service to see your price.</dt><dd></dd></div>";
      fine.textContent = "No payment now. You pay after the clean.";
      return;
    }
    var rows = [];
    rows.push(["<strong>" + esc(q.service.name) + "</strong><br><small>" + esc(homeLine(q)) + "</small>", money(q.base)]);
    q.addons.forEach(function (a) { rows.push([esc(a.name), "+" + money(a.price)]); });
    if (q.travel) rows.push(["Travel fee", "+" + money(q.travel)]);
    var html = rows.map(function (r) { return "<div><dt>" + r[0] + "</dt><dd>" + r[1] + "</dd></div>"; }).join("");
    if (q.firstDisc > 0) html += '<div class="disc"><dt>' + esc(q.firstLabel) + " (" + q.firstPct + "%)</dt><dd>−" + money(q.firstDisc) + "</dd></div>";
    if (q.tax) html += "<div><dt>HST</dt><dd>included</dd></div>";
    html += '<div class="total"><dt>' + (q.repeat ? "First clean" : "Estimated total") + "</dt><dd>" + money(q.first) + "</dd></div>";
    if (q.repeat) html += '<div class="then"><dt>Then ' + esc(q.freq.label.toLowerCase()) + "</dt><dd>" + money(q.repeat) + " / visit</dd></div>";
    html += '<div class="then"><dt>Time on site</dt><dd>about ' + q.hours + " hrs</dd></div>";
    lines.innerHTML = html;
    total.textContent = money(q.first);
    fine.textContent = "Estimate in " + C.currency + (q.tax ? ", HST included" : "") + ". No payment now. We confirm the final price before we start.";
  }

  /* ---------- Booking UI ---------- */
  function renderBookingControls() {
    $("[data-steps]").innerHTML = STEP_NAMES.map(function (n, i) {
      return '<li data-step-dot="' + (i + 1) + '"><span>' + n + "</span></li>";
    }).join("");

    $("[data-service-choices]").innerHTML = Object.keys(C.services).map(function (k) {
      var s = C.services[k];
      return '<label class="choice"><input type="radio" name="service" value="' + k + '">' +
        '<span class="choice-body"><strong>' + esc(s.name) + '</strong><span class="from">from<b>' + money(s.base) + "</b></span>" +
        '<span class="desc">' + esc(s.short) + "</span></span></label>";
    }).join("");

    $("[data-home-types]").innerHTML = Object.keys(C.homeTypes).map(function (k) {
      return '<label><input type="radio" name="homeType" value="' + k + '"><span>' + esc(C.homeTypes[k].label) + "</span></label>";
    }).join("");

    $("[data-addon-choices]").innerHTML = C.addons.map(function (a) {
      return '<label class="chip" data-addon="' + a.id + '"><input type="checkbox" name="addon" value="' + a.id + '"><span>' +
        esc(a.name) + " <b>+" + money(a.price) + "</b></span></label>";
    }).join("");

    $("[data-freqs]").innerHTML = Object.keys(C.frequencies).map(function (k) {
      var f = C.frequencies[k];
      return '<label class="choice"><input type="radio" name="freq" value="' + k + '"><span class="choice-body"><strong>' +
        esc(f.label) + "</strong>" + (f.discount ? '<span class="save">Save ' + f.discount + "%</span>" : '<span class="desc">No commitment</span>') +
        "</span></label>";
    }).join("");

    $("[data-slots]").innerHTML = C.timeSlots.map(function (t) {
      return '<label><input type="radio" name="slot" value="' + t.id + '"><span>' + esc(t.label) + "<small>" + esc(t.time) + "</small></span></label>";
    }).join("");

    renderDates();
  }

  function isoDate(d) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function parseIso(s) { var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function availableDates() {
    var out = [];
    var d = new Date();
    d.setHours(12, 0, 0, 0);
    for (var i = 1; i <= C.daysAhead; i++) {
      var x = new Date(d.getTime() + i * 86400000);
      if (C.openDays.indexOf(x.getDay()) > -1) out.push(x);
    }
    return out;
  }
  function renderDates() {
    var wd = new Intl.DateTimeFormat("en-CA", { weekday: "short" });
    var mo = new Intl.DateTimeFormat("en-CA", { month: "short" });
    $("[data-dates]").innerHTML = availableDates().map(function (d) {
      var iso = isoDate(d);
      return '<label class="date-chip"><input type="radio" name="date" value="' + iso + '" aria-label="' +
        esc(longDate(iso)) + '"><span><small>' + wd.format(d) + "</small><strong>" + d.getDate() + "</strong><small>" + mo.format(d) + "</small></span></label>";
    }).join("");
  }
  function longDate(iso) {
    return new Intl.DateTimeFormat("en-CA", { weekday: "long", month: "long", day: "numeric" }).format(parseIso(iso));
  }
  function slotById(id) { return C.timeSlots.filter(function (t) { return t.id === id; })[0]; }

  function syncControls() {
    $$('input[name="service"]', form).forEach(function (i) { i.checked = i.value === state.service; });
    $$('input[name="homeType"]', form).forEach(function (i) { i.checked = i.value === state.homeType; });
    $$('input[name="freq"]', form).forEach(function (i) { i.checked = i.value === state.freq; });
    $$('input[name="slot"]', form).forEach(function (i) { i.checked = i.value === state.slot; });
    $$('input[name="date"]', form).forEach(function (i) { i.checked = i.value === state.date; });
    $("[data-flex]").checked = state.flex;
    $("[data-dates]").classList.toggle("is-disabled", state.flex);
    $("#beds-out").textContent = state.beds;
    $("#baths-out").textContent = state.baths;
    $('[data-counter="beds"] [data-dec]').disabled = state.beds <= 1;
    $('[data-counter="baths"] [data-dec]').disabled = state.baths <= 1;
    $('[data-counter="beds"] [data-inc]').disabled = state.beds >= 8;
    $('[data-counter="baths"] [data-inc]').disabled = state.baths >= 6;
    $('[data-counter="beds"]').hidden = state.service === "detail";

    var included = INCLUDED_ADDONS[state.service] || [];
    $$("[data-addon]").forEach(function (chip) {
      var id = chip.getAttribute("data-addon");
      var input = chip.querySelector("input");
      var inc = included.indexOf(id) > -1;
      chip.classList.toggle("included", inc);
      input.disabled = inc;
      input.checked = inc || state.addons.indexOf(id) > -1;
      var b = chip.querySelector("b");
      var a = C.addons.filter(function (x) { return x.id === id; })[0];
      b.textContent = inc ? "included" : "+" + money(a.price);
    });

    var recurring = state.service && C.services[state.service].recurring;
    $("[data-freq-field]").hidden = !recurring;
    if (!recurring) state.freq = "once";
  }

  function showStep(n, focus) {
    state.step = n;
    $$(".step", form).forEach(function (fs) { fs.hidden = +fs.getAttribute("data-step") !== n; });
    $$("[data-step-dot]").forEach(function (li) {
      var i = +li.getAttribute("data-step-dot");
      li.classList.toggle("is-done", i < n);
      li.classList.toggle("is-current", i === n);
      if (i === n) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
    });
    $("[data-prev]").hidden = n === 1;
    $("[data-next]").hidden = n === 5;
    $("[data-submit]").hidden = n !== 5;
    $("[data-form-error]").hidden = true;
    if (n === 5) renderReview();
    if (focus) {
      var main = $(".booker-main");
      var top = main.getBoundingClientRect().top;
      if (top < 0 || top > window.innerHeight * 0.4) main.scrollIntoView({ behavior: "smooth", block: "start" });
      var legend = $('.step[data-step="' + n + '"] legend', form);
      if (legend) { legend.setAttribute("tabindex", "-1"); legend.focus({ preventScroll: true }); }
    }
    save();
  }

  function setInvalid(el, bad) {
    el.classList.toggle("invalid", bad);
    if (bad) el.setAttribute("aria-invalid", "true"); else el.removeAttribute("aria-invalid");
  }
  function phoneOk(v) { var d = String(v).replace(/\D/g, ""); return d.length === 10 || (d.length === 11 && d[0] === "1"); }
  function emailOk(v) { return !v || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }

  function validateStep(n) {
    var msg = "";
    if (n === 1 && !state.service) msg = "Choose a service to continue.";
    if (n === 3) {
      if (!state.date && !state.flex) msg = "Pick a day, or tick “I'm flexible”.";
      else if (!state.slot) msg = "Choose an arrival window.";
    }
    if (n === 4) {
      var checks = [
        ["#f-name", function (v) { return v.trim().length >= 2; }, "Add your name."],
        ["#f-phone", phoneOk, "Add a 10-digit mobile number so we can confirm by text."],
        ["#f-email", emailOk, "Check your email address, or leave it blank."],
        ["#f-address", function (v) { return v.trim().length >= 5; }, "Add your street address."],
        ["#f-postal", fullPostalOk, "Add a full postal code, like M1B 2K3."]
      ];
      var first = null;
      checks.forEach(function (c) {
        var el = $(c[0]);
        var bad = !c[1](el.value);
        setInvalid(el, bad);
        if (bad && !first) { first = el; msg = c[2]; }
      });
      if (first) first.focus();
    }
    if (n === 5 && !$("#f-consent").checked) msg = "Tick the box to confirm you've read how booking works.";
    if (msg) {
      if (n === 5 || n === 4) { var err = $("[data-form-error]"); err.textContent = msg; err.hidden = n !== 5; }
      toast(msg);
      return false;
    }
    return true;
  }

  function renderReview() {
    var q = quote();
    var slot = slotById(state.slot);
    var rows = [
      ["Service", q.service.name, 1],
      ["Home", homeLine(q), 2],
      ["Add-ons", q.addons.length ? q.addons.map(function (a) { return a.name; }).join(", ") : "None", 2],
      ["How often", q.freq ? q.freq.label : "One time", 3],
      ["When", (state.flex ? "Earliest opening" : longDate(state.date)) + (slot ? ", " + slot.label.toLowerCase() + " (" + slot.time + ")" : ""), 3],
      ["Name", $("#f-name").value, 4],
      ["Mobile", $("#f-phone").value, 4],
      ["Address", $("#f-address").value + ", " + formatPostal($("#f-postal").value), 4],
      ["Estimate", money(q.first) + (q.repeat ? ", then " + money(q.repeat) + " " + q.freq.label.toLowerCase() : ""), 0]
    ];
    if ($("#f-email").value) rows.splice(7, 0, ["Email", $("#f-email").value, 4]);
    $("[data-review]").innerHTML = rows.map(function (r) {
      return "<div><dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1]) +
        (r[2] ? ' <button type="button" class="link-btn edit" data-goto="' + r[2] + '">Edit</button>' : "") + "</dd></div>";
    }).join("");
  }

  function onPostalChange() {
    var el = $("#f-postal");
    var out = $("[data-pc-booking]");
    if (normPostal(el.value).length >= 3) {
      var m = zoneMessage(zoneFor(el.value));
      out.className = "pc-result " + m.cls;
      out.textContent = m.text;
    } else {
      out.textContent = "";
    }
    renderSummary();
  }

  function pickService(key, jump) {
    state.service = key;
    syncControls();
    renderSummary();
    if (jump) {
      showStep(2, false);
      $("#book").scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      save();
    }
  }

  /* ---------- Persistence ---------- */
  function save() {
    var fields = {};
    fieldIds.forEach(function (id) { fields[id] = $("#" + id).value; });
    fields.pets = (form.querySelector('input[name="pets"]:checked') || {}).value;
    fields.contactPref = (form.querySelector('input[name="contactPref"]:checked') || {}).value;
    store(false, { state: state, fields: fields, at: Date.now() });
  }
  function restore() {
    var d = store(true);
    if (!d || !d.state || Date.now() - (d.at || 0) > 14 * 86400000) return;
    Object.keys(state).forEach(function (k) { if (k in d.state) state[k] = d.state[k]; });
    if (state.service && !C.services[state.service]) state.service = null;
    if (state.date && availableDates().map(isoDate).indexOf(state.date) === -1) state.date = null;
    var f = d.fields || {};
    fieldIds.forEach(function (id) { if (f[id]) $("#" + id).value = f[id]; });
    ["pets", "contactPref"].forEach(function (n) {
      var i = f[n] && form.querySelector('input[name="' + n + '"][value="' + f[n] + '"]');
      if (i) i.checked = true;
    });
    if (state.step > 4) state.step = 4;
  }

  /* ---------- Submission ---------- */
  function bookingRef() {
    var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    var s = "";
    for (var i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return "NR-" + s;
  }
  function bookingText(ref) {
    var q = quote();
    var slot = slotById(state.slot);
    var pets = (form.querySelector('input[name="pets"]:checked') || {}).value;
    return [
      "Booking request " + ref,
      q.service.name + ", " + homeLine(q),
      q.addons.length ? "Add-ons: " + q.addons.map(function (a) { return a.name; }).join(", ") : "",
      "When: " + (state.flex ? "earliest opening" : longDate(state.date)) + (slot ? ", " + slot.label + " (" + slot.time + ")" : ""),
      q.freq && q.freq.discount ? "Frequency: " + q.freq.label : "",
      "Estimate: " + money(q.first) + (q.repeat ? ", then " + money(q.repeat) + "/visit" : ""),
      "Name: " + $("#f-name").value,
      "Phone: " + $("#f-phone").value,
      $("#f-email").value ? "Email: " + $("#f-email").value : "",
      "Address: " + $("#f-address").value + ", " + formatPostal($("#f-postal").value),
      "Access: " + $("#f-access").value + ". Pets: " + pets,
      $("#f-notes").value ? "Notes: " + $("#f-notes").value : ""
    ].filter(Boolean).join("\n");
  }
  function payload(ref) {
    var q = quote();
    var slot = slotById(state.slot);
    var z = q.zone;
    var dateLabel = state.flex ? "Flexible: earliest opening" : longDate(state.date);
    return {
      _subject: "New booking " + ref + ": " + q.service.name + ", " + dateLabel,
      _template: "table",
      _captcha: "false",
      _replyto: $("#f-email").value || undefined,
      _honey: form.querySelector('[name="_honey"]').value,
      "Reference": ref,
      "Service": q.service.name,
      "Home": homeLine(q),
      "Add-ons": q.addons.map(function (a) { return a.name; }).join(", ") || "None",
      "Frequency": q.freq ? q.freq.label : "One time",
      "Date": dateLabel,
      "Arrival window": slot ? slot.label + " (" + slot.time + ")" : "",
      "Estimate, first clean": money(q.first),
      "Estimate, repeat visits": q.repeat ? money(q.repeat) : "n/a",
      "Estimated time": "about " + q.hours + " hours",
      "Name": $("#f-name").value.trim(),
      "Phone": $("#f-phone").value.trim(),
      "Email": $("#f-email").value.trim() || "not given",
      "Address": $("#f-address").value.trim(),
      "Postal code": formatPostal($("#f-postal").value) + (z ? " (" + z.zone + " zone)" : ""),
      "Getting in": $("#f-access").value,
      "Pets": (form.querySelector('input[name="pets"]:checked') || {}).value,
      "Notes": $("#f-notes").value.trim() || "None",
      "Confirm by": (form.querySelector('input[name="contactPref"]:checked') || {}).value
    };
  }
  function send(data) {
    if (PREVIEW || !C.delivery || C.delivery.provider === "none") return Promise.resolve({ skipped: true });
    return fetch(C.delivery.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(data)
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok || String(j.success) === "false") throw new Error(j.message || "Request failed");
        return j;
      });
    });
  }
  function smsHref(text) { return "sms:" + C.business.phone + "?&body=" + encodeURIComponent(text); }
  function mailHref(subject, text) {
    return "mailto:" + C.business.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(text);
  }

  var lastBooking = null;

  function onSubmit(e) {
    e.preventDefault();
    if (!validateStep(5)) return;
    var ref = bookingRef();
    var data = payload(ref);
    var text = bookingText(ref);
    var btn = $("[data-submit]");
    btn.disabled = true;
    btn.textContent = "Sending…";
    send(data).then(function (res) {
      showDone(ref, text, res && res.skipped);
    }).catch(function () {
      var err = $("[data-form-error]");
      err.innerHTML = "We couldn't send your request online. Please text or email it instead, your details are filled in for you: " +
        '<a href="' + smsHref(text) + '">Text ' + esc(C.business.phoneDisplay) + "</a> or " +
        '<a href="' + mailHref("Booking request " + ref, text) + '">email us</a>.';
      err.hidden = false;
    }).then(function () {
      btn.disabled = false;
      btn.textContent = "Send booking request";
    });
  }

  function showDone(ref, text, skipped) {
    var q = quote();
    var slot = slotById(state.slot);
    var first = $("#f-name").value.trim().split(/\s+/)[0];
    var pref = (form.querySelector('input[name="contactPref"]:checked') || {}).value || "Text";
    var how = { Text: "text", Call: "call", Email: "email" }[pref];
    lastBooking = { ref: ref, date: state.flex ? null : state.date, slot: slot, hours: q.hours, service: q.service.name, address: $("#f-address").value };

    form.hidden = true;
    $("[data-steps]").hidden = true;
    var done = $("[data-done]");
    done.hidden = false;
    $("[data-ref]").textContent = ref;
    if (PREVIEW && skipped) {
      $("[data-done-title]").textContent = "Preview only: request not sent.";
      $("[data-done-text]").textContent = "This preview doesn't send bookings. On the live site, " + C.business.ownerFirstName +
        " gets this request by email and you'd see this confirmation.";
    } else if (skipped) {
      $("[data-done-title]").textContent = "Almost done, " + first + ".";
      $("[data-done-text]").textContent = "Send us your booking by text or email using the buttons below. Your details are filled in.";
    } else {
      $("[data-done-title]").textContent = "Thanks, " + first + ". Request received.";
      $("[data-done-text]").textContent = C.business.ownerFirstName + " will " + how + " you " + C.business.replyPromise +
        " to confirm " + (state.flex ? "the earliest opening" : longDate(state.date) + (slot ? ", " + slot.label.toLowerCase() : "")) + ".";
    }
    $("[data-sms-booking]").href = smsHref(text);
    $("[data-mail-booking]").href = mailHref("Booking request " + ref, text);
    $("[data-ics]").hidden = PREVIEW || !lastBooking.date;
    done.focus();
    store(false, null);
  }

  function downloadIcs() {
    if (!lastBooking || !lastBooking.date) return;
    var startHour = { morning: 8, midday: 11, afternoon: 14 }[lastBooking.slot && lastBooking.slot.id] || 9;
    var d = lastBooking.date.replace(/-/g, "");
    var pad = function (n) { return String(n).padStart(2, "0"); };
    var endH = startHour + Math.ceil(lastBooking.hours + 3);
    var ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Nest & Rest Cleaning//Booking//EN", "BEGIN:VEVENT",
      "UID:" + lastBooking.ref + "@nestandrestcleaning",
      "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z",
      "DTSTART;TZID=America/Toronto:" + d + "T" + pad(startHour) + "0000",
      "DTEND;TZID=America/Toronto:" + d + "T" + pad(Math.min(endH, 21)) + "0000",
      "SUMMARY:Nest & Rest: " + lastBooking.service + " (requested)",
      "LOCATION:" + lastBooking.address.replace(/[,;]/g, "\\$&"),
      "DESCRIPTION:Booking request " + lastBooking.ref + ". Arrival window " + (lastBooking.slot ? lastBooking.slot.time : "") +
        ". We'll confirm by text. Questions? " + C.business.phoneDisplay,
      "STATUS:TENTATIVE", "END:VEVENT", "END:VCALENDAR"
    ].join("\r\n");
    var blob = new Blob([ics], { type: "text/calendar" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "nest-and-rest-" + lastBooking.ref + ".ics";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  function restart() {
    state.step = 1; state.service = null; state.addons = []; state.freq = "once"; state.date = null; state.flex = false; state.slot = null;
    form.reset();
    form.hidden = false;
    $("[data-steps]").hidden = false;
    $("[data-done]").hidden = true;
    syncControls();
    renderSummary();
    showStep(1, true);
  }

  function bindBooking() {
    form.addEventListener("change", function (e) {
      var t = e.target;
      if (t.name === "service") { state.service = t.value; syncControls(); }
      if (t.name === "homeType") state.homeType = t.value;
      if (t.name === "freq") state.freq = t.value;
      if (t.name === "slot") state.slot = t.value;
      if (t.name === "date") { state.date = t.value; state.flex = false; syncControls(); }
      if (t.hasAttribute("data-flex")) { state.flex = t.checked; if (state.flex) state.date = null; syncControls(); }
      if (t.name === "addon") {
        state.addons = $$('input[name="addon"]:checked:not(:disabled)', form).map(function (i) { return i.value; });
      }
      if (t.id === "f-consent" && t.checked) $("[data-form-error]").hidden = true;
      renderSummary();
      save();
    });
    form.addEventListener("input", function (e) {
      if (e.target.classList.contains("invalid")) setInvalid(e.target, false);
      if (e.target.id === "f-postal") onPostalChange();
      clearTimeout(bindBooking.t);
      bindBooking.t = setTimeout(save, 400);
    });
    $("#f-postal").addEventListener("blur", function () {
      if (normPostal(this.value).length === 6) this.value = formatPostal(this.value);
    });
    // Auto-advance after picking a service: the fastest path on a phone.
    $("[data-service-choices]").addEventListener("click", function (e) {
      if (e.target.matches('input[name="service"]')) setTimeout(function () { showStep(2, true); }, 180);
    });
    $$("[data-counter]").forEach(function (c) {
      var key = c.getAttribute("data-counter");
      c.addEventListener("click", function (e) {
        var b = e.target.closest("button");
        if (!b) return;
        var max = key === "beds" ? 8 : 6;
        state[key] = Math.min(max, Math.max(1, state[key] + (b.hasAttribute("data-inc") ? 1 : -1)));
        syncControls();
        renderSummary();
        save();
      });
    });
    $("[data-next]").addEventListener("click", function () {
      if (validateStep(state.step)) showStep(state.step + 1, true);
    });
    $("[data-prev]").addEventListener("click", function () { showStep(Math.max(1, state.step - 1), true); });
    $("[data-review]").addEventListener("click", function (e) {
      var b = e.target.closest("[data-goto]");
      if (b) showStep(+b.getAttribute("data-goto"), true);
    });
    form.addEventListener("submit", onSubmit);
    form.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && e.target.tagName === "INPUT" && state.step < 5) {
        e.preventDefault();
        $("[data-next]").click();
      }
    });
    $("[data-ics]").addEventListener("click", downloadIcs);
    $("[data-restart]").addEventListener("click", restart);

    var sum = $("[data-summary]");
    $("[data-summary-toggle]").addEventListener("click", function () {
      var open = !sum.classList.contains("open");
      sum.classList.toggle("open", open);
      this.setAttribute("aria-expanded", String(open));
    });

    document.addEventListener("click", function (e) {
      var p = e.target.closest("[data-pick]");
      if (p) pickService(p.getAttribute("data-pick"), true);
    });
  }

  /* ---------- Reviews ---------- */
  function starsHtml(n) {
    var s = "";
    for (var i = 1; i <= 5; i++) s += '<svg class="ic' + (i > n ? " off" : "") + '" aria-hidden="true"><use href="#i-star"/></svg>';
    return '<div class="stars" role="img" aria-label="' + n + ' out of 5 stars">' + s + "</div>";
  }
  function renderReviews() {
    var list = C.reviews || [];
    if (!list.length) return;
    var avg = list.reduce(function (t, r) { return t + r.rating; }, 0) / list.length;
    $("[data-reviews-title]").textContent = "What our clients say.";
    $("[data-reviews-sub]").textContent = avg.toFixed(1) + " out of 5 from " + list.length + " verified review" + (list.length > 1 ? "s" : "") + ". Every review is from a completed clean.";
    $("[data-reviews-list]").innerHTML = list.map(function (r) {
      return '<figure class="review-card">' + starsHtml(r.rating) + "<blockquote><p>" + esc(r.text) + "</p></blockquote>" +
        "<footer><strong>" + esc(r.name) + "</strong>" + (r.area ? ", " + esc(r.area) : "") + (r.service ? " · " + esc(r.service) : "") + "</footer></figure>";
    }).join("");
  }
  function bindReviewForm() {
    var rf = $("[data-review-form]");
    $("[data-open-review]").addEventListener("click", function () {
      rf.hidden = false;
      $("[data-review-done]").hidden = true;
      rf.scrollIntoView({ behavior: "smooth", block: "start" });
      $("#r5").focus({ preventScroll: true });
    });
    $("[data-close-review]").addEventListener("click", function () { rf.hidden = true; });
    rf.addEventListener("submit", function (e) {
      e.preventDefault();
      var err = $("[data-review-error]");
      var rating = (rf.querySelector('input[name="rating"]:checked') || {}).value;
      var name = $("#rv-name"), text = $("#rv-text"), contact = $("#rv-contact");
      var msg = !rating ? "Choose a star rating." : name.value.trim().length < 2 ? "Add your name." :
        text.value.trim().length < 10 ? "Tell us a little more in your review." : !contact.value.trim() ? "Add the phone or email you booked with." : "";
      if (msg) { err.textContent = msg; err.hidden = false; return; }
      err.hidden = true;
      var btn = rf.querySelector('button[type="submit"]');
      btn.disabled = true;
      send({
        _subject: "New review: " + rating + " stars from " + name.value.trim(),
        _template: "table", _captcha: "false",
        _honey: rf.querySelector('[name="_honey"]').value,
        "Rating": rating + " / 5", "Name": name.value.trim(), "Neighbourhood": $("#rv-area").value.trim(),
        "Review": text.value.trim(), "Booked with": contact.value.trim()
      }).then(function (res) {
        rf.hidden = true;
        rf.reset();
        var done = $("[data-review-done]");
        if (PREVIEW && res && res.skipped) $("[data-review-done-text]").textContent = "Preview only: reviews aren't sent from this preview. On the live site this goes straight to " + C.business.ownerFirstName + ".";
        done.hidden = false;
        done.focus();
      }).catch(function () {
        err.innerHTML = 'We couldn\'t send that online. Please <a href="' + mailHref("My review", rating + " stars\n" + text.value) + '">email it to us</a> instead.';
        err.hidden = false;
      }).then(function () { btn.disabled = false; });
    });
  }

  /* ---------- Trust strip ---------- */
  function renderTrust() {
    var b = C.badges || {};
    var extra = [
      [b.insured, "i-shield", "Fully insured", "Liability coverage on every visit"],
      [b.ecoProducts, "i-leaf", "Eco-friendly products", "Safe around kids and pets"],
      [b.backgroundChecked, "i-user", "Background-checked", "Police-checked cleaners"]
    ].filter(function (x) { return x[0]; });
    $("[data-trust]").insertAdjacentHTML("beforeend", extra.map(function (x) {
      return '<li><svg class="ic" aria-hidden="true"><use href="#' + x[1] + '"/></svg><div><strong>' + esc(x[2]) + "</strong><span>" + esc(x[3]) + "</span></div></li>";
    }).join(""));
  }

  /* ---------- Room-by-room checklist ---------- */
  function renderChecklist() {
    var rooms = C.checklist || [];
    var tabs = $("[data-room-tabs]");
    var panel = $("[data-room-panel]");
    var cols = ["regular", "deep", "move"].map(function (k) { return C.services[k].name.replace(" Home Cleaning", "").replace(" Cleaning", "").replace("Move-In / ", ""); });
    var cell = function (v) {
      if (v === "yes") return '<td><svg class="ic yes" role="img" aria-label="Included"><use href="#i-check"/></svg></td>';
      if (v === "add") return '<td><span class="addon-mark">Add-on</span></td>';
      return '<td><span class="no-mark" aria-label="Not included">–</span></td>';
    };
    tabs.innerHTML = rooms.map(function (r, i) {
      return '<button type="button" role="tab" id="room-tab-' + i + '" aria-controls="room-panel" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '" data-room="' + i + '">' + esc(r.room) + "</button>";
    }).join("");
    panel.id = "room-panel";
    function show(i) {
      $$("[data-room]", tabs).forEach(function (t) {
        var on = +t.getAttribute("data-room") === i;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
      });
      panel.setAttribute("aria-labelledby", "room-tab-" + i);
      panel.innerHTML = '<div class="table-scroll"><table class="check-table"><thead><tr><th scope="col">' + esc(rooms[i].room) + "</th>" +
        cols.map(function (c) { return '<th scope="col">' + esc(c) + "</th>"; }).join("") + "</tr></thead><tbody>" +
        rooms[i].tasks.map(function (t) { return '<tr><th scope="row">' + esc(t[0]) + "</th>" + cell(t[1]) + cell(t[2]) + cell(t[3]) + "</tr>"; }).join("") +
        "</tbody></table></div>";
    }
    tabs.addEventListener("click", function (e) {
      var t = e.target.closest("[data-room]");
      if (t) show(+t.getAttribute("data-room"));
    });
    tabs.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      var cur = +document.activeElement.getAttribute("data-room");
      var next = (cur + (e.key === "ArrowRight" ? 1 : -1) + rooms.length) % rooms.length;
      show(next);
      $('[data-room="' + next + '"]', tabs).focus();
    });
    if (rooms.length) show(0);
  }

  /* ---------- Office quotes ---------- */
  function bindOfficeForm() {
    var O = C.office;
    var of = $("[data-office-form]");
    var opts = function (list) { return list.map(function (v) { return "<option>" + esc(v) + "</option>"; }).join(""); };
    $("[data-office-includes]").innerHTML = O.includes.map(function (i) {
      return '<li><svg class="ic" aria-hidden="true"><use href="#i-check"/></svg><span>' + esc(i) + "</span></li>";
    }).join("");
    $("[data-office-types]").innerHTML = opts(O.types);
    $("[data-office-sizes]").innerHTML = opts(O.sizes);
    $("[data-office-freqs]").innerHTML = opts(O.frequencies);

    of.addEventListener("input", function (e) { if (e.target.classList.contains("invalid")) setInvalid(e.target, false); });
    of.addEventListener("submit", function (e) {
      e.preventDefault();
      var err = $("[data-office-error]");
      var checks = [
        ["#o-business", function (v) { return v.trim().length >= 2; }, "Add your business name."],
        ["#o-name", function (v) { return v.trim().length >= 2; }, "Add your name."],
        ["#o-phone", phoneOk, "Add a 10-digit phone number."],
        ["#o-email", emailOk, "Check your email address, or leave it blank."],
        ["#o-postal", fullPostalOk, "Add a full postal code, like M1B 2K3."]
      ];
      var first = null, msg = "";
      checks.forEach(function (c) {
        var el = $(c[0]);
        var bad = !c[1](el.value);
        setInvalid(el, bad);
        if (bad && !first) { first = el; msg = c[2]; }
      });
      if (first) { err.textContent = msg; err.hidden = false; first.focus(); return; }
      err.hidden = true;
      var v = function (id) { return $(id).value.trim(); };
      var z = zoneFor(v("#o-postal"));
      var btn = of.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = "Sending…";
      var summary = [
        "Office quote request", "Business: " + v("#o-business"), "Contact: " + v("#o-name") + ", " + v("#o-phone"),
        "Space: " + v("#o-type") + ", " + v("#o-size") + ", " + v("#o-washrooms") + " washroom(s)",
        "How often: " + v("#o-freq") + ", " + v("#o-when"), "Postal code: " + formatPostal(v("#o-postal")),
        v("#o-notes") ? "Notes: " + v("#o-notes") : ""
      ].filter(Boolean).join("\n");
      send({
        _subject: "New office quote request: " + v("#o-business"),
        _template: "table", _captcha: "false",
        _replyto: v("#o-email") || undefined,
        _honey: of.querySelector('[name="_honey"]').value,
        "Business": v("#o-business"), "Contact": v("#o-name"), "Phone": v("#o-phone"), "Email": v("#o-email") || "not given",
        "Type of space": v("#o-type"), "Size": v("#o-size"), "Washrooms": v("#o-washrooms"),
        "How often": v("#o-freq"), "Best time": v("#o-when"),
        "Postal code": formatPostal(v("#o-postal")) + (z ? " (" + z.zone + " zone)" : ""),
        "Notes": v("#o-notes") || "None"
      }).then(function (res) {
        of.hidden = true;
        var done = $("[data-office-done]");
        var first = v("#o-name").split(/\s+/)[0];
        if (PREVIEW && res && res.skipped) {
          $("[data-office-done-title]").textContent = "Preview only: request not sent.";
          $("[data-office-done-text]").textContent = "On the live site, " + C.business.ownerFirstName + " gets this quote request by email.";
        } else {
          $("[data-office-done-title]").textContent = "Thanks, " + first + ". Quote request received.";
          $("[data-office-done-text]").textContent = C.business.ownerFirstName + " will get back to you " + O.replyPromise +
            " with a quote for " + v("#o-business") + ". Questions in the meantime? Call or text " + C.business.phoneDisplay + ".";
        }
        done.hidden = false;
        done.focus();
      }).catch(function () {
        err.innerHTML = "We couldn't send that online. Please " +
          '<a href="' + smsHref(summary) + '">text it to us</a> or <a href="' + mailHref("Office quote request", summary) + '">email it</a>; your details are filled in.';
        err.hidden = false;
      }).then(function () {
        btn.disabled = false;
        btn.textContent = "Request a free quote";
      });
    });
  }

  /* ---------- Page chrome ---------- */
  function bindChrome() {
    var nav = $("#nav");
    var menuBtn = $(".menu-btn");
    function setMenu(open) {
      nav.classList.toggle("open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      menuBtn.querySelector("use").setAttribute("href", open ? "#i-close" : "#i-menu");
    }
    menuBtn.addEventListener("click", function () { setMenu(!nav.classList.contains("open")); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });

    var bar = $("[data-action-bar]");
    if ("IntersectionObserver" in window) {
      var visible = new Set();
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) visible.add(en.target); else visible.delete(en.target); });
        bar.classList.toggle("is-hidden", visible.size > 0);
      }, { threshold: 0 });
      io.observe($(".booker"));
      io.observe($(".office-grid"));
      io.observe($(".site-footer"));
    }

    $$("[data-copy]").forEach(function (b) {
      b.addEventListener("click", function () {
        var v = b.getAttribute("data-copy");
        var ok = function () { toast("Copied " + v); };
        var fallback = function () {
          var link = b.parentNode.querySelector("a");
          var r = document.createRange();
          r.selectNodeContents(link);
          var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
          toast("Selected. Copy it from the menu.");
        };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(v).then(ok, fallback);
        else fallback();
      });
    });

    $("[data-share]").addEventListener("click", function () {
      var url = location.origin && location.origin !== "null" && !PREVIEW ? location.origin + location.pathname : "https://nestandrestcleaning.com/";
      var msg = "I use Nest & Rest Cleaning. Book your first clean and we both get $" + C.offers.referral + " off: " + url;
      if (navigator.share) {
        navigator.share({ title: C.business.name, text: msg, url: url }).catch(function () {});
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(msg).then(function () { toast("Link copied. Paste it to a friend."); }, function () { toast(url); });
      } else {
        toast(url);
      }
    });
  }

  /* ---------- Boot ---------- */
  fillBusiness();
  renderTrust();
  renderServices();
  renderChecklist();
  bindOfficeForm();
  renderBookingControls();
  restore();
  syncControls();
  renderSummary();
  showStep(state.step, false);
  onPostalChange();
  bindPostalChecks();
  bindBooking();
  bindReviewForm();
  bindChrome();
  renderReviews();
})();
