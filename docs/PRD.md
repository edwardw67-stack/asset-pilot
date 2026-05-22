# Asset Pilot v1 PRD

## Goal

Build a multi-user portfolio tracking app for Taiwan and U.S. stocks.

The app must help users answer four questions every day:

1. How much is my total asset value in TWD?
2. How much of it is stock, cash, and liabilities?
3. How has my asset value changed over time?
4. Which holdings are close to their ATR-based trailing exit line?

## v1 scope

### Account and privacy

- Google login through Supabase Auth.
- Every private table must include `user_id`.
- Supabase Row Level Security must prevent users from seeing other users' portfolio data.
- Broker reports are never committed to GitHub.
- Uploaded report files should be parsed, confirmed by user, then removed from temporary storage.

### Portfolio

- Separate Taiwan and U.S. holdings.
- Holdings support ticker, name, broker account, quantity, average cost, currency, and optional entry date.
- Entry date is optional.
- Cash balances support TWD and USD.
- U.S. assets are converted into TWD with the latest USD/TWD rate.
- Liabilities are supported for margin or securities financing accounts.

### Asset curve

- Store daily portfolio snapshots.
- Dashboard must show asset curve from snapshots.
- If historical broker reports are imported, the app may rebuild historical snapshots later.
- Without historical reports, the curve starts from first app usage.

### ATR decision support

- For each holding, calculate ATR 5, ATR 10, and ATR 20 from OHLC price data.
- Show three trailing exit price suggestions.
- Suggest a multiplier based on ATR percentage.
- Allow manual multiplier override per holding.

### Broker import

v1 import targets:

1. Manual holding and cash input.
2. Firstrade CSV import.
3. Taiwan custodian or broker report import placeholder.

The import flow must include:

- Upload file.
- Detect broker format.
- Parse rows.
- Preview changes.
- Mark duplicates.
- Confirm before writing to official tables.

## Out of scope for v1

- Direct broker login.
- Automatic broker scraping.
- Automatic Google Drive folder scan.
- Options tracking.
- Tax reporting.
- Automatic order placement.
- Real-time tick-by-tick quotes.

## Security notes

The repo is public. Do not store secrets, keys, tokens, broker files, or real portfolio data in source control.
