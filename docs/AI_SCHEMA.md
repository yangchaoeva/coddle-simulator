# AI_SCHEMA.md

## 1. 文件目的

本文件用于定义《哄她模拟器》MVP 中所有 AI 输出的结构化 Schema。

重点解决：

1. AI 输出不稳定的问题；
2. 前端不能直接消费 AI 原始文本的问题；
3. AI JSON 解析失败导致页面崩溃的问题；
4. 角色扮演和评分混在一起导致输出混乱的问题；
5. 救急模式输出需要统一结构的问题。

核心原则：

> 所有 AI 输出必须经过 Zod Schema 校验，校验通过后才能返回前端。

---

## 2. 总体原则

AI 调用必须遵守以下流程：

```txt
用户输入
→ 后端接收
→ 调用 AI Provider
→ AI 返回结构化对象
→ Zod Schema 校验
→ 校验成功：返回前端
→ 校验失败：返回 fallback object
→ 页面继续运行，不崩溃
```

禁止：

```ts
JSON.parse(aiResponse)
```

直接裸解析 AI 原始返回并发送给前端。

必须做到：

1. 所有 AI 输出结构化；
2. 所有 AI 输出经过 Zod 校验；
3. 所有 AI 输出失败时有 fallback；
4. 前端只消费后端校验后的对象；
5. AI 输出异常时不影响用户完成训练流程；
6. 角色扮演和评分分开处理。

---

## 3. MVP 需要的 5 个核心 Schema

| Schema | 作用 |
|---|---|
| `InputValidationSchema` | 判断用户输入是否有效 |
| `GirlfriendReplySchema` | 女友角色回复 |
| `RoundScoreSchema` | 每轮评分 |
| `FinalReviewSchema` | 最终复盘 |
| `EmergencyAnalysisSchema` | 救急分析 |

---

## 4. 输入状态枚举

用户自由输入必须先判断状态。

MVP 默认采用：

> 规则优先判断，AI 只做兜底。

也就是说，后端应先用确定性规则处理明显输入：

1. 空输入或极短输入；
2. 明显无关内容；
3. 明显攻击、羞辱、操控类表达；
4. 可直接识别的低质量敷衍回复。

只有当规则层无法稳定判断时，才调用 AI 进行补充判断，并且最终结果仍然必须经过 `InputValidationSchema` 校验。

```ts
export const InputStatusEnum = z.enum([
  "valid",
  "low_quality",
  "off_topic",
  "harmful",
]);
```

字段含义：

| 状态 | 含义 | 是否推进剧情 |
|---|---|---|
| `valid` | 正常回复 | 是 |
| `low_quality` | 低质量、敷衍回复 | 是，但低分 |
| `off_topic` | 完全偏离当前场景 | 否 |
| `harmful` | 攻击、羞辱、操控类输入 | 视情况推进为失败或要求重写 |

---

# 5. InputValidationSchema

## 5.1 用途

用于判断用户本轮输入是否适合进入当前关卡流程。

优先级要求：

1. 先做规则判断；
2. 规则无法稳定覆盖时，再调用 AI 兜底；
3. 无论结果来自规则还是 AI，最终都统一输出 `InputValidationSchema` 结构；
4. 前端不区分“规则命中”还是“AI 兜底”，只消费结构化结果。

例如：

- 用户正常回应女友情绪 → `valid`
- 用户只回复“哦” → `low_quality`
- 用户问“明天股票会涨吗” → `off_topic`
- 用户辱骂、威胁、操控 → `harmful`

---

## 5.2 Zod Schema 草案

```ts
import { z } from "zod";

export const InputValidationSchema = z.object({
  status: z.enum(["valid", "low_quality", "off_topic", "harmful"]),

  reason: z.string().min(1),

  userMessageToShow: z.string().min(1),

  shouldProceed: z.boolean(),

  suggestedRewrite: z.string().optional(),
});
```

---

## 5.3 字段说明

| 字段 | 类型 | 说明 |
|---|---|---|
| `status` | enum | 输入状态 |
| `reason` | string | 判断原因，供系统记录或调试 |
| `userMessageToShow` | string | 展示给用户看的提示 |
| `shouldProceed` | boolean | 是否推进本轮剧情 |
| `suggestedRewrite` | string optional | 可选，给用户一个重写方向 |

---

## 5.4 输出示例

### valid 示例

```json
{
  "status": "valid",
  "reason": "用户回应了女友被忽略的情绪，并表达了歉意。",
  "userMessageToShow": "可以进入下一轮。",
  "shouldProceed": true
}
```

