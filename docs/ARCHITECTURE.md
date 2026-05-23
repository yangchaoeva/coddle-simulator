# ARCHITECTURE

## ADR-001：AI 输出必须经过 Zod Schema

**Decision**

所有 AI 输出必须先经过 Zod Schema 校验，失败时必须走 fallback。

**Reason**

真实模型输出不稳定，字段缺失、类型漂移和枚举越界都会直接污染业务链路。

**Applies to**

* 女友回复
* 回合评分
* 最终复盘
* 救急分析

**Must not break**

* 前端只能消费结构化结果
* 不允许直接 `JSON.parse(aiResponse)` 后进入业务

**Future notes**

后续更换模型、Provider 或 prompt 时，Schema 仍然是第一道边界。

## ADR-002：先 Mock Provider，再接 Real Provider

**Decision**

AI 接入顺序固定为：先 Schema，再 Mock Provider，再 Real Provider。

**Reason**

先把调用接口和数据结构打稳，才能分离“模型问题”和“业务链路问题”。

**Applies to**

* 训练链路
* 救急链路
* 后续模型替换

**Must not break**

* Mock 和 Real Provider 必须共享同一接口形状
* 不能跳过 Mock 直接重构业务页

**Future notes**

后续增加新 AI action 时，也应先补 Schema 和 Mock。

## ADR-003：userId 必须来自 BetterAuth session，前端不得传 userId

**Decision**

正式写库用户身份只能由服务端通过 BetterAuth `session.user.id` 决定，前端不得传 `userId`。

**Reason**

身份归属属于服务端安全边界，不能交给 query string、localStorage 或前端参数。

**Applies to**

* 训练保存
* `/history`
* 后续游客合并
* 后续 emergency 保存

**Must not break**

* API 不得接收 `userId`
* `/history` 不得按前端传参查询

**Future notes**

Stage 7 做游客合并时，也必须保持这个边界。

## ADR-004：训练记录拆成 training_sessions / dialogue_turns / score_results

**Decision**

训练结果采用三层拆分：

* `training_sessions`
* `dialogue_turns`
* `score_results`

**Reason**

训练本身有会话级数据、回合级数据和最终评分级数据，拆开后查询、幂等、补齐和后续统计都更清晰。

**Applies to**

* 登录用户训练保存
* `/history`
* 后续进度统计

**Must not break**

* 不要把三轮训练压成单个大 JSON 字段替代正式结构
* 不要把最终评分和回合评分混在同一层

**Future notes**

后续 `user_progress` 应基于这三层数据聚合，而不是额外维护一套影子结构。

## ADR-005：Stage 6 拆成 6A 登录闭环和 6B 训练保存

**Decision**

Stage 6 拆成两段：

* Stage 6A：BetterAuth + Google 登录闭环
* Stage 6B：登录用户训练保存 + history

**Reason**

登录链路和业务写库链路是两个不同问题，一起做会让调试范围失控。

**Applies to**

* 认证接入
* 训练保存
* history 查询

**Must not break**

* 6A 不提前做训练保存
* 6B 不反过来重构登录闭环

**Future notes**

后续需要继续沿用“先闭环、再扩功能”的分阶段策略。

## ADR-006：数据库变更使用 generate -> review migration -> migrate，不直接随意 push

**Decision**

数据库变更流程固定为：

`schema -> db:generate -> review migration -> db:migrate`

不直接随意 `db:push`。

**Reason**

`db:push` 容易跳过 SQL 审查，无法对潜在破坏性操作建立人工检查点。

**Applies to**

* 表结构变更
* 认证表变更
* 业务表变更

**Must not break**

* migration 出现 `DROP` / `DELETE` / `TRUNCATE` 时必须停下来审查
* 执行 `db:migrate` 前必须得到用户确认

**Future notes**

后续即使使用更自动化的迁移工具，也必须保留 review 环节。

## ADR-007：游客合并推迟到 Stage 7，Stage 6B 不做自动补写

**Decision**

Stage 6B 只做登录用户训练保存，不做游客训练结果登录后自动补写；游客合并推迟到 Stage 7。

**Reason**

游客合并涉及本地数据结构、幂等键、归属校验、回滚策略和冲突处理，不适合夹在登录保存里一起做。

**Applies to**

* Stage 6B
* Stage 7 设计评审

**Must not break**

* 未登录用户训练结果仍只本地展示
* 不得偷偷把游客结果写进正式用户表

**Future notes**

进入 Stage 7 前必须先做设计评审，明确合并入口、幂等策略和失败补偿。