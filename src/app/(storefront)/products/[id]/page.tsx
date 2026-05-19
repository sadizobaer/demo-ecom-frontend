/**
 * Product Detail — Server Component.
 * Fetches the product on the server (no flicker, no loading state),
 * then delegates interactive actions to ProductActions (client).
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import DynamicImage from "@/components/shared/DynamicImage";
import ProductActions from "./ProductActions";

const BACKEND = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

async function getProduct(id: string) {
  try {
    const res = await fetch(`${BACKEND}/products/${id}`, {
      headers: { "X-User-Type": "user" },
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) notFound();

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-2">
        <nav className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
          <Link href="/" className="hover:text-[var(--accent)] transition-colors">Home</Link>
          <svg className="h-4 w-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <Link href="/products" className="hover:text-[var(--accent)] transition-colors">Products</Link>
          <svg className="h-4 w-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-[var(--text-primary)] line-clamp-1 max-w-[200px]">{product.name}</span>
        </nav>
      </div>

      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

          {/* Left — Image */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-[var(--surface)] border border-[var(--border)] shadow-2xl shadow-black/20">
              <DynamicImage
                src={product.image_url}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="px-6 py-2 bg-[var(--danger)] text-white font-bold rounded-full text-lg">
                    Out of Stock
                  </span>
                </div>
              )}
              {product.category?.name && (
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[var(--accent)]/90 text-white backdrop-blur-sm">
                    {product.category.name}
                  </span>
                </div>
              )}
            </div>

            {/* Trust badges — same icons & style as the home page */}
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "Fast Shipping",
                  desc: "Free on orders over ৳1000",
                  icon: (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                    </svg>
                  ),
                },
                {
                  label: "Secure Payment",
                  desc: "256-bit encryption",
                  icon: (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ),
                },
                {
                  label: "Easy Returns",
                  desc: "30-day hassle-free",
                  icon: (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ),
                },
              ].map((b) => (
                <div
                  key={b.label}
                  className="flex flex-col items-center gap-2 p-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl text-center"
                >
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center">
                    {b.icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--text-primary)]">{b.label}</p>
                    <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Info + Actions */}
          <div className="flex flex-col gap-6">
            {product.category?.name && (
              <span className="inline-flex w-fit items-center px-3 py-1 rounded-full text-xs font-semibold bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
                {product.category.name}
              </span>
            )}

            <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] leading-tight">
              {product.name}
            </h1>

            {/* Stars */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1,2,3,4,5].map(s => (
                  <svg key={s} className={`h-4 w-4 ${s <= 4 ? "text-yellow-400" : "text-[var(--border)]"}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-[var(--text-secondary)]">4.0</span>
              <span className="text-[var(--border)] select-none">·</span>
              <span className="text-sm text-[var(--success)] font-medium">{product.stock} in stock</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-black text-[var(--accent)]">
                ${Number(product.price).toFixed(2)}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                product.stock > 0
                  ? "bg-[var(--success)]/10 text-[var(--success)]"
                  : "bg-[var(--danger)]/10 text-[var(--danger)]"
              }`}>
                {product.stock > 0 ? "Available" : "Sold Out"}
              </span>
            </div>

            <div className="border-t border-[var(--border)]" />

            {/* Client-side actions (qty, cart, wishlist, favorite) */}
            <ProductActions product={product} />

            {/* Tabs — description / details */}
            <div className="border-t border-[var(--border)] pt-6">
              <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3">Description</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
                {product.description || "No description available."}
              </p>

              <div className="mt-5 space-y-2.5">
                {[
                  { label: "Product ID", value: `#${product.product_id}` },
                  { label: "Category", value: product.category?.name ?? "—" },
                  { label: "Availability", value: product.stock > 0 ? "In Stock" : "Out of Stock" },
                ].map(row => (
                  <div key={row.label} className="flex justify-between py-2 border-b border-[var(--border)]/50 text-sm">
                    <span className="text-[var(--text-secondary)]">{row.label}</span>
                    <span className="text-[var(--text-primary)] font-semibold">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-12">
          <Link href="/products" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to all products
          </Link>
        </div>
      </div>
    </div>
  );
}
