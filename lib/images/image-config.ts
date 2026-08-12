export const IMAGE_UPLOAD_LIMITS = {
  maxSourceBytes: 5 * 1024 * 1024,
  pilotProductImageCount: 2,
} as const;

export const PRODUCT_IMAGE_PRESET = {
  main: { maxLongEdge: 1600, quality: 0.8, targetBytes: 300 * 1024 },
  thumbnail: { maxLongEdge: 500, quality: 0.78, targetBytes: 80 * 1024 },
} as const;

export const BUSINESS_IMAGE_PRESETS = {
  logo: { maxLongEdge: 800, quality: 0.8, targetBytes: 180 * 1024 },
  cover: { maxLongEdge: 1920, quality: 0.8, targetBytes: 350 * 1024 },
} as const;

export const IMAGE_OUTPUT_TYPE = "image/webp";
export const IMAGE_OUTPUT_EXTENSION = "webp";
