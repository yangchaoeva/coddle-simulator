import { and, eq, gte, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { aiUsageCounters } from "@/db/schema";

export type CheckAndConsumeAIQuotaResult =
  | {
      allowed: true;
      remaining: number;
      usedCount: number;
      freeQuotaLimit: number;
    }
  | {
      allowed: false;
      remaining: 0;
      usedCount: number;
      freeQuotaLimit: number;
    };

export async function checkAndConsumeAIQuotaForUser(userId: string): Promise<CheckAndConsumeAIQuotaResult> {
  const db = getDb();

  await db
    .insert(aiUsageCounters)
    .values({
      userId,
    })
    .onConflictDoNothing();

  const [updatedRecord] = await db
    .update(aiUsageCounters)
    .set({
      usedCount: sql`${aiUsageCounters.usedCount} + 1`,
      updatedAt: sql`now()`,
    })
    .where(
      and(
        eq(aiUsageCounters.userId, userId),
        gte(aiUsageCounters.freeQuotaLimit, sql`${aiUsageCounters.usedCount} + 1`),
      ),
    )
    .returning({
      usedCount: aiUsageCounters.usedCount,
      freeQuotaLimit: aiUsageCounters.freeQuotaLimit,
    });

  if (updatedRecord) {
    return {
      allowed: true,
      remaining: Math.max(0, updatedRecord.freeQuotaLimit - updatedRecord.usedCount),
      usedCount: updatedRecord.usedCount,
      freeQuotaLimit: updatedRecord.freeQuotaLimit,
    };
  }

  const [currentRecord] = await db
    .select({
      usedCount: aiUsageCounters.usedCount,
      freeQuotaLimit: aiUsageCounters.freeQuotaLimit,
    })
    .from(aiUsageCounters)
    .where(eq(aiUsageCounters.userId, userId))
    .limit(1);

  return {
    allowed: false,
    remaining: 0,
    usedCount: currentRecord?.usedCount ?? 0,
    freeQuotaLimit: currentRecord?.freeQuotaLimit ?? 3,
  };
}
