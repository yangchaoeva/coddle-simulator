# DEBUG

## 调试前强制停顿

执行任何修复前，必须先回答：

1. 错误发生在哪一段链路？
2. 最小复现步骤是什么？
3. 会影响哪些文件？
4. 是否可以先加日志再改逻辑？
5. 这是配置、网络、schema、代码还是数据问题？

## OAuth / Google 登录调试

排查顺序：

1. 检查 Google OAuth 的 redirect URI 配置是否完整。
2. 检查当前环境回调地址是否与认证配置一致。
3. 检查 BetterAuth / 服务端真实报错。
4. 检查本地 Node 到 Google OAuth 域名的网络连通性。

关键经验：

- `redirect_uri_mismatch` 优先看 OAuth 平台配置。
- 浏览器能访问 Google，不代表本地 Node 进程也能正常访问。
- 本地超时不一定是代码问题，可能是网络、代理、DNS 或区域访问问题。

## 数据库链路调试

固定链路：

`schema -> migration -> migrate -> seed -> repository -> API/server page -> UI`

解释：

- `schema`：表结构定义
- `migration`：SQL 变更文件
- `migrate`：真正执行到数据库
- `seed`：初始数据写入
- `repository`：数据库读写封装
- `API/server page`：业务入口
- `UI`：最终展示

## Stage 6B 训练保存经验

- `POST /api/training-sessions` 不接收前端传入的 `userId`
- `userId` 只能来自 BetterAuth `session.user.id`
- `resultId` 用于唯一标识一次训练结果，不用于前端身份归属
- `/history` 必须固定按服务端 `session.user.id` 查询当前用户自己的记录
- 未登录训练结果只本地展示，不正式写库

## Stage 8 救急分析保存经验

- `/emergency` 与 `POST /api/emergency-analyses` 是两段链路，先确认分析能生成，再确认保存能写入
- 未登录用户可以正常生成救急分析，但不应自动写入 `emergency_analyses`
- `emergency_analyses.user_id` 必须只来自 BetterAuth `session.user.id`
- `/emergency/history` 必须只查询当前 session 对应用户的数据
- 救急记录不应混入 `/history`，除非先做新的信息架构评审

## 线上保存类问题排查流程

排查顺序固定为：

`页面操作 -> Console -> Network -> API 状态码 -> Vercel Logs -> Neon -> 页面展示`

### 1. 页面操作

- 先明确复现条件：是否已登录、是否完整完成三轮训练、是否跳转到了结果页。
- 对训练保存问题，优先复现一次完整训练闭环，不要只停留在结果页猜测。

### 2. Console

- 先看前端是否存在运行时错误。
- 如有临时诊断日志，可用来判断训练流程是否进入保存阶段。
- 如果没有日志也没有报错，继续看 Network。

### 3. Network

- 重点确认是否发出 `POST /api/training-sessions`。
- 如果没有 `POST`，说明问题停在前端触发层，不是服务端保存层。

### 4. API 状态码判断

#### 没有 POST

- 说明前端没有触发正式保存请求。
- 优先检查训练流程是否真的走到最终保存分支，或是否在第三轮前就被前端异常中断。

#### 401

- 说明服务端没有拿到有效登录 session。
- 优先检查当前登录态是否真实建立、请求是否带上站点会话、BetterAuth 线上链路是否正常。
- 不要尝试让前端传 `userId` 兜底。

#### 400

- 说明请求体结构不符合服务端 schema。
- 优先核对前端提交 payload 与服务端 Zod schema 是否一致。
- 常见原因是字段缺失、字段类型错误或结果结构不符合约定。

#### 409

- 说明服务端判定本次保存请求与已有记录冲突。
- 优先检查：
  - `resultId` 是否被错误复用
  - level 归属是否冲突
  - session 归属是否冲突

#### 500

- 说明服务端保存链路内部异常。
- 继续看 Vercel Logs，确认是 repository、数据库、序列化还是其他运行时错误。

#### 200 / created 但页面没更新

- 说明服务端大概率已保存成功，问题转为前端本地同步状态或结果页展示问题。
- 重点检查：
  - 服务端是否真的写入
  - 本地 `syncStatus` 是否已更新
  - 结果页是否读取到了旧的本地结果
  - `/history` 是否已经新增

### 5. Vercel Logs

- 当前端请求已发出且状态异常时，优先看对应接口日志。
- 判断是认证失败、schema 校验失败、repository 报错，还是数据库异常。

### 6. Neon

- 仅在需要时做受控验证，确认是否真正写入。
- 优先确认是否新增了预期训练记录，以及记录归属是否正确。
- 不在调试记录中输出任何连接信息或敏感配置。

### 7. 页面展示

- 页面展示放在最后确认。
- 判断标准不是“提示文案像成功”，而是：
  - 是否真的保存成功
  - 是否正确同步了本地状态
  - `/history` 是否能看到当前用户自己的新记录

## Chrome DevTools / Codex Browser 验收方法

### Console 看运行时日志

- 使用 Chrome DevTools Console 查看前端运行时错误和临时调试日志。
- 适合判断训练流程是否进入保存链路、是否有未捕获异常。

### Network 看请求

- 在 Network 中确认是否发起保存请求，以及返回状态码。
- 这是判断“有没有保存动作”和“服务端是否成功响应”的第一依据。

### Application 看 localStorage / cookie

- 可以在 Application 面板检查 localStorage 是否写入训练结果、是否存在本地同步标记。
- 也可以确认是否存在登录态相关 cookie。
- 但不得输出 cookie、token、secret、真实环境变量值。

### Codex Browser 做运行时验收

- Codex Browser 或 Chrome 自动化适合做线上运行时验收：
  - 打开页面
  - 完成训练流程
  - 读取 Console / Network / 页面结果
  - 验证 `/history`
- 但不能输出 cookie、token、secret，也不能访问敏感控制台页面。
