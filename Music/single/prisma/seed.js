const { PrismaClient } = require('@prisma/client')

async function main() {
  // Dynamic import for ESM packages
  const adapterModule = await import('@prisma/adapter-libsql')
  const PrismaLibSQL = adapterModule.PrismaLibSQL || adapterModule.default
  const { createClient } = await import('@libsql/client')

  // dotenv flow
  require('dotenv').config()

  const connectionString = process.env.TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN

  if (!connectionString || !authToken) {
    console.error('Missing Turso credentials')
    process.exit(1)
  }

  console.log('Seeding database via Node.js (Dynamic Import)...')

  const libsql = createClient({
    url: connectionString,
    authToken: authToken,
  })
  const adapter = new PrismaLibSQL(libsql)
  const prisma = new PrismaClient({ adapter })

  try {
    const questions = [
      { text: "Are you an Introvert or Extrovert?", type: "Introvert/Extrovert" },
      { text: "Are you a Morning Person or Night Owl?", type: "Morning/Night" },
      { text: "Are you a Spender or Saver?", type: "Spender/Saver" },
      { text: "Are you a Planner or Spontaneous?", type: "Planner/Spontaneous" },
      { text: "Do you prefer Indoors or Outdoors?", type: "Indoor/Outdoor" },
    ]

    console.log('Upserting questions...')
    for (const q of questions) {
      const existing = await prisma.question.findFirst({ where: { text: q.text } })
      if (!existing) {
        await prisma.question.create({ data: q })
      }
    }

    // Create some dummy users
    const users = [
      { email: "alice@example.com", name: "Alice", gender: "Female" },
      { email: "bob@example.com", name: "Bob", gender: "Male" },
      { email: "charlie@example.com", name: "Charlie", gender: "Non-binary" },
    ]

    console.log('Upserting users...')
    for (const u of users) {
      await prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: u,
      })
    }

    console.log('Seeding completed.')
  } catch (e) {
    console.error(e)
    throw e
  } finally {
    await prisma.$disconnect()
  }
}

main()
