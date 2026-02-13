
import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config();

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
    console.error("Missing TURSO_DATABASE_URL");
    process.exit(1);
}

const turso = createClient({
    url,
    authToken,
});

async function main() {
    try {
        console.log("Checking Question count...");
        const result = await turso.execute("SELECT COUNT(*) as count FROM Question");
        console.log("Question Count:", result.rows[0].count);

        console.log("Checking User count...");
        const users = await turso.execute("SELECT COUNT(*) as count FROM User");
        console.log("User Count:", users.rows[0].count);
    } catch (e) {
        console.error("Error querying DB:", e);
    }
}

main();
