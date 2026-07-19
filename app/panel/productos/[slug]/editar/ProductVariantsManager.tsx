"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { InventoryBadge } from "@/components/InventoryBadge";
import { supabase } from "@/lib/supabase";

type ProductVariant = {
  id: string;
  name: string;
  sku: string | null;
  option_values: Record<string, string>;
  price: number | null;
  stock: number;
  is_active: boolean;
};

type ProductVariantsManagerProps = {
  slug: string;
};

function formatPrice(price: number | null) {
  if (price === null) return "Usa el precio general";

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(price);
}

export function ProductVariantsManager({ slug }: ProductVariantsManagerProps) {
  const [productId, setProductId] = useState("");
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [optionOneName, setOptionOneName] = useState("Color");
  const [optionOneValue, setOptionOneValue] = useState("");
  const [optionTwoName, setOptionTwoName] = useState("");
  const [optionTwoValue, setOptionTwoValue] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("Cargando variantes...");
  const [isSaving, setIsSaving] = useState(false);

  const loadVariants = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from("product_variants")
      .select("id, name, sku, option_values, price, stock, is_active")
      .eq("product_id", id)
      .order("sort_order")
      .order("name");

    if (error) {
      setMessage(`No se pudieron cargar las variantes: ${error.message}`);
      return;
    }

    setVariants((data ?? []) as ProductVariant[]);
    setMessage("");
  }, []);

  useEffect(() => {
    async function loadProduct() {
      const { data, error } = await supabase
        .from("products")
        .select("id")
        .eq("slug", slug)
        .single();

      if (error || !data) {
        setMessage("No se pudo preparar el administrador de variantes.");
        return;
      }

      setProductId(data.id);
      await loadVariants(data.id);
    }

    void loadProduct();
  }, [loadVariants, slug]);

  async function syncProductStock(nextVariants: ProductVariant[]) {
    if (!productId) return;

    const totalStock = nextVariants
      .filter((variant) => variant.is_active)
      .reduce((total, variant) => total + variant.stock, 0);

    await supabase.from("products").update({ stock: totalStock }).eq("id", productId);
  }

  function clearForm() {
    setEditingId(null);
    setName("");
    setSku("");
    setPrice("");
    setStock("0");
    setOptionOneName("Color");
    setOptionOneValue("");
    setOptionTwoName("");
    setOptionTwoValue("");
  }

  function startEditing(variant: ProductVariant) {
    const options = Object.entries(variant.option_values ?? {});
    setEditingId(variant.id);
    setName(variant.name);
    setSku(variant.sku ?? "");
    setPrice(variant.price === null ? "" : String(variant.price));
    setStock(String(variant.stock));
    setOptionOneName(options[0]?.[0] ?? "Color");
    setOptionOneValue(options[0]?.[1] ?? "");
    setOptionTwoName(options[1]?.[0] ?? "");
    setOptionTwoValue(options[1]?.[1] ?? "");
    setMessage(`Editando ${variant.name}.`);
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!productId) {
      setMessage("El producto todavia no esta listo.");
      return;
    }

    const options: Record<string, string> = {};
    if (optionOneName.trim() && optionOneValue.trim()) {
      options[optionOneName.trim()] = optionOneValue.trim();
    }
    if (optionTwoName.trim() && optionTwoValue.trim()) {
      options[optionTwoName.trim()] = optionTwoValue.trim();
    }

    setIsSaving(true);
    setMessage(editingId ? "Guardando variante..." : "Creando variante...");

    const variantValues = {
        name: name.trim(),
        option_values: options,
        price: price ? Number(price) : null,
        sku: sku.trim() || null,
        stock: Number(stock),
      };
    const request = editingId
      ? supabase.from("product_variants").update(variantValues).eq("id", editingId)
      : supabase.from("product_variants").insert({ ...variantValues, product_id: productId });
    const { data, error } = await request
      .select("id, name, sku, option_values, price, stock, is_active")
      .single();

    if (error || !data) {
      setIsSaving(false);
      setMessage(`No se pudo guardar la variante: ${error?.message ?? "Error desconocido"}`);
      return;
    }

    const savedVariant = data as ProductVariant;
    const nextVariants = editingId
      ? variants.map((variant) => (variant.id === editingId ? savedVariant : variant))
      : [...variants, savedVariant];
    setVariants(nextVariants);
    await syncProductStock(nextVariants);
    clearForm();
    setIsSaving(false);
    setMessage(editingId ? "Variante actualizada correctamente." : "Variante creada correctamente.");
  }

  async function updateVariant(
    variant: ProductVariant,
    changes: Partial<Pick<ProductVariant, "is_active" | "stock">>,
  ) {
    const { error } = await supabase
      .from("product_variants")
      .update(changes)
      .eq("id", variant.id);

    if (error) {
      setMessage(`No se pudo actualizar la variante: ${error.message}`);
      return;
    }

    const nextVariants = variants.map((current) =>
      current.id === variant.id ? { ...current, ...changes } : current,
    );
    setVariants(nextVariants);
    await syncProductStock(nextVariants);
    setMessage("Variante actualizada.");
  }

  async function deleteVariant(variant: ProductVariant) {
    if (!window.confirm(`Eliminar la variante ${variant.name}?`)) return;

    const { error } = await supabase.from("product_variants").delete().eq("id", variant.id);

    if (error) {
      setMessage(`No se pudo eliminar la variante: ${error.message}`);
      return;
    }

    const nextVariants = variants.filter((current) => current.id !== variant.id);
    setVariants(nextVariants);
    await syncProductStock(nextVariants);
    setMessage("Variante eliminada.");
  }

  return (
    <section className="merchant-form-section panel merchant-variants-section">
      <div className="merchant-form-heading">
        <div><span className="eyebrow">Inventario avanzado</span><h2>Variantes</h2></div>
        <p>Crea presentaciones con stock propio, como Negro / 128 GB o Talla 42 / Blanco.</p>
      </div>

      <form className="merchant-variant-form" onSubmit={handleSave}>
        <div className="merchant-form-grid">
          <label className="merchant-field">
            <span>Nombre de la variante</span>
          <input
            className="input"
            disabled={isSaving}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nombre. Ej: Negro / 128 GB"
            required
            value={name}
          />
          </label>
          <label className="merchant-field">
            <span>SKU</span>
          <input
            className="input"
            disabled={isSaving}
            onChange={(event) => setSku(event.target.value)}
            placeholder="SKU opcional"
            value={sku}
          />
          </label>
        </div>
        <fieldset className="merchant-form-fieldset">
          <legend>Opciones</legend>
          <div className="merchant-form-grid">
          <label className="merchant-field"><span>Primer tipo de opcion</span>
          <input
            className="input"
            disabled={isSaving}
            onChange={(event) => setOptionOneName(event.target.value)}
            placeholder="Tipo de opcion. Ej: Color"
            value={optionOneName}
          />
          </label>
          <label className="merchant-field"><span>Primer valor</span>
          <input
            className="input"
            disabled={isSaving}
            onChange={(event) => setOptionOneValue(event.target.value)}
            placeholder="Valor. Ej: Negro"
            value={optionOneValue}
          />
          </label>
          <label className="merchant-field"><span>Segundo tipo de opcion</span>
          <input
            className="input"
            disabled={isSaving}
            onChange={(event) => setOptionTwoName(event.target.value)}
            placeholder="Segunda opcion. Ej: Capacidad"
            value={optionTwoName}
          />
          </label>
          <label className="merchant-field"><span>Segundo valor</span>
          <input
            className="input"
            disabled={isSaving}
            onChange={(event) => setOptionTwoValue(event.target.value)}
            placeholder="Valor. Ej: 128 GB"
            value={optionTwoValue}
          />
          </label>
          </div>
        </fieldset>
        <div className="merchant-form-grid">
          <label className="merchant-field"><span>Precio propio</span>
          <input
            className="input"
            disabled={isSaving}
            min="0"
            onChange={(event) => setPrice(event.target.value)}
            placeholder="Precio propio (opcional)"
            type="number"
            value={price}
          />
          </label>
          <label className="merchant-field"><span>Unidades disponibles</span>
          <input
            className="input"
            disabled={isSaving}
            min="0"
            onChange={(event) => setStock(event.target.value)}
            placeholder="Stock"
            required
            type="number"
            value={stock}
          />
          </label>
        </div>
        <div className="merchant-action-row">
          <button className="btn" disabled={isSaving || !productId} type="submit">
            {isSaving ? "Guardando..." : editingId ? "Guardar variante" : "Agregar variante"}
          </button>
          {editingId ? (
            <button className="btn btn-dark" onClick={clearForm} type="button">
              Cancelar edicion
            </button>
          ) : null}
        </div>
      </form>

      <div className="merchant-variant-list">
        {variants.map((variant) => (
          <article className="merchant-variant-row" key={variant.id}>
            <div className="merchant-variant-copy">
              <strong>{variant.name}</strong>
              <span className="muted">{formatPrice(variant.price)}</span>
              {Object.entries(variant.option_values ?? {}).length > 0 ? (
                <span className="muted">
                  {Object.entries(variant.option_values)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(" - ")}
                </span>
              ) : null}
              {variant.sku ? <small className="muted">SKU: {variant.sku}</small> : null}
            </div>
            <div className="merchant-stock-stepper">
              <InventoryBadge stock={variant.stock} />
              <button
                aria-label={`Restar stock a ${variant.name}`}
                className="btn btn-dark"
                disabled={variant.stock === 0}
                onClick={() => void updateVariant(variant, { stock: variant.stock - 1 })}
                type="button"
              >
                -
              </button>
              <button
                aria-label={`Sumar stock a ${variant.name}`}
                className="btn btn-dark"
                onClick={() => void updateVariant(variant, { stock: variant.stock + 1 })}
                type="button"
              >
                +
              </button>
            </div>
            <div className="merchant-variant-actions">
              <button className="btn btn-dark" onClick={() => startEditing(variant)} type="button">
                Editar
              </button>
              <button
                className="btn btn-dark"
                onClick={() => void updateVariant(variant, { is_active: !variant.is_active })}
                type="button"
              >
                {variant.is_active ? "Desactivar" : "Activar"}
              </button>
              <button className="btn btn-dark" onClick={() => void deleteVariant(variant)} type="button">
                Eliminar
              </button>
            </div>
          </article>
        ))}
        {!message && variants.length === 0 ? (
          <p className="muted">Este producto todavia no tiene variantes.</p>
        ) : null}
      </div>
      {message ? <p className="merchant-form-message" role="status">{message}</p> : null}
    </section>
  );
}
