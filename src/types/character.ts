export type CharacterType =
  | "insecure"
  | "high_expectation"
  | "rational_independent"
  | "emotionally_expressive"
  | "cold_suppressed";

export type CharacterConfig = {
  characterId: string;
  characterType: CharacterType;
  characterName: string;
  relationshipStage: string;
  personalityKeywords: string[];
  coreNeed: string;
  emotionalTriggers: string[];
  expressionStyle: string[];
  dangerZones: string[];
  forbiddenBehaviors: string[];
  comfortMechanism: string;
  languageExamples: string[];
  consistencyRules: string[];
};
