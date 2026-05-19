"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useUserData } from "@/contexts/UserDataContext";
import { cartApi, wishlistApi, favoriteApi } from "@/lib/api/storefront";

interface Product {
  product_id: number;
  name: string;
  price: number;
  stock: number;
}

export default function ProductActions({ product }: { product: Product }) {
  const { isLoggedIn, user } = useAuth();
  const {
    cartProductIds,
    wishlistProductIds,
    favoriteProductIds,
    markInCart,
    markInWishlist,
    markInFavorites,
    unmarkFromWishlist,
    unmarkFromFavorites,
  } = useUserData();
  const router = useRouter();

  const pid       = product.product_id;
  const userId    = Number(user?.user_id) || 0;

  // Derive from global context — stays in sync with ProductCard & list pages
  const isInCart      = cartProductIds.has(pid);
  const isInWishlist  = wishlistProductIds.has(pid);
  const isInFavorites = favoriteProductIds.has(pid);

  const [qty, setQty] = useState(1);
  const [cartLoading, setCartLoading] = useState(false);
  const [wishLoading, setWishLoading] = useState(false);
  const [favLoading,  setFavLoading]  = useState(false);

  const requireAuth = (fn: () => Promise<void>) => async () => {
    if (!isLoggedIn) { router.push("/login"); return; }
    await fn();
  };

  // ── Cart ─────────────────────────────────────────────────────────────────────
  const handleCart = requireAuth(async () => {
    if (isInCart) return; // already in cart, button is disabled
    setCartLoading(true);
    try {
      await cartApi.add({ user_id: userId, product_id: pid, quantity: qty });
      markInCart(pid); // instantly updates ProductCard everywhere
    } finally {
      setCartLoading(false);
    }
  });

  // ── Wishlist ──────────────────────────────────────────────────────────────────
  const handleWishlist = requireAuth(async () => {
    setWishLoading(true);
    try {
      if (isInWishlist) {
        await wishlistApi.remove({ user_id: userId, product_id: pid });
        unmarkFromWishlist(pid);
      } else {
        await wishlistApi.add({ user_id: userId, product_id: pid });
        markInWishlist(pid);
      }
    } finally {
      setWishLoading(false);
    }
  });

  // ── Favorites ─────────────────────────────────────────────────────────────────
  const handleFavorite = requireAuth(async () => {
    setFavLoading(true);
    try {
      if (isInFavorites) {
        await favoriteApi.remove({ user_id: userId, product_id: pid });
        unmarkFromFavorites(pid);
      } else {
        await favoriteApi.add({ user_id: userId, product_id: pid });
        markInFavorites(pid);
      }
    } finally {
      setFavLoading(false);
    }
  });

  return (
    <div className="space-y-5">
      {/* ── Quantity selector ─────────────────────────────────────────────── */}
      {product.stock > 0 && !isInCart && (
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-[var(--text-primary)]">Qty</span>
          <div className="flex items-center bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
            <button
              onClick={() => setQty(q => Math.max(1, q - 1))}
              disabled={qty <= 1}
              className="w-10 h-10 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-all disabled:opacity-30"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
              </svg>
            </button>
            <span className="w-10 text-center font-bold text-[var(--text-primary)]">{qty}</span>
            <button
              onClick={() => setQty(q => Math.min(product.stock, q + 1))}
              disabled={qty >= product.stock}
              className="w-10 h-10 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-all disabled:opacity-30"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          <span className="text-sm text-[var(--text-secondary)]">
            Total:{" "}
            <span className="text-[var(--accent)] font-bold">
              ৳{(Number(product.price) * qty).toLocaleString()}
            </span>
          </span>
        </div>
      )}

      {/* ── Action buttons ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Cart */}
        {product.stock > 0 ? (
          <button
            id={`detail-add-cart-${pid}`}
            onClick={handleCart}
            disabled={cartLoading || isInCart}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base transition-all shadow-lg disabled:cursor-not-allowed ${
              isInCart
                ? "bg-[var(--accent)]/10 text-[var(--accent)] border-2 border-[var(--accent)]/40 shadow-none"
                : "bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-[var(--accent)]/30 disabled:opacity-50"
            }`}
          >
            {cartLoading ? (
              <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : isInCart ? (
              <>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Already in Cart
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Add to Cart
              </>
            )}
          </button>
        ) : (
          <div className="flex-1 flex items-center justify-center py-4 rounded-2xl font-bold text-base bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)]">
            Out of Stock
          </div>
        )}

        {/* Wishlist */}
        <button
          id={`detail-wishlist-${pid}`}
          onClick={handleWishlist}
          disabled={wishLoading}
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          className={`flex items-center justify-center gap-2 px-5 py-4 rounded-2xl font-semibold text-sm border-2 transition-all disabled:opacity-50 ${
            isInWishlist
              ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
              : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
          }`}
        >
          {wishLoading ? (
            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill={isInWishlist ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          )}
          <span className="hidden sm:inline">{isInWishlist ? "Saved ✓" : "Wishlist"}</span>
        </button>

        {/* Favorite */}
        <button
          id={`detail-favorite-${pid}`}
          onClick={handleFavorite}
          disabled={favLoading}
          aria-label={isInFavorites ? "Remove from favorites" : "Add to favorites"}
          className={`flex items-center justify-center gap-2 px-5 py-4 rounded-2xl font-semibold text-sm border-2 transition-all disabled:opacity-50 ${
            isInFavorites
              ? "border-[var(--danger)] bg-[var(--danger)]/10 text-[var(--danger)]"
              : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--danger)] hover:text-[var(--danger)]"
          }`}
        >
          {favLoading ? (
            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill={isInFavorites ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )}
          <span className="hidden sm:inline">{isInFavorites ? "Liked ✓" : "Favorite"}</span>
        </button>
      </div>

      {/* ── Auth hint ─────────────────────────────────────────────────────── */}
      {!isLoggedIn && (
        <div className="flex items-center gap-3 px-4 py-3 bg-[var(--accent)]/5 border border-[var(--accent)]/20 rounded-xl text-sm text-[var(--text-secondary)]">
          <svg className="h-4 w-4 text-[var(--accent)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            <Link href="/login" className="text-[var(--accent)] font-semibold hover:underline">Sign in</Link>{" "}
            to add to cart, wishlist, or favorites.
          </span>
        </div>
      )}
    </div>
  );
}
