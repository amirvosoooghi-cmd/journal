# I-Journal — Private Trading Journal

A dark, English-only personal trading journal built with Next.js 15, TypeScript, Neon Postgres, Drizzle ORM and OpenNext for Cloudflare Workers.

## Requirements
- Node.js 22+
- Neon PostgreSQL project
- Cloudflare account for deployment

## Local setup
1. Copy `.env.example` to `.env.local`.
2. Put the pooled Neon connection string in `DATABASE_URL`.
3. Keep `JOURNAL_ACCESS_CODE=1212` (or change it if you prefer).
4. Generate a session signing secret: `openssl rand -base64 32` and set it as `SESSION_SECRET`.
5. Install dependencies: `npm install`.
6. Create the database table: `npm run db:migrate` (or run `drizzle/0000_create_trades.sql` in Neon SQL Editor for the first setup).
7. Start locally: `npm run dev`.

Open http://localhost:3000. The access code is checked on the server. A signed, HttpOnly cookie keeps the session active for seven days.

## Cloudflare setup
1. Install dependencies with Node.js 22+: `npm install`.
2. Add the production secrets (never commit them):
   - `npx wrangler secret put DATABASE_URL`
   - `npx wrangler secret put SESSION_SECRET`
   - `npx wrangler secret put JOURNAL_ACCESS_CODE`
3. Build and preview: `npm run cf:preview`.
4. Deploy: `npm run cf:deploy`.

The `DATABASE_URL` should be the Neon pooled connection string (the host usually contains `-pooler`). Keep the value private.

## Access gate notes
This is intentionally a single shared access code, not user accounts. The code is verified server-side; the browser receives only a signed HttpOnly session cookie with a seven-day expiry. A four-digit code is convenient but offers limited protection against a determined attacker. Use a private deployment URL and do not share the code publicly.

## Current feature set
- Seven-day access gate
- Trade create, list and delete
- All-time / current-month / last-20-trade win-rate views
- All-time / current-month / last-two-month P&L and net-R views
- Multi-select pre-trade emotions
- Trade detail popup with notes
- Rolling six-month performance cards
- Search by symbol, tag, session and breakout type

## Notes
The first version stores P&L and R as manually entered values. Automatic calculation from entry, stop, exit and position size is a planned extension after those fields and calculation rules are confirmed. Column resizing, saved table views, editing, CSV import/export and full browser test coverage are also planned follow-up items before calling this production-ready.
