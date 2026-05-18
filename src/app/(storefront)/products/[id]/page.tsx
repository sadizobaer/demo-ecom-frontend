"use client";

/**
 * Product Detail Page — fetches a single product and lets user
 * add to cart, wishlist, or favorites (auth required for those).
 */

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { productApi, cartApi, wishlistApi, favoriteApi } from "@/lib/api/storefront";
import { useAuth } from "@/contexts/AuthContext";
import DynamicImage from "@/components/shared/DynamicImage";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Product } from "@/types";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { isLoggedIn, user } = useAuth();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundFlag, setNotFoundFlag] = useState(false);

  // Action states
  const [cartAdded, setCartAdded] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [inFavorites, setInFavorites] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [wishLoading, setWishLoading] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    productApi
      .getById(id)
      .then((p) => setProduct(p))
      .catch(() => setNotFoundFlag(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <svg className="h-10 w-10 animate-spin text-[var(--accent)]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    );
  }

  if (notFoundFlag || !product) {
    notFound();
  }

  const requireAuth = (fn: () => Promise<void>) => async () => {
    if (!isLoggedIn) { router.push("/login"); return; }
    await fn();
  };

  const handleCart = requireAuth(async () => {
    setCartLoading(true);
    try {
      await cartApi.add({
        user_id: Number(user?.user_id) || 0,
        product_id: product!.product_id,
        quantity: qty,
      });
      setCartAdded(true);
      setTimeout(() => setCartAdded(false), 2000);
    } finally {
      setCartLoading(false);
    }
  });

  const handleWishlist = requireAuth(async () => {
    setWishLoading(true);
    try {
      if (inWishlist) {
        await wishlistApi.remove({ user_id: Number(user?.user_id) || 0, product_id: product!.product_id });
        setInWishlist(false);
      } else {
        await wishlistApi.add({ user_id: Number(user?.user_id) || 0, product_id: product!.product_id });
        setInWishlist(true);
      }
    } finally {
      setWishLoading(false);
    }
  });

  const handleFavorite = requireAuth(async () => {
    setFavLoading(true);
    try {
      if (inFavorites) {
        await favoriteApi.remove({ user_id: Number(user?.user_id) || 0, product_id: product!.product_id });
        setInFavorites(false);
      } else {
        await favoriteApi.add({ user_id: Number(user?.user_id) || 0, product_id: product!.product_id });
        setInFavorites(true);
      }
    } finally {
      setFavLoading(false);
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-8">
        <Link href="/" className="hover:text-[var(--accent)] transition-colors">Home</Link>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <Link href="/products" className="hover:text-[var(--accent)] transition-colors">Products</Link>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-[var(--text-primary)] line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-[var(--surface)]">
          <DynamicImage
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
          {product.stock === 0 && (
            <div className="absolute top-4 left-4 px-3 py-1 bg-[var(--danger)] text-white text-xs font-semibold rounded-full">
              Out of stock
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-6">
          {/* Category badge */}
          {product.category?.name && (
            <span className="inline-flex w-fit px-3 py-1 rounded-full bg-[var(--accent-light)] text-[var(--accent)] text-xs font-semibold">
              {product.category.name}
            </span>
          )}

          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] leading-tight">
            {product.name}
          </h1>

          <p className="text-[var(--text-secondary)] leading-relaxed">{product.description}</p>

          {/* Price + stock */}
          <div className="flex items-center gap-4">
            <span className="text-4xl font-extrabold text-[var(--accent)]">
              ${product.price.toFixed(2)}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                product.stock > 0
                  ? "bg-[var(--success)]/10 text-[var(--success)]"
                  : "bg-[var(--danger)]/10 text-[var(--danger)]"
              }`}
            >
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </span>
          </div>

          {/* Quantity selector */}
          {product.stock > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-[var(--text-secondary)]">Quantity:</span>
              <div className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-1">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-all disabled:opacity-40"
                  disabled={qty <= 1}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                  </svg>
                </button>
                <span className="w-8 text-center font-semibold text-[var(--text-primary)]">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-all disabled:opacity-40"
                  disabled={qty >= product.stock}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {product.stock > 0 && (
              <button
                id={`detail-add-cart-${product.product_id}`}
                onClick={handleCart}
                disabled={cartLoading}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                  cartAdded
                    ? "bg-[var(--success)] text-white shadow-[var(--success)]/20"
                    : "bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-[var(--accent)]/20"
                }`}
              >
                {cartLoading ? (
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : cartAdded ? (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Add to Cart
                  </>
                )}
              </button>
            )}

            <button
              id={`detail-wishlist-${product.product_id}`}
              onClick={handleWishlist}
              disabled={wishLoading}
              className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm border transition-all disabled:opacity-50 ${
                inWishlist
                  ? "border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/50 hover:text-[var(--text-primary)]"
              }`}
              aria-label="Add to Wishlist"
            >
              {wishLoading ? (
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill={inWishlist ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              )}
              <span className="hidden sm:inline">{inWishlist ? "Saved" : "Wishlist"}</span>
            </button>

            <button
              id={`detail-favorite-${product.product_id}`}
              onClick={handleFavorite}
              disabled={favLoading}
              className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm border transition-all disabled:opacity-50 ${
                inFavorites
                  ? "border-[var(--danger)] bg-[var(--danger)]/10 text-[var(--danger)]"
                  : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--danger)]/50 hover:text-[var(--danger)]"
              }`}
              aria-label="Add to Favorites"
            >
              {favLoading ? (
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill={inFavorites ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              )}
              <span className="hidden sm:inline">{inFavorites ? "Favorited" : "Favorite"}</span>
            </button>
          </div>

          {!isLoggedIn && (
            <p className="text-xs text-[var(--text-secondary)] bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3">
              💡{" "}
              <Link href="/login" className="text-[var(--accent)] hover:underline font-medium">
                Sign in
              </Link>{" "}
              to add items to your cart, wishlist, and favorites.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
