import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { handle: 'demo' },
    update: {},
    create: {
      email: 'demo@crunevo.local',
      handle: 'demo',
      Credential: {
        create: {
          provider: 'local',
          providerId: 'demo',
        },
      },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
