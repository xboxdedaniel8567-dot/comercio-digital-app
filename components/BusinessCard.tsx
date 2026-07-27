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
        <h3 style={{ margin: "8px 0 6px", fontSize: "1.2rem", fontWeight: 700, letterSpacing: "-0.01em" }}>
          <Link href={`/tiendas/${business.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
            {business.name}
          </Link>
        </h3>
        <p className="muted" style={{ fontSize: "0.92rem" }}>{business.address}</p>
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          borderTop: "1px solid var(--line)",
          marginTop: 4,
          paddingTop: 14,
        }}
      >
        <Link className="btn" href={`/tiendas/${business.slug}`}>Ver tienda</Link>
        <DirectionsLink address={business.address} city={business.city} />
      </div>
    </article>
  );
}
