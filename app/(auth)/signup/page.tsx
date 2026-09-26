"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const [fullName, setFullName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          contact_number: contactNumber.trim(),
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push(next.startsWith("/") ? next : "/dashboard");
      router.refresh();
      return;
    }

    setSuccess(
      "Account created. Please check your email and confirm your account before logging in."
    );
    setLoading(false);
  }

  return (
    <main className="login">
      <section className="login-box">
        <h1>Create Account</h1>
        <p className="muted">Cadenza Music Center</p>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              type="text"
              placeholder="Juan Dela Cruz"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="contactNumber">Contact Number</label>
            <input
              id="contactNumber"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              type="tel"
              placeholder="09XXXXXXXXX"
            />
          </div>

          <div className="field">
            <label htmlFor="signupEmail">Email</label>
            <input
              id="signupEmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="signupPassword">Password</label>
            <input
              id="signupPassword"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="At least 6 characters"
              minLength={6}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              required
            />
          </div>

          <button className="btn" disabled={loading} type="submit">
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link href={`/login?next=${encodeURIComponent(next)}`}>Login here</Link>
        </p>

        <p className="muted signup-note">
          Public registration creates a Client account. Administrator, Front Desk,
          and Instructor accounts remain controlled by the System Administrator.
        </p>
      </section>
    </main>
  );
}
