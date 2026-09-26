import { createClient } from "@/lib/supabase/server";

export type AppRole = "administrator" | "front_desk" | "instructor" | "client";

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email, contact_number, role, status, avatar_url")
    .eq("id", user.id)
    .single();

  return profile ? { ...user, profile } : null;
}

export async function requireUser(roles?: AppRole[]) {
  const current = await getCurrentUser();
  if (!current) throw new Error("UNAUTHORIZED");
  if (roles && !roles.includes(current.profile.role as AppRole)) {
    throw new Error("FORBIDDEN");
  }
  return current;
}
