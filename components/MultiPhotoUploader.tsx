"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { uploadImage, validateImage } from "@/lib/image-upload";

type UploadStatus = "pending" | "uploading" | "done" | "error";

type PhotoItem = {
  id: string;
  file: File;
  previewUrl: string;
  status: UploadStatus;
  publicUrl?: string;
  errorMessage?: string;
};

type ExistingImage = {
  id: string;
  url: string;
  alt_text?: string | null;
};

type MultiPhotoUploaderProps = {
  bucket: "product-images" | "business-images";
  pathPrefix: string;
  maxImages?: number;
  existingImages?: ExistingImage[];
  onUploaded?: (images: { url: string; alt_text: string }[]) => void;
  onValidationError?: (message: string) => void;
  label?: string;
  hint?: string;
  single?: boolean;
};

export function MultiPhotoUploader({
  bucket,
  pathPrefix,
  maxImages = 20,
  existingImages = [],
  onUploaded,
  onValidationError,
  label = "Fotografias",
  hint = "Selecciona hasta 20 imagenes JPG, PNG o WebP de 5 MB cada una.",
  single = false,
}: MultiPhotoUploaderProps) {
  const [items, setItems] = useState<PhotoItem[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0, failed: 0 });
  const [message, setMessage] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const effectiveMax = single ? 1 : maxImages;
  const totalSlots = existingImages.length + items.length;
  const remainingSlots = effectiveMax - totalSlots;

  useEffect(() => {
    return () => {
      items.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;
    const newFiles = Array.from(fileList);
    const validItems: PhotoItem[] = [];
    let firstError = "";

    for (const file of newFiles) {
      if (totalSlots + validItems.length >= effectiveMax) {
        firstError = `No puedes seleccionar mas de ${effectiveMax} ${effectiveMax === 1 ? "imagen" : "imagenes"}.`;
        break;
      }
      const error = validateImage(file);
      if (error) {
        if (!firstError) firstError = error;
        continue;
      }
      validItems.push({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
        file,
        previewUrl: URL.createObjectURL(file),
        status: "pending",
      });
    }

    if (validItems.length > 0) {
      setItems((prev) => [...prev, ...validItems]);
      setMessage("");
    }

    if (firstError) {
      setMessage(firstError);
      onValidationError?.(firstError);
    }

    if (inputRef.current) inputRef.current.value = "";
    if (cameraRef.current) cameraRef.current.value = "";
  }

  function removeItem(id: string) {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      const next = prev.filter((item) => item.id !== id);
      if (coverIndex >= next.length && next.length > 0) setCoverIndex(next.length - 1);
      return next;
    });
  }

  function clearAll() {
    items.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setItems([]);
    setCoverIndex(0);
    setMessage("");
    setProgress({ done: 0, total: 0, failed: 0 });
  }

  function handleDragStart(index: number) {
    setDraggedIndex(index);
  }

  function handleDragOver(event: React.DragEvent) {
    event.preventDefault();
  }

  function handleDrop(targetIndex: number) {
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(draggedIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    setDraggedIndex(null);
  }

  async function uploadAll() {
    const pending = items.filter((item) => item.status === "pending" || item.status === "error");
    if (pending.length === 0) {
      setMessage("No hay imagenes nuevas para subir.");
      return;
    }

    setIsUploading(true);
    setMessage("");
    setProgress({ done: 0, total: pending.length, failed: 0 });

    let done = 0;
    let failed = 0;
    const uploadedUrls: { url: string; alt_text: string }[] = [];

    for (const item of pending) {
      setItems((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, status: "uploading" as UploadStatus } : p)),
      );

      const result = await uploadImage(item.file, bucket, pathPrefix);

      if (result.error) {
        failed++;
        setItems((prev) =>
          prev.map((p) =>
            p.id === item.id ? { ...p, status: "error" as UploadStatus, errorMessage: result.error } : p,
          ),
        );
      } else {
        done++;
        uploadedUrls.push({ url: result.publicUrl, alt_text: "Imagen del comercio" });
        setItems((prev) =>
          prev.map((p) =>
            p.id === item.id
              ? { ...p, status: "done" as UploadStatus, publicUrl: result.publicUrl }
              : p,
          ),
        );
      }

      setProgress({ done, total: pending.length, failed });
    }

    setIsUploading(false);

    if (failed === 0) {
      setMessage(`${done} ${done === 1 ? "fotografia cargada" : "fotografias cargadas"}.`);
      onUploaded?.(uploadedUrls);
    } else if (done === 0) {
      setMessage(`No se pudieron cargar ${failed} ${failed === 1 ? "fotografia" : "fotografias"}.`);
    } else {
      setMessage(
        `${done} ${done === 1 ? "fotografia cargada" : "fotografias cargadas"}. ${failed} no ${failed === 1 ? "pudo cargarse" : "pudieron cargarse"}.`,
      );
      onUploaded?.(uploadedUrls);
    }
  }

  async function retryFailed() {
    const failedItems = items.filter((item) => item.status === "error");
    if (failedItems.length === 0) return;

    setIsUploading(true);
    setMessage("");
    setProgress({ done: 0, total: failedItems.length, failed: 0 });

    let done = 0;
    let failed = 0;
    const uploadedUrls: { url: string; alt_text: string }[] = [];

    for (const item of failedItems) {
      setItems((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, status: "uploading" as UploadStatus } : p)),
      );

      const result = await uploadImage(item.file, bucket, pathPrefix);

      if (result.error) {
        failed++;
        setItems((prev) =>
          prev.map((p) =>
            p.id === item.id ? { ...p, status: "error" as UploadStatus, errorMessage: result.error } : p,
          ),
        );
      } else {
        done++;
        uploadedUrls.push({ url: result.publicUrl, alt_text: "Imagen del comercio" });
        setItems((prev) =>
          prev.map((p) =>
            p.id === item.id
              ? { ...p, status: "done" as UploadStatus, publicUrl: result.publicUrl }
              : p,
          ),
        );
      }

      setProgress({ done, total: failedItems.length, failed });
    }

    setIsUploading(false);

    if (failed === 0) {
      setMessage(`Las ${done} fotografias se cargaron correctamente.`);
      onUploaded?.(uploadedUrls);
    } else {
      setMessage(`${done} cargadas, ${failed} siguen fallando.`);
      onUploaded?.(uploadedUrls);
    }
  }

  const hasPending = items.some((item) => item.status === "pending");
  const hasFailed = items.some((item) => item.status === "error");
  const allDone = items.length > 0 && items.every((item) => item.status === "done");

  return (
    <div className="photo-uploader">
      <div className="photo-uploader-heading">
        <strong>{label}</strong>
        <p className="muted">{hint}</p>
      </div>

      <div className="photo-uploader-actions">
        <label className="btn btn-dark photo-uploader-pick">
          Elegir imagenes
          <input
            ref={inputRef}
            accept="image/jpeg,image/png,image/webp"
            disabled={isUploading || remainingSlots <= 0}
            multiple={!single}
            onChange={(event: ChangeEvent<HTMLInputElement>) => addFiles(event.target.files)}
            type="file"
            hidden
          />
        </label>
        <label className="btn btn-dark photo-uploader-pick">
          Tomar foto
          <input
            ref={cameraRef}
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            disabled={isUploading || remainingSlots <= 0}
            multiple={!single}
            onChange={(event: ChangeEvent<HTMLInputElement>) => addFiles(event.target.files)}
            type="file"
            hidden
          />
        </label>
      </div>

      {items.length > 0 ? (
        <p className="photo-uploader-count">
          {items.length} de {effectiveMax} {effectiveMax === 1 ? "imagen" : "imagenes"} seleccionada{items.length === 1 ? "" : "s"}
        </p>
      ) : null}

      {message ? <p className="photo-uploader-message" role="status">{message}</p> : null}

      {isUploading ? (
        <div className="photo-uploader-progress">
          <div className="photo-uploader-progress-bar">
            <div
              className="photo-uploader-progress-fill"
              style={{ width: `${progress.total > 0 ? (progress.done / progress.total) * 100 : 0}%` }}
            />
          </div>
          <span className="photo-uploader-progress-text">
            Subiendo {progress.done} de {progress.total} {progress.total === 1 ? "fotografia" : "fotografias"}
          </span>
        </div>
      ) : null}

      {items.length > 0 ? (
        <div className="photo-uploader-grid">
          {items.map((item, index) => (
            <div
              key={item.id}
              className={`photo-uploader-item ${item.status === "done" ? "photo-uploader-item-done" : ""} ${item.status === "error" ? "photo-uploader-item-error" : ""} ${item.status === "uploading" ? "photo-uploader-item-uploading" : ""} ${coverIndex === index ? "photo-uploader-item-cover" : ""}`}
              draggable={item.status !== "uploading"}
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(index)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="Vista previa" src={item.previewUrl} loading="lazy" />
              <div className="photo-uploader-item-overlay">
                {item.status === "uploading" ? (
                  <span className="photo-uploader-item-status">Subiendo...</span>
                ) : item.status === "done" ? (
                  <span className="photo-uploader-item-status">Cargada</span>
                ) : item.status === "error" ? (
                  <span className="photo-uploader-item-status">Fallo</span>
                ) : null}
              </div>
              {coverIndex === index ? (
                <span className="photo-uploader-item-badge">Principal</span>
              ) : null}
              <button
                aria-label="Eliminar imagen"
                className="photo-uploader-item-remove"
                disabled={isUploading}
                onClick={() => removeItem(item.id)}
                type="button"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
              {!single && item.status !== "uploading" ? (
                <button
                  aria-label="Marcar como principal"
                  className="photo-uploader-item-cover-btn"
                  disabled={isUploading}
                  onClick={() => setCoverIndex(index)}
                  type="button"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </button>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {items.length > 0 ? (
        <div className="photo-uploader-footer">
          <button
            className="btn btn-dark"
            disabled={isUploading}
            onClick={clearAll}
            type="button"
          >
            Eliminar todas
          </button>
          {hasFailed && !isUploading ? (
            <button
              className="btn"
              disabled={isUploading}
              onClick={retryFailed}
              type="button"
            >
              Reintentar fallidas
            </button>
          ) : null}
          {hasPending && !isUploading ? (
            <button
              className="btn"
              disabled={isUploading || !hasPending}
              onClick={uploadAll}
              type="button"
            >
              Subir fotografias
            </button>
          ) : null}
          {allDone ? (
            <span className="photo-uploader-done">Todas las fotografias estan cargadas.</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
