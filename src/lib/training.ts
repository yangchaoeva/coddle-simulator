import type { ProviderHistoryItem } from "@/ai/provider";
import type {
  EmergencyAnalysisResult,
  FinalReviewResult,
  GirlfriendReplyResult,
  InputValidationResult,
  RoundScoreResult,
} from "@/ai/schemas";
import { characters } from "@/config/characters";
import { levelSeeds } from "@/data/levels";
import type { CharacterConfig, CharacterType } from "@/types/character";
import type { LevelSeed } from "@/types/level";
import type { EmergencyAnalysis, FinalReview, RoundRecord, TrainingResult, TrainingRoundOutcome } from "@/types/training";

export function getCharacters(): CharacterConfig[] {
  return characters;
}

export function getCharacterByType(characterType: string): CharacterConfig | null {
  return characters.find((item) => item.characterType === characterType) ?? null;
}

export function getLevelsByCharacter(characterType: string): LevelSeed[] {
  return levelSeeds.filter((item) => item.characterType === characterType);
}

export function getLevelByKey(levelKey: string): LevelSeed | null {
  return levelSeeds.find((item) => item.levelKey === levelKey) ?? null;
}

export function getCharacterOverview(character: CharacterConfig) {
  return {
    type: character.characterType,
    title: character.characterName,
    summary: `${character.personalityKeywords.slice(0, 3).join(" / ")} 路 ${character.coreNeed}`,
    trainingFocus: character.comfortMechanism,
    dangerZone: character.dangerZones.join(" 路 "),
    keywords: character.personalityKeywords,
  };
}

export function generateResultId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `result-${Date.now()}`;
}

async function callAIEndpoint<T>(action: string, payload: unknown): Promise<T> {
  const response = await fetch(`/api/ai/${action}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`AI endpoint failed: ${action}`);
  }

  return (await response.json()) as T;
}

function toProviderHistory(rounds: RoundRecord[]): ProviderHistoryItem[] {
  return rounds.map((round) => ({
    roundNumber: round.roundNumber,
    userReply: round.userReply,
    girlfriendReply: round.girlfriendReply.girlfriendReply,
    roundFeedback: round.score.roundFeedback,
    emotionAfter: round.emotionAfter,
    trustAfter: round.trustAfter,
    skillScores: round.score.skillScores,
    riskFlags: round.score.riskFlags,
  }));
}

export async function runTrainingRound(args: {
  roundNumber: number;
  userReply: string;
  emotionBefore: number;
  trustBefore: number;
  level: LevelSeed;
  character: CharacterConfig;
  rounds: RoundRecord[];
  onStageChange?: (stage: "validate" | "girlfriend-reply" | "score-round") => void;
}): Promise<TrainingRoundOutcome> {
  const history = toProviderHistory(args.rounds);
  args.onStageChange?.("validate");
  const validation = await callAIEndpoint<InputValidationResult>("validate", {
    level: args.level,
    character: args.character,
    roundNumber: args.roundNumber,
    history,
    userInput: args.userReply,
    emotionScore: args.emotionBefore,
    trustScore: args.trustBefore,
  });

  if (!validation.shouldProceed && (validation.status === "off_topic" || validation.status === "harmful")) {
    return {
      status: "blocked",
      validation,
    };
  }

  args.onStageChange?.("girlfriend-reply");
  const girlfriendReply = await callAIEndpoint<GirlfriendReplyResult>("girlfriend-reply", {
    level: args.level,
    character: args.character,
    roundNumber: args.roundNumber,
    history,
    userInput: args.userReply,
    emotionScore: args.emotionBefore,
    trustScore: args.trustBefore,
  });

  args.onStageChange?.("score-round");
  const score = await callAIEndpoint<RoundScoreResult>("score-round", {
    level: args.level,
    character: args.character,
    roundNumber: args.roundNumber,
    history,
    userInput: args.userReply,
    girlfriendReply,
    emotionScore: args.emotionBefore,
    trustScore: args.trustBefore,
  });

  const emotionAfter = Math.max(-100, Math.min(100, args.emotionBefore + score.emotionChange));
  const trustAfter = Math.max(0, Math.min(100, args.trustBefore + score.trustChange));

  return {
    status: "completed",
    record: {
      roundNumber: args.roundNumber,
      userReply: args.userReply,
      validation,
      girlfriendReply,
      score,
      emotionBefore: args.emotionBefore,
      emotionAfter,
      trustBefore: args.trustBefore,
      trustAfter,
    },
  };
}

export async function buildFinalReview(level: LevelSeed, character: CharacterConfig, rounds: RoundRecord[]): Promise<FinalReview> {
  return callAIEndpoint<FinalReviewResult>("final-review", {
    level,
    character,
    history: toProviderHistory(rounds),
    finalEmotionScore: rounds.at(-1)?.emotionAfter ?? level.initialEmotionScore,
    finalTrustScore: rounds.at(-1)?.trustAfter ?? level.initialTrustScore,
  });
}

export async function buildTrainingResult(levelKey: string, rounds: RoundRecord[]): Promise<TrainingResult | null> {
  const level = getLevelByKey(levelKey);
  if (!level) {
    return null;
  }

  const character = getCharacterByType(level.characterType);
  if (!character) {
    return null;
  }

  const finalReview = await buildFinalReview(level, character, rounds);

  return {
    id: generateResultId(),
    levelKey: level.levelKey,
    characterType: level.characterType,
    characterName: character.characterName,
    levelName: level.sceneName,
    taskTarget: level.taskTarget,
    createdAt: new Date().toISOString(),
    emotionStart: level.initialEmotionScore,
    emotionEnd: rounds.at(-1)?.emotionAfter ?? level.initialEmotionScore,
    trustStart: level.initialTrustScore,
    trustEnd: rounds.at(-1)?.trustAfter ?? level.initialTrustScore,
    rounds,
    finalReview,
  };
}

export async function analyzeEmergencyMessage(message: string): Promise<EmergencyAnalysis> {
  return callAIEndpoint<EmergencyAnalysisResult>("emergency-analysis", { message });
}

export function getCharacterTypeOptions(): CharacterType[] {
  return characters.map((item) => item.characterType);
}
