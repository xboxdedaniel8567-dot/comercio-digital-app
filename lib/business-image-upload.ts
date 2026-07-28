import { validateImageFile } from "@/lib/image-upload-validation";
import { supabase } from "@/lib/supabase";

function safeFileName(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase() || "jpg";
  const baseName = fileName
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "tienda";

  return `${baseName}.${extension}`;
}

export function validateBusinessImage(file: File) {
  return validateImageFile(file);
}

export async function uploadBusinessImage(
  file: File,
  businessId: string,
  kind: "logo" | "cover",
) {
  const validationError = validateBusinessImage(file);
  if (validationError) return { error: validationError, publicUrl: "" };

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { error: "Debes iniciar sesion para subir imagenes.", publicUrl: "" };
  }

  const objectPath = `${userData.user.id}/${businessId}/${kind}-${Date.now()}-${safeFileName(file.name)}`;
  const { error: uploadError } = await supabase.storage
    .from("business-images")
    .upload(objectPath, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) return { error: uploadError.message, publicUrl: "" };

  const { data } = supabase.storage.from("business-images").getPublicUrl(objectPath);
  return { error: "", publicUrl: data.publicUrl };
}
