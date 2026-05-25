# ARCHITECTURE

## ADR-001：AI 输出必须经过 Zod Schema

### Decision

所有 AI 输出必须先经过 Zod Schema 校验，失败时必须进入 fallback。

### Reason

真实模型输出不稳定，字段缺失或类型漂移会直接污染业务链路。

### Applies to

- 女友回复
- 单轮评分
- 最终复盘
- 救急分析

### Must not break

- 前端只消费结构化结果
- 不允许直接 `JSON.parse(aiResponse)` 后进入业务逻辑

## ADR-002：先 Mock Provider，再接 Real Provider

### Decision

AI 接入顺序固定为：先 Schema，再 Mock Provider，再 Real Provider。

### Reason

先打通接口形状和结构，才能把“模型问题”和“业务链路问题”分开。

## ADR-003：正式数据归属必须由服务端决定

### Decision

正式写库的用户身份只能由服务端通过 BetterAuth `session.user.id` 决定。

### Reason

前端身份不可信，不能由 query string、localStorage 或前端参数决定数据归属。

### Must not break

- API 不接收前端传入的 `userId`
- 页面查询不按前端参数决定用户归属

## ADR-004：训练记录拆分为三层结构

### Decision

训练结果正式拆分为：

- `training_sessions`
- `dialogue_turns`
- `score_results`

### Reason

训练天然包含会话层、回合层和最终评分层，拆开后更利于查询、幂等和统计。

## ADR-005：Stage 6 拆为登录闭环与训练保存闭环

### Decision

Stage 6 分为：

- Stage 6A：BetterAuth + Google 登录闭环
- Stage 6B：登录用户训练保存 + `/history`

### Reason

认证闭环和业务写库是两条不同链路，拆开后调试边界更清晰。

## ADR-006：数据库变更必须经过 generate -> review migration -> migrate

### Decision

数据库变更流程固定为：

`schema -> db:generate -> review migration -> db:migrate`

### Reason

必须保留 SQL 审查点，避免无检查地执行破坏性变更。

## ADR-007：游客合并推迟到后续阶段

### Decision

Stage 6B 只做登录用户训练保存，不做游客结果自动补写；游客合并延后到后续阶段。

### Reason

游客合并涉及本地数据结构、幂等、归属校验和回滚策略，不应夹在登录保存闭环里一起做。

## ADR-008：正式结果页必须按 resultId 定位

### Decision

正式结果页必须按 `resultId` 定位训练结果，而不是按 `levelKey`。

### Reason

`levelKey` 表示关卡，不表示某一次训练结果。同一关卡可训练多次，只有 `resultId` 才能唯一定位。

## ADR-009：游客结果保存采用手动确认

### Decision

游客结果登录后保存采用手动确认，不做静默自动合并。

### Reason

可以避免用户不知情写库，也避免本地批量误写入。

## ADR-010：本地 syncStatus 只用于 UI 状态

### Decision

本地 `syncStatus` 只用于 UI 展示；真正的归属和幂等保障由服务端保存链路保证。

### Reason

localStorage 不是最终真相来源，只能作为前端展示态的辅助标记。

## ADR-011：救急历史独立于训练历史

### Decision

救急分析历史独立使用 `/emergency/history`，不混入 `/history`。

### Reason

训练记录和救急分析是两类不同数据，字段结构、展示方式和后续演进方向不同。

## ADR-012：救急分析保存必须手动触发

### Decision

救急分析保存必须由登录用户手动点击触发，不做自动静默保存。

### Reason

救急输入可能包含真实聊天隐私，用户必须明确知道本次分析会保存到账号。

## ADR-013：emergency_analyses 的 userId 只来自服务端 session

### Decision

`emergency_analyses.userId` 只能由服务端通过 BetterAuth `session.user.id` 获取。

### Reason

保存和查询都必须按服务端 session 做数据隔离。

## ADR-014：救急分析正式保存到 emergency_analyses

### Decision

救急分析正式保存到 `emergency_analyses`，不复用训练表。

### Reason

救急分析与训练记录是两类不同数据，不应强行混表。

## ADR-015：userConsentedToSave 由服务端设置

### Decision

`userConsentedToSave` 由服务端在正式写入 `emergency_analyses` 时设置。

### Reason

这个字段代表正式保存行为是否发生，不应由前端自行声明。

## 认证与数据归属原则

- 前端不传 `userId`
- `userId` 只来自服务端 BetterAuth session
- 前端 session 只用于 UI 展示，不作为正式保存开关
- `/history` 固定按服务端 `session.user.id` 查询

### 解释

- 前端看到“已登录”只代表可以展示登录相关 UI，不代表允许以前端状态决定数据归属。
- 任何正式写库动作都必须由服务端重新确认 session。
- 任何历史查询都必须由服务端按当前 session 限定数据范围。

## 训练结果保存状态原则

- 训练结果先本地保存
- 已登录时自动 `POST /api/training-sessions`
- 服务端返回 `created` / `completed` 后，本地执行 `markTrainingResultAsSynced`
- `unauthorized` 不标记已保存
- `error` 不标记已保存

### 解释

- 本地先保存，是为了保证结果页和游客体验完整。
- 自动保存是登录用户的正式写库链路。
- 结果页是否显示“已保存”，不能只看当前是否登录，必须看本地结果是否已被标记为同步完成。
- 如果服务端没有明确返回成功，则不能把本地结果误标为已保存。
