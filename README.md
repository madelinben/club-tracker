# Club Tracker

Run any club, class or group: members, session registers, subs and who owes what.

- Any number of clubs: run clubs, junior football, choirs, yoga classes, book clubs
- Take the register in seconds, add walk-ins as they arrive
- Per-session fee (or free), record payments, see who owes and copy a reminder for the group chat
- Attendance rate per member and a flag for anyone who has missed the last three sessions
- Data stays in the browser (localStorage). Download a backup file and restore it on any device.

Two ways this repo ships, from the same `src/`:

| Target | How |
|---|---|
| **GitHub Pages** (`madelinben.github.io/club-tracker/`) | `pnpm build:demo` builds `demo/` into `docs/` (Pages source: `main` / `/docs`) |
| **get-out-there** (Cloudflare) | imported as workspace package `@get-out-there/club` (`ClubApp`) |

```bash
pnpm install
pnpm dev          # demo at http://localhost:3108/club-tracker/
pnpm test         # logic unit tests
pnpm build:demo   # static site -> docs/
```

Package rules: no router/auth/app imports; Tailwind default palette only (no custom tokens); host must `@source` this folder. Peer deps: react, react-dom, lucide-react.

Host hook: `<ClubApp beforeExport={gate} />` runs `gate(label)` before a backup download or restore (e.g. an ad gate); reject to cancel.
