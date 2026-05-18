import type { Metadata } from "next";
import { productApi } from "@/lib/api/storefront";
import { adminCategoryApi } from "@/lib/api/admin";
import type { Product, Category } from "@/types";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard | Admin",
  description: "Admin overview of the ShopWave e-commerce platform.",
};

async function getDashboardData() {
  try {
    const [products, categories] = await Promise.all([
      productApi.getAll(),
      adminCategoryApi.getAll(),
    ]);
    return { products, categories, error: null };
  } catch (e) {
    return { products: [] as Product[], categories: [] as Category[], error: String(e) };
  }
}

function StatCard({
  id,
  label,
  value,
  icon,
  color,
  trend,
}: {
  id: string;
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}) {
  return (
    <div
      id={id}
      className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 flex items-start gap-4 hover:border-[var(--accent)]/30 transition-all duration-300"
    >
      <div className={`p-3 rounded-xl ${color} flex-shrink-0`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[var(--text-secondary)] text-sm font-medium">{label}</p>
        <p className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mt-1">{value}</p>
        {trend && (
          <p className="text-xs text-[var(--text-secondary)] mt-1">{trend}</p>
        )}
      </div>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const { products, categories, error } = await getDashboardData();

  const inStock = products.filter((p) => p.stock > 0).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;
  const totalValue = products.reduce((sum, p) => sum + p.price, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Overview</h2>
        <p className="text-[var(--text-secondary)] mt-1 text-sm">
          Welcome back — here&apos;s what&apos;s happening in your store.
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-xl border border-[var(--danger)]/40 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
          ⚠️ Could not connect to backend: {error}. Make sure the Go server is running on port 8080.
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          id="stat-total-products"
          label="Total Products"
          value={products.length}
          color="bg-[var(--accent-light)]"
          trend="All time"
          icon={
            <svg className="h-5 w-5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />
        <StatCard
          id="stat-in-stock"
          label="In Stock"
          value={inStock}
          color="bg-[var(--success)]/10"
          trend="Available products"
          icon={
            <svg className="h-5 w-5 text-[var(--success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          id="stat-out-of-stock"
          label="Out of Stock"
          value={outOfStock}
          color="bg-[var(--danger)]/10"
          trend="Needs restocking"
          icon={
            <svg className="h-5 w-5 text-[var(--danger)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
        <StatCard
          id="stat-categories"
          label="Categories"
          value={categories.length}
          color="bg-[var(--warning)]/10"
          trend="Product groups"
          icon={
            <svg className="h-5 w-5 text-[var(--warning)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
            </svg>
          }
        />
      </div>

      {/* Quick actions + recent products grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent products */}
        <div className="lg:col-span-2 bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
            <h3 className="font-semibold text-[var(--text-primary)]">Recent Products</h3>
            <Link
              href="/admin/products"
              id="dashboard-manage-products-link"
              className="text-xs text-[var(--accent)] hover:underline font-medium"
            >
              View all →
            </Link>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {products.slice(0, 6).map((p) => (
              <div
                key={p.product_id}
                className="flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-[var(--surface-2)] flex-shrink-0 overflow-hidden">
                  {p.image_url?.startsWith("http") && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">{p.name}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{p.category?.name}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-[var(--accent)]">${p.price.toFixed(2)}</p>
                  <p className={`text-xs ${p.stock > 0 ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
                    {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
                  </p>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <p className="text-[var(--text-secondary)] text-sm px-5 py-8 text-center">
                No products yet.{" "}
                <Link href="/admin/products" className="text-[var(--accent)] hover:underline">
                  Add your first product →
                </Link>
              </p>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
            <h3 className="font-semibold text-[var(--text-primary)] mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href="/admin/products"
                id="quick-action-add-product"
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium transition-all"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add New Product
              </Link>
              <Link
                href="/admin/categories"
                id="quick-action-add-category"
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)]/40 hover:bg-white/5 text-sm font-medium transition-all"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Manage Categories
              </Link>
            </div>
          </div>

          {/* Catalog value card */}
          <div className="bg-gradient-to-br from-[var(--accent)]/20 to-purple-900/20 border border-[var(--accent)]/30 rounded-2xl p-5">
            <p className="text-[var(--text-secondary)] text-sm font-medium">Catalog Value</p>
            <p className="text-3xl font-bold text-[var(--text-primary)] mt-1">
              ${totalValue.toFixed(2)}
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Sum of all product prices
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
