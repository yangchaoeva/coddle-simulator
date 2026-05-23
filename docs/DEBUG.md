# DEBUG

## 救急保存调试 Checklist

排查 Stage 8 时先检查：

1. `/emergency` 是否能正常生成分析
2. 保存按钮是否只在登录用户或合适状态下显示
3. 未登录保存是否不会写库
4. 保存请求是否命中正确接口
5. Network 保存请求状态码是否为 `200` / `201`
6. `emergency_analyses` 是否新增 1 条记录
7. `user_id` 是否等于当前登录用户
8. `/emergency/history` 是否只查询当前用户数据
9. 换账号是否看不到别人的救急记录

## 调试前强制停顿

执行任何修复前，必须先回答：

1. 错误发生在哪一段链路？
2. 最小复现步骤是什么？
3. 修复会影响哪些文件？
4. 是否可以先加日志再改逻辑？
5. 这是配置、网络、schema、代码还是数据问题？

## OAuth / Google 登录调试

排查顺序：

1. 检查 Google Console `Authorized redirect URIs`
2. 检查本地回调地址是否为 `http://localhost:3000/api/auth/callback/google`
3. 检查 BetterAuth / 终端真实错误
4. 检查 Node 到 `oauth2.googleapis.com:443` 的出网能力

关键经验：

* `redirect_uri_mismatch` 优先看 Google Console
* `invalid_code` / `please_restart_the_process` 不能只看页面错误
* 诊断字段重点看：
  * `hasCookie`
  * `hasState`
  * `hasCode`
  * `repeatedCallback`
* 浏览器能访问 Google，不代表 Node 服务端能访问 Google
* 需要检查代理 / VPN / `HTTPS_PROXY` / `HTTP_PROXY`

## 数据库链路调试

固定链路：

`schema -> migration -> migrate -> seed -> repository -> API/server page -> UI`

解释：

* schema：表结构图纸
* migration：SQL 施工文件
* migrate：真正改 Neon
* seed：写初始数据
* repository：数据库读写封装
* API/server page：业务入口
* UI：最终展示

## Stage 6B 训练保存经验

* `POST /api/training-sessions` 不接收 `userId`
* `userId` 只来自 BetterAuth `session.user.id`
* `resultId` 只用于训练结果幂等，不用于前端身份归属
* `/history` 必须按服务端 session 查询当前用户记录
* 未登录训练结果只本地展示，不正式写库

## Stage 8 救急分析保存经验

* `/emergency` 和 `POST /api/emergency-analyses` 是两段链路，先确认分析能生成，再确认保存能写库
* 未登录用户可正常生成救急分析，但不应自动写入 `emergency_analyses`
* `emergency_analyses.user_id` 必须只来自 BetterAuth `session.user.id`
* `/emergency/history` 必须只查询当前 session 对应用户的数据
* 救急记录不应混入 `/history`，除非先做新的信息架构评审