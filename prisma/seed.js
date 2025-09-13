const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Load environment variables
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');
  console.log('Database URL:', process.env.DATABASE_URL);

  try {
    // Check if tenants already exist
    const existingAcme = await prisma.tenant.findUnique({
      where: { slug: 'acme' }
    });

    const existingGlobex = await prisma.tenant.findUnique({
      where: { slug: 'globex' }
    });

    // Create tenants if they don't exist - using create instead of upsert
    let acme;
    if (!existingAcme) {
      acme = await prisma.tenant.create({
        data: {
          slug: 'acme',
          name: 'Acme Corporation',
          plan: 'PRO' // ✨ CORRECTED LINE
        }
      });
      console.log('Created Acme tenant');
    } else {
      acme = existingAcme;
      console.log('Acme tenant already exists');
    }

    let globex;
    if (!existingGlobex) {
      globex = await prisma.tenant.create({
        data: {
          slug: 'globex',
          name: 'Globex Corporation',
          plan: 'FREE'
        }
      });
      console.log('Created Globex tenant');
    } else {
      globex = existingGlobex;
      console.log('Globex tenant already exists');
    }

    // Create users with hashed passwords
    const password = await bcrypt.hash('password', 12);

    // Check if users already exist
    const existingUsers = await prisma.user.findMany({
      where: {
        OR: [
          { email: 'admin@acme.test' },
          { email: 'user@acme.test' },
          { email: 'admin@globex.test' },
          { email: 'user@globex.test' }
        ]
      }
    });

    // Create users if they don't exist
    const usersToCreate = [
      {
        email: 'admin@acme.test',
        password,
        role: 'ADMIN',
        tenantId: acme.id
      },
      {
        email: 'user@acme.test',
        password,
        role: 'MEMBER',
        tenantId: acme.id
      },
      {
        email: 'admin@globex.test',
        password,
        role: 'ADMIN',
        tenantId: globex.id
      },
      {
        email: 'user@globex.test',
        password,
        role: 'MEMBER',
        tenantId: globex.id
      }
    ];

    for (const userData of usersToCreate) {
      const existingUser = existingUsers.find(u => u.email === userData.email);
      if (!existingUser) {
        await prisma.user.create({
          data: userData
        });
        console.log(`Created user: ${userData.email}`);
      } else {
        console.log(`User already exists: ${userData.email}`);
      }
    }

    console.log('Users created/verified successfully');

    // Create some sample notes
    const acmeAdminUser = await prisma.user.findUnique({
      where: { email: 'admin@acme.test' }
    });

    if (acmeAdminUser) {
      const existingNote = await prisma.note.findFirst({
        where: {
          title: 'Welcome to Acme',
          tenantId: acme.id
        }
      });

      if (!existingNote) {
        await prisma.note.create({
          data: {
            title: 'Welcome to Acme',
            content: 'This is our first note in the Acme tenant.',
            tenantId: acme.id,
            authorId: acmeAdminUser.id
          }
        });
        console.log('Sample note created for Acme');
      } else {
        console.log('Sample note already exists for Acme');
      }
    }

    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });