import { sql } from "drizzle-orm";
import { getDb } from "@/db";
import { levels } from "@/db/schema";
import { mapLevelSeedToInsert } from "@/db/repositories/levels";
import { levelSeeds } from "@/data/levels";

async function seedLevels() {
  const db = getDb();
  const rows = levelSeeds.map(mapLevelSeedToInsert);

  await db
    .insert(levels)
    .values(rows)
    .onConflictDoUpdate({
      target: levels.levelKey,
      set: {
        characterType: sqlPlaceholder("character_type"),
        sceneName: sqlPlaceholder("scene_name"),
        background: sqlPlaceholder("background"),
        openingLine: sqlPlaceholder("opening_line"),
        taskTarget: sqlPlaceholder("task_target"),
        difficulty: sqlPlaceholder("difficulty"),
        initialEmotionScore: sqlPlaceholder("initial_emotion_score"),
        initialTrustScore: sqlPlaceholder("initial_trust_score"),
        trainingFocus: sqlPlaceholder("training_focus"),
        riskRules: sqlPlaceholder("risk_rules"),
        referenceReplies: sqlPlaceholder("reference_replies"),
        isActive: sqlPlaceholder("is_active"),
        updatedAt: new Date(),
      },
    });

  console.info(`[db:seed:levels] prepared ${rows.length} levels for upsert.`);
}

function sqlPlaceholder(columnName: string) {
  return sql.raw(`excluded.${columnName}`);
}

seedLevels()
  .then(() => {
    console.info("[db:seed:levels] completed.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("[db:seed:levels] failed.", error);
    process.exit(1);
  });