### low_quality 示例

```json
{
  "status": "low_quality",
  "reason": "用户回复过短，没有回应女友情绪。",
  "userMessageToShow": "你的回复有些敷衍，本轮会继续推进，但评分会受到影响。",
  "shouldProceed": true,
  "suggestedRewrite": "可以先承认她的感受，再表达你愿意认真听。"
}
```

### off_topic 示例

```json
{
  "status": "off_topic",
  "reason": "用户输入和当前恋爱沟通场景无关。",
  "userMessageToShow": "这句话和当前沟通任务无关，本轮不会计分。请尝试回应她刚才表达的感受。",
  "shouldProceed": false,
  "suggestedRewrite": "试着回应她的不开心，而不是转移话题。"
}
```

### harmful 示例

```json
{
  "status": "harmful",
  "reason": "用户输入包含攻击、羞辱或操控倾向。",
  "userMessageToShow": "这类表达会加剧冲突。请换一种更尊重对方感受的说法。",
  "shouldProceed": false,
  "suggestedRewrite": "先表达你愿意理解她，而不是攻击她。"
}
```

---

# 6. GirlfriendReplySchema

## 6.1 用途

用于女友响应 Agent。

该 Agent 只负责根据角色卡和当前状态生成女友下一句回复。

它不负责评分，不负责教学解释，不负责计算情绪值或信任值。

---

## 6.2 Zod Schema 草案

```ts
export const GirlfriendReplySchema = z.object({
  girlfriendReply: z.string().min(1),

  tone: z.string().min(1),

  relationshipState: z.enum([
    "tense",
    "softening",
    "willing_to_continue",
    "shutting_down",
    "worsened",
  ]),

  fallback: z.boolean().optional(),

  errorType: z.string().optional(),
});
```

---

## 6.3 字段说明

| 字段 | 类型 | 说明 |
|---|---|---|
| `girlfriendReply` | string | 女友对用户的下一句回复 |
| `tone` | string | 当前语气，例如失望、冷淡、缓和 |
| `relationshipState` | enum | 当前关系状态 |
| `fallback` | boolean optional | 是否为兜底结果 |
| `errorType` | string optional | AI 输出异常类型 |

---

## 6.4 relationshipState 枚举说明

| 状态 | 含义 |
|---|---|
| `tense` | 仍然紧张 |
| `softening` | 情绪开始缓和 |
| `willing_to_continue` | 愿意继续沟通 |
| `shutting_down` | 开始关闭沟通 |
| `worsened` | 关系恶化 |

---

## 6.5 输出示例

```json
{
  "girlfriendReply": "你每次都说下次，可是我真的不知道还能不能信你。",
  "tone": "失望但还愿意继续沟通",
  "relationshipState": "softening"
}
```

---

## 6.6 fallback 示例

```json
{
  "girlfriendReply": "我现在有点乱，不知道该怎么接你的话。",
  "tone": "不确定",
  "relationshipState": "shutting_down",
  "fallback": true,
  "errorType": "AI_OUTPUT_INVALID"
}
```

---

# 7. RoundScoreSchema

## 7.1 用途

用于裁判评分 Agent。

它负责判断用户本轮回复的质量，并输出情绪值、信任值、踩雷点和本轮反馈。

---

## 7.2 Zod Schema 草案

```ts
export const SkillScoresSchema = z.object({
  emotionRecognition: z.number().min(0).max(100),
  empathy: z.number().min(0).max(100),
  responsibility: z.number().min(0).max(100),
  explanationControl: z.number().min(0).max(100),
  actionClarity: z.number().min(0).max(100),
  relationshipRepair: z.number().min(0).max(100),
});

export const RoundScoreSchema = z.object({
  emotionChange: z.number().min(-30).max(30),

  trustChange: z.number().min(-30).max(30),

  riskFlags: z.array(z.string()),

  skillScores: SkillScoresSchema,

  roundFeedback: z.string().min(1),

  fallback: z.boolean().optional(),

  errorType: z.string().optional(),
});
```

---

## 7.3 字段说明

| 字段 | 类型 | 说明 |
|---|---|---|
| `emotionChange` | number | 本轮情绪值变化，范围 -30 到 30 |
| `trustChange` | number | 本轮信任值变化，范围 -30 到 30 |
| `riskFlags` | string[] | 踩雷标签 |
| `skillScores` | object | 六个能力维度评分 |
| `roundFeedback` | string | 本轮反馈 |
| `fallback` | boolean optional | 是否为兜底结果 |
| `errorType` | string optional | AI 输出异常类型 |

