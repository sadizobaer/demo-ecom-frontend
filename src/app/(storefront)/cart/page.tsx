"use client";

/**
 * Cart Page — requires login.
 * If not logged in → shows a prompt to sign in.
 * If logged in but cart is empty → EmptyState.
 */

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserData } from "@/contexts/UserDataContext";
import { cartApi, orderApi } from "@/lib/api/storefront";
import EmptyState from "@/components/shared/EmptyState";
import type { Cart } from "@/types";

export default function CartPage() {
  const { isLoggedIn, user } = useAuth();
  const { unmarkFromCart } = useUserData();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [error, setError] = useState("");

  const fetchCart = async () => {
    try {
      const data = await cartApi.get(Number(user?.user_id) || 0);
      setCart(data);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const handleRemove = async (productId: number) => {
    try {
      await cartApi.remove({
        cart_id: cart?.cart_id ?? 0,
        product_id: productId,
      });
      unmarkFromCart(productId); // ← instantly clears ProductCard badge everywhere
      fetchCart();
    } catch {
      setError("Failed to remove item.");
    }
  };

  const handleUpdate = async (productId: number, qty: number) => {
    if (qty < 1) return;
    try {
      await cartApi.update({
        cart_id: cart?.cart_id ?? 0,
        product_id: productId,
        quantity: qty,
      });
      fetchCart();
    } catch {
      setError("Failed to update quantity.");
    }
  };

  const handlePlaceOrder = async () => {
    if (!cart) return;
    setPlacingOrder(true);
    setError("");
    try {
      await orderApi.create({
        user_id: Number(user?.user_id) || 0,
        cart_id: cart.cart_id,
      });
      setOrderSuccess(true);
      setCart(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order.");
    } finally {
      setPlacingOrder(false);
    }
  };

  /* ── Not logged in ─────────────────────────────────────────── */
  if (!isLoggedIn) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">Your Cart</h1>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
          <EmptyState
            icon="cart"
            title="Sign in to view your cart"
            description="Your cart items are saved when you're logged in."
            action={{
              label: "Sign In",
              onClick: () => { window.location.href = "/login"; },
            }}
          />
        </div>
      </div>
    );
  }

  /* ── Loading ───────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">Your Cart</h1>
        <div className="flex items-center justify-center py-32">
          <svg className="h-8 w-8 animate-spin text-[var(--accent)]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
      </div>
    );
  }

  /* ── Order placed success ──────────────────────────────────── */
  if (orderSuccess) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-[var(--success)]/10 flex items-center justify-center mb-6">
            <svg className="h-10 w-10 text-[var(--success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Order Placed!</h2>
          <p className="text-[var(--text-secondary)] mb-6">Your order has been successfully placed. Thank you for shopping with ShopWave!</p>
          <a href="/orders" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-sm transition-all">
            View My Orders
          </a>
        </div>
      </div>
    );
  }

  const items = cart?.items ?? [];
  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-14">
      <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-6 sm:mb-8">Your Cart</h1>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-[var(--danger)]/10 border border-[var(--danger)]/30 text-[var(--danger)] text-sm">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
          <EmptyState
            icon="cart"
            title="Your cart is empty"
            description="Browse our products and add something you love."
            action={{ label: "Browse Products", href: "/products" }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.product.product_id}
                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-[var(--surface)] border border-[var(--border)] rounded-2xl"
              >
                {/* Image */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[var(--surface-2)] flex-shrink-0">
                  {item.product.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--text-secondary)]">
                      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[var(--text-primary)] text-sm line-clamp-1">
                    {item.product.name}
                  </h3>
                  <p className="text-[var(--accent)] font-bold mt-0.5">
                    ${item.product.price.toFixed(2)}
                  </p>
                </div>

                {/* Qty controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdate(item.product.product_id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="w-7 h-7 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)]/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="w-8 text-center text-sm font-semibold text-[var(--text-primary)]">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleUpdate(item.product.product_id, item.quantity + 1)}
                    className="w-7 h-7 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)]/50 transition-all"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                {/* Line total — hidden on xs, shown sm+ */}
                <div className="hidden sm:block text-sm font-semibold text-[var(--text-primary)] w-20 text-right">
                  ৳{(item.product.price * item.quantity).toLocaleString()}
                </div>

                {/* Remove */}
                <button
                  onClick={() => handleRemove(item.product.product_id)}
                  aria-label="Remove item"
                  className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-all"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 sticky top-24">
              <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Subtotal ({items.length} item{items.length !== 1 ? "s" : ""})</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Shipping</span>
                  <span className="text-[var(--success)]">Free</span>
                </div>
                <div className="border-t border-[var(--border)] pt-2 mt-2 flex justify-between font-bold text-[var(--text-primary)]">
                  <span>Total</span>
                  <span className="text-[var(--accent)]">${total.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={placingOrder}
                id="cart-place-order-btn"
                className="mt-6 w-full py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-sm transition-all shadow-lg shadow-[var(--accent)]/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {placingOrder ? "Placing Order…" : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
