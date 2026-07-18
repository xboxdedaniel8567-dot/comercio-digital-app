"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdaptiveAttributeFields } from "@/components/AdaptiveAttributeFields";
import { ProductImageInput } from "@/components/ProductImageInput";
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
        price: Number(price),
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

    if (imageFile) {
      setMessage("Subiendo imagen...");
      const uploadResult = await uploadProductImage(imageFile, product.id);

      if (uploadResult.error) {
        setIsSaving(false);
        setMessage(`El producto se actualizo, pero fallo la imagen: ${uploadResult.error}`);
        return;
      }

      cleanImageUrl = uploadResult.publicUrl;
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
    <form className="card" onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
      <p className="muted" style={{ margin: 0 }}>
        Edita la informacion que ven los clientes en el marketplace.
      </p>
      <input
        className="input"
        disabled={isLoading}
        onChange={(event) => setName(event.target.value)}
        placeholder="Nombre del producto"
        required
        value={name}
      />
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
      {isLoadingSubcategories || subcategories.length > 0 ? (
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
      ) : null}
      <AdaptiveAttributeFields
        categoryId={categoryId}
        disabled={isLoading || isSaving}
        onError={setMessage}
        onValuesChange={setAttributeValues}
        subcategoryId={subcategoryId}
        values={attributeValues}
      />
      <input
        className="input"
        disabled={isLoading}
        min="0"
        onChange={(event) => setPrice(event.target.value)}
        placeholder="Precio"
        required
        type="number"
        value={price}
      />
      <input
        className="input"
        disabled={isLoading}
        min="0"
        onChange={(event) => setStock(event.target.value)}
        placeholder="Stock"
        required
        type="number"
        value={stock}
      />
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
      <textarea
        className="input"
        disabled={isLoading}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Descripcion"
        required
        rows={5}
        value={description}
      />
      <ProductImageInput
        disabled={isLoading}
        file={imageFile}
        imageUrl={imageUrl}
        onFileChange={setImageFile}
        onUrlChange={setImageUrl}
        onValidationError={setMessage}
      />
      <button
        className="btn"
        disabled={isLoading || isSaving || isLoadingSubcategories}
        type="submit"
      >
        {isSaving ? "Guardando..." : "Guardar cambios"}
      </button>
      {message ? <p className="muted">{message}</p> : null}
    </form>
  );
}
