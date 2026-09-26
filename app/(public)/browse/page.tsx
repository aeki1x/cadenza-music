import Link from "next/link";

export default function BrowsePage() {
  return (
    <main className="public-main">
      <div className="public-head">
        <span className="eyebrow">BROWSE</span>
        <h1>What would you like to browse?</h1>
        <p>Browsing is public. You only need an account when you decide to submit a request.</p>
      </div>
      <section className="browse-grid">
        <Link href="/browse/packages" className="browse-card"><h2>Lesson Packages</h2><p>View lesson packages, session limits, categories, and prices.</p><span>View lessons →</span></Link>
        <Link href="/browse/instruments" className="browse-card"><h2>Instrument Rental</h2><p>Browse instruments and see whether inventory is available for rental.</p><span>View instruments →</span></Link>
        <Link href="/browse/rooms" className="browse-card"><h2>Band / Studio Rooms</h2><p>Check rooms and requested time availability before booking.</p><span>View rooms →</span></Link>
      </section>
    </main>
  );
}
