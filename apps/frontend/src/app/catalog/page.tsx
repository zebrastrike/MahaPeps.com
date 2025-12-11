import { ShieldCheck } from "lucide-react";

import { GlobalDisclaimer } from "@/components/banners/global-disclaimer";
import { Button } from "@/components/ui/button";
import { disclaimers } from "@/lib/utils";

const placeholderProducts = [
  {
    name: "Research Peptide A",
    sku: "SKU-001",
    purity: 99.4,
    batchId: "BCH-2024-001",
    storage: "Store at -20°C in a desiccated vial; avoid repeated freeze-thaw cycles.",
    coaUrl: "https://example.com/coa/SKU-001",
  },
  {
    name: "Research Peptide B",
    sku: "SKU-002",
    purity: 98.9,
    batchId: "BCH-2024-002",
    storage: "Refrigerate at 2-8°C; protect from light and humidity.",
    coaUrl: "https://example.com/coa/SKU-002",
  },
  {
    name: "Research Supply Kit",
    sku: "SKU-003",
    purity: 97.5,
    batchId: "BCH-2024-003",
    storage: "Keep sealed at room temperature; do not expose to moisture.",
    coaUrl: "https://example.com/coa/SKU-003",
  },
];

export default function CatalogPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Catalog</h1>
          <p className="text-muted-foreground">
            Placeholder catalog for research-use products. Content intentionally avoids medical or biological claims.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="h-4 w-4" aria-hidden />
          <span>KYC and age verification required before checkout.</span>
        </div>
      </div>
      <GlobalDisclaimer />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {placeholderProducts.map((product) => (
          <div key={product.sku} className="flex h-full flex-col justify-between rounded-xl border bg-card p-4">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">{product.name}</p>
              <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
              <dl className="grid grid-cols-1 gap-1 text-xs text-muted-foreground">
                <div>
                  <dt className="font-semibold text-foreground">Purity</dt>
                  <dd>{product.purity}% (HPLC)</dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">Batch ID</dt>
                  <dd>{product.batchId}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">Storage</dt>
                  <dd>{product.storage}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">COA</dt>
                  <dd>
                    <a
                      href={product.coaUrl}
                      className="underline underline-offset-2 hover:text-foreground"
                      rel="noreferrer"
                      target="_blank"
                    >
                      Certificate of Analysis
                    </a>
                  </dd>
                </div>
              </dl>
            </div>
            <div className="mt-4 space-y-3">
              <ul className="space-y-1 rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
                {disclaimers.map((statement) => (
                  <li key={statement} className="flex gap-1">
                    <span aria-hidden>•</span>
                    <span>{statement}</span>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <Button disabled size="sm">
                  Add to cart
                </Button>
                <Button disabled variant="outline" size="sm">
                  Details
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
