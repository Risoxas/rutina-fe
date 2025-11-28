import { PrismaClient } from './src/generated/client/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const email = 'davidag93@gmail.com';
  const password = 'password123';

  console.log(`Testing login for: ${email}`);
  console.log(`Env ALLOWED_EMAILS: ${process.env.ALLOWED_EMAILS}`);

  // 1. Check Whitelist
  const allowedEmails = process.env.ALLOWED_EMAILS?.split(',') || [];
  if (allowedEmails.length > 0 && !allowedEmails.includes(email)) {
    console.error('FAIL: Email not in whitelist.');
    return;
  } else {
    console.log('PASS: Whitelist check.');
  }

  // 2. Fetch User
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error('FAIL: User not found in DB.');
    return;
  }
  console.log('PASS: User found.');
  console.log(`Stored Hash: ${user.password}`);

  // 3. Check Password
  if (!user.password) {
    console.error('FAIL: User has no password set.');
    return;
  }

  const match = await bcrypt.compare(password, user.password);
  if (match) {
    console.log('SUCCESS: Password matches!');
  } else {
    console.error('FAIL: Password does NOT match.');
    
    // Debug: Hash the password again to see what it should be
    const newHash = await bcrypt.hash(password, 10);
    console.log(`Expected Hash (approx): ${newHash}`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
