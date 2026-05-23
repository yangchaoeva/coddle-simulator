# ARCHITECTURE

## ADR-001：AI 输出必须经过 Zod Schema

**Decision**

所有 AI 输出必须先经过 Zod Schema 校验，失败时必须走 fallback。

**Reason**

真实模型输出不稳定，字段缺失或类型漂移会直接污染业务链路。

**Applies to**

* 女友回复
* 回合评分
* 最终复盘
* 救急分析

**Must not break**

* 前端只消费结构化结果
* 不允许直接 `JSON.parse(aiResponse)` 后进入业务

**Future notes**

更换模型、Provider 或 prompt 时，这条边界不变。

## ADR-002：先 Mock Provider，再接 Real Provider

**Decision**

AI 接入顺序固定为：先 Schema，再 Mock Provider，再 Real Provider。

**Reason**

先打通接口形状和结构，才能把“模型问题”和“业务链路问题”分开。

**Applies to**

* 训练链路
* 救急链路

**Must not break**

* Mock 和 Real Provider 共享同一接口形状

**Future notes**

后续新增 AI action 时，也先补 Schema 和 Mock。

## ADR-003：userId 必须来自 BetterAuth session，前端不得传 userId

**Decision**

正式写库用户身份只能由服务端通过 BetterAuth `session.user.id` 决定。

**Reason**

前端身份不可信，不能由 query string、localStorage 或前端参数决定数据归属。

**Applies to**

* 训练保存
* 救急保存
* `/history`
* `/emergency/history`

**Must not break**

* API 不得接收 `userId`
* 页面查询不得按前端传参决定用户

**Future notes**

后续加详情、删除或筛选，这条边界仍成立。

## ADR-004：训练记录拆成 training_sessions / dialogue_turns / score_results

**Decision**

训练结果拆成三层正式结构：

* `training_sessions`
* `dialogue_turns`
* `score_results`

**Reason**

训练天然包含会话层、回合层和最终评分层，拆开后查询、幂等和统计更清晰。

**Applies to**

* Stage 6B
* 训练历史

**Must not break**

* 不把三轮训练压成一个大 JSON 替代正式结构

**Future notes**

后续 `user_progress` 应基于这三层聚合。

## ADR-005：Stage 6 拆成 6A 登录闭环和 6B 训练保存

**Decision**

Stage 6 分成：

* Stage 6A：BetterAuth + Google 登录闭环
* Stage 6B：登录用户训练保存 + `/history`

**Reason**

认证闭环和业务写库是两段不同链路，拆开后调试范围更可控。

**Applies to**

* 登录
* 训练保存
* 训练历史

**Must not break**

* 6A 不提前做训练保存
* 6B 不反过来重构登录闭环

**Future notes**

后续继续沿用“先闭环，再扩功能”的阶段法。

## ADR-006：数据库变更使用 generate -> review migration -> migrate

**Decision**

数据库变更流程固定为：

`schema -> db:generate -> review migration -> db:migrate`

不随意直接 `db:push`。

**Reason**

需要保留 SQL 审查点，避免无检查地执行破坏性变更。

**Applies to**

* 所有 schema 变更

**Must not break**

* migration 出现 `DROP` / `DELETE` / `TRUNCATE` 时必须停下来
* 执行 `db:migrate` 前必须得到用户确认

**Future notes**

即使工具升级，也不能去掉 review 环节。

## ADR-007：游客合并推迟到 Stage 7，Stage 6B 不做自动补写

**Decision**

Stage 6B 只做登录用户训练保存，不做游客结果自动补写；游客合并推迟到 Stage 7。

**Reason**

游客合并涉及本地数据结构、幂等、归属校验和回滚策略，不适合夹在 Stage 6B 一起做。

**Applies to**

* Stage 6B
* Stage 7

**Must not break**

* 未登录训练结果仍只本地展示

**Future notes**

进入 Stage 7 前必须先做设计评审。

## ADR-008：结果页必须按 resultId 定位，而不是按 levelKey 定位

**Decision**

正式结果页必须按 `resultId` 定位本地训练结果。

**Reason**

`levelKey` 表示关卡，不表示某次训练结果。同一关卡可训练多次，只有 `resultId` 才能唯一定位。

**Applies to**

* `/training/result/[resultId]`
* 游客结果保存

**Must not break**

* 不得继续把 `/training/[levelKey]/result` 当正式结果页扩展

**Future notes**

后续回放、分享或历史联动都应继续沿用 `resultId`。

## ADR-009：游客结果保存采用手动保存，而不是自动静默合并

**Decision**

游客结果登录后保存采用手动确认，不做自动静默合并。

**Reason**

这样能避免用户不知情写库，也能避免批量误写入。

**Applies to**

* Stage 7A
* Stage 7B

**Must not break**

* 不得批量扫描并自动写入所有本地结果

**Future notes**

若后续要做更自动化的合并，必须先做评审和回滚设计。

## ADR-010：本地 syncStatus 只作为 UI 状态，真正幂等由服务端 resultId 保证

**Decision**

本地 `syncStatus` 只用于 UI 展示；真正幂等和归属保护由服务端 `resultId` 机制保证。

**Reason**

localStorage 不可信，也不是最终真相来源。

**Applies to**

* Stage 7A
* Stage 7B

**Must not break**

* 本地状态丢失不能导致越权或覆盖
* 保存失败不能误标为已同步

**Future notes**

服务端数据库始终是最终状态来源。

## ADR-011：救急历史独立使用 /emergency/history，而不是混入 /history

**Decision**

救急分析历史独立使用 `/emergency/history`，不先混入 `/history`。

**Reason**

训练历史和救急分析是两类不同记录，展示字段不同。先保持信息架构清晰，避免 `/history` 过早复杂化。

**Applies to**

* Stage 8B
* 救急历史入口

**Must not break**

* `/history` 继续保留训练历史定位

**Future notes**

若后续要统一历史中心，必须先做新的信息架构评审。

## ADR-012：救急分析保存必须手动触发

**Decision**

救急分析保存必须由登录用户手动点击触发，不做自动静默保存。

**Reason**

救急输入可能包含真实聊天隐私，用户应明确知道本次分析会保存到账号。

**Applies to**

* Stage 8A
* `/emergency`

**Must not break**

* 未登录用户不自动写库
* 已登录用户不因生成分析就自动写入 `emergency_analyses`

**Future notes**

后续新增更多救急记录能力，也必须保持手动触发保存。

## ADR-013：emergency_analyses 的 userId 必须来自 BetterAuth session

**Decision**

`emergency_analyses` 的 `userId` 只能由服务端通过 BetterAuth `session.user.id` 获取。

**Reason**

前端身份不可信；保存和查询都必须按 `session.user.id` 做数据隔离。

**Applies to**

* `POST /api/emergency-analyses`
* `/emergency/history`

**Must not break**

* 前端不得传 `userId`
* 不得通过 query string、localStorage 或前端参数决定 emergency 记录归属

**Future notes**

后续即使增加详情页或删除操作，这条边界也不能变。