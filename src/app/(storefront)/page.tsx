/**
 * Storefront Home Page — Server Component
 * Fetches categories + featured products and renders the landing page.
 */

import Link from "next/link";
import { productApi, categoryApi } from "@/lib/api/storefront";
import ProductCard from "@/components/storefront/ProductCard";
import CategoryCard from "@/components/storefront/CategoryCard";
import EmptyState from "@/components/shared/EmptyState";

export const revalidate = 60;

export const metadata = {
  title: "ShopWave — Modern E-Commerce",
  description:
    "Discover thousands of products at the best prices. Fast shipping, easy returns.",
};

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    productApi.getAll().catch(() => []),
    categoryApi.getAll().catch(() => []),
  ]);

  const featured = products.slice(0, 8);

  return (
    <div className="min-h-screen">
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% -10%, var(--accent-light) 0%, transparent 70%)",
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-light)] border border-[var(--accent)]/20 text-[var(--accent)] text-xs font-semibold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
            New arrivals every week
          </span>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-[var(--text-primary)] leading-tight tracking-tight mb-6">
            Shop Smarter,{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, var(--accent), #a78bfa)",
              }}
            >
              Live Better
            </span>
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed">
            Discover thousands of curated products at unbeatable prices. From
            everyday essentials to luxury finds — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              id="hero-shop-now-btn"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-semibold text-white transition-all shadow-lg shadow-[var(--accent)]/30 hover:shadow-[var(--accent)]/50 hover:-translate-y-0.5"
              style={{ background: "var(--accent)" }}
            >
              Shop Now
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/products"
              id="hero-browse-btn"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-semibold text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--accent)]/40 hover:bg-white/5 transition-all"
            >
              Browse Categories
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-md mx-auto">
            {[
              { value: `${products.length}+`, label: "Products" },
              { value: `${categories.length}+`, label: "Categories" },
              { value: "24/7", label: "Support" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-extrabold text-[var(--text-primary)]">{s.value}</div>
                <div className="text-xs text-[var(--text-secondary)] mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">Shop by Category</h2>
              <p className="text-[var(--text-secondary)] text-sm mt-1">
                Find exactly what you&apos;re looking for
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <CategoryCard key={cat.category_id} category={cat} />
            ))}
          </div>
        </section>
      )}

      {categories.length === 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <EmptyState
            icon="categories"
            title="No categories yet"
            description="Categories will appear here once they are added."
            className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl"
          />
        </section>
      )}

      {/* ── Featured Products ──────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Featured Products</h2>
            <p className="text-[var(--text-secondary)] text-sm mt-1">
              Hand-picked for you
            </p>
          </div>
          {products.length > 0 && (
            <Link
              href="/products"
              className="text-[var(--accent)] hover:text-[var(--accent-hover)] text-sm font-medium transition-colors flex items-center gap-1"
            >
              View all
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>

        {featured.length === 0 ? (
          <EmptyState
            icon="products"
            title="No products yet"
            description="Products will appear here once they are added to the store."
            action={{ label: "Check Back Later", href: "/" }}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featured.map((product) => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* ── Value Props Banner ─────────────────────────────────── */}
      <section className="border-t border-[var(--border)] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                  </svg>
                ),
                title: "Fast Shipping",
                desc: "Free shipping on orders over $50. Delivery in 2–5 days.",
              },
              {
                icon: (
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: "Secure Payments",
                desc: "Your payment information is always encrypted and secure.",
              },
              {
                icon: (
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ),
                title: "Easy Returns",
                desc: "30-day hassle-free returns. No questions asked.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex flex-col items-center text-center p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)]"
              >
                <div className="w-14 h-14 rounded-2xl bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-[var(--text-primary)] mb-1">{item.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
