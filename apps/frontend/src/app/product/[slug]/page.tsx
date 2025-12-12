import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Download, FileText, Layers, Package2, Shield, Tag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { disclaimers } from "@/lib/utils";
import { fetchProductBySlug } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Product detail | MAHA Peptides OS",
};

type ProductPageProps = {
  params: { slug: string };
};

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await fetchProductBySlug(params.slug);

  if (!product) {
    return notFound();
  }

  const latestBatch = product.batches[0];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <Link href="/catalog" className="text-sm text-primary underline-offset-4 hover:underline">
            ← Back to catalog
          </Link>
          <h1 className="text-3xl font-semibold">{product.name}</h1>
          <p className="text-muted-foreground">{product.shortDescription}</p>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <Badge variant="outline">{product.category}</Badge>
            <Badge variant="outline">{product.type}</Badge>
            <Badge variant="success">{product.availability}</Badge>
            <Badge variant="neutral">{product.keyBadge}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg border bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" aria-hidden />
          <span>Research use only. No medical guidance provided.</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <Package2 className="h-5 w-5" aria-hidden />
              </div>
              <div className="space-y-1">
                <CardTitle>Product metadata</CardTitle>
                <CardDescription>
                  Transparent product details for procurement teams. All information is neutral, non-medical, and focused on
                  research workflows.
                </CardDescription>
              </div>
            </div>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border bg-muted/40 p-4">
                <dt className="text-sm font-semibold text-foreground">Format</dt>
                <dd className="text-sm text-muted-foreground">{product.specification.format}</dd>
              </div>
              <div className="rounded-lg border bg-muted/40 p-4">
                <dt className="text-sm font-semibold text-foreground">Purity</dt>
                <dd className="text-sm text-muted-foreground">{product.specification.purity}</dd>
              </div>
              <div className="rounded-lg border bg-muted/40 p-4">
                <dt className="text-sm font-semibold text-foreground">Appearance</dt>
                <dd className="text-sm text-muted-foreground">{product.specification.appearance}</dd>
              </div>
              <div className="rounded-lg border bg-muted/40 p-4">
                <dt className="text-sm font-semibold text-foreground">Compliance note</dt>
                <dd className="text-sm text-muted-foreground">{product.complianceNote}</dd>
              </div>
            </dl>
          </CardHeader>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BadgeCheck className="h-5 w-5" aria-hidden /> Latest batch snapshot
            </CardTitle>
            <CardDescription>
              Summary of the newest available lot. Full documentation remains accessible for verification.
            </CardDescription>
          </CardHeader>
          {latestBatch ? (
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 text-foreground">
                  <Tag className="h-4 w-4" aria-hidden />
                  <span>Lot {latestBatch.lotNumber}</span>
                </div>
                <p>Status: {latestBatch.status === "available" ? "Available" : "In queue"}</p>
                <p>Manufactured on {latestBatch.manufacturedOn}</p>
                <p>{latestBatch.packaging}</p>
                <p>{latestBatch.storage}</p>
                <p>{latestBatch.availabilityNote}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm">
                  <Link href={latestBatch.coaUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2">
                    <FileText className="h-4 w-4" aria-hidden />
                    Download COA
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link
                    href={latestBatch.descriptionUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" aria-hidden />
                    Product description
                  </Link>
                </Button>
              </div>
            </CardContent>
          ) : (
            <CardContent>
              <p className="text-sm text-muted-foreground">No batches are published yet.</p>
            </CardContent>
          )}
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="batches">Batches</TabsTrigger>
          <TabsTrigger value="disclaimers">Disclaimers</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader className="space-y-2">
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" aria-hidden /> Overview
              </CardTitle>
              <CardDescription>
                {product.summary}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Neutral description focused on logistics, quality controls, and handling expectations.</p>
              <p>{product.complianceNote}</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="batches" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {product.batches.map((batch) => (
              <Card key={batch.id} className="h-full">
                <CardHeader className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-4 w-4" aria-hidden /> Lot {batch.lotNumber}
                  </CardTitle>
                  <CardDescription>Manufactured on {batch.manufacturedOn}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>Status: {batch.status === "available" ? "Available" : batch.status === "qc" ? "Quality review" : "Reserved"}</p>
                  <p>{batch.packaging}</p>
                  <p>{batch.storage}</p>
                  <p>{batch.availabilityNote}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild size="sm">
                      <Link href={batch.coaUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2">
                        <FileText className="h-4 w-4" aria-hidden />
                        COA
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={batch.descriptionUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2">
                        <Download className="h-4 w-4" aria-hidden />
                        Description
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="disclaimers">
          <Card>
            <CardHeader>
              <CardTitle>Compliance reminders</CardTitle>
              <CardDescription>Research use only. No statements constitute medical guidance.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {disclaimers.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span aria-hidden>•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
