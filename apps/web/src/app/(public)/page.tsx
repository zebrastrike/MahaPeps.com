import Link from "next/link";
import Image from "next/image";
import { HeroVideo } from "@/components/hero/hero-video";
import { MarketStats } from "@/components/home/market-stats";
import { Beaker, Shield, FileText, MapPin, ChevronRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-charcoal-900 to-charcoal-800 py-16 lg:py-24">
        <HeroVideo />
        <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(58,127,140,0.1),transparent_50%)]" />

        <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Logo */}
            <div className="mb-8 flex justify-center">
              <Image
                src="/branding/maha-logo.png"
                alt="MAHA Peptides"
                width={400}
                height={145}
                className="h-28 w-auto md:h-36"
                priority
              />
            </div>

            {/* Headline */}
            <h1 className="mx-auto max-w-4xl text-4xl font-semibold tracking-tight text-clinical-white md:text-5xl lg:text-6xl">
              American-Made Research Peptides
            </h1>

            {/* Subheadline */}
            <p className="mx-auto mt-6 max-w-2xl text-lg text-charcoal-200 md:text-xl">
              99%+ Purity | Full COA Documentation | Pharmaceutical-Grade Standards
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full bg-accent-500 px-8 py-4 text-base font-semibold text-white shadow-dark transition-all hover:bg-accent-600 hover:shadow-dark-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-charcoal-900"
              >
                Browse Catalog
                <ChevronRight className="h-5 w-5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-accent-500/80 px-8 py-4 text-base font-semibold text-accent-300 transition-all hover:bg-accent-500/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-charcoal-900"
              >
                Contact Sales
              </Link>
            </div>

            {/* Trust Signals */}
            <div className="mt-16 grid grid-cols-2 gap-6 md:grid-cols-4 lg:gap-8">
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-500/12 text-accent-300">
                  <Beaker className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-clinical-white">99%+ Purity</p>
                <p className="mt-1 text-xs text-charcoal-400">HPLC Verified</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-500/12 text-accent-300">
                  <FileText className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-clinical-white">Full COA Access</p>
                <p className="mt-1 text-xs text-charcoal-400">Every Batch</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-500/12 text-accent-300">
                  <MapPin className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-clinical-white">American Made</p>
                <p className="mt-1 text-xs text-charcoal-400">USA Manufacturing</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-500/12 text-accent-300">
                  <Shield className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-clinical-white">Cold Chain Certified</p>
                <p className="mt-1 text-xs text-charcoal-400">Quality Assured</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Market Data Stats */}
      <MarketStats />

      {/* Features Section */}
      <section className="bg-charcoal-800/95 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-clinical-white">
              Pharmaceutical-Grade Research Materials
            </h2>
            <p className="mt-4 text-lg text-charcoal-300">
              Trusted by laboratories and research institutions nationwide
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-charcoal-700/40 bg-charcoal-800/55 p-7 backdrop-blur-sm shadow-glass transition-all hover:border-accent-500/25 hover:shadow-dark">
              <h3 className="text-xl font-semibold text-clinical-white">
                Rigorous Quality Control
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-charcoal-300">
                Every batch undergoes comprehensive testing including HPLC, mass spectrometry, and purity analysis. Complete documentation provided.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-charcoal-700/40 bg-charcoal-800/55 p-7 backdrop-blur-sm shadow-glass transition-all hover:border-accent-500/25 hover:shadow-dark">
              <h3 className="text-xl font-semibold text-clinical-white">
                Compliance First
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-charcoal-300">
                Research use only materials with full regulatory compliance. Proper handling and storage documentation included with every order.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-charcoal-700/40 bg-charcoal-800/55 p-7 backdrop-blur-sm shadow-glass transition-all hover:border-accent-500/25 hover:shadow-dark">
              <h3 className="text-xl font-semibold text-clinical-white">
                Wholesale Pricing
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-charcoal-300">
                Volume discounts available for qualified research institutions and laboratories. Contact our sales team for custom pricing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Notice */}
      <section className="border-t border-charcoal-700/50 bg-charcoal-800/30 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-clinical-warning/30 bg-clinical-warning/10 p-6">
            <div className="flex items-start gap-3">
              <Shield className="h-6 w-6 flex-shrink-0 text-clinical-warning" />
              <div>
                <h3 className="font-semibold text-clinical-warning">
                  Regulatory Compliance Notice
                </h3>
                <p className="mt-2 text-sm text-charcoal-200">
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
