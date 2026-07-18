"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { validateProductImage } from "@/lib/product-image-upload";

type ProductImageInputProps = {
  disabled?: boolean;
  file: File | null;
  imageUrl: string;
  onFileChange: (file: File | null) => void;
  onUrlChange: (value: string) => void;
  onValidationError: (message: string) => void;
};

export function ProductImageInput({
  disabled = false,
  file,
  imageUrl,
  onFileChange,
  onUrlChange,
  onValidationError,
}: ProductImageInputProps) {
  const [previewUrl, setPreviewUrl] = useState(imageUrl);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(imageUrl);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file, imageUrl]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0] ?? null;

    if (!selectedFile) {
      onFileChange(null);
      return;
    }

    const validationError = validateProductImage(selectedFile);

    if (validationError) {
      event.target.value = "";
      onFileChange(null);
      onValidationError(validationError);
      return;
    }

    onValidationError("");
    onFileChange(selectedFile);
  }

  return (
    <div className="card" style={{ display: "grid", gap: 12, padding: 16 }}>
      <div>
        <strong>Foto del producto</strong>
        <p className="muted" style={{ margin: "4px 0 0" }}>
          Elige una imagen JPG, PNG o WebP de hasta 5 MB.
        </p>
      </div>
      <input
        accept="image/jpeg,image/png,image/webp"
        className="input"
        disabled={disabled}
        onChange={handleFileChange}
        type="file"
      />
      {previewUrl ? (
        <img
          alt="Vista previa del producto"
          src={previewUrl}
          style={{
            aspectRatio: "4 / 3",
            border: "1px solid var(--line)",
            maxWidth: 320,
            objectFit: "contain",
            width: "100%",
          }}
        />
      ) : null}
      <details>
        <summary className="muted" style={{ cursor: "pointer" }}>
          Usar un enlace de imagen en su lugar
        </summary>
        <input
          className="input"
          disabled={disabled || Boolean(file)}
          onChange={(event) => onUrlChange(event.target.value)}
          placeholder="https://ejemplo.com/imagen.webp"
          style={{ marginTop: 10 }}
          type="url"
          value={imageUrl}
        />
      </details>
    </div>
  );
}
