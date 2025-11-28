import { PrismaClient } from './src/generated/client/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('Users found:', users.length);
  users.forEach(u => {
    console.log(`User: ${u.email}, Roles: ${JSON.stringify(u.roles)}, HasPassword: ${!!u.password}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
