import { AuthGuard } from "@/components/AuthGuard";
import { DashboardShell } from "@/components/DashboardShell";
import { merchantLinks } from "@/lib/merchant-links";
import { MerchantReservations } from "./MerchantReservations";

export default function MerchantReservationsPage() {
  return (
    <DashboardShell title="Reservas" eyebrow="Panel comerciante" links={merchantLinks}>
      <AuthGuard><MerchantReservations /></AuthGuard>
    </DashboardShell>
  );
}

