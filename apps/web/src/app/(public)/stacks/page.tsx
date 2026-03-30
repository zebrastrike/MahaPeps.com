"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { STACKS as FALLBACK_STACKS, formatStackPrice, type Stack } from "@/data/stacks";
import { ArrowRight, Beaker, ShieldCheck } from "lucide-react";

interface ApiStack {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  focus: string | null;
  priceCents: number;
  savingsPercent: number;
  isActive: boolean;
  isPopular: boolean;
  items: {
    id: string;
    role: string | null;
    product: { id: string; name: string; slug: string };
  }[];
}

function apiToStack(s: ApiStack): Stack {
  return {
    id: s.id,
    name: s.name,
    slug: s.slug,
    tagline: s.tagline || "",
    description: s.description || "",
    focus: s.focus || "",
    products: s.items.map((i) => ({
      name: i.product.name,
      slug: i.product.slug,
      role: i.role || "",
    })),
    priceCents: s.priceCents,
    savingsPercent: s.savingsPercent,
    popular: s.isPopular,
  };
}

export default function StacksPage() {
  const [stacks, setStacks] = useState<Stack[]>(FALLBACK_STACKS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
    fetch(`${apiBase}/stacks`)
      .then((r) => r.json())
      .then((data: ApiStack[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setStacks(data.map(apiToStack));
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  return (
    <div className="min-h-screen bg-navy-900">
      {/* Hero */}
      <section className="relative border-b border-gold-500/15 bg-navy-900 py-16 lg:py-24">
        <div className="star-texture absolute inset-0 pointer-events-none" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-label mb-4 text-gold-500/70 tracking-[0.2em]">
            Curated Research Protocols
          </p>
          <h1 className="font-editorial text-5xl text-warm-white md:text-6xl lg:text-7xl">
            Research <span className="text-gold-400 italic">Stacks</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-warm-white/50 md:text-lg">
            Peptides work better together. Our stacks pair complementary compounds into
            goal-focused research protocols — curated by scientists, priced to save.
          </p>
          <hr className="divider-gold mx-auto mt-8 w-16" />
        </div>
      </section>

      {/* What Are Stacks — Quick Explainer */}
      <section className="border-b border-gold-500/10 bg-navy-800/40 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-px border border-gold-500/10 md:grid-cols-3">
            {[
              {
                title: "Synergistic Protocols",
                body: "Each stack groups peptides that target complementary biological pathways, creating research protocols more powerful than any single compound.",
              },
              {
                title: "Scientist-Curated",
                body: "Stack compositions are based on published research and established peptide synergies — not marketing gimmicks. Every pairing has a rationale.",
              },
              {
                title: "Built-In Savings",
                body: "Every stack saves 10–12% versus purchasing peptides individually. Same 99%+ purity, same COA documentation, better value.",
              },
            ].map(({ title, body }) => (
              <div
                key={title}
                className="group bg-navy-800/50 p-8 backdrop-blur-sm transition-all hover:bg-navy-700/50"
              >
                <hr className="divider-red mb-6 w-8" />
                <h3 className="font-editorial mb-3 text-xl text-warm-white">{title}</h3>
                <p className="text-sm font-light leading-relaxed text-warm-white/45">{body}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/stacks/about"
              className="font-label text-[0.65rem] tracking-widest text-gold-400/70 transition-colors hover:text-gold-300"
            >
              Learn more about peptide stacking &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Stack Grid */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {stacks.map((stack) => (
              <Link
                key={stack.id}
                href={`/stacks/${stack.slug}`}
                className="group relative overflow-hidden border border-gold-500/10 bg-navy-800 transition-all duration-300 hover:border-gold-500/40 hover:shadow-gold hover:-translate-y-0.5"
              >
                {stack.popular && (
                  <div className="absolute right-4 top-4 z-10">
                    <span className="badge-american">Popular</span>
                  </div>
                )}

                <div className="relative aspect-[16/9] overflow-hidden bg-navy-900/60">
                  <img
                    src="/products/maha-branded.jpg"
                    alt={stack.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <span className="font-label text-[0.55rem] tracking-widest text-gold-400/80 bg-navy-900/60 px-2 py-1">
                      {stack.focus}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-editorial text-2xl text-warm-white group-hover:text-gold-300 transition-colors">
                    {stack.name}
                  </h3>
                  <p className="mt-1 font-label text-[0.6rem] tracking-widest text-warm-white/40">
                    {stack.tagline}
                  </p>

                  <div className="mt-4 space-y-1.5">
                    {stack.products.map((p) => (
                      <div key={p.slug} className="flex items-center gap-2">
                        <Beaker className="h-3 w-3 flex-shrink-0 text-gold-500/50" />
                        <span className="text-xs text-warm-white/60">{p.name}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex items-end justify-between">
                    <div>
                      <span className="font-editorial text-2xl text-gold-400">
                        {formatStackPrice(stack.priceCents)}
                      </span>
                      <p className="font-label text-[0.5rem] tracking-wider text-warm-white/25">
                        Save {stack.savingsPercent}% vs individual
                      </p>
                    </div>
                    <span className="flex items-center gap-1 font-label text-[0.6rem] tracking-widest text-gold-400/60 group-hover:text-gold-300 transition-colors">
                      View Stack <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section className="border-t border-gold-500/10 bg-navy-900 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="border border-warm-muted/20 p-6">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 flex-shrink-0 text-warm-muted mt-0.5" />
              <p className="text-xs font-light leading-relaxed text-warm-white/35">
                All stacks are intended solely for lawful laboratory research. Not for human or veterinary consumption.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
