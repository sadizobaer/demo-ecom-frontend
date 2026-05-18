"use client";

import useSWR from "swr";
import { useState } from "react";
import { adminProductApi, adminCategoryApi } from "@/lib/api/admin";
import type { CreateProductFormPayload } from "@/lib/api/admin";
import type { Product, Category, UpdateProductPayload } from "@/types";
import Image from "next/image";

// SWR fetchers
const fetchProducts = () => adminProductApi.getAll();
const fetchCategories = () => adminCategoryApi.getAll();

// ===== Modal =====
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-lg bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-all"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ===== Product Form =====
interface CreateFormState {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: number;
  image?: File;
}
interface EditFormState {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: number;
}

function ProductCreateForm({ categories, onSubmit, loading }: {
  categories: Category[];
  onSubmit: (data: CreateProductFormPayload) => Promise<void>;
  loading: boolean;
}) {
  const [form, setForm] = useState<CreateFormState>({ name: "", description: "", price: 0, stock: 0, category: 0 });
  const inputCls = "w-full px-3 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-primary)] text-sm placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] transition-colors";

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: (name === "price" || name === "stock" || name === "category") ? Number(value) : value }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image) return;
    onSubmit({ name: form.name, description: form.description, price: form.price, stock: form.stock, category: form.category, image: form.image });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div><label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Product Name *</label>
        <input id="product-form-name" name="name" value={form.name} onChange={handle} required placeholder="e.g. Wireless Headphones" className={inputCls} /></div>
      <div><label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Description</label>
        <textarea id="product-form-description" name="description" value={form.description} onChange={handle} rows={3} placeholder="Short description..." className={`${inputCls} resize-none`} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Price ($) *</label>
          <input id="product-form-price" name="price" type="number" min="0" step="0.01" value={form.price} onChange={handle} required className={inputCls} /></div>
        <div><label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Stock *</label>
          <input id="product-form-stock" name="stock" type="number" min="0" value={form.stock} onChange={handle} required className={inputCls} /></div>
      </div>
      <div><label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Product Image *</label>
        <input id="product-form-image" name="image" type="file" accept="image/*" required onChange={e => setForm(p => ({ ...p, image: e.target.files?.[0] }))} className={`${inputCls} file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-[var(--accent-light)] file:text-[var(--accent)] file:text-xs file:font-medium cursor-pointer`} /></div>
      <div><label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Category *</label>
        <select id="product-form-category" name="category" value={form.category} onChange={handle} required className={inputCls}>
          <option value={0} disabled>Select a category...</option>
          {categories.map(cat => <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>)}
        </select></div>
      <button id="product-form-submit" type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2">
        {loading ? "Saving…" : "Save Product"}
      </button>
    </form>
  );
}

function ProductEditForm({ initial, categories, onSubmit, loading }: {
  initial: Product;
  categories: Category[];
  onSubmit: (data: UpdateProductPayload) => Promise<void>;
  loading: boolean;
}) {
  const [form, setForm] = useState<EditFormState>({ name: initial.name, description: initial.description, price: initial.price, stock: initial.stock, category: initial.category?.category_id ?? 0 });
  const inputCls = "w-full px-3 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-primary)] text-sm placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] transition-colors";
  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: (name === "price" || name === "stock" || name === "category") ? Number(value) : value }));
  };
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div><label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Product Name *</label>
        <input name="name" value={form.name} onChange={handle} required className={inputCls} /></div>
      <div><label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Description</label>
        <textarea name="description" value={form.description} onChange={handle} rows={3} className={`${inputCls} resize-none`} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Price ($) *</label>
          <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handle} required className={inputCls} /></div>
        <div><label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Stock *</label>
          <input name="stock" type="number" min="0" value={form.stock} onChange={handle} required className={inputCls} /></div>
      </div>
      <div><label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Category *</label>
        <select name="category" value={form.category} onChange={handle} required className={inputCls}>
          <option value={0} disabled>Select a category...</option>
          {categories.map(cat => <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>)}
        </select></div>
      <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2">
        {loading ? "Saving…" : "Update Product"}
      </button>
    </form>
  );
}

// ===== Delete Confirm =====
function DeleteConfirm({
  product,
  onConfirm,
  onCancel,
  loading,
}: {
  product: Product;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="text-center space-y-4">
      <div className="w-14 h-14 rounded-full bg-[var(--danger)]/10 flex items-center justify-center mx-auto">
        <svg className="h-7 w-7 text-[var(--danger)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </div>
      <div>
        <p className="text-[var(--text-primary)] font-semibold">Delete &quot;{product.name}&quot;?</p>
        <p className="text-[var(--text-secondary)] text-sm mt-1">This action cannot be undone.</p>
      </div>
      <div className="flex gap-3">
        <button
          id="delete-confirm-cancel"
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm font-medium transition-all"
        >
          Cancel
        </button>
        <button
          id="delete-confirm-ok"
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl bg-[var(--danger)] hover:bg-red-600 text-white text-sm font-semibold transition-all disabled:opacity-50"
        >
          {loading ? "Deleting…" : "Delete"}
        </button>
      </div>
    </div>
  );
}

