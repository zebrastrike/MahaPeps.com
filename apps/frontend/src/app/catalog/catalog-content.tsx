"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Filter, Layers, PackageSearch } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CatalogProduct } from "@/lib/catalog";

const badgeVariantByAvailability: Record<CatalogProduct["availability"], "success" | "warning" | "neutral"> = {
  "In stock": "success",
  Limited: "warning",
  "Coming soon": "neutral",
};

function EmptyState() {
  return (
    <Card className="border-dashed text-center">
      <CardHeader>
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
          <PackageSearch className="h-5 w-5" aria-hidden />
        </div>
        <CardTitle className="text-xl">No products match these filters</CardTitle>
        <CardDescription>
          Adjust category, type, or availability to see items that align with your research-only workflows.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

type CatalogContentProps = {
  products: CatalogProduct[];
  filterOptions: {
    categories: string[];
    types: string[];
    availability: string[];
  };
};

export function CatalogContent({ products, filterOptions }: CatalogContentProps) {
  const [category, setCategory] = useState<string>(filterOptions.categories[0]);
  const [type, setType] = useState<string>(filterOptions.types[0]);
  const [availability, setAvailability] = useState<string>(filterOptions.availability[0]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = category === "all" || product.category === category;
      const matchesType = type === "all" || product.type === type;
      const matchesAvailability = availability === "all" || product.availability === availability;
      return matchesCategory && matchesType && matchesAvailability;
    });
  }, [availability, category, products, type]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 rounded-xl border bg-card/40 p-4 md:grid-cols-3 md:p-6">
        <div className="flex items-start gap-3 md:col-span-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Filter className="h-5 w-5" aria-hidden />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold">Filter products</p>
            <p className="text-sm text-muted-foreground">
              Neutral catalog data only. Filters help locate the right materials without medical positioning.
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Category</p>
          <Tabs value={category} onValueChange={setCategory} className="w-full">
            <TabsList className="flex w-full flex-wrap gap-2">
              {filterOptions.categories.map((value) => (
                <TabsTrigger key={value} value={value} className="flex-1">
                  {value === "all" ? "All" : value}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Type</p>
          <Tabs value={type} onValueChange={setType} className="w-full">
            <TabsList className="flex w-full flex-wrap gap-2">
              {filterOptions.types.map((value) => (
                <TabsTrigger key={value} value={value} className="flex-1">
                  {value === "all" ? "All" : value}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Availability</p>
          <Tabs value={availability} onValueChange={setAvailability} className="w-full">
            <TabsList className="flex w-full flex-wrap gap-2">
              {filterOptions.availability.map((value) => (
                <TabsTrigger key={value} value={value} className="flex-1">
                  {value === "all" ? "All" : value}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <Card key={product.slug} className="flex h-full flex-col">
              <CardHeader className="flex-1 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <CardTitle>{product.name}</CardTitle>
                    <CardDescription>{product.shortDescription}</CardDescription>
                  </div>
                  <Badge variant="neutral">{product.keyBadge}</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">{product.category}</Badge>
                  <Badge variant="outline">{product.type}</Badge>
                  <Badge variant={badgeVariantByAvailability[product.availability]}>
                    {product.availability}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <Badge key={tag} variant="neutral">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-3 rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <Layers className="mt-0.5 h-4 w-4" aria-hidden />
                    <div>
                      <p className="font-semibold text-foreground">Specification snapshot</p>
                      <p>
                        {product.specification.purity} · {product.specification.format} · {product.specification.appearance}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3 border-t">
                <div className="flex w-full flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
                  <span>{product.summary}</span>
                </div>
                <div className="flex w-full items-center justify-between gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/product/${product.slug}`} className="inline-flex items-center gap-2">
                      View details
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </Button>
                  <Badge className="ml-auto" variant="neutral">
                    Traceable lots available
                  </Badge>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
