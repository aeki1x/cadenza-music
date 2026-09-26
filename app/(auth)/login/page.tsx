"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  async function submit(e:FormEvent) {
    e.preventDefault(); setLoading(true); setError("");
    const supabase=createClient();
    const {error}=await supabase.auth.signInWithPassword({email,password});
    if(error){setError(error.message);setLoading(false);return;}
    router.push(next.startsWith("/") ? next : "/dashboard"); router.refresh();
  }
  const signup = `/signup?next=${encodeURIComponent(next)}`;
  return <main className="login"><section className="login-box">
    <h1>Cadenza Music Center</h1><p className="muted">Music Studio Management System</p>
    {next !== "/dashboard" && <div className="success">Login to continue with your selected item.</div>}
    {error && <div className="error">{error}</div>}
    <form onSubmit={submit}>
      <div className="field"><label>Email</label><input value={email} onChange={e=>setEmail(e.target.value)} type="email" required /></div>
      <div className="field"><label>Password</label><input value={password} onChange={e=>setPassword(e.target.value)} type="password" required /></div>
      <button className="btn" disabled={loading}>{loading?"Signing in...":"Login"}</button>
    </form>
    <p className="auth-switch">Don&apos;t have an account? <Link href={signup}>Create an account</Link></p>
    <p className="muted signup-note">Public registration creates a Client account. Staff accounts are created by the System Administrator.</p>
  </section></main>
}
