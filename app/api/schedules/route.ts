import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { staffOnly } from "@/lib/api";
import { errorResponse } from "@/lib/api";

export async function GET() {
  try {
    const me = await staffOnly();
    const supabase = await createClient();
    let q = supabase.from("schedules").select("*, client:profiles!schedules_client_id_fkey(full_name), instructor:profiles!schedules_instructor_id_fkey(full_name), room:rooms(name), package:lesson_packages(name)");
    if (me.profile.role === "instructor") q = q.eq("instructor_id", me.id);
    const { data, error } = await q.order("scheduled_date").order("start_time");
    if (error) throw new Error(error.message);
    return NextResponse.json({ data });
  } catch (e) { return errorResponse(e); }
}

export async function POST(request: Request) {
  try {
    await staffOnly();
    const body = await request.json();
    const { scheduled_date, start_time, end_time, instructor_id, room_id, client_id } = body;
    if (!scheduled_date || !start_time || !end_time || !instructor_id || !room_id || !client_id) {
      return NextResponse.json({ error: "scheduled_date, start_time, end_time, instructor_id, room_id and client_id are required." }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: conflicts, error: conflictError } = await supabase
      .from("schedules")
      .select("id,instructor_id,room_id,start_time,end_time")
      .eq("scheduled_date", scheduled_date)
      .neq("status", "cancelled")
      .or(`instructor_id.eq.${instructor_id},room_id.eq.${room_id}`)
      .lt("start_time", end_time)
      .gt("end_time", start_time);

    if (conflictError) throw new Error(conflictError.message);
    if (conflicts?.length) return NextResponse.json({ error: "Schedule conflict: instructor or room is already booked during this time." }, { status: 409 });

    const { data, error } = await supabase.from("schedules").insert(body).select().single();
    if (error) throw new Error(error.message);
    return NextResponse.json({ data }, { status: 201 });
  } catch (e) { return errorResponse(e); }
}
