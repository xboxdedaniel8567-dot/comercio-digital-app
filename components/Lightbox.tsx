"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type LightboxImage = {
  url: string;
  alt_text: string | null;
};

type LightboxProps = {
  images: LightboxImage[];
  initialIndex: number;
  onClose: () => void;
};

export function Lightbox({ images, initialIndex, onClose }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(true);
  const [zoomed, setZoomed] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const goNext = useCallback(() => {
    setIsLoading(true);
    setZoomed(false);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setIsLoading(true);
    setZoomed(false);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") handleClose();
      else if (event.key === "ArrowRight") goNext();
      else if (event.key === "ArrowLeft") goPrev();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev, handleClose]);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  function handleTouchStart(event: React.TouchEvent) {
    touchStartX.current = event.touches[0].clientX;
  }

  function handleTouchMove(event: React.TouchEvent) {
    touchEndX.current = event.touches[0].clientX;
  }

  function handleTouchEnd() {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  }

  const currentImage = images[currentIndex];

  return (
    <div
      className="lightbox"
      onClick={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Imagen ${currentIndex + 1} de ${images.length}`}
    >
      <button
        aria-label="Cerrar visor"
        className="lightbox-close"
        onClick={handleClose}
        ref={closeButtonRef}
        type="button"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>

      {images.length > 1 ? (
        <>
          <button
            aria-label="Imagen anterior"
            className="lightbox-nav lightbox-prev"
            onClick={goPrev}
            type="button"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            aria-label="Imagen siguiente"
            className="lightbox-nav lightbox-next"
            onClick={goNext}
            type="button"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </>
      ) : null}

      <div className="lightbox-content" onClick={() => setZoomed((z) => !z)}>
        {isLoading ? <div className="lightbox-placeholder" aria-hidden="true" /> : null}
        {currentImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={currentImage.alt_text ?? `Imagen ${currentIndex + 1}`}
            className={`lightbox-img ${zoomed ? "lightbox-img-zoomed" : ""} ${isLoading ? "lightbox-img-loading" : ""}`}
            decoding="async"
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
            src={currentImage.url}
          />
        ) : null}
      </div>

      {images.length > 1 ? (
        <span className="lightbox-counter">
          {currentIndex + 1} de {images.length}
        </span>
      ) : null}
    </div>
  );
}
