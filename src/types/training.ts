import type {
  EmergencyAnalysisResult,
  FinalReviewResult,
  GirlfriendReplyResult,
  InputValidationResult,
  RoundScoreResult,
} from "@/ai/schemas";
import type { CharacterType } from "@/types/character";

export type RoundRecord = {
  roundNumber: number;
  userReply: string;
  validation: InputValidationResult;
  girlfriendReply: GirlfriendReplyResult;
  score: RoundScoreResult;
  emotionBefore: number;
  emotionAfter: number;
  trustBefore: number;
  trustAfter: number;
};

export type FinalReview = FinalReviewResult;
export type EmergencyAnalysis = EmergencyAnalysisResult;

export type TrainingResult = {
  id: string;
  levelKey: string;
  characterType: CharacterType;
  characterName: string;
  levelName: string;
  taskTarget: string;
  createdAt: string;
  emotionStart: number;
  emotionEnd: number;
  trustStart: number;
  trustEnd: number;
  rounds: RoundRecord[];
  finalReview: FinalReview;
};

export type TrainingRoundBlocked = {
  status: "blocked";
  validation: InputValidationResult;
};

export type TrainingRoundCompleted = {
  status: "completed";
  record: RoundRecord;
  finalReview?: FinalReview;
};

export type TrainingRoundOutcome = TrainingRoundBlocked | TrainingRoundCompleted;
