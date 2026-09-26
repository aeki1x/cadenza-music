import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { errorResponse } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const me = await getCurrentUser();
    if (!me || !["instructor","front_desk","administrator"].includes(me.profile.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    const body = await request.json();
    const supabase = await createClient();
    const { data, error } = await supabase.from("attendance").upsert({
      ...body,
      instructor_id: me.profile.role === "instructor" ? me.id : body.instructor_id
    }, { onConflict: "schedule_id,client_id" }).select().single();
    if (error) throw new Error(error.message);
    return NextResponse.json({ data });
  } catch (e) { return errorResponse(e); }
}
