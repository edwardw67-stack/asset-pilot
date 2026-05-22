# Broker Report Import Design

## v1 principle

Do not connect directly to broker accounts.

Users download reports from their broker, then upload the file into Asset Pilot. The app parses the file, shows a preview, detects duplicates, and only writes official records after user confirmation.

## First supported formats

1. Firstrade CSV
2. Taiwan custodian or broker holding report
3. Manual input fallback

## Import pipeline

1. Create import job.
2. Store temporary file.
3. Detect broker format.
4. Parse raw rows into normalized rows.
5. Create row hash for duplicate detection.
6. Show preview screen.
7. User confirms.
8. Write transactions, holdings, cash balances, and liabilities.
9. Delete temporary file.

## Duplicate detection

Suggested hash fields:

- user id
- broker account id
- trade date
- ticker
- action
- quantity
- price
- fee
- tax
- net amount
- currency

## Privacy

Real broker files must not be stored in GitHub.
Temporary files should be deleted after parsing and confirmation.
Account numbers should be stored only as masked values.

## Google Drive

v1 should use manual file upload or Google Picker with minimum access.
Do not request full Drive read access in v1.
Automatic Drive folder scanning can be added later as an advanced feature.
