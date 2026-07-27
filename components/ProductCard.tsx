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
    <Link className="product-card" href={`/productos/${product.slug}`}>
      <div className="product-card-media">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={product.name}
            decoding="async"
            loading="lazy"
            src={product.imageUrl}
          />
        ) : (
          <span style={{ color: "var(--subtle)", fontSize: "0.85rem" }}>Sin imagen</span>
        )}
      </div>
      <div className="product-card-body">
        <p className="product-card-category">{product.category}</p>
        <h3 className="product-card-title">{product.name}</h3>
        <strong className="product-card-price">{product.price}</strong>
        <p className="product-card-store">{product.businessName}</p>
        <InventoryBadge stock={product.stock} />
        {product.attributes.length > 0 ? (
          <div className="product-card-attributes">
            {product.attributes.map((attribute) => (
              <span className="product-card-attribute" key={attribute}>
                {attribute}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
