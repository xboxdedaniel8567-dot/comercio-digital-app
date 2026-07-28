"use client";

import { useState } from "react";
import { Lightbox } from "@/components/Lightbox";

type ProductImage = {
  url: string;
  alt_text: string | null;
};

type ProductGalleryProps = {
  images: ProductImage[];
  productName: string;
};

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const selectedImage = images[selectedIndex] ?? null;

  return (
    <>
      <section aria-label={`Galeria de ${productName}`} className="product-gallery">
        <div className="product-gallery-main">
          {selectedImage ? (
            <button
              aria-label={`Abrir imagen ${selectedIndex + 1} en pantalla completa`}
              className="product-gallery-main-button"
              onClick={() => setLightboxIndex(selectedIndex)}
              type="button"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={selectedImage.alt_text ?? productName}
                decoding="async"
                src={selectedImage.url}
              />
            </button>
          ) : (
            <div className="product-gallery-empty">
              <strong>Imagen por confirmar</strong>
              <span>La tienda aun no ha agregado fotografias.</span>
            </div>
          )}
          {images.length > 1 ? (
            <span className="product-gallery-count">
              {selectedIndex + 1} / {images.length}
            </span>
          ) : null}
        </div>
        {images.length > 1 ? (
          <div aria-label="Seleccionar imagen" className="product-gallery-thumbnails">
            {images.map((image, index) => (
              <button
                aria-label={`Ver imagen ${index + 1} de ${productName}`}
                aria-pressed={selectedIndex === index}
                className="product-gallery-thumbnail"
                key={`${image.url}-${index}`}
                onClick={() => setSelectedIndex(index)}
                type="button"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="" loading="lazy" src={image.url} />
              </button>
            ))}
          </div>
        ) : null}
      </section>
      {lightboxIndex !== null && images.length > 0 ? (
        <Lightbox
          images={images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      ) : null}
    </>
  );
}
