# API ↔ Supabase Attribute Map

The purpose of this document is to make it clear which API attributes are actually stored in Supabase.

## Profiles
`profiles.id` ↔ `auth.users.id`

Main fields:
`full_name`, `email`, `contact_number`, `role`, `status`, `avatar_url`

## Lesson packages
`lesson_packages.id`

Main fields:
`name`, `category`, `duration_minutes`, `total_sessions`, `price`, `description`, `active`

## Instructor availability
`instructor_availability.instructor_id` → `profiles.id`

Main fields:
`day_of_week`, `start_time`, `end_time`, `status`, `notes`

## Enrollments
`enrollments.client_id` → `profiles.id`
`enrollments.lesson_package_id` → `lesson_packages.id`
`enrollments.instructor_id` → `profiles.id`

Main fields:
`instrument_category`, `preferred_day`, `preferred_start_time`, `status`, `total_sessions`, `completed_sessions`, `remaining_sessions`, `start_date`, `end_date`, `notes`

## Schedules
`schedules.enrollment_id` → `enrollments.id`
`schedules.instructor_id` → `profiles.id`
`schedules.client_id` → `profiles.id`
`schedules.room_id` → `rooms.id`
`schedules.lesson_package_id` → `lesson_packages.id`

Main fields:
`scheduled_date`, `start_time`, `end_time`, `status`, `notes`

The schedule API checks the same date plus overlapping time against the same instructor or room before inserting.

## Attendance
`attendance.schedule_id` → `schedules.id`
`attendance.client_id` → `profiles.id`
`attendance.instructor_id` → `profiles.id`

Main fields:
`attendance_date`, `status`, `remarks`

## Lesson progress
`lesson_progress.client_id` → `profiles.id`
`lesson_progress.instructor_id` → `profiles.id`
`lesson_progress.enrollment_id` → `enrollments.id`
`lesson_progress.schedule_id` → `schedules.id`

Main fields:
`skill_level`, `book_completion`, `practice_exercises`, `performance_rating`, `notes`

## Studio bookings
`studio_bookings.client_id` → `profiles.id`
`studio_bookings.room_id` → `rooms.id`

Main fields:
`booking_date`, `start_time`, `end_time`, `status`, `purpose`, `notes`

## Instrument rentals
`instrument_rentals.client_id` → `profiles.id`
`instrument_rentals.instrument_id` → `instruments.id`

Main fields:
`start_at`, `return_at`, `quantity`, `daily_or_hourly_rate`, `deposit_amount`, `total_amount`, `status`, `returned_at`, `notes`

## Billing
`billing.client_id` → `profiles.id`
`billing.reference_id` can point to the related service record.

Main fields:
`service_type`, `description`, `amount_due`, `amount_paid`, `due_date`, `status`

## Payments
`payments.client_id` → `profiles.id`
`payments.billing_id` → `billing.id`
`payments.recorded_by` → `profiles.id`

Main fields:
`amount`, `method`, `reference_number`, `service_type`, `notes`, `paid_at`

## Notifications
`notifications.user_id` → `profiles.id`

Main fields:
`title`, `message`, `type`, `read_at`

## Announcements
`announcements.created_by` → `profiles.id`

Main fields:
`title`, `message`, `target_role`, `published`

## Reschedule requests
`reschedule_requests.schedule_id` → `schedules.id`
`reschedule_requests.requested_by` → `profiles.id`
`reschedule_requests.reviewed_by` → `profiles.id`

Main fields:
`requested_date`, `requested_start_time`, `requested_end_time`, `reason`, `status`, `review_notes`
