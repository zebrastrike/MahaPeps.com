import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const STACKS = [
  {
    name: "The Warrior",
    slug: "warrior",
    tagline: "Accelerated tissue repair and recovery",
    description: "The gold standard healing stack. BPC-157 and TB-500 are the two most widely studied peptides for tissue repair, and combining them with GHK-Cu provides a comprehensive recovery protocol covering tendons, ligaments, muscle, and connective tissue.",
    focus: "Recovery & Healing",
    priceCents: 38500,
    savingsPercent: 10,
    isPopular: true,
    displayOrder: 1,
    products: [
      { slug: "bpc-157", role: "Gastric pentadecapeptide — tendon, ligament, and gut tissue repair" },
      { slug: "tb-500", role: "Thymosin beta-4 fragment — cell migration and wound healing" },
      { slug: "ghk-cu", role: "Copper peptide — collagen synthesis and tissue remodeling" },
    ],
  },
  {
    name: "The Glow",
    slug: "glow",
    tagline: "Skin rejuvenation and anti-aging research",
    description: "A targeted dermatological research stack. GHK-Cu drives collagen and elastin production while the SNAP-8 + GHK-Cu serum provides a topical delivery system. Epithalon rounds out the protocol by supporting telomere maintenance at the cellular level.",
    focus: "Skin & Longevity",
    priceCents: 26500,
    savingsPercent: 10,
    isPopular: true,
    displayOrder: 2,
    products: [
      { slug: "ghk-cu", role: "Copper peptide — stimulates collagen, elastin, and glycosaminoglycan synthesis" },
      { slug: "snap8-ghkcu-serum", role: "Topical neuropeptide serum — expression line research" },
      { slug: "epithalon", role: "Telomerase activator — cellular aging and telomere maintenance" },
    ],
  },
  {
    name: "The Titan",
    slug: "titan",
    tagline: "Growth hormone secretagogue protocol",
    description: "The definitive GH research stack. CJC-1295 + Ipamorelin is the most studied GHRH/GHRP combination, and adding Tesamorelin creates a robust multi-pathway growth hormone secretion protocol for advanced research.",
    focus: "Growth Hormone",
    priceCents: 38500,
    savingsPercent: 10,
    isPopular: false,
    displayOrder: 3,
    products: [
      { slug: "cjc-1295-ipamorelin", role: "Combined GHRH analog + selective GH secretagogue" },
      { slug: "tesamorelin", role: "GHRH analog — pulsatile GH release and visceral fat metabolism" },
      { slug: "ipamorelin", role: "Selective GH secretagogue — clean GH pulse without cortisol or prolactin" },
    ],
  },
  {
    name: "The Phoenix",
    slug: "phoenix",
    tagline: "Longevity and cellular renewal",
    description: "An advanced anti-aging research protocol targeting the core mechanisms of cellular decline. NAD+ restores mitochondrial function, Epithalon maintains telomere length, and SS-31 protects the mitochondrial membrane.",
    focus: "Longevity",
    priceCents: 38500,
    savingsPercent: 10,
    isPopular: true,
    displayOrder: 4,
    products: [
      { slug: "nad-plus", role: "Coenzyme — mitochondrial energy production and DNA repair" },
      { slug: "epithalon", role: "Telomerase activator — telomere length maintenance" },
      { slug: "ss-31", role: "Mitochondria-targeted peptide — cardiolipin stabilization" },
    ],
  },
  {
    name: "The Edge",
    slug: "edge",
    tagline: "Cognitive enhancement and neuroprotection",
    description: "A nootropic peptide stack built for brain research. Semax enhances BDNF expression, Selank modulates GABA for anxiolytic effects, and Pinealon is a short peptide targeting CNS gene expression.",
    focus: "Cognitive",
    priceCents: 23000,
    savingsPercent: 10,
    isPopular: false,
    displayOrder: 5,
    products: [
      { slug: "semax", role: "Synthetic ACTH fragment — BDNF upregulation and cognitive enhancement" },
      { slug: "selank", role: "Tuftsin analog — anxiolytic and immunomodulatory neuropeptide" },
      { slug: "pinealon", role: "Tripeptide bioregulator — CNS gene expression and neuroprotection" },
    ],
  },
  {
    name: "The Shred",
    slug: "shred",
    tagline: "Metabolic optimization and fat loss",
    description: "A research stack targeting multiple metabolic pathways. Semaglutide is the most studied GLP-1 receptor agonist, AOD-9604 is a lipolytic fragment of growth hormone, and 5-Amino-1MQ inhibits NNMT.",
    focus: "Metabolic",
    priceCents: 31500,
    savingsPercent: 10,
    isPopular: false,
    displayOrder: 6,
    products: [
      { slug: "semaglutide", role: "GLP-1 receptor agonist — appetite regulation and glucose metabolism" },
      { slug: "aod-9604", role: "GH fragment 176-191 — lipolysis without growth effects" },
      { slug: "5-amino-1mq", role: "NNMT inhibitor — fat cell energy expenditure" },
    ],
  },
  {
    name: "The Guardian",
    slug: "guardian",
    tagline: "Immune system support and defense",
    description: "An immune-focused research protocol. Thymosin Alpha-1 is a thymic peptide used globally as an immunomodulator, and KPV is an anti-inflammatory alpha-MSH fragment.",
    focus: "Immune",
    priceCents: 17900,
    savingsPercent: 10,
    isPopular: false,
    displayOrder: 7,
    products: [
      { slug: "thymosin-alpha-1", role: "Thymic peptide — T-cell maturation and immune modulation" },
      { slug: "kpv", role: "Alpha-MSH fragment — anti-inflammatory and antimicrobial" },
    ],
  },
  {
    name: "The Vitality",
    slug: "vitality",
    tagline: "Hormonal balance and wellness",
    description: "A research stack for reproductive and hormonal studies. PT-141 acts on melanocortin receptors, Kisspeptin-10 is the upstream regulator of GnRH, and Oxytocin is the peptide behind social bonding and stress modulation.",
    focus: "Wellness",
    priceCents: 21500,
    savingsPercent: 10,
    isPopular: false,
    displayOrder: 8,
    products: [
      { slug: "pt-141", role: "Melanocortin receptor agonist — sexual function and libido research" },
      { slug: "kisspeptin-10", role: "GnRH stimulator — reproductive hormone cascade" },
      { slug: "oxytocin", role: "Neuropeptide — social bonding, stress reduction, and pair bonding" },
    ],
  },
  {
    name: "The Fortress",
    slug: "fortress",
    tagline: "Total-body repair and resilience",
    description: "The most comprehensive healing protocol we offer. Combines the tissue repair power of BPC-157 + TB-500 with the immune support of KPV and the collagen-building effects of GHK-Cu.",
    focus: "Comprehensive",
    priceCents: 29000,
    savingsPercent: 12,
    isPopular: false,
    displayOrder: 9,
    products: [
      { slug: "bpc-tb500-blend", role: "Pre-blended healing combo — synergistic tissue repair" },
      { slug: "kpv", role: "Anti-inflammatory peptide — gut and systemic inflammation" },
      { slug: "ghk-cu", role: "Copper peptide — tissue remodeling and wound healing" },
    ],
  },
  {
    name: "The Restorer",
    slug: "restorer",
    tagline: "Sleep architecture and deep recovery",
    description: "A recovery-focused stack targeting sleep quality and overnight repair. DSIP is the delta sleep-inducing peptide studied for deep sleep architecture, and Epithalon supports circadian rhythm regulation.",
    focus: "Sleep & Recovery",
    priceCents: 11500,
    savingsPercent: 10,
    isPopular: false,
    displayOrder: 10,
    products: [
      { slug: "dsip", role: "Delta sleep-inducing peptide — deep sleep stage regulation" },
      { slug: "epithalon", role: "Pineal peptide — melatonin production and circadian rhythm" },
    ],
  },
];

