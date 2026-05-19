"use client";

import DynamicImage from "@/components/shared/DynamicImage";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useUserData } from "@/contexts/UserDataContext";
import { useRouter } from "next/navigation";
import { cartApi, wishlistApi, favoriteApi } from "@/lib/api/storefront";
import type { Product } from "@/types";

interface Props {
  product: Product;
}

// ─── Icon helpers ──────────────────────────────────────────────────────────────

function CartIcon({ filled }: { filled?: boolean }) {
  return (
    <svg className="h-4 w-4" fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={filled ? 0 : 2}>
      {filled ? (
        <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      )}
    </svg>
  );
}

function WishlistIcon({ filled }: { filled: boolean }) {
  return (
    <svg className="h-4 w-4" fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
  );
}

function FavoriteIcon({ filled }: { filled: boolean }) {
  return (
    <svg className="h-4 w-4" fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

export default function ProductCard({ product }: Props) {
  const { isLoggedIn, user } = useAuth();
  const {
    cartProductIds,
    wishlistProductIds,
    favoriteProductIds,
    markInCart,
    markInWishlist,
    markInFavorites,
  } = useUserData();
  const router = useRouter();

  const pid       = product.product_id;
  const userId    = Number(user?.user_id) || 0;
  const isInCart      = cartProductIds.has(pid);
  const isInWishlist  = wishlistProductIds.has(pid);
  const isInFavorites = favoriteProductIds.has(pid);

  // ── Auth gate ────────────────────────────────────────────────────────────────
  const requireAuth = (fn: () => Promise<void>) => async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) { router.push("/login"); return; }
    await fn();
  };

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleCart = requireAuth(async () => {
    if (isInCart) return; // already there — button is disabled anyway
    await cartApi.add({ user_id: userId, product_id: pid, quantity: 1 });
    markInCart(pid); // optimistic — no re-fetch needed
  });

  const handleWishlist = requireAuth(async () => {
    if (isInWishlist) return;
    await wishlistApi.add({ user_id: userId, product_id: pid });
    markInWishlist(pid);
  });

  const handleFavorite = requireAuth(async () => {
    if (isInFavorites) return;
    await favoriteApi.add({ user_id: userId, product_id: pid });
    markInFavorites(pid);
  });

  // ── Shared button style ───────────────────────────────────────────────────────
  const btnBase =
    "p-2 rounded-xl border backdrop-blur-sm bg-[var(--surface)]/80 transition-all duration-200";
  const btnActive  = "text-[var(--accent)] border-[var(--accent)]/60 bg-[var(--accent-light)] cursor-not-allowed";
  const btnIdle    = "text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--accent)]/50 hover:bg-[var(--accent-light)] hover:text-[var(--accent)]";
  const btnDisabledAttr = { disabled: true, "aria-disabled": true } as const;

  return (
    <div
      id={`product-card-${pid}`}
      className="group relative flex flex-col bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden hover:border-[var(--accent)]/50 hover:shadow-xl hover:shadow-[var(--accent)]/5 transition-all duration-300"
    >
      {/* ── Image ──────────────────────────────────────────────────────────── */}
      <Link
        href={`/products/${pid}`}
        tabIndex={-1}
        className="relative block w-full aspect-square bg-[var(--surface-2)] overflow-hidden"
      >
        <DynamicImage
          src={product.image_url}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* ── Wishlist & Favorite overlay buttons (top-right) ────────────── */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          {/* Wishlist */}
          <button
            id={`wishlist-btn-${pid}`}
            aria-label={isInWishlist ? "Already in wishlist" : "Add to wishlist"}
            onClick={handleWishlist}
            className={`${btnBase} ${isInWishlist ? btnActive : btnIdle}`}
            {...(isInWishlist ? btnDisabledAttr : {})}
          >
            <WishlistIcon filled={isInWishlist} />
          </button>

          {/* Favorite */}
          <button
            id={`favorite-btn-${pid}`}
            aria-label={isInFavorites ? "Already in favorites" : "Add to favorites"}
            onClick={handleFavorite}
            className={`${btnBase} ${isInFavorites ? "text-[var(--danger)] border-[var(--danger)]/40 bg-[var(--danger)]/10 cursor-not-allowed" : "text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--danger)]/50 hover:bg-[var(--danger)]/10 hover:text-[var(--danger)]"}`}
            {...(isInFavorites ? btnDisabledAttr : {})}
          >
            <FavoriteIcon filled={isInFavorites} />
          </button>
        </div>

        {/* ── Already-in-cart badge ────────────────────────────────────────── */}
        {isInCart && (
          <div className="absolute top-2 left-2 z-10">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--accent)] text-white text-[10px] font-bold shadow-lg shadow-[var(--accent)]/30">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              In Cart
            </span>
          </div>
        )}
      </Link>

      {/* ── Info ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <Link href={`/products/${pid}`}>
          <h3 className="font-semibold text-[var(--text-primary)] text-sm leading-snug line-clamp-2 hover:text-[var(--accent)] transition-colors">
            {product.name}
          </h3>
        </Link>

        {product.category?.name && (
          <span className="text-[10px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">
            {product.category.name}
          </span>
        )}

        <div className="flex items-center justify-between mt-auto">
          <span className="text-lg font-extrabold text-[var(--accent)]">
            ৳{product.price.toLocaleString()}
          </span>

          {/* Add to Cart button */}
          <button
            id={`cart-btn-${pid}`}
            aria-label={isInCart ? "Already in cart" : "Add to cart"}
            onClick={handleCart}
            className={`
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
              border transition-all duration-200
              ${isInCart
                ? "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/40 cursor-not-allowed"
                : "bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white border-transparent shadow-md shadow-[var(--accent)]/20 hover:shadow-[var(--accent)]/40"
              }
            `}
            {...(isInCart ? btnDisabledAttr : {})}
          >
            <CartIcon filled={isInCart} />
            {isInCart ? "In Cart" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
