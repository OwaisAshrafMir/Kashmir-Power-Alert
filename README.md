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

## Notes

- If the official KPDCL page is unreachable or unparsable, the app falls back to realistic sample notices and labels the source clearly.
- Free for all users now; `profiles.plan` is ready for future Pro features.
