"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdaptiveAttributeFields } from "@/components/AdaptiveAttributeFields";
import { ProductImageInput } from "@/components/ProductImageInput";
import { getCurrentBusiness } from "@/lib/current-business";
import { uploadProductImage } from "@/lib/product-image-upload";
import { getUniqueProductSlug } from "@/lib/product-slug";
import { supabase } from "@/lib/supabase";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Subcategory = {
  id: string;
  name: string;
};

export function NewProductForm() {
  const [name, setName] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [subcategoryId, setSubcategoryId] = useState("");
  const [attributeValues, setAttributeValues] = useState<Record<string, string>>({});
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [message, setMessage] = useState("Cargando categorias...");
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("name");

      if (error) {
        setMessage(`No se pudieron cargar las categorias: ${error.message}`);
        setIsLoadingCategories(false);
        return;
      }

      const rows = (data ?? []) as Category[];
      setCategories(rows);
      setCategoryId(rows[0]?.id ?? "");
      setMessage(rows.length ? "" : "Primero debes crear al menos una categoria.");
      setIsLoadingCategories(false);
    }

    void loadCategories();
  }, []);

  useEffect(() => {
    async function loadSubcategories() {
      if (!categoryId) {
        setSubcategories([]);
        setSubcategoryId("");
        return;
      }

      setIsLoadingSubcategories(true);

      const { data, error } = await supabase
        .from("subcategories")
        .select("id, name")
        .eq("category_id", categoryId)
        .eq("is_active", true)
        .order("name");

      if (error) {
        setSubcategories([]);
        setSubcategoryId("");
        setMessage(`No se pudieron cargar las subcategorias: ${error.message}`);
        setIsLoadingSubcategories(false);
        return;
      }

      setSubcategories((data ?? []) as Subcategory[]);
      setSubcategoryId("");
      setIsLoadingSubcategories(false);
    }

    void loadSubcategories();
  }, [categoryId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!categoryId) {
      setMessage("Selecciona una categoria antes de publicar el producto.");
      return;
    }

    setIsSubmitting(true);
    setMessage("Guardando producto...");

    const { business, error: businessError } = await getCurrentBusiness();

    if (!business) {
      setIsSubmitting(false);
      setMessage(businessError || "No encontramos una tienda para asociar el producto.");
      return;
    }

    const slugResult = await getUniqueProductSlug(name);

    if (slugResult.error) {
      setIsSubmitting(false);
      setMessage(`No se pudo preparar la direccion del producto: ${slugResult.error}`);
      return;
    }

    const { data: product, error: insertError } = await supabase
      .from("products")
      .insert({
        business_id: business.id,
        category_id: categoryId,
        currency: "COP",
        description,
        name,
        price: Number(price),
        slug: slugResult.slug,
        status: "active",
        stock: Number(stock),
        subcategory_id: subcategoryId || null,
      })
      .select("id")
      .single();

    if (insertError) {
      setIsSubmitting(false);
      setMessage(`No se pudo crear el producto: ${insertError.message}`);
      return;
    }

   const finalImageUrl = imageUrl.trim();

    if (imageFile && product) {
      setMessage("Subiendo imagen...");
      const uploadResult = await uploadProductImage(imageFile, product.id);

      if (uploadResult.error) {
        setIsSubmitting(false);
        setMessage(
          `El producto fue creado, pero no se pudo subir la imagen: ${uploadResult.error}`,
        );
        return;
      }

      finalImageUrl = uploadResult.publicUrl;
    }

    if (finalImageUrl && product) {
      const { error: imageError } = await supabase.from("product_images").insert({
        alt_text: `Imagen de ${name}`,
        product_id: product.id,
        sort_order: 1,
        url: finalImageUrl,
      });

      if (imageError) {
        setIsSubmitting(false);
        setMessage(
          `El producto fue creado, pero no se pudo guardar la imagen: ${imageError.message}`,
        );
        return;
      }
    }

    const attributeRows = Object.entries(attributeValues)
      .filter(([, value]) => value.trim() !== "")
      .map(([attributeId, value]) => ({
        attribute_id: attributeId,
        product_id: product.id,
        value: value.trim(),
      }));

    if (attributeRows.length > 0) {
      const { error: attributesError } = await supabase
        .from("product_attribute_values")
        .insert(attributeRows);

      if (attributesError) {
        setIsSubmitting(false);
        setMessage(
          `El producto fue creado, pero no se guardaron sus detalles: ${attributesError.message}`,
        );
        return;
      }
    }

    setIsSubmitting(false);
    setMessage("Producto creado correctamente. Redirigiendo al inventario...");
    window.location.href = "/panel/productos";
  }

  return (
    <form className="merchant-product-form" onSubmit={handleSubmit}>
      <section className="merchant-form-section panel">
        <div className="merchant-form-heading">
          <div><span className="eyebrow">Informacion principal</span><h2>Describe tu producto</h2></div>
          <p>Usa un nombre claro para que los compradores puedan encontrarlo facilmente.</p>
        </div>
        <div className="merchant-form-grid">
          <label className="merchant-field merchant-field-wide">
            <span>Nombre del producto</span>
            <input className="input" onChange={(event) => setName(event.target.value)} placeholder="Ej. iPhone 13 128 GB" required value={name} />
          </label>
          <label className="merchant-field">
            <span>Categoria</span>
            <select className="input" disabled={isLoadingCategories} onChange={(event) => setCategoryId(event.target.value)} required value={categoryId}>
        <option value="">Selecciona una categoria</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
            </select>
          </label>
      {isLoadingSubcategories || subcategories.length > 0 ? (
          <label className="merchant-field">
            <span>Subcategoria</span>
            <select className="input" disabled={isLoadingSubcategories} onChange={(event) => setSubcategoryId(event.target.value)} value={subcategoryId}>
          <option value="">
            {isLoadingSubcategories ? "Cargando subcategorias..." : "Selecciona una subcategoria (opcional)"}
          </option>
          {subcategories.map((subcategory) => (
            <option key={subcategory.id} value={subcategory.id}>
              {subcategory.name}
            </option>
          ))}
            </select>
          </label>
      ) : null}
        </div>
      </section>
      <section className="merchant-form-section panel">
        <div className="merchant-form-heading"><div><span className="eyebrow">Caracteristicas</span><h2>Detalles para comparar</h2></div><p>Estos datos cambian segun la categoria seleccionada.</p></div>
      <AdaptiveAttributeFields
        categoryId={categoryId}
        disabled={isSubmitting}
        onError={setMessage}
        onValuesChange={setAttributeValues}
        subcategoryId={subcategoryId}
        values={attributeValues}
      />
      </section>
      <section className="merchant-form-section panel">
        <div className="merchant-form-heading"><div><span className="eyebrow">Venta e inventario</span><h2>Precio y disponibilidad</h2></div><p>El stock debe coincidir con las unidades disponibles en tu local.</p></div>
        <div className="merchant-form-grid">
          <label className="merchant-field"><span>Precio en pesos colombianos</span><input className="input" min="0" onChange={(event) => setPrice(event.target.value)} placeholder="Ej. 1800000" required type="number" value={price} /></label>
          <label className="merchant-field"><span>Unidades disponibles</span><input className="input" min="0" onChange={(event) => setStock(event.target.value)} placeholder="Ej. 2" required type="number" value={stock} /></label>
          <label className="merchant-field merchant-field-wide"><span>Descripcion</span><textarea className="input" onChange={(event) => setDescription(event.target.value)} placeholder="Estado, beneficios y detalles importantes del producto" required rows={5} value={description} /></label>
        </div>
      </section>
      <section className="merchant-form-section panel">
        <div className="merchant-form-heading"><div><span className="eyebrow">Imagen principal</span><h2>Presenta el producto</h2></div><p>Una fotografia clara aumenta la confianza del comprador.</p></div>
      <ProductImageInput
        disabled={isSubmitting}
        file={imageFile}
        imageUrl={imageUrl}
        onFileChange={setImageFile}
        onUrlChange={setImageUrl}
        onValidationError={setMessage}
      />
      </section>
      <div className="merchant-form-submit panel">
        <div><strong>Todo listo para publicar</strong><p className="muted">Podras editar la informacion y agregar variantes despues.</p></div>
      <button
        className="btn"
        disabled={isSubmitting || isLoadingCategories || isLoadingSubcategories}
        type="submit"
      >
        {isSubmitting ? "Publicando..." : "Publicar producto"}
      </button>
      </div>
      {message ? <p className="merchant-form-message" role="status">{message}</p> : null}
    </form>
  );
}
