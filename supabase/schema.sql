create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  base_currency text not null default 'TWD',
  created_at timestamptz not null default now()
);

create table public.broker_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  broker_name text not null,
  account_name text not null,
  account_type text not null default 'securities',
  market text not null default 'MIXED',
  currency text not null default 'TWD',
  account_number_mask text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.holdings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  broker_account_id uuid not null references public.broker_accounts(id) on delete cascade,
  market text not null check (market in ('TW', 'US')),
  ticker text not null,
  name text not null,
  quantity numeric not null,
  avg_cost numeric not null,
  currency text not null check (currency in ('TWD', 'USD')),
  entry_date date,
  source text not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cash_balances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  broker_account_id uuid references public.broker_accounts(id) on delete set null,
  currency text not null check (currency in ('TWD', 'USD')),
  amount numeric not null default 0,
  source text not null default 'manual',
  updated_at timestamptz not null default now()
);

create table public.liabilities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  broker_account_id uuid references public.broker_accounts(id) on delete set null,
  currency text not null check (currency in ('TWD', 'USD')),
  liability_type text not null default 'other',
  amount numeric not null default 0,
  interest_rate numeric,
  updated_at timestamptz not null default now()
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  broker_account_id uuid references public.broker_accounts(id) on delete set null,
  market text check (market in ('TW', 'US')),
  ticker text,
  name text,
  trade_date date not null,
  settle_date date,
  action text not null,
  quantity numeric,
  price numeric,
  gross_amount numeric,
  fee numeric default 0,
  tax numeric default 0,
  net_amount numeric,
  currency text not null check (currency in ('TWD', 'USD')),
  source text not null default 'manual',
  external_hash text,
  created_at timestamptz not null default now(),
  unique (user_id, external_hash)
);

create table public.portfolio_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  snapshot_date date not null,
  total_assets_twd numeric not null default 0,
  net_assets_twd numeric not null default 0,
  total_market_value_twd numeric not null default 0,
  total_cash_twd numeric not null default 0,
  total_liabilities_twd numeric not null default 0,
  tw_market_value_twd numeric not null default 0,
  us_market_value_usd numeric not null default 0,
  us_market_value_twd numeric not null default 0,
  unrealized_pnl_twd numeric not null default 0,
  total_cost_twd numeric not null default 0,
  usd_twd_rate numeric,
  created_at timestamptz not null default now(),
  unique (user_id, snapshot_date)
);

create table public.atr_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  holding_id uuid not null references public.holdings(id) on delete cascade,
  preferred_atr_period int not null default 20 check (preferred_atr_period in (5, 10, 20)),
  manual_multiplier numeric,
  auto_multiplier numeric,
  final_multiplier numeric,
  updated_at timestamptz not null default now(),
  unique (user_id, holding_id)
);

create table public.import_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  broker_account_id uuid references public.broker_accounts(id) on delete set null,
  broker_name text,
  file_name text not null,
  file_type text not null,
  status text not null default 'uploaded',
  detected_format text,
  row_count int not null default 0,
  error_count int not null default 0,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);

create table public.import_rows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  import_job_id uuid not null references public.import_jobs(id) on delete cascade,
  row_number int not null,
  raw_data jsonb not null,
  parsed_data jsonb,
  status text not null default 'ok',
  error_message text,
  created_at timestamptz not null default now()
);

create table public.price_history (
  id uuid primary key default gen_random_uuid(),
  market text not null check (market in ('TW', 'US')),
  ticker text not null,
  date date not null,
  open numeric not null,
  high numeric not null,
  low numeric not null,
  close numeric not null,
  volume numeric,
  source text,
  created_at timestamptz not null default now(),
  unique (market, ticker, date)
);

create table public.latest_prices (
  id uuid primary key default gen_random_uuid(),
  market text not null check (market in ('TW', 'US')),
  ticker text not null,
  latest_price numeric not null,
  currency text not null check (currency in ('TWD', 'USD')),
  price_time timestamptz not null,
  source text,
  created_at timestamptz not null default now(),
  unique (market, ticker)
);

create table public.fx_rates (
  id uuid primary key default gen_random_uuid(),
  base_currency text not null,
  quote_currency text not null,
  rate numeric not null,
  source text,
  fetched_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.broker_accounts enable row level security;
alter table public.holdings enable row level security;
alter table public.cash_balances enable row level security;
alter table public.liabilities enable row level security;
alter table public.transactions enable row level security;
alter table public.portfolio_snapshots enable row level security;
alter table public.atr_settings enable row level security;
alter table public.import_jobs enable row level security;
alter table public.import_rows enable row level security;

create policy "profiles own rows" on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());
create policy "broker accounts own rows" on public.broker_accounts for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "holdings own rows" on public.holdings for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "cash own rows" on public.cash_balances for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "liabilities own rows" on public.liabilities for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "transactions own rows" on public.transactions for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "snapshots own rows" on public.portfolio_snapshots for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "atr settings own rows" on public.atr_settings for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "import jobs own rows" on public.import_jobs for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "import rows own rows" on public.import_rows for all using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table public.price_history enable row level security;
alter table public.latest_prices enable row level security;
alter table public.fx_rates enable row level security;

create policy "market data readable" on public.price_history for select using (true);
create policy "latest prices readable" on public.latest_prices for select using (true);
create policy "fx rates readable" on public.fx_rates for select using (true);
