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
    .replace(/^-+|-+$/g, "") || "producto";

  return `${baseName}.${extension}`;
}

export function validateProductImage(file: File) {
  return validateImageFile(file);
}

export async function uploadProductImage(file: File, productId: string) {
  const validationError = validateProductImage(file);

  if (validationError) {
    return { error: validationError, publicUrl: "" };
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData.user;

  if (userError || !user) {
    return { error: "Debes iniciar sesion para subir imagenes.", publicUrl: "" };
  }

  const objectPath = `${user.id}/${productId}/${Date.now()}-${safeFileName(file.name)}`;
  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(objectPath, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return { error: uploadError.message, publicUrl: "" };
  }

  const { data } = supabase.storage.from("product-images").getPublicUrl(objectPath);
  return { error: "", publicUrl: data.publicUrl };
}
