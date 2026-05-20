# ROADMAP.md

## 1. 文件目的

本文件用于明确《哄她模拟器》MVP 的 Codex 分阶段开发顺序。

核心原则：

> 不要让 Codex 一次性开发完整项目，而是按阶段施工，每一阶段都要可运行、可验证、可回滚。

本文件重点回答：

1. 先做什么，后做什么；
2. 每个阶段只做哪些功能；
3. 每个阶段明确不做什么；
4. 每个阶段如何验收；
5. 每个阶段给 Codex 的任务提示词怎么写。

---

## 2. 开发总原则

开发时必须遵守：

1. 先页面流程，后真实数据；
2. 先 mock，后真实 AI；
3. 先 Schema，后模型调用；
4. 先训练闭环，后救急模式；
5. 先本地游客数据，后登录合并；
6. 不要一次性接入数据库、认证、AI、游客合并；
7. 每个阶段完成后必须能验证；
8. 不主动扩展 SPEC 之外的功能。

---

## 3. 阶段总览

| 阶段 | 名称 | 核心目标 |
|---|---|---|
| 阶段 1 | 页面骨架 + Mock 流程 | 用 mock 数据走完整页面流程 |
| 阶段 2 | 角色卡 + 关卡种子数据 | 接入 5 个角色和 15 个关卡 |
| 阶段 3 | AI Schema + Mock AI Provider | 搭好 AI 架构，不接真实模型 |
| 阶段 4 | 接入真实 AI | 实现双 Step AI 对话和评分 |
| 阶段 5 | 接入 Neon + Drizzle 基础数据层 | 建立 schema、seed levels、提供基础查询 |
| 阶段 6 | 接入 BetterAuth + 登录用户训练保存 | 用户注册、登录、历史记录、登录用户训练写库 |
| 阶段 7 | 游客登录保存 | 游客训练后登录不丢记录 |
| 阶段 8 | 救急模式 | 即时分析真实聊天，隐私优先 |

---

# 阶段 1：页面骨架 + Mock 流程

## 目标

先把页面和跳转跑通。

重点不是做真实功能，而是让用户能用 mock 数据完成一次完整训练流程。

---

## 本阶段要做

1. 建立基础 Next.js 页面结构；
2. 首页 `/`；
3. 角色选择页 `/characters`；
4. 关卡选择页 `/characters/[characterType]/levels`；
5. 三轮训练页 `/training/[levelKey]`；
6. 评分复盘页 `/training/[resultId]/result`；
7. 救急页 `/emergency`；
8. 历史记录页 `/history` 占位；
9. 使用 mock 数据完成页面跳转。

---

## 本阶段不做

1. 不接入数据库；
2. 不接入 BetterAuth；
3. 不接入真实 AI；
4. 不实现真实评分；
5. 不实现游客合并；
6. 不保存数据；
7. 不做成长报告；
8. 不做管理后台。

---

## 验收标准

1. 用户能从首页进入角色选择；
2. 用户能选择角色；
3. 用户能选择关卡；
4. 用户能进入训练页；
5. 用户能完成 mock 三轮训练；
6. 用户能进入结果页；
7. 用户能从首页进入救急页；
8. 历史记录页有未登录提示或占位内容。

---

## 给 Codex 的任务提示词

```md
请先阅读 AGENTS.md、docs/SPEC.md、docs/PAGE_FLOW.md。

当前只做阶段 1：页面骨架 + Mock 流程。

请完成：
1. 首页 /
2. 角色选择页 /characters
3. 关卡选择页 /characters/[characterType]/levels
4. 三轮训练页 /training/[levelKey]
5. 评分复盘页 /training/[resultId]/result
6. 救急页 /emergency
7. 历史记录页 /history 占位

要求：
- 使用 mock 数据；
- 页面可以完成基本跳转；
- 三轮训练可以用 mock 女友回复和 mock 评分跑通；
- 样式使用 Tailwind；
- 代码清晰，方便后续接入真实数据。

不要做：
- 数据库；
- BetterAuth；
- 真实 AI；
- 复杂评分；
- 游客合并；
- SPEC 之外的功能。

完成后说明：
1. 修改了哪些文件；
2. 如何启动；
3. 如何验证完整页面流程。
```

---

