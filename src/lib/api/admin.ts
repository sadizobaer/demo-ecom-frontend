/**
 * Admin API — privileged mutations for Products & Categories
 *
 * ALL calls use adminFetch(), which automatically injects:
 *   X-User-Type: admin
 *   Authorization: Bearer <token>  (throws ApiError 401 if missing)
 *
 * Create payloads use multipart/form-data with real File objects
 * because Go uses r.FormFile("image").
 *
 * Update payloads use JSON body (Go decodes with json.NewDecoder).
 */

import { adminFetch, storefrontFetch } from "./client";
import type {
  Category,
  CategoriesResponse,
  Product,
  ProductsResponse,
  UpdateCategoryPayload,
  UpdateProductPayload,
} from "@/types";

// ─────────────────────────────────────────────────────────────
// Create payload types (require a real File, not a URL string)
// ─────────────────────────────────────────────────────────────
export interface CreateProductFormPayload {
  name: string;
  description: string;
  price: number;
  stock: number;
  /** File selected by the user — sent via r.FormFile("image") */
  image: File;
  /** category_id integer */
  category: number;
}

export interface CreateCategoryFormPayload {
  name: string;
  /** File selected by the user — sent via r.FormFile("image") */
  image: File;
}

// ─────────────────────────────────────────────────────────────
// FormData builder — handles File values alongside primitives
// ─────────────────────────────────────────────────────────────
function toFormData(payload: Record<string, unknown>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    if (value instanceof File) {
      fd.append(key, value, value.name);
    } else if (value !== undefined && value !== null) {
      fd.append(key, String(value));
    }
  }
  return fd;
}

// ─────────────────────────────────────────────────────────────
// Admin Products
// ─────────────────────────────────────────────────────────────
export const adminProductApi = {
  /**
   * GET /products — public read, so uses storefrontFetch.
   * Returns unwrapped Product[] (Go returns { products: [...] }).
   */
  getAll: async (): Promise<Product[]> => {
    const res = await storefrontFetch<ProductsResponse>("/products");
    return res?.products ?? [];
  },

  /** POST /products/create — requires admin token */
  create: (payload: CreateProductFormPayload) =>
    adminFetch<{ message: string }>("/products/create", {
      method: "POST",
      formData: toFormData(payload as unknown as Record<string, unknown>),
    }),

  /** PUT /products/update/{id} — requires admin token, JSON body */
  update: (id: number, payload: UpdateProductPayload) =>
    adminFetch<{ message: string }>(`/products/update/${id}`, {
      method: "PUT",
      body: payload as unknown as Record<string, unknown>,
    }),

  /** DELETE /products/delete/{id} — requires admin token */
  delete: (id: number) =>
    adminFetch<string>(`/products/delete/${id}`, { method: "DELETE" }),
};

// ─────────────────────────────────────────────────────────────
// Admin Categories
// ─────────────────────────────────────────────────────────────
export const adminCategoryApi = {
  /**
   * GET /categories — public read, so uses storefrontFetch.
   * Returns unwrapped Category[] (Go returns { categories: [...] }).
   */
  getAll: async (): Promise<Category[]> => {
    const res = await storefrontFetch<CategoriesResponse>("/categories");
    return res?.categories ?? [];
  },

  /** POST /categories/create — requires admin token */
  create: (payload: CreateCategoryFormPayload) =>
    adminFetch<{ message: string }>("/categories/create", {
      method: "POST",
      formData: toFormData(payload as unknown as Record<string, unknown>),
    }),

  /** PUT /categories/update/{id} — requires admin token, JSON body */
  update: (id: number, payload: UpdateCategoryPayload) =>
    adminFetch<{ message: string }>(`/categories/update/${id}`, {
      method: "PUT",
      body: payload as unknown as Record<string, unknown>,
    }),

  /** DELETE /categories/delete/{id} — requires admin token */
  delete: (id: number) =>
    adminFetch<string>(`/categories/delete/${id}`, { method: "DELETE" }),
};
