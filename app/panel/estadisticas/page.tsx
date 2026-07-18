import { AuthGuard } from "@/components/AuthGuard";
import { DashboardShell } from "@/components/DashboardShell";
import { merchantLinks } from "@/lib/merchant-links";
import { StatsDashboard } from "./StatsDashboard";

export default function MerchantStatsPage() {
  return (
    <DashboardShell title="Estadisticas" eyebrow="Panel comerciante" links={merchantLinks}>
      <AuthGuard>
        <StatsDashboard />
      </AuthGuard>
    </DashboardShell>
  );
}
