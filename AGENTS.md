<br />

## 1. 项目说明

本项目是「哄她模拟器」网页版 MVP。

它是一个恋爱沟通训练产品，通过游戏化三轮对话关卡，帮助用户练习：

* 识别情绪
* 理解潜台词
* 真诚回应
* 承担责任
* 修复关系

核心原则：

> 不是教你骗她原谅，而是教你真正听懂她。

## 2. 开发前必须阅读

开发前必须先阅读：

1. `docs/SPEC.md`
2. `AGENTS.md`

如果实现与 `docs/SPEC.md` 冲突，优先遵守 `docs/SPEC.md`。

## 3. 技术栈

* Next.js
* React
* TypeScript
* Tailwind CSS
* Neon PostgreSQL
* Drizzle ORM
* BetterAuth
* Vercel AI SDK
* Zod

## 4. MVP 核心范围

MVP 只做单人训练闭环：

1. 角色选择
2. 关卡选择
3. 三轮对话训练
4. AI 女友反馈
5. AI 裁判评分
6. 最终复盘
7. 登录后保存训练记录
8. 救急模式即时分析

## 5. 产品红线

必须遵守：

* 不教 PUA、操控、欺骗、冷暴力或套路话术
* 不鼓励用户逃避责任
* 不承诺百分百哄好
* 不替代心理咨询或婚恋咨询
* 不自动代发消息给真实联系人
* 不默认保存真实聊天内容
* 只有用户主动确认保存时，才允许保存救急模式中的真实聊天内容

## 6. MVP 明确不做

除非用户明确要求，MVP 不要实现：

* 无限自由聊天
* 自动代发消息
* 微信聊天记录导入
* 截图 OCR
* 社区
* 排行榜
* 用户 PK
* 多人互动
* 付费会员
* 积分商城
* 分销邀请
* 复杂管理后台
* 多模型复杂调度
* SPEC 之外的新功能

## 7. AI 架构规则

必须采用双 Step AI 架构：

### Step 1：Girlfriend Response Agent

只负责生成女友下一句回复。

### Step 2：Judge Scoring Agent

负责判断用户回复质量，并输出：

* `emotionChange`
* `trustChange`
* `riskFlags`
* `skillScores`
* `roundFeedback`

## 8. AI 输出规则

所有 AI 输出必须经过 Zod Schema 校验。

禁止直接：

```ts
JSON.parse(aiResponse)
```

## 9. 当前阶段状态

已完成：

* Stage 1：页面骨架 + Mock 流程
* Stage 2：角色卡 + 15 个关卡
* Stage 3：AI Schema + Mock Provider
* Stage 4：真实 AI Provider
* Stage 4.5：AI 响应速度与 loading 优化
* Stage 5：Neon + Drizzle 数据库基础层
* Stage 6A：BetterAuth + Google 登录
* Stage 6B：登录用户训练保存 + `/history`
* Stage 7.0：结果页按 `resultId` 精确定位
* Stage 7A：单条游客结果登录后手动保存
* Stage 7B：游客保存状态与体验优化
* Stage 8A：救急分析保存
* Stage 8B：救急分析历史查看

## 10. 当前能力边界

当前系统已经支持：

* 三轮训练闭环
* 真实 AI 训练与救急分析
* Google 登录
* 登录用户训练保存
* `/history` 训练历史
* `/emergency/history` 救急历史

当前系统仍未支持：

* 游客批量合并
* 救急记录删除、编辑、搜索、筛选、详情页
* `user_progress` 统计更新
* 管理员、付费、复杂权限

## 11. 硬规则

必须持续遵守：

* 前端不得传 `userId`
* 正式写库的 `userId` 必须来自 BetterAuth `session.user.id`
* `.env.local`、`DATABASE_URL`、`GOOGLE_CLIENT_SECRET`、`BETTER_AUTH_SECRET`、`ARK_API_KEY` 不得读取、输出或提交
* 数据库流程必须遵守：`schema -> db:generate -> 检查 migration -> db:migrate -> seed`
* `db:migrate`、`db:push`、`db:seed` 必须先得到用户确认
* OAuth 调试不能盲目重构，必须先按链路定位

## 12. 越界汇报机制

如果实现目标需要做计划外修改，必须停下来汇报：

1. 需要做什么
2. 为什么需要
3. 会影响哪些文件 / 命令
4. 风险是什么
5. 等待用户确认后再继续

不得自行扩大实现范围。

## 13. Stage 7 Hard Rules

* 不得把 `/training/[levelKey]/result` 作为正式结果展示页继续扩展
* 正式结果页必须使用 `/training/result/[resultId]`
* 游客结果合并不得自动批量执行
* 游客结果保存仍不得让前端传 `userId`

## 14. Stage 8 Hard Rules

* `emergency_analyses` 保存不得自动静默触发
* `emergency_analyses` 的 `userId` 必须来自 `session.user.id`
* `emergency_analyses` 只能通过服务端 `session.user.id` 写入
* 不得让前端传 `userId`
* 不得把救急记录混入 `/history`，除非进入新的信息架构阶段
* 不得提前做转训练、删除、编辑、搜索、筛选、详情页
* 不得把 `/emergency/history` 和 `/history` 混成复杂大页，除非先做设计评审
* 不得读取或输出用户真实救急输入之外的 secret 信息
