type PriceOverrideInput = {
  productSlug?: string | null;
  variantSku?: string | null;
  strengthValue?: number | string | null;
  strengthUnit?: string | null;
};

type PriceOverride = {
  productSlug?: string;
  variantSku?: string;
  strengthValue?: number;
  strengthUnit?: string;
  priceCents: number;
};

const PRICE_OVERRIDES: PriceOverride[] = [
  {
    productSlug: "tirzepatide",
    variantSku: "TIRZ-10MG",
    strengthValue: 10,
    strengthUnit: "MG",
    priceCents: 17900,
  },
];

const normalizeSku = (value?: string | null) => (value ?? "").trim().toUpperCase();
const normalizeSlug = (value?: string | null) => (value ?? "").trim().toLowerCase();
const normalizeUnit = (value?: string | null) => (value ?? "").trim().toUpperCase();

const normalizeStrengthValue = (value?: number | string | null): number | null => {
  if (value === null || value === undefined) return null;
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
};

export function getCatalogPriceOverrideCents(input: PriceOverrideInput): number | null {
  const slug = normalizeSlug(input.productSlug);
  const sku = normalizeSku(input.variantSku);
  const unit = normalizeUnit(input.strengthUnit);
  const strengthValue = normalizeStrengthValue(input.strengthValue);

  for (const override of PRICE_OVERRIDES) {
    if (override.productSlug && slug !== normalizeSlug(override.productSlug)) continue;
    if (override.variantSku && sku !== normalizeSku(override.variantSku)) continue;
    if (override.strengthUnit && unit !== normalizeUnit(override.strengthUnit)) continue;
    if (
      typeof override.strengthValue === "number" &&
      (strengthValue === null || strengthValue !== override.strengthValue)
    ) {
      continue;
    }
    return override.priceCents;
  }

  return null;
}
