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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
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

  if (isLoggedIn === null) {
    return <div className="account-loading" role="status">{message}</div>;
  }

  if (!isLoggedIn) {
    return (
      <div className="account-guest-state">
        <p className="kicker">Acceso necesario</p>
        <h2>Inicia sesion para ver tu actividad</h2>
        <p className="muted">Tus favoritos, reservas y busquedas se guardan de forma privada en tu cuenta.</p>
        <div className="account-guest-actions">
          <Link className="btn" href="/panel/login?next=/cuenta">Iniciar sesion</Link>
          <Link className="btn btn-dark" href="/cuenta/registro">Crear cuenta</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="buyer-account-layout">
      <aside className="buyer-account-sidebar" aria-label="Secciones de la cuenta">
        <div className="buyer-account-person">
          <span className="buyer-account-avatar" aria-hidden="true">
            {fullName.trim().charAt(0).toUpperCase() || "C"}
          </span>
          <div>
            <strong>{fullName}</strong>
            <span>{phone || "Telefono sin registrar"}</span>
          </div>
        </div>
        <nav>
          <a href="#resumen">Resumen</a>
          <a href="#busquedas">Busquedas</a>
          <a href="#favoritos">Favoritos</a>
          <a href="#reservas">Reservas</a>
          <a href="#reportes">Reportes</a>
          <a href="#privacidad">Privacidad</a>
        </nav>
        <LogoutButton />
      </aside>

      <div className="buyer-account-content">
        <section className="buyer-account-overview" id="resumen" aria-labelledby="account-summary-title">
          <div className="account-profile-heading">
            <div>
              <p className="kicker">Resumen de cuenta</p>
              <h2 id="account-summary-title">Hola, {fullName.split(" ")[0]}</h2>
              <p className="muted">Aqui puedes consultar y administrar tu actividad en Comercio Digital.</p>
            </div>
            <button className="btn btn-dark" onClick={() => setIsEditing((current) => !current)} type="button">
              {isEditing ? "Cancelar edicion" : "Editar perfil"}
            </button>
          </div>

          <div className="account-stat-grid">
            <a href="#favoritos"><span>Favoritos</span><strong>{favorites.length}</strong></a>
            <a href="#reservas"><span>Reservas</span><strong>{reservations.length}</strong></a>
            <a href="#busquedas"><span>Busquedas</span><strong>{searchHistory.length}</strong></a>
            <a href="#reportes"><span>Reportes</span><strong>{reports.length}</strong></a>
          </div>
        </section>

        {isEditing ? (
          <form className="account-profile-form" onSubmit={saveProfile}>
            <h2>Datos personales</h2>
            <div className="account-form-grid">
              <label>
                <span>Nombre completo</span>
                <input maxLength={100} minLength={3} onChange={(event) => setDraftFullName(event.target.value)} required value={draftFullName} />
              </label>
              <label>
                <span>Telefono</span>
                <input inputMode="tel" maxLength={30} onChange={(event) => setDraftPhone(event.target.value)} placeholder="Ej. 322 584 0281" value={draftPhone} />
              </label>
            </div>
            <button className="btn" disabled={isSaving} type="submit">{isSaving ? "Guardando..." : "Guardar cambios"}</button>
          </form>
        ) : null}

        {profileMessage ? <p className="account-feedback" role="status">{profileMessage}</p> : null}
        {message ? <p className="account-feedback" role="status">{message}</p> : null}

        <section className="account-section" id="busquedas" aria-labelledby="recent-searches">
          <header className="account-section-heading">
            <div><p className="kicker">Actividad</p><h2 id="recent-searches">Busquedas recientes</h2></div>
            {searchHistory.length > 0 ? <button className="text-action" onClick={() => void clearSearchHistory()} type="button">Borrar historial</button> : null}
          </header>
          {searchHistory.length > 0 ? (
            <div className="account-search-list">
              {searchHistory.map((search, index) => (
                <Link href={`/buscar?q=${encodeURIComponent(search.query)}`} key={`${search.created_at}-${index}`}>
                  <span><strong>{search.query}</strong><small>{formatDate(search.created_at)}</small></span>
                  <span>{search.results_count ?? 0} resultados</span>
                </Link>
              ))}
            </div>
          ) : <div className="account-empty"><p>Todavia no hay busquedas guardadas.</p><Link className="btn btn-dark" href="/buscar">Comenzar a buscar</Link></div>}
        </section>

        <section className="account-section" id="favoritos" aria-labelledby="favorite-products">
          <header className="account-section-heading"><div><p className="kicker">Guardados</p><h2 id="favorite-products">Productos favoritos</h2></div><span>{favorites.length} guardados</span></header>
          {favorites.length > 0 ? (
            <div className="account-favorites-grid">
              {favorites.map((favorite) => {
                const product = favorite.products;
                if (!product) return null;
                return (
                  <div className="account-favorite-item" key={favorite.id}>
                    <ProductCard product={{ attributes: [], businessName: product.businesses?.name ?? "Tienda por confirmar", category: product.categories?.name ?? "Sin categoria", imageUrl: product.product_images?.[0]?.url ?? null, name: product.name, price: formatPrice(product.price, product.currency), slug: product.slug, stock: product.stock }} />
                    <button className="text-action danger-text" onClick={() => void removeFavorite(favorite.id)} type="button">Quitar de favoritos</button>
                  </div>
                );
              })}
            </div>
          ) : <div className="account-empty"><p>Todavia no has guardado productos.</p><Link className="btn" href="/buscar">Explorar productos</Link></div>}
        </section>

        <section className="account-section" id="reservas" aria-labelledby="my-reservations">
          <header className="account-section-heading"><div><p className="kicker">Solicitudes</p><h2 id="my-reservations">Mis reservas</h2></div><span>{reservations.length} solicitudes</span></header>
          {reservations.length > 0 ? <div className="account-record-list">
            {reservations.map((reservation) => (
              <article className="account-record" key={reservation.id}>
                <div className="account-record-heading"><div><strong>{reservation.products?.name ?? "Producto no disponible"}</strong><span>{reservation.businesses?.name ?? "Tienda no disponible"}</span></div><StatusBadge label={reservationStatusLabels[reservation.status] ?? reservation.status} tone={reservationStatusTone(reservation.status)} /></div>
                <dl className="account-record-details"><div><dt>Cantidad</dt><dd>{reservation.quantity}</dd></div>{reservation.product_variants?.name ? <div><dt>Variante</dt><dd>{reservation.product_variants.name}</dd></div> : null}<div><dt>Fecha</dt><dd>{formatDate(reservation.created_at)}</dd></div></dl>
                {reservation.buyer_note ? <p className="muted">Tu nota: {reservation.buyer_note}</p> : null}
                {reservation.merchant_note ? <p><strong>Respuesta de la tienda:</strong> {reservation.merchant_note}</p> : null}
                <div className="account-record-actions">{reservation.products?.slug ? <Link className="btn btn-dark" href={`/productos/${reservation.products.slug}`}>Ver producto</Link> : null}{["pending", "confirmed"].includes(reservation.status) ? <button className="btn btn-danger-outline" onClick={() => void cancelReservation(reservation.id)} type="button">Cancelar reserva</button> : null}</div>
              </article>
            ))}
          </div> : <div className="account-empty"><p>No tienes solicitudes de reserva.</p><Link className="btn btn-dark" href="/buscar">Buscar productos</Link></div>}
        </section>

        <section className="account-section" id="reportes" aria-labelledby="my-reports">
          <header className="account-section-heading"><div><p className="kicker">Seguimiento</p><h2 id="my-reports">Mis reportes</h2></div><span>{reports.length} enviados</span></header>
          {reports.length > 0 ? <div className="account-record-list">
            {reports.map((report) => {
              const target = report.target_type === "product" ? report.products : report.businesses;
              const href = report.target_type === "product" ? `/productos/${report.products?.slug ?? ""}` : `/tiendas/${report.businesses?.slug ?? ""}`;
              return <article className="account-record" key={report.id}>
                <div className="account-record-heading"><div><strong>{target?.name ?? "Publicacion no disponible"}</strong><span>{reportReasonLabels[report.reason] ?? report.reason}</span></div><StatusBadge label={reportStatusLabels[report.status] ?? report.status} tone={report.status === "resolved" ? "success" : report.status === "dismissed" ? "neutral" : report.status === "under_review" ? "warning" : "info"} /></div>
                <p className="muted">{report.details}</p><small className="muted">Enviado el {formatDate(report.created_at)}</small>
                {report.admin_note ? <p><strong>Respuesta administrativa:</strong> {report.admin_note}</p> : null}
                {target?.slug ? <Link className="btn btn-dark account-record-link" href={href}>Ver publicacion</Link> : null}
              </article>;
            })}
          </div> : <div className="account-empty"><p>No has enviado reportes.</p></div>}
        </section>

        <div id="privacidad" className="account-privacy-section"><PrivacyRequestCenter /></div>
      </div>
    </div>
  );
}
