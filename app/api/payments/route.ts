import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { errorResponse } from "@/lib/api";

export async function GET() {
  try {
    const me = await getCurrentUser();
    if (!me) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    const supabase = await createClient();
    let q = supabase.from("payments").select("*, client:profiles!payments_client_id_fkey(full_name), billing:billing(*)");
    if (me.profile.role === "client") q = q.eq("client_id", me.id);
    const { data, error } = await q.order("paid_at", { ascending: false });
    if (error) throw new Error(error.message);
    return NextResponse.json({ data });
  } catch (e) { return errorResponse(e); }
}

export async function POST(request: Request) {
  try {
    const me = await getCurrentUser();
    if (!me || !["front_desk","administrator"].includes(me.profile.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    const body = await request.json();
    const supabase = await createClient();
    const { data, error } = await supabase.from("payments").insert({ ...body, recorded_by: me.id }).select().single();
    if (error) throw new Error(error.message);

    if (body.billing_id) {
      const { data: bill } = await supabase.from("billing").select("amount_due,amount_paid").eq("id", body.billing_id).single();
      if (bill) {
        const paid = Number(bill.amount_paid) + Number(body.amount);
        const status = paid >= Number(bill.amount_due) ? "paid" : "partial";
        await supabase.from("billing").update({ amount_paid: paid, status }).eq("id", body.billing_id);
      }
    }
    return NextResponse.json({ data }, { status: 201 });
  } catch (e) { return errorResponse(e); }
}
