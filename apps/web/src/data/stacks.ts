/**
 * MAHA Peptides — Research Stacks
 *
 * Curated multi-peptide research protocols.
 * Each stack groups complementary peptides by research focus area.
 */

export interface StackProduct {
  name: string;
  slug: string;
  role: string; // one-line explanation of what this peptide contributes
}

export interface Stack {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  focus: string; // category label shown on card
  products: StackProduct[];
  priceCents: number; // bundle price
  savingsPercent: number;
  popular?: boolean;
}

export const STACKS: Stack[] = [
  {
    id: "stack-warrior",
    name: "The Warrior",
    slug: "warrior",
    tagline: "Accelerated tissue repair and recovery",
    description:
      "The gold standard healing stack. BPC-157 and TB-500 are the two most widely studied peptides for tissue repair, and combining them with GHK-Cu provides a comprehensive recovery protocol covering tendons, ligaments, muscle, and connective tissue.",
    focus: "Recovery & Healing",
    products: [
      { name: "BPC-157", slug: "bpc-157", role: "Gastric pentadecapeptide — tendon, ligament, and gut tissue repair" },
      { name: "TB-500", slug: "tb-500", role: "Thymosin beta-4 fragment — cell migration and wound healing" },
      { name: "GHK-Cu", slug: "ghk-cu", role: "Copper peptide — collagen synthesis and tissue remodeling" },
    ],
    priceCents: 38700,
    savingsPercent: 10,
    popular: true,
  },
  {
    id: "stack-glow",
    name: "The Glow",
    slug: "glow",
    tagline: "Skin rejuvenation and anti-aging research",
    description:
      "A targeted dermatological research stack. GHK-Cu drives collagen and elastin production while the SNAP-8 + GHK-Cu serum provides a topical delivery system. Epithalon rounds out the protocol by supporting telomere maintenance at the cellular level.",
    focus: "Skin & Longevity",
    products: [
      { name: "GHK-Cu", slug: "ghk-cu", role: "Copper peptide — stimulates collagen, elastin, and glycosaminoglycan synthesis" },
      { name: "SNAP-8 + GHK-Cu Serum", slug: "snap8-ghkcu-serum", role: "Topical neuropeptide serum — expression line research" },
      { name: "Epithalon", slug: "epithalon", role: "Telomerase activator — cellular aging and telomere maintenance" },
    ],
    priceCents: 26460,
    savingsPercent: 10,
    popular: true,
  },
  {
    id: "stack-titan",
    name: "The Titan",
    slug: "titan",
    tagline: "Growth hormone secretagogue protocol",
    description:
      "The definitive GH research stack. CJC-1295 + Ipamorelin is the most studied GHRH/GHRP combination, and adding Tesamorelin — an FDA-recognized GHRH analog — creates a robust multi-pathway growth hormone secretion protocol for advanced research.",
    focus: "Growth Hormone",
    products: [
      { name: "CJC-1295 + Ipamorelin", slug: "cjc-1295-ipamorelin", role: "Combined GHRH analog + selective GH secretagogue" },
      { name: "Tesamorelin", slug: "tesamorelin", role: "GHRH analog — pulsatile GH release and visceral fat metabolism" },
      { name: "Ipamorelin", slug: "ipamorelin", role: "Selective GH secretagogue — clean GH pulse without cortisol or prolactin" },
    ],
    priceCents: 38430,
    savingsPercent: 10,
  },
  {
    id: "stack-phoenix",
    name: "The Phoenix",
    slug: "phoenix",
    tagline: "Longevity and cellular renewal",
    description:
      "An advanced anti-aging research protocol targeting the core mechanisms of cellular decline. NAD+ restores mitochondrial function, Epithalon maintains telomere length, and SS-31 protects the mitochondrial membrane — three complementary pathways to cellular vitality.",
    focus: "Longevity",
    products: [
      { name: "NAD+", slug: "nad-plus", role: "Coenzyme — mitochondrial energy production and DNA repair" },
      { name: "Epithalon", slug: "epithalon", role: "Telomerase activator — telomere length maintenance" },
      { name: "SS-31 (Elamipretide)", slug: "ss-31", role: "Mitochondria-targeted peptide — cardiolipin stabilization" },
    ],
    priceCents: 38520,
    savingsPercent: 10,
    popular: true,
  },
  {
    id: "stack-edge",
    name: "The Edge",
    slug: "edge",
    tagline: "Cognitive enhancement and neuroprotection",
    description:
      "A nootropic peptide stack built for brain research. Semax enhances BDNF expression, Selank modulates GABA for anxiolytic effects, and Pinealon is a short peptide targeting CNS gene expression — together covering focus, mood, and neuroprotection.",
    focus: "Cognitive",
    products: [
      { name: "Semax", slug: "semax", role: "Synthetic ACTH fragment — BDNF upregulation and cognitive enhancement" },
      { name: "Selank", slug: "selank", role: "Tuftsin analog — anxiolytic and immunomodulatory neuropeptide" },
      { name: "Pinealon", slug: "pinealon", role: "Tripeptide bioregulator — CNS gene expression and neuroprotection" },
    ],
    priceCents: 23130,
    savingsPercent: 10,
  },
  {
    id: "stack-shred",
    name: "The Shred",
    slug: "shred",
    tagline: "Metabolic optimization and fat loss",
    description:
      "A research stack targeting multiple metabolic pathways. Semaglutide is the most studied GLP-1 receptor agonist, AOD-9604 is a lipolytic fragment of growth hormone, and 5-Amino-1MQ inhibits NNMT — an enzyme linked to fat cell expansion.",
    focus: "Metabolic",
    products: [
      { name: "Semaglutide", slug: "semaglutide", role: "GLP-1 receptor agonist — appetite regulation and glucose metabolism" },
      { name: "AOD-9604", slug: "aod-9604", role: "GH fragment 176-191 — lipolysis without growth effects" },
      { name: "5-Amino-1MQ", slug: "5-amino-1mq", role: "NNMT inhibitor — fat cell energy expenditure" },
    ],
    priceCents: 31410,
    savingsPercent: 10,
  },
  {
    id: "stack-guardian",
    name: "The Guardian",
    slug: "guardian",
    tagline: "Immune system support and defense",
    description:
      "An immune-focused research protocol. Thymosin Alpha-1 is a thymic peptide used globally as an immunomodulator, and KPV is an anti-inflammatory alpha-MSH fragment — together they create a comprehensive immune regulation stack.",
    focus: "Immune",
    products: [
      { name: "Thymosin Alpha-1", slug: "thymosin-alpha-1", role: "Thymic peptide — T-cell maturation and immune modulation" },
      { name: "KPV", slug: "kpv", role: "Alpha-MSH fragment — anti-inflammatory and antimicrobial" },
    ],
    priceCents: 17910,
    savingsPercent: 10,
  },
  {
    id: "stack-vitality",
    name: "The Vitality",
    slug: "vitality",
    tagline: "Hormonal balance and wellness",
    description:
      "A research stack for reproductive and hormonal studies. PT-141 acts on melanocortin receptors for sexual function, Kisspeptin-10 is the upstream regulator of GnRH, and Oxytocin is the peptide behind social bonding and stress modulation.",
    focus: "Wellness",
    products: [
      { name: "PT-141", slug: "pt-141", role: "Melanocortin receptor agonist — sexual function and libido research" },
      { name: "Kisspeptin-10", slug: "kisspeptin-10", role: "GnRH stimulator — reproductive hormone cascade" },
      { name: "Oxytocin", slug: "oxytocin", role: "Neuropeptide — social bonding, stress reduction, and pair bonding" },
    ],
    priceCents: 21420,
    savingsPercent: 10,
  },
  {
    id: "stack-fortress",
    name: "The Fortress",
    slug: "fortress",
    tagline: "Total-body repair and resilience",
    description:
      "The most comprehensive healing protocol we offer. Combines the tissue repair power of BPC-157 + TB-500 with the immune support of KPV and the collagen-building effects of GHK-Cu. Four peptides covering systemic recovery from gut to joint to skin.",
    focus: "Comprehensive",
    products: [
      { name: "BPC-157 + TB-500", slug: "bpc-tb500-blend", role: "Pre-blended healing combo — synergistic tissue repair" },
      { name: "KPV", slug: "kpv", role: "Anti-inflammatory peptide — gut and systemic inflammation" },
      { name: "GHK-Cu", slug: "ghk-cu", role: "Copper peptide — tissue remodeling and wound healing" },
    ],
    priceCents: 29304,
    savingsPercent: 12,
  },
  {
    id: "stack-restorer",
    name: "The Restorer",
    slug: "restorer",
    tagline: "Sleep architecture and deep recovery",
    description:
      "A recovery-focused stack targeting sleep quality and overnight repair. DSIP is the delta sleep-inducing peptide studied for deep sleep architecture, and Epithalon supports circadian rhythm regulation through pineal gland function.",
    focus: "Sleep & Recovery",
    products: [
      { name: "DSIP", slug: "dsip", role: "Delta sleep-inducing peptide — deep sleep stage regulation" },
      { name: "Epithalon", slug: "epithalon", role: "Pineal peptide — melatonin production and circadian rhythm" },
    ],
    priceCents: 11520,
    savingsPercent: 10,
  },
];

export function getStackBySlug(slug: string): Stack | undefined {
  return STACKS.find((s) => s.slug === slug);
}

export function formatStackPrice(priceCents: number): string {
  return `$${(priceCents / 100).toFixed(2)}`;
}
