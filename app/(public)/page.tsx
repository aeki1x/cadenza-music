import Link from "next/link";

export default function Home() {
  return (
    <main className="landing">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">CADENZA MUSIC CENTER</span>
          <h1>Browse first. Create an account only when you’re ready to book or enroll.</h1>
          <p>
            Explore lesson packages, check instruments for rental, and browse band room availability before you log in. When you decide to continue, sign in or create a client account to submit your request.
          </p>
          <div className="hero-actions">
            <Link href="/browse/packages" className="btn">Browse Lesson Packages</Link>
            <Link href="/browse" className="btn secondary">Explore Rentals & Rooms</Link>
          </div>
        </div>
      </section>

      <section className="store-grid">
        <Link href="/browse/packages" className="store-card">
          <div className="store-icon">🎵</div>
          <h2>Lesson Packages</h2>
          <p>Compare packages, session counts, instruments, and prices before enrollment.</p>
          <span>Browse packages →</span>
        </Link>
        <Link href="/browse/instruments" className="store-card">
          <div className="store-icon">🎸</div>
          <h2>Instrument Rental</h2>
          <p>Browse available instruments, rental rates, and request details.</p>
          <span>Browse instruments →</span>
        </Link>
        <Link href="/browse/rooms" className="store-card">
          <div className="store-icon">🎤</div>
          <h2>Band / Studio Rooms</h2>
          <p>Choose a room and check the requested date and time before booking.</p>
          <span>Check rooms →</span>
        </Link>
      </section>

      <section className="how-it-works">
        <h2>How it works</h2>
        <div className="steps">
          <div><b>1</b><h3>Browse</h3><p>View packages, instruments, and rooms without an account.</p></div>
          <div><b>2</b><h3>Choose</h3><p>Select the lesson, instrument, or room you want.</p></div>
          <div><b>3</b><h3>Login or Sign Up</h3><p>You only need an account when you are ready to continue.</p></div>
          <div><b>4</b><h3>Submit & Pay</h3><p>Submit your request and continue to the payment/checkout step.</p></div>
        </div>
      </section>
    </main>
  );
}
