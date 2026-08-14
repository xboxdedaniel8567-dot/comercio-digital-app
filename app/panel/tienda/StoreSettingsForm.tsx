"use client";

import { FormEvent, useEffect, useState } from "react";
import { getCurrentBusiness } from "@/lib/current-business";
import { supabase } from "@/lib/supabase";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Business = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  city: string;
  address: string | null;
  neighborhood: string | null;
  shopping_center: string | null;
  floor: string | null;
  local_number: string | null;
  landmark: string | null;
  whatsapp: string | null;
  category_id: string | null;
};

export function StoreSettingsForm() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [shoppingCenter, setShoppingCenter] = useState("");
  const [floor, setFloor] = useState("");
  const [localNumber, setLocalNumber] = useState("");
  const [landmark, setLandmark] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("Cargando datos de la tienda...");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadStore() {
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

      const { business: currentBusiness, error: businessError } = await getCurrentBusiness();

      if (!currentBusiness) {
        setMessage(businessError || "No encontramos una tienda asociada a esta cuenta.");
        setIsLoading(false);
        return;
      }

      setBusiness(currentBusiness);
      setName(currentBusiness.name);
      setCategoryId(currentBusiness.category_id ?? "");
      setCity(currentBusiness.city);
      setAddress(currentBusiness.address ?? "");
      setNeighborhood(currentBusiness.neighborhood ?? "");
      setShoppingCenter(currentBusiness.shopping_center ?? "");
      setFloor(currentBusiness.floor ?? "");
      setLocalNumber(currentBusiness.local_number ?? "");
      setLandmark(currentBusiness.landmark ?? "");
      setWhatsapp(currentBusiness.whatsapp ?? "");
      setDescription(currentBusiness.description ?? "");
      setMessage("");
      setIsLoading(false);
    }

    void loadStore();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!business) {
      setMessage("No hay una tienda cargada para guardar.");
      return;
    }

    setIsSaving(true);
    setMessage("Guardando cambios...");

    const { error } = await supabase
      .from("businesses")
      .update({
        address,
        category_id: categoryId || null,
        city,
        description,
        floor: floor.trim() || null,
        landmark: landmark.trim() || null,
        local_number: localNumber.trim() || null,
        name,
        neighborhood: neighborhood.trim() || null,
        shopping_center: shoppingCenter.trim() || null,
        whatsapp,
      })
      .eq("id", business.id);

    if (error) {
      setIsSaving(false);
      setMessage("No pudimos guardar los cambios. Revisa los datos e intenta nuevamente.");
      return;
    }

    setIsSaving(false);
    setMessage("Tienda actualizada correctamente.");
  }

  return (
    <form className="merchant-form-section panel" onSubmit={handleSubmit}>
      <div className="merchant-form-heading">
        <p className="kicker">Informacion publica</p>
        <h2>Datos de la tienda</h2>
        <p>Estos datos son los que veran los clientes cuando entren a tu tienda.</p>
      </div>
      <div className="merchant-form-grid">
      <label className="merchant-field">
      <span>Nombre del negocio</span>
      <input
        className="input"
        disabled={isLoading}
        onChange={(event) => setName(event.target.value)}
        placeholder="Nombre del negocio"
        required
        value={name}
      />
      </label>
      <label className="merchant-field">
      <span>Categoria principal</span>
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
      <label className="merchant-field">
      <span>Ciudad</span>
      <input
        className="input"
        disabled={isLoading}
        onChange={(event) => setCity(event.target.value)}
        placeholder="Ciudad"
        required
        value={city}
      />
      </label>
      <label className="merchant-field">
      <span>Direccion</span>
      <input
        className="input"
        disabled={isLoading}
        onChange={(event) => setAddress(event.target.value)}
        placeholder="Direccion"
        value={address}
      />
      </label>
      </div>
      <fieldset
        className="merchant-form-fieldset"
      >
        <legend>Ubicacion exacta</legend>
        <p className="muted">
          Completa solo los datos que apliquen a tu negocio.
        </p>
        <div className="merchant-form-grid">
        <label className="merchant-field"><span>Barrio o sector</span>
        <input
          className="input"
          disabled={isLoading}
          onChange={(event) => setNeighborhood(event.target.value)}
          placeholder="Barrio o sector"
          value={neighborhood}
        />
        </label>
        <label className="merchant-field"><span>Centro comercial o edificio</span>
        <input
          className="input"
          disabled={isLoading}
          onChange={(event) => setShoppingCenter(event.target.value)}
          placeholder="Centro comercial o edificio"
          value={shoppingCenter}
        />
        </label>
        <label className="merchant-field"><span>Piso</span>
          <input
            className="input"
            disabled={isLoading}
            onChange={(event) => setFloor(event.target.value)}
            placeholder="Piso"
            value={floor}
          />
        </label>
        <label className="merchant-field"><span>Numero de local</span>
          <input
            className="input"
            disabled={isLoading}
            onChange={(event) => setLocalNumber(event.target.value)}
            placeholder="Local"
            value={localNumber}
          />
        </label>
        <label className="merchant-field merchant-field-wide"><span>Punto de referencia</span>
        <input
          className="input"
          disabled={isLoading}
          onChange={(event) => setLandmark(event.target.value)}
          placeholder="Punto de referencia. Ej: frente al concesionario"
          value={landmark}
        />
        </label>
        </div>
      </fieldset>
      <div className="merchant-form-grid">
      <label className="merchant-field">
      <span>WhatsApp del negocio</span>
      <input
        className="input"
        disabled={isLoading}
        onChange={(event) => setWhatsapp(event.target.value)}
        placeholder="WhatsApp"
        value={whatsapp}
      />
      </label>
      <label className="merchant-field merchant-field-wide">
      <span>Descripcion del negocio</span>
      <textarea
        className="input"
        disabled={isLoading}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Descripcion del negocio"
        rows={5}
        value={description}
      />
      </label>
      </div>
      <button className="btn" disabled={isLoading || isSaving} type="submit">
        {isSaving ? "Guardando..." : "Guardar cambios"}
      </button>
      {message ? <p className="merchant-form-message" role="status">{message}</p> : null}
    </form>
  );
}
