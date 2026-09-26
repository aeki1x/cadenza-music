"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CheckoutClient({ type, pkg, instrument, room, authenticated, userRole }: any) {
  const router = useRouter();
  const [instrumentCategory, setInstrumentCategory] = useState("");
  const [day, setDay] = useState("1");
  const [time, setTime] = useState("09:00");
  const [date, setDate] = useState("");
  const [endTime, setEndTime] = useState("10:00");
  const [startAt, setStartAt] = useState("");
  const [returnAt, setReturnAt] = useState("");
  const [purpose, setPurpose] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [availability, setAvailability] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const title = type === "enrollment" ? "Confirm Enrollment" : type === "rental" ? "Instrument Rental" : "Band / Studio Room Booking";

  const nextUrl = useMemo(() => {
    const params = new URLSearchParams({ type });
    if (pkg?.id) params.set("packageId", pkg.id);
    if (instrument?.id) params.set("instrumentId", instrument.id);
    if (room?.id) params.set("roomId", room.id);
    return `/checkout?${params.toString()}`;
  }, [type, pkg?.id, instrument?.id, room?.id]);

  async function checkAvailability() {
    setError(""); setAvailability(null); setChecking(true);
    const params = new URLSearchParams({ type });
    if (room?.id) params.set("roomId", room.id);
    if (instrument?.id) params.set("instrumentId", instrument.id);
    if (type === "room") {
      if (!date || !time || !endTime) { setError("Select a date, start time, and end time first."); setChecking(false); return; }
      params.set("date", date); params.set("startTime", time); params.set("endTime", endTime);
    }
    if (type === "rental") {
      if (!startAt || !returnAt) { setError("Select the rental start and return date/time first."); setChecking(false); return; }
      params.set("startAt", new Date(startAt).toISOString()); params.set("returnAt", new Date(returnAt).toISOString()); params.set("quantity", "1");
    }
    const response = await fetch(`/api/public/availability?${params.toString()}`);
    const result = await response.json();
    if (!response.ok) setError(result.error || "Unable to check availability.");
    else setAvailability(Boolean(result.available));
    setChecking(false);
  }

  async function submit(e: FormEvent) {
    e.preventDefault(); setError(""); setSuccess("");
    if (!authenticated) return;
    setLoading(true);
    let endpoint = "";
    let body: any = {};
    if (type === "enrollment") {
      if (!instrumentCategory) { setError("Please choose the instrument or lesson category."); setLoading(false); return; }
      endpoint = "/api/enrollments";
      body = { lesson_package_id: pkg.id, instrument_category: instrumentCategory, preferred_day: Number(day), preferred_start_time: time, total_sessions: pkg.total_sessions, remaining_sessions: pkg.total_sessions };
    } else if (type === "rental") {
      if (availability !== true) { setError("Check availability first and make sure the instrument is available."); setLoading(false); return; }
      endpoint = "/api/rentals";
      body = { instrument_id: instrument.id, start_at: new Date(startAt).toISOString(), return_at: new Date(returnAt).toISOString(), quantity: 1, daily_or_hourly_rate: instrument.rental_rate, total_amount: instrument.rental_rate, deposit_amount: 3000, notes: `Requested payment method: ${paymentMethod}` };
    } else {
      if (availability !== true) { setError("Check availability first and make sure the room is available."); setLoading(false); return; }
      endpoint = "/api/bookings";
      body = { room_id: room.id, booking_date: date, start_time: time, end_time: endTime, purpose, notes: `Requested payment method: ${paymentMethod}` };
    }

    const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const result = await response.json();
    if (!response.ok) { setError(result.error || "Unable to submit request."); setLoading(false); return; }
    setSuccess("Request submitted successfully. The Front Desk can now review it. Continue to the payment module to complete payment according to the selected payment method.");
    setLoading(false);
    setTimeout(() => router.push("/dashboard/payments"), 1200);
  }

  const authLinks = (
    <div className="hero-actions">
      <Link className="btn" href={`/login?next=${encodeURIComponent(nextUrl)}`}>Login to confirm</Link>
      <Link className="btn secondary" href={`/signup?next=${encodeURIComponent(nextUrl)}`}>Create account</Link>
    </div>
  );

  return (
    <main className="public-main narrow">
      <div className="checkout-panel">
        <span className="eyebrow">{type === "enrollment" ? "LESSON ENROLLMENT" : "CHECK AVAILABILITY"}</span>
        <h1>{title}</h1>
        {!authenticated && <p>Browse and check availability without an account. An account is required only when you confirm the request.</p>}
        {userRole && userRole !== "client" && <div className="error">This checkout is for Client accounts. Staff should process requests from the dashboard.</div>}

        {pkg && <div className="summary"><b>{pkg.name}</b><span>{pkg.category} · {pkg.total_sessions} sessions</span><strong>₱{Number(pkg.price).toLocaleString()}</strong></div>}
        {instrument && <div className="summary"><b>{instrument.name}</b><span>{instrument.brand || instrument.category} · {instrument.quantity} currently listed</span><strong>₱{Number(instrument.rental_rate).toLocaleString()} · ₱3,000 refundable deposit</strong></div>}
        {room && <div className="summary"><b>{room.name}</b><span>{room.room_type} · capacity {room.capacity}</span><strong>₱{Number(room.rental_rate).toLocaleString()}</strong></div>}

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <form onSubmit={submit} className="checkout-form">
          {type === "enrollment" && <>
            <div className="field"><label>Instrument / Lesson Category</label><select value={instrumentCategory} onChange={e=>setInstrumentCategory(e.target.value)} required><option value="">Select</option><option>Voice</option><option>Piano</option><option>Violin</option><option>Guitar</option><option>Drums</option><option>Wind</option><option>Ukulele</option></select></div>
            <div className="form-grid"><div className="field"><label>Preferred Day</label><select value={day} onChange={e=>setDay(e.target.value)}><option value="0">Sunday</option><option value="1">Monday</option><option value="2">Tuesday</option><option value="3">Wednesday</option><option value="4">Thursday</option><option value="5">Friday</option><option value="6">Saturday</option></select></div><div className="field"><label>Preferred Start Time</label><input type="time" value={time} onChange={e=>setTime(e.target.value)} required /></div></div>
          </>}

          {type === "rental" && <>
            <div className="form-grid"><div className="field"><label>Rental Start</label><input type="datetime-local" value={startAt} onChange={e=>{setStartAt(e.target.value);setAvailability(null)}} required /></div><div className="field"><label>Return Date/Time</label><input type="datetime-local" value={returnAt} onChange={e=>{setReturnAt(e.target.value);setAvailability(null)}} required /></div></div>
            <button type="button" className="btn secondary" onClick={checkAvailability} disabled={checking}>{checking ? "Checking..." : "Check instrument availability"}</button>
          </>}

          {type === "room" && <>
            <div className="form-grid"><div className="field"><label>Booking Date</label><input type="date" value={date} onChange={e=>{setDate(e.target.value);setAvailability(null)}} required /></div><div className="field"><label>Start Time</label><input type="time" value={time} onChange={e=>{setTime(e.target.value);setAvailability(null)}} required /></div><div className="field"><label>End Time</label><input type="time" value={endTime} onChange={e=>{setEndTime(e.target.value);setAvailability(null)}} required /></div></div>
            <button type="button" className="btn secondary" onClick={checkAvailability} disabled={checking}>{checking ? "Checking..." : "Check room availability"}</button>
            {availability !== null && <div className={availability ? "success" : "error"}>{availability ? "This time is currently available." : "This time is not available. Please choose another time."}</div>}
            <div className="field"><label>Purpose</label><input value={purpose} onChange={e=>setPurpose(e.target.value)} placeholder="Band practice, recording, rehearsal, etc." /></div>
          </>}

          {type !== "enrollment" && availability !== null && <div className={availability ? "success" : "error"}>{availability ? "Available for your selected period." : "Not available for your selected period."}</div>}

          <div className="field"><label>Preferred Payment Method</label><select value={paymentMethod} onChange={e=>setPaymentMethod(e.target.value)}><option value="cash">Cash</option><option value="e_wallet">E-wallet</option><option value="cheque">Cheque</option></select></div>
          <p className="checkout-note">Cadenza's documented payment methods are Cash, E-wallet, and Cheque. This checkout submits the request first; payment recording is handled by the payment module after the request is processed.</p>

          {!authenticated ? authLinks : userRole === "client" ? <button className="btn full" disabled={loading}>{loading ? "Submitting..." : "Confirm Request"}</button> : <Link href="/dashboard" className="btn full">Go to dashboard</Link>}
        </form>
        <Link href="/browse" className="back-link">← Back to browsing</Link>
      </div>
    </main>
  );
}