---

## 7.4 skillScores 维度说明

| 字段 | 含义 |
|---|---|
| `emotionRecognition` | 情绪识别 |
| `empathy` | 共情表达 |
| `responsibility` | 责任承担 |
| `explanationControl` | 解释克制 |
| `actionClarity` | 具体行动 |
| `relationshipRepair` | 关系修复 |

---

## 7.5 输出示例

```json
{
  "emotionChange": 15,
  "trustChange": 10,
  "riskFlags": ["补救行动不够具体"],
  "skillScores": {
    "emotionRecognition": 80,
    "empathy": 85,
    "responsibility": 75,
    "explanationControl": 70,
    "actionClarity": 65,
    "relationshipRepair": 78
  },
  "roundFeedback": "你已经承认了她的失落感，但还需要给出更具体的补救行动。"
}
```

---

## 7.6 fallback 示例

```json
{
  "emotionChange": 0,
  "trustChange": 0,
  "riskFlags": ["系统评分暂时不稳定"],
  "skillScores": {
    "emotionRecognition": 60,
    "empathy": 60,
    "responsibility": 60,
    "explanationControl": 60,
    "actionClarity": 60,
    "relationshipRepair": 60
  },
  "roundFeedback": "这次回复可以继续优化，建议先承认对方感受，再表达自己的想法。",
  "fallback": true,
  "errorType": "SCHEMA_VALIDATION_FAILED"
}
```

---

# 8. FinalReviewSchema

## 8.1 用途

用于三轮训练结束后的最终复盘。

该 Schema 输出：

1. 总分；
2. 等级；
3. 结局；
4. 六维能力分；
5. 总结；
6. 更优回复；
7. 沟通原则。

---

## 8.2 Zod Schema 草案

```ts
export const FinalReviewSchema = z.object({
  totalScore: z.number().min(0).max(100),

  grade: z.enum(["S", "A", "B+", "B", "C", "D"]),

  endingType: z.enum([
    "reconciled",
    "softened",
    "failed",
    "worsened",
  ]),

  emotionRecognition: z.number().min(0).max(100),
  empathy: z.number().min(0).max(100),
  responsibility: z.number().min(0).max(100),
  explanationControl: z.number().min(0).max(100),
  actionClarity: z.number().min(0).max(100),
  relationshipRepair: z.number().min(0).max(100),

  summary: z.string().min(1),

  keyProblems: z.array(z.string()),

  betterReply: z.string().min(1),

  lesson: z.string().min(1),

  fallback: z.boolean().optional(),

  errorType: z.string().optional(),
});
```

---

## 8.3 字段说明

| 字段 | 类型 | 说明 |
|---|---|---|
| `totalScore` | number | 总分，0 到 100 |
| `grade` | enum | 等级 |
| `endingType` | enum | 结局类型 |
| `emotionRecognition` | number | 情绪识别得分 |
| `empathy` | number | 共情表达得分 |
| `responsibility` | number | 责任承担得分 |
| `explanationControl` | number | 解释克制得分 |
| `actionClarity` | number | 具体行动得分 |
| `relationshipRepair` | number | 关系修复得分 |
| `summary` | string | 总体复盘 |
| `keyProblems` | string[] | 关键问题 |
| `betterReply` | string | 更优回复示例 |
| `lesson` | string | 本关沟通原则 |
| `fallback` | boolean optional | 是否为兜底 |
| `errorType` | string optional | 错误类型 |

---

## 8.4 endingType 枚举说明

| endingType | 中文含义 |
|---|---|
| `reconciled` | 和好 |
| `softened` | 缓和 |
| `failed` | 失败 |
| `worsened` | 关系恶化 |

---

## 8.5 输出示例

```json
{
  "totalScore": 82,
  "grade": "B+",
  "endingType": "softened",
  "emotionRecognition": 80,
  "empathy": 85,
  "responsibility": 75,
  "explanationControl": 70,
  "actionClarity": 65,
  "relationshipRepair": 78,
  "summary": "你基本接住了她的情绪，但具体行动不足。",
  "keyProblems": ["补救行动不够具体", "第二轮解释偏多"],
  "betterReply": "我刚刚确实忽略了你的感受，对不起。我现在先认真听你说，也会把今晚的安排重新调整一下。",
  "lesson": "先承认感受，再解释原因，最后给出具体行动。"
}
```

---

## 8.6 fallback 示例

