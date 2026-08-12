"use client";

import { ChangeEvent, useEffect, useState } from "react";
import {
  rollbackBusinessImageUploads,
  uploadBusinessImage,
  validateBusinessImage,
} from "@/lib/business-image-upload";
import { getCurrentBusiness } from "@/lib/current-business";
import { supabase } from "@/lib/supabase";

type ImageKind = "logo" | "cover";

export function BusinessBrandingForm() {
  const [businessId, setBusinessId] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [coverPreview, setCoverPreview] = useState("");
  const [message, setMessage] = useState("Cargando identidad visual...");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadBranding() {
      const { business, error } = await getCurrentBusiness();
      if (!business) {
        setMessage(error || "No encontramos una tienda asociada a esta cuenta.");
        return;
      }

      setBusinessId(business.id);
      setLogoUrl(business.logo_url ?? "");
      setCoverUrl(business.cover_url ?? "");
      setMessage("");
    }

    void loadBranding();
  }, []);

  useEffect(() => {
    if (!logoFile) {
      setLogoPreview(logoUrl);
      return;
    }
    const objectUrl = URL.createObjectURL(logoFile);
    setLogoPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [logoFile, logoUrl]);

  useEffect(() => {
    if (!coverFile) {
      setCoverPreview(coverUrl);
      return;
    }
    const objectUrl = URL.createObjectURL(coverFile);
    setCoverPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [coverFile, coverUrl]);

  function selectImage(event: ChangeEvent<HTMLInputElement>, kind: ImageKind) {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;

    const validationError = validateBusinessImage(file);
    if (validationError) {
      event.target.value = "";
      setMessage(validationError);
      return;
    }

    setMessage("");
    if (kind === "logo") setLogoFile(file);
    else setCoverFile(file);
  }

  async function saveBranding() {
    if (!businessId) return;
    if (!logoFile && !coverFile) {
      setMessage("Selecciona un logo o una portada para guardar.");
      return;
    }

    setIsSaving(true);
    setMessage("Subiendo imagenes...");
    let nextLogoUrl = logoUrl;
    let nextCoverUrl = coverUrl;
    const uploadedPaths: string[] = [];

    if (logoFile) {
      const result = await uploadBusinessImage(logoFile, businessId, "logo");
      if (result.error) {
        setIsSaving(false);
        setMessage(`No se pudo subir el logo: ${result.error}`);
        return;
      }
      nextLogoUrl = result.publicUrl;
      uploadedPaths.push(result.objectPath);
    }

    if (coverFile) {
      const result = await uploadBusinessImage(coverFile, businessId, "cover");
      if (result.error) {
        if (uploadedPaths.length > 0) {
          try {
            await rollbackBusinessImageUploads(uploadedPaths);
          } catch {
            // Keep the cover upload error visible; cleanup can be retried separately.
          }
        }
        setIsSaving(false);
        setMessage(`No se pudo subir la portada: ${result.error}`);
        return;
      }
      nextCoverUrl = result.publicUrl;
      uploadedPaths.push(result.objectPath);
    }

    const { error } = await supabase
      .from("businesses")
      .update({ logo_url: nextLogoUrl || null, cover_url: nextCoverUrl || null })
      .eq("id", businessId);

    setIsSaving(false);
    if (error) {
      if (uploadedPaths.length > 0) {
        try {
          await rollbackBusinessImageUploads(uploadedPaths);
        } catch {
          // The database error remains primary; cleanup can be retried separately.
        }
      }
      setMessage(`No se pudieron guardar las imagenes: ${error.message}`);
      return;
    }

    setLogoUrl(nextLogoUrl);
    setCoverUrl(nextCoverUrl);
    setLogoFile(null);
    setCoverFile(null);
    setMessage("Identidad visual actualizada correctamente.");
  }

  async function removeImage(kind: ImageKind) {
    if (!businessId) return;
    setIsSaving(true);
    const column = kind === "logo" ? "logo_url" : "cover_url";
    const { error } = await supabase.from("businesses").update({ [column]: null }).eq("id", businessId);
    setIsSaving(false);

    if (error) {
      setMessage(`No se pudo quitar la imagen: ${error.message}`);
      return;
    }

    if (kind === "logo") {
      setLogoUrl("");
      setLogoFile(null);
    } else {
      setCoverUrl("");
      setCoverFile(null);
    }
    setMessage("Imagen retirada de la tienda.");
  }

  return (
    <section className="merchant-form-section panel">
      <div className="merchant-form-heading">
        <p className="kicker">Presentacion</p>
        <h2>Identidad visual</h2>
        <p>
          Agrega un logo cuadrado y una portada horizontal de hasta 5 MB.
        </p>
      </div>

      <div className="merchant-branding-grid">
        <fieldset className="merchant-image-fieldset">
          <legend>Logo</legend>
          {logoPreview ? (
            <img alt="Logo de la tienda" className="merchant-logo-preview" src={logoPreview} />
          ) : (
            <div className="merchant-logo-preview merchant-image-empty">Sin logo</div>
          )}
          <input accept="image/jpeg,image/png,image/webp" className="input" disabled={isSaving} onChange={(event) => selectImage(event, "logo")} type="file" />
          {logoUrl ? <button className="btn btn-dark" disabled={isSaving} onClick={() => void removeImage("logo")} type="button">Quitar logo</button> : null}
        </fieldset>

        <fieldset className="merchant-image-fieldset">
          <legend>Portada</legend>
          {coverPreview ? (
            <img alt="Portada de la tienda" className="merchant-cover-preview" src={coverPreview} />
          ) : (
            <div className="merchant-cover-preview merchant-image-empty">Sin portada</div>
          )}
          <input accept="image/jpeg,image/png,image/webp" className="input" disabled={isSaving} onChange={(event) => selectImage(event, "cover")} type="file" />
          {coverUrl ? <button className="btn btn-dark" disabled={isSaving} onClick={() => void removeImage("cover")} type="button">Quitar portada</button> : null}
        </fieldset>
      </div>

      <button className="btn" disabled={isSaving || !businessId} onClick={() => void saveBranding()} type="button">
        {isSaving ? "Guardando..." : "Guardar identidad visual"}
      </button>
      {message ? <p className="merchant-form-message" role="status">{message}</p> : null}
    </section>
  );
}
