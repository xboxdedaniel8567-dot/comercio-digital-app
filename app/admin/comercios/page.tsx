import { DashboardShell } from "@/components/DashboardShell";
import { adminLinks } from "@/lib/admin-links";
import { AdminBusinessesManager } from "./AdminBusinessesManager";

export default function AdminBusinessesPage() {
  return (
    <DashboardShell title="Gestion de comercios" eyebrow="Admin" links={adminLinks}>
      <AdminBusinessesManager />
    </DashboardShell>
  );
}
