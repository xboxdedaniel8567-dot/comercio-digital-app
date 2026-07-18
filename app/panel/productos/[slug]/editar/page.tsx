import { AuthGuard } from "@/components/AuthGuard";
import { DashboardShell } from "@/components/DashboardShell";
import { merchantLinks } from "@/lib/merchant-links";
import { EditProductForm } from "./EditProductForm";
import { ProductVariantsManager } from "./ProductVariantsManager";

type EditProductPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { slug } = await params;

  return (
    <DashboardShell title="Editar producto" eyebrow="Panel comerciante" links={merchantLinks}>
      <AuthGuard>
        <div>
          <EditProductForm slug={slug} />
          <ProductVariantsManager slug={slug} />
        </div>
      </AuthGuard>
    </DashboardShell>
  );
}
