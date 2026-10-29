export interface Member {
  id: string;
  name: string;
  contact: string;
  joined: string;
  active: boolean;
}

export interface Session {
  id: string;
  /** yyyy-mm-dd */
  date: string;
  title: string;
  /** Whole pence each attendee owes for this session; 0 = free */
  fee: number;
  attendees: string[];
}

export interface Payment {
  id: string;
  memberId: string;
  /** Whole pence */
  amount: number;
  date: string;
  note: string;
}

export interface Club {
  id: string;
  name: string;
  currency: string;
  /** Default session fee in pence */
  fee: number;
  members: Member[];
  sessions: Session[];
  payments: Payment[];
}

export interface ClubData {
  version: 1;
  clubs: Club[];
  activeClubId: string | null;
}

export const EMPTY: ClubData = { version: 1, clubs: [], activeClubId: null };

export function newClub(name: string, fee: number, currency = "GBP"): Club {
  return { id: crypto.randomUUID(), name, currency, fee, members: [], sessions: [], payments: [] };
}

/** Paid minus fees for sessions attended: negative means they owe */
export function balance(club: Club, memberId: string): number {
  const paid = club.payments
    .filter((p) => p.memberId === memberId)
    .reduce((n, p) => n + p.amount, 0);
  const due = club.sessions
    .filter((s) => s.attendees.includes(memberId))
    .reduce((n, s) => n + s.fee, 0);
  return paid - due;
}

/** Share of sessions since joining that the member came to, 0..1 (null before any session) */
export function attendance(club: Club, member: Member): number | null {
  const since = club.sessions.filter((s) => s.date >= member.joined);
  if (!since.length) return null;
  return since.filter((s) => s.attendees.includes(member.id)).length / since.length;
}

/** Members who missed the last n sessions in a row: worth a check-in message */
export function lapsed(club: Club, n = 3): Member[] {
  const recent = [...club.sessions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, n);
  if (recent.length < n) return [];
  return club.members.filter(
    (m) =>
      m.active &&
      m.joined <= (recent[n - 1]?.date ?? "") &&
      recent.every((s) => !s.attendees.includes(m.id))
  );
}

export function toggleAttendee(session: Session, memberId: string): Session {
  return {
    ...session,
    attendees: session.attendees.includes(memberId)
      ? session.attendees.filter((id) => id !== memberId)
      : [...session.attendees, memberId],
  };
}

/** "12.50", "£12", "12,5" to pence; null unless zero or more */
export function parseAmount(text: string): number | null {
  if (!text.trim()) return null;
  const n = Number(text.replace(/[£$€\s]/g, "").replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : null;
}

export function formatMoney(pence: number, currency: string): string {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(pence / 100);
}

export function parseClub(raw: unknown): ClubData | null {
  if (typeof raw !== "object" || raw === null) return null;
  const d = raw as Partial<ClubData>;
  return d.version === 1 && Array.isArray(d.clubs)
    ? { version: 1, clubs: d.clubs, activeClubId: d.activeClubId ?? null }
    : null;
}
