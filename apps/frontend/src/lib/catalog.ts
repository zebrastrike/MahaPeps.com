export type ProductBatch = {
  id: string;
  lotNumber: string;
  status: "available" | "qc" | "reserved";
  manufacturedOn: string;
  packaging: string;
  storage: string;
  availabilityNote: string;
  coaUrl: string;
  descriptionUrl: string;
};

export type CatalogProduct = {
  slug: string;
  name: string;
  shortDescription: string;
  category: string;
  type: string;
  availability: "In stock" | "Limited" | "Coming soon";
  keyBadge: string;
  tags: string[];
  specification: {
    format: string;
    purity: string;
    appearance: string;
  };
  summary: string;
  complianceNote: string;
  batches: ProductBatch[];
};

const catalogProducts: CatalogProduct[] = [
  {
    slug: "signal-reference-peptide",
    name: "Signal Reference Peptide",
    shortDescription: "Reference-grade sequence for instrumentation validation and workflow controls.",
    category: "Peptides",
    type: "Peptide",
    availability: "In stock",
    keyBadge: "HPLC ≥99% | Lyophilized",
    tags: ["QC released", "Ambient shipping", "Research use only"],
    specification: {
      format: "Lyophilized solid",
      purity: "HPLC ≥99%",
      appearance: "White to off-white powder",
    },
    summary:
      "Controlled reference material suitable for equipment calibration, in-house benchmarking, and method development. Packaging and documentation focus on traceability and stable handling.",
    complianceNote: "Distributed for research workflows that require documented chain-of-custody and safety labeling.",
    batches: [
      {
        id: "BCH-2407-01",
        lotNumber: "LRP-2407",
        status: "available",
        manufacturedOn: "2024-07-08",
        packaging: "10 mg and 25 mg vials, tamper-evident seal",
        storage: "Store at -20°C in a desiccated environment; avoid light exposure.",
        availabilityNote: "Primary lot with full QC release.",
        coaUrl: "https://example.com/coa/signal-reference-peptide.pdf",
        descriptionUrl: "https://example.com/descriptions/signal-reference-peptide.pdf",
      },
      {
        id: "BCH-2405-02",
        lotNumber: "LRP-2405",
        status: "qc",
        manufacturedOn: "2024-05-22",
        packaging: "10 mg vials",
        storage: "Maintain frozen until use; minimize room temperature exposure.",
        availabilityNote: "Additional lot in quality review.",
        coaUrl: "https://example.com/coa/signal-reference-peptide-2405.pdf",
        descriptionUrl: "https://example.com/descriptions/signal-reference-peptide-2405.pdf",
      },
    ],
  },
  {
    slug: "buffer-system-kit",
    name: "Buffer System Kit",
    shortDescription: "Pre-measured buffer components for assay preparation and routine equipment checks.",
    category: "Reagents",
    type: "Kit",
    availability: "Limited",
    keyBadge: "Batch-tracked | Room temperature stable",
    tags: ["Ready-to-use", "Lot traceability", "Neutral pH"],
    specification: {
      format: "Liquid components with serialized labels",
      purity: "Analytical grade inputs",
      appearance: "Clear solutions in HDPE bottles",
    },
    summary:
      "Convenient buffer system designed for repeatable lab setup. Labels include batch codes and storage reminders to support controlled environments.",
    complianceNote: "Kit ships with safety data references and research-use labeling.",
    batches: [
      {
        id: "BCH-2406-11",
        lotNumber: "BSK-2406",
        status: "available",
        manufacturedOn: "2024-06-18",
        packaging: "3 x 500 mL bottles with tamper seals",
        storage: "Store at 2-8°C; do not freeze.",
        availabilityNote: "Allocations prioritized for existing programs.",
        coaUrl: "https://example.com/coa/buffer-system-kit.pdf",
        descriptionUrl: "https://example.com/descriptions/buffer-system-kit.pdf",
      },
      {
        id: "BCH-2403-09",
        lotNumber: "BSK-2403",
        status: "reserved",
        manufacturedOn: "2024-03-12",
        packaging: "3 x 250 mL bottles",
        storage: "Refrigerate upon arrival; keep containers closed when not in use.",
        availabilityNote: "Reserved for scheduled replenishment.",
        coaUrl: "https://example.com/coa/buffer-system-kit-2403.pdf",
        descriptionUrl: "https://example.com/descriptions/buffer-system-kit-2403.pdf",
      },
    ],
  },
  {
    slug: "surface-blocking-reagent",
    name: "Surface Blocking Reagent",
    shortDescription: "Ready-to-use blocking solution to support baseline instrument checks and negative controls.",
    category: "Reagents",
    type: "Reagent",
    availability: "In stock",
    keyBadge: "Filtered | Lot-audited",
    tags: ["Single-use vials", "Sterile filtered", "Neutral composition"],
    specification: {
      format: "Liquid, 10 mL single-use vials",
      purity: "0.2 µm filtered",
      appearance: "Clear, colorless solution",
    },
    summary:
      "Formulated to help establish consistent baselines in lab instrumentation. Prepared under controlled conditions with clear labeling for storage and disposal.",
    complianceNote: "Includes handling reminders for research settings and non-clinical applications.",
    batches: [
      {
        id: "BCH-2408-04",
        lotNumber: "SBR-2408",
        status: "available",
        manufacturedOn: "2024-08-02",
        packaging: "10 x 10 mL vials in protective tray",
        storage: "Store at 2-8°C; do not freeze.",
        availabilityNote: "Fresh lot with full documentation available.",
        coaUrl: "https://example.com/coa/surface-blocking-reagent.pdf",
        descriptionUrl: "https://example.com/descriptions/surface-blocking-reagent.pdf",
      },
    ],
  },
];

export async function fetchCatalogProducts(): Promise<CatalogProduct[]> {
  return Promise.resolve(catalogProducts);
}

export async function fetchProductBySlug(slug: string): Promise<CatalogProduct | null> {
  const product = catalogProducts.find((item) => item.slug === slug);
  return Promise.resolve(product ?? null);
}
