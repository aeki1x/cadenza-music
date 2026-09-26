import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { errorResponse } from "@/lib/api";

export async function GET() {
  try {
    const me = await getCurrentUser();
    if (!me) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    const supabase = await createClient();
    const today = new Date().toISOString().slice(0,10);

    const tables = ["profiles","enrollments","schedules","studio_bookings","instrument_rentals","billing","payments"] as const;
    const counts: Record<string, number> = {};
    for (const table of tables) {
      const { count } = await supabase.from(table).select("*", { count: "exact", head: true });
      counts[table] = count ?? 0;
    }

    const { data: todaySchedules } = await supabase.from("schedules")
      .select("id,start_time,end_time,status,client:profiles!schedules_client_id_fkey(full_name),instructor:profiles!schedules_instructor_id_fkey(full_name),room:rooms(name)")
      .eq("scheduled_date", today).order("start_time");

    const { data: pending } = await supabase.from("enrollments").select("id").eq("status","pending");
    return NextResponse.json({ role: me.profile.role, profile: me.profile, counts, pendingEnrollments: pending?.length ?? 0, todaySchedules });
  } catch (e) { return errorResponse(e); }
}
