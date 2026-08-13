"use client";

import { useEffect, useState } from "react";

type CommerceImageProps = {
  alt: string;
  src?: string | null;
  fallbackLabel?: string;
  loading?: "eager" | "lazy";
  sizes?: string;
  className?: string;
};

function initials(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toLocaleUpperCase("es-CO") || "CD";
}

export function CommerceImage({
  alt,
  className = "",
  fallbackLabel,
  loading = "lazy",
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
  src,
}: CommerceImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [src]);

  if (!src || failed) {
    return (
      <span
        aria-label={alt}
        className={["cd-commerce-image", "cd-commerce-image-fallback", className].filter(Boolean).join(" ")}
        role="img"
      >
        <span aria-hidden="true">{initials(fallbackLabel ?? alt)}</span>
      </span>
    );
  }

  return (
    // Vinext/Cloudflare currently serves remote Storage URLs reliably through native img.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt}
      className={["cd-commerce-image", className].filter(Boolean).join(" ")}
      decoding="async"
      loading={loading}
      onError={() => setFailed(true)}
      sizes={sizes}
      src={src}
    />
  );
}
