"use client";

import { useState } from "react";
import { Lightbox } from "@/components/Lightbox";

type StoreGalleryImage = {
  url: string;
  alt: string;
};

type StoreGalleryLightboxProps = {
  images: StoreGalleryImage[];
};

export function StoreGalleryLightbox({ images }: StoreGalleryLightboxProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <div className="store-profile-gallery-scroll">
        {images.map((image, index) => (
          <button
            aria-label={`Abrir imagen ${index + 1} en pantalla completa`}
            className="store-profile-gallery-img-button"
            key={`${image.url}-${index}`}
            onClick={() => setLightboxIndex(index)}
            type="button"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={image.alt}
              className="store-profile-gallery-img"
              decoding="async"
              loading="lazy"
              src={image.url}
            />
          </button>
        ))}
      </div>
      {lightboxIndex !== null && images.length > 0 ? (
        <Lightbox
          images={images.map((img) => ({ url: img.url, alt_text: img.alt }))}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      ) : null}
    </>
  );
}
