import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { errorResponse } from "@/lib/api";

export async function GET() {
  try {
    const me = await getCurrentUser();
    if (!me) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    const supabase = await createClient();
    const { data, error } = await supabase.from("notifications").select("*").eq("user_id", me.id).order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return NextResponse.json({ data });
  } catch (e) { return errorResponse(e); }
}

export async function PATCH(request: Request) {
  try {
    const me = await getCurrentUser();
    if (!me) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    const { id } = await request.json();
    const supabase = await createClient();
    const { data, error } = await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id).eq("user_id", me.id).select().single();
    if (error) throw new Error(error.message);
    return NextResponse.json({ data });
  } catch (e) { return errorResponse(e); }
}
