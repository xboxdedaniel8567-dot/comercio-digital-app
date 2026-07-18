"use client";

import { supabase } from "@/lib/supabase";

export function LogoutButton() {
  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/panel/login";
  }

  return (
    <button className="btn btn-dark" onClick={handleLogout} type="button">
      Cerrar sesion
    </button>
  );
}
