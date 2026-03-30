import Link from "next/link";
import Image from "next/image";
import { HeroVideo } from "@/components/hero/hero-video";
import { MarketStats } from "@/components/home/market-stats";
import { STACKS, formatStackPrice } from "@/data/stacks";
import { Beaker, Shield, FileText, MapPin, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-navy-900">

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-navy-900 py-20 lg:py-32">
        <HeroVideo />

        {/* Gold/red ambient overlay */}
        <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(184,150,90,0.08),transparent_55%)]" />
        <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_70%_80%,rgba(139,26,26,0.07),transparent_50%)]" />

        {/* Star texture watermark */}
        <div className="star-texture absolute inset-0 z-10 pointer-events-none" />

        <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">

            {/* Logo */}
            <div className="mb-10 flex justify-center">
              <Image
                src="/branding/maha-logo.png"
                alt="MAHA Peptides"
                width={400}
                height={145}
                className="h-24 w-auto md:h-32"
                priority
              />
            </div>

            {/* Eyebrow label */}
            <p className="font-label mb-5 text-gold-500/70 tracking-[0.2em]">
              American-Made Research Peptides
            </p>

            {/* Headline — Cormorant Garamond */}
            <h1 className="font-editorial mx-auto max-w-4xl text-5xl text-warm-white md:text-6xl lg:text-7xl xl:text-8xl">
              American-Made.
              <br />
              <span className="text-gold-400 italic">Uncompromising.</span>
            </h1>

            {/* Subheadline */}
            <p className="mx-auto mt-8 max-w-xl text-base font-light leading-relaxed text-warm-white/55 md:text-lg">
              Built in America. For researchers who demand better.
            </p>

            {/* Gold rule */}
            <div className="mx-auto mt-10 w-24">
              <hr className="divider-gold" />
            </div>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/stacks"
                className="inline-flex items-center gap-3 border border-gold-500 bg-gold-500/10 px-10 py-3.5 font-label text-[0.65rem] tracking-[0.15em] text-gold-300 transition-all hover:bg-gold-500/20 hover:text-gold-200 hover:shadow-gold"
              >
                Shop Stacks
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-3 border border-warm-white/15 px-10 py-3.5 font-label text-[0.65rem] tracking-[0.15em] text-warm-white/50 transition-all hover:border-warm-white/30 hover:text-warm-white/80"
              >
                Contact Sales
              </Link>
            </div>

            {/* Trust Signals */}
            <div className="mt-20 grid grid-cols-2 gap-px border border-gold-500/10 md:grid-cols-4">
              {[
                { icon: <Beaker className="h-5 w-5" />, title: "99%+ Purity",           sub: "HPLC Verified"      },
                { icon: <FileText className="h-5 w-5" />, title: "Full COA Access",      sub: "Every Batch"        },
                { icon: <MapPin className="h-5 w-5" />,   title: "American Made",        sub: "USA Manufacturing"  },
                { icon: <Shield className="h-5 w-5" />,   title: "Cold Chain Certified", sub: "Quality Assured"    },
              ].map(({ icon, title, sub }) => (
                <div key={title} className="flex flex-col items-center gap-2 bg-navy-800/40 px-6 py-8 text-center backdrop-blur-sm">
                  <div className="text-gold-500/60">{icon}</div>
                  <p className="font-label text-[0.6rem] tracking-widest text-warm-white/80">{title}</p>
                  <p className="font-label text-[0.55rem] tracking-wider text-warm-white/35">{sub}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* Featured Stacks */}
      <section className="bg-navy-800/40 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <p className="font-label mb-4 text-gold-500/60 tracking-[0.18em]">Curated Protocols</p>
            <h2 className="font-editorial text-4xl text-warm-white md:text-5xl">
              Research <span className="text-gold-400 italic">Stacks</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm font-light text-warm-white/45">
              Peptides paired for synergy. Each stack targets complementary pathways — save 10% vs buying individually.
            </p>
            <hr className="divider-gold mx-auto mt-6 w-16" />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {STACKS.filter((s) => s.popular).map((stack) => (
              <Link
                key={stack.id}
                href={`/stacks/${stack.slug}`}
                className="group overflow-hidden border border-gold-500/10 bg-navy-800 transition-all duration-300 hover:border-gold-500/40 hover:shadow-gold hover:-translate-y-0.5"
              >
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
                  <p className="mt-1 text-xs text-warm-white/40">{stack.tagline}</p>
                  <div className="mt-3 space-y-1">
                    {stack.products.map((p) => (
                      <div key={p.slug} className="flex items-center gap-2">
                        <Beaker className="h-2.5 w-2.5 text-gold-500/40" />
                        <span className="text-xs text-warm-white/50">{p.name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-end justify-between">
                    <span className="font-editorial text-xl text-gold-400">
                      {formatStackPrice(stack.priceCents)}
                    </span>
                    <span className="flex items-center gap-1 font-label text-[0.55rem] tracking-widest text-gold-400/50 group-hover:text-gold-300">
                      View <ArrowRight className="h-2.5 w-2.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/stacks"
              className="inline-flex items-center gap-2 border border-gold-500/40 px-8 py-3 font-label text-[0.65rem] tracking-widest text-gold-400 transition-all hover:bg-gold-500/10 hover:text-gold-300"
            >
              View All 10 Stacks <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* Market Data Stats */}
      <MarketStats />

      {/* Features Section */}
      <section className="bg-navy-800/60 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="mb-14 text-center">
            <p className="font-label mb-4 text-gold-500/60 tracking-[0.18em]">Why MAHA Peptides</p>
            <h2 className="font-editorial text-4xl text-warm-white md:text-5xl">
              The Standard. Set Here.
            </h2>
            <hr className="divider-gold mx-auto mt-6 w-16" />
          </div>

          <div className="grid gap-px border border-gold-500/10 md:grid-cols-3">
            {[
              {
                title: "Rigorous Quality Control",
                body:  "Every batch undergoes comprehensive HPLC, mass spectrometry, and purity analysis. No foreign labs. No shortcuts. Complete documentation on every order.",
              },
              {
                title: "Compliance First",
                body:  "Research-use materials with full regulatory compliance. Proper handling and storage documentation included. While others outsource, we manufacture domestically.",
              },
              {
                title: "Wholesale Pricing",
                body:  "Volume programs available for qualified research institutions and laboratories. American-grade product at competitive scale — contact our team for custom pricing.",
              },
            ].map(({ title, body }) => (
              <div
                key={title}
                className="group bg-navy-800/50 p-8 backdrop-blur-sm transition-all hover:bg-navy-700/50"
              >
                <hr className="divider-red mb-6 w-8" />
                <h3 className="font-editorial mb-4 text-2xl text-warm-white">{title}</h3>
                <p className="text-sm font-light leading-relaxed text-warm-white/45">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Americana Statement Band */}
      <section className="relative overflow-hidden border-y border-gold-500/15 bg-navy-900 py-14">
        <div className="star-texture absolute inset-0 pointer-events-none" />
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <p className="font-editorial text-3xl italic text-gold-400 md:text-4xl">
            "No foreign labs. No compromises. American-grade."
          </p>
          <p className="font-label mt-4 text-[0.6rem] tracking-[0.2em] text-warm-white/30">
            MAHA Peptides — Manufactured in the United States of America
          </p>
        </div>
      </section>

      {/* Compliance Notice */}
      <section className="border-t border-gold-500/10 bg-navy-900 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="border border-warm-muted/20 p-6">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 flex-shrink-0 text-warm-muted mt-0.5" />
              <div>
                <p className="font-label text-[0.6rem] tracking-widest text-warm-muted mb-2">
                  Regulatory Compliance Notice
                </p>
                <p className="text-xs font-light leading-relaxed text-warm-white/35">
                  All products sold on this platform are intended solely for lawful laboratory research and analytical use.
                  Not for human or veterinary consumption. Purchaser assumes all responsibility for regulatory compliance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
