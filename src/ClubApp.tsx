import { Building2, ClipboardCheck, PoundSterling, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Clubs } from "./components/Clubs";
import { DataBackup } from "./components/DataBackup";
import { Members } from "./components/Members";
import { Money } from "./components/Money";
import { Register } from "./components/Register";
import { type Club, type ClubData, EMPTY, parseClub } from "./lib/club";
import { type BeforeExport, load, save } from "./lib/storage";

const KEY = "club-tracker";
type Tab = "register" | "members" | "money" | "clubs";

const TABS = [
  { id: "register", label: "Register", Icon: ClipboardCheck },
  { id: "members", label: "Members", Icon: Users },
  { id: "money", label: "Money", Icon: PoundSterling },
  { id: "clubs", label: "Clubs", Icon: Building2 },
] as const;

export function ClubApp({ beforeExport }: { beforeExport?: BeforeExport }) {
  const [tab, setTab] = useState<Tab>("clubs");
  const [data, setData] = useState<ClubData>(EMPTY);
  const [ready, setReady] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  // Load after mount: localStorage is unavailable during SSR and would cause a hydration mismatch.
  useEffect(() => {
    const stored = parseClub(load<unknown>(KEY, null)) ?? EMPTY;
    setData(stored);
    if (stored.activeClubId) setTab("register");
    setReady(true);
  }, []);

  const update = (next: ClubData) => {
    setData(next);
    save(KEY, next);
  };
  const go = (t: Tab) => {
    setTab(t);
    scroller.current?.scrollTo({ top: 0 });
  };
  const club = data.clubs.find((c) => c.id === data.activeClubId);
  const setClub = (c: Club) => update({ ...data, clubs: data.clubs.map((x) => (x.id === c.id ? c : x)) });

  if (!ready) return <div className="h-full animate-pulse bg-slate-100" />;

  return (
    <div className="flex h-full flex-col bg-slate-50 text-slate-900">
      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-2xl flex-col gap-5 p-4">
          {club && tab !== "clubs" && <p className="text-sm font-semibold uppercase tracking-wide text-indigo-800">{club.name}</p>}
          {tab === "clubs" && (
            <>
              <Clubs
                data={data}
                onChange={update}
                onOpen={(id) => {
                  update({ ...data, activeClubId: id });
                  go("register");
                }}
              />
              <DataBackup filename="club-tracker.json" data={data} parse={parseClub} onRestore={update} beforeExport={beforeExport} />
            </>
          )}
          {tab !== "clubs" && !club && <p className="rounded-2xl bg-white p-8 text-center text-slate-600 ring-1 ring-slate-200">Start a club in the Clubs tab first.</p>}
          {tab === "register" && club && <Register key={club.id} club={club} onChange={setClub} />}
          {tab === "members" && club && <Members club={club} onChange={setClub} />}
          {tab === "money" && club && <Money club={club} />}
        </div>
      </div>
      <nav aria-label="Club Tracker" className="grid grid-cols-4 gap-1 border-t border-slate-200 bg-white p-1.5">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            aria-current={tab === id ? "page" : undefined}
            onClick={() => go(id)}
            className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-xs font-extrabold transition active:scale-[0.97] sm:flex-row sm:gap-2 sm:text-sm ${
              tab === id ? "bg-indigo-700 text-white" : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Icon size={18} aria-hidden="true" />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
