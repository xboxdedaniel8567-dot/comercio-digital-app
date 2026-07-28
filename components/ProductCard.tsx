import Link from "next/link";
import { InventoryBadge } from "@/components/InventoryBadge";

type ProductCardProps = {
  product: {
    name: string;
    slug: string;
    businessName: string;
    businessCity?: string | null;
    category: string;
    price: string;
    stock: number | null;
    attributes: string[];
    imageUrl?: string | null;
  };
  favoriteSlot?: React.ReactNode;
};

export function ProductCard({ product, favoriteSlot }: ProductCardProps) {
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
          <span className="product-card-media-placeholder" aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.5-3.5L9 20" />
            </svg>
          </span>
        )}
        {favoriteSlot ? <div className="product-card-favorite-overlay">{favoriteSlot}</div> : null}
      </div>
      <div className="product-card-body">
        <div className="product-card-header">
          <p className="product-card-category">{product.category}</p>
          <InventoryBadge stock={product.stock} />
        </div>
        <h3 className="product-card-title">{product.name}</h3>
        <strong className="product-card-price">{product.price}</strong>
        <div className="product-card-store-row">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 9l1.5-5h15L21 9M3 9v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9M3 9h18M9 21v-6h6v6" />
          </svg>
          <span className="product-card-store">{product.businessName}</span>
          {product.businessCity ? (
            <span className="product-card-city">{product.businessCity}</span>
          ) : null}
        </div>
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
