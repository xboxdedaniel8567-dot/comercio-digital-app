import { DashboardShell } from "@/components/DashboardShell";
import { AuthGuard } from "@/components/AuthGuard";
import { merchantLinks } from "@/lib/merchant-links";
import { StoreSettingsForm } from "./StoreSettingsForm";
import { BusinessHoursForm } from "./BusinessHoursForm";
import { BusinessBrandingForm } from "./BusinessBrandingForm";

export default function StoreSettingsPage() {
  return (
    <DashboardShell title="Configurar tienda" eyebrow="Panel comerciante" links={merchantLinks}>
      <AuthGuard>
        <div className="merchant-settings-stack">
          <BusinessBrandingForm />
          <StoreSettingsForm />
          <BusinessHoursForm />
        </div>
      </AuthGuard>
    </DashboardShell>
  );
}
