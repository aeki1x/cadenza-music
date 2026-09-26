import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function InstrumentsPage() {
  const supabase = await createClient();
  const { data: instruments } = await supabase.from("instruments").select("*").eq("condition_status", "available").gt("quantity", 0).order("name");
  return (
    <main className="public-main">
      <div className="public-head"><span className="eyebrow">RENTAL</span><h1>Instrument Rental</h1><p>Browse instruments that are currently listed as available. Availability is checked again when you submit a rental request.</p></div>
      <section className="product-grid">
        {(instruments ?? []).map((instrument) => (
          <article className="product-card" key={instrument.id}>
            <div className="product-top"><span className="tag">{instrument.category}</span><span>{instrument.quantity} available</span></div>
            <h2>{instrument.name}</h2>
            <p>{instrument.brand ? `Brand: ${instrument.brand}` : "Cadenza Music Center instrument"}</p>
            <p className="muted">{instrument.description || "Available for rental subject to approval."}</p>
            <div className="product-price">₱{Number(instrument.rental_rate).toLocaleString()}</div>
            <div className="product-meta">Rental rate</div>
            <Link className="btn full" href={`/checkout?type=rental&instrumentId=${instrument.id}`}>Rent this instrument</Link>
          </article>
        ))}
      </section>
      {(!instruments || instruments.length === 0) && <div className="empty-state">No instruments are currently listed as available.</div>}
    </main>
  );
}
