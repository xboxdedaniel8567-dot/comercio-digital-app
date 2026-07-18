"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { LEGAL_VERSION } from "@/lib/legal";

type Category = {
  id: string;
  name: string;
  slug: string;
};

export function MerchantRegisterForm() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [businessName, setBusinessName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [city, setCity] = useState("Cali, Valle del Cauca");
  const [address, setAddress] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [description, setDescription] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedLegal, setAcceptedLegal] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("name");

      if (error) {
        setMessage(`No se pudieron cargar las categorias: ${error.message}`);
        return;
      }

      setCategories((data ?? []) as Category[]);
      setCategoryId(data?.[0]?.id ?? "");
    }

    void loadCategories();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("Creando cuenta de comerciante...");

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          address: address.trim(),
          business_name: businessName.trim(),
          category_id: categoryId,
          city: city.trim(),
          description: description.trim(),
          full_name: fullName.trim(),
          phone: whatsapp.trim(),
          whatsapp: whatsapp.trim(),
          legal_consent: "accepted",
          terms_version: LEGAL_VERSION,
          privacy_version: LEGAL_VERSION,
          data_policy_version: LEGAL_VERSION,
          consent_source: "merchant_registration",
        },
        emailRedirectTo: `${window.location.origin}/panel/login?confirmed=1`,
      },
    });

    if (signUpError || !signUpData.user) {
      setIsSubmitting(false);
      setMessage(`No se pudo crear el usuario: ${signUpError?.message ?? "Intenta de nuevo."}`);
      return;
    }

    if (signUpData.user.identities?.length === 0) {
      setIsSubmitting(false);
      setMessage("Este correo ya tiene una cuenta. Inicia sesion o recupera la contrasena.");
      return;
    }

    setIsSubmitting(false);
    if (signUpData.session) {
      setMessage("Cuenta y tienda creadas. Entrando al panel...");
      window.location.href = "/panel";
      return;
    }

    setMessage(
      "Cuenta y tienda creadas. Revisa tu correo para confirmar la cuenta y luego inicia sesion.",
    );
  }

  return (
    <form className="card" onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
      <p className="muted" style={{ margin: 0 }}>
        Crea una cuenta de comerciante y una tienda asociada automaticamente.
      </p>
      <input
        className="input"
        onChange={(event) => setBusinessName(event.target.value)}
        placeholder="Nombre del negocio"
        required
        value={businessName}
      />
      <select
        className="input"
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
      <input
        className="input"
        onChange={(event) => setCity(event.target.value)}
        placeholder="Ciudad"
        required
        value={city}
      />
      <input
        className="input"
        onChange={(event) => setAddress(event.target.value)}
        placeholder="Direccion"
        required
        value={address}
      />
      <input
        className="input"
        onChange={(event) => setWhatsapp(event.target.value)}
        placeholder="WhatsApp con indicativo. Ej: 573225840281"
        required
        value={whatsapp}
      />
      <textarea
        className="input"
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Descripcion corta del negocio"
        rows={4}
        value={description}
      />
      <input
        className="input"
        onChange={(event) => setFullName(event.target.value)}
        placeholder="Nombre del propietario"
        required
        value={fullName}
      />
      <input
        className="input"
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Correo"
        required
        type="email"
        value={email}
      />
      <input
        className="input"
        minLength={8}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Contrasena"
        required
        type="password"
        value={password}
      />
      <label style={{ alignItems: "flex-start", display: "flex", gap: 10, lineHeight: 1.5 }}>
        <input
          checked={acceptedLegal}
          onChange={(event) => setAcceptedLegal(event.target.checked)}
          required
          type="checkbox"
        />
        <span className="muted">
          Acepto los <Link href="/legal/terminos" target="_blank">Terminos y condiciones</Link>, la{" "}
          <Link href="/legal/privacidad" target="_blank">Politica de privacidad</Link> y la{" "}
          <Link href="/legal/tratamiento-datos" target="_blank">Politica de tratamiento de datos</Link>.
        </span>
      </label>
      <button className="btn" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Creando..." : "Crear cuenta y tienda"}
      </button>
      {message ? <p className="muted">{message}</p> : null}
    </form>
  );
}
