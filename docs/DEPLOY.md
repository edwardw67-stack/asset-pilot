# Deploy

## Vercel

Import this repository into Vercel and set these environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ALPHA_VANTAGE_API_KEY=
APP_URL=
```

## Supabase

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Enable Google Provider in Authentication.
4. Add the deployed callback URL:

```text
https://YOUR_DOMAIN/auth/callback
```

## Notes

- The mock dashboard can build without real portfolio data.
- Google login needs Supabase URL and anon key.
- Real broker files must not be committed to GitHub.
- The production database must keep Row Level Security enabled.
