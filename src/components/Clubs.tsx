import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { type ClubData, newClub, parseAmount } from "../lib/club";
import { card, field, primary } from "./ui";

export function Clubs({ data, onChange, onOpen }: { data: ClubData; onChange: (d: ClubData) => void; onOpen: (id: string) => void }) {
  const [name, setName] = useState("");
  const [fee, setFee] = useState("0");

  return (
    <section aria-labelledby="clubs-h" className="flex flex-col gap-4">
      <h2 id="clubs-h" className="text-xl font-extrabold">
        Your clubs
      </h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          const c = newClub(name.trim().slice(0, 60), parseAmount(fee) ?? 0);
          onChange({ ...data, clubs: [c, ...data.clubs], activeClubId: c.id });
          setName("");
          onOpen(c.id);
        }}
        className={`${card} grid gap-2 sm:grid-cols-[1fr_7rem_auto] sm:items-end`}
      >
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Club, class or group
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tuesday run club, U9s football, choir" className={field} required />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Session fee
          <input value={fee} onChange={(e) => setFee(e.target.value)} inputMode="decimal" className={`${field} tabular-nums`} />
        </label>
        <button type="submit" className={primary}>
          <Plus size={16} aria-hidden="true" /> Start
        </button>
      </form>
      <ul className="flex flex-col gap-2">
        {data.clubs.map((c) => (
          <li key={c.id} className={`${card} flex items-center gap-2 p-2`}>
            <button
              type="button"
              onClick={() => onOpen(c.id)}
              aria-current={c.id === data.activeClubId ? "true" : undefined}
              className="flex min-h-12 flex-1 flex-col items-start justify-center rounded-xl px-2 text-left hover:bg-slate-50 aria-[current=true]:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-indigo-700"
            >
              <span className="font-bold">{c.name}</span>
              <span className="text-sm text-slate-600">
                {c.members.length} members · {c.sessions.length} sessions
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm(`Delete ${c.name} and its registers?`))
                  onChange({ ...data, clubs: data.clubs.filter((x) => x.id !== c.id), activeClubId: data.activeClubId === c.id ? null : data.activeClubId });
              }}
              aria-label={`Delete ${c.name}`}
              className="grid size-11 place-items-center rounded-xl text-rose-700 hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-rose-700"
            >
              <Trash2 size={18} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
