import {
  BUSINESS_IMAGE_PRESETS,
  IMAGE_OUTPUT_TYPE,
  PRODUCT_IMAGE_PRESET,
} from "./image-config.ts";

export type ImageDimensions = { height: number; width: number };

export type OptimizedImage = ImageDimensions & {
  blob: Blob;
  bytes: number;
  type: string;
};

export type ProductImageOptimization = {
  main: OptimizedImage;
  thumbnail: OptimizedImage | null;
};

type ImagePreset = {
  maxLongEdge: number;
  quality: number;
  targetBytes: number;
};

export type DecodedImage = ImageDimensions & {
  source: CanvasImageSource;
  close?: () => void;
};

export type ImageOptimizerRuntime = {
  decode: (file: File) => Promise<DecodedImage>;
  encode: (
    image: DecodedImage,
    dimensions: ImageDimensions,
    type: string,
    quality: number,
  ) => Promise<Blob>;
};

export function getContainedDimensions(
  width: number,
  height: number,
  maxLongEdge: number,
): ImageDimensions {
  const longEdge = Math.max(width, height);
  if (longEdge <= maxLongEdge) return { height, width };

  const scale = maxLongEdge / longEdge;
  return {
    height: Math.max(1, Math.round(height * scale)),
    width: Math.max(1, Math.round(width * scale)),
  };
}

async function decodeInBrowser(file: File): Promise<DecodedImage> {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    return {
      close: () => bitmap.close(),
      height: bitmap.height,
      source: bitmap,
      width: bitmap.width,
    };
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("No se pudo leer la imagen seleccionada."));
      element.src = objectUrl;
    });
    return { height: image.naturalHeight, source: image, width: image.naturalWidth };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function encodeInBrowser(
  image: DecodedImage,
  dimensions: ImageDimensions,
  type: string,
  quality: number,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("El navegador no pudo preparar la imagen.");

  context.drawImage(image.source, 0, 0, dimensions.width, dimensions.height);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error("No se pudo convertir la imagen a WebP.")),
      type,
      quality,
    );
  });
}

const browserRuntime: ImageOptimizerRuntime = {
  decode: decodeInBrowser,
  encode: encodeInBrowser,
};

async function optimizeDecodedImage(
  image: DecodedImage,
  preset: ImagePreset,
  runtime: ImageOptimizerRuntime,
): Promise<OptimizedImage> {
  const dimensions = getContainedDimensions(
    image.width,
    image.height,
    preset.maxLongEdge,
  );
  const qualities = [preset.quality, 0.78, 0.75].filter(
    (quality, index, values) => values.indexOf(quality) === index,
  );
  let blob: Blob | null = null;

  for (const quality of qualities) {
    blob = await runtime.encode(image, dimensions, IMAGE_OUTPUT_TYPE, quality);
    if (blob.size <= preset.targetBytes) break;
  }

  if (!blob) throw new Error("No se pudo optimizar la imagen.");
  return { ...dimensions, blob, bytes: blob.size, type: blob.type || IMAGE_OUTPUT_TYPE };
}

export async function optimizeProductImage(
  file: File,
  runtime: ImageOptimizerRuntime = browserRuntime,
): Promise<ProductImageOptimization> {
  // GIF remains untouched so an animated source never becomes a static frame.
  if (file.type === "image/gif") {
    return {
      main: { blob: file, bytes: file.size, height: 0, type: file.type, width: 0 },
      thumbnail: null,
    };
  }

  const decoded = await runtime.decode(file);
  try {
    return {
      main: await optimizeDecodedImage(decoded, PRODUCT_IMAGE_PRESET.main, runtime),
      thumbnail: await optimizeDecodedImage(decoded, PRODUCT_IMAGE_PRESET.thumbnail, runtime),
    };
  } finally {
    decoded.close?.();
  }
}

export async function optimizeBusinessImage(
  file: File,
  kind: "logo" | "cover",
  runtime: ImageOptimizerRuntime = browserRuntime,
): Promise<OptimizedImage> {
  if (file.type === "image/gif") {
    return { blob: file, bytes: file.size, height: 0, type: file.type, width: 0 };
  }

  const decoded = await runtime.decode(file);
  try {
    return await optimizeDecodedImage(decoded, BUSINESS_IMAGE_PRESETS[kind], runtime);
  } finally {
    decoded.close?.();
  }
}