# 阶段 2：角色卡 + 关卡种子数据

## 目标

把页面从“空壳 mock”升级为使用真实角色和真实关卡内容。

---

## 本阶段要做

1. 创建 `src/config/characters.ts`；
2. 写入 5 个女友角色卡；
3. 创建 `src/seed/levels.ts` 或 `src/data/levels.ts`；
4. 写入 15 个关卡种子数据；
5. 角色选择页读取真实角色配置；
6. 关卡选择页读取真实关卡配置；
7. 训练页展示真实关卡背景、开场句、任务目标。

---

## 本阶段不做

1. 不接数据库；
2. 不接 BetterAuth；
3. 不接真实 AI；
4. 不做 seed 入库；
5. 不做后台编辑角色和关卡。

---

## 验收标准

1. 角色选择页展示 5 个角色；
2. 每个角色都有名称、核心难题、训练重点；
3. 每个角色对应 3 个关卡；
4. 关卡页展示真实背景和任务目标；
5. 训练页能展示该关卡的 openingLine；
6. 仍然可以完成 mock 三轮训练。

---

## 给 Codex 的任务提示词

```md
请先阅读 AGENTS.md、docs/SPEC.md、docs/CHARACTERS.md、docs/LEVELS.md。

当前只做阶段 2：角色卡 + 关卡种子数据。

请完成：
1. 创建 src/config/characters.ts；
2. 根据 docs/CHARACTERS.md 写入 5 个角色配置；
3. 创建 src/seed/levels.ts 或 src/data/levels.ts；
4. 根据 docs/LEVELS.md 写入 15 个关卡配置；
5. 页面改为读取这些本地配置数据；
6. 保持阶段 1 的页面流程可运行。

不要做：
- 数据库；
- BetterAuth；
- 真实 AI；
- 管理后台；
- 额外角色；
- 额外关卡。

完成后说明：
1. 修改了哪些文件；
2. 角色和关卡数据在哪里；
3. 如何验证 5 个角色和 15 个关卡。
```

---

# 阶段 3：AI Schema + Mock AI Provider

## 目标

先搭好 AI 架构，但不接真实模型。

重点是：

> 让系统未来接真实 AI 时，不会因为输出格式不稳定而崩。

---

## 本阶段要做

1. 创建 `src/ai/schemas.ts`；
2. 定义 5 个核心 Zod Schema：
   - `InputValidationSchema`
   - `GirlfriendReplySchema`
   - `RoundScoreSchema`
   - `FinalReviewSchema`
   - `EmergencyAnalysisSchema`
3. 创建 `src/ai/provider.ts`；
4. 定义统一 AI Provider 接口；
5. 创建 mock AI provider；
6. 三轮训练页改为调用 mock AI provider；
7. 训练流程使用结构化数据；
8. 加入基础 fallback object。

---

## 本阶段不做

1. 不接真实 AI；
2. 不接数据库；
3. 不接 BetterAuth；
4. 不写复杂 Prompt；
5. 不做真实模型调试。

---

## 验收标准

1. 5 个 Zod Schema 已定义；
2. mock AI provider 使用统一接口；
3. 女友回复和裁判评分分离；
4. 三轮训练能通过 mock provider 完成；
5. 结果页能展示 mock final review；
6. 前端不直接解析 AI 原始文本。

---

## 给 Codex 的任务提示词

```md
请先阅读 AGENTS.md、docs/SPEC.md、docs/AI_SCHEMA.md。

当前只做阶段 3：AI Schema + Mock AI Provider。

请完成：
1. 创建 src/ai/schemas.ts；
2. 定义 InputValidationSchema；
3. 定义 GirlfriendReplySchema；
4. 定义 RoundScoreSchema；
5. 定义 FinalReviewSchema；
6. 定义 EmergencyAnalysisSchema；
7. 创建 src/ai/provider.ts；
8. 定义 AIProvider 接口；
9. 实现 mock AI provider；
10. 让训练流程调用 mock AI provider。

要求：
- 角色扮演和评分分离；
- 所有 mock 输出符合 Zod Schema；
- 前端只消费结构化对象；
- 预留 fallback object。

不要做：
- 真实 AI；
- 数据库；
- BetterAuth；
- 复杂 Prompt；
- SPEC 之外功能。

完成后说明：
1. Schema 文件在哪里；
2. mock provider 文件在哪里；
3. 如何验证三轮训练仍然可用。
```

