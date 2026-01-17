import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed batches for all active products
 * Creates one active batch per product variant with realistic data
 */
async function seedBatches() {
  console.log('Starting batch seeding...\n');

  // Get all active products with their variants
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { variants: { where: { isActive: true } } },
  });

  let created = 0;
  let skipped = 0;

  for (const product of products) {
    for (const variant of product.variants) {
      // Generate a unique batch code
      const batchCode = `${product.slug?.toUpperCase().replace(/-/g, '').substring(0, 6) || 'PROD'}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

      // Check if batch already exists for this variant
      const existingBatch = await prisma.productBatch.findFirst({
        where: {
          productId: product.id,
          variantId: variant.id,
          isActive: true,
        },
      });

      if (existingBatch) {
        console.log(`⚠ Skipping: ${product.name} (${variant.sku}) - batch exists`);
        skipped++;
        continue;
      }

      // Create batch with realistic data
      const manufacturedDate = new Date();
      manufacturedDate.setMonth(manufacturedDate.getMonth() - 1); // Manufactured 1 month ago

      const expiresDate = new Date();
      expiresDate.setFullYear(expiresDate.getFullYear() + 2); // Expires in 2 years

      try {
        await prisma.productBatch.create({
          data: {
            productId: product.id,
            variantId: variant.id,
            batchCode,
            purityPercent: 99.5 + Math.random() * 0.4, // 99.5 - 99.9%
            manufacturedAt: manufacturedDate,
            expiresAt: expiresDate,
            storageInstructions: 'Store at -20°C. Protect from light and moisture.',
            qtyInitial: 1000,
            qtyAvailable: 1000,
            testingLab: 'Analytical Chemistry Labs, Inc.',
            isActive: true,
            isAvailable: true,
          },
        });
        console.log(`✓ Created batch for: ${product.name} (${variant.sku}) - ${batchCode}`);
        created++;
      } catch (error: any) {
        // If batch code collision, retry with new code
        if (error.code === 'P2002') {
          const retryBatchCode = `${batchCode}-${Date.now().toString(36).slice(-3).toUpperCase()}`;
          await prisma.productBatch.create({
            data: {
              productId: product.id,
              variantId: variant.id,
              batchCode: retryBatchCode,
              purityPercent: 99.5 + Math.random() * 0.4,
              manufacturedAt: manufacturedDate,
              expiresAt: expiresDate,
              storageInstructions: 'Store at -20°C. Protect from light and moisture.',
              qtyInitial: 1000,
              qtyAvailable: 1000,
              testingLab: 'Analytical Chemistry Labs, Inc.',
              isActive: true,
              isAvailable: true,
            },
          });
          console.log(`✓ Created batch (retry) for: ${product.name} (${variant.sku}) - ${retryBatchCode}`);
          created++;
        } else {
          console.error(`✗ Error creating batch for ${product.name}: ${error.message}`);
        }
      }
    }
  }

  console.log(`\n--- Summary ---`);
  console.log(`Created: ${created}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Total products processed: ${products.length}`);
}

seedBatches()
  .catch((error) => {
    console.error('Error seeding batches:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
