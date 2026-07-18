import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { CompareButton } from "@/components/CompareButton";
import { CompareTray } from "@/components/CompareTray";
import { ProductCard } from "@/components/ProductCard";
import { SearchLogger } from "@/components/SearchLogger";
import { supabase } from "@/lib/supabase";

type SearchPageProps = {
  searchParams?: Promise<{
    category?: string;
    city?: string;
    max_price?: string;
    min_price?: string;
    page?: string;
    q?: string;
    subcategory?: string;
  }>;
};

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number | null;
  currency: string;
  stock: number | null;
  businesses: {
    city: string | null;
    name: string;
  } | null;
  categories: {
    name: string;
    slug: string;
  } | null;
  subcategories: {
    id: string;
    name: string;
  } | null;
  product_images: {
    url: string;
  }[];
  product_attribute_values: {
    value: string;
    category_attributes: {
      name: string;
    } | null;
  }[];
  product_variants: {
    name: string;
    option_values: Record<string, string>;
    stock: number;
  }[];
};

type SearchResult = {
  product_id: string;
  relevance: number;
};

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
};

type SubcategoryOption = {
  id: string;
  name: string;
  categories: {
    name: string;
  } | null;
};

function formatPrice(price: number | null, currency: string) {
  if (price === null) return "Precio por consultar";

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params?.q?.trim() ?? "";
  const categoryFilter = params?.category?.trim() ?? "";
  const subcategoryFilter = params?.subcategory?.trim() ?? "";
  const cityFilter = params?.city?.trim() ?? "";
  const parsedMinPrice = Number(params?.min_price ?? "");
  const parsedMaxPrice = Number(params?.max_price ?? "");
  const minPrice = Number.isFinite(parsedMinPrice) && parsedMinPrice >= 0 && params?.min_price ? parsedMinPrice : null;
  const maxPrice = Number.isFinite(parsedMaxPrice) && parsedMaxPrice >= 0 && params?.max_price ? parsedMaxPrice : null;
  const parsedPage = Number.parseInt(params?.page ?? "1", 10);
  const requestedPage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const pageSize = 24;

  const [searchResult, categoriesResult, subcategoriesResult] = await Promise.all([
    supabase.rpc("search_marketplace_products", {
      category_slug: categoryFilter,
      city_query: cityFilter,
      maximum_price: maxPrice,
      minimum_price: minPrice,
      result_limit: 200,
      search_query: query,
      subcategory_filter: subcategoryFilter || null,
    }),
    supabase.from("categories").select("id, name, slug").order("name"),
    supabase
      .from("subcategories")
      .select("id, name, categories(name)")
      .eq("is_active", true)
      .order("name"),
  ]);

  const rankedResults = (searchResult.data ?? []) as SearchResult[];
  const totalResults = rankedResults.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
  const currentPage = Math.min(requestedPage, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const productIds = rankedResults
    .slice(pageStart, pageStart + pageSize)
    .map((result) => result.product_id);
  const productsResult = productIds.length > 0
    ? await supabase
        .from("products")
        .select(
          "id, name, slug, description, price, currency, stock, businesses!inner(name, city), categories(name, slug), subcategories(id, name), product_images(url), product_attribute_values(value, category_attributes(name)), product_variants(name, option_values, stock)",
        )
        .in("id", productIds)
        .eq("status", "active")
        .eq("moderation_status", "approved")
        .eq("businesses.status", "active")
    : { data: [], error: null };
  const error = searchResult.error ?? productsResult.error;
  const categories = (categoriesResult.data ?? []) as CategoryOption[];
  const subcategories = (subcategoriesResult.data ?? []) as SubcategoryOption[];
  const rankByProduct = new Map(
    rankedResults.map((result, index) => [result.product_id, index]),
  );
  const productRows = ((productsResult.data ?? []) as ProductRow[]).sort(
    (first, second) =>
      (rankByProduct.get(first.id) ?? Number.MAX_SAFE_INTEGER) -
      (rankByProduct.get(second.id) ?? Number.MAX_SAFE_INTEGER),
  );
  const products = productRows.map((product) => ({
    name: product.name,
    slug: product.slug,
    businessName: product.businesses?.name ?? "Tienda por confirmar",
    category: [product.categories?.name, product.subcategories?.name].filter(Boolean).join(" / ") || "Sin categoria",
    price: formatPrice(product.price, product.currency),
    stock: product.stock,
    attributes: [
      ...(product.product_attribute_values ?? [])
        .slice(0, 2)
        .map(
          (attribute) =>
            `${attribute.category_attributes?.name ?? "Detalle"}: ${attribute.value}`,
        ),
      ...(product.product_variants ?? [])
        .filter((variant) => variant.stock > 0)
        .slice(0, 1)
        .map((variant) => `Opcion: ${variant.name}`),
    ],
    imageUrl: product.product_images?.[0]?.url ?? null,
  }));

  function paginationHref(targetPage: number) {
    const nextParams = new URLSearchParams();
    if (query) nextParams.set("q", query);
    if (cityFilter) nextParams.set("city", cityFilter);
    if (categoryFilter) nextParams.set("category", categoryFilter);
    if (subcategoryFilter) nextParams.set("subcategory", subcategoryFilter);
    if (minPrice !== null) nextParams.set("min_price", String(minPrice));
    if (maxPrice !== null) nextParams.set("max_price", String(maxPrice));
    if (targetPage > 1) nextParams.set("page", String(targetPage));
    const queryString = nextParams.toString();
    return queryString ? `/buscar?${queryString}` : "/buscar";
  }

  return (
    <main className="shell">
      <AppHeader />
      <SearchLogger query={query} resultsCount={totalResults} />
      <section className="container section">
        <p className="kicker">Marketplace</p>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 4.6rem)", margin: "10px 0" }}>
          Buscar productos
        </h1>
        <form action="/buscar" style={{ display: "grid", gap: 10 }}>
          <div className="search-submit-row" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 10 }}>
            <input
              className="input"
              defaultValue={query}
              name="q"
              placeholder="Ej: celular Samsung, tenis blancos, perfume"
            />
            <button className="btn" type="submit">Buscar</button>
          </div>
          <div className="grid-auto">
            <input className="input" defaultValue={cityFilter} name="city" placeholder="Ciudad. Ej: Cali" />
            <select className="input" defaultValue={categoryFilter} name="category">
              <option value="">Todas las categorias</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>{category.name}</option>
              ))}
            </select>
            <select className="input" defaultValue={subcategoryFilter} name="subcategory">
              <option value="">Todas las subcategorias</option>
              {subcategories.map((subcategory) => (
                <option key={subcategory.id} value={subcategory.id}>
                  {subcategory.categories?.name ? `${subcategory.categories.name} / ` : ""}{subcategory.name}
                </option>
              ))}
            </select>
            <input className="input" defaultValue={params?.min_price ?? ""} min="0" name="min_price" placeholder="Precio minimo" type="number" />
            <input className="input" defaultValue={params?.max_price ?? ""} min="0" name="max_price" placeholder="Precio maximo" type="number" />
          </div>
          {query || categoryFilter || subcategoryFilter || cityFilter || minPrice !== null || maxPrice !== null ? (
            <Link className="muted" href="/buscar" style={{ justifySelf: "start" }}>Limpiar filtros</Link>
          ) : null}
        </form>
        <CompareTray />
        {!error && totalResults > 0 ? (
          <div style={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "space-between", marginTop: 24 }}>
            <p className="muted" style={{ margin: 0 }}>
              {totalResults} {totalResults === 1 ? "resultado" : "resultados"} - Pagina {currentPage} de {totalPages}
            </p>
          </div>
        ) : null}
        {error ? (
          <div className="card" style={{ borderColor: "#ef4444", marginTop: 24 }}>
            <strong>No se pudo consultar Supabase.</strong>
            <p className="muted">{error.message}</p>
          </div>
        ) : null}
        <div className="grid-auto" style={{ marginTop: 24 }}>
          {products.map((product) => (
            <div key={product.slug} style={{ display: "grid", gap: 8 }}>
              <ProductCard product={product} />
              <CompareButton name={product.name} slug={product.slug} />
            </div>
          ))}
        </div>
        {!error && products.length === 0 ? (
          <div className="card" style={{ marginTop: 24 }}>
            <strong>No encontramos coincidencias.</strong>
            <p className="muted" style={{ marginBottom: 0 }}>
              Prueba con menos palabras, otro nombre del producto o elimina alguno de los filtros.
            </p>
          </div>
        ) : null}
        {!error && totalPages > 1 ? (
          <nav aria-label="Paginacion de resultados" style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginTop: 28 }}>
            {currentPage > 1 ? <Link className="btn btn-dark" href={paginationHref(currentPage - 1)}>Anterior</Link> : null}
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <Link
                aria-current={pageNumber === currentPage ? "page" : undefined}
                className={pageNumber === currentPage ? "btn" : "btn btn-dark"}
                href={paginationHref(pageNumber)}
                key={pageNumber}
              >
                {pageNumber}
              </Link>
            ))}
            {currentPage < totalPages ? <Link className="btn btn-dark" href={paginationHref(currentPage + 1)}>Siguiente</Link> : null}
          </nav>
        ) : null}
      </section>
    </main>
  );
}
