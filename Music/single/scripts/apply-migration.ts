import { createClient } from '@libsql/client'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

async function main() {
    const url = process.env.TURSO_DATABASE_URL
    const authToken = process.env.TURSO_AUTH_TOKEN

    if (!url || !authToken) {
        console.error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN')
        process.exit(1)
    }

    const client = createClient({
        url,
        authToken,
    })

    try {
        const sqlPath = path.join(__dirname, '..', 'migration.sql')
        const sql = fs.readFileSync(sqlPath, 'utf8')

        // Split statements (simple split by semicolon, beware of sophisticated SQL)
        // For Prisma generated SQLite migrations, splitting by `;` is usually okay-ish 
        // but better to execute as a transaction or batch if possible.
        // LibSQL client `executeMultiple` is what we want.

        console.log('Applying migration to Turso...')
        await client.executeMultiple(sql)
        console.log('Migration applied successfully!')

    } catch (e) {
        console.error('Error applying migration:', e)
    } finally {
        client.close()
    }
}

main()
