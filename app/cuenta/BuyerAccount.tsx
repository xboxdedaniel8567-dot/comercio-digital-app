"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogoutButton } from "@/components/LogoutButton";
import { ProductCard } from "@/components/ProductCard";
import { StatusBadge } from "@/components/StatusBadge";
import { supabase } from "@/lib/supabase";
import { PrivacyRequestCenter } from "./PrivacyRequestCenter";

type FavoriteRow = {
  id: string;
  products: {
    name: string;
    slug: string;
    price: number | null;
    currency: string;
    stock: number | null;
    businesses: { name: string } | null;
    categories: { name: string } | null;
    product_images: { url: string }[];
  } | null;
};

type SearchHistoryRow = {
  query: string;
  results_count: number | null;
  created_at: string;
};

type MarketplaceReportRow = {
  id: string;
  target_type: "business" | "product";
  reason: string;
  details: string;
  status: string;
  admin_note: string | null;
  created_at: string;
  products: { name: string; slug: string } | null;
  businesses: { name: string; slug: string } | null;
};

type ReservationRow = {
  id: string;
  quantity: number;
  buyer_note: string | null;
  status: string;
  merchant_note: string | null;
  created_at: string;
  products: { name: string; slug: string } | null;
  businesses: { name: string } | null;
  product_variants: { name: string } | null;
};

const reservationStatusLabels: Record<string, string> = {
  cancelled: "Cancelada",
  completed: "Completada",
  confirmed: "Confirmada",
  expired: "Vencida",
  pending: "Pendiente de la tienda",
  rejected: "Rechazada",
};

function reservationStatusTone(status: string) {
  if (["confirmed", "completed"].includes(status)) return "success" as const;
  if (["rejected", "cancelled"].includes(status)) return "danger" as const;
  if (status === "pending") return "warning" as const;
  if (status === "expired") return "neutral" as const;
  return "info" as const;
}

const reportStatusLabels: Record<string, string> = {
  dismissed: "Descartado",
  open: "Abierto",
  resolved: "Resuelto",
  under_review: "En revision",
};

const reportReasonLabels: Record<string, string> = {
  incorrect_information: "Informacion incorrecta",
  misleading: "Publicacion enganosa",
  other: "Otro motivo",
  prohibited: "Contenido prohibido",
  unavailable: "No esta disponible",
};

