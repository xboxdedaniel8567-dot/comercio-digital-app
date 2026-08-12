import { validateImageFile } from "@/lib/image-upload-validation";
import { ProductImageUploadService, type ProductUploadResult } from "@/lib/images/upload-services";
import { SupabaseStorageProvider } from "@/lib/images/supabase-storage-provider";
import { supabase } from "@/lib/supabase";

const uploadService = new ProductImageUploadService(new SupabaseStorageProvider(supabase));

export function validateProductImage(file: File) {
  return validateImageFile(file);
}

export async function uploadProductImage(file: File, productId: string) {
  const validationError = validateProductImage(file);

  if (validationError) {
    return { error: validationError, publicUrl: "", upload: null };
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData.user;

  if (userError || !user) {
    return { error: "Debes iniciar sesion para subir imagenes.", publicUrl: "", upload: null };
  }

  try {
    const upload = await uploadService.upload(file, user.id, productId);
    return { error: "", publicUrl: upload.main.publicUrl, upload };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "No se pudo subir la imagen.",
      publicUrl: "",
      upload: null,
    };
  }
}

export async function rollbackProductImageUpload(upload: ProductUploadResult) {
  await uploadService.rollback(upload);
}
