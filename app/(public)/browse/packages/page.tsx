import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function PackagesPage() {
  const supabase = await createClient();
  const { data: packages } = await supabase.from("lesson_packages").select("*").eq("active", true).order("price", { ascending: true });
  return (
    <main className="public-main">
      <div className="public-head"><span className="eyebrow">LESSONS</span><h1>Lesson Packages</h1><p>Browse the available lesson packages first. You will only be asked to log in when you choose to enroll.</p></div>
      <section className="product-grid">
        {(packages ?? []).map((pkg) => (
          <article className="product-card" key={pkg.id}>
            <div className="product-top"><span className="tag">{pkg.category}</span><span>{pkg.duration_minutes} min</span></div>
            <h2>{pkg.name}</h2>
            <p>{pkg.description || "Individual music lessons at Cadenza Music Center."}</p>
            <div className="product-price">₱{Number(pkg.price).toLocaleString()}</div>
            <div className="product-meta">{pkg.total_sessions} sessions</div>
            <Link className="btn full" href={`/checkout?type=enrollment&packageId=${pkg.id}`}>Enroll in this package</Link>
          </article>
        ))}
      </section>
    </main>
  );
}
