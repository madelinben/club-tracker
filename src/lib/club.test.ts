import assert from "node:assert/strict";
import { test } from "node:test";
import {
  attendance,
  balance,
  type Club,
  lapsed,
  newClub,
  parseAmount,
  toggleAttendee,
} from "./club.ts";

const member = (id: string, joined = "2026-01-01") => ({
  id,
  name: id,
  contact: "",
  joined,
  active: true,
});
const session = (id: string, date: string, attendees: string[], fee = 500) => ({
  id,
  date,
  title: "Training",
  fee,
  attendees,
});

const club: Club = {
  ...newClub("Runners", 500),
  members: [member("a"), member("b"), member("c", "2026-03-01")],
  sessions: [
    session("1", "2026-02-01", ["a", "b"]),
    session("2", "2026-03-01", ["a", "c"]),
    session("3", "2026-03-08", ["a"]),
    session("4", "2026-03-15", ["a"], 0),
  ],
  payments: [{ id: "p", memberId: "a", amount: 1000, date: "2026-03-01", note: "" }],
};

test("balance: payments minus fees for sessions attended", () => {
  assert.equal(balance(club, "a"), -500);
  assert.equal(balance(club, "b"), -500);
  assert.equal(balance(club, "c"), -500);
});

test("attendance counts only sessions since joining", () => {
  assert.equal(attendance(club, member("a")), 1);
  assert.equal(attendance(club, member("c", "2026-03-01")), 1 / 3);
});

test("lapsed: active members who missed the last three", () => {
  assert.deepEqual(
    lapsed(club).map((m) => m.id),
    ["b"]
  );
});

test("toggleAttendee and parseAmount", () => {
  assert.deepEqual(toggleAttendee(toggleAttendee(session("x", "", []), "a"), "a").attendees, []);
  assert.equal(parseAmount("£4.50"), 450);
  assert.equal(parseAmount("0"), 0);
  assert.equal(parseAmount("-1"), null);
});
