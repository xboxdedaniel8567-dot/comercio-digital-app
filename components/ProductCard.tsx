import Link from "next/link";
import { InventoryBadge } from "@/components/InventoryBadge";

type ProductCardProps = {
  product: {
    name: string;
    slug: string;
    businessName: string;
    category: string;
    price: string;
    stock: number | null;
    attributes: string[];
    imageUrl?: string | null;
  };
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      className="card"
      href={`/productos/${product.slug}`}
      style={{
        display: "grid",
        gap: 10,
        minHeight: 290,
        alignContent: "start",
      }}
    >
      <div
        style={{
          aspectRatio: "16 / 10",
          border: "1px solid var(--line)",
          background:
            "linear-gradient(135deg, #222 0%, #101010 50%, #070707 100%)",
          minHeight: 120,
          overflow: "hidden",
        }}
      >
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={product.name}
            src={product.imageUrl}
            style={{
              display: "block",
              height: "100%",
              objectFit: "contain",
              width: "100%",
            }}
          />
        ) : null}
      </div>
      <p className="kicker">{product.category}</p>
      <h3 style={{ margin: 0, fontSize: "1.05rem", lineHeight: 1.25 }}>
        {product.name}
      </h3>
      <strong style={{ fontSize: "1rem" }}>{product.price}</strong>
      <InventoryBadge stock={product.stock} />
      <p className="muted" style={{ margin: 0 }}>
        {product.businessName}
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
        {product.attributes.map((attribute) => (
          <span
            key={attribute}
            style={{
              border: "1px solid var(--line)",
              padding: "5px 8px",
              color: "var(--muted)",
              fontSize: "0.78rem",
            }}
          >
            {attribute}
          </span>
        ))}
      </div>
    </Link>
  );
}
