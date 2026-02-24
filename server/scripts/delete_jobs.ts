import { prisma } from '../src/lib/prisma.js';

async function main() {
    await prisma.job.deleteMany({});
    console.log('All jobs deleted successfully.');
}

main()
    .then(() => prisma.$disconnect())
    .catch((e) => {
        console.error(e);
        prisma.$disconnect();
        process.exit(1);
    });
