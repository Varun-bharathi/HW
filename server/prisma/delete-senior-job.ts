import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const jobs = await prisma.job.findMany({
        where: {
            title: {
                contains: 'Senior'
            }
        }
    })

    if (jobs.length === 0) {
        console.log('No "Senior" jobs found.')
        return
    }

    console.log(`Found ${jobs.length} jobs to delete:`)
    for (const job of jobs) {
        console.log(`- ${job.title} (${job.id})`)
    }

    const { count } = await prisma.job.deleteMany({
        where: {
            title: {
                contains: 'Senior'
            }
        }
    })

    console.log(`Deleted ${count} jobs.`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
