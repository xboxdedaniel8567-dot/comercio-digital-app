"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { supabase } from "@/lib/supabase";

type NotificationRow = {
  id: string;
  title: string;
  body: string;
  href: string;
  read_at: string | null;
  created_at: string;
};

export function NotificationsCenter() {
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [message, setMessage] = useState("Cargando notificaciones...");

  async function loadNotifications() {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      window.location.href = "/panel/login";
      return;
    }

    const { data, error } = await supabase
      .from("notifications")
      .select("id, title, body, href, read_at, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      setMessage(`No se pudieron cargar las notificaciones: ${error.message}`);
      return;
    }

    setNotifications((data ?? []) as NotificationRow[]);
    setMessage("");
  }

  useEffect(() => {
    void loadNotifications();
  }, []);

  async function markRead(id: string) {
    await supabase.rpc("mark_notification_read", { p_notification_id: id });
    setNotifications((current) => current.map((item) => (
      item.id === id ? { ...item, read_at: item.read_at ?? new Date().toISOString() } : item
    )));
    window.dispatchEvent(new Event("notifications-updated"));
  }

  async function markAllRead() {
    const { error } = await supabase.rpc("mark_all_notifications_read");
    if (error) {
      setMessage(`No se pudieron marcar como leidas: ${error.message}`);
      return;
    }

    const now = new Date().toISOString();
    setNotifications((current) => current.map((item) => ({ ...item, read_at: item.read_at ?? now })));
    window.dispatchEvent(new Event("notifications-updated"));
    setMessage("Todas las notificaciones quedaron marcadas como leidas.");
  }

  const unreadCount = notifications.filter((item) => !item.read_at).length;

  if (message && notifications.length === 0 && message.startsWith("Cargando")) {
    return <p className="muted">{message}</p>;
  }

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div className="card" style={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between" }}>
        <div>
          <strong>{unreadCount} sin leer</strong>
          <p className="muted" style={{ margin: "4px 0 0" }}>Cambios importantes de tu actividad en Comercio Digital.</p>
        </div>
        {unreadCount > 0 ? <button className="btn btn-dark" onClick={() => void markAllRead()} type="button">Marcar todas como leidas</button> : null}
      </div>
      {message && !message.startsWith("Cargando") ? <p className="muted" role="status">{message}</p> : null}
      {notifications.map((notification) => (
        <article className="card" key={notification.id} style={{ display: "grid", gap: 9 }}>
          <div style={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "space-between" }}>
            <strong>{notification.title}</strong>
            <StatusBadge label={notification.read_at ? "Leida" : "Nueva"} tone={notification.read_at ? "neutral" : "info"} />
          </div>
          <p className="muted" style={{ margin: 0 }}>{notification.body}</p>
          <small className="muted">{new Date(notification.created_at).toLocaleString("es-CO")}</small>
          <Link className="btn btn-dark" href={notification.href} onClick={() => void markRead(notification.id)}>
            Ver detalle
          </Link>
        </article>
      ))}
      {notifications.length === 0 ? <div className="card"><p className="muted" style={{ margin: 0 }}>Todavia no tienes notificaciones.</p></div> : null}
    </div>
  );
}
