export type ProductRow = {
  id: string;
  name: string;
  slug: string;
  price: number | null;
  currency: string;
  stock: number | null;
  status: string;
  description: string | null;
  moderation_status: string;
  moderation_note: string | null;
  updated_at: string;
  business_id: string;
  business_name: string;
  business_slug: string;
  business_whatsapp: string | null;
  business_address: string | null;
  business_city: string | null;
  category_id: string | null;
  category_name: string | null;
  category_slug: string | null;
  subcategory_id: string | null;
  subcategory_name: string | null;
  subcategory_slug: string | null;
  product_images: { url: string }[];
  product_attribute_values: {
    attribute_label: string;
    attribute_value: string;
  }[];
  product_variants: {
    id: string;
    name: string;
    price: number | null;
    stock: number | null;
  }[];
};

export type BusinessRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  whatsapp: string | null;
  address: string | null;
  city: string | null;
  city_slug: string | null;
  status: string;
  category_name: string | null;
  logo_url: string | null;
  cover_url: string | null;
  business_hours: {
    day_of_week: number;
    open_time: string | null;
    close_time: string | null;
  }[];
};
