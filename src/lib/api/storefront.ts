/**
 * Storefront API — public + authenticated user endpoints
 *
 * ALL calls use storefrontFetch(), which automatically injects:
 *   X-User-Type: user
 *   Authorization: Bearer <token>  (only if logged in)
 *
 * Response unwrapping:
 *   GET /products   → { products: Product[] }  → returns Product[]
 *   GET /categories → { categories: Category[] } → returns Category[]
 */

import { storefrontFetch } from "./client";
import type {
  AuthTokens,
  Cart,
  Category,
  CategoriesResponse,
  CreateOrderPayload,
  FavoriteItem,
  FavoritePayload,
  LoginPayload,
  Order,
  Product,
  ProductsResponse,
  RegisterPayload,
  RemoveFromCartPayload,
  UpdateCartPayload,
  WishlistItem,
  WishlistPayload,
  AddToCartPayload,
} from "@/types";

// =================== AUTH ===================
// Auth calls omit X-User-Type — they're pre-auth

export const authApi = {
  register: (payload: RegisterPayload) =>
    storefrontFetch<{ message: string }>("/register", {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
      multipart: true,
    }),

  login: (payload: LoginPayload) =>
    storefrontFetch<AuthTokens>("/login", {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
      multipart: true,
    }),
};

// =================== CATEGORIES ===================

export const categoryApi = {
  /** Public — no token required. Returns unwrapped Category[]. */
  getAll: async (): Promise<Category[]> => {
    const res = await storefrontFetch<CategoriesResponse>("/categories", {
      nextOptions: { next: { revalidate: 300 } },
    });
    return res?.categories ?? [];
  },

  getById: (id: number | string) =>
    storefrontFetch<Category>(`/categories/${id}`, {
      nextOptions: { next: { revalidate: 300 } },
    }),
};

// =================== PRODUCTS ===================

export const productApi = {
  /** Public — no token required. Returns unwrapped Product[]. */
  getAll: async (): Promise<Product[]> => {
    const res = await storefrontFetch<ProductsResponse>("/products", {
      nextOptions: { next: { revalidate: 60 } },
    });
    return res?.products ?? [];
  },

  getById: (id: number | string) =>
    storefrontFetch<Product>(`/products/${id}`, {
      nextOptions: { next: { revalidate: 60 } },
    }),
};

// =================== CART ===================
// Requires auth token (injected automatically if logged in)

export const cartApi = {
  get: () => storefrontFetch<Cart>("/cart"),

  add: (payload: AddToCartPayload) =>
    storefrontFetch<{ message: string }>("/cart/add", {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
      multipart: true,
    }),

  update: (payload: UpdateCartPayload) =>
    storefrontFetch<{ message: string }>("/cart/update", {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
      multipart: true,
    }),

  remove: (payload: RemoveFromCartPayload) =>
    storefrontFetch<{ message: string }>("/cart/remove", {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
      multipart: true,
    }),
};

// =================== WISHLIST ===================

export const wishlistApi = {
  get: () => storefrontFetch<WishlistItem[]>("/wishlist"),

  add: (payload: WishlistPayload) =>
    storefrontFetch<{ message: string }>("/wishlist/add", {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
      multipart: true,
    }),

  remove: (payload: WishlistPayload) =>
    storefrontFetch<{ message: string }>("/wishlist/remove", {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
      multipart: true,
    }),
};

// =================== FAVORITES ===================

export const favoriteApi = {
  get: () => storefrontFetch<FavoriteItem[]>("/favorites"),

  add: (payload: FavoritePayload) =>
    storefrontFetch<{ message: string }>("/favorites/add", {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
      multipart: true,
    }),

  remove: (payload: FavoritePayload) =>
    storefrontFetch<{ message: string }>("/favorites/remove", {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
      multipart: true,
    }),
};

// =================== ORDERS ===================

export const orderApi = {
  getByUser: () => storefrontFetch<Order[]>("/orders"),

  create: (payload: CreateOrderPayload) =>
    storefrontFetch<{ message: string }>("/orders/create", {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
      multipart: true,
    }),
};
