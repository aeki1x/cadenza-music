import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import CheckoutClient from "./CheckoutClient";

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ type?: string; packageId?: string; instrumentId?: string; roomId?: string }> }) {
  const params = await searchParams;
  const type = params.type;
  if (!type || !["enrollment", "rental", "room"].includes(type)) redirect("/browse");

  const supabase = await createClient();
  const user = await getCurrentUser();
  const { data: pkg } = params.packageId ? await supabase.from("lesson_packages").select("*").eq("id", params.packageId).eq("active", true).single() : { data: null };
  const { data: instrument } = params.instrumentId ? await supabase.from("instruments").select("*").eq("id", params.instrumentId).single() : { data: null };
  const { data: room } = params.roomId ? await supabase.from("rooms").select("*").eq("id", params.roomId).eq("availability_status", "active").single() : { data: null };

  if ((type === "enrollment" && !pkg) || (type === "rental" && !instrument) || (type === "room" && !room)) redirect("/browse");

  return (
    <CheckoutClient
      type={type as "enrollment" | "rental" | "room"}
      pkg={pkg}
      instrument={instrument}
      room={room}
      authenticated={Boolean(user)}
      userRole={user?.profile.role ?? null}
    />
  );
}
