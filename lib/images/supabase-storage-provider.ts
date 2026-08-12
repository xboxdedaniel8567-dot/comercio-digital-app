import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  StorageProvider,
  StorageUpload,
  StoredObject,
} from "@/lib/images/storage-provider";

export class SupabaseStorageProvider implements StorageProvider {
  constructor(private readonly client: SupabaseClient) {}

  async upload(input: StorageUpload): Promise<StoredObject> {
    const { error } = await this.client.storage.from(input.bucket).upload(input.path, input.data, {
      cacheControl: input.cacheControl ?? "31536000",
      contentType: input.contentType,
      upsert: false,
    });
    if (error) throw new Error(error.message);

    const { data } = this.client.storage.from(input.bucket).getPublicUrl(input.path);
    return { path: input.path, publicUrl: data.publicUrl };
  }

  async delete(bucket: string, paths: string[]): Promise<void> {
    if (paths.length === 0) return;
    const { error } = await this.client.storage.from(bucket).remove(paths);
    if (error) throw new Error(error.message);
  }
}
