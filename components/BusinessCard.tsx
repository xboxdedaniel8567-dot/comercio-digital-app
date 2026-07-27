import Link from "next/link";
import { DirectionsLink } from "@/components/DirectionsLink";

type BusinessCardProps = {
  business: {
    name: string;
    slug: string;
    category: string;
    city: string;
    address: string;
    status: string;
  };
};

export function BusinessCard({ business }: BusinessCardProps) {
  return (
    <article className="card" style={{ display: "grid", gap: 12, alignContent: "start" }}>
      <div>
        <p className="kicker">{business.category}</p>
        <h3 className="business-card-title">
          <Link href={`/tiendas/${business.slug}`}>
            {business.name}
          </Link>
        </h3>
        <p className="business-card-address">{business.address}</p>
        <p className="business-card-city">{business.city}</p>
      </div>
      <div className="business-card-actions">
        <Link className="btn" href={`/tiendas/${business.slug}`}>Ver tienda</Link>
        <DirectionsLink address={business.address} city={business.city} />
      </div>
    </article>
  );
}
