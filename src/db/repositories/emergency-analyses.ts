import { and, desc, eq, isNull } from "drizzle-orm";
import { getDb } from "@/db";
import { emergencyAnalyses } from "@/db/schema";
import type { SaveEmergencyAnalysisPayload } from "@/schemas/emergency-analysis";

export type SaveEmergencyAnalysisResult = {
  status: "created";
  analysisId: string;
};

export type EmergencyHistoryItem = {
  analysisId: string;
  userInput: string;
  emotionAnalysis: string;
  hiddenNeed: string | null;
  suggestedReply: string | null;
  matchedCharacterType: string | null;
  convertedToTraining: boolean;
  createdAt: Date;
};

export async function saveEmergencyAnalysisForUser(
  userId: string,
  payload: SaveEmergencyAnalysisPayload,
): Promise<SaveEmergencyAnalysisResult> {
  const db = getDb();
  const [record] = await db
    .insert(emergencyAnalyses)
    .values({
      userId,
      userInput: payload.userInput,
      emotionAnalysis: payload.analysis.detectedEmotion,
      hiddenNeed: payload.analysis.hiddenNeed,
      riskWarnings: payload.analysis.riskWarnings,
      replyStrategy: payload.analysis.replyStrategy,
      suggestedReply: payload.analysis.suggestedReply,
      doNotSay: payload.analysis.doNotSay,
      matchedCharacterType: payload.analysis.matchedCharacterType ?? null,
      userConsentedToSave: true,
      convertedToTraining: payload.analysis.canBeConvertedToTraining,
    })
    .returning({
      analysisId: emergencyAnalyses.id,
    });

  return {
    status: "created",
    analysisId: record.analysisId,
  };
}

export async function getEmergencyHistoryForUser(userId: string): Promise<EmergencyHistoryItem[]> {
  const db = getDb();
  const records = await db
    .select({
      analysisId: emergencyAnalyses.id,
      userInput: emergencyAnalyses.userInput,
      emotionAnalysis: emergencyAnalyses.emotionAnalysis,
      hiddenNeed: emergencyAnalyses.hiddenNeed,
      suggestedReply: emergencyAnalyses.suggestedReply,
      matchedCharacterType: emergencyAnalyses.matchedCharacterType,
      convertedToTraining: emergencyAnalyses.convertedToTraining,
      createdAt: emergencyAnalyses.createdAt,
    })
    .from(emergencyAnalyses)
    .where(and(eq(emergencyAnalyses.userId, userId), isNull(emergencyAnalyses.deletedAt)))
    .orderBy(desc(emergencyAnalyses.createdAt));

  return records.map((record) => ({
    analysisId: record.analysisId,
    userInput: record.userInput,
    emotionAnalysis: record.emotionAnalysis,
    hiddenNeed: record.hiddenNeed,
    suggestedReply: record.suggestedReply,
    matchedCharacterType: record.matchedCharacterType,
    convertedToTraining: record.convertedToTraining,
    createdAt: record.createdAt,
  }));
}
