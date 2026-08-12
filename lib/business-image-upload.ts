import { validateImageFile } from "@/lib/image-upload-validation";
import { BusinessImageUploadService } from "@/lib/images/upload-services";
import { SupabaseStorageProvider } from "@/lib/images/supabase-storage-provider";
import { supabase } from "@/lib/supabase";

const uploadService = new BusinessImageUploadService(new SupabaseStorageProvider(supabase));

export function validateBusinessImage(file: File) {
  return validateImageFile(file);
}

export async function uploadBusinessImage(
  file: File,
  businessId: string,
  kind: "logo" | "cover",
) {
  const validationError = validateBusinessImage(file);
  if (validationError) return { error: validationError, objectPath: "", publicUrl: "" };

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { error: "Debes iniciar sesion para subir imagenes.", objectPath: "", publicUrl: "" };
  }

  try {
    const upload = await uploadService.upload(file, userData.user.id, businessId, kind);
    return { error: "", objectPath: upload.objectPath, publicUrl: upload.publicUrl };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "No se pudo subir la imagen.",
      objectPath: "",
      publicUrl: "",
    };
  }
}

export async function rollbackBusinessImageUploads(objectPaths: string[]) {
  await uploadService.rollback(objectPaths);
}
