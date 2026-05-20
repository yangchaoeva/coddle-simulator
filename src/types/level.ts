import type { CharacterType } from "@/types/character";

export type LevelSeed = {
  levelKey: string;
  characterType: CharacterType;
  sceneName: string;
  background: string;
  openingLine: string;
  taskTarget: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  initialEmotionScore: number;
  initialTrustScore: number;
  trainingFocus: string[];
  riskRules: string[];
  referenceReplies: string[];
};
