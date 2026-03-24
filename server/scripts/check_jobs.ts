import { prisma } from '../src/lib/prisma.js';
async function run() {
  const c = await prisma.job.count();
  console.log('JOBS COUNT: ' + c);
}
run().then(() => prisma.$disconnect());
