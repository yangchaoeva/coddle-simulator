# DATABASE.md

## 1. 文件目的

本文件用于明确《哄她模拟器》MVP 的数据模型设计。

重点回答：

1. 哪些数据需要入库；
2. 哪些数据暂时不入库；
3. 各核心表之间如何关联；
4. 游客数据如何处理；
5. 登录用户的数据如何保存；
6. 救急模式真实聊天如何保护隐私；
7. Drizzle ORM 表结构如何初步设计。

---

## 2. 数据设计总原则

MVP 阶段遵守以下原则：

1. 数据模型只服务 MVP 单人训练闭环；
2. 不提前设计社区、排行榜、支付、会员、后台管理等复杂数据；
3. 游客训练数据先保存在 `localStorage`，不直接写入数据库；
4. 登录用户完成训练后，训练记录写入数据库；
5. 救急模式真实聊天默认不保存；
6. 只有用户主动确认保存时，才写入救急分析表；
7. 女友角色卡暂时写在代码配置中，不入库；
8. 关卡数据入库，方便后续扩展；
9. AI 输出需要保存结构化结果，而不是只保存原始文本；
10. 所有用户数据必须绑定当前 `userId`，用户只能访问自己的数据。

---

## 3. 技术选择

数据库相关技术栈：

| 模块 | 技术 |
|---|---|
| 数据库 | Neon PostgreSQL |
| ORM | Drizzle ORM |
| 认证 | BetterAuth |
| 用户认证表 | 由 BetterAuth 管理 |
| 业务表 | 由项目自行设计 |
| 游客临时数据 | localStorage |
| Schema 校验 | Zod |

---

## 4. 数据入库范围

| 数据类型 | 是否入库 | 说明 |
|---|---|---|
| 用户账号 | 是 | BetterAuth 管理 |
| 登录 Session | 是 | BetterAuth 管理 |
| 女友角色卡 | 暂不入库 | 先写在 `src/config/characters.ts` |
| 关卡数据 | 是 | 15 个关卡 seed 到数据库 |
| 训练会话 | 是 | 登录用户完成训练后保存 |
| 每轮对话 | 是 | 保存用户回复、女友回复、分数变化 |
| 最终评分 | 是 | 保存总分、等级、复盘建议 |
| 用户进度 | 是 | 保存角色维度下的训练统计 |
| 救急分析 | 条件入库 | 用户主动确认保存才入库 |
| 游客训练数据 | 暂不入库 | 先存 `localStorage`，登录后合并 |

---

## 5. 核心业务表

MVP 需要以下业务表：

1. `levels`：关卡表；
2. `training_sessions`：训练会话表；
3. `dialogue_turns`：对话轮次表；
4. `score_results`：最终评分表；
5. `user_progress`：用户进度表；
6. `emergency_analyses`：救急分析表。

BetterAuth 相关表由 BetterAuth 自身管理，通常包括：

1. `user`
2. `session`
3. `account`
4. `verification`

具体表名以 BetterAuth 实际配置为准。

---

## 6. 表关系总览

```txt
BetterAuth user
    ├── training_sessions
    │       ├── dialogue_turns
    │       └── score_results
    │
    ├── user_progress
    │
    └── emergency_analyses

levels
    └── training_sessions
```

解释：

1. 一个用户可以有多次训练会话；
2. 一个训练会话对应一个关卡；
3. 一个训练会话包含 3 轮对话；
4. 一个训练会话最终对应一个评分结果；
5. 用户进度用于汇总训练表现；
6. 救急分析只有用户主动保存时才创建。

---

## 7. 游客数据设计

### 7.1 设计原则

MVP 阶段：

> 游客训练数据不直接写入数据库。

原因：

1. 数据库更干净；
2. 降低游客匿名数据管理复杂度；
3. 避免一开始设计 `guestId`、匿名会话、过期清理等复杂逻辑；
4. 符合 MVP 快速开发原则。

---

### 7.2 游客训练数据保存位置

游客训练数据保存在浏览器：

```txt
localStorage
```

建议 key：

```txt
guest_training_session
```

---

### 7.3 游客本地数据结构

