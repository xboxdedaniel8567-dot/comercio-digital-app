import { DashboardShell } from "@/components/DashboardShell";
import { adminLinks } from "@/lib/admin-links";
import { supabase } from "@/lib/supabase";
import { AttributeCreateForm } from "./AttributeCreateForm";
import { CategoryCreateForm } from "./CategoryCreateForm";
import { SubcategoryCreateForm } from "./SubcategoryCreateForm";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  product_count?: number;
};

type SubcategoryRow = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
};

type AttributeRow = {
  id: string;
  category_id: string;
  subcategory_id: string | null;
  name: string;
  input_type: string;
  is_required: boolean;
};

export default async function AdminCategoriesPage() {
  const [categoriesResult, subcategoriesResult, attributesResult] = await Promise.all([
    supabase.from("categories").select("id, name, slug, description").order("name"),
    supabase.from("subcategories").select("id, category_id, name, slug").order("name"),
    supabase
      .from("category_attributes")
      .select("id, category_id, subcategory_id, name, input_type, is_required")
      .order("sort_order")
      .order("name"),
  ]);

  const categories = (categoriesResult.data ?? []) as CategoryRow[];
  const subcategories = (subcategoriesResult.data ?? []) as SubcategoryRow[];
  const attributes = (attributesResult.data ?? []) as AttributeRow[];
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]));
  const subcategoryNames = new Map(
    subcategories.map((subcategory) => [subcategory.id, subcategory.name]),
  );
  const error =
    categoriesResult.error ?? subcategoriesResult.error ?? attributesResult.error;

  return (
    <DashboardShell title="Categorias" eyebrow="Admin" links={adminLinks}>
      <section className="admin-taxonomy-intro panel"><span className="eyebrow">Adaptive Business Engine</span><h2>Estructura del catalogo</h2><p className="muted">Crea categorias con cuidado: determinan filtros, formularios y la forma en que los compradores encuentran productos.</p></section>
      <div className="admin-taxonomy-forms">
        <CategoryCreateForm />
        <SubcategoryCreateForm />
        <AttributeCreateForm />
      </div>
      <section className="admin-taxonomy-section"><div className="admin-section-heading"><div><span className="eyebrow">Nivel 1</span><h2>Categorias principales</h2></div><span>{categories.length} registradas</span></div>
      <div className="admin-taxonomy-grid">
        {error ? (
          <div className="card" style={{ borderColor: "#ef4444" }}>
            <strong>No se pudieron cargar las categorias.</strong>
            <p className="muted">Intenta nuevamente en unos momentos.</p>
          </div>
        ) : null}
        {categories.map((category) => (
          <article className="admin-taxonomy-item" key={category.id}>
            <strong>{category.name}</strong>
            <p className="muted">{category.description ?? "Sin descripcion"}</p>
            <p className="muted" style={{ marginBottom: 0 }}>Slug: {category.slug}</p>
          </article>
        ))}
        {!error && categories.length === 0 ? (
          <p className="muted">Todavia no hay categorias registradas.</p>
        ) : null}
      </div>
      </section>
      <section className="admin-taxonomy-section">
        <div className="admin-section-heading"><div><span className="eyebrow">Nivel 2</span><h2>Subcategorias</h2></div><span>{subcategories.length} registradas</span></div>
        <div className="admin-taxonomy-grid">
          {subcategories.map((subcategory) => (
            <article className="admin-taxonomy-item" key={subcategory.id}>
              <span className="kicker">
                {categoryNames.get(subcategory.category_id) ?? "Categoria"}
              </span>
              <strong style={{ display: "block", marginTop: 8 }}>{subcategory.name}</strong>
              <p className="muted" style={{ marginBottom: 0 }}>Slug: {subcategory.slug}</p>
            </article>
          ))}
          {subcategories.length === 0 ? <p className="muted">Todavia no hay subcategorias.</p> : null}
        </div>
      </section>
      <section className="admin-taxonomy-section">
        <div className="admin-section-heading"><div><span className="eyebrow">Datos especializados</span><h2>Atributos adaptativos</h2></div><span>{attributes.length} configurados</span></div>
        <div className="admin-taxonomy-grid">
          {attributes.map((attribute) => (
            <article className="admin-taxonomy-item" key={attribute.id}>
              <span className="kicker">
                {categoryNames.get(attribute.category_id) ?? "Categoria"}
                {attribute.subcategory_id
                  ? ` / ${subcategoryNames.get(attribute.subcategory_id) ?? "Subcategoria"}`
                  : " / General"}
              </span>
              <strong style={{ display: "block", marginTop: 8 }}>{attribute.name}</strong>
              <p className="muted" style={{ marginBottom: 0 }}>
                Tipo: {attribute.input_type === "number" ? "Numero" : "Texto"}
                {attribute.is_required ? " - Obligatorio" : " - Opcional"}
              </p>
            </article>
          ))}
          {attributes.length === 0 ? <p className="muted">Todavia no hay atributos.</p> : null}
        </div>
      </section>
    </DashboardShell>
  );
}
