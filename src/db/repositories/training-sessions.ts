import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { dialogueTurns, levels, scoreResults, trainingSessions } from "@/db/schema";
import type { SaveTrainingSessionPayload } from "@/schemas/training-session";

export type SaveTrainingSessionResult =
  | { status: "created"; sessionId: string }
  | { status: "completed"; sessionId: string };

export type TrainingHistoryItem = {
  sessionId: string;
  levelKey: string;
  sceneName: string;
  characterType: string;
  totalScore: number;
  grade: string;
  endingType: string;
  completedAt: Date | null;
  createdAt: Date;
};

export async function saveTrainingSessionForUser(
  userId: string,
  payload: SaveTrainingSessionPayload,
): Promise<SaveTrainingSessionResult> {
  const db = getDb();
  const [levelRecord] = await db.select().from(levels).where(eq(levels.levelKey, payload.levelKey)).limit(1);

  if (!levelRecord) {
    throw new Error("LEVEL_NOT_FOUND");
  }

  const [existingSession] = await db
    .select()
    .from(trainingSessions)
    .where(eq(trainingSessions.id, payload.resultId))
    .limit(1);

  if (existingSession && existingSession.userId !== userId) {
    throw new Error("SESSION_OWNERSHIP_CONFLICT");
  }

  if (existingSession && existingSession.levelId !== levelRecord.id) {
    throw new Error("SESSION_LEVEL_CONFLICT");
  }

  if (!existingSession) {
    await db.insert(trainingSessions).values({
      id: payload.resultId,
      userId,
      levelId: levelRecord.id,
      status: "completed",
      finalScore: payload.finalReview.totalScore,
      grade: payload.finalReview.grade,
      endingType: payload.finalReview.endingType,
      completedAt: new Date(),
    });
  }

  const existingTurns = await db
    .select({
      roundNumber: dialogueTurns.roundNumber,
    })
    .from(dialogueTurns)
    .where(eq(dialogueTurns.sessionId, payload.resultId));

  const existingRoundNumbers = new Set(existingTurns.map((turn) => turn.roundNumber));
  const missingTurns = payload.rounds.filter((round) => !existingRoundNumbers.has(round.roundNumber));

  if (missingTurns.length > 0) {
    await db.insert(dialogueTurns).values(
      missingTurns.map((round) => ({
        sessionId: payload.resultId,
        roundNumber: round.roundNumber,
        userRawInput: round.userReply,
        girlfriendResponse: round.girlfriendReply.girlfriendReply,
        emotionBefore: round.emotionBefore,
        emotionChange: round.score.emotionChange,
        emotionAfter: round.emotionAfter,
        trustBefore: round.trustBefore,
        trustChange: round.score.trustChange,
        trustAfter: round.trustAfter,
        riskFlags: round.score.riskFlags,
        skillScores: round.score.skillScores,
        roundFeedback: round.score.roundFeedback,
        inputStatus: round.validation.status,
        aiFallbackUsed: Boolean(round.score.fallback || round.girlfriendReply.fallback),
        aiErrorType: round.score.errorType ?? round.girlfriendReply.errorType ?? null,
      })),
    );
  }

  const [existingScore] = await db
    .select({
      sessionId: scoreResults.sessionId,
    })
    .from(scoreResults)
    .where(eq(scoreResults.sessionId, payload.resultId))
    .limit(1);

  if (!existingScore) {
    await db.insert(scoreResults).values({
      sessionId: payload.resultId,
      totalScore: payload.finalReview.totalScore,
      grade: payload.finalReview.grade,
      endingType: payload.finalReview.endingType,
      emotionRecognition: payload.finalReview.emotionRecognition,
      empathy: payload.finalReview.empathy,
      responsibility: payload.finalReview.responsibility,
      explanationControl: payload.finalReview.explanationControl,
      actionClarity: payload.finalReview.actionClarity,
      relationshipRepair: payload.finalReview.relationshipRepair,
      summary: payload.finalReview.summary,
      keyProblems: payload.finalReview.keyProblems,
      betterReply: payload.finalReview.betterReply,
      lesson: payload.finalReview.lesson,
      aiFallbackUsed: Boolean(payload.finalReview.fallback),
      aiErrorType: payload.finalReview.errorType ?? null,
    });
  }

  return {
    status: existingSession || existingTurns.length > 0 || existingScore ? "completed" : "created",
    sessionId: payload.resultId,
  };
}

export async function getTrainingHistoryForUser(userId: string): Promise<TrainingHistoryItem[]> {
  const db = getDb();
  const records = await db
    .select({
      sessionId: trainingSessions.id,
      levelKey: levels.levelKey,
      sceneName: levels.sceneName,
      characterType: levels.characterType,
      totalScore: scoreResults.totalScore,
      grade: scoreResults.grade,
      endingType: scoreResults.endingType,
      completedAt: trainingSessions.completedAt,
      createdAt: trainingSessions.createdAt,
    })
    .from(trainingSessions)
    .innerJoin(levels, eq(trainingSessions.levelId, levels.id))
    .innerJoin(scoreResults, eq(scoreResults.sessionId, trainingSessions.id))
    .where(eq(trainingSessions.userId, userId))
    .orderBy(desc(trainingSessions.completedAt), desc(trainingSessions.createdAt));

  return records.map((record) => ({
    sessionId: record.sessionId,
    levelKey: record.levelKey,
    sceneName: record.sceneName,
    characterType: record.characterType,
    totalScore: record.totalScore,
    grade: record.grade,
    endingType: record.endingType,
    completedAt: record.completedAt,
    createdAt: record.createdAt,
  }));
}
