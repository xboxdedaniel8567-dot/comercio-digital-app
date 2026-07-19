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
    <div className="merchant-image-input">
      <div className="merchant-image-input-heading">
        <strong>Foto del producto</strong>
        <p className="muted">
          Elige una imagen JPG, PNG o WebP de hasta 5 MB.
        </p>
      </div>
      <div className="merchant-image-input-body">
        <div className="merchant-image-preview">
          {previewUrl ? (
            <img alt="Vista previa del producto" src={previewUrl} />
          ) : (
            <span>La vista previa aparecera aqui</span>
          )}
        </div>
        <div className="merchant-image-controls">
          <label className="merchant-field">
            <span>Seleccionar archivo</span>
            <input
              accept="image/jpeg,image/png,image/webp"
              className="input"
              disabled={disabled}
              onChange={handleFileChange}
              type="file"
            />
          </label>
          {file ? <small className="muted">Archivo: {file.name}</small> : null}
          <details>
            <summary className="muted">Usar un enlace de imagen</summary>
            <label className="merchant-field">
              <span>URL de la imagen</span>
              <input
                className="input"
                disabled={disabled || Boolean(file)}
                onChange={(event) => onUrlChange(event.target.value)}
                placeholder="https://ejemplo.com/imagen.webp"
                type="url"
                value={imageUrl}
              />
            </label>
          </details>
        </div>
      </div>
    </div>
  );
}
