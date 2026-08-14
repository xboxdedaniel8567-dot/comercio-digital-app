import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { CompareButton } from "@/components/CompareButton";
import { CompareTray } from "@/components/CompareTray";
import { StoreCard, type StoreCardData } from "@/components/StoreCard";
import { PriceFilterInputs } from "@/components/PriceFilterInputs";
import { ProductCard } from "@/components/ProductCard";
import { SearchLogger } from "@/components/SearchLogger";
import { SearchSortControl } from "@/components/SearchSortControl";
import { formatPrice } from "@/lib/format-price";
import { supabase } from "@/lib/supabase";
import { firstRelation } from "@/lib/supabase-relations";

type SearchPageProps = {
  searchParams?: Promise<{
    category?: string;
    city?: string;
    max_price?: string;
    min_price?: string;
    page?: string;
    q?: string;
    sort?: string;
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
    id: string;
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

type BusinessRow = {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  address: string | null;
  logo_url: string | null;
  cover_url: string | null;
  categories: {
    name: string;
    slug: string;
  } | null;
};



type SortOption =
  | "relevance"
  | "price_asc"
  | "price_desc"
  | "availability";

const sortLabels: Record<SortOption, string> = {
  relevance: "Más relevantes",
  price_asc: "Precio: menor a mayor",
  price_desc: "Precio: mayor a menor",
  availability: "Disponibilidad",
};


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
  const sortParam = (params?.sort?.trim() ?? "relevance") as SortOption;
  const sort: SortOption = sortParam in sortLabels ? sortParam : "relevance";
  const pageSize = 24;

  let businessesQuery = supabase
    .from("businesses")
    .select("id, name, slug, city, address, logo_url, cover_url, categories!inner(name, slug)")
    .eq("status", "active")
    .order("name")
    .limit(6);

  if (query) businessesQuery = businessesQuery.ilike("name", `%${query}%`);
  if (cityFilter) businessesQuery = businessesQuery.ilike("city", `%${cityFilter}%`);
  if (categoryFilter) businessesQuery = businessesQuery.eq("categories.slug", categoryFilter);

  const [searchResult, categoriesResult, subcategoriesResult, businessesResult] = await Promise.all([
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
    businessesQuery,
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
          "id, name, slug, description, price, currency, stock, businesses!inner(id, name, city), categories(name, slug), subcategories(id, name), product_images(url), product_attribute_values(value, category_attributes(name)), product_variants(name, option_values, stock)",
        )
        .in("id", productIds)
        .eq("status", "active")
        .eq("moderation_status", "approved")
        .eq("businesses.status", "active")
    : { data: [], error: null };
  const error = searchResult.error ?? productsResult.error;
  const categories = (categoriesResult.data ?? []) as CategoryOption[];
  const subcategories: SubcategoryOption[] = (subcategoriesResult.data ?? []).map(
    (subcategory) => ({
      ...subcategory,
      categories: firstRelation(subcategory.categories),
    }),
  );
  const rankByProduct = new Map(
    rankedResults.map((result, index) => [result.product_id, index]),
  );

  let productRows: ProductRow[] = (productsResult.data ?? []).map((product) => ({
    ...product,
    businesses: firstRelation(product.businesses),
    categories: firstRelation(product.categories),
    subcategories: firstRelation(product.subcategories),
    product_attribute_values: product.product_attribute_values.map((attribute) => ({
      ...attribute,
      category_attributes: firstRelation(attribute.category_attributes),
    })),
  })).sort(
    (first, second) =>
      (rankByProduct.get(first.id) ?? Number.MAX_SAFE_INTEGER) -
      (rankByProduct.get(second.id) ?? Number.MAX_SAFE_INTEGER),
  );

  if (sort === "price_asc") {
    productRows = [...productRows].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
  } else if (sort === "price_desc") {
    productRows = [...productRows].sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
  } else if (sort === "availability") {
    productRows = [...productRows].sort((a, b) => {
      const aStock = a.stock ?? Infinity;
      const bStock = b.stock ?? Infinity;
      return aStock - bStock;
    });
  }

  const products = productRows.map((product) => ({
    name: product.name,
    slug: product.slug,
    businessName: product.businesses?.name ?? "Tienda por confirmar",
    businessCity: product.businesses?.city ?? null,
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
    if (sort !== "relevance") nextParams.set("sort", sort);
    if (targetPage > 1) nextParams.set("page", String(targetPage));
    const queryString = nextParams.toString();
    return queryString ? `/buscar?${queryString}` : "/buscar";
  }

  const productBusinessIds = [...new Set(productRows.map((product) => product.businesses?.id).filter(Boolean))] as string[];
  const productBusinessesResult = query && productBusinessIds.length > 0
    ? await supabase
        .from("businesses")
        .select("id, name, slug, city, address, logo_url, cover_url, categories!inner(name, slug)")
        .in("id", productBusinessIds)
        .eq("status", "active")
        .limit(6)
    : { data: [], error: null };
  const businessRows = [...(businessesResult.data ?? []), ...(productBusinessesResult.data ?? [])]
    .filter((business, index, rows) => rows.findIndex((candidate) => candidate.id === business.id) === index)
    .slice(0, 6);
  const businesses: StoreCardData[] = businessRows.map((business) => {
    const row = {
      ...business,
      categories: firstRelation(business.categories),
    } as BusinessRow;

    return {
      address: row.address ?? "Ubicacion por confirmar",
      category: row.categories?.name ?? "Comercio local",
      city: row.city ?? "Ciudad por confirmar",
      imageUrl: row.cover_url ?? row.logo_url,
      name: row.name,
      slug: row.slug,
      status: "Tienda activa",
    };
  });

  function categoryHref(slug: string) {
    const nextParams = new URLSearchParams();
    if (query) nextParams.set("q", query);
    if (cityFilter) nextParams.set("city", cityFilter);
    if (slug) nextParams.set("category", slug);
    const queryString = nextParams.toString();
    return queryString ? `/buscar?${queryString}` : "/buscar";
  }

  function sortHref(targetSort: SortOption) {
    const nextParams = new URLSearchParams();
    if (query) nextParams.set("q", query);
    if (cityFilter) nextParams.set("city", cityFilter);
    if (categoryFilter) nextParams.set("category", categoryFilter);
    if (subcategoryFilter) nextParams.set("subcategory", subcategoryFilter);
    if (minPrice !== null) nextParams.set("min_price", String(minPrice));
    if (maxPrice !== null) nextParams.set("max_price", String(maxPrice));
    if (targetSort !== "relevance") nextParams.set("sort", targetSort);
    const queryString = nextParams.toString();
    return queryString ? `/buscar?${queryString}` : "/buscar";
  }

  function renderFilters(prefix: string) {
    return (
      <>
        <input name="q" type="hidden" value={query} />
        {sort !== "relevance" ? <input name="sort" type="hidden" value={sort} /> : null}
        <label className="search-filter-group" htmlFor={`${prefix}-city`}>
          <span>Ubicacion</span>
          <input
            className="input"
            defaultValue={cityFilter}
            id={`${prefix}-city`}
            name="city"
            placeholder="Ej: Cali"
          />
        </label>
        <label className="search-filter-group" htmlFor={`${prefix}-category`}>
          <span>Categoria</span>
          <select className="input" defaultValue={categoryFilter} id={`${prefix}-category`} name="category">
            <option value="">Todas las categorias</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>{category.name}</option>
            ))}
          </select>
        </label>
        <label className="search-filter-group" htmlFor={`${prefix}-subcategory`}>
          <span>Subcategoria</span>
          <select className="input" defaultValue={subcategoryFilter} id={`${prefix}-subcategory`} name="subcategory">
            <option value="">Todas las subcategorias</option>
            {subcategories.map((subcategory) => (
              <option key={subcategory.id} value={subcategory.id}>
                {subcategory.categories?.name ? `${subcategory.categories.name} / ` : ""}{subcategory.name}
              </option>
            ))}
          </select>
        </label>
        <fieldset className="search-filter-group">
          <legend>Rango de precio</legend>
          <PriceFilterInputs
            initialMax={params?.max_price}
            initialMin={params?.min_price}
            prefix={prefix}
          />
        </fieldset>
        <div className="search-filter-actions">
          <button className="btn" type="submit">Aplicar filtros</button>
          <Link className="btn btn-dark" href={query ? `/buscar?q=${encodeURIComponent(query)}` : "/buscar"}>
            Limpiar
          </Link>
        </div>
      </>
    );
  }

  return (
    <main className="shell">
      <AppHeader />
      <SearchLogger query={query} resultsCount={totalResults} city={cityFilter} />
      <section className="container section search-page">
        <header className="search-heading">
          <p className="kicker">Marketplace local</p>
          <h1>{query ? `Resultados para “${query}”` : "Encuentra lo que buscas"}</h1>
          <p>
            {cityFilter
              ? `Productos disponibles en comercios de ${cityFilter}.`
              : "Compara opciones y contacta directamente a comercios fisicos."}
          </p>
        </header>
        <form action="/buscar" className="search-primary-form">
          {cityFilter ? <input name="city" type="hidden" value={cityFilter} /> : null}
          {categoryFilter ? <input name="category" type="hidden" value={categoryFilter} /> : null}
          {subcategoryFilter ? <input name="subcategory" type="hidden" value={subcategoryFilter} /> : null}
          {minPrice !== null ? <input name="min_price" type="hidden" value={minPrice} /> : null}
          {maxPrice !== null ? <input name="max_price" type="hidden" value={maxPrice} /> : null}
          {sort !== "relevance" ? <input name="sort" type="hidden" value={sort} /> : null}
          <div className="search-submit-row">
            <label className="sr-only" htmlFor="marketplace-search">Buscar productos</label>
            <input
              className="input"
              defaultValue={query}
              id="marketplace-search"
              name="q"
              placeholder="Buscar productos, marcas o tiendas"
            />
            <button className="btn" type="submit">Buscar</button>
          </div>
        </form>

        <nav aria-label="Categorias del marketplace" className="search-category-strip">
          <Link
            aria-current={!categoryFilter ? "page" : undefined}
            className="search-category-chip"
            href={categoryHref("")}
          >
            Todas
          </Link>
          {categories.slice(0, 8).map((category) => (
            <Link
              aria-current={categoryFilter === category.slug ? "page" : undefined}
              className="search-category-chip"
              href={categoryHref(category.slug)}
              key={category.id}
            >
              {category.name}
            </Link>
          ))}
          <Link className="search-category-more" href="/buscar">Ver todas</Link>
        </nav>

        <details className="search-mobile-filters">
          <summary>Filtros de busqueda</summary>
          <form action="/buscar" className="search-filter-form">
            {renderFilters("mobile-filter")}
          </form>
        </details>

        <div className="search-results-layout">
          <aside className="search-filter-sidebar" aria-label="Filtros de busqueda">
            <div className="search-filter-sidebar-heading">
              <strong>Filtros</strong>
              <Link href={query ? `/buscar?q=${encodeURIComponent(query)}` : "/buscar"}>Limpiar</Link>
            </div>
            <form action="/buscar" className="search-filter-form">
              {renderFilters("desktop-filter")}
            </form>
          </aside>

          <div className="search-results-main">
            <CompareTray />
            {!error ? (
              <div className="search-results-toolbar">
                <p>
                  <strong>{totalResults}</strong> {totalResults === 1 ? "resultado" : "resultados"}
                </p>
                <div className="search-sort-group">
                  <SearchSortControl currentSort={sort} />
                </div>
                {totalPages > 1 ? <span>Pagina {currentPage} de {totalPages}</span> : null}
              </div>
            ) : null}
            {error ? (
              <div className="search-error" role="alert">
                <strong>No pudimos cargar los productos.</strong>
                <p>Intenta nuevamente en unos momentos o ajusta tu busqueda.</p>
              </div>
            ) : null}
            {!error && products.length > 0 ? (
              <div className="search-product-grid">
                {products.map((product) => (
                  <div className="search-product-item" key={product.slug}>
                    <ProductCard product={product} />
                    <CompareButton compact name={product.name} slug={product.slug} />
                  </div>
                ))}
              </div>
            ) : null}
            {!error && products.length === 0 && businesses.length === 0 ? (
              <section className="search-empty-state">
                <span>Sin coincidencias</span>
                <h2>No encontramos resultados{query ? ` para “${query}”` : ""}</h2>
                <p>Prueba con menos palabras, revisa la escritura o elimina alguno de los filtros.</p>
                <div>
                  <Link className="btn" href="/buscar">Explorar productos</Link>
                  <Link className="btn btn-dark" href="/">Volver al inicio</Link>
                </div>
              </section>
            ) : null}
            {!error && totalPages > 1 ? (
              <nav aria-label="Paginacion de resultados" className="search-pagination">
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

            {!businessesResult.error && !productBusinessesResult.error && businesses.length > 0 ? (
              <section className="search-store-results">
                <div className="search-section-heading">
                  <div>
                    <span>Comercios</span>
                    <h2>{query ? "Tiendas relacionadas" : "Comercios para explorar"}</h2>
                  </div>
                  <Link href="/comerciantes">Ver directorio</Link>
                </div>
                <div className="search-store-grid">
                  {businesses.map((business) => (
                    <StoreCard business={business} key={business.slug} />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
