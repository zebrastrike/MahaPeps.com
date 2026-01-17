import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Product image mapping
 * Maps product slug to image filename
 *
 * To use:
 * 1. Convert your PDF vial labels to PNG/JPG images
 * 2. Place images in: apps/web/public/products/
 * 3. Update the mapping below with your image filenames
 * 4. Run: npm run seed:images
 *
 * Image path format: /products/{filename}
 */
const PRODUCT_IMAGE_MAP: Record<string, string> = {
  // Weight Loss / Metabolic
  'semaglutide': '/products/semaglutide.png',
  'retatrutide': '/products/retatrutide.png',

  // Healing & Recovery
  'bpc-157': '/products/bpc-157.png',
  'tb-500': '/products/tb-500.png',
  'ghk-cu': '/products/ghk-cu.png',
  'bpc-tb500-blend': '/products/bpc-tb500-blend.png',

  // Longevity & Wellness
  'nad-plus': '/products/nad-plus.png',
  'epithalon': '/products/epithalon.png',
  'ss-31': '/products/ss-31.png',

  // Cognitive
  'semax': '/products/semax.png',
  'selank': '/products/selank.png',
  'pinealon': '/products/pinealon.png',

  // Growth Hormone
  'tesamorelin': '/products/tesamorelin.png',
  'cjc-1295-ipamorelin': '/products/cjc-1295-ipamorelin.png',
  'ipamorelin': '/products/ipamorelin.png',
  'cjc-1295-dac': '/products/cjc-1295-dac.png',
  'igf-1-lr3': '/products/igf-1-lr3.png',

  // Fat Loss
  'aod-9604': '/products/aod-9604.png',
  '5-amino-1mq': '/products/5-amino-1mq.png',
  'slu-pp-332': '/products/slu-pp-332.png',

  // Immune & Antimicrobial
  'kpv': '/products/kpv.png',
  'thymosin-alpha-1': '/products/thymosin-alpha-1.png',

  // Skin & Beauty
  'snap8-ghkcu-serum': '/products/snap8-ghkcu-serum.png',

  // Sexual Health
  'pt-141': '/products/pt-141.png',
  'kisspeptin-10': '/products/kisspeptin-10.png',
  'oxytocin': '/products/oxytocin.png',
  'hcg': '/products/hcg.png',

  // Sleep
  'dsip': '/products/dsip.png',

  // Additional products with images
  'tirzepatide': '/products/tirzepatide.png',
  'mots-c': '/products/mots-c.png',
  'melanotan-2': '/products/melanotan-2.png',
};

async function updateProductImages() {
  console.log('Starting product image update...\n');

  const products = await prisma.product.findMany({
    select: { id: true, name: true, slug: true, imageUrl: true },
  });

  let updated = 0;
  let skipped = 0;

  for (const product of products) {
    const slug = product.slug || product.name.toLowerCase().replace(/\s+/g, '-');
    const imageUrl = PRODUCT_IMAGE_MAP[slug];

    if (imageUrl) {
      await prisma.product.update({
        where: { id: product.id },
        data: { imageUrl },
      });
      console.log(`✓ Updated: ${product.name} -> ${imageUrl}`);
      updated++;
    } else {
      console.log(`⚠ No image mapping for: ${product.name} (slug: ${slug})`);
      skipped++;
    }
  }

  console.log(`\n--- Summary ---`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Total: ${products.length}`);
}

updateProductImages()
  .catch((error) => {
    console.error('Error updating images:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
