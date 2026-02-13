import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config();

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
    console.error("TURSO_DATABASE_URL is missing");
    process.exit(1);
}

const client = createClient({
    url,
    authToken,
});

async function main() {
    console.log("Seeding database...");

    const questions = [
        // --- BASIC / AGE --- 
        { text: "Age", type: "Age", category: "basic" },

        // --- APPEARANCE ---
        { text: "Height", type: "Height", category: "appearance" },
        { text: "Complexion", type: "Complexion", category: "appearance" },
        { text: "Body Type", type: "BodyType", category: "appearance" },
        { text: "Style Vibe", type: "Style", category: "appearance" },

        // --- PERSONALITY / LIFESTYLE (The 'Likes') ---
        { text: "Morning Person or Night Owl?", type: "Morning/Night", category: "personality" },
        { text: "Weekends?", type: "Indoor/Outdoor", category: "personality" },
        { text: "Social Battery?", type: "Introvert/Extrovert", category: "personality" },
        { text: "Decisions?", type: "Logic/Emotion", category: "personality" },
        { text: "Money?", type: "Spender/Saver", category: "personality" },
        { text: "Love Language?", type: "Touch/Time", category: "personality" },
        { text: "Planning?", type: "Planner/Spontaneous", category: "personality" },
        { text: "Communication?", type: "Text/Call", category: "personality" },
    ];

    console.log('Inserting questions...');

    // Clear existing
    await client.execute("DELETE FROM Answer");
    await client.execute("DELETE FROM Question");

    for (const q of questions) {
        await client.execute({
            sql: "INSERT INTO Question (id, text, type, category) VALUES (?, ?, ?, ?)",
            args: [randomUUID(), q.text, q.type, q.category]
        });
    }


    console.log("Seeding complete. Inserted " + questions.length + " questions.");
}

main().catch(console.error);
