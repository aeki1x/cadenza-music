create extension if not exists "pgcrypto";

create type public.app_role as enum ('administrator','front_desk','instructor','client');
create type public.record_status as enum ('active','inactive');
create type public.request_status as enum ('pending','approved','rejected','cancelled','completed','rescheduled');
create type public.schedule_status as enum ('scheduled','completed','cancelled','rescheduled');
create type public.attendance_status as enum ('present','absent','late','rescheduled');
create type public.instrument_status as enum ('available','in_use','rented','maintenance','disposed');
create type public.payment_method as enum ('cash','e_wallet','cheque');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  contact_number text,
  role public.app_role not null default 'client',
  status public.record_status not null default 'active',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lesson_packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  duration_minutes integer not null default 60 check (duration_minutes > 0),
  total_sessions integer not null check (total_sessions > 0),
  price numeric(12,2) not null check (price >= 0),
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  room_type text not null default 'studio',
  capacity integer not null default 1 check (capacity > 0),
  availability_status public.record_status not null default 'active',
  rental_rate numeric(12,2) not null default 150 check (rental_rate >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.instruments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text,
  category text not null,
  serial_number text unique,
  quantity integer not null default 1 check (quantity >= 0),
  acquisition_date date,
  condition_status public.instrument_status not null default 'available',
  rental_rate numeric(12,2) not null default 0 check (rental_rate >= 0),
  description text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.instructor_availability (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references public.profiles(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  status public.request_status not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time > start_time)
);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete restrict,
  lesson_package_id uuid not null references public.lesson_packages(id) on delete restrict,
  instrument_category text not null,
  instructor_id uuid references public.profiles(id) on delete set null,
  preferred_day smallint check (preferred_day between 0 and 6),
  preferred_start_time time,
  status public.request_status not null default 'pending',
  total_sessions integer not null default 0,
  completed_sessions integer not null default 0,
  remaining_sessions integer not null default 0,
  start_date date,
  end_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.schedules (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid references public.enrollments(id) on delete set null,
  instructor_id uuid not null references public.profiles(id) on delete restrict,
  client_id uuid not null references public.profiles(id) on delete restrict,
  room_id uuid not null references public.rooms(id) on delete restrict,
  lesson_package_id uuid references public.lesson_packages(id) on delete set null,
  scheduled_date date not null,
  start_time time not null,
  end_time time not null,
  status public.schedule_status not null default 'scheduled',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time > start_time)
);

create index schedules_date_idx on public.schedules(scheduled_date);
create index schedules_instructor_idx on public.schedules(instructor_id, scheduled_date);
create index schedules_room_idx on public.schedules(room_id, scheduled_date);

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.schedules(id) on delete cascade,
  client_id uuid not null references public.profiles(id) on delete restrict,
  instructor_id uuid not null references public.profiles(id) on delete restrict,
  attendance_date date not null,
  status public.attendance_status not null,
  remarks text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(schedule_id, client_id)
);

create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete restrict,
  instructor_id uuid not null references public.profiles(id) on delete restrict,
  enrollment_id uuid references public.enrollments(id) on delete set null,
  schedule_id uuid references public.schedules(id) on delete set null,
  skill_level text,
  book_completion text,
  practice_exercises text,
  performance_rating numeric(4,2),
  notes text,
  created_at timestamptz not null default now()
);

create table public.studio_bookings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete restrict,
  room_id uuid not null references public.rooms(id) on delete restrict,
  booking_date date not null,
  start_time time not null,
  end_time time not null,
  status public.request_status not null default 'pending',
  purpose text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time > start_time)
);

create table public.instrument_rentals (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete restrict,
  instrument_id uuid not null references public.instruments(id) on delete restrict,
  start_at timestamptz not null,
  return_at timestamptz not null,
  quantity integer not null default 1 check (quantity > 0),
  daily_or_hourly_rate numeric(12,2) not null default 0,
  deposit_amount numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null default 0,
  status public.request_status not null default 'pending',
  returned_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (return_at > start_at)
);

