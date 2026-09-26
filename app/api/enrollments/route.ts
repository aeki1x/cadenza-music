import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { errorResponse } from "@/lib/api";

export async function GET() {
  try {
    const me = await getCurrentUser();
    if (!me) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    const supabase = await createClient();
    const query = supabase.from("enrollments")
      .select("*, package:lesson_packages(name,category,total_sessions,price), instructor:profiles!enrollments_instructor_id_fkey(full_name)");
    const { data, error } = me.profile.role === "client"
      ? await query.eq("client_id", me.id).order("created_at", { ascending: false })
      : await query.order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return NextResponse.json({ data });
  } catch (e) { return errorResponse(e); }
}

export async function POST(request: Request) {
  try {
    const me = await getCurrentUser();
    if (!me) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    const body = await request.json();
    const payload = {
      ...body,
      client_id: me.profile.role === "client" ? me.id : body.client_id,
      status: "pending"
    };
    if (!payload.client_id || !payload.lesson_package_id || !payload.instrument_category) {
      return NextResponse.json({ error: "client_id, lesson_package_id and instrument_category are required." }, { status: 400 });
    }
    const supabase = await createClient();
    const { data, error } = await supabase.from("enrollments").insert(payload).select().single();
    if (error) throw new Error(error.message);
    return NextResponse.json({ data }, { status: 201 });
  } catch (e) { return errorResponse(e); }
}
