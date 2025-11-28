import { getDashboardData } from './src/app/actions';
import { Role } from './src/generated/client/enums';
import { PrismaClient } from './src/generated/client/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'davidag93@gmail.com';
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.log('User not found');
    return;
  }

  console.log(`Fetching dashboard data for ${user.email} (${user.id}) as TRAINEE`);
  const data = await getDashboardData(user.id, Role.TRAINEE);
  console.log('Data:', JSON.stringify(data, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
