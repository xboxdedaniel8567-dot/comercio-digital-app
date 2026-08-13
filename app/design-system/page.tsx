import {
  Alert,
  Badge,
  Button,
  Chip,
  Field,
  IconButton,
  Input,
  Select,
  Skeleton,
  Spinner,
  Textarea,
} from "@/components/ui";
import { AvailabilityBadge } from "@/components/AvailabilityBadge";
import { DistanceDisplay } from "@/components/DistanceDisplay";
import { EmptyState } from "@/components/EmptyState";
import { PriceDisplay } from "@/components/PriceDisplay";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";
import { ProductCardSkeleton } from "@/components/ProductCardSkeleton";
import { ShellIcon } from "@/components/ShellIcon";
import { FeaturedStoreCard, StoreCard, StoreMapPreview, type StoreCardData } from "@/components/StoreCard";
import { StoreCardSkeleton } from "@/components/StoreCardSkeleton";

const colors = [
  ["Background", "#090A0C"],
  ["Surface", "#111318"],
  ["Elevated", "#181B21"],
  ["Interactive", "#20242C"],
  ["Brand", "#3B82F6"],
  ["Success", "#22C55E"],
  ["Warning", "#F59E0B"],
  ["Danger", "#EF4444"],
] as const;

const demoProduct: ProductCardData = {
  name: "Telefono inteligente de demostracion",
  slug: "producto-demostracion",
  businessName: "Comercio de muestra",
  businessCity: "Cali",
  category: "Tecnologia",
  price: 1_800_000,
  currency: "COP",
  stock: 3,
  attributes: [],
  imageUrl: "/logo.png",
  distanceMeters: 450,
};

const demoStore: StoreCardData = {
  name: "Comercio de muestra",
  slug: "comercio-demostracion",
  category: "Tecnologia",
  city: "Cali, Valle del Cauca",
  address: "Direccion de demostracion",
  status: "Activo",
  imageUrl: null,
  distanceMeters: 1_200,
  zone: "Centro",
};

export default function DesignSystemPage() {
  return (
    <main className="cd-design-system-page">
      <header className="cd-design-system-header">
        <Badge tone="info">Referencia interna</Badge>
        <h1>Comercio Digital Design System</h1>
        <p>Fundamentos y primitivas de interfaz. Esta ruta no utiliza Supabase ni datos reales.</p>
      </header>

      <section className="cd-design-system-section">
        <h2>Color</h2>
        <div className="cd-design-system-grid">
          {colors.map(([name, value]) => (
            <div className="cd-token-swatch" key={name} style={{ "--swatch": value } as React.CSSProperties}>
              <strong>{name}</strong><span>{value}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="cd-design-system-section">
        <h2>Tipografia</h2>
        <div className="cd-component-sample">
          <p className="cd-type-sample cd-type-display">Encuentra lo que necesitas</p>
          <p className="cd-type-sample cd-type-h1">Comercio local, acceso digital</p>
          <p className="cd-type-sample cd-type-body">Texto diseñado para lectura clara en tareas frecuentes.</p>
          <p className="cd-type-sample cd-type-mono">SKU CD-2026-001</p>
        </div>
      </section>

      <section className="cd-design-system-section">
        <h2>Buttons</h2>
        <div className="cd-design-system-row">
          <Button>Primary</Button><Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button><Button variant="destructive">Destructive</Button>
          <Button variant="brand">Brand</Button><Button loading loadingLabel="Guardando">Loading</Button>
          <Button disabled>Disabled</Button>
          <IconButton aria-label="Cerrar ejemplo"><span aria-hidden="true">×</span></IconButton>
        </div>
      </section>

      <section className="cd-design-system-section">
        <h2>Form controls</h2>
        <div className="cd-design-system-grid">
          <Field helperText="Usaremos este correo para responderte." label="Correo">
            <Input autoComplete="email" inputMode="email" placeholder="nombre@ejemplo.com" type="email" />
          </Field>
          <Field error="Escribe un nombre válido." label="Nombre del producto">
            <Input defaultValue="" invalid />
          </Field>
          <Field label="Categoria">
            <Select defaultValue=""><option disabled value="">Selecciona</option><option>Tecnologia</option></Select>
          </Field>
          <Field label="Descripcion" optional><Textarea placeholder="Describe el producto" /></Field>
        </div>
      </section>

      <section className="cd-design-system-section">
        <h2>Badges y chips</h2>
        <div className="cd-design-system-row">
          <Badge>Neutral</Badge><Badge tone="info">Informacion</Badge><Badge tone="success">Disponible</Badge>
          <Badge tone="warning">Pendiente</Badge><Badge tone="danger">Rechazado</Badge>
          <Chip>Todos</Chip><Chip selected>Tecnologia</Chip><Chip disabled>Deshabilitado</Chip>
        </div>
      </section>

      <section className="cd-design-system-section">
        <h2>Feedback</h2>
        <div className="cd-design-system-grid">
          <Alert message="Tu solicitud fue recibida." title="Proceso iniciado" tone="info" />
          <Alert message="Los cambios se guardaron correctamente." title="Guardado" tone="success" />
          <Alert message="Revisa la disponibilidad antes de continuar." title="Atencion" tone="warning" />
          <Alert message="No fue posible completar la accion." title="Ocurrio un problema" tone="danger" />
          <div className="cd-component-sample"><Skeleton className="cd-skeleton-sample" /><Skeleton /></div>
          <div className="cd-component-sample"><Spinner /><span>Cargando contenido</span></div>
        </div>
      </section>

      <section className="cd-design-system-section">
        <div>
          <Badge tone="info">Fixtures locales de demostracion</Badge>
          <h2>Commerce components</h2>
          <p className="muted">Estas muestras no consultan Supabase ni representan publicaciones reales.</p>
        </div>
        <h3>ProductCard</h3>
        <div className="cd-commerce-lab-grid">
          <ProductCard product={demoProduct} />
          <ProductCard product={{ ...demoProduct, name: "Producto horizontal de demostracion", stock: 8 }} variant="horizontal" />
          <ProductCard product={{ ...demoProduct, imageUrl: null, name: "Vista previa en mapa" }} variant="mapPreview" />
        </div>
        <h3>StoreCard</h3>
        <div className="cd-commerce-lab-stack">
          <StoreCard business={demoStore} />
          <FeaturedStoreCard business={{ ...demoStore, isSponsored: true }} />
          <StoreMapPreview business={{ ...demoStore, distanceMeters: 280 }} />
        </div>
      </section>

      <section className="cd-design-system-section">
        <h2>Commerce metadata</h2>
        <div className="cd-design-system-row">
          <AvailabilityBadge stock={12} />
          <AvailabilityBadge stock={2} />
          <AvailabilityBadge stock={0} />
          <AvailabilityBadge stock={null} />
          <DistanceDisplay distanceMeters={450} />
          <DistanceDisplay distanceMeters={1_200} />
          <PriceDisplay value={1_800_000} />
          <PriceDisplay size="large" value={2_600_000} />
        </div>
      </section>

      <section className="cd-design-system-section">
        <h2>Loading and empty states</h2>
        <div className="cd-commerce-lab-grid">
          <ProductCardSkeleton />
          <StoreCardSkeleton />
        </div>
        <EmptyState
          action={<Button variant="secondary">Explorar categorias</Button>}
          description="Prueba con otra palabra o explora las categorias disponibles."
          icon={<ShellIcon name="search" />}
          title="No encontramos productos"
        />
      </section>
    </main>
  );
}
