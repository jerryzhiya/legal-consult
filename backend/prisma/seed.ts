import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set.');
    return;
  }

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log('Admin user already exists in the database.');
      return;
    }

    // Hash the password securely
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create the Admin user using your schema's correct field name (passwordHash)
    const admin = await prisma.user.create({
      data: {
        fullName: 'Administrator',
        email: adminEmail,
        passwordHash: hashedPassword, 
        role: 'ADMIN',
      },
    });

    console.log(`Successfully seeded Admin user: ${admin.email}`);
  } catch (error) {
    console.error('Error seeding admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();