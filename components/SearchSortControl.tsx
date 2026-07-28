"use client";

import { useRouter, useSearchParams } from "next/navigation";

type SortOption = "relevance" | "price_asc" | "price_desc" | "availability";

const sortLabels: Record<SortOption, string> = {
  relevance: "Mas relevantes",
  price_asc: "Precio: menor a mayor",
  price_desc: "Precio: mayor a menor",
  availability: "Disponibilidad",
};

export function SearchSortControl({ currentSort }: { currentSort: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "relevance") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    const queryString = params.toString();
    router.push(queryString ? `/buscar?${queryString}` : "/buscar");
  }

  const sort = (currentSort in sortLabels ? currentSort : "relevance") as SortOption;

  return (
    <div className="search-sort-dropdown">
      <span className="search-sort-label" aria-hidden="true">Ordenar:</span>
      <label className="sr-only" htmlFor="search-sort">Ordenar por</label>
      <select
        className="input search-sort-select"
        id="search-sort"
        onChange={(event) => handleChange(event.target.value)}
        value={sort}
      >
        {(Object.keys(sortLabels) as SortOption[]).map((option) => (
          <option key={option} value={option}>{sortLabels[option]}</option>
        ))}
      </select>
    </div>
  );
}
