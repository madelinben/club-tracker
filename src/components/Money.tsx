import { Copy } from "lucide-react";
import { useState } from "react";
import { balance, type Club, formatMoney } from "../lib/club";
import { card } from "./ui";

export function Money({ club }: { club: Club }) {
  const [copied, setCopied] = useState(false);
  const money = (p: number) => formatMoney(p, club.currency);
  const owing = club.members
    .map((m) => ({ m, b: balance(club, m.id) }))
    .filter((x) => x.b < 0)
    .sort((a, b) => a.b - b.b);
  const collected = club.payments.reduce((n, p) => n + p.amount, 0);
  const due = club.sessions.reduce((n, s) => n + s.fee * s.attendees.length, 0);
  const names = new Map(club.members.map((m) => [m.id, m.name]));

  async function copy() {
    try {
      await navigator.clipboard.writeText(
        [`${club.name}: subs owed`, ...owing.map(({ m, b }) => `${m.name}: ${money(-b)}`)].join(
          "\n"
        )
      );
      setCopied(true);
    } catch {}
  }

  return (
    <section aria-labelledby="money-h" className="flex flex-col gap-4">
      <h2 id="money-h" className="text-xl font-extrabold">
        Money
      </h2>
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          ["Collected", collected],
          ["Fees due", due],
          ["Outstanding", owing.reduce((n, x) => n - x.b, 0)],
        ].map(([label, n]) => (
          <p key={label} className={card}>
            <span className="block text-lg font-black tabular-nums">{money(Number(n))}</span>
            <span className="text-sm text-slate-600">{label}</span>
          </p>
        ))}
      </div>
      <div className={card}>
        <h3 className="mb-2 font-semibold">Who owes</h3>
        {owing.length === 0 ? (
          <p className="text-emerald-800">Everyone is paid up.</p>
        ) : (
          <>
            <ul className="flex flex-col gap-1">
              {owing.map(({ m, b }) => (
                <li key={m.id} className="flex justify-between">
                  <span className="font-semibold">{m.name}</span>
                  <span className="font-bold tabular-nums text-rose-700">{money(-b)}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={copy}
              className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-indigo-800 underline hover:no-underline"
            >
              <Copy size={14} aria-hidden="true" />{" "}
              {copied ? "Copied" : "Copy reminder for the group chat"}
            </button>
          </>
        )}
      </div>
      {club.payments.length > 0 && (
        <section aria-labelledby="payments-h">
          <h3
            id="payments-h"
            className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-600"
          >
            Payments
          </h3>
          <ul className="flex flex-col gap-1 text-sm">
            {[...club.payments].reverse().map((p) => (
              <li
                key={p.id}
                className="flex justify-between gap-2 rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200"
              >
                <span className="tabular-nums text-slate-600">{p.date}</span>
                <span className="flex-1 font-semibold">{names.get(p.memberId)}</span>
                <span className="font-bold tabular-nums">{money(p.amount)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </section>
  );
}
