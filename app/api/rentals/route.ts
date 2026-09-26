import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { errorResponse } from "@/lib/api";

export async function GET() {
  try {
    const me = await getCurrentUser();
    if (!me) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    const supabase = await createClient();
    let q = supabase.from("instrument_rentals").select("*, instrument:instruments(name,brand), client:profiles!instrument_rentals_client_id_fkey(full_name)");
    if (me.profile.role === "client") q = q.eq("client_id", me.id);
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
    if (!body.instrument_id || !body.start_at || !body.return_at) return NextResponse.json({ error: "instrument_id, start_at and return_at are required." }, { status: 400 });
    const supabase = await createClient();
    const { data: instrument, error: instrumentError } = await supabase.from("instruments").select("quantity, condition_status, rental_rate").eq("id", body.instrument_id).single();
    if (instrumentError) throw new Error(instrumentError.message);
    if (instrument.condition_status !== "available" || instrument.quantity < (body.quantity || 1)) return NextResponse.json({ error: "This instrument is not currently available in the requested quantity." }, { status: 409 });
    const { data: conflicts, error: conflictError } = await supabase.from("instrument_rentals").select("id,quantity").eq("instrument_id", body.instrument_id).in("status", ["pending", "approved", "rescheduled"]).lt("start_at", body.return_at).gt("return_at", body.start_at);
    if (conflictError) throw new Error(conflictError.message);
    const requested = Number(body.quantity || 1);
    const reserved = (conflicts || []).reduce((sum, row) => sum + Number(row.quantity || 0), 0);
    if (reserved + requested > instrument.quantity) return NextResponse.json({ error: "Not enough quantity is available for those rental dates." }, { status: 409 });
    const payload = { ...body, client_id: me.profile.role === "client" ? me.id : body.client_id, status: "pending" };
    const { data, error } = await supabase.from("instrument_rentals").insert(payload).select().single();
    if (error) throw new Error(error.message);
    return NextResponse.json({ data }, { status: 201 });
  } catch (e) { return errorResponse(e); }
}
