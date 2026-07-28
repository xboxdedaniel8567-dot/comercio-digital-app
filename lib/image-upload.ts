import { supabase } from "@/lib/supabase";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function safeFileName(fileName: string, fallback = "imagen") {
  const extension = fileName.split(".").pop()?.toLowerCase() || "jpg";
  const baseName = fileName
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || fallback;

  return `${baseName}.${extension}`;
}

export function validateImage(file: File): string {
  if (!file.type.startsWith("image/")) return "El archivo debe ser una imagen.";
  if (!ACCEPTED_TYPES.includes(file.type)) return "Formato no valido. Usa JPG, PNG o WebP.";
  if (file.size > MAX_IMAGE_SIZE) return "La imagen no puede pesar mas de 5 MB.";
  return "";
}

export type UploadResult = {
  error: string;
  publicUrl: string;
};

export async function uploadImage(
  file: File,
  bucket: "product-images" | "business-images",
  pathPrefix: string,
): Promise<UploadResult> {
  const validationError = validateImage(file);
  if (validationError) return { error: validationError, publicUrl: "" };

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { error: "Debes iniciar sesion para subir imagenes.", publicUrl: "" };
  }

  const objectPath = `${userData.user.id}/${pathPrefix}/${Date.now()}-${safeFileName(file.name)}`;
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(objectPath, file, { cacheControl: "3600", contentType: file.type, upsert: false });

  if (uploadError) return { error: "No se pudo subir la imagen.", publicUrl: "" };

  const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
  return { error: "", publicUrl: data.publicUrl };
}

export async function uploadProductImage(file: File, productId: string): Promise<UploadResult> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id ?? "unknown";
  return uploadImage(file, "product-images", `${userId}/${productId}`);
}

export async function uploadBusinessImage(
  file: File,
  businessId: string,
  kind: "logo" | "cover" | "gallery",
): Promise<UploadResult> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id ?? "unknown";
  return uploadImage(file, "business-images", `${userId}/${businessId}/${kind}`);
}