create table public.billing (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete restrict,
  service_type text not null,
  reference_id uuid,
  description text not null,
  amount_due numeric(12,2) not null check (amount_due >= 0),
  amount_paid numeric(12,2) not null default 0 check (amount_paid >= 0),
  due_date date,
  status text not null default 'unpaid' check (status in ('unpaid','partial','paid','overdue','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete restrict,
  billing_id uuid references public.billing(id) on delete set null,
  amount numeric(12,2) not null check (amount > 0),
  method public.payment_method not null,
  reference_number text,
  service_type text,
  notes text,
  paid_at timestamptz not null default now(),
  recorded_by uuid references public.profiles(id) on delete set null
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  target_role public.app_role,
  published boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'info',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.reschedule_requests (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null references public.schedules(id) on delete cascade,
  requested_by uuid not null references public.profiles(id) on delete restrict,
  requested_date date not null,
  requested_start_time time not null,
  requested_end_time time not null,
  reason text not null,
  status public.request_status not null default 'pending',
  reviewed_by uuid references public.profiles(id) on delete set null,
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (requested_end_time > requested_start_time)
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, contact_number)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'contact_number'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.current_user_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin new.updated_at = now(); return new; end;
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'profiles','lesson_packages','rooms','instruments','instructor_availability',
    'enrollments','schedules','attendance','studio_bookings','instrument_rentals',
    'billing','announcements','reschedule_requests'
  ] loop
    execute format('drop trigger if exists %I_updated_at on public.%I', t, t);
    execute format('create trigger %I_updated_at before update on public.%I for each row execute procedure public.update_updated_at()', t, t);
  end loop;
end $$;

alter table public.profiles enable row level security;
alter table public.lesson_packages enable row level security;
alter table public.rooms enable row level security;
alter table public.instruments enable row level security;
alter table public.instructor_availability enable row level security;
alter table public.enrollments enable row level security;
alter table public.schedules enable row level security;
alter table public.attendance enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.studio_bookings enable row level security;
alter table public.instrument_rentals enable row level security;
alter table public.billing enable row level security;
alter table public.payments enable row level security;
alter table public.announcements enable row level security;
alter table public.notifications enable row level security;
alter table public.reschedule_requests enable row level security;

-- Staff can manage operational data. Clients can see and manage only their own transactional data.
create policy "profiles self or staff select" on public.profiles for select using (
  id = auth.uid() or public.current_user_role() in ('administrator','front_desk','instructor')
);
create policy "profiles staff insert" on public.profiles for insert with check (
  public.current_user_role() in ('administrator','front_desk')
);
create policy "profiles self update or admin" on public.profiles for update using (
  id = auth.uid() or public.current_user_role() = 'administrator'
) with check (
  id = auth.uid() or public.current_user_role() = 'administrator'
);

create policy "packages readable" on public.lesson_packages for select using (active or public.current_user_role() in ('administrator','front_desk','instructor'));
create policy "packages admin write" on public.lesson_packages for all using (public.current_user_role() = 'administrator') with check (public.current_user_role() = 'administrator');

create policy "rooms readable" on public.rooms for select using (true);
create policy "rooms staff write" on public.rooms for all using (public.current_user_role() in ('administrator','front_desk')) with check (public.current_user_role() in ('administrator','front_desk'));

create policy "instruments readable" on public.instruments for select using (true);
create policy "instruments staff write" on public.instruments for all using (public.current_user_role() in ('administrator','front_desk')) with check (public.current_user_role() in ('administrator','front_desk'));

create policy "availability select" on public.instructor_availability for select using (
  instructor_id = auth.uid() or public.current_user_role() in ('administrator','front_desk')
);
create policy "availability instructor write" on public.instructor_availability for all using (
  instructor_id = auth.uid() or public.current_user_role() in ('administrator','front_desk')
) with check (
  instructor_id = auth.uid() or public.current_user_role() in ('administrator','front_desk')
);

create policy "enrollments select" on public.enrollments for select using (
  client_id = auth.uid() or public.current_user_role() in ('administrator','front_desk','instructor')
);
create policy "enrollments client create" on public.enrollments for insert with check (
  client_id = auth.uid() or public.current_user_role() in ('administrator','front_desk')
);
create policy "enrollments staff update" on public.enrollments for update using (
  client_id = auth.uid() or public.current_user_role() in ('administrator','front_desk')
) with check (client_id = auth.uid() or public.current_user_role() in ('administrator','front_desk'));

create policy "schedules select" on public.schedules for select using (
  client_id = auth.uid() or instructor_id = auth.uid() or public.current_user_role() in ('administrator','front_desk')
);
create policy "schedules staff manage" on public.schedules for all using (
  public.current_user_role() in ('administrator','front_desk')
) with check (public.current_user_role() in ('administrator','front_desk'));

create policy "attendance select" on public.attendance for select using (
  client_id = auth.uid() or instructor_id = auth.uid() or public.current_user_role() in ('administrator','front_desk')
);
create policy "attendance instructor manage" on public.attendance for all using (
  instructor_id = auth.uid() or public.current_user_role() in ('administrator','front_desk')
) with check (instructor_id = auth.uid() or public.current_user_role() in ('administrator','front_desk'));

create policy "progress select" on public.lesson_progress for select using (
  client_id = auth.uid() or instructor_id = auth.uid() or public.current_user_role() in ('administrator','front_desk')
);
create policy "progress instructor manage" on public.lesson_progress for all using (
  instructor_id = auth.uid() or public.current_user_role() in ('administrator','front_desk')
) with check (instructor_id = auth.uid() or public.current_user_role() in ('administrator','front_desk'));

create policy "bookings select" on public.studio_bookings for select using (
  client_id = auth.uid() or public.current_user_role() in ('administrator','front_desk')
);
create policy "bookings create" on public.studio_bookings for insert with check (
  client_id = auth.uid() or public.current_user_role() in ('administrator','front_desk')
);
create policy "bookings staff update" on public.studio_bookings for update using (
  client_id = auth.uid() or public.current_user_role() in ('administrator','front_desk')
) with check (client_id = auth.uid() or public.current_user_role() in ('administrator','front_desk'));

create policy "rentals select" on public.instrument_rentals for select using (
  client_id = auth.uid() or public.current_user_role() in ('administrator','front_desk')
);
create policy "rentals create" on public.instrument_rentals for insert with check (
  client_id = auth.uid() or public.current_user_role() in ('administrator','front_desk')
);
create policy "rentals staff update" on public.instrument_rentals for update using (
  client_id = auth.uid() or public.current_user_role() in ('administrator','front_desk')
) with check (client_id = auth.uid() or public.current_user_role() in ('administrator','front_desk'));

create policy "billing own or staff" on public.billing for select using (
  client_id = auth.uid() or public.current_user_role() in ('administrator','front_desk')
);
create policy "billing staff write" on public.billing for all using (
  public.current_user_role() in ('administrator','front_desk')
) with check (public.current_user_role() in ('administrator','front_desk'));

create policy "payments own or staff" on public.payments for select using (
  client_id = auth.uid() or public.current_user_role() in ('administrator','front_desk')
);
create policy "payments staff insert" on public.payments for insert with check (
  public.current_user_role() in ('administrator','front_desk')
);

create policy "announcements readable" on public.announcements for select using (
  target_role is null or target_role = public.current_user_role() or public.current_user_role() in ('administrator','front_desk')
);
create policy "announcements admin write" on public.announcements for all using (
  public.current_user_role() = 'administrator'
) with check (public.current_user_role() = 'administrator');

create policy "notifications own" on public.notifications for select using (user_id = auth.uid());
create policy "notifications own update" on public.notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "notifications staff insert" on public.notifications for insert with check (
  public.current_user_role() in ('administrator','front_desk')
);

create policy "reschedules own or staff" on public.reschedule_requests for select using (
  requested_by = auth.uid() or public.current_user_role() in ('administrator','front_desk','instructor')
);
create policy "reschedules create" on public.reschedule_requests for insert with check (
  requested_by = auth.uid()
);
create policy "reschedules staff update" on public.reschedule_requests for update using (
  public.current_user_role() in ('administrator','front_desk')
) with check (public.current_user_role() in ('administrator','front_desk'));

-- Basic seed data matching the documented studio operations.
insert into public.lesson_packages (name, category, duration_minutes, total_sessions, price, description) values
('Package 1', 'All Instruments / Voice', 60, 4, 1550, '4 one-hour sessions'),
('Package 2', 'All Instruments / Voice', 60, 8, 3000, '8 one-hour sessions'),
('Package 3', 'All Instruments / Voice', 60, 12, 4300, '12 one-hour sessions'),
('Package 4', 'All Instruments / Voice', 60, 16, 5400, '16 one-hour sessions')
on conflict do nothing;

insert into public.rooms (name, room_type, capacity, rental_rate) values
('Studio Room 1','studio',1,150),('Studio Room 2','studio',1,150),
('Studio Room 3','studio',1,150),('Studio Room 4','studio',1,150),
('Studio Room 5','studio',1,150),('Studio Room 6','studio',1,150),
('Studio Room 7','studio',1,150),('Studio Room 8','studio',1,150),
('Studio Room 9','studio',1,150)
on conflict (name) do nothing;

insert into public.instruments (name, category, quantity, condition_status) values
('Drum Set','Drums',12,'available'),
('Bass Guitar','Bass',8,'available'),
('Acoustic Guitar','Guitar',18,'available'),
('Piano Keyboard','Keyboard',10,'available'),
('Electric Guitar','Guitar',8,'available'),
('Ukulele','Ukulele',12,'available'),
('Digital Piano','Piano',8,'available'),
('Violin','Violin',6,'available'),
('Cajón','Percussion',6,'available'),
('Saxophone','Wind',3,'available'),
('Speaker','Studio Equipment',16,'available'),
('Microphone','Studio Equipment',20,'available')
on conflict do nothing;
