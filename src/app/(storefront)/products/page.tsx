/**
 * Products Listing Page — Server Component
 *
 * Fetches all products and displays them in a grid.
 */

import { productApi } from "@/lib/api/storefront";
import ProductCard from "@/components/storefront/ProductCard";
import EmptyState from "@/components/shared/EmptyState";

export const revalidate = 60;

export default async function ProductsPage() {
  const products = await productApi.getAll().catch(() => []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">All Products</h1>
        <p className="text-[var(--text-secondary)] mt-2">
          Discover our full collection of high-quality items.
        </p>
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon="products"
          title="No products found"
          description="We couldn't find any products at the moment. Please check back later."
          action={{ label: "Back to Home", href: "/" }}
          className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.product_id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
