"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BusinessModerationActions } from "@/components/BusinessModerationActions";
import { supabase } from "@/lib/supabase";

type BusinessRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  city: string;
  address: string | null;
  whatsapp: string | null;
  categories: {
    name: string;
  } | null;
};

function statusLabel(status: string) {
  if (status === "active") return "Activo";
  if (status === "draft") return "Borrador";
  if (status === "pending_review") return "Pendiente";
  if (status === "suspended") return "Suspendido";
  if (status === "rejected") return "Rechazado";
  return status;
}

export function AdminBusinessesManager() {
  const [businesses, setBusinesses] = useState<BusinessRow[]>([]);
  const [message, setMessage] = useState("Cargando todos los comercios...");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBusinesses() {
      const { data, error: loadError } = await supabase
        .from("businesses")
        .select("id, name, slug, status, city, address, whatsapp, categories(name)")
        .order("created_at", { ascending: false })
        .limit(100);

      if (loadError) {
        setError(loadError.message);
        setMessage("");
        return;
      }

      setBusinesses((data ?? []) as BusinessRow[]);
      setMessage("");
    }

    void loadBusinesses();
  }, []);

  if (message) {
    return <p className="muted">{message}</p>;
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {error ? (
        <div className="card" style={{ borderColor: "#ef4444" }}>
          <strong>No se pudieron cargar los comercios.</strong>
          <p className="muted">{error}</p>
        </div>
      ) : null}
      {businesses.map((business) => (
        <div
          className="card"
          key={business.id}
          style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "space-between" }}
        >
          <div>
            <strong>{business.name}</strong>
            <p className="muted" style={{ marginBottom: 6 }}>
              {business.categories?.name ?? "Sin categoria"} - {business.city}
            </p>
            <p className="muted" style={{ margin: 0 }}>
              {business.address ?? "Direccion pendiente"}
            </p>
            <p className="muted" style={{ margin: 0 }}>
              WhatsApp: {business.whatsapp ?? "Pendiente"}
            </p>
          </div>
          <div className="admin-business-actions" style={{ display: "grid", gap: 10, justifyItems: "end", minWidth: 250 }}>
            <strong>{statusLabel(business.status)}</strong>
            {business.status === "active" ? (
              <Link className="btn btn-dark" href={`/tiendas/${business.slug}`}>
                Ver tienda
              </Link>
            ) : null}
            <BusinessModerationActions
              businessId={business.id}
              currentStatus={business.status}
            />
          </div>
        </div>
      ))}
      {!error && businesses.length === 0 ? (
        <p className="muted">Todavia no hay comercios registrados.</p>
      ) : null}
    </div>
  );
}
