import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { levels, type LevelRecord, type NewLevelRecord } from "@/db/schema";
import type { CharacterType } from "@/types/character";
import type { LevelSeed } from "@/types/level";

function mapLevelRecordToSeed(level: LevelRecord): LevelSeed {
  return {
    levelKey: level.levelKey,
    characterType: level.characterType as CharacterType,
    sceneName: level.sceneName,
    background: level.background,
    openingLine: level.openingLine,
    taskTarget: level.taskTarget,
    difficulty: level.difficulty as LevelSeed["difficulty"],
    initialEmotionScore: level.initialEmotionScore,
    initialTrustScore: level.initialTrustScore,
    trainingFocus: level.trainingFocus,
    riskRules: level.riskRules,
    referenceReplies: level.referenceReplies,
  };
}

export function mapLevelSeedToInsert(level: LevelSeed): NewLevelRecord {
  return {
    levelKey: level.levelKey,
    characterType: level.characterType,
    sceneName: level.sceneName,
    background: level.background,
    openingLine: level.openingLine,
    taskTarget: level.taskTarget,
    difficulty: level.difficulty,
    initialEmotionScore: level.initialEmotionScore,
    initialTrustScore: level.initialTrustScore,
    trainingFocus: level.trainingFocus,
    riskRules: level.riskRules,
    referenceReplies: level.referenceReplies,
    isActive: true,
  };
}

export async function getLevelsByCharacterTypeFromDb(characterType: CharacterType): Promise<LevelSeed[]> {
  const db = getDb();
  const records = await db
    .select()
    .from(levels)
    .where(and(eq(levels.characterType, characterType), eq(levels.isActive, true)))
    .orderBy(asc(levels.levelKey));

  return records.map(mapLevelRecordToSeed);
}

export async function getLevelByKeyFromDb(levelKey: string): Promise<LevelSeed | null> {
  const db = getDb();
  const [record] = await db
    .select()
    .from(levels)
    .where(and(eq(levels.levelKey, levelKey), eq(levels.isActive, true)))
    .limit(1);

  return record ? mapLevelRecordToSeed(record) : null;
}
