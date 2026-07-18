import { AuthGuard } from "@/components/AuthGuard";
import { DashboardShell } from "@/components/DashboardShell";
import { merchantLinks } from "@/lib/merchant-links";
import { MerchantOverview } from "./MerchantOverview";

export default function MerchantPanelPage() {
  return (
    <DashboardShell title="Panel del comerciante" eyebrow="Comercio Digital" links={merchantLinks}>
      <AuthGuard>
        <MerchantOverview />
      </AuthGuard>
    </DashboardShell>
  );
}
