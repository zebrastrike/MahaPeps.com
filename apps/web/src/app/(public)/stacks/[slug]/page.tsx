"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getStackBySlug, formatStackPrice, type Stack } from "@/data/stacks";
import { ArrowLeft, Beaker, ShieldCheck, ShoppingCart } from "lucide-react";

export default function StackDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [stack, setStack] = useState<Stack | undefined>(getStackBySlug(slug));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
    fetch(`${apiBase}/stacks/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((data) => {
        setStack({
          id: data.id,
          name: data.name,
          slug: data.slug,
          tagline: data.tagline || "",
          description: data.description || "",
          focus: data.focus || "",
          products: (data.items || []).map((i: any) => ({
            name: i.product.name,
            slug: i.product.slug,
            role: i.role || "",
          })),
          priceCents: data.priceCents,
          savingsPercent: data.savingsPercent,
          popular: data.isPopular,
        });
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [slug]);

  if (!stack) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-editorial text-4xl text-warm-white mb-4">Stack Not Found</h1>
          <Link href="/stacks" className="text-gold-400 hover:text-gold-300 font-label text-sm tracking-widest">
            &larr; Back to Stacks
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-900">
      {/* Breadcrumb */}
      <div className="border-b border-gold-500/10 bg-navy-800/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-warm-white/40">
            <Link href="/stacks" className="flex items-center gap-1 font-label text-[0.6rem] tracking-widest hover:text-gold-400 transition-colors">
              <ArrowLeft className="h-3 w-3" />
              All Stacks
            </Link>
            <span className="text-warm-white/20">/</span>
            <span className="font-label text-[0.6rem] tracking-widest text-gold-400/70">{stack.name}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-12 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Left — Image */}
            <div className="relative aspect-square overflow-hidden border border-gold-500/15 bg-navy-800">
              <img
                src="/products/maha-branded.jpg"
                alt={stack.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4">
                <span className="badge-american">{stack.focus}</span>
              </div>
              {stack.popular && (
                <div className="absolute top-4 right-4">
                  <span className="badge-american">Popular</span>
                </div>
              )}
            </div>

            {/* Right — Details */}
            <div className="flex flex-col justify-center">
              <p className="font-label mb-3 text-[0.6rem] tracking-[0.2em] text-gold-500/60">
                Research Stack
              </p>
              <h1 className="font-editorial text-5xl text-warm-white md:text-6xl">
                {stack.name}
              </h1>
              <p className="mt-2 font-label text-[0.7rem] tracking-widest text-warm-white/50">
                {stack.tagline}
              </p>

              <hr className="divider-gold mt-6 mb-6 w-12" />

              <p className="text-sm font-light leading-relaxed text-warm-white/50">
                {stack.description}
              </p>

              {/* Included Peptides */}
              <div className="mt-8">
                <h3 className="font-label text-[0.65rem] tracking-widest text-warm-white/60 mb-4">
                  Included in this Stack
                </h3>
                <div className="space-y-3">
                  {stack.products.map((product) => (
                    <div
                      key={product.slug}
                      className="flex items-start gap-3 border border-gold-500/10 bg-navy-800/50 p-4 transition-colors hover:border-gold-500/25"
                    >
                      <Beaker className="h-4 w-4 flex-shrink-0 text-gold-500/60 mt-0.5" />
                      <div>
                        <Link
                          href={`/products/${product.slug}`}
                          className="text-sm font-medium text-warm-white hover:text-gold-300 transition-colors"
                        >
                          {product.name}
                        </Link>
                        <p className="mt-0.5 text-xs font-light text-warm-white/40">
                          {product.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div className="mt-8 border border-gold-500/15 bg-navy-800/50 p-6">
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <span className="font-editorial text-4xl text-gold-400">
                      {formatStackPrice(stack.priceCents)}
                    </span>
                    <p className="font-label text-[0.55rem] tracking-wider text-warm-white/30 mt-1">
                      Save {stack.savingsPercent}% vs purchasing individually
                    </p>
                  </div>
                  <span className="font-label text-[0.55rem] tracking-widest text-warm-white/25">
                    {stack.products.length} peptides
                  </span>
                </div>

                <button
                  className="flex w-full items-center justify-center gap-2 border border-gold-500/60 bg-gold-500/10 px-6 py-3 font-label text-[0.65rem] tracking-widest text-gold-400 transition-all hover:bg-gold-500/20 hover:border-gold-400 hover:text-gold-300"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add Stack to Cart
                </button>

                <p className="font-label mt-3 text-center text-[0.5rem] tracking-wider text-warm-white/20">
                  Research Use Only — Not for human consumption
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why These Peptides Together */}
      <section className="border-t border-gold-500/10 bg-navy-800/30 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-editorial text-3xl text-warm-white text-center mb-10">
            Why These Peptides Together?
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {stack.products.map((product, i) => (
              <div key={product.slug} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-gold-500/30 bg-navy-800">
                  <span className="font-editorial text-xl text-gold-400">{i + 1}</span>
                </div>
                <h4 className="font-editorial text-lg text-warm-white mb-2">{product.name}</h4>
                <p className="text-xs font-light leading-relaxed text-warm-white/45">
                  {product.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Other Stacks */}
      <section className="border-t border-gold-500/10 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-editorial text-2xl text-warm-white mb-2">Explore Other Stacks</h2>
          <p className="text-sm text-warm-white/40 mb-8">Find the right research protocol for your lab</p>
          <Link
            href="/stacks"
            className="inline-flex items-center gap-2 border border-gold-500/40 px-8 py-3 font-label text-[0.65rem] tracking-widest text-gold-400 transition-all hover:bg-gold-500/10"
          >
            View All Stacks
          </Link>
        </div>
      </section>

      {/* Compliance */}
      <section className="border-t border-gold-500/10 bg-navy-900 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="border border-warm-muted/20 p-6">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 flex-shrink-0 text-warm-muted mt-0.5" />
              <p className="text-xs font-light leading-relaxed text-warm-white/35">
                All products are intended solely for lawful laboratory research.
                Not for human or veterinary consumption.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
