# Asset Pilot

Asset Pilot is a multi-user portfolio tracking and ATR-based trailing stop decision app for Taiwan and U.S. equities.

The first version focuses on:

- Google login through Supabase Auth
- Strict user-level data isolation with Supabase Row Level Security
- Taiwan and U.S. holdings management
- Cash balances in TWD and USD
- USD/TWD conversion for U.S. assets
- Daily portfolio snapshots for asset curves
- ATR 5 / 10 / 20 trailing stop suggestions
- Manual ATR multiplier overrides per holding
- Broker report import pipeline, starting with Firstrade CSV and Taiwan custodian/broker reports

## Recommended stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth + Postgres + Row Level Security
- Recharts for asset curves
- Vercel for deployment

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Security rules

Do not commit:

- `.env.local`
- Supabase service role keys
- Google OAuth client secrets
- Google refresh tokens
- Real broker reports
- Real portfolio data

This repository is public. Treat it as source code only, never as a data store.

## Project status

Initial scaffold. The app currently contains the product skeleton, TypeScript models, ATR calculator, mock dashboard, import flow placeholder, and the initial Supabase schema.
