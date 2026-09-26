export const resources = {
  profiles: {
    table: "profiles",
    select: "id,full_name,email,contact_number,role,status,avatar_url,created_at",
    searchable: ["full_name", "email", "contact_number"]
  },
  lesson_packages: {
    table: "lesson_packages",
    select: "*",
    searchable: ["name", "category"]
  },
  rooms: {
    table: "rooms",
    select: "*",
    searchable: ["name", "room_type"]
  },
  instruments: {
    table: "instruments",
    select: "*",
    searchable: ["name", "brand", "category", "serial_number"]
  },
  availability: {
    table: "instructor_availability",
    select: "*, instructor:profiles!instructor_availability_instructor_id_fkey(full_name,email)",
    searchable: []
  },
  enrollments: {
    table: "enrollments",
    select: "*, client:profiles!enrollments_client_id_fkey(full_name,email), package:lesson_packages(name,category,total_sessions,price)",
    searchable: []
  },
  schedules: {
    table: "schedules",
    select: "*, client:profiles!schedules_client_id_fkey(full_name), instructor:profiles!schedules_instructor_id_fkey(full_name), room:rooms(name), package:lesson_packages(name)",
    searchable: []
  },
  attendance: {
    table: "attendance",
    select: "*, client:profiles!attendance_client_id_fkey(full_name), schedule:schedules(scheduled_date,start_time,end_time)",
    searchable: []
  },
  progress: {
    table: "lesson_progress",
    select: "*, client:profiles!lesson_progress_client_id_fkey(full_name), instructor:profiles!lesson_progress_instructor_id_fkey(full_name)",
    searchable: []
  },
  bookings: {
    table: "studio_bookings",
    select: "*, client:profiles!studio_bookings_client_id_fkey(full_name), room:rooms(name)",
    searchable: []
  },
  rentals: {
    table: "instrument_rentals",
    select: "*, client:profiles!instrument_rentals_client_id_fkey(full_name), instrument:instruments(name,brand)",
    searchable: []
  },
  billing: {
    table: "billing",
    select: "*, client:profiles!billing_client_id_fkey(full_name,email)",
    searchable: []
  },
  payments: {
    table: "payments",
    select: "*, client:profiles!payments_client_id_fkey(full_name)",
    searchable: []
  },
  announcements: {
    table: "announcements",
    select: "*",
    searchable: ["title", "message"]
  },
  notifications: {
    table: "notifications",
    select: "*",
    searchable: ["title", "message"]
  }
} as const;

export type ResourceName = keyof typeof resources;
