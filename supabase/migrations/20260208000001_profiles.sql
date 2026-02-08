-- Profiles table: extends auth.users with app-specific data
create type public.user_role as enum ('admin', 'staff', 'teacher', 'parent');

create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  branch_id    uuid,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Junction table: one user can have multiple roles
create table public.user_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role    public.user_role not null,
  primary key (user_id, role)
);

alter table public.user_roles enable row level security;

create policy "Users can read own roles"
  on public.user_roles for select
  using (auth.uid() = user_id);

-- Auto-create profile on signup (no default role — admin assigns roles)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();
