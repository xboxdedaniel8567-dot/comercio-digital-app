import { DashboardShell } from "@/components/DashboardShell";
import { adminLinks } from "@/lib/admin-links";
import { AdminReportsManager } from "./AdminReportsManager";

export default function AdminReportsPage() {
  return (
    <DashboardShell title="Reportes del marketplace" eyebrow="Admin" links={adminLinks}>
      <AdminReportsManager />
    </DashboardShell>
  );
}

