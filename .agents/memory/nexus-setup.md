---
name: Nexus project setup
description: Key decisions and gotchas for the Nexus fintech Expo + Express app
---

## Auth
- JWT (7d), signed with `JWT_SECRET` env (fallback: hardcoded dev secret — change in prod)
- Stored in `expo-secure-store` on native, `localStorage` on web (Platform branch in AuthContext)
- `setAuthTokenGetter` and `setBaseUrl` called at module level in `context/AuthContext.tsx` AND `app/_layout.tsx` (safe to call twice)

## DB
- Schema in `lib/db/src/schema/` (users, accounts, transactions, cards, wallet)
- After changing schema: run `pnpm --filter @workspace/db run push`
- Balances stored as `numeric(15,2)` in Postgres; routes parse to `parseFloat` before returning
- `wallet` table has a UNIQUE constraint on `userId` (one wallet per user)

## Demo seed
- Triggered on signup via `seedUserData(userId, firstName, lastName)`
- Creates GTBank + Kuda accounts, 8 transactions, 1 VISA card (last4: 4521), wallet with ₦10,000

## Navigation (tabs)
- Current tabs: Home, Accounts, Cards, History, Profile
- Send tab is hidden from nav bar (`href: null`) but still routable at `/(tabs)/send` for quick-action taps
- New cards tab screen: `app/(tabs)/cards.tsx`; add card: `app/cards/add.tsx`

## New API routes (cards, wallet)
- `GET/POST/DELETE /api/cards` — uses `authenticate` middleware, stores only last4+brand (not full number/CVV)
- `GET /api/wallet`, `POST /api/wallet/fund` — auto-creates wallet row if missing (`ensureWallet`)
- Both imported in `artifacts/api-server/src/routes/index.ts`

## Custom API hooks pattern (mobile)
- `@workspace/api-client-react` is generated — do NOT add to it for new routes
- For new routes (cards, wallet): use `useQuery`/`useMutation` from `@tanstack/react-query` + direct `fetch` with `useAuth().token`
- Base URL pattern: `https://${process.env.EXPO_PUBLIC_DOMAIN}`
- Shared types in `artifacts/mobile/lib/apiClient.ts` (NexusCard, NexusWallet)

## Dashboard carousel
- "My Financial Sources" horizontal ScrollView between Quick Actions and Recent Activity
- Fetches accounts via `useListAccounts`, cards via `useQuery(["cards"])`, wallet via `useQuery(["wallet"])`
- RefreshControl invalidates all three query keys

## Colors (updated)
- Background: #050505, Gold: #D4AF37, GoldDark: #C89B3C, GoldLight: #1E1800

## Bank resolution (transfers)
- Currently simulated: deterministic name from account number char code checksum
- Ready to swap for Mono/Okra: replace `POST /transfers/resolve` route body

## Package versions
- `expo-secure-store` must be `~15.0.8` for Expo SDK 54 (pnpm may install newer — pin in catalog if needed)

**Why:** Newer expo-secure-store versions broke web bundling until pinned to SDK-matching version.

## pnpm install — tar firewall fix
- Replit's package firewall blocks all tar@7.x versions except the absolute latest (7.5.22)
- Add `"pnpm": { "overrides": { "tar": "7.5.22" } }` to root `package.json` before running `pnpm install`
- `@expo/cli@54.x` requires `tar@^7.5.2`; without the override the lockfile resolves to a blocked version

**Why:** Replit package firewall blocks older tar 7.x versions; pinning to latest (7.5.22) passes the firewall.