```json
{
  "guestSessionId": "uuid",
  "levelKey": "insecure_001",
  "characterType": "insecure",
  "startedAt": "2026-05-19T20:00:00+08:00",
  "completedAt": "2026-05-19T20:05:00+08:00",
  "turns": [
    {
      "roundNumber": 1,
      "userInput": "我刚才确实忽略你了，对不起。",
      "girlfriendResponse": "你每次都说下次，可是我真的不知道还能不能信你。",
      "emotionBefore": -60,
      "emotionChange": 15,
      "emotionAfter": -45,
      "trustBefore": 45,
      "trustChange": 10,
      "trustAfter": 55,
      "riskFlags": ["补救行动不够具体"],
      "roundFeedback": "你已经承认了她的失落，但还需要给出具体行动。"
    }
  ],
  "scoreResult": {
    "totalScore": 82,
    "grade": "B+",
    "endingType": "softened",
    "summary": "你基本接住了她的情绪，但具体行动不足。"
  }
}
```

---

### 7.4 登录后合并流程

游客完成训练后，如果点击“登录保存”：

```txt
游客完成训练
→ localStorage 保存当次训练
→ 用户点击登录保存
→ BetterAuth 登录成功
→ 前端调用 mergeGuestProgress
→ 后端校验用户登录态
→ 后端校验游客数据结构
→ 后端根据 levelKey 查询 levels.id
→ 写入 training_sessions
→ 写入 dialogue_turns
→ 写入 score_results
→ 更新 user_progress
→ 清除 localStorage
```

---

## 8. 救急数据隐私规则

救急模式涉及真实聊天内容，必须隐私优先。

### 8.1 默认规则

默认不保存用户输入的真实聊天内容。

用户只使用即时分析时：

```txt
不写入数据库
```

### 8.2 允许保存的条件

只有用户主动勾选：

> 保存到我的复盘记录

才允许写入 `emergency_analyses` 表。

### 8.3 保存时必须记录

1. `userId`
2. `userInput`
3. `emotionAnalysis`
4. `hiddenNeed`
5. `riskWarnings`
6. `replyStrategy`
7. `suggestedReply`
8. `doNotSay`
9. `matchedCharacterType`
10. `userConsentedToSave`
11. `convertedToTraining`
12. `createdAt`
13. `deletedAt` 或删除状态

---

## 9. Drizzle 表结构草案

以下为 MVP 阶段的业务表草案。

实际开发时可根据 BetterAuth、Drizzle 和 Neon 的实际配置微调。

---

## 9.1 `levels` 关卡表

用途：

> 存储 15 个 MVP 初始关卡。

说明：

1. 女友角色卡不入库；
2. 但关卡需要通过 `characterType` 关联到代码中的角色配置；
3. 每个角色 3 个关卡；
4. 总计 15 个初始关卡。

