import Link from "next/link";
import { CommerceImage } from "@/components/CommerceImage";
import { DirectionsLink } from "@/components/DirectionsLink";
import { DistanceDisplay } from "@/components/DistanceDisplay";

export type StoreCardData = {
  name: string;
  slug: string;
  category: string;
  city: string;
  address: string;
  status: string;
  imageUrl?: string | null;
  distanceMeters?: number | null;
  zone?: string | null;
  isSponsored?: boolean;
};

type BusinessCardProps = {
  business: StoreCardData;
  variant?: "standard" | "featured" | "mapPreview";
};

export function BusinessCard({ business, variant = "standard" }: BusinessCardProps) {
  const href = `/tiendas/${business.slug}`;

  return (
    <article className={`cd-store-card cd-store-card-${variant}`}>
      <Link aria-label={`Ver tienda ${business.name}`} className="cd-store-card-media-link" href={href}>
        <CommerceImage
          alt={`Fachada o identidad de ${business.name}`}
          fallbackLabel={business.name}
          sizes={variant === "featured" ? "(max-width: 640px) 100vw, 420px" : "(max-width: 640px) 32vw, 180px"}
          src={business.imageUrl}
        />
      </Link>
      <div className="cd-store-card-body">
        <div className="cd-store-card-topline">
          <p className="cd-store-card-category">{business.category}</p>
          {business.isSponsored ? <span className="cd-store-card-sponsored">Patrocinado</span> : null}
        </div>
        <h3 className="business-card-title cd-store-card-title">
          <Link href={href}>{business.name}</Link>
        </h3>
        <div className="cd-store-card-meta">
          <span>{business.status}</span>
          <DistanceDisplay distanceMeters={business.distanceMeters} />
        </div>
        <p className="business-card-address">{business.address}</p>
        <p className="business-card-city">{business.zone ?? business.city}</p>
        <div className="business-card-actions cd-store-card-actions">
          <Link className="btn" href={href}>Ver tienda</Link>
          <DirectionsLink address={business.address} city={business.city} />
        </div>
      </div>
    </article>
  );
}

export const StoreCard = BusinessCard;

export function FeaturedStoreCard({ business }: Omit<BusinessCardProps, "variant">) {
  return <BusinessCard business={business} variant="featured" />;
}

export function StoreMapPreview({ business }: Omit<BusinessCardProps, "variant">) {
  return <BusinessCard business={business} variant="mapPreview" />;
}