---

# 阶段 4：接入真实 AI

## 目标

接入真实 AI Provider，让三轮训练可以由 AI 动态生成女友回复和评分。

---

## 本阶段要做

1. 实现真实 AI Provider；
2. 实现 Input Validation Agent；
3. 实现 Girlfriend Response Agent；
4. 实现 Judge Scoring Agent；
5. 实现 Final Review Agent；
6. 所有 AI 输出经过 Zod 校验；
7. 校验失败返回 fallback；
8. 页面不能因为 AI 输出异常崩溃。

---

## 本阶段不做

1. 不接数据库；
2. 不接 BetterAuth；
3. 不做多模型复杂调度；
4. 不做无限聊天；
5. 不做救急转训练；
6. 不做聊天记录保存。

---

## 验收标准

1. 用户输入后可以得到真实 AI 女友回复；
2. 每轮可以得到真实 AI 评分；
3. 三轮结束后可以生成真实复盘；
4. off_topic 输入不会推进剧情；
5. AI 输出异常时 fallback 生效；
6. 页面不崩溃；
7. 女友响应和评分逻辑仍然分离。

---

## 给 Codex 的任务提示词

```md
请先阅读 AGENTS.md、docs/SPEC.md、docs/AI_SCHEMA.md、docs/CHARACTERS.md。

当前只做阶段 4：接入真实 AI。

请完成：
1. 实现真实 AI provider；
2. 实现 validateUserInput；
3. 实现 generateGirlfriendReply；
4. 实现 scoreRound；
5. 实现 generateFinalReview；
6. 所有 AI 输出必须经过 Zod Schema 校验；
7. 校验失败必须返回 fallback object；
8. 保留 mock provider，方便切换测试。

要求：
- Girlfriend Response Agent 只负责女友回复；
- Judge Scoring Agent 只负责评分；
- 不要合并两个 Agent；
- 不要直接 JSON.parse AI 原始输出；
- 页面不能因为 AI 输出异常崩溃。

不要做：
- 数据库；
- BetterAuth；
- 无限自由聊天；
- 救急转训练；
- 多模型复杂调度；
- SPEC 之外功能。

完成后说明：
1. AI provider 如何配置；
2. 需要哪些环境变量；
3. 如何切换 mock / real provider；
4. 如何验证三轮训练和 fallback。
```

---

# 阶段 5：接入 Neon + Drizzle 基础数据层

## 目标

接入数据库基础设施，先把 schema、seed 和基础查询打稳。

注意：

> 本阶段不做正式训练写库，不使用 mock userId 冒充登录保存。

---

## 本阶段要做

1. 配置 Neon 数据库连接；
2. 配置 Drizzle ORM；
3. 创建业务表 schema：
   - `levels`
   - `training_sessions`
   - `dialogue_turns`
   - `score_results`
   - `user_progress`
   - `emergency_analyses`
4. 写入 levels seed；
5. 将本地关卡数据写入 levels 表；
6. 提供按 `characterType` 查询关卡列表的方法；
7. 提供按 `levelKey` 查询单关卡的方法；
8. 为阶段 6 的登录用户训练保存预留数据访问层。

---

## 本阶段不做

1. 不接 BetterAuth；
2. 不做登录用户训练结果写库；
3. 不做游客合并；
4. 不保存救急真实聊天；
5. 不做复杂权限系统；
6. 不做后台管理。

---

## 验收标准

1. 数据库连接成功；
2. `levels` 可以 seed；
3. 可以查询关卡；
4. 可以按 `characterType` 查询关卡列表；
5. 可以按 `levelKey` 查询单关卡；
6. 业务表 schema 与文档一致；
7. 为阶段 6 的正式保存打好基础。

---

## 给 Codex 的任务提示词

