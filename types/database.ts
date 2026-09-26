export type AppRole = "administrator" | "front_desk" | "instructor" | "client";
export type Status = "active" | "inactive";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  contact_number: string | null;
  role: AppRole;
  status: Status;
  avatar_url: string | null;
}

export interface LessonPackage {
  id: string;
  name: string;
  category: string;
  duration_minutes: number;
  total_sessions: number;
  price: number;
  active: boolean;
  description: string | null;
}

export interface InstructorAvailability {
  id: string;
  instructor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  status: "pending" | "approved" | "rejected";
  notes: string | null;
}

export interface Schedule {
  id: string;
  enrollment_id: string | null;
  instructor_id: string;
  client_id: string;
  room_id: string;
  lesson_package_id: string | null;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  status: "scheduled" | "completed" | "cancelled" | "rescheduled";
  notes: string | null;
}
