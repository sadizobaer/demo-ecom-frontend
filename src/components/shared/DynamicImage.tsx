"use client";

import Image, { ImageProps } from "next/image";
import { useState, useMemo } from "react";

interface DynamicImageProps extends Omit<ImageProps, "src"> {
  src?: string | null;
  fallbackIcon?: React.ReactNode;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export default function DynamicImage({
  src,
  alt,
  fallbackIcon,
  className,
  onError,
  ...props
}: DynamicImageProps) {
  const [hasError, setHasError] = useState(false);

  const imgSrc = useMemo(() => {
    if (!src) return null;

    if (src.startsWith("http") || src.startsWith("https")) {
      return src;
    }

    // Normalize: strip ./ and ensure it starts with /
    let normalized = src;
    if (normalized.startsWith("./")) normalized = normalized.substring(1); // keep the slash if it was ./
    if (!normalized.startsWith("/")) normalized = "/" + normalized;

    // If it's an /uploads path, we return it as a relative URL.
    // Our middleware (src/middleware.ts) will rewrite it to the backend.
    if (normalized.startsWith("/uploads")) {
      return normalized;
    }

    // For other paths, use the full API URL (legacy/fallback)
    if (normalized.startsWith("/")) {
      return normalized;
    }

    const separator = API_BASE_URL.endsWith("/") ? "" : "/";
    return `${API_BASE_URL}${separator}${normalized}`;
  }, [src]);

  const handleLocalError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    if (onError) onError(e);
  };

  if (hasError || !imgSrc) {
    return (
      <div className={`flex items-center justify-center bg-[var(--surface-2)] text-[var(--text-secondary)] ${className}`}>
        {fallbackIcon || (
          <svg className="h-12 w-12 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
      </div>
    );
  }

  return (
    <Image
      src={imgSrc}
      alt={alt || "Image"}
      className={className}
      onError={handleLocalError}
      {...props}
    />
  );
}