```json
{
  "totalScore": 60,
  "grade": "C",
  "endingType": "failed",
  "emotionRecognition": 60,
  "empathy": 60,
  "responsibility": 60,
  "explanationControl": 60,
  "actionClarity": 60,
  "relationshipRepair": 60,
  "summary": "这次训练已完成，但系统暂时无法生成完整复盘。",
  "keyProblems": ["系统复盘暂时不稳定"],
  "betterReply": "我刚刚没有很好地理解你的感受，可以再给我一次机会认真听你说吗？",
  "lesson": "沟通中应先理解情绪，再解释原因，最后给出行动。",
  "fallback": true,
  "errorType": "FINAL_REVIEW_FAILED"
}
```

---

# 9. EmergencyAnalysisSchema

## 9.1 用途

用于救急模式。

用户输入女朋友发来的真实聊天内容，系统即时分析：

1. 她可能的情绪；
2. 潜台词；
3. 当前雷区；
4. 回复方向；
5. 示例回复。

默认不保存，除非用户主动确认。

---

## 9.2 Zod Schema 草案

```ts
export const EmergencyAnalysisSchema = z.object({
  detectedEmotion: z.string().min(1),

  hiddenNeed: z.string().min(1),

  riskWarnings: z.array(z.string()),

  replyStrategy: z.string().min(1),

  suggestedReply: z.string().min(1),

  doNotSay: z.array(z.string()),

  canBeConvertedToTraining: z.boolean(),

  matchedCharacterType: z
    .enum([
      "insecure",
      "high_expectation",
      "rational_independent",
      "emotionally_expressive",
      "cold_suppressed",
    ])
    .optional(),

  fallback: z.boolean().optional(),

  errorType: z.string().optional(),
});
```

---

## 9.3 字段说明

| 字段 | 类型 | 说明 |
|---|---|---|
| `detectedEmotion` | string | 检测到的主要情绪 |
| `hiddenNeed` | string | 可能的潜在需求 |
| `riskWarnings` | string[] | 当前雷区 |
| `replyStrategy` | string | 回复策略 |
| `suggestedReply` | string | 示例回复 |
| `doNotSay` | string[] | 不建议说的话 |
| `canBeConvertedToTraining` | boolean | 是否可转成模拟训练 |
| `matchedCharacterType` | enum optional | 匹配到的女友角色类型 |
| `fallback` | boolean optional | 是否为兜底 |
| `errorType` | string optional | 错误类型 |

---

## 9.4 输出示例

```json
{
  "detectedEmotion": "失落、被忽视、不确定自己是否重要",
  "hiddenNeed": "她希望你主动表达重视，而不是只解释自己很忙。",
  "riskWarnings": ["不要说你想多了", "不要只解释自己很忙", "不要冷处理"],
  "replyStrategy": "先承认忽略了她的感受，再明确表达重视，最后给出具体陪伴行动。",
  "suggestedReply": "我刚才确实没有及时回应你，让你觉得被忽略了，对不起。你不是不重要，我现在先把手头事情放一下，认真陪你说会儿。",
  "doNotSay": ["你怎么又生气了", "我不是说了我在忙吗", "随便你怎么想"],
  "canBeConvertedToTraining": true,
  "matchedCharacterType": "insecure"
}
```

---

## 9.5 fallback 示例

```json
{
  "detectedEmotion": "情绪不明确",
  "hiddenNeed": "可能需要被认真倾听和确认。",
  "riskWarnings": ["不要急着反驳", "不要使用攻击性表达"],
  "replyStrategy": "先表达愿意理解，再邀请对方说清楚感受。",
  "suggestedReply": "我可能还没完全理解你的感受，但我愿意认真听你说。你可以告诉我刚才最让你不舒服的点是什么吗？",
  "doNotSay": ["你想太多了", "随便你", "我没错"],
  "canBeConvertedToTraining": false,
  "fallback": true,
  "errorType": "EMERGENCY_ANALYSIS_FAILED"
}
```

---

# 10. AI 调用分层建议

建议代码中按以下方式分层：

```txt
src/
  ai/
    provider.ts
    schemas.ts
    prompts/
      input-validation.ts
      girlfriend-response.ts
      judge-scoring.ts
      final-review.ts
      emergency-analysis.ts
```

说明：

| 文件 | 作用 |
|---|---|
| `provider.ts` | 统一 AI Provider 接口 |
| `schemas.ts` | 定义所有 Zod Schema |
| `input-validation.ts` | 输入有效性判断 Prompt |
| `girlfriend-response.ts` | 女友响应 Prompt |
| `judge-scoring.ts` | 裁判评分 Prompt |
| `final-review.ts` | 最终复盘 Prompt |
| `emergency-analysis.ts` | 救急分析 Prompt |

