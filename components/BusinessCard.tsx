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
    <article className="card">
      <p className="kicker">{business.category}</p>
      <h3 style={{ margin: "8px 0", fontSize: "1.2rem" }}>
        <Link href={`/tiendas/${business.slug}`}>{business.name}</Link>
      </h3>
      <p className="muted">{business.address}</p>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          borderTop: "1px solid var(--line)",
          marginTop: 16,
          paddingTop: 12,
        }}
      >
        <Link className="btn" href={`/tiendas/${business.slug}`}>Ver tienda</Link>
        <DirectionsLink address={business.address} city={business.city} />
      </div>
    </article>
  );
}
