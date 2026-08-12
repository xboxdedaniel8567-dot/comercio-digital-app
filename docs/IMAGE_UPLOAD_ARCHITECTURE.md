# Image upload architecture

Pilot uploads are split into three responsibilities:

- `image-optimizer.ts` decodes in the browser, respects EXIF orientation through
  `createImageBitmap(..., { imageOrientation: "from-image" })`, resizes and removes
  unnecessary metadata when it re-encodes to WebP.
- `StorageProvider` defines upload/delete operations. The active implementation is
  `SupabaseStorageProvider`; a future R2 provider can replace it without changing forms.
- `ProductImageUploadService` and `BusinessImageUploadService` coordinate optimization,
  paths, uploads and rollback.

Product images generate a main image (maximum long edge 1600 px) and thumbnail
(500 px). Both use WebP quality around 0.75-0.80. GIF is preserved without conversion
to avoid losing animation and does not generate a thumbnail.

The current `product_images` model stores only the main URL. Thumbnails are generated
and measured in memory, but are not uploaded because they would become unreachable
Storage objects. A future, reviewed migration must introduce `thumbnail_url` or an
equivalent model before thumbnail upload is enabled. No schema or remote Storage policy
is changed in phase 0E.
