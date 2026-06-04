---
name: Nexus Phone Number Hub
description: What was built for the Phone Number Hub spec — routes, schema, screens, theme system
---

## Phone Numbers API
- Routes live at `artifacts/api-server/src/routes/phone-numbers.ts`
- GET/POST/DELETE/PATCH `/api/phone-numbers` + `/request-otp` + `/verify-otp` + `/:id/default`
- OTP is simulated — any 4–6 digit code is accepted (demo mode)
- Schema: `lib/db/src/schema/phone_numbers.ts` — `phone_numbers` table with userId FK, number, label, isDefault, isVerified

## Theme System
- `ThemeContext` at `artifacts/mobile/context/ThemeContext.tsx` — persists to SecureStore (or localStorage on web)
- Preference: "system" | "light" | "dark" — default is "dark"
- `useColors()` at `artifacts/mobile/hooks/useColors.ts` reads from ThemeContext
- `colors.ts` has `.light` and `.dark` palettes; dark = black/gold #050505, light = luxury white #F8F9FA

## New Screens
- `app/(tabs)/numbers.tsx` — Numbers tab; lists primary + secondary numbers; actions via Alert
- `app/numbers/add.tsx` — 3-step add flow: enter number → OTP → success
- `app/profile/security.tsx` — PIN (SecureStore), biometrics toggles, theme picker, login info, security prefs
- `app/profile/about.tsx` — version info, mission, legal links
- `app/profile/help.tsx` — expandable FAQs, contact rows, support ticket form

## Dashboard Changes
- Bell button replaced with user initials avatar (→ profile)
- Phone numbers appear in the horizontal financial sources carousel (purple accent, `#A78BFA`)
- Quick actions: Send, Cards, Numbers, History

## Profile Changes
- Stats row: Linked Accounts / Linked Cards / Linked Numbers counts
- Navigation wired: Security, Linked Numbers, Appearance, Help, About
- Appearance row routes to Security screen (theme section is there)

**Why:** The spec required phone numbers as a financial identity layer — visible in dashboard carousel, manageable in their own tab, and countable in profile stats.
