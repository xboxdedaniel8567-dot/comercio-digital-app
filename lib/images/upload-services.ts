import { IMAGE_OUTPUT_EXTENSION } from "./image-config.ts";
import {
  optimizeBusinessImage,
  optimizeProductImage,
  type OptimizedImage,
  type ProductImageOptimization,
} from "./image-optimizer.ts";
import type { StorageProvider } from "./storage-provider.ts";

type OptimizerDependencies = {
  optimizeBusiness?: typeof optimizeBusinessImage;
  optimizeProduct?: typeof optimizeProductImage;
};

export type ProductUploadResult = {
  main: { bytes: number; height: number; objectPath: string; publicUrl: string; width: number };
  thumbnail: { bytes: number; height: number; width: number } | null;
};

function safeBaseName(fileName: string, fallback: string) {
  return fileName
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || fallback;
}

function extensionFor(image: OptimizedImage) {
  return image.type === "image/gif" ? "gif" : IMAGE_OUTPUT_EXTENSION;
}

export class ProductImageUploadService {
  private readonly optimize: typeof optimizeProductImage;
  private readonly storage: StorageProvider;

  constructor(
    storage: StorageProvider,
    dependencies: OptimizerDependencies = {},
  ) {
    this.storage = storage;
    this.optimize = dependencies.optimizeProduct ?? optimizeProductImage;
  }

  async upload(file: File, ownerId: string, productId: string): Promise<ProductUploadResult> {
    const optimized = await this.optimize(file);
    const stamp = Date.now();
    const base = safeBaseName(file.name, "producto");
    const prefix = `${ownerId}/${productId}/${stamp}-${base}`;
    const uploadedPaths: string[] = [];

    try {
      const mainPath = `${prefix}-main.${extensionFor(optimized.main)}`;
      const main = await this.storage.upload({
        bucket: "product-images",
        contentType: optimized.main.type,
        data: optimized.main.blob,
        path: mainPath,
      });
      uploadedPaths.push(main.path);

      // Keep the generated thumbnail in memory until the database can persist its URL.
      const thumbnail = optimized.thumbnail ? {
        bytes: optimized.thumbnail.bytes,
        height: optimized.thumbnail.height,
        width: optimized.thumbnail.width,
      } : null;

      return {
        main: {
          bytes: optimized.main.bytes,
          height: optimized.main.height,
          objectPath: main.path,
          publicUrl: main.publicUrl,
          width: optimized.main.width,
        },
        thumbnail,
      };
    } catch (error) {
      if (uploadedPaths.length > 0) {
        try {
          await this.storage.delete("product-images", uploadedPaths);
        } catch {
          // Keep the original upload error; cleanup can be retried from storage logs.
        }
      }
      throw error;
    }
  }

  async rollback(result: ProductUploadResult): Promise<void> {
    await this.storage.delete("product-images", [result.main.objectPath]);
  }
}

export class BusinessImageUploadService {
  private readonly optimize: typeof optimizeBusinessImage;
  private readonly storage: StorageProvider;

  constructor(
    storage: StorageProvider,
    dependencies: OptimizerDependencies = {},
  ) {
    this.storage = storage;
    this.optimize = dependencies.optimizeBusiness ?? optimizeBusinessImage;
  }

  async upload(file: File, ownerId: string, businessId: string, kind: "logo" | "cover") {
    const optimized = await this.optimize(file, kind);
    const base = safeBaseName(file.name, "tienda");
    const path = `${ownerId}/${businessId}/${kind}-${Date.now()}-${base}.${extensionFor(optimized)}`;
    const stored = await this.storage.upload({
      bucket: "business-images",
      contentType: optimized.type,
      data: optimized.blob,
      path,
    });
    return {
      bytes: optimized.bytes,
      height: optimized.height,
      objectPath: stored.path,
      publicUrl: stored.publicUrl,
      width: optimized.width,
    };
  }

  async rollback(objectPaths: string[]): Promise<void> {
    await this.storage.delete("business-images", objectPaths);
  }
}

export type { ProductImageOptimization };
