# Nexus — Bolt Export

A luxury fintech web app built with **Vite + React + TypeScript** (client) and **Express + Drizzle ORM + PostgreSQL** (server).

## Prerequisites

- Node.js 18+
- PostgreSQL database (local or hosted)
- `npm` or `pnpm`

## Quick Start

### 1. Set up the server

```bash
cd server
cp .env.example .env
# Edit .env and set DATABASE_URL to your PostgreSQL connection string
npm install
npm run db:push     # push schema to database
npm run dev
```

### 2. Set up the client (in a new terminal)

```bash
cd client
cp .env.example .env
# VITE_API_URL defaults to http://localhost:4000 — update if needed
npm install
npm run dev
```

### 3. Or run both together from root

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Credentials

Sign up for a new account — demo data (2 bank accounts, 8 transactions) is seeded automatically on signup.

## Tech Stack

| Layer    | Tech                                              |
|----------|---------------------------------------------------|
| Client   | Vite, React 18, TypeScript, React Router v6, Tailwind CSS |
| Server   | Express, TypeScript, Drizzle ORM, PostgreSQL      |
| Auth     | JWT (Bearer tokens, stored in localStorage)       |

## New Features

### Multi-source Payments (Split Funding)
- Users can fund a single transaction from multiple source accounts
- Allows splitting payments across accounts when one account has insufficient funds
- Implemented in the Payments (/send) tab with step-by-step flow

### Nexus/Social Finance (Social Layer)
- Users can mark transactions as shared to appear in the Nexus tab feed
- Shared transactions are visible to the user in their social feed
- Implemented in the Nexus tab with sharing capabilities

### Accounts Integration Enhancement
- Accounts now have types (Checking, Savings, Credit Card, Loan, Investment)
- Accounts can have optional subtypes for more specific categorization
- Account type badges are displayed in the Accounts tab
- Filter accounts by type at the top of the Accounts tab

## API Endpoints

| Method | Path                     | Auth | Description                  |
|--------|--------------------------|------|------------------------------|
| POST   | /api/auth/signup         | No   | Create account (seeds demo data) |
| POST   | /api/auth/login          | No   | Login                        |
| GET    | /api/auth/me             | Yes  | Current user                 |
| GET    | /api/dashboard           | Yes  | Totals + recent transactions |
| GET    | /api/accounts            | Yes  | List accounts                |
| POST   | /api/accounts            | Yes  | Add account                  |
| DELETE | /api/accounts/:id        | Yes  | Remove account               |
| GET    | /api/transactions        | Yes  | List transactions             |
| GET    | /api/transactions/:id    | Yes  | Transaction detail           |
| GET    | /api/transactions/shared | Yes  | List shared transactions     |
| PATCH  | /api/transactions/:id/toggle-share | Yes  | Toggle transaction share status |
| POST   | /api/transfers/resolve   | Yes  | Resolve account number       |
| POST   | /api/transfers           | Yes  | Send money                   |
| GET    | /api/users/profile       | Yes  | User profile                 |
| PATCH  | /api/users/profile       | Yes  | Update profile               |
| GET    | /api/banks               | No   | List supported banks         |
| GET    | /api/health              | No   | Health check                 |

## Environment Variables

### Server (`server/.env`)

```
DATABASE_URL=postgresql://user:password@localhost:5432/nexus
JWT_SECRET=change-this-to-a-random-secret
PORT=4000
```

### Client (`client/.env`)

```
VITE_API_URL=http://localhost:4000
```
