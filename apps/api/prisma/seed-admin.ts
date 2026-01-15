import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error('❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
    process.exit(1);
  }

  if (adminPassword === 'CHANGE_ME_TO_SECURE_PASSWORD') {
    console.error('❌ Please change ADMIN_PASSWORD in .env to a secure password');
    process.exit(1);
  }

  console.log('🔐 Setting up admin account...\n');

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      role: UserRole.ADMIN,
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      role: UserRole.ADMIN,
    },
  });

  console.log('✅ Admin account ready!');
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Role: ADMIN`);
  console.log(`   ID: ${admin.id}`);
  console.log('\n💡 Login at: http://localhost:3002/sign-in');
}

main()
  .catch((e) => {
    console.error('❌ Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
