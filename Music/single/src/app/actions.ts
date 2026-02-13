'use server'

import { turso } from '@/lib/db'
import { calculateCompatibility } from '@/lib/matching'
import { randomUUID } from 'crypto'

export type UserSubmission = {
    name: string
    phoneNumber: string
    gender: string
    answers: {
        questionId: string
        myAttribute: string
        desiredAttribute: string
        importance: string
    }[]
}

export async function submitQuestionnaire(data: UserSubmission) {
    try {
        // 1. Create or Update User
        const userId = randomUUID();

        // Check if user exists
        const userResult = await turso.execute({
            sql: "SELECT id FROM User WHERE phoneNumber = ?",
            args: [data.phoneNumber]
        });

        let finalUserId = userResult.rows.length > 0 ? userResult.rows[0].id as string : userId;

        if (userResult.rows.length > 0) {
            // Update
            await turso.execute({
                sql: "UPDATE User SET name = ?, gender = ?, updatedAt = CURRENT_TIMESTAMP WHERE phoneNumber = ?",
                args: [data.name, data.gender, data.phoneNumber]
            });
        } else {
            // Insert
            await turso.execute({
                sql: "INSERT INTO User (id, phoneNumber, name, gender, createdAt, updatedAt) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
                args: [finalUserId, data.phoneNumber, data.name, data.gender]
            });
        }

        // 2. Save Answers
        // Clear previous answers
        await turso.execute({
            sql: "DELETE FROM Answer WHERE userId = ?",
            args: [finalUserId]
        });

        for (const ans of data.answers) {
            await turso.execute({
                sql: "INSERT INTO Answer (id, userId, questionId, myAttribute, desiredAttribute, importance) VALUES (?, ?, ?, ?, ?, ?)",
                args: [randomUUID(), finalUserId, ans.questionId, ans.myAttribute, ans.desiredAttribute, ans.importance]
            });
        }

        return { success: true, userId: finalUserId }
    } catch (error) {
        console.error('Error submitting questionnaire:', error)
        return { success: false, error: 'Failed to save data' }
    }
}

export async function getQuestions() {
    const result = await turso.execute("SELECT * FROM Question");
    // Map to expected shape
    return result.rows.map(row => ({
        id: row.id as string,
        text: row.text as string,
        type: row.type as string,
        category: row.category as string
    }));
}

export async function getMatches(phoneNumber: string) {
    // 1. Find the user
    const userRes = await turso.execute({
        sql: "SELECT * FROM User WHERE phoneNumber = ?",
        args: [phoneNumber]
    });

    if (userRes.rows.length === 0) return null;
    const currentUser = userRes.rows[0] as any;

    // Fetch answers for current user
    const currentAnswersRes = await turso.execute({
        sql: "SELECT * FROM Answer WHERE userId = ?",
        args: [currentUser.id]
    });
    currentUser.answers = currentAnswersRes.rows;

    // 2. Find all other users
    const candidatesRes = await turso.execute({
        sql: "SELECT * FROM User WHERE id != ?",
        args: [currentUser.id]
    });

    const candidates = [];
    for (const row of candidatesRes.rows) {
        const candidateFn = async () => {
            const answersRes = await turso.execute({
                sql: "SELECT * FROM Answer WHERE userId = ?",
                args: [row.id]
            });
            return {
                ...row,
                answers: answersRes.rows
            }
        }
        candidates.push(await candidateFn());
    }

    // 3. Calculate scores
    const matches = candidates.map((candidate: any) => {
        const score = calculateCompatibility(currentUser, candidate)
        return {
            user: candidate,
            score
        }
    })

    // 4. Sort by score
    matches.sort((a, b) => b.score - a.score)

    return matches
}

export async function getAdminStats() {
    // Total Users
    const totalUsersRes = await turso.execute("SELECT COUNT(*) as count FROM User");
    const totalUsers = totalUsersRes.rows[0].count as number;

    // Gender Breakdown
    const genderRes = await turso.execute("SELECT gender, COUNT(*) as count FROM User GROUP BY gender");
    const genderBreakdown = genderRes.rows.map(r => ({ gender: r.gender, count: r.count }));

    // User Completed (Have answers)
    const completedRes = await turso.execute("SELECT COUNT(DISTINCT userId) as count FROM Answer");
    const completedUsers = completedRes.rows[0].count as number;

    // Total Matches (if cached in Match table - though we compute live mostly, let's count Match entries if any)
    const matchesRes = await turso.execute("SELECT COUNT(*) as count FROM Match");
    const totalMatches = matchesRes.rows[0].count as number;

    return {
        totalUsers,
        genderBreakdown,
        completedUsers,
        totalMatches
    }
}
