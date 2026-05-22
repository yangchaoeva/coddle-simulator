import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

const emptyStringArray = sql`'[]'::jsonb`;

export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userEmailUnique: uniqueIndex("user_email_unique").on(table.email),
  }),
);

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
    token: text("token").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    sessionTokenUnique: uniqueIndex("session_token_unique").on(table.token),
    sessionUserIdIdx: index("session_user_id_idx").on(table.userId),
  }),
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    accountProviderAccountUnique: uniqueIndex("account_provider_account_unique").on(
      table.providerId,
      table.accountId,
    ),
    accountUserIdIdx: index("account_user_id_idx").on(table.userId),
  }),
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    verificationIdentifierValueUnique: uniqueIndex("verification_identifier_value_unique").on(
      table.identifier,
      table.value,
    ),
  }),
);

export const levels = pgTable(
  "levels",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    levelKey: varchar("level_key", { length: 50 }).notNull().unique(),
    characterType: varchar("character_type", { length: 50 }).notNull(),
    sceneName: text("scene_name").notNull(),
    background: text("background").notNull(),
    openingLine: text("opening_line").notNull(),
    taskTarget: text("task_target").notNull(),
    difficulty: integer("difficulty").default(1).notNull(),
    initialEmotionScore: integer("initial_emotion_score").default(-50).notNull(),
    initialTrustScore: integer("initial_trust_score").default(50).notNull(),
    trainingFocus: jsonb("training_focus").$type<string[]>().notNull().default(emptyStringArray),
    referenceReplies: jsonb("reference_replies").$type<string[]>().notNull().default(emptyStringArray),
    riskRules: jsonb("risk_rules").$type<string[]>().notNull().default(emptyStringArray),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    levelsCharacterTypeIdx: index("levels_character_type_idx").on(table.characterType),
  }),
);

export const trainingSessions = pgTable(
  "training_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    levelId: uuid("level_id")
      .references(() => levels.id)
      .notNull(),
    status: varchar("status", { length: 20 }).default("active").notNull(),
    finalScore: integer("final_score"),
    grade: varchar("grade", { length: 10 }),
    endingType: varchar("ending_type", { length: 30 }),
    startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    trainingSessionsUserIdIdx: index("training_sessions_user_id_idx").on(table.userId),
    trainingSessionsLevelIdIdx: index("training_sessions_level_id_idx").on(table.levelId),
  }),
);

export const dialogueTurns = pgTable(
  "dialogue_turns",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .references(() => trainingSessions.id)
      .notNull(),
    roundNumber: integer("round_number").notNull(),
    userRawInput: text("user_raw_input").notNull(),
    girlfriendResponse: text("girlfriend_response").notNull(),
    emotionBefore: integer("emotion_before").notNull(),
    emotionChange: integer("emotion_change").notNull(),
    emotionAfter: integer("emotion_after").notNull(),
    trustBefore: integer("trust_before").notNull(),
    trustChange: integer("trust_change").notNull(),
    trustAfter: integer("trust_after").notNull(),
    riskFlags: jsonb("risk_flags").$type<string[]>().notNull().default(emptyStringArray),
    skillScores: jsonb("skill_scores").$type<Record<string, number> | null>(),
    roundFeedback: text("round_feedback"),
    inputStatus: varchar("input_status", { length: 30 }).default("valid").notNull(),
    aiFallbackUsed: boolean("ai_fallback_used").default(false).notNull(),
    aiErrorType: varchar("ai_error_type", { length: 50 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    dialogueTurnsSessionIdIdx: index("dialogue_turns_session_id_idx").on(table.sessionId),
    dialogueTurnsSessionRoundUnique: uniqueIndex("dialogue_turns_session_round_unique").on(
      table.sessionId,
      table.roundNumber,
    ),
  }),
);

export const scoreResults = pgTable(
  "score_results",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .references(() => trainingSessions.id)
      .notNull(),
    totalScore: integer("total_score").notNull(),
    grade: varchar("grade", { length: 10 }).notNull(),
    endingType: varchar("ending_type", { length: 30 }).notNull(),
    emotionRecognition: integer("emotion_recognition").notNull(),
    empathy: integer("empathy").notNull(),
    responsibility: integer("responsibility").notNull(),
    explanationControl: integer("explanation_control").notNull(),
    actionClarity: integer("action_clarity").notNull(),
    relationshipRepair: integer("relationship_repair").notNull(),
    summary: text("summary").notNull(),
    keyProblems: jsonb("key_problems").$type<string[]>().notNull().default(emptyStringArray),
    betterReply: text("better_reply"),
    lesson: text("lesson"),
    aiFallbackUsed: boolean("ai_fallback_used").default(false).notNull(),
    aiErrorType: varchar("ai_error_type", { length: 50 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    scoreResultsSessionIdUnique: uniqueIndex("score_results_session_id_unique").on(table.sessionId),
  }),
);

export const userProgress = pgTable(
  "user_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    characterType: varchar("character_type", { length: 50 }).notNull(),
    completedLevelCount: integer("completed_level_count").default(0).notNull(),
    averageScore: integer("average_score").default(0).notNull(),
    bestScore: integer("best_score").default(0).notNull(),
    emotionRecognitionAvg: integer("emotion_recognition_avg").default(0).notNull(),
    empathyAvg: integer("empathy_avg").default(0).notNull(),
    responsibilityAvg: integer("responsibility_avg").default(0).notNull(),
    explanationControlAvg: integer("explanation_control_avg").default(0).notNull(),
    actionClarityAvg: integer("action_clarity_avg").default(0).notNull(),
    relationshipRepairAvg: integer("relationship_repair_avg").default(0).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userProgressUserIdCharacterTypeUnique: uniqueIndex("user_progress_user_character_unique").on(
      table.userId,
      table.characterType,
    ),
  }),
);

export const emergencyAnalyses = pgTable(
  "emergency_analyses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    userInput: text("user_input").notNull(),
    emotionAnalysis: text("emotion_analysis").notNull(),
    hiddenNeed: text("hidden_need"),
    riskWarnings: jsonb("risk_warnings").$type<string[]>().notNull().default(emptyStringArray),
    replyStrategy: text("reply_strategy"),
    suggestedReply: text("suggested_reply"),
    doNotSay: jsonb("do_not_say").$type<string[]>().notNull().default(emptyStringArray),
    matchedCharacterType: varchar("matched_character_type", { length: 50 }),
    userConsentedToSave: boolean("user_consented_to_save").default(false).notNull(),
    convertedToTraining: boolean("converted_to_training").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    emergencyAnalysesUserIdIdx: index("emergency_analyses_user_id_idx").on(table.userId),
  }),
);

export type LevelRecord = typeof levels.$inferSelect;
export type NewLevelRecord = typeof levels.$inferInsert;
