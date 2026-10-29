import { Banknote, UserPlus } from "lucide-react";
import { useState } from "react";
import { attendance, balance, type Club, formatMoney, lapsed, type Member, parseAmount } from "../lib/club";
import { card, field, primary, today } from "./ui";

export function Members({ club, onChange }: { club: Club; onChange: (c: Club) => void }) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [paying, setPaying] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const quiet = new Set(lapsed(club).map((m) => m.id));
  const money = (p: number) => formatMoney(p, club.currency);

  const patch = (id: string, change: Partial<Member>) => onChange({ ...club, members: club.members.map((m) => (m.id === id ? { ...m, ...change } : m)) });

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onChange({ ...club, members: [...club.members, { id: crypto.randomUUID(), name: name.trim().slice(0, 40), contact: contact.trim().slice(0, 80), joined: today(), active: true }] });
    setName("");
    setContact("");
  }

  function pay(e: React.FormEvent, memberId: string) {
    e.preventDefault();
    const pence = parseAmount(amount);
    if (!pence) return;
    onChange({ ...club, payments: [...club.payments, { id: crypto.randomUUID(), memberId, amount: pence, date: today(), note: "" }] });
    setPaying(null);
    setAmount("");
  }

  return (
    <section aria-labelledby="members-h" className="flex flex-col gap-4">
      <h2 id="members-h" className="text-xl font-extrabold">
        Members <span className="text-base font-semibold text-slate-600">{club.members.filter((m) => m.active).length} active</span>
      </h2>
      <form onSubmit={add} className={`${card} grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end`}>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} className={field} required />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Phone or email (optional)
          <input value={contact} onChange={(e) => setContact(e.target.value)} className={field} />
        </label>
        <button type="submit" className={primary}>
          <UserPlus size={16} aria-hidden="true" /> Add member
        </button>
      </form>

      <ul className="flex flex-col gap-2">
        {club.members.map((m) => {
          const b = balance(club, m.id);
          const rate = attendance(club, m);
          return (
            <li key={m.id} className={`${card} flex flex-col gap-2 p-3 ${m.active ? "" : "opacity-70"}`}>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="flex-1 font-bold">
                  {m.name}
                  {quiet.has(m.id) && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">missed last 3</span>}
                </span>
                <span className="text-sm tabular-nums text-slate-600">{rate === null ? "no sessions yet" : `${Math.round(rate * 100)}% attendance`}</span>
                <span className={`text-sm font-bold tabular-nums ${b < 0 ? "text-rose-700" : "text-emerald-800"}`}>{b < 0 ? `owes ${money(-b)}` : b > 0 ? `${money(b)} credit` : "paid up"}</span>
              </div>
              {m.contact && <p className="text-sm text-slate-600">{m.contact}</p>}
              <div className="flex flex-wrap gap-2">
                {paying === m.id ? (
                  <form onSubmit={(e) => pay(e, m.id)} className="flex gap-2">
                    <label className="sr-only" htmlFor={`pay-${m.id}`}>
                      Amount {m.name} paid
                    </label>
                    <input id={`pay-${m.id}`} value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder={b < 0 ? (-b / 100).toFixed(2) : "0.00"} className={`${field} w-28 tabular-nums`} />
                    <button type="submit" className={primary}>
                      Save
                    </button>
                  </form>
                ) : (
                  <button type="button" onClick={() => setPaying(m.id)} className="inline-flex min-h-11 items-center gap-1 rounded-xl px-3 text-sm font-semibold text-indigo-800 ring-1 ring-indigo-300 hover:bg-indigo-50">
                    <Banknote size={16} aria-hidden="true" /> Record payment
                  </button>
                )}
                <label className="flex min-h-11 items-center gap-2 px-2 text-sm font-semibold">
                  <input type="checkbox" checked={m.active} onChange={(e) => patch(m.id, { active: e.target.checked })} className="size-5 accent-indigo-700" />
                  Active
                </label>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
