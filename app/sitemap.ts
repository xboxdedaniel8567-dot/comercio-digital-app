import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { supabase } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const [productsResult, businessesResult, categoriesResult] = await Promise.all([
    supabase
      .from("products")
      .select("slug, businesses!inner(status)")
      .eq("status", "active")
      .eq("moderation_status", "approved")
      .eq("businesses.status", "active"),
    supabase.from("businesses").select("slug, city_slug").eq("status", "active"),
    supabase.from("categories").select("slug").order("name"),
  ]);

  const businesses = (businessesResult.data ?? []) as { slug: string; city_slug: string }[];
  const cities = [...new Set(businesses.map((business) => business.city_slug).filter(Boolean))];
  const categories = (categoriesResult.data ?? []) as { slug: string }[];

  return [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/buscar`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/comerciantes`, changeFrequency: "daily", priority: 0.8 },
    ...cities.map((city) => ({ url: `${siteUrl}/c/${city}`, changeFrequency: "daily" as const, priority: 0.8 })),
    ...cities.flatMap((city) => categories.map((category) => ({
      url: `${siteUrl}/c/${city}/categoria/${category.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.7,
    }))),
    ...businesses.map((business) => ({
      url: `${siteUrl}/tiendas/${business.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...((productsResult.data ?? []) as { slug: string }[]).map((product) => ({
      url: `${siteUrl}/productos/${product.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];
}
