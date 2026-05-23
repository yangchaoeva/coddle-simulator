# STABILITY NOTES

## 1. Current Baseline

当前项目已完成：

* Stage 1：页面骨架 + Mock
* Stage 2：角色与关卡
* Stage 3：AI Schema + Mock Provider
* Stage 4：真实 AI Provider
* Stage 4.5：AI loading + latency
* Stage 5：Neon + Drizzle
* Stage 6A：BetterAuth + Google 登录
* Stage 6B：登录用户训练保存 + history

## 2. Stable Delivery Pattern

当前验证有效的交付模式：

1. 先计划
2. 再执行
3. 再审查
4. 再验收
5. 再提交

分工建议：

* Codex：执行
* ChatGPT：审查
* 用户：决策

大任务必须先计划，不得直接写代码。

## 3. AI Stability

已经验证有效的 AI 接入顺序：

1. 先 Schema
2. 再 Mock Provider
3. 再 Real Provider
4. 再调 latency / loading

必须持续遵守：

* AI 输出必须过 Zod Schema
* fallback 必须存在
* 用户可见内容必须中文
* AI action 要记录耗时
* 不要把 AI 接入和业务链路问题混在一起排查

## 4. Auth and Data Safety

必须持续遵守：

* 前端不得传 `userId`
* 正式写库的 `userId` 必须来自 BetterAuth `session.user.id`
* `/history` 必须按当前 `session.user.id` 查询
* 未登录用户不写正式用户表
* 游客合并留到 Stage 7

## 5. Database Safety

固定流程：

`schema -> db:generate -> 检查 migration -> db:migrate -> seed`

必须持续遵守：

* `db:migrate` / `db:push` / `db:seed` 必须等用户确认
* migration 中出现 `DROP` / `DELETE` / `TRUNCATE` 必须停下来
* Neon 项目必须通过 `DATABASE_URL` host 判断，不能靠项目名

## 6. OAuth Stability

Google OAuth 排查顺序：

1. Google Console 配置
2. callback 参数
3. BetterAuth / 终端日志
4. Node 服务端出网能力

关键经验：

* 浏览器能访问 Google，不代表 Node 服务端能访问 `oauth2.googleapis.com`
* 本次真实根因是 Node / Next 服务端到 `oauth2.googleapis.com:443` 不通
* 需要检查代理 / VPN / `HTTPS_PROXY` / `HTTP_PROXY`

## 7. Current Non-Goals

当前仍未做：

* 游客合并
* emergency 保存
* `user_progress` 统计
* 付费、管理员、复杂权限