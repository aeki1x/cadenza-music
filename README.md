# Cadenza Music Center — Next.js + Supabase

A functional starter implementation based on the supplied Cadenza Music Center system specification.

## What is included

- Next.js App Router + TypeScript
- Supabase Auth with cookie-based sessions
- Supabase PostgreSQL schema with foreign keys and Row Level Security
- Role model: administrator, front_desk, instructor, client
- Admin/front-desk CRUD API for users, lesson packages, rooms, instruments and announcements
- Enrollment, studio booking, instrument rental, reschedule, schedule, attendance, progress, payment and notification APIs
- Schedule overlap validation for instructor/room conflicts
- Dashboard counts and today's schedule
- Operational report page
- Responsive functional UI
- Seed data for the four documented lesson packages, 9 rooms, and documented inventory quantities

## 1. Create the Supabase project

Create a Supabase project. In Supabase SQL Editor, run:

`supabase/migrations/001_initial.sql`

The SQL creates all application tables, foreign keys, indexes, RLS policies, auth-profile trigger, and basic seed data.

The supplied specification describes a centralized database for enrollment, lesson schedules, attendance, progress, studio bookings, instruments, rentals, billing and payments, and this schema follows those areas.

## 2. Get Supabase keys

Copy `.env.example` to `.env.local`.

Set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only; this project does not expose it to the browser)

The current Supabase Next.js guidance uses `@supabase/ssr` for cookie-based server-side authentication.

## 3. Install and run

```bash
npm install
npm run dev
```

Open:

http://localhost:3000

## 4. Create the first administrator

For a simple capstone setup:

1. In Supabase Dashboard → Authentication → Users, create a user with email/password.
2. The `handle_new_user` trigger creates a matching `profiles` row.
3. In Table Editor → `profiles`, change that user's `role` to `administrator`.
4. Log in at `/login`.

Do not put the service-role key in client-side code.

## API map

- `POST /api/auth/login` — login
- `POST /api/auth/logout` — logout
- `GET/POST /api/enrollments` — client enrollment
- `GET/POST /api/bookings` — studio booking requests
- `GET/POST /api/rentals` — instrument rental requests
- `GET/POST /api/reschedules` — lesson reschedule requests
- `GET/POST /api/schedules` — staff schedule management + overlap check
- `POST /api/attendance` — instructor attendance
- `POST /api/progress` — instructor lesson progress
- `GET/POST /api/payments` — payment records and billing balance update
- `GET/PATCH /api/notifications` — notifications
- `GET /api/dashboard` — dashboard summary
- `GET/POST/PATCH/DELETE /api/admin/[resource]` — staff CRUD

Admin resources are explicitly mapped in `lib/resources.ts`, so route resource names map to known Supabase table names rather than accepting arbitrary table names.

## Important design decisions from the supplied specification

- Lessons are represented by lesson packages with duration and session counts.
- Clients submit enrollments for Front Desk approval.
- Instructors submit availability; approved availability is used for scheduling.
- Schedules contain exact date/start/end times and assigned instructor/room.
- Studio bookings and rental requests have pending/approved/rejected states.
- Attendance is linked to a scheduled lesson and client.
- Progress records are linked to client/instructor/enrollment/schedule.
- Billing and payment records are separate, with payments updating billing balances.
- Notifications are stored per user.
- Announcements can target a role.
- No payroll/HR, online lessons, discounts, loyalty rewards, or automated instructor matching are implemented because the supplied limitations explicitly exclude them.

## Next implementation steps

For a production deployment, add:
- email OTP/password recovery using Supabase Auth email templates
- server-side validation with Zod
- audit logs
- stronger conflict checking using PostgreSQL exclusion constraints
- receipt PDF generation
- date-range filters and CSV/PDF report export
- realtime subscriptions for notifications and dashboard updates
- mobile client using Expo/React Native against the same API/database

## Public Client Registration

The application now includes a public `/signup` page. Anyone can create an account with:

- Full name
- Contact number
- Email
- Password

Supabase Auth creates the authentication account, while the `on_auth_user_created` database trigger creates the matching `public.profiles` record. New public accounts always use the database default role: `client`.

Staff roles (`administrator`, `front_desk`, and `instructor`) are not selectable from public registration and must be assigned by the System Administrator.

If Supabase email confirmation is enabled, the user must confirm their email before logging in. If you want users to log in immediately after registration during local development, go to Supabase Authentication settings and disable email confirmation for the project.

## Public browsing and checkout flow

The public landing page now behaves like a browse-first storefront:

1. Visitor opens `/` and can browse lesson packages, instruments, and studio/band rooms without logging in.
2. Lesson packages can be viewed publicly. Enrollment requires login or account creation.
3. Instruments can be browsed publicly. The rental checkout lets the visitor select a rental period and check current availability before login.
4. Rooms can be browsed publicly. The booking checkout lets the visitor select a date/time and check current room availability before login.
5. When the visitor clicks Login or Create Account, the selected checkout URL is preserved with `next=...`, so authentication returns them to the item they selected.
6. Public signup creates a Client account through Supabase Auth; staff roles are not selectable during public signup.
7. After authentication, the visitor can submit the enrollment, rental, or room booking request.
8. The documented payment methods are Cash, E-wallet, and Cheque. This project submits the service request first and keeps payment recording in the existing payment module; no third-party payment gateway was assumed because none was specified in the source requirements.

### Main public routes

- `/` - landing page
- `/browse` - browse hub
- `/browse/packages` - lesson package catalog
- `/browse/instruments` - instrument rental catalog
- `/browse/rooms` - room catalog
- `/checkout?type=enrollment&packageId=...` - enrollment checkout
- `/checkout?type=rental&instrumentId=...` - instrument rental checkout
- `/checkout?type=room&roomId=...` - room booking checkout
