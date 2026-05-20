import type {
  EmergencyAnalysisResult,
  FinalReviewResult,
  GirlfriendReplyResult,
  InputValidationResult,
  RoundScoreResult,
} from "@/ai/schemas";
import type { CharacterConfig } from "@/types/character";
import type { LevelSeed } from "@/types/level";

export type ProviderHistoryItem = {
  roundNumber: number;
  userReply: string;
  girlfriendReply: string;
  roundFeedback: string;
  emotionAfter: number;
  trustAfter: number;
  skillScores?: {
    emotionRecognition: number;
    empathy: number;
    responsibility: number;
    explanationControl: number;
    actionClarity: number;
    relationshipRepair: number;
  };
  riskFlags?: string[];
};

export type ValidateUserInputParams = {
  level: LevelSeed;
  character: CharacterConfig;
  roundNumber: number;
  history: ProviderHistoryItem[];
  userInput: string;
  emotionScore: number;
  trustScore: number;
};

export type GirlfriendReplyParams = {
  level: LevelSeed;
  character: CharacterConfig;
  roundNumber: number;
  history: ProviderHistoryItem[];
  userInput: string;
  emotionScore: number;
  trustScore: number;
};

export type RoundScoreParams = {
  level: LevelSeed;
  character: CharacterConfig;
  roundNumber: number;
  history: ProviderHistoryItem[];
  userInput: string;
  girlfriendReply: GirlfriendReplyResult;
  emotionScore: number;
  trustScore: number;
};

export type FinalReviewParams = {
  level: LevelSeed;
  character: CharacterConfig;
  history: ProviderHistoryItem[];
  finalEmotionScore: number;
  finalTrustScore: number;
};

export type EmergencyAnalysisParams = {
  message: string;
};

export interface AIProvider {
  validateUserInput(input: ValidateUserInputParams): Promise<InputValidationResult>;
  generateGirlfriendReply(input: GirlfriendReplyParams): Promise<GirlfriendReplyResult>;
  scoreRound(input: RoundScoreParams): Promise<RoundScoreResult>;
  generateFinalReview(input: FinalReviewParams): Promise<FinalReviewResult>;
  analyzeEmergencyMessage(input: EmergencyAnalysisParams): Promise<EmergencyAnalysisResult>;
}
