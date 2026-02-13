// import { User, Answer, Match } from '@prisma/client'

// Weight constants for Importance
const IMPORTANCE_WEIGHTS = {
    'Dealbreaker': 10,   // Critical
    'Important': 5,      // Significant
    'Irrelevant': 0,     // Doesn't matter
}

type UserWithAnswers = {
    id: string;
    answers: {
        questionId: string;
        desiredAttribute: string;
        myAttribute: string;
        importance: string;
    }[]
}

export function calculateCompatibility(userA: UserWithAnswers, userB: UserWithAnswers): number {
    let totalScore = 0
    let totalMaxScore = 0

    // We need to compare A's desires against B's attributes, AND B's desires against A's attributes.
    // Compatibility is a two-way street.

    // 1. Check A's preferences for B
    const scoreA = calculateOneWayScore(userA, userB)
    if (scoreA === -1) return 0 // Dealbreaker hit

    // 2. Check B's preferences for A
    const scoreB = calculateOneWayScore(userB, userA)
    if (scoreB === -1) return 0 // Dealbreaker hit

    // Average the two scores
    return (scoreA + scoreB) / 2
}

function calculateOneWayScore(judge: UserWithAnswers, candidate: UserWithAnswers): number {
    let score = 0
    let maxScore = 0

    for (const judgeAnswer of judge.answers) {
        const importance = judgeAnswer.importance as keyof typeof IMPORTANCE_WEIGHTS
        const weight = IMPORTANCE_WEIGHTS[importance]

        if (weight === 0) continue // Skip irrelevant traits

        // Find candidate's answer to the same question to see their "My Attribute"
        const candidateAnswer = candidate.answers.find(a => a.questionId === judgeAnswer.questionId)

        if (!candidateAnswer) {
            // Candidate hasn't answered this question. Skip or penalize? 
            // For now, skip to avoid punishing for missing data, or assume mismatch.
            // Let's skip, but this reduces confidence.
            continue
        }

        // Judge wants 'desiredAttribute'. Candidate is 'myAttribute'.
        const isMatch = judgeAnswer.desiredAttribute === candidateAnswer.myAttribute

        if (isMatch) {
            score += weight
        } else {
            // Mismatch
            if (importance === 'Dealbreaker') {
                return -1 // Immediate fail
            }
            // If just important, they get 0 points for this weight.
        }

        maxScore += weight
    }

    if (maxScore === 0) return 100 // No preferences? Perfect match I guess?

    return (score / maxScore) * 100
}
