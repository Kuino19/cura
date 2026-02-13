import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const prismaClientSingleton = () => {
    // Hardcoded for debugging
    const connectionString = "libsql://single-kuino19.aws-us-west-2.turso.io"
    const authToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzA5MzQ2MzMsImlkIjoiNGM4MTkyZjQtNGVhNS00MWE3LWEwYjUtYjkxNzY0ZGZhY2U0IiwicmlkIjoiYmU4Y2MxYzUtMGEzZS00MDEwLWIzMzgtZDZhNzdiNDFmOGEzIn0.kV44N2J3d8ny7W2me0lmHnYtM6loe2MiHxL3k0YsuFTcis3gwrbphH5hM2xXrqmi3UrC_CbF4wWEiB45QxlFCA"


    console.log('Using DB URL:', connectionString ? 'Found' : 'Missing')
    console.log('Using Auth Token:', authToken ? 'Found' : 'Missing')


    // Fallback for local development if Turso vars aren't present (optional, but good for safety)
    // For now, we assume if we are running this, we want Turso or a local db file pretending to be Turso?
    // Actually, for simplicity, let's strictly check or fallback to standard.
    // But since we enabled driverAdapters, we should use it.

    // If no Turso URL, we might want to fail or use a local file with standard sqlite?
    // Standard sqlite doesn't need the adapter.
    // Let's support both: if TURSO_DATABASE_URL is present, use adapter; else use standard.

    if (connectionString && connectionString.includes('libsql://')) {
        const libsql = createClient({
            url: connectionString,
            authToken: authToken,
        })
        const adapter = new PrismaLibSql(libsql as any)
        return new PrismaClient({ adapter })
    } else {
        return new PrismaClient()
    }
}

declare global {
    var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
