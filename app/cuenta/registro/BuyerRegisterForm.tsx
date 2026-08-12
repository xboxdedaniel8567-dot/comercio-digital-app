"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";
import { LEGAL_VERSION } from "@/lib/legal";

export function BuyerRegisterForm() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedLegal, setAcceptedLegal] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("Creando tu cuenta...");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          account_type: "buyer",
          full_name: fullName.trim(),
          phone: phone.trim(),
          legal_consent: "accepted",
          terms_version: LEGAL_VERSION,
          privacy_version: LEGAL_VERSION,
          data_policy_version: LEGAL_VERSION,
          consent_source: "buyer_registration",
        },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/cuenta`,
      },
    });

    setIsSubmitting(false);

    if (error || !data.user) {
      setMessage(`No se pudo crear la cuenta: ${error?.message ?? "Intenta de nuevo."}`);
      return;
    }

    if (data.user.identities?.length === 0) {
      setMessage("Este correo ya tiene una cuenta. Inicia sesion.");
      return;
    }

    if (data.session) {
      window.location.href = "/cuenta";
      return;
    }

    setMessage("Cuenta creada. Revisa tu correo para confirmarla y luego inicia sesion.");
  }

  return (
    <form className="card" onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
      <input
        className="input"
        onChange={(event) => setFullName(event.target.value)}
        placeholder="Nombre completo"
        required
        value={fullName}
      />
      <input
        className="input"
        onChange={(event) => setPhone(event.target.value)}
        placeholder="Telefono (opcional)"
        value={phone}
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
        placeholder="Contrasena de minimo 8 caracteres"
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
        {isSubmitting ? "Creando..." : "Crear cuenta"}
      </button>
      <Link className="muted" href="/panel/login?next=/cuenta">
        Ya tengo una cuenta
      </Link>
      {message ? <p className="muted" style={{ marginBottom: 0 }}>{message}</p> : null}
    </form>
  );
}
