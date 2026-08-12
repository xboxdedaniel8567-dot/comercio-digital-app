"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdaptiveAttributeFields } from "@/components/AdaptiveAttributeFields";
import { PriceInput } from "@/components/PriceInput";
import { ProductImageInput } from "@/components/ProductImageInput";
import { getPriceError, parsePriceInput } from "@/lib/format-price";
import {
  rollbackProductImageUpload,
  uploadProductImage,
} from "@/lib/product-image-upload";
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

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number | null;
  stock: number | null;
  status: string;
  category_id: string | null;
  subcategory_id: string | null;
  product_images: {
    id: string;
    url: string;
  }[];
};

type EditProductFormProps = {
  slug: string;
};

export function EditProductForm({ slug }: EditProductFormProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [subcategoryId, setSubcategoryId] = useState("");
  const [attributeValues, setAttributeValues] = useState<Record<string, string>>({});
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [status, setStatus] = useState("active");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [message, setMessage] = useState("Cargando producto...");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      const { data: categoryRows, error: categoriesError } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("name");

      if (categoriesError) {
        setMessage(`No se pudieron cargar las categorias: ${categoriesError.message}`);
        setIsLoading(false);
        return;
      }

      setCategories((categoryRows ?? []) as Category[]);

      const { data: productRow, error: productError } = await supabase
        .from("products")
        .select(
          "id, name, slug, description, price, stock, status, category_id, subcategory_id, product_images(id, url)",
        )
        .eq("slug", slug)
        .single();

      if (productError || !productRow) {
        setMessage("No encontramos este producto.");
        setIsLoading(false);
        return;
      }

      const currentProduct = productRow as Product;

      const { data: attributeRows, error: attributesError } = await supabase
        .from("product_attribute_values")
        .select("attribute_id, value")
        .eq("product_id", currentProduct.id);

      if (attributesError) {
        setMessage(`No se pudieron cargar los detalles del producto: ${attributesError.message}`);
        setIsLoading(false);
        return;
      }

      setProduct(currentProduct);
      setName(currentProduct.name);
      setCategoryId(currentProduct.category_id ?? "");
      setSubcategoryId(currentProduct.subcategory_id ?? "");
      setPrice(String(currentProduct.price ?? ""));
      setStock(String(currentProduct.stock ?? ""));
      setStatus(currentProduct.status);
      setDescription(currentProduct.description ?? "");
      setImageUrl(currentProduct.product_images?.[0]?.url ?? "");
      setAttributeValues(
        Object.fromEntries(
          (attributeRows ?? []).map((row) => [String(row.attribute_id), String(row.value)]),
        ),
      );
      setMessage("");
      setIsLoading(false);
    }

    void loadProduct();
  }, [slug]);

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

      const rows = (data ?? []) as Subcategory[];
      setSubcategories(rows);
      setSubcategoryId((current) => (rows.some((row) => row.id === current) ? current : ""));
      setIsLoadingSubcategories(false);
    }

    void loadSubcategories();
  }, [categoryId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!product) {
      setMessage("No hay producto cargado para guardar.");
      return;
    }

    const priceError = getPriceError(price);
    const numericPrice = parsePriceInput(price);
    if (priceError || numericPrice === null) {
      setMessage(priceError ?? "Revisa el precio antes de guardar.");
      return;
    }

    setIsSaving(true);
    setMessage("Guardando cambios...");

    const slugResult = await getUniqueProductSlug(name, product.id);

    if (slugResult.error) {
      setIsSaving(false);
      setMessage(`No se pudo preparar la direccion del producto: ${slugResult.error}`);
      return;
    }

    const { error: updateError } = await supabase
      .from("products")
      .update({
        category_id: categoryId || null,
        description,
        name,
        price: numericPrice,
        slug: slugResult.slug,
        status,
        stock: Number(stock),
        subcategory_id: subcategoryId || null,
      })
      .eq("id", product.id);

    if (updateError) {
      setIsSaving(false);
      setMessage(`No se pudo actualizar el producto: ${updateError.message}`);
      return;
    }

    const { error: deleteAttributesError } = await supabase
      .from("product_attribute_values")
      .delete()
      .eq("product_id", product.id);

    if (deleteAttributesError) {
      setIsSaving(false);
      setMessage(`El producto se actualizo, pero fallaron sus detalles: ${deleteAttributesError.message}`);
      return;
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
        setIsSaving(false);
        setMessage(`El producto se actualizo, pero fallaron sus detalles: ${attributesError.message}`);
        return;
      }
    }

    let cleanImageUrl = imageUrl.trim();
    const currentImage = product.product_images?.[0];
    let uploadedImage = null;

    if (imageFile) {
      setMessage("Subiendo imagen...");
      const uploadResult = await uploadProductImage(imageFile, product.id);

      if (uploadResult.error) {
        setIsSaving(false);
        setMessage(`El producto se actualizo, pero fallo la imagen: ${uploadResult.error}`);
        return;
      }

      cleanImageUrl = uploadResult.publicUrl;
      uploadedImage = uploadResult.upload;
    }

    if (cleanImageUrl && currentImage) {
      const { error: imageError } = await supabase
        .from("product_images")
        .update({
          alt_text: `Imagen de ${name}`,
          url: cleanImageUrl,
        })
        .eq("id", currentImage.id);

      if (imageError) {
        if (uploadedImage) {
          try {
            await rollbackProductImageUpload(uploadedImage);
          } catch {
            // The database error remains primary; cleanup can be retried separately.
          }
        }
        setIsSaving(false);
        setMessage(`El producto se actualizo, pero fallo la imagen: ${imageError.message}`);
        return;
      }
    }

    if (cleanImageUrl && !currentImage) {
      const { error: imageError } = await supabase.from("product_images").insert({
        alt_text: `Imagen de ${name}`,
        product_id: product.id,
        sort_order: 1,
        url: cleanImageUrl,
      });

      if (imageError) {
        if (uploadedImage) {
          try {
            await rollbackProductImageUpload(uploadedImage);
          } catch {
            // The database error remains primary; cleanup can be retried separately.
          }
        }
        setIsSaving(false);
        setMessage(`El producto se actualizo, pero fallo la imagen: ${imageError.message}`);
        return;
      }
    }

    setIsSaving(false);
    setMessage("Producto actualizado correctamente. Volviendo al inventario...");
    window.location.href = "/panel/productos";
  }

  return (
    <form className="merchant-product-form" onSubmit={handleSubmit}>
      <section className="merchant-form-section panel">
        <div className="merchant-form-heading"><div><span className="eyebrow">Informacion publica</span><h2>Datos del producto</h2></div><p>Estos datos son los que veran los compradores en el marketplace.</p></div>
        <div className="merchant-form-grid">
      <label className="merchant-field merchant-field-wide"><span>Nombre del producto</span><input className="input" disabled={isLoading} onChange={(event) => setName(event.target.value)} placeholder="Nombre del producto" required value={name} /></label>
      <label className="merchant-field"><span>Categoria</span>
      <select
        className="input"
        disabled={isLoading}
        onChange={(event) => setCategoryId(event.target.value)}
        required
        value={categoryId}
      >
        <option value="">Selecciona una categoria</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      </label>
      {isLoadingSubcategories || subcategories.length > 0 ? (
        <label className="merchant-field"><span>Subcategoria</span>
        <select
          className="input"
          disabled={isLoading || isLoadingSubcategories}
          onChange={(event) => setSubcategoryId(event.target.value)}
          value={subcategoryId}
        >
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
        <div className="merchant-form-heading"><div><span className="eyebrow">Caracteristicas</span><h2>Detalles para comparar</h2></div><p>Manten actualizados los atributos que ayudan a filtrar este producto.</p></div>
      <AdaptiveAttributeFields
        categoryId={categoryId}
        disabled={isLoading || isSaving}
        onError={setMessage}
        onValuesChange={setAttributeValues}
        subcategoryId={subcategoryId}
        values={attributeValues}
      />
      </section>
      <section className="merchant-form-section panel">
        <div className="merchant-form-heading"><div><span className="eyebrow">Venta e inventario</span><h2>Disponibilidad</h2></div><p>Controla el precio, el stock y la visibilidad del producto.</p></div>
        <div className="merchant-form-grid">
      <PriceInput
        disabled={isLoading || isSaving}
        id="edit-product-price"
        onValueChange={setPrice}
        value={price}
      />
      <label className="merchant-field"><span>Unidades disponibles</span><input className="input" disabled={isLoading} min="0" onChange={(event) => setStock(event.target.value)} placeholder="Stock" required type="number" value={stock} /></label>
      <label className="merchant-field merchant-field-wide"><span>Estado de publicacion</span>
      <select
        className="input"
        disabled={isLoading}
        onChange={(event) => setStatus(event.target.value)}
        value={status}
      >
        <option value="active">Activo</option>
        <option value="draft">Borrador</option>
        <option value="pending_review">Pendiente de revision</option>
      </select>
      </label>
      <label className="merchant-field merchant-field-wide"><span>Descripcion</span><textarea className="input" disabled={isLoading} onChange={(event) => setDescription(event.target.value)} placeholder="Descripcion" required rows={5} value={description} /></label>
        </div>
      </section>
      <section className="merchant-form-section panel">
        <div className="merchant-form-heading"><div><span className="eyebrow">Imagen principal</span><h2>Presentacion visual</h2></div><p>Reemplaza la foto actual solo cuando tengas una version mejor.</p></div>
      <ProductImageInput
        disabled={isLoading}
        file={imageFile}
        imageUrl={imageUrl}
        onFileChange={setImageFile}
        onUrlChange={setImageUrl}
        onValidationError={setMessage}
      />
      </section>
      <div className="merchant-form-submit panel">
        <div><strong>Guardar actualizacion</strong><p className="muted">Los cambios se reflejaran en la ficha publica.</p></div>
      <button
        className="btn"
        disabled={isLoading || isSaving || isLoadingSubcategories}
        type="submit"
      >
        {isSaving ? "Guardando..." : "Guardar cambios"}
      </button>
      </div>
      {message ? <p className="merchant-form-message" role="status">{message}</p> : null}
    </form>
  );
}

