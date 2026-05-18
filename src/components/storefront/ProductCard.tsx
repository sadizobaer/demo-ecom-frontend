"use client";

import DynamicImage from "@/components/shared/DynamicImage";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { cartApi, wishlistApi, favoriteApi } from "@/lib/api/storefront";
import type { Product } from "@/types";

interface Props {
  product: Product;
}

// ─── Icon helpers ──────────────────────────────────────────────
function CartIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
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

// ─────────────────────────────────────────────────────────────
// Action button — checks auth before calling API
// ─────────────────────────────────────────────────────────────
interface ActionButtonProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick: () => Promise<void>;
  colorClass?: string;
}

function ActionButton({ id, label, icon, active, onClick, colorClass = "text-[var(--text-secondary)]" }: ActionButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault(); // prevent card Link navigation
    e.stopPropagation();
    setLoading(true);
    try {
      await onClick();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      id={id}
      aria-label={label}
      onClick={handleClick}
      disabled={loading}
      className={`
        p-2 rounded-xl border border-[var(--border)] backdrop-blur-sm
        bg-[var(--surface)]/80 transition-all duration-200
        hover:border-[var(--accent)]/50 hover:bg-[var(--accent-light)]
        disabled:opacity-40 disabled:cursor-not-allowed
        ${active ? "text-[var(--accent)] border-[var(--accent)]/40" : colorClass}
      `}
    >
      {loading ? (
        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : (
        icon
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Product Card
// ─────────────────────────────────────────────────────────────
export default function ProductCard({ product }: Props) {
  const { isLoggedIn, user } = useAuth();
  const router = useRouter();
  const [inWishlist, setInWishlist] = useState(false);
  const [inFavorites, setInFavorites] = useState(false);
  const [cartAdded, setCartAdded] = useState(false);

  // ── Auth gate helper ──────────────────────────────────────────
  const requireAuth = (fn: () => Promise<void>) => async () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    await fn();
  };

  // ── Action handlers ───────────────────────────────────────────
  const handleCart = requireAuth(async () => {
    await cartApi.add({
      user_id: Number(user?.user_id) || 0,
      product_id: product.product_id,
      quantity: 1,
    });
    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 2000);
  });

  const handleWishlist = requireAuth(async () => {
    if (inWishlist) {
      await wishlistApi.remove({
        user_id: Number(user?.user_id) || 0,
        product_id: product.product_id,
      });
      setInWishlist(false);
    } else {
      await wishlistApi.add({
        user_id: Number(user?.user_id) || 0,
        product_id: product.product_id,
      });
      setInWishlist(true);
    }
  });

  const handleFavorite = requireAuth(async () => {
    if (inFavorites) {
      await favoriteApi.remove({
        user_id: Number(user?.user_id) || 0,
        product_id: product.product_id,
      });
      setInFavorites(false);
    } else {
      await favoriteApi.add({
        user_id: Number(user?.user_id) || 0,
        product_id: product.product_id,
      });
      setInFavorites(true);
    }
  });

  return (
    <div
      id={`product-card-${product.product_id}`}
      className="group relative flex flex-col bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden hover:border-[var(--accent)]/50 hover:shadow-xl hover:shadow-[var(--accent)]/5 transition-all duration-300"
    >
      {/* ── Image area ─────────────────────────────────────────── */}
      <Link
        href={`/products/${product.product_id}`}
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

        {/* Out-of-stock badge */}
        {product.stock === 0 && (
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-[var(--danger)] text-white text-xs font-semibold rounded-full">
            Out of stock
          </div>
        )}

        {/* Category badge */}
        {product.category?.name && (
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-[var(--text-secondary)] text-xs rounded-full">
            {product.category.name}
          </div>
        )}

        {/* Action buttons — appear on hover */}
        <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200">
          <ActionButton
            id={`card-wishlist-${product.product_id}`}
            label="Add to Wishlist"
            icon={<WishlistIcon filled={inWishlist} />}
            active={inWishlist}
            onClick={handleWishlist}
          />
          <ActionButton
            id={`card-favorite-${product.product_id}`}
            label="Add to Favorites"
            icon={<FavoriteIcon filled={inFavorites} />}
            active={inFavorites}
            colorClass="text-[var(--danger)]"
            onClick={handleFavorite}
          />
        </div>
      </Link>

      {/* ── Details ────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <Link href={`/products/${product.product_id}`}>
          <h3 className="font-semibold text-[var(--text-primary)] text-sm leading-snug line-clamp-2 hover:text-[var(--accent)] transition-colors">
            {product.name}
          </h3>
        </Link>

        <p className="text-[var(--text-secondary)] text-xs line-clamp-2 leading-relaxed flex-1">
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-auto pt-2 gap-2">
          <div>
            <span className="text-lg font-bold text-[var(--accent)]">
              ${product.price.toFixed(2)}
            </span>
            <span
              className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${
                product.stock > 0
                  ? "bg-[var(--success)]/10 text-[var(--success)]"
                  : "bg-[var(--danger)]/10 text-[var(--danger)]"
              }`}
            >
              {product.stock > 0 ? `${product.stock} left` : "Sold out"}
            </span>
          </div>

          {/* Add to Cart button */}
          {product.stock > 0 && (
            <button
              id={`card-cart-${product.product_id}`}
              onClick={async (e) => {
                e.preventDefault();
                await handleCart();
              }}
              aria-label="Add to cart"
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
                transition-all duration-200 flex-shrink-0
                ${cartAdded
                  ? "bg-[var(--success)] text-white"
                  : "bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-md shadow-[var(--accent)]/20"
                }
              `}
            >
              {cartAdded ? (
                <>
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Added
                </>
              ) : (
                <>
                  <CartIcon />
                  Add
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
