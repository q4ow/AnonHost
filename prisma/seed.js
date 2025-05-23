const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Cleaning up old test data...');
  
  await prisma.transaction.deleteMany({
    where: {
      type: 'bmc',
      transactionId: {
        startsWith: 'BMC_TEST_'
      }
    }
  });

  console.log('Creating test user...');
  const user = await prisma.user.upsert({
    where: { email: 'keiran0@proton.me' },
    update: {
      premium: false
    },
    create: {
      email: 'keiran0@proton.me',
      name: 'Keiran',
      premium: false
    }
  });

  console.log('Creating test transaction...');
  const transactionId = `BMC_TEST_${Date.now()}`;
  const transaction = await prisma.transaction.create({
    data: {
      transactionId,
      userId: user.id,
      amount: 5.00,
      currency: 'USD',
      type: 'bmc',
      createdAt: new Date()
    }
  });

  console.log('Seed results:', { 
    user: { id: user.id, email: user.email, premium: user.premium },
    transaction: { id: transaction.id, transactionId: transaction.transactionId }
  });
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  });