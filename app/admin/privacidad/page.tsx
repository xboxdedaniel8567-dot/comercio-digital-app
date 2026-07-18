import { DashboardShell } from "@/components/DashboardShell";
import { adminLinks } from "@/lib/admin-links";
import { AdminPrivacyRequestsManager } from "@/app/admin/privacidad/AdminPrivacyRequestsManager";

export default function AdminPrivacyPage() {
  return (
    <DashboardShell title="Solicitudes de privacidad" eyebrow="Admin" links={adminLinks}>
      <AdminPrivacyRequestsManager />
    </DashboardShell>
  );
}