```md
请先阅读 AGENTS.md、docs/SPEC.md、docs/DATABASE.md、docs/LEVELS.md。

当前只做阶段 5：接入 Neon + Drizzle 基础数据层。

请完成：
1. 配置 Neon 数据库连接；
2. 配置 Drizzle；
3. 创建业务表 schema；
4. 实现 levels seed；
5. 将本地关卡数据写入 levels 表；
6. 提供按 characterType 查询关卡列表的方法；
7. 提供按 levelKey 查询单关卡的方法；
8. 为阶段 6 的登录用户训练保存预留清晰的数据访问层。

注意：
- BetterAuth 在下一阶段做；
- 登录用户训练正式写库也在下一阶段做；
- 游客合并不在本阶段做；
- 救急内容默认不保存。

不要做：
- BetterAuth；
- 登录用户训练结果写库；
- 游客合并；
- 支付；
- 社区；
- 后台管理；
- 复杂权限系统；
- SPEC 之外功能。

完成后说明：
1. 数据库配置在哪里；
2. Drizzle schema 在哪里；
3. 如何运行 migration / push；
4. 如何 seed levels；
5. 如何验证训练数据已保存。
```

---

# 阶段 6：接入 BetterAuth

## 目标

实现用户注册、登录、退出、登录态保护，以及登录用户训练结果写库。

---

## 本阶段要做

1. 接入 BetterAuth；
2. 实现注册；
3. 实现登录；
4. 实现退出；
5. 实现登录态保持；
6. 服务端获取当前用户；
7. 训练记录绑定真实 userId；
8. `/history` 只能登录访问；
9. 用户只能查看自己的训练记录；
10. 登录用户完成训练后写入 `training_sessions`、`dialogue_turns`、`score_results`、`user_progress`。

---

## 本阶段不做

1. 不做游客合并；
2. 不做社交登录复杂配置，除非实现成本很低；
3. 不做复杂权限系统；
4. 不做会员权限；
5. 不做后台角色管理。

---

## 验收标准

1. 用户可以注册；
2. 用户可以登录；
3. 用户可以退出；
4. 刷新后登录态保持；
5. 未登录访问 `/history` 会被引导登录；
6. 登录用户能看到自己的历史记录；
7. 用户不能查看别人的训练记录；
8. 训练保存时 userId 来自服务端登录态；
9. 登录用户完成训练后能生成正式 `sessionId` 并保存完整训练记录。

---

## 给 Codex 的任务提示词

```md
请先阅读 AGENTS.md、docs/SPEC.md、docs/DATABASE.md。

当前只做阶段 6：接入 BetterAuth。

请完成：
1. 接入 BetterAuth；
2. 实现注册页面；
3. 实现登录页面；
4. 实现退出功能；
5. 服务端获取当前用户；
6. 将训练保存逻辑接入真实 userId；
7. 保护 /history；
8. 用户只能查看自己的训练记录；
9. 登录用户完成训练后保存 training_sessions、dialogue_turns、score_results、user_progress。

不要做：
- 游客合并；
- 会员；
- 支付；
- 后台；
- 社区；
- 复杂权限系统；
- SPEC 之外功能。

完成后说明：
1. BetterAuth 配置在哪里；
2. 认证相关表如何处理；
3. 如何注册登录；
4. 如何验证用户只能查看自己的记录。
```

---

# 阶段 7：游客登录保存

## 目标

解决游客完成训练后，登录保存时数据不丢的问题。

---

## 本阶段要做

1. 游客训练数据保存到 `localStorage`；
2. 结果页提供“登录保存”；
3. 登录成功后返回结果页；
4. 实现 `mergeGuestProgress`；
5. 将 localStorage 中的训练记录写入数据库；
6. 绑定当前 userId；
7. 保存成功后清除 localStorage；
8. 显示保存成功提示。

---

## 本阶段不做

1. 不做游客数据直接入库；
2. 不做 guest_sessions 表；
3. 不做游客跨设备保存；
4. 不做复杂冲突合并；
5. 不做多条游客历史批量合并。

---

## 验收标准

1. 游客可以完成一关训练；
2. 训练结果可以暂存 localStorage；
3. 游客点击登录保存；
4. 登录成功后数据写入数据库；
5. 保存后 localStorage 清除；
6. `/history` 能看到刚才那条记录；
7. 刷新后记录不丢。

---

## 给 Codex 的任务提示词

