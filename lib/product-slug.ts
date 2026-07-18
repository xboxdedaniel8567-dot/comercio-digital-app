import { supabase } from "@/lib/supabase";

export function slugifyProductName(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function getUniqueProductSlug(name: string, currentProductId?: string) {
  const baseSlug = slugifyProductName(name) || "producto";
  let query = supabase.from("products").select("slug").like("slug", `${baseSlug}%`);

  if (currentProductId) {
    query = query.neq("id", currentProductId);
  }

  const { data, error } = await query;

  if (error) {
    return { error: error.message, slug: "" };
  }

  const existingSlugs = new Set((data ?? []).map((row) => row.slug));

  if (!existingSlugs.has(baseSlug)) {
    return { error: "", slug: baseSlug };
  }

  let suffix = 2;
  while (existingSlugs.has(`${baseSlug}-${suffix}`)) {
    suffix += 1;
  }

  return { error: "", slug: `${baseSlug}-${suffix}` };
}
