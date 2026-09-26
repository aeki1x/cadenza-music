import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { errorResponse } from "@/lib/api";

export async function GET() {
  try {
    const me = await getCurrentUser();
    if (!me) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    const supabase = await createClient();
    let q = supabase.from("reschedule_requests").select("*, schedule:schedules(*)");
    if (me.profile.role === "client" || me.profile.role === "instructor") q = q.eq("requested_by", me.id);
    const { data, error } = await q.order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return NextResponse.json({ data });
  } catch (e) { return errorResponse(e); }
}

export async function POST(request: Request) {
  try {
    const me = await getCurrentUser();
    if (!me) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    const body = await request.json();
    const supabase = await createClient();
    const { data, error } = await supabase.from("reschedule_requests").insert({ ...body, requested_by: me.id }).select().single();
    if (error) throw new Error(error.message);
    return NextResponse.json({ data }, { status: 201 });
  } catch (e) { return errorResponse(e); }
}