```md
请先阅读 AGENTS.md、docs/SPEC.md、docs/DATABASE.md、docs/PAGE_FLOW.md。

当前只做阶段 7：游客登录保存。

请完成：
1. 游客完成训练后，将当次训练数据保存到 localStorage；
2. 在结果页提供“登录保存”按钮；
3. 登录成功后返回结果页；
4. 实现 mergeGuestProgress；
5. 将 localStorage 中的数据写入 training_sessions、dialogue_turns、score_results；
6. 绑定当前登录 userId；
7. 保存成功后清除 localStorage；
8. 保存成功后提示用户。

不要做：
- guest_sessions 表；
- 游客跨设备保存；
- 批量游客历史合并；
- 复杂冲突合并；
- SPEC 之外功能。

完成后说明：
1. localStorage 数据结构；
2. mergeGuestProgress 在哪里；
3. 如何验证游客训练后登录保存成功。
```

---

# 阶段 8：救急模式

## 目标

实现真实聊天救急分析，且隐私边界正确。

---

## 本阶段要做

1. `/emergency` 输入真实聊天；
2. 调用 Emergency Analysis Agent；
3. 返回：
   - 检测情绪；
   - 潜台词；
   - 雷区；
   - 回复策略；
   - 示例回复；
   - 不建议说的话。
4. 默认不保存真实聊天；
5. 用户主动勾选保存后才写入数据库；
6. 未登录用户保存时先登录；
7. 登录后保存到 `emergency_analyses`。

---

## 本阶段不做

1. 不做微信导入；
2. 不做截图 OCR；
3. 不做自动代发；
4. 不做长期聊天管理；
5. 不默认保存真实聊天；
6. “转为模拟训练”可预留按钮，但不必须实现。

---

## 验收标准

1. 用户能输入一段真实聊天；
2. AI 能返回结构化救急分析；
3. 分析结果包含情绪、潜台词、雷区、建议回复；
4. 默认不写入数据库；
5. 用户主动确认后才保存；
6. 未登录用户保存时先登录；
7. 登录后能保存救急分析；
8. 不输出 PUA、操控或欺骗建议。

---

## 给 Codex 的任务提示词

```md
请先阅读 AGENTS.md、docs/SPEC.md、docs/AI_SCHEMA.md、docs/DATABASE.md。

当前只做阶段 8：救急模式。

请完成：
1. /emergency 页面输入真实聊天；
2. 调用 analyzeEmergencyMessage；
3. 使用 EmergencyAnalysisSchema 校验输出；
4. 展示情绪、潜台词、雷区、回复策略、示例回复、不建议说的话；
5. 默认不保存真实聊天；
6. 用户主动勾选保存后才保存；
7. 未登录用户保存时引导登录；
8. 保存到 emergency_analyses 表。

不要做：
- 微信导入；
- 截图 OCR；
- 自动代发消息；
- 默认保存真实聊天；
- 无限聊天；
- PUA 或操控建议；
- SPEC 之外功能。

完成后说明：
1. 救急分析流程；
2. 数据什么时候保存；
3. 如何验证默认不保存；
4. 如何验证主动确认后保存。
```

---

# 4. 推荐执行顺序

严格建议按以下顺序：

```txt
阶段 1：页面骨架 + Mock 流程
阶段 2：角色卡 + 关卡种子数据
阶段 3：AI Schema + Mock AI Provider
阶段 4：接入真实 AI
阶段 5：接入 Neon + Drizzle 基础数据层
阶段 6：接入 BetterAuth + 登录用户训练保存
阶段 7：游客登录保存
阶段 8：救急模式
```

不要跳过阶段 3 直接接真实 AI。

不要在阶段 1 就接数据库和认证。

---

# 5. 每阶段完成后的通用检查

每完成一个阶段，都检查：

1. 项目能否启动；
2. 当前主流程是否还能跑通；
3. 是否新增了 SPEC 之外的功能；
4. 是否破坏了上一阶段功能；
5. 是否有明显安全或隐私问题；
6. 是否有未处理的 error/loading 状态；
7. 是否有后续阶段需要注意的技术债。

---

# 6. 总结

第 8 项的核心不是写功能，而是控制开发节奏。

最重要原则：

> Codex 每次只做一个阶段，每个阶段都要有明确边界和验收标准。

当前项目最推荐的第一条 Codex 任务是：

```txt
请执行阶段 1：页面骨架 + Mock 流程。
```
