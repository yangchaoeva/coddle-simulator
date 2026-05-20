import { z } from "zod";

export const InputStatusEnum = z.enum(["valid", "low_quality", "off_topic", "harmful"]);

export const RelationshipStateEnum = z.enum([
  "tense",
  "softening",
  "willing_to_continue",
  "shutting_down",
  "worsened",
]);

export const FinalGradeEnum = z.enum(["S", "A", "B+", "B", "C", "D"]);

export const EndingTypeEnum = z.enum(["reconciled", "softened", "failed", "worsened"]);

export const CharacterMatchEnum = z.enum([
  "insecure",
  "high_expectation",
  "rational_independent",
  "emotionally_expressive",
  "cold_suppressed",
]);

export const SkillScoresSchema = z.object({
  emotionRecognition: z.number().min(0).max(100),
  empathy: z.number().min(0).max(100),
  responsibility: z.number().min(0).max(100),
  explanationControl: z.number().min(0).max(100),
  actionClarity: z.number().min(0).max(100),
  relationshipRepair: z.number().min(0).max(100),
});

export const InputValidationSchema = z.object({
  status: InputStatusEnum,
  reason: z.string().min(1),
  userMessageToShow: z.string().min(1),
  shouldProceed: z.boolean(),
  suggestedRewrite: z.string().min(1).optional(),
});

export const GirlfriendReplySchema = z.object({
  girlfriendReply: z.string().min(1),
  tone: z.string().min(1),
  relationshipState: RelationshipStateEnum,
  fallback: z.boolean().optional(),
  errorType: z.string().min(1).optional(),
});

export const RoundScoreSchema = z.object({
  emotionChange: z.number().min(-30).max(30),
  trustChange: z.number().min(-30).max(30),
  riskFlags: z.array(z.string()),
  skillScores: SkillScoresSchema,
  roundFeedback: z.string().min(1),
  fallback: z.boolean().optional(),
  errorType: z.string().min(1).optional(),
});

export const FinalReviewSchema = z.object({
  totalScore: z.number().min(0).max(100),
  grade: FinalGradeEnum,
  endingType: EndingTypeEnum,
  emotionRecognition: z.number().min(0).max(100),
  empathy: z.number().min(0).max(100),
  responsibility: z.number().min(0).max(100),
  explanationControl: z.number().min(0).max(100),
  actionClarity: z.number().min(0).max(100),
  relationshipRepair: z.number().min(0).max(100),
  summary: z.string().min(1),
  keyProblems: z.array(z.string()),
  betterReply: z.string().min(1),
  lesson: z.string().min(1),
  fallback: z.boolean().optional(),
  errorType: z.string().min(1).optional(),
});

export const EmergencyAnalysisSchema = z.object({
  detectedEmotion: z.string().min(1),
  hiddenNeed: z.string().min(1),
  riskWarnings: z.array(z.string()),
  replyStrategy: z.string().min(1),
  suggestedReply: z.string().min(1),
  doNotSay: z.array(z.string()),
  canBeConvertedToTraining: z.boolean(),
  matchedCharacterType: CharacterMatchEnum.optional(),
  fallback: z.boolean().optional(),
  errorType: z.string().min(1).optional(),
});

export type InputStatus = z.infer<typeof InputStatusEnum>;
export type RelationshipState = z.infer<typeof RelationshipStateEnum>;
export type FinalGrade = z.infer<typeof FinalGradeEnum>;
export type EndingType = z.infer<typeof EndingTypeEnum>;
export type CharacterMatch = z.infer<typeof CharacterMatchEnum>;
export type SkillScores = z.infer<typeof SkillScoresSchema>;
export type InputValidationResult = z.infer<typeof InputValidationSchema>;
export type GirlfriendReplyResult = z.infer<typeof GirlfriendReplySchema>;
export type RoundScoreResult = z.infer<typeof RoundScoreSchema>;
export type FinalReviewResult = z.infer<typeof FinalReviewSchema>;
export type EmergencyAnalysisResult = z.infer<typeof EmergencyAnalysisSchema>;
