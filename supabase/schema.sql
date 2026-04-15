-- paymebackpls database schema
-- Run this in Supabase SQL editor to set up the database

-- Receipts table: stores all receipt data as JSONB
-- creator_id is nullable — receipts work without an account
create table if not exists receipts (
  id text primary key,
  creator_id uuid references auth.users(id) on delete set null,
  payer_name text not null,
  payer_venmo text not null,
  description text,
  items jsonb not null default '[]',
  tax numeric(10,2) not null default 0,
  tip numeric(10,2) not null default 0,
  subtotal numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  paid_by jsonb not null default '[]',
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days')
);

-- Index for "my receipts" lookup
create index if not exists idx_receipts_creator_id on receipts(creator_id)
  where creator_id is not null;

-- Index for expiry cleanup
create index if not exists idx_receipts_expires_at on receipts(expires_at);

-- RLS policies
alter table receipts enable row level security;

-- Anyone can read a receipt by ID (needed for share links)
create policy "Receipts are publicly readable"
  on receipts for select
  using (true);

-- Anyone can insert (anonymous receipt creation)
create policy "Anyone can create receipts"
  on receipts for insert
  with check (true);

-- Anyone can update (needed for claims from anonymous users)
create policy "Anyone can update receipts"
  on receipts for update
  using (true);

-- Only the creator can delete their own receipts
create policy "Creators can delete own receipts"
  on receipts for delete
  using (auth.uid() = creator_id);
