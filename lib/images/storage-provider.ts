export type StorageUpload = {
  bucket: string;
  cacheControl?: string;
  contentType: string;
  data: Blob;
  path: string;
};

export type StoredObject = {
  path: string;
  publicUrl: string;
};

export interface StorageProvider {
  delete(bucket: string, paths: string[]): Promise<void>;
  upload(input: StorageUpload): Promise<StoredObject>;
}
