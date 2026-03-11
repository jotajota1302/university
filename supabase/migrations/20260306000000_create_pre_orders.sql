-- Create pre_orders table to store OpenClaw University pre-order payments

create table if not exists public.pre_orders (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Customer info
  email text not null,

  -- Career info
  career_id text not null,
  career_name text not null,

  -- Payment info
  amount integer not null, -- Amount in cents
  currency text default 'eur' not null,
  payment_status text default 'pending' not null,

  -- Stripe info
  stripe_session_id text unique,
  stripe_payment_intent_id text,
  stripe_customer_id text,

  -- Metadata
  metadata jsonb default '{}'::jsonb,

  -- Constraints
  constraint pre_orders_email_check check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  constraint pre_orders_career_id_check check (career_id in ('marketing-pro', 'sales-accelerator', 'devops-engineer')),
  constraint pre_orders_payment_status_check check (payment_status in ('pending', 'completed', 'failed', 'refunded'))
);

-- Add indexes
create index if not exists pre_orders_email_idx on public.pre_orders (email);
create index if not exists pre_orders_career_id_idx on public.pre_orders (career_id);
create index if not exists pre_orders_stripe_session_id_idx on public.pre_orders (stripe_session_id);
create index if not exists pre_orders_payment_status_idx on public.pre_orders (payment_status);
create index if not exists pre_orders_created_at_idx on public.pre_orders (created_at desc);

-- Enable Row Level Security
alter table public.pre_orders enable row level security;

-- Create policies
-- Allow service role to do everything
create policy "Service role can do everything on pre_orders"
  on public.pre_orders
  for all
  to service_role
  using (true)
  with check (true);

-- Allow authenticated users to read their own orders
create policy "Users can view their own pre_orders"
  on public.pre_orders
  for select
  to authenticated
  using (auth.email() = email);

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Create trigger for updated_at
create trigger handle_pre_orders_updated_at
  before update on public.pre_orders
  for each row
  execute function public.handle_updated_at();

-- Add comments
comment on table public.pre_orders is 'Stores pre-order payments for OpenClaw University programs';
comment on column public.pre_orders.email is 'Customer email address';
comment on column public.pre_orders.career_id is 'Career identifier (marketing-pro, sales-accelerator, devops-engineer)';
comment on column public.pre_orders.career_name is 'Human-readable career name';
comment on column public.pre_orders.amount is 'Payment amount in cents (e.g., 9900 for 99.00 EUR)';
comment on column public.pre_orders.payment_status is 'Payment status: pending, completed, failed, refunded';
comment on column public.pre_orders.stripe_session_id is 'Stripe Checkout Session ID';
comment on column public.pre_orders.stripe_payment_intent_id is 'Stripe Payment Intent ID';
