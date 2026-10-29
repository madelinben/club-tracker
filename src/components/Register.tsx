import { CalendarPlus, UserPlus } from "lucide-react";
import { useState } from "react";
import { type Club, formatMoney, parseAmount, type Session, toggleAttendee } from "../lib/club";
import { card, field, primary, today } from "./ui";

/** Take the register: pick or start a session, tick who came, add walk-ins */
export function Register({ club, onChange }: { club: Club; onChange: (c: Club) => void }) {
  const sessions = [...club.sessions].sort((a, b) => b.date.localeCompare(a.date));
  const [sessionId, setSessionId] = useState(sessions[0]?.id ?? "");
  const [date, setDate] = useState(today);
  const [title, setTitle] = useState("Session");
  const [fee, setFee] = useState((club.fee / 100).toFixed(2));
  const [walkIn, setWalkIn] = useState("");
  const session = club.sessions.find((s) => s.id === sessionId);
  const members = club.members.filter((m) => m.active || session?.attendees.includes(m.id));

  const setSession = (s: Session) => onChange({ ...club, sessions: club.sessions.map((x) => (x.id === s.id ? s : x)) });

  function start(e: React.FormEvent) {
    e.preventDefault();
    const s: Session = { id: crypto.randomUUID(), date, title: title.trim().slice(0, 60) || "Session", fee: parseAmount(fee) ?? club.fee, attendees: [] };
    onChange({ ...club, sessions: [...club.sessions, s] });
    setSessionId(s.id);
  }

  function addWalkIn(e: React.FormEvent) {
    e.preventDefault();
    const name = walkIn.trim().slice(0, 40);
    if (!name || !session) return;
    const id = crypto.randomUUID();
    onChange({
      ...club,
      members: [...club.members, { id, name, contact: "", joined: session.date, active: true }],
      sessions: club.sessions.map((x) => (x.id === session.id ? { ...x, attendees: [...x.attendees, id] } : x)),
    });
    setWalkIn("");
  }

  return (
    <section aria-labelledby="reg-h" className="flex flex-col gap-4">
      <h2 id="reg-h" className="text-xl font-extrabold">
        Register
      </h2>
      <form onSubmit={start} className={`${card} grid gap-2 sm:grid-cols-[auto_1fr_6rem_auto] sm:items-end`}>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={field} required />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Session
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={field} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Fee
          <input value={fee} onChange={(e) => setFee(e.target.value)} inputMode="decimal" className={`${field} tabular-nums`} />
        </label>
        <button type="submit" className={primary}>
          <CalendarPlus size={16} aria-hidden="true" /> New session
        </button>
      </form>

      {sessions.length > 0 && (
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Taking the register for
          <select value={sessionId} onChange={(e) => setSessionId(e.target.value)} className={field}>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.date} · {s.title} · {s.attendees.length} came
              </option>
            ))}
          </select>
        </label>
      )}

      {session && (
        <>
          <p className="text-sm text-slate-700" aria-live="polite">
            <span className="font-bold tabular-nums">{session.attendees.length}</span> of {members.length} here
            {session.fee > 0 && ` · ${formatMoney(session.fee, club.currency)} each`}
          </p>
          {members.length === 0 ? (
            <p className="text-slate-600">No members yet. Add people as they arrive below, or in the Members tab.</p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {members.map((m) => (
                <li key={m.id}>
                  <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl bg-white px-3 font-semibold ring-1 ring-slate-200 has-checked:bg-indigo-50 has-checked:ring-indigo-600 has-focus-visible:outline-2 has-focus-visible:outline-indigo-700">
                    <input type="checkbox" checked={session.attendees.includes(m.id)} onChange={() => setSession(toggleAttendee(session, m.id))} className="size-5 accent-indigo-700" />
                    {m.name}
                  </label>
                </li>
              ))}
            </ul>
          )}
          <form onSubmit={addWalkIn} className="flex gap-2">
            <label htmlFor="walk-in" className="sr-only">
              New person at this session
            </label>
            <input id="walk-in" value={walkIn} onChange={(e) => setWalkIn(e.target.value)} placeholder="Someone new? Add their name" className={`${field} flex-1`} />
            <button type="submit" className={primary}>
              <UserPlus size={16} aria-hidden="true" /> Add
            </button>
          </form>
        </>
      )}
    </section>
  );
}
