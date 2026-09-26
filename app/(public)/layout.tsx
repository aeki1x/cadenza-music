import Link from "next/link";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="public-shell">
      <header className="public-nav">
        <Link href="/" className="public-brand">Cadenza Music Center</Link>
        <nav className="public-links">
          <Link href="/browse/packages">Lessons</Link>
          <Link href="/browse/instruments">Instrument Rental</Link>
          <Link href="/browse/rooms">Band Rooms</Link>
          <Link href="/login" className="btn secondary">Login</Link>
          <Link href="/signup" className="btn">Create Account</Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
