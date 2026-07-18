import { DashboardShell } from "@/components/DashboardShell";
import { adminLinks } from "@/lib/admin-links";
import { AdminDashboardStats } from "./AdminDashboardStats";

export default function AdminPage() {
  return (
    <DashboardShell title="Panel administrador" eyebrow="Operacion interna" links={adminLinks}>
      <AdminDashboardStats />
    </DashboardShell>
  );
}
