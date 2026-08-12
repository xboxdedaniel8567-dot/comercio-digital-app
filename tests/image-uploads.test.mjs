import assert from "node:assert/strict";
import test from "node:test";

test("validation rejects invalid files and sources larger than 5 MB", async () => {
  const { validateImageFile } = await import("../lib/image-upload-validation.ts");

  assert.match(
    validateImageFile(new File(["text"], "notes.txt", { type: "text/plain" })),
    /Solo se permiten/,
  );
  assert.match(
    validateImageFile(
      new File([new Uint8Array(5 * 1024 * 1024 + 1)], "large.jpg", { type: "image/jpeg" }),
    ),
    /5 MB/,
  );
});

test("contained dimensions preserve horizontal, vertical and small images", async () => {
  const { getContainedDimensions } = await import("../lib/images/image-optimizer.ts");

  assert.deepEqual(getContainedDimensions(4000, 2000, 1600), { height: 800, width: 1600 });
  assert.deepEqual(getContainedDimensions(2000, 4000, 1600), { height: 1600, width: 800 });
  assert.deepEqual(getContainedDimensions(800, 600, 1600), { height: 600, width: 800 });
});

test("JPEG, PNG and WebP become bounded WebP main images and thumbnails", async () => {
  const { optimizeProductImage } = await import("../lib/images/image-optimizer.ts");

  for (const type of ["image/jpeg", "image/png", "image/webp"]) {
    const calls = [];
    const runtime = {
      decode: async () => ({ height: 3000, source: {}, width: 4000 }),
      encode: async (_image, dimensions, outputType, quality) => {
        calls.push({ dimensions, outputType, quality });
        return new Blob([new Uint8Array(120_000)], { type: outputType });
      },
    };
    const file = new File([new Uint8Array(500_000)], `source.${type.split("/")[1]}`, { type });
    const result = await optimizeProductImage(file, runtime);

    assert.equal(result.main.type, "image/webp");
    assert.deepEqual(
      { height: result.main.height, width: result.main.width },
      { height: 1200, width: 1600 },
    );
    assert.deepEqual(
      { height: result.thumbnail?.height, width: result.thumbnail?.width },
      { height: 375, width: 500 },
    );
    assert.ok(calls.every((call) => call.outputType === "image/webp"));
  }
});

test("PNG transparency remains available to the WebP encoder", async () => {
  const { optimizeBusinessImage } = await import("../lib/images/image-optimizer.ts");
  let encodedType = "";
  const runtime = {
    decode: async () => ({ height: 900, source: { hasAlpha: true }, width: 900 }),
    encode: async (image, _dimensions, outputType) => {
      assert.equal(image.source.hasAlpha, true);
      encodedType = outputType;
      return new Blob([new Uint8Array(50_000)], { type: outputType });
    },
  };

  const result = await optimizeBusinessImage(
    new File([new Uint8Array(100_000)], "logo.png", { type: "image/png" }),
    "logo",
    runtime,
  );
  assert.equal(encodedType, "image/webp");
  assert.equal(result.width, 800);
});

test("GIF is preserved and does not generate a static thumbnail", async () => {
  const { optimizeProductImage } = await import("../lib/images/image-optimizer.ts");
  const file = new File([new Uint8Array(10_000)], "animated.gif", { type: "image/gif" });
  const result = await optimizeProductImage(file);

  assert.equal(result.main.blob, file);
  assert.equal(result.main.type, "image/gif");
  assert.equal(result.thumbnail, null);
});

test("product upload rolls back its object when a later operation fails", async () => {
  const { ProductImageUploadService } = await import("../lib/images/upload-services.ts");
  const removed = [];
  const storage = {
    delete: async (_bucket, paths) => removed.push(...paths),
    upload: async ({ path }) => {
      return { path, publicUrl: `https://storage.test/${path}` };
    },
  };
  const optimized = {
    main: { blob: new Blob(["main"], { type: "image/webp" }), bytes: 4, height: 800, type: "image/webp", width: 1600 },
    thumbnail: { blob: new Blob(["thumb"], { type: "image/webp" }), bytes: 5, height: 250, type: "image/webp", width: 500 },
  };
  const service = new ProductImageUploadService(storage, {
    optimizeProduct: async () => optimized,
  });

  const result = await service.upload(
    new File(["x"], "photo.jpg", { type: "image/jpeg" }),
    "owner",
    "product",
  );
  await service.rollback(result);
  assert.equal(removed.length, 1);
  assert.match(removed[0], /-main\.webp$/);
});

test("product upload reports storage failures without returning a URL", async () => {
  const { ProductImageUploadService } = await import("../lib/images/upload-services.ts");
  const service = new ProductImageUploadService({
    delete: async () => {},
    upload: async () => { throw new Error("upload failed"); },
  }, {
    optimizeProduct: async () => ({
      main: { blob: new Blob(["main"], { type: "image/webp" }), bytes: 4, height: 800, type: "image/webp", width: 1600 },
      thumbnail: null,
    }),
  });

  await assert.rejects(
    service.upload(new File(["x"], "photo.jpg", { type: "image/jpeg" }), "owner", "product"),
    /upload failed/,
  );
});

test("product upload exposes the main URL without orphaning its thumbnail", async () => {
  const { ProductImageUploadService } = await import("../lib/images/upload-services.ts");
  const uploadedPaths = [];
  const storage = {
    delete: async () => {},
    upload: async ({ path }) => {
      uploadedPaths.push(path);
      return { path, publicUrl: `https://storage.test/${path}` };
    },
  };
  const service = new ProductImageUploadService(storage, {
    optimizeProduct: async () => ({
      main: { blob: new Blob(["main"], { type: "image/webp" }), bytes: 4, height: 800, type: "image/webp", width: 1600 },
      thumbnail: { blob: new Blob(["thumb"], { type: "image/webp" }), bytes: 5, height: 250, type: "image/webp", width: 500 },
    }),
  });

  const result = await service.upload(
    new File(["x"], "photo.jpg", { type: "image/jpeg" }),
    "owner",
    "product",
  );
  assert.match(result.main.publicUrl, /-main\.webp$/);
  assert.equal(result.thumbnail?.width, 500);
  assert.equal(uploadedPaths.length, 1);
});
