# Kashmir Power Alerts

Know when power will go in your area — before it happens.

## What this app does

- Shows live / near-live KPDCL-style shutdown notices for Kashmir
- Matches notices to the user’s locality
- Optional browser push notifications
- Supabase stores **only** accounts, settings, push subscriptions, and tiny alert fingerprints
- Shutdown content is cached briefly in memory — not kept as a permanent outage DB

## Stack

- Next.js 15 App Router + TypeScript + Tailwind
- Supabase Auth
- Web Push (VAPID)

## Setup

```bash
cd "D:\Projects\Kashmir Power Alerts"
npm install
cp .env.example .env.local
```

### 1) Supabase

1. Create a new Supabase project
2. Run `supabase/schema.sql`
3. Run `supabase/seed-admin.sql`
4. Put URL + anon + service role keys in `.env.local`

Default admin after seed:
- Email: `owaisashrafmir8764@gmail.com`
- Password: `KashmirAdmin@2026`

### 2) Web Push keys

```bash
npx web-push generate-vapid-keys
```

Put the public/private keys into `.env.local`.

### 3) Run

```bash
npm run dev
```

Open http://localhost:3000

### Cron ingest (optional)

```bash
curl -X POST http://localhost:3000/api/cron/ingest -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Notes

- If the official KPDCL page is unreachable or unparsable, the app falls back to realistic sample notices and labels the source clearly.
- Free for all users now; `profiles.plan` is ready for future Pro features.
