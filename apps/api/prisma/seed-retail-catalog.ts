import { PrismaClient, ProductVisibility, StrengthUnit, ProductCategory, StockStatus } from '@prisma/client';

const prisma = new PrismaClient();

// The 32 retail products with B2C prices (single vial)
const RETAIL_PRODUCTS = [
  {
    name: 'Semaglutide',
    slug: 'semaglutide',
    sku: 'SEMA-BASE',
    description: 'Semaglutide is a glucagon-like peptide-1 analog extensively studied for insulin secretion and appetite regulation mechanisms. Research-grade material for laboratory use only.',
    category: 'RESEARCH_PEPTIDES' as const,
    variants: [
      { strengthValue: 10, strengthUnit: 'MG' as const, sku: 'SEMA-10MG-RETAIL', priceCents: 13000 },
    ],
  },
  {
    name: 'Retatrutide',
    slug: 'retatrutide',
    sku: 'RETA-BASE',
    description: 'Retatrutide is a triple agonist targeting GIP, GLP-1, and glucagon receptors. Research focuses on metabolic regulation and energy expenditure. Research-grade only.',
    category: 'RESEARCH_PEPTIDES' as const,
    variants: [
      { strengthValue: 10, strengthUnit: 'MG' as const, sku: 'RETA-10MG-RETAIL', priceCents: 12900 },
    ],
  },
  {
    name: 'BPC-157',
    slug: 'bpc-157',
    sku: 'BPC157-BASE',
    description: 'BPC-157 is a pentadecapeptide derived from gastric juice proteins. Extensively studied for tissue healing, cellular protection, and angiogenesis in research models.',
    category: 'RESEARCH_PEPTIDES' as const,
    variants: [
      { strengthValue: 10, strengthUnit: 'MG' as const, sku: 'BPC157-10MG-RETAIL', priceCents: 12500 },
    ],
  },
  {
    name: 'TB-500',
    slug: 'tb-500',
    sku: 'TB500-BASE',
    description: 'TB-500 is a synthetic peptide derived from Thymosin Beta-4. Research focuses on wound healing, inflammation modulation, and tissue regeneration.',
    category: 'RESEARCH_PEPTIDES' as const,
    variants: [
      { strengthValue: 10, strengthUnit: 'MG' as const, sku: 'TB500-10MG-RETAIL', priceCents: 18000 },
    ],
  },
  {
    name: 'GHK-Cu',
    slug: 'ghk-cu',
    sku: 'GHKCU-BASE',
    description: 'GHK-Cu is a copper-binding peptide that promotes collagen and elastin production. Extensively studied for wound healing and skin remodeling in research contexts.',
    category: 'RESEARCH_PEPTIDES' as const,
    variants: [
      { strengthValue: 100, strengthUnit: 'MG' as const, sku: 'GHKCU-100MG-RETAIL', priceCents: 12500 },
    ],
  },
  {
    name: 'NAD+',
    slug: 'nad-plus',
    sku: 'NAD-BASE',
    description: 'NAD+ is a coenzyme essential for cellular metabolism and energy production. Research examines its role in aging, mitochondrial function, and DNA repair.',
    category: 'RESEARCH_PEPTIDES' as const,
    variants: [
      { strengthValue: 500, strengthUnit: 'MG' as const, sku: 'NAD-500MG-RETAIL', priceCents: 23000 },
    ],
  },
  {
    name: 'Semax',
    slug: 'semax',
    sku: 'SEMAX-BASE',
    description: 'Semax is a synthetic peptide derived from ACTH. Research explores its effects on brain-derived neurotrophic factor and cognitive function.',
    category: 'RESEARCH_PEPTIDES' as const,
    variants: [
      { strengthValue: 10, strengthUnit: 'MG' as const, sku: 'SEMAX-10MG-RETAIL', priceCents: 7900 },
    ],
  },
  {
    name: 'Selank',
    slug: 'selank',
    sku: 'SELANK-BASE',
    description: 'Selank is a synthetic analog of tuftsin with anxiolytic and immunomodulatory properties. Research examines its effects on emotional regulation.',
    category: 'RESEARCH_PEPTIDES' as const,
    variants: [
      { strengthValue: 10, strengthUnit: 'MG' as const, sku: 'SELANK-10MG-RETAIL', priceCents: 8900 },
    ],
  },
  {
    name: 'Tesamorelin',
    slug: 'tesamorelin',
    sku: 'TESAM-BASE',
    description: 'Tesamorelin is a synthetic GHRH analog that stimulates growth hormone release. Research focuses on its effects on pituitary function and body composition.',
    category: 'RESEARCH_PEPTIDES' as const,
    variants: [
      { strengthValue: 10, strengthUnit: 'MG' as const, sku: 'TESAM-10MG-RETAIL', priceCents: 19900 },
    ],
  },
  {
    name: 'CJC-1295 + Ipamorelin',
    slug: 'cjc-1295-ipamorelin',
    sku: 'CJC-IPAM-BASE',
    description: 'Combined GHRH analog and selective growth hormone secretagogue (5mg CJC-1295 + 5mg Ipamorelin) for amplified pulsatile GH release. Research-grade peptide blend.',
    category: 'RESEARCH_COMBINATIONS' as const,
    variants: [
      { strengthValue: 10, strengthUnit: 'MG' as const, sku: 'CJC-IPAM-10MG-RETAIL', priceCents: 12900 },
    ],
  },
  {
    name: 'AOD-9604',
    slug: 'aod-9604',
    sku: 'AOD-BASE',
    description: 'AOD-9604 is a modified fragment of human growth hormone C-terminus. Research focuses on its effects on fat metabolism without affecting blood glucose.',
    category: 'RESEARCH_PEPTIDES' as const,
    variants: [
      { strengthValue: 5, strengthUnit: 'MG' as const, sku: 'AOD-5MG-RETAIL', priceCents: 13000 },
    ],
  },
  {
    name: 'KPV',
    slug: 'kpv',
    sku: 'KPV-BASE',
    description: 'KPV is an alpha-MSH derived tripeptide with anti-inflammatory properties. Research examines its effects on inflammatory pathways and tissue healing.',
    category: 'RESEARCH_PEPTIDES' as const,
    variants: [
      { strengthValue: 10, strengthUnit: 'MG' as const, sku: 'KPV-10MG-RETAIL', priceCents: 7900 },
    ],
  },
  {
    name: 'Pinealon',
    slug: 'pinealon',
    sku: 'PINEALON-BASE',
    description: 'Pinealon is a tripeptide bioregulator derived from the pineal gland. Research examines its effects on brain function and neuroprotection.',
    category: 'RESEARCH_PEPTIDES' as const,
    variants: [
      { strengthValue: 10, strengthUnit: 'MG' as const, sku: 'PINEALON-10MG-RETAIL', priceCents: 8900 },
    ],
  },
  {
    name: 'SNAP-8 + GHK-Cu Serum',
    slug: 'snap8-ghkcu-serum',
    sku: 'SNAP8-GHKCU-SERUM-BASE',
    description: 'Advanced research serum combining SNAP-8 octapeptide with GHK-Cu copper peptide complex. Formulated for topical skin research applications.',
    category: 'RESEARCH_COMBINATIONS' as const,
    variants: [
      { strengthValue: 30, strengthUnit: 'ML' as const, sku: 'SNAP8-GHKCU-30ML-RETAIL', priceCents: 10000 },
    ],
  },
  {
    name: 'IGF-1 LR3',
    slug: 'igf-1-lr3',
    sku: 'IGF1LR3-BASE',
    description: 'IGF-1 LR3 is a modified insulin-like growth factor with extended half-life. Research examines its effects on muscle protein synthesis and cell growth.',
    category: 'RESEARCH_PEPTIDES' as const,
    variants: [
      { strengthValue: 0.1, strengthUnit: 'MG' as const, sku: 'IGF1LR3-0.1MG-RETAIL', priceCents: 4900 },
      { strengthValue: 1, strengthUnit: 'MG' as const, sku: 'IGF1LR3-1MG-RETAIL', priceCents: 24900 },
    ],
  },
  {
    name: 'Ipamorelin',
    slug: 'ipamorelin',
    sku: 'IPAM-BASE',
    description: 'Ipamorelin is a pentapeptide ghrelin mimetic with high selectivity for GH release. Research focuses on its effects without affecting cortisol or prolactin.',
    category: 'RESEARCH_PEPTIDES' as const,
    variants: [
      { strengthValue: 10, strengthUnit: 'MG' as const, sku: 'IPAM-10MG-RETAIL', priceCents: 9900 },
    ],
  },
  {
    name: 'SLU-PP-332',
    slug: 'slu-pp-332',
    sku: 'SLUPP332-BASE',
    description: 'SLU-PP-332 is an ERR agonist that mimics exercise-induced metabolic changes. Research explores its effects on endurance and fat oxidation.',
    category: 'RESEARCH_PEPTIDES' as const,
    variants: [
      { strengthValue: 5, strengthUnit: 'MG' as const, sku: 'SLUPP332-5MG-RETAIL', priceCents: 16900 },
    ],
  },
  {
    name: 'Epithalon',
    slug: 'epithalon',
    sku: 'EPITH-BASE',
    description: 'Epithalon is a pineal peptide that regulates telomerase activity. Research examines its effects on cellular senescence and longevity mechanisms.',
    category: 'RESEARCH_PEPTIDES' as const,
    variants: [
      { strengthValue: 10, strengthUnit: 'MG' as const, sku: 'EPITH-10MG-RETAIL', priceCents: 6900 },
      { strengthValue: 50, strengthUnit: 'MG' as const, sku: 'EPITH-50MG-RETAIL', priceCents: 17900 },
    ],
  },
  {
    name: 'PT-141',
    slug: 'pt-141',
    sku: 'PT141-BASE',
    description: 'PT-141 is a melanocortin receptor agonist affecting central nervous system pathways. Research-grade material for laboratory studies.',
    category: 'RESEARCH_PEPTIDES' as const,
    variants: [
      { strengthValue: 10, strengthUnit: 'MG' as const, sku: 'PT141-10MG-RETAIL', priceCents: 6900 },
    ],
  },
  {
    name: 'DSIP',
    slug: 'dsip',
    sku: 'DSIP-BASE',
    description: 'DSIP (Delta Sleep-Inducing Peptide) is a neuropeptide that influences sleep patterns and stress adaptation. Research examines its effects on circadian rhythms.',
    category: 'RESEARCH_PEPTIDES' as const,
    variants: [
      { strengthValue: 5, strengthUnit: 'MG' as const, sku: 'DSIP-5MG-RETAIL', priceCents: 5900 },
    ],
  },
  {
    name: 'Thymosin Alpha-1',
    slug: 'thymosin-alpha-1',
    sku: 'TA1-BASE',
    description: 'Thymosin Alpha-1 is a thymic peptide that regulates immune function. Research focuses on its effects on T-cell maturation and immune activation.',
    category: 'RESEARCH_PEPTIDES' as const,
    variants: [
      { strengthValue: 10, strengthUnit: 'MG' as const, sku: 'TA1-10MG-RETAIL', priceCents: 12000 },
    ],
  },
  {
    name: 'hCG',
    slug: 'hcg',
    sku: 'HCG-BASE',
    description: 'hCG (Human Chorionic Gonadotropin) is a glycoprotein hormone affecting reproductive and metabolic pathways. Research-grade material for endocrine studies.',
    category: 'RESEARCH_PEPTIDES' as const,
    variants: [
      { strengthValue: 5000, strengthUnit: 'IU' as const, sku: 'HCG-5000IU-RETAIL', priceCents: 10900 },
      { strengthValue: 10000, strengthUnit: 'IU' as const, sku: 'HCG-10000IU-RETAIL', priceCents: 20900 },
    ],
  },
  {
    name: 'CJC-1295 (with DAC)',
    slug: 'cjc-1295-dac',
    sku: 'CJC1295DAC-BASE',
    description: 'CJC-1295 with Drug Affinity Complex (DAC) is a modified GHRH analog with extended half-life. Research examines its effects on sustained growth hormone secretion patterns.',
    category: 'RESEARCH_PEPTIDES' as const,
    variants: [
      { strengthValue: 5, strengthUnit: 'MG' as const, sku: 'CJC1295-5MG-DAC-RETAIL', priceCents: 18900 },
    ],
  },
  {
    name: 'SS-31 (Elamipretide)',
    slug: 'ss-31',
    sku: 'SS31-BASE',
    description: 'SS-31 is a cell-permeable peptide that concentrates in mitochondria. Research examines its effects on mitochondrial membrane potential and oxidative stress.',
    category: 'RESEARCH_PEPTIDES' as const,
    variants: [
      { strengthValue: 10, strengthUnit: 'MG' as const, sku: 'SS31-10MG-RETAIL', priceCents: 12900 },
      { strengthValue: 50, strengthUnit: 'MG' as const, sku: 'SS31-50MG-RETAIL', priceCents: 45000 },
    ],
  },
  {
    name: 'BPC-157 + TB-500',
    slug: 'bpc-tb500-blend',
    sku: 'BPCTB-BASE',
    description: 'Combined BPC-157 and TB-500 for enhanced tissue healing and regeneration effects. Complementary mechanisms for comprehensive repair studies.',
    category: 'RESEARCH_COMBINATIONS' as const,
    variants: [
      { strengthValue: 10, strengthUnit: 'MG' as const, sku: 'BPCTB-10MG-RETAIL', priceCents: 12900 },
    ],
  },
  {
    name: 'Kisspeptin-10',
    slug: 'kisspeptin-10',
    sku: 'KISS10-BASE',
    description: 'Kisspeptin-10 is a hypothalamic neuropeptide that regulates gonadotropin-releasing hormone. Research examines its role in reproductive endocrinology.',
    category: 'RESEARCH_PEPTIDES' as const,
    variants: [
      { strengthValue: 10, strengthUnit: 'MG' as const, sku: 'KISS10-10MG-RETAIL', priceCents: 11000 },
    ],
  },
  {
    name: '5-Amino-1MQ',
    slug: '5-amino-1mq',
    sku: '5AMINO1MQ-BASE',
    description: '5-Amino-1MQ is a small molecule inhibitor of NNMT enzyme. Research explores its effects on cellular metabolism and energy expenditure.',
    category: 'RESEARCH_PEPTIDES' as const,
    variants: [
      { strengthValue: 5, strengthUnit: 'MG' as const, sku: '5AMINO1MQ-5MG-RETAIL', priceCents: 8900 },
    ],
  },
  {
    name: 'Oxytocin',
    slug: 'oxytocin',
    sku: 'OXY-BASE',
    description: 'Oxytocin is a neuropeptide hormone studied for social behavior and bonding. Research examines its effects on neural circuits and physiological processes.',
    category: 'RESEARCH_PEPTIDES' as const,
    variants: [
      { strengthValue: 2, strengthUnit: 'MG' as const, sku: 'OXY-2MG-RETAIL', priceCents: 5900 },
    ],
  },
];

