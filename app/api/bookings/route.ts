import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { errorResponse } from "@/lib/api";

export async function GET() {
  try {
    const me = await getCurrentUser();
    if (!me) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    const supabase = await createClient();
    let q = supabase.from("studio_bookings").select("*, room:rooms(name), client:profiles!studio_bookings_client_id_fkey(full_name)");
    if (me.profile.role === "client") q = q.eq("client_id", me.id);
    const { data, error } = await q.order("booking_date", { ascending: true }).order("start_time", { ascending: true });
    if (error) throw new Error(error.message);
    return NextResponse.json({ data });
  } catch (e) { return errorResponse(e); }
}

export async function POST(request: Request) {
  try {
    const me = await getCurrentUser();
    if (!me) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    const body = await request.json();
    if (!body.room_id || !body.booking_date || !body.start_time || !body.end_time) return NextResponse.json({ error: "room_id, booking_date, start_time and end_time are required." }, { status: 400 });
    const supabase = await createClient();
    const { data: conflicts, error: conflictError } = await supabase.from("studio_bookings").select("id").eq("room_id", body.room_id).eq("booking_date", body.booking_date).in("status", ["pending", "approved", "rescheduled"]).lt("start_time", body.end_time).gt("end_time", body.start_time).limit(1);
    if (conflictError) throw new Error(conflictError.message);
    if (conflicts && conflicts.length) return NextResponse.json({ error: "That room is already requested or booked for the selected time." }, { status: 409 });
    const payload = { ...body, client_id: me.profile.role === "client" ? me.id : body.client_id, status: "pending" };
    const { data, error } = await supabase.from("studio_bookings").insert(payload).select().single();
    if (error) throw new Error(error.message);
    return NextResponse.json({ data }, { status: 201 });
  } catch (e) { return errorResponse(e); }
}
