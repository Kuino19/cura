// scripts/test-db.ts
import prisma from '../src/lib/prisma'

async function main() {
    console.log('Testing DB connection...')
    try {
        const userCount = await prisma.user.count()
        console.log('User count:', userCount)
        console.log('Connection successful!')
    } catch (e) {
        console.error('Connection failed:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
