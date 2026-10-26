/* The personal emails, built from the wording in js/config.js (automation), the lead and the optional paragraph. */

function composeEmail(kind, lead, ctx) {
  var site = ctx.site, A = site.automation, quote = lead.kind === "quote";
  var form = quote ? (A.quoteForms[lead.form] || A.quoteForms["default"]) : null;
  var tpl = kind === "quoteReply" ? { subject: form.subject, lines: A.quoteReply.lines } : A[kind];
  var walk = site.links.walkthrough;
  var service = quote ? form.label.replace("{form}", lead.form) : lead.form.toLowerCase();
  var prep = site.services.filter(function (s) { return s.name === lead.form; })[0];
  var base = {
    firstName: lead.firstName, service: service, requested: lead.requested, referrer: lead.referrer, paragraph: ctx.paragraph || "",
    notice: site.policies.cancelNoticeHours, codeDays: site.policies.accessCodeDeleteDays,
    owner: site.business.ownerFirstName, ownerFull: site.business.owner, referral: site.referral, areaLabel: site.business.areaLabel,
    calendarLink: site.links.calendar, reviewLink: site.links.review, walkthroughLink: walk
  };
  if (ctx.event) {
    base.day = ctx.clock.formatDay(ctx.event.start);
    base.when = ctx.clock.formatWhen(ctx.event.start);
  }
  // Every placeholder in the wording needs a value. Checked on the wording, so braces a client types stay as text.
  var fill = function (t) {
    String(t || "").replace(/\{(\w+)\}/g, function (m, k) {
      if (base[k] == null) throw new Error("Unfilled placeholder {" + k + "} in " + kind);
    });
    return fillTemplate(t, base).trim();
  };
  // Lines that carry placeholders of their own are filled first.
  base.referralLine = lead.referrer ? fill(A.referralLine) : "";
  base.prepLine = prep && A.prep[prep.key] ? A.prep[prep.key] : "";
  base.accessLine = fill(A.access[lead.access] || "");
  base.petsLine = A.pets[lead.pets] || "";
  if (form) {
    base.nextStep = fill(!walk && form.nextStepNoLink ? form.nextStepNoLink : form.nextStep);
    base.nudgeStep = fill(!walk && form.nudgeStepNoLink ? form.nudgeStepNoLink : form.nudgeStep);
  }
  var lines = tpl.lines.map(fill).filter(function (l) { return l !== ""; });
  return {
    to: lead.email,
    subject: fill(tpl.subject),
    text: lines.join("\n\n") + "\n\n" + site.footer,
    html: emailHtml(lines, site.footer),
    replyTo: "",
    name: A.senderName
  };
}
