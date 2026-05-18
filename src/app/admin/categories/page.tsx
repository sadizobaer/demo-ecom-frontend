"use client";

import useSWR from "swr";
import { useState } from "react";
import { adminCategoryApi } from "@/lib/api/admin";
import type { CreateCategoryFormPayload } from "@/lib/api/admin";
import type { Category, UpdateCategoryPayload } from "@/types";

const fetchCategories = () => adminCategoryApi.getAll();

function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-all">
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

// ── Create form — requires a File upload ────────────────────
function CategoryCreateForm({ onSubmit, loading }: {
  onSubmit: (data: CreateCategoryFormPayload) => Promise<void>;
  loading: boolean;
}) {
  const [name, setName] = useState("");
  const [image, setImage] = useState<File | undefined>();
  const inputCls = "w-full px-3 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-primary)] text-sm placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] transition-colors";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return;
    onSubmit({ name, image });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Category Name *</label>
        <input id="category-form-name" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Electronics" className={inputCls} />
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Category Image *</label>
        <input id="category-form-image" type="file" accept="image/*" required onChange={e => setImage(e.target.files?.[0])}
          className={`${inputCls} file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-[var(--accent-light)] file:text-[var(--accent)] file:text-xs file:font-medium cursor-pointer`} />
      </div>
      <button id="category-form-submit" type="submit" disabled={loading}
        className="w-full py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed">
        {loading ? "Saving…" : "Save Category"}
      </button>
    </form>
  );
}

// ── Edit form — name only (no image re-upload on update) ────
function CategoryEditForm({ initial, onSubmit, loading }: {
  initial: Category;
  onSubmit: (data: UpdateCategoryPayload) => Promise<void>;
  loading: boolean;
}) {
  const [name, setName] = useState(initial.name);
  const inputCls = "w-full px-3 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-primary)] text-sm placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] transition-colors";
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit({ name }); }} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Category Name *</label>
        <input value={name} onChange={e => setName(e.target.value)} required className={inputCls} />
      </div>
      <button type="submit" disabled={loading}
        className="w-full py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed">
        {loading ? "Saving…" : "Update Category"}
      </button>
    </form>
  );
}

export default function AdminCategoriesPage() {
  const { data: rawCategories, isLoading, error, mutate } = useSWR<Category[]>(
    "admin-categories", fetchCategories, { refreshInterval: 30000 }
  );

  // Guard: always ensure an array even if backend shape changes
  const categories: Category[] = Array.isArray(rawCategories) ? rawCategories : [];

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreate = async (data: CreateCategoryFormPayload) => {
    setSubmitting(true);
    try {
      await adminCategoryApi.create(data);
      await mutate();
      setCreateOpen(false);
      showToast("success", "Category created!");
    } catch (e) { showToast("error", `Error: ${e}`); }
    finally { setSubmitting(false); }
  };

  const handleEdit = async (data: UpdateCategoryPayload) => {
    if (!editTarget) return;
    setSubmitting(true);
    try {
      await adminCategoryApi.update(editTarget.category_id, data);
      await mutate();
      setEditTarget(null);
      showToast("success", "Category updated!");
    } catch (e) { showToast("error", `Error: ${e}`); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    setSubmitting(true);
    try {
      await adminCategoryApi.delete(deleteId);
      await mutate();
      setDeleteId(null);
      showToast("success", "Category deleted.");
    } catch (e) { showToast("error", `Error: ${e}`); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">Categories</h2>
          <p className="text-[var(--text-secondary)] text-sm mt-1">{categories.length} total</p>
        </div>
        <button id="admin-categories-create-btn" onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-sm transition-all shadow-lg shadow-[var(--accent)]/20 self-start sm:self-auto">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Category
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-[var(--danger)]/40 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">
          ⚠️ Could not load categories. Check your backend connection.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 bg-[var(--surface)] border border-[var(--border)] rounded-2xl animate-pulse" />
            ))
          : categories.length === 0
          ? <p className="col-span-full text-center text-[var(--text-secondary)] text-sm py-16">No categories yet. Create one to get started.</p>
          : categories.map((cat) => (
              <div key={cat.category_id} id={`category-card-${cat.category_id}`}
                className="group bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 flex items-center gap-4 hover:border-[var(--accent)]/40 transition-all duration-200">
                <div className="w-12 h-12 rounded-xl bg-[var(--surface-2)] overflow-hidden flex-shrink-0">
                  {cat.image_url?.startsWith("http") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--accent)] text-lg font-bold">
                      {cat.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[var(--text-primary)] truncate">{cat.name}</p>
                  <p className="text-xs text-[var(--text-secondary)]">ID: {cat.category_id}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button id={`edit-category-${cat.category_id}`} onClick={() => setEditTarget(cat)}
                    className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)] transition-all">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button id={`delete-category-${cat.category_id}`} onClick={() => setDeleteId(cat.category_id)}
                    className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-all">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
      </div>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Add Category">
        <CategoryCreateForm onSubmit={handleCreate} loading={submitting} />
      </Modal>

      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Category">
        {editTarget && <CategoryEditForm initial={editTarget} onSubmit={handleEdit} loading={submitting} />}
      </Modal>

      <Modal isOpen={deleteId !== null} onClose={() => setDeleteId(null)} title="Confirm Delete">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-[var(--danger)]/10 flex items-center justify-center mx-auto">
            <svg className="h-7 w-7 text-[var(--danger)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <p className="text-[var(--text-primary)] font-semibold">Delete this category?</p>
          <p className="text-[var(--text-secondary)] text-sm">Products linked to it may be affected.</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] text-sm font-medium">Cancel</button>
            <button onClick={handleDelete} disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-[var(--danger)] text-white text-sm font-semibold disabled:opacity-50">
              {submitting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </Modal>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-medium ${toast.type === "success" ? "bg-[var(--success)] text-white" : "bg-[var(--danger)] text-white"}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