async function seedStacks() {
  console.log('Seeding stacks...\n');

  // Get all products by slug for lookups
  const products = await prisma.product.findMany({
    select: { id: true, slug: true, name: true },
  });
  const productBySlug = new Map(products.map((p) => [p.slug, p]));

  let created = 0;
  let skipped = 0;

  for (const stackData of STACKS) {
    // Check if stack already exists
    const existing = await prisma.stack.findUnique({ where: { slug: stackData.slug } });
    if (existing) {
      console.log(`⚠ Stack "${stackData.name}" already exists — skipping`);
      skipped++;
      continue;
    }

    // Resolve product IDs
    const items = stackData.products
      .map((p, i) => {
        const product = productBySlug.get(p.slug);
        if (!product) {
          console.log(`  ⚠ Product "${p.slug}" not found — skipping from ${stackData.name}`);
          return null;
        }
        return {
          productId: product.id,
          role: p.role,
          sortOrder: i + 1,
        };
      })
      .filter(Boolean) as { productId: string; role: string; sortOrder: number }[];

    const stack = await prisma.stack.create({
      data: {
        name: stackData.name,
        slug: stackData.slug,
        tagline: stackData.tagline,
        description: stackData.description,
        focus: stackData.focus,
        priceCents: stackData.priceCents,
        savingsPercent: stackData.savingsPercent,
        isPopular: stackData.isPopular,
        isActive: true,
        displayOrder: stackData.displayOrder,
        items: {
          create: items,
        },
      },
      include: { items: true },
    });

    console.log(`✓ Created: ${stack.name} (${stack.items.length} products)`);
    created++;
  }

  console.log(`\n--- Summary ---`);
  console.log(`Created: ${created}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Total: ${STACKS.length}`);
}

seedStacks()
  .catch((error) => {
    console.error('Error seeding stacks:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
