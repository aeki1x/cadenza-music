import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function RoomsPage() {
  const supabase = await createClient();
  const { data: rooms } = await supabase.from("rooms").select("*").eq("availability_status", "active").order("name");
  return (
    <main className="public-main">
      <div className="public-head"><span className="eyebrow">BAND / STUDIO ROOMS</span><h1>Studio Room Booking</h1><p>Browse the available rooms first. Select a room to check a date and time, then log in or create an account when you are ready to submit the booking.</p></div>
      <section className="product-grid">
        {(rooms ?? []).map((room) => (
          <article className="product-card" key={room.id}>
            <div className="product-top"><span className="tag">{room.room_type}</span><span>Capacity {room.capacity}</span></div>
            <h2>{room.name}</h2>
            <p>{room.notes || "Studio room available for booking."}</p>
            <div className="product-price">₱{Number(room.rental_rate).toLocaleString()}</div>
            <div className="product-meta">Room rental rate</div>
            <Link className="btn full" href={`/checkout?type=room&roomId=${room.id}`}>Check availability & book</Link>
          </article>
        ))}
      </section>
    </main>
  );
}
