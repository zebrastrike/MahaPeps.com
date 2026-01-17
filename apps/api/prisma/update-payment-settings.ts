import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Updating payment settings with correct details...');

  // Update Zelle email
  await prisma.setting.update({
    where: { key: 'PAYMENT_ZELLE_EMAIL' },
    data: { value: 'skiniels@gmail.com' },
  });
  console.log('✓ Updated PAYMENT_ZELLE_EMAIL to skiniels@gmail.com');

  // Update CashApp tag
  await prisma.setting.update({
    where: { key: 'PAYMENT_CASHAPP_TAG' },
    data: { value: '$scottaskinner' },
  });
  console.log('✓ Updated PAYMENT_CASHAPP_TAG to $scottaskinner');

  // Update CashApp URL (add new setting)
  await prisma.setting.upsert({
    where: { key: 'PAYMENT_CASHAPP_URL' },
    update: { value: 'https://cash.app/$scottaskinner' },
    create: {
      key: 'PAYMENT_CASHAPP_URL',
      value: 'https://cash.app/$scottaskinner',
      category: 'PAYMENT',
      isPublic: false,
    },
  });
  console.log('✓ Updated PAYMENT_CASHAPP_URL to https://cash.app/$scottaskinner');

  // Update Wire transfer instructions
  await prisma.setting.update({
    where: { key: 'PAYMENT_WIRE_INSTRUCTIONS' },
    data: {
      value: `For wire transfer instructions, please contact:
scott@mahapeps.com

We will provide full bank details including:
- Bank Name
- Account Name
- Routing Number
- Account Number
- SWIFT Code (for international transfers)

Please include your order number in the wire transfer memo.`,
    },
  });
  console.log('✓ Updated PAYMENT_WIRE_INSTRUCTIONS');

  console.log('\n✅ All payment settings updated successfully!');
  console.log('\nCurrent payment methods:');
  console.log('  Zelle: skiniels@gmail.com');
  console.log('  CashApp: $scottaskinner (https://cash.app/$scottaskinner)');
  console.log('  Wire Transfer: Contact scott@mahapeps.com for details');
}

main()
  .catch((e) => {
    console.error('Error updating payment settings:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
