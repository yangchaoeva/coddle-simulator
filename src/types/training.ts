import type { CharacterType } from "@/types/character";

export type RoundRecord = {
  roundNumber: number;
  userReply: string;
  girlfriendReply: string;
  emotionBefore: number;
  emotionAfter: number;
  trustBefore: number;
  trustAfter: number;
  roundFeedback: string;
  riskFlags: string[];
  scoreDelta: number;
};

export type FinalReview = {
  totalScore: number;
  grade: string;
  endingType: string;
  summary: string;
  keyProblems: string[];
  betterReply: string;
  lesson: string;
  emotionRecognition: number;
  empathy: number;
  responsibility: number;
  explanationControl: number;
  actionClarity: number;
  relationshipRepair: number;
};

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

export type EmergencyAnalysis = {
  emotion: string;
  hiddenNeed: string;
  riskWarnings: string[];
  replyStrategy: string;
  suggestedReply: string;
  doNotSay: string[];
};
