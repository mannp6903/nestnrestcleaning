/* Toronto dates and times. Apps Script and Node read the time zone differently, so the caller passes in
   localParts(date) -> { year, month (1-12), day, hour (0-23), minute, weekday (0 = Sunday) } for America/Toronto. */

var TIME_DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var TIME_MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function makeClock(localParts) {
  function local(date) { return localParts(new Date(date)); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  // Offset of Toronto from UTC at a moment, in milliseconds (negative in Toronto).
  function offsetAt(t) {
    var p = local(t);
    return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) - Math.floor(t / 60000) * 60000;
  }
  // The moment a Toronto wall clock shows this date and time. Checked twice so the day the clocks change comes out right.
  function at(year, month, day, hour, minute) {
    var guess = Date.UTC(year, month - 1, day, hour, minute || 0);
    var t = guess - offsetAt(guess);
    if (local(t).hour !== hour) t = guess - offsetAt(t);
    return new Date(t);
  }
  function addDays(date, n) {
    var p = local(date), shifted = new Date(Date.UTC(p.year, p.month - 1, p.day + n));
    return at(shifted.getUTCFullYear(), shifted.getUTCMonth() + 1, shifted.getUTCDate(), p.hour, p.minute);
  }
  function dayKey(date) { var p = local(date); return p.year + "-" + pad(p.month) + "-" + pad(p.day); }
  function formatDay(date) { var p = local(date); return TIME_DAY_NAMES[p.weekday] + ", " + TIME_MONTH_NAMES[p.month - 1] + " " + p.day; }
  function formatTime(date) {
    var p = local(date), h = p.hour % 12 || 12;
    return h + (p.minute ? ":" + pad(p.minute) : "") + (p.hour < 12 ? "am" : "pm");
  }
  function formatWhen(date) { return formatDay(date) + " at " + formatTime(date); }
  function formatStamp(date) { var p = local(date); return dayKey(date) + " " + pad(p.hour) + ":" + pad(p.minute); }
  return { local: local, at: at, addDays: addDays, dayKey: dayKey, formatDay: formatDay, formatTime: formatTime, formatWhen: formatWhen, formatStamp: formatStamp };
}
