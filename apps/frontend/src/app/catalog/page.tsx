import { ShieldCheck } from "lucide-react";

import { GlobalDisclaimer } from "@/components/banners/global-disclaimer";
import { CatalogProduct, fetchCatalogProducts } from "@/lib/catalog";

import { CatalogContent } from "./catalog-content";

function getFilterOptions(products: CatalogProduct[]) {
  const categories = Array.from(new Set(products.map((product) => product.category)));
  const types = Array.from(new Set(products.map((product) => product.type)));
  const availability = Array.from(new Set(products.map((product) => product.availability)));

  return {
    categories: ["all", ...categories],
    types: ["all", ...types],
    availability: ["all", ...availability],
  };
}

export default async function CatalogPage() {
  const products = await fetchCatalogProducts();
  const filterOptions = getFilterOptions(products);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Public Catalog</h1>
          <p className="text-muted-foreground">
            Browse research-use-only materials with transparent batch information and neutral descriptions.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="h-4 w-4" aria-hidden />
          <span>KYC and age verification required prior to checkout.</span>
        </div>
      </div>
      <GlobalDisclaimer />
      <CatalogContent filterOptions={filterOptions} products={products} />
    </div>
  );
}
