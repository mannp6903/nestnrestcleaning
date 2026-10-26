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
  function waHref(msg) { return B.whatsapp ? "https://wa.me/" + B.whatsapp + "?text=" + encodeURIComponent(msg) : ""; }
  // How to reach us: by phone while business.phone is set, otherwise by email (the number can be kept private).
  var REACH = B.phone ? "call or text " + B.phoneDisplay : "email " + B.email;
  function fillTpl(t, vals) { return String(t || "").replace(/\{(\w+)\}/g, function (m, k) { return vals[k] != null ? vals[k] : m; }); }
  // Every confirmation email ends with who we are and how to stop emails (CASL), from config.emails.footer.
  function autoReply(tpl, vals) {
    var E = C.emails || {};
    vals.contact = B.phone ? (B.whatsapp ? "Call, text or WhatsApp " : "Call or text ") + B.phoneDisplay : "Email " + B.email;
    var foot = fillTpl(E.footer, { owner: B.owner, address: B.mailingAddress ? ", " + B.mailingAddress : "", phone: B.phoneDisplay, email: B.email, site: C.siteUrl.replace(/^https?:\/\//, "") });
    return fillTpl(tpl, vals) + (E.footer ? "\n\n" + foot : "");
  }
  function isoDay(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  // Days a booking can be made for: from booking.leadDays out, on open days, skipping booking.blockedDates.
  function openDates(n) {
    var bk = C.booking || {}, blocked = bk.blockedDates || [], out = [], d = new Date();
    d.setHours(12, 0, 0, 0);
    for (var i = Math.max(0, bk.leadDays == null ? 1 : bk.leadDays); i <= C.daysAhead + 14 && out.length < n; i++) {
      var x = new Date(d.getTime() + i * 86400000);
      if (C.openDays.indexOf(x.getDay()) > -1 && blocked.indexOf(isoDay(x)) === -1) out.push(x);
    }
    return out;
  }
  function nextOpenText() {
    var d = openDates(1)[0];
    if (!d) return B.phone ? "call or text us" : "email us";
    var days = Math.round((new Date(d).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000);
    var label = new Intl.DateTimeFormat("en-CA", { weekday: "short", month: "short", day: "numeric" }).format(d);
    return days === 0 ? "today, " + label : days === 1 ? "tomorrow, " + label : label;
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
      // Measurement only: Google's advertising signals stay off, as the privacy policy says.
      window.gtag("config", A.ga4Id, { allow_google_signals: false, allow_ad_personalization_signals: false });
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
    $$("[data-tel]").forEach(function (el) { if (B.phone) el.href = "tel:" + B.phone; else el.hidden = true; });
    $$("[data-sms]").forEach(function (el) { if (B.phone) el.href = "sms:" + B.phone; else el.hidden = true; });
    $$("[data-mailto]").forEach(function (el) { el.href = "mailto:" + B.email; });
    $$("[data-wa]").forEach(function (el) { if (B.whatsapp) { if (!/wa\.me/.test(el.href)) el.href = waHref("Hi " + B.ownerFirstName + ", I'd like to ask about a clean."); } else el.hidden = true; });
    $$("[data-next-open]").forEach(function (el) { el.textContent = nextOpenText(); });
    $$("[data-hours]").forEach(function (el) { el.textContent = B.hours; });
    $$("[data-reply]").forEach(function (el) { el.textContent = B.replyPromise; });
    $$("[data-owner]").forEach(function (el) { el.textContent = B.owner; });
    $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
    $$("[data-referral]").forEach(function (el) { el.textContent = C.offers.referral; });
    $$("[data-from]").forEach(function (el) {
      var s = C.services[el.getAttribute("data-from")];
      if (s) el.textContent = money(s.base);
    });
    // Price tables: data-price="service:beds:baths:homeType"
    $$("[data-price]").forEach(function (el) {
      var p = el.getAttribute("data-price").split(":");
      if (C.services[p[0]] && C.homeTypes[p[3]]) el.textContent = money(price(p[0], +p[1], +p[2], p[3]));
    });
    $$("[data-factor]").forEach(function (el) {
      var h = C.homeTypes[el.getAttribute("data-factor")];
      if (h) el.textContent = Math.round((h.factor - 1) * 100) + "%";
    });

    var f = C.offers.founding;
    var founding = $("[data-founding]");
    var left = f ? Math.max(0, f.spots - (f.claimed || 0)) : 0;
    var spotsText = left > 0 ? left + " of " + f.spots + " founding spots left" : "Last founding spots";
    if (founding && f && f.active) {
      $("[data-founding-pct]").textContent = f.percent;
      $("[data-founding-text]").textContent = f.text;
      founding.hidden = false;
    }
    $$("[data-spots]").forEach(function (el) { el.textContent = spotsText; });
    $$("[data-spots-fill]").forEach(function (el) { el.style.width = (f && f.spots ? Math.round(left / f.spots * 100) : 0) + "%"; });
    $$("[data-offer-note]").forEach(function (el) { el.hidden = !(f && f.active); });

    var g = C.offers.gift, band = $("[data-gift-banner]");
    if (band && g && g.active && (g.bannerMonths || []).indexOf(new Date().getMonth() + 1) > -1) band.hidden = false;

    var im = C.impact || {};
    var impact = $("[data-impact]");
    if (impact && im.hoursGivenBack > 0) {
      $("[data-impact-hours]").textContent = Math.round(im.hoursGivenBack).toLocaleString("en-CA");
      $("[data-impact-cap]").textContent = "hours given back" + (im.households > 0 ? " to " + im.households.toLocaleString("en-CA") + " household" + (im.households > 1 ? "s" : "") : "") + " so far";
      impact.hidden = false;
      $("[data-impact-empty]").hidden = true;
    }

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

    $$("[data-social]").forEach(function (el) {
      var url = B[el.getAttribute("data-social") + "Url"];
      if (url) { el.href = url; el.target = "_blank"; el.rel = "noopener"; el.removeAttribute("aria-disabled"); }
    });

    var gr = $("[data-google-review]");
    if (gr && B.googleReviewUrl) { gr.href = B.googleReviewUrl; gr.hidden = false; }
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
    var fsa = p.slice(0, 3);
    var hit = C.serviceArea.districts.filter(function (d) {
      return d.prefixes.some(function (x) { return fsa.indexOf(x) === 0; });
    })[0];
    return { fsa: fsa, area: hit ? hit.name : null };
  }
  function zoneMessage(z) {
    if (!z) return { cls: "no", text: "Enter a postal code like M1B 2K3." };
    if (z.area) return { cls: "ok", text: "Yes, we clean in " + z.fsa + " (" + z.area + ")." };
    return { cls: "no", text: "Sorry, " + z.fsa + " is outside our area. We clean in Scarborough and North York only. If you're close by, " + REACH + "." };
  }
  function bindPostalChecks() {
    $$("[data-pc-form]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var m = zoneMessage(zoneFor($("input", form).value));
        var out = $("[data-pc-result]", form);
        out.className = "pc-result " + m.cls;
        out.textContent = m.text;
        if (m.cls === "ok") {
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
      bedsBox.hidden = st.service === "detail";
      var p = price(st.service, st.beds, st.baths, st.home);
      $("[data-p-amount]", form).textContent = money(p);
      var f = C.offers.founding;
      var first = f && f.active ? " · " + money(p * (1 - f.percent / 100)) + " first visit" : "";
      $("[data-p-meta]", form).textContent = "Estimate · about " + hoursFor(st.service, st.beds, st.baths, st.home) + " hours" + first;
      var go = $("[data-p-go]", form);
      go.href = link("book/") + "?s=" + st.service + "&h=" + st.home + "&bd=" + st.beds + "&ba=" + st.baths;
      var wa = $("[data-p-wa]", form);
      if (wa) wa.href = waHref("Hi " + B.ownerFirstName + ", I'd like " + summary() + " (" + money(p) + "). When's your next opening?");
    }
    function summary() {
      var s = C.services[st.service], h = C.homeTypes[st.home];
      return s.name + " for a " + (st.service === "detail" ? h.short.toLowerCase() + " with " + st.baths + " bath" + (st.baths > 1 ? "s" : "") : st.beds + "-bed, " + st.baths + "-bath " + h.short.toLowerCase());
    }
    var tmBox = $("[data-textme]", form), tmOpen = $("[data-textme-open]", form);
    if (tmBox && tmOpen) {
      tmOpen.addEventListener("click", function () {
        var open = tmBox.hidden;
        tmBox.hidden = !open;
        tmOpen.setAttribute("aria-expanded", String(open));
        if (open) $("[data-textme-phone]", tmBox).focus();
      });
      var tmPhone = $("[data-textme-phone]", tmBox), tmSend = $("[data-textme-send]", tmBox), tmNote = $("[data-textme-note]", tmBox);
      var sendTm = function () {
        if (!phoneOk(tmPhone.value)) { fieldError(tmPhone, "Enter a 10-digit mobile number, like 647 555 0123."); tmPhone.focus(); tmBox.scrollIntoView({ block: "center" }); return; }
        fieldError(tmPhone, "");
        var p = price(st.service, st.beds, st.baths, st.home);
        tmSend.disabled = true; tmSend.textContent = "Sending…";
        send({ _form: "textPrice", _subject: "Text this price: " + money(p) + " to " + tmPhone.value.trim(), _template: "table", _captcha: "false", _honey: ($("[data-textme-honey]", tmBox) || {}).value || "",
          "Text this price to": tmPhone.value.trim(), "Quote": summary() + ", " + money(p), "Estimated time": "about " + hoursFor(st.service, st.beds, st.baths, st.home) + " hours", "Page": location.pathname
        }).then(function (res) {
          tmBox.classList.add("is-sent");
          if (res && res.skipped) {
            tmBox.innerHTML = '<p class="field-note"><strong>Preview only.</strong> On the live site, ' + esc(B.ownerFirstName) + " gets this request and texts " + esc(money(p)) + " to " + esc(tmPhone.value.trim()) + ".</p>";
            return;
          }
          track("generate_lead", { form: "text_me_price", service: st.service, value: p, currency: C.currency }, true);
          tmBox.innerHTML = '<p class="field-note"><strong>Sent.</strong> ' + esc(B.ownerFirstName) + " will text " + esc(money(p)) + " to " + esc(tmPhone.value.trim()) + " " + esc(B.replyPromise) + ".</p>";
        }).catch(function () {
          var ask = "Hi, please text me a price for " + summary() + " (" + money(p) + ").";
          tmNote.innerHTML = B.phone ? 'That didn\'t send. Please <a href="sms:' + B.phone + "?&body=" + encodeURIComponent(ask) + '">text us</a> instead.'
            : 'That didn\'t send. Please <a href="mailto:' + B.email + "?subject=" + encodeURIComponent("Price request") + "&body=" + encodeURIComponent(ask) + '">email us</a> instead.';
          tmSend.disabled = false; tmSend.textContent = "Send";
        });
      };
      tmSend.addEventListener("click", sendTm);
      tmPhone.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); sendTm(); } });
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
    var fieldIds = ["f-name", "f-phone", "f-email", "f-address", "f-postal", "f-access", "f-referrer", "f-notes"];
    // The page decides the flow: built with a Cal.com link, it has no day-and-window step and ends on the calendar.
    var LAST = $$(".step", form).length;
    var datesBox = $("[data-dates]");
    var calStep = $("[data-cal-step]");
    var calPath = String((C.booking || {}).calLink || "").trim().replace(/^https?:\/\/(app\.)?cal\.com\//, "").replace(/^\/+|\/+$/g, "");
    var CAL = !!(calStep && calPath);

    function availableDates() { return openDates(C.daysAhead); }
    var iso = isoDay;
    function parseIso(s) { var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
    function longDate(s) { return new Intl.DateTimeFormat("en-CA", { weekday: "long", month: "long", day: "numeric" }).format(parseIso(s)); }
    function slotById(id) { return C.timeSlots.filter(function (t) { return t.id === id; })[0]; }

    var wd = new Intl.DateTimeFormat("en-CA", { weekday: "short" }), mo = new Intl.DateTimeFormat("en-CA", { month: "short" });
    if (datesBox) datesBox.innerHTML = availableDates().map(function (d) {
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
      var subtotal = base + addonTotal;
      var freq = s.recurring ? C.frequencies[state.freq] : C.frequencies.once;
      var rec = freq ? freq.discount : 0;
      var f = C.offers.founding;
      var fp = f && f.active ? f.percent : 0;
      var firstPct = Math.max(fp, rec);
      var firstLabel = fp >= rec && fp > 0 ? f.label : (freq ? freq.label + " plan" : "");
      var tax = C.taxRate || 0;
      return {
        s: s, ht: ht, beds: beds, base: base, addons: addons, subtotal: subtotal, freq: freq, zone: z,
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
      if (q.firstDisc > 0) html += '<div class="disc"><dt>' + esc(q.firstLabel) + " · " + q.firstPct + "%</dt><dd>−" + money(q.firstDisc) + "</dd></div>";
      html += '<div class="total"><dt>' + (q.repeat ? "First visit" : "Estimated total") + "</dt><dd>" + money(q.first) + "</dd></div>";
      if (q.repeat) html += '<div class="then"><dt>Then ' + esc(q.freq.label.toLowerCase()) + "</dt><dd>" + money(q.repeat) + "</dd></div>";
      html += '<div class="then"><dt>Time on site</dt><dd>about ' + q.hours + " hrs</dd></div>";
      $("[data-lines]").innerHTML = html;
      $("[data-total]").textContent = money(q.first);
      $("[data-sum-label]").textContent = q.firstDisc > 0 ? "First visit · " + q.firstPct + "% off" : "Your estimate";
      $("[data-fine]").textContent = "Estimate in " + C.currency + (q.tax ? ", HST included" : "") + ". No payment now. We confirm the final price before we start.";
    }
    function sync() {
      $$('input[name="service"]', form).forEach(function (i) { i.checked = i.value === state.service; });
      $$('input[name="homeType"]', form).forEach(function (i) { i.checked = i.value === state.homeType; });
      $$('input[name="freq"]', form).forEach(function (i) { i.checked = i.value === state.freq; });
      $$('input[name="slot"]', form).forEach(function (i) { i.checked = i.value === state.slot; });
      $$('input[name="date"]', form).forEach(function (i) { i.checked = i.value === state.date; });
      if (datesBox) {
        $("[data-flex]").checked = state.flex;
        datesBox.classList.toggle("is-disabled", state.flex);
      }
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
    function markDots(n) {
      $$("[data-dot]").forEach(function (li) {
        var i = +li.getAttribute("data-dot");
        li.classList.toggle("is-done", i < n);
        li.classList.toggle("is-current", i === n);
        if (i === n) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
      });
    }
    function showStep(n, focus) {
      state.step = n;
      $$(".step", form).forEach(function (fs) { fs.hidden = +fs.getAttribute("data-step") !== n; });
      markDots(n);
      $("[data-prev]").hidden = n === 1;
      $("[data-next]").hidden = n === LAST;
      $("[data-submit]").hidden = n !== LAST;
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
    var checks = {
      "f-name": [function (v) { return v.trim().length >= 2; }, "Add your name."],
      "f-phone": [phoneOk, "Enter a 10-digit mobile number, like 647 555 0123."],
      "f-email": [emailOk, "Check your email address, or leave it blank."],
      "f-address": [function (v) { return v.trim().length >= 5; }, "Add your street address and unit."],
      // Optional, but a referral is credited by name, so it needs a first and a last name.
      "f-referrer": [function (v) { return !v.trim() || v.trim().split(/\s+/).filter(function (w) { return /[A-Za-zÀ-ÿ]/.test(w); }).length >= 2; }, "Add their first and last name, so we can credit the right person."],
      "f-postal": [function (v) { return fullPostalOk(v) && !!(zoneFor(v) || {}).area; }, null]
    };
    function checkField(el) {
      var c = checks[el.id];
      if (!c) return true;
      var ok = c[0](el.value), msg = "";
      if (!ok) {
        if (el.id === "f-postal") msg = fullPostalOk(el.value) ? "We clean in Scarborough and North York only. If you're close by, " + REACH + "." : "Enter a full postal code, like M1B 2K3.";
        else msg = c[1];
      }
      fieldError(el, msg);
      return ok;
    }
    function validate(n) {
      var msg = "";
      if (n === 1 && !checkField($("#f-postal"))) { msg = $("#err-f-postal").textContent; $("#f-postal").focus(); }
      if (n === 2 && datesBox) {
        if (!state.date && !state.flex) msg = "Choose a day, or tick “I'm flexible”.";
        else if (!state.slot) msg = "Choose an arrival window.";
      }
      if (n === LAST) {
        var first = null;
        ["f-name", "f-phone", "f-email", "f-address", "f-referrer"].forEach(function (id) { var el = $("#" + id); if (!checkField(el) && !first) first = el; });
        if (first) { msg = "Please fix the highlighted fields."; first.focus(); }
      }
      if (msg) {
        var err = $("[data-form-error]");
        // The details step shows its message inline and focuses the first field to fix, so it needs no toast.
        if (n === LAST) { err.textContent = msg; err.hidden = false; return false; }
        if (n === 1) return false;
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
      if (state.step > LAST || state.step < 1) state.step = 1;
      // Built for the calendar but no link set: send a request and we'll arrange the earliest opening.
      if (calStep && !CAL) state.flex = true;
    }
    function onPostal() {
      var el = $("#f-postal"), out = $("[data-pc-booking]");
      var m = normPostal(el.value).length === 6 ? zoneMessage(zoneFor(el.value)) : null;
      out.className = "pc-result ok";
      out.textContent = m && m.cls === "ok" ? m.text : "";
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
      renderSummary();
      save();
    });
    form.addEventListener("focusout", function (e) {
      if (checks[e.target.id] && e.target.value.trim()) checkField(e.target);
    });
    form.addEventListener("input", function (e) {
      if (e.target.classList.contains("invalid")) checkField(e.target);
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
      if (e.key === "Enter" && e.target.tagName === "INPUT" && state.step < LAST) { e.preventDefault(); $("[data-next]").click(); }
    });
    var sum = $("[data-summary]");
    // Keep a focused field clear of the sticky Continue and price bars on phones.
    form.addEventListener("focusin", function (e) {
      if (window.innerWidth < 960 && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) && e.target.getBoundingClientRect().bottom > window.innerHeight - 150) {
        e.target.scrollIntoView({ block: "center", behavior: "instant" });
      }
    });
    $("[data-summary-toggle]").addEventListener("click", function () {
      var open = !sum.classList.contains("open");
      sum.classList.toggle("open", open);
      this.setAttribute("aria-expanded", String(open));
    });

    function itemsText(q) {
      var parts = [q.s.name + " (" + homeLine(q) + ") " + money(q.base)];
      q.addons.forEach(function (a) { parts.push(a.name + " +" + money(a.price)); });
      if (q.firstDisc > 0) parts.push(q.firstLabel + " " + q.firstPct + "% off −" + money(q.firstDisc));
      parts.push((q.repeat ? "first visit " : "estimated total ") + money(q.first) + (q.tax ? " including HST" : ", no HST charged"));
      if (q.repeat) parts.push("then " + money(q.repeat) + " a visit, " + q.freq.label.toLowerCase());
      return parts.join("; ");
    }
    function whenText() {
      if (CAL) return "Picking a time on the calendar";
      return state.flex ? "Flexible: earliest opening" : longDate(state.date);
    }
    // A booked calendar time, shown in Toronto time whatever the visitor's device says.
    function fmtStart(d) {
      return new Intl.DateTimeFormat("en-CA", { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Toronto" }).format(d);
    }
    function ref() { var c = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", s = ""; for (var i = 0; i < 4; i++) s += c[Math.floor(Math.random() * c.length)]; return "NR-" + s; }
    function text(r, when) {
      var q = quote(), slot = slotById(state.slot);
      return [(CAL ? "Booking " : "Booking request ") + r, q.s.name + ", " + homeLine(q),
        q.addons.length ? "Extras: " + q.addons.map(function (a) { return a.name; }).join(", ") : "",
        "When: " + (when || (state.flex ? "earliest opening" : longDate(state.date)) + (slot ? ", " + slot.label + " (" + slot.time + ")" : "")),
        q.repeat ? "Plan: " + q.freq.label : "",
        "Estimate: " + money(q.first) + (q.repeat ? ", then " + money(q.repeat) + "/visit" : ""),
        "Name: " + $("#f-name").value, "Phone: " + $("#f-phone").value,
        "Address: " + $("#f-address").value + ", " + formatPostal($("#f-postal").value),
        $("#f-referrer").value.trim() ? "Referred by: " + $("#f-referrer").value.trim() : "",
        $("#f-notes").value ? "Notes: " + $("#f-notes").value : ""].filter(Boolean).join("\n");
    }
    var last = null;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate(LAST)) return;
      var r = ref(), q = quote(), slot = slotById(state.slot), z = q.zone;
      var when = whenText();
      var btn = $("[data-submit]"), btnLabel = btn.innerHTML;
      btn.disabled = true; btn.textContent = "Sending…";
      var email = $("#f-email").value.trim(), firstName = $("#f-name").value.trim().split(/\s+/)[0];
      var plain = q.s.name + ", " + homeLine(q) + "; " + when + (slot ? ", arrival " + slot.time : "") + "; estimate " + money(q.first) + (q.repeat ? ", then " + money(q.repeat) + " " + q.freq.label.toLowerCase() : "");
      send({
        _subject: "New booking " + r + ": " + q.s.name + ", " + when,
        _template: "table", _captcha: "false", _replyto: email || undefined,
        // The customer's written copy: itemized price and change terms. With the calendar, Cal.com confirms the time separately.
        _autoresponse: email ? autoReply(CAL ? (C.emails || {}).bookingCal : (C.emails || {}).booking, { name: firstName, ref: r, summary: plain, items: itemsText(q), reply: B.replyPromise, phone: B.phoneDisplay,
          notice: C.policies.cancelNoticeHours, lateFee: C.policies.lateCancelFee, terms: C.siteUrl + "/policies/", calendar: "https://cal.com/" + calPath }) : undefined,
        _form: "booking",
        _confirm: email ? { tpl: CAL ? "bookingCal" : "booking", vals: { name: firstName, ref: r, summary: plain, items: itemsText(q) } } : undefined,
        _honey: $('[name="_honey"]', form).value,
        "Reference": r, "Service": q.s.name, "Home": homeLine(q),
        "Extras": q.addons.map(function (a) { return a.name; }).join(", ") || "None",
        "Plan": q.freq ? q.freq.label : "One time", "Date": when,
        "Arrival window": slot ? slot.label + " (" + slot.time + ")" : "",
        "Estimate, first visit": money(q.first), "Estimate, repeat visits": q.repeat ? money(q.repeat) : "n/a",
        "Estimated time": "about " + q.hours + " hours",
        "Name": $("#f-name").value.trim(), "Phone": $("#f-phone").value.trim(), email: email || "not given",
        "Address": $("#f-address").value.trim(), "Postal code": formatPostal($("#f-postal").value) + (z && z.area ? " (" + z.area + ")" : ""),
        "Getting in": $("#f-access").value, "Pets": ($('input[name="pets"]:checked', form) || {}).value,
        "Referred by": $("#f-referrer").value.trim() || "None",
        "Notes": $("#f-notes").value.trim() || "None", "Confirm by": ($('input[name="contactPref"]:checked', form) || {}).value
      }).then(function (res) {
        track("generate_lead", { form: "booking", service: state.service, value: Math.round(q.first), currency: C.currency }, true);
        last = { ref: r, date: state.flex || CAL ? null : state.date, slot: slot, hours: q.hours, service: q.s.name, address: $("#f-address").value };
        var info = { r: r, q: q, slot: slot, email: email, firstName: firstName, skipped: !!(res && res.skipped),
          how: { Text: "text", WhatsApp: "message", Call: "call", Email: "email" }[($('input[name="contactPref"]:checked', form) || {}).value] || "text" };
        form.hidden = true;
        if (CAL && !info.skipped) showCalendar(info);
        else showDone(info, false, null);
        store(DRAFT_KEY, null);
      }).catch(function () {
        var err = $("[data-form-error]");
        err.innerHTML = "We couldn't send your request online. Please " + (B.phone ? "<a href=\"sms:" + B.phone + "?&body=" + encodeURIComponent(text(r)) + "\">text it to us</a> or " : "") + "<a href=\"mailto:" + B.email +
          "?subject=" + encodeURIComponent("Booking request " + r) + "&body=" + encodeURIComponent(text(r)) + "\">email it</a>. Your details are filled in.";
        err.hidden = false;
      }).then(function () { btn.disabled = false; btn.innerHTML = btnLabel; });
    });

    function showDone(info, booked, start) {
      var q = info.q, slot = info.slot;
      var when = booked ? (start ? fmtStart(start) : "The time you picked (see your confirmation email)")
        : (state.flex ? "Earliest opening (we'll confirm)" : longDate(state.date)) + (slot ? ", arrival " + slot.time : "");
      $("[data-progress]").hidden = true;
      $("[data-summary]").hidden = true;
      $(".book-head h1").textContent = booked ? "You're booked" : "Request sent";
      $("[data-done-label]").textContent = booked ? "Booking confirmed" : "Request received";
      $("[data-ref]").textContent = info.r;
      var rows = [
        ["When", when],
        ["Where", $("#f-address").value.trim() + ", " + formatPostal($("#f-postal").value)],
        ["Service", q.s.name + " · " + homeLine(q)],
        $("#f-referrer").value.trim() ? ["Referred by", $("#f-referrer").value.trim() + ". We'll credit them once your clean is done and paid."] : null,
        ["Estimate", money(q.first) + (q.firstDisc > 0 ? " (" + q.firstPct + "% off: " + q.firstLabel.toLowerCase() + ")" : "") + (q.repeat ? ", then " + money(q.repeat) + " " + q.freq.label.toLowerCase() : "") + ". Paid after the clean."],
        ["Changes", (booked ? "Use the links in your confirmation email. " : "") + "Free up to " + C.policies.cancelNoticeHours + " hours before your " + (booked ? "booking" : "arrival window") + ". Later changes may cost " + C.policies.lateCancelFee + "."]
      ];
      $("[data-done-list]").innerHTML = rows.filter(Boolean).map(function (x) { return "<div><dt>" + esc(x[0]) + "</dt><dd>" + esc(x[1]) + "</dd></div>"; }).join("");
      if (info.skipped) {
        $("[data-done-title]").textContent = "Preview only.";
        $("[data-done-text]").textContent = "This preview doesn't send bookings. On the live site, " + B.ownerFirstName + " receives this request by email.";
      } else if (booked) {
        $("[data-done-title]").textContent = "You're booked, " + info.firstName + ".";
        var at = start ? fmtStart(start) : "";
        $("[data-done-text]").textContent = (at ? at + (/\.$/.test(at) ? " " : ". ") : "") + "Your confirmation email has links to reschedule or cancel. " +
          B.ownerFirstName + " will " + info.how + " you " + B.replyPromise + " to confirm the details. Nothing to pay until after your clean.";
      } else {
        $("[data-done-title]").textContent = "Thank you, " + info.firstName + ".";
        $("[data-done-text]").textContent = B.ownerFirstName + " will " + info.how + " you " + B.replyPromise + " to confirm " +
          (state.flex ? "the earliest opening" : longDate(state.date) + (slot ? ", " + slot.label.toLowerCase() : "")) + "." + (info.email ? " A confirmation is on its way to " + info.email + "." : "") + " Nothing to pay until after your clean.";
      }
      var msg = text(info.r, booked ? when : null);
      var smsb = $("[data-sms-booking]");
      if (smsb) smsb.href = "sms:" + B.phone + "?&body=" + encodeURIComponent(msg);
      var wab = $("[data-wa-booking]");
      if (wab) wab.href = waHref(msg);
      // A calendar booking already comes with its own calendar invite.
      $("[data-ics]").hidden = PREVIEW || booked || !last.date;
      var done = $("[data-done]");
      done.hidden = false;
      done.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Cal.com's standard embed loader, in this file's ES5 style. It queues calls until embed.js arrives.
    function loadCal() {
      if (window.Cal) return;
      var d = document, push = function (a, ar) { a.q.push(ar); };
      window.Cal = function () {
        var cal = window.Cal, ar = arguments;
        if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = "https://app.cal.com/embed/embed.js"; cal.loaded = true; }
        if (ar[0] === "init") {
          var api = function () { push(api, arguments); }, ns = ar[1];
          api.q = api.q || [];
          if (typeof ns === "string") { cal.ns[ns] = cal.ns[ns] || api; push(cal.ns[ns], ar); push(cal, ["initNamespace", ns]); } else push(cal, ar);
          return;
        }
        push(cal, ar);
      };
    }
    // Everything the customer already typed, so Cal.com's form is filled in and the slot is the right length.
    function calConfig(info) {
      var q = info.q, digits = $("#f-phone").value.replace(/\D/g, "").slice(-10);
      var notes = [
        "Booking " + info.r + ": " + q.s.name + ", " + homeLine(q),
        q.addons.length ? "Extras: " + q.addons.map(function (a) { return a.name; }).join(", ") : "",
        q.repeat ? "Plan: " + q.freq.label : "",
        "Estimate: " + money(q.first) + (q.repeat ? ", then " + money(q.repeat) + "/visit" : "") + ", about " + q.hours + " hours",
        "Address: " + $("#f-address").value.trim() + ", " + formatPostal($("#f-postal").value),
        "Getting in: " + $("#f-access").value + ". Pets: " + (($('input[name="pets"]:checked', form) || {}).value || "No pets"),
        $("#f-referrer").value.trim() ? "Referred by: " + $("#f-referrer").value.trim() : "",
        $("#f-notes").value.trim() ? "Notes: " + $("#f-notes").value.trim() : ""
      ].filter(Boolean).join("\n");
      var cfg = { name: $("#f-name").value.trim(), notes: notes, attendeePhoneNumber: "+1" + digits, "metadata[ref]": info.r,
        duration: String(Math.min(480, Math.max(60, Math.ceil(q.hours) * 60))), layout: "month_view", theme: isDark() ? "dark" : "light" };
      if (info.email) cfg.email = info.email;
      return cfg;
    }
    function showCalendar(info) {
      var cfg = calConfig(info);
      $(".book-head h1").textContent = "Almost booked";
      markDots(3);
      $("[data-cal-link]").href = "https://cal.com/" + calPath + "?" + Object.keys(cfg).map(function (k) { return encodeURIComponent(k) + "=" + encodeURIComponent(cfg[k]); }).join("&");
      calStep.hidden = false;
      calStep.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
      var booked = false;
      function onBooked(e) {
        if (booked) return;
        booked = true;
        var d = (e && e.detail && e.detail.data) || {};
        var start = d.startTime || (d.booking && d.booking.startTime) || d.date;
        track("booking_scheduled", { service: state.service, value: Math.round(info.q.first), currency: C.currency });
        calStep.hidden = true;
        showDone(info, true, start && !isNaN(new Date(start)) ? new Date(start) : null);
      }
      loadCal();
      window.Cal("init", { origin: "https://app.cal.com" });
      window.Cal("inline", { elementOrSelector: $("[data-cal-embed]"), calLink: calPath, config: cfg });
      window.Cal("ui", { theme: isDark() ? "dark" : "light", layout: "month_view", hideEventTypeDetails: false, cssVarsPerTheme: { light: { "cal-brand": "#0A2D5C" }, dark: { "cal-brand": "#6FC3E0" } } });
      window.Cal("on", { action: "bookingSuccessfulV2", callback: onBooked });
      window.Cal("on", { action: "bookingSuccessful", callback: onBooked });
      setTimeout(function () { if (!booked && !$("[data-cal-embed] iframe")) $("[data-cal-fail]").hidden = false; }, 10000);
    }

    $("[data-ics]").addEventListener("click", function () {
      if (!last || !last.date) return;
      var pad = function (n) { return String(n).padStart(2, "0"); };
      var start = (last.slot && last.slot.start) || 9, d = last.date.replace(/-/g, "");
      var ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Nest & Rest Cleaning//Booking//EN", "BEGIN:VEVENT",
        "UID:" + last.ref + "@nestandrestcleaning", "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z",
        "DTSTART;TZID=America/Toronto:" + d + "T" + pad(start) + "0000",
        "DTEND;TZID=America/Toronto:" + d + "T" + pad(Math.min(23, start + Math.ceil(last.hours + 3))) + "0000",
        "SUMMARY:Nest & Rest: " + last.service + " (requested)", "LOCATION:" + last.address.replace(/[,;]/g, "\\$&"),
        "DESCRIPTION:Booking request " + last.ref + ". We'll confirm by text. " + (B.phone ? B.phoneDisplay : B.email), "STATUS:TENTATIVE", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
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

  /* ---------- Light and dark mode ---------- */
  // The site opens in light mode; the header button switches to dark, and the choice is remembered.
  function isDark() {
    return document.documentElement.getAttribute("data-theme") === "dark";
  }
  function bindTheme() {
    var meta = $('meta[name="theme-color"]');
    function paint() {
      var dark = isDark();
      $$("[data-theme-toggle]").forEach(function (b) { b.setAttribute("aria-pressed", String(dark)); });
      if (meta) meta.setAttribute("content", dark ? "#0E1A2B" : "#F7F3EA");
    }
    $$("[data-theme-toggle]").forEach(function (b) {
      b.addEventListener("click", function () {
        var next = isDark() ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        try { localStorage.setItem("nr-theme", next); } catch (e) { /* the choice lasts for this page only */ }
        paint();
        track("theme_toggle", { theme: next });
      });
    });
    paint();
  }

  /* ---------- Announcement bar and floating header ---------- */
  function bindAnnounce() {
    var bar = $("[data-announce]");
    if (!bar) return;
    $("[data-announce-close]", bar).addEventListener("click", function () {
      bar.hidden = true;
      try { localStorage.setItem("nr-announce", bar.getAttribute("data-key")); } catch (e) { /* the bar simply returns next visit */ }
    });
    var items = $$("[data-announce-msgs] > span", bar);
    if (items.length < 2 || (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
    var i = 0, paused = false;
    ["mouseenter", "focusin"].forEach(function (ev) { bar.addEventListener(ev, function () { paused = true; }); });
    ["mouseleave", "focusout"].forEach(function (ev) { bar.addEventListener(ev, function () { paused = false; }); });
    setInterval(function () {
      if (paused || bar.hidden || document.hidden) return;
      items[i].classList.remove("is-on");
      i = (i + 1) % items.length;
      items[i].classList.add("is-on");
    }, 5000);
  }
  function bindHeader() {
    var hdr = $(".site-header");
    if (!hdr) return;
    var onScroll = function () { hdr.classList.toggle("is-scrolled", window.scrollY > 24); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Inline field errors ---------- */
  function fieldError(el, msg) {
    var id = "err-" + el.id;
    var box = document.getElementById(id);
    if (!box) {
      box = document.createElement("small");
      box.className = "field-error";
      box.id = id;
      box.setAttribute("aria-live", "polite");
      var anchor = el.closest(".select-wrap, .pc-row") || el;
      anchor.insertAdjacentElement("afterend", box);
    }
    box.textContent = msg || "";
    box.hidden = !msg;
    el.classList.toggle("invalid", !!msg);
    if (msg) { el.setAttribute("aria-invalid", "true"); el.setAttribute("aria-describedby", id); }
    else { el.removeAttribute("aria-invalid"); el.removeAttribute("aria-describedby"); }
  }

  /* ---------- Delivery ---------- */
  function phoneOk(v) { var d = String(v).replace(/\D/g, ""); return d.length === 10 || (d.length === 11 && d[0] === "1"); }
  function emailOk(v) { return !v || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }
  /* "google" posts to our Google script as plain text, so the browser sends it straight away (no CORS check, which the script
     can't answer). The script writes the confirmation from its own copy of the wording, so only _confirm's short values go. */
  function send(data) {
    if (PREVIEW || !C.delivery || C.delivery.provider === "none") return Promise.resolve({ skipped: true });
    var G = C.delivery.provider === "google", body = {};
    Object.keys(data).forEach(function (k) {
      if (data[k] === undefined || (G ? /^_(autoresponse|template|captcha)$/ : /^_(form|confirm)$/).test(k)) return;
      body[k] = data[k];
    });
    return fetch(C.delivery.endpoint, {
      method: "POST", headers: G ? { "Content-Type": "text/plain;charset=utf-8" } : { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(body)
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
    function qCheck(el) {
      var v = el.value.trim(), m = "";
      if (el.hasAttribute("data-required") && v.length < 2) m = "Add your " + el.name.toLowerCase() + ".";
      if (el.hasAttribute("data-phone") && !phoneOk(v)) m = "Enter a 10-digit phone number, like 647 555 0123.";
      if (el.hasAttribute("data-email") && !emailOk(v)) m = "Check your email address, or leave it blank.";
      if (el.hasAttribute("data-postal")) {
        if (!fullPostalOk(v)) m = "Enter a full postal code, like M1B 2K3.";
        else if (!(zoneFor(v) || {}).area) m = "We clean in Scarborough and North York only. If you're close by, " + REACH + ".";
      }
      fieldError(el, m);
      return !m;
    }
    var checked = "[data-required], [data-phone], [data-email], [data-postal]";
    form.addEventListener("focusout", function (e) { if (e.target.matches(checked) && e.target.value.trim()) qCheck(e.target); });
    form.addEventListener("input", function (e) { if (e.target.classList.contains("invalid")) qCheck(e.target); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var err = $("[data-q-error]"), first = null;
      $$(checked, form).forEach(function (el) { if (!qCheck(el) && !first) first = el; });
      if (first) { err.textContent = "Please fix the highlighted fields."; err.hidden = false; first.focus(); return; }
      err.hidden = true;
      var data = { _form: "quote", _subject: "New quote request: " + name, _template: "table", _captcha: "false", "Service": name };
      $$("input, select, textarea", form).forEach(function (el) {
        if (el.name === "_honey") data._honey = el.value;
        else if (el.name) data[el.name] = el.value.trim() || "—";
      });
      if (data.Email && data.Email !== "—") {
        data._replyto = data.email = data.Email;
        data._autoresponse = autoReply((C.emails || {}).quote, { name: String(data.Name).split(/\s+/)[0], reply: form.getAttribute("data-reply-time"), phone: B.phoneDisplay });
        data._confirm = { tpl: "quote", vals: { name: String(data.Name).split(/\s+/)[0], reply: form.getAttribute("data-reply-time") } };
      }
      delete data.Email;
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
          $("[data-qd-text]").textContent = B.ownerFirstName + " will reply " + form.getAttribute("data-reply-time") + ". Questions in the meantime? " + (B.phone ? "Call or text " + B.phoneDisplay : "Email " + B.email) + ".";
        }
        done.hidden = false;
        done.focus();
      }).catch(function () {
        var body = Object.keys(data).filter(function (k) { return k[0] !== "_"; }).map(function (k) { return k + ": " + data[k]; }).join("\n");
        err.innerHTML = "We couldn't send that online. Please <a href=\"mailto:" + B.email + "?subject=" + encodeURIComponent("Quote request: " + name) +
          "&body=" + encodeURIComponent(body) + "\">email it to us</a>" + (B.phone ? " or call " + esc(B.phoneDisplay) : "") + ".";
        err.hidden = false;
      }).then(function () { btn.disabled = false; btn.textContent = "Request a free quote"; });
    });
  }

  /* ---------- Gift a clean ---------- */
  function bindGift() {
    var form = $("[data-gift-form]");
    if (!form) return;
    var them = $("[data-gift-them]");
    form.addEventListener("change", function (e) {
      if (e.target.name === "send") them.hidden = e.target.value.indexOf("them") === -1;
    });
    function gCheck(el) {
      var v = el.value.trim(), m = "";
      if (el.hasAttribute("data-required") && v.length < 2) m = el.id === "g-to" ? "Add who the gift is for." : "Add your name.";
      if (el.hasAttribute("data-phone") && !phoneOk(v)) m = "Enter a 10-digit mobile number, like 647 555 0123.";
      if (el.hasAttribute("data-email-required") && !(v && emailOk(v))) m = "Add your email, so we can send your gift card.";
      if (el.id === "g-their-email" && !them.hidden && !(v && emailOk(v))) m = "Add their email, or send the gift card to yourself.";
      if (el.hasAttribute("data-postal-optional") && v) {
        if (!fullPostalOk(v)) m = "Enter a full postal code, like M2N 5W9, or leave it blank.";
        else if (!(zoneFor(v) || {}).area) m = "That postal code is outside Scarborough and North York, where the clean has to be.";
      }
      fieldError(el, m);
      return !m;
    }
    var checked = "[data-required], [data-phone], [data-email-required], [data-postal-optional], #g-their-email";
    form.addEventListener("focusout", function (e) { if (e.target.matches(checked) && e.target.value.trim()) gCheck(e.target); });
    form.addEventListener("input", function (e) { if (e.target.classList.contains("invalid")) gCheck(e.target); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var err = $("[data-gift-error]"), first = null;
      $$(checked, form).forEach(function (el) { if (!gCheck(el) && !first) first = el; });
      if (first) { err.textContent = "Please fix the highlighted fields."; err.hidden = false; first.focus(); return; }
      err.hidden = true;
      var r = "GIFT-" + Math.random().toString(36).slice(2, 6).toUpperCase();
      var amount = ($('input[name="amount"]:checked', form) || {}).value;
      var mine = $("#g-email").value.trim(), name = $("#g-name").value.trim();
      var data = { _form: "gift", _confirm: { tpl: "gift", vals: { name: name.split(/\s+/)[0], ref: r } }, _subject: "New gift card request " + r + ": " + money(+amount), _template: "table", _captcha: "false", _replyto: mine, email: mine,
        _autoresponse: autoReply((C.emails || {}).gift, { name: name.split(/\s+/)[0], ref: r, reply: B.replyPromise, phone: B.phoneDisplay }),
        "Reference": r, "Amount": money(+amount), "Send": ($('input[name="send"]:checked', form) || {}).value };
      $$("input, textarea", form).forEach(function (el) {
        if (el.name === "_honey") data._honey = el.value;
        else if (el.name && el.type !== "radio" && el.id !== "g-email" && (el.id !== "g-their-email" || !them.hidden)) data[el.name] = el.value.trim() || "—";
      });
      var btn = $('button[type="submit"]', form);
      btn.disabled = true; btn.textContent = "Sending…";
      send(data).then(function (res) {
        track("generate_lead", { form: "gift", value: +amount, currency: C.currency }, true);
        form.hidden = true;
        var done = $("[data-gift-done]");
        $("[data-gd-ref]").textContent = r;
        if (res && res.skipped) {
          $("[data-gd-title]").textContent = "Preview only.";
          $("[data-gd-text]").textContent = "On the live site, " + B.ownerFirstName + " receives this gift request by email.";
        } else {
          $("[data-gd-title]").textContent = "Thank you, " + name.split(/\s+/)[0] + ".";
          $("[data-gd-text]").textContent = B.ownerFirstName + " will text you " + B.replyPromise + " to confirm and send an Interac e-Transfer request for " + money(+amount) + ". A confirmation is on its way to " + mine + ".";
        }
        done.hidden = false;
        done.focus();
      }).catch(function () {
        err.innerHTML = "We couldn't send that online. Please <a href=\"mailto:" + B.email + "?subject=" + encodeURIComponent("Gift card request " + r) + "&body=" + encodeURIComponent("Gift amount: " + money(+amount) + "\nFor: " + $("#g-to").value) + "\">email us</a>" + (B.phone ? " or call " + esc(B.phoneDisplay) : "") + ".";
        err.hidden = false;
      }).then(function () { btn.disabled = false; btn.textContent = "Request gift card"; });
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
      send({ _form: "review", _subject: "New review: " + rating + " stars from " + nm, _template: "table", _captcha: "false", _honey: $('[name="_honey"]', form).value,
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

  /* ---------- Preview only: links between pages ---------- */
  // Claude's preview window can't open the site's other pages as new documents, but it can fetch them,
  // so in the preview a link to another page loads that page into this one. The live site uses plain links.
  function bindPreviewNav() {
    if (!PREVIEW || window.__nrPreviewNav || !window.fetch || !window.DOMParser) return;
    window.__nrPreviewNav = true;
    var here = new URL(location.href);
    var pageOf = function (u) { return u.pathname.replace(/\/$/, "/index.html"); };
    var jump = function (hash) {
      var el = hash && document.getElementById(decodeURIComponent(hash.slice(1)));
      // "instant" so a new page opens at its top rather than gliding up from where the last one was read
      if (el) el.scrollIntoView({ behavior: "instant" }); else window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    };
    function load(url, push) {
      return fetch(url.href.split("#")[0]).then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.text();
      }).then(function (html) {
        var doc = new DOMParser().parseFromString(html, "text/html");
        var src = doc.querySelector("div.page[data-page]") || doc.body;
        var box = document.querySelector("div.page[data-page]") || document.body;
        // Moving to the new address first makes the page's relative links, images and scripts resolve from it.
        if (push) {
          try { history.pushState({ nrPreview: true }, "", url.href); }
          catch (err) {
            var base = document.querySelector("base") || document.head.appendChild(document.createElement("base"));
            base.href = url.href;
          }
        }
        here = url;
        document.title = doc.title;
        ["data-page", "data-root"].forEach(function (a) {
          box.setAttribute(a, src.getAttribute(a));
          document.body.setAttribute(a, src.getAttribute(a));
        });
        document.body.classList.remove("menu-open");
        box.innerHTML = src.innerHTML;
        var site = null;
        $$("script", box).forEach(function (s) {
          if (s.type === "application/ld+json") return;
          if (/js\/site\.js/.test(s.getAttribute("src") || "")) site = s.src;
          if (s.src || /NR_CONFIG/.test(s.textContent)) { s.remove(); return; }
          var run = document.createElement("script");
          run.textContent = s.textContent;
          s.replaceWith(run);
        });
        jump(url.hash);
        if (site) {
          var again = document.createElement("script");
          again.src = site;
          document.body.appendChild(again);
        }
      }).catch(function () { location.href = url.href; });
    }
    document.addEventListener("click", function (e) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest("a[href]");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      var url = new URL(a.href);
      if (url.origin !== location.origin || !/(\.html|\/)$/.test(url.pathname)) return;
      e.preventDefault();
      if (pageOf(url) === pageOf(here) && url.search === here.search) { jump(url.hash); return; }
      load(url, true);
    }, true);
    window.addEventListener("popstate", function () { load(new URL(location.href), false); });
  }

  initAnalytics();
  fillCommon();
  renderReviews();
  bindPostalChecks();
  bindPricer();
  bindBooking();
  bindQuote();
  bindReview();
  bindGift();
  bindTheme();
  bindAnnounce();
  bindHeader();
  bindChrome();
  bindPreviewNav();
})();
