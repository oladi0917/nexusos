# Bolt Migration Report — Nexus

## Source

**Original stack:** Expo (React Native) mobile app + Express/Drizzle/PostgreSQL API,  
structured as a pnpm monorepo on Replit.

**Target stack:** Vite + React web app + standalone Express API,  
no monorepo, no Replit-specific dependencies.

---

## What Changed

### Removed / Replaced

| Original | Replacement | Reason |
|----------|-------------|--------|
| `expo` / `expo-router` | React Router v6 | Web routing |
| `react-native` primitives | HTML + Tailwind CSS | Web rendering |
| `@expo/vector-icons` (Feather) | Lucide React | Same icon set, web-native |
| `expo-linear-gradient` | CSS `linear-gradient` via Tailwind | Web-native |
| `expo-haptics` | Removed (no-op on web) | Mobile-only API |
| `react-native-safe-area-context` | Removed | Not needed on web |
| `expo-secure-store` | `localStorage` | JWT storage on web |
| `@tanstack/react-query` hooks from `@workspace/api-client-react` | Direct `fetch` calls in custom hooks | Removed workspace package |
| `@workspace/db` | Inlined Drizzle schema in `server/src/lib/db.ts` | Removed workspace package |
| `@workspace/api-zod` | Removed | Replaced with direct TypeScript types |
| `pnpm` workspace `catalog:` versions | Explicit semver in each `package.json` | No pnpm workspace |
| `pino` / `pino-http` logging | `console.log` via morgan | Simpler, works everywhere |
| Replit `PORT` env binding | Configurable `PORT` env var | Portable |

### Preserved

- All business logic: auth (JWT), accounts, transactions, transfers, dashboard, profile
- All 8 API route modules with identical behavior
- Demo data seeding on signup (2 accounts, 8 transactions)
- Color palette and design language (dark gold luxury theme)
- Multi-step Send Money flow
- All screens: Welcome, Login, Signup, Dashboard, Accounts, Transactions, Send, Profile, Transaction Detail, Add Account

---

## Architecture

```
bolt-export/
├── package.json          ← root dev script (runs both via concurrently)
├── server/               ← standalone Express API
│   ├── src/
│   │   ├── index.ts      ← entry point (listens on PORT)
│   │   ├── app.ts        ← Express app (CORS, JSON, routes)
│   │   ├── lib/
│   │   │   ├── auth.ts   ← bcrypt + JWT helpers
│   │   │   ├── banks.ts  ← Nigerian bank registry
│   │   │   ├── db.ts     ← Drizzle + schema
│   │   │   └── seed.ts   ← demo data seeder
│   │   ├── middlewares/
│   │   │   └── authenticate.ts
│   │   └── routes/       ← auth, accounts, transactions, transfers, dashboard, users, banks, health
│   └── drizzle.config.ts
└── client/               ← Vite + React + Tailwind
    └── src/
        ├── context/
        │   └── AuthContext.tsx   ← JWT stored in localStorage
        ├── lib/
        │   ├── api.ts            ← fetch wrapper with auth header
        │   └── utils.ts          ← formatBalance, formatDate, etc.
        ├── components/
        │   ├── Layout.tsx        ← bottom tab navigation
        │   ├── NexusLogo.tsx
        │   ├── AccountCard.tsx
        │   └── TransactionItem.tsx
        └── pages/
            ├── Welcome.tsx
            ├── Login.tsx
            ├── Signup.tsx
            ├── Dashboard.tsx
            ├── Accounts.tsx
            ├── Transactions.tsx
            ├── Send.tsx
            ├── Profile.tsx
            ├── TransactionDetail.tsx
            └── AddAccount.tsx
```

---

## Compatibility

Tested compatible with:

- **Bolt.new** — runs both `server` and `client` as separate terminals
- **StackBlitz** — Web Containers support Node.js + Vite
- **CodeSandbox** — use two devboxes or the monorepo runner
- **GitHub Codespaces** — standard Node.js devcontainer
- **Lovable** — import client only; point `VITE_API_URL` at a deployed server
- **Local** — `npm run dev` from root starts both

---

## Notes

1. **PostgreSQL required.** The server uses Drizzle ORM with PostgreSQL. SQLite is not supported.  
   Free options: [Neon](https://neon.tech), [Supabase](https://supabase.com), local `pg`.

2. **JWT_SECRET must be changed** in production. Default is `nexus-dev-secret-change-in-production`.

3. **Demo data** is seeded automatically on every signup — no manual setup needed.

4. **CORS** is enabled for all origins in development. Lock it down for production:
   ```ts
   app.use(cors({ origin: "https://your-frontend.com" }));
   ```