function formatPrice(price: number | null, currency: string) {
  if (price === null) return "Precio por consultar";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function BuyerAccount() {
  const [favorites, setFavorites] = useState<FavoriteRow[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryRow[]>([]);
  const [reports, setReports] = useState<MarketplaceReportRow[]>([]);
  const [reservations, setReservations] = useState<ReservationRow[]>([]);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [draftFullName, setDraftFullName] = useState("");
  const [draftPhone, setDraftPhone] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [message, setMessage] = useState("Cargando tu cuenta...");

  useEffect(() => {
    async function loadAccount() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        setIsLoggedIn(false);
        setMessage("");
        return;
      }

      setIsLoggedIn(true);

      const [
        { data: profile },
        { data: favoriteData, error },
        { data: searchData, error: searchError },
        { data: reportData, error: reportError },
        { data: reservationData, error: reservationError },
      ] = await Promise.all([
        supabase.from("profiles").select("full_name, phone, role").eq("id", user.id).maybeSingle(),
        supabase
          .from("favorites")
          .select("id, products!inner(name, slug, price, currency, stock, businesses(name), categories(name), product_images(url))")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("search_logs")
          .select("query, results_count, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(8),
        supabase
          .from("marketplace_reports")
          .select("id, target_type, reason, details, status, admin_note, created_at, products(name, slug), businesses(name, slug)")
          .eq("reporter_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("reservation_requests")
          .select("id, quantity, buyer_note, status, merchant_note, created_at, products(name, slug), businesses(name), product_variants(name)")
          .eq("buyer_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20),
      ]);

      if (profile?.role !== "buyer") {
        window.location.href = ["admin", "super_admin"].includes(profile?.role ?? "")
          ? "/admin"
          : "/panel";
        return;
      }

      const loadedName = profile.full_name ?? user.email ?? "Comprador";
      const loadedPhone = profile.phone ?? "";
      setFullName(loadedName);
      setPhone(loadedPhone);
      setDraftFullName(loadedName);
      setDraftPhone(loadedPhone);
      setFavorites((favoriteData ?? []) as FavoriteRow[]);
      setSearchHistory((searchData ?? []) as SearchHistoryRow[]);
      setReports((reportData ?? []) as MarketplaceReportRow[]);
      setReservations((reservationData ?? []) as ReservationRow[]);
      setMessage(
        error
          ? `No se pudieron cargar tus favoritos: ${error.message}`
          : searchError
            ? `No se pudo cargar tu historial: ${searchError.message}`
            : reportError
              ? `No se pudieron cargar tus reportes: ${reportError.message}`
              : reservationError
                ? `No se pudieron cargar tus reservas: ${reservationError.message}`
            : "",
      );
    }

    void loadAccount();
  }, []);

  async function removeFavorite(favoriteId: string) {
    const { error } = await supabase.from("favorites").delete().eq("id", favoriteId);
    if (!error) setFavorites((current) => current.filter((item) => item.id !== favoriteId));
  }

  async function clearSearchHistory() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { error } = await supabase
      .from("search_logs")
      .delete()
      .eq("user_id", userData.user.id);

    if (error) {
      setMessage(`No se pudo borrar el historial: ${error.message}`);
      return;
    }

    setSearchHistory([]);
    setMessage("Historial eliminado.");
  }

  async function cancelReservation(reservationId: string) {
    const { error } = await supabase.rpc("cancel_my_reservation", {
      p_reservation_id: reservationId,
    });

    if (error) {
      setMessage(`No se pudo cancelar la reserva: ${error.message}`);
      return;
    }

    setReservations((current) =>
      current.map((reservation) =>
        reservation.id === reservationId
          ? { ...reservation, status: "cancelled" }
          : reservation,
      ),
    );
    setMessage("Reserva cancelada.");
  }

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setProfileMessage("");

    const cleanName = draftFullName.trim();
    const cleanPhone = draftPhone.trim();
    const { data, error } = await supabase.rpc("update_my_buyer_profile", {
      p_full_name: cleanName,
      p_phone: cleanPhone,
    });

    if (error) {
      setProfileMessage(`No se pudo guardar: ${error.message}`);
      setIsSaving(false);
      return;
    }

    const updatedProfile = Array.isArray(data) ? data[0] : data;
    setFullName(updatedProfile?.full_name ?? cleanName);
    setPhone(updatedProfile?.phone ?? cleanPhone);
    setDraftFullName(updatedProfile?.full_name ?? cleanName);
    setDraftPhone(updatedProfile?.phone ?? cleanPhone);
    setProfileMessage("Perfil actualizado correctamente.");
    setIsEditing(false);
    setIsSaving(false);
  }

  if (isLoggedIn === null) return <p className="muted">{message}</p>;

  if (!isLoggedIn) {
    return (
      <div className="card" style={{ display: "grid", gap: 12 }}>
        <strong>Inicia sesion para ver tus productos guardados.</strong>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <Link className="btn" href="/panel/login?next=/cuenta">Iniciar sesion</Link>
          <Link className="btn btn-dark" href="/cuenta/registro">Crear cuenta</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div className="card" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 16 }}>
        <div>
          <span className="muted">Cuenta</span>
          <h2 style={{ margin: "6px 0 0" }}>{fullName}</h2>
          {phone ? <p className="muted" style={{ margin: "6px 0 0" }}>{phone}</p> : null}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
          <button className="btn btn-dark" onClick={() => setIsEditing((current) => !current)} type="button">
            {isEditing ? "Cancelar" : "Editar perfil"}
          </button>
          <LogoutButton />
        </div>
      </div>

      {isEditing ? (
        <form className="card" onSubmit={saveProfile} style={{ display: "grid", gap: 12 }}>
          <h2 style={{ margin: 0 }}>Datos personales</h2>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Nombre completo</span>
            <input
              maxLength={100}
              minLength={3}
              onChange={(event) => setDraftFullName(event.target.value)}
              required
              value={draftFullName}
            />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Telefono</span>
            <input
              inputMode="tel"
              maxLength={30}
              onChange={(event) => setDraftPhone(event.target.value)}
              placeholder="Ej. 322 584 0281"
              value={draftPhone}
            />
          </label>
          <button className="btn" disabled={isSaving} type="submit">
            {isSaving ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      ) : null}

      {profileMessage ? <p className="muted" role="status">{profileMessage}</p> : null}

      <section aria-labelledby="recent-searches">
        <div style={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between" }}>
          <h2 id="recent-searches" style={{ margin: 0 }}>Busquedas recientes</h2>
          {searchHistory.length > 0 ? (
            <button className="btn btn-dark" onClick={() => void clearSearchHistory()} type="button">
              Borrar historial
            </button>
          ) : null}
        </div>
        <div className="card" style={{ display: "grid", gap: 10, marginTop: 18 }}>
          {searchHistory.map((search, index) => (
            <Link
              href={`/buscar?q=${encodeURIComponent(search.query)}`}
              key={`${search.created_at}-${index}`}
              style={{
                alignItems: "center",
                borderBottom: index < searchHistory.length - 1 ? "1px solid var(--line)" : undefined,
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                paddingBottom: index < searchHistory.length - 1 ? 10 : 0,
              }}
            >
              <strong>{search.query}</strong>
              <span className="muted">{search.results_count ?? 0} resultados</span>
            </Link>
          ))}
          {searchHistory.length === 0 ? (
            <p className="muted" style={{ margin: 0 }}>Todavia no hay busquedas guardadas en esta cuenta.</p>
          ) : null}
        </div>
      </section>

      <section aria-labelledby="favorite-products">
        <h2 id="favorite-products">Productos guardados</h2>
        {message ? <p className="muted">{message}</p> : null}
        <div className="grid-auto" style={{ marginTop: 18 }}>
          {favorites.map((favorite) => {
            const product = favorite.products;
            if (!product) return null;

            return (
              <div key={favorite.id} style={{ display: "grid", gap: 8 }}>
                <ProductCard
                  product={{
                    attributes: [],
                    businessName: product.businesses?.name ?? "Tienda por confirmar",
                    category: product.categories?.name ?? "Sin categoria",
                    imageUrl: product.product_images?.[0]?.url ?? null,
                    name: product.name,
                    price: formatPrice(product.price, product.currency),
                    slug: product.slug,
                    stock: product.stock,
                  }}
                />
                <button className="btn btn-dark" onClick={() => void removeFavorite(favorite.id)} type="button">
                  Quitar de favoritos
                </button>
              </div>
            );
          })}
        </div>
        {!message && favorites.length === 0 ? (
          <div className="card" style={{ marginTop: 18 }}>
            <p className="muted">Todavia no has guardado productos.</p>
            <Link className="btn" href="/buscar">Buscar productos</Link>
          </div>
        ) : null}
      </section>

      <section aria-labelledby="my-reservations">
        <h2 id="my-reservations">Mis reservas</h2>
        <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
          {reservations.map((reservation) => (
            <article className="card" key={reservation.id} style={{ display: "grid", gap: 8 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "space-between" }}>
                <strong>{reservation.products?.name ?? "Producto no disponible"}</strong>
                <StatusBadge
                  label={reservationStatusLabels[reservation.status] ?? reservation.status}
                  tone={reservationStatusTone(reservation.status)}
                />
              </div>
              <p className="muted" style={{ margin: 0 }}>
                {reservation.businesses?.name ?? "Tienda no disponible"} - Cantidad: {reservation.quantity}
              </p>
              {reservation.product_variants?.name ? <p className="muted" style={{ margin: 0 }}>Variante: {reservation.product_variants.name}</p> : null}
              {reservation.buyer_note ? <p className="muted" style={{ margin: 0 }}>Tu nota: {reservation.buyer_note}</p> : null}
              {reservation.merchant_note ? <p style={{ margin: 0 }}><strong>Respuesta:</strong> {reservation.merchant_note}</p> : null}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {reservation.products?.slug ? <Link className="btn btn-dark" href={`/productos/${reservation.products.slug}`}>Ver producto</Link> : null}
                {["pending", "confirmed"].includes(reservation.status) ? (
                  <button className="btn btn-dark" onClick={() => void cancelReservation(reservation.id)} type="button">Cancelar reserva</button>
                ) : null}
              </div>
            </article>
          ))}
          {reservations.length === 0 ? <p className="muted">No tienes solicitudes de reserva.</p> : null}
        </div>
      </section>

      <section aria-labelledby="my-reports">
        <h2 id="my-reports">Mis reportes</h2>
        <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
          {reports.map((report) => {
            const target = report.target_type === "product" ? report.products : report.businesses;
            const href = report.target_type === "product"
              ? `/productos/${report.products?.slug ?? ""}`
              : `/tiendas/${report.businesses?.slug ?? ""}`;

            return (
              <article className="card" key={report.id} style={{ display: "grid", gap: 8 }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "space-between" }}>
                  <strong>{target?.name ?? "Publicacion no disponible"}</strong>
                  <span>{reportStatusLabels[report.status] ?? report.status}</span>
                </div>
                <span className="muted">{reportReasonLabels[report.reason] ?? report.reason}</span>
                <p className="muted" style={{ margin: 0 }}>{report.details}</p>
                {report.admin_note ? (
                  <p style={{ margin: 0 }}><strong>Respuesta:</strong> {report.admin_note}</p>
                ) : null}
                {target?.slug ? <Link className="btn btn-dark" href={href}>Ver publicacion</Link> : null}
              </article>
            );
          })}
          {reports.length === 0 ? <p className="muted">No has enviado reportes.</p> : null}
        </div>
      </section>

      <PrivacyRequestCenter />
    </div>
  );
}