---

## 11. AI Provider 接口建议

```ts
export interface AIProvider {
  validateUserInput(input: ValidateUserInputParams): Promise<InputValidationResult>;

  generateGirlfriendReply(input: GirlfriendReplyParams): Promise<GirlfriendReplyResult>;

  scoreRound(input: RoundScoreParams): Promise<RoundScoreResult>;

  generateFinalReview(input: FinalReviewParams): Promise<FinalReviewResult>;

  analyzeEmergencyMessage(input: EmergencyAnalysisParams): Promise<EmergencyAnalysisResult>;
}
```

原则：

1. 业务代码不直接调用具体模型；
2. 第一版可以只接一个模型；
3. 保留未来替换模型的能力；
4. mock provider 和 real provider 使用同一接口。

---

# 12. 每轮训练 AI 流程

每轮用户提交回复后：

```txt
用户输入
→ 规则判断输入状态
    ├── 可直接判定：输出结构化 InputValidation result
    └── 无法稳定判定：调用 AI 做输入判断兜底
→ InputValidationSchema 校验输入状态
    ├── off_topic：不推进剧情，提示重写
    ├── harmful：风险提醒，可要求重写
    └── valid / low_quality：继续
→ Girlfriend Response Agent 生成女友回复
→ GirlfriendReplySchema 校验
→ Judge Scoring Agent 生成本轮评分
→ RoundScoreSchema 校验
→ 更新 emotionScore / trustScore
→ 保存本轮结果
→ 进入下一轮或最终复盘
```

---

# 13. 三轮结束后的 AI 流程

```txt
第 3 轮结束
→ 汇总 3 轮对话
→ 调用 Final Review Agent
→ FinalReviewSchema 校验
→ 校验成功：返回复盘
→ 校验失败：返回 fallback 复盘
→ 前端展示结果页
```

---

# 14. 救急模式 AI 流程

```txt
用户输入真实聊天内容
→ 调用 Emergency Analysis Agent
→ EmergencyAnalysisSchema 校验
→ 校验成功：展示情绪、潜台词、雷区、建议回复
→ 校验失败：展示 fallback 分析
→ 默认不保存
→ 用户主动确认后才写入数据库
```

---

# 15. fallback 总原则

任何 AI 输出失败，都必须满足：

1. 页面不崩溃；
2. 用户知道发生了什么；
3. 流程可以继续或安全结束；
4. 不暴露底层错误堆栈；
5. 不输出危险建议；
6. 不输出操控、PUA、冷暴力建议。

---

# 16. 前端消费规则

前端只接收后端返回的结构化对象。

前端不负责：

1. 解析 AI 原始文本；
2. 修复 AI JSON；
3. 判断 AI 输出字段是否存在；
4. 补齐缺失字段。

这些都应该在后端完成。

---

# 17. 日志建议

AI 输出异常时，建议后端记录：

1. agentName；
2. levelKey；
3. characterType；
4. roundNumber；
5. errorType；
6. schemaValidationError；
7. timestamp。

不要在日志中记录过多真实聊天敏感内容。

救急模式尤其要避免完整记录用户真实聊天原文，除非用户主动保存。

---

# 18. 给 Codex 的实现提醒

执行 AI Schema 相关开发时，请遵守：

1. 先阅读 `AGENTS.md`、`docs/SPEC.md`、`docs/AI_SCHEMA.md`；
2. 先定义 Zod Schema；
3. 再写 mock AI provider；
4. 最后再接真实 AI；
5. 不要让女友响应 Agent 负责评分；
6. 不要让裁判评分 Agent 扮演女友；
7. 不要直接 `JSON.parse(aiResponse)`；
8. 不要把 Prompt 写在页面组件中；
9. 不要把 AI 原始输出直接返回前端；
10. 所有 AI 输出失败都必须有 fallback；
11. 救急模式默认不保存真实聊天；
12. 不要生成 PUA、操控、欺骗或冷暴力建议。

---

# 19. MVP 验收标准

AI Schema 层至少满足：

1. 5 个核心 Schema 已定义；
2. 每个 Schema 有 fallback object；
3. AI 输出通过 Zod 校验后才返回前端；
4. 输入越界时不推进剧情；
5. 女友响应和裁判评分分离；
6. 三轮训练能稳定完成；
7. AI 输出异常时页面不崩溃；
8. 救急模式输出结构统一；
9. 救急模式默认不保存真实聊天；
10. 前端不直接解析 AI 原始返回。
