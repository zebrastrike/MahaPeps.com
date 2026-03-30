"use client";

import Link from "next/link";
import { STACKS, formatStackPrice } from "@/data/stacks";
import { Beaker, ShieldCheck, ArrowRight } from "lucide-react";

export default function AboutStacksPage() {
  return (
    <div className="min-h-screen bg-navy-900">
      {/* Hero */}
      <section className="relative border-b border-gold-500/15 bg-navy-900 py-16 lg:py-24">
        <div className="star-texture absolute inset-0 pointer-events-none" />
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-label mb-4 text-gold-500/70 tracking-[0.2em]">
            Education
          </p>
          <h1 className="font-editorial text-5xl text-warm-white md:text-6xl">
            What Are Peptide <span className="text-gold-400 italic">Stacks?</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-warm-white/50 md:text-lg">
            A guide to multi-peptide research protocols and why researchers combine
            specific compounds for more comprehensive studies.
          </p>
          <hr className="divider-gold mx-auto mt-8 w-16" />
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Section 1 */}
          <div className="mb-16">
            <h2 className="font-editorial text-3xl text-warm-white mb-6">
              The Science of Stacking
            </h2>
            <div className="space-y-4 text-sm font-light leading-relaxed text-warm-white/50">
              <p>
                In peptide research, a "stack" refers to the deliberate combination of two or more
                peptides that target complementary biological pathways. Rather than studying a single
                compound in isolation, researchers use stacks to observe how multiple peptides interact
                and whether their combined effects exceed what each achieves alone.
              </p>
              <p>
                This approach mirrors how biological systems actually work — no single pathway operates
                in a vacuum. Growth hormone secretion involves both GHRH and GHRP pathways. Tissue repair
                requires angiogenesis, cell migration, and collagen synthesis simultaneously. Stacking
                allows researchers to model these multi-pathway processes more accurately.
              </p>
              <p>
                The key to effective stacking is <strong className="text-warm-white/70">complementarity</strong> — each
                peptide in the stack should contribute something distinct. Two peptides that do the same
                thing offer diminishing returns. Two peptides that activate different pathways toward the
                same goal create genuine synergy.
              </p>
            </div>
          </div>

          {/* Section 2 */}
          <div className="mb-16">
            <h2 className="font-editorial text-3xl text-warm-white mb-6">
              How We Design Our Stacks
            </h2>
            <div className="grid gap-px border border-gold-500/10 md:grid-cols-2">
              {[
                {
                  title: "Pathway Complementarity",
                  body: "Every peptide in a stack targets a different mechanism of action. In The Warrior stack, BPC-157 promotes angiogenesis, TB-500 drives cell migration, and GHK-Cu stimulates collagen synthesis — three distinct repair pathways working in concert.",
                },
                {
                  title: "Published Research Basis",
                  body: "Stack compositions are informed by published preclinical and clinical studies. We don't combine peptides based on trends — each pairing has documented biological rationale in the peer-reviewed literature.",
                },
                {
                  title: "Dosing Compatibility",
                  body: "Peptides in each stack are selected for compatible reconstitution, storage, and administration protocols. This simplifies experimental design and reduces variables in research settings.",
                },
                {
                  title: "Goal Specificity",
                  body: "Each stack is built around a clear research objective — recovery, cognition, metabolism, longevity, immunity. This allows labs to select the protocol most relevant to their field of study.",
                },
              ].map(({ title, body }) => (
                <div key={title} className="bg-navy-800/50 p-8">
                  <hr className="divider-red mb-5 w-8" />
                  <h3 className="font-editorial text-xl text-warm-white mb-3">{title}</h3>
                  <p className="text-sm font-light leading-relaxed text-warm-white/45">{body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3 */}
          <div className="mb-16">
            <h2 className="font-editorial text-3xl text-warm-white mb-6">
              Common Research Stack Categories
            </h2>
            <div className="space-y-4 text-sm font-light leading-relaxed text-warm-white/50">
              <p>
                Peptide stacks generally fall into several categories based on the biological systems
                they target:
              </p>
            </div>

            <div className="mt-8 space-y-4">
              {[
                {
                  category: "Recovery & Healing",
                  explanation: "Peptides that promote tissue repair through angiogenesis, cell migration, and extracellular matrix remodeling. Commonly studied in musculoskeletal and gastric tissue models.",
                },
                {
                  category: "Growth Hormone Axis",
                  explanation: "Combinations of GHRH analogs and GH secretagogues that stimulate pulsatile growth hormone release through complementary receptor pathways (GHRH-R and ghrelin receptor).",
                },
                {
                  category: "Cognitive & Neuroprotection",
                  explanation: "Peptides targeting BDNF expression, GABAergic modulation, and CNS gene regulation. Often studied in models of neurodegeneration, anxiety, and cognitive performance.",
                },
                {
                  category: "Metabolic & Body Composition",
                  explanation: "GLP-1 receptor agonists, lipolytic GH fragments, and enzyme inhibitors that modulate appetite signaling, fat metabolism, and energy expenditure through distinct mechanisms.",
                },
                {
                  category: "Longevity & Cellular Renewal",
                  explanation: "Peptides targeting telomere maintenance, mitochondrial function, and NAD+ metabolism — the core biological processes associated with cellular aging.",
                },
                {
                  category: "Immune Modulation",
                  explanation: "Thymic peptides and anti-inflammatory fragments that regulate T-cell function, inflammatory cytokines, and antimicrobial responses.",
                },
              ].map(({ category, explanation }) => (
                <div key={category} className="border-l-2 border-gold-500/30 pl-6 py-2">
                  <h4 className="font-editorial text-lg text-warm-white mb-1">{category}</h4>
                  <p className="text-sm font-light leading-relaxed text-warm-white/45">{explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4 */}
          <div className="mb-16">
            <h2 className="font-editorial text-3xl text-warm-white mb-6">
              Stacking vs. Single-Peptide Research
            </h2>
            <div className="space-y-4 text-sm font-light leading-relaxed text-warm-white/50">
              <p>
                Single-peptide studies are essential for understanding individual mechanisms of action.
                But biological systems rarely operate through a single pathway. Stacking protocols allow
                researchers to study peptide interactions, additive effects, and multi-target approaches
                that more closely reflect physiological complexity.
              </p>
              <p>
                For labs new to peptide research, we recommend starting with a focused stack of 2–3
                peptides rather than attempting to study many compounds simultaneously. Our curated stacks
                are designed as sensible starting points for each research area.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="border border-gold-500/20 bg-navy-800/50 p-8 text-center">
            <h3 className="font-editorial text-2xl text-warm-white mb-3">
              Ready to explore our stacks?
            </h3>
            <p className="text-sm text-warm-white/45 mb-6">
              Browse our curated research protocols — each one designed for a specific area of study.
            </p>
            <Link
              href="/stacks"
              className="inline-flex items-center gap-2 border border-gold-500/60 bg-gold-500/10 px-8 py-3 font-label text-[0.65rem] tracking-widest text-gold-400 transition-all hover:bg-gold-500/20 hover:text-gold-300"
            >
              Browse All Stacks <ArrowRight className="h-3 w-3" />
            </Link>
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
                All information on this page is for educational purposes relating to laboratory research.
                All products are intended solely for lawful research use. Not for human or veterinary consumption.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
