import { and, asc, desc, eq } from "drizzle-orm";
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

export type TrainingSessionDetail = {
  session: {
    sessionId: string;
    status: string;
    finalScore: number | null;
    grade: string | null;
    endingType: string | null;
    startedAt: Date;
    completedAt: Date | null;
    createdAt: Date;
  };
  level: {
    levelKey: string;
    sceneName: string;
    characterType: string;
    background: string;
    taskTarget: string;
    trainingFocus: string[];
  };
  turns: Array<{
    roundNumber: number;
    userRawInput: string;
    girlfriendResponse: string;
    emotionBefore: number;
    emotionChange: number;
    emotionAfter: number;
    trustBefore: number;
    trustChange: number;
    trustAfter: number;
    riskFlags: string[];
    skillScores: Record<string, number> | null;
    roundFeedback: string | null;
    inputStatus: string;
    aiFallbackUsed: boolean;
    aiErrorType: string | null;
  }>;
  scoreResult: null | {
    totalScore: number;
    grade: string;
    endingType: string;
    emotionRecognition: number;
    empathy: number;
    responsibility: number;
    explanationControl: number;
    actionClarity: number;
    relationshipRepair: number;
    summary: string;
    keyProblems: string[];
    betterReply: string | null;
    lesson: string | null;
    aiFallbackUsed: boolean;
    aiErrorType: string | null;
  };
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

export async function getTrainingSessionDetailForUser(
  userId: string,
  sessionId: string,
): Promise<TrainingSessionDetail | null> {
  const db = getDb();
  const [sessionRecord] = await db
    .select({
      sessionId: trainingSessions.id,
      status: trainingSessions.status,
      finalScore: trainingSessions.finalScore,
      grade: trainingSessions.grade,
      endingType: trainingSessions.endingType,
      startedAt: trainingSessions.startedAt,
      completedAt: trainingSessions.completedAt,
      createdAt: trainingSessions.createdAt,
      levelKey: levels.levelKey,
      sceneName: levels.sceneName,
      characterType: levels.characterType,
      background: levels.background,
      taskTarget: levels.taskTarget,
      trainingFocus: levels.trainingFocus,
      totalScore: scoreResults.totalScore,
      scoreGrade: scoreResults.grade,
      scoreEndingType: scoreResults.endingType,
      emotionRecognition: scoreResults.emotionRecognition,
      empathy: scoreResults.empathy,
      responsibility: scoreResults.responsibility,
      explanationControl: scoreResults.explanationControl,
      actionClarity: scoreResults.actionClarity,
      relationshipRepair: scoreResults.relationshipRepair,
      summary: scoreResults.summary,
      keyProblems: scoreResults.keyProblems,
      betterReply: scoreResults.betterReply,
      lesson: scoreResults.lesson,
      scoreAiFallbackUsed: scoreResults.aiFallbackUsed,
      scoreAiErrorType: scoreResults.aiErrorType,
    })
    .from(trainingSessions)
    .innerJoin(levels, eq(trainingSessions.levelId, levels.id))
    .leftJoin(scoreResults, eq(scoreResults.sessionId, trainingSessions.id))
    .where(and(eq(trainingSessions.userId, userId), eq(trainingSessions.id, sessionId)))
    .limit(1);

  if (!sessionRecord) {
    return null;
  }

  const turns = await db
    .select({
      roundNumber: dialogueTurns.roundNumber,
      userRawInput: dialogueTurns.userRawInput,
      girlfriendResponse: dialogueTurns.girlfriendResponse,
      emotionBefore: dialogueTurns.emotionBefore,
      emotionChange: dialogueTurns.emotionChange,
      emotionAfter: dialogueTurns.emotionAfter,
      trustBefore: dialogueTurns.trustBefore,
      trustChange: dialogueTurns.trustChange,
      trustAfter: dialogueTurns.trustAfter,
      riskFlags: dialogueTurns.riskFlags,
      skillScores: dialogueTurns.skillScores,
      roundFeedback: dialogueTurns.roundFeedback,
      inputStatus: dialogueTurns.inputStatus,
      aiFallbackUsed: dialogueTurns.aiFallbackUsed,
      aiErrorType: dialogueTurns.aiErrorType,
    })
    .from(dialogueTurns)
    .where(eq(dialogueTurns.sessionId, sessionId))
    .orderBy(asc(dialogueTurns.roundNumber));

  return {
    session: {
      sessionId: sessionRecord.sessionId,
      status: sessionRecord.status,
      finalScore: sessionRecord.finalScore,
      grade: sessionRecord.grade,
      endingType: sessionRecord.endingType,
      startedAt: sessionRecord.startedAt,
      completedAt: sessionRecord.completedAt,
      createdAt: sessionRecord.createdAt,
    },
    level: {
      levelKey: sessionRecord.levelKey,
      sceneName: sessionRecord.sceneName,
      characterType: sessionRecord.characterType,
      background: sessionRecord.background,
      taskTarget: sessionRecord.taskTarget,
      trainingFocus: sessionRecord.trainingFocus,
    },
    turns: turns.map((turn) => ({
      roundNumber: turn.roundNumber,
      userRawInput: turn.userRawInput,
      girlfriendResponse: turn.girlfriendResponse,
      emotionBefore: turn.emotionBefore,
      emotionChange: turn.emotionChange,
      emotionAfter: turn.emotionAfter,
      trustBefore: turn.trustBefore,
      trustChange: turn.trustChange,
      trustAfter: turn.trustAfter,
      riskFlags: turn.riskFlags,
      skillScores: turn.skillScores,
      roundFeedback: turn.roundFeedback,
      inputStatus: turn.inputStatus,
      aiFallbackUsed: turn.aiFallbackUsed,
      aiErrorType: turn.aiErrorType,
    })),
    scoreResult:
      sessionRecord.totalScore === null
        ? null
        : {
            totalScore: sessionRecord.totalScore,
            grade: sessionRecord.scoreGrade!,
            endingType: sessionRecord.scoreEndingType!,
            emotionRecognition: sessionRecord.emotionRecognition!,
            empathy: sessionRecord.empathy!,
            responsibility: sessionRecord.responsibility!,
            explanationControl: sessionRecord.explanationControl!,
            actionClarity: sessionRecord.actionClarity!,
            relationshipRepair: sessionRecord.relationshipRepair!,
            summary: sessionRecord.summary!,
            keyProblems: sessionRecord.keyProblems ?? [],
            betterReply: sessionRecord.betterReply,
            lesson: sessionRecord.lesson,
            aiFallbackUsed: sessionRecord.scoreAiFallbackUsed!,
            aiErrorType: sessionRecord.scoreAiErrorType,
          },
  };
}
