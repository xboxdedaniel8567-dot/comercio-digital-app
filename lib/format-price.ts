/** Normaliza precios de PostgREST (numeric suele llegar como string). */
export function coercePrice(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" && value.trim() === "") return null;
  const numeric = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(numeric) ? numeric : null;
}

export const SUSPICIOUS_PRICE_COP = 100_000_000;

/** Formato de moneda seguro en SSR (Cloudflare Workers / Intl). */
export function formatPrice(
  price: string | number | null | undefined,
  currency: string | null | undefined = "COP",
): string {
  const numericPrice = coercePrice(price);
  if (numericPrice === null) return "Precio por consultar";

  const safeCurrency = currency?.trim() || "COP";
  if (safeCurrency.toUpperCase() === "COP") {
    return `$${Math.round(numericPrice).toLocaleString("es-CO", {
      maximumFractionDigits: 0,
    })}`;
  }

  try {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: safeCurrency,
      maximumFractionDigits: 0,
    }).format(numericPrice);
  } catch {
    return `${numericPrice.toLocaleString("es-CO")} ${safeCurrency}`;
  }
}

/** Conserva solo dígitos para que Supabase reciba un número limpio. */
export function sanitizePriceInput(value: string): string {
  return value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
}

export function parsePriceInput(value: string): number | null {
  if (!value) return null;
  const numeric = Number(value);
  return Number.isSafeInteger(numeric) ? numeric : null;
}

export function getPriceError(value: string, optional = false): string | null {
  if (!value) return optional ? null : "Escribe el precio del producto.";
  const numeric = parsePriceInput(value);
  if (numeric === null) return "Escribe un precio válido usando solo números.";
  if (numeric <= 0) return "El precio debe ser mayor que cero.";
  return null;
}

function underOneHundred(value: number): string {
  const direct: Record<number, string> = {
    0: "",
    1: "uno",
    2: "dos",
    3: "tres",
    4: "cuatro",
    5: "cinco",
    6: "seis",
    7: "siete",
    8: "ocho",
    9: "nueve",
    10: "diez",
    11: "once",
    12: "doce",
    13: "trece",
    14: "catorce",
    15: "quince",
    16: "dieciséis",
    17: "diecisiete",
    18: "dieciocho",
    19: "diecinueve",
    20: "veinte",
    21: "veintiuno",
    22: "veintidós",
    23: "veintitrés",
    24: "veinticuatro",
    25: "veinticinco",
    26: "veintiséis",
    27: "veintisiete",
    28: "veintiocho",
    29: "veintinueve",
  };
  if (value <= 29) return direct[value];

  const tens = ["", "", "", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
  const ten = Math.floor(value / 10);
  const unit = value % 10;
  return unit ? `${tens[ten]} y ${direct[unit]}` : tens[ten];
}

function underOneThousand(value: number): string {
  if (value < 100) return underOneHundred(value);
  if (value === 100) return "cien";

  const hundreds = [
    "",
    "ciento",
    "doscientos",
    "trescientos",
    "cuatrocientos",
    "quinientos",
    "seiscientos",
    "setecientos",
    "ochocientos",
    "novecientos",
  ];
  const hundred = Math.floor(value / 100);
  const remainder = value % 100;
  return [hundreds[hundred], underOneHundred(remainder)].filter(Boolean).join(" ");
}

function apocopate(value: string): string {
  return value
    .replace(/veintiuno$/, "veintiun")
    .replace(/ y uno$/, " y un")
    .replace(/uno$/, "un");
}

function integerToSpanish(value: number): string {
  if (value < 1_000) return underOneThousand(value);
  if (value < 1_000_000) {
    const thousands = Math.floor(value / 1_000);
    const remainder = value % 1_000;
    const prefix = thousands === 1 ? "mil" : `${apocopate(integerToSpanish(thousands))} mil`;
    return [prefix, integerToSpanish(remainder)].filter(Boolean).join(" ");
  }
  if (value < 1_000_000_000_000) {
    const millions = Math.floor(value / 1_000_000);
    const remainder = value % 1_000_000;
    const prefix = millions === 1
      ? "un millón"
      : `${apocopate(integerToSpanish(millions))} millones`;
    return [prefix, integerToSpanish(remainder)].filter(Boolean).join(" ");
  }

  const billions = Math.floor(value / 1_000_000_000_000);
  const remainder = value % 1_000_000_000_000;
  const prefix = billions === 1
    ? "un billón"
    : `${apocopate(integerToSpanish(billions))} billones`;
  return [prefix, integerToSpanish(remainder)].filter(Boolean).join(" ");
}

export function priceToWords(value: string | number | null | undefined): string {
  const numeric = coercePrice(value);
  if (numeric === null || numeric <= 0 || !Number.isSafeInteger(numeric)) return "";
  const words = apocopate(integerToSpanish(numeric));
  const currencyWords = numeric >= 1_000_000 && numeric % 1_000_000 === 0
    ? "de pesos"
    : numeric === 1 ? "peso" : "pesos";
  return `${words.charAt(0).toUpperCase()}${words.slice(1)} ${currencyWords}`;
}
