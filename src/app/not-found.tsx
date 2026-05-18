import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ background: "var(--bg)" }}
    >
      {/* Animated number */}
      <div className="relative mb-8">
        <span
          className="text-[10rem] sm:text-[14rem] font-extrabold leading-none select-none"
          style={{
            background: "linear-gradient(135deg, var(--accent), #a78bfa)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            opacity: 0.15,
          }}
        >
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-[var(--accent-light)] border border-[var(--accent)]/20 flex items-center justify-center">
            <svg className="h-12 w-12 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3">
        Page Not Found
      </h1>
      <p className="text-[var(--text-secondary)] max-w-md mb-8 leading-relaxed">
        Oops! The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        Let&apos;s get you back on track.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          id="not-found-home-btn"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all shadow-lg shadow-[var(--accent)]/20 hover:-translate-y-0.5"
          style={{ background: "var(--accent)" }}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Back to Home
        </Link>
        <Link
          href="/products"
          id="not-found-products-btn"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--accent)]/40 hover:bg-white/5 transition-all"
        >
          Browse Products
        </Link>
      </div>
    </div>
  );
}
