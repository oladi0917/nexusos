# Nexus

A premium fintech mobile app (Expo) with multi-bank account dashboard, send money flow, transaction history with tagging/categorization, and full auth backed by PostgreSQL.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm run typecheck` — full typecheck across all packages
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — set

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo ~54, expo-router, React Native
- API: Express 5, Node.js
- DB: PostgreSQL + Drizzle ORM
- Auth: JWT (7d expiry) stored in expo-secure-store
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — source-of-truth API contract
- `lib/api-client-react/src/generated/api.ts` — generated React Query hooks (do not edit manually)
- `lib/db/src/schema/` — Drizzle table definitions (users, accounts, transactions)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/api-server/src/lib/` — auth (JWT/bcrypt), banks (static list), seed (demo data)
- `artifacts/mobile/app/` — Expo Router screens
- `artifacts/mobile/context/AuthContext.tsx` — auth state + token management
- `artifacts/mobile/constants/colors.ts` — design tokens (navy #0B1F3A + gold #C9A84C)

## Architecture decisions

- JWT auth (7d expiry), stored in expo-secure-store on native, localStorage on web
- Demo data seeded on signup: 2 bank accounts (GTBank + Kuda) + 8 transactions
- Account resolution on transfers is simulated (deterministic name from account number checksum) — ready for Mono/Okra integration
- Banks are a static list in `lib/banks.ts` — structured for easy Paystack bank list swap
- Numeric balances stored as PostgreSQL `numeric(15,2)` and parsed to float in API responses

## Product

- Welcome screen with gold balance card mockup
- Auth: signup (with demo data seed) + login
- Dashboard: total balance, quick actions, recent transactions
- Accounts: list all connected banks with full balance card, add new accounts via consent flow
- Send Money: 4-step wizard (select source → select bank → enter & verify account → amount + confirm → success)
- Transaction History: filterable by account
- Transaction Detail: category picker, tag, personal note editor
- Profile: user info + settings + logout

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Run `pnpm run typecheck:libs` after changing DB schema before running API server typecheck
- `expo-secure-store` version must match Expo SDK — use `~15.0.8` for Expo 54
- API base URL is set from `EXPO_PUBLIC_DOMAIN` env var; always set in mobile dev script

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
