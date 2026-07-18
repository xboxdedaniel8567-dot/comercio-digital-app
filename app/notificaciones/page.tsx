import { AppHeader } from "@/components/AppHeader";
import { NotificationsCenter } from "@/app/notificaciones/NotificationsCenter";

export default function NotificationsPage() {
  return (
    <main className="shell">
      <AppHeader />
      <section className="container section">
        <p className="kicker">Tu actividad</p>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 4rem)", margin: "10px 0 24px" }}>
          Notificaciones
        </h1>
        <NotificationsCenter />
      </section>
    </main>
  );
}