// Slugs of products that should remain active (from our 32 retail products)
const ACTIVE_PRODUCT_SLUGS = RETAIL_PRODUCTS.map(p => p.slug);

async function main() {
  console.log('🛒 Starting RETAIL catalog update...\n');

  // Step 1: Hide all existing products first (set isDraft = true, isActive = false)
  console.log('📦 Hiding existing products not in retail lineup...');
  const hideResult = await prisma.product.updateMany({
    where: {
      slug: {
        notIn: ACTIVE_PRODUCT_SLUGS,
      },
    },
    data: {
      isActive: false,
      isDraft: true,
    },
  });
  console.log(`   ✓ Hidden ${hideResult.count} products\n`);

  // Step 2: Also hide all old variants
  console.log('📦 Hiding old product variants...');
  const existingProducts = await prisma.product.findMany({
    where: {
      slug: {
        notIn: ACTIVE_PRODUCT_SLUGS,
      },
    },
    select: { id: true },
  });

  const hideVariantsResult = await prisma.productVariant.updateMany({
    where: {
      productId: {
        in: existingProducts.map(p => p.id),
      },
    },
    data: {
      isActive: false,
    },
  });
  console.log(`   ✓ Hidden ${hideVariantsResult.count} variants\n`);

  // Step 3: Upsert each retail product
  console.log('🆕 Creating/updating retail products...\n');

  for (const product of RETAIL_PRODUCTS) {
    try {
      // Check if product exists
      const existing = await prisma.product.findFirst({
        where: { slug: product.slug },
        include: { variants: true },
      });

      if (existing) {
        // Update existing product
        await prisma.product.update({
          where: { id: existing.id },
          data: {
            name: product.name,
            description: product.description,
            category: product.category,
            visibility: ProductVisibility.B2C_ONLY,
            isActive: true,
            isDraft: false,
            isFeatured: true,
            stockStatus: StockStatus.IN_STOCK,
            currentStock: 100,
          },
        });

        // Hide old variants for this product
        await prisma.productVariant.updateMany({
          where: { productId: existing.id },
          data: { isActive: false },
        });

        // Create new retail variants
        for (const variant of product.variants) {
          // Check if variant with this SKU exists
          const existingVariant = await prisma.productVariant.findFirst({
            where: { sku: variant.sku },
          });

          if (existingVariant) {
            await prisma.productVariant.update({
              where: { id: existingVariant.id },
              data: {
                strengthValue: variant.strengthValue,
                strengthUnit: variant.strengthUnit,
                priceCents: variant.priceCents,
                isActive: true,
              },
            });
          } else {
            await prisma.productVariant.create({
              data: {
                productId: existing.id,
                strengthValue: variant.strengthValue,
                strengthUnit: variant.strengthUnit,
                sku: variant.sku,
                priceCents: variant.priceCents,
                isActive: true,
              },
            });
          }
        }

        console.log(`  ✓ Updated: ${product.name}`);
      } else {
        // Create new product with variants
        await prisma.product.create({
          data: {
            name: product.name,
            slug: product.slug,
            sku: product.sku,
            description: product.description,
            category: product.category,
            visibility: ProductVisibility.B2C_ONLY,
            isActive: true,
            isDraft: false,
            isFeatured: true,
            stockStatus: StockStatus.IN_STOCK,
            currentStock: 100,
            variants: {
              create: product.variants.map((v) => ({
                strengthValue: v.strengthValue,
                strengthUnit: v.strengthUnit,
                sku: v.sku,
                priceCents: v.priceCents,
                isActive: true,
              })),
            },
          },
        });
        console.log(`  ✓ Created: ${product.name}`);
      }
    } catch (error: any) {
      console.error(`  ✗ Error with ${product.name}: ${error.message}`);
    }
  }

  // Step 4: Summary
  const activeProducts = await prisma.product.count({
    where: { isActive: true, isDraft: false },
  });
  const hiddenProducts = await prisma.product.count({
    where: { OR: [{ isActive: false }, { isDraft: true }] },
  });
  const activeVariants = await prisma.productVariant.count({
    where: { isActive: true },
  });

  console.log('\n✅ Retail catalog update complete!');
  console.log('\n📊 Summary:');
  console.log(`   Active products: ${activeProducts}`);
  console.log(`   Hidden products: ${hiddenProducts}`);
  console.log(`   Active variants: ${activeVariants}`);
  console.log('\n💰 Retail Prices (B2C single vial):');

  for (const product of RETAIL_PRODUCTS) {
    for (const variant of product.variants) {
      const priceStr = `$${(variant.priceCents / 100).toFixed(2)}`;
      const strengthStr = variant.strengthUnit === 'IU'
        ? `${variant.strengthValue}${variant.strengthUnit}`
        : `${variant.strengthValue}${variant.strengthUnit.toLowerCase()}`;
      console.log(`   ${product.name} ${strengthStr}: ${priceStr}`);
    }
  }
}

main()
  .catch((e) => {
    console.error('❌ Update failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
