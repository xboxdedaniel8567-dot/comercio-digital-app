export const comparisonStorageKey = "comercio-digital-comparison";
export const comparisonChangedEvent = "comparison-products-changed";
export const comparisonLimit = 3;

export type ComparisonItem = {
  name: string;
  slug: string;
};

export function readComparison(): ComparisonItem[] {
  if (typeof window === "undefined") return [];

  try {
    const value = JSON.parse(window.localStorage.getItem(comparisonStorageKey) ?? "[]");
    return Array.isArray(value)
      ? value.filter((item) => item && typeof item.name === "string" && typeof item.slug === "string")
      : [];
  } catch {
    return [];
  }
}

export function writeComparison(items: ComparisonItem[]) {
  window.localStorage.setItem(comparisonStorageKey, JSON.stringify(items));
  window.dispatchEvent(new Event(comparisonChangedEvent));
}

