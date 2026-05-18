"use client";

import DynamicImage from "@/components/shared/DynamicImage";
import Link from "next/link";
import type { Category } from "@/types";

interface Props {
  category: Category;
  /** If true, clicking the card navigates to /categories/{id} */
  linkable?: boolean;
  onClick?: (cat: Category) => void;
}

export default function CategoryCard({ category, linkable = true, onClick }: Props) {
  const inner = (
    <div className="group relative overflow-hidden rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[var(--accent)]/5 cursor-pointer aspect-[4/3]">
      {/* Background image */}
      <DynamicImage
        src={category.image_url}
        alt={category.name}
        fill
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        fallbackIcon={
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/30 via-[var(--surface-2)] to-[var(--surface)] flex items-center justify-center">
            <span className="text-4xl font-black text-[var(--accent)]/50">
              {category.name.charAt(0).toUpperCase()}
            </span>
          </div>
        }
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

      {/* Name label */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
        <h3 className="font-bold text-white text-base leading-tight drop-shadow-md">
          {category.name}
        </h3>
        <p className="text-white/60 text-xs mt-0.5 flex items-center gap-1">
          <span>Browse</span>
          <svg className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </p>
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button
        id={`category-card-${category.category_id}`}
        onClick={() => onClick(category)}
        className="block w-full text-left"
      >
        {inner}
      </button>
    );
  }

  if (linkable) {
    return (
      <Link
        id={`category-card-${category.category_id}`}
        href={`/categories/${category.category_id}`}
      >
        {inner}
      </Link>
    );
  }

  return (
    <div id={`category-card-${category.category_id}`}>
      {inner}
    </div>
  );
}
