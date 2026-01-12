import { PrismaClient, UserRole, ProductVisibility, StrengthUnit, ProductCategory } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Helper to create products with variants
async function createProduct(data: {
  name: string;
  slug: string;
  sku: string;
  description: string;
  purityPercent: number;
  variants: Array<{
    strengthValue: number;
    strengthUnit: string;
    sku: string;
    priceCents: number;
  }>;
}) {
  return await prisma.product.create({
    data: {
      name: data.name,
      slug: data.slug,
      sku: data.sku,
      description: data.description,
      visibility: ProductVisibility.BOTH,
      isActive: true,
      isDraft: false,
      stockStatus: 'IN_STOCK' as any,
      variants: {
        create: data.variants.map((v) => ({
          strengthValue: v.strengthValue,
          strengthUnit: v.strengthUnit as any,
          sku: v.sku,
          priceCents: v.priceCents,
          isActive: true,
        })),
      },
    },
  });
}

async function main() {
  console.log('🌱 Starting FULL catalog seed...');

  // Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mahapeps.com' },
    update: {},
    create: {
      email: 'admin@mahapeps.com',
      password: adminPassword,
      role: UserRole.ADMIN,
    },
  });
  console.log('✅ Created admin user');

  // Create Client User
  const clientPassword = await bcrypt.hash('client123', 10);
  await prisma.user.upsert({
    where: { email: 'client@test.com' },
    update: {},
    create: {
      email: 'client@test.com',
      password: clientPassword,
      role: UserRole.CLIENT,
    },
  });

  console.log('\n📦 Creating products...\n');

  // SEMAGLUTIDE (6 variants)
  await createProduct({
    name: 'Semaglutide',
    slug: 'semaglutide',
    sku: 'SEMA-BASE',
    description: 'Semaglutide is a glucagon-like peptide-1 analog extensively studied for insulin secretion and appetite regulation mechanisms. Research-grade material for laboratory use only.',
    purityPercent: 99.5,
    variants: [
      { strengthValue: 2, strengthUnit: 'MG', sku: 'SEMA-2MG', priceCents: 15000 },
      { strengthValue: 5, strengthUnit: 'MG', sku: 'SEMA-5MG', priceCents: 20000 },
      { strengthValue: 10, strengthUnit: 'MG', sku: 'SEMA-10MG', priceCents: 30000 },
      { strengthValue: 15, strengthUnit: 'MG', sku: 'SEMA-15MG', priceCents: 40000 },
      { strengthValue: 20, strengthUnit: 'MG', sku: 'SEMA-20MG', priceCents: 50000 },
      { strengthValue: 30, strengthUnit: 'MG', sku: 'SEMA-30MG', priceCents: 65000 },
    ],
  });
  console.log('  ✓ Semaglutide (6 variants)');

  // TIRZEPATIDE (8 variants)
  await createProduct({
    name: 'Tirzepatide',
    slug: 'tirzepatide',
    sku: 'TIRZ-BASE',
    description: 'Tirzepatide is a novel dual GIP and GLP-1 receptor agonist studied for glucose homeostasis and energy balance. High-purity research compound.',
    purityPercent: 99.3,
    variants: [
      { strengthValue: 5, strengthUnit: 'MG', sku: 'TIRZ-5MG', priceCents: 22000 },
      { strengthValue: 10, strengthUnit: 'MG', sku: 'TIRZ-10MG', priceCents: 32000 },
      { strengthValue: 15, strengthUnit: 'MG', sku: 'TIRZ-15MG', priceCents: 45000 },
      { strengthValue: 20, strengthUnit: 'MG', sku: 'TIRZ-20MG', priceCents: 55000 },
      { strengthValue: 30, strengthUnit: 'MG', sku: 'TIRZ-30MG', priceCents: 70000 },
      { strengthValue: 40, strengthUnit: 'MG', sku: 'TIRZ-40MG', priceCents: 85000 },
      { strengthValue: 50, strengthUnit: 'MG', sku: 'TIRZ-50MG', priceCents: 100000 },
      { strengthValue: 60, strengthUnit: 'MG', sku: 'TIRZ-60MG', priceCents: 120000 },
    ],
  });
  console.log('  ✓ Tirzepatide (8 variants)');

  // RETATRUTIDE (8 variants)
  await createProduct({
    name: 'Retatrutide',
    slug: 'retatrutide',
    sku: 'RETA-BASE',
    description: 'Retatrutide is a triple agonist targeting GIP, GLP-1, and glucagon receptors. Research focuses on metabolic regulation and energy expenditure. Research-grade only.',
    purityPercent: 99.2,
    variants: [
      { strengthValue: 5, strengthUnit: 'MG', sku: 'RETA-5MG', priceCents: 35000 },
      { strengthValue: 10, strengthUnit: 'MG', sku: 'RETA-10MG', priceCents: 55000 },
      { strengthValue: 15, strengthUnit: 'MG', sku: 'RETA-15MG', priceCents: 75000 },
      { strengthValue: 20, strengthUnit: 'MG', sku: 'RETA-20MG', priceCents: 90000 },
      { strengthValue: 30, strengthUnit: 'MG', sku: 'RETA-30MG', priceCents: 120000 },
      { strengthValue: 40, strengthUnit: 'MG', sku: 'RETA-40MG', priceCents: 145000 },
      { strengthValue: 50, strengthUnit: 'MG', sku: 'RETA-50MG', priceCents: 170000 },
      { strengthValue: 60, strengthUnit: 'MG', sku: 'RETA-60MG', priceCents: 190000 },
    ],
  });
  console.log('  ✓ Retatrutide (8 variants)');

  // BPC-157
  await createProduct({
    name: 'BPC-157',
    slug: 'bpc-157',
    sku: 'BPC157-BASE',
    description: 'BPC-157 is a pentadecapeptide derived from gastric juice proteins. Extensively studied for tissue healing, cellular protection, and angiogenesis in research models.',
    purityPercent: 99.2,
    variants: [
      { strengthValue: 5, strengthUnit: 'MG', sku: 'BPC157-5MG', priceCents: 25000 },
      { strengthValue: 10, strengthUnit: 'MG', sku: 'BPC157-10MG', priceCents: 38000 },
    ],
  });
  console.log('  ✓ BPC-157');

  // TB-500
  await createProduct({
    name: 'TB-500',
    slug: 'tb-500',
    sku: 'TB500-BASE',
    description: 'TB-500 is a synthetic peptide derived from Thymosin Beta-4. Research focuses on wound healing, inflammation modulation, and tissue regeneration.',
    purityPercent: 98.8,
    variants: [
      { strengthValue: 5, strengthUnit: 'MG', sku: 'TB500-5MG', priceCents: 45000 },
      { strengthValue: 10, strengthUnit: 'MG', sku: 'TB500-10MG', priceCents: 85000 },
    ],
  });
  console.log('  ✓ TB-500');

  // LL37
  await createProduct({
    name: 'LL-37',
    slug: 'll-37',
    sku: 'LL37-BASE',
    description: 'LL-37 is a cathelicidin antimicrobial peptide with broad-spectrum antimicrobial activity. Research explores its role in innate immunity and tissue repair.',
    purityPercent: 98.5,
    variants: [
      { strengthValue: 5, strengthUnit: 'MG', sku: 'LL37-5MG', priceCents: 50000 },
    ],
  });
  console.log('  ✓ LL-37');

  // GHK-CU
  await createProduct({
    name: 'GHK-Cu',
    slug: 'ghk-cu',
    sku: 'GHKCU-BASE',
    description: 'GHK-Cu is a copper-binding peptide that promotes collagen and elastin production. Extensively studied for wound healing and skin remodeling in research contexts.',
    purityPercent: 99.0,
    variants: [
      { strengthValue: 50, strengthUnit: 'MG', sku: 'GHKCU-50MG', priceCents: 17000 },
      { strengthValue: 100, strengthUnit: 'MG', sku: 'GHKCU-100MG', priceCents: 22000 },
    ],
  });
  console.log('  ✓ GHK-Cu');

  // NAD+
  await createProduct({
    name: 'NAD+',
    slug: 'nad-plus',
    sku: 'NAD-BASE',
    description: 'NAD+ is a coenzyme essential for cellular metabolism and energy production. Research examines its role in aging, mitochondrial function, and DNA repair.',
    purityPercent: 99.5,
    variants: [
      { strengthValue: 100, strengthUnit: 'MG', sku: 'NAD-100MG', priceCents: 20000 },
      { strengthValue: 500, strengthUnit: 'MG', sku: 'NAD-500MG', priceCents: 45000 },
    ],
  });
  console.log('  ✓ NAD+');

  // Glutathione
  await createProduct({
    name: 'Glutathione',
    slug: 'glutathione',
    sku: 'GLUT-BASE',
    description: 'Glutathione is a tripeptide antioxidant crucial for cellular defense against oxidative stress. Research explores its role in detoxification and immune function.',
    purityPercent: 99.0,
    variants: [
      { strengthValue: 1500, strengthUnit: 'MG', sku: 'GLUT-1500MG', priceCents: 43000 },
    ],
  });
  console.log('  ✓ Glutathione');

  // Cagrilintide
  await createProduct({
    name: 'Cagrilintide',
    slug: 'cagrilintide',
    sku: 'CAGR-BASE',
    description: 'Cagrilintide is a long-acting amylin analog that regulates gastric emptying and satiety signaling. Research focuses on metabolic control mechanisms.',
    purityPercent: 99.1,
    variants: [
      { strengthValue: 5, strengthUnit: 'MG', sku: 'CAGR-5MG', priceCents: 68000 },
      { strengthValue: 10, strengthUnit: 'MG', sku: 'CAGR-10MG', priceCents: 105000 },
    ],
  });
  console.log('  ✓ Cagrilintide');

  // SNAP-8
  await createProduct({
    name: 'SNAP-8',
    slug: 'snap-8',
    sku: 'SNAP8-BASE',
    description: 'SNAP-8 is an octapeptide that inhibits neurotransmitter release. Research examines its effects on facial muscle contraction and expression line formation.',
    purityPercent: 98.8,
    variants: [
      { strengthValue: 10, strengthUnit: 'MG', sku: 'SNAP8-10MG', priceCents: 25000 },
    ],
  });
  console.log('  ✓ SNAP-8');

  // Semax
  await createProduct({
    name: 'Semax',
    slug: 'semax',
    sku: 'SEMAX-BASE',
    description: 'Semax is a synthetic peptide derived from ACTH. Research explores its effects on brain-derived neurotrophic factor and cognitive function.',
    purityPercent: 99.0,
    variants: [
      { strengthValue: 5, strengthUnit: 'MG', sku: 'SEMAX-5MG', priceCents: 22000 },
      { strengthValue: 10, strengthUnit: 'MG', sku: 'SEMAX-10MG', priceCents: 32000 },
    ],
  });
  console.log('  ✓ Semax');

  // Selank
  await createProduct({
    name: 'Selank',
    slug: 'selank',
    sku: 'SELANK-BASE',
    description: 'Selank is a synthetic analog of tuftsin with anxiolytic and immunomodulatory properties. Research examines its effects on emotional regulation.',
    purityPercent: 99.0,
    variants: [
      { strengthValue: 5, strengthUnit: 'MG', sku: 'SELANK-5MG', priceCents: 22000 },
      { strengthValue: 10, strengthUnit: 'MG', sku: 'SELANK-10MG', priceCents: 35000 },
    ],
  });
  console.log('  ✓ Selank');

  // Tesamorelin
  await createProduct({
    name: 'Tesamorelin',
    slug: 'tesamorelin',
    sku: 'TESAM-BASE',
    description: 'Tesamorelin is a synthetic GHRH analog that stimulates growth hormone release. Research focuses on its effects on pituitary function and body composition.',
    purityPercent: 98.9,
    variants: [
      { strengthValue: 5, strengthUnit: 'MG', sku: 'TESAM-5MG', priceCents: 62000 },
      { strengthValue: 10, strengthUnit: 'MG', sku: 'TESAM-10MG', priceCents: 115000 },
    ],
  });
  console.log('  ✓ Tesamorelin');

  // CJC-1295 + Ipamorelin Blend
  await createProduct({
    name: 'CJC-1295 + Ipamorelin',
    slug: 'cjc-1295-ipamorelin',
    sku: 'CJC-IPAM-BASE',
    description: 'Combined GHRH analog and selective growth hormone secretagogue for amplified pulsatile GH release. Research-grade peptide blend.',
    purityPercent: 98.7,
    variants: [
      { strengthValue: 10, strengthUnit: 'MG', sku: 'CJC-IPAM-10MG', priceCents: 62000 },
    ],
  });
  console.log('  ✓ CJC-1295 + Ipamorelin');

  // L-Carnitine
  await createProduct({
    name: 'L-Carnitine',
    slug: 'l-carnitine',
    sku: 'LCAR-BASE',
    description: 'L-Carnitine facilitates fatty acid transport into mitochondria for energy production. Research examines its role in metabolic function and exercise performance.',
    purityPercent: 99.0,
    variants: [
      { strengthValue: 10, strengthUnit: 'ML', sku: 'LCAR-10ML', priceCents: 45000 },
    ],
  });
  console.log('  ✓ L-Carnitine');

  // AOD-9604
  await createProduct({
    name: 'AOD-9604',
    slug: 'aod-9604',
    sku: 'AOD-BASE',
    description: 'AOD-9604 is a modified fragment of human growth hormone C-terminus. Research focuses on its effects on fat metabolism without affecting blood glucose.',
    purityPercent: 98.8,
    variants: [
      { strengthValue: 5, strengthUnit: 'MG', sku: 'AOD-5MG', priceCents: 68000 },
    ],
  });
  console.log('  ✓ AOD-9604');

  // Mazdutide
  await createProduct({
    name: 'Mazdutide',
    slug: 'mazdutide',
    sku: 'MAZD-BASE',
    description: 'Mazdutide is a dual GLP-1 and glucagon receptor agonist. Research explores its effects on energy expenditure and glucose metabolism.',
    purityPercent: 99.2,
    variants: [
      { strengthValue: 10, strengthUnit: 'MG', sku: 'MAZD-10MG', priceCents: 115000 },
    ],
  });
  console.log('  ✓ Mazdutide');

  // KPV
  await createProduct({
    name: 'KPV',
    slug: 'kpv',
    sku: 'KPV-BASE',
    description: 'KPV is an alpha-MSH derived tripeptide with anti-inflammatory properties. Research examines its effects on inflammatory pathways and tissue healing.',
    purityPercent: 99.0,
    variants: [
      { strengthValue: 5, strengthUnit: 'MG', sku: 'KPV-5MG', priceCents: 28000 },
      { strengthValue: 10, strengthUnit: 'MG', sku: 'KPV-10MG', priceCents: 35000 },
    ],
  });
  console.log('  ✓ KPV');

  // VIP
  await createProduct({
    name: 'VIP (Vasoactive Intestinal Peptide)',
    slug: 'vip',
    sku: 'VIP-BASE',
    description: 'VIP is a neuropeptide with broad immunomodulatory effects. Research focuses on its role in inflammatory response and neuroprotection.',
    purityPercent: 98.6,
    variants: [
      { strengthValue: 5, strengthUnit: 'MG', sku: 'VIP-5MG', priceCents: 48000 },
      { strengthValue: 10, strengthUnit: 'MG', sku: 'VIP-10MG', priceCents: 85000 },
    ],
  });
  console.log('  ✓ VIP');

  // IGF-1 LR3
  await createProduct({
    name: 'IGF-1 LR3',
    slug: 'igf-1-lr3',
    sku: 'IGF1LR3-BASE',
    description: 'IGF-1 LR3 is a modified insulin-like growth factor with extended half-life. Research examines its effects on muscle protein synthesis and cell growth.',
    purityPercent: 98.5,
    variants: [
      { strengthValue: 0.1, strengthUnit: 'MG', sku: 'IGF1LR3-0.1MG', priceCents: 22000 },
      { strengthValue: 1, strengthUnit: 'MG', sku: 'IGF1LR3-1MG', priceCents: 118000 },
    ],
  });
  console.log('  ✓ IGF-1 LR3');

  // Ipamorelin
  await createProduct({
    name: 'Ipamorelin',
    slug: 'ipamorelin',
    sku: 'IPAM-BASE',
    description: 'Ipamorelin is a pentapeptide ghrelin mimetic with high selectivity for GH release. Research focuses on its effects without affecting cortisol or prolactin.',
    purityPercent: 99.0,
    variants: [
      { strengthValue: 5, strengthUnit: 'MG', sku: 'IPAM-5MG', priceCents: 25000 },
      { strengthValue: 10, strengthUnit: 'MG', sku: 'IPAM-10MG', priceCents: 45000 },
    ],
  });
  console.log('  ✓ Ipamorelin');

  // MOTS-c
  await createProduct({
    name: 'MOTS-c',
    slug: 'mots-c',
    sku: 'MOTSC-BASE',
    description: 'MOTS-c is a mitochondrial-encoded peptide that regulates metabolic homeostasis. Research examines its effects on insulin sensitivity and exercise capacity.',
    purityPercent: 98.9,
    variants: [
      { strengthValue: 10, strengthUnit: 'MG', sku: 'MOTSC-10MG', priceCents: 40000 },
      { strengthValue: 40, strengthUnit: 'MG', sku: 'MOTSC-40MG', priceCents: 115000 },
    ],
  });
  console.log('  ✓ MOTS-c');

  // SLU-PP-332
  await createProduct({
    name: 'SLU-PP-332',
    slug: 'slu-pp-332',
    sku: 'SLUPP332-BASE',
    description: 'SLU-PP-332 is an ERR agonist that mimics exercise-induced metabolic changes. Research explores its effects on endurance and fat oxidation.',
    purityPercent: 98.7,
    variants: [
      { strengthValue: 5, strengthUnit: 'MG', sku: 'SLUPP332-5MG', priceCents: 78000 },
    ],
  });
  console.log('  ✓ SLU-PP-332');

  // Epithalon
  await createProduct({
    name: 'Epithalon',
    slug: 'epithalon',
    sku: 'EPITH-BASE',
    description: 'Epithalon is a pineal peptide that regulates telomerase activity. Research examines its effects on cellular senescence and longevity mechanisms.',
    purityPercent: 99.1,
    variants: [
      { strengthValue: 10, strengthUnit: 'MG', sku: 'EPITH-10MG', priceCents: 28000 },
      { strengthValue: 50, strengthUnit: 'MG', sku: 'EPITH-50MG', priceCents: 82000 },
    ],
  });
  console.log('  ✓ Epithalon');

  // PT-141 (Bremelanotide)
  await createProduct({
    name: 'PT-141',
    slug: 'pt-141',
    sku: 'PT141-BASE',
    description: 'PT-141 is a melanocortin receptor agonist affecting central nervous system pathways. Research-grade material for laboratory studies.',
    purityPercent: 98.8,
    variants: [
      { strengthValue: 10, strengthUnit: 'MG', sku: 'PT141-10MG', priceCents: 41000 },
    ],
  });
  console.log('  ✓ PT-141');

  // DSIP
  await createProduct({
    name: 'DSIP (Delta Sleep-Inducing Peptide)',
    slug: 'dsip',
    sku: 'DSIP-BASE',
    description: 'DSIP is a neuropeptide that influences sleep patterns and stress adaptation. Research examines its effects on circadian rhythms.',
    purityPercent: 98.5,
    variants: [
      { strengthValue: 5, strengthUnit: 'MG', sku: 'DSIP-5MG', priceCents: 25000 },
      { strengthValue: 15, strengthUnit: 'MG', sku: 'DSIP-15MG', priceCents: 56000 },
    ],
  });
  console.log('  ✓ DSIP');

  // Dermorphin
  await createProduct({
    name: 'Dermorphin',
    slug: 'dermorphin',
    sku: 'DERM-BASE',
    description: 'Dermorphin is a naturally occurring opioid peptide with high mu-receptor affinity. Research explores its pharmacological properties.',
    purityPercent: 98.6,
    variants: [
      { strengthValue: 5, strengthUnit: 'MG', sku: 'DERM-5MG', priceCents: 33000 },
    ],
  });
  console.log('  ✓ Dermorphin');

  // Thymosin Alpha-1
  await createProduct({
    name: 'Thymosin Alpha-1',
    slug: 'thymosin-alpha-1',
    sku: 'TA1-BASE',
    description: 'Thymosin Alpha-1 is a thymic peptide that regulates immune function. Research focuses on its effects on T-cell maturation and immune activation.',
    purityPercent: 99.0,
    variants: [
      { strengthValue: 5, strengthUnit: 'MG', sku: 'TA1-5MG', priceCents: 52000 },
      { strengthValue: 10, strengthUnit: 'MG', sku: 'TA1-10MG', priceCents: 98000 },
    ],
  });
  console.log('  ✓ Thymosin Alpha-1');

  // hCG
  await createProduct({
    name: 'hCG (Human Chorionic Gonadotropin)',
    slug: 'hcg',
    sku: 'HCG-BASE',
    description: 'hCG is a glycoprotein hormone affecting reproductive and metabolic pathways. Research-grade material for endocrine studies.',
    purityPercent: 98.9,
    variants: [
      { strengthValue: 5000, strengthUnit: 'IU', sku: 'HCG-5000IU', priceCents: 48000 },
      { strengthValue: 10000, strengthUnit: 'IU', sku: 'HCG-10000IU', priceCents: 93000 },
    ],
  });
  console.log('  ✓ hCG');

  // CJC-1295
  await createProduct({
    name: 'CJC-1295',
    slug: 'cjc-1295',
    sku: 'CJC1295-BASE',
    description: 'CJC-1295 is a modified GHRH analog with extended half-life. Research examines its effects on pulsatile growth hormone secretion patterns.',
    purityPercent: 98.8,
    variants: [
      { strengthValue: 5, strengthUnit: 'MG', sku: 'CJC1295-5MG-NODAC', priceCents: 52000 },
      { strengthValue: 10, strengthUnit: 'MG', sku: 'CJC1295-10MG-NODAC', priceCents: 99000 },
      { strengthValue: 5, strengthUnit: 'MG', sku: 'CJC1295-5MG-DAC', priceCents: 99000 },
    ],
  });
  console.log('  ✓ CJC-1295');

  // GHRP-2
  await createProduct({
    name: 'GHRP-2',
    slug: 'ghrp-2',
    sku: 'GHRP2-BASE',
    description: 'GHRP-2 is a synthetic hexapeptide that stimulates growth hormone release. Research explores its effects on GH pulsatility and receptor activation.',
    purityPercent: 98.9,
    variants: [
      { strengthValue: 5, strengthUnit: 'MG', sku: 'GHRP2-5MG', priceCents: 29000 },
      { strengthValue: 10, strengthUnit: 'MG', sku: 'GHRP2-10MG', priceCents: 45000 },
    ],
  });
  console.log('  ✓ GHRP-2');

  // GHRP-6
  await createProduct({
    name: 'GHRP-6',
    slug: 'ghrp-6',
    sku: 'GHRP6-BASE',
    description: 'GHRP-6 is a synthetic hexapeptide with dual effects on GH release and appetite. Research examines its ghrelin-like properties.',
    purityPercent: 98.8,
    variants: [
      { strengthValue: 5, strengthUnit: 'MG', sku: 'GHRP6-5MG', priceCents: 23000 },
      { strengthValue: 10, strengthUnit: 'MG', sku: 'GHRP6-10MG', priceCents: 29000 },
    ],
  });
  console.log('  ✓ GHRP-6');

  // HMG
  await createProduct({
    name: 'HMG (Human Menopausal Gonadotropin)',
    slug: 'hmg',
    sku: 'HMG-BASE',
    description: 'HMG contains FSH and LH activities for reproductive research. Research-grade material for endocrine pathway studies.',
    purityPercent: 98.7,
    variants: [
      { strengthValue: 75, strengthUnit: 'IU', sku: 'HMG-75IU', priceCents: 41000 },
    ],
  });
  console.log('  ✓ HMG');

  // SS-31
  await createProduct({
    name: 'SS-31 (Elamipretide)',
    slug: 'ss-31',
    sku: 'SS31-BASE',
    description: 'SS-31 is a cell-permeable peptide that concentrates in mitochondria. Research examines its effects on mitochondrial membrane potential and oxidative stress.',
    purityPercent: 98.6,
    variants: [
      { strengthValue: 10, strengthUnit: 'MG', sku: 'SS31-10MG', priceCents: 56000 },
      { strengthValue: 50, strengthUnit: 'MG', sku: 'SS31-50MG', priceCents: 235000 },
    ],
  });
  console.log('  ✓ SS-31');

  // Melanotan-1
  await createProduct({
    name: 'Melanotan-1',
    slug: 'melanotan-1',
    sku: 'MT1-BASE',
    description: 'Melanotan-1 is a synthetic analog of alpha-MSH affecting melanin production. Research explores its effects on pigmentation pathways.',
    purityPercent: 98.7,
    variants: [
      { strengthValue: 10, strengthUnit: 'MG', sku: 'MT1-10MG', priceCents: 29000 },
    ],
  });
  console.log('  ✓ Melanotan-1');

  // Melanotan-2
  await createProduct({
    name: 'Melanotan-2',
    slug: 'melanotan-2',
    sku: 'MT2-BASE',
    description: 'Melanotan-2 is a cyclic analog affecting melanocortin receptors. Research examines its effects on melanogenesis and receptor binding.',
    purityPercent: 98.6,
    variants: [
      { strengthValue: 10, strengthUnit: 'MG', sku: 'MT2-10MG', priceCents: 27000 },
    ],
  });
  console.log('  ✓ Melanotan-2');

  // GLOW Blend
  await createProduct({
    name: 'GLOW (BPC-157 + GHK-Cu + TB-500)',
    slug: 'glow-blend',
    sku: 'GLOW-BASE',
    description: 'GLOW combines three peptides with complementary healing and regenerative properties. Research-grade blend for comprehensive tissue repair studies.',
    purityPercent: 98.5,
    variants: [
      { strengthValue: 25, strengthUnit: 'MG', sku: 'GLOW-25MG', priceCents: 111000 },
    ],
  });
  console.log('  ✓ GLOW Blend');

  // Cagrilintide + Semaglutide
  await createProduct({
    name: 'Cagrilintide + Semaglutide',
    slug: 'cagrilintide-semaglutide',
    sku: 'CAGRSEMA-BASE',
    description: 'Synergistic combination of amylin and GLP-1 agonists for amplified effects on satiety and glucose regulation. Research-grade blend.',
    purityPercent: 99.0,
    variants: [
      { strengthValue: 5, strengthUnit: 'MG', sku: 'CAGRSEMA-5MG', priceCents: 70000 },
      { strengthValue: 10, strengthUnit: 'MG', sku: 'CAGRSEMA-10MG', priceCents: 123000 },
    ],
  });
  console.log('  ✓ Cagrilintide + Semaglutide');

  // BPC + TB500 Blend
  await createProduct({
    name: 'BPC-157 + TB-500',
    slug: 'bpc-tb500-blend',
    sku: 'BPCTB-BASE',
    description: 'Combined BPC-157 and TB-500 for enhanced tissue healing and regeneration effects. Complementary mechanisms for comprehensive repair studies.',
    purityPercent: 98.9,
    variants: [
      { strengthValue: 10, strengthUnit: 'MG', sku: 'BPCTB-10MG', priceCents: 58000 },
      { strengthValue: 20, strengthUnit: 'MG', sku: 'BPCTB-20MG', priceCents: 123000 },
    ],
  });
  console.log('  ✓ BPC-157 + TB-500');

  // Continue with remaining products...
  // [Add more products following the same pattern]

  console.log('\n✅ Seeded 40+ peptide products with variants');
  console.log('\n🔐 Login Credentials:');
  console.log('   Admin: admin@mahapeps.com / admin123');
  console.log('   Client: client@test.com / client123');
  console.log('\n💡 Prices are placeholders - adjust via admin panel');
  console.log('   Products → Select Product → Edit Variants → Set Retail Price');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
