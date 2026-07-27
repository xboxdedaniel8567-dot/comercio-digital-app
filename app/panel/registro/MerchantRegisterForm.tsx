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

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <label htmlFor={id} style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)" }}>
        {label}
      </label>
      {children}
      {hint ? (
        <span className="muted" style={{ fontSize: "0.78rem" }}>{hint}</span>
      ) : null}
    </div>
  );
}

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
          account_type: "merchant",
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
    <form className="card" onSubmit={handleSubmit} style={{ display: "grid", gap: 18 }}>
      <div style={{ display: "grid", gap: 18 }}>
        <p className="kicker" style={{ margin: 0 }}>Datos del negocio</p>
        <Field id="reg-business-name" label="Nombre del negocio">
          <input
            className="input"
            id="reg-business-name"
            onChange={(event) => setBusinessName(event.target.value)}
            placeholder="Ej: Tecnologia del Valle"
            required
            value={businessName}
          />
        </Field>
        <Field id="reg-category" label="Categoria">
          <select
            className="input"
            id="reg-category"
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
        </Field>
        <Field id="reg-city" label="Ciudad">
          <input
            className="input"
            id="reg-city"
            onChange={(event) => setCity(event.target.value)}
            placeholder="Ej: Cali, Valle del Cauca"
            required
            value={city}
          />
        </Field>
        <Field id="reg-address" label="Direccion">
          <input
            className="input"
            id="reg-address"
            onChange={(event) => setAddress(event.target.value)}
            placeholder="Ej: Calle 23 # 45-67"
            required
            value={address}
          />
        </Field>
        <Field id="reg-whatsapp" label="WhatsApp" hint="Incluye el codigo del pais. Ej: 573225840281">
          <input
            className="input"
            id="reg-whatsapp"
            onChange={(event) => setWhatsapp(event.target.value)}
            placeholder="573225840281"
            required
            value={whatsapp}
          />
        </Field>
        <Field id="reg-description" label="Descripcion del negocio">
          <textarea
            className="input"
            id="reg-description"
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Cuenta brevemente que vendes o que servicios ofreces."
            rows={4}
            value={description}
          />
        </Field>
      </div>

      <div style={{ display: "grid", gap: 18, borderTop: "1px solid var(--line)", paddingTop: 20 }}>
        <p className="kicker" style={{ margin: 0 }}>Datos del propietario</p>
        <Field id="reg-full-name" label="Nombre completo">
          <input
            className="input"
            id="reg-full-name"
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Ej: Maria Gonzalez"
            required
            value={fullName}
          />
        </Field>
        <Field id="reg-email" label="Correo electronico">
          <input
            className="input"
            id="reg-email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="tu@correo.com"
            required
            type="email"
            value={email}
          />
        </Field>
        <Field id="reg-password" label="Contrasena" hint="Minimo 8 caracteres">
          <input
            className="input"
            id="reg-password"
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Crea una contrasena segura"
            required
            type="password"
            value={password}
          />
        </Field>
      </div>

      <label style={{ alignItems: "flex-start", display: "flex", gap: 10, lineHeight: 1.5, fontSize: "0.88rem" }}>
        <input
          checked={acceptedLegal}
          onChange={(event) => setAcceptedLegal(event.target.checked)}
          required
          type="checkbox"
          style={{ marginTop: 3, minWidth: 18, minHeight: 18 }}
        />
        <span className="muted">
          Acepto los <Link href="/legal/terminos" target="_blank">Terminos y condiciones</Link>, la{" "}
          <Link href="/legal/privacidad" target="_blank">Politica de privacidad</Link> y la{" "}
          <Link href="/legal/tratamiento-datos" target="_blank">Politica de tratamiento de datos</Link>.
        </span>
      </label>
      <button className="btn" disabled={isSubmitting} type="submit" style={{ minHeight: 50, fontSize: "0.96rem" }}>
        {isSubmitting ? "Creando..." : "Crear cuenta y tienda"}
      </button>
      {message ? <p className="muted" style={{ fontSize: "0.88rem", margin: 0 }}>{message}</p> : null}
    </form>
  );
}
