import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({
  log: ['error'],
  errorFormat: 'pretty',
});

prisma.$on('beforeExit', async () => {
  console.log('Exiting prisma...');
  await prisma.message.create({
    data: {
      message: 'Shutting down server',
    },
  });
});

export default prisma;
