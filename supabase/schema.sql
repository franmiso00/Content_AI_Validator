-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  subscription_tier text default 'free',
  credits_remaining int default 5,
  created_at timestamptz default now()
);

-- RLS for Profiles
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using ( auth.uid() = id );

create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- Handle new user signup (Trigger)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- VALIDATIONS
create table public.validations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  input_idea text not null,
  input_audience text,
  
  -- Results (JSON for flexibility)
  demand_score int,
  demand_summary text,
  pain_points jsonb,
  questions jsonb,
  content_angles jsonb,
  
  created_at timestamptz default now()
);

-- RLS for Validations
alter table public.validations enable row level security;

create policy "Users can view own validations"
  on public.validations for select
  using ( auth.uid() = user_id );

create policy "Users can insert own validations"
  on public.validations for insert
  with check ( auth.uid() = user_id );
