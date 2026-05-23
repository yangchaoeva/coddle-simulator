# DEBUG NOTES

## 1. Scope

本文档整理 Stage 4 到 Stage 6 期间的重要调错经验，覆盖：

* 真实 AI Provider
* loading / latency
* Neon + Drizzle
* BetterAuth + Google OAuth
* 登录用户训练保存

## 2. Google OAuth 调错经验

### 2.1 redirect_uri_mismatch

优先检查 Google Console 的 `Authorized redirect URIs`。

本地应为：

* `http://localhost:3000/api/auth/callback/google`

### 2.2 invalid_code / please_restart_the_process

不能只看页面错误。

必须同时看：

* 浏览器现象
* 终端真实错误
* 服务端网络链路

### 2.3 auth-debug 日志经验

排查 callback 时，这几项很关键：

* `hasCookie`
* `hasState`
* `hasCode`
* `repeatedCallback`

如果这几项都正常，但仍然失败，就不要继续猜前端页面逻辑。

### 2.4 本次真实根因

本次真实根因是：

* Node / Next 服务端无法连接 `oauth2.googleapis.com:443`
* 浏览器能访问 Google，不代表 Node 服务端能访问 Google
* 需要确认代理 / VPN / `HTTPS_PROXY` / `HTTP_PROXY`

## 3. Stage 4-6 稳定性经验

### 3.1 先保 Schema，再调模型

必须坚持：

* AI 输出先过 Zod Schema
* Schema 失败走 fallback
* 前端只消费结构化结果
* 不要直接 `JSON.parse(aiResponse)`

### 3.2 角色回复和评分必须分离

必须坚持双 Step：

1. Girlfriend Response Agent 只负责回复
2. Judge Scoring Agent 只负责评分

### 3.3 loading 是稳定性的一部分

真实 AI 接入后必须保留：

* 分阶段 loading 文案
* 慢响应提示
* 提交锁
* fallback 提示

## 4. 数据库 migration / seed 注意事项

数据库流程必须按顺序处理：

`schema -> db:generate -> 检查 migration -> db:migrate -> seed`

说明：

* schema 是表结构图纸
* migration 是 SQL 施工文件
* migrate 是真正改 Neon
* seed 是写初始数据
* repository 是数据库读写封装
* API/server page 是业务入口
* UI 是最终展示

补充注意：

* 先改 schema，不等于数据库已经变更
* 先看 migration，再执行 migrate
* migrate 和 seed 不能跳步骤
* `db:migrate`、`db:push`、`db:seed` 必须等用户确认后执行

## 5. 当前系统边界

当前已完成：

* 真实 AI 可用
* Google 登录可用
* 登录用户训练保存可用
* `/history` 当前用户历史可用

当前未做：

* 游客合并未做
* emergency 保存未做
* `user_progress` 统计未做
* 付费、管理员、复杂权限未做
