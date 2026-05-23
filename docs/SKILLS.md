# SKILLS

## Skill 1：阶段式 AI 开发管理

目标：把复杂任务拆成可审查、可回滚、可验收的阶段，而不是直接写代码。

规则：

1. 先计划、再执行、再审查、再验收、再提交。
2. Codex 负责执行，ChatGPT 负责审查，用户负责最终决策。
3. 大任务必须先出计划，不得直接写代码。
4. 每个阶段都要明确：
   * 范围
   * 非目标
   * 验收标准
   * 回滚边界
5. 没有设计评审通过前，不得提前进入下一阶段。

适用场景：

* 认证接入
* 数据库写库链路
* 游客合并
* AI Provider 替换或升级

## Skill 2：Codex 执行结果审查

每次执行后至少检查：

1. 改了哪些文件。
2. 是否越界实现。
3. 是否改了 `.env.local`。
4. 是否输出 secret。
5. 是否执行了危险命令。
6. 是否通过 `tsc` / `build`。
7. 是否仍需要人工验收。

审查输出建议固定包含：

* 文件清单
* 风险点
* 验证结果
* 是否可提交

## Skill 3：数据库迁移安全

固定流程：

`schema -> db:generate -> 检查 migration -> db:migrate -> seed`

规则：

1. `db:migrate` / `db:push` / `db:seed` 必须先得到用户确认。
2. migration 中出现 `DROP` / `DELETE` / `TRUNCATE` 必须停下来先审查。
3. 不能把“改 schema”和“改数据库”视为同一件事。
4. Neon 项目必须通过 `DATABASE_URL` 的 host 判断目标环境，不能靠项目名猜测。
5. 先检查 migration，再执行 migrate。

## Skill 4：OAuth / Google 登录调试

固定排查顺序：

1. 先查 Google Console。
2. 再查 callback 参数。
3. 再查 BetterAuth / 服务端日志。
4. 最后查 Node 出网链路。

关键点：

* `redirect_uri_mismatch` 优先检查 `Authorized redirect URIs`
* `Authorized JavaScript origins` 和 `Authorized redirect URIs` 不是一回事
* `invalid_code` / `please_restart_the_process` 不能只看页面错误，要看终端底层错误
* callback 调试时重点看：
  * `hasCookie`
  * `hasState`
  * `hasCode`
  * `repeatedCallback`
* 浏览器能访问 Google，不代表 Node 服务端能访问 `oauth2.googleapis.com`
* 要检查代理、VPN、`HTTPS_PROXY`、`HTTP_PROXY`

## Skill 5：认证与用户数据安全

规则：

1. 前端不得传 `userId`。
2. `userId` 必须来自 BetterAuth `session.user.id`。
3. `/history` 必须按当前 `session.user.id` 查询。
4. 未登录用户不写正式用户表。
5. 游客合并留到 Stage 7。
6. emergency 保存留到 Stage 8。

常见错误：

* 从 query string 决定用户身份
* 从 localStorage 决定正式写库用户
* API 接收前端传来的 `userId`

## Skill 6：AI Provider 稳定接入

稳定接入顺序：

1. 先 Schema
2. 再 Mock
3. 再 Real Provider

规则：

1. AI 输出必须经过 Zod Schema。
2. fallback 必须存在。
3. 用户可见内容必须中文。
4. AI action 要记录耗时。
5. 不要把真实 AI 接入问题和业务链路问题混在一起排查。
6. 角色回复和评分必须分离。

## Skill 7：游客结果登录后保存流程

标准流程：

1. 先确保 `resultId` 精确定位。
2. 再做登录回跳。
3. 再做手动保存。
4. 再做同步状态展示。
5. 不做自动批量合并。

必须坚持：

* 只处理当前 `resultId`
* 不批量扫描全部 localStorage 结果
* 不静默写库
* 保存成功后再标记 `saved_to_account`

## Skill 8：结果页定位模型判断

原则：

* `levelKey` 定位关卡
* `resultId` 定位一次训练结果
* 涉及保存、历史、回放时必须使用 `resultId`

禁止继续扩大：

* 不得把 `/training/[levelKey]/result` 当作正式结果展示页继续扩展

## 认知升级记录

### COG-001：浏览器能访问外部服务，不代表 Node 服务端能访问

来源：Google OAuth code exchange 访问 `oauth2.googleapis.com` 超时。

可迁移到：

* AI API
* 支付
* 短信
* 邮件
* 第三方登录

### COG-002：build 通过不代表架构正确

局部功能可运行，也可能整体架构在走偏。

需要通过：

* `ARCHITECTURE.md`
* 阶段验收
* 越界汇报机制

来防止方向失控。

### COG-003：AI 不是架构师

用户必须先写清楚：

* 阶段目标
* 实现边界
* 验收标准

然后再让 Codex 出计划。