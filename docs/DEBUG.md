# DEBUG NOTES

## 0. 调试前强制停顿

执行任何修复前，必须先回答：

1. 错误发生在哪一段链路？
2. 最小复现步骤是什么？
3. 修复会影响哪些文件？
4. 是否可以先加日志再改逻辑？
5. 这是配置、网络、schema、代码还是数据问题？

## 1. Scope

本文档整理 Stage 4 到 Stage 6 的关键调错经验，并沉淀成可复用排查套路。

## 2. OAuth / Google 登录调试

### 2.1 redirect_uri_mismatch

优先检查 Google Console：

* `Authorized redirect URIs`
* 本地回调通常应为：
  * `http://localhost:3000/api/auth/callback/google`

注意区分：

* `Authorized JavaScript origins`
* `Authorized redirect URIs`

它们不是同一个配置。

### 2.2 invalid_code / please_restart_the_process

不能只看页面错误。

必须同时检查：

* 浏览器跳转现象
* BetterAuth callback 行为
* 终端真实错误
* Node 服务端网络链路

### 2.3 auth-debug 日志经验

调试 callback 时，以下字段最有价值：

* `hasCookie`
* `hasState`
* `hasCode`
* `repeatedCallback`

如果这些都正常，但登录仍失败，就不要继续猜前端页面逻辑。

### 2.4 本次真实根因

本次真实根因：

* Node / Next 服务端无法连接 `oauth2.googleapis.com:443`
* 浏览器能访问 Google，不代表 Node 服务端能访问 Google
* 需要确认代理 / VPN / `HTTPS_PROXY` / `HTTP_PROXY`

## 3. 数据库迁移与 Seed 排查

固定顺序：

`schema -> db:generate -> 检查 migration -> db:migrate -> seed`

解释：

* schema 是表结构图纸
* migration 是 SQL 施工文件
* migrate 是真正改 Neon
* seed 是写初始数据
* repository 是数据库读写封装
* API/server page 是业务入口
* UI 是最终展示

硬规则：

* `db:migrate` / `db:push` / `db:seed` 必须先得到用户确认
* migration 中出现 `DROP` / `DELETE` / `TRUNCATE` 必须停下来
* Neon 项目必须通过 `DATABASE_URL` host 判断，不能靠项目名

## 4. 认证与用户数据安全

必须继续遵守：

* 前端不得传 `userId`
* `userId` 必须来自 BetterAuth `session.user.id`
* `/history` 必须按当前 `session.user.id` 查询
* 未登录用户不写正式用户表
* 游客合并留到 Stage 7

## 5. AI Provider 稳定接入

固定顺序：

1. 先 Schema
2. 再 Mock
3. 再 Real Provider

必须继续遵守：

* AI 输出必须过 Zod Schema
* fallback 必须存在
* 用户可见内容必须中文
* AI action 要记录耗时
* 不要把真实 AI 接入和业务链路问题混在一起