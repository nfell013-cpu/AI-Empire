import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@aiempire.com';
  const adminPassword = '98JhvWGkvXcmnHcrl_Ebfw';
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: 'admin',
      tokens: 100000,
      password: hashedPassword,
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      tokens: 100000,
    },
  });

  console.log('\n✅ Admin user seeded successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Email:    ${adminEmail}`);
  console.log(`  Role:     ${admin.role}`);
  console.log(`  Tokens:   ${admin.tokens.toLocaleString()}`);
  console.log(`  ID:       ${admin.id}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
