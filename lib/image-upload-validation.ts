import { IMAGE_UPLOAD_LIMITS } from "./images/image-config.ts";

const MAX_IMAGE_SIZE = IMAGE_UPLOAD_LIMITS.maxSourceBytes;

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif"]);

export function validateImageFile(file: File): string {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (!ALLOWED_MIME_TYPES.has(file.type) || !ALLOWED_EXTENSIONS.has(extension)) {
    return "Solo se permiten imagenes JPG, PNG, WebP o GIF.";
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return "La imagen no puede pesar mas de 5 MB.";
  }

  return "";
}

export { MAX_IMAGE_SIZE };