// ===== Main Page =====
export default function AdminProductsPage() {
  const { data: rawProducts, isLoading, error, mutate } = useSWR<Product[]>("admin-products", fetchProducts, { refreshInterval: 30000 });
  const { data: rawCategories } = useSWR<Category[]>("admin-categories", fetchCategories);

  // Guard: SWR data may be undefined or non-array during hydration
  const products: Product[] = Array.isArray(rawProducts) ? rawProducts : [];
  const categories: Category[] = Array.isArray(rawCategories) ? rawCategories : [];

  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (data: CreateProductFormPayload) => {
    setSubmitting(true);
    try {
      await adminProductApi.create(data);
      await mutate();
      setCreateOpen(false);
      showToast("success", "Product created successfully!");
    } catch (e) {
      showToast("error", `Failed to create: ${e}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (data: UpdateProductPayload) => {
    if (!editTarget) return;
    setSubmitting(true);
    try {
      await adminProductApi.update(editTarget.product_id, data);
      await mutate();
      setEditTarget(null);
      showToast("success", "Product updated successfully!");
    } catch (e) {
      showToast("error", `Failed to update: ${e}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await adminProductApi.delete(deleteTarget.product_id);
      await mutate();
      setDeleteTarget(null);
      showToast("success", "Product deleted.");
    } catch (e) {
      showToast("error", `Failed to delete: ${e}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Products</h2>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            {products.length} total products
          </p>
        </div>
        <button
          id="admin-products-create-btn"
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-sm transition-all shadow-lg shadow-[var(--accent)]/20 self-start sm:self-auto"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          id="admin-products-search"
          type="text"
          placeholder="Search products or categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] text-sm placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-[var(--danger)]/40 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
          ⚠️ Failed to load products. Is the Go server running?
        </div>
      )}

      {/* Table */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface-2)]">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Product
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Category
                </th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Price
                </th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4" colSpan={5}>
                      <div className="h-4 bg-[var(--surface-2)] rounded-lg w-3/4" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-[var(--text-secondary)]">
                    {search ? `No products match "${search}"` : "No products yet. Click Add Product to get started."}
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr
                    key={product.product_id}
                    id={`product-row-${product.product_id}`}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[var(--surface-2)] overflow-hidden flex-shrink-0">
                          {product.image_url?.startsWith("http") ? (
                            <Image
                              src={product.image_url}
                              alt={product.name}
                              width={40}
                              height={40}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[var(--text-secondary)] opacity-40">
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-primary)] truncate max-w-[180px]">
                            {product.name}
                          </p>
                          <p className="text-xs text-[var(--text-secondary)] line-clamp-1">
                            {product.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--text-secondary)] text-xs">
                        {product.category?.name ?? "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-[var(--accent)]">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          product.stock > 0
                            ? "bg-[var(--success)]/10 text-[var(--success)]"
                            : "bg-[var(--danger)]/10 text-[var(--danger)]"
                        }`}
                      >
                        {product.stock > 0 ? product.stock : "Out"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          id={`edit-product-${product.product_id}`}
                          onClick={() => setEditTarget(product)}
                          className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)] transition-all"
                          aria-label="Edit product"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          id={`delete-product-${product.product_id}`}
                          onClick={() => setDeleteTarget(product)}
                          className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-all"
                          aria-label="Delete product"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile card list */}
        <div className="md:hidden divide-y divide-[var(--border)]">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 animate-pulse space-y-2">
                <div className="h-4 bg-[var(--surface-2)] rounded w-2/3" />
                <div className="h-3 bg-[var(--surface-2)] rounded w-1/3" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <p className="px-5 py-12 text-center text-[var(--text-secondary)] text-sm">
              {search ? `No results for "${search}"` : "No products yet."}
            </p>
          ) : (
            filtered.map((product) => (
              <div key={product.product_id} className="p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[var(--surface-2)] overflow-hidden flex-shrink-0">
                  {product.image_url?.startsWith("http") && (
                    <Image src={product.image_url} alt={product.name} width={48} height={48} className="object-cover w-full h-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--text-primary)] text-sm truncate">{product.name}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{product.category?.name} · ${product.price.toFixed(2)}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${product.stock > 0 ? "bg-[var(--success)]/10 text-[var(--success)]" : "bg-[var(--danger)]/10 text-[var(--danger)]"}`}>
                    {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                  </span>
                </div>
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button
                    id={`mobile-edit-product-${product.product_id}`}
                    onClick={() => setEditTarget(product)}
                    className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)] transition-all"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    id={`mobile-delete-product-${product.product_id}`}
                    onClick={() => setDeleteTarget(product)}
                    className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-all"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Add New Product">
        <ProductCreateForm categories={categories} onSubmit={handleCreate} loading={submitting} />
      </Modal>

      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Product">
        {editTarget && (
          <ProductEditForm
            initial={editTarget}
            categories={categories}
            onSubmit={handleEdit}
            loading={submitting}
          />
        )}
      </Modal>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Confirm Delete">
        {deleteTarget && (
          <DeleteConfirm
            product={deleteTarget}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
            loading={submitting}
          />
        )}
      </Modal>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-medium transition-all ${
            toast.type === "success"
              ? "bg-[var(--success)] text-white"
              : "bg-[var(--danger)] text-white"
          }`}
        >
          {toast.type === "success" ? (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
}
