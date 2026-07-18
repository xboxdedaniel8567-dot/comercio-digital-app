"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

type SearchLoggerProps = {
  query: string;
  resultsCount: number;
};

export function SearchLogger({ query, resultsCount }: SearchLoggerProps) {
  useEffect(() => {
    async function logSearch() {
      const cleanQuery = query.trim();

      if (!cleanQuery) {
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase.from("search_logs").insert({
        city: "Cali",
        query: cleanQuery,
        results_count: resultsCount,
        user_id: userData.user?.id ?? null,
      });

      if (error) {
        console.error("No se pudo registrar la busqueda:", error.message);
      }
    }

    void logSearch();
  }, [query, resultsCount]);

  return null;
}
