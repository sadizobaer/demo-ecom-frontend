"use client";

/**
 * UserDataContext
 *
 * Maintains the logged-in user's cart / wishlist / favorites product-ID sets
 * so every ProductCard can instantly know if an item is already added.
 *
 * Fetch strategy:
 *   - Called once when AuthContext.isLoggedIn becomes true
 *   - Optimistically updated on add (no re-fetch needed)
 *   - Cleared on logout (AuthContext.logout already clears localStorage)
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import { cartApi, wishlistApi, favoriteApi } from "@/lib/api/storefront";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserDataContextType {
  /** product_ids currently in the user's active cart */
  cartProductIds: Set<number>;
  /** product_ids in the user's wishlist */
  wishlistProductIds: Set<number>;
  /** product_ids in the user's favorites */
  favoriteProductIds: Set<number>;
  /** true while the initial fetch is in flight */
  loading: boolean;
  /** Optimistically mark a product as added to cart */
  markInCart: (productId: number) => void;
  /** Optimistically mark a product as added to wishlist */
  markInWishlist: (productId: number) => void;
  /** Optimistically mark a product as added to favorites */
  markInFavorites: (productId: number) => void;
  /** Optimistically remove a product from cart set */
  unmarkFromCart: (productId: number) => void;
  /** Optimistically remove a product from wishlist set */
  unmarkFromWishlist: (productId: number) => void;
  /** Optimistically remove a product from favorites set */
  unmarkFromFavorites: (productId: number) => void;
  /** Re-fetch all data (call after cart/wishlist/favorites changes on a page) */
  refresh: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const UserDataContext = createContext<UserDataContextType>({
  cartProductIds: new Set(),
  wishlistProductIds: new Set(),
  favoriteProductIds: new Set(),
  loading: false,
  markInCart: () => {},
  markInWishlist: () => {},
  markInFavorites: () => {},
  unmarkFromCart: () => {},
  unmarkFromWishlist: () => {},
  unmarkFromFavorites: () => {},
  refresh: async () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function UserDataProvider({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, user } = useAuth();
  const [cartProductIds,     setCartProductIds]     = useState<Set<number>>(new Set());
  const [wishlistProductIds, setWishlistProductIds] = useState<Set<number>>(new Set());
  const [favoriteProductIds, setFavoriteProductIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  // Prevent concurrent fetches
  const fetchingRef = useRef(false);

  const fetchAll = useCallback(async (userId: number | string) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);
    try {
      const uid = Number(userId) || 0;
      if (!uid) return;

      const [cart, wishlist, favorites] = await Promise.allSettled([
        cartApi.get(uid),
        wishlistApi.get(uid),
        favoriteApi.get(uid),
      ]);

      if (cart.status === "fulfilled" && cart.value) {
        setCartProductIds(
          new Set((cart.value.items ?? []).map((i) => i.product.product_id))
        );
      }
      if (wishlist.status === "fulfilled" && wishlist.value) {
        setWishlistProductIds(
          new Set(wishlist.value.map((i) => i.product.product_id))
        );
      }
      if (favorites.status === "fulfilled" && favorites.value) {
        setFavoriteProductIds(
          new Set(favorites.value.map((i) => i.product.product_id))
        );
      }
    } catch {
      // Non-fatal — sets stay empty
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  // Fetch when user logs in
  useEffect(() => {
    if (isLoggedIn && user?.user_id) {
      fetchAll(user.user_id);
    } else {
      // Logged out — clear all sets
      setCartProductIds(new Set());
      setWishlistProductIds(new Set());
      setFavoriteProductIds(new Set());
    }
  }, [isLoggedIn, user?.user_id, fetchAll]);

  // ── Optimistic updaters ────────────────────────────────────────────────────

  const markInCart = useCallback((productId: number) => {
    setCartProductIds((prev) => new Set([...prev, productId]));
  }, []);

  const markInWishlist = useCallback((productId: number) => {
    setWishlistProductIds((prev) => new Set([...prev, productId]));
  }, []);

  const markInFavorites = useCallback((productId: number) => {
    setFavoriteProductIds((prev) => new Set([...prev, productId]));
  }, []);

  const unmarkFromCart = useCallback((productId: number) => {
    setCartProductIds((prev) => { const s = new Set(prev); s.delete(productId); return s; });
  }, []);

  const unmarkFromWishlist = useCallback((productId: number) => {
    setWishlistProductIds((prev) => { const s = new Set(prev); s.delete(productId); return s; });
  }, []);

  const unmarkFromFavorites = useCallback((productId: number) => {
    setFavoriteProductIds((prev) => { const s = new Set(prev); s.delete(productId); return s; });
  }, []);

  const refresh = useCallback(async () => {
    if (user?.user_id) await fetchAll(user.user_id);
  }, [user?.user_id, fetchAll]);

  return (
    <UserDataContext.Provider
      value={{
        cartProductIds,
        wishlistProductIds,
        favoriteProductIds,
        loading,
        markInCart,
        markInWishlist,
        markInFavorites,
        unmarkFromCart,
        unmarkFromWishlist,
        unmarkFromFavorites,
        refresh,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useUserData() {
  return useContext(UserDataContext);
}
