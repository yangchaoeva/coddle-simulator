# DEBUG NOTES

## 1. Scope

本文档整理 Stage 4 到 Stage 6 期间的重要调错经验，重点覆盖：

* 真实 AI Provider
* loading / 响应速度
* Neon + Drizzle
* BetterAuth + Google OAuth
* 登录用户训练保存

## 2. Stage 4-6 重要调错经验

### 2.1 先保 Schema，再调模型

AI 输出最容易出的问题不是“完全没结果”，而是“结构看起来像对，但字段缺失或类型漂移”。

必须坚持：

* 所有 AI 输出先过 Zod Schema
* 失败时走 fallback object
* 前端只消费结构化结果
* 不要直接 `JSON.parse(aiResponse)`

### 2.2 角色回复和评分必须拆开

实践证明，把角色扮演和评分混在一个 Agent 里，最容易出现：

* 女友说出裁判口吻
* 评分逻辑污染角色语气
* prompt 越改越难控

所以必须坚持双 Step：

1. Girlfriend Response Agent 只负责回复
2. Judge Scoring Agent 只负责评分

### 2.3 loading 不是装饰，是流程稳定性的一部分

真实 AI 接入后，用户最容易误判为“页面卡死”。

已经验证有效的处理方式：

* 分阶段 loading 文案
* 慢响应提示
* 训练轮次提交锁
* fallback 提示和正常结果分开展示

### 2.4 先把数据库基础层打稳，再接登录保存

Stage 5 的经验是：

* 先把 schema、seed、查询接口稳定下来
* 再做 BetterAuth
* 再做训练保存

不要在认证边界没清楚前直接从前端写业务表。

## 3. Google OAuth 调错经验

### 3.1 先排 redirect URI

`redirect_uri_mismatch` 首先检查 Google Console 的 `Authorized redirect URIs`。

本地常用回调地址必须和 BetterAuth 实际回调一致，例如：

* `http://localhost:3000/api/auth/callback/google`

### 3.2 浏览器能访问 Google，不代表 Node 服务端能访问

本地 OAuth 成功发起但 callback 失败时，不能只看浏览器。

必须区分：

* 浏览器侧网络
* Node / Next 服务端网络

本次定位结论是：

* Google 登录问题最终不是 BetterAuth 配置错误
* 而是本地 Node 网络代理问题

### 3.3 callback 参数正常但仍报 invalid_code，要怀疑服务端网络链路

如果 callback 阶段已经满足：

* `hasCookie = true`
* `hasState = true`
* `hasCode = true`

但仍然失败，重点检查：

* 服务端代理
* 服务端 DNS / 出网能力
* Node 对 `oauth2.googleapis.com` 的访问

### 3.4 不要输出 secret

OAuth 调试时不要：

* 截图或粘贴 client secret
* 提交 `.env.local`
* 在日志里输出 access token / refresh token / session token

## 4. 数据库 migration / seed 注意事项

### 4.1 先区分“定义 schema”和“执行 migration”

代码里改了 Drizzle schema，不等于数据库已经变更。

要明确区分：

* 修改 `src/db/schema.ts`
* 生成 migration
* 执行 migration
* seed 数据

### 4.2 Stage 5/6 的基本策略

稳定做法：

1. 先确认 schema
2. 再生成 migration
3. 再执行 migration
4. 最后 seed

不要在需求还没收口时反复改表。

### 4.3 levels seed 和认证表不要混着排查

排查数据库问题时，分开看：

* BetterAuth 表问题
* 业务表问题
* levels seed 问题

不要把“登录失败”和“训练保存失败”混成一个问题。

## 5. Stage 6B 保存边界经验

### 5.1 userId 只能来自 session

这是当前最硬的规则之一：

* 前端不能传 `userId`
* 保存接口不能接收 `userId`
* `/history` 不能靠 query string、localStorage 或前端传参决定用户

只能由服务端通过 BetterAuth `session.user.id` 决定。

### 5.2 resultId 要当作幂等键，但必须校验归属

已验证的边界：

* `resultId` 已存在且属于当前用户：允许返回已保存或补齐缺失子表
* `resultId` 已存在但属于其他用户：必须拒绝，不能覆盖

### 5.3 先做登录用户正式保存，不提前做游客合并

Stage 6B 必须保持收口：

* 已登录用户：正式写库
* 未登录用户：只本地展示
* 不提前做游客结果补写

## 6. 当前硬性规则

当前必须持续遵守：

* 前端不能传 `userId`
* `userId` 必须来自 session
* `.env.local` 不得提交
* 不得提前做游客合并
* emergency 保存留到 Stage 8

## 7. 下一阶段提醒

下一阶段建议是 Stage 7：游客训练结果登录后合并。

但在开始 Stage 7 之前，必须先做设计评审，不要直接编码。重点先定：

1. 游客本地数据结构
2. 合并入口
3. 幂等策略
4. 冲突处理
5. 回滚策略
