import { DashboardShell } from "@/components/DashboardShell";
import { adminLinks } from "@/lib/admin-links";
import { AdminProductsManager } from "./AdminProductsManager";

export default function AdminProductsPage() {
  return (
    <DashboardShell title="Moderacion de productos" eyebrow="Admin" links={adminLinks}>
      <AdminProductsManager />
    </DashboardShell>
  );
}
