import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding payment settings...');

  // Payment settings
  const paymentSettings = [
    {
      key: 'PAYMENT_ZELLE_EMAIL',
      value: 'payments@mahapeps.com', // Replace with your actual Zelle email
      category: 'PAYMENT',
      isPublic: false,
    },
    {
      key: 'PAYMENT_ZELLE_PHONE',
      value: '+1-555-MAHA-PEPS', // Replace with your actual Zelle phone
      category: 'PAYMENT',
      isPublic: false,
    },
    {
      key: 'PAYMENT_CASHAPP_TAG',
      value: '$MahaPeps', // Replace with your actual CashApp tag
      category: 'PAYMENT',
      isPublic: false,
    },
    {
      key: 'PAYMENT_WIRE_INSTRUCTIONS',
      value: `Bank Name: Example Bank
Account Name: MAHA Peptides LLC
Routing Number: 123456789
Account Number: 987654321
SWIFT Code: EXAMPUS33

Please include your order number in the wire transfer memo.`,
      category: 'PAYMENT',
      isPublic: false,
    },
    {
      key: 'PAYMENT_METHODS_ENABLED',
      value: JSON.stringify(['ZELLE', 'CASHAPP', 'WIRE_TRANSFER']),
      category: 'PAYMENT',
      isPublic: true,
    },
    {
      key: 'PAYMENT_LINK_EXPIRY_HOURS',
      value: '72', // Payment links expire after 72 hours
      category: 'PAYMENT',
      isPublic: false,
    },
    {
      key: 'SHIPPING_FREE_THRESHOLD_CENTS',
      value: '20000', // Free shipping over $200
      category: 'SHIPPING',
      isPublic: true,
    },
    {
      key: 'TAX_RATE_PERCENT',
      value: '0', // No tax for research materials
      category: 'GENERAL',
      isPublic: true,
    },
  ];

  for (const setting of paymentSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: setting,
      create: setting,
    });
    console.log(`✓ Created/updated setting: ${setting.key}`);
  }

  console.log('\n✅ Payment settings seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding payment settings:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
