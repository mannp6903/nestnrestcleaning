import test from "node:test";
import assert from "node:assert/strict";
import { clock } from "./load.mjs";

test("at() follows daylight saving in Toronto", () => {
  assert.equal(clock.at(2026, 10, 31, 18, 0).toISOString(), "2026-10-31T22:00:00.000Z");
  assert.equal(clock.at(2026, 11, 1, 18, 0).toISOString(), "2026-11-01T23:00:00.000Z");
  assert.equal(clock.at(2026, 11, 2, 10, 0).toISOString(), "2026-11-02T15:00:00.000Z");
});

test("addDays keeps the wall-clock time across the change", () => {
  assert.equal(clock.addDays(new Date("2026-10-31T22:00:00Z"), 1).toISOString(), "2026-11-01T23:00:00.000Z");
  assert.equal(clock.addDays(new Date("2026-11-02T15:00:00Z"), -2).toISOString(), "2026-10-31T14:00:00.000Z");
});

test("local() gives Toronto wall-clock parts", () => {
  assert.deepEqual({ ...clock.local(new Date("2026-11-02T15:00:00Z")) }, { year: 2026, month: 11, day: 2, hour: 10, minute: 0, weekday: 1 });
});

test("formats", () => {
  const d = new Date("2026-11-02T15:00:00Z");
  assert.equal(clock.formatDay(d), "Monday, November 2");
  assert.equal(clock.formatTime(d), "10am");
  assert.equal(clock.formatTime(new Date("2026-11-02T15:30:00Z")), "10:30am");
  assert.equal(clock.formatTime(new Date("2026-11-02T17:00:00Z")), "12pm");
  assert.equal(clock.formatTime(new Date("2026-11-02T05:00:00Z")), "12am");
  assert.equal(clock.formatTime(new Date("2026-11-02T23:05:00Z")), "6:05pm");
  assert.equal(clock.formatWhen(d), "Monday, November 2 at 10am");
  assert.equal(clock.dayKey(new Date("2026-11-02T04:30:00Z")), "2026-11-01");
  assert.equal(clock.formatStamp(new Date("2026-10-26T18:32:00Z")), "2026-10-26 14:32");
});
