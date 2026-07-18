import Link from "next/link";
import { DashboardShell } from "@/components/DashboardShell";
import { adminLinks } from "@/lib/admin-links";
import { supabase } from "@/lib/supabase";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  description: string | null;
  price: number | null;
  stock: number | null;
  businesses: {
    name: string;
  } | null;
  product_images: {
    url: string;
  }[];
};

type BusinessRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  description: string | null;
  address: string | null;
  whatsapp: string | null;
};

type QualityIssue = {
  id: string;
  title: string;
  detail: string;
  type: "Producto" | "Comercio";
  priority: "Alta" | "Media" | "Baja";
  href: string;
};

function priorityColor(priority: QualityIssue["priority"]) {
  if (priority === "Alta") return "#ef4444";
  if (priority === "Media") return "#f59e0b";
  return "#10b981";
}

function productIssues(product: ProductRow): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const href = `/productos/${product.slug}`;

  if (!product.product_images?.length) {
    issues.push({
      detail: `${product.businesses?.name ?? "Tienda por confirmar"} debe subir al menos una foto real.`,
      href,
      id: `${product.id}-image`,
      priority: "Alta",
      title: `${product.name}: sin imagen`,
      type: "Producto",
    });
  }

  if ((product.stock ?? 0) <= 0) {
    issues.push({
      detail: "El producto no tiene stock disponible o no tiene stock confirmado.",
      href,
      id: `${product.id}-stock`,
      priority: product.status === "active" ? "Alta" : "Media",
      title: `${product.name}: revisar stock`,
      type: "Producto",
    });
  }

  if (!product.price || product.price <= 0) {
    issues.push({
      detail: "El producto necesita un precio claro para generar confianza.",
      href,
      id: `${product.id}-price`,
      priority: "Media",
      title: `${product.name}: sin precio valido`,
      type: "Producto",
    });
  }

  if (!product.description || product.description.trim().length < 25) {
    issues.push({
      detail: "La descripcion es muy corta. Conviene explicar estado, caracteristicas y disponibilidad.",
      href,
      id: `${product.id}-description`,
      priority: "Baja",
      title: `${product.name}: descripcion debil`,
      type: "Producto",
    });
  }

  return issues;
}

function businessIssues(business: BusinessRow): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const href = `/tiendas/${business.slug}`;

  if (!business.whatsapp) {
    issues.push({
      detail: "La tienda necesita WhatsApp para que los compradores puedan contactar al comerciante.",
      href,
      id: `${business.id}-whatsapp`,
      priority: "Alta",
      title: `${business.name}: sin WhatsApp`,
      type: "Comercio",
    });
  }

  if (!business.address) {
    issues.push({
      detail: "La tienda necesita una direccion visible para que el comprador pueda llegar.",
      href,
      id: `${business.id}-address`,
      priority: "Alta",
      title: `${business.name}: sin direccion`,
      type: "Comercio",
    });
  }

  if (!business.description || business.description.trim().length < 20) {
    issues.push({
      detail: "La tienda necesita una descripcion mas clara para transmitir confianza.",
      href,
      id: `${business.id}-description`,
      priority: "Media",
      title: `${business.name}: perfil incompleto`,
      type: "Comercio",
    });
  }

  if (business.status !== "active") {
    issues.push({
      detail: "La tienda no esta activa. Revisa si debe aprobarse, corregirse o mantenerse oculta.",
      href,
      id: `${business.id}-status`,
      priority: "Media",
      title: `${business.name}: estado ${business.status}`,
      type: "Comercio",
    });
  }

  return issues;
}

export default async function AdminQualityPage() {
  const [productsResult, businessesResult] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, slug, status, description, price, stock, businesses(name), product_images(url)")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("businesses")
      .select("id, name, slug, status, description, address, whatsapp")
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  const products = (productsResult.data ?? []) as ProductRow[];
  const businesses = (businessesResult.data ?? []) as BusinessRow[];
  const issues = [
    ...products.flatMap(productIssues),
    ...businesses.flatMap(businessIssues),
  ].sort((a, b) => {
    const order = { Alta: 0, Media: 1, Baja: 2 };
    return order[a.priority] - order[b.priority] || a.title.localeCompare(b.title);
  });

  const high = issues.filter((issue) => issue.priority === "Alta").length;
  const medium = issues.filter((issue) => issue.priority === "Media").length;
  const low = issues.filter((issue) => issue.priority === "Baja").length;

  return (
    <DashboardShell title="Calidad del marketplace" eyebrow="Admin" links={adminLinks}>
      <div className="grid-auto">
        {[
          ["Alertas altas", String(high)],
          ["Alertas medias", String(medium)],
          ["Alertas bajas", String(low)],
          ["Total por revisar", String(issues.length)],
        ].map(([label, value]) => (
          <div className="card" key={label}>
            <p className="muted">{label}</p>
            <strong style={{ fontSize: "1.6rem" }}>{value}</strong>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
        {productsResult.error || businessesResult.error ? (
          <div className="card" style={{ borderColor: "#ef4444" }}>
            <strong>No se pudo completar el diagnostico.</strong>
            <p className="muted">{productsResult.error?.message ?? businessesResult.error?.message}</p>
          </div>
        ) : null}

        {issues.map((issue) => (
          <div
            className="card"
            key={issue.id}
            style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr auto", alignItems: "center" }}
          >
            <div>
              <p className="kicker" style={{ color: priorityColor(issue.priority) }}>
                {issue.type} - prioridad {issue.priority}
              </p>
              <strong>{issue.title}</strong>
              <p className="muted" style={{ marginBottom: 0 }}>{issue.detail}</p>
            </div>
            <Link className="btn btn-dark" href={issue.href}>
              Revisar
            </Link>
          </div>
        ))}

        {!productsResult.error && !businessesResult.error && issues.length === 0 ? (
          <div className="card">
            <strong>Todo se ve bien por ahora.</strong>
            <p className="muted" style={{ marginBottom: 0 }}>
              No encontramos problemas importantes en productos o comercios registrados.
            </p>
          </div>
        ) : null}
      </div>
    </DashboardShell>
  );
}
