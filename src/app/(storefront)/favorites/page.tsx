"use client";

/**
 * Favorites Page — requires login.
 */

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { favoriteApi } from "@/lib/api/storefront";
import EmptyState from "@/components/shared/EmptyState";
import DynamicImage from "@/components/shared/DynamicImage";
import Link from "next/link";
import type { FavoriteItem } from "@/types";

export default function FavoritesPage() {
  const { isLoggedIn, user } = useAuth();
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<number | null>(null);

  const fetchFavorites = async () => {
    try {
      const data = await favoriteApi.get();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchFavorites();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const handleRemove = async (productId: number) => {
    setRemoving(productId);
    try {
      await favoriteApi.remove({
        user_id: Number(user?.user_id) || 0,
        product_id: productId,
      });
      setItems((prev) => prev.filter((i) => i.product.product_id !== productId));
    } finally {
      setRemoving(null);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">My Favorites</h1>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
          <EmptyState
            icon="favorites"
            title="Sign in to view your favorites"
            description="Heart the products you love by signing in."
            action={{ label: "Sign In", href: "/login" }}
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">My Favorites</h1>
        <div className="flex items-center justify-center py-32">
          <svg className="h-8 w-8 animate-spin text-[var(--accent)]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">My Favorites</h1>
        {items.length > 0 && (
          <p className="text-[var(--text-secondary)] mt-2">{items.length} favorited item{items.length !== 1 ? "s" : ""}</p>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
          <EmptyState
            icon="favorites"
            title="No favorites yet"
            description="Browse products and heart the ones you love."
            action={{ label: "Browse Products", href: "/products" }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div
              key={item.favorite_id}
              className="group relative flex flex-col bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden hover:border-[var(--accent)]/50 hover:shadow-xl hover:shadow-[var(--accent)]/5 transition-all duration-300"
            >
              <Link href={`/products/${item.product.product_id}`} className="relative block w-full aspect-square bg-[var(--surface-2)] overflow-hidden">
                <DynamicImage
                  src={item.product.image_url}
                  alt={item.product.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </Link>

              <div className="flex flex-col flex-1 p-4 gap-3">
                <Link href={`/products/${item.product.product_id}`}>
                  <h3 className="font-semibold text-[var(--text-primary)] text-sm leading-snug line-clamp-2 hover:text-[var(--accent)] transition-colors">
                    {item.product.name}
                  </h3>
                </Link>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-lg font-bold text-[var(--accent)]">
                    ${item.product.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleRemove(item.product.product_id)}
                    disabled={removing === item.product.product_id}
                    aria-label="Remove from favorites"
                    className="p-2 rounded-xl text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-all disabled:opacity-40"
                  >
                    {removing === item.product.product_id ? (
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
