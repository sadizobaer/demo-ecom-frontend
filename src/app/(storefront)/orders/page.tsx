"use client";

/**
 * Orders Page — requires login.
 */

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { orderApi } from "@/lib/api/storefront";
import EmptyState from "@/components/shared/EmptyState";
import type { Order } from "@/types";

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-[var(--warning)]/10 text-[var(--warning)]",
  confirmed: "bg-blue-500/10 text-blue-400",
  processing: "bg-[var(--info)]/10 text-[var(--info)]",
  shipped: "bg-purple-500/10 text-purple-400",
  delivered: "bg-[var(--success)]/10 text-[var(--success)]",
  cancelled: "bg-[var(--danger)]/10 text-[var(--danger)]",
};

function statusClass(status: string) {
  return STATUS_COLOR[status.toLowerCase()] ?? "bg-[var(--surface-2)] text-[var(--text-secondary)]";
}

export default function OrdersPage() {
  const { isLoggedIn } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); return; }
    orderApi
      .getByUser()
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">My Orders</h1>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
          <EmptyState
            icon="orders"
            title="Sign in to view your orders"
            description="Track your orders and purchase history by signing in."
            action={{ label: "Sign In", href: "/login" }}
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">My Orders</h1>
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
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">My Orders</h1>
        {orders.length > 0 && (
          <p className="text-[var(--text-secondary)] mt-2">{orders.length} order{orders.length !== 1 ? "s" : ""} total</p>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
          <EmptyState
            icon="orders"
            title="No orders yet"
            description="Once you place an order, you can track it here."
            action={{ label: "Start Shopping", href: "/products" }}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const itemCount = order.items?.length ?? 0;
            return (
              <div
                key={order.order_id}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden"
              >
                {/* Order header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-xs text-[var(--text-secondary)]">Order ID</p>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">#{order.order_id}</p>
                    </div>
                    <div className="h-6 w-px bg-[var(--border)]" />
                    <div>
                      <p className="text-xs text-[var(--text-secondary)]">Items</p>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{itemCount}</p>
                    </div>
                    <div className="h-6 w-px bg-[var(--border)]" />
                    <div>
                      <p className="text-xs text-[var(--text-secondary)]">Total</p>
                      <p className="text-sm font-bold text-[var(--accent)]">${order.total_amount?.toFixed(2) ?? "0.00"}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                {/* Order items */}
                {order.items && order.items.length > 0 && (
                  <div className="divide-y divide-[var(--border)]">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 px-6 py-3">
                        {item.product?.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                            className="w-10 h-10 rounded-lg object-cover bg-[var(--surface-2)]"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-[var(--surface-2)] flex items-center justify-center">
                            <svg className="h-5 w-5 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                            </svg>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--text-primary)] truncate">{item.product?.name ?? "Product"}</p>
                          <p className="text-xs text-[var(--text-secondary)]">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">
                          ${((item.product?.price ?? 0) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
