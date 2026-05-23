# SKILLS

## Skill 1：阶段式 AI 开发管理

规则：

1. 先计划，再执行，再审查，再验收，再提交
2. Codex 负责执行，ChatGPT 负责审查，用户负责决策
3. 大任务必须先出计划，不得直接写代码

## Skill 2：Codex 执行结果审查

每次执行后至少检查：

1. 改了哪些文件
2. 是否越界
3. 是否改了 `.env.local`
4. 是否输出 secret
5. 是否执行危险命令
6. 是否通过 `tsc` / `build`
7. 是否仍需人工验收

## Skill 3：数据库迁移安全

固定流程：

`schema -> db:generate -> 检查 migration -> db:migrate -> seed`

规则：

1. `db:migrate` / `db:push` / `db:seed` 必须先得到用户确认
2. migration 出现 `DROP` / `DELETE` / `TRUNCATE` 必须停下来审查
3. Neon 项目必须通过 `DATABASE_URL` host 判断，不能靠项目名猜测

## Skill 4：OAuth / Google 登录调试

固定排查顺序：

1. 先查 Google Console
2. 再查 callback 参数
3. 再查 BetterAuth / 服务端日志
4. 最后查 Node 出网链路

重点：

* `redirect_uri_mismatch` 优先检查 `Authorized redirect URIs`
* `invalid_code` / `please_restart_the_process` 不能只看页面错误
* 要看 `hasCookie` / `hasState` / `hasCode` / `repeatedCallback`
* 浏览器能访问 Google，不代表 Node 服务端能访问 `oauth2.googleapis.com`

## Skill 5：认证与用户数据安全

规则：

1. 前端不得传 `userId`
2. `userId` 必须来自 BetterAuth `session.user.id`
3. `/history` 必须按当前 `session.user.id` 查询
4. 未登录用户不写正式用户表
5. 游客合并留到 Stage 7
6. emergency 保存留到 Stage 8

## Skill 6：AI Provider 稳定接入

顺序：

1. 先 Schema
2. 再 Mock
3. 再 Real Provider

规则：

1. AI 输出必须经过 Zod Schema
2. fallback 必须存在
3. 用户可见内容必须中文
4. AI action 要记录耗时
5. 不要把真实 AI 接入问题和业务链路问题混在一起

## Skill 7：游客结果登录后保存流程

标准流程：

1. 先确保 `resultId` 精确定位
2. 再做登录回跳
3. 再做手动保存
4. 再做同步状态展示
5. 不做自动批量合并

## Skill 8：结果页定位模型判断

原则：

* `levelKey` 定位关卡
* `resultId` 定位一次训练结果
* 涉及保存、历史、回放时必须使用 `resultId`

## Skill 9：真实工具类功能保存链路

标准流程：

1. 先让工具功能可用
2. 再做登录用户手动保存
3. 再做独立历史页
4. 最后再考虑详情、搜索、删除、筛选

适用场景：

* 救急分析
* 未来的工具型单次分析能力

## Skill 10：隐私型数据保存原则

原则：

1. 用户真实输入内容不自动静默保存
2. 未登录用户不写正式用户表
3. 保存必须由用户明确触发
4. `userId` 必须来自服务端 session

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

局部功能可运行，也可能整体架构在走偏。要靠 `ARCHITECTURE.md` 和阶段验收防止方向失控。

### COG-003：AI 不是架构师

用户必须先写清楚：

* 阶段目标
* 实现边界
* 验收标准

然后再让 Codex 出计划。