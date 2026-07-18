import { AuthGuard } from "@/components/AuthGuard";
import { DashboardShell } from "@/components/DashboardShell";
import { merchantLinks } from "@/lib/merchant-links";
import { ProductInventory } from "./ProductInventory";

export default function MerchantProductsPage() {
  return (
    <DashboardShell title="Productos" eyebrow="Panel comerciante" links={merchantLinks}>
      <AuthGuard>
        <ProductInventory />
      </AuthGuard>
    </DashboardShell>
  );
}
