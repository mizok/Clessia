-- Migration: Refactor roles (remove staff) and add permissions
-- 1. Create new enum type without 'staff'
create type public.user_role_v2 as enum ('admin', 'teacher', 'parent');

-- 2. Alter table to use new enum
--    First, we need to handle existing data. 
--    If there are any 'staff' roles, map them to 'admin' (or delete them, but mapping is safer).
--    We'll cast to text first to avoid type mismatch during conversion.

alter table public.user_roles 
  alter column role type text;

update public.user_roles
  set role = 'admin'
  where role = 'staff';

alter table public.user_roles
  alter column role type public.user_role_v2 
  using role::public.user_role_v2;

-- 3. Drop old enum type
drop type public.user_role;

-- 4. Rename new enum type to old name (optional, but keeps things clean)
alter type public.user_role_v2 rename to user_role;

-- 5. Add permissions column
alter table public.user_roles
  add column permissions jsonb default '[]'::jsonb;

-- 6. Add comment/documentation
comment on column public.user_roles.permissions is 'List of granular permissions for admin role, e.g. ["view_revenue", "manage_staff"]';