```ts
import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export const levels = pgTable("levels", {
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

  trainingFocus: jsonb("training_focus"),
  referenceReplies: jsonb("reference_replies"),
  riskRules: jsonb("risk_rules"),

  isActive: boolean("is_active").default(true).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

---

## 9.2 `training_sessions` 训练会话表

用途：

> 保存一次完整训练。

一个训练会话对应：

1. 一个用户；
2. 一个关卡；
3. 三轮对话；
4. 一个最终评分结果。

MVP 阶段游客数据不入库，所以 `userId` 推荐 `notNull()`。

```ts
export const trainingSessions = pgTable("training_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),

  userId: text("user_id").notNull(),

  levelId: uuid("level_id")
    .references(() => levels.id)
    .notNull(),

  status: varchar("status", { length: 20 }).default("active").notNull(),

  finalScore: integer("final_score"),
  grade: varchar("grade", { length: 10 }),
  endingType: varchar("ending_type", { length: 30 }),

  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### status 建议枚举

| status | 说明 |
|---|---|
| active | 训练中 |
| completed | 已完成 |
| failed | 失败或异常中断 |

---

## 9.3 `dialogue_turns` 对话轮次表

用途：

> 保存每一轮用户回复、女友回复和评分变化。

每个训练会话通常有 3 条 `dialogue_turns`。

```ts
export const dialogueTurns = pgTable("dialogue_turns", {
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

  riskFlags: jsonb("risk_flags"),
  skillScores: jsonb("skill_scores"),
  roundFeedback: text("round_feedback"),

  inputStatus: varchar("input_status", { length: 30 }).default("valid").notNull(),

  aiFallbackUsed: boolean("ai_fallback_used").default(false).notNull(),
  aiErrorType: varchar("ai_error_type", { length: 50 }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### inputStatus 建议枚举

| inputStatus | 说明 |
|---|---|
| valid | 正常回复 |
| low_quality | 低质量回复 |
| off_topic | 完全越界 |
| harmful | 攻击、羞辱、操控类输入 |

---

## 9.4 `score_results` 最终评分表

用途：

> 保存一次训练完成后的总评分和复盘。

```ts
export const scoreResults = pgTable("score_results", {
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
  keyProblems: jsonb("key_problems"),
  betterReply: text("better_reply"),
  lesson: text("lesson"),

  aiFallbackUsed: boolean("ai_fallback_used").default(false).notNull(),
  aiErrorType: varchar("ai_error_type", { length: 50 }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### endingType 建议枚举

| endingType | 说明 |
|---|---|
| reconciled | 和好 |
| softened | 缓和 |
| failed | 失败 |
| worsened | 关系恶化 |

---

## 9.5 `user_progress` 用户进度表

用途：

> 保存用户在不同角色类型下的训练统计，为后续成长报告做基础。

注意：

MVP 可以先简单实现，也可以在训练完成后异步更新。

```ts
export const userProgress = pgTable("user_progress", {
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

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

---

## 9.6 `emergency_analyses` 救急分析表

用途：

> 保存用户主动确认保存的救急分析记录。

默认不写入。

```ts
export const emergencyAnalyses = pgTable("emergency_analyses", {
  id: uuid("id").primaryKey().defaultRandom(),

  userId: text("user_id").notNull(),

  userInput: text("user_input").notNull(),

  emotionAnalysis: text("emotion_analysis").notNull(),
  hiddenNeed: text("hidden_need"),

  riskWarnings: jsonb("risk_warnings"),
  replyStrategy: text("reply_strategy"),
  suggestedReply: text("suggested_reply"),
  doNotSay: jsonb("do_not_say"),
  matchedCharacterType: varchar("matched_character_type", { length: 50 }),

  userConsentedToSave: boolean("user_consented_to_save").default(false).notNull(),

  convertedToTraining: boolean("converted_to_training").default(false).notNull(),

  deletedAt: timestamp("deleted_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

---

## 9.7 唯一约束与索引建议

MVP 阶段建议至少补充以下约束与索引：

1. `levels.levelKey`：唯一约束。
2. `dialogue_turns(sessionId, roundNumber)`：唯一约束，避免同一轮重复写入。
3. `score_results.sessionId`：唯一约束，保证一场训练只对应一个最终结果。
4. `user_progress(userId, characterType)`：唯一约束，避免同一用户同一角色出现重复聚合记录。
5. `training_sessions.userId`：索引，支持历史记录查询。
6. `training_sessions.levelId`：索引，支持按关卡查询。
7. `dialogue_turns.sessionId`：索引，支持复盘读取。
8. `score_results.sessionId`：索引或唯一索引，支持结果页读取。
9. `emergency_analyses.userId`：索引，支持个人历史查询。
10. `levels.characterType`：索引，支持按角色拉取关卡列表。

如果后续实现 `mergeGuestProgress`，还建议增加幂等保护，例如：

1. 使用 `guestSessionId` 做一次性合并标记；
2. 或在服务端记录已完成的 guest merge token；
3. 避免用户刷新结果页时重复写入同一条训练记录。

---

## 10. 是否需要单独的 `characters` 表？

MVP 阶段暂时不需要。

原因：

1. 只有 5 个角色；
2. 角色卡需要稳定，适合写在代码配置中；
3. AI Prompt 会直接引用角色卡；
4. 入库反而会增加后台管理复杂度；
5. 后续如果做管理后台，再考虑迁移到数据库。

建议位置：

```txt
src/config/characters.ts
```

示例结构：

```ts
export const characters = [
  {
    characterType: "insecure",
    characterName: "缺安全感型",
    coreNeed: "被重视、被及时回应、被明确选择",
    dangerZones: ["冷处理", "敷衍", "只解释不安抚"],
    comfortMechanism: "先承认她的不安，再给明确回应和具体行动",
  },
];
```

---

## 11. 是否需要单独的 `guest_sessions` 表？

MVP 阶段暂时不需要。

原因：

1. 游客数据先存在 `localStorage`；
2. 登录后再写入正式用户数据表；
3. 避免匿名数据清理、过期、合并冲突等复杂问题。

后续如果要支持游客跨设备保存，再考虑增加：

```txt
guest_sessions
```

---

## 12. 数据保存流程

### 12.1 登录用户训练保存流程

```txt
用户登录
→ 选择角色
→ 选择关卡
→ 开始训练
→ 创建 training_session
→ 每轮写入 dialogue_turn
→ 三轮完成
→ 写入 score_result
→ 更新 training_session 状态
→ 更新 user_progress
```

---

### 12.2 游客训练保存流程

```txt
游客选择角色
→ 选择关卡
→ 开始训练
→ 数据暂存 localStorage
→ 三轮完成
→ 显示评分复盘
→ 点击登录保存
→ 登录成功
→ mergeGuestProgress
→ 根据 levelKey 查询 levels.id
→ 写入正式数据表
→ 清除 localStorage
```

---

### 12.3 救急分析保存流程

```txt
用户进入救急模式
→ 输入真实聊天
→ 系统即时分析
→ 默认不保存
→ 用户主动勾选保存
→ 如果未登录，引导登录
→ 登录后写入 emergency_analyses
```

---

## 13. API 与数据表关系

| API / Action | 主要操作表 |
|---|---|
| `getLevelsByCharacter` | `levels` |
| `startTrainingSession` | `training_sessions` |
| `submitDialogueTurn` | `dialogue_turns`, `training_sessions` |
| `completeTrainingSession` | `score_results`, `training_sessions`, `user_progress` |
| `mergeGuestProgress` | `training_sessions`, `dialogue_turns`, `score_results`, `user_progress` |
| `getHistory` | `training_sessions`, `score_results`, `levels` |
| `analyzeEmergencyMessage` | 默认不写表 |
| `saveEmergencyAnalysis` | `emergency_analyses` |

---

## 14. 数据访问权限

必须遵守：

1. 用户只能查看自己的训练记录；
2. 用户只能查看自己的救急保存记录；
3. 未登录用户不能访问 `/history` 数据；
4. 服务端接口不能只依赖前端传来的 `userId`；
5. 服务端必须通过 BetterAuth 获取当前用户；
6. 保存数据时，`userId` 必须来自服务端登录态，不可信任前端输入。

---

## 15. 第一阶段开发建议

第一阶段先不要直接实现完整数据库。

推荐顺序：

1. 先用 mock 数据完成页面流程；
2. 再定义 Drizzle schema；
3. 再 seed `levels`；
4. 再接入登录用户训练保存；
5. 最后做游客合并和救急保存。

---

## 16. MVP 数据模型验收标准

数据库设计至少满足：

1. 能保存 15 个关卡；
2. 能保存登录用户一次完整训练；
3. 能保存 3 轮对话；
4. 能保存最终评分和复盘；
5. 能按用户查询历史训练记录；
6. 能更新用户训练进度；
7. 游客数据不直接写数据库；
8. 游客登录后能合并当次训练；
9. 救急内容默认不保存；
10. 用户主动确认后才保存救急分析；
11. 用户只能访问自己的数据；
12. AI 输出异常时能记录 fallback 状态。

---

## 16.1 `levelKey` 与 uuid 分工

MVP 阶段统一采用以下策略：

1. `levels.id`：数据库主键，使用 uuid。
2. `levels.levelKey`：业务关卡 ID，使用类似 `insecure_001` 的稳定字符串。
3. 页面路由使用 `levelKey`。
4. `src/seed/levels.ts` 使用 `levelKey`。
5. 游客 `localStorage` 使用 `levelKey`。
6. `mergeGuestProgress` 先根据 `levelKey` 查询 `levels.id`，再写入 `training_sessions.levelId`。

这样可以保证：

1. 业务层 ID 稳定可读；
2. 数据库层仍保留 uuid 主键；
3. 页面、seed、本地缓存和游客合并口径一致。

---

## 17. 给 Codex 的开发提醒

执行数据库相关任务时，请遵守：

1. 先阅读 `AGENTS.md`、`docs/SPEC.md` 和 `docs/DATABASE.md`；
2. 不要自行新增复杂表；
3. 不要提前实现社区、排行榜、支付、会员、后台管理相关数据；
4. 不要把游客数据直接写入数据库，除非任务明确要求；
5. 不要默认保存救急模式真实聊天；
6. 所有业务表设计应服务 MVP 单人训练闭环；
7. 所有用户数据访问必须通过服务端登录态校验；
8. Drizzle schema 要保持清晰、可维护、便于后续迁移。
