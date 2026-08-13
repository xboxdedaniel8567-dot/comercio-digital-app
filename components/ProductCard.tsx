import Link from "next/link";
import type { ReactNode } from "react";
import { AvailabilityBadge } from "@/components/AvailabilityBadge";
import { CommerceImage } from "@/components/CommerceImage";
import { DistanceDisplay } from "@/components/DistanceDisplay";
import { PriceDisplay } from "@/components/PriceDisplay";

export type ProductCardData = {
  name: string;
  slug: string;
  businessName: string;
  businessCity?: string | null;
  category: string;
  price: string | number | null;
  currency?: string | null;
  stock: number | null;
  attributes: string[];
  imageUrl?: string | null;
  distanceMeters?: number | null;
  promotionLabel?: string | null;
};

type ProductCardProps = {
  product: ProductCardData;
  favoriteSlot?: ReactNode;
  variant?: "grid" | "horizontal" | "mapPreview";
  imagePriority?: boolean;
};

export function ProductCard({ favoriteSlot, imagePriority = false, product, variant = "grid" }: ProductCardProps) {
  const href = `/productos/${product.slug}`;

  return (
    <article className={`product-card cd-product-card cd-product-card-${variant}`}>
      <div className="product-card-media cd-product-card-media">
        <Link aria-label={`Ver ${product.name}`} className="cd-product-card-media-link" href={href}>
          <CommerceImage
            alt={product.name}
            fallbackLabel={product.category}
            loading={imagePriority ? "eager" : "lazy"}
            sizes={variant === "horizontal" ? "(max-width: 640px) 36vw, 220px" : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"}
            src={product.imageUrl}
          />
        </Link>
        {product.promotionLabel ? <span className="cd-product-card-promotion">{product.promotionLabel}</span> : null}
        {favoriteSlot ? <div className="product-card-favorite-overlay">{favoriteSlot}</div> : null}
      </div>
      <div className="product-card-body cd-product-card-body">
        <p className="product-card-category">{product.category}</p>
        <h3 className="product-card-title">
          <Link className="cd-product-card-title-link" href={href}>{product.name}</Link>
        </h3>
        <PriceDisplay className="product-card-price" currency={product.currency} value={product.price} />
        <div className="cd-product-card-availability">
          <AvailabilityBadge stock={product.stock} />
          <DistanceDisplay distanceMeters={product.distanceMeters} />
        </div>
        <p className="cd-product-card-store">
          <span>{product.businessName}</span>
          {product.businessCity ? <span className="product-card-city">{product.businessCity}</span> : null}
        </p>
      </div>
    </article>
  );
}
