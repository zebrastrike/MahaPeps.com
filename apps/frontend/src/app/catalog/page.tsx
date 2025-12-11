import { ShieldCheck } from "lucide-react";

import { GlobalDisclaimer } from "@/components/banners/global-disclaimer";
import { Button } from "@/components/ui/button";

const placeholderProducts = [
  {
    name: "Research Peptide A",
    sku: "SKU-001",
  },
  {
    name: "Research Peptide B",
    sku: "SKU-002",
  },
  {
    name: "Research Supply Kit",
    sku: "SKU-003",
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
              <p className="text-sm text-muted-foreground">
                Description and pricing will be added later following compliance review. No medical usage is implied.
              </p>
            </div>
            <div className="mt-4 flex gap-2">
              <Button disabled size="sm">
                Add to cart
              </Button>
              <Button disabled variant="outline" size="sm">
                Details
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
