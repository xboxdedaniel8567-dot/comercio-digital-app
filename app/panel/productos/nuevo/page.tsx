import { DashboardShell } from "@/components/DashboardShell";
import { AuthGuard } from "@/components/AuthGuard";
import { merchantLinks } from "@/lib/merchant-links";
import { NewProductForm } from "./NewProductForm";

export default function NewProductPage() {
  return (
    <DashboardShell title="Crear producto" eyebrow="Panel comerciante" links={merchantLinks}>
      <AuthGuard>
        <NewProductForm />
      </AuthGuard>
    </DashboardShell>
  );
}
