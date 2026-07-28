"use client";

import { useEffect, useState } from "react";
import { MultiPhotoUploader } from "@/components/MultiPhotoUploader";
import { getCurrentBusiness } from "@/lib/current-business";
import { supabase } from "@/lib/supabase";

export function BusinessBrandingForm() {
  const [businessId, setBusinessId] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [uploadedLogo, setUploadedLogo] = useState<{ url: string; alt_text: string }[]>([]);
  const [uploadedCover, setUploadedCover] = useState<{ url: string; alt_text: string }[]>([]);
  const [uploadedGallery, setUploadedGallery] = useState<{ url: string; alt_text: string }[]>([]);
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

  async function saveBranding() {
    if (!businessId) return;

    const hasNewLogo = uploadedLogo.length > 0;
    const hasNewCover = uploadedCover.length > 0;
    const hasNewGallery = uploadedGallery.length > 0;

    if (!hasNewLogo && !hasNewCover && !hasNewGallery) {
      setMessage("Selecciona al menos una imagen para guardar.");
      return;
    }

    setIsSaving(true);
    setMessage("Guardando identidad visual...");

    const updates: { logo_url?: string | null; cover_url?: string | null } = {};

    if (hasNewLogo) {
      updates.logo_url = uploadedLogo[0].url;
    }

    if (hasNewCover) {
      updates.cover_url = uploadedCover[0].url;
    }

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase.from("businesses").update(updates).eq("id", businessId);

      if (error) {
        setIsSaving(false);
        setMessage(`No se pudieron guardar las imagenes: ${error.message}`);
        return;
      }

      if (hasNewLogo) setLogoUrl(uploadedLogo[0].url);
      if (hasNewCover) setCoverUrl(uploadedCover[0].url);
    }

    if (hasNewGallery) {
      const galleryRows = uploadedGallery.map((img) => ({
        alt_text: img.alt_text,
        business_id: businessId,
        url: img.url,
      }));
      const { error: galleryError } = await supabase
        .from("business_gallery_images")
        .insert(galleryRows);

      if (galleryError) {
        setIsSaving(false);
        setMessage(`Las imagenes principales se guardaron, pero la galeria fallo: ${galleryError.message}`);
        return;
      }
    }

    setIsSaving(false);
    setUploadedLogo([]);
    setUploadedCover([]);
    setUploadedGallery([]);
    setMessage("Identidad visual actualizada correctamente.");
  }

  async function removeImage(kind: "logo" | "cover") {
    if (!businessId) return;
    setIsSaving(true);
    const column = kind === "logo" ? "logo_url" : "cover_url";
    const { error } = await supabase.from("businesses").update({ [column]: null }).eq("id", businessId);
    setIsSaving(false);

    if (error) {
      setMessage(`No se pudo quitar la imagen: ${error.message}`);
      return;
    }

    if (kind === "logo") setLogoUrl("");
    else setCoverUrl("");
    setMessage("Imagen retirada de la tienda.");
  }

  return (
    <section className="merchant-form-section panel">
      <div className="merchant-form-heading">
        <p className="kicker">Presentacion</p>
        <h2>Identidad visual</h2>
        <p>
          Agrega un logo cuadrado, una portada horizontal y fotografias del establecimiento. Todas las imagenes deben pesar hasta 5 MB en formato JPG, PNG o WebP.
        </p>
      </div>

      <div className="merchant-branding-grid">
        <fieldset className="merchant-image-fieldset">
          <legend>Logo</legend>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="Logo de la tienda" className="merchant-logo-preview" src={logoUrl} />
          ) : (
            <div className="merchant-logo-preview merchant-image-empty">Sin logo</div>
          )}
          {logoUrl ? (
            <button className="btn btn-dark" disabled={isSaving} onClick={() => void removeImage("logo")} type="button">
              Quitar logo
            </button>
          ) : null}
          <MultiPhotoUploader
            bucket="business-images"
            hint="Selecciona una imagen cuadrada para tu logo."
            label="Logo"
            onUploaded={setUploadedLogo}
            onValidationError={setMessage}
            pathPrefix={`${businessId}/logo`}
            single
          />
        </fieldset>

        <fieldset className="merchant-image-fieldset">
          <legend>Portada</legend>
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="Portada de la tienda" className="merchant-cover-preview" src={coverUrl} />
          ) : (
            <div className="merchant-cover-preview merchant-image-empty">Sin portada</div>
          )}
          {coverUrl ? (
            <button className="btn btn-dark" disabled={isSaving} onClick={() => void removeImage("cover")} type="button">
              Quitar portada
            </button>
          ) : null}
          <MultiPhotoUploader
            bucket="business-images"
            hint="Selecciona una imagen horizontal para la portada de tu tienda."
            label="Portada"
            onUploaded={setUploadedCover}
            onValidationError={setMessage}
            pathPrefix={`${businessId}/cover`}
            single
          />
        </fieldset>
      </div>

      <fieldset className="merchant-image-fieldset">
        <legend>Galeria del establecimiento</legend>
        <MultiPhotoUploader
          bucket="business-images"
          hint="Selecciona hasta 20 fotografias de tu local. Los clientes podran verlas en pantalla completa."
          label="Fotografias del establecimiento"
          onUploaded={setUploadedGallery}
          onValidationError={setMessage}
          pathPrefix={`${businessId}/gallery`}
        />
      </fieldset>

      <button className="btn" disabled={isSaving || !businessId} onClick={() => void saveBranding()} type="button">
        {isSaving ? "Guardando..." : "Guardar identidad visual"}
      </button>
      {message ? <p className="merchant-form-message" role="status">{message}</p> : null}
    </section>
  );
}
