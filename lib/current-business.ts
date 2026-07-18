import { supabase } from "@/lib/supabase";

export type CurrentBusiness = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  city: string;
  address: string | null;
  neighborhood: string | null;
  shopping_center: string | null;
  floor: string | null;
  local_number: string | null;
  landmark: string | null;
  whatsapp: string | null;
  status: string;
  category_id: string | null;
  logo_url: string | null;
  cover_url: string | null;
};

export async function getCurrentBusiness() {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return {
      business: null,
      error: "Debes iniciar sesion para administrar una tienda.",
    };
  }

  const { data, error } = await supabase
    .from("businesses")
    .select("id, name, slug, description, city, address, neighborhood, shopping_center, floor, local_number, landmark, whatsapp, status, category_id, logo_url, cover_url")
    .eq("owner_id", userData.user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    return {
      business: null,
      error: error.message,
    };
  }

  if (!data) {
    return {
      business: null,
      error: "No encontramos una tienda asociada a esta cuenta.",
    };
  }

  return {
    business: data as CurrentBusiness,
    error: "",
  };
}
